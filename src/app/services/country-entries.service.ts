import { Injectable } from '@angular/core';
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Subject } from 'rxjs';
import { FirebaseService } from '../firebase.service';
import { CountryEntry, CountryEntryCounts, EntryPhoto } from '../models/country-entry';
import { resizeImage } from '../utils/image-resize';
import { normalizeCountryName } from '../utils/country-search';

const COLLECTION = 'CountryEntries';
const STORAGE_ROOT = 'country-entries';
const FULL_EDGE = 1600;
const THUMB_EDGE = 400;
/** Matches storage.rules (5 MB); resized JPEGs are normally far smaller */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface DishInput
{
    title: string;
    madeBy: string;
    description?: string;
    recipeUrl?: string;
}

/** Thrown when someone outside the Contributors allowlist tries to add an entry. */
export class NotContributorError extends Error
{
    constructor()
    {
        super('Only contributors can add entries. Ask an admin to add your Google email to Contributors.');
    }
}

/** Reads and writes the dinner journal (Firestore "CountryEntries" plus photos in Storage). */
@Injectable({
    providedIn: 'root'
})
export class CountryEntriesService
{
    private _allEntries: Promise<CountryEntry[]> | null = null;
    private _changed = new Subject<string>();
    /** Emits the country name whenever entries are added, so counts can refresh. */
    public changed$ = this._changed.asObservable();

    constructor(private _firebase: FirebaseService) { }

    // ---------- Reading ----------

    /** Entries for one country, oldest first. */
    public async getEntries(country: string): Promise<CountryEntry[]>
    {
        const q = query(collection(this._firebase.db, COLLECTION), where('country', '==', country));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => this._toEntry(d)).sort(byCreatedAt);
    }

    /** Every entry, loaded once and cached; used for counts on the globe and in Look up country. */
    public getAllEntries(): Promise<CountryEntry[]>
    {
        if (!this._allEntries)
        {
            this._allEntries = getDocs(collection(this._firebase.db, COLLECTION))
                .then(snapshot => snapshot.docs.map(d => this._toEntry(d)))
                .catch(err =>
                {
                    console.error('Failed to load journal entries', err);
                    this._allEntries = null; // allow a retry next time
                    return [];
                });
        }
        return this._allEntries;
    }

    /** Dish and photo counts per country. Photos counts every photo, including those on dishes. */
    public async getCounts(): Promise<Map<string, CountryEntryCounts>>
    {
        const counts = new Map<string, CountryEntryCounts>();
        for (const entry of await this.getAllEntries())
        {
            const c = counts.get(entry.country) ?? { dishes: 0, photos: 0 };
            if (entry.type === 'dish') c.dishes++;
            c.photos += entry.photos.length;
            counts.set(entry.country, c);
        }
        return counts;
    }

    /** Names used in "Made by" before, for suggestions. */
    public async getCookNames(): Promise<string[]>
    {
        const names = new Map<string, string>();
        for (const e of await this.getAllEntries())
        {
            const name = (e.madeBy ?? '').trim();
            if (name && !names.has(name.toLowerCase())) names.set(name.toLowerCase(), name);
        }
        return [...names.values()].sort((a, b) => a.localeCompare(b));
    }

    /** Drop the cached list so the next read picks up new entries. */
    public invalidate(): void
    {
        this._allEntries = null;
    }

    // ---------- Writing (contributors only; storage.rules and firestore.rules enforce the same) ----------

    /** A new entry ID, so photos can be uploaded under it before the entry is saved. */
    public newEntryId(): string
    {
        return doc(collection(this._firebase.db, COLLECTION)).id;
    }

    /**
     * Resizes one photo, uploads it plus a thumbnail, and returns where they are.
     * onProgress gets 0..1 across both files.
     */
    public async uploadPhoto(country: string, entryId: string, index: number, file: Blob, onProgress?: (fraction: number) => void): Promise<EntryPhoto>
    {
        const user = this._requireContributor();
        const full = await resizeImage(file, FULL_EDGE);
        const thumb = await resizeImage(full.blob, THUMB_EDGE);
        if (full.blob.size > MAX_UPLOAD_BYTES)
        {
            throw new Error('This photo is still over 5 MB after resizing. Try a different photo.');
        }

        const base = `${STORAGE_ROOT}/${slug(country)}/${entryId}/${index + 1}`;
        const total = full.blob.size + thumb.blob.size;
        let fullSent = 0;
        let thumbSent = 0;
        const report = () => onProgress?.(total ? (fullSent + thumbSent) / total : 1);

        const url = await this._upload(`${base}.jpg`, full.blob, user.uid, sent => { fullSent = sent; report(); });
        const thumbUrl = await this._upload(`${base}_thumb.jpg`, thumb.blob, user.uid, sent => { thumbSent = sent; report(); });

        return { path: `${base}.jpg`, url, thumbUrl, width: full.width, height: full.height };
    }

    /** Saves a general photo entry for a photo already uploaded with uploadPhoto. */
    public async createPhotoEntry(country: string, entryId: string, photo: EntryPhoto): Promise<void>
    {
        const user = this._requireContributor();
        await setDoc(doc(this._firebase.db, COLLECTION, entryId), {
            country,
            type: 'photo',
            photos: [photo],
            createdBy: this._createdBy(user),
            createdAt: serverTimestamp()
        });
        this._afterWrite(country);
    }

    /** Saves a dish entry with photos already uploaded with uploadPhoto (in display order). */
    public async createDishEntry(country: string, entryId: string, dish: DishInput, photos: EntryPhoto[]): Promise<void>
    {
        const user = this._requireContributor();
        const data: { [key: string]: unknown } = {
            country,
            type: 'dish',
            title: dish.title.trim(),
            madeBy: dish.madeBy.trim(),
            photos,
            createdBy: this._createdBy(user),
            createdAt: serverTimestamp()
        };
        // Firestore rejects undefined, so only include optional fields that have a value
        if (dish.description?.trim()) data['description'] = dish.description.trim();
        if (dish.recipeUrl?.trim()) data['recipeUrl'] = dish.recipeUrl.trim();

        await setDoc(doc(this._firebase.db, COLLECTION, entryId), data);
        this._afterWrite(country);
    }

    /** Best-effort removal of uploaded files that never made it into a saved entry. */
    public async deleteUploadedPhotos(photos: EntryPhoto[]): Promise<void>
    {
        const paths = photos.flatMap(p => [p.path, p.path.replace(/\.jpg$/, '_thumb.jpg')]);
        await Promise.all(paths.map(path =>
            deleteObject(ref(this._firebase.storage, path)).catch(err => console.warn('Could not remove unused upload', path, err))
        ));
    }

    // ---------- Helpers ----------

    private _requireContributor()
    {
        const user = this._firebase.currentUser;
        if (!user || !user.email || !this._firebase.isContributor)
        {
            throw new NotContributorError();
        }
        return user;
    }

    private _createdBy(user: { uid: string, email: string | null, displayName: string | null })
    {
        return { uid: user.uid, email: user.email, name: user.displayName ?? '' };
    }

    private _afterWrite(country: string): void
    {
        this.invalidate();
        this._changed.next(country);
    }

    private _upload(path: string, blob: Blob, uid: string, onBytes: (sent: number) => void): Promise<string>
    {
        const task = uploadBytesResumable(ref(this._firebase.storage, path), blob, {
            contentType: 'image/jpeg',
            customMetadata: { uploadedBy: uid } // storage.rules require this, and use it for delete-your-own
        });
        return new Promise((resolve, reject) =>
        {
            task.on('state_changed',
                snap => onBytes(snap.bytesTransferred),
                err => reject(err),
                () => getDownloadURL(task.snapshot.ref).then(resolve, reject));
        });
    }

    private _toEntry(d: QueryDocumentSnapshot<DocumentData>): CountryEntry
    {
        const data = d.data();
        return {
            id: d.id,
            country: data['country'],
            type: data['type'] === 'dish' ? 'dish' : 'photo',
            photos: Array.isArray(data['photos']) ? data['photos'] : [],
            title: data['title'],
            madeBy: data['madeBy'],
            description: data['description'],
            recipeUrl: data['recipeUrl'],
            createdBy: data['createdBy'],
            createdAt: data['createdAt']?.toMillis ? data['createdAt'].toMillis() : data['createdAt'],
        };
    }
}

function byCreatedAt(a: CountryEntry, b: CountryEntry): number
{
    return (a.createdAt ?? 0) - (b.createdAt ?? 0);
}

/** Storage folder name for a country, e.g. "Curaçao (Netherlands)" -> "curacao-netherlands" */
function slug(country: string): string
{
    return normalizeCountryName(country).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'country';
}

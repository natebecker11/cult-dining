import { Injectable } from '@angular/core';
import { collection, getDocs, query, where, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { FirebaseService } from '../firebase.service';
import { CountryEntry, CountryEntryCounts } from '../models/country-entry';

const COLLECTION = 'CountryEntries';

/** Reads the dinner journal entries. Writing (adding/editing/deleting) comes in a later phase. */
@Injectable({
    providedIn: 'root'
})
export class CountryEntriesService
{
    private _allEntries: Promise<CountryEntry[]> | null = null;

    constructor(private _firebase: FirebaseService) { }

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

    /** Drop the cached list so the next read picks up new entries. */
    public invalidate(): void
    {
        this._allEntries = null;
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

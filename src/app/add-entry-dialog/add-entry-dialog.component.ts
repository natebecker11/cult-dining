import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CountryEntriesService, NotAllowedError, NotContributorError, TestDataModeError } from '../services/country-entries.service';
import { CountryEntry, EntryPhoto } from '../models/country-entry';
import { ImageReadError } from '../utils/image-resize';

export type AddEntryMode = 'photos' | 'dish';

export interface AddEntryDialogData
{
  country: string;
  mode?: AddEntryMode;
  /** Edit this dish instead of adding a new entry */
  entry?: CountryEntry;
}

/** Closes with true when at least one entry was saved. */
export type AddEntryDialogResult = boolean;

type PhotoStatus = 'ready' | 'uploading' | 'done' | 'error';

interface PendingPhoto
{
  key: number;
  /** null for a photo the dish already had (editing) */
  file: File | null;
  /** The dish already had this photo before this edit */
  existing?: boolean;
  previewUrl: string;
  status: PhotoStatus;
  progress: number;
  error?: string;
  /** Set once the photo is in Storage, so a retry doesn't upload it again */
  uploaded?: EntryPhoto;
  /** Photos mode: each photo is its own entry */
  entryId?: string;
}

/** Matches the limit in firestore.rules */
const MAX_PHOTOS = 20;
const TITLE_MAX = 120;
const COOK_MAX = 80;

@Component({
  selector: 'app-add-entry-dialog',
  templateUrl: './add-entry-dialog.component.html',
  styleUrls: ['./add-entry-dialog.component.css']
})
export class AddEntryDialogComponent implements OnInit, OnDestroy
{
  public country: string;
  public mode: AddEntryMode;
  public photos: PendingPhoto[] = [];
  public title = '';
  public madeBy = '';
  public description = '';
  public recipeUrl = '';
  public cookNames: string[] = [];
  public busy = false;
  public formError = '';
  public notice = '';
  public dragOver = false;
  public submitted = false;
  public readonly titleMax = TITLE_MAX;
  public readonly cookMax = COOK_MAX;
  public readonly maxPhotos = MAX_PHOTOS;

  /** The dish being edited, or null when adding */
  public readonly editing: CountryEntry | null;

  private _nextKey = 1;
  private _dishEntryId: string | null = null;
  private _savedCount = 0;
  /** Editing: photos the dish had that were removed; their files are deleted after the save succeeds */
  private _removedExisting: EntryPhoto[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) data: AddEntryDialogData,
    private _dialogRef: MatDialogRef<AddEntryDialogComponent, AddEntryDialogResult>,
    private _entries: CountryEntriesService
  )
  {
    this.country = data.country;
    this.editing = data.entry?.type === 'dish' ? data.entry : null;
    this.mode = this.editing ? 'dish' : (data.mode ?? 'dish');

    if (this.editing)
    {
      this._dishEntryId = this.editing.id;
      this.title = this.editing.title ?? '';
      this.madeBy = this.editing.madeBy ?? '';
      this.description = this.editing.description ?? '';
      this.recipeUrl = this.editing.recipeUrl ?? '';
      this.photos = this.editing.photos.map(p => ({
        key: this._nextKey++,
        file: null,
        existing: true,
        previewUrl: p.thumbUrl || p.url,
        status: 'ready' as PhotoStatus,
        progress: 1,
        uploaded: p
      }));
    }
  }

  public get heading(): string
  {
    return this.editing ? `Edit ${this.editing.title ?? 'dish'}` : `Add to ${this.country}`;
  }

  async ngOnInit(): Promise<void>
  {
    // Closing goes through cancel() so unused uploads get cleaned up
    this._dialogRef.disableClose = true;
    this._dialogRef.backdropClick().subscribe(() => this.cancel());
    this._dialogRef.keydownEvents().subscribe(e => { if (e.key === 'Escape') this.cancel(); });
    this.cookNames = await this._entries.getCookNames();
  }

  ngOnDestroy(): void
  {
    this.photos.filter(p => !p.existing).forEach(p => URL.revokeObjectURL(p.previewUrl));
  }

  // ---------- Form state ----------

  public setMode(mode: AddEntryMode): void
  {
    if (this.busy || this.hasProgress) return;
    this.mode = mode;
    this.formError = '';
    this.submitted = false;
  }

  /** Once anything has uploaded or saved, switching type would orphan work, so it's locked. */
  public get hasProgress(): boolean
  {
    return this.photos.some(p => (!!p.uploaded && !p.existing) || p.status === 'done');
  }

  public get filteredCooks(): string[]
  {
    const term = this.madeBy.trim().toLowerCase();
    return this.cookNames.filter(n => n.toLowerCase().includes(term) && n.toLowerCase() !== term).slice(0, 6);
  }

  public get titleError(): string
  {
    if (!this.title.trim()) return 'Give the dish a name';
    if (this.title.trim().length > TITLE_MAX) return `Keep it under ${TITLE_MAX} characters`;
    return '';
  }

  public get cookError(): string
  {
    if (!this.madeBy.trim()) return 'Who made it?';
    if (this.madeBy.trim().length > COOK_MAX) return `Keep it under ${COOK_MAX} characters`;
    return '';
  }

  public get recipeError(): string
  {
    const value = this.recipeUrl.trim();
    if (!value) return '';
    try
    {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:' ? '' : 'Use a link that starts with https://';
    } catch
    {
      return 'That doesn\'t look like a link. Paste the full address, starting with https://';
    }
  }

  public get remainingPhotos(): PendingPhoto[]
  {
    return this.photos.filter(p => p.status !== 'done');
  }

  public get failedCount(): number
  {
    return this.photos.filter(p => p.status === 'error').length;
  }

  public get saveLabel(): string
  {
    if (this.busy) return this.mode === 'dish' ? 'Saving…' : 'Uploading…';
    if (this.failedCount) return 'Retry';
    if (this.editing) return 'Save changes';
    if (this.mode === 'dish') return 'Save dish';
    const n = this.remainingPhotos.length;
    return n === 1 ? 'Upload 1 photo' : `Upload ${n} photos`;
  }

  public get canSave(): boolean
  {
    if (this.busy) return false;
    if (this.mode === 'photos') return this.remainingPhotos.length > 0;
    return true; // dish errors show after the first Save click
  }

  public get uploadSummary(): string
  {
    const fresh = this.photos.filter(p => !p.existing);
    const uploading = fresh.findIndex(p => p.status === 'uploading');
    if (uploading < 0) return '';
    return `Uploading ${uploading + 1} of ${fresh.length}…`;
  }

  public get overallProgress(): number
  {
    const fresh = this.photos.filter(p => !p.existing);
    if (!fresh.length) return 100;
    const sum = fresh.reduce((n, p) => n + (p.status === 'done' || p.uploaded ? 1 : p.progress), 0);
    return Math.round((sum / fresh.length) * 100);
  }

  // ---------- Picking photos ----------

  public onFilesPicked(input: HTMLInputElement): void
  {
    this.addFiles(Array.from(input.files ?? []));
    input.value = ''; // allow picking the same file again after removing it
  }

  public onDragOver(event: DragEvent): void
  {
    event.preventDefault();
    this.dragOver = true;
  }

  public onDrop(event: DragEvent): void
  {
    event.preventDefault();
    this.dragOver = false;
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  public addFiles(files: File[]): void
  {
    if (this.busy) return;
    this.notice = '';
    const images = files.filter(f => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
    const skipped = files.length - images.length;
    const room = MAX_PHOTOS - this.photos.length;
    const accepted = images.slice(0, Math.max(room, 0));

    for (const file of accepted)
    {
      this.photos.push({ key: this._nextKey++, file, previewUrl: URL.createObjectURL(file), status: 'ready', progress: 0 });
    }

    const notes: string[] = [];
    if (skipped) notes.push(`${skipped} ${skipped === 1 ? 'file isn\'t a photo' : 'files aren\'t photos'} and ${skipped === 1 ? 'was' : 'were'} skipped.`);
    if (images.length > accepted.length) notes.push(`Up to ${MAX_PHOTOS} photos at a time; the extra ${images.length - accepted.length} ${images.length - accepted.length === 1 ? 'was' : 'were'} left out.`);
    this.notice = notes.join(' ');
  }

  public removePhoto(photo: PendingPhoto): void
  {
    if (this.busy || photo.status === 'done') return;
    if (photo.existing)
    {
      // Keep the file until the edit is saved, so Cancel leaves the dish exactly as it was
      this._removedExisting.push(photo.uploaded!);
    } else
    {
      if (photo.uploaded) this._entries.deleteUploadedPhotos([photo.uploaded]);
      URL.revokeObjectURL(photo.previewUrl);
    }
    this.photos = this.photos.filter(p => p !== photo);
  }

  public trackByKey(_: number, photo: PendingPhoto): number
  {
    return photo.key;
  }

  // ---------- Saving ----------

  public async save(): Promise<void>
  {
    this.submitted = true;
    this.formError = '';
    if (this.mode === 'dish' && (this.titleError || this.cookError || this.recipeError)) return;
    if (this.mode === 'photos' && this.remainingPhotos.length === 0) return;

    this.busy = true;
    try
    {
      if (this.mode === 'photos')
      {
        await this._savePhotos();
      } else
      {
        await this._saveDish();
      }
    } finally
    {
      this.busy = false;
    }
  }

  /** Each photo becomes its own entry; failures stay in the list with a Retry. */
  private async _savePhotos(): Promise<void>
  {
    for (const photo of this.remainingPhotos)
    {
      try
      {
        photo.entryId ??= this._entries.newEntryId();
        photo.uploaded ??= await this._uploadOne(photo, photo.entryId);
        await this._entries.createPhotoEntry(this.country, photo.entryId, photo.uploaded);
        photo.status = 'done';
        this._savedCount++;
      } catch (e)
      {
        this._fail(photo, e);
        if (e instanceof NotContributorError || e instanceof TestDataModeError) return;
      }
    }

    if (this.remainingPhotos.length === 0)
    {
      this._close();
    }
  }

  /** Uploads every photo first; the dish is saved only once they're all in, so nothing is half-saved. */
  private async _saveDish(): Promise<void>
  {
    this._dishEntryId ??= this._entries.newEntryId();
    const entryId = this._dishEntryId;

    for (const photo of this.photos)
    {
      if (photo.uploaded) continue;
      try
      {
        photo.uploaded = await this._uploadOne(photo, entryId);
      } catch (e)
      {
        this._fail(photo, e);
        if (e instanceof NotContributorError || e instanceof TestDataModeError) return;
      }
    }

    if (this.failedCount)
    {
      this.formError = 'Some photos didn\'t upload. Retry, or remove them and save without them.';
      return;
    }

    try
    {
      const dish = { title: this.title, madeBy: this.madeBy, description: this.description, recipeUrl: this.recipeUrl };
      const photos = this.photos.map(p => p.uploaded!);
      if (this.editing)
      {
        await this._entries.updateDishEntry(this.editing, dish, photos, this._removedExisting);
      } else
      {
        await this._entries.createDishEntry(this.country, entryId, dish, photos);
      }
      this.photos.forEach(p => p.status = 'done');
      this._savedCount++;
      this._close();
    } catch (e)
    {
      this.formError = this._message(e, 'The dish couldn\'t be saved. Check your connection and try again.');
    }
  }

  private async _uploadOne(photo: PendingPhoto, entryId: string): Promise<EntryPhoto>
  {
    photo.status = 'uploading';
    photo.progress = 0;
    photo.error = undefined;
    // The service gives every upload a fresh file name (Storage won't let a retry overwrite one)
    const uploaded = await this._entries.uploadPhoto(this.country, entryId, photo.file!, f => photo.progress = f);
    photo.progress = 1;
    if (this.mode === 'dish') photo.status = 'ready'; // dish photos are "done" only when the dish saves
    return uploaded;
  }

  private _fail(photo: PendingPhoto, e: unknown): void
  {
    photo.status = 'error';
    photo.error = this._message(e, photo.uploaded
      ? 'The photo uploaded but couldn\'t be saved. Check your connection and retry.'
      : 'Upload failed. Check your connection and retry.');
    console.error('Journal upload failed', e);
  }

  private _message(e: unknown, fallback: string): string
  {
    if (e instanceof NotContributorError || e instanceof NotAllowedError || e instanceof TestDataModeError || e instanceof ImageReadError) return e.message;
    const code = (e as { code?: string })?.code ?? '';
    if (code.includes('unauthorized') || code.includes('permission-denied'))
    {
      return 'Firebase refused this upload. Make sure you\'re signed in as a contributor.';
    }
    if (e instanceof Error && e.message.startsWith('This photo')) return e.message;
    return fallback;
  }

  // ---------- Closing ----------

  public async cancel(): Promise<void>
  {
    if (this.busy) return;
    // Photos uploaded for entries that were never saved would sit in Storage unused
    // (photos the dish already had are never deleted on Cancel)
    const orphans = this.photos.filter(p => p.uploaded && !p.existing && p.status !== 'done').map(p => p.uploaded!);
    if (orphans.length) this._entries.deleteUploadedPhotos(orphans);
    this._close();
  }

  private _close(): void
  {
    this._dialogRef.close(this._savedCount > 0);
  }
}

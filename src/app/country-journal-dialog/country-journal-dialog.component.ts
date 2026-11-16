import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CountryEntriesService } from '../services/country-entries.service';
import { CountryEntry, EntryPhoto } from '../models/country-entry';
import { PhotoViewerComponent, PhotoViewerData } from '../photo-viewer/photo-viewer.component';
import { FirebaseService } from '../firebase.service';
import { AddEntryDialogComponent, AddEntryDialogData, AddEntryDialogResult, AddEntryMode } from '../add-entry-dialog/add-entry-dialog.component';

export interface CountryJournalDialogData
{
  country: string;
}

const AVATAR_COLORS = ['#5c6bc0', '#d81b60', '#00897b', '#f4511e', '#8e24aa', '#3949ab', '#6d4c41', '#039be5'];

@Component({
  selector: 'app-country-journal-dialog',
  templateUrl: './country-journal-dialog.component.html',
  styleUrls: ['./country-journal-dialog.component.css']
})
export class CountryJournalDialogComponent implements OnInit
{
  public country: string;
  public loading = true;
  public error = '';
  public entries: CountryEntry[] = [];
  public dishes: CountryEntry[] = [];
  /** General photo entries (dish photos stay on their dish) */
  public photoEntries: CountryEntry[] = [];
  /** The photo from each general photo entry, computed once so the grid isn't rebuilt on every change detection */
  public generalPhotos: EntryPhoto[] = [];
  public tabIndex = 0;

  public isContributor$ = this._firebase.isContributor$;
  public currentUser$ = this._firebase.currentUser$;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: CountryJournalDialogData,
    private _entries: CountryEntriesService,
    private _dialog: MatDialog,
    private _firebase: FirebaseService
  )
  {
    this.country = data.country;
  }

  async ngOnInit(): Promise<void>
  {
    await this.load();
  }

  public async load(preferTab?: AddEntryMode): Promise<void>
  {
    this.error = '';
    try
    {
      this.setEntries(await this._entries.getEntries(this.country), preferTab);
    } catch (e)
    {
      console.error('Failed to load journal for', this.country, e);
      this.error = "Couldn't load this country's journal. Check your connection and try again.";
    } finally
    {
      this.loading = false;
    }
  }

  public setEntries(entries: CountryEntry[], preferTab?: AddEntryMode): void
  {
    this.entries = entries;
    this.dishes = entries.filter(e => e.type === 'dish');
    this.photoEntries = entries.filter(e => e.type === 'photo' && e.photos.length > 0);
    this.generalPhotos = this.photoEntries.map(e => e.photos[0]);
    if (preferTab)
    {
      // Show what was just added
      this.tabIndex = preferTab === 'photos' ? 1 : 0;
    } else
    {
      // Open on Photos when there are photos but no dishes
      this.tabIndex = this.dishes.length === 0 && this.photoEntries.length > 0 ? 1 : 0;
    }
  }

  /** Contributors only: the button is hidden for everyone else, and the service and rules check again. */
  public openAdd(mode: AddEntryMode = this.tabIndex === 1 ? 'photos' : 'dish'): void
  {
    if (!this._firebase.isContributor) return;
    this._dialog.open<AddEntryDialogComponent, AddEntryDialogData, AddEntryDialogResult>(AddEntryDialogComponent, {
      data: { country: this.country, mode },
      width: '560px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'journal-dialog-panel'
    }).afterClosed().subscribe(saved =>
    {
      if (saved) this.load(mode);
    });
  }

  public get summary(): string
  {
    if (this.loading) return 'Loading…';
    if (this.error) return '';
    if (this.entries.length === 0) return 'No entries yet';
    const photoCount = this.entries.reduce((n, e) => n + e.photos.length, 0);
    const cooks = new Set(this.dishes.map(d => (d.madeBy ?? '').trim().toLowerCase()).filter(Boolean)).size;
    return [
      plural(this.dishes.length, 'dish', 'dishes'),
      plural(photoCount, 'photo', 'photos'),
      cooks ? plural(cooks, 'cook', 'cooks') : ''
    ].filter(Boolean).join(' · ');
  }

  public trackById(_: number, entry: CountryEntry): string
  {
    return entry.id;
  }

  public trackByPhoto(_: number, photo: EntryPhoto): string
  {
    return photo.path + photo.url;
  }

  public dishAnchor(dish: CountryEntry): string
  {
    return 'dish-' + dish.id;
  }

  public scrollToDish(dish: CountryEntry): void
  {
    this.tabIndex = 0;
    setTimeout(() => document.getElementById(this.dishAnchor(dish))?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  public initial(name?: string): string
  {
    return (name ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  public avatarColor(name?: string): string
  {
    const key = (name ?? '').trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  }

  /** Only http(s) recipe links are shown as links. */
  public safeUrl(url?: string): string | null
  {
    if (!url) return null;
    try
    {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
    } catch
    {
      return null;
    }
  }

  public host(url: string): string
  {
    try
    {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch
    {
      return url;
    }
  }

  public openDishPhotos(dish: CountryEntry, index: number): void
  {
    this.openViewer(dish.photos, index, `${dish.title ?? 'Dish'}${dish.madeBy ? ' · made by ' + dish.madeBy : ''}`);
  }

  public openGeneralPhoto(index: number): void
  {
    this.openViewer(this.generalPhotos, index, `${this.country} dinner`);
  }

  private openViewer(photos: EntryPhoto[], index: number, caption: string): void
  {
    this._dialog.open<PhotoViewerComponent, PhotoViewerData>(PhotoViewerComponent, {
      data: { photos, index, caption },
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      panelClass: 'photo-viewer-panel',
      autoFocus: false
    });
  }
}

function plural(n: number, one: string, many: string): string
{
  return `${n} ${n === 1 ? one : many}`;
}

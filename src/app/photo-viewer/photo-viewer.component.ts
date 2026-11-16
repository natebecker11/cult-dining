import { Component, HostListener, Inject, NgZone } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EntryPhoto } from '../models/country-entry';

export interface PhotoViewerData
{
  photos: EntryPhoto[];
  index: number;
  caption?: string;
}

@Component({
  selector: 'app-photo-viewer',
  templateUrl: './photo-viewer.component.html',
  styleUrls: ['./photo-viewer.component.css']
})
export class PhotoViewerComponent
{
  public photos: EntryPhoto[];
  public index: number;
  public caption: string;
  private _touchStartX: number | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: PhotoViewerData,
    private _dialogRef: MatDialogRef<PhotoViewerComponent>,
    private _zone: NgZone
  )
  {
    this.photos = data.photos ?? [];
    this.index = Math.min(Math.max(data.index ?? 0, 0), Math.max(this.photos.length - 1, 0));
    this.caption = data.caption ?? '';
  }

  public get current(): EntryPhoto | undefined
  {
    return this.photos[this.index];
  }

  public prev(): void
  {
    if (this.photos.length > 1) this.index = (this.index - 1 + this.photos.length) % this.photos.length;
  }

  public next(): void
  {
    if (this.photos.length > 1) this.index = (this.index + 1) % this.photos.length;
  }

  public close(): void
  {
    this._dialogRef.close();
  }

  // Document-level key events can arrive outside Angular's zone here, so re-enter it to redraw
  @HostListener('document:keydown', ['$event'])
  public onKey(event: KeyboardEvent): void
  {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    this._zone.run(() => event.key === 'ArrowLeft' ? this.prev() : this.next());
  }

  public onTouchStart(event: TouchEvent): void
  {
    this._touchStartX = event.changedTouches[0]?.clientX ?? null;
  }

  public onTouchEnd(event: TouchEvent): void
  {
    if (this._touchStartX === null) return;
    const dx = (event.changedTouches[0]?.clientX ?? this._touchStartX) - this._touchStartX;
    this._touchStartX = null;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) this.prev(); else this.next();
  }
}

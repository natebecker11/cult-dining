import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../firebase.service';
import { CountryEntriesService } from '../services/country-entries.service';
import { CountryEntryCounts } from '../models/country-entry';
import { searchCountries } from '../utils/country-search';
import { JournalLauncherService } from '../services/journal-launcher.service';

/** Header "Look up country": search the countries we've had dinners for and open one's journal. */
@Component({
  selector: 'app-country-lookup-dialog',
  templateUrl: './country-lookup-dialog.component.html',
  styleUrls: ['./country-lookup-dialog.component.css']
})
export class CountryLookupDialogComponent implements OnInit
{
  public query = '';
  public countries: string[] = [];
  public counts = new Map<string, CountryEntryCounts>();
  public activeIndex = 0;
  public loading = true;
  public error = '';

  constructor(
    private _dialogRef: MatDialogRef<CountryLookupDialogComponent>,
    private _firebase: FirebaseService,
    private _entries: CountryEntriesService,
    private _launcher: JournalLauncherService
  ) { }

  async ngOnInit(): Promise<void>
  {
    try
    {
      // Journals are only for countries we've had a dinner for (the Used list)
      const [used, counts] = await Promise.all([this._firebase.GetUsedCountries(), this._entries.getCounts()]);
      this.countries = used;
      this.counts = counts;
    } catch (e)
    {
      console.error('Failed to load countries for lookup', e);
      this.error = "Couldn't load the country list. Check your connection and try again.";
    } finally
    {
      this.loading = false;
    }
  }

  public get results(): string[]
  {
    return searchCountries(this.countries, this.query);
  }

  public countsFor(country: string): CountryEntryCounts
  {
    return this.counts.get(country) ?? { dishes: 0, photos: 0 };
  }

  public onInput(value: string): void
  {
    this.query = value;
    this.activeIndex = 0;
  }

  public onKeydown(event: KeyboardEvent): void
  {
    const count = this.results.length;
    if (event.key === 'ArrowDown' && count)
    {
      this.activeIndex = (this.activeIndex + 1) % count;
      this.scrollActiveIntoView();
      event.preventDefault();
    } else if (event.key === 'ArrowUp' && count)
    {
      this.activeIndex = (this.activeIndex - 1 + count) % count;
      this.scrollActiveIntoView();
      event.preventDefault();
    } else if (event.key === 'Enter')
    {
      const country = this.results[this.activeIndex];
      if (country) this.pick(country);
      event.preventDefault();
    }
  }

  public pick(country: string): void
  {
    this._dialogRef.afterClosed().subscribe(() => this._launcher.openJournal(country));
    this._dialogRef.close();
  }

  public trackByName(_: number, country: string): string
  {
    return country;
  }

  public optionId(index: number): string
  {
    return 'lookup-option-' + index;
  }

  private scrollActiveIntoView(): void
  {
    setTimeout(() => document.getElementById(this.optionId(this.activeIndex))?.scrollIntoView({ block: 'nearest' }));
  }
}

import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import { Router } from '@angular/router';
import { searchCountries } from '../utils/country-search';

@Component({
  selector: 'app-manage-countries',
  templateUrl: './manage-countries.component.html',
  styleUrls: ['./manage-countries.component.css']
})
export class ManageCountriesComponent implements OnInit
{

  public unusedCountries: string[] = [];
  public usedCountries: string[] = [];
  public newlyUsedCountries: string[] = [];
  public movedCountries: Set<string> = new Set<string>();
  public currentUser$ = this._firebase.currentUser$;
  public unusedFilter: string = "";

  // Accent-insensitive, closest match first (see utils/country-search.ts)
  public get filteredUnusedCountries(): string[]
  {
    return searchCountries(this.unusedCountries, this.unusedFilter);
  }

  public onFilterInput(value: string)
  {
    this.unusedFilter = value;
  }

  // Enter in the filter box moves the best not-yet-moved match to Newly Used and clears the box.
  // Best = exact match, then starts-with, then contains (so "congo" picks "Congo", "guinea" picks "Guinea").
  public addTopMatch()
  {
    if (!this.unusedFilter.trim())
    {
      return;
    }
    const match = this.filteredUnusedCountries.find(c => !this.movedCountries.has(c));
    if (match)
    {
      this.moveToNewlyUsed(match);
      this.unusedFilter = "";
    }
  }

  constructor(
    private _firebase: FirebaseService,
    private _router: Router
  ) { }

  async ngOnInit(): Promise<void>
  {
    const lists = await this._firebase.GetAdminCountryLists();
    this.unusedCountries = lists.unused;
    this.usedCountries = lists.used;
  }

  public moveToNewlyUsed(country: string)
  {
    if (!this.movedCountries.has(country))
    {
      this.movedCountries.add(country);
      this.newlyUsedCountries.push(country);
    }
  }

  public removeFromNewlyUsed(country: string)
  {
    const index = this.newlyUsedCountries.indexOf(country);
    if (index > -1)
    {
      this.newlyUsedCountries.splice(index, 1);
      this.movedCountries.delete(country);
    }
  }

  public async commitCountries()
  {
    if (this.newlyUsedCountries.length === 0) return;

    try
    {
      await this._firebase.AddUsedCountries(this.newlyUsedCountries);

      // Refresh lists
      const lists = await this._firebase.GetAdminCountryLists();
      this.unusedCountries = lists.unused;
      this.usedCountries = lists.used;

      // Clear local state
      this.newlyUsedCountries = [];
      this.movedCountries.clear();

    } catch (error)
    {
      console.error("Failed to commit countries", error);
    }
  }

  public goHome()
  {
    this._router.navigate(['/']);
  }

  public logout()
  {
    this._firebase.logout();
    this.goHome();
  }
}

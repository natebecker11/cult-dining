import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import { Router } from '@angular/router';

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

  public get filteredUnusedCountries(): string[]
  {
    const term = this._normalize(this.unusedFilter.trim());
    if (!term)
    {
      return this.unusedCountries;
    }
    return this.unusedCountries.filter(c => this._normalize(c).includes(term));
  }

  // Lowercase and strip accents so "curacao" finds "Curaçao (Netherlands)"
  private _normalize(value: string): string
  {
    return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  public onFilterInput(value: string)
  {
    this.unusedFilter = value;
  }

  // Enter in the filter box moves the best not-yet-moved match to Newly Used and clears the box.
  // Best = exact match, then starts-with, then contains (so "congo" picks "Congo", "guinea" picks "Guinea").
  public addTopMatch()
  {
    const term = this._normalize(this.unusedFilter.trim());
    if (!term)
    {
      return;
    }
    const rank = (c: string) =>
    {
      const n = this._normalize(c);
      return n === term ? 0 : n.startsWith(term) ? 1 : 2;
    };
    const match = this.filteredUnusedCountries
      .filter(c => !this.movedCountries.has(c))
      .sort((a, b) => rank(a) - rank(b))[0];
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

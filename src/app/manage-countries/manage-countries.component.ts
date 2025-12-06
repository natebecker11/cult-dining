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

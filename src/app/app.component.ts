import { Component, HostListener, NgZone, OnInit } from '@angular/core';
import { JournalLauncherService } from './services/journal-launcher.service';
import { FirebaseService } from './firebase.service';
import { ChartConfiguration } from 'src/models/ChartConfiguration';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit
{
  public Configuration = new ChartConfiguration();
  public currentUser$ = this._firebase.currentUser$;
  public isAdmin$ = this._firebase.isAdmin$;
  public showGlobalHeader$ = this._router.events.pipe(
    filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd),
    map((event: NavigationEnd) => event.url !== '/admin'),
    startWith(true) // Default to showing header
  );

  public isWheelPage$ = this._router.events.pipe(
    filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd),
    map((event: NavigationEnd) => event.urlAfterRedirects.split(/[?#]/)[0] === '/wheel'),
    startWith(false)
  );

  constructor(
    private _firebase: FirebaseService,
    private _router: Router,
    private _journal: JournalLauncherService,
    private _zone: NgZone
  )
  {

  }

  public openLookup()
  {
    this._journal.openLookup();
  }

  // "/" opens Look up country, unless the user is typing somewhere or is on the admin page
  @HostListener('document:keydown', ['$event'])
  public onGlobalKeydown(event: KeyboardEvent)
  {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
    if (this._router.url.startsWith('/admin')) return;
    event.preventDefault();
    // Document-level key events can arrive outside Angular's zone, so re-enter it before opening the dialog
    this._zone.run(() => this.openLookup());
  }

  public login()
  {
    this._firebase.loginWithGoogle();
  }

  public logout()
  {
    this._firebase.logout();
  }

  public goToAdmin()
  {
    this._router.navigate(['/admin']);
  }

  public async ngOnInit(): Promise<void>
  {
    await this.PopulateChart()

    console.log(this._firebase.GetConflicts())
  }

  public DataSets = new Array<any>();
  public Labels = new Array<string>();

  public async UploadCountries()
  {
    await this._firebase.Upload();
  }
  public async PopulateChart()
  {
    const countries = await this._firebase.GetCountriesList();
    const data = new Array<number>();
    const bgColors = new Array<string>();

    countries.forEach((c, i) =>
    {
      this.Labels.push(c);
      data.push(1);
      bgColors.push(i % 2 == 0 ? "#94C950" : "#F15A2C");
    })

    this.DataSets.push({
      data: data
    })
  }

  public OnClickChart()
  { }

  public OnHoverChart()
  {

  }
}

import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import { CountryEntriesService } from '../services/country-entries.service';
import { JournalLauncherService } from '../services/journal-launcher.service';
import { CountryEntryCounts } from '../models/country-entry';
import Globe from 'globe.gl';
import { FirebaseService } from '../firebase.service';
import { LlmService } from '../services/llm.service';
import { SUMMARY_PROMPT } from '../prompts/summary.prompt';
import { sharesLandBorder } from '../data/land-borders';

@Component({
  selector: 'app-globe',
  templateUrl: './globe.component.html',
  styleUrls: ['./globe.component.css']
})
export class GlobeComponent implements OnInit, AfterViewInit
{
  @ViewChild('globeViz') globeViz!: ElementRef;
  private globe: any;
  private countriesFeature: any[] = [];
  public unusedCountries: string[] = [];
  public usedCountries: string[] = [];
  public selectedCountry: string | null = null;
  public isSpinning: boolean = false;
  public isAdmin$ = this._firebase.isAdmin$;
  public history: string[] = [];
  public historyGeoNames = new Set<string>();
  public usedGeoNames = new Set<string>();
  public labelData: any[] = [];
  private unmappedCount: number = 0;
  public nextYear: number = new Date().getFullYear() + 1;
  private drumrollAudio = new Audio('assets/drumroll.mp3');
  private fanfareAudio = new Audio('assets/fanfare.mp3');

  public summaryText: string = "";
  public isGeneratingSummary: boolean = false;

  /** Globe shape name (properties.NAME) -> our country name, for countries we've had a dinner for */
  private usedGeoToCountry = new Map<string, string>();
  /** Journal dish/photo counts per country, for the hover tooltip */
  private entryCounts = new Map<string, CountryEntryCounts>();

  constructor(
    private _firebase: FirebaseService,
    private _llmService: LlmService,
    private _entries: CountryEntriesService,
    private _journal: JournalLauncherService,
    private _zone: NgZone
  ) { }

  async ngOnInit(): Promise<void>
  {
    this._entries.getCounts().then(counts => this.entryCounts = counts);
    this.unusedCountries = await this._firebase.GetCountriesList();
    this.usedCountries = await this._firebase.GetUsedCountries();
    this.refreshUsedCountries();

    // Initialize LLM Service with API Key from Firestore
    try
    {
      const keys = await this._firebase.getApiKeys();
      if (keys && keys.length > 0)
      {
        // Use the ID of the first document as the key
        const apiKey = keys[0].id;
        this._llmService.initialize(apiKey);
        console.log("LLM Service successfully initialized.");
      } else
      {
        console.error("No API keys found in Firestore 'ApiKeys' collection. LLM features will be disabled.");
        // We could also show a user-friendly toast/alert here if desired
      }
    } catch (e)
    {
      console.error("Failed to fetch API keys during Globe initialization:", e);
    }
  }

  public debugCountries(): void
  {
    const unmatchedCountries = this.unusedCountries.filter(country => !this.findCountryFeature(country));
    const geoJsonCountries = this.countriesFeature.map((f: any) => f.properties.NAME).sort();

    const debugData = {
      unmatchedCountries: unmatchedCountries.sort(),
      geoJsonCountries: geoJsonCountries
    };

    console.log(debugData);
    navigator.clipboard.writeText(JSON.stringify(debugData, null, 2))
      .then(() => console.log('Debug data copied to clipboard'))
      .catch(err => console.error('Failed to copy: ', err));
  }

  ngAfterViewInit(): void
  {
    this.initGlobe();
  }

  private initGlobe(): void
  {
    const PALETTE = {
      BASE: '#EE589E',           // Rose Pink
      USED: '#BA1260',           // Berry/Dark Pink
      PICKED: '#2E86AB',         // Lime A400
      HISTORY: '#2E86AB',        // Lime A400
      HOVER: '#18FFFF'           // Cyan A200
    };

    // @ts-ignore
    this.globe = Globe()
      (this.globeViz.nativeElement)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .polygonCapColor((feat: any) =>
      {
        if (feat.properties.NAME === this.selectedCountry) return PALETTE.HISTORY;
        if (this.historyGeoNames.has(feat.properties.NAME)) return PALETTE.HISTORY;
        if (this.usedGeoNames.has(feat.properties.NAME)) return PALETTE.USED;
        return PALETTE.BASE;
      })
      .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
      .polygonStrokeColor(() => '#111')
      .onPolygonHover((hoverD: any) =>
      {
        this.globe.polygonAltitude((d: any) => d === hoverD ? 0.07 : 0.06);
      })
      .polygonsTransitionDuration(300)
      .polygonLabel((feat: any) => this.journalTooltip(feat))
      .onPolygonClick((obj: any) =>
      {
        if (obj)
        {
          const { lat, lng } = this.getCentroid(obj.geometry);
          this.globe.pointOfView({ lat, lng, altitude: 1.6 }, 1000);

          // Countries we've had a dinner for open their journal (not mid-spin, so the reveal isn't interrupted)
          const country = this.usedGeoToCountry.get(obj.properties.NAME);
          if (country && !this.isSpinning)
          {
            this._zone.run(() => this._journal.openJournal(country));
          }
        }
      })
      .labelLat((d: any) => d.lat)
      .labelLng((d: any) => d.lng)
      .labelText((d: any) => d.text)
      .labelSize(0.8)
      .labelDotRadius(0.2)
      .labelColor((d: any) => d.color)
      .labelResolution(2)
      .labelAltitude(0.08);

    // Fetch GeoJSON
    fetch('//unpkg.com/world-atlas/countries-50m.json').then(res => res.json()).then((countries: any) =>
    {
      fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
        .then(res => res.json())
        .then(countriesGeo =>
        {
          this.countriesFeature = countriesGeo.features;
          this.refreshUsedCountries();
          this.globe.polygonsData(this.countriesFeature);
        });
    });
  }

  /** Hover tooltip for countries we've had a dinner for; other countries get none. */
  private journalTooltip(feat: any): string
  {
    const country = this.usedGeoToCountry.get(feat?.properties?.NAME);
    if (!country) return '';
    const c = this.entryCounts.get(country) ?? { dishes: 0, photos: 0 };
    const detail = c.dishes || c.photos
      ? `${c.dishes} ${c.dishes === 1 ? 'dish' : 'dishes'} · ${c.photos} ${c.photos === 1 ? 'photo' : 'photos'}`
      : 'No entries yet';
    return `<div style="background:rgba(0,0,0,.85);color:#fff;padding:8px 12px;border-radius:6px;font:13px/1.4 Roboto,sans-serif">`
      + `<b style="font-weight:500">${escapeHtml(country)}</b><br>`
      + `<span style="color:#b0bec5">${detail} · Click to open</span></div>`;
  }

  private refreshUsedCountries(): void
  {
    if (!this.countriesFeature || this.countriesFeature.length === 0) return;

    this.usedCountries.forEach(name =>
    {
      const match = this.findCountryFeature(name);
      if (match)
      {
        this.usedGeoNames.add(match.properties.NAME);
        this.usedGeoToCountry.set(match.properties.NAME, name);
      }
    });

    if (this.globe)
    {
      this.globe.polygonCapColor(this.globe.polygonCapColor());
      this.updateLabels();
    }
  }

  public spinToRandomCountry(): void
  {
    if (this.isSpinning || this.unusedCountries.length === 0) return;
    this.isSpinning = true;
    this.selectedCountry = null;
    this.globe.polygonCapColor(this.globe.polygonCapColor()); // Force update to clear highlight

    let targetName: string;
    let match: any;
    let borderRepicks = 0;

    // Pick until we find a valid one (mapped OR unmapped limit not reached)
    do
    {
      const randomIndex = Math.floor(Math.random() * this.unusedCountries.length);
      targetName = this.unusedCountries[randomIndex];

      // Check if already in history (duplicate check)
      if (this.history.includes(targetName))
      {
        console.log(`Skipping duplicate country: ${targetName}`);
        continue;
      }

      match = this.findCountryFeature(targetName);

      // If found, good.
      // If not found, check limit.
      if (!match && this.unmappedCount >= 2)
      {
        console.log(`Skipping unmapped country ${targetName} because limit of 2 reached.`);
        continue;
      }

      // Avoid neighbors: repick if it shares a land border with a country already picked this year.
      // After 2 border repicks we stop checking for this spin, so it can never get stuck.
      if (borderRepicks < 2 && sharesLandBorder(targetName, this.history))
      {
        borderRepicks++;
        console.log(`Repicking ${targetName}: borders a country already picked (border repick ${borderRepicks} of 2).`);
        continue;
      }

      break;
    } while (true);

    console.log("Spinning to:", targetName);

    // Initial Random Spin
    this.globe.controls().autoRotate = true;
    this.globe.controls().autoRotateSpeed = 50;

    // Play drumroll
    this.drumrollAudio.currentTime = 0;
    this.drumrollAudio.play().catch(e => console.error("Error playing drumroll:", e));

    // Zoom out slightly for the spin
    this.globe.pointOfView({ altitude: 2.5 }, 1000);

    setTimeout(() =>
    {
      this.globe.controls().autoRotate = false;
      this.globe.controls().autoRotateSpeed = 0.5;

      if (match)
      {
        const { lat, lng } = this.getCentroid(match.geometry);

        // Zoom in closer (1.6)
        this.globe.pointOfView({ lat, lng, altitude: 1.3 }, 3000);

        setTimeout(() =>
        {
          this.selectedCountry = match.properties.NAME;
          this.isSpinning = false;
          this.history.push(targetName);
          this.historyGeoNames.add(match.properties.NAME);
          this.globe.polygonCapColor(this.globe.polygonCapColor());
          this.updateLabels();

          // Stop drumroll and play fanfare
          this.drumrollAudio.pause();
          this.drumrollAudio.currentTime = 0;
          this.fanfareAudio.currentTime = 0;
          this.fanfareAudio.play().catch(e => console.error("Error playing fanfare:", e));

          if (this.history.length === 12)
          {
            this.generateSummary();
          }

        }, 3000);

      } else
      {
        console.warn("Could not find match for:", targetName);
        this.unmappedCount++; // Increment count for unmapped

        const randomLat = (Math.random() * 180) - 90;
        const randomLng = (Math.random() * 360) - 180;

        // Zoom in closer (1.6) for unmapped too? Maybe keep it at 2 or 1.6. Let's do 1.6 for consistency.
        this.globe.pointOfView({ lat: randomLat, lng: randomLng, altitude: 1.6 }, 3000);

        setTimeout(() =>
        {
          this.selectedCountry = `${targetName} (not mapped)`;
          this.isSpinning = false;
          this.history.push(targetName);

          // Stop drumroll and play fanfare
          this.drumrollAudio.pause();
          this.drumrollAudio.currentTime = 0;
          this.fanfareAudio.currentTime = 0;
          this.fanfareAudio.play().catch(e => console.error("Error playing fanfare:", e));

          if (this.history.length === 12)
          {
            this.generateSummary();
          }
        }, 3000);
      }
    }, 3000);
  }

  public copyHistoryToClipboard(): void
  {
    const text = this.history.map((name, index) => `${index + 1}. ${name}`).join('\n');
    navigator.clipboard.writeText(text)
      .then(() => console.log('History copied to clipboard'))
      .catch(err => console.error('Failed to copy history: ', err));
  }

  public onHistoryItemClick(countryName: string): void
  {
    const match = this.findCountryFeature(countryName);

    if (match)
    {
      const { lat, lng } = this.getCentroid(match.geometry);
      // Determine altitude based on country area or just a default? Default 2 is fine as used in spin.
      // Changing to 1.6 for zoom in effect
      this.globe.pointOfView({ lat, lng, altitude: 1.6 }, 1000);
      this.selectedCountry = match.properties.NAME;
      this.globe.polygonCapColor(this.globe.polygonCapColor()); // Update colors
      // updateLabels is handled automatically if historyGeoNames was updated, but here we just highlighted existing history.
    } else
    {
      console.warn("Could not find match for history item:", countryName);
    }
  }

  private updateLabels(): void
  {
    // Collect all unique names from usedGeoNames and historyGeoNames
    const labelNames = new Set<string>([...this.usedGeoNames, ...this.historyGeoNames]);

    const newLabelData: any[] = [];

    labelNames.forEach(name =>
    {
      // We need to find the feature to get lat/lng
      // We can use helper or just search countriesFeature.
      const match = this.countriesFeature.find((f: any) => f.properties.NAME === name);
      if (match)
      {
        const { lat, lng } = this.getCentroid(match.geometry);
        let color = 'white';
        if (this.historyGeoNames.has(name))
        {
          color = 'white';
        }

        newLabelData.push({
          lat: lat,
          lng: lng,
          text: name,
          color: color
        });
      }
    });

    this.labelData = newLabelData;
    if (this.globe)
    {
      this.globe.labelsData(this.labelData);
    }
  }

  private async generateSummary()
  {
    this.isGeneratingSummary = true;
    try
    {
      // Same year the Breakdown panel heading shows
      const prompt = SUMMARY_PROMPT.replace('{{YEAR}}', String(this.nextYear));
      this.summaryText = await this._llmService.generateCountrySummary(this.history, prompt);
    } catch (e)
    {
      console.error("Failed to generate summary", e);
      this.summaryText = "Could not generate summary.";
    } finally
    {
      this.isGeneratingSummary = false;
    }
  }

  public testSummary()
  {
    // Clear current history to simulate a fresh run
    this.history = [];
    this.historyGeoNames.clear();

    // Get 12 random unused countries
    const shuffled = [...this.unusedCountries].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 12);

    selected.forEach(name =>
    {
      this.history.push(name);
      this.historyGeoNames.add(name);
    });

    // Update globe
    this.globe.polygonCapColor(this.globe.polygonCapColor());
    this.updateLabels();

    // Trigger summary
    this.generateSummary();
  }

  public runModelDiagnostic()
  {
    this._llmService.listModels();
  }

  private findCountryFeature(name: string): any
  {
    // Simple normalization
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/\([^)]*\)/g, ''); // Remove parens content

    const target = normalize(name);

    // Exact search first
    let found = this.countriesFeature.find((f: any) => normalize(f.properties.NAME) === target || normalize(f.properties.ADMIN) === target);

    if (!found)
    {
      // Try specific mappings if needed, or fuzzy?
      // Let's stick to simple normalization for now.
      // Some datasets use 'United States of America' vs 'United States'.
      // 'NAME' or 'ADMIN' or 'NAME_LONG' keys might exist in the dataset.
      // The one linked uses NAME, ADMIN.

      // Manual override examples based on known list
      if (name === "United States") found = this.countriesFeature.find((f: any) => f.properties.ADMIN === "United States of America");

      // Use mapping dictionary
      if (!found)
      {
        const mapping: { [key: string]: string } = {
          "DR Congo": "Dem. Rep. Congo",
          "Eswatini": "Swaziland",
          "North Macedonia": "Macedonia",
          "South Sudan": "S. Sudan",
          "Dominican Republic": "Dominican Rep.",
          "Central African Republic": "Central African Rep.",
          "Equatorial Guinea": "Eq. Guinea",
          "Bosnia and Herzegovina": "Bosnia and Herz.",
          "Solomon Islands": "Solomon Is.",
          "East Timor": "Timor-Leste",
          "Ivory Coast": "Côte d'Ivoire",
          "Western Sahara (disputed)": "W. Sahara",
          "Puerto Rico (United States)": "Puerto Rico",
          "Falkland Islands": "Falkland Is."
        };

        const mappedName = mapping[name];
        if (mappedName)
        {
          const normalizedMapped = normalize(mappedName);
          found = this.countriesFeature.find((f: any) => normalize(f.properties.NAME) === normalizedMapped || normalize(f.properties.ADMIN) === normalizedMapped);
        }
      }
    }

    return found;
  }

  private getCentroid(geometry: any): { lat: number, lng: number }
  {
    // Very rough centroid for Polygon/MultiPolygon
    let coords = [];
    if (geometry.type === 'Polygon') coords = geometry.coordinates[0];
    else if (geometry.type === 'MultiPolygon') coords = geometry.coordinates[0][0]; // Take first polygon of multi

    let lat = 0, lng = 0;
    coords.forEach((p: any) => { lng += p[0]; lat += p[1]; });
    return { lat: lat / coords.length, lng: lng / coords.length };
  }
}

function escapeHtml(value: string): string
{
  return value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string));
}

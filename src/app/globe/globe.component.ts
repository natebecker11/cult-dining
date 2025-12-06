import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import Globe from 'globe.gl';
import { FirebaseService } from '../firebase.service';

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

  constructor(private _firebase: FirebaseService) { }

  async ngOnInit(): Promise<void>
  {
    this.unusedCountries = await this._firebase.GetCountriesList();
    this.usedCountries = await this._firebase.GetUsedCountries();
    this.refreshUsedCountries();

    // We need to populate usedGeoNames. 
    // This requires the feature match logic which depends on countriesFeature being loaded.
    // However, initGlobe fetches the geoJson. 
    // We should probably wait or do it in the fetch callback. 
    // But normalized matching is needed.
    // Let's defer population to initGlobe fetch or right after.
    // But findCountryFeature relies on countriesFeature.
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
      PICKED: '#C6FF00',         // Lime A400
      HISTORY: '#C6FF00',        // Lime A400
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
        this.globe.polygonAltitude((d: any) => d === hoverD ? 0.12 : 0.06);
      })
      .polygonsTransitionDuration(300)
      .onPolygonClick((obj: any) =>
      {
        if (obj)
        {
          const { lat, lng } = this.getCentroid(obj.geometry);
          this.labelData = [{
            lat: lat,
            lng: lng,
            text: obj.properties.NAME
          }];
          this.globe.labelsData(this.labelData);
        }
      })
      .labelLat((d: any) => d.lat)
      .labelLng((d: any) => d.lng)
      .labelText((d: any) => d.text)
      .labelSize(2.0)
      .labelDotRadius(0.5)
      .labelColor(() => 'white')
      .labelResolution(2)
      .labelAltitude(0.2);

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

  private refreshUsedCountries(): void
  {
    if (!this.countriesFeature || this.countriesFeature.length === 0) return;

    this.usedCountries.forEach(name =>
    {
      const match = this.findCountryFeature(name);
      if (match) this.usedGeoNames.add(match.properties.NAME);
    });

    if (this.globe)
    {
      this.globe.polygonCapColor(this.globe.polygonCapColor());
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

      break;
    } while (true);

    console.log("Spinning to:", targetName);

    // Initial Random Spin
    this.globe.controls().autoRotate = true;
    this.globe.controls().autoRotateSpeed = 50;

    // Play drumroll
    this.drumrollAudio.currentTime = 0;
    this.drumrollAudio.play().catch(e => console.error("Error playing drumroll:", e));

    setTimeout(() =>
    {
      this.globe.controls().autoRotate = false;
      this.globe.controls().autoRotateSpeed = 0.5;

      if (match)
      {
        const { lat, lng } = this.getCentroid(match.geometry);

        this.globe.pointOfView({ lat, lng, altitude: 2 }, 2000);

        setTimeout(() =>
        {
          this.selectedCountry = match.properties.NAME;
          this.isSpinning = false;
          this.history.push(targetName);
          this.historyGeoNames.add(match.properties.NAME);
          this.globe.polygonCapColor(this.globe.polygonCapColor());

          // Stop drumroll and play fanfare
          this.drumrollAudio.pause();
          this.drumrollAudio.currentTime = 0;
          this.fanfareAudio.currentTime = 0;
          this.fanfareAudio.play().catch(e => console.error("Error playing fanfare:", e));

        }, 2000);

      } else
      {
        console.warn("Could not find match for:", targetName);
        this.unmappedCount++; // Increment count for unmapped

        const randomLat = (Math.random() * 180) - 90;
        const randomLng = (Math.random() * 360) - 180;

        this.globe.pointOfView({ lat: randomLat, lng: randomLng, altitude: 2 }, 2000);

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
        }, 2000);
      }
    }, 2000);
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
      this.globe.pointOfView({ lat, lng, altitude: 2 }, 1000);
      this.selectedCountry = match.properties.NAME;
      this.globe.polygonCapColor(this.globe.polygonCapColor()); // Update colors
    } else
    {
      console.warn("Could not find match for history item:", countryName);
    }
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

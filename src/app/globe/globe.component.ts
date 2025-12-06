import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import Globe from 'globe.gl';
import { FirebaseService } from '../firebase.service';
import { LlmService } from '../services/llm.service';
import { SUMMARY_PROMPT } from '../prompts/summary.prompt';

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

  constructor(private _firebase: FirebaseService, private _llmService: LlmService) { }

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
      .onPolygonClick((obj: any) =>
      {
        if (obj)
        {
          const { lat, lng } = this.getCentroid(obj.geometry);
          this.globe.pointOfView({ lat, lng, altitude: 1.6 }, 1000);
        }
      })
      .labelLat((d: any) => d.lat)
      .labelLng((d: any) => d.lng)
      .labelText((d: any) => d.text)
      .labelSize(1.2)
      .labelDotRadius(0.3)
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

    // Pick until we find a valid one (mapped OR unmapped limit not reached)
    do
    {
      if (this.history.length === 11)
      {
        // Force Philippines on 12th spin
        targetName = "Philippines";
      } else
      {
        const randomIndex = Math.floor(Math.random() * this.unusedCountries.length);
        targetName = this.unusedCountries[randomIndex];
      }

      // Special rule: Skip Philippines if not the 12th spin
      if (targetName === "Philippines" && this.history.length !== 11)
      {
        console.log("Skipping Philippines until the 12th spin.");
        continue;
      }

      // Check if already in history (duplicate check)
      if (this.history.includes(targetName))
      {
        console.log(`Skipping duplicate country: ${targetName}`);
        // If we forced Philippines and it's already there (unlikely if logic holds, but safe), we have an issue.
        // But for normal flow, continue.
        // If we forced it, we should probably break or handle it, but assuming 12th unique spin is wanted.
        if (this.history.length === 11)
        {
          // If Philippines is already there, we can't force it again logically without dup. 
          // But assuming user wants it as the 12th item.
          // If it's already done, strictly speaking we rely on it being unique.
          // Let's just break to allow it or maybe it's a re-spin. 
          // Given the prompt "12th country", we assume it hasn't been picked yet because we skipped it.
          break;
        }
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
        this.globe.pointOfView({ lat, lng, altitude: 1.6 }, 3000);

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
      this.summaryText = await this._llmService.generateCountrySummary(this.history, SUMMARY_PROMPT);
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

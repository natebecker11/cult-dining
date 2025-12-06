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
  public selectedCountry: string | null = null;
  public isSpinning: boolean = false;

  constructor(private _firebase: FirebaseService) { }

  async ngOnInit(): Promise<void>
  {
    this.unusedCountries = await this._firebase.GetCountriesList();
  }

  ngAfterViewInit(): void
  {
    this.initGlobe();
  }

  private initGlobe(): void
  {
    // @ts-ignore
    this.globe = Globe()
      (this.globeViz.nativeElement)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .polygonCapColor((feat: any) => feat.properties.NAME === this.selectedCountry ? '#ff0000' : 'rgba(200, 0, 0, 0.6)')
      .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
      .polygonStrokeColor(() => '#111')
      .onPolygonHover((hoverD: any) =>
      {
        this.globe.polygonCapColor((d: any) => d === hoverD ? 'steelblue' : (d.properties.NAME === this.selectedCountry ? '#ff0000' : 'rgba(200, 0, 0, 0.6)'))
          .polygonAltitude((d: any) => d === hoverD ? 0.12 : 0.06);
      })
      .polygonsTransitionDuration(300);

    // Fetch GeoJSON
    fetch('//unpkg.com/world-atlas/countries-50m.json').then(res => res.json()).then((countries: any) =>
    {
      // globe.gl expects GeoJSON features. world-atlas is TopoJSON, need to convert or find GeoJSON source.
      // Actually globe.gl examples often use a specific geojson source.
      // Let's use a reliable GeoJSON source.
      fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
        .then(res => res.json())
        .then(countriesGeo =>
        {
          this.countriesFeature = countriesGeo.features;
          this.globe.polygonsData(this.countriesFeature);
        });
    });
  }

  public spinToRandomCountry(): void
  {
    if (this.isSpinning || this.unusedCountries.length === 0) return;
    this.isSpinning = true;
    this.selectedCountry = null;
    this.globe.polygonCapColor(this.globe.polygonCapColor()); // Force update to clear highlight

    // Pick random
    const randomIndex = Math.floor(Math.random() * this.unusedCountries.length);
    const targetName = this.unusedCountries[randomIndex];

    console.log("Spinning to:", targetName);

    // Find match
    const match = this.findCountryFeature(targetName);

    if (match)
    {
      // Calculate Centroid (simplified, or use globe.gl utility if available. Polygon feature usually has bbox or we can compute)
      // Globe.gl's polygonCapColor uses 'properties', but for POV we need lat/lng.
      // We can use built-in geometry calculation or a helper.
      // For simplicity, let's try to let globe.gl handle it or compute centroid of first polygon ring.

      // Better approach: use `d3-geo` centroid if available, or simple average of points. 
      // Or just lookup lat/lng from a list if we had one.
      // Let's compute a rough centroid.
      const { lat, lng } = this.getCentroid(match.geometry);

      this.selectedCountry = match.properties.NAME; // Set selected name from GeoJSON to ensure match for highlighting

      this.globe.pointOfView({ lat, lng, altitude: 2 }, 2000); // Fly to it

      setTimeout(() =>
      {
        this.isSpinning = false;
        this.globe.polygonCapColor(this.globe.polygonCapColor()); // Update highlight
      }, 2000);

    } else
    {
      console.warn("Could not find match for:", targetName);
      this.isSpinning = false;
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

import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { ChartConfiguration } from 'src/models/ChartConfiguration';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit
{
  public Configuration = new ChartConfiguration();
  constructor(
    private _firebase: FirebaseService
  )
  {

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
    const countries =  await this._firebase.GetCountriesList();
    const data = new Array<number>();
    const bgColors = new Array<string>();

    countries.forEach((c, i) => {
      this.Labels.push(c);
      data.push(1);
      bgColors.push(i % 2 == 0 ? "#94C950": "#F15A2C");
    })

    this.DataSets.push({
      data: data
    })
  }

  public OnClickChart()
  {}

  public OnHoverChart()
  {

  }
}

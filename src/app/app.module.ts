import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgChartsModule } from 'ng2-charts';
import { WheelComponent } from './wheel/wheel.component';
import { WheelResultModalComponent } from './wheel-result-modal/wheel-result-modal.component';
import { MaterialModule } from './material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ManageCountriesComponent } from './manage-countries/manage-countries.component';
import { AppRoutingModule } from './app-routing.module';
import { GlobeComponent } from './globe/globe.component';

@NgModule({
  declarations: [
    AppComponent,
    WheelComponent,
    WheelResultModalComponent,
    ManageCountriesComponent,
    GlobeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgChartsModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

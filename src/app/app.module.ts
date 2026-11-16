import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgChartsModule } from 'ng2-charts';
import { WheelComponent } from './wheel/wheel.component';
import { WheelResultModalComponent } from './wheel-result-modal/wheel-result-modal.component';
import { MaterialModule } from './material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { ManageCountriesComponent } from './manage-countries/manage-countries.component';
import { AppRoutingModule } from './app-routing.module';
import { GlobeComponent } from './globe/globe.component';
import { CountryJournalDialogComponent } from './country-journal-dialog/country-journal-dialog.component';
import { CountryLookupDialogComponent } from './country-lookup-dialog/country-lookup-dialog.component';
import { PhotoViewerComponent } from './photo-viewer/photo-viewer.component';
import { AddEntryDialogComponent } from './add-entry-dialog/add-entry-dialog.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    WheelComponent,
    WheelResultModalComponent,
    ManageCountriesComponent,
    GlobeComponent,
    CountryJournalDialogComponent,
    CountryLookupDialogComponent,
    PhotoViewerComponent,
    AddEntryDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgChartsModule,
    MaterialModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MarkdownModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

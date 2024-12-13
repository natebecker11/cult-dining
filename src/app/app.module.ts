import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgChartsModule } from 'ng2-charts';
import { WheelComponent } from './wheel/wheel.component';
import { WheelResultModalComponent } from './wheel-result-modal/wheel-result-modal.component';
import { MaterialModule } from './material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
  declarations: [
    AppComponent,
    WheelComponent,
    WheelResultModalComponent
  ],
  imports: [
    BrowserModule,
    NgChartsModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

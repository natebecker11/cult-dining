import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';


@NgModule({
  declarations: [],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  exports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ]
})
export class MaterialModule { }

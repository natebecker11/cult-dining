import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [],
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  exports: [
    MatDialogModule,
    MatButtonModule
  ]
})
export class MaterialModule { }

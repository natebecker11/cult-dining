import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmDialogData
{
  title: string;
  message: string;
  confirmLabel: string;
  /** Styles the confirm button as destructive */
  destructive?: boolean;
}

/** A small yes/no dialog. Closes with true when confirmed. */
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content><p class="confirm-message">{{ data.message }}</p></mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" cdkFocusInitial>Cancel</button>
      <button mat-raised-button [color]="data.destructive ? 'warn' : 'primary'" [mat-dialog-close]="true">{{ data.confirmLabel }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.confirm-message { margin: 0; line-height: 1.5; }`]
})
export class ConfirmDialogComponent
{
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) { }
}

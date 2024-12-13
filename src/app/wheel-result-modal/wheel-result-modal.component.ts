import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-wheel-result-modal',
  templateUrl: './wheel-result-modal.component.html',
  styleUrls: ['./wheel-result-modal.component.css']
})
export class WheelResultModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) private _dialogData: WheelResultDialogData,
    private _dialogRef: MatDialogRef<WheelResultModalComponent>
  ){
    if (this._dialogData)
    {
      const wheelData = this._dialogData as WheelResultDialogData;
      this.Message = wheelData.Message;
      this.ButtonText = wheelData.ButtonText;
    }
  }

  public Message: string = ""
  public ButtonText: string = ""
}

export type WheelResultDialogData = 
{
  Message: string,
  ButtonText: string
}

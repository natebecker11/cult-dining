import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FirebaseService, GuessingGameData } from '../firebase.service';

@Component({
  selector: 'app-wheel-result-modal',
  templateUrl: './wheel-result-modal.component.html',
  styleUrls: ['./wheel-result-modal.component.css']
})
export class WheelResultModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) private _dialogData: WheelResultDialogData,
    private _dialogRef: MatDialogRef<WheelResultModalComponent>,
    private _fireBaseSvc: FirebaseService
  ){
    if (this._dialogData)
    {
      const wheelData = this._dialogData as WheelResultDialogData;
      // this.Message = wheelData.Message;
      // this.ButtonText = wheelData.ButtonText;
      // this.FunFact = wheelData.FunFact;
      this.Name = wheelData.Name;
      this.IsDupe = wheelData.IsDupe;
      if (this.IsDupe)
      {
        this.ShowCloseButton = true;
      }
    }

    if (this.Name)
    {
      this.GuessingGameData = this._fireBaseSvc.GetGuessingGame(this.Name);
      if (this.GuessingGameData)
      {
        this.CountryButtons = [this.Name, this.GuessingGameData.WrongGuess]
      }
    }

    (<any>window).confetti()
  }

  // public Message: string = ""
  // public ButtonText: string = ""
  // public FunFact: string = ""
  public IsDupe: boolean = false
  public Name: string = ""

  public GuessingGameData: GuessingGameData | undefined;

  public CountryButtons = new Array<string>();

  public ShowCloseButton: boolean = false;
  public get CloseButtonText(): string
  {
    return this.IsDupe ? "Spin Again!" : "Super, let's lock it in!"
  }

  public GuessedCountry: string = ""
  public CorrectGuess: boolean = false;

  public GuessCountry(ct: string)
  {
    this.GuessedCountry = ct;
    if (this.GuessedCountry = this.Name)
    {
      this.CorrectGuess = true;
    }
    this.CountryButtons = [];
  }


}

export type WheelResultDialogData = 
{
  IsDupe: boolean,
  Name: string
}

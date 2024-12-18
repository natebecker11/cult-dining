import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-wheel',
  templateUrl: './wheel.component.html',
  styleUrls: ['./wheel.component.css']
})
export class WheelComponent implements OnInit
{
  constructor(
    private _firebaseSvc: FirebaseService
  )
  {

  }
  public async ngOnInit(): Promise<void>
  {
    this.Countries = await this._firebaseSvc.GetCountriesList();
    document.body.style.setProperty('--_items', this.Countries.length.toString());

    setTimeout(() => {  
      const wedges = document.querySelectorAll(".wheelWedge");
      wedges.forEach((el, i) =>
      {
        const wedge = el as HTMLElement;
        wedge.style.setProperty("--_idx", (i+1).toString())
      })

      // this.wheelOfFortune()
    }, 5)
    //document.querySelectorAll("wheelWedge").forEach(wedge => wedge)
  }

  public Countries: string[] = [];

  public CountriesThisSession: string[] = []

  private _previousEndDegree: number = 0
  private _currentDegrees: number = 0

  private _mostRecentCountry: string = "";
  private _isSpinning: boolean = false;
  private _duplicateCountry: string= "";

  public get HeaderDisplay(): string
  {
    if (this._isSpinning)
    {
      return "Spinning..."
    }

    if (!this._mostRecentCountry.length)
    {
      return "Click Spin To Pick Your First Country!!"
    }

    if (this._duplicateCountry.length)
    {
      return `You Already Selected ${this._duplicateCountry}, Please Spin Again!`
    }

    return `Your Next Country Is ${this._mostRecentCountry.toUpperCase()}!!!!!`
  }

  public wheelOfFortune() {
      
    // const spin = document.querySelector('.spinButton') as HTMLButtonElement;
    const wheel = document.querySelector('ul') as HTMLUListElement;
    let animation: any;
    // let previousEndDegree = 0;
  
    if (animation) {
      animation.cancel(); // Reset the animation if it already exists
    }

    // const addDegrees = 1
    const addDegrees = Math.random() * 360

    const randomAdditionalDegrees = addDegrees + 1800;
    const newEndDegree = this._previousEndDegree + randomAdditionalDegrees;
    this._currentDegrees = this._currentDegrees + addDegrees;

    this._duplicateCountry = "";
    this._isSpinning = true;
    animation = wheel.animate([
      // { transform: `rotate(${this._previousEndDegree}deg)` },
      { transform: `rotate(${newEndDegree}deg)` }
    ], {
      duration: 4000,
      direction: 'normal',
      easing: 'cubic-bezier(0.440, -0.205, 0.000, 1.130)',
      fill: 'forwards',
      iterations: 1
    });

    this._previousEndDegree = newEndDegree;

    const ratio = ( Math.abs((this._currentDegrees*-1 + 90)) % 360) / 360

    // const position = this._currentDegrees % 360

    // let ratio = position / 360

    // if (this._currentDegrees < 90)
    // {
    //   ratio = ((this._currentDegrees*-1 + 90) % 360) / 360
    // }
    // else
    // {
    //   ratio = ((this._currentDegrees + 90) % 360) / 360
    // }


    const index = Math.round(this.Countries.length * ratio)

    setTimeout(() => {
      this._isSpinning = false;
      const newCt = this.Countries[this.Countries.length - index]
      if (this.CountriesThisSession.includes(newCt))
      {
        this._duplicateCountry = newCt
      }
      else
      {
        this._mostRecentCountry = newCt
        this.CountriesThisSession.push(newCt)
      }
      console.log(newCt)

    }, 4000)



    // console.log(this.Countries[index])

    // console.log(newEndDegree - 1800)
    // const listItems = document.querySelectorAll("li");
    // console.log("ListItems", listItems)

    // const albania = listItems[33];
    // const rect = albania.getBoundingClientRect();
    // console.log("rect", rect.top, rect.left, albania.innerText)

    // window.requestAnimationFrame(() => {
    //   const albania = listItems[33];
    //   const rect = albania.getBoundingClientRect();
    //   console.log("rect", rect.top, rect.left, albania.innerText)
    // })
    // const listItems = document.querySelectorAll("li");
    // console.log("LI", listItems[5].offsetTop, listItems[5].offsetHeight)

    // const listItem = document.querySelector("li");
    // if (listItem)
    // {
    //   console.log("LI2", listItem.offsetTop)
    // }
  }
}

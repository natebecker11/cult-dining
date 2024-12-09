import { Injectable } from '@angular/core';
// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

import { collection, addDoc, getDocs } from "firebase/firestore";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService
{

  constructor()
  {

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDTK0_hUigo0chPsil_hbrciJocj_yqDoQ",
      authDomain: "cultural-dinners-f837a.firebaseapp.com",
      projectId: "cultural-dinners-f837a",
      storageBucket: "cultural-dinners-f837a.firebasestorage.app",
      messagingSenderId: "268612424958",
      appId: "1:268612424958:web:7adfbab8a6a3c77aaa01af"
    };

    // Initialize Firebase
    this._app = initializeApp(firebaseConfig);
    this._db = getFirestore(this._app);
  }

  private _app: FirebaseApp;
  private _db: Firestore

  // private async _getUsedCountries()
  // {
  //   const querySnapshot = await getDocs(collection(this._db, "UsedCountries"));
  //   querySnapshot.forEach((doc) =>
  //   {
  //     console.log(`${doc.id} => `, doc.data()["Name"]);
  //   });
  // }

  private readonly _allCt = "AllCountries";
  private readonly _usedCt = "UsedCountries";

  public async Upload()
  {
    try {


      // for (let i = 0; i < this.RawAllCountries.length; i++) {
      //   const ctName = this.RawAllCountries[i];
      //   const docRef = await addDoc(collection(this._db, this._allCt), {
      //     Name: ctName
      //   });
      //   console.log("Added To All Countries " + ctName, docRef.id)
        
      // }

      
      // for (let i = 0; i < this.RawUsedCountries.length; i++) {
      //   const ctName = this.RawUsedCountries[i];
      //   const docRef = await addDoc(collection(this._db, this._usedCt), {
      //     Name: ctName
      //   });
      //   console.log("Added To Used Countries " + ctName, docRef.id)
        
      // }

    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  public RawUsedCountries = ["Afghanistan",
    "Bangladesh",
    "Bolivia",
    "Fiji",
    "Brazil",
    "Chad",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czechia",
    "Denmark",
    "El Salvador",
    "Equatorial Guinea",
    "Ethiopia",
    "France",
    "French Polynesia (France)",
    "Honduras",
    "India",
    "Iraq",
    "Ireland",
    "Jamaica",
    "South Korea",
    "Latvia",
    "Lebanon",
    "Laos",
    "Luxembourg",
    "Mexico",
    "Micronesia",
    "Myanmar",
    "Nepal",
    "Nicaragua",
    "Palestine",
    "Papua New Guinea",
    "Peru",
    "Portugal",
    "Saudi Arabia",
    "Sri Lanka",
    "Sudan",
    "Sweden",
    "Thailand",
    "Togo",
    "Turkmenistan",
    "United Kingdom",
    "Uruguay",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe"]

    public RawAllCountries =  ["India",
      "China",
      "United States",
      "Indonesia",
      "Pakistan",
      "Nigeria",
      "Brazil",
      "Bangladesh",
      "Russia",
      "Mexico",
      "Ethiopia",
      "Japan",
      "Philippines",
      "Egypt",
      "DR Congo",
      "Vietnam",
      "Iran",
      "Turkey",
      "Germany",
      "Thailand",
      "United Kingdom",
      "Tanzania",
      "France",
      "South Africa",
      "Italy",
      "Kenya",
      "Myanmar",
      "Colombia",
      "South Korea",
      "Sudan",
      "Uganda",
      "Spain",
      "Algeria",
      "Argentina",
      "Iraq",
      "Afghanistan",
      "Yemen",
      "Canada",
      "Poland",
      "Ukraine",
      "Morocco",
      "Angola",
      "Uzbekistan",
      "Malaysia",
      "Peru",
      "Ghana",
      "Mozambique",
      "Saudi Arabia",
      "Madagascar",
      "Ivory Coast",
       "Nepal",
      "Cameroon",
      "Venezuela",
      "Australia",
      "North Korea",
      "Niger",
      "Mali",
      "Syria",
      "Taiwan",
      "Burkina Faso",
      "Sri Lanka",
      "Malawi",
      "Zambia",
      "Kazakhstan",
      "Chile",
      "Chad",
      "Romania",
      "Somalia",
      "Guatemala",
      "Senegal",
      "Netherlands",
      "Ecuador",
      "Cambodia",
      "Zimbabwe",
      "Guinea",
      "Benin",
      "Rwanda",
      "Burundi",
      "Bolivia",
      "Tunisia",
      "Belgium",
      "Haiti",
      "South Sudan",
      "Jordan",
      "Dominican Republic",
      "Cuba",
      "Czechia",
      "Honduras",
      "United Arab Emirates",
      "Sweden",
      "Portugal",
      "Tajikistan",
      "Papua New Guinea",
      "Azerbaijan",
      "Greece",
      "Hungary",
      "Togo",
      "Israel",
      "Austria",
      "Belarus",
       "Switzerland",
      "Sierra Leone",
      "Laos",
      "Hong Kong (China)",
      "Turkmenistan",
      "Libya",
      "Kyrgyzstan",
      "Paraguay",
      "Nicaragua",
      "Bulgaria",
      "Serbia",
      "El Salvador",
      "Congo",
      "Denmark",
      "Singapore",
      "Lebanon",
      "Finland",
      "Norway",
      "Slovakia",
      "Liberia",
      "Palestine",
      "Ireland",
      "New Zealand",
      "Central African Republic",
      "Costa Rica",
      "Oman",
      "Mauritania",
      "Kuwait",
      "Panama",
      "Croatia",
      "Georgia",
      "Eritrea",
      "Mongolia",
      "Uruguay",
      "Puerto Rico (United States)",
      "Bosnia and Herzegovina",
      "Moldova",
      "Qatar",
      "Namibia",
      "Armenia",
      "Lithuania",
      "Jamaica",
      "Albania",
      "Gambia",
      "Gabon",
      "Botswana",
      "Lesotho",
      "Guinea-Bissau",
      "Slovenia",
      "Latvia",
      "Equatorial Guinea",
      "North Macedonia",
      "Kosovo",
      "Bahrain",
      "Trinidad and Tobago",
      "East Timor",
      "Estonia",
      "Cyprus",
      "Mauritius",
      "Eswatini",
      "Djibouti",
      "Fiji",
      "Réunion (France)",
      "Comoros",
      "Guyana",
      "Solomon Islands",
      "Bhutan",
      "Macao (China)",
      "Luxembourg",
      "Montenegro",
      "Suriname",
      "Western Sahara (disputed)",
      "Malta",
      "Maldives",
      "Cape Verde",
      "Brunei",
      "Belize",
      "Bahamas",
      "Iceland",
      "Guadeloupe (France)",
      "Martinique (France)",
      "Vanuatu",
      "Mayotte (France)",
      "French Guiana (France)",
      "New Caledonia (France)",
      "Barbados",
      "French Polynesia (France)",
      "São Tomé and Príncipe",
      "Samoa",
      "Curaçao (Netherlands)",
      "Saint Lucia",
      "Guam (United States)",
      "Kiribati",
      "Seychelles",
      "Grenada",
      "Micronesia",
      "Tonga",
      "Aruba (Netherlands)",
      "Jersey (United Kingdom)",
      "Saint Vincent and the Grenadines"]
     

  public GetConflicts(): string[]
  {
    return this.RawUsedCountries.filter(c => !this.RawAllCountries.includes(c))
  }
  public async GetCountriesList()
  {
    const allCountriesSnapshot = await getDocs(collection(this._db, this._allCt));
    const allCountries = new Array<string>();
    allCountriesSnapshot.forEach(doc =>
    {
      allCountries.push(doc.data()["Name"]);
    })

    const usedCountriesSnapshot = await getDocs(collection(this._db, this._usedCt));
    const usedCountries = new Array<string>();
    usedCountriesSnapshot.forEach(doc =>
    {
      usedCountries.push(doc.data()["Name"]);
    })

    return allCountries.filter(c => !usedCountries.includes(c)).sort();
  }

}



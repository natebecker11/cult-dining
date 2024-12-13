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

      public CountriesWithFacts = [
        { Name: "India", Fact: "is home to the world's largest democracy." },
        { Name: "China", Fact: "has the world's largest population." },
        { Name: "United States", Fact: "is the third-largest by land area." },
        { Name: "Indonesia", Fact: "is made up of over 17,000 islands." },
        { Name: "Pakistan", Fact: "is home to the world's second-highest peak, K2." },
        { Name: "Nigeria", Fact: "is Africa's most populous nation." },
        { Name: "Brazil", Fact: "is home to the Amazon Rainforest." },
        { Name: "Bangladesh", Fact: "has the world's largest river delta." },
        { Name: "Russia", Fact: "is the largest in the world by land area." },
        { Name: "Mexico", Fact: "is known for its ancient Mayan and Aztec ruins." },
        { Name: "Ethiopia", Fact: "is the only African nation never colonized." },
        { Name: "Japan", Fact: "has more than 6,800 islands." },
        { Name: "Philippines", Fact: "is the world's largest producer of coconuts." },
        { Name: "Egypt", Fact: "is home to the Great Pyramid of Giza, one of the Seven Wonders of the Ancient World." },
        { Name: "DR Congo", Fact: "contains the world's deepest river, the Congo River." },
        { Name: "Vietnam", Fact: "is the world's largest exporter of cashew nuts." },
        { Name: "Iran", Fact: "is famous for its Persian carpets and rugs." },
        { Name: "Turkey", Fact: "spans two continents: Europe and Asia." },
        { Name: "Germany", Fact: "hosts the world's largest beer festival, Oktoberfest." },
        { Name: "Thailand", Fact: "is the only Southeast Asian nation never colonized by a European power." },
        { Name: "United Kingdom", Fact: "has the oldest continuously used parliament in the world." },
        { Name: "Tanzania", Fact: "is home to Mount Kilimanjaro, Africa's highest peak." },
        { Name: "France", Fact: "is the most visited in the world." },
        { Name: "South Africa", Fact: "has three capital cities." },
        { Name: "Italy", Fact: "is home to the smallest nation in the world, Vatican City." },
        { Name: "Kenya", Fact: "is famous for its amazing wildlife safaris." },
        { Name: "Myanmar", Fact: "has the world's largest book, inscribed on stone tablets at Kuthodaw Pagoda." },
        { Name: "Colombia", Fact: "is the world's leading producer of emeralds." },
        { Name: "South Korea", Fact: "is known as the 'Land of Morning Calm.'" },
        { Name: "Sudan", Fact: "has more pyramids than Egypt." },
        { Name: "Uganda", Fact: "is known for its mountain gorillas and beautiful lakes." },
        { Name: "Spain", Fact: "is home to the famous La Tomatina festival." },
        { Name: "Algeria", Fact: "is the largest in Africa by land area." },
        { Name: "Argentina", Fact: "is the birthplace of tango." },
        { Name: "Iraq", Fact: "is home to the ancient Mesopotamian civilization." },
        { Name: "Afghanistan", Fact: "is known for its beautiful blue-tiled mosques." },
        { Name: "Yemen", Fact: "is home to the ancient city of Sana'a, a UNESCO World Heritage Site." },
        { Name: "Canada", Fact: "has the longest coastline in the world." },
        { Name: "Poland", Fact: "is known for its delicious pierogi." },
        { Name: "Ukraine", Fact: "is the largest in Europe by land area." },
        { Name: "Morocco", Fact: "is famous for its vibrant markets and colorful mosaics." },
        { Name: "Angola", Fact: "is rich in oil and diamonds." },
        { Name: "Uzbekistan", Fact: "is known for its stunning Silk Road architecture." },
        { Name: "Malaysia", Fact: "has the world's tallest twin towers, the Petronas Towers." },
        { Name: "Peru", Fact: "is home to Machu Picchu, an ancient Incan city." },
        { Name: "Ghana", Fact: "is known as the Gold Coast due to its gold resources." },
        { Name: "Mozambique", Fact: "is famous for its stunning coastline and seafood." },
        { Name: "Saudi Arabia", Fact: "is home to Mecca, the holiest city in Islam." },
        { Name: "Madagascar", Fact: "is known for its unique biodiversity, including lemurs." },
        { Name: "Ivory Coast", Fact: "is one of the world's largest producers of cocoa." },
        { Name: "Nepal", Fact: "is home to Mount Everest, the world's highest peak." },
        { Name: "Cameroon", Fact: "is known as 'Africa in Miniature' for its diverse geography." },
        { Name: "Venezuela", Fact: "has the world's tallest waterfall, Angel Falls." },
        { Name: "Australia", Fact: "is the only one that is also a continent." },
        { Name: "North Korea", Fact: "is one of the most secretive in the world." },
        { Name: "Niger", Fact: "is named after the Niger River." },
        { Name: "Mali", Fact: "is home to the ancient city of Timbuktu." },
        { Name: "Syria", Fact: "is one of the world's oldest continuously inhabited regions." },
        { Name: "Taiwan", Fact: "is known for its night markets and bubble tea." },
        { Name: "Burkina Faso", Fact: "has a vibrant tradition of storytelling and music." },
        { Name: "Sri Lanka", Fact: "is known for its tea plantations." },
        { Name: "Malawi", Fact: "is nicknamed 'The Warm Heart of Africa.'" },
        { Name: "Zambia", Fact: "is home to Victoria Falls, one of the largest waterfalls in the world." },
        { Name: "Kazakhstan", Fact: "is the largest landlocked country in the world." },
        { Name: "Chile", Fact: "is home to the Atacama Desert, the driest place on Earth." },
        { Name: "Chad", Fact: "is known as 'The Dead Heart of Africa' due to its location in the Sahara Desert." },
        { Name: "Romania", Fact: "is home to the legendary Dracula's Castle in Transylvania." },
        { Name: "Somalia", Fact: "has the longest coastline in mainland Africa." },
        { Name: "Guatemala", Fact: "is known for its ancient Mayan ruins, including Tikal." },
        { Name: "Senegal", Fact: "is known as the 'Gateway to Africa' for its strategic location." },
        { Name: "Netherlands", Fact: "is famous for its tulips and windmills." },
        { Name: "Ecuador", Fact: "is home to the Galápagos Islands." },
        { Name: "Cambodia", Fact: "is home to Angkor Wat, the largest religious monument in the world." },
        { Name: "Zimbabwe", Fact: "is home to the Great Zimbabwe ruins, an ancient city." },
        { Name: "Guinea", Fact: "is a leading producer of bauxite, the main source of aluminum." },
        { Name: "Benin", Fact: "is considered the birthplace of voodoo." },
        { Name: "Rwanda", Fact: "is known as the 'Land of a Thousand Hills.'" },
        { Name: "Burundi", Fact: "is one of the world's poorest, but rich in culture and traditions." },
        { Name: "Bolivia", Fact: "has the world's largest salt flat, Salar de Uyuni." },
        { Name: "Tunisia", Fact: "is home to ancient Carthage and Roman ruins like the Amphitheatre of El Djem." },
        { Name: "Belgium", Fact: "is famous for its chocolates and waffles." },
        { Name: "Haiti", Fact: "was the first independent nation in Latin America and the Caribbean." },
        { Name: "South Sudan", Fact: "is the youngest in the world, gaining independence in 2011." },
        { Name: "Jordan", Fact: "is home to Petra, one of the New Seven Wonders of the World." },
        { Name: "Dominican Republic", Fact: "shares the island of Hispaniola with Haiti." },
        { Name: "Cuba", Fact: "is known for its vintage cars and vibrant music scene." },
        { Name: "Czechia", Fact: "is home to Prague, known as the 'City of a Hundred Spires.'" },
    { Name: "Honduras", Fact: "is part of the Mesoamerican Barrier Reef, the second-largest coral reef in the world." },
    { Name: "United Arab Emirates", Fact: "is home to the Burj Khalifa, the tallest building in the world." },
    { Name: "Sweden", Fact: "is known for its innovation and was the birthplace of brands like IKEA and Volvo." },
    { Name: "Portugal", Fact: "is the oldest nation-state in Europe, established in 1139." },
    { Name: "Tajikistan", Fact: "is home to some of the highest mountains in the world, including the Pamirs." },
    { Name: "Papua New Guinea", Fact: "is one of the most linguistically diverse in the world, with over 800 languages spoken." },
    { Name: "Azerbaijan", Fact: "is known as the 'Land of Fire' due to its natural gas flames." },
    { Name: "Greece", Fact: "is often called the 'Cradle of Western Civilization.'" },
    { Name: "Hungary", Fact: "is famous for its thermal baths and paprika." },
    { Name: "Togo", Fact: "is one of the smallest in Africa but rich in culture and tradition." },
    { Name: "Israel", Fact: "is home to the Dead Sea, the lowest point on Earth." },
    { Name: "Austria", Fact: "is the birthplace of classical composers like Mozart and Beethoven." },
    { Name: "Belarus", Fact: "is known for its vast forests and medieval castles." },
    { Name: "Switzerland", Fact: "is famous for its precision watches and scenic Alps." },
    { Name: "Sierra Leone", Fact: "is named after the Lion Mountains near Freetown." },
    { Name: "Laos", Fact: "is home to the Mekong River and ancient Buddhist temples." },
    { Name: "Hong Kong (China)", Fact: "is known for its skyline and bustling harbor." },
    { Name: "Turkmenistan", Fact: "is home to the 'Door to Hell,' a burning natural gas crater." },
    { Name: "Libya", Fact: "contains some of the most significant ancient Roman ruins." },
    { Name: "Kyrgyzstan", Fact: "is known for its stunning mountain landscapes and nomadic culture." },
    { Name: "Paraguay", Fact: "is one of the two landlocked countries in South America." },
    { Name: "Nicaragua", Fact: "is known as the 'Land of Lakes and Volcanoes.'" },
    { Name: "Bulgaria", Fact: "is home to the oldest continuously inhabited city in Europe, Plovdiv." },
    { Name: "Serbia", Fact: "is known for its vibrant nightlife and historic monasteries." },
    { Name: "El Salvador", Fact: "is the smallest in Central America, known as the 'Land of Volcanoes.'" },
    { Name: "Congo", Fact: "is known for its rainforests and the Congo River, the second-longest river in Africa." },
    { Name: "Denmark", Fact: "is home to the oldest monarchy in Europe and the iconic Little Mermaid statue." },
    { Name: "Singapore", Fact: "is a city-state known for its cleanliness and efficient public transportation." },
    { Name: "Lebanon", Fact: "is home to the ancient city of Byblos, one of the oldest continuously inhabited cities in the world." },
    { Name: "Finland", Fact: "is known as the 'Land of a Thousand Lakes.'" },
    { Name: "Norway", Fact: "is famous for its fjords and the Northern Lights." },
    { Name: "Slovakia", Fact: "has more than 6,000 caves, including UNESCO-listed ice caves." },
    { Name: "Liberia", Fact: "was founded by freed African-American slaves in the 19th century." },
    { Name: "Palestine", Fact: "is home to historic sites like Bethlehem and Jericho." },
    { Name: "Ireland", Fact: "is known for its lush green landscapes and rich mythology." },
    { Name: "New Zealand", Fact: "is famous for its breathtaking scenery featured in the 'Lord of the Rings' films." },
    { Name: "Central African Republic", Fact: "is known for its rich wildlife and the Dzanga-Sangha National Park." },
    { Name: "Costa Rica", Fact: "is known for its biodiversity and being one of the happiest nations in the world." },
    { Name: "Oman", Fact: "is famous for its frankincense and stunning desert landscapes." },
    { Name: "Mauritania", Fact: "is home to the Richat Structure, also known as the 'Eye of the Sahara.'" },
    { Name: "Kuwait", Fact: "has one of the largest oil reserves in the world." },
    { Name: "Panama", Fact: "is famous for the Panama Canal, a vital international shipping route." },
    { Name: "Croatia", Fact: "is known for its stunning Adriatic coastline and medieval towns." },
    { Name: "Georgia", Fact: "is considered the birthplace of wine, with winemaking dating back 8,000 years." },
    { Name: "Eritrea", Fact: "has a unique mix of African and Italian influences in its architecture." },
    { Name: "Mongolia", Fact: "is known for its vast steppes and nomadic culture." },
    { Name: "Uruguay", Fact: "was the first in the world to legalize marijuana nationwide." },
    { Name: "Puerto Rico (United States)", Fact: "is known for its vibrant culture and the El Yunque rainforest." },
    { Name: "Bosnia and Herzegovina", Fact: "is home to the historic Stari Most bridge in Mostar." },
    { Name: "Moldova", Fact: "is known for its excellent wines and underground wine cellars." },
    { Name: "Qatar", Fact: "is set to host major international events in its modern stadiums." },
    { Name: "Namibia", Fact: "is famous for its Namib Desert, one of the oldest deserts in the world." },
    { Name: "Armenia", Fact: "was the first nation to adopt Christianity as a state religion." },
    { Name: "Lithuania", Fact: "was the last pagan nation in Europe before adopting Christianity in 1387." },
    { Name: "Jamaica", Fact: "is the birthplace of reggae music and Bob Marley." },
    { Name: "Albania", Fact: "is known for its unspoiled beaches along the Albanian Riviera." },
    { Name: "Gambia", Fact: "is the smallest in mainland Africa, surrounded by Senegal on three sides." },
    { Name: "Gabon", Fact: "is home to lush rainforests and a rich variety of wildlife." },
    { Name: "Botswana", Fact: "is famous for the Okavango Delta and its elephant population." },
    { Name: "Lesotho", Fact: "is entirely surrounded by South Africa and has a high altitude." },
    { Name: "Guinea-Bissau", Fact: "is known for its archipelago, the Bijagós Islands." },
    { Name: "Slovenia", Fact: "is home to Lake Bled, a picturesque lake with a church on an island." },
    { Name: "Latvia", Fact: "is known for its dense forests and traditional folk music." },
    { Name: "Equatorial Guinea", Fact: "is the only African nation where Spanish is the official language." },
    { Name: "North Macedonia", Fact: "is home to Lake Ohrid, one of Europe's deepest and oldest lakes." },
    { Name: "Kosovo", Fact: "declared independence from Serbia in 2008, making it one of the newest countries in Europe." },
    { Name: "Bahrain", Fact: "is an island nation known for its pearl diving heritage." },
    { Name: "Trinidad and Tobago", Fact: "is the birthplace of calypso music and the steelpan." },
    { Name: "East Timor", Fact: "is one of the youngest in the world, gaining independence in 2002." },
    { Name: "Estonia", Fact: "is known for its advanced digital society and medieval capital, Tallinn." },
    { Name: "Cyprus", Fact: "is famous for its archaeological sites and Aphrodite's Rock." },
    { Name: "Mauritius", Fact: "was the only known home of the now-extinct dodo bird." },
    { Name: "Eswatini", Fact: "is one of the last absolute monarchies in the world." },
    { Name: "Djibouti", Fact: "is home to Lake Assal, one of the saltiest bodies of water on Earth." },
    { Name: "Fiji", Fact: "is known for its stunning coral reefs and clear lagoons." },
    { Name: "Réunion (France)", Fact: "is famous for its volcanic landscapes and Creole culture." },
    { Name: "Comoros", Fact: "is known as the 'Perfume Islands' due to its production of ylang-ylang." },
    { Name: "Guyana", Fact: "is home to Kaieteur Falls, one of the world's most powerful waterfalls." },
    { Name: "Solomon Islands", Fact: "played a significant role in World War II, particularly in the Battle of Guadalcanal." },
    { Name: "Bhutan", Fact: "measures its success by Gross National Happiness instead of GDP." },
    { Name: "Macao (China)", Fact: "is known as the 'Las Vegas of Asia' for its vibrant casino scene." },
    { Name: "Luxembourg", Fact: "is one of the smallest in Europe and is known for its wealth and banking sector." },
    { Name: "Montenegro", Fact: "is known for its stunning Adriatic coastline and medieval villages." },
    { Name: "Suriname", Fact: "is the smallest in South America and known for its diverse culture." },
    { Name: "Western Sahara (disputed)", Fact: "This territory is one of the most sparsely populated regions in the world." },
    { Name: "Malta", Fact: "is known for its ancient temples, some of the oldest free-standing structures in the world." },
    { Name: "Maldives", Fact: "is the lowest and flattest in the world, famous for its overwater bungalows." },
    { Name: "Cape Verde", Fact: "is an island nation known for its Creole Portuguese-African culture and morna music." },
    { Name: "Brunei", Fact: "is a small but wealthy nation thanks to its extensive oil and gas reserves." },
    { Name: "Belize", Fact: "is home to the Belize Barrier Reef, a UNESCO World Heritage Site." },
    { Name: "Bahamas", Fact: "has over 700 islands and is known for its clear turquoise waters." },
    { Name: "Iceland", Fact: "is known as the 'Land of Fire and Ice' due to its volcanoes and glaciers." },
    { Name: "Guadeloupe (France)", Fact: "is a French overseas region known for its butterfly-shaped main islands." },
    { Name: "Martinique (France)", Fact: "is a French overseas region famous for its rum production and volcanic landscapes." },
    { Name: "Vanuatu", Fact: "is known for its active volcanoes and unique bungee-jumping ritual." },
    { Name: "Mayotte (France)", Fact: "is a French overseas region known for its lagoon, one of the largest and deepest in the world." },
    { Name: "French Guiana (France)", Fact: "is home to the European Space Agency's primary launch site." },
    { Name: "New Caledonia (France)", Fact: "is a French overseas territory with the world's second-largest coral reef." },
    { Name: "Barbados", Fact: "is the birthplace of rum and known for its beautiful beaches." },
    { Name: "French Polynesia (France)", Fact: "is famous for its overwater bungalows and clear lagoons." },
    { Name: "São Tomé and Príncipe", Fact: "is Africa's second-smallest nation and known for its chocolate production." },
    { Name: "Samoa", Fact: "is known for its traditional Polynesian culture and lush landscapes." },
    { Name: "Curaçao (Netherlands)", Fact: "is known for its colorful Dutch colonial architecture and diving sites." },
    { Name: "Saint Lucia", Fact: "is famous for the Pitons, two iconic volcanic spires." },
    { Name: "Guam (United States)", Fact: "is a U.S. territory known for its strategic military location and Chamorro culture." },
    { Name: "Kiribati", Fact: "is the only nation to span all four hemispheres." },
    { Name: "Seychelles", Fact: "is an archipelago known for its stunning beaches and unique granite rock formations." },
    { Name: "Grenada", Fact: "is known as the 'Spice Isle' for its production of nutmeg and mace." },
    { Name: "Micronesia", Fact: "consists of more than 600 islands and is known for its ancient Nan Madol ruins." },
    { Name: "Tonga", Fact: "is the only monarchy in the Pacific and was never colonized." },
    { Name: "Aruba (Netherlands)", Fact: "is famous for its white sandy beaches and Dutch-Caribbean culture." },
    { Name: "Jersey (United Kingdom)", Fact: "is known for its historic castles and beautiful coastline." },
    { Name: "Saint Vincent and the Grenadines", Fact: "is known for its sailing culture and volcanic landscapes." }]
     

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

    this._availableCountries = allCountries.filter(c => !usedCountries.includes(c)).sort();

    return this._availableCountries;
  }

  private _availableCountries = new Array<string>();

  public GetGuessingGame(countryName: string): GuessingGameData
  {
    const foundEntry = this.CountriesWithFacts.find(ct => ct.Name == countryName);

    const otherCountries = this._availableCountries.filter(ct => ct != countryName);
    const wrongGuess = otherCountries[Math.floor(Math.random() * otherCountries.length)];


    return {
      Name: countryName,
      Message: "",
      WrongGuess: wrongGuess,
      Fact: foundEntry?.Fact ?? ""
    }
  }
}

export type GuessingGameData =
{
  Name: string,
  Message: string,
  WrongGuess: string,
  Fact: string
}



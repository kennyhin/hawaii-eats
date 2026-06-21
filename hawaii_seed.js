// Seed data parsed from the family's Hawaii eats list.
const SEED_PLACES = [
  {
    "id": "hi-1",
    "country": "Hawaii",
    "name": "Ala Moana Mall",
    "location": "",
    "website": "",
    "notes": "2 food courts (Lanai and Makai Market food court, many restaurants and shops)(good place to hang out and eat. (free parking)",
    "photos": [],
    "cuisine": "Food Court / Variety"
  },
  {
    "id": "hi-2",
    "country": "Hawaii",
    "name": "Shirakira",
    "location": "",
    "website": "",
    "notes": "Japanese Village Walk, not open back yet after pandemic",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-3",
    "country": "Hawaii",
    "name": "STIX Asia",
    "location": "",
    "website": "",
    "notes": "Waikiki, across from little stand (Island Vantage Shave Ice)",
    "photos": [],
    "cuisine": "Asian Fusion"
  },
  {
    "id": "hi-4",
    "country": "Hawaii",
    "name": "Mama pho",
    "location": "",
    "website": "",
    "notes": "near our house and Ala Moana Mall",
    "photos": [],
    "cuisine": "Vietnamese"
  },
  {
    "id": "hi-5",
    "country": "Hawaii",
    "name": "Pig and Lady",
    "location": "",
    "website": "",
    "notes": "closed",
    "photos": [],
    "cuisine": "Vietnamese"
  },
  {
    "id": "hi-6",
    "country": "Hawaii",
    "name": "Di An Zo",
    "location": "",
    "website": "",
    "notes": "Pho",
    "photos": [],
    "cuisine": "Vietnamese"
  },
  {
    "id": "hi-7",
    "country": "Hawaii",
    "name": "Moana Cafe",
    "location": "",
    "website": "",
    "notes": "in the Koko Marina by our house) (good breakfast place and good local moco with short ribs instead of hanburger patties",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-8",
    "country": "Hawaii",
    "name": "Taka's Box Lunch",
    "location": "",
    "website": "",
    "notes": "Breakfast and Brunch) (NEW",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-9",
    "country": "Hawaii",
    "name": "Konos",
    "location": "",
    "website": "",
    "notes": "by Leonards, parking in a very small alley",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-10",
    "country": "Hawaii",
    "name": "Tiki Grills and Bar",
    "location": "",
    "website": "",
    "notes": "across from Kiddie Pool by the zoo at Waikiki.",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-11",
    "country": "Hawaii",
    "name": "Herringbone",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Seafood"
  },
  {
    "id": "hi-12",
    "country": "Hawaii",
    "name": "California Pizza Kitchen",
    "location": "",
    "website": "",
    "notes": "In Ka Mall",
    "photos": [],
    "cuisine": "Pizza"
  },
  {
    "id": "hi-13",
    "country": "Hawaii",
    "name": "JJ Dolan",
    "location": "",
    "website": "",
    "notes": "Pizza",
    "photos": [],
    "cuisine": "Pizza"
  },
  {
    "id": "hi-14",
    "country": "Hawaii",
    "name": "Olive Garden",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Italian"
  },
  {
    "id": "hi-15",
    "country": "Hawaii",
    "name": "Kona Brewing Co",
    "location": "",
    "website": "",
    "notes": "Koko Marina",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-16",
    "country": "Hawaii",
    "name": "Basalt",
    "location": "",
    "website": "",
    "notes": "Expensive, has offer charcoal hot bread",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-17",
    "country": "Hawaii",
    "name": "Rigo",
    "location": "",
    "website": "",
    "notes": "Italian",
    "photos": [],
    "cuisine": "Italian"
  },
  {
    "id": "hi-18",
    "country": "Hawaii",
    "name": "Bale Sandwich",
    "location": "",
    "website": "",
    "notes": "By our house.",
    "photos": [],
    "cuisine": "Vietnamese"
  },
  {
    "id": "hi-19",
    "country": "Hawaii",
    "name": "Insomnia Vietnamese sandwich and coffee",
    "location": "",
    "website": "",
    "notes": "NEW",
    "photos": [],
    "cuisine": "Vietnamese"
  },
  {
    "id": "hi-20",
    "country": "Hawaii",
    "name": "Teddy Burger",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Burgers"
  },
  {
    "id": "hi-21",
    "country": "Hawaii",
    "name": "McDonald's",
    "location": "",
    "website": "",
    "notes": "Near our house.",
    "photos": [],
    "cuisine": "Fast Food"
  },
  {
    "id": "hi-22",
    "country": "Hawaii",
    "name": "Canes",
    "location": "",
    "website": "",
    "notes": "Near our house.",
    "photos": [],
    "cuisine": "Fast Food"
  },
  {
    "id": "hi-23",
    "country": "Hawaii",
    "name": "Aunty Ramen",
    "location": "",
    "website": "",
    "notes": "Out in Kapolei, 45 minutes drive from our house",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-24",
    "country": "Hawaii",
    "name": "Tanaka Ramen",
    "location": "",
    "website": "",
    "notes": "one in Pear-ridge and Ala Moana mall) (not bad ramen) (good appetizers",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-25",
    "country": "Hawaii",
    "name": "Nakamura Ramen",
    "location": "",
    "website": "",
    "notes": "best oxtail ramen soup) (good Gyoza too",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-26",
    "country": "Hawaii",
    "name": "Wagaya Ramen Place",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-27",
    "country": "Hawaii",
    "name": "Marukame Udon",
    "location": "",
    "website": "",
    "notes": "2 locations, always long line",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-28",
    "country": "Hawaii",
    "name": "Side Street Hawaiian",
    "location": "",
    "website": "",
    "notes": "family style, all food comes in big portions",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-29",
    "country": "Hawaii",
    "name": "Zippys Hawaii Cafe",
    "location": "",
    "website": "",
    "notes": "only try one",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-30",
    "country": "Hawaii",
    "name": "Strait",
    "location": "",
    "website": "",
    "notes": "Breakfast /Bar",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-31",
    "country": "Hawaii",
    "name": "Kapiolani Sea Food Chinese",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-32",
    "country": "Hawaii",
    "name": "Kan Sushi",
    "location": "",
    "website": "",
    "notes": "all you can eat",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-33",
    "country": "Hawaii",
    "name": "Sushi Rinka",
    "location": "",
    "website": "",
    "notes": "Japanese",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-34",
    "country": "Hawaii",
    "name": "Doraku Sushi",
    "location": "",
    "website": "",
    "notes": "Royal Hawaiian 3 fl, escalator up by the Island vintage shave ice",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-35",
    "country": "Hawaii",
    "name": "KaitenSushi Ginza Onodera",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-36",
    "country": "Hawaii",
    "name": "Tonkatsu Tamafuji",
    "location": "",
    "website": "",
    "notes": "Deep Fried pork) (long wait",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-37",
    "country": "Hawaii",
    "name": "Aik Japanese",
    "location": "",
    "website": "",
    "notes": "Expensive) (next to Happy Day Chinese Restaurant",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-38",
    "country": "Hawaii",
    "name": "Han No Daidokoro",
    "location": "",
    "website": "",
    "notes": "Wagyu Japanese style Yakiniku. Expensive, $120 per person set meal, very good quality meat but did not feel full after dinner.",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-39",
    "country": "Hawaii",
    "name": "Seoul Tofu House",
    "location": "",
    "website": "",
    "notes": "across from Marukame Udon",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-40",
    "country": "Hawaii",
    "name": "Han Gang Korean BBQ",
    "location": "",
    "website": "",
    "notes": "Near Ala Moana and near our house by the King's church. Good Kalbi, lady gave son a free coke. Expensive but good meat quality.",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-41",
    "country": "Hawaii",
    "name": "So Gong Gong",
    "location": "",
    "website": "",
    "notes": "Korean by Walmart",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-42",
    "country": "Hawaii",
    "name": "YYK Grab and Go Dim Sum",
    "location": "",
    "website": "",
    "notes": "at Ala Moana in Lanai food court",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-43",
    "country": "Hawaii",
    "name": "Lanai Food Court",
    "location": "",
    "website": "",
    "notes": "in the Ala Moana Mall",
    "photos": [],
    "cuisine": "Food Court / Variety"
  },
  {
    "id": "hi-44",
    "country": "Hawaii",
    "name": "Gina Korean BBQ",
    "location": "",
    "website": "",
    "notes": "Togo only) affordable, ribs and side dishes good",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-45",
    "country": "Hawaii",
    "name": "Sura Korean BBQ",
    "location": "",
    "website": "",
    "notes": "all you can eat",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-46",
    "country": "Hawaii",
    "name": "Gen Korean",
    "location": "",
    "website": "",
    "notes": "Ala Moana Mall) (all you can eat) (went in 7/2024, not good any more",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-47",
    "country": "Hawaii",
    "name": "Chong Qing Hot Pot",
    "location": "",
    "website": "",
    "notes": "In the Ward Center, all you can eat, used to be Little Sheep Hot Pot. Individual pot, order from menu, good meat quality. Another newer location in Waikiki across from Ilikai Hotel near Hilton Hawaiian Village.",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-48",
    "country": "Hawaii",
    "name": "Ichiriki Japanese Shabu",
    "location": "",
    "website": "",
    "notes": "Hot Pot ) (park in the back, pay for by putting money in the slot box.",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-49",
    "country": "Hawaii",
    "name": "Shibuya Hot Pot",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-50",
    "country": "Hawaii",
    "name": "Giovanni's Shrimp and Dada Chicken",
    "location": "",
    "website": "",
    "notes": "In the H-Mart Korean Market food court. Kids like Dada chicken, Kenny likes Giovanni's shrimp.",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-51",
    "country": "Hawaii",
    "name": "Kickin Kitchen Crawfish",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Seafood"
  },
  {
    "id": "hi-52",
    "country": "Hawaii",
    "name": "Jade Dynasty Chinese Restaurant",
    "location": "",
    "website": "",
    "notes": "In Ala Moana Mall, upstairs. Good dim sum.",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-53",
    "country": "Hawaii",
    "name": "Lobster King",
    "location": "",
    "website": "",
    "notes": "Chinese",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-54",
    "country": "Hawaii",
    "name": "Paradise Poke",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-55",
    "country": "Hawaii",
    "name": "Heavenly Poke",
    "location": "",
    "website": "",
    "notes": "By our house, next to Maili Thai Restaurant.",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-56",
    "country": "Hawaii",
    "name": "Oyster Hale",
    "location": "",
    "website": "",
    "notes": "for goh goh and kiene",
    "photos": [],
    "cuisine": "Seafood"
  },
  {
    "id": "hi-57",
    "country": "Hawaii",
    "name": "Istanbul",
    "location": "",
    "website": "",
    "notes": "Mediterranean, next to Han No Daidokora. Went to lunch and sun on self trip 12/2023.",
    "photos": [],
    "cuisine": "Mediterranean"
  },
  {
    "id": "hi-58",
    "country": "Hawaii",
    "name": "Musi I Cafe",
    "location": "",
    "website": "",
    "notes": "Spam Musubi (in the Ala Moana Mall)",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-59",
    "country": "Hawaii",
    "name": "Katakana Ali'i Mall",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-60",
    "country": "Hawaii",
    "name": "Ginza Brain",
    "location": "",
    "website": "",
    "notes": "Tonkatsu (Chicken Katsu)",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-61",
    "country": "Hawaii",
    "name": "Et. Al",
    "location": "",
    "website": "",
    "notes": "Lunch/Breakfast",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-62",
    "country": "Hawaii",
    "name": "Moku",
    "location": "",
    "website": "",
    "notes": "Burgers and Pizza",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-64",
    "country": "Hawaii",
    "name": "Rokaru",
    "location": "",
    "website": "",
    "notes": "Hot Pot",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-65",
    "country": "Hawaii",
    "name": "Polynesian Cultural Center",
    "location": "",
    "website": "",
    "notes": "Food Trucks",
    "photos": [],
    "cuisine": "Food Court / Variety"
  },
  {
    "id": "hi-66",
    "country": "Hawaii",
    "name": "Pearl Ridge Night Market",
    "location": "",
    "website": "",
    "notes": "Saturday Night",
    "photos": [],
    "cuisine": "Food Court / Variety"
  },
  {
    "id": "hi-67",
    "country": "Hawaii",
    "name": "Honolulu Night Market",
    "location": "",
    "website": "",
    "notes": "Friday Night",
    "photos": [],
    "cuisine": "Food Court / Variety"
  },
  {
    "id": "hi-68",
    "country": "Hawaii",
    "name": "Wai Kai Night Market and Restaurant",
    "location": "",
    "website": "",
    "notes": "Thursday night, the wave spot.",
    "photos": [],
    "cuisine": "Food Court / Variety"
  },
  {
    "id": "hi-69",
    "country": "Hawaii",
    "name": "Mountain Magic Shave ice",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-70",
    "country": "Hawaii",
    "name": "Ululating",
    "location": "",
    "website": "",
    "notes": "Shave Ice (owner moved from Maui to open) Kenny, Kien, Kids first time and love it.",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-71",
    "country": "Hawaii",
    "name": "Mr. T Cafe",
    "location": "",
    "website": "",
    "notes": "Avery favorite place",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-72",
    "country": "Hawaii",
    "name": "Cow Cow",
    "location": "",
    "website": "",
    "notes": "Boba",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-73",
    "country": "Hawaii",
    "name": "Frost City",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-74",
    "country": "Hawaii",
    "name": "Leonards Bakery",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Bakery"
  },
  {
    "id": "hi-75",
    "country": "Hawaii",
    "name": "Lilihua Bakery",
    "location": "",
    "website": "",
    "notes": "Ala Moana Mall ) Lanai food court (another part of the food court in Ala Moana Mall",
    "photos": [],
    "cuisine": "Bakery"
  },
  {
    "id": "hi-76",
    "country": "Hawaii",
    "name": "Island Vintage Shave Ice",
    "location": "",
    "website": "",
    "notes": "In Waikiki, a small hut on the walk path.",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-77",
    "country": "Hawaii",
    "name": "Waiola Shave ice",
    "location": "",
    "website": "",
    "notes": "by main Leonard's",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-78",
    "country": "Hawaii",
    "name": "Dave ice cream",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-79",
    "country": "Hawaii",
    "name": "Waffle and Berry",
    "location": "",
    "website": "",
    "notes": "NEW",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-81",
    "country": "Hawaii",
    "name": "Kanoya Sushi",
    "location": "",
    "website": "",
    "notes": "Name has changed. Went on a trip with Lilly, Kayla and Roxus too. In 7/2023 we ordered a sushi sashimi combo, it came out on a boat with smoke coming out. On 7/2024 with Kenny we ordered a sushi sashimi combo, it came out with a jungle scene with stairs and smoke.",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-82",
    "country": "Hawaii",
    "name": "The Lookout",
    "location": "",
    "website": "",
    "notes": "restaurant out in Wai Kai in Eva Beach, there is a big night market across from restaurant.",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-83",
    "country": "Hawaii",
    "name": "Saigon Grill",
    "location": "",
    "website": "",
    "notes": "Food truck behind Sura Korean restaurant, next to 24 Hour Fitness, eat outside. We tried scallop topped with peanuts, fried shallots, Vietnamese herbs and butter. Walked over after dinner from Kanoya Sushi.",
    "photos": [],
    "cuisine": "Vietnamese"
  },
  {
    "id": "hi-84",
    "country": "Hawaii",
    "name": "Heavenly Hawaii Kai",
    "location": "",
    "website": "",
    "notes": "In the Koko Marina, same center as Moana Cafe",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-85",
    "country": "Hawaii",
    "name": "The Alley Restaurant",
    "location": "",
    "website": "",
    "notes": "At Aiea bowling alley. Food not bad, fried chicken is good.",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-86",
    "country": "Hawaii",
    "name": "Harbor Place",
    "location": "",
    "website": "",
    "notes": "Chinese restaurant, dim sum and dinner. Nai Wong bao for P. (Koko Marina)",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-87",
    "country": "Hawaii",
    "name": "Duck Lee",
    "location": "",
    "website": "",
    "notes": "Chinese Express, not bad roasted duck. Same center as Gina BBQ Korean.",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-88",
    "country": "Hawaii",
    "name": "Million Restaurant",
    "location": "",
    "website": "",
    "notes": "Korean) (son and Kayla like) (we not so much",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-89",
    "country": "Hawaii",
    "name": "Blue water shrimp and seafood food truck",
    "location": "",
    "website": "",
    "notes": "",
    "photos": [],
    "cuisine": "Seafood"
  },
  {
    "id": "hi-91",
    "country": "Hawaii",
    "name": "Tropic",
    "location": "",
    "website": "",
    "notes": "outside beach Waikiki) eat with son first time in HI",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-92",
    "country": "Hawaii",
    "name": "Nori Bar Hawaii",
    "location": "",
    "website": "",
    "notes": "next to Ala Moana",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-93",
    "country": "Hawaii",
    "name": "Harbor Village Cuisine",
    "location": "",
    "website": "",
    "notes": "Koko Marina Shopping Center, by Walgreens",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-94",
    "country": "Hawaii",
    "name": "Daley Burger",
    "location": "",
    "website": "",
    "notes": "Chinatown",
    "photos": [],
    "cuisine": "Burgers"
  }
];

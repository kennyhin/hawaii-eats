// Seed data parsed from the family's Hawaii eats list.
// Bump this whenever SEED_PLACES changes so browsers with cached
// localStorage data pick up the update instead of staying stale.
const SEED_VERSION = 2;
const SEED_PLACES = [
  {
    "id": "hi-1",
    "country": "Hawaii",
    "name": "Ala Moana Mall",
    "location": "1450 Ala Moana Blvd, Honolulu, HI 96814",
    "website": "https://www.alamoanacenter.com/",
    "notes": "2 food courts (Lanai and Makai Market food court, many restaurants and shops)(good place to hang out and eat. (free parking)",
    "photos": [],
    "cuisine": "Food Court / Variety"
  },
  {
    "id": "hi-2",
    "country": "Hawaii",
    "name": "Shirakira",
    "location": "1450 Ala Moana Blvd, Ste 1360, Honolulu, HI 96814",
    "website": "https://www.shirokiya.com/",
    "notes": "Japanese Village Walk, not open back yet after pandemic",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-3",
    "country": "Hawaii",
    "name": "STIX Asia",
    "location": "2250 Kalakaua Ave, Lower Level 100, Honolulu, HI 96815",
    "website": "https://stixasia.com/",
    "notes": "Waikiki, across from little stand (Island Vantage Shave Ice)",
    "photos": [],
    "cuisine": "Asian Fusion"
  },
  {
    "id": "hi-4",
    "country": "Hawaii",
    "name": "Mama pho",
    "location": "820 W Hind Dr, Unit 111, Honolulu, HI 96821",
    "website": "https://www.mamapho.biz/",
    "notes": "near our house and Ala Moana Mall",
    "photos": [],
    "cuisine": "Vietnamese"
  },
  {
    "id": "hi-5",
    "country": "Hawaii",
    "name": "Pig and Lady",
    "location": "3650 Waialae Ave, Honolulu, HI 96816",
    "website": "https://thepigandthelady.com/",
    "notes": "closed",
    "photos": [],
    "cuisine": "Vietnamese"
  },
  {
    "id": "hi-6",
    "country": "Hawaii",
    "name": "Di An Zo",
    "location": "1060 Auahi St, Ste 5, Honolulu, HI 96814",
    "website": "https://andidzohawaii.com/",
    "notes": "Pho",
    "photos": [],
    "cuisine": "Vietnamese"
  },
  {
    "id": "hi-7",
    "country": "Hawaii",
    "name": "Moana Cafe",
    "location": "7192 Kalanianaole Hwy, Ste D-101, Honolulu, HI 96825",
    "website": "http://www.moenacafe.com/",
    "notes": "in the Koko Marina by our house) (good breakfast place and good local moco with short ribs instead of hanburger patties",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-8",
    "country": "Hawaii",
    "name": "Taka's Box Lunch",
    "location": "830 Mapunapuna St, Honolulu, HI 96819",
    "website": "https://www.facebook.com/Takasboxlunch/",
    "notes": "Breakfast and Brunch) (NEW",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-9",
    "country": "Hawaii",
    "name": "Konos",
    "location": "945 Kapahulu Ave, Honolulu, HI 96816",
    "website": "https://konosnorthshore.com/",
    "notes": "by Leonards, parking in a very small alley",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-10",
    "country": "Hawaii",
    "name": "Tiki Grills and Bar",
    "location": "2570 Kalakaua Ave, Honolulu, HI 96815",
    "website": "https://www.tikis.com/",
    "notes": "across from Kiddie Pool by the zoo at Waikiki.",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-11",
    "country": "Hawaii",
    "name": "Herringbone",
    "location": "2330 Kalakaua Ave, Honolulu, HI 96815",
    "website": "https://www.herringboneeats.com",
    "notes": "",
    "photos": [],
    "cuisine": "Seafood"
  },
  {
    "id": "hi-12",
    "country": "Hawaii",
    "name": "California Pizza Kitchen",
    "location": "1450 Ala Moana Blvd, Honolulu, HI 96814",
    "website": "https://www.cpk.com/locations/california-pizza-kitchen-ala-moana",
    "notes": "In Ka Mall",
    "photos": [],
    "cuisine": "Pizza"
  },
  {
    "id": "hi-13",
    "country": "Hawaii",
    "name": "JJ Dolan",
    "location": "1147 Bethel St, Honolulu, HI 96813",
    "website": "https://jdolans.com/",
    "notes": "Pizza",
    "photos": [],
    "cuisine": "Pizza"
  },
  {
    "id": "hi-14",
    "country": "Hawaii",
    "name": "Olive Garden",
    "location": "1450 Ala Moana Blvd, Space 3253, Honolulu, HI 96814",
    "website": "https://www.olivegardenhawaii.com/",
    "notes": "",
    "photos": [],
    "cuisine": "Italian"
  },
  {
    "id": "hi-15",
    "country": "Hawaii",
    "name": "Kona Brewing Co",
    "location": "7192 Kalanianaole Hwy, Honolulu, HI 96825",
    "website": "https://konabrewinghawaii.com/",
    "notes": "Koko Marina",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-16",
    "country": "Hawaii",
    "name": "Basalt",
    "location": "2255 Kuhio Ave, Honolulu, HI 96815",
    "website": "https://www.basaltwaikiki.com/",
    "notes": "Expensive, has offer charcoal hot bread",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-17",
    "country": "Hawaii",
    "name": "Rigo",
    "location": "885 Kapahulu Ave, Honolulu, HI 96816",
    "website": "https://rigohawaii.com",
    "notes": "Italian",
    "photos": [],
    "cuisine": "Italian"
  },
  {
    "id": "hi-18",
    "country": "Hawaii",
    "name": "Bale Sandwich",
    "location": "377 Keahole St, Honolulu, HI 96825",
    "website": "https://www.facebook.com/balesandwichhonolulu",
    "notes": "By our house.",
    "photos": [],
    "cuisine": "Vietnamese"
  },
  {
    "id": "hi-19",
    "country": "Hawaii",
    "name": "Insomnia Vietnamese sandwich and coffee",
    "location": "669 Auahi St, Honolulu, HI 96813",
    "website": "https://saltatkakaako.com/portfolio/insomnia/",
    "notes": "NEW",
    "photos": [],
    "cuisine": "Vietnamese"
  },
  {
    "id": "hi-20",
    "country": "Hawaii",
    "name": "Teddy Burger",
    "location": "7192 Kalaniana'ole Hwy, Ste E124, Honolulu, HI 96825",
    "website": "https://www.teddysbb.com/",
    "notes": "",
    "photos": [],
    "cuisine": "Burgers"
  },
  {
    "id": "hi-21",
    "country": "Hawaii",
    "name": "McDonald's",
    "location": "",
    "website": "https://www.mcdonalds.com/us/en-us.html",
    "notes": "Near our house.",
    "photos": [],
    "cuisine": "Fast Food"
  },
  {
    "id": "hi-22",
    "country": "Hawaii",
    "name": "Canes",
    "location": "",
    "website": "https://www.raisingcanes.com/",
    "notes": "Near our house.",
    "photos": [],
    "cuisine": "Fast Food"
  },
  {
    "id": "hi-23",
    "country": "Hawaii",
    "name": "Aunty Ramen",
    "location": "91-5431 Kapolei Pkwy, Ste 426, Kapolei, HI 96707",
    "website": "https://auntys-hotpot-house.restaurants-world.net/",
    "notes": "Out in Kapolei, 45 minutes drive from our house",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-24",
    "country": "Hawaii",
    "name": "Tanaka Ramen",
    "location": "1450 Ala Moana Blvd, Honolulu, HI 96814",
    "website": "https://www.tanakaramen.com/",
    "notes": "one in Pear-ridge and Ala Moana mall) (not bad ramen) (good appetizers",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-25",
    "country": "Hawaii",
    "name": "Nakamura Ramen",
    "location": "2141 Kalakaua Ave #1, Honolulu, HI 96815",
    "website": "https://ramen-nakamura.com/",
    "notes": "best oxtail ramen soup) (good Gyoza too",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-26",
    "country": "Hawaii",
    "name": "Wagaya Ramen Place",
    "location": "2080 S King St, Honolulu, HI 96826",
    "website": "https://wagayahawaii.com/",
    "notes": "",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-27",
    "country": "Hawaii",
    "name": "Marukame Udon",
    "location": "2310 Kuhio Ave, Ste 124, Honolulu, HI 96815",
    "website": "https://www.marugameudon.com/",
    "notes": "2 locations, always long line",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-28",
    "country": "Hawaii",
    "name": "Side Street Hawaiian",
    "location": "614 Kapahulu Ave Ste 100, Honolulu, HI 96815",
    "website": "https://sidestreetinn.com/",
    "notes": "family style, all food comes in big portions",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-29",
    "country": "Hawaii",
    "name": "Zippys Hawaii Cafe",
    "location": "7192 Kalanianoale Hwy, Honolulu, HI 96825",
    "website": "https://www.zippys.com/",
    "notes": "only try one",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-30",
    "country": "Hawaii",
    "name": "Strait",
    "location": "1060 Auahi St #4, Honolulu, HI 96814",
    "website": "https://www.straitshawaii.com/",
    "notes": "Breakfast /Bar",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-31",
    "country": "Hawaii",
    "name": "Kapiolani Sea Food Chinese",
    "location": "1538 Kapiolani Blvd #107, Honolulu, HI 96814",
    "website": "https://www.facebook.com/p/Kapiolani-Seafood-Restaurant-%E9%86%89%E9%96%8B%E5%BF%83%E6%B5%B7%E9%AE%AE%E9%85%92%E5%AE%B6-100088723302479/",
    "notes": "",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-32",
    "country": "Hawaii",
    "name": "Kan Sushi",
    "location": "1910 Ala Moana Blvd, Ste 2, Honolulu, HI 96815",
    "website": "https://kan-sushi.com/",
    "notes": "all you can eat",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-33",
    "country": "Hawaii",
    "name": "Sushi Rinka",
    "location": "1001 Queen St #105, Honolulu, HI 96814",
    "website": "https://rinkahawaii.com/",
    "notes": "Japanese",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-34",
    "country": "Hawaii",
    "name": "Doraku Sushi",
    "location": "2233 Kalakaua Ave, Ste 304, Honolulu, HI 96815",
    "website": "https://dorakusushi.com/waikiki/",
    "notes": "Royal Hawaiian 3 fl, escalator up by the Island vintage shave ice",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-35",
    "country": "Hawaii",
    "name": "KaitenSushi Ginza Onodera",
    "location": "2700 S King St, Honolulu, HI 96826",
    "website": "https://www.sushionodera.com/kaiten-sushi-hawaii",
    "notes": "",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-36",
    "country": "Hawaii",
    "name": "Tonkatsu Tamafuji",
    "location": "449 Kapahulu Ave, Ste 203, Honolulu, HI 96815",
    "website": "https://onolicioushawaii.com/tonkatsu-tamafuji/",
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
    "location": "1108 Auahi St, Ste 150, Honolulu, HI 96814",
    "website": "https://hannodaidokoro.com/",
    "notes": "Wagyu Japanese style Yakiniku. Expensive, $120 per person set meal, very good quality meat but did not feel full after dinner.",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-39",
    "country": "Hawaii",
    "name": "Seoul Tofu House",
    "location": "2299 Kuhio Ave, Space C, Honolulu, HI 96815",
    "website": "https://seoultofuhouse.business.site/",
    "notes": "across from Marukame Udon",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-40",
    "country": "Hawaii",
    "name": "Han Gang Korean BBQ",
    "location": "5730 Kalanianaole Hwy, Honolulu, HI 96821",
    "website": "https://www.hangangkoreanbbq.com/",
    "notes": "Near Ala Moana and near our house by the King's church. Good Kalbi, lady gave son a free coke. Expensive but good meat quality.",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-41",
    "country": "Hawaii",
    "name": "So Gong Gong",
    "location": "745 Keeaumoku St #105, Honolulu, HI 96814",
    "website": "https://www.sogongdong.com/",
    "notes": "Korean by Walmart",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-42",
    "country": "Hawaii",
    "name": "YYK Grab and Go Dim Sum",
    "location": "1450 Ala Moana Blvd, Honolulu, HI 96814",
    "website": "https://yykdimsum.com/",
    "notes": "at Ala Moana in Lanai food court",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-43",
    "country": "Hawaii",
    "name": "Lanai Food Court",
    "location": "1450 Ala Moana Blvd, Honolulu, HI 96814",
    "website": "https://www.alamoanacenter.com/",
    "notes": "in the Ala Moana Mall",
    "photos": [],
    "cuisine": "Food Court / Variety"
  },
  {
    "id": "hi-44",
    "country": "Hawaii",
    "name": "Gina Korean BBQ",
    "location": "2919 Kapiolani Blvd, Honolulu, HI 96826",
    "website": "https://ginasbbq.com/",
    "notes": "Togo only) affordable, ribs and side dishes good",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-45",
    "country": "Hawaii",
    "name": "Sura Korean BBQ",
    "location": "1726 Kapiolani Blvd #101, Honolulu, HI 96814",
    "website": "https://www.surahawaii.com/",
    "notes": "all you can eat",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-46",
    "country": "Hawaii",
    "name": "Gen Korean",
    "location": "1450 Ala Moana Blvd, Ste 4250, Honolulu, HI 96814",
    "website": "https://www.genkoreanbbq.com/",
    "notes": "Ala Moana Mall) (all you can eat) (went in 7/2024, not good any more",
    "photos": [],
    "cuisine": "Korean"
  },
  {
    "id": "hi-47",
    "country": "Hawaii",
    "name": "Chong Qing Hot Pot",
    "location": "1778 Ala Moana Blvd, 2nd Floor, Honolulu, HI 96815",
    "website": "https://chongqinghotpothawaii.com/",
    "notes": "In the Ward Center, all you can eat, used to be Little Sheep Hot Pot. Individual pot, order from menu, good meat quality. Another newer location in Waikiki across from Ilikai Hotel near Hilton Hawaiian Village.",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-48",
    "country": "Hawaii",
    "name": "Ichiriki Japanese Shabu",
    "location": "510 Piikoi St, Honolulu, HI 96814",
    "website": "https://www.ichirikinabe.com/",
    "notes": "Hot Pot ) (park in the back, pay for by putting money in the slot box.",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-49",
    "country": "Hawaii",
    "name": "Shibuya Hot Pot",
    "location": "1450 Ala Moana Blvd, Honolulu, HI 96814",
    "website": "https://www.shabuyarestaurant.com/",
    "notes": "",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-50",
    "country": "Hawaii",
    "name": "Giovanni's Shrimp and Dada Chicken",
    "location": "458 Keawe St, 2nd Floor, Honolulu, HI 96813",
    "website": "https://giovannisshrimptruck.com/",
    "notes": "In the H-Mart Korean Market food court. Kids like Dada chicken, Kenny likes Giovanni's shrimp.",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-51",
    "country": "Hawaii",
    "name": "Kickin Kitchen Crawfish",
    "location": "655 Keeaumoku St, Ste 101, Honolulu, HI 96814",
    "website": "https://www.kickin-kajun.com/",
    "notes": "",
    "photos": [],
    "cuisine": "Seafood"
  },
  {
    "id": "hi-52",
    "country": "Hawaii",
    "name": "Jade Dynasty Chinese Restaurant",
    "location": "1450 Ala Moana Blvd, Fl 4, Ste 4220, Honolulu, HI 96814",
    "website": "https://jadedynastyhawaii.com/",
    "notes": "In Ala Moana Mall, upstairs. Good dim sum.",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-53",
    "country": "Hawaii",
    "name": "Lobster King",
    "location": "1380 S King St, Honolulu, HI 96814",
    "website": "https://thelobsterking.net/",
    "notes": "Chinese",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-54",
    "country": "Hawaii",
    "name": "Paradise Poke",
    "location": "1613 Nuuanu Ave, Honolulu, HI 96817",
    "website": "https://paradisepokenuuanu.com/",
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
    "location": "346 Lewers St, Honolulu, HI 96815",
    "website": "https://www.oysterhale.com/",
    "notes": "for goh goh and kiene",
    "photos": [],
    "cuisine": "Seafood"
  },
  {
    "id": "hi-57",
    "country": "Hawaii",
    "name": "Istanbul",
    "location": "1108 Auahi St, Ste 152, Honolulu, HI 96814",
    "website": "https://www.istanbulhawaii.com/",
    "notes": "Mediterranean, next to Han No Daidokora. Went to lunch and sun on self trip 12/2023.",
    "photos": [],
    "cuisine": "Mediterranean"
  },
  {
    "id": "hi-58",
    "country": "Hawaii",
    "name": "Musi I Cafe",
    "location": "1450 Ala Moana Blvd, #2280, Honolulu, HI 96814",
    "website": "https://www.iyasumehawaii.com",
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
    "location": "255 Beach Walk, Honolulu, HI 96815",
    "website": "https://ginzabairinhawaii.com/",
    "notes": "Tonkatsu (Chicken Katsu)",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-61",
    "country": "Hawaii",
    "name": "Et. Al",
    "location": "4210 Waialae Ave, Ste 401, Honolulu, HI 96816",
    "website": "https://etalhawaii.com/",
    "notes": "Lunch/Breakfast",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-62",
    "country": "Hawaii",
    "name": "Moku",
    "location": "660 Ala Moana Blvd, No. 145, Honolulu, HI 96813",
    "website": "https://www.mokukitchen.com/",
    "notes": "Burgers and Pizza",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-64",
    "country": "Hawaii",
    "name": "Rokaru",
    "location": "98-1277 Kaahumanu St, Ste 112, Aiea, HI 96701",
    "website": "https://rokaruhi.com",
    "notes": "Hot Pot",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-65",
    "country": "Hawaii",
    "name": "Polynesian Cultural Center",
    "location": "55-370 Kamehameha Hwy, Laie, HI 96762",
    "website": "https://www.polynesia.com/",
    "notes": "Food Trucks",
    "photos": [],
    "cuisine": "Food Court / Variety"
  },
  {
    "id": "hi-66",
    "country": "Hawaii",
    "name": "Pearl Ridge Night Market",
    "location": "98-1005 Moanalua Rd, Aiea, HI 96701",
    "website": "https://pearlridgeonline.com/village-market",
    "notes": "Saturday Night",
    "photos": [],
    "cuisine": "Food Court / Variety"
  },
  {
    "id": "hi-67",
    "country": "Hawaii",
    "name": "Honolulu Night Market",
    "location": "1011 Ala Moana Blvd, Honolulu, HI 96814",
    "website": "https://www.instagram.com/honoluluharbornights/",
    "notes": "Friday Night",
    "photos": [],
    "cuisine": "Food Court / Variety"
  },
  {
    "id": "hi-68",
    "country": "Hawaii",
    "name": "Wai Kai Night Market and Restaurant",
    "location": "91-1621 Keoneula Blvd, Ewa Beach, HI 96706",
    "website": "https://www.onogrindzandmakeke.com/",
    "notes": "Thursday night, the wave spot.",
    "photos": [],
    "cuisine": "Food Court / Variety"
  },
  {
    "id": "hi-69",
    "country": "Hawaii",
    "name": "Mountain Magic Shave ice",
    "location": "84-1170 Farrington Hwy, Bldg A2-AE, Waianae, HI 96792",
    "website": "https://www.mountainmagicshaveice.com/",
    "notes": "",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-70",
    "country": "Hawaii",
    "name": "Ululating",
    "location": "909 Kapahulu Ave, Honolulu, HI 96816",
    "website": "https://www.ululanishawaiianshaveice.com/",
    "notes": "Shave Ice (owner moved from Maui to open) Kenny, Kien, Kids first time and love it.",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-71",
    "country": "Hawaii",
    "name": "Mr. T Cafe",
    "location": "909 Kapiolani Blvd, Ste A, Honolulu, HI 96814",
    "website": "http://www.mrteacafe.com/",
    "notes": "Avery favorite place",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-72",
    "country": "Hawaii",
    "name": "Cow Cow",
    "location": "3620 Waialae Ave, Honolulu, HI 96816",
    "website": "https://www.cowcowstea.com/",
    "notes": "Boba",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-73",
    "country": "Hawaii",
    "name": "Frost City",
    "location": "1517 S King St, Honolulu, HI 96826",
    "website": "https://www.instagram.com/frostcityhi/",
    "notes": "",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-74",
    "country": "Hawaii",
    "name": "Leonards Bakery",
    "location": "933 Kapahulu Ave, Honolulu, HI 96816",
    "website": "https://leonardshawaii.com/",
    "notes": "",
    "photos": [],
    "cuisine": "Bakery"
  },
  {
    "id": "hi-75",
    "country": "Hawaii",
    "name": "Lilihua Bakery",
    "location": "1450 Ala Moana Blvd, Floor 3, Honolulu, HI 96814",
    "website": "https://www.lilihabakery.com/",
    "notes": "Ala Moana Mall ) Lanai food court (another part of the food court in Ala Moana Mall",
    "photos": [],
    "cuisine": "Bakery"
  },
  {
    "id": "hi-76",
    "country": "Hawaii",
    "name": "Island Vintage Shave Ice",
    "location": "2201 Kalakaua Ave, Kiosk B-1, Honolulu, HI 96815",
    "website": "https://islandvintagecoffee.com/",
    "notes": "In Waikiki, a small hut on the walk path.",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-77",
    "country": "Hawaii",
    "name": "Waiola Shave ice",
    "location": "2135 Waiola St, Honolulu, HI 96826",
    "website": "https://www.waiolashaveice.co/",
    "notes": "by main Leonard's",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-78",
    "country": "Hawaii",
    "name": "Dave ice cream",
    "location": "1777 Ala Moana Blvd, Honolulu, HI 96815",
    "website": "https://daveshawaiianicecream.com/",
    "notes": "",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-79",
    "country": "Hawaii",
    "name": "Waffle and Berry",
    "location": "2250 Kalakaua Ave #LL104, Honolulu, HI 96815",
    "website": "https://waffleandberry.com/",
    "notes": "NEW",
    "photos": [],
    "cuisine": "Dessert / Shave Ice"
  },
  {
    "id": "hi-81",
    "country": "Hawaii",
    "name": "Kanoya Sushi",
    "location": "1680 Kapiolani Blvd, Honolulu, HI 96814",
    "website": "https://kanoyasushi.com/",
    "notes": "Name has changed. Went on a trip with Lilly, Kayla and Roxus too. In 7/2023 we ordered a sushi sashimi combo, it came out on a boat with smoke coming out. On 7/2024 with Kenny we ordered a sushi sashimi combo, it came out with a jungle scene with stairs and smoke.",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-82",
    "country": "Hawaii",
    "name": "The Lookout",
    "location": "91-1621 Keoneula Blvd, Ewa Beach, HI 96706",
    "website": "https://www.waikailookout.com/",
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
    "location": "7192 Kalanianaole Hwy, Ste D-105, Honolulu, HI 96825",
    "website": "https://www.heavenly-hawaiikai.com/",
    "notes": "In the Koko Marina, same center as Moana Cafe",
    "photos": [],
    "cuisine": "Hawaiian / Local"
  },
  {
    "id": "hi-85",
    "country": "Hawaii",
    "name": "The Alley Restaurant",
    "location": "99-115 Aiea Heights Dr #310, Aiea, HI 96701",
    "website": "https://www.aieabowl.com/",
    "notes": "At Aiea bowling alley. Food not bad, fried chicken is good.",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-86",
    "country": "Hawaii",
    "name": "Harbor Place",
    "location": "7192 Kalanianaole Hwy, Ste C123, Honolulu, HI 96825",
    "website": "https://harborvillagehawaii.com/",
    "notes": "Chinese restaurant, dim sum and dinner. Nai Wong bao for P. (Koko Marina)",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-87",
    "country": "Hawaii",
    "name": "Duck Lee",
    "location": "2919 Kapiolani Blvd, Honolulu, HI 96826",
    "website": "https://www.facebook.com/pages/Duck-Lee-Chinese-Express-Foods/111585662213946",
    "notes": "Chinese Express, not bad roasted duck. Same center as Gina BBQ Korean.",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-88",
    "country": "Hawaii",
    "name": "Million Restaurant",
    "location": "626 Sheridan St, Honolulu, HI 96814",
    "website": "http://www.millionkorean.com/",
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
    "location": "1778 Ala Moana Blvd, Ste 115, Honolulu, HI 96815",
    "website": "https://www.tropicswaikiki.com/",
    "notes": "outside beach Waikiki) eat with son first time in HI",
    "photos": [],
    "cuisine": "American"
  },
  {
    "id": "hi-92",
    "country": "Hawaii",
    "name": "Nori Bar Hawaii",
    "location": "1000 Auahi St, Ste 130, Honolulu, HI 96814",
    "website": "https://noribarhawaii.com/",
    "notes": "next to Ala Moana",
    "photos": [],
    "cuisine": "Japanese"
  },
  {
    "id": "hi-93",
    "country": "Hawaii",
    "name": "Harbor Village Cuisine",
    "location": "7192 Kalanianaole Hwy, Ste C123, Honolulu, HI 96825",
    "website": "https://harborvillagehawaii.com/",
    "notes": "Koko Marina Shopping Center, by Walgreens",
    "photos": [],
    "cuisine": "Chinese"
  },
  {
    "id": "hi-94",
    "country": "Hawaii",
    "name": "Daley Burger",
    "location": "1110 Nuuanu Ave, Honolulu, HI 96813",
    "website": "https://www.thedaleyburger.com/",
    "notes": "Chinatown",
    "photos": [],
    "cuisine": "Burgers"
  }
];

import { db } from './firebase.js';
import {
  collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { IMGBB_API_KEY } from './imgbb-config.js';

const PLACES_COLLECTION = 'places';
const PROFILES_COLLECTION = 'profiles';

const PLACE_ADDED_POINTS = 3;
const MEMORY_POSTED_POINTS = 2;
const PHOTO_ADDED_POINTS = 2;

const ICON_COST = 10;
const COLOR_COST = 25;
const SKIN_COST = 45;
const BASIC_SKIN_COST = 25;
const OUTLINE_STYLE_COST = 10;
const OUTLINE_COLOR_COST = 25;
const ANIMATED_COST = 30;
const DEFAULT_OUTLINE_COLOR = '#097c87';

const SHOP_ICONS = [
  { id: 'icon_soccer', emoji: '⚽', label: 'Soccer', cost: ICON_COST },
  { id: 'icon_basketball', emoji: '🏀', label: 'Basketball', cost: ICON_COST },
  { id: 'icon_football', emoji: '🏈', label: 'Football', cost: ICON_COST },
  { id: 'icon_baseball', emoji: '⚾', label: 'Baseball', cost: ICON_COST },
  { id: 'icon_tennis', emoji: '🎾', label: 'Tennis', cost: ICON_COST },
  { id: 'icon_trophy', emoji: '🏆', label: 'Trophy', cost: ICON_COST },
  { id: 'icon_cherry_blossom', emoji: '🌸', label: 'Cherry Blossom', cost: ICON_COST },
  { id: 'icon_hibiscus', emoji: '🌺', label: 'Hibiscus', cost: ICON_COST },
  { id: 'icon_sunflower', emoji: '🌻', label: 'Sunflower', cost: ICON_COST },
  { id: 'icon_rose', emoji: '🌹', label: 'Rose', cost: ICON_COST },
  { id: 'icon_bouquet', emoji: '💐', label: 'Bouquet', cost: ICON_COST },
  { id: 'icon_kiss_mark', emoji: '💋', label: 'Kiss Mark', cost: ICON_COST },
  { id: 'icon_blowing_kiss', emoji: '😘', label: 'Blowing Kiss', cost: ICON_COST },
  { id: 'icon_love_letter', emoji: '💌', label: 'Love Letter', cost: ICON_COST },
  { id: 'icon_crown', emoji: '👑', label: 'Crown', cost: ICON_COST },
  { id: 'icon_fire', emoji: '🔥', label: 'Fire', cost: ICON_COST },
  { id: 'icon_star', emoji: '⭐', label: 'Star', cost: ICON_COST },
  { id: 'icon_unicorn', emoji: '🦄', label: 'Unicorn', cost: ICON_COST },
];

const SHOP_COLORS = [
  { id: 'color_gold', label: 'Gold', hex: '#c8961e', cost: COLOR_COST },
  { id: 'color_hotpink', label: 'Hot Pink', hex: '#e0298f', cost: COLOR_COST },
  { id: 'color_electricblue', label: 'Electric Blue', hex: '#1e6fff', cost: COLOR_COST },
  { id: 'color_emerald', label: 'Emerald', hex: '#0f9a5e', cost: COLOR_COST },
  { id: 'color_lavender', label: 'Lavender', hex: '#8c6fd4', cost: COLOR_COST },
  { id: 'color_crimson', label: 'Crimson', hex: '#c81e3a', cost: COLOR_COST },
  { id: 'color_teal', label: 'Teal', hex: '#0e8a8a', cost: COLOR_COST },
  { id: 'color_indigo', label: 'Indigo', hex: '#4338ca', cost: COLOR_COST },
  { id: 'color_burnt_orange', label: 'Burnt Orange', hex: '#d2691e', cost: COLOR_COST },
  { id: 'color_magenta', label: 'Magenta', hex: '#c2186e', cost: COLOR_COST },
  { id: 'color_olive', label: 'Olive', hex: '#6b7a1f', cost: COLOR_COST },
];

// Gradient skins get a translucent white wash mixed in (via the `overlay`
// opacity) so memory text stays readable on top of them. Image-based custom
// skins (dropped in /skins/) use `image` + the same overlay technique.
const SHOP_SKINS = [
  { id: 'skin_stripes', label: 'Stripes', cost: BASIC_SKIN_COST, overlay: 0.45, css: 'repeating-linear-gradient(45deg, #fca47c, #fca47c 10px, #f9d779 10px, #f9d779 20px)' },
  { id: 'skin_sparkle', label: 'Sparkle', cost: BASIC_SKIN_COST, overlay: 0.25, css: 'radial-gradient(circle at 20% 25%, #fff8d6 0%, transparent 14%), radial-gradient(circle at 70% 65%, #fff8d6 0%, transparent 10%), radial-gradient(circle at 45% 80%, #fff8d6 0%, transparent 8%), linear-gradient(135deg, #d8c6f0, #aee3f0)' },
  { id: 'skin_sunset', label: 'Sunset', cost: BASIC_SKIN_COST, overlay: 0.35, css: 'linear-gradient(135deg, #fca47c, #f9d779, #23ced9)' },
  { id: 'skin_polka', label: 'Polka Dots', cost: BASIC_SKIN_COST, overlay: 0.25, css: 'radial-gradient(circle, #ffffff 28%, transparent 30%) 0 0/18px 18px, #a1cca6' },
  { id: 'skin_galaxy', label: 'Galaxy', cost: BASIC_SKIN_COST, overlay: 0.55, css: 'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.55) 0%, transparent 6%), radial-gradient(circle at 65% 55%, rgba(255,255,255,0.4) 0%, transparent 5%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.45) 0%, transparent 4%), linear-gradient(135deg, #2c2a26, #097c87)' },
  { id: 'skin_f1_ferrari', label: 'F1 Ferrari', cost: SKIN_COST, overlay: 0.45, image: 'skins/f1_skin1.png' },
  { id: 'skin_f1_petronas', label: 'F1 Petronas', cost: SKIN_COST, overlay: 0.3, image: 'skins/f1_skin2.png' },
  { id: 'skin_f1_neon', label: 'F1 Neon', cost: SKIN_COST, overlay: 0.4, image: 'skins/f1_skin3.png' },
  { id: 'skin_f1_mercedes', label: 'F1 Mercedes', cost: SKIN_COST, overlay: 0.25, image: 'skins/f1_skin4.png' },
  { id: 'skin_ocean_wave', label: 'Ocean Wave', cost: SKIN_COST, overlay: 0.4, image: 'skins/ocean_skin1.png' },
  { id: 'skin_vikings', label: 'Vikings', cost: SKIN_COST, overlay: 0.45, image: 'skins/viking_skin.png' },
  { id: 'skin_pokemon', label: 'Pokémon', cost: SKIN_COST, overlay: 0.2, image: 'skins/pokemon_skin.png' },
  { id: 'skin_celtics', label: 'Celtics', cost: SKIN_COST, overlay: 0.35, image: 'skins/celtics_skin.png' },
  { id: 'skin_stranger_things', label: 'Stranger Things', cost: SKIN_COST, overlay: 0.45, image: 'skins/Strangerthings_skin.png' },
  { id: 'skin_eleven', label: 'Eleven', cost: SKIN_COST, overlay: 0.2, image: 'skins/11_skin.png' },
  { id: 'skin_rose', label: 'Rose', cost: SKIN_COST, overlay: 0.2, image: 'skins/rose_skin.png' },
  { id: 'skin_purple_daisies', label: 'Purple Daisies', cost: SKIN_COST, overlay: 0.35, image: 'skins/flower_skin.png' },
  { id: 'skin_hibiscus', label: 'Hibiscus', cost: SKIN_COST, overlay: 0.15, image: 'skins/Hibiscus_flower.png' },
  { id: 'skin_starlord', label: 'Star-Lord', cost: SKIN_COST, overlay: 0.35, image: 'skins/Starlord_skin.png' },
  { id: 'skin_minecraft', label: 'Minecraft Blocks', cost: SKIN_COST, overlay: 0.25, image: 'skins/minecraft_skin.png' },
  { id: 'skin_minecraft_crew', label: 'Minecraft Crew', cost: SKIN_COST, overlay: 0.3, image: 'skins/minecraft2_skin.png' },
  // Dynamic skins render their background entirely through the matching CSS
  // class (no inline background) so the animation can't be fought by inline styles.
  { id: 'skin_shimmer', label: 'Shimmer Wave', cost: ANIMATED_COST, animationClass: 'skin-anim-shimmer' },
  { id: 'skin_rainbow_pop', label: 'Rainbow Pop', cost: ANIMATED_COST, animationClass: 'skin-anim-rainbow' },
  { id: 'skin_confetti', label: 'Confetti Burst', cost: ANIMATED_COST, animationClass: 'skin-anim-confetti' },
];

function skinBackgroundCss(skin) {
  if (skin.animationClass) return '';
  const overlay = skin.overlay ?? 0.4;
  const wash = `linear-gradient(rgba(255,255,255,${overlay}), rgba(255,255,255,${overlay}))`;
  if (skin.image) {
    return `${wash}, url('${skin.image}?v=20260623a') center/cover no-repeat`;
  }
  return `${wash}, ${skin.css}`;
}

// Outline color deliberately excludes gold — that's reserved for the #1
// leaderboard medal so it stays a unique signal you can't just buy.
const SHOP_OUTLINE_STYLES = [
  { id: 'outline_solid', label: 'Solid', cost: OUTLINE_STYLE_COST, borderStyle: 'solid', width: '3px' },
  { id: 'outline_dotted', label: 'Dotted', cost: OUTLINE_STYLE_COST, borderStyle: 'dotted', width: '3px' },
  { id: 'outline_dashed', label: 'Dashed', cost: OUTLINE_STYLE_COST, borderStyle: 'dashed', width: '3px' },
  { id: 'outline_bold', label: 'Bold', cost: OUTLINE_STYLE_COST, borderStyle: 'solid', width: '6px' },
  { id: 'outline_glow', label: 'Glow Pulse', cost: ANIMATED_COST, animationClass: 'outline-anim-glow' },
  { id: 'outline_rainbow', label: 'Rainbow Cycle', cost: ANIMATED_COST, animationClass: 'outline-anim-rainbow' },
];

const SHOP_OUTLINE_COLORS = [
  { id: 'outlinecolor_hotpink', label: 'Hot Pink', cost: OUTLINE_COLOR_COST, hex: '#e0298f' },
  { id: 'outlinecolor_electricblue', label: 'Electric Blue', cost: OUTLINE_COLOR_COST, hex: '#1e6fff' },
  { id: 'outlinecolor_emerald', label: 'Emerald', cost: OUTLINE_COLOR_COST, hex: '#0f9a5e' },
  { id: 'outlinecolor_lavender', label: 'Lavender', cost: OUTLINE_COLOR_COST, hex: '#8c6fd4' },
  { id: 'outlinecolor_coral', label: 'Coral', cost: OUTLINE_COLOR_COST, hex: '#fc6f4d' },
  { id: 'outlinecolor_slate', label: 'Slate', cost: OUTLINE_COLOR_COST, hex: '#4a5568' },
  { id: 'outlinecolor_mint', label: 'Mint', cost: OUTLINE_COLOR_COST, hex: '#2dd4a8' },
  { id: 'outlinecolor_sky', label: 'Sky Blue', cost: OUTLINE_COLOR_COST, hex: '#38bdf8' },
  { id: 'outlinecolor_plum', label: 'Plum', cost: OUTLINE_COLOR_COST, hex: '#9333ea' },
  { id: 'outlinecolor_mustard', label: 'Mustard', cost: OUTLINE_COLOR_COST, hex: '#d4a017' },
];

function outlineAnimationClass(styleId) {
  const styleItem = SHOP_OUTLINE_STYLES.find(s => s.id === styleId);
  return styleItem?.animationClass || '';
}

function bubbleOutlineCss(styleId, colorId) {
  if (!styleId && !colorId) return '';
  const styleItem = SHOP_OUTLINE_STYLES.find(s => s.id === styleId) || SHOP_OUTLINE_STYLES[0];
  const colorItem = colorId ? SHOP_OUTLINE_COLORS.find(c => c.id === colorId) : null;
  const hex = colorItem ? colorItem.hex : DEFAULT_OUTLINE_COLOR;
  if (styleItem.animationClass) {
    return `--outline-glow-color: ${hex};`;
  }
  return `border: ${styleItem.width} ${styleItem.borderStyle} ${hex};`;
}

// Generic colors for now — real custom racket/court/ball art comes later.
const TENNIS_RACKET_COST = 15;
const TENNIS_BALL_COST = 15;
const TENNIS_COURT_COST = 20;

const SHOP_TENNIS_RACKETS = [
  { id: 'racket_crimson', label: 'Crimson', hex: '#e63946', cost: TENNIS_RACKET_COST },
  { id: 'racket_electric_blue', label: 'Electric Blue', hex: '#1e6fff', cost: TENNIS_RACKET_COST },
  { id: 'racket_emerald', label: 'Emerald', hex: '#0f9a5e', cost: TENNIS_RACKET_COST },
  { id: 'racket_gold', label: 'Gold', hex: '#f4c542', cost: TENNIS_RACKET_COST },
  { id: 'racket_hot_pink', label: 'Hot Pink', hex: '#e0298f', cost: TENNIS_RACKET_COST },
  { id: 'racket_slate', label: 'Slate', hex: '#4a5568', cost: TENNIS_RACKET_COST },
];

const SHOP_TENNIS_BALLS = [
  { id: 'ball_neon_yellow', label: 'Neon Yellow', hex: '#d9ff4b', cost: TENNIS_BALL_COST },
  { id: 'ball_hot_pink', label: 'Hot Pink', hex: '#ff5cb3', cost: TENNIS_BALL_COST },
  { id: 'ball_orange', label: 'Orange', hex: '#ff8c42', cost: TENNIS_BALL_COST },
  { id: 'ball_electric_blue', label: 'Electric Blue', hex: '#4cc9f0', cost: TENNIS_BALL_COST },
  { id: 'ball_crimson', label: 'Crimson', hex: '#e63946', cost: TENNIS_BALL_COST },
];

const TENNIS_COURT_IMAGE_COST = 35;

const SHOP_TENNIS_COURTS = [
  { id: 'court_clay', label: 'Clay Red', hex: '#8a3f20', cost: TENNIS_COURT_COST },
  { id: 'court_grass', label: 'Grass Green', hex: '#1f4d1f', cost: TENNIS_COURT_COST },
  { id: 'court_purple', label: 'Royal Purple', hex: '#3b2a5e', cost: TENNIS_COURT_COST },
  { id: 'court_charcoal', label: 'Charcoal', hex: '#1a1a1a', cost: TENNIS_COURT_COST },
  { id: 'court_teal', label: 'Ocean Teal', hex: '#0e4d52', cost: TENNIS_COURT_COST },
  { id: 'court_f1_petronas', label: 'F1 Petronas', hex: '#1a1a1a', cost: TENNIS_COURT_IMAGE_COST, image: 'tennis-courts/court_f1_petronas.png', overlay: 0 },
  { id: 'court_vikings', label: 'Vikings', hex: '#3b2a5e', cost: TENNIS_COURT_IMAGE_COST, image: 'tennis-courts/court_vikings.png', overlay: 0 },
  { id: 'court_minecraft', label: 'Minecraft', hex: '#2c2a26', cost: TENNIS_COURT_IMAGE_COST, image: 'tennis-courts/court_minecraft.png', overlay: 0 },
  { id: 'court_blastoise', label: 'Blastoise', hex: '#4cc9f0', cost: TENNIS_COURT_IMAGE_COST, image: 'tennis-courts/court_blastoise.png', overlay: 0 },
  { id: 'court_ffx', label: 'Final Fantasy X', hex: '#3b5a8a', cost: TENNIS_COURT_IMAGE_COST, image: 'tennis-courts/court_ffx.png', overlay: 0 },
  { id: 'court_hibiscus', label: 'Hibiscus', hex: '#e0298f', cost: TENNIS_COURT_IMAGE_COST, image: 'tennis-courts/court_hibiscus.png', overlay: 0 },
];

const SHOP_CATALOG = {
  icon: SHOP_ICONS, color: SHOP_COLORS, skin: SHOP_SKINS,
  outlineStyle: SHOP_OUTLINE_STYLES, outlineColor: SHOP_OUTLINE_COLORS,
  tennisRacket: SHOP_TENNIS_RACKETS, tennisBall: SHOP_TENNIS_BALLS, tennisCourt: SHOP_TENNIS_COURTS,
};
const EQUIP_FIELD = {
  icon: 'equippedIcon', color: 'equippedColor', skin: 'equippedSkin',
  outlineStyle: 'equippedOutlineStyle', outlineColor: 'equippedOutlineColor',
  tennisRacket: 'equippedTennisRacket', tennisBall: 'equippedTennisBall', tennisCourt: 'equippedTennisCourt',
};
const COUNTRIES = ['Hawaii', 'Japan', 'Las Vegas'];
const COUNTRY_EMOJI = { Hawaii: '🌴', Japan: '🗻', 'Las Vegas': '🎰' };
// left,top,right,bottom (lon/lat) per Nominatim viewbox format
const COUNTRY_VIEWBOX = {
  Hawaii: '-160.3,22.3,-154.7,18.8',
  Japan: '129,46,146,24',
  'Las Vegas': '-115.4,36.4,-114.9,35.9',
};
// Which sub-categories each destination supports — Las Vegas has no beaches.
const COUNTRY_CATEGORIES = {
  Hawaii: ['eats', 'beaches', 'hikes'],
  Japan: ['eats'],
  'Las Vegas': ['eats', 'hikes'],
};
const CUISINES = [
  'Hawaiian / Local', 'Japanese', 'Korean', 'Chinese', 'Vietnamese',
  'Italian', 'American', 'Burgers', 'Fast Food', 'Pizza', 'Seafood',
  'Mediterranean', 'Asian Fusion', 'Bakery', 'Dessert / Shave Ice',
  'Food Court / Variety', 'Other',
];

// Each destination is split into sub-sections (Eats / Beaches / Hikes), per
// COUNTRY_CATEGORIES above. Each reuses the same place/photo/memory/leaderboard
// machinery, but the "type" dropdown and extra fields differ per section.
const CATEGORY_CONFIG = {
  eats: { label: '🍽️ Eats', singular: 'a Place', tagLabel: 'What type of food is it?', tagOptions: CUISINES, hasDistance: false },
  beaches: { label: '🏖️ Beaches', singular: 'a Beach', tagLabel: 'What kind of beach is it?', tagOptions: ['Family-Friendly', 'Surfing', 'Snorkeling', 'Sunset Spot', 'Tide Pools', 'Other'], hasDistance: false },
  hikes: { label: '🥾 Hikes', singular: 'a Hike', tagLabel: 'How difficult is it?', tagOptions: ['Easy', 'Moderate', 'Hard', 'Other'], hasDistance: true },
};

let state = {
  activeTab: 'Hawaii',
  activeCategory: 'eats',
  search: '',
  sort: 'az',
  cuisineFilter: 'all',
};

let places = [];
let profiles = {};
let firstSnapshotReceived = false;

function normalizeName(name) {
  return (name || '').trim().toLowerCase();
}

const AUTHOR_NAME_KEY = 'food_memory_album_author_name';
const AUTHOR_COLOR_KEY = 'food_memory_album_author_color';
const BUBBLE_COLORS = [
  '#FFB3A7', '#AEE3F0', '#FFE08A', '#B6EFC9', '#D8C6F0',
  '#FFC2E2', '#C7D2FE', '#FFD7B5', '#B7F0E0', '#F0E0C0',
];

function getSavedAuthorName() {
  return localStorage.getItem(AUTHOR_NAME_KEY) || '';
}

function saveAuthorName(name) {
  localStorage.setItem(AUTHOR_NAME_KEY, name);
  renderCreditBadge();
}

function getSavedAuthorColor() {
  return localStorage.getItem(AUTHOR_COLOR_KEY) || BUBBLE_COLORS[0];
}

function saveAuthorColor(color) {
  localStorage.setItem(AUTHOR_COLOR_KEY, color);
}

function getReaction(memoryId) {
  return localStorage.getItem('food_memory_album_reaction_' + memoryId) || null;
}

function saveReaction(memoryId, reaction) {
  const key = 'food_memory_album_reaction_' + memoryId;
  if (reaction) localStorage.setItem(key, reaction);
  else localStorage.removeItem(key);
}

function uid() {
  return 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

// ---------- Firestore sync ----------
async function ensureSeeded() {
  const snap = await getDocs(collection(db, PLACES_COLLECTION));
  if (!snap.empty) return;
  const seed = window.SEED_PLACES || [];
  if (!seed.length) return;
  const batch = writeBatch(db);
  seed.forEach(p => batch.set(doc(db, PLACES_COLLECTION, p.id), p));
  await batch.commit();
}

function subscribeToPlaces() {
  onSnapshot(collection(db, PLACES_COLLECTION), snapshot => {
    places = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    firstSnapshotReceived = true;
    renderList();
    renderActivityFeed();
    renderCreditBadge();
    if (!document.getElementById('leaderboardOverlay').classList.contains('hidden')) {
      openLeaderboard();
    }
    if (!document.getElementById('shopOverlay').classList.contains('hidden')) {
      openShop();
    }
  }, err => {
    document.getElementById('listContainer').innerHTML =
      `<div class="empty-state">Couldn't connect to the shared album. Check the Firebase setup in firebase-config.js, or your internet connection.</div>`;
    console.error(err);
  });
}

function subscribeToProfiles() {
  onSnapshot(collection(db, PROFILES_COLLECTION), snapshot => {
    profiles = {};
    snapshot.docs.forEach(d => { profiles[d.id] = d.data(); });
    renderList();
    renderActivityFeed();
    renderDailyRewardBubble();
    renderCreditBadge();
    if (!document.getElementById('shopOverlay').classList.contains('hidden')) {
      openShop();
    }
  }, err => {
    console.error('Could not load shop profiles (the "profiles" Firestore collection may need its security rule added):', err);
  });
}

// ---------- Tabs ----------
function renderTabs() {
  const tabsEl = document.getElementById('tabs');
  tabsEl.innerHTML = '';
  COUNTRIES.forEach(country => {
    const btn = document.createElement('button');
    btn.className = 'dest-card' + (state.activeTab === country ? ' active' : '');
    btn.innerHTML = `<span class="dest-card-emoji">${COUNTRY_EMOJI[country] || '📍'}</span><span class="dest-card-label">${country}</span>`;
    btn.addEventListener('click', () => {
      state.activeTab = country;
      state.activeCategory = COUNTRY_CATEGORIES[country][0];
      state.cuisineFilter = 'all';
      renderTabs();
      renderCategoryTabs();
      populateCuisineFilterSelect();
      renderList();
    });
    tabsEl.appendChild(btn);
  });
  renderCategoryTabs();
}

function renderCategoryTabs() {
  const el = document.getElementById('categoryTabs');
  const cats = COUNTRY_CATEGORIES[state.activeTab] || ['eats'];
  if (cats.length <= 1) {
    el.innerHTML = '';
    el.style.display = 'none';
    updateAddPlaceBtnLabel();
    return;
  }
  el.style.display = '';
  el.innerHTML = '';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn tab-btn-sub' + (activeCategory() === cat ? ' active' : '');
    btn.textContent = CATEGORY_CONFIG[cat].label;
    btn.addEventListener('click', () => {
      state.activeCategory = cat;
      state.cuisineFilter = 'all';
      renderCategoryTabs();
      populateCuisineFilterSelect();
      renderList();
    });
    el.appendChild(btn);
  });
  updateAddPlaceBtnLabel();
}

function activeCategory() {
  const cats = COUNTRY_CATEGORIES[state.activeTab] || ['eats'];
  return cats.includes(state.activeCategory) ? state.activeCategory : cats[0];
}

function updateAddPlaceBtnLabel() {
  document.getElementById('addPlaceBtn').textContent = `+ Add ${CATEGORY_CONFIG[activeCategory()].singular}`;
}

// ---------- List rendering ----------
function getFilteredSorted() {
  let list = places.filter(p => p.country === state.activeTab && (p.category || 'eats') === activeCategory());

  if (state.cuisineFilter !== 'all') {
    list = list.filter(p => p.cuisine === state.cuisineFilter);
  }

  if (state.search.trim()) {
    const q = state.search.trim().toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.location || '').toLowerCase().includes(q) ||
      (p.notes || '').toLowerCase().includes(q) ||
      (p.cuisine || '').toLowerCase().includes(q)
    );
  }

  if (state.sort === 'best' || state.sort === 'worst') {
    list.sort((a, b) => {
      const avgA = averageRating(a.memories);
      const avgB = averageRating(b.memories);
      if (avgA === null && avgB === null) return a.name.localeCompare(b.name);
      if (avgA === null) return 1;
      if (avgB === null) return -1;
      return state.sort === 'best' ? avgB - avgA : avgA - avgB;
    });
  } else {
    list.sort((a, b) => a.name.localeCompare(b.name));
    if (state.sort === 'za') list.reverse();
  }

  return list;
}

function groupByLetter(list) {
  const groups = {};
  list.forEach(p => {
    const letter = (p.name[0] || '#').toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : '#';
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  return groups;
}

const CATEGORY_DEFAULT_EMOJI = { eats: '🍽️', beaches: '🏖️', hikes: '🥾' };

function placeThumb(place) {
  if (place.photos && place.photos.length > 0) {
    return `<img src="${photoUrl(place.photos[0])}" alt="">`;
  }
  return CATEGORY_DEFAULT_EMOJI[place.category || 'eats'];
}

function creditBadgeHtml(name) {
  if (!name) return '';
  const profile = getProfile(name);
  const icon = profile?.equippedIcon ? SHOP_ICONS.find(i => i.id === profile.equippedIcon)?.emoji : '';
  const colorItem = profile?.equippedColor ? SHOP_COLORS.find(c => c.id === profile.equippedColor) : null;
  const style = colorItem ? ` style="color:${colorItem.hex}"` : '';
  return `<span class="credit-badge"${style} title="Added by ${escapeHtml(name)}">${icon ? icon + ' ' : '👤 '}${escapeHtml(name)}</span>`;
}

function placeCardHtml(p, rank) {
  const avg = averageRating(p.memories);
  return `
    <div class="place-card" data-id="${p.id}">
      ${rank ? `<div class="rank-badge">#${rank}</div>` : ''}
      ${p.addedBy ? creditBadgeHtml(p.addedBy) : ''}
      <div class="place-thumb">${placeThumb(p)}</div>
      <div class="place-info">
        <h3>${escapeHtml(p.name)} ${avg ? `<span class="card-rating">★ ${avg}</span>` : ''}</h3>
        ${p.cuisine ? `<span class="cuisine-badge">${escapeHtml(p.cuisine)}</span>` : ''}
        ${p.distance ? `<span class="cuisine-badge">🥾 ${escapeHtml(p.distance)}</span>` : ''}
        ${p.notes ? `<div class="meta"><span class="meta-label">Notes:</span> ${escapeHtml(truncate(p.notes, 60))}</div>` : ''}
      </div>
      ${p.photos && p.photos.length ? `<div class="photo-badge">📷 ${p.photos.length}</div>` : ''}
    </div>
  `;
}

function renderList() {
  const container = document.getElementById('listContainer');
  const countLine = document.getElementById('countLine');
  renderCreditBadge();

  if (!firstSnapshotReceived) {
    countLine.textContent = '';
    container.innerHTML = `<div class="empty-state">Loading the shared album…</div>`;
    return;
  }

  const list = getFilteredSorted();

  const scopeLabel = (COUNTRY_CATEGORIES[state.activeTab] || ['eats']).length > 1
    ? `${state.activeTab} ${CATEGORY_CONFIG[activeCategory()].label.replace(/^\S+\s/, '')}`
    : state.activeTab;
  countLine.textContent = `${list.length} place${list.length === 1 ? '' : 's'} in ${scopeLabel}`;

  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state">No places yet. Tap "+ Add a Place" to start the ${scopeLabel} list!</div>`;
    return;
  }

  if (state.sort === 'best' || state.sort === 'worst') {
    container.innerHTML = `
      <section class="letter-section">
        <div class="grid">
          ${list.map((p, i) => placeCardHtml(p, i + 1)).join('')}
        </div>
      </section>
    `;
  } else {
    const groups = groupByLetter(list);
    const letters = Object.keys(groups).sort((a, b) => {
      if (state.sort === 'za') return b.localeCompare(a);
      return a.localeCompare(b);
    });

    container.innerHTML = letters.map(letter => `
      <section class="letter-section">
        <div class="letter-heading">${letter}</div>
        <div class="grid">
          ${groups[letter].map(p => placeCardHtml(p)).join('')}
        </div>
      </section>
    `).join('');
  }

  container.querySelectorAll('.place-card').forEach(card => {
    card.addEventListener('click', () => openViewModal(card.dataset.id));
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function truncate(str, len) {
  if (!str || str.length <= len) return str;
  return str.slice(0, len).trim() + '…';
}

function renderStarsDisplay(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= rating ? 'star-filled' : ''}">★</span>`;
  }
  return `<span class="star-row">${html}</span>`;
}

function averageRating(memories) {
  if (!memories || !memories.length) return null;
  const sum = memories.reduce((acc, m) => acc + (m.rating || 0), 0);
  return (sum / memories.length).toFixed(1);
}

// Photos used to be stored as plain URL strings; new uploads are
// { url, author, uploadedAt } objects so we can credit leaderboard points.
// These helpers read either shape.
function photoUrl(photo) {
  return typeof photo === 'string' ? photo : photo.url;
}

function photoAuthor(photo) {
  return typeof photo === 'string' ? null : (photo.author || null);
}

// ---------- Cuisine/type filter ----------
function populateCuisineFilterSelect() {
  const select = document.getElementById('cuisineFilterSelect');
  const options = CATEGORY_CONFIG[activeCategory()].tagOptions;
  select.innerHTML = `<option value="all">All</option>` +
    options.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

// ---------- Leaderboard ----------
// Scoring: +2 points for adding a new place, +1 point for posting a memory (rating).
// Likes/dislikes on memories do NOT affect points. Spending in the Shop
// subtracts from this balance, so the leaderboard always shows what each
// person currently has available to spend.
function computeRawPointsStats() {
  const stats = {};
  function ensure(name, color) {
    const key = normalizeName(name);
    if (!stats[key]) stats[key] = { name, points: 0, placesAdded: 0, memoriesCount: 0, photosAdded: 0, ratingSum: 0, color: color || BUBBLE_COLORS[0] };
    stats[key].name = name; // keep most-recently-seen casing as the display name
    return stats[key];
  }

  places.forEach(place => {
    const addedBy = (place.addedBy || '').trim();
    if (addedBy) {
      const s = ensure(addedBy);
      s.placesAdded += 1;
      s.points += PLACE_ADDED_POINTS;
    }
    (place.memories || []).forEach(m => {
      const key = (m.author || '').trim();
      if (!key) return;
      const s = ensure(key, m.color);
      s.memoriesCount += 1;
      s.points += MEMORY_POSTED_POINTS;
      s.ratingSum += (m.rating || 0);
      s.color = m.color || s.color;
    });
    (place.photos || []).forEach(photo => {
      const key = (photoAuthor(photo) || '').trim();
      if (!key) return;
      const s = ensure(key);
      s.photosAdded += 1;
      s.points += PHOTO_ADDED_POINTS;
    });
  });

  Object.entries(profiles).forEach(([key, profile]) => {
    const credits = profile.credits || [];
    if (!credits.length) return;
    const bonus = credits.reduce((sum, c) => sum + (c.points || 0), 0);
    const s = ensure(profile.displayName || key);
    s.points += bonus;
    s.creditedPoints = bonus;
  });

  return stats;
}

function getRawPoints(name) {
  const stats = computeRawPointsStats();
  const entry = stats[normalizeName(name)];
  return entry ? entry.points : 0;
}

function computeLeaderboard() {
  const stats = computeRawPointsStats();
  return Object.values(stats)
    .map(s => {
      const profile = profiles[normalizeName(s.name)];
      const spent = profile?.spentPoints || 0;
      return {
        ...s,
        rawPoints: s.points,
        spent,
        points: s.points - spent,
        avg: s.memoriesCount ? (s.ratingSum / s.memoriesCount).toFixed(1) : null,
      };
    })
    .sort((a, b) => b.points - a.points || b.memoriesCount - a.memoriesCount);
}

function getProfile(name) {
  return profiles[normalizeName(name)] || null;
}

function authorBadgeHtml(name) {
  const profile = getProfile(name);
  const icon = profile?.equippedIcon ? SHOP_ICONS.find(i => i.id === profile.equippedIcon)?.emoji : '';
  const colorItem = profile?.equippedColor ? SHOP_COLORS.find(c => c.id === profile.equippedColor) : null;
  const style = colorItem ? ` style="color:${colorItem.hex}"` : '';
  return `<span class="author-badge"${style}>${icon ? icon + ' ' : ''}${escapeHtml(name)}</span>`;
}

function openLeaderboard() {
  const data = computeLeaderboard();
  const medals = ['🥇', '🥈', '🥉'];
  const modal = document.getElementById('leaderboardModal');
  modal.innerHTML = `
    <button class="modal-close" id="leaderboardCloseBtn">✕</button>
    <h2>🏆 Top Contributors</h2>
    <p class="leaderboard-legend">+${PLACE_ADDED_POINTS} pts for adding a place · +${MEMORY_POSTED_POINTS} pts for each memory you post · +${PHOTO_ADDED_POINTS} pts for each photo you add · Shop purchases subtract from your balance</p>
    ${data.length ? `
      <div class="leaderboard-list">
        ${data.map((c, i) => {
          const profile = profiles[normalizeName(c.name)];
          const skin = profile?.equippedSkin ? SHOP_SKINS.find(s => s.id === profile.equippedSkin) : null;
          const rowBg = skin && !skin.animationClass ? `background:${skinBackgroundCss(skin)};` : '';
          const rowSkinClass = skin?.animationClass || '';
          const icon = profile?.equippedIcon ? SHOP_ICONS.find(s => s.id === profile.equippedIcon)?.emoji : null;
          const colorItem = profile?.equippedColor ? SHOP_COLORS.find(s => s.id === profile.equippedColor) : null;
          const avatarBg = colorItem ? colorItem.hex : c.color;
          const avatarOutline = bubbleOutlineCss(profile?.equippedOutlineStyle, profile?.equippedOutlineColor);
          const avatarOutlineClass = outlineAnimationClass(profile?.equippedOutlineStyle);
          return `
          <div class="leaderboard-row ${rowSkinClass}" style="${rowBg}">
            <span class="leaderboard-rank">${medals[i] || (i + 1) + '.'}</span>
            <span class="leaderboard-avatar ${avatarOutlineClass}" style="background:${escapeHtml(avatarBg)};${avatarOutline}">${icon || escapeHtml((c.name[0] || '?').toUpperCase())}</span>
            <span class="leaderboard-name">${authorBadgeHtml(c.name)}</span>
            <span class="leaderboard-stats">${c.points} pts<br>${c.placesAdded} place${c.placesAdded === 1 ? '' : 's'} · ${c.memoriesCount} memor${c.memoriesCount === 1 ? 'y' : 'ies'} · ${c.photosAdded} photo${c.photosAdded === 1 ? '' : 's'}${c.creditedPoints ? ` · 🛡️ ${c.creditedPoints > 0 ? '+' : ''}${c.creditedPoints} bonus` : ''}</span>
          </div>
        `;
        }).join('')}
      </div>` : `<p class="no-memories">No points yet — add a place or post a memory to get on the board!</p>`}
  `;
  document.getElementById('leaderboardCloseBtn').addEventListener('click', closeLeaderboard);
  document.getElementById('leaderboardOverlay').classList.remove('hidden');
}

function closeLeaderboard() {
  document.getElementById('leaderboardOverlay').classList.add('hidden');
}

// ---------- Shop ----------
function shopItemPreview(category, item) {
  if (category === 'icon') return `<span class="shop-preview shop-preview-icon" data-category="${category}" data-id="${item.id}">${item.emoji}</span>`;
  if (category === 'color') return `<span class="shop-preview shop-preview-color" data-category="${category}" data-id="${item.id}" style="background:${item.hex}"></span>`;
  if (category === 'skin') return `<span class="shop-preview shop-preview-skin ${item.animationClass || ''}" data-category="${category}" data-id="${item.id}" style="${item.animationClass ? '' : `background:${skinBackgroundCss(item)}`}"></span>`;
  if (category === 'outlineStyle') {
    if (item.animationClass) return `<span class="shop-preview shop-preview-outline ${item.animationClass}" data-category="${category}" data-id="${item.id}" style="--outline-glow-color:${DEFAULT_OUTLINE_COLOR};"></span>`;
    return `<span class="shop-preview shop-preview-outline" data-category="${category}" data-id="${item.id}" style="border: ${item.width} ${item.borderStyle} ${DEFAULT_OUTLINE_COLOR};"></span>`;
  }
  if (category === 'tennisCourt' && item.image) return `<span class="shop-preview shop-preview-skin" data-category="${category}" data-id="${item.id}" style="background:${skinBackgroundCss(item)}"></span>`;
  return `<span class="shop-preview shop-preview-color" data-category="${category}" data-id="${item.id}" style="background:${item.hex}"></span>`;
}

function shopItemLabel(category, item) {
  return item.label;
}

// Lets the Shop preview a not-yet-owned item without equipping it. Keys are
// 'icon'/'color'/'skin'; a value of '' means "previewing None", undefined
// means "show whatever's actually equipped". Reset each time the Shop opens.
let shopPreviewOverride = {};

function renderShopPreviewBubble(profile) {
  const iconId = shopPreviewOverride.icon !== undefined ? shopPreviewOverride.icon : profile?.equippedIcon;
  const colorId = shopPreviewOverride.color !== undefined ? shopPreviewOverride.color : profile?.equippedColor;
  const skinId = shopPreviewOverride.skin !== undefined ? shopPreviewOverride.skin : profile?.equippedSkin;
  const outlineStyleId = shopPreviewOverride.outlineStyle !== undefined ? shopPreviewOverride.outlineStyle : profile?.equippedOutlineStyle;
  const outlineColorId = shopPreviewOverride.outlineColor !== undefined ? shopPreviewOverride.outlineColor : profile?.equippedOutlineColor;

  const icon = iconId ? SHOP_ICONS.find(i => i.id === iconId)?.emoji : '';
  const colorItem = colorId ? SHOP_COLORS.find(c => c.id === colorId) : null;
  const skin = skinId ? SHOP_SKINS.find(s => s.id === skinId) : null;
  const bg = skin && !skin.animationClass ? skinBackgroundCss(skin) : (skin ? '' : BUBBLE_COLORS[0]);
  const skinClass = skin?.animationClass || '';
  const nameStyle = colorItem ? ` style="color:${colorItem.hex}"` : '';
  const outline = bubbleOutlineCss(outlineStyleId, outlineColorId);
  const outlineClass = outlineAnimationClass(outlineStyleId);
  const isPreviewing = Object.keys(shopPreviewOverride).length > 0;
  return `
    <div class="memory-bubble shop-live-preview ${skinClass} ${outlineClass}" style="background:${bg};${outline}">
      <div class="memory-card-top">
        <span class="memory-author"><span class="author-badge"${nameStyle}>${icon ? icon + ' ' : ''}You</span></span>
        ${renderStarsDisplay(5)}
      </div>
      <p class="memory-text">This is what your memory will look like!</p>
    </div>
    ${isPreviewing ? `<p class="hint">👀 Previewing — tap "Equip" or "Buy" to make it permanent.</p>` : `<p class="hint">Tap any swatch below to preview it here.</p>`}
  `;
}

function previewShopItem(profile, category, itemId) {
  shopPreviewOverride[category] = itemId || '';
  document.getElementById('shopLivePreviewBox').innerHTML = renderShopPreviewBubble(profile);
}

function openShop() {
  shopPreviewOverride = {};
  const name = getSavedAuthorName();
  const profile = name ? getProfile(name) : null;
  const available = name ? (getRawPoints(name) - (profile?.spentPoints || 0)) : 0;

  const sections = [
    { category: 'icon', title: '⚽ Icons', items: SHOP_ICONS },
    { category: 'color', title: '🎨 Name Colors', items: SHOP_COLORS },
    { category: 'skin', title: '✨ Memory Skins', items: SHOP_SKINS },
    { category: 'outlineStyle', title: '🔲 Outline Style', items: SHOP_OUTLINE_STYLES },
    { category: 'outlineColor', title: '🖌️ Outline Color', items: SHOP_OUTLINE_COLORS },
    { category: 'tennisRacket', title: '🎾 Tennis Racket Color', items: SHOP_TENNIS_RACKETS },
    { category: 'tennisBall', title: '🎾 Tennis Ball Color', items: SHOP_TENNIS_BALLS },
    { category: 'tennisCourt', title: '🎾 Tennis Court Color', items: SHOP_TENNIS_COURTS },
  ];

  const modal = document.getElementById('shopModal');
  modal.innerHTML = `
    <button class="modal-close" id="shopCloseBtn">✕</button>
    <h2>🛍️ Shop</h2>
    <p class="leaderboard-legend">Icons ${ICON_COST} pts · Name colors ${COLOR_COST} pts · Basic skins ${BASIC_SKIN_COST} pts · Custom skins ${SKIN_COST} pts · Outline style ${OUTLINE_STYLE_COST} pts · Outline color ${OUTLINE_COLOR_COST} pts · ✨ Dynamic skins/outlines ${ANIMATED_COST} pts · 🎾 Tennis racket/ball ${TENNIS_RACKET_COST} pts · 🎾 Tennis court ${TENNIS_COURT_COST} pts · 🎾 Custom tennis court ${TENNIS_COURT_IMAGE_COST} pts</p>

    <div class="shop-name-field">
      <label>Who are you?</label>
      <input type="text" id="shopNameInput" placeholder="Your name" value="${escapeHtml(name)}">
    </div>

    ${name ? `<p class="shop-balance">You have <strong>${available}</strong> pt${available === 1 ? '' : 's'} to spend</p>`
      : `<p class="hint">Type your name above to see your balance and start shopping.</p>`}

    ${name && profile?.loanOwed > 0 ? `
      <h3 class="shop-section-title">💰 Pay Back Loan</h3>
      <p class="hint">You owe <strong>${profile.loanOwed} pts</strong> on a loan from a moderator.</p>
      <div class="shop-name-field">
        <label>Pay back how much? (max ${Math.min(profile.loanOwed, available)} pts)</label>
        <input type="number" id="loanRepayInput" min="1" max="${Math.min(profile.loanOwed, available)}" step="1" value="${Math.min(profile.loanOwed, available)}">
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-primary" id="loanRepayBtn" ${available < 1 ? 'disabled' : ''}>Pay Back</button>
      </div>
    ` : ''}

    <h3 class="shop-section-title">👀 Live Preview</h3>
    <div id="shopLivePreviewBox">${renderShopPreviewBubble(profile)}</div>

    ${sections.map(section => `
      <h3 class="shop-section-title">${section.title}</h3>
      <div class="shop-grid">
        <div class="shop-item">
          <span class="shop-preview shop-preview-none" data-category="${section.category}" data-id="">🚫</span>
          <span class="shop-item-label">None</span>
          ${name ? `<button type="button" class="btn-shop-item ${!profile?.[EQUIP_FIELD[section.category]] ? 'shop-equipped' : 'shop-equip-btn'}" data-category="${section.category}" data-id="" ${!profile?.[EQUIP_FIELD[section.category]] ? 'disabled' : ''}>${!profile?.[EQUIP_FIELD[section.category]] ? '✓ Default' : 'Use Default'}</button>` : `<button type="button" class="btn-shop-item" disabled>Default</button>`}
        </div>
        ${section.items.map(item => {
          const owned = profile?.unlocked?.includes(item.id);
          const equipped = profile?.[EQUIP_FIELD[section.category]] === item.id;
          let buttonHtml;
          if (!name) {
            buttonHtml = `<button type="button" class="btn-shop-item" disabled>${item.cost} pts</button>`;
          } else if (equipped) {
            buttonHtml = `<button type="button" class="btn-shop-item shop-equipped" disabled>✓ Equipped</button>`;
          } else if (owned) {
            buttonHtml = `<button type="button" class="btn-shop-item shop-equip-btn" data-category="${section.category}" data-id="${item.id}">Equip</button>`;
          } else {
            const canAfford = available >= item.cost;
            buttonHtml = `<button type="button" class="btn-shop-item ${canAfford ? 'shop-buy-btn' : 'shop-locked-btn'}" data-category="${section.category}" data-id="${item.id}" data-cost="${item.cost}" ${canAfford ? '' : 'disabled'}>${canAfford ? `Buy · ${item.cost} pts` : `🔒 ${item.cost} pts`}</button>`;
          }
          return `
            <div class="shop-item">
              ${shopItemPreview(section.category, item)}
              <span class="shop-item-label">${shopItemLabel(section.category, item)}</span>
              ${buttonHtml}
            </div>
          `;
        }).join('')}
      </div>
    `).join('')}
  `;

  document.getElementById('shopCloseBtn').addEventListener('click', closeShop);
  document.getElementById('shopNameInput').addEventListener('change', (e) => {
    saveAuthorName(e.target.value.trim());
    openShop();
  });
  modal.querySelectorAll('.shop-preview[data-category]').forEach(swatch => {
    swatch.addEventListener('click', () => previewShopItem(profile, swatch.dataset.category, swatch.dataset.id));
  });
  modal.querySelectorAll('.shop-buy-btn').forEach(btn => {
    btn.addEventListener('click', () => buyItem(name, btn.dataset.category, btn.dataset.id, Number(btn.dataset.cost)));
  });
  modal.querySelectorAll('.shop-equip-btn').forEach(btn => {
    btn.addEventListener('click', () => equipItem(name, btn.dataset.category, btn.dataset.id || null));
  });
  const loanRepayBtn = document.getElementById('loanRepayBtn');
  if (loanRepayBtn) {
    loanRepayBtn.addEventListener('click', () => {
      const amount = Math.round(Number(document.getElementById('loanRepayInput').value));
      submitLoanRepayment(name, amount);
    });
  }

  document.getElementById('shopOverlay').classList.remove('hidden');
}

function closeShop() {
  document.getElementById('shopOverlay').classList.add('hidden');
}

async function buyItem(name, category, itemId, cost) {
  if (!name) return;
  const key = normalizeName(name);
  const profile = getProfile(name) || { spentPoints: 0, unlocked: [] };
  const available = getRawPoints(name) - (profile.spentPoints || 0);
  if (available < cost) {
    alert("You don't have enough points for that yet!");
    return;
  }
  const unlocked = [...new Set([...(profile.unlocked || []), itemId])];
  const updates = {
    displayName: name,
    spentPoints: (profile.spentPoints || 0) + cost,
    unlocked,
    [EQUIP_FIELD[category]]: itemId,
  };
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, key), updates, { merge: true });
    profiles[key] = { ...profile, ...updates };
    renderCreditBadge();
    openShop();
  } catch (err) {
    console.error(err);
    alert('Could not complete that purchase — check your internet connection and try again. (If this keeps happening, the "profiles" Firestore collection may need its security rule added.)');
  }
}

async function equipItem(name, category, itemId) {
  if (!name) return;
  const key = normalizeName(name);
  const profile = getProfile(name) || { spentPoints: 0, unlocked: [] };
  const updates = { displayName: name, [EQUIP_FIELD[category]]: itemId || null };
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, key), updates, { merge: true });
    profiles[key] = { ...profile, ...updates };
    openShop();
  } catch (err) {
    console.error(err);
    alert('Could not update your equipped item — check your internet connection and try again.');
  }
}

async function submitLoanRepayment(name, amount) {
  if (!name) return;
  const key = normalizeName(name);
  const profile = getProfile(name) || { spentPoints: 0, unlocked: [], credits: [] };
  const available = getRawPoints(name) - (profile.spentPoints || 0);
  const owed = profile.loanOwed || 0;
  if (!Number.isFinite(amount) || amount < 1 || amount > owed || amount > available) {
    alert(`You can pay back between 1 and ${Math.min(owed, available)} pts.`);
    return;
  }
  const updates = {
    displayName: name,
    spentPoints: (profile.spentPoints || 0) + amount,
    loanOwed: owed - amount,
  };
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, key), updates, { merge: true });
    profiles[key] = { ...profile, ...updates };
    openShop();
  } catch (err) {
    console.error(err);
    alert('Could not pay back the loan — check your internet connection and try again.');
  }
}

// ---------- Moderator ----------
// PIN is a soft speed-bump, not real auth — same trust model as the rest of
// this no-login site (the URL itself is the access control).
const MODERATOR_PIN = '8181';
let moderatorUnlocked = false;

function openModerator() {
  if (moderatorUnlocked) {
    renderModeratorAwardForm();
  } else {
    renderModeratorPinForm();
  }
  document.getElementById('moderatorOverlay').classList.remove('hidden');
}

function closeModerator() {
  document.getElementById('moderatorOverlay').classList.add('hidden');
}

function renderModeratorPinForm() {
  const modal = document.getElementById('moderatorModal');
  modal.innerHTML = `
    <button class="modal-close" id="moderatorCloseBtn">✕</button>
    <h2>🛡️ Moderator</h2>
    <form class="place-form" id="moderatorPinFormEl">
      <label for="moderatorPinInput">Enter the moderator PIN to award bonus credits</label>
      <input type="password" id="moderatorPinInput" inputmode="numeric" maxlength="8" placeholder="••••" autocomplete="off">
      <p class="form-error" id="moderatorPinError" style="display:none; color:#c23b3b;">Incorrect PIN.</p>
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Unlock</button>
      </div>
    </form>
  `;
  document.getElementById('moderatorCloseBtn').addEventListener('click', closeModerator);
  const pinInput = document.getElementById('moderatorPinInput');
  document.getElementById('moderatorPinFormEl').addEventListener('submit', (e) => {
    e.preventDefault();
    if (pinInput.value === MODERATOR_PIN) {
      moderatorUnlocked = true;
      renderModeratorAwardForm();
    } else {
      document.getElementById('moderatorPinError').style.display = '';
      pinInput.value = '';
      pinInput.focus();
    }
  });
  pinInput.focus();
}

const SITE_ANNOUNCEMENTS_DOC_ID = '_announcements';

function renderModeratorAwardForm(creditStatus, updateStatus, loanStatus) {
  const modal = document.getElementById('moderatorModal');
  const names = computeLeaderboard().map(c => c.name);
  modal.innerHTML = `
    <button class="modal-close" id="moderatorCloseBtn">✕</button>
    <h2>🛡️ Moderator Tools</h2>

    <h3 class="shop-section-title">Award Credits</h3>
    <p class="hint">Grants bonus leaderboard points to anyone, for anything — shows up in Recent Activity.</p>
    <form class="place-form" id="moderatorAwardFormEl">
      <label for="moderatorNameInput">Who gets credited?</label>
      <input type="text" id="moderatorNameInput" list="moderatorNameList" placeholder="Name" required>
      <datalist id="moderatorNameList">${names.map(n => `<option value="${escapeHtml(n)}"></option>`).join('')}</datalist>

      <label for="moderatorPointsInput">How many points?</label>
      <input type="number" id="moderatorPointsInput" placeholder="e.g. 5" required>

      <label for="moderatorReasonInput">What for?</label>
      <input type="text" id="moderatorReasonInput" placeholder="e.g. adding photos all week" required>

      ${creditStatus ? `<p class="hint">${creditStatus}</p>` : ''}
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Award Credit</button>
      </div>
    </form>

    <h3 class="shop-section-title">Give a Loan</h3>
    <p class="hint">Advances points now that the player pays back later from the Shop — doesn't count toward their lifetime leaderboard total the way Award Credits does.</p>
    <form class="place-form" id="moderatorLoanFormEl">
      <label for="moderatorLoanNameInput">Who gets the loan?</label>
      <input type="text" id="moderatorLoanNameInput" list="moderatorNameList" placeholder="Name" required>

      <label for="moderatorLoanAmountInput">How many points?</label>
      <input type="number" id="moderatorLoanAmountInput" placeholder="e.g. 50" min="1" required>

      ${loanStatus ? `<p class="hint">${loanStatus}</p>` : ''}
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Give Loan</button>
      </div>
    </form>

    <h3 class="shop-section-title">Post a Site Update</h3>
    <p class="hint">Posts an announcement at the top of Recent Activity for everyone.</p>
    <form class="place-form" id="moderatorUpdateFormEl">
      <label for="moderatorUpdateInput">What's new?</label>
      <input type="text" id="moderatorUpdateInput" placeholder="e.g. Added the Hikes section!" required>
      ${updateStatus ? `<p class="hint">${updateStatus}</p>` : ''}
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Post Update</button>
      </div>
    </form>
  `;
  document.getElementById('moderatorCloseBtn').addEventListener('click', closeModerator);
  document.getElementById('moderatorAwardFormEl').addEventListener('submit', (e) => {
    e.preventDefault();
    submitModeratorCredit();
  });
  document.getElementById('moderatorLoanFormEl').addEventListener('submit', (e) => {
    e.preventDefault();
    submitModeratorLoan();
  });
  document.getElementById('moderatorUpdateFormEl').addEventListener('submit', (e) => {
    e.preventDefault();
    submitSiteUpdate();
  });
}

async function submitModeratorCredit() {
  const name = document.getElementById('moderatorNameInput').value.trim();
  const points = Number(document.getElementById('moderatorPointsInput').value);
  const reason = document.getElementById('moderatorReasonInput').value.trim();
  if (!name || !points || !reason) return;

  const key = normalizeName(name);
  const profile = getProfile(name) || { spentPoints: 0, unlocked: [], credits: [] };
  const credits = [...(profile.credits || []), { points, reason, awardedAt: Date.now() }];
  const updates = { displayName: name, credits };
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, key), updates, { merge: true });
    profiles[key] = { ...profile, ...updates };
    renderActivityFeed();
    renderList();
    renderModeratorAwardForm(`✅ Credited ${escapeHtml(name)} ${points > 0 ? '+' : ''}${points} pts for "${escapeHtml(reason)}".`, null);
  } catch (err) {
    console.error(err);
    alert('Could not award credit — check your internet connection and try again.');
  }
}

async function submitModeratorLoan() {
  const name = document.getElementById('moderatorLoanNameInput').value.trim();
  const amount = Math.round(Number(document.getElementById('moderatorLoanAmountInput').value));
  if (!name || !Number.isFinite(amount) || amount <= 0) return;

  const key = normalizeName(name);
  const profile = getProfile(name) || { spentPoints: 0, unlocked: [], credits: [] };
  // A loan frees up spending power now (like a refund) without inflating
  // raw lifetime points/leaderboard rank; loanOwed tracks what's still due.
  const updates = {
    displayName: name,
    spentPoints: (profile.spentPoints || 0) - amount,
    loanOwed: (profile.loanOwed || 0) + amount,
  };
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, key), updates, { merge: true });
    profiles[key] = { ...profile, ...updates };
    renderList();
    renderModeratorAwardForm(null, null, `✅ Gave ${escapeHtml(name)} a ${amount} pt loan — they now owe ${updates.loanOwed} pts total.`);
  } catch (err) {
    console.error(err);
    alert('Could not give the loan — check your internet connection and try again.');
  }
}

async function submitSiteUpdate() {
  const text = document.getElementById('moderatorUpdateInput').value.trim();
  if (!text) return;

  const existing = profiles[SITE_ANNOUNCEMENTS_DOC_ID] || { messages: [] };
  const messages = [...(existing.messages || []), { text, postedAt: Date.now() }];
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, SITE_ANNOUNCEMENTS_DOC_ID), { messages }, { merge: true });
    profiles[SITE_ANNOUNCEMENTS_DOC_ID] = { ...existing, messages };
    renderActivityFeed();
    renderModeratorAwardForm(null, `✅ Posted: "${escapeHtml(text)}"`);
  } catch (err) {
    console.error(err);
    alert('Could not post the update — check your internet connection and try again.');
  }
}

// ---------- Daily reward ----------
const DAILY_REWARD_POINTS = 5;

function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function renderDailyRewardBubble() {
  const bubble = document.getElementById('dailyRewardBubble');
  const icon = document.getElementById('dailyRewardIcon');
  const name = getSavedAuthorName();
  const profile = name ? getProfile(name) : null;
  if (profile?.lastDailyClaim === todayDateString()) {
    bubble.classList.add('claimed');
    bubble.title = 'Daily reward claimed — come back tomorrow!';
    icon.textContent = '✅';
  } else {
    bubble.classList.remove('claimed');
    bubble.title = `Daily Reward — Claim +${DAILY_REWARD_POINTS} pts`;
    icon.textContent = '🎁';
  }
}

function renderCreditBadge() {
  const badge = document.getElementById('creditBadge');
  const name = getSavedAuthorName();
  if (!name) {
    badge.classList.add('hidden');
    return;
  }
  const profile = getProfile(name);
  const available = getRawPoints(name) - (profile?.spentPoints || 0);
  badge.classList.remove('hidden');
  badge.title = `${name} — tap to open the Leaderboard`;
  badge.innerHTML = `🪙 <strong>${available}</strong> pts`;
}

let claimingDailyReward = false;

async function claimDailyReward() {
  if (claimingDailyReward) return; // guards against a double-tap firing two credits before Firestore round-trips
  let name = getSavedAuthorName();
  if (!name) {
    name = (prompt("What's your name? (so we know whose daily reward to claim)") || '').trim();
    if (!name) return;
    saveAuthorName(name);
  }
  const today = todayDateString();
  const key = normalizeName(name);
  const profile = getProfile(name) || { spentPoints: 0, unlocked: [], credits: [] };
  if (profile.lastDailyClaim === today) return;

  claimingDailyReward = true;
  const credits = [...(profile.credits || []), { points: DAILY_REWARD_POINTS, reason: 'daily visit reward', source: 'daily', awardedAt: Date.now() }];
  const updates = { displayName: name, credits, lastDailyClaim: today };
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, key), updates, { merge: true });
    profiles[key] = { ...profile, ...updates };
    renderDailyRewardBubble();
    renderActivityFeed();
    renderList();
  } catch (err) {
    console.error(err);
    alert('Could not claim your daily reward — check your internet connection and try again.');
  } finally {
    claimingDailyReward = false;
  }
}

// ---------- Tennis mini-game ----------
// Best of 3 matches — first point wins a match, first to win 2 matches wins
// the series. Entry fee is a flat wager deducted up front (like a Shop
// purchase) no matter the difficulty; winning the series credits the prize
// for that difficulty on top, losing just keeps the entry fee gone.
const GAME_ENTRY_COST = 5;
const ROUND_WIN_SCORE = 1;
const MATCH_WINS_NEEDED = 2;
const TENNIS_HAND_KEY = 'food_memory_album_tennis_hand';
const TENNIS_DIFFICULTY_KEY = 'food_memory_album_tennis_difficulty';
const TENNIS_DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', emoji: '🟢', cpuSpeed: 2.2, randomness: 55, winPoints: 3 },
  medium: { label: 'Medium', emoji: '🟡', cpuSpeed: 3.5, randomness: 30, winPoints: 5 },
  hard: { label: 'Hard', emoji: '🔴', cpuSpeed: 5.5, randomness: 10, winPoints: 8 },
};

function getSavedHandedness() {
  return localStorage.getItem(TENNIS_HAND_KEY) || 'right';
}
function saveHandedness(hand) {
  localStorage.setItem(TENNIS_HAND_KEY, hand);
}
function getSavedDifficulty() {
  return localStorage.getItem(TENNIS_DIFFICULTY_KEY) || 'medium';
}
function saveDifficulty(difficulty) {
  localStorage.setItem(TENNIS_DIFFICULTY_KEY, difficulty);
}

let gameState = null;
let gameAnimId = null;

function openGame() {
  stopGameLoop();
  const name = getSavedAuthorName();
  const profile = name ? getProfile(name) : null;
  const available = name ? (getRawPoints(name) - (profile?.spentPoints || 0)) : 0;
  const hand = getSavedHandedness();
  const difficulty = getSavedDifficulty();
  const winPoints = TENNIS_DIFFICULTY_CONFIG[difficulty].winPoints;
  const modal = document.getElementById('gameModal');
  modal.innerHTML = `
    <button class="modal-close" id="gameCloseBtn">✕</button>
    <h2>🎾 Tennis</h2>
    <p class="hint">Best of 3 — first point wins a match, first to win 2 matches takes the series. Entry costs ${GAME_ENTRY_COST} pts no matter the difficulty. Win the series for +${winPoints} pts — lose, and your entry fee is gone. Slide your finger up and down on the bar beside the court to move your racket.</p>
    <div class="shop-name-field">
      <label>Who's playing?</label>
      <input type="text" id="gameNameInput" placeholder="Your name" value="${escapeHtml(name)}">
    </div>
    <div class="shop-name-field">
      <label>Which hand do you play with?</label>
      <div class="tennis-hand-picker">
        <button type="button" class="tennis-hand-btn ${hand === 'left' ? 'active' : ''}" data-hand="left">🤚 Left-handed</button>
        <button type="button" class="tennis-hand-btn ${hand === 'right' ? 'active' : ''}" data-hand="right">✋ Right-handed</button>
      </div>
    </div>
    <div class="shop-name-field">
      <label>Choose your difficulty</label>
      <div class="tennis-difficulty-picker">
        ${Object.entries(TENNIS_DIFFICULTY_CONFIG).map(([id, cfg]) => `
          <button type="button" class="tennis-diff-btn ${difficulty === id ? 'active' : ''}" data-diff="${id}">
            <span class="tennis-diff-label">${cfg.emoji} ${cfg.label}</span>
            <span class="tennis-diff-prize">Win +${cfg.winPoints}</span>
          </button>
        `).join('')}
      </div>
    </div>
    ${name ? `<p class="shop-balance">You have <strong>${available}</strong> pt${available === 1 ? '' : 's'} to spend</p>` : `<p class="hint">Type your name above to play.</p>`}
    <div class="modal-actions">
      <button type="button" class="btn btn-primary" id="gameStartBtn" ${(!name || available < GAME_ENTRY_COST) ? 'disabled' : ''}>🎾 Start Series (-${GAME_ENTRY_COST} pts)</button>
    </div>
  `;
  document.getElementById('gameCloseBtn').addEventListener('click', closeGame);
  document.getElementById('gameNameInput').addEventListener('change', (e) => {
    saveAuthorName(e.target.value.trim());
    openGame();
  });
  document.querySelectorAll('.tennis-hand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      saveHandedness(btn.dataset.hand);
      openGame();
    });
  });
  document.querySelectorAll('.tennis-diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      saveDifficulty(btn.dataset.diff);
      openGame();
    });
  });
  const startBtn = document.getElementById('gameStartBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => startGameMatch(document.getElementById('gameNameInput').value.trim()));
  }
  document.getElementById('gameOverlay').classList.remove('hidden');
}

function closeGame() {
  if (gameState && gameState.running) {
    if (!confirm('Leave the series? Your progress (and entry fee) will be lost.')) return;
  }
  stopGameLoop();
  document.getElementById('gameOverlay').classList.add('hidden');
}

function stopGameLoop() {
  if (gameState) gameState.running = false;
  if (gameAnimId) cancelAnimationFrame(gameAnimId);
  gameAnimId = null;
  gameState = null;
}

async function startGameMatch(name) {
  if (!name) return;
  const key = normalizeName(name);
  const profile = getProfile(name) || { spentPoints: 0, unlocked: [], credits: [] };
  const available = getRawPoints(name) - (profile.spentPoints || 0);
  if (available < GAME_ENTRY_COST) {
    alert("You don't have enough points to play!");
    return;
  }
  const updates = { displayName: name, spentPoints: (profile.spentPoints || 0) + GAME_ENTRY_COST };
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, key), updates, { merge: true });
    profiles[key] = { ...profile, ...updates };
    saveAuthorName(name);
  } catch (err) {
    console.error(err);
    alert('Could not start the match — check your internet connection and try again.');
    return;
  }
  renderGameCanvas(name);
}

function renderGameCanvas(name) {
  const hand = getSavedHandedness();
  const difficulty = getSavedDifficulty();
  const diffConfig = TENNIS_DIFFICULTY_CONFIG[difficulty];
  const profile = getProfile(name);
  const racketColor = SHOP_TENNIS_RACKETS.find(r => r.id === profile?.equippedTennisRacket)?.hex || '#ffffff';
  const ballColor = SHOP_TENNIS_BALLS.find(b => b.id === profile?.equippedTennisBall)?.hex || '#ffffff';
  const courtItem = SHOP_TENNIS_COURTS.find(c => c.id === profile?.equippedTennisCourt);
  const courtColor = courtItem?.hex || '#0c2b2e';
  let courtImageEl = null;
  if (courtItem?.image) {
    courtImageEl = new Image();
    courtImageEl.src = `${courtItem.image}?v=20260623a`;
  }

  const modal = document.getElementById('gameModal');
  modal.innerHTML = `
    <button class="modal-close" id="gameCloseBtn">✕</button>
    <h2 id="tennisGameTitle">🎾 Tennis — Match 1 · ${diffConfig.emoji} ${diffConfig.label}</h2>
    <div class="tennis-scoreboard">
      <span id="tennisPlayerScore">You: 0</span>
      <span id="tennisMatchScore">Series: 0 – 0</span>
      <span id="tennisCpuScore">CPU: 0</span>
    </div>
    <div class="tennis-play-area ${hand === 'right' ? 'hand-right' : ''}">
      <div class="tennis-slider-track" id="tennisSliderTrack">
        <div class="tennis-slider-thumb" id="tennisSliderThumb" style="background:${racketColor};"></div>
      </div>
      <div class="tennis-court-wrap">
        <canvas id="tennisCanvas" width="600" height="360"></canvas>
        <div class="tennis-start-overlay" id="tennisStartOverlay">
          <button type="button" class="btn btn-primary" id="tennisStartMatchBtn">▶ Start Match 1</button>
        </div>
      </div>
    </div>
    <p class="hint">Slide your finger up/down on the bar to move your racket.</p>
  `;
  document.getElementById('gameCloseBtn').addEventListener('click', closeGame);

  const canvas = document.getElementById('tennisCanvas');
  const ctx = canvas.getContext('2d');
  gameState = {
    name,
    canvas, ctx,
    w: canvas.width, h: canvas.height,
    paddleW: 10, paddleH: 70,
    playerY: canvas.height / 2 - 35,
    cpuY: canvas.height / 2 - 35,
    ballX: canvas.width / 2, ballY: canvas.height / 2,
    ballVX: 4 * (Math.random() < 0.5 ? 1 : -1), ballVY: 3 * (Math.random() < 0.5 ? 1 : -1),
    playerScore: 0, cpuScore: 0,
    roundsWonPlayer: 0, roundsWonCpu: 0,
    gameNum: 1,
    running: true,
    paused: true,
    difficulty,
    cpuSpeed: diffConfig.cpuSpeed,
    cpuRandomness: diffConfig.randomness,
    winPoints: diffConfig.winPoints,
    racketColor,
    ballColor,
    courtColor,
    courtImageEl,
  };

  const track = document.getElementById('tennisSliderTrack');
  const thumb = document.getElementById('tennisSliderThumb');

  function updateSliderThumb() {
    const trackHeight = track.getBoundingClientRect().height;
    const thumbHeight = thumb.getBoundingClientRect().height;
    const ratio = gameState.playerY / (gameState.h - gameState.paddleH);
    thumb.style.top = `${ratio * Math.max(0, trackHeight - thumbHeight)}px`;
  }

  function setPlayerYFromClientY(clientY) {
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    gameState.playerY = ratio * (gameState.h - gameState.paddleH);
    updateSliderThumb();
  }

  let dragging = false;
  track.addEventListener('pointerdown', (e) => {
    dragging = true;
    track.setPointerCapture(e.pointerId);
    setPlayerYFromClientY(e.clientY);
  });
  track.addEventListener('pointermove', (e) => {
    if (dragging) setPlayerYFromClientY(e.clientY);
  });
  track.addEventListener('pointerup', () => { dragging = false; });
  track.addEventListener('pointercancel', () => { dragging = false; });

  document.getElementById('tennisStartMatchBtn').addEventListener('click', startMatchPoint);

  updateSliderThumb();
  drawGame(gameState);
}

function startMatchPoint() {
  if (!gameState) return;
  gameState.paused = false;
  document.getElementById('tennisStartOverlay').classList.add('hidden');
  gameAnimId = requestAnimationFrame(gameLoop);
}

function resetBall(g, dir) {
  g.ballX = g.w / 2;
  g.ballY = g.h / 2;
  g.ballVX = 4 * dir;
  g.ballVY = 3 * (Math.random() < 0.5 ? 1 : -1);
}

function gameLoop() {
  if (!gameState || !gameState.running || gameState.paused) return;
  const g = gameState;

  g.ballX += g.ballVX;
  g.ballY += g.ballVY;

  if (g.ballY <= 0 || g.ballY >= g.h) g.ballVY *= -1;

  // CPU speed/aim-imprecision scale with the chosen difficulty (set in
  // renderGameCanvas from TENNIS_DIFFICULTY_CONFIG).
  const cpuCenter = g.cpuY + g.paddleH / 2;
  const targetY = g.ballY + (Math.random() - 0.5) * g.cpuRandomness;
  if (cpuCenter < targetY - 5) g.cpuY += g.cpuSpeed;
  else if (cpuCenter > targetY + 5) g.cpuY -= g.cpuSpeed;
  g.cpuY = Math.max(0, Math.min(g.h - g.paddleH, g.cpuY));

  if (g.ballX <= g.paddleW + 6 && g.ballX > 0 && g.ballY >= g.playerY && g.ballY <= g.playerY + g.paddleH && g.ballVX < 0) {
    g.ballVX *= -1.05;
    g.ballVY += (g.ballY - (g.playerY + g.paddleH / 2)) * 0.15;
  }
  if (g.ballX >= g.w - g.paddleW - 6 && g.ballX < g.w && g.ballY >= g.cpuY && g.ballY <= g.cpuY + g.paddleH && g.ballVX > 0) {
    g.ballVX *= -1.05;
    g.ballVY += (g.ballY - (g.cpuY + g.paddleH / 2)) * 0.15;
  }

  if (g.ballX < 0) {
    g.cpuScore += 1;
    resetBall(g, 1);
  } else if (g.ballX > g.w) {
    g.playerScore += 1;
    resetBall(g, -1);
  }

  drawGame(g);

  if (g.playerScore >= ROUND_WIN_SCORE || g.cpuScore >= ROUND_WIN_SCORE) {
    endGameRound();
    return;
  }

  gameAnimId = requestAnimationFrame(gameLoop);
}

function drawGame(g) {
  const ctx = g.ctx;
  if (g.courtImageEl && g.courtImageEl.complete && g.courtImageEl.naturalWidth) {
    ctx.drawImage(g.courtImageEl, 0, 0, g.w, g.h);
  } else {
    ctx.fillStyle = g.courtColor;
    ctx.fillRect(0, 0, g.w, g.h);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.setLineDash([6, 10]);
  ctx.beginPath();
  ctx.moveTo(g.w / 2, 0);
  ctx.lineTo(g.w / 2, g.h);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = g.racketColor;
  ctx.fillRect(4, g.playerY, g.paddleW, g.paddleH);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(g.w - g.paddleW - 4, g.cpuY, g.paddleW, g.paddleH);
  ctx.fillStyle = g.ballColor;
  ctx.beginPath();
  ctx.arc(g.ballX, g.ballY, 7, 0, Math.PI * 2);
  ctx.fill();
  document.getElementById('tennisPlayerScore').textContent = `You: ${g.playerScore}`;
  document.getElementById('tennisCpuScore').textContent = `CPU: ${g.cpuScore}`;
}

function endGameRound() {
  const g = gameState;
  if (g.playerScore > g.cpuScore) g.roundsWonPlayer += 1;
  else g.roundsWonCpu += 1;

  if (g.roundsWonPlayer >= MATCH_WINS_NEEDED || g.roundsWonCpu >= MATCH_WINS_NEEDED) {
    endGameMatch(g.roundsWonPlayer > g.roundsWonCpu);
    return;
  }

  g.gameNum += 1;
  g.playerScore = 0;
  g.cpuScore = 0;
  g.paused = true;
  resetBall(g, Math.random() < 0.5 ? 1 : -1);
  const diffConfig = TENNIS_DIFFICULTY_CONFIG[g.difficulty];
  document.getElementById('tennisGameTitle').textContent = `🎾 Tennis — Match ${g.gameNum} · ${diffConfig.emoji} ${diffConfig.label}`;
  document.getElementById('tennisMatchScore').textContent = `Series: ${g.roundsWonPlayer} – ${g.roundsWonCpu}`;
  drawGame(g);
  const overlay = document.getElementById('tennisStartOverlay');
  document.getElementById('tennisStartMatchBtn').textContent = `▶ Start Match ${g.gameNum}`;
  overlay.classList.remove('hidden');
}

async function endGameMatch(playerWon) {
  gameState.running = false;
  cancelAnimationFrame(gameAnimId);
  const name = gameState.name;
  const key = normalizeName(name);
  const profile = getProfile(name) || { spentPoints: 0, unlocked: [], credits: [] };

  if (playerWon) {
    // The entry fee was already deducted via spentPoints when the series
    // started, so refund it plus the net prize — otherwise a win nets 0.
    // displayPoints keeps the activity feed showing the advertised net prize
    // (e.g. "+5") while `points` carries the real ledger amount (e.g. 10).
    const payout = GAME_ENTRY_COST + gameState.winPoints;
    const credits = [...(profile.credits || []), { points: payout, displayPoints: gameState.winPoints, reason: 'won a Tennis series', source: 'game', gameType: 'tennis', awardedAt: Date.now() }];
    const updates = { displayName: name, credits };
    try {
      await setDoc(doc(db, PROFILES_COLLECTION, key), updates, { merge: true });
      profiles[key] = { ...profile, ...updates };
    } catch (err) {
      console.error(err);
    }
  }

  renderActivityFeed();
  renderList();

  const modal = document.getElementById('gameModal');
  modal.innerHTML = `
    <button class="modal-close" id="gameCloseBtn">✕</button>
    <div class="randomizer-result">
      <div class="randomizer-dice">${playerWon ? '🏆' : '😢'}</div>
      <h2>${playerWon ? 'You won the series!' : 'You lost the series.'}</h2>
      <p class="hint">${playerWon ? `+${gameState.winPoints} pts awarded!` : `Your ${GAME_ENTRY_COST} pt entry fee is gone — better luck next time!`}</p>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-primary" id="gamePlayAgainBtn">🎾 Play Again</button>
      <button type="button" class="btn btn-secondary" id="gameDoneBtn">Close</button>
    </div>
  `;
  document.getElementById('gameCloseBtn').addEventListener('click', closeGame);
  document.getElementById('gameDoneBtn').addEventListener('click', closeGame);
  document.getElementById('gamePlayAgainBtn').addEventListener('click', () => openGame());
}

// ---------- Blackjack mini-game ----------
// Standard casino-style rules: dealer hits to 17, natural blackjack pays
// 3:2, regular win pays 1:1, push returns the bet. Hit/Stand/Double Down
// only (no split). Wager is escrowed via spentPoints when the hand is
// dealt, same pattern as the Tennis entry fee.
// Shared allowlist for both casino-style games (Blackjack and Roulette).
const CASINO_ALLOWED_NAMES = ['bdl', 'yee ma', 'kenny', 'ma ma'];
const BLACKJACK_MIN_BET = 5;
const BLACKJACK_MAX_BET = 200;
const BLACKJACK_SUITS = ['♠', '♥', '♦', '♣'];
const BLACKJACK_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function isCasinoGameAllowed(name) {
  return CASINO_ALLOWED_NAMES.includes(normalizeName(name));
}

let blackjackState = null;

function openBlackjack() {
  closeBlackjackHandIfIdle();
  const name = getSavedAuthorName();
  const profile = name ? getProfile(name) : null;
  const available = name ? (getRawPoints(name) - (profile?.spentPoints || 0)) : 0;
  const allowed = name && isCasinoGameAllowed(name);

  const modal = document.getElementById('blackjackModal');
  modal.innerHTML = `
    <button class="modal-close" id="blackjackCloseBtn">✕</button>
    <h2>🃏 Blackjack</h2>
    <div class="shop-name-field">
      <label>Who's playing?</label>
      <input type="text" id="bjNameInput" placeholder="Your name" value="${escapeHtml(name)}">
    </div>
    ${!name ? `
      <p class="hint">Type your name above to play.</p>
    ` : !allowed ? `
      <div class="bj-locked">
        <div class="bj-locked-emoji">🔒</div>
        <p>You must be 21 to play this game.</p>
      </div>
    ` : `
      <p class="hint">Standard casino rules — dealer hits to 17. Blackjack pays 3:2, a regular win pays 1:1, a push returns your bet. Wager ${BLACKJACK_MIN_BET}–${BLACKJACK_MAX_BET} pts.</p>
      <div class="shop-name-field">
        <label>Wager (pts)</label>
        <input type="number" id="bjWagerInput" min="${BLACKJACK_MIN_BET}" max="${Math.min(BLACKJACK_MAX_BET, available)}" step="1" value="${Math.min(BLACKJACK_MIN_BET, available)}">
      </div>
      <p class="shop-balance">You have <strong>${available}</strong> pt${available === 1 ? '' : 's'} to spend</p>
      <div class="modal-actions">
        <button type="button" class="btn btn-primary" id="bjDealBtn" ${available < BLACKJACK_MIN_BET ? 'disabled' : ''}>🃏 Deal</button>
      </div>
    `}
  `;
  document.getElementById('blackjackCloseBtn').addEventListener('click', closeBlackjack);
  document.getElementById('bjNameInput').addEventListener('change', (e) => {
    saveAuthorName(e.target.value.trim());
    openBlackjack();
  });
  const dealBtn = document.getElementById('bjDealBtn');
  if (dealBtn) {
    dealBtn.addEventListener('click', () => {
      const wagerInput = document.getElementById('bjWagerInput');
      const wager = Math.round(Number(wagerInput.value));
      startBlackjackHand(document.getElementById('bjNameInput').value.trim(), wager, available);
    });
  }
  document.getElementById('blackjackOverlay').classList.remove('hidden');
}

function closeBlackjackHandIfIdle() {
  if (!blackjackState || !blackjackState.active) blackjackState = null;
}

function closeBlackjack() {
  if (blackjackState && blackjackState.active) {
    if (!confirm('Leave the hand? Your wager will be lost.')) return;
  }
  blackjackState = null;
  document.getElementById('blackjackOverlay').classList.add('hidden');
}

function buildShuffledDeck() {
  const deck = [];
  BLACKJACK_SUITS.forEach(suit => {
    BLACKJACK_RANKS.forEach(rank => deck.push({ rank, suit }));
  });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(card) {
  if (card.rank === 'A') return 11;
  if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') return 10;
  return Number(card.rank);
}

function handValue(cards) {
  let total = cards.reduce((sum, c) => sum + cardValue(c), 0);
  let aces = cards.filter(c => c.rank === 'A').length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function isBlackjackHand(cards) {
  return cards.length === 2 && handValue(cards) === 21;
}

async function startBlackjackHand(name, wager, available) {
  if (!name || !isCasinoGameAllowed(name)) return;
  if (!Number.isFinite(wager) || wager < BLACKJACK_MIN_BET || wager > Math.min(BLACKJACK_MAX_BET, available)) {
    alert(`Wager must be between ${BLACKJACK_MIN_BET} and ${Math.min(BLACKJACK_MAX_BET, available)} pts.`);
    return;
  }
  const key = normalizeName(name);
  const profile = getProfile(name) || { spentPoints: 0, unlocked: [], credits: [] };
  const updates = { displayName: name, spentPoints: (profile.spentPoints || 0) + wager };
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, key), updates, { merge: true });
    profiles[key] = { ...profile, ...updates };
    saveAuthorName(name);
  } catch (err) {
    console.error(err);
    alert('Could not start the hand — check your internet connection and try again.');
    return;
  }

  const deck = buildShuffledDeck();
  blackjackState = {
    name,
    deck,
    playerHand: [deck.pop(), deck.pop()],
    dealerHand: [deck.pop(), deck.pop()],
    wager,
    canDouble: true,
    active: true,
    revealed: false,
  };

  if (isBlackjackHand(blackjackState.playerHand)) {
    blackjackState.revealed = true;
    finishBlackjackHand();
    return;
  }

  renderBlackjackHand();
}

function bjCardHtml(card, hidden) {
  if (hidden) return `<div class="bj-card bj-card-hidden">🂠</div>`;
  const isRed = card.suit === '♥' || card.suit === '♦';
  return `<div class="bj-card ${isRed ? 'bj-card-red' : ''}">${card.rank}${card.suit}</div>`;
}

function renderBlackjackHand() {
  const g = blackjackState;
  const modal = document.getElementById('blackjackModal');
  const dealerTotalDisplay = g.revealed ? handValue(g.dealerHand) : '?';
  const canDouble = g.canDouble && g.playerHand.length === 2;

  modal.innerHTML = `
    <button class="modal-close" id="blackjackCloseBtn">✕</button>
    <h2>🃏 Blackjack</h2>
    <div class="bj-table">
      <div class="bj-row">
        <div class="bj-row-label">Dealer <span class="bj-total">${dealerTotalDisplay}</span></div>
        <div class="bj-hand">
          ${g.dealerHand.map((c, i) => bjCardHtml(c, !g.revealed && i === 1)).join('')}
        </div>
      </div>
      <div class="bj-row">
        <div class="bj-row-label">You <span class="bj-total">${handValue(g.playerHand)}</span></div>
        <div class="bj-hand">
          ${g.playerHand.map(c => bjCardHtml(c, false)).join('')}
        </div>
      </div>
    </div>
    <div class="bj-wager-line">Wager: <strong>${g.wager}</strong> pts</div>
    <div class="bj-actions">
      <button type="button" class="btn btn-primary" id="bjHitBtn">Hit</button>
      <button type="button" class="btn btn-secondary" id="bjStandBtn">Stand</button>
      ${canDouble ? `<button type="button" class="btn btn-secondary" id="bjDoubleBtn">Double Down (-${g.wager} pts)</button>` : ''}
    </div>
  `;
  document.getElementById('blackjackCloseBtn').addEventListener('click', closeBlackjack);
  document.getElementById('bjHitBtn').addEventListener('click', hitBlackjack);
  document.getElementById('bjStandBtn').addEventListener('click', standBlackjack);
  const doubleBtn = document.getElementById('bjDoubleBtn');
  if (doubleBtn) doubleBtn.addEventListener('click', doubleDownBlackjack);
}

function hitBlackjack() {
  const g = blackjackState;
  g.playerHand.push(g.deck.pop());
  g.canDouble = false;
  if (handValue(g.playerHand) > 21) {
    g.revealed = true;
    finishBlackjackHand();
    return;
  }
  renderBlackjackHand();
}

async function doubleDownBlackjack() {
  const g = blackjackState;
  const name = g.name;
  const profile = getProfile(name) || { spentPoints: 0, unlocked: [], credits: [] };
  const available = getRawPoints(name) - (profile.spentPoints || 0);
  if (available < g.wager) {
    alert("You don't have enough points to double down!");
    return;
  }
  const key = normalizeName(name);
  const updates = { displayName: name, spentPoints: (profile.spentPoints || 0) + g.wager };
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, key), updates, { merge: true });
    profiles[key] = { ...profile, ...updates };
    renderCreditBadge();
  } catch (err) {
    console.error(err);
    alert('Could not double down — check your internet connection and try again.');
    return;
  }
  g.wager *= 2;
  g.canDouble = false;
  g.playerHand.push(g.deck.pop());
  if (handValue(g.playerHand) > 21) {
    g.revealed = true;
    finishBlackjackHand();
    return;
  }
  standBlackjack();
}

function standBlackjack() {
  const g = blackjackState;
  g.revealed = true;
  while (handValue(g.dealerHand) < 17) {
    g.dealerHand.push(g.deck.pop());
  }
  finishBlackjackHand();
}

function resolveBlackjackOutcome(playerHand, dealerHand, wager) {
  const playerTotal = handValue(playerHand);
  const dealerTotal = handValue(dealerHand);
  const playerBJ = isBlackjackHand(playerHand);
  const dealerBJ = isBlackjackHand(dealerHand);

  if (playerTotal > 21) return { outcome: 'bust', payout: 0 };
  if (playerBJ || dealerBJ) {
    if (playerBJ && dealerBJ) return { outcome: 'push', payout: wager };
    if (playerBJ) return { outcome: 'blackjack', payout: wager + Math.round(wager * 1.5) };
    return { outcome: 'lose', payout: 0 };
  }
  if (dealerTotal > 21) return { outcome: 'dealer_bust', payout: wager * 2 };
  if (playerTotal > dealerTotal) return { outcome: 'win', payout: wager * 2 };
  if (playerTotal === dealerTotal) return { outcome: 'push', payout: wager };
  return { outcome: 'lose', payout: 0 };
}

function blackjackReasonText(outcome) {
  switch (outcome) {
    case 'blackjack': return 'hit Blackjack! 🃏 (3:2 payout)';
    case 'win': case 'dealer_bust': return 'won a hand of Blackjack';
    case 'push': return 'pushed on Blackjack (bet returned)';
    default: return 'played Blackjack';
  }
}

async function finishBlackjackHand() {
  const g = blackjackState;
  g.active = false;
  const { outcome, payout } = resolveBlackjackOutcome(g.playerHand, g.dealerHand, g.wager);
  const netPoints = payout - g.wager;
  const name = g.name;
  const key = normalizeName(name);
  const profile = getProfile(name) || { spentPoints: 0, unlocked: [], credits: [] };

  if (payout > 0) {
    const credits = [...(profile.credits || []), { points: payout, displayPoints: netPoints, reason: blackjackReasonText(outcome), source: 'game', gameType: 'blackjack', awardedAt: Date.now() }];
    const updates = { displayName: name, credits };
    try {
      await setDoc(doc(db, PROFILES_COLLECTION, key), updates, { merge: true });
      profiles[key] = { ...profile, ...updates };
    } catch (err) {
      console.error(err);
    }
  }

  renderActivityFeed();
  renderList();
  renderBlackjackResult(outcome, netPoints, g.wager);
}

function renderBlackjackResult(outcome, netPoints, wager) {
  const g = blackjackState;
  const copy = {
    blackjack: { emoji: '🃏', title: 'Blackjack!', detail: `+${netPoints} pts awarded (3:2 payout)!` },
    win: { emoji: '🏆', title: 'You won this hand!', detail: `+${netPoints} pts awarded!` },
    dealer_bust: { emoji: '🏆', title: 'Dealer busts — you win!', detail: `+${netPoints} pts awarded!` },
    push: { emoji: '🤝', title: "Push — it's a tie.", detail: `Your ${wager} pt wager was returned.` },
    bust: { emoji: '😢', title: 'You busted.', detail: `Your ${wager} pt wager is gone — try again?` },
    lose: { emoji: '😢', title: 'The dealer wins this hand.', detail: `Your ${wager} pt wager is gone — try again?` },
  }[outcome];

  const name = g.name;
  const profile = getProfile(name);
  const available = getRawPoints(name) - (profile?.spentPoints || 0);
  const nextWager = Math.max(BLACKJACK_MIN_BET, Math.min(wager, BLACKJACK_MAX_BET, available));
  const canRebet = available >= BLACKJACK_MIN_BET;

  const modal = document.getElementById('blackjackModal');
  modal.innerHTML = `
    <button class="modal-close" id="blackjackCloseBtn">✕</button>
    <div class="bj-table">
      <div class="bj-row">
        <div class="bj-row-label">Dealer <span class="bj-total">${handValue(g.dealerHand)}</span></div>
        <div class="bj-hand">${g.dealerHand.map(c => bjCardHtml(c, false)).join('')}</div>
      </div>
      <div class="bj-row">
        <div class="bj-row-label">You <span class="bj-total">${handValue(g.playerHand)}</span></div>
        <div class="bj-hand">${g.playerHand.map(c => bjCardHtml(c, false)).join('')}</div>
      </div>
    </div>
    <div class="randomizer-result">
      <div class="randomizer-dice">${copy.emoji}</div>
      <h2>${copy.title}</h2>
      <p class="hint">${copy.detail}</p>
    </div>
    <p class="shop-balance">You have <strong>${available}</strong> pt${available === 1 ? '' : 's'} to spend</p>
    ${canRebet ? `
      <div class="shop-name-field">
        <label>Wager (pts)</label>
        <input type="number" id="bjRebetInput" min="${BLACKJACK_MIN_BET}" max="${Math.min(BLACKJACK_MAX_BET, available)}" step="1" value="${nextWager}">
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-primary" id="bjPlayAgainBtn">🃏 Deal Again</button>
        <button type="button" class="btn btn-secondary" id="bjDoneBtn">Close</button>
      </div>
    ` : `
      <p class="hint">You don't have enough points to play another hand.</p>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="bjDoneBtn">Close</button>
      </div>
    `}
  `;
  document.getElementById('blackjackCloseBtn').addEventListener('click', closeBlackjack);
  document.getElementById('bjDoneBtn').addEventListener('click', closeBlackjack);
  const playAgainBtn = document.getElementById('bjPlayAgainBtn');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      const rebetWager = Math.round(Number(document.getElementById('bjRebetInput').value));
      startBlackjackHand(name, rebetWager, available);
    });
  }
}

// ---------- Roulette mini-game ----------
// A 19-pocket wheel (0–18, single zero) so the odds are friendlier than a
// real table. Players place $5/$10 chips on as many board spots as they
// like during a 30s betting window; double-tapping a spot doubles whatever
// chip total is already sitting there. When the clock hits zero the board
// locks, the wheel spins, and every placed bet is settled against the one
// result. Escrow only touches Firestore once (at lock), not per chip tap.
// Same CASINO_ALLOWED_NAMES gate as Blackjack — everyone else gets the
// "you must be 21" message.
const ROULETTE_CHIP_VALUES = [5, 10];
const ROULETTE_BET_SECONDS = 30;
const ROULETTE_MAX_TOTAL_BET = 200;
const ROULETTE_WHEEL_SIZE = 19; // numbers 0–18
// 17:1 (not the traditional 35:1) because with only 19 pockets, 35:1 let a
// player cover every number and walk away with a guaranteed profit — at
// 17:1, covering the whole board is a guaranteed (small) loss, like a real
// wheel's house edge.
const ROULETTE_NUMBER_PAYOUT = 17;
const ROULETTE_RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18]);
const ROULETTE_OUTSIDE_BETS = [
  { id: 'red', label: 'Red', payout: 1, check: n => ROULETTE_RED_NUMBERS.has(n) },
  { id: 'black', label: 'Black', payout: 1, check: n => n !== 0 && !ROULETTE_RED_NUMBERS.has(n) },
  { id: 'odd', label: 'Odd', payout: 1, check: n => n !== 0 && n % 2 === 1 },
  { id: 'even', label: 'Even', payout: 1, check: n => n !== 0 && n % 2 === 0 },
  { id: 'low', label: '1–9', payout: 1, check: n => n >= 1 && n <= 9 },
  { id: 'high', label: '10–18', payout: 1, check: n => n >= 10 && n <= 18 },
  { id: 'six1', label: '1–6', payout: 2, check: n => n >= 1 && n <= 6 },
  { id: 'six2', label: '7–12', payout: 2, check: n => n >= 7 && n <= 12 },
  { id: 'six3', label: '13–18', payout: 2, check: n => n >= 13 && n <= 18 },
];

function rouletteNumberColor(n) {
  if (n === 0) return 'green';
  return ROULETTE_RED_NUMBERS.has(n) ? 'red' : 'black';
}

function rouletteBetDefForSpot(spotId) {
  if (spotId.startsWith('num_')) {
    const n = Number(spotId.slice(4));
    return { label: `Number ${n}`, payout: ROULETTE_NUMBER_PAYOUT, check: result => result === n };
  }
  return ROULETTE_OUTSIDE_BETS.find(b => b.id === spotId);
}

let rouletteTable = null;
let rouletteTapTimestamps = {};

function clearRoulettePendingTaps() {
  Object.values(rouletteTapTimestamps).forEach(handle => clearTimeout(handle));
  rouletteTapTimestamps = {};
}

function openRoulette() {
  if (rouletteTable?.timerHandle) clearInterval(rouletteTable.timerHandle);
  clearRoulettePendingTaps();
  const name = getSavedAuthorName();
  const profile = name ? getProfile(name) : null;
  const available = name ? (getRawPoints(name) - (profile?.spentPoints || 0)) : 0;
  const phase = !name ? 'needs_name' : !isCasinoGameAllowed(name) ? 'not_allowed' : 'betting';
  rouletteTable = {
    name,
    available,
    selectedChip: ROULETTE_CHIP_VALUES[0],
    bets: {},
    phase,
    timerSeconds: ROULETTE_BET_SECONDS,
    timerHandle: null,
    lastResult: null,
  };
  renderRouletteTable();
  document.getElementById('rouletteGameOverlay').classList.remove('hidden');
  if (rouletteTable.phase === 'betting') startRouletteTimer();
}

function closeRoulette() {
  if (rouletteTable?.timerHandle) clearInterval(rouletteTable.timerHandle);
  clearRoulettePendingTaps();
  rouletteTable = null;
  document.getElementById('rouletteGameOverlay').classList.add('hidden');
}

function startRouletteTimer() {
  if (rouletteTable.timerHandle) clearInterval(rouletteTable.timerHandle);
  rouletteTable.timerSeconds = ROULETTE_BET_SECONDS;
  updateRouletteTimerDisplay();
  rouletteTable.timerHandle = setInterval(() => {
    rouletteTable.timerSeconds -= 1;
    updateRouletteTimerDisplay();
    if (rouletteTable.timerSeconds <= 0) {
      clearInterval(rouletteTable.timerHandle);
      lockRouletteBettingAndSpin();
    }
  }, 1000);
}

function updateRouletteTimerDisplay() {
  const el = document.getElementById('rouletteTimerText');
  if (el) el.textContent = `⏱ ${Math.max(0, rouletteTable.timerSeconds)}s`;
}

function rouletteTotalWagered() {
  return Object.values(rouletteTable.bets).reduce((s, v) => s + v, 0);
}

function rouletteBoardSpotHtml(spotId, label, payout, extraClass = '') {
  const amount = rouletteTable.bets[spotId] || 0;
  return `
    <button type="button" class="roulette-bet-btn ${extraClass} ${amount ? 'has-chip' : ''}" data-spot="${spotId}">
      ${label}<span class="roulette-payout-tag">${payout}:1</span>
      <span class="roulette-chip-badge" id="chipBadge-${spotId}">${amount ? '$' + amount : ''}</span>
    </button>
  `;
}

function renderRouletteTable() {
  const t = rouletteTable;
  const modal = document.getElementById('rouletteGameModal');

  if (!t || t.phase === 'needs_name' || t.phase === 'not_allowed') {
    modal.innerHTML = `
      <button class="modal-close" id="rouletteCloseBtn">✕</button>
      <h2>🎡 Roulette</h2>
      <div class="shop-name-field">
        <label>Who's playing?</label>
        <input type="text" id="rouletteNameInput" placeholder="Your name" value="${t?.phase === 'not_allowed' ? escapeHtml(t.name) : ''}">
      </div>
      ${t?.phase === 'not_allowed' ? `
        <div class="bj-locked">
          <div class="bj-locked-emoji">🔒</div>
          <p>You must be 21 to play this game.</p>
        </div>
      ` : `
        <p class="hint">Type your name above to play.</p>
      `}
    `;
    document.getElementById('rouletteCloseBtn').addEventListener('click', closeRoulette);
    document.getElementById('rouletteNameInput').addEventListener('change', (e) => {
      const name = e.target.value.trim();
      if (!name) return;
      saveAuthorName(name);
      openRoulette();
    });
    return;
  }

  const numberSpots = [];
  for (let n = 0; n <= 18; n++) {
    const color = rouletteNumberColor(n);
    numberSpots.push(rouletteBoardSpotHtml(`num_${n}`, n, ROULETTE_NUMBER_PAYOUT, `roulette-number-spot is-${color}`));
  }

  modal.innerHTML = `
    <button class="modal-close" id="rouletteCloseBtn">✕</button>
    <h2>🎡 Roulette</h2>
    <div class="roulette-wheel-stage" id="rouletteWheelStage">
      ${buildRouletteWheelSvg()}
      <div class="roulette-pointer">▼</div>
    </div>
    <div class="roulette-status-row">
      <span class="roulette-status-text" id="rouletteStatusText">${t.phase === 'spinning' ? '🎡 Spinning...' : t.phase === 'locked' ? '🛑 No more bets!' : t.phase === 'result' ? '🎰 Round over!' : 'Place your bets!'}</span>
      <span id="rouletteTimerText">⏱ ${Math.max(0, t.timerSeconds)}s</span>
    </div>
    ${t.lastResult ? `
      <div class="roulette-result-banner">
        <div class="roulette-result-number is-${t.lastResult.color}">${t.lastResult.number}</div>
        <h2>${t.lastResult.netPoints > 0 ? '🏆 You won!' : t.lastResult.netPoints === 0 ? "🤝 You broke even." : '😢 No luck this spin.'}</h2>
        <p class="hint">${t.lastResult.netPoints > 0 ? `+${t.lastResult.netPoints} pts awarded!` : t.lastResult.netPoints === 0 ? 'Your bets were returned.' : `Your ${t.lastResult.totalWagered} pt wager is gone — try again?`}</p>
      </div>
    ` : ''}
    <p class="shop-balance">You have <strong>${t.available}</strong> pt${t.available === 1 ? '' : 's'} to spend · Total bet: <strong id="rouletteTotalBetText">$${rouletteTotalWagered()}</strong></p>
    <div class="roulette-chip-row">
      <span class="hint" style="margin:0;">Chip:</span>
      ${ROULETTE_CHIP_VALUES.map(v => `<button type="button" class="roulette-chip-btn ${t.selectedChip === v ? 'selected' : ''}" data-chip="${v}">$${v}</button>`).join('')}
      <button type="button" class="btn btn-secondary" id="rouletteClearBtn" style="margin-left:auto;">Clear Bets</button>
    </div>
    <div class="roulette-board ${t.phase !== 'betting' ? 'locked' : ''}" id="rouletteBoard">
      <div class="roulette-number-grid">${numberSpots.join('')}</div>
      <div class="roulette-bet-row">
        ${rouletteBoardSpotHtml('red', 'Red', 1, 'is-red')}
        ${rouletteBoardSpotHtml('black', 'Black', 1, 'is-black')}
      </div>
      <div class="roulette-bet-row">
        ${rouletteBoardSpotHtml('odd', 'Odd', 1)}
        ${rouletteBoardSpotHtml('even', 'Even', 1)}
        ${rouletteBoardSpotHtml('low', '1–9', 1)}
        ${rouletteBoardSpotHtml('high', '10–18', 1)}
      </div>
      <div class="roulette-bet-row">
        ${rouletteBoardSpotHtml('six1', '1–6', 2)}
        ${rouletteBoardSpotHtml('six2', '7–12', 2)}
        ${rouletteBoardSpotHtml('six3', '13–18', 2)}
      </div>
    </div>
    <div class="modal-actions">
      ${t.phase === 'result' ? `<button type="button" class="btn btn-primary" id="rouletteNewRoundBtn">🎡 New Round</button>` : ''}
      <button type="button" class="btn btn-secondary" id="rouletteDoneBtn">Close</button>
    </div>
    <p class="hint">Tap a chip then tap the board to bet — double-tap a spot to double what's on it. Numbers pay ${ROULETTE_NUMBER_PAYOUT}:1, sixes pay 2:1, everything else pays 1:1.</p>
  `;

  document.getElementById('rouletteCloseBtn').addEventListener('click', closeRoulette);
  document.getElementById('rouletteDoneBtn').addEventListener('click', closeRoulette);
  document.querySelectorAll('.roulette-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      rouletteTable.selectedChip = Number(btn.dataset.chip);
      document.querySelectorAll('.roulette-chip-btn').forEach(b => b.classList.toggle('selected', b === btn));
    });
  });
  document.getElementById('rouletteClearBtn').addEventListener('click', () => {
    if (rouletteTable.phase !== 'betting') return;
    clearRoulettePendingTaps();
    rouletteTable.bets = {};
    document.querySelectorAll('.roulette-chip-badge').forEach(el => el.textContent = '');
    document.querySelectorAll('.roulette-bet-btn').forEach(el => el.classList.remove('has-chip'));
    updateRouletteTotalBetDisplay();
  });
  document.querySelectorAll('#rouletteBoard .roulette-bet-btn').forEach(btn => {
    btn.addEventListener('click', () => onRouletteSpotTap(btn.dataset.spot));
  });
  const newRoundBtn = document.getElementById('rouletteNewRoundBtn');
  if (newRoundBtn) newRoundBtn.addEventListener('click', startNewRouletteRound);

  if (t.phase === 'spinning' && t.pendingResult) {
    spinRouletteWheelAnimation(t.pendingResult.number);
  }
}

function updateRouletteTotalBetDisplay() {
  const el = document.getElementById('rouletteTotalBetText');
  if (el) el.textContent = `$${rouletteTotalWagered()}`;
}

function onRouletteSpotTap(spotId) {
  if (!rouletteTable || rouletteTable.phase !== 'betting') return;
  // Disambiguate single vs. double tap with a short pending window, rather than
  // just checking "was the last tap recent" — otherwise three-plus rapid taps
  // would double again on every tap instead of only the deliberate pair.
  const pending = rouletteTapTimestamps[spotId];
  if (pending) {
    clearTimeout(pending);
    delete rouletteTapTimestamps[spotId];
    const current = rouletteTable.bets[spotId] || 0;
    commitRouletteBet(spotId, current * 2);
    return;
  }
  rouletteTapTimestamps[spotId] = setTimeout(() => {
    delete rouletteTapTimestamps[spotId];
    const current = rouletteTable.bets[spotId] || 0;
    commitRouletteBet(spotId, current + rouletteTable.selectedChip);
  }, 280);
}

function commitRouletteBet(spotId, newAmount) {
  if (newAmount <= 0) return;
  const current = rouletteTable.bets[spotId] || 0;
  const otherTotal = rouletteTotalWagered() - current;
  if (otherTotal + newAmount > rouletteTable.available || otherTotal + newAmount > ROULETTE_MAX_TOTAL_BET) {
    const stage = document.getElementById('rouletteWheelStage');
    if (stage) {
      stage.classList.remove('shake');
      requestAnimationFrame(() => stage.classList.add('shake'));
    }
    return;
  }

  rouletteTable.bets[spotId] = newAmount;
  const badge = document.getElementById(`chipBadge-${spotId}`);
  if (badge) badge.textContent = `$${newAmount}`;
  const btn = document.querySelector(`.roulette-bet-btn[data-spot="${spotId}"]`);
  if (btn) btn.classList.add('has-chip');
  updateRouletteTotalBetDisplay();
}

function lockRouletteBettingAndSpin() {
  if (!rouletteTable) return;
  clearRoulettePendingTaps();
  rouletteTable.phase = 'locked';
  const statusEl = document.getElementById('rouletteStatusText');
  if (statusEl) statusEl.textContent = '🛑 No more bets!';
  document.getElementById('rouletteBoard')?.classList.add('locked');

  if (rouletteTotalWagered() === 0) {
    setTimeout(() => startNewRouletteRound(), 1200);
    return;
  }
  setTimeout(() => spinRouletteWheel(), 1000);
}

async function spinRouletteWheel() {
  const t = rouletteTable;
  if (!t) return;
  t.phase = 'spinning';
  const name = t.name;
  const key = normalizeName(name);
  const profile = getProfile(name) || { spentPoints: 0, unlocked: [], credits: [] };
  const totalWagered = rouletteTotalWagered();
  const updates = { displayName: name, spentPoints: (profile.spentPoints || 0) + totalWagered };

  try {
    await setDoc(doc(db, PROFILES_COLLECTION, key), updates, { merge: true });
    profiles[key] = { ...profile, ...updates };
    saveAuthorName(name);
  } catch (err) {
    console.error(err);
    alert('Could not place your bets — check your internet connection and try again.');
    t.phase = 'betting';
    renderRouletteTable();
    startRouletteTimer();
    return;
  }

  const resultNumber = Math.floor(Math.random() * ROULETTE_WHEEL_SIZE);
  t.pendingResult = { number: resultNumber, totalWagered };
  const statusEl = document.getElementById('rouletteStatusText');
  if (statusEl) statusEl.textContent = '🎡 Spinning...';
  spinRouletteWheelAnimation(resultNumber, () => finishRouletteSpin(resultNumber, totalWagered));
}

function buildRouletteWheelSvg() {
  const segAngle = 360 / ROULETTE_WHEEL_SIZE;
  const R = 130, cx = 150, cy = 150, labelR = 108;
  let wedges = '';
  let labels = '';
  for (let i = 0; i < ROULETTE_WHEEL_SIZE; i++) {
    const startAngle = i * segAngle - segAngle / 2 - 90;
    const endAngle = startAngle + segAngle;
    const x1 = cx + R * Math.cos(startAngle * Math.PI / 180);
    const y1 = cy + R * Math.sin(startAngle * Math.PI / 180);
    const x2 = cx + R * Math.cos(endAngle * Math.PI / 180);
    const y2 = cy + R * Math.sin(endAngle * Math.PI / 180);
    const colorName = rouletteNumberColor(i);
    const fill = colorName === 'red' ? '#d62839' : colorName === 'black' ? '#1a1a1a' : '#1f4d1f';
    wedges += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 0,1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${fill}" stroke="#3b2a1a" stroke-width="1.5"/>`;
    const midAngle = i * segAngle - 90;
    const lx = cx + labelR * Math.cos(midAngle * Math.PI / 180);
    const ly = cy + labelR * Math.sin(midAngle * Math.PI / 180);
    labels += `<text x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" fill="white" font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="middle">${i}</text>`;
  }
  return `
    <svg viewBox="0 0 300 300" class="roulette-wheel-svg">
      <g id="rouletteWheelGroup" style="transform-box: view-box; transform-origin: center;">
        ${wedges}
        ${labels}
        <circle cx="${cx}" cy="${cy}" r="22" fill="#3b2a1a" stroke="#fff" stroke-width="2"/>
      </g>
      <circle cx="${cx}" cy="${cy}" r="${R + 4}" fill="none" stroke="#3b2a1a" stroke-width="4"/>
    </svg>
  `;
}

function spinRouletteWheelAnimation(resultNumber, onDone) {
  const group = document.getElementById('rouletteWheelGroup');
  if (!group) return;
  const segAngle = 360 / ROULETTE_WHEEL_SIZE;
  const extraSpins = 6;
  const rotation = extraSpins * 360 - resultNumber * segAngle;

  group.style.transition = 'none';
  group.style.transform = 'rotate(0deg)';
  // Force reflow so the reset above takes effect before the new transition starts.
  group.getBoundingClientRect();
  group.style.transition = 'transform 3.5s cubic-bezier(0.12, 0.65, 0.15, 1)';
  group.style.transform = `rotate(${rotation}deg)`;

  document.getElementById('rouletteWheelStage')?.classList.add('spinning');
  if (onDone) {
    setTimeout(() => {
      document.getElementById('rouletteWheelStage')?.classList.remove('spinning');
      document.getElementById('rouletteWheelStage')?.classList.add('landed');
      onDone();
    }, 3600);
  }
}

async function finishRouletteSpin(resultNumber, totalWagered) {
  const t = rouletteTable;
  if (!t) return;
  const name = t.name;
  const key = normalizeName(name);
  const color = rouletteNumberColor(resultNumber);

  const winningSpots = [];
  let payout = 0;
  Object.entries(t.bets).forEach(([spotId, amount]) => {
    const bet = rouletteBetDefForSpot(spotId);
    if (bet && bet.check(resultNumber)) {
      payout += amount + amount * bet.payout;
      winningSpots.push(bet.label);
    }
  });
  const netPoints = payout - totalWagered;

  if (payout > 0) {
    const profile = getProfile(name) || { spentPoints: 0, unlocked: [], credits: [] };
    const reason = netPoints > 0
      ? `won a Roulette spin on ${winningSpots.join(', ')}`
      : netPoints === 0
        ? `broke even on a Roulette spin (hit ${winningSpots.join(', ')})`
        : `still lost overall on a Roulette spin, despite hitting ${winningSpots.join(', ')}`;
    const credits = [...(profile.credits || []), { points: payout, displayPoints: netPoints, reason, source: 'game', gameType: 'roulette', awardedAt: Date.now() }];
    const creditUpdates = { displayName: name, credits };
    try {
      await setDoc(doc(db, PROFILES_COLLECTION, key), creditUpdates, { merge: true });
      profiles[key] = { ...profile, ...creditUpdates };
    } catch (err) {
      console.error(err);
    }
  }

  renderActivityFeed();
  renderList();

  t.phase = 'result';
  t.lastResult = { number: resultNumber, color, netPoints, totalWagered };
  t.available = getRawPoints(name) - (getProfile(name)?.spentPoints || 0);
  t.bets = {};
  delete t.pendingResult;
  renderRouletteTable();
}

function startNewRouletteRound() {
  const t = rouletteTable;
  if (!t) return;
  t.phase = 'betting';
  t.bets = {};
  t.lastResult = null;
  t.available = getRawPoints(t.name) - (getProfile(t.name)?.spentPoints || 0);
  renderRouletteTable();
  startRouletteTimer();
}

// ---------- Activity feed ----------
function computeActivityFeed(limit = 8) {
  const events = [];

  places.forEach(place => {
    if (place.createdAt) {
      events.push({
        type: 'place_added',
        timestamp: place.createdAt,
        placeId: place.id,
        placeName: place.name,
        author: (place.addedBy || '').trim() || 'Someone',
      });
    }
    if (place.lastPhotoAddedAt) {
      events.push({
        type: 'photo_added',
        timestamp: place.lastPhotoAddedAt,
        placeId: place.id,
        placeName: place.name,
        author: place.lastPhotoAddedBy || 'Someone',
      });
    }
    (place.memories || []).forEach(m => {
      if (m.createdAt) {
        events.push({
          type: 'memory_added',
          timestamp: m.createdAt,
          placeId: place.id,
          placeName: place.name,
          author: m.author,
          rating: m.rating,
        });
      }
      if (m.lastReactionAt) {
        events.push({
          type: m.lastReactionType,
          timestamp: m.lastReactionAt,
          placeId: place.id,
          placeName: place.name,
          author: m.lastReactionAuthor || 'Someone',
          memoryAuthor: m.author,
        });
      }
      (m.replies || []).forEach(r => {
        events.push({
          type: 'reply_added',
          timestamp: r.createdAt,
          placeId: place.id,
          placeName: place.name,
          author: r.author,
          memoryAuthor: m.author,
        });
      });
    });
  });

  Object.values(profiles).forEach(profile => {
    (profile.credits || []).forEach(credit => {
      // Blackjack/Roulette results stay private to the player — only Tennis,
      // daily rewards, and moderator credits show up in the shared feed.
      if (credit.gameType === 'blackjack' || credit.gameType === 'roulette') return;
      events.push({
        type: credit.source === 'daily' ? 'daily_reward' : (credit.source === 'game' ? 'game_result' : 'moderator_credit'),
        timestamp: credit.awardedAt,
        creditedName: profile.displayName,
        points: credit.displayPoints ?? credit.points,
        reason: credit.reason,
      });
    });
  });

  (profiles[SITE_ANNOUNCEMENTS_DOC_ID]?.messages || []).forEach(msg => {
    events.push({
      type: 'site_update',
      timestamp: msg.postedAt,
      message: msg.text,
    });
  });

  return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

function timeAgo(ts) {
  const diffMin = Math.floor((Date.now() - ts) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function pointsBadge(points) {
  const sign = points < 0 ? '' : '+';
  return `<span class="activity-points">${sign}${points} pt${Math.abs(points) === 1 ? '' : 's'}</span>`;
}

function activityText(item) {
  const who = authorBadgeHtml(item.author);
  switch (item.type) {
    case 'place_added':
      return `${who} added <strong>${escapeHtml(item.placeName)}</strong> ${pointsBadge(PLACE_ADDED_POINTS)}`;
    case 'photo_added':
      return `${who} added a photo to <strong>${escapeHtml(item.placeName)}</strong> ${pointsBadge(PHOTO_ADDED_POINTS)}`;
    case 'memory_added':
      return `${who} left a ${item.rating}★ memory on <strong>${escapeHtml(item.placeName)}</strong> ${pointsBadge(MEMORY_POSTED_POINTS)}`;
    case 'like':
      return `${who} 👍 liked ${escapeHtml(item.memoryAuthor)}'s memory on <strong>${escapeHtml(item.placeName)}</strong>`;
    case 'dislike':
      return `${who} 👎 disliked ${escapeHtml(item.memoryAuthor)}'s memory on <strong>${escapeHtml(item.placeName)}</strong>`;
    case 'funny':
      return `${who} 😂 found ${escapeHtml(item.memoryAuthor)}'s memory on <strong>${escapeHtml(item.placeName)}</strong> funny`;
    case 'reply_added':
      return `${who} 💬 responded to ${escapeHtml(item.memoryAuthor)}'s memory on <strong>${escapeHtml(item.placeName)}</strong>`;
    case 'moderator_credit':
      return `Moderator credited ${authorBadgeHtml(item.creditedName)} ${pointsBadge(item.points)} for ${escapeHtml(item.reason)}`;
    case 'daily_reward':
      return `${authorBadgeHtml(item.creditedName)} claimed their daily reward ${pointsBadge(item.points)}`;
    case 'game_result':
      return `${authorBadgeHtml(item.creditedName)} ${escapeHtml(item.reason)} ${pointsBadge(item.points)}`;
    case 'site_update':
      return `<strong>New Update:</strong> ${escapeHtml(item.message)}`;
    default:
      return '';
  }
}

function activityIcon(type) {
  return { place_added: '🆕', photo_added: '📸', memory_added: '📝', like: '👍', dislike: '👎', funny: '😂', reply_added: '💬', moderator_credit: '🛡️', daily_reward: '🎁', game_result: '🎾', site_update: '📢' }[type] || '•';
}

function renderActivityFeed() {
  const list = document.getElementById('activityList');
  const feed = computeActivityFeed();

  if (!feed.length) {
    list.innerHTML = `<p class="no-memories">Nothing yet — add a place or leave a memory to start the feed!</p>`;
    return;
  }

  list.innerHTML = feed.map(item => `
    <div class="activity-item ${item.placeId ? '' : 'activity-item-static'}" ${item.placeId ? `data-place-id="${item.placeId}"` : ''}>
      <span class="activity-icon">${activityIcon(item.type)}</span>
      <span class="activity-text">${activityText(item)}</span>
      <span class="activity-time">${timeAgo(item.timestamp)}</span>
    </div>
  `).join('');

  list.querySelectorAll('.activity-item[data-place-id]').forEach(row => {
    row.addEventListener('click', () => openViewModal(row.dataset.placeId));
  });
}

// ---------- Randomizer ----------
function openRandomizer() {
  const pool = getFilteredSorted();
  if (!pool.length) {
    alert('No places match your current search/filter — clear it and try again!');
    return;
  }
  renderRandomizerPick(pool);
  document.getElementById('randomizerOverlay').classList.remove('hidden');
}

function renderRandomizerPick(pool) {
  const place = pool[Math.floor(Math.random() * pool.length)];
  const avg = averageRating(place.memories);
  const modal = document.getElementById('randomizerModal');
  modal.innerHTML = `
    <button class="modal-close" id="randomizerCloseBtn">✕</button>
    <div class="randomizer-result">
      <div class="randomizer-dice">🎲</div>
      <p class="randomizer-tagline">Tonight's pick is...</p>
      ${place.photos && place.photos.length ? `<img class="randomizer-photo" src="${photoUrl(place.photos[0])}" alt="">` : ''}
      <h2>${escapeHtml(place.name)}</h2>
      ${place.cuisine ? `<span class="cuisine-badge">${escapeHtml(place.cuisine)}</span>` : ''}
      ${place.distance ? `<span class="cuisine-badge">🥾 ${escapeHtml(place.distance)}</span>` : ''}
      ${avg ? `<div class="card-rating">★ ${avg}</div>` : ''}
      ${place.location ? `<p class="randomizer-location">📍 ${escapeHtml(place.location)}</p>` : ''}
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-primary" id="randomizerSpinBtn">🎲 Spin Again</button>
      <button type="button" class="btn btn-secondary" id="randomizerViewBtn">View Details</button>
    </div>
  `;
  document.getElementById('randomizerCloseBtn').addEventListener('click', closeRandomizer);
  document.getElementById('randomizerSpinBtn').addEventListener('click', () => renderRandomizerPick(pool));
  document.getElementById('randomizerViewBtn').addEventListener('click', () => {
    closeRandomizer();
    openViewModal(place.id);
  });
}

function closeRandomizer() {
  document.getElementById('randomizerOverlay').classList.add('hidden');
}

// ---------- View modal ----------
function renderPhotoGalleryItems(place) {
  if (!place.photos || !place.photos.length) {
    return `<p class="no-memories">No photos yet — add the first one!</p>`;
  }
  return place.photos.map((photo, i) => `
    <div class="photo-wrap">
      <img src="${photoUrl(photo)}" alt="" data-idx="${i}">
      ${photoAuthor(photo) ? creditBadgeHtml(photoAuthor(photo)) : ''}
      <button type="button" class="photo-delete-btn" data-idx="${i}" title="Delete photo">✕</button>
    </div>
  `).join('');
}

function wireGalleryHandlers(place) {
  const gallery = document.getElementById('photoGallery');
  gallery.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => openLightbox(place.photos, Number(img.dataset.idx), place.website));
  });
  gallery.querySelectorAll('.photo-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deletePhoto(place.id, Number(btn.dataset.idx));
    });
  });
}

async function deletePhoto(placeId, idx) {
  if (!confirm('Delete this photo?')) return;
  const place = places.find(p => p.id === placeId);
  if (!place) return;
  const updated = (place.photos || []).filter((_, i) => i !== idx);
  try {
    await setDoc(doc(db, PLACES_COLLECTION, placeId), { photos: updated }, { merge: true });
    place.photos = updated;
    document.getElementById('photoGallery').innerHTML = renderPhotoGalleryItems(place);
    wireGalleryHandlers(place);
  } catch (err) {
    console.error(err);
    alert('Could not delete photo — check your internet connection and try again.');
  }
}

async function compressImage(file, maxDim = 1280, quality = 0.72) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round(height * maxDim / width);
      width = maxDim;
    } else {
      width = Math.round(width * maxDim / height);
      height = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) return file;
  return new File([blob], (file.name || 'photo').replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}

async function handlePhotoUpload(e, placeId) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  const btn = document.getElementById('addPhotoBtn');
  const originalLabel = btn.textContent;
  btn.disabled = true;
  const place = places.find(p => p.id === placeId);
  if (!place) { e.target.value = ''; btn.disabled = false; return; }

  let uploadedCount = 0;
  try {
    for (const file of files) {
      btn.textContent = '⏳ Uploading…';
      const compressed = await compressImage(file);
      const url = await uploadToImgbb(compressed);
      place.lastPhotoAddedAt = Date.now();
      place.lastPhotoAddedBy = getSavedAuthorName() || 'Someone';
      place.photos = [...(place.photos || []), { url, author: place.lastPhotoAddedBy, uploadedAt: place.lastPhotoAddedAt }];
      await setDoc(doc(db, PLACES_COLLECTION, placeId), {
        photos: place.photos,
        lastPhotoAddedAt: place.lastPhotoAddedAt,
        lastPhotoAddedBy: place.lastPhotoAddedBy,
      }, { merge: true });
      document.getElementById('photoGallery').innerHTML = renderPhotoGalleryItems(place);
      wireGalleryHandlers(place);
      uploadedCount += 1;
      flashLastPhoto();
    }
  } catch (err) {
    console.error(err);
    alert('Photo upload failed — check your internet connection and try again.');
  } finally {
    e.target.value = '';
  }

  if (uploadedCount > 0) {
    btn.textContent = uploadedCount > 1 ? `✓ ${uploadedCount} Added!` : '✓ Added!';
    setTimeout(() => {
      btn.textContent = originalLabel;
      btn.disabled = false;
    }, 1600);
  } else {
    btn.textContent = originalLabel;
    btn.disabled = false;
  }
}

function flashLastPhoto() {
  const wraps = document.querySelectorAll('#photoGallery .photo-wrap');
  const last = wraps[wraps.length - 1];
  if (last) {
    last.classList.add('photo-just-added');
    last.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
  }
}

function getTopContributorName() {
  const board = computeLeaderboard();
  return board.length ? board[0].name : null;
}

function openViewModal(id) {
  const place = places.find(p => p.id === id);
  if (!place) return;

  const memories = place.memories || [];
  const avg = averageRating(memories);
  const topContributor = getTopContributorName();

  const modal = document.getElementById('viewModal');
  modal.innerHTML = `
    <button class="modal-close" id="viewCloseBtn">✕</button>
    <h2>${escapeHtml(place.name)}</h2>
    ${place.cuisine ? `<span class="cuisine-badge">${escapeHtml(place.cuisine)}</span>` : ''}
    ${place.distance ? `<span class="cuisine-badge">🥾 ${escapeHtml(place.distance)}</span>` : ''}

    ${place.location ? `
      <div class="field">
        <label>Location</label>
        <p>${escapeHtml(place.location)}</p>
      </div>` : ''}

    ${place.website ? `
      <div class="field">
        <label>Website</label>
        <a href="${escapeHtml(place.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(place.website)}</a>
      </div>` : ''}

    <div class="field" id="photoFieldWrapper">
      <div class="photo-field-header">
        <label>Photos</label>
        <button type="button" class="btn-add-photo" id="addPhotoBtn">📸 Add Photo (+${PHOTO_ADDED_POINTS} pts)</button>
        <input type="file" id="photoInput" accept="image/*" multiple class="visually-hidden">
      </div>
      <div class="photo-gallery" id="photoGallery">${renderPhotoGalleryItems(place)}</div>
    </div>

    <div class="memories-section">
      <div class="memories-heading">
        <span>Memories</span>
        ${avg ? `<span class="memories-avg">${renderStarsDisplay(Math.round(avg))} ${avg} (${memories.length})</span>` : ''}
      </div>

      <div id="memoryList">
        ${memories.length ? memories.map(m => {
          const isTop = topContributor && (m.author || '').trim() === topContributor;
          const reaction = getReaction(m.id);
          const authorProfile = getProfile(m.author);
          const skin = authorProfile?.equippedSkin ? SHOP_SKINS.find(s => s.id === authorProfile.equippedSkin) : null;
          const bubbleBg = skin && !skin.animationClass ? skinBackgroundCss(skin) : (skin ? '' : (m.color || BUBBLE_COLORS[0]));
          const skinClass = skin?.animationClass || '';
          const bubbleOutline = bubbleOutlineCss(authorProfile?.equippedOutlineStyle, authorProfile?.equippedOutlineColor);
          const outlineClass = outlineAnimationClass(authorProfile?.equippedOutlineStyle);
          return `
          <div class="memory-bubble ${isTop ? 'memory-bubble-top' : ''} ${skinClass} ${outlineClass}" style="background:${bubbleBg};${bubbleOutline}">
            <div class="memory-card-top">
              <span class="memory-author">${authorBadgeHtml(m.author)} ${isTop ? '<span class="top-badge">🥇 #1</span>' : ''}</span>
              <div class="memory-actions">
                ${renderStarsDisplay(m.rating)}
                <button type="button" class="memory-icon-btn memory-edit-btn" data-id="${m.id}" title="Edit">✎</button>
                <button type="button" class="memory-icon-btn memory-delete-btn" data-id="${m.id}" title="Delete">✕</button>
              </div>
            </div>
            ${m.text ? `<p class="memory-text">${escapeHtml(m.text)}</p>` : ''}
            <div class="memory-reactions">
              <button type="button" class="reaction-btn ${reaction === 'like' ? 'reaction-active' : ''}" data-type="like" data-id="${m.id}">👍 ${m.likes || 0}</button>
              <button type="button" class="reaction-btn ${reaction === 'dislike' ? 'reaction-active' : ''}" data-type="dislike" data-id="${m.id}">👎 ${m.dislikes || 0}</button>
              <button type="button" class="reaction-btn ${reaction === 'funny' ? 'reaction-active' : ''}" data-type="funny" data-id="${m.id}">😂 ${m.funny || 0}</button>
              <button type="button" class="reaction-btn-look reply-toggle-btn" data-id="${m.id}">💬 Reply${(m.replies || []).length ? ` (${m.replies.length})` : ''}</button>
            </div>
            ${(m.replies || []).length ? `
              <div class="reply-list">
                ${m.replies.map(r => `
                  <div class="reply-item">
                    <span class="reply-author">${authorBadgeHtml(r.author)}</span>
                    <span class="reply-text">${escapeHtml(r.text)}</span>
                    <button type="button" class="reply-delete-btn" data-memory-id="${m.id}" data-reply-id="${r.id}" title="Delete reply">✕</button>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            <div class="reply-form" data-id="${m.id}" style="display:none;">
              <input type="text" class="reply-author-input" placeholder="Your name" value="${escapeHtml(getSavedAuthorName())}">
              <input type="text" class="reply-text-input" placeholder="Write a reply…">
              <button type="button" class="btn-reply-submit" data-id="${m.id}">Send</button>
            </div>
          </div>
        `;
        }).join('') : `<p class="no-memories">No memories yet — be the first!</p>`}
      </div>

      <div class="memory-form">
        <label>Who are you?</label>
        <input type="text" id="memoryAuthorInput" placeholder="Your name" value="${escapeHtml(getSavedAuthorName())}">

        <label>Pick your color</label>
        <div class="color-input" id="memoryColorInput">
          ${BUBBLE_COLORS.map(c => `<span class="color-swatch ${c === getSavedAuthorColor() ? 'color-selected' : ''}" data-value="${c}" style="background:${c}"></span>`).join('')}
        </div>

        <label>Your rating</label>
        <div class="star-input" id="memoryStarInput">
          ${[1, 2, 3, 4, 5].map(i => `<span class="star star-pick" data-value="${i}">★</span>`).join('')}
        </div>

        <label>Your memory</label>
        <textarea id="memoryTextInput" placeholder="What did you think?"></textarea>

        <div class="memory-form-actions">
          <button type="button" class="btn btn-primary" id="postMemoryBtn">+ Add Your Memory</button>
          <button type="button" class="cancel-edit-btn" id="cancelEditBtn" style="display:none;">Cancel edit</button>
        </div>
      </div>
    </div>

    ${place.notes ? `
      <div class="field original-note">
        <label>Original Note</label>
        <p>${escapeHtml(place.notes)}</p>
      </div>` : ''}

    <div class="modal-actions">
      <button class="btn btn-secondary" id="editPlaceBtn">Edit</button>
    </div>
  `;

  wireGalleryHandlers(place);

  document.getElementById('addPhotoBtn').addEventListener('click', () => {
    document.getElementById('photoInput').click();
  });
  document.getElementById('photoInput').addEventListener('change', (e) => handlePhotoUpload(e, place.id));

  const formState = { rating: 0, color: getSavedAuthorColor(), editingId: null };

  const starInput = document.getElementById('memoryStarInput');
  function setStarUI(rating) {
    formState.rating = rating;
    starInput.querySelectorAll('.star-pick').forEach(s => {
      s.classList.toggle('star-filled', Number(s.dataset.value) <= rating);
    });
  }
  starInput.querySelectorAll('.star-pick').forEach(star => {
    star.addEventListener('click', () => setStarUI(Number(star.dataset.value)));
  });

  const colorInput = document.getElementById('memoryColorInput');
  function setColorUI(color) {
    formState.color = color;
    colorInput.querySelectorAll('.color-swatch').forEach(s => {
      s.classList.toggle('color-selected', s.dataset.value === color);
    });
  }
  colorInput.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => setColorUI(swatch.dataset.value));
  });

  function resetMemoryForm() {
    formState.editingId = null;
    document.getElementById('memoryAuthorInput').value = getSavedAuthorName();
    document.getElementById('memoryTextInput').value = '';
    setStarUI(0);
    setColorUI(getSavedAuthorColor());
    document.getElementById('postMemoryBtn').textContent = '+ Add Your Memory';
    document.getElementById('cancelEditBtn').style.display = 'none';
  }

  function startEditMemory(memoryId) {
    const memory = (place.memories || []).find(m => m.id === memoryId);
    if (!memory) return;
    formState.editingId = memoryId;
    document.getElementById('memoryAuthorInput').value = memory.author;
    document.getElementById('memoryTextInput').value = memory.text || '';
    setStarUI(memory.rating);
    setColorUI(memory.color || BUBBLE_COLORS[0]);
    document.getElementById('postMemoryBtn').textContent = '💾 Save Changes';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
    document.getElementById('memoryAuthorInput').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  modal.querySelectorAll('.memory-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => startEditMemory(btn.dataset.id));
  });
  modal.querySelectorAll('.memory-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteMemory(place.id, btn.dataset.id));
  });
  modal.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleReaction(place.id, btn.dataset.id, btn.dataset.type));
  });
  modal.querySelectorAll('.reply-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = modal.querySelector(`.reply-form[data-id="${btn.dataset.id}"]`);
      if (!form) return;
      const showing = form.style.display !== 'none';
      modal.querySelectorAll('.reply-form').forEach(f => { f.style.display = 'none'; });
      form.style.display = showing ? 'none' : 'flex';
      if (!showing) form.querySelector('.reply-text-input').focus();
    });
  });
  modal.querySelectorAll('.btn-reply-submit').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = modal.querySelector(`.reply-form[data-id="${btn.dataset.id}"]`);
      const author = form.querySelector('.reply-author-input').value.trim();
      const text = form.querySelector('.reply-text-input').value.trim();
      submitReply(place.id, btn.dataset.id, author, text);
    });
  });
  modal.querySelectorAll('.reply-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteReply(place.id, btn.dataset.memoryId, btn.dataset.replyId));
  });

  document.getElementById('cancelEditBtn').addEventListener('click', resetMemoryForm);

  document.getElementById('postMemoryBtn').addEventListener('click', () => {
    submitMemory(place.id, formState.rating, formState.color, formState.editingId);
  });

  document.getElementById('viewCloseBtn').addEventListener('click', closeViewModal);
  document.getElementById('editPlaceBtn').addEventListener('click', () => {
    closeViewModal();
    openFormModal(place.id);
  });

  document.getElementById('viewOverlay').classList.remove('hidden');
}

async function submitMemory(placeId, rating, color, editingId) {
  const authorInput = document.getElementById('memoryAuthorInput');
  const textInput = document.getElementById('memoryTextInput');
  const author = authorInput.value.trim();
  const text = textInput.value.trim();

  if (!author) {
    alert('Let us know who you are first!');
    return;
  }
  if (!rating) {
    alert('Pick a star rating first!');
    return;
  }

  const place = places.find(p => p.id === placeId);
  if (!place) return;

  const chosenColor = color || BUBBLE_COLORS[0];
  let updatedMemories;
  if (editingId) {
    updatedMemories = (place.memories || []).map(m =>
      m.id === editingId ? { ...m, author, rating, text, color: chosenColor } : m
    );
  } else {
    const newMemory = { id: uid(), author, rating, text, color: chosenColor, createdAt: Date.now() };
    updatedMemories = [...(place.memories || []), newMemory];
  }

  const postBtn = document.getElementById('postMemoryBtn');
  postBtn.disabled = true;
  postBtn.textContent = editingId ? 'Saving…' : 'Posting…';

  try {
    await setDoc(doc(db, PLACES_COLLECTION, placeId), { memories: updatedMemories }, { merge: true });
    saveAuthorName(author);
    saveAuthorColor(chosenColor);
    place.memories = updatedMemories;
    openViewModal(placeId);
  } catch (err) {
    console.error(err);
    alert('Could not post your memory — check your internet connection and try again.');
    postBtn.disabled = false;
    postBtn.textContent = editingId ? '💾 Save Changes' : '+ Add Your Memory';
  }
}

async function deleteMemory(placeId, memoryId) {
  if (!confirm('Delete this memory?')) return;
  const place = places.find(p => p.id === placeId);
  if (!place) return;
  const updatedMemories = (place.memories || []).filter(m => m.id !== memoryId);
  try {
    await setDoc(doc(db, PLACES_COLLECTION, placeId), { memories: updatedMemories }, { merge: true });
    place.memories = updatedMemories;
    openViewModal(placeId);
  } catch (err) {
    console.error(err);
    alert('Could not delete — check your internet connection and try again.');
  }
}

const REACTION_COUNT_FIELD = { like: 'likes', dislike: 'dislikes', funny: 'funny' };

async function toggleReaction(placeId, memoryId, type) {
  const place = places.find(p => p.id === placeId);
  if (!place) return;
  const current = getReaction(memoryId);
  const next = current === type ? null : type;

  const updatedMemories = (place.memories || []).map(m => {
    if (m.id !== memoryId) return m;
    const counts = { likes: m.likes || 0, dislikes: m.dislikes || 0, funny: m.funny || 0 };
    if (current) {
      const field = REACTION_COUNT_FIELD[current];
      counts[field] = Math.max(0, counts[field] - 1);
    }
    if (next) {
      const field = REACTION_COUNT_FIELD[next];
      counts[field] = counts[field] + 1;
    }
    const updated = { ...m, ...counts };
    if (next) {
      updated.lastReactionType = next;
      updated.lastReactionAuthor = getSavedAuthorName() || 'Someone';
      updated.lastReactionAt = Date.now();
    }
    return updated;
  });

  try {
    await setDoc(doc(db, PLACES_COLLECTION, placeId), { memories: updatedMemories }, { merge: true });
    saveReaction(memoryId, next);
    place.memories = updatedMemories;
    openViewModal(placeId);
  } catch (err) {
    console.error(err);
    alert('Could not save your reaction — check your internet connection and try again.');
  }
}

async function submitReply(placeId, memoryId, author, text) {
  if (!author || !text) {
    alert('Add your name and a reply first!');
    return;
  }
  const place = places.find(p => p.id === placeId);
  if (!place) return;

  const newReply = { id: uid(), author, text, createdAt: Date.now() };
  const updatedMemories = (place.memories || []).map(m =>
    m.id === memoryId ? { ...m, replies: [...(m.replies || []), newReply] } : m
  );

  try {
    await setDoc(doc(db, PLACES_COLLECTION, placeId), { memories: updatedMemories }, { merge: true });
    saveAuthorName(author);
    place.memories = updatedMemories;
    openViewModal(placeId);
  } catch (err) {
    console.error(err);
    alert('Could not post your reply — check your internet connection and try again.');
  }
}

async function deleteReply(placeId, memoryId, replyId) {
  if (!confirm('Delete this reply?')) return;
  const place = places.find(p => p.id === placeId);
  if (!place) return;
  const updatedMemories = (place.memories || []).map(m =>
    m.id === memoryId ? { ...m, replies: (m.replies || []).filter(r => r.id !== replyId) } : m
  );
  try {
    await setDoc(doc(db, PLACES_COLLECTION, placeId), { memories: updatedMemories }, { merge: true });
    place.memories = updatedMemories;
    openViewModal(placeId);
  } catch (err) {
    console.error(err);
    alert('Could not delete the reply — check your internet connection and try again.');
  }
}

function closeViewModal() {
  document.getElementById('viewOverlay').classList.add('hidden');
}

// ---------- Lightbox ----------
let lightboxState = { photos: [], index: 0, website: null };

function openLightbox(photos, index, website) {
  lightboxState = { photos: photos || [], index: index || 0, website };
  renderLightboxImage();
  document.getElementById('lightboxOverlay').classList.remove('hidden');
}

function renderLightboxImage() {
  const { photos, index, website } = lightboxState;
  if (!photos.length) return;
  document.getElementById('lightboxImg').src = photoUrl(photos[index]);
  const link = document.getElementById('lightboxWebsiteLink');
  if (website) {
    link.href = website;
    link.style.display = 'inline-block';
  } else {
    link.style.display = 'none';
  }
  const showNav = photos.length > 1;
  document.getElementById('lightboxPrevBtn').style.display = showNav ? 'flex' : 'none';
  document.getElementById('lightboxNextBtn').style.display = showNav ? 'flex' : 'none';
}

function navigateLightbox(delta) {
  const { photos } = lightboxState;
  if (photos.length < 2) return;
  lightboxState.index = (lightboxState.index + delta + photos.length) % photos.length;
  renderLightboxImage();
}

function closeLightbox() {
  document.getElementById('lightboxOverlay').classList.add('hidden');
}

// ---------- Add/Edit form ----------
function populateCuisineSelect(selected, category) {
  const select = document.getElementById('fCuisine');
  const options = CATEGORY_CONFIG[category].tagOptions;
  select.innerHTML = options.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  select.value = selected || 'Other';
}

function openFormModal(id) {
  const place = id ? places.find(p => p.id === id) : null;
  const placeId = place ? place.id : uid();
  const category = place ? (place.category || 'eats') : activeCategory();
  const config = CATEGORY_CONFIG[category];

  document.getElementById('formTitle').textContent = place ? 'Edit Place' : `Add ${config.singular}`;
  document.getElementById('placeId').value = placeId;
  document.getElementById('fName').value = place ? place.name : '';
  document.getElementById('fCuisineLabel').textContent = config.tagLabel;
  populateCuisineSelect(place ? place.cuisine : 'Other', category);
  document.getElementById('fLocation').value = place ? place.location : '';
  document.getElementById('fWebsite').value = place ? place.website : '';
  document.getElementById('addressHint').textContent = '';
  document.getElementById('deletePlaceBtn').style.display = place ? 'inline-block' : 'none';

  const distanceField = document.getElementById('fDistanceField');
  if (config.hasDistance) {
    distanceField.style.display = '';
    document.getElementById('fDistance').value = place ? (place.distance || '') : '';
  } else {
    distanceField.style.display = 'none';
  }

  const authorField = document.getElementById('fAuthorField');
  if (place) {
    authorField.style.display = 'none';
  } else {
    authorField.style.display = '';
    document.getElementById('fAuthor').value = getSavedAuthorName();
  }

  document.getElementById('formOverlay').classList.remove('hidden');
}

function closeFormModal() {
  document.getElementById('formOverlay').classList.add('hidden');
}

async function uploadToImgbb(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Upload failed');
  return json.data.url;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('placeId').value;
  const name = document.getElementById('fName').value.trim();
  if (!name) return;

  const isNewPlace = !places.find(p => p.id === id);

  const data = {
    name,
    country: state.activeTab,
    cuisine: document.getElementById('fCuisine').value,
    location: document.getElementById('fLocation').value.trim(),
    website: document.getElementById('fWebsite').value.trim(),
  };

  const category = isNewPlace ? activeCategory() : (places.find(p => p.id === id)?.category || 'eats');
  if (CATEGORY_CONFIG[category].hasDistance) {
    data.distance = document.getElementById('fDistance').value.trim();
  }

  if (isNewPlace) {
    data.createdAt = Date.now();
    data.category = category;
    const author = document.getElementById('fAuthor').value.trim();
    if (author) {
      data.addedBy = author;
      saveAuthorName(author);
    }
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving…';

  try {
    await setDoc(doc(db, PLACES_COLLECTION, id), data, { merge: true });
    closeFormModal();
  } catch (err) {
    console.error(err);
    alert('Could not save — check your internet connection and try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
}

async function handleDelete() {
  const id = document.getElementById('placeId').value;
  if (!id) return;
  if (!confirm('Remove this place from the album? This cannot be undone.')) return;
  try {
    await deleteDoc(doc(db, PLACES_COLLECTION, id));
    closeFormModal();
  } catch (err) {
    console.error(err);
    alert('Could not delete — check your internet connection and try again.');
  }
}

// ---------- Lookup helpers (free, no API key) ----------
async function findAddress() {
  const name = document.getElementById('fName').value.trim();
  const hint = document.getElementById('addressHint');
  if (!name) {
    hint.textContent = 'Type the place name first.';
    return;
  }
  const btn = document.getElementById('findAddressBtn');
  btn.disabled = true;
  btn.textContent = 'Searching…';
  hint.textContent = '';
  try {
    const viewbox = COUNTRY_VIEWBOX[state.activeTab];
    const params = new URLSearchParams({ format: 'json', limit: '1', q: name });
    if (viewbox) {
      params.set('viewbox', viewbox);
      params.set('bounded', '1');
    }
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
    const results = await res.json();
    if (results && results.length) {
      document.getElementById('fLocation').value = results[0].display_name;
      hint.textContent = 'Found it — feel free to edit if it\'s not quite right.';
    } else {
      hint.textContent = 'Couldn\'t find that one automatically — type it in manually.';
    }
  } catch (err) {
    hint.textContent = 'Lookup failed — type the address in manually.';
  } finally {
    btn.disabled = false;
    btn.textContent = '📍 Find Address';
  }
}

function findWebsite() {
  const name = document.getElementById('fName').value.trim();
  if (!name) return;
  const query = `${name} ${state.activeTab} official website`;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener');
}

// ---------- Wire up ----------
document.getElementById('addPlaceBtn').addEventListener('click', () => openFormModal(null));
document.getElementById('formCloseBtn').addEventListener('click', closeFormModal);
document.getElementById('placeForm').addEventListener('submit', handleFormSubmit);
document.getElementById('deletePlaceBtn').addEventListener('click', handleDelete);
document.getElementById('findAddressBtn').addEventListener('click', findAddress);
document.getElementById('findWebsiteBtn').addEventListener('click', findWebsite);

document.getElementById('leaderboardBtn').addEventListener('click', () => { closeAppMenu(); openLeaderboard(); });
document.getElementById('randomizerBtn').addEventListener('click', () => { closeAppMenu(); openRandomizer(); });
document.getElementById('shopBtn').addEventListener('click', () => { closeAppMenu(); openShop(); });
document.getElementById('moderatorBtn').addEventListener('click', openModerator);
document.getElementById('creditBadge').addEventListener('click', openLeaderboard);
document.getElementById('gameBtn').addEventListener('click', () => { closeAppMenu(); openGame(); });
document.getElementById('blackjackBtn').addEventListener('click', () => { closeAppMenu(); openBlackjack(); });
document.getElementById('rouletteBtn').addEventListener('click', () => { closeAppMenu(); openRoulette(); });

document.getElementById('appMenuBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('appMenuPanel').classList.toggle('hidden');
});
document.getElementById('miniGamesToggleBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('miniGamesSubmenu').classList.toggle('hidden');
  document.getElementById('miniGamesCaret').classList.toggle('open');
});
function closeAppMenu() {
  document.getElementById('appMenuPanel').classList.add('hidden');
  document.getElementById('miniGamesSubmenu').classList.add('hidden');
  document.getElementById('miniGamesCaret').classList.remove('open');
}
document.addEventListener('click', (e) => {
  const panel = document.getElementById('appMenuPanel');
  if (!panel.classList.contains('hidden') && !panel.contains(e.target) && e.target.id !== 'appMenuBtn') {
    closeAppMenu();
  }
});

document.getElementById('searchBox').addEventListener('input', (e) => {
  state.search = e.target.value;
  renderList();
});

document.getElementById('sortSelect').addEventListener('change', (e) => {
  state.sort = e.target.value;
  renderList();
});

document.getElementById('cuisineFilterSelect').addEventListener('change', (e) => {
  state.cuisineFilter = e.target.value;
  renderList();
});

document.getElementById('filtersToggleBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('filtersPanel').classList.toggle('hidden');
});
document.addEventListener('click', (e) => {
  const panel = document.getElementById('filtersPanel');
  if (!panel.classList.contains('hidden') && !panel.contains(e.target) && e.target.id !== 'filtersToggleBtn') {
    panel.classList.add('hidden');
  }
});

document.getElementById('dailyRewardBubble').addEventListener('click', claimDailyReward);

document.getElementById('lightboxCloseBtn').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrevBtn').addEventListener('click', () => navigateLightbox(-1));
document.getElementById('lightboxNextBtn').addEventListener('click', () => navigateLightbox(1));
document.getElementById('lightboxOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'lightboxOverlay') closeLightbox();
});

let lightboxTouchStartX = null;
document.getElementById('lightboxImg').addEventListener('touchstart', (e) => {
  lightboxTouchStartX = e.touches[0].clientX;
});
document.getElementById('lightboxImg').addEventListener('touchend', (e) => {
  if (lightboxTouchStartX === null) return;
  const dx = e.changedTouches[0].clientX - lightboxTouchStartX;
  if (Math.abs(dx) > 50) navigateLightbox(dx < 0 ? 1 : -1);
  lightboxTouchStartX = null;
});

document.getElementById('viewOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'viewOverlay') closeViewModal();
});
document.getElementById('formOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'formOverlay') closeFormModal();
});
document.getElementById('leaderboardOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'leaderboardOverlay') closeLeaderboard();
});
document.getElementById('randomizerOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'randomizerOverlay') closeRandomizer();
});
document.getElementById('shopOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'shopOverlay') closeShop();
});
document.getElementById('moderatorOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'moderatorOverlay') closeModerator();
});
document.getElementById('gameOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'gameOverlay') closeGame();
});
document.getElementById('blackjackOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'blackjackOverlay') closeBlackjack();
});
document.getElementById('rouletteGameOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'rouletteGameOverlay') closeRoulette();
});

populateCuisineFilterSelect();
renderTabs();
renderList();
renderDailyRewardBubble();
ensureSeeded().finally(subscribeToPlaces);
subscribeToProfiles();

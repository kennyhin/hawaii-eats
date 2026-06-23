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
    return `${wash}, url('${skin.image}?v=20260622l') center/cover no-repeat`;
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

const SHOP_TENNIS_COURTS = [
  { id: 'court_clay', label: 'Clay Red', hex: '#8a3f20', cost: TENNIS_COURT_COST },
  { id: 'court_grass', label: 'Grass Green', hex: '#1f4d1f', cost: TENNIS_COURT_COST },
  { id: 'court_purple', label: 'Royal Purple', hex: '#3b2a5e', cost: TENNIS_COURT_COST },
  { id: 'court_charcoal', label: 'Charcoal', hex: '#1a1a1a', cost: TENNIS_COURT_COST },
  { id: 'court_teal', label: 'Ocean Teal', hex: '#0e4d52', cost: TENNIS_COURT_COST },
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
    <p class="leaderboard-legend">Icons ${ICON_COST} pts · Name colors ${COLOR_COST} pts · Basic skins ${BASIC_SKIN_COST} pts · Custom skins ${SKIN_COST} pts · Outline style ${OUTLINE_STYLE_COST} pts · Outline color ${OUTLINE_COLOR_COST} pts · ✨ Dynamic skins/outlines ${ANIMATED_COST} pts · 🎾 Tennis racket/ball ${TENNIS_RACKET_COST} pts · 🎾 Tennis court ${TENNIS_COURT_COST} pts</p>

    <div class="shop-name-field">
      <label>Who are you?</label>
      <input type="text" id="shopNameInput" placeholder="Your name" value="${escapeHtml(name)}">
    </div>

    ${name ? `<p class="shop-balance">You have <strong>${available}</strong> pt${available === 1 ? '' : 's'} to spend</p>`
      : `<p class="hint">Type your name above to see your balance and start shopping.</p>`}

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

function renderModeratorAwardForm(creditStatus, updateStatus) {
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

async function claimDailyReward() {
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
  easy: { label: 'Easy', emoji: '🟢', cpuSpeed: 2.2, randomness: 55, winPoints: 5 },
  medium: { label: 'Medium', emoji: '🟡', cpuSpeed: 3.5, randomness: 30, winPoints: 10 },
  hard: { label: 'Hard', emoji: '🔴', cpuSpeed: 5.5, randomness: 10, winPoints: 20 },
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
  const courtColor = SHOP_TENNIS_COURTS.find(c => c.id === profile?.equippedTennisCourt)?.hex || '#0c2b2e';

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
  ctx.fillStyle = g.courtColor;
  ctx.fillRect(0, 0, g.w, g.h);
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
    const credits = [...(profile.credits || []), { points: gameState.winPoints, reason: 'won a Tennis series', source: 'game', awardedAt: Date.now() }];
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
      events.push({
        type: credit.source === 'daily' ? 'daily_reward' : (credit.source === 'game' ? 'game_result' : 'moderator_credit'),
        timestamp: credit.awardedAt,
        creditedName: profile.displayName,
        points: credit.points,
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
document.getElementById('gameBtn').addEventListener('click', () => { closeAppMenu(); openGame(); });

document.getElementById('appMenuBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('appMenuPanel').classList.toggle('hidden');
});
function closeAppMenu() {
  document.getElementById('appMenuPanel').classList.add('hidden');
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

populateCuisineFilterSelect();
renderTabs();
renderList();
renderDailyRewardBubble();
ensureSeeded().finally(subscribeToPlaces);
subscribeToProfiles();

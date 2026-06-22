import { db } from './firebase.js';
import {
  collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { IMGBB_API_KEY } from './imgbb-config.js';

const PLACES_COLLECTION = 'places';
const PROFILES_COLLECTION = 'profiles';

const ICON_COST = 10;
const COLOR_COST = 25;
const SKIN_COST = 40;

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
];

// Gradient skins get a translucent white wash mixed in (via the `overlay`
// opacity) so memory text stays readable on top of them. Image-based custom
// skins (dropped in /skins/) use `image` + the same overlay technique.
const SHOP_SKINS = [
  { id: 'skin_stripes', label: 'Stripes', cost: SKIN_COST, overlay: 0.45, css: 'repeating-linear-gradient(45deg, #fca47c, #fca47c 10px, #f9d779 10px, #f9d779 20px)' },
  { id: 'skin_sparkle', label: 'Sparkle', cost: SKIN_COST, overlay: 0.25, css: 'radial-gradient(circle at 20% 25%, #fff8d6 0%, transparent 14%), radial-gradient(circle at 70% 65%, #fff8d6 0%, transparent 10%), radial-gradient(circle at 45% 80%, #fff8d6 0%, transparent 8%), linear-gradient(135deg, #d8c6f0, #aee3f0)' },
  { id: 'skin_sunset', label: 'Sunset', cost: SKIN_COST, overlay: 0.35, css: 'linear-gradient(135deg, #fca47c, #f9d779, #23ced9)' },
  { id: 'skin_polka', label: 'Polka Dots', cost: SKIN_COST, overlay: 0.25, css: 'radial-gradient(circle, #ffffff 28%, transparent 30%) 0 0/18px 18px, #a1cca6' },
  { id: 'skin_galaxy', label: 'Galaxy', cost: SKIN_COST, overlay: 0.55, css: 'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.55) 0%, transparent 6%), radial-gradient(circle at 65% 55%, rgba(255,255,255,0.4) 0%, transparent 5%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.45) 0%, transparent 4%), linear-gradient(135deg, #2c2a26, #097c87)' },
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
];

function skinBackgroundCss(skin) {
  const overlay = skin.overlay ?? 0.4;
  const wash = `linear-gradient(rgba(255,255,255,${overlay}), rgba(255,255,255,${overlay}))`;
  if (skin.image) {
    return `${wash}, url('${skin.image}?v=20260621n') center/cover no-repeat`;
  }
  return `${wash}, ${skin.css}`;
}

const SHOP_CATALOG = { icon: SHOP_ICONS, color: SHOP_COLORS, skin: SHOP_SKINS };
const EQUIP_FIELD = { icon: 'equippedIcon', color: 'equippedColor', skin: 'equippedSkin' };
const COUNTRIES = ['Hawaii', 'Japan'];
// left,top,right,bottom (lon/lat) per Nominatim viewbox format
const COUNTRY_VIEWBOX = {
  Hawaii: '-160.3,22.3,-154.7,18.8',
  Japan: '129,46,146,24',
};
const CUISINES = [
  'Hawaiian / Local', 'Japanese', 'Korean', 'Chinese', 'Vietnamese',
  'Italian', 'American', 'Burgers', 'Fast Food', 'Pizza', 'Seafood',
  'Mediterranean', 'Asian Fusion', 'Bakery', 'Dessert / Shave Ice',
  'Food Court / Variety', 'Other',
];

// Hawaii is split into sub-sections (Eats / Beaches / Hikes). Each reuses the
// same place/photo/memory/leaderboard machinery, but the "type" dropdown and
// extra fields differ per section. Japan has no sub-sections — it's eats-only.
const CATEGORIES = ['eats', 'beaches', 'hikes'];
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
    btn.className = 'tab-btn' + (state.activeTab === country ? ' active' : '');
    btn.textContent = country;
    btn.addEventListener('click', () => {
      state.activeTab = country;
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
  if (state.activeTab !== 'Hawaii') {
    el.innerHTML = '';
    el.style.display = 'none';
    updateAddPlaceBtnLabel();
    return;
  }
  el.style.display = '';
  el.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn tab-btn-sub' + (state.activeCategory === cat ? ' active' : '');
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
  return state.activeTab === 'Hawaii' ? state.activeCategory : 'eats';
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

function placeCardHtml(p, rank) {
  const avg = averageRating(p.memories);
  return `
    <div class="place-card" data-id="${p.id}">
      ${rank ? `<div class="rank-badge">#${rank}</div>` : ''}
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

  const scopeLabel = state.activeTab === 'Hawaii' ? `Hawaii ${CATEGORY_CONFIG[activeCategory()].label.replace(/^\S+\s/, '')}` : state.activeTab;
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
      s.points += 2;
    }
    (place.memories || []).forEach(m => {
      const key = (m.author || '').trim();
      if (!key) return;
      const s = ensure(key, m.color);
      s.memoriesCount += 1;
      s.points += 1;
      s.ratingSum += (m.rating || 0);
      s.color = m.color || s.color;
    });
    (place.photos || []).forEach(photo => {
      const key = (photoAuthor(photo) || '').trim();
      if (!key) return;
      const s = ensure(key);
      s.photosAdded += 1;
      s.points += 1;
    });
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
    <p class="leaderboard-legend">+2 pts for adding a place · +1 pt for each memory you post · +1 pt for each photo you add · Shop purchases subtract from your balance</p>
    ${data.length ? `
      <div class="leaderboard-list">
        ${data.map((c, i) => {
          const profile = profiles[normalizeName(c.name)];
          const skin = profile?.equippedSkin ? SHOP_SKINS.find(s => s.id === profile.equippedSkin) : null;
          const rowBg = skin ? `background:${skinBackgroundCss(skin)};` : '';
          const icon = profile?.equippedIcon ? SHOP_ICONS.find(s => s.id === profile.equippedIcon)?.emoji : null;
          const colorItem = profile?.equippedColor ? SHOP_COLORS.find(s => s.id === profile.equippedColor) : null;
          const avatarBg = colorItem ? colorItem.hex : c.color;
          return `
          <div class="leaderboard-row" style="${rowBg}">
            <span class="leaderboard-rank">${medals[i] || (i + 1) + '.'}</span>
            <span class="leaderboard-avatar" style="background:${escapeHtml(avatarBg)}">${icon || escapeHtml((c.name[0] || '?').toUpperCase())}</span>
            <span class="leaderboard-name">${authorBadgeHtml(c.name)}</span>
            <span class="leaderboard-stats">${c.points} pts<br>${c.placesAdded} place${c.placesAdded === 1 ? '' : 's'} · ${c.memoriesCount} memor${c.memoriesCount === 1 ? 'y' : 'ies'} · ${c.photosAdded} photo${c.photosAdded === 1 ? '' : 's'}</span>
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
  return `<span class="shop-preview shop-preview-skin" data-category="${category}" data-id="${item.id}" style="background:${skinBackgroundCss(item)}"></span>`;
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

  const icon = iconId ? SHOP_ICONS.find(i => i.id === iconId)?.emoji : '';
  const colorItem = colorId ? SHOP_COLORS.find(c => c.id === colorId) : null;
  const skin = skinId ? SHOP_SKINS.find(s => s.id === skinId) : null;
  const bg = skin ? skinBackgroundCss(skin) : BUBBLE_COLORS[0];
  const nameStyle = colorItem ? ` style="color:${colorItem.hex}"` : '';
  const isPreviewing = Object.keys(shopPreviewOverride).length > 0;
  return `
    <div class="memory-bubble shop-live-preview" style="background:${bg}">
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
  ];

  const modal = document.getElementById('shopModal');
  modal.innerHTML = `
    <button class="modal-close" id="shopCloseBtn">✕</button>
    <h2>🛍️ Shop</h2>
    <p class="leaderboard-legend">Icons ${ICON_COST} pts · Name colors ${COLOR_COST} pts · Memory skins ${SKIN_COST} pts</p>

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
  return `<span class="activity-points">+${points} pt${points === 1 ? '' : 's'}</span>`;
}

function activityText(item) {
  const who = authorBadgeHtml(item.author);
  switch (item.type) {
    case 'place_added':
      return `${who} added <strong>${escapeHtml(item.placeName)}</strong> ${pointsBadge(2)}`;
    case 'photo_added':
      return `${who} added a photo to <strong>${escapeHtml(item.placeName)}</strong> ${pointsBadge(1)}`;
    case 'memory_added':
      return `${who} left a ${item.rating}★ memory on <strong>${escapeHtml(item.placeName)}</strong> ${pointsBadge(1)}`;
    case 'like':
      return `${who} 👍 liked ${escapeHtml(item.memoryAuthor)}'s memory on <strong>${escapeHtml(item.placeName)}</strong>`;
    case 'dislike':
      return `${who} 👎 disliked ${escapeHtml(item.memoryAuthor)}'s memory on <strong>${escapeHtml(item.placeName)}</strong>`;
    case 'funny':
      return `${who} 😂 found ${escapeHtml(item.memoryAuthor)}'s memory on <strong>${escapeHtml(item.placeName)}</strong> funny`;
    default:
      return '';
  }
}

function activityIcon(type) {
  return { place_added: '🆕', photo_added: '📸', memory_added: '📝', like: '👍', dislike: '👎', funny: '😂' }[type] || '•';
}

function renderActivityFeed() {
  const list = document.getElementById('activityList');
  const feed = computeActivityFeed();

  if (!feed.length) {
    list.innerHTML = `<p class="no-memories">Nothing yet — add a place or leave a memory to start the feed!</p>`;
    return;
  }

  list.innerHTML = feed.map(item => `
    <div class="activity-item" data-place-id="${item.placeId}">
      <span class="activity-icon">${activityIcon(item.type)}</span>
      <span class="activity-text">${activityText(item)}</span>
      <span class="activity-time">${timeAgo(item.timestamp)}</span>
    </div>
  `).join('');

  list.querySelectorAll('.activity-item').forEach(row => {
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
      <button type="button" class="photo-delete-btn" data-idx="${i}" title="Delete photo">✕</button>
    </div>
  `).join('');
}

function wireGalleryHandlers(place) {
  const gallery = document.getElementById('photoGallery');
  gallery.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src, place.website));
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
        <button type="button" class="btn-add-photo" id="addPhotoBtn">📸 Add Photo (+1 pt)</button>
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
          const equippedSkinId = getProfile(m.author)?.equippedSkin;
          const skin = SHOP_SKINS.find(s => s.id === equippedSkinId);
          const bubbleBg = skin ? skinBackgroundCss(skin) : (m.color || BUBBLE_COLORS[0]);
          return `
          <div class="memory-bubble ${isTop ? 'memory-bubble-top' : ''}" style="background:${bubbleBg}">
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

function closeViewModal() {
  document.getElementById('viewOverlay').classList.add('hidden');
}

// ---------- Lightbox ----------
function openLightbox(src, website) {
  document.getElementById('lightboxImg').src = src;
  const link = document.getElementById('lightboxWebsiteLink');
  if (website) {
    link.href = website;
    link.style.display = 'inline-block';
  } else {
    link.style.display = 'none';
  }
  document.getElementById('lightboxOverlay').classList.remove('hidden');
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

document.getElementById('leaderboardBtn').addEventListener('click', openLeaderboard);
document.getElementById('randomizerBtn').addEventListener('click', openRandomizer);
document.getElementById('shopBtn').addEventListener('click', openShop);

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

document.getElementById('lightboxCloseBtn').addEventListener('click', closeLightbox);
document.getElementById('lightboxOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'lightboxOverlay') closeLightbox();
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

populateCuisineFilterSelect();
renderTabs();
renderList();
ensureSeeded().finally(subscribeToPlaces);
subscribeToProfiles();

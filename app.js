import { db } from './firebase.js';
import {
  collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { IMGBB_API_KEY } from './imgbb-config.js';

const PLACES_COLLECTION = 'places';
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

let state = {
  activeTab: 'Hawaii',
  search: '',
  sort: 'az',
  cuisineFilter: 'all',
};

let places = [];
let firstSnapshotReceived = false;

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
  }, err => {
    document.getElementById('listContainer').innerHTML =
      `<div class="empty-state">Couldn't connect to the shared album. Check the Firebase setup in firebase-config.js, or your internet connection.</div>`;
    console.error(err);
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
      renderTabs();
      renderList();
    });
    tabsEl.appendChild(btn);
  });
}

// ---------- List rendering ----------
function getFilteredSorted() {
  let list = places.filter(p => p.country === state.activeTab);

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

  list.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === 'za') list.reverse();

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

function placeThumb(place) {
  if (place.photos && place.photos.length > 0) {
    return `<img src="${place.photos[0]}" alt="">`;
  }
  return '🍽️';
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

  countLine.textContent = `${list.length} place${list.length === 1 ? '' : 's'} in ${state.activeTab}`;

  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state">No places yet. Tap "+ Add a Place" to start the ${state.activeTab} list!</div>`;
    return;
  }

  const groups = groupByLetter(list);
  const letters = Object.keys(groups).sort((a, b) => {
    if (state.sort === 'za') return b.localeCompare(a);
    return a.localeCompare(b);
  });

  container.innerHTML = letters.map(letter => `
    <section class="letter-section">
      <div class="letter-heading">${letter}</div>
      <div class="grid">
        ${groups[letter].map(p => {
          const avg = averageRating(p.memories);
          return `
          <div class="place-card" data-id="${p.id}">
            <div class="place-thumb">${placeThumb(p)}</div>
            <div class="place-info">
              <h3>${escapeHtml(p.name)} ${avg ? `<span class="card-rating">★ ${avg}</span>` : ''}</h3>
              ${p.cuisine ? `<span class="cuisine-badge">${escapeHtml(p.cuisine)}</span>` : ''}
              ${p.notes ? `<div class="meta"><span class="meta-label">Notes:</span> ${escapeHtml(truncate(p.notes, 60))}</div>` : ''}
            </div>
            ${p.photos && p.photos.length ? `<div class="photo-badge">📷 ${p.photos.length}</div>` : ''}
          </div>
        `;
        }).join('')}
      </div>
    </section>
  `).join('');

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

// ---------- Cuisine filter ----------
function populateCuisineFilter() {
  const select = document.getElementById('cuisineFilterSelect');
  select.innerHTML = `<option value="all">All Cuisines</option>` +
    CUISINES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

// ---------- Leaderboard ----------
// Scoring: +2 points for adding a new place, +1 point for posting a memory (rating).
// Likes/dislikes on memories do NOT affect points.
function computeLeaderboard() {
  const stats = {};
  function ensure(name, color) {
    if (!stats[name]) stats[name] = { name, points: 0, placesAdded: 0, memoriesCount: 0, ratingSum: 0, color: color || BUBBLE_COLORS[0] };
    return stats[name];
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
  });

  return Object.values(stats)
    .map(s => ({ ...s, avg: s.memoriesCount ? (s.ratingSum / s.memoriesCount).toFixed(1) : null }))
    .sort((a, b) => b.points - a.points || b.memoriesCount - a.memoriesCount);
}

function openLeaderboard() {
  const data = computeLeaderboard();
  const medals = ['🥇', '🥈', '🥉'];
  const modal = document.getElementById('leaderboardModal');
  modal.innerHTML = `
    <button class="modal-close" id="leaderboardCloseBtn">✕</button>
    <h2>🏆 Top Contributors</h2>
    <p class="leaderboard-legend">+2 pts for adding a place · +1 pt for each memory you post</p>
    ${data.length ? `
      <div class="leaderboard-list">
        ${data.map((c, i) => `
          <div class="leaderboard-row">
            <span class="leaderboard-rank">${medals[i] || (i + 1) + '.'}</span>
            <span class="leaderboard-avatar" style="background:${escapeHtml(c.color)}">${escapeHtml((c.name[0] || '?').toUpperCase())}</span>
            <span class="leaderboard-name">${escapeHtml(c.name)}</span>
            <span class="leaderboard-stats">${c.points} pts<br>${c.placesAdded} place${c.placesAdded === 1 ? '' : 's'} · ${c.memoriesCount} memor${c.memoriesCount === 1 ? 'y' : 'ies'}</span>
          </div>
        `).join('')}
      </div>` : `<p class="no-memories">No points yet — add a place or post a memory to get on the board!</p>`}
  `;
  document.getElementById('leaderboardCloseBtn').addEventListener('click', closeLeaderboard);
  document.getElementById('leaderboardOverlay').classList.remove('hidden');
}

function closeLeaderboard() {
  document.getElementById('leaderboardOverlay').classList.add('hidden');
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
  switch (item.type) {
    case 'place_added':
      return `<strong>${escapeHtml(item.author)}</strong> added <strong>${escapeHtml(item.placeName)}</strong> ${pointsBadge(2)}`;
    case 'photo_added':
      return `<strong>${escapeHtml(item.author)}</strong> added a photo to <strong>${escapeHtml(item.placeName)}</strong>`;
    case 'memory_added':
      return `<strong>${escapeHtml(item.author)}</strong> left a ${item.rating}★ memory on <strong>${escapeHtml(item.placeName)}</strong> ${pointsBadge(1)}`;
    case 'like':
      return `<strong>${escapeHtml(item.author)}</strong> 👍 liked ${escapeHtml(item.memoryAuthor)}'s memory on <strong>${escapeHtml(item.placeName)}</strong>`;
    case 'dislike':
      return `<strong>${escapeHtml(item.author)}</strong> 👎 disliked ${escapeHtml(item.memoryAuthor)}'s memory on <strong>${escapeHtml(item.placeName)}</strong>`;
    default:
      return '';
  }
}

function activityIcon(type) {
  return { place_added: '🆕', photo_added: '📸', memory_added: '📝', like: '👍', dislike: '👎' }[type] || '•';
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
      ${place.photos && place.photos.length ? `<img class="randomizer-photo" src="${place.photos[0]}" alt="">` : ''}
      <h2>${escapeHtml(place.name)}</h2>
      ${place.cuisine ? `<span class="cuisine-badge">${escapeHtml(place.cuisine)}</span>` : ''}
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
  return place.photos.map((src, i) => `
    <div class="photo-wrap">
      <img src="${src}" alt="" data-idx="${i}">
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
      place.photos = [...(place.photos || []), url];
      place.lastPhotoAddedAt = Date.now();
      place.lastPhotoAddedBy = getSavedAuthorName() || 'Someone';
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
        <button type="button" class="btn-add-photo" id="addPhotoBtn">📸 Add Photo</button>
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
          return `
          <div class="memory-bubble ${isTop ? 'memory-bubble-top' : ''}" style="background:${escapeHtml(m.color || BUBBLE_COLORS[0])}">
            <div class="memory-card-top">
              <span class="memory-author">${escapeHtml(m.author)} ${isTop ? '<span class="top-badge">🥇 #1</span>' : ''}</span>
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

async function toggleReaction(placeId, memoryId, type) {
  const place = places.find(p => p.id === placeId);
  if (!place) return;
  const current = getReaction(memoryId);
  const next = current === type ? null : type;

  const updatedMemories = (place.memories || []).map(m => {
    if (m.id !== memoryId) return m;
    let likes = m.likes || 0;
    let dislikes = m.dislikes || 0;
    if (current === 'like') likes -= 1;
    if (current === 'dislike') dislikes -= 1;
    if (next === 'like') likes += 1;
    if (next === 'dislike') dislikes += 1;
    const updated = { ...m, likes: Math.max(0, likes), dislikes: Math.max(0, dislikes) };
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
function populateCuisineSelect(selected) {
  const select = document.getElementById('fCuisine');
  select.innerHTML = CUISINES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  select.value = selected || 'Other';
}

function openFormModal(id) {
  const place = id ? places.find(p => p.id === id) : null;
  const placeId = place ? place.id : uid();

  document.getElementById('formTitle').textContent = place ? 'Edit Place' : 'Add a Place';
  document.getElementById('placeId').value = placeId;
  document.getElementById('fName').value = place ? place.name : '';
  populateCuisineSelect(place ? place.cuisine : 'Other');
  document.getElementById('fLocation').value = place ? place.location : '';
  document.getElementById('fWebsite').value = place ? place.website : '';
  document.getElementById('addressHint').textContent = '';
  document.getElementById('deletePlaceBtn').style.display = place ? 'inline-block' : 'none';

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

  if (isNewPlace) {
    data.createdAt = Date.now();
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

populateCuisineFilter();
renderTabs();
renderList();
ensureSeeded().finally(subscribeToPlaces);

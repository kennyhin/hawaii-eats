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
        ${groups[letter].map(p => `
          <div class="place-card" data-id="${p.id}">
            <div class="place-thumb">${placeThumb(p)}</div>
            <div class="place-info">
              <h3>${escapeHtml(p.name)}</h3>
              ${p.cuisine ? `<span class="cuisine-badge">${escapeHtml(p.cuisine)}</span>` : ''}
              ${p.notes ? `<div class="meta"><span class="meta-label">Notes:</span> ${escapeHtml(truncate(p.notes, 60))}</div>` : ''}
            </div>
            ${p.photos && p.photos.length ? `<div class="photo-badge">📷 ${p.photos.length}</div>` : ''}
          </div>
        `).join('')}
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

// ---------- View modal ----------
function openViewModal(id) {
  const place = places.find(p => p.id === id);
  if (!place) return;

  const memories = place.memories || [];
  const avg = averageRating(memories);

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

    ${place.photos && place.photos.length ? `
      <div class="field">
        <label>Photos</label>
        <div class="photo-gallery">
          ${place.photos.map(src => `<img src="${src}" alt="">`).join('')}
        </div>
      </div>` : ''}

    <div class="memories-section">
      <div class="memories-heading">
        <span>Memories</span>
        ${avg ? `<span class="memories-avg">${renderStarsDisplay(Math.round(avg))} ${avg} (${memories.length})</span>` : ''}
      </div>

      ${memories.length ? memories.map(m => `
        <div class="memory-bubble" style="background:${escapeHtml(m.color || BUBBLE_COLORS[0])}">
          <div class="memory-card-top">
            <span class="memory-author">${escapeHtml(m.author)}</span>
            ${renderStarsDisplay(m.rating)}
          </div>
          ${m.text ? `<p class="memory-text">${escapeHtml(m.text)}</p>` : ''}
        </div>
      `).join('') : `<p class="no-memories">No memories yet — be the first!</p>`}

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

        <button type="button" class="btn btn-primary" id="postMemoryBtn">+ Add Your Memory</button>
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

  modal.querySelectorAll('.photo-gallery img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src));
  });

  let selectedRating = 0;
  const starInput = document.getElementById('memoryStarInput');
  starInput.querySelectorAll('.star-pick').forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = Number(star.dataset.value);
      starInput.querySelectorAll('.star-pick').forEach(s => {
        s.classList.toggle('star-filled', Number(s.dataset.value) <= selectedRating);
      });
    });
  });

  let selectedColor = getSavedAuthorColor();
  const colorInput = document.getElementById('memoryColorInput');
  colorInput.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      selectedColor = swatch.dataset.value;
      colorInput.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.toggle('color-selected', s.dataset.value === selectedColor);
      });
    });
  });

  document.getElementById('postMemoryBtn').addEventListener('click', () => {
    submitMemory(place.id, selectedRating, selectedColor);
  });

  document.getElementById('viewCloseBtn').addEventListener('click', closeViewModal);
  document.getElementById('editPlaceBtn').addEventListener('click', () => {
    closeViewModal();
    openFormModal(place.id);
  });

  document.getElementById('viewOverlay').classList.remove('hidden');
}

async function submitMemory(placeId, rating, color) {
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

  const newMemory = { id: uid(), author, rating, text, color: color || BUBBLE_COLORS[0] };
  const updatedMemories = [...(place.memories || []), newMemory];

  const postBtn = document.getElementById('postMemoryBtn');
  postBtn.disabled = true;
  postBtn.textContent = 'Posting…';

  try {
    await setDoc(doc(db, PLACES_COLLECTION, placeId), { memories: updatedMemories }, { merge: true });
    saveAuthorName(author);
    saveAuthorColor(newMemory.color);
    place.memories = updatedMemories;
    openViewModal(placeId);
  } catch (err) {
    console.error(err);
    alert('Could not post your memory — check your internet connection and try again.');
    postBtn.disabled = false;
    postBtn.textContent = '+ Add Your Memory';
  }
}

function closeViewModal() {
  document.getElementById('viewOverlay').classList.add('hidden');
}

// ---------- Lightbox ----------
function openLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxOverlay').classList.remove('hidden');
}

function closeLightbox() {
  document.getElementById('lightboxOverlay').classList.add('hidden');
}

// ---------- Add/Edit form ----------
let pendingPhotos = [];

function populateCuisineSelect(selected) {
  const select = document.getElementById('fCuisine');
  select.innerHTML = CUISINES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  select.value = selected || 'Other';
}

function openFormModal(id) {
  const place = id ? places.find(p => p.id === id) : null;
  const placeId = place ? place.id : uid();
  pendingPhotos = place && place.photos ? place.photos.slice() : [];

  document.getElementById('formTitle').textContent = place ? 'Edit Place' : 'Add a Place';
  document.getElementById('placeId').value = placeId;
  document.getElementById('fName').value = place ? place.name : '';
  populateCuisineSelect(place ? place.cuisine : 'Other');
  document.getElementById('fLocation').value = place ? place.location : '';
  document.getElementById('fWebsite').value = place ? place.website : '';
  document.getElementById('fNotes').value = place ? place.notes : '';
  document.getElementById('fPhotos').value = '';
  document.getElementById('addressHint').textContent = '';
  document.getElementById('deletePlaceBtn').style.display = place ? 'inline-block' : 'none';

  renderPhotoPreview();
  document.getElementById('formOverlay').classList.remove('hidden');
}

function closeFormModal() {
  document.getElementById('formOverlay').classList.add('hidden');
  pendingPhotos = [];
}

function renderPhotoPreview() {
  const row = document.getElementById('photoPreviewRow');
  row.innerHTML = pendingPhotos.map((src, i) => `
    <div class="thumb-wrap">
      <img src="${src}" alt="">
      <button type="button" class="remove-x" data-idx="${i}">✕</button>
    </div>
  `).join('');
  row.querySelectorAll('.remove-x').forEach(btn => {
    btn.addEventListener('click', () => {
      pendingPhotos.splice(Number(btn.dataset.idx), 1);
      renderPhotoPreview();
    });
  });
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

async function handlePhotoInput(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  const photoBtn = document.getElementById('photoTriggerBtn');
  const originalLabel = photoBtn.textContent;
  photoBtn.disabled = true;

  try {
    for (const file of files) {
      photoBtn.textContent = `📸 Uploading…`;
      const url = await uploadToImgbb(file);
      pendingPhotos.push(url);
      renderPhotoPreview();
    }
  } catch (err) {
    console.error(err);
    alert('Photo upload failed — check your internet connection and try again.');
  } finally {
    photoBtn.disabled = false;
    photoBtn.textContent = originalLabel;
    e.target.value = '';
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('placeId').value;
  const name = document.getElementById('fName').value.trim();
  if (!name) return;

  const data = {
    name,
    country: state.activeTab,
    cuisine: document.getElementById('fCuisine').value,
    location: document.getElementById('fLocation').value.trim(),
    website: document.getElementById('fWebsite').value.trim(),
    notes: document.getElementById('fNotes').value.trim(),
    photos: pendingPhotos.slice(),
  };

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
  if (!confirm('Remove this place from the album?')) return;
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
document.getElementById('fPhotos').addEventListener('change', handlePhotoInput);
document.getElementById('photoTriggerBtn').addEventListener('click', () => document.getElementById('fPhotos').click());
document.getElementById('findAddressBtn').addEventListener('click', findAddress);
document.getElementById('findWebsiteBtn').addEventListener('click', findWebsite);

document.getElementById('searchBox').addEventListener('input', (e) => {
  state.search = e.target.value;
  renderList();
});

document.getElementById('sortSelect').addEventListener('change', (e) => {
  state.sort = e.target.value;
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

renderTabs();
renderList();
ensureSeeded().finally(subscribeToPlaces);

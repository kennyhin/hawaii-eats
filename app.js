const STORAGE_KEY = 'food_memory_album_v1';
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

function loadPlaces() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* fall through to seed */ }
  }
  return SEED_PLACES.slice();
}

function savePlaces(places) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
}

let places = loadPlaces();

function uid() {
  return 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
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

// ---------- View modal ----------
function openViewModal(id) {
  const place = places.find(p => p.id === id);
  if (!place) return;

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

    ${place.notes ? `
      <div class="field">
        <label>Our Memory</label>
        <p>${escapeHtml(place.notes)}</p>
      </div>` : ''}

    ${place.photos && place.photos.length ? `
      <div class="field">
        <label>Photos</label>
        <div class="photo-gallery">
          ${place.photos.map(src => `<img src="${src}" alt="">`).join('')}
        </div>
      </div>` : ''}

    <div class="modal-actions">
      <button class="btn btn-secondary" id="editPlaceBtn">Edit</button>
    </div>
  `;

  modal.querySelectorAll('.photo-gallery img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src));
  });

  document.getElementById('viewCloseBtn').addEventListener('click', closeViewModal);
  document.getElementById('editPlaceBtn').addEventListener('click', () => {
    closeViewModal();
    openFormModal(place.id);
  });

  document.getElementById('viewOverlay').classList.remove('hidden');
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
  pendingPhotos = place && place.photos ? place.photos.slice() : [];

  document.getElementById('formTitle').textContent = place ? 'Edit Place' : 'Add a Place';
  document.getElementById('placeId').value = place ? place.id : '';
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

function handlePhotoInput(e) {
  const files = Array.from(e.target.files || []);
  let remaining = files.length;
  if (remaining === 0) return;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      pendingPhotos.push(reader.result);
      renderPhotoPreview();
    };
    reader.readAsDataURL(file);
  });
}

function handleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('placeId').value;
  const name = document.getElementById('fName').value.trim();
  if (!name) return;

  const data = {
    name,
    cuisine: document.getElementById('fCuisine').value,
    location: document.getElementById('fLocation').value.trim(),
    website: document.getElementById('fWebsite').value.trim(),
    notes: document.getElementById('fNotes').value.trim(),
    photos: pendingPhotos.slice(),
  };

  if (id) {
    const idx = places.findIndex(p => p.id === id);
    if (idx !== -1) places[idx] = { ...places[idx], ...data };
  } else {
    places.push({ id: uid(), country: state.activeTab, ...data });
  }

  savePlaces(places);
  closeFormModal();
  renderList();
}

function handleDelete() {
  const id = document.getElementById('placeId').value;
  if (!id) return;
  if (!confirm('Remove this place from the album?')) return;
  places = places.filter(p => p.id !== id);
  savePlaces(places);
  closeFormModal();
  renderList();
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

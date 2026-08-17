'use strict';

/* OtakuPlay — UI logic. Catalogue data lives in data.js (loaded first).
   Globals used from data.js: ANIME, GAMES, STREAM_MAP, JP_TITLES, FRANCHISES */

// ===================== CONFIG =====================
const NEW_SINCE = 2024;               // single source of truth for the "New" badge + filter
const STATUS_DISPLAY      = { watched:'Watched', watching:'Watching', plan:'Plan to Watch', dropped:'Dropped' };
const GAME_STATUS_DISPLAY = { watched:'Played',  watching:'Playing',  plan:'Plan to Play',  dropped:'Dropped' };

const ERA_LABELS = {
  1960: "The Birth of Anime",
  1970: "The Pioneers",
  1980: "The Golden Age Begins",
  1990: "The Cultural Explosion",
  2000: "The Modern Era Dawns",
  2010: "The Renaissance",
  2020: "The Prestige Era",
};
const GAME_ERA_LABELS = {
  1990: "The Founders",
  2000: "The Classics",
  2010: "The Golden Decade",
  2020: "The Prestige Era",
};

const SECTIONS = {
  anime: { key:'anime', data:ANIME, isGame:false, eraLabels:ERA_LABELS,      statusLabels:STATUS_DISPLAY },
  games: { key:'games', data:GAMES, isGame:true,  eraLabels:GAME_ERA_LABELS, statusLabels:GAME_STATUS_DISPLAY },
};
const SECTION_KEYS = Object.keys(SECTIONS);

const ids = k => ({
  grid:      `${k}-grid`,
  section:   `${k}-section`,
  search:    `${k}-search`,
  clear:     `${k}-search-clear`,
  slider:    `${k}-rating-slider`,
  ratingVal: `${k}-rating-val`,
  statusRow: `${k}-status-row`,
  jumpBar:   `${k}-jump-bar`,
  random:    `${k}-random`,
  count:     `${k}-count`,
});

// title → { item, sect } for O(1) lookups
const TITLE_INDEX = new Map();
SECTION_KEYS.forEach(k => SECTIONS[k].data.forEach(item => TITLE_INDEX.set(item.title, { item, sect: k })));
const lookup      = title => TITLE_INDEX.get(title) || null;

/* Mirrors the slug rule in src/_data/catalogue.js so cards can link to the
   generated entry pages. Duplicate base slugs are disambiguated by year there,
   so do the same here. */
const slugify = title => title.toLowerCase()
  .replace(/['’]/g, '').replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const SLUG_COUNTS = new Map();
SECTION_KEYS.forEach(k => SECTIONS[k].data.forEach(item => {
  const base = slugify(item.title);
  SLUG_COUNTS.set(base, (SLUG_COUNTS.get(base) || 0) + 1);
}));

function entryUrl(item) {
  const base = slugify(item.title);
  const slug = SLUG_COUNTS.get(base) > 1 ? `${base}-${item.year}` : base;
  return `${window.OTAKU_ROOT || ''}${sectionOf(item.title)}/${slug}/`;
}
const sectionOf   = title => (TITLE_INDEX.get(title)?.sect) || 'anime';
const isNewEntry  = item => item.year >= NEW_SINCE;

// ===================== PERSISTENCE =====================
/* Every read is defensive: a single corrupt value used to throw at load and blank the page. */
function loadStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object') throw new Error('unexpected shape');
    if (Array.isArray(fallback) !== Array.isArray(parsed)) throw new Error('unexpected shape');
    return parsed;
  } catch (err) {
    console.warn(`OtakuPlay: ignoring unreadable "${key}" in localStorage —`, err.message);
    return fallback;
  }
}
function saveStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (err) { console.warn(`OtakuPlay: could not save "${key}" —`, err.message); toast('Storage is full — changes were not saved.'); }
}

let userStatus  = loadStore('otakuplay-status',  {});
let userRatings = loadStore('otakuplay-ratings', {});
let userNotes   = loadStore('otakuplay-notes',   {});
let favorites   = new Set(loadStore('otakuplay-favs', []));

const saveUserStatus  = () => saveStore('otakuplay-status',  userStatus);
const saveUserRatings = () => saveStore('otakuplay-ratings', userRatings);
const saveUserNotes   = () => saveStore('otakuplay-notes',   userNotes);
const saveFavorites   = () => saveStore('otakuplay-favs', [...favorites]);

// ===================== VIEW STATE =====================
const state = {};
SECTION_KEYS.forEach(k => {
  const years = SECTIONS[k].data.map(x => x.year);
  state[k] = {
    sort:'year-asc', filters:new Set(), minRating:0, search:'', status:'all',
    yearFrom: Math.min(...years), yearTo: Math.max(...years),
    studio: 'all', genreMode: 'any',
  };
});
let jpMode = false;
let suppressHashRead = false;

// ===================== TOASTS =====================
let _toastTimer = null;
function toast(message, action) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.innerHTML = `<span class="toast-msg"></span>`;
  el.querySelector('.toast-msg').textContent = message;
  if (action) {
    const btn = document.createElement('button');
    btn.className = 'toast-action';
    btn.textContent = action.label;
    btn.addEventListener('click', action.onClick);
    el.appendChild(btn);
  }
  el.classList.add('visible');
  clearTimeout(_toastTimer);
  if (!action) _toastTimer = setTimeout(() => el.classList.remove('visible'), 3200);
}

// ===================== USER DATA MUTATIONS =====================
function setUserStatus(title, status) {
  if (!status || userStatus[title] === status) delete userStatus[title];
  else userStatus[title] = status;
  saveUserStatus();

  // Patch just the affected cards instead of rebuilding the whole grid.
  refreshCardBadges(title);
  const sect = sectionOf(title);
  if (state[sect].status !== 'all') applyFilter(sect);

  document.querySelectorAll('.modal-status-opt').forEach(btn => {
    const active = btn.dataset.status === (userStatus[title] || '');
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function setUserRating(title, rating) {
  const prev = userRatings[title] || 0;
  if (prev === rating) delete userRatings[title]; else userRatings[title] = rating;
  saveUserRatings();
  const r = userRatings[title] || 0;
  document.querySelectorAll('.modal-pr-star').forEach(btn => {
    btn.classList.toggle('filled', parseInt(btn.dataset.r, 10) <= r);
  });
  const display = document.getElementById('modal-pr-display');
  if (display) display.textContent = r > 0 ? `My rating: ${r}/10` : 'Not rated';
}

let _noteTimer = null;
function scheduleNoteSave(title) {
  clearTimeout(_noteTimer);
  _noteTimer = setTimeout(() => {
    const textarea = document.getElementById('modal-notes');
    if (!textarea) return;
    const value = textarea.value.trim();
    if (value) userNotes[title] = value; else delete userNotes[title];
    saveUserNotes();
  }, 500);
}

function toggleFavorite(title) {
  favorites.has(title) ? favorites.delete(title) : favorites.add(title);
  saveFavorites();
  document.querySelectorAll(`.card-fav-btn[data-title="${cssEscape(title)}"]`).forEach(btn => {
    const on = favorites.has(title);
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? `Remove ${title} from favorites` : `Add ${title} to favorites`);
  });
  SECTION_KEYS.forEach(k => { if (state[k].filters.has('favorites')) applyFilter(k); });
}

// ===================== IMPORT / EXPORT =====================
function exportData() {
  const data = {
    app: 'otakuplay', version: 1,
    favorites: [...favorites], status: userStatus, ratings: userRatings, notes: userNotes,
    exported: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `otakuplay-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Library exported.');
}

const VALID_STATUSES = new Set(['watched', 'watching', 'plan', 'dropped']);

/* Only keeps entries that match known titles and valid values, so a hand-edited
   or unrelated JSON file can't poison localStorage. */
function sanitizeImport(data) {
  if (!data || typeof data !== 'object') return null;
  const out = { favorites: [], status: {}, ratings: {}, notes: {} };
  let matched = 0;

  if (Array.isArray(data.favorites)) {
    out.favorites = data.favorites.filter(t => typeof t === 'string' && TITLE_INDEX.has(t));
    matched += out.favorites.length;
  }
  if (data.status && typeof data.status === 'object') {
    for (const [title, st] of Object.entries(data.status)) {
      if (TITLE_INDEX.has(title) && VALID_STATUSES.has(st)) { out.status[title] = st; matched++; }
    }
  }
  if (data.ratings && typeof data.ratings === 'object') {
    for (const [title, r] of Object.entries(data.ratings)) {
      const n = Number(r);
      if (TITLE_INDEX.has(title) && Number.isFinite(n) && n >= 1 && n <= 10) { out.ratings[title] = Math.round(n); matched++; }
    }
  }
  if (data.notes && typeof data.notes === 'object') {
    for (const [title, note] of Object.entries(data.notes)) {
      if (TITLE_INDEX.has(title) && typeof note === 'string' && note.trim()) { out.notes[title] = note.slice(0, 5000); matched++; }
    }
  }
  return matched > 0 ? out : null;
}

function importData(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onerror = () => { toast('Could not read that file.'); input.value = ''; };
  reader.onload = e => {
    let clean = null;
    try { clean = sanitizeImport(JSON.parse(e.target.result)); }
    catch { clean = null; }

    if (!clean) {
      toast('Invalid file — no recognisable OtakuPlay data found.');
    } else {
      favorites   = new Set(clean.favorites);
      userStatus  = clean.status;
      userRatings = clean.ratings;
      userNotes   = clean.notes;
      saveFavorites(); saveUserStatus(); saveUserRatings(); saveUserNotes();
      SECTION_KEYS.forEach(renderSection);
      renderStats();
      toast('Library imported.');
    }
    input.value = '';
  };
  reader.readAsText(file);
}

function clearUserData() {
  if (!confirm('Clear all favorites, statuses, ratings and notes on this device? This cannot be undone.')) return;
  favorites = new Set(); userStatus = {}; userRatings = {}; userNotes = {};
  saveFavorites(); saveUserStatus(); saveUserRatings(); saveUserNotes();
  SECTION_KEYS.forEach(renderSection);
  renderStats();
  toast('Local library cleared.');
}

// ===================== HELPERS =====================
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
/* CSS.escape isn't in older Safari; attribute selectors here only need quote escaping. */
function cssEscape(value) {
  return window.CSS && CSS.escape ? CSS.escape(value) : String(value).replace(/["\\]/g, '\\$&');
}
function starsHtml(rating) {
  const full  = Math.floor(rating / 2);
  const half  = (rating % 2) >= 1 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}
function badgeRowHtml(item) {
  const franchise = FRANCHISES[item.title];
  const status    = userStatus[item.title];
  if (!franchise && !status) return '';
  const sect = sectionOf(item.title);
  const franchiseBadge = franchise ? `<span class="franchise-badge">${escapeHtml(franchise)}</span>` : '';
  const statusBadge    = status ? `<span class="status-badge status-${status}">${SECTIONS[sect].statusLabels[status]}</span>` : '';
  return franchiseBadge + statusBadge;
}

/* The first screenful loads eagerly so the grid never paints as bare gradients;
   everything after that is lazy. Reset at the start of each render. */
let eagerBudget = 0;
const EAGER_IMAGES = 8;

function buildCard(item, idx, groupId) {
  const tagsHtml  = item.tags.map(t => `<span class="tag tag-${t}">${t}</span>`).join('');
  const newBadge  = isNewEntry(item) ? '<span class="card-new-badge">New</span>' : '';
  const decade    = Math.floor(item.year / 10) * 10;
  const awardsHtml = item.awards?.length
    ? `<div class="card-awards">${item.awards.map(a => `<span class="award-badge award-${a.cls}">${escapeHtml(a.text)}</span>`).join('')}</div>` : '';
  const platforms = STREAM_MAP[item.title] || [];
  const platformsHtml = platforms.length
    ? `<div class="card-platforms">${platforms.map(p => `<span class="platform-badge platform-${p.toLowerCase()}">${p}</span>`).join('')}</div>` : '';
  const jpTitle = jpMode && JP_TITLES[item.title] ? `<div class="card-jp-title">${escapeHtml(JP_TITLES[item.title])}</div>` : '';
  const badges  = badgeRowHtml(item);
  const isFav   = favorites.has(item.title);
  const t = escapeHtml(item.title);

  return `
    <div class="card" role="listitem" data-tags="${item.tags.join(',')}" data-year="${item.year}"
         data-rating="${item.rating}" data-decade="${decade}" data-group="${escapeHtml(groupId)}"
         data-new="${isNewEntry(item) ? '1' : '0'}" data-title="${t}" data-studio="${escapeHtml(item.studio)}"
         style="animation-delay:${Math.min(idx, 12) * 0.04}s">
      <div class="card-banner">
        <div class="card-banner-bg" style="background:${item.bg}" aria-hidden="true">${item.emoji}</div>
        ${item.img ? (() => {
          // Portrait anime covers and landscape Steam headers share one frame:
          // the art is contained, and a blurred copy of itself fills the gap.
          const src = escapeHtml(item.img);
          const loading = eagerBudget-- > 0 ? 'eager' : 'lazy';
          return `<img class="card-art-blur" src="${src}" alt="" aria-hidden="true" loading="${loading}" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">
        <img class="card-banner-img" src="${src}" alt="" loading="${loading}" decoding="async"
             referrerpolicy="no-referrer" onload="this.classList.add('loaded')" onerror="this.remove()">`;
        })() : ''}
        <div class="card-banner-overlay"></div>
        <span class="card-rank rank-${item.rank.toLowerCase()}">Tier ${item.rank}</span>
        <span class="card-year-badge">${item.year}</span>
        ${newBadge}
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-studio-label">${escapeHtml(item.studio)}</span>
          <div class="card-rating">
            <span class="stars" aria-hidden="true">${starsHtml(item.rating)}</span>
            <span class="rating-num">${item.rating}</span>
          </div>
        </div>
        <h3 class="card-title">
          <a class="card-open-btn" href="${entryUrl(item)}" data-title="${t}">${t}</a>
        </h3>
        ${jpTitle}
        <div class="card-badge-row"${badges ? '' : ' hidden'}>${badges}</div>
        ${platformsHtml}
        ${awardsHtml}
        <p class="card-desc">${escapeHtml(item.desc)}</p>
        <div class="card-tags">${tagsHtml}</div>
        <div class="card-footer">
          <span class="card-info">${escapeHtml(item.info)}</span>
          <button class="card-fav-btn${isFav ? ' active' : ''}" data-title="${t}"
                  aria-pressed="${isFav}" aria-label="${isFav ? `Remove ${t} from favorites` : `Add ${t} to favorites`}">♥</button>
        </div>
      </div>
    </div>`;
}

/* Status/franchise badges change often — repaint just those cards. */
function refreshCardBadges(title) {
  const entry = lookup(title);
  if (!entry) return;
  document.querySelectorAll(`.card[data-title="${cssEscape(title)}"]`).forEach(card => {
    const row = card.querySelector('.card-badge-row');
    if (!row) return;
    const html = badgeRowHtml(entry.item);
    row.innerHTML = html;
    row.hidden = !html;
  });
}

function groupHeader(groupId, label, sublabel, count) {
  return `
    <div class="decade-header" data-group="${escapeHtml(groupId)}">
      <div class="decade-pill">
        <span class="decade-year">${escapeHtml(label)}</span>
        ${sublabel ? `<span class="decade-era">${escapeHtml(sublabel)}</span>` : ''}
      </div>
      <div class="decade-line"></div>
      <span class="decade-badge">${count} titles</span>
    </div>`;
}

// ===================== RENDER =====================
/* Tiers rank best-first; anything unlisted sorts to the end rather than alphabetically. */
const TIER_ORDER = ['S', 'A', 'B', 'C', 'D'];
const rankIndex = rank => { const i = TIER_ORDER.indexOf(rank); return i === -1 ? 99 : i; };

function sortData(data, sortKey) {
  const d = [...data];
  switch (sortKey) {
    case 'year-desc': return d.sort((a, b) => b.year - a.year);
    case 'rating':    return d.sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
    case 'alpha':     return d.sort((a, b) => a.title.localeCompare(b.title));
    case 'tier':      return d.sort((a, b) => rankIndex(a.rank) - rankIndex(b.rank) || b.rating - a.rating);
    case 'year-asc':
    default:          return d.sort((a, b) => a.year - b.year);
  }
}

function renderSection(sectKey) {
  const cfg    = SECTIONS[sectKey];
  const id     = ids(sectKey);
  const grid   = document.getElementById(id.grid);
  if (!grid) return;
  const sort   = state[sectKey].sort;
  const sorted = sortData(cfg.data, sort);
  eagerBudget  = EAGER_IMAGES;
  let html = '';

  if (sort === 'year-asc' || sort === 'year-desc') {
    const decades = new Map();
    sorted.forEach(item => {
      const d = Math.floor(item.year / 10) * 10;
      if (!decades.has(d)) decades.set(d, []);
      decades.get(d).push(item);
    });
    [...decades.keys()].sort((a, b) => sort === 'year-desc' ? b - a : a - b).forEach(d => {
      const group = String(d);
      html += groupHeader(group, `${d}s`, cfg.eraLabels[d] || '', decades.get(d).length);
      decades.get(d).forEach((item, i) => { html += buildCard(item, i, group); });
    });
  } else if (sort === 'tier') {
    const tiers = new Map();
    sorted.forEach(item => {
      if (!tiers.has(item.rank)) tiers.set(item.rank, []);
      tiers.get(item.rank).push(item);
    });
    [...tiers.keys()].sort((a, b) => rankIndex(a) - rankIndex(b)).forEach(rank => {
      const group = `tier-${rank}`;
      html += groupHeader(group, `Tier ${rank}`, '', tiers.get(rank).length);
      tiers.get(rank).forEach((item, i) => { html += buildCard(item, i, group); });
    });
  } else {
    sorted.forEach((item, i) => { html += buildCard(item, i, ''); });
  }

  grid.innerHTML = html;
  applyFilter(sectKey);
}

function applyFilter(sectKey) {
  const id      = ids(sectKey);
  const grid    = document.getElementById(id.grid);
  if (!grid) return;
  const s       = state[sectKey];
  const query   = s.search.toLowerCase();
  const filters = s.filters;

  grid.querySelectorAll('.card').forEach(card => {
    const title = card.dataset.title;
    const tags  = card.dataset.tags.split(',');

    let matchesFilter = true;
    if (filters.size) {
      if (filters.has('favorites'))  matchesFilter = favorites.has(title);
      else if (filters.has('new'))   matchesFilter = card.dataset.new === '1';
      else if (s.genreMode === 'all') matchesFilter = [...filters].every(f => tags.includes(f));
      else                           matchesFilter = tags.some(t => filters.has(t));
    }
    const year          = parseInt(card.dataset.year, 10);
    const matchesRating = parseFloat(card.dataset.rating) >= s.minRating;
    const matchesStatus = s.status === 'all' || userStatus[title] === s.status;
    const matchesYear   = year >= s.yearFrom && year <= s.yearTo;
    const matchesStudio = s.studio === 'all' || card.dataset.studio === s.studio;

    let matchesSearch = true;
    if (query) {
      const item = lookup(title)?.item;
      const haystack = item
        ? `${item.title} ${JP_TITLES[item.title] || ''} ${item.studio} ${item.desc} ${item.tags.join(' ')} ${item.year}`.toLowerCase()
        : title.toLowerCase();
      matchesSearch = haystack.includes(query);
    }
    card.classList.toggle('hidden',
      !(matchesFilter && matchesRating && matchesSearch && matchesStatus && matchesYear && matchesStudio));
  });

  // Hide group headers whose cards are all filtered out (matched by data-group, which
  // works for decade groups *and* tier groups).
  grid.querySelectorAll('.decade-header').forEach(header => {
    const group = header.dataset.group;
    const hasVisible = [...grid.querySelectorAll(`.card[data-group="${cssEscape(group)}"]`)]
      .some(c => !c.classList.contains('hidden'));
    header.classList.toggle('hidden', !hasVisible);
  });

  renderEmptyState(sectKey, grid);
  updateVisibleCount(sectKey);
  updateDecadeJumpBar(sectKey);
  renderChips(sectKey);
}

function renderEmptyState(sectKey, grid) {
  const visible = grid.querySelectorAll('.card:not(.hidden)').length;
  let emptyState = grid.querySelector('.empty-state');
  if (visible > 0) { emptyState?.remove(); return; }
  if (emptyState) return;

  const isFav = state[sectKey].filters.has('favorites');
  emptyState = document.createElement('div');
  emptyState.className = 'empty-state';
  emptyState.innerHTML = `
    <div class="empty-icon" aria-hidden="true">${isFav ? '♥' : '🔍'}</div>
    <h3 class="empty-title">${isFav ? 'No favorites yet' : 'No results found'}</h3>
    <p class="empty-desc">${isFav ? 'Click the ♥ on any card to save it here.' : 'Try a different search or clear your filters.'}</p>
    <button class="empty-reset" data-sect="${sectKey}">Clear all filters</button>`;
  grid.appendChild(emptyState);
}

function updateVisibleCount(sectKey) {
  const grid = document.getElementById(ids(sectKey).grid);
  const el   = document.getElementById(ids(sectKey).count);
  if (!grid || !el) return;
  const visible = grid.querySelectorAll('.card:not(.hidden)').length;
  const total   = SECTIONS[sectKey].data.length;
  el.textContent = visible === total ? `${total} titles` : `${visible} of ${total}`;
}

function resetFilters(sectKey) {
  const s     = state[sectKey];
  const years = SECTIONS[sectKey].data.map(x => x.year);
  s.filters = new Set(); s.minRating = 0; s.search = ''; s.status = 'all';
  s.yearFrom = Math.min(...years); s.yearTo = Math.max(...years);
  s.studio = 'all'; s.genreMode = 'any';

  syncControls(sectKey);
  applyFilter(sectKey);
  pushHash();
}

function setPressed(btn, on) {
  btn.classList.toggle('active', on);
  btn.setAttribute('aria-pressed', String(on));
}

// ===================== CONTROLS =====================
function setupFilters(sectKey) {
  const section = document.getElementById(ids(sectKey).section);
  const buttons = [...section.querySelectorAll('.filter-btn')];
  const allBtn  = buttons.find(b => b.dataset.filter === 'all');
  const exclusive = new Set(['favorites', 'new']);

  buttons.forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      const filters = state[sectKey].filters;

      if (f === 'all') {
        state[sectKey].filters = new Set();
      } else if (exclusive.has(f)) {
        state[sectKey].filters = filters.has(f) ? new Set() : new Set([f]);
      } else {
        exclusive.forEach(x => filters.delete(x));
        filters.has(f) ? filters.delete(f) : filters.add(f);
      }
      const active = state[sectKey].filters;
      buttons.forEach(b => setPressed(b, b.dataset.filter === 'all' ? active.size === 0 : active.has(b.dataset.filter)));
      if (active.size === 0 && allBtn) setPressed(allBtn, true);

      applyFilter(sectKey);
      pushHash();
    });
  });
}

function setupSort(sectKey) {
  const select = document.getElementById(`${sectKey}-sort`);
  if (!select) return;
  select.value = state[sectKey].sort;
  select.addEventListener('change', () => {
    state[sectKey].sort = select.value;
    renderSection(sectKey);
    pushHash();
  });
}

// ===================== TOOLBAR: DRAWER, MENU, CHIPS =====================
function setupToolbar(sectKey) {
  const section = document.getElementById(ids(sectKey).section);
  const toggle  = document.getElementById(`${sectKey}-filter-toggle`);
  const panel   = document.getElementById(`${sectKey}-filter-panel`);
  const moreBtn = document.getElementById(`${sectKey}-more`);
  const menu    = document.getElementById(`${sectKey}-more-menu`);

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.classList.toggle('open', !open);
    panel.hidden = open;
  });

  const closeMenu = () => { moreBtn.setAttribute('aria-expanded', 'false'); menu.hidden = true; };
  moreBtn?.addEventListener('click', e => {
    e.stopPropagation();
    const open = moreBtn.getAttribute('aria-expanded') === 'true';
    moreBtn.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
  });
  menu?.addEventListener('click', closeMenu);
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); moreBtn.focus(); } });

  section.querySelector('.panel-reset')?.addEventListener('click', () => resetFilters(sectKey));
}

/* One chip per active constraint, so what's filtering stays visible without
   opening the drawer. Each chip clears just its own constraint. */
function renderChips(sectKey) {
  const wrap = document.getElementById(`${sectKey}-chips`);
  if (!wrap) return;
  const s     = state[sectKey];
  const data  = SECTIONS[sectKey].data;
  const lo    = Math.min(...data.map(x => x.year));
  const hi    = Math.max(...data.map(x => x.year));
  const chips = [];

  s.filters.forEach(f => {
    const label = f === 'favorites' ? '♥ Favorites' : f === 'new' ? '🆕 New' : f;
    chips.push({ label, kind: 'filter', value: f });
  });
  if (s.filters.size > 1 && s.genreMode === 'all') chips.push({ label: 'match all', kind: 'match' });
  if (s.minRating > 0) chips.push({ label: `${s.minRating}+ rating`, kind: 'rating' });
  if (s.yearFrom > lo || s.yearTo < hi) chips.push({ label: `${s.yearFrom}–${s.yearTo}`, kind: 'years' });
  if (s.studio !== 'all') chips.push({ label: s.studio, kind: 'studio' });
  if (s.status !== 'all') chips.push({ label: SECTIONS[sectKey].statusLabels[s.status], kind: 'status' });
  if (s.search) chips.push({ label: `“${s.search}”`, kind: 'search' });

  wrap.hidden = chips.length === 0;
  wrap.innerHTML = chips.map(c =>
    `<button class="chip" data-sect="${sectKey}" data-kind="${c.kind}" data-value="${escapeHtml(c.value || '')}">
       ${escapeHtml(c.label)}<span class="chip-x" aria-hidden="true">✕</span>
       <span class="sr-only">Remove filter</span>
     </button>`).join('') +
    (chips.length > 1 ? `<button class="chip chip-clear" data-sect="${sectKey}" data-kind="all">Clear all</button>` : '');

  const count = document.getElementById(`${sectKey}-filter-count`);
  if (count) {
    const n = chips.filter(c => c.kind !== 'search').length;
    count.textContent = n;
    count.hidden = n === 0;
  }
}

function removeChip(sectKey, kind, value) {
  const s     = state[sectKey];
  const data  = SECTIONS[sectKey].data;
  const years = data.map(x => x.year);

  switch (kind) {
    case 'all':    return resetFilters(sectKey);
    case 'filter': s.filters.delete(value); break;
    case 'match':  s.genreMode = 'any'; break;
    case 'rating': s.minRating = 0; break;
    case 'years':  s.yearFrom = Math.min(...years); s.yearTo = Math.max(...years); break;
    case 'studio': s.studio = 'all'; break;
    case 'status': s.status = 'all'; break;
    case 'search': s.search = ''; break;
  }
  syncControls(sectKey);
  applyFilter(sectKey);
  pushHash();
}

/* Pushes state back into every control — used after chip removal and hash reads. */
function syncControls(sectKey) {
  const id      = ids(sectKey);
  const s       = state[sectKey];
  const section = document.getElementById(id.section);
  if (!section) return;                    // this page doesn't render that catalogue

  section.querySelectorAll('.filter-btn').forEach(b =>
    setPressed(b, b.dataset.filter === 'all' ? s.filters.size === 0 : s.filters.has(b.dataset.filter)));
  document.getElementById(id.statusRow)?.querySelectorAll('.status-btn').forEach(b =>
    setPressed(b, b.dataset.status === s.status));
  section.querySelectorAll('.genre-mode-btn').forEach(b => setPressed(b, b.dataset.mode === s.genreMode));

  const sortSel = document.getElementById(`${sectKey}-sort`);
  if (sortSel) sortSel.value = s.sort;
  const input = document.getElementById(id.search);
  if (input) input.value = s.search;
  document.getElementById(id.clear)?.classList.toggle('visible', s.search.length > 0);
  const slider = document.getElementById(id.slider);
  if (slider) { slider.value = s.minRating; document.getElementById(id.ratingVal).textContent = s.minRating > 0 ? `${s.minRating}+` : 'Any'; }
  syncRefineRow(sectKey);
}

function setupSearch(sectKey) {
  const id       = ids(sectKey);
  const input    = document.getElementById(id.search);
  const clearBtn = document.getElementById(id.clear);
  if (!input) return;
  let timer = null;

  input.addEventListener('input', () => {
    clearBtn.classList.toggle('visible', input.value.trim().length > 0);
    clearTimeout(timer);
    timer = setTimeout(() => {
      state[sectKey].search = input.value.trim();
      applyFilter(sectKey);
      pushHash();
    }, 120);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    state[sectKey].search = '';
    clearBtn.classList.remove('visible');
    applyFilter(sectKey);
    pushHash();
    input.focus();
  });
}

function setupRatingFilter(sectKey) {
  const id     = ids(sectKey);
  const slider = document.getElementById(id.slider);
  const val    = document.getElementById(id.ratingVal);
  if (!slider) return;
  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    state[sectKey].minRating = v;
    val.textContent = v > 0 ? `${v}+` : 'Any';
    slider.setAttribute('aria-valuetext', v > 0 ? `${v} and above` : 'Any rating');
    applyFilter(sectKey);
    pushHash();
  });
}

function setupStatusFilter(sectKey) {
  const row = document.getElementById(ids(sectKey).statusRow);
  if (!row) return;
  row.querySelectorAll('.status-btn').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
    btn.addEventListener('click', () => {
      state[sectKey].status = btn.dataset.status;
      row.querySelectorAll('.status-btn').forEach(b => setPressed(b, b === btn));
      applyFilter(sectKey);
      pushHash();
    });
  });
}

/* Year range, studio and genre match-mode all live in one "refine" row. */
function setupRefineRow(sectKey) {
  // Scoped to the drawer: years, studio and match mode are separate groups in it.
  const row  = document.getElementById(`${sectKey}-filter-panel`);
  if (!row) return;
  const s    = state[sectKey];
  const data = SECTIONS[sectKey].data;

  // Continuous range, not just years present in the data — a user picking 1995
  // shouldn't be told it doesn't exist just because nothing shipped that year.
  const lo = Math.min(...data.map(x => x.year));
  const hi = Math.max(...data.map(x => x.year));
  const years = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  const from  = row.querySelector('.year-from');
  const to    = row.querySelector('.year-to');
  from.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
  to.innerHTML   = years.map(y => `<option value="${y}">${y}</option>`).join('');
  from.value = s.yearFrom;
  to.value   = s.yearTo;

  const studios = [...new Set(data.map(x => x.studio))]
    .map(name => ({ name, count: data.filter(x => x.studio === name).length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const studioSel = row.querySelector('.studio-select');
  studioSel.innerHTML = `<option value="all">All studios</option>` +
    studios.map(x => `<option value="${escapeHtml(x.name)}">${escapeHtml(x.name)} (${x.count})</option>`).join('');

  const clampYears = () => {
    // Keep the range coherent: dragging one past the other pushes the other along.
    if (Number(from.value) > Number(to.value)) {
      if (document.activeElement === from) to.value = from.value; else from.value = to.value;
    }
    s.yearFrom = Number(from.value) || lo;
    s.yearTo   = Number(to.value)   || hi;
    applyFilter(sectKey);
    pushHash();
  };
  from.addEventListener('change', clampYears);
  to.addEventListener('change', clampYears);

  studioSel.addEventListener('change', () => {
    s.studio = studioSel.value;
    applyFilter(sectKey);
    pushHash();
  });

  row.querySelectorAll('.genre-mode-btn').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
    btn.addEventListener('click', () => {
      s.genreMode = btn.dataset.mode;
      row.querySelectorAll('.genre-mode-btn').forEach(b => setPressed(b, b === btn));
      applyFilter(sectKey);
      pushHash();
    });
  });
}

function syncRefineRow(sectKey) {
  const row = document.getElementById(`${sectKey}-filter-panel`);
  if (!row) return;
  const s = state[sectKey];
  row.querySelector('.year-from').value = s.yearFrom;
  row.querySelector('.year-to').value   = s.yearTo;
  row.querySelector('.studio-select').value = s.studio;
  row.querySelectorAll('.genre-mode-btn').forEach(b => setPressed(b, b.dataset.mode === s.genreMode));
}

function setupRandom(sectKey) {
  document.getElementById(ids(sectKey).random)?.addEventListener('click', () => randomPick(sectKey));
}

function randomPick(sectKey) {
  const grid    = document.getElementById(ids(sectKey).grid);
  const visible = [...grid.querySelectorAll('.card:not(.hidden)')];
  if (!visible.length) { toast('Nothing to pick from — try clearing filters.'); return; }
  const card = visible[Math.floor(Math.random() * visible.length)];
  card.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  card.classList.remove('highlight-flash');
  void card.offsetWidth; // reflow so the animation restarts
  card.classList.add('highlight-flash');
  card.addEventListener('animationend', () => card.classList.remove('highlight-flash'), { once: true });
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

// ===================== DECADE JUMP BAR =====================
function updateDecadeJumpBar(sectKey) {
  const id  = ids(sectKey);
  const bar = document.getElementById(id.jumpBar);
  if (!bar) return;
  const sort = state[sectKey].sort;
  if (sort !== 'year-asc' && sort !== 'year-desc') { bar.innerHTML = ''; bar.hidden = true; return; }

  bar.hidden = false;
  const grid = document.getElementById(id.grid);
  const decades = [...new Set(SECTIONS[sectKey].data.map(x => Math.floor(x.year / 10) * 10))].sort((a, b) => a - b);
  bar.innerHTML = decades.map(d => {
    const header  = grid.querySelector(`.decade-header[data-group="${d}"]`);
    const hidden  = !header || header.classList.contains('hidden');
    return `<button class="decade-jump-btn" data-sect="${sectKey}" data-decade="${d}"${hidden ? ' disabled' : ''}>${d}s</button>`;
  }).join('');
}

function jumpToDecade(sectKey, decade) {
  const grid   = document.getElementById(ids(sectKey).grid);
  const header = grid.querySelector(`.decade-header[data-group="${decade}"]`);
  if (header && !header.classList.contains('hidden')) {
    header.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }
}

// ===================== DETAIL MODAL =====================
let lastFocused = null;

function getRelated(item) {
  const sect = sectionOf(item.title);
  return SECTIONS[sect].data
    .filter(x => x.title !== item.title)
    .map(x => ({ x, overlap: x.tags.filter(t => item.tags.includes(t)).length }))
    .sort((a, b) => b.overlap - a.overlap || b.x.rating - a.x.rating)
    .slice(0, 3)
    .map(e => e.x);
}

function openModal(item) {
  const overlay = document.getElementById('detail-modal');
  const banner  = document.getElementById('modal-banner');
  const body    = document.getElementById('modal-body');
  if (!overlay || !item) return;
  if (!overlay.classList.contains('open')) lastFocused = document.activeElement;

  const sect      = sectionOf(item.title);
  const stLabels  = SECTIONS[sect].statusLabels;
  const curStatus = userStatus[item.title] || '';
  const curRating = userRatings[item.title] || 0;
  const isFav     = favorites.has(item.title);

  const tagsHtml   = item.tags.map(t => `<span class="tag tag-${t}">${t}</span>`).join('');
  const awardsHtml = item.awards?.length
    ? `<div class="modal-awards-row">${item.awards.map(a => `<span class="award-badge award-${a.cls}">${escapeHtml(a.text)}</span>`).join('')}</div>` : '';
  const jpTitle = JP_TITLES[item.title]
    ? `<div class="modal-jp-title">${escapeHtml(JP_TITLES[item.title])}</div>` : '';
  const platforms = STREAM_MAP[item.title] || [];
  const platformsHtml = platforms.length
    ? `<div class="modal-platforms">${platforms.map(p => `<span class="platform-badge platform-${p.toLowerCase()}">${p}</span>`).join('')}</div>` : '';

  const statusOptsHtml = ['', 'watched', 'watching', 'plan', 'dropped'].map(s =>
    `<button class="modal-status-opt${curStatus === s ? ' active' : ''}" data-status="${s}" aria-pressed="${curStatus === s}">${s === '' ? '— Clear' : stLabels[s]}</button>`
  ).join('');
  const starsInput = Array.from({ length: 10 }, (_, i) => i + 1).map(n =>
    `<button class="modal-pr-star${curRating >= n ? ' filled' : ''}" data-r="${n}" aria-label="Rate ${n} out of 10">${n}</button>`
  ).join('');

  const related = getRelated(item);
  const relatedHtml = related.map(r => `
    <button class="modal-related-item" data-rel-title="${escapeHtml(r.title)}">
      <span class="modal-related-emoji" aria-hidden="true">${r.emoji}</span>
      <span class="modal-related-info">
        <span class="modal-related-name">${escapeHtml(r.title)}</span>
        <span class="modal-related-sub">${r.year} · ${escapeHtml(r.studio)}</span>
      </span>
      <span class="modal-related-rating">${r.rating}</span>
    </button>`).join('');

  const trailerQuery = encodeURIComponent(`${item.title} ${SECTIONS[sect].isGame ? 'gameplay trailer' : 'anime trailer'}`);
  const t = escapeHtml(item.title);

  banner.style.background = item.bg;
  banner.innerHTML = `
    <span class="modal-banner-emoji" aria-hidden="true">${item.emoji}</span>
    ${item.img ? `<img class="modal-banner-img" src="${escapeHtml(item.img)}" alt="" decoding="async"
         referrerpolicy="no-referrer" onload="this.classList.add('loaded')" onerror="this.remove()">` : ''}
    <div class="modal-banner-overlay"></div>`;

  body.innerHTML = `
    <div class="modal-year-row">
      <span class="card-rank rank-${item.rank.toLowerCase()} modal-tier">Tier ${item.rank}</span>
      <span class="modal-year">${item.year}</span>
    </div>
    <h2 class="modal-title" id="modal-title">${t}</h2>
    ${jpTitle}
    <p class="modal-studio-line">${escapeHtml(item.studio)}</p>
    ${platformsHtml}
    <div class="modal-rating-row">
      <span class="modal-rating-num">${item.rating}</span>
      <span class="modal-rating-stars" aria-hidden="true">${starsHtml(item.rating)}</span>
      <span class="modal-rating-denom">/ 10</span>
    </div>
    ${awardsHtml}
    <p class="modal-desc">${escapeHtml(item.desc)}</p>
    <div class="modal-tags-row">${tagsHtml}</div>
    <p class="modal-info-row">${escapeHtml(item.info)}</p>
    <div class="modal-actions">
      <a class="modal-page-btn" href="${entryUrl(item)}">📄 Open full page</a>
      <button class="modal-fav-btn${isFav ? ' active' : ''}" data-title="${t}" aria-pressed="${isFav}">${isFav ? '♥ Favorited' : '♡ Add to Favorites'}</button>
      <button class="modal-share-btn" data-title="${t}">🔗 Copy Link to This Entry</button>
      <a class="modal-trailer-btn" href="https://www.youtube.com/results?search_query=${trailerQuery}" target="_blank" rel="noopener noreferrer">▶ Watch Trailer on YouTube</a>
    </div>

    <div class="modal-user-section">
      <span class="modal-user-label">My Status</span>
      <div class="modal-status-opts">${statusOptsHtml}</div>

      <div class="modal-personal-rating">
        <span class="modal-user-label">My Rating</span>
        <div class="modal-pr-stars">${starsInput}</div>
        <div class="modal-pr-display" id="modal-pr-display">${curRating > 0 ? `My rating: ${curRating}/10` : 'Not rated'}</div>
      </div>

      <div class="modal-notes-section">
        <label class="modal-user-label" for="modal-notes">Notes</label>
        <textarea class="modal-notes-area" id="modal-notes" placeholder="Your thoughts…"></textarea>
      </div>

      ${related.length ? `<div class="modal-related-section"><div class="modal-related-head">Similar Picks</div>${relatedHtml}</div>` : ''}
    </div>`;

  body.querySelectorAll('.modal-status-opt').forEach(btn => {
    btn.addEventListener('click', () => setUserStatus(item.title, btn.dataset.status));
  });
  body.querySelectorAll('.modal-pr-star').forEach(btn => {
    btn.addEventListener('click', () => setUserRating(item.title, parseInt(btn.dataset.r, 10)));
  });
  body.querySelector('.modal-fav-btn')?.addEventListener('click', e => {
    toggleFavorite(item.title);
    const on = favorites.has(item.title);
    e.currentTarget.classList.toggle('active', on);
    e.currentTarget.setAttribute('aria-pressed', String(on));
    e.currentTarget.textContent = on ? '♥ Favorited' : '♡ Add to Favorites';
  });
  body.querySelector('.modal-share-btn')?.addEventListener('click', e => shareEntry(item.title, e.currentTarget));
  body.querySelectorAll('.modal-related-item').forEach(el => {
    el.addEventListener('click', () => {
      const rel = lookup(el.dataset.relTitle);
      if (rel) openModal(rel.item);
    });
  });

  // Set the note through .value so stored text can never be parsed as markup.
  const notesEl = body.querySelector('#modal-notes');
  if (notesEl) {
    notesEl.value = userNotes[item.title] || '';
    notesEl.addEventListener('input', () => scheduleNoteSave(item.title));
  }

  overlay.classList.add('open');
  overlay.removeAttribute('aria-hidden');
  overlay.removeAttribute('inert');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close')?.focus();
}

function closeModal() {
  const overlay = document.getElementById('detail-modal');
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('inert', '');
  document.body.style.overflow = '';
  if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  lastFocused = null;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function setupModal() {
  const overlay = document.getElementById('detail-modal');
  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;

    // Keep focus inside the dialog.
    const items = [...overlay.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

function shareEntry(title, btn) {
  const item = lookup(title)?.item;
  if (!item) return;
  // Every entry has its own page now, so share that rather than a hash link.
  const url = new URL(entryUrl(item), location.href).href;

  // On touch devices the native share sheet beats a clipboard copy.
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    navigator.share({ title: `${title} · OtakuPlay`, text: item ? `${title} (${item.year}) — ${item.rating}/10 on OtakuPlay` : title, url })
      .catch(err => { if (err.name !== 'AbortError') copyLink(url, btn); });
    return;
  }
  copyLink(url, btn);
}

function copyLink(url, btn) {
  const done = () => {
    if (!btn) return toast('Link copied.');
    btn.textContent = '✓ Link copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '🔗 Copy Link to This Entry'; btn.classList.remove('copied'); }, 2000);
  };

  // navigator.clipboard is undefined on insecure origins (file://, plain-http LAN).
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done));
  } else {
    fallbackCopy(url, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove();
  ok ? done() : toast(`Copy failed — link: ${text}`);
}

/* Which page are we on? Each page renders exactly one section (or none, on the
   landing and about pages), so this replaces the old tab switching. */
const PAGE = document.body.dataset.page || 'home';
const activeSection = () => (SECTIONS[PAGE] ? PAGE : null);

// ===================== URL STATE =====================
function pushHash() {
  const sect = activeSection();
  if (!sect) return;                       // landing / about have no filter state
  const params = new URLSearchParams();

  const s = state[sect];
  if (s.filters.size)        params.set('filter', [...s.filters].join(','));
  if (s.sort !== 'year-asc') params.set('sort', s.sort);
  if (s.search)              params.set('q', s.search);
  if (s.minRating > 0)       params.set('minRating', s.minRating);
  if (s.status !== 'all')    params.set('status', s.status);
  if (s.studio !== 'all')    params.set('studio', s.studio);
  if (s.genreMode !== 'any') params.set('match', s.genreMode);
  const years = SECTIONS[sect].data.map(x => x.year);
  if (s.yearFrom > Math.min(...years)) params.set('from', s.yearFrom);
  if (s.yearTo   < Math.max(...years)) params.set('to', s.yearTo);

  const str = params.toString();
  suppressHashRead = true;
  history.replaceState(null, '', str ? `#${str}` : location.pathname + location.search);
  setTimeout(() => { suppressHashRead = false; }, 0);
}

function readHash() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const params = new URLSearchParams(hash);

  // Plain anchors (#main, #highlights) are navigation, not app state — ignore them.
  const STATE_KEYS = ['sort', 'q', 'filter', 'minRating', 'status', 'entry', 'from', 'to', 'studio', 'match'];
  if (!STATE_KEYS.some(k => params.has(k))) return;

  // An `entry` link works on any page, including the landing page.
  const entryParam = params.get('entry');
  const tab = activeSection();
  if (!tab) {
    if (entryParam) { const found = lookup(entryParam); if (found) openModal(found.item); }
    return;
  }

  const s = state[tab];
  s.sort      = params.get('sort') || 'year-asc';
  s.search    = params.get('q') || '';
  s.filters   = params.get('filter') ? new Set(params.get('filter').split(',')) : new Set();
  s.minRating = parseFloat(params.get('minRating') || '0') || 0;
  s.status    = params.get('status') || 'all';
  s.studio    = params.get('studio') || 'all';
  s.genreMode = params.get('match') === 'all' ? 'all' : 'any';
  // A hand-edited or stale link must never produce an empty range.
  const yrs  = SECTIONS[tab].data.map(x => x.year);
  const lo   = Math.min(...yrs), hi = Math.max(...yrs);
  const clamp = (raw, fallback) => {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? Math.min(Math.max(n, lo), hi) : fallback;
  };
  s.yearFrom = clamp(params.get('from'), lo);
  s.yearTo   = clamp(params.get('to'), hi);
  if (s.yearFrom > s.yearTo) { s.yearFrom = lo; s.yearTo = hi; }

  syncControls(tab);
  renderSection(tab);

  // Deep link straight to an entry: /anime/#entry=Cowboy%20Bebop
  if (entryParam) {
    const found = lookup(entryParam);
    if (found) openModal(found.item);
  }
}

// ===================== RECOMMENDATIONS =====================
/* Builds a taste profile from what you rated highly / marked watched, then scores
   every untouched entry against it. Deliberately simple and explainable: each
   recommendation can say which of your titles it came from. */
const SEED_STATUS_WEIGHT = { watched: 1, watching: 0.8, plan: 0, dropped: -1 };

function tasteSeeds() {
  const seeds = [];
  for (const [title, rating] of Object.entries(userRatings)) {
    const item = lookup(title)?.item;
    if (item && rating >= 7) seeds.push({ item, weight: (rating - 6) / 4 });   // 7→0.25 … 10→1
  }
  for (const [title, status] of Object.entries(userStatus)) {
    const item = lookup(title)?.item;
    const w = SEED_STATUS_WEIGHT[status];
    if (!item || !w) continue;
    if (seeds.some(s => s.item.title === title)) continue;   // an explicit rating wins
    seeds.push({ item, weight: w * 0.6 });
  }
  for (const title of favorites) {
    const item = lookup(title)?.item;
    if (item && !seeds.some(s => s.item.title === title)) seeds.push({ item, weight: 0.7 });
  }
  return seeds;
}

function recommend(sectKey, limit = 4) {
  const seeds = tasteSeeds().filter(s => sectionOf(s.item.title) === sectKey && s.weight > 0);
  if (!seeds.length) return [];

  const seen = new Set([...Object.keys(userStatus), ...Object.keys(userRatings), ...favorites]);
  const scored = SECTIONS[sectKey].data
    .filter(x => !seen.has(x.title))
    .map(candidate => {
      let score = 0, best = null, bestScore = 0;
      for (const seed of seeds) {
        const shared  = candidate.tags.filter(t => seed.item.tags.includes(t)).length;
        const union   = new Set([...candidate.tags, ...seed.item.tags]).size;
        let sim = union ? shared / union : 0;                                  // Jaccard on genres
        if (candidate.studio === seed.item.studio) sim += 0.35;                // same studio
        if (Math.abs(candidate.year - seed.item.year) <= 5) sim += 0.1;        // same era
        if (FRANCHISES[candidate.title] && FRANCHISES[candidate.title] === FRANCHISES[seed.item.title]) sim += 0.5;
        const contribution = sim * seed.weight;
        score += contribution;
        if (contribution > bestScore) { bestScore = contribution; best = seed.item; }
      }
      score *= 0.75 + (candidate.rating / 10) * 0.25;   // nudge toward the better-reviewed
      return { item: candidate, score, because: best };
    })
    .filter(x => x.score > 0.05)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

function recommendationsHtml() {
  const blocks = SECTION_KEYS.map(k => {
    const recs = recommend(k);
    if (!recs.length) return '';
    const label = k === 'anime' ? '🎌 Anime for you' : '🎮 Games for you';
    const cards = recs.map(({ item, because }) => `
      <button class="rec-card" data-title="${escapeHtml(item.title)}">
        <span class="rec-art" style="background:${item.bg}">
          ${item.img ? `<img src="${escapeHtml(item.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">` : `<span aria-hidden="true">${item.emoji}</span>`}
        </span>
        <span class="rec-info">
          <span class="rec-title">${escapeHtml(item.title)}</span>
          <span class="rec-sub">${item.year} · ${escapeHtml(item.studio)} · ${item.rating}</span>
          ${because ? `<span class="rec-because">Because you liked ${escapeHtml(because.title)}</span>` : ''}
        </span>
      </button>`).join('');
    return `<div class="stat-chart-card"><div class="stat-chart-title">${label}</div><div class="rec-list">${cards}</div></div>`;
  }).filter(Boolean);

  if (!blocks.length) {
    return `<div class="stat-chart-card rec-empty">
      <div class="stat-chart-title">✨ Recommended for you</div>
      <p class="stat-empty">Rate a few titles 7+ or mark them watched, and picks tuned to your taste show up here.</p>
    </div>`;
  }
  return blocks.join('');
}

// ===================== STATS =====================
function renderStats() {
  const content = document.getElementById('stats-content');
  if (!content) return;

  const all      = [...ANIME, ...GAMES];
  const avgAnime = (ANIME.reduce((s, x) => s + x.rating, 0) / ANIME.length).toFixed(2);
  const avgGames = (GAMES.reduce((s, x) => s + x.rating, 0) / GAMES.length).toFixed(2);
  const sTier    = all.filter(x => x.rank === 'S').length;
  const awarded  = all.filter(x => x.awards?.length).length;

  const countBy    = (arr, fn) => arr.reduce((m, x) => { const k = fn(x); m[k] = (m[k] || 0) + 1; return m; }, {});
  const topEntries = (obj, n = 8) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
  const tagCounts  = arr => arr.reduce((m, x) => { x.tags.forEach(t => { m[t] = (m[t] || 0) + 1; }); return m; }, {});

  function barChart(entries, colorCls = '') {
    if (!entries.length) return '<p class="stat-empty">Nothing tracked yet.</p>';
    const max = Math.max(...entries.map(([, v]) => v));
    return entries.map(([label, val]) => `
      <div class="stat-bar-row">
        <span class="stat-bar-label">${escapeHtml(label)}</span>
        <div class="stat-bar-track"><div class="stat-bar-fill ${colorCls}" style="width:0" data-w="${(val / max * 100).toFixed(1)}%"></div></div>
        <span class="stat-bar-val">${val}</span>
      </div>`).join('');
  }
  function topList(items) {
    return items.slice(0, 5).map((item, i) => `
      <button class="stat-top-item" data-title="${escapeHtml(item.title)}">
        <span class="stat-top-rank">#${i + 1}</span>
        <span class="stat-top-emoji" aria-hidden="true">${item.emoji}</span>
        <span class="stat-top-info">
          <span class="stat-top-title">${escapeHtml(item.title)}</span>
          <span class="stat-top-sub">${item.year} · ${escapeHtml(item.studio)}</span>
        </span>
        <span class="stat-top-rating">${item.rating}</span>
      </button>`).join('');
  }

  const byDecade   = arr => topEntries(countBy(arr, x => `${Math.floor(x.year / 10) * 10}s`), 12).sort((a, b) => a[0].localeCompare(b[0]));
  const topAnime   = [...ANIME].sort((a, b) => b.rating - a.rating);
  const topGames   = [...GAMES].sort((a, b) => b.rating - a.rating);

  // ── Personal library stats ──
  const statusCounts = { watched: 0, watching: 0, plan: 0, dropped: 0 };
  Object.values(userStatus).forEach(s => { if (statusCounts[s] !== undefined) statusCounts[s]++; });
  const ratingValues = Object.values(userRatings).filter(r => r > 0);
  const myAvg    = ratingValues.length ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(2) : '—';
  const tracked  = Object.keys(userStatus).length;
  const myGenres = topEntries(tagCounts(Object.keys(userStatus).map(t => lookup(t)?.item).filter(Boolean)), 8);

  content.innerHTML = `
    <div class="stats-overview">
      <div class="stat-ov-card"><div class="stat-ov-num">${ANIME.length}</div><div class="stat-ov-label">Anime Entries</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${GAMES.length}</div><div class="stat-ov-label">Game Entries</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${avgAnime}</div><div class="stat-ov-label">Avg Anime Rating</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${avgGames}</div><div class="stat-ov-label">Avg Game Rating</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${sTier}</div><div class="stat-ov-label">S-Tier Entries</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${awarded}</div><div class="stat-ov-label">Award Winners</div></div>
    </div>

    <div class="stats-section-head">Your Library</div>
    <div class="stats-overview">
      <div class="stat-ov-card"><div class="stat-ov-num">${favorites.size}</div><div class="stat-ov-label">Favorites</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${tracked}</div><div class="stat-ov-label">Tracked Titles</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${statusCounts.watched}</div><div class="stat-ov-label">Watched / Played</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${statusCounts.watching}</div><div class="stat-ov-label">In Progress</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${statusCounts.plan}</div><div class="stat-ov-label">Planned</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${myAvg}</div><div class="stat-ov-label">My Avg Rating</div></div>
    </div>
    <div class="stats-charts">
      <div class="stat-chart-card"><div class="stat-chart-title">❤️ Your Top Genres</div>${barChart(myGenres, 'pink')}</div>
      ${recommendationsHtml()}
    </div>

    <div class="stats-section-head">The Catalogue</div>
    <div class="stats-charts">
      <div class="stat-chart-card"><div class="stat-chart-title">🎌 Anime by Decade</div>${barChart(byDecade(ANIME))}</div>
      <div class="stat-chart-card"><div class="stat-chart-title">🎮 Games by Decade</div>${barChart(byDecade(GAMES), 'gold')}</div>
      <div class="stat-chart-card"><div class="stat-chart-title">🎌 Top Anime Genres</div>${barChart(topEntries(tagCounts(ANIME)), 'pink')}</div>
      <div class="stat-chart-card"><div class="stat-chart-title">🎮 Top Game Genres</div>${barChart(topEntries(tagCounts(GAMES)))}</div>
      <div class="stat-chart-card"><div class="stat-chart-title">🏢 Top Anime Studios</div>${barChart(topEntries(countBy(ANIME, x => x.studio)), 'pink')}</div>
      <div class="stat-chart-card"><div class="stat-chart-title">🏢 Top Game Studios</div>${barChart(topEntries(countBy(GAMES, x => x.studio)), 'gold')}</div>
    </div>
    <div class="stats-charts">
      <div class="stat-chart-card"><div class="stat-chart-title">⭐ Highest Rated Anime</div>${topList(topAnime)}</div>
      <div class="stat-chart-card"><div class="stat-chart-title">⭐ Highest Rated Games</div>${topList(topGames)}</div>
    </div>`;

  requestAnimationFrame(() => {
    content.querySelectorAll('.stat-bar-fill[data-w]').forEach(el => { el.style.width = el.dataset.w; });
  });
}

// ===================== MISC UI =====================
function setupJpToggle() {
  const btn = document.getElementById('jp-toggle');
  if (!btn) return;
  btn.setAttribute('aria-pressed', 'false');
  btn.addEventListener('click', () => {
    jpMode = !jpMode;
    btn.classList.toggle('active', jpMode);
    btn.setAttribute('aria-pressed', String(jpMode));
    SECTION_KEYS.forEach(renderSection);
  });
}

function setupScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;                       // don't hijack Ctrl+R etc.
    if (document.getElementById('detail-modal').classList.contains('open')) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

    const sect = activeSection();
    if (!sect) return;                       // no catalogue on this page
    if (e.key === '/') {
      e.preventDefault();
      document.getElementById(ids(sect).search)?.focus();
    } else if (e.key === 'r' || e.key === 'R') {
      randomPick(sect);
    }
  });
}

// Delegated clicks: cards, favorites, jump bar, empty state, stats links.
function setupDelegation() {
  document.addEventListener('click', e => {
    const fav = e.target.closest('.card-fav-btn');
    if (fav) { e.stopPropagation(); toggleFavorite(fav.dataset.title); return; }

    // Card titles are real links to the entry page. A plain click opens the modal
    // (faster, keeps your place); ctrl/cmd/shift-click follows the link as usual.
    const openBtn = e.target.closest('.card-open-btn, .stat-top-item, .rec-card, .highlight-item');
    if (openBtn) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const found = lookup(openBtn.dataset.title);
      if (found) { e.preventDefault(); openModal(found.item); }
      return;
    }

    const card = e.target.closest('.card');
    if (card && !e.target.closest('a')) { const found = lookup(card.dataset.title); if (found) openModal(found.item); return; }

    const jump = e.target.closest('.decade-jump-btn');
    if (jump) { jumpToDecade(jump.dataset.sect, jump.dataset.decade); return; }

    const reset = e.target.closest('.empty-reset');
    if (reset) { resetFilters(reset.dataset.sect); return; }

    const chip = e.target.closest('.chip');
    if (chip) { removeChip(chip.dataset.sect, chip.dataset.kind, chip.dataset.value); return; }

    if (e.target.closest('.export-btn')) { exportData(); return; }
    if (e.target.closest('.import-btn')) { document.getElementById('import-file').click(); return; }
    if (e.target.closest('.clear-btn'))  { clearUserData(); }
  });
}

// ===================== SERVICE WORKER =====================
function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  // Pages live at different depths (/, /anime/, …), so resolve against the site
  // root or a nested page would ask for /anime/sw.js and scope itself to /anime/.
  const root = window.OTAKU_ROOT || '';
  navigator.serviceWorker.register(`${root}sw.js`, { scope: root || './' }).then(reg => {
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      if (!sw) return;
      sw.addEventListener('statechange', () => {
        // A newer build is cached and there's already a controller → offer a reload.
        if (sw.state === 'installed' && navigator.serviceWorker.controller) {
          toast('A new version of OtakuPlay is available.', {
            label: 'Reload',
            onClick: () => { sw.postMessage({ type: 'SKIP_WAITING' }); location.reload(); },
          });
        }
      });
    });
  }).catch(err => console.warn('OtakuPlay: service worker registration failed —', err.message));
}

// ===================== ENTRY PAGE =====================
/* The page itself is static; the personal bits live in localStorage, so they're
   filled in here rather than at build time. */
function setupEntryPage() {
  const article = document.querySelector('.entry[data-entry]');
  if (!article) return;
  const found = lookup(article.dataset.entry);
  if (!found) return;
  const { item } = found;
  const labels = SECTIONS[sectionOf(item.title)].statusLabels;

  const track = document.getElementById('entry-track');
  if (track) track.hidden = false;

  const statusWrap = document.getElementById('entry-status');
  if (statusWrap) {
    const current = userStatus[item.title] || '';
    statusWrap.innerHTML = ['', 'watched', 'watching', 'plan', 'dropped'].map(s =>
      `<button class="modal-status-opt${current === s ? ' active' : ''}" data-status="${s}" aria-pressed="${current === s}">${s === '' ? '— Clear' : labels[s]}</button>`
    ).join('');
    statusWrap.querySelectorAll('.modal-status-opt').forEach(btn =>
      btn.addEventListener('click', () => setUserStatus(item.title, btn.dataset.status)));
  }

  const starWrap = document.getElementById('entry-stars');
  if (starWrap) {
    const rating = userRatings[item.title] || 0;
    starWrap.innerHTML = Array.from({ length: 10 }, (_, i) => i + 1).map(n =>
      `<button class="modal-pr-star${rating >= n ? ' filled' : ''}" data-r="${n}" aria-label="Rate ${n} out of 10">${n}</button>`
    ).join('');
    starWrap.querySelectorAll('.modal-pr-star').forEach(btn =>
      btn.addEventListener('click', () => setUserRating(item.title, parseInt(btn.dataset.r, 10))));
    const display = document.getElementById('modal-pr-display');
    if (display) display.textContent = rating > 0 ? `My rating: ${rating}/10` : 'Not rated';
  }

  const notes = document.getElementById('modal-notes');
  if (notes) {
    notes.value = userNotes[item.title] || '';
    notes.addEventListener('input', () => scheduleNoteSave(item.title));
  }

  document.querySelector('.entry-share')?.addEventListener('click', e => shareEntry(item.title, e.currentTarget));
}

// ===================== LANDING PAGE =====================
function renderHighlights() {
  const build = (sectKey, mountId) => {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    const top = [...SECTIONS[sectKey].data].sort((a, b) => b.rating - a.rating).slice(0, 5);
    mount.innerHTML = top.map((item, i) => `
      <button class="highlight-item" data-title="${escapeHtml(item.title)}">
        <span class="highlight-rank">${i + 1}</span>
        <span class="highlight-art" style="background:${item.bg}">
          ${item.img
            ? `<img src="${escapeHtml(item.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">`
            : `<span aria-hidden="true">${item.emoji}</span>`}
        </span>
        <span class="highlight-info">
          <span class="highlight-title">${escapeHtml(item.title)}</span>
          <span class="highlight-sub">${item.year} · ${escapeHtml(item.studio)}</span>
        </span>
        <span class="highlight-rating">${item.rating}</span>
      </button>`).join('');
  };
  build('anime', 'highlight-anime');
  build('games', 'highlight-games');

  const eras = document.getElementById('era-grid');
  if (!eras) return;
  const all = [...ANIME, ...GAMES];
  const decades = [...new Set(all.map(x => Math.floor(x.year / 10) * 10))].sort((a, b) => a - b);
  const root = window.OTAKU_ROOT || '';
  eras.innerHTML = decades.map(d => {
    const count = all.filter(x => Math.floor(x.year / 10) * 10 === d).length;
    const label = ERA_LABELS[d] || GAME_ERA_LABELS[d] || '';
    return `<a class="era-card" href="${root}anime/#from=${d}&to=${d + 9}">
        <span class="era-decade">${d}s</span>
        <span class="era-label">${escapeHtml(label)}</span>
        <span class="era-count">${count} titles</span>
      </a>`;
  }).join('');
}

// ===================== INIT =====================
function init() {
  // The landing page shows counters; section pages don't have them.
  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  setText('stat-anime', ANIME.length);
  setText('stat-games', GAMES.length);
  setText('stat-years', `${new Date().getFullYear() - Math.min(...[...ANIME, ...GAMES].map(x => x.year))}+`);

  /* Entry pages share their section's page key (so the nav highlights correctly)
     but render no catalogue, so gate on the grid actually being present. */
  const sect = activeSection();
  if (sect && document.getElementById(ids(sect).grid)) {
    renderSection(sect);
    setupFilters(sect);
    setupSort(sect);
    setupSearch(sect);
    setupRatingFilter(sect);
    setupStatusFilter(sect);
    setupRefineRow(sect);
    setupToolbar(sect);
    setupRandom(sect);
    setupJpToggle();
  }

  if (PAGE === 'insights') renderStats();
  if (PAGE === 'home') renderHighlights();
  setupEntryPage();

  setupModal();
  setupScrollTop();
  setupKeyboardShortcuts();
  setupDelegation();

  document.getElementById('import-file')?.addEventListener('change', e => importData(e.target));

  readHash();
  window.addEventListener('hashchange', () => { if (!suppressHashRead) readHash(); });

  registerServiceWorker();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

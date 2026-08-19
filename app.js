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
  anime: { key:'anime', data:ANIME, isGame:false, eraLabels:ERA_LABELS,      statusLabels:STATUS_DISPLAY,
           noun:'Anime',    nounSingular:'Anime',   nounSingularLower:'anime',    nounLower:'anime',    emoji:'🎌', trailerQuery:'anime trailer', chartColor:'pink' },
  games: { key:'games', data:GAMES, isGame:true,  eraLabels:GAME_ERA_LABELS, statusLabels:GAME_STATUS_DISPLAY,
           noun:'PC Games', nounSingular:'PC Game', nounSingularLower:'PC game', nounLower:'PC games', emoji:'🎮', trailerQuery:'gameplay trailer', chartColor:'gold' },
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

function slugOf(item) {
  const base = slugify(item.title);
  return SLUG_COUNTS.get(base) > 1 ? `${base}-${item.year}` : base;
}
function entryUrl(item) {
  return `${window.OTAKU_ROOT || ''}${sectionOf(item.title)}/${slugOf(item)}/`;
}
// null (not a guessed default) on a miss — every real caller passes a title
// that's already known to exist; a miss means the caller should handle it,
// not silently get misreported as anime.
const sectionOf   = title => TITLE_INDEX.get(title)?.sect ?? null;
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
// A user-chosen watch order for "plan" titles — separate from userStatus
// because status is a set (unordered) and this needs a sequence.
let queueOrder  = loadStore('otakuplay-queue', []);
// User-created lists beyond the four status buckets — {id: {name, titles: [...]}}.
let userLists   = loadStore('otakuplay-lists', {});
/* When a status/rating was last set — {title: {status: isoString, rating: isoString}}.
   Didn't exist before this shipped, so it can't be backfilled for anything
   touched earlier; the Year in Review reads this honestly (see below) rather
   than pretending to know dates it was never told. */
let activityLog = loadStore('otakuplay-activity', {});

const saveUserStatus  = () => saveStore('otakuplay-status',  userStatus);
const saveUserRatings = () => saveStore('otakuplay-ratings', userRatings);
const saveUserNotes   = () => saveStore('otakuplay-notes',   userNotes);
const saveFavorites   = () => saveStore('otakuplay-favs', [...favorites]);
const saveQueueOrder  = () => saveStore('otakuplay-queue', queueOrder);
const saveUserLists   = () => saveStore('otakuplay-lists', userLists);
const saveActivityLog = () => saveStore('otakuplay-activity', activityLog);

function recordActivity(title, kind) {
  activityLog[title] = { ...activityLog[title], [kind]: new Date().toISOString() };
  saveActivityLog();
}

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

// ===================== MILESTONES =====================
/* "Badge" was already taken — the franchise/status pills on cards
   (refreshCardBadges, badgeRowHtml) are a different concept, so this uses
   "milestone" throughout to avoid the collision. Purely derived from state
   that already exists — no separate progress counters to keep in sync.
   milestonesSeen only records which ones have already triggered their
   one-time unlock toast; renderMilestones() always recomputes from scratch,
   so earned/locked state can never drift from the library it describes. */
const MILESTONES = [
  { id: 'first-rating', emoji: '⭐', name: 'First Rating', desc: 'Rate your first title.',
    check: () => Object.keys(userRatings).length >= 1 },
  { id: 'critic', emoji: '🎯', name: 'Critic', desc: 'Rate 10 titles.',
    check: () => Object.keys(userRatings).length >= 10 },
  { id: 'completionist', emoji: '🏆', name: 'Completionist', desc: 'Rate 50 titles.',
    check: () => Object.keys(userRatings).length >= 50 },
  { id: 'both-worlds', emoji: '🌐', name: 'Both Worlds', desc: 'Finish something in two different mediums.',
    // "id" stays 'both-worlds' even though the check is no longer anime+games
    // specifically — it's the badgesSeen persistence key, and changing it
    // would incorrectly re-trigger the unlock toast for anyone who already
    // earned it under the old, narrower rule.
    check: () => {
      const finished = Object.entries(userStatus).filter(([, s]) => s === 'watched').map(([t]) => t);
      return new Set(finished.map(sectionOf).filter(Boolean)).size >= 2;
    } },
  { id: 'favorite-fan', emoji: '❤️', name: 'Favorite Fan', desc: 'Favorite 5 titles.',
    check: () => favorites.size >= 5 },
  { id: 'list-maker', emoji: '🗂️', name: 'List Maker', desc: 'Create a custom list.',
    check: () => Object.keys(userLists).length >= 1 },
  { id: 'franchise-finisher', emoji: '🎬', name: 'Franchise Finisher', desc: 'Finish every entry in a franchise.',
    check: () => {
      const groups = {};
      Object.keys(FRANCHISES).forEach(t => { (groups[FRANCHISES[t]] ||= []).push(t); });
      return Object.values(groups).some(titles => titles.length >= 2 && titles.every(t => userStatus[t] === 'watched'));
    } },
  { id: 's-tier-seeker', emoji: '💎', name: 'S-Tier Seeker', desc: 'Finish 5 Tier-S titles.',
    check: () => Object.keys(userStatus).filter(t => userStatus[t] === 'watched' && lookup(t)?.item.rank === 'S').length >= 5 },
];

let milestonesSeen = new Set(loadStore('otakuplay-milestones-seen', []));
const saveMilestonesSeen = () => saveStore('otakuplay-milestones-seen', [...milestonesSeen]);

function checkMilestones() {
  MILESTONES.forEach(m => {
    if (milestonesSeen.has(m.id) || !m.check()) return;
    milestonesSeen.add(m.id);
    saveMilestonesSeen();
    toast(`🏅 Milestone unlocked: ${m.name}`);
  });
  if (document.getElementById('milestones-content')) renderMilestones();
}

function renderMilestones() {
  const mount = document.getElementById('milestones-content');
  if (!mount) return;
  mount.innerHTML = `<div class="milestones-grid">${MILESTONES.map(m => {
    const earned = m.check();
    return `
      <div class="milestone-card${earned ? ' earned' : ''}">
        <span class="milestone-emoji" aria-hidden="true">${earned ? m.emoji : '🔒'}</span>
        <span class="milestone-name">${escapeHtml(m.name)}</span>
        <span class="milestone-desc">${escapeHtml(m.desc)}</span>
      </div>`;
  }).join('')}</div>`;
}

// ===================== USER DATA MUTATIONS =====================
function setUserStatus(title, status) {
  const prevStatus = userStatus[title] || '';
  if (!status || userStatus[title] === status) delete userStatus[title];
  else userStatus[title] = status;
  saveUserStatus();
  if (userStatus[title]) recordActivity(title, 'status');

  const inQueue = queueOrder.includes(title);
  if (userStatus[title] === 'plan') {
    if (!inQueue) { queueOrder.push(title); saveQueueOrder(); }
  } else if (inQueue) {
    queueOrder = queueOrder.filter(t => t !== title);
    saveQueueOrder();
  }
  if (document.getElementById('queue-list')) renderQueue();

  // Patch just the affected cards instead of rebuilding the whole grid.
  refreshCardBadges(title);
  const sect = sectionOf(title);
  if (state[sect].status !== 'all') applyFilter(sect);

  document.querySelectorAll('.modal-status-opt').forEach(btn => {
    const active = btn.dataset.status === (userStatus[title] || '');
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  // Only worth an Undo when a prior value was actually overwritten or
  // cleared — flagging every first-time click would just be noise.
  const newStatus = userStatus[title] || '';
  if (prevStatus && prevStatus !== newStatus) {
    const labels = SECTIONS[sect].statusLabels;
    const newLabel = newStatus ? labels[newStatus] : 'cleared';
    toast(`${title}: ${labels[prevStatus]} → ${newLabel}.`, {
      label: 'Undo', onClick: () => setUserStatus(title, prevStatus),
    });
  }
  checkMilestones();
}

function setUserRating(title, rating) {
  const prev = userRatings[title] || 0;
  if (prev === rating) delete userRatings[title]; else userRatings[title] = rating;
  saveUserRatings();
  const r = userRatings[title] || 0;
  if (r) recordActivity(title, 'rating');
  if (prev > 0 && prev !== r) {
    toast(`${title}: rated ${prev} → ${r || 'unrated'}.`, {
      label: 'Undo', onClick: () => setUserRating(title, prev),
    });
  }
  document.querySelectorAll('.modal-pr-star').forEach(btn => {
    btn.classList.toggle('filled', parseInt(btn.dataset.r, 10) <= r);
  });
  const display = document.getElementById('modal-pr-display');
  if (display) display.textContent = r > 0 ? `My rating: ${r}/10` : 'Not rated';

  // Sorting or filtering by personal rating needs to reflect the change live,
  // same as a status change patching the badge rather than waiting for reload.
  const sect = lookup(title) ? sectionOf(title) : null;
  if (sect && document.getElementById(ids(sect).grid)) {
    if (state[sect].sort === 'myrating') renderSection(sect);
    else if (state[sect].filters.has('rated')) applyFilter(sect);
  }
  checkMilestones();
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
  checkMilestones();
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

// ===================== EXTERNAL LIBRARY IMPORT =====================
/* Matches an external title against the catalogue: exact first, then a
   normalized (lowercase, punctuation-stripped) fallback so "Cowboy Bebop"
   from a CSV or "Fullmetal Alchemist: Brotherhood" from MAL's export still
   lines up despite minor formatting differences. Titles that genuinely
   don't match are skipped, never guessed at. */
const normalizeTitleForMatch = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const NORMALIZED_TITLE_INDEX = new Map(
  [...TITLE_INDEX.keys()].map(t => [normalizeTitleForMatch(t), t]));
function findCatalogueTitle(raw) {
  if (!raw) return null;
  if (TITLE_INDEX.has(raw)) return raw;
  return NORMALIZED_TITLE_INDEX.get(normalizeTitleForMatch(raw)) || null;
}

const MAL_STATUS_MAP = {
  Completed: 'watched', Watching: 'watching',
  // MAL has no direct "watching" equivalent for a paused show; treating it
  // as watching (in progress) is closer than dropping it into "plan" or
  // ignoring it outright.
  'On-Hold': 'watching', Dropped: 'dropped', 'Plan to Watch': 'plan',
};

function parseMalXml(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) return null;
  const nodes = [...doc.querySelectorAll('anime')];
  if (!nodes.length) return null;

  const out = { favorites: [], status: {}, ratings: {}, notes: {} };
  let matched = 0;
  for (const node of nodes) {
    const rawTitle = node.querySelector('series_title')?.textContent?.trim();
    const found = rawTitle && findCatalogueTitle(rawTitle);
    if (!found) continue;

    const malStatus = node.querySelector('my_status')?.textContent?.trim();
    if (MAL_STATUS_MAP[malStatus]) { out.status[found] = MAL_STATUS_MAP[malStatus]; matched++; }

    const score = parseInt(node.querySelector('my_score')?.textContent, 10);
    if (score >= 1 && score <= 10) { out.ratings[found] = score; matched++; }
  }
  return { clean: matched > 0 ? out : null, total: nodes.length, matched };
}

/* No dependency on any single platform's export shape — any source (Steam,
   Backloggd, a hand-built spreadsheet) works as long as it's shaped as
   title,status,rating with a header row. Status accepts common synonyms
   from a few platforms' own vocabularies. */
const CSV_STATUS_SYNONYMS = {
  watched: 'watched', completed: 'watched', played: 'watched', finished: 'watched',
  watching: 'watching', playing: 'watching', 'on-hold': 'watching', onhold: 'watching', 'in progress': 'watching',
  plan: 'plan', 'plan to watch': 'plan', 'plan to play': 'plan', planning: 'plan', backlog: 'plan', wishlist: 'plan',
  dropped: 'dropped',
};

function splitCsvLine(line) {
  const cells = [];
  let cur = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) { cells.push(cur); cur = ''; }
    else cur += c;
  }
  cells.push(cur);
  return cells.map(s => s.trim().replace(/^"|"$/g, ''));
}

function parseGenericCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return null;
  const header = splitCsvLine(lines[0]).map(h => h.toLowerCase().trim());
  const titleIdx  = header.indexOf('title');
  const statusIdx = header.indexOf('status');
  const ratingIdx = header.indexOf('rating');
  if (titleIdx === -1) return null;

  const out = { favorites: [], status: {}, ratings: {}, notes: {} };
  let matched = 0, total = 0;
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const found = findCatalogueTitle(cells[titleIdx]);
    if (!cells[titleIdx]) continue;
    total++;
    if (!found) continue;

    if (statusIdx !== -1) {
      const st = CSV_STATUS_SYNONYMS[(cells[statusIdx] || '').toLowerCase().trim()];
      if (st) { out.status[found] = st; matched++; }
    }
    if (ratingIdx !== -1) {
      const r = Math.round(Number(cells[ratingIdx]));
      if (Number.isFinite(r) && r >= 1 && r <= 10) { out.ratings[found] = r; matched++; }
    }
  }
  return { clean: matched > 0 ? out : null, total, matched };
}

function importExternalLibrary(text, parser, input) {
  let result = null;
  try { result = parser(text); } catch { result = null; }
  if (!result || !result.clean) {
    toast("Couldn't find any matching titles in that file.");
    input.value = '';
    return;
  }
  applySyncData(result.clean, 'merge');
  toast(`Imported ${result.matched} field${result.matched === 1 ? '' : 's'} from ${result.total} entries — titles this catalogue doesn't have were skipped.`);
  input.value = '';
}

function importData(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();
  const reader = new FileReader();
  reader.onerror = () => { toast('Could not read that file.'); input.value = ''; };

  if (name.endsWith('.xml')) {
    reader.onload = e => importExternalLibrary(e.target.result, parseMalXml, input);
    reader.readAsText(file);
    return;
  }
  if (name.endsWith('.csv')) {
    reader.onload = e => importExternalLibrary(e.target.result, parseGenericCsv, input);
    reader.readAsText(file);
    return;
  }

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

// ===================== SYNC CODE =====================
/* Moves favorites/status/ratings/notes to another device via a link or QR code.
   The payload lives entirely in the URL fragment, which browsers never send to
   a server — no account, no backend, nothing transmitted anywhere. */

function bufferToBase64url(bytes) {
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64urlToBuffer(b64url) {
  const pad = (4 - (b64url.length % 4)) % 4;
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/* Gzip when the browser supports it (all evergreen browsers since ~2022) — a
   typical library compresses to a fraction of its JSON size, which matters for
   the QR code. Falls back to plain base64 so an old browser can still generate
   a (longer) link; it just can't decode one someone else compressed. */
async function gzipBase64url(text) {
  if (!('CompressionStream' in window)) return null;
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  const buf = await new Response(stream).arrayBuffer();
  return bufferToBase64url(new Uint8Array(buf));
}
async function gunzipBase64url(b64) {
  const stream = new Blob([base64urlToBuffer(b64)]).stream().pipeThrough(new DecompressionStream('gzip'));
  const buf = await new Response(stream).arrayBuffer();
  return new TextDecoder().decode(buf);
}

function buildSyncPayload() {
  return { v: 1, f: [...favorites], s: userStatus, r: userRatings, n: userNotes };
}

async function generateSyncLink() {
  const json = JSON.stringify(buildSyncPayload());
  const gz = await gzipBase64url(json);
  // Leading digit records which decode path to use, independent of which
  // browser generated the link or which one opens it.
  const code = gz ? `1${gz}` : `0${bufferToBase64url(new TextEncoder().encode(json))}`;
  const url = new URL(`${window.OTAKU_ROOT || ''}insights/`, location.href);
  url.hash = `sync=${code}`;
  return url.href;
}

/* Reuses sanitizeImport's validation (known titles only, valid statuses,
   ratings clamped to 1-10) so a hand-edited or corrupted link can't inject
   anything the file-import path wouldn't already accept. */
async function decodeSyncCode(code) {
  const flag = code[0];
  const body = code.slice(1);
  const json = flag === '1' ? await gunzipBase64url(body) : new TextDecoder().decode(base64urlToBuffer(body));
  const data = JSON.parse(json);
  return sanitizeImport({ favorites: data.f, status: data.s, ratings: data.r, notes: data.n });
}

function applySyncData(clean, mode) {
  if (mode === 'replace') {
    favorites = new Set(clean.favorites);
    userStatus = clean.status;
    userRatings = clean.ratings;
    userNotes = clean.notes;
  } else {
    clean.favorites.forEach(t => favorites.add(t));
    Object.assign(userStatus, clean.status);
    Object.assign(userRatings, clean.ratings);
    Object.assign(userNotes, clean.notes);
  }
  saveFavorites(); saveUserStatus(); saveUserRatings(); saveUserNotes();
  SECTION_KEYS.forEach(k => { if (document.getElementById(ids(k).grid)) renderSection(k); });
  if (PAGE === 'insights') { const c = document.getElementById('stats-content'); if (c) { c.innerHTML = ''; renderStats(); } }
  toast(mode === 'replace' ? 'Library replaced from sync link.' : 'Library merged from sync link.');
}

function syncCounts(clean) {
  return {
    favorites: clean.favorites.length,
    status: Object.keys(clean.status).length,
    ratings: Object.keys(clean.ratings).length,
    notes: Object.keys(clean.notes).length,
  };
}

/* Accepts a full sync URL, just its hash fragment, or a bare code — whatever
   someone actually pastes from a chat message tends to lose the "https://"
   or get line-wrapped, so this only requires the "sync=" marker to still be
   intact, and falls back to treating the whole paste as the code itself. */
function extractSyncCode(pasted) {
  const trimmed = pasted.trim();
  const marker = 'sync=';
  const idx = trimmed.lastIndexOf(marker);
  return idx !== -1 ? trimmed.slice(idx + marker.length) : trimmed;
}

/* Read-only: never touches userStatus/userRatings/favorites. Compares against
   the friend's decoded (and already-sanitized) payload in memory only. */
function buildComparison(friend) {
  const myTitles     = new Set([...Object.keys(userStatus), ...Object.keys(userRatings), ...favorites]);
  const friendTitles = new Set([...Object.keys(friend.status), ...Object.keys(friend.ratings), ...friend.favorites]);
  const shared = [...myTitles].filter(t => friendTitles.has(t));

  const bothRated = shared.filter(t => userRatings[t] && friend.ratings[t]);
  const agree = bothRated.filter(t => Math.abs(userRatings[t] - friend.ratings[t]) <= 1).length;
  const disagreements = bothRated
    .map(t => ({ title: t, mine: userRatings[t], theirs: friend.ratings[t], diff: Math.abs(userRatings[t] - friend.ratings[t]) }))
    .filter(x => x.diff >= 3)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 5);

  const pick = (ratings, excludeTitles) => Object.entries(ratings)
    .filter(([t, r]) => r >= 8 && !excludeTitles.has(t))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([title, rating]) => ({ title, rating }));

  return {
    sharedCount: shared.length,
    bothRatedCount: bothRated.length,
    agree,
    disagreements,
    friendRecommends: pick(friend.ratings, myTitles),
    youRecommend: pick(userRatings, friendTitles),
  };
}

function comparisonHtml(cmp) {
  const list = (items, cls) => items.length
    ? `<ul class="sync-compare-list">${items.map(x => `<li>${escapeHtml(x.title)} <span class="${cls}">${x.rating}/10</span></li>`).join('')}</ul>`
    : `<p class="stat-empty">Nothing here.</p>`;

  const diffRows = cmp.disagreements.length
    ? `<ul class="sync-compare-list">${cmp.disagreements.map(d =>
        `<li>${escapeHtml(d.title)} — you: <span class="sync-compare-mine">${d.mine}</span>, them: <span class="sync-compare-theirs">${d.theirs}</span></li>`).join('')}</ul>`
    : `<p class="stat-empty">No big disagreements — your tastes line up.</p>`;

  return `
    <div class="stats-overview sync-compare-overview">
      <div class="stat-ov-card"><div class="stat-ov-num">${cmp.sharedCount}</div><div class="stat-ov-label">Titles in common</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${cmp.bothRatedCount}</div><div class="stat-ov-label">Both rated</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${cmp.agree}</div><div class="stat-ov-label">Close agreement</div></div>
    </div>
    <div class="stat-chart-card"><div class="stat-chart-title">🍿 Your friend loved, you haven't tried</div>${list(cmp.friendRecommends, 'sync-compare-theirs')}</div>
    <div class="stat-chart-card"><div class="stat-chart-title">✨ You loved, they haven't tried</div>${list(cmp.youRecommend, 'sync-compare-mine')}</div>
    <div class="stat-chart-card"><div class="stat-chart-title">🤔 Where you disagree most</div>${diffRows}</div>`;
}

const SYNC_VIEWS = ['sync-generate-view', 'sync-incoming-view', 'sync-compare-input-view', 'sync-compare-result-view'];
const SYNC_MODE_VIEW = {
  generate: 'sync-generate-view', incoming: 'sync-incoming-view',
  'compare-input': 'sync-compare-input-view', 'compare-result': 'sync-compare-result-view',
};

function openSyncModal(mode, data) {
  const overlay = document.getElementById('sync-modal');
  if (!overlay) return;
  if (!overlay.classList.contains('open')) lastFocused = document.activeElement;

  SYNC_VIEWS.forEach(id => { document.getElementById(id).hidden = id !== SYNC_MODE_VIEW[mode]; });

  if (mode === 'generate') {
    document.getElementById('sync-result').hidden = true;
    document.getElementById('sync-link-input').value = '';
  } else if (mode === 'incoming') {
    const counts = syncCounts(data);
    const parts = [
      counts.favorites && `${counts.favorites} favorite${counts.favorites === 1 ? '' : 's'}`,
      counts.status && `${counts.status} status${counts.status === 1 ? '' : 'es'}`,
      counts.ratings && `${counts.ratings} rating${counts.ratings === 1 ? '' : 's'}`,
      counts.notes && `${counts.notes} note${counts.notes === 1 ? '' : 's'}`,
    ].filter(Boolean);
    document.getElementById('sync-incoming-summary').textContent =
      parts.length ? `This link contains ${parts.join(', ')}.` : 'This link has no data in it.';
    overlay.dataset.pending = JSON.stringify(data);
  } else if (mode === 'compare-input') {
    document.getElementById('sync-compare-input').value = '';
    document.getElementById('sync-compare-error').hidden = true;
  } else if (mode === 'compare-result') {
    document.getElementById('sync-compare-result').innerHTML = data;
  }

  overlay.classList.add('open');
  overlay.removeAttribute('aria-hidden');
  overlay.removeAttribute('inert');
  document.body.style.overflow = 'hidden';
  document.getElementById('sync-modal-close')?.focus();
}

function closeSyncModal() {
  const overlay = document.getElementById('sync-modal');
  if (!overlay || !overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('inert', '');
  delete overlay.dataset.pending;
  document.body.style.overflow = '';
  if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  lastFocused = null;
}

function setupSyncModal() {
  const overlay = document.getElementById('sync-modal');
  if (!overlay) return;
  overlay.setAttribute('inert', '');

  document.getElementById('sync-modal-close')?.addEventListener('click', closeSyncModal);
  document.getElementById('sync-cancel-btn')?.addEventListener('click', closeSyncModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSyncModal(); });

  document.getElementById('sync-generate-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('sync-generate-btn');
    btn.disabled = true; btn.textContent = 'Generating…';
    try {
      const url = await generateSyncLink();
      document.getElementById('sync-link-input').value = url;
      document.getElementById('sync-result').hidden = false;
      const canvas = document.getElementById('sync-qr-canvas');
      if (window.QRCode && canvas) {
        await window.QRCode.toCanvas(canvas, url, { width: 220, margin: 1 });
      }
    } catch {
      toast('Could not generate a sync link on this browser — try exporting to a file instead.');
    } finally {
      btn.disabled = false; btn.textContent = 'Generate sync link';
    }
  });

  document.getElementById('sync-copy-btn')?.addEventListener('click', e => {
    const input = document.getElementById('sync-link-input');
    input.select();
    const done = () => { const b = e.currentTarget; b.textContent = '✓ Copied'; setTimeout(() => { b.textContent = 'Copy'; }, 1800); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(input.value).then(done).catch(() => fallbackCopy(input.value, done));
    else fallbackCopy(input.value, done);
  });

  document.getElementById('sync-merge-btn')?.addEventListener('click', () => {
    const data = JSON.parse(overlay.dataset.pending || 'null');
    if (data) applySyncData(data, 'merge');
    closeSyncModal();
  });
  document.getElementById('sync-replace-btn')?.addEventListener('click', () => {
    const data = JSON.parse(overlay.dataset.pending || 'null');
    if (data && confirm('Replace everything on this device with the linked library? This cannot be undone.')) {
      applySyncData(data, 'replace');
      closeSyncModal();
    }
  });

  document.getElementById('sync-open-compare-btn')?.addEventListener('click', () => openSyncModal('compare-input'));
  document.getElementById('sync-compare-cancel-btn')?.addEventListener('click', () => openSyncModal('generate'));
  document.getElementById('sync-compare-back-btn')?.addEventListener('click', closeSyncModal);

  document.getElementById('sync-compare-run-btn')?.addEventListener('click', async () => {
    const input = document.getElementById('sync-compare-input');
    const errorEl = document.getElementById('sync-compare-error');
    errorEl.hidden = true;
    const code = extractSyncCode(input.value);
    if (!code) { errorEl.textContent = 'Paste a sync link first.'; errorEl.hidden = false; return; }

    const btn = document.getElementById('sync-compare-run-btn');
    btn.disabled = true; btn.textContent = 'Comparing…';
    try {
      const friend = await decodeSyncCode(code);
      if (!friend) throw new Error('empty');
      openSyncModal('compare-result', comparisonHtml(buildComparison(friend)));
    } catch {
      errorEl.textContent = "Couldn't read that link — check it was copied in full.";
      errorEl.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'Compare';
    }
  });
}

/* Runs once on load. A sync link always points at /insights/, so this only
   needs to check the hash there — but it's cheap to check everywhere in case
   someone hand-edits the URL. */
async function checkForSyncLink() {
  const params = new URLSearchParams(location.hash.slice(1));
  const code = params.get('sync');
  if (!code) return;

  // Strip it immediately so a reload (or the merge/replace action re-rendering
  // the page) can't re-trigger the prompt.
  params.delete('sync');
  const rest = params.toString();
  history.replaceState(null, '', rest ? `#${rest}` : location.pathname + location.search);

  try {
    const clean = await decodeSyncCode(code);
    if (!clean) { toast('That sync link has no recognisable library data.'); return; }
    openSyncModal('incoming', clean);
  } catch {
    toast('Could not read that sync link — it may be corrupted, or from a browser too old to decompress it.');
  }
}

// ===================== GLOBAL SEARCH =====================
/* Per-page search only knows about the catalogue rendered on that page — search
   for "Elden Ring" on /anime/ finds nothing, because /games/ never loaded. This
   searches a prebuilt index of every entry regardless of which page you're on. */
let searchIndex = null;
let searchIndexPromise = null;
let searchActiveIndex = -1;

function loadSearchIndex() {
  if (searchIndexPromise) return searchIndexPromise;
  searchIndexPromise = fetch(`${window.OTAKU_ROOT || ''}search-index.json`)
    .then(r => r.json())
    .then(data => { searchIndex = data; return data; })
    .catch(() => { searchIndexPromise = null; throw new Error('index unavailable'); });
  return searchIndexPromise;
}

function scoreEntry(entry, query) {
  const title = entry.t.toLowerCase();
  if (title === query) return 100;
  if (title.startsWith(query)) return 80;
  if (title.includes(query)) return 60;
  if (entry.s.toLowerCase().includes(query)) return 30;
  if (entry.g.some(t => t.includes(query))) return 20;
  // Weakest signal, checked last: a short query like "rpg" would otherwise
  // match half the descriptions and drown out real title/studio/tag hits.
  if (query.length >= 4 && entry.d && entry.d.toLowerCase().includes(query)) return 10;
  return 0;
}

function searchEntries(query) {
  const q = query.trim().toLowerCase();
  if (!q || !searchIndex) return [];
  return searchIndex
    .map(entry => ({ entry, score: scoreEntry(entry, q) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.r - a.entry.r)
    .slice(0, 8)
    .map(x => x.entry);
}

function renderSearchResults(results, query) {
  const list = document.getElementById('global-search-results');
  const input = document.getElementById('global-search-input');
  searchActiveIndex = -1;
  input.setAttribute('aria-expanded', String(results.length > 0));

  if (!query.trim()) {
    list.innerHTML = '';
    list.hidden = true;
    return;
  }
  list.hidden = false;
  if (!results.length) {
    list.innerHTML = `<p class="search-box-empty">No matches for "${escapeHtml(query)}".</p>`;
    return;
  }
  const root = window.OTAKU_ROOT || '';
  list.innerHTML = results.map((r, i) => `
    <a class="search-result" href="${root}${r.u}" role="option" id="search-result-${i}" data-index="${i}">
      <span class="search-result-art" style="background:${r.i ? 'transparent' : '#1a1a2e'}">
        ${r.i ? `<img src="${escapeHtml(r.i)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : `<span aria-hidden="true">${r.e}</span>`}
      </span>
      <span class="search-result-info">
        <span class="search-result-title">${escapeHtml(r.t)}</span>
        <span class="search-result-sub">${r.y} · ${escapeHtml(r.s)} · ${SECTIONS[r.c]?.nounSingular || r.c}</span>
      </span>
      <span class="search-result-rating">${r.r}</span>
    </a>`).join('');
}

function moveSearchSelection(delta) {
  const rows = [...document.querySelectorAll('.search-result')];
  if (!rows.length) return;
  rows[searchActiveIndex]?.classList.remove('active');
  searchActiveIndex = (searchActiveIndex + delta + rows.length) % rows.length;
  const row = rows[searchActiveIndex];
  row.classList.add('active');
  row.scrollIntoView({ block: 'nearest' });
  document.getElementById('global-search-input').setAttribute('aria-activedescendant', row.id);
}

function openSearchModal() {
  const overlay = document.getElementById('search-modal');
  if (!overlay) return;
  if (!overlay.classList.contains('open')) lastFocused = document.activeElement;
  overlay.classList.add('open');
  overlay.removeAttribute('aria-hidden');
  overlay.removeAttribute('inert');
  document.body.style.overflow = 'hidden';

  const input = document.getElementById('global-search-input');
  input.value = '';
  document.getElementById('global-search-results').innerHTML = '';
  document.getElementById('global-search-results').hidden = true;
  input.focus();

  loadSearchIndex().catch(() => {
    document.getElementById('global-search-hint').textContent = 'Search is unavailable right now — try again in a moment.';
  });
}

function closeSearchModal() {
  const overlay = document.getElementById('search-modal');
  if (!overlay || !overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('inert', '');
  document.body.style.overflow = '';
  if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  lastFocused = null;
}

function setupGlobalSearch() {
  const overlay = document.getElementById('search-modal');
  if (!overlay) return;
  overlay.setAttribute('inert', '');

  document.addEventListener('click', e => { if (e.target.closest('.open-global-search')) openSearchModal(); });
  document.getElementById('search-modal-close')?.addEventListener('click', closeSearchModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSearchModal(); });

  document.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && key === 'k') { e.preventDefault(); openSearchModal(); }
  });

  const input = document.getElementById('global-search-input');
  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try { await loadSearchIndex(); } catch { return; }
      renderSearchResults(searchEntries(input.value), input.value);
    }, 100);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSearchSelection(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSearchSelection(-1); }
    else if (e.key === 'Enter') {
      const active = document.querySelector('.search-result.active') || document.querySelector('.search-result');
      if (active) { e.preventDefault(); active.click(); }
    }
  });
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
    // Unrated titles sort to the end rather than mixing in as "0" among 1-10 scores.
    case 'myrating':  return d.sort((a, b) => {
      const ra = userRatings[a.title] || 0, rb = userRatings[b.title] || 0;
      if (ra === 0 && rb === 0) return b.rating - a.rating;
      if (ra === 0) return 1;
      if (rb === 0) return -1;
      return rb - ra || b.rating - a.rating;
    });
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
      else if (filters.has('rated')) matchesFilter = (userRatings[title] || 0) > 0;
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
  const exclusive = new Set(['favorites', 'new', 'rated']);

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
    const label = f === 'favorites' ? '♥ Favorites' : f === 'rated' ? '★ My Ratings' : f === 'new' ? '🆕 New' : f;
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

// ===================== GRID / LIST VIEW =====================
/* One global preference, not per-section — someone who wants density wants
   it on both catalogues, and a click on either toggle should apply to both
   even though only one grid is ever rendered on a given page. */
const VIEW_KEY = 'otakuplay-view-mode';
let listView = localStorage.getItem(VIEW_KEY) === 'list';

function applyViewMode(sectKey) {
  const grid = document.getElementById(ids(sectKey).grid);
  const btn  = document.getElementById(`${sectKey}-view-toggle`);
  if (grid) grid.classList.toggle('list-view', listView);
  if (btn) {
    btn.textContent = listView ? '⊞' : '☰';
    btn.setAttribute('aria-pressed', String(listView));
    const label = listView ? 'Switch to card view' : 'Switch to compact list view';
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }
}

function setupViewToggle(sectKey) {
  const btn = document.getElementById(`${sectKey}-view-toggle`);
  if (!btn) return;
  applyViewMode(sectKey);
  btn.addEventListener('click', () => {
    listView = !listView;
    localStorage.setItem(VIEW_KEY, listView ? 'list' : 'grid');
    SECTION_KEYS.forEach(applyViewMode);
  });
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

// ===================== CUSTOM LISTS =====================
function createList(name) {
  const trimmed = name.trim().slice(0, 40);
  if (!trimmed) return null;
  const id = `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  userLists[id] = { name: trimmed, titles: [] };
  saveUserLists();
  checkMilestones();
  return id;
}

function deleteList(id) {
  delete userLists[id];
  saveUserLists();
}

function toggleListMembership(id, title) {
  const list = userLists[id];
  if (!list) return;
  const i = list.titles.indexOf(title);
  if (i === -1) list.titles.push(title); else list.titles.splice(i, 1);
  saveUserLists();
}

/* Rendered inside the detail modal — chips toggle membership directly,
   mirroring how status/rating already work there rather than adding a
   separate picker UI. */
function renderModalListChips(title) {
  const wrap = document.getElementById('modal-lists-chips');
  if (!wrap) return;
  const ids = Object.keys(userLists);
  wrap.innerHTML = ids.length
    ? ids.map(id => {
        const list = userLists[id];
        const active = list.titles.includes(title);
        return `<button class="list-chip${active ? ' active' : ''}" data-list-id="${id}" aria-pressed="${active}">${escapeHtml(list.name)}</button>`;
      }).join('')
    : `<p class="stat-empty">No lists yet — create one below.</p>`;

  wrap.querySelectorAll('.list-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      toggleListMembership(chip.dataset.listId, title);
      renderModalListChips(title);
    });
  });
}

function renderMyLists() {
  const mount = document.getElementById('my-lists-content');
  if (!mount) return;
  const ids = Object.keys(userLists);

  const cards = ids.map(id => {
    const list  = userLists[id];
    const items = list.titles.map(t => lookup(t)?.item).filter(Boolean);
    const rows = items.length
      ? items.map(item => `
          <div class="list-item-row">
            <button class="queue-open" data-title="${escapeHtml(item.title)}">
              <span class="queue-art" style="background:${item.bg}">
                ${item.img ? `<img src="${escapeHtml(item.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">` : `<span aria-hidden="true">${item.emoji}</span>`}
              </span>
              <span class="queue-info">
                <span class="queue-title">${escapeHtml(item.title)}</span>
                <span class="queue-sub">${item.year} · ${escapeHtml(item.studio)}</span>
              </span>
            </button>
            <button class="list-item-remove" data-list-id="${id}" data-title="${escapeHtml(item.title)}" aria-label="Remove ${escapeHtml(item.title)} from ${escapeHtml(list.name)}">✕</button>
          </div>`).join('')
      : `<p class="stat-empty">Empty — add titles from any entry's detail view.</p>`;

    return `
      <div class="stat-chart-card my-list-card">
        <div class="my-list-head">
          <div class="stat-chart-title">🗂️ ${escapeHtml(list.name)}</div>
          <button class="my-list-delete" data-list-id="${id}" aria-label="Delete list ${escapeHtml(list.name)}">Delete</button>
        </div>
        ${rows}
      </div>`;
  }).join('');

  mount.innerHTML = `
    <div class="my-list-new-row">
      <input type="text" class="my-list-new-input" id="my-list-new-input" placeholder="New list name…" maxlength="40" aria-label="New list name" />
      <button class="btn-secondary my-list-new-btn" id="my-list-new-btn">+ Create list</button>
    </div>
    <div class="stats-charts">${cards || '<p class="stat-empty">No lists yet — create one above, then add titles from any entry’s detail view.</p>'}</div>`;

  const input = document.getElementById('my-list-new-input');
  document.getElementById('my-list-new-btn')?.addEventListener('click', () => {
    if (createList(input.value)) { input.value = ''; renderMyLists(); }
  });
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); if (createList(input.value)) { input.value = ''; renderMyLists(); } }
  });
  mount.querySelectorAll('.my-list-delete').forEach(btn => btn.addEventListener('click', () => {
    if (confirm(`Delete the list "${userLists[btn.dataset.listId]?.name}"? This cannot be undone.`)) {
      deleteList(btn.dataset.listId);
      renderMyLists();
    }
  }));
  mount.querySelectorAll('.list-item-remove').forEach(btn => btn.addEventListener('click', () => {
    toggleListMembership(btn.dataset.listId, btn.dataset.title);
    renderMyLists();
  }));
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

  const trailerQuery = encodeURIComponent(`${item.title} ${SECTIONS[sect].trailerQuery}`);
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

      <div class="modal-lists-section">
        <span class="modal-user-label">My Lists</span>
        <div class="modal-lists-chips" id="modal-lists-chips"></div>
        <div class="modal-lists-new">
          <input type="text" class="modal-lists-input" id="modal-lists-new-input" placeholder="New list name…" maxlength="40" aria-label="New list name" />
          <button class="modal-lists-add-btn" id="modal-lists-add-btn">+ Add</button>
        </div>
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

  renderModalListChips(item.title);
  const newListInput = document.getElementById('modal-lists-new-input');
  const addToNewList = () => {
    const id = createList(newListInput.value);
    if (!id) return;
    toggleListMembership(id, item.title);
    newListInput.value = '';
    renderModalListChips(item.title);
  };
  document.getElementById('modal-lists-add-btn')?.addEventListener('click', addToNewList);
  newListInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addToNewList(); } });
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
  // Applied here rather than in the markup: whatever happens to this script, a
  // closed modal is inert and an open one never is.
  overlay.setAttribute('inert', '');
  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
}

// ===================== COVER ART LIGHTBOX =====================
function openLightbox(src, alt) {
  const overlay = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  if (!overlay || !img || !src) return;
  if (!overlay.classList.contains('open')) lastFocused = document.activeElement;
  img.src = src;
  img.alt = alt;
  overlay.classList.add('open');
  overlay.removeAttribute('aria-hidden');
  overlay.removeAttribute('inert');
  document.body.style.overflow = 'hidden';
  document.getElementById('lightbox-close')?.focus();
}

function closeLightbox() {
  const overlay = document.getElementById('lightbox-modal');
  if (!overlay || !overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('inert', '');
  document.getElementById('lightbox-img').src = '';
  document.body.style.overflow = '';
  if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  lastFocused = null;
}

function setupLightbox() {
  const overlay = document.getElementById('lightbox-modal');
  if (!overlay) return;
  overlay.setAttribute('inert', '');
  document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });

  document.querySelectorAll('.entry-art.zoomable').forEach(img => {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Enlarge cover art for ${img.alt.replace(/^Cover art for /, '')}`);
    const open = () => openLightbox(img.currentSrc || img.src, img.alt);
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}

/* Escape and focus-trapping apply to whichever .modal-overlay is currently
   open — the detail modal and the sync modal share this rather than each
   reimplementing it. */
const MODAL_CLOSERS = { 'detail-modal': closeModal, 'sync-modal': closeSyncModal, 'search-modal': closeSearchModal, 'lightbox-modal': closeLightbox };

document.addEventListener('keydown', e => {
  const overlay = document.querySelector('.modal-overlay.open');
  if (!overlay) return;
  if (e.key === 'Escape') { MODAL_CLOSERS[overlay.id]?.(); return; }
  if (e.key !== 'Tab') return;

  const items = [...overlay.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

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

/* Same idea as recommend(), but the seeds come from every OTHER medium, not
   the same one being scored — "you liked this game, try this anime." Pooling
   every other section (rather than one fixed pair) is what lets this scale
   past exactly two mediums; the per-candidate `because` still tracks the
   single best-matching seed, so "Because you liked the X Y" attribution stays
   specific even though the seed pool is now N-1 sections wide. Studio and
   franchise bonuses don't apply across mediums (a game studio never matches
   an anime studio), so this scores on genre overlap and era proximity alone. */
function recommendCross(targetSect, limit = 4) {
  const seeds = tasteSeeds().filter(s => sectionOf(s.item.title) !== targetSect && s.weight > 0);
  if (!seeds.length) return [];

  const seen = new Set([...Object.keys(userStatus), ...Object.keys(userRatings), ...favorites]);
  const scored = SECTIONS[targetSect].data
    .filter(x => !seen.has(x.title))
    .map(candidate => {
      let score = 0, best = null, bestScore = 0;
      for (const seed of seeds) {
        const shared = candidate.tags.filter(t => seed.item.tags.includes(t)).length;
        const union  = new Set([...candidate.tags, ...seed.item.tags]).size;
        let sim = union ? shared / union : 0;
        if (Math.abs(candidate.year - seed.item.year) <= 5) sim += 0.1;
        const contribution = sim * seed.weight;
        score += contribution;
        if (contribution > bestScore) { bestScore = contribution; best = seed.item; }
      }
      score *= 0.75 + (candidate.rating / 10) * 0.25;
      return { item: candidate, score, because: best };
    })
    .filter(x => x.score > 0.08)   // cross-media overlap is weaker signal than same-catalogue — a higher bar avoids noise
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

function recCardHtml(item, because, crossMedium) {
  const becauseText = because
    ? `Because you liked ${crossMedium ? `the ${crossMedium} ` : ''}${escapeHtml(because.title)}` : '';
  return `
    <button class="rec-card" data-title="${escapeHtml(item.title)}">
      <span class="rec-art" style="background:${item.bg}">
        ${item.img ? `<img src="${escapeHtml(item.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">` : `<span aria-hidden="true">${item.emoji}</span>`}
      </span>
      <span class="rec-info">
        <span class="rec-title">${escapeHtml(item.title)}</span>
        <span class="rec-sub">${item.year} · ${escapeHtml(item.studio)} · ${item.rating}</span>
        ${becauseText ? `<span class="rec-because">${becauseText}</span>` : ''}
      </span>
    </button>`;
}

function recommendationsHtml() {
  const blocks = SECTION_KEYS.map(k => {
    const recs = recommend(k);
    if (!recs.length) return '';
    const label = `${SECTIONS[k].emoji} ${SECTIONS[k].noun} for you`;
    const cards = recs.map(({ item, because }) => recCardHtml(item, because)).join('');
    return `<div class="stat-chart-card"><div class="stat-chart-title">${label}</div><div class="rec-list">${cards}</div></div>`;
  }).filter(Boolean);

  // "You liked this game, try this anime" and vice versa — a weaker, cross-media
  // signal, so it's kept as its own block rather than mixed into the same-catalogue picks.
  // The heading can't name one specific other medium once there are more than
  // two — the per-card "Because you liked the X Y" line (crossMedium, derived
  // from whichever seed actually matched) still gives the specific attribution.
  const crossBlocks = SECTION_KEYS.map(k => {
    const recs = recommendCross(k);
    if (!recs.length) return '';
    const label = `🔀 ${SECTIONS[k].noun}, based on your other tastes`;
    const cards = recs.map(({ item, because }) => {
      const crossMedium = because ? SECTIONS[sectionOf(because.title)]?.nounSingularLower : null;
      return recCardHtml(item, because, crossMedium);
    }).join('');
    return `<div class="stat-chart-card"><div class="stat-chart-title">${label}</div><div class="rec-list">${cards}</div></div>`;
  }).filter(Boolean);

  const allBlocks = [...blocks, ...crossBlocks];
  if (!allBlocks.length) {
    return `<div class="stat-chart-card rec-empty">
      <div class="stat-chart-title">✨ Recommended for you</div>
      <p class="stat-empty">Rate a few titles 7+ or mark them watched, and picks tuned to your taste show up here.</p>
      ${tasteQuizHtml()}
    </div>`;
  }
  return allBlocks.join('');
}

// ===================== STARTER TASTE QUIZ =====================
/* Shown only in the empty-recommendations state above — once real ratings/
   statuses/favorites exist, recommend()/recommendCross() take over and this
   never renders again. Scores directly off chosen genre tags rather than a
   seed item, since there's nothing rated yet to seed from. */
const GENRE_LABEL_OVERRIDES = { scifi: 'Sci-Fi', rpg: 'RPG', fps: 'FPS', rts: 'RTS', openworld: 'Open World', soulslike: "Souls-like" };
const genreLabel = t => GENRE_LABEL_OVERRIDES[t] || (t.charAt(0).toUpperCase() + t.slice(1));

function tasteQuizGenres(limit = 14) {
  const counts = {};
  SECTION_KEYS.flatMap(k => SECTIONS[k].data).forEach(item => item.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, limit);
}

function tasteQuizHtml() {
  const chips = tasteQuizGenres().map(t =>
    `<button type="button" class="quiz-genre-chip" data-genre="${t}" aria-pressed="false">${genreLabel(t)}</button>`).join('');
  return `
    <p class="quiz-intro">Or take a 10-second quiz instead — pick a few genres you enjoy.</p>
    <div class="quiz-genres" id="quiz-genres" role="group" aria-label="Pick genres you enjoy">${chips}</div>
    <div class="quiz-medium" role="radiogroup" aria-label="Show recommendations for">
      <button type="button" class="quiz-medium-btn active" data-medium="both" aria-pressed="true">All</button>
      ${SECTION_KEYS.map(k => `<button type="button" class="quiz-medium-btn" data-medium="${k}" aria-pressed="false">${SECTIONS[k].emoji} ${SECTIONS[k].noun}</button>`).join('')}
    </div>
    <button type="button" class="quiz-submit-btn" id="quiz-submit-btn" disabled>Get my picks (pick 2+ genres)</button>
    <div id="quiz-result"></div>`;
}

function quizCardHtml(item, matched, picked) {
  return `
    <button class="rec-card" data-title="${escapeHtml(item.title)}">
      <span class="rec-art" style="background:${item.bg}">
        ${item.img ? `<img src="${escapeHtml(item.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">` : `<span aria-hidden="true">${item.emoji}</span>`}
      </span>
      <span class="rec-info">
        <span class="rec-title">${escapeHtml(item.title)}</span>
        <span class="rec-sub">${item.year} · ${escapeHtml(item.studio)} · ${item.rating}</span>
        <span class="rec-because">Matches ${matched} of your ${picked} picks</span>
      </span>
    </button>`;
}

function runTasteQuiz(genres, medium) {
  const result = document.getElementById('quiz-result');
  if (!result) return;
  const sects = medium === 'both' ? SECTION_KEYS : [medium];
  const seen  = new Set([...Object.keys(userStatus), ...Object.keys(userRatings), ...favorites]);

  const blocks = sects.map(k => {
    const scored = SECTIONS[k].data
      .filter(x => !seen.has(x.title))
      .map(item => ({ item, matched: item.tags.filter(t => genres.includes(t)).length }))
      .filter(x => x.matched > 0)
      .sort((a, b) => b.matched - a.matched || b.item.rating - a.item.rating)
      .slice(0, 4);
    if (!scored.length) return '';
    const label = `${SECTIONS[k].emoji} ${SECTIONS[k].nounSingular} picks`;
    const cards = scored.map(({ item, matched }) => quizCardHtml(item, matched, genres.length)).join('');
    return `<div class="quiz-result-block"><div class="quiz-result-label">${label}</div><div class="rec-list">${cards}</div></div>`;
  }).filter(Boolean);

  result.innerHTML = blocks.length ? blocks.join('')
    : '<p class="stat-empty">No matches for that combination — try different genres.</p>';
}

function setupTasteQuiz() {
  const genreGroup = document.getElementById('quiz-genres');
  const submitBtn  = document.getElementById('quiz-submit-btn');
  if (!genreGroup || !submitBtn) return;
  let medium = 'both';

  genreGroup.querySelectorAll('.quiz-genre-chip').forEach(chip => chip.addEventListener('click', () => {
    const active = chip.classList.toggle('active');
    chip.setAttribute('aria-pressed', String(active));
    const count = genreGroup.querySelectorAll('.quiz-genre-chip.active').length;
    submitBtn.disabled = count < 2;
    submitBtn.textContent = count < 2 ? 'Get my picks (pick 2+ genres)' : 'Get my picks';
  }));

  document.querySelectorAll('.quiz-medium-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.quiz-medium-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    medium = btn.dataset.medium;
  }));

  submitBtn.addEventListener('click', () => {
    const genres = [...genreGroup.querySelectorAll('.quiz-genre-chip.active')].map(c => c.dataset.genre);
    runTasteQuiz(genres, medium);
  });
}

// ===================== SHAREABLE TOP 10 CARD =====================
/* Cover art comes from third-party CDNs without CORS headers for anonymous
   use, so drawing it onto a canvas would taint it and block toBlob() with a
   SecurityError — this draws each item's own gradient (already just two hex
   stops in data.js) as a swatch instead, never the image itself. */
function gradientStops(bg) {
  const hex = bg.match(/#[0-9a-fA-F]{3,8}/g);
  return hex && hex.length >= 2 ? [hex[0], hex[1]] : ['#8b5cf6', '#3b82f6'];
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function truncateToWidth(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

function buildTop10Canvas(ranked) {
  const W = 800, headerH = 168, rowH = 92, footerH = 64;
  const H = headerH + ranked.length * rowH + footerH;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const sans = 'Arial, Helvetica, sans-serif';

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#120a28'); bg.addColorStop(1, '#07070e');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#a78bfa';
  ctx.font = `700 18px ${sans}`;
  ctx.fillText('⚡ OTAKUPLAY', 40, 52);
  ctx.fillStyle = '#f5f5fa';
  ctx.font = `900 42px ${sans}`;
  ctx.fillText('My Top 10', 40, 104);
  ctx.fillStyle = '#9a9ac4';
  ctx.font = `400 15px ${sans}`;
  ctx.fillText('Ranked by my own rating, not the catalogue score', 40, 134);

  ranked.forEach(({ item, rating }, i) => {
    const y = headerH + i * rowH;
    const [c1, c2] = gradientStops(item.bg);
    const sw = ctx.createLinearGradient(40, y, 104, y + 64);
    sw.addColorStop(0, c1); sw.addColorStop(1, c2);
    ctx.fillStyle = sw;
    roundRectPath(ctx, 40, y + 14, 64, 64, 10);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `28px ${sans}`;
    ctx.textAlign = 'center';
    ctx.fillText(item.emoji, 72, y + 55);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#6d28d9';
    ctx.font = `900 30px ${sans}`;
    ctx.fillText(`${i + 1}`, 118, y + 48);

    ctx.fillStyle = '#f5f5fa';
    ctx.font = `700 23px ${sans}`;
    ctx.fillText(truncateToWidth(ctx, item.title, 430), 172, y + 38);

    ctx.fillStyle = '#8484b0';
    ctx.font = `400 15px ${sans}`;
    ctx.fillText(`${item.year} · ${truncateToWidth(ctx, item.studio, 260)}`, 172, y + 63);

    ctx.fillStyle = '#fbbf24';
    ctx.font = `900 21px ${sans}`;
    ctx.textAlign = 'right';
    ctx.fillText(`${rating}/10`, W - 40, y + 48);
    ctx.textAlign = 'left';
  });

  ctx.fillStyle = '#63637f';
  ctx.font = `400 13px ${sans}`;
  ctx.fillText('pavankalyan-9.github.io/otakuplay', 40, H - 26);
  ctx.textAlign = 'right';
  ctx.fillText(new Date().toLocaleDateString(), W - 40, H - 26);
  ctx.textAlign = 'left';

  return canvas;
}

function shareTop10() {
  const ranked = Object.entries(userRatings)
    .map(([title, rating]) => ({ item: lookup(title)?.item, rating }))
    .filter(x => x.item && x.rating > 0)
    .sort((a, b) => b.rating - a.rating || b.item.rating - a.item.rating)
    .slice(0, 10);

  if (ranked.length < 3) { toast('Rate at least 3 titles to generate a Top 10 card.'); return; }

  const canvas = buildTop10Canvas(ranked);
  canvas.toBlob(blob => {
    if (!blob) { toast('Could not generate the image on this browser.'); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'otakuplay-my-top-10.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Top 10 card downloaded.');
  }, 'image/png');
}

// ===================== NEXT-UP QUEUE =====================
/* queueOrder is authoritative for ordering, but import/sync can set statuses
   directly without going through setUserStatus — so this reconciles it
   against the real "plan" set every render rather than trusting it blindly. */
function getQueueItems() {
  const planTitles = new Set(Object.keys(userStatus).filter(t => userStatus[t] === 'plan'));
  queueOrder = queueOrder.filter(t => planTitles.has(t));
  planTitles.forEach(t => { if (!queueOrder.includes(t)) queueOrder.push(t); });
  saveQueueOrder();
  return queueOrder.map(t => lookup(t)?.item).filter(Boolean);
}

function moveQueueItem(title, dir) {
  const i = queueOrder.indexOf(title);
  if (i === -1) return;
  const j = dir === 'up' ? i - 1 : i + 1;
  if (j < 0 || j >= queueOrder.length) return;
  [queueOrder[i], queueOrder[j]] = [queueOrder[j], queueOrder[i]];
  saveQueueOrder();
  renderQueue();
}

function renderQueue() {
  const mount = document.getElementById('queue-list');
  if (!mount) return;
  const items = getQueueItems();
  if (!items.length) {
    mount.innerHTML = `<p class="stat-empty">Mark titles "Plan to Watch/Play" and they'll queue up here — reorder them with the arrows.</p>`;
    return;
  }
  mount.innerHTML = items.map((item, i) => `
    <div class="queue-item">
      <span class="queue-pos">${i + 1}</span>
      <button class="queue-open" data-title="${escapeHtml(item.title)}">
        <span class="queue-art" style="background:${item.bg}">
          ${item.img ? `<img src="${escapeHtml(item.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">` : `<span aria-hidden="true">${item.emoji}</span>`}
        </span>
        <span class="queue-info">
          <span class="queue-title">${escapeHtml(item.title)}</span>
          <span class="queue-sub">${item.year} · ${escapeHtml(item.studio)}</span>
        </span>
      </button>
      <span class="queue-actions">
        <button class="queue-move" data-title="${escapeHtml(item.title)}" data-dir="up" aria-label="Move ${escapeHtml(item.title)} up in the queue"${i === 0 ? ' disabled' : ''}>▲</button>
        <button class="queue-move" data-title="${escapeHtml(item.title)}" data-dir="down" aria-label="Move ${escapeHtml(item.title)} down in the queue"${i === items.length - 1 ? ' disabled' : ''}>▼</button>
      </span>
    </div>`).join('');
}

// ===================== YEAR IN REVIEW =====================
/* Reads activityLog, which only exists from the moment this feature shipped
   — there is no way to know when something was actually finished before
   that, so this deliberately doesn't guess. A returning visitor with years
   of history will see this start near-empty and fill in as they use the
   site, rather than a fabricated backfill. */
function yearInReviewData() {
  const year = new Date().getFullYear();
  const inThisYear = iso => iso && new Date(iso).getFullYear() === year;

  const finished = [];
  const rated = [];
  for (const [title, log] of Object.entries(activityLog)) {
    const item = lookup(title)?.item;
    if (!item) continue;
    if (userStatus[title] === 'watched' && inThisYear(log.status)) finished.push(item);
    if (userRatings[title] > 0 && inThisYear(log.rating)) rated.push({ item, rating: userRatings[title] });
  }

  const genreCounts = {};
  finished.forEach(item => item.tags.forEach(t => { genreCounts[t] = (genreCounts[t] || 0) + 1; }));
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const avgRating = rated.length ? (rated.reduce((s, r) => s + r.rating, 0) / rated.length).toFixed(1) : null;
  const highlights = [...rated].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return { year, finishedCount: finished.length, ratedCount: rated.length, topGenre, avgRating, highlights };
}

function yearInReviewHtml() {
  const d = yearInReviewData();
  const hasAny = d.finishedCount > 0 || d.ratedCount > 0;
  const highlightsHtml = d.highlights.length
    ? `<ul class="year-review-highlights">${d.highlights.map(h => `<li>${escapeHtml(h.item.title)} <span class="sync-compare-mine">${h.rating}/10</span></li>`).join('')}</ul>`
    : '';

  return `
    <div class="stat-chart-card year-review-card">
      <div class="stat-chart-title">🎊 ${d.year} in Review</div>
      ${hasAny ? `
        <div class="stats-overview year-review-overview">
          <div class="stat-ov-card"><div class="stat-ov-num">${d.finishedCount}</div><div class="stat-ov-label">Finished</div></div>
          <div class="stat-ov-card"><div class="stat-ov-num">${d.ratedCount}</div><div class="stat-ov-label">Rated</div></div>
          <div class="stat-ov-card"><div class="stat-ov-num">${d.avgRating ?? '—'}</div><div class="stat-ov-label">Avg Rating</div></div>
        </div>
        ${d.topGenre ? `<p class="year-review-genre">Your most-finished genre this year: <strong>${escapeHtml(d.topGenre)}</strong></p>` : ''}
        ${highlightsHtml}
      ` : `<p class="stat-empty">Nothing dated yet this year — this only counts activity from today onward, not your history from before this shipped.</p>`}
    </div>`;
}

// ===================== GENRE AFFINITY RADAR =====================
/* Average personal rating per genre, not just how many titles you've tracked
   in it (that's what the "Your Top Genres" bar chart already shows) — this
   answers "which genres do I actually rate highest", which a count can't. */
function genreAffinity(limit = 6) {
  const sums = {}, counts = {};
  for (const [title, rating] of Object.entries(userRatings)) {
    if (!rating) continue;
    const item = lookup(title)?.item;
    if (!item) continue;
    item.tags.forEach(t => { sums[t] = (sums[t] || 0) + rating; counts[t] = (counts[t] || 0) + 1; });
  }
  return Object.keys(counts)
    .map(tag => ({ tag, avg: sums[tag] / counts[tag], n: counts[tag] }))
    .sort((a, b) => b.n - a.n || b.avg - a.avg)
    .slice(0, limit);
}

function radarChartSvg(genres) {
  const n = genres.length, W = 280, H = 250, cx = 140, cy = 120, maxR = 80;
  const angleFor = i => (Math.PI * 2 * i / n) - Math.PI / 2;
  const pointAt = (i, val) => {
    const r = (Math.max(val, 0) / 10) * maxR;
    const a = angleFor(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const rings = [2, 4, 6, 8, 10].map(v =>
    `<polygon points="${genres.map((_, i) => pointAt(i, v).join(',')).join(' ')}" class="radar-grid" />`).join('');
  const axes = genres.map((_, i) => {
    const [x, y] = pointAt(i, 10);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="radar-axis" />`;
  }).join('');
  const dataPoly = genres.map((g, i) => pointAt(i, g.avg).join(',')).join(' ');
  const dots = genres.map((g, i) => { const [x, y] = pointAt(i, g.avg); return `<circle cx="${x}" cy="${y}" r="3.5" class="radar-point" />`; }).join('');
  const labels = genres.map((g, i) => {
    const [x, y] = pointAt(i, 12.6);
    return `<text x="${x}" y="${y}" class="radar-label" text-anchor="middle" dominant-baseline="middle">${escapeHtml(g.tag)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="radar-chart" role="img" aria-label="Your average rating by genre: ${genres.map(g => `${g.tag} ${g.avg.toFixed(1)}`).join(', ')}">
    ${rings}${axes}
    <polygon points="${dataPoly}" class="radar-data" />
    ${dots}
    ${labels}
  </svg>`;
}

function genreAffinityHtml() {
  const genres = genreAffinity();
  if (genres.length < 3) {
    return `<div class="stat-chart-card"><div class="stat-chart-title">🎯 Your Genre Affinity</div>
      <p class="stat-empty">Rate titles across at least three genres to see which ones you actually score highest.</p></div>`;
  }
  return `<div class="stat-chart-card stat-chart-radar"><div class="stat-chart-title">🎯 Your Genre Affinity</div>${radarChartSvg(genres)}</div>`;
}

// ===================== STATS =====================
function renderStats() {
  const content = document.getElementById('stats-content');
  if (!content) return;

  const all      = SECTION_KEYS.flatMap(k => SECTIONS[k].data);
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

  const byDecade = arr => topEntries(countBy(arr, x => `${Math.floor(x.year / 10) * 10}s`), 12).sort((a, b) => a[0].localeCompare(b[0]));

  // ── Personal library stats ──
  const statusCounts = { watched: 0, watching: 0, plan: 0, dropped: 0 };
  Object.values(userStatus).forEach(s => { if (statusCounts[s] !== undefined) statusCounts[s]++; });
  const ratingValues = Object.values(userRatings).filter(r => r > 0);
  const myAvg    = ratingValues.length ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(2) : '—';
  const tracked  = Object.keys(userStatus).length;
  const myGenres = topEntries(tagCounts(Object.keys(userStatus).map(t => lookup(t)?.item).filter(Boolean)), 8);

  // One "Entries" + one "Avg Rating" overview card per medium, in SECTION_KEYS
  // order, so a new medium just adds two more cards without touching this code.
  const overviewCards = SECTION_KEYS.map(k => {
    const data = SECTIONS[k].data;
    const avg  = (data.reduce((s, x) => s + x.rating, 0) / data.length).toFixed(2);
    return `<div class="stat-ov-card"><div class="stat-ov-num">${data.length}</div><div class="stat-ov-label">${SECTIONS[k].nounSingular} Entries</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${avg}</div><div class="stat-ov-label">Avg ${SECTIONS[k].nounSingular} Rating</div></div>`;
  }).join('');

  // Grouped by chart type (all decade charts, then all genre charts, then all
  // studio charts) rather than by medium, so charts of the same kind stay
  // adjacent for comparison regardless of how many mediums exist.
  const decadeCharts = SECTION_KEYS.map(k =>
    `<div class="stat-chart-card"><div class="stat-chart-title">${SECTIONS[k].emoji} ${SECTIONS[k].noun} by Decade</div>${barChart(byDecade(SECTIONS[k].data), SECTIONS[k].chartColor)}</div>`).join('');
  const genreCharts = SECTION_KEYS.map(k =>
    `<div class="stat-chart-card"><div class="stat-chart-title">${SECTIONS[k].emoji} Top ${SECTIONS[k].nounSingular} Genres</div>${barChart(topEntries(tagCounts(SECTIONS[k].data)), SECTIONS[k].chartColor)}</div>`).join('');
  const studioCharts = SECTION_KEYS.map(k =>
    `<div class="stat-chart-card"><div class="stat-chart-title">🏢 Top ${SECTIONS[k].nounSingular} Studios</div>${barChart(topEntries(countBy(SECTIONS[k].data, x => x.studio)), SECTIONS[k].chartColor)}</div>`).join('');
  const topLists = SECTION_KEYS.map(k =>
    `<div class="stat-chart-card"><div class="stat-chart-title">⭐ Highest Rated ${SECTIONS[k].noun}</div>${topList([...SECTIONS[k].data].sort((a, b) => b.rating - a.rating))}</div>`).join('');

  content.innerHTML = `
    <div class="stats-overview">
      ${overviewCards}
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
      ${yearInReviewHtml()}
      <div class="stat-chart-card"><div class="stat-chart-title">❤️ Your Top Genres</div>${barChart(myGenres, 'pink')}</div>
      ${genreAffinityHtml()}
      <div class="stat-chart-card"><div class="stat-chart-title">📋 Next Up</div><div id="queue-list"></div></div>
      ${recommendationsHtml()}
    </div>

    <div class="stats-section-head">My Lists</div>
    <div id="my-lists-content"></div>

    <div class="stats-section-head">🏅 Milestones</div>
    <div id="milestones-content"></div>

    <div class="stats-section-head">The Catalogue</div>
    <div class="stats-charts">
      ${decadeCharts}${genreCharts}${studioCharts}
    </div>
    <div class="stats-charts">
      ${topLists}
    </div>`;

  requestAnimationFrame(() => {
    content.querySelectorAll('.stat-bar-fill[data-w]').forEach(el => { el.style.width = el.dataset.w; });
  });
  renderQueue();
  renderMyLists();
  setupTasteQuiz();
  // checkMilestones (not renderMilestones) so milestones earned via bulk
  // import/sync/clear — which bypass setUserStatus/setUserRating/etc. and
  // so never call checkMilestones themselves — still surface their one-time
  // unlock toast the next time this page renders, instead of just silently
  // flipping to earned.
  checkMilestones();
}

// ===================== MISC UI =====================
const THEME_KEY = 'otakuplay-theme';

/* The document already carries the saved theme by the time this runs — an
   inline script in <head> applies it before first paint, so a returning
   visitor never sees a flash of the wrong theme. This just wires the button. */
function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const sync = () => {
    const light = document.documentElement.dataset.theme === 'light';
    btn.textContent = light ? '☀️' : '🌙';
    btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f6f6fb' : '#09090f');
  };
  sync();
  btn.addEventListener('click', () => {
    const light = document.documentElement.dataset.theme === 'light';
    if (light) delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = 'light';
    localStorage.setItem(THEME_KEY, light ? 'dark' : 'light');
    sync();
  });
}

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
    if (document.querySelector('.modal-overlay.open')) return;            // any open dialog owns the keyboard
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

    const queueMove = e.target.closest('.queue-move');
    if (queueMove) { moveQueueItem(queueMove.dataset.title, queueMove.dataset.dir); return; }

    // Card titles are real links to the entry page. A plain click opens the modal
    // (faster, keeps your place); ctrl/cmd/shift-click follows the link as usual.
    const openBtn = e.target.closest('.card-open-btn, .stat-top-item, .rec-card, .highlight-item, .queue-open, .daily-pick-inner');
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
    if (e.target.closest('.clear-btn'))  { clearUserData(); return; }
    if (e.target.closest('.sync-open-btn')) { openSyncModal('generate'); }
    if (e.target.closest('#share-top10-btn')) { shareTop10(); }
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

  const trailer = document.querySelector('.entry-trailer');
  trailer?.querySelector('.entry-trailer-facade')?.addEventListener('click', () => {
    const id = trailer.dataset.videoId;
    const iframe = document.createElement('iframe');
    iframe.className = 'entry-trailer-frame';
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`;
    iframe.title = `Trailer for ${item.title}`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    trailer.replaceChildren(iframe);
  });
}

// ===================== FRANCHISE HUB PROGRESS =====================
function setupFranchiseProgress() {
  const data  = document.getElementById('franchise-titles');
  const mount = document.getElementById('franchise-progress');
  if (!data || !mount) return;

  let titles = [];
  try { titles = JSON.parse(data.textContent); } catch { return; }
  if (!titles.length) return;

  const done = titles.filter(t => userStatus[t] === 'watched').length;
  if (done === 0) { mount.hidden = true; return; }

  const verb = SECTIONS[sectionOf(titles[0])].statusLabels.watched.toLowerCase();
  const pct  = Math.round((done / titles.length) * 100);
  mount.hidden = false;
  mount.innerHTML = `
    <div class="franchise-progress-label">You've ${verb} ${done} of ${titles.length}${done === titles.length ? ' — the whole series!' : ` (${pct}%)`}</div>
    <div class="franchise-progress-track"><div class="franchise-progress-fill" style="width:${pct}%"></div></div>`;
}

// ===================== HEAD-TO-HEAD COMPARE =====================
const SLUG_INDEX = new Map();
SECTION_KEYS.forEach(k => SECTIONS[k].data.forEach(item => SLUG_INDEX.set(slugOf(item), item)));

function compareOptionsHtml() {
  return SECTION_KEYS.map(k => {
    const label = SECTIONS[k].noun;
    const opts = [...SECTIONS[k].data]
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(item => `<option value="${escapeHtml(item.title)}">${escapeHtml(item.title)} (${item.year})</option>`)
      .join('');
    return `<optgroup label="${label}">${opts}</optgroup>`;
  }).join('');
}

function compareHeadHtml(item) {
  const cover = item.img
    ? `<img class="compare-cover-img" src="${escapeHtml(item.img)}" alt="" decoding="async"
         referrerpolicy="no-referrer" onload="this.classList.add('loaded')" onerror="this.remove()">` : '';
  return `
    <div class="compare-title-card">
      <div class="compare-cover" style="background:${item.bg}">
        <span class="compare-cover-emoji" aria-hidden="true">${item.emoji}</span>
        ${cover}
      </div>
      <h2 class="compare-title-name">${escapeHtml(item.title)}</h2>
      <a class="compare-open-link" href="${entryUrl(item)}">View full page →</a>
    </div>`;
}

function compareRow(label, cellA, cellB, winA = false, winB = false) {
  return `
    <div class="compare-row">
      <div class="compare-cell${winA ? ' compare-cell-win' : ''}">${cellA}</div>
      <div class="compare-row-label">${label}</div>
      <div class="compare-cell${winB ? ' compare-cell-win' : ''}">${cellB}</div>
    </div>`;
}

function comparePersonalStats(item) {
  const sect   = sectionOf(item.title);
  const status = userStatus[item.title];
  const rating = userRatings[item.title];
  return {
    statusText: status ? SECTIONS[sect].statusLabels[status] : 'Not tracked',
    ratingText: rating ? `${rating}/10` : 'Not rated',
  };
}

function renderCompare(titleA, titleB) {
  const result = document.getElementById('compare-result');
  if (!result) return;
  if (!titleA || !titleB) { result.innerHTML = ''; return; }
  if (titleA === titleB) {
    result.innerHTML = '<p class="stat-empty">Pick two different titles to compare.</p>';
    return;
  }
  const la = lookup(titleA), lb = lookup(titleB);
  if (!la || !lb) { result.innerHTML = '<p class="stat-empty">Title not found.</p>'; return; }
  const a = la.item, b = lb.item;

  const tagsA = a.tags.map(t => `<span class="tag tag-${t}">${t}</span>`).join('');
  const tagsB = b.tags.map(t => `<span class="tag tag-${t}">${t}</span>`).join('');
  const platA = (STREAM_MAP[a.title] || []).map(p => `<span class="platform-badge platform-${p.toLowerCase()}">${p}</span>`).join('') || '—';
  const platB = (STREAM_MAP[b.title] || []).map(p => `<span class="platform-badge platform-${p.toLowerCase()}">${p}</span>`).join('') || '—';
  const awardsA = a.awards?.length ? a.awards.map(x => `<span class="award-badge award-${x.cls}">${escapeHtml(x.text)}</span>`).join('') : '';
  const awardsB = b.awards?.length ? b.awards.map(x => `<span class="award-badge award-${x.cls}">${escapeHtml(x.text)}</span>`).join('') : '';
  const pa = comparePersonalStats(a), pb = comparePersonalStats(b);

  result.innerHTML = `
    <div class="compare-grid">
      <div class="compare-head">
        ${compareHeadHtml(a)}
        <div class="compare-vs-big" aria-hidden="true">VS</div>
        ${compareHeadHtml(b)}
      </div>
      <div class="compare-rows">
        ${compareRow('Rating',
          `<span class="rating-num">${a.rating}</span> <span class="stars" aria-hidden="true">${starsHtml(a.rating)}</span>`,
          `<span class="rating-num">${b.rating}</span> <span class="stars" aria-hidden="true">${starsHtml(b.rating)}</span>`,
          a.rating > b.rating, b.rating > a.rating)}
        ${compareRow('Tier',
          `<span class="card-rank rank-${a.rank.toLowerCase()} compare-tier">Tier ${a.rank}</span>`,
          `<span class="card-rank rank-${b.rank.toLowerCase()} compare-tier">Tier ${b.rank}</span>`)}
        ${compareRow('Year', a.year, b.year)}
        ${compareRow('Studio', escapeHtml(a.studio), escapeHtml(b.studio))}
        ${compareRow('Genres', `<div class="compare-tags">${tagsA}</div>`, `<div class="compare-tags">${tagsB}</div>`)}
        ${compareRow('Platforms', `<div class="compare-tags">${platA}</div>`, `<div class="compare-tags">${platB}</div>`)}
        ${(awardsA || awardsB) ? compareRow('Awards', `<div class="compare-tags">${awardsA || '—'}</div>`, `<div class="compare-tags">${awardsB || '—'}</div>`) : ''}
        ${compareRow('My Rating', pa.ratingText, pb.ratingText)}
        ${compareRow('My Status', pa.statusText, pb.statusText)}
      </div>
    </div>`;
}

function setupComparePage() {
  const selA = document.getElementById('compare-pick-a');
  const selB = document.getElementById('compare-pick-b');
  if (!selA || !selB) return;

  const params = new URLSearchParams(location.hash.slice(1));
  const initA = SLUG_INDEX.get(params.get('a'))?.title || '';
  const initB = SLUG_INDEX.get(params.get('b'))?.title || '';

  const optionsHtml = compareOptionsHtml();
  selA.innerHTML = `<option value="">Pick a title…</option>${optionsHtml}`;
  selB.innerHTML = `<option value="">Pick a title…</option>${optionsHtml}`;
  selA.value = initA;
  selB.value = initB;

  function sync() {
    const ta = selA.value, tb = selB.value;
    const parts = [];
    if (ta) parts.push(`a=${slugOf(lookup(ta).item)}`);
    if (tb) parts.push(`b=${slugOf(lookup(tb).item)}`);
    history.replaceState(null, '', parts.length ? `#${parts.join('&')}` : location.pathname + location.search);
    renderCompare(ta, tb);
  }
  selA.addEventListener('change', sync);
  selB.addEventListener('change', sync);
  if (initA || initB) renderCompare(initA, initB);
}

// ===================== FIRST-VISIT ONBOARDING TOUR =====================
/* A sequential spotlight tour — four real controls, one at a time, each with
   its own explanation, rather than one banner trying to cover everything at
   once. Marked "seen" the moment it starts, not only on completion/skip, so
   leaving it mid-tour and browsing away doesn't bring it back. No dimming
   overlay with a cutout: that's a lot of positioning math for a feature that
   only ever runs once per visitor, so the target just gets an outline ring
   instead — simpler, and it doesn't block interaction with the rest of the
   page if someone scrolls or clicks past the tour. */
const ONBOARD_KEY = 'otakuplay-onboarded';
const TOUR_STEPS = [
  { selector: () => '.search-trigger', title: 'Search everything',
    text: 'Find any anime or PC game from any page — press Ctrl+K anytime.' },
  { selector: sect => `#${sect}-filter-toggle`, title: 'Filter the catalogue',
    text: 'Genre, year range, studio, minimum rating, watch status — narrow it down however you like.' },
  { selector: () => '.card', title: 'Click any card',
    text: 'Rate it, mark it watched, add a private note, or open its full page.' },
  { selector: sect => `#${sect}-more`, title: 'Sync, export, import',
    text: "Move your library to another device, back it up to a file, or import from MyAnimeList — nothing leaves your browser unless you generate a link yourself." },
];

let tourStep = 0;
let tourSect = null;
let tourResizeHandler = null;

function tourTarget(step, sect) {
  return document.querySelector(step.selector(sect));
}

function positionTourBox(target, box) {
  const rect = target.getBoundingClientRect();
  const margin = 12;
  let top = rect.bottom + margin;
  if (top + box.offsetHeight > window.innerHeight - 10) top = Math.max(10, rect.top - box.offsetHeight - margin);
  const left = Math.min(Math.max(10, rect.left), window.innerWidth - box.offsetWidth - 10);
  box.style.top = `${top + window.scrollY}px`;
  box.style.left = `${left + window.scrollX}px`;
}

function renderTourStep() {
  const step = TOUR_STEPS[tourStep];
  const target = tourTarget(step, tourSect);
  document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
  if (!target) { endTour(); return; }
  target.classList.add('tour-highlight');
  // The header's own controls are position:fixed — always on screen regardless
  // of scroll, so scrollIntoView() on one of them tries to scroll the document
  // to wherever that element sits in normal flow, not where it's actually
  // rendered, producing a huge, wrong scroll offset. Only scroll when the
  // target genuinely isn't visible yet (e.g. a card further down the grid).
  const r = target.getBoundingClientRect();
  if (r.top < 0 || r.bottom > window.innerHeight) {
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  }

  let box = document.getElementById('tour-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'tour-box';
    box.className = 'tour-box';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Guided tour');
    box.tabIndex = -1;
    document.body.appendChild(box);
  }
  const isLast = tourStep === TOUR_STEPS.length - 1;
  box.innerHTML = `
    <div class="tour-step-count">Step ${tourStep + 1} of ${TOUR_STEPS.length}</div>
    <div class="tour-title">${escapeHtml(step.title)}</div>
    <p class="tour-text">${escapeHtml(step.text)}</p>
    <div class="tour-actions">
      <button class="tour-skip" id="tour-skip">Skip tour</button>
      <div class="tour-nav">
        ${tourStep > 0 ? '<button class="tour-back" id="tour-back">Back</button>' : ''}
        <button class="tour-next" id="tour-next">${isLast ? 'Done' : 'Next'}</button>
      </div>
    </div>`;

  document.getElementById('tour-skip').addEventListener('click', endTour);
  document.getElementById('tour-next').addEventListener('click', () => {
    if (isLast) endTour(); else { tourStep++; renderTourStep(); }
  });
  document.getElementById('tour-back')?.addEventListener('click', () => { tourStep--; renderTourStep(); });

  // No requestAnimationFrame needed: reading offsetHeight below already
  // forces a synchronous layout of the innerHTML just set above, so the
  // measurement is correct immediately — waiting a frame just left the box
  // rendered at its unpositioned default (bottom of <body>) for one frame.
  positionTourBox(target, box);
  box.focus();
}

function endTour() {
  document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
  document.getElementById('tour-box')?.remove();
  if (tourResizeHandler) { window.removeEventListener('resize', tourResizeHandler); tourResizeHandler = null; }
  document.removeEventListener('keydown', tourKeydownHandler, true);
}

/* Registered on the capture phase specifically so this runs BEFORE the
   modal's own bubble-phase Escape handler — checking ".modal-overlay.open"
   after the fact doesn't work, because by the time a bubble-phase listener
   runs, the modal's own handler (attached earlier, in setupModal) has
   already closed it and removed that class. Capture-phase runs first, so
   the check sees the true pre-keypress state: a modal owns Escape/Tab
   while it's open, the tour only gets them once nothing else is open. */
function tourKeydownHandler(e) {
  if (document.querySelector('.modal-overlay.open')) return;
  if (e.key === 'Escape') { endTour(); return; }
  if (e.key !== 'Tab') return;
  const box = document.getElementById('tour-box');
  const items = box ? [...box.querySelectorAll('button')] : [];
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function setupOnboarding() {
  const sect = activeSection();
  if (!sect || !document.getElementById(ids(sect).grid)) return;
  if (localStorage.getItem(ONBOARD_KEY)) return;
  localStorage.setItem(ONBOARD_KEY, '1');

  tourStep = 0;
  tourSect = sect;
  renderTourStep();
  tourResizeHandler = () => {
    const target = tourTarget(TOUR_STEPS[tourStep], sect);
    const box = document.getElementById('tour-box');
    if (target && box) positionTourBox(target, box);
  };
  window.addEventListener('resize', tourResizeHandler);
  document.addEventListener('keydown', tourKeydownHandler, true);
}

// ===================== DAILY PICK =====================
/* Deterministic from the date, not Math.random() — every visitor on a given
   UTC day sees the same title, which a per-visit random pick can't offer.
   UTC (not local time) is deliberate: a single canonical day boundary means
   visitors in different timezones agree on what "today" picked, rather than
   each seeing a different title depending on when their local midnight falls. */
function dailyPick() {
  const all = SECTION_KEYS.flatMap(k => SECTIONS[k].data);
  const dateKey = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  return all[hash % all.length];
}

function renderDailyPick() {
  const section = document.getElementById('daily-pick-section');
  const mount = document.getElementById('daily-pick-card');
  if (!section || !mount) return;

  const item = dailyPick();
  const sect = sectionOf(item.title);
  const tagsHtml = item.tags.map(t => `<span class="tag tag-${t}">${t}</span>`).join('');

  mount.innerHTML = `
    <button class="daily-pick-inner" data-title="${escapeHtml(item.title)}">
      <span class="daily-pick-art" style="background:${item.bg}">
        ${item.img ? `<img src="${escapeHtml(item.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">` : `<span aria-hidden="true">${item.emoji}</span>`}
      </span>
      <span class="daily-pick-info">
        <span class="daily-pick-meta">
          <span class="card-rank rank-${item.rank.toLowerCase()}">Tier ${item.rank}</span>
          <span class="daily-pick-sect">${SECTIONS[sect].emoji} ${SECTIONS[sect].nounSingular}</span>
        </span>
        <span class="daily-pick-title">${escapeHtml(item.title)}</span>
        <span class="daily-pick-sub">${item.year} · ${escapeHtml(item.studio)} · ${item.rating}/10</span>
        <span class="daily-pick-desc">${escapeHtml(item.desc)}</span>
        <span class="daily-pick-tags">${tagsHtml}</span>
      </span>
    </button>`;
  section.hidden = false;
}

// ===================== LANDING PAGE =====================
/* Data.js only stores a release year, never a month or day — so this can't
   claim "on this day" without fabricating a date. What it can honestly say
   is which titles hit a round-number anniversary this year, using whatever
   year it is on the visitor's own clock rather than whenever the page was
   last built. */
function renderAnniversaries() {
  const wrap  = document.getElementById('anniversaries');
  const mount = document.getElementById('anniversary-list');
  if (!wrap || !mount) return;

  const thisYear = new Date().getFullYear();
  const hits = SECTION_KEYS.flatMap(k => SECTIONS[k].data)
    .map(item => ({ item, years: thisYear - item.year }))
    .filter(x => x.years > 0 && x.years % 5 === 0)
    .sort((a, b) => a.years - b.years || b.item.rating - a.item.rating)
    .slice(0, 6);

  if (!hits.length) { wrap.hidden = true; return; }
  wrap.hidden = false;
  mount.innerHTML = hits.map(({ item, years }) => `
    <button class="highlight-item" data-title="${escapeHtml(item.title)}">
      <span class="highlight-rank">${years}y</span>
      <span class="highlight-art" style="background:${item.bg}">
        ${item.img
          ? `<img src="${escapeHtml(item.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">`
          : `<span aria-hidden="true">${item.emoji}</span>`}
      </span>
      <span class="highlight-info">
        <span class="highlight-title">${escapeHtml(item.title)}</span>
        <span class="highlight-sub">${item.year} · ${years} years ago</span>
      </span>
      <span class="highlight-rating">${item.rating}</span>
    </button>`).join('');
}

function renderHighlights() {
  const build = sectKey => {
    const mount = document.getElementById(`highlight-${sectKey}`);
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
  SECTION_KEYS.forEach(build);

  const eras = document.getElementById('era-grid');
  if (!eras) return;
  const all = SECTION_KEYS.flatMap(k => SECTIONS[k].data);
  const decades = [...new Set(all.map(x => Math.floor(x.year / 10) * 10))].sort((a, b) => a - b);
  const root = window.OTAKU_ROOT || '';
  eras.innerHTML = decades.map(d => {
    const count = all.filter(x => Math.floor(x.year / 10) * 10 === d).length;
    const label = SECTION_KEYS.map(k => SECTIONS[k].eraLabels[d]).find(Boolean) || '';
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
  SECTION_KEYS.forEach(k => setText(`stat-${k}`, SECTIONS[k].data.length));
  setText('stat-years', `${new Date().getFullYear() - Math.min(...SECTION_KEYS.flatMap(k => SECTIONS[k].data).map(x => x.year))}+`);

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
    setupViewToggle(sect);
    setupOnboarding();
  }

  if (PAGE === 'insights') renderStats();
  if (PAGE === 'home') { renderHighlights(); renderAnniversaries(); renderDailyPick(); }
  if (PAGE === 'compare') setupComparePage();
  setupEntryPage();
  setupFranchiseProgress();

  setupModal();
  setupSyncModal();
  setupGlobalSearch();
  setupThemeToggle();
  setupLightbox();
  setupScrollTop();
  setupKeyboardShortcuts();
  setupDelegation();

  document.getElementById('import-file')?.addEventListener('change', e => importData(e.target));

  readHash();
  window.addEventListener('hashchange', () => { if (!suppressHashRead) readHash(); });
  checkForSyncLink();

  registerServiceWorker();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

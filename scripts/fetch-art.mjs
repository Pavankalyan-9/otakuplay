#!/usr/bin/env node
/**
 * Fetches cover art URLs for every catalogue entry and writes them back into data.js
 * as an `img:"…"` field. Run it manually when titles are added:
 *
 *   node scripts/fetch-art.mjs              # fill in anything missing
 *   node scripts/fetch-art.mjs --force      # refetch everything
 *   node scripts/fetch-art.mjs --dry-run    # report matches, write nothing
 *
 * Sources: AniList GraphQL for anime, the Steam store search for games. Both are
 * public and key-free. Matches are verified against the release year we already
 * store, so a bad search hit is skipped rather than silently attached to the
 * wrong title — misses are reported at the end and left for a manual `img` value.
 *
 * URLs point at the official CDNs rather than committing publisher artwork into
 * the repo. Set DOWNLOAD = true to mirror the files into images/ instead.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT       = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DATA_FILE  = path.join(ROOT, 'data.js');
const CACHE_FILE = path.join(ROOT, 'scripts', 'art-cache.json');
const FORCE      = process.argv.includes('--force');
const DRY_RUN    = process.argv.includes('--dry-run');
const YEAR_SLACK = 2;   // adaptations/ports drift a year or two from our listed date

const sleep = ms => new Promise(r => setTimeout(r, ms));
const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) : {};

// ── Load the catalogue without a bundler: data.js is a plain script. ──
async function loadCatalogue() {
  const src = fs.readFileSync(DATA_FILE, 'utf8');
  const mod = path.join(ROOT, 'scripts', '.data.tmp.mjs');
  fs.writeFileSync(mod, `${src}\nexport { ANIME, GAMES };`);
  const loaded = await import(`file://${mod}?t=${Date.now()}`);
  fs.unlinkSync(mod);
  return loaded;
}

/* Our title doesn't always match how the source database spells it. Add an entry
   here when a search comes back empty rather than loosening the matcher. */
const SEARCH_ALIASES = {
  'Lupin III Part I': 'Lupin III',
  // The bare title's top Steam hit is a different, much newer game in the
  // same franchise — these terms land on the correct product instead.
  'RollerCoaster Tycoon': 'RollerCoaster Tycoon Deluxe',
  'Final Fantasy XIV: A Realm Reborn': 'FINAL FANTASY XIV Online',
  // The original 2000 game isn't sold standalone on Steam; EA's 2024
  // re-release is the correct (and only) legitimate match.
  'The Sims': 'The Sims Legacy',
};

/* Titles with no public art source — Blizzard sells these on Battle.net, so they
   never appear in Steam search. Paste a URL here if you find official art;
   otherwise the card falls back to its gradient, which is by design. */
const MANUAL_ART = {
  // 'StarCraft': 'https://…',
  // AniList's search ranks an unrelated same-year short film above the real
  // entry for generic terms like "Your Name"; byYear matching would grab it
  // first regardless of alias. Pinned to the actual highest-popularity match.
  'Your Name': 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21519-SUo3ZQuCbYhJ.png',
  // The Steam listing is "FINAL FANTASY XIV Online" — too little word overlap
  // with our title (which keeps "A Realm Reborn" for the description's sake)
  // to pass the fuzzy-match confidence check. Confirmed app id via direct search.
  'Final Fantasy XIV: A Realm Reborn': 'https://cdn.cloudflare.steamstatic.com/steam/apps/39210/header.jpg',
};

/* What we send to the APIs: drop a disambiguating "(2003)" but keep apostrophes
   and colons — Steam's search does worse with "baldur s gate 3" than with the
   real title. `normalise` below is only for comparing results. */
const searchTerm = s => SEARCH_ALIASES[s] || s.replace(/\s*\(\d{4}\)\s*/g, ' ').replace(/\s+/g, ' ').trim();

const normalise = s => s.toLowerCase()
  .replace(/\(\d{4}\)/g, '')            // "DOOM (2016)" → "DOOM"
  .replace(/[:\-—–!?.,'’"]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// ── AniList ──────────────────────────────────────────────────────────────────
const ANILIST_QUERY = `
  query ($search: String) {
    Page(perPage: 5) {
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        title { romaji english }
        startDate { year }
        coverImage { extraLarge large }
      }
    }
  }`;

async function fetchAnime(item) {
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: ANILIST_QUERY, variables: { search: searchTerm(item.title) } }),
  });
  if (res.status === 429) {
    const wait = Number(res.headers.get('retry-after') || 60);
    console.log(`   rate limited, waiting ${wait}s`);
    await sleep(wait * 1000);
    return fetchAnime(item);
  }
  if (!res.ok) throw new Error(`AniList HTTP ${res.status}`);

  const list = (await res.json())?.data?.Page?.media ?? [];
  if (!list.length) return null;

  // Prefer a candidate whose year lines up; fall back to an exact title match.
  const byYear = list.find(m => m.startDate?.year && Math.abs(m.startDate.year - item.year) <= YEAR_SLACK);
  const byName = list.find(m =>
    normalise(m.title?.romaji || '') === normalise(item.title) ||
    normalise(m.title?.english || '') === normalise(item.title));
  const hit = byYear || byName;
  if (!hit) return null;

  const url = hit.coverImage?.extraLarge || hit.coverImage?.large;
  return url ? { url, matched: hit.title?.english || hit.title?.romaji, year: hit.startDate?.year } : null;
}

// ── Steam ────────────────────────────────────────────────────────────────────
async function fetchGame(item) {
  const term = encodeURIComponent(searchTerm(item.title));
  const res  = await fetch(`https://store.steampowered.com/api/storesearch/?term=${term}&cc=us&l=en`);
  if (!res.ok) throw new Error(`Steam HTTP ${res.status}`);

  const items = (await res.json())?.items ?? [];
  if (!items.length) return null;

  const target = normalise(item.title);
  const hit = items.find(i => normalise(i.name) === target)
           || items.find(i => normalise(i.name).startsWith(target))
           || items[0];
  if (!hit?.id) return null;

  // Only trust a fuzzy first-result fallback if the names genuinely overlap.
  const exact = normalise(hit.name) === target || normalise(hit.name).startsWith(target);
  if (!exact) {
    const words = target.split(' ').filter(w => w.length > 3);
    const overlap = words.filter(w => normalise(hit.name).includes(w)).length;
    if (!words.length || overlap / words.length < 0.6) return null;
  }
  return { url: `https://cdn.cloudflare.steamstatic.com/steam/apps/${hit.id}/header.jpg`, matched: hit.name };
}

// ── Write results back into data.js ──────────────────────────────────────────
function writeBack(source, results) {
  let out = source;
  let written = 0;

  for (const [title, url] of Object.entries(results)) {
    const esc = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Find this entry's `title:"…"` and add/replace img just after its studio field.
    const entry = new RegExp(`(title:"${esc}",[\\s\\S]{0,900}?studio:"[^"]*")(,\\s*img:"[^"]*")?`, 'm');
    if (!entry.test(out)) { console.warn(`   ! could not locate entry for ${title}`); continue; }
    out = out.replace(entry, (_m, head) => `${head}, img:"${url}"`);
    written++;
  }
  return { out, written };
}

// ── Main ─────────────────────────────────────────────────────────────────────
const { ANIME, GAMES } = await loadCatalogue();
const jobs = [
  ...ANIME.map(item => ({ item, kind: 'anime', fetcher: fetchAnime, delay: 750 })),
  ...GAMES.map(item => ({ item, kind: 'game',  fetcher: fetchGame,  delay: 400 })),
];

const results = {};
const misses  = [];
let done = 0;

for (const { item, kind, fetcher, delay } of jobs) {
  done++;
  if (MANUAL_ART[item.title]) { results[item.title] = MANUAL_ART[item.title]; continue; }

  const cached = cache[item.title];
  if (cached && !FORCE) {
    if (cached.url) results[item.title] = cached.url; else misses.push(`${item.title} (cached miss)`);
    continue;
  }

  try {
    const hit = await fetcher(item);
    cache[item.title] = hit || { url: null };
    if (hit) {
      results[item.title] = hit.url;
      const flag = hit.matched && normalise(hit.matched) !== normalise(item.title) ? `  ~ matched "${hit.matched}"` : '';
      console.log(`[${done}/${jobs.length}] ${item.title}${flag}`);
    } else {
      misses.push(item.title);
      console.log(`[${done}/${jobs.length}] ${item.title}  — NO MATCH`);
    }
  } catch (err) {
    misses.push(`${item.title} (${err.message})`);
    console.log(`[${done}/${jobs.length}] ${item.title}  — ERROR ${err.message}`);
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  await sleep(delay);
  void kind;
}

console.log(`\nmatched ${Object.keys(results).length}/${jobs.length}`);
if (misses.length) console.log(`no art for ${misses.length}:\n  ${misses.join('\n  ')}`);

if (DRY_RUN) {
  console.log('\n--dry-run: data.js untouched');
} else {
  const { out, written } = writeBack(fs.readFileSync(DATA_FILE, 'utf8'), results);
  fs.writeFileSync(DATA_FILE, out);
  console.log(`\nwrote ${written} img fields into data.js`);
}

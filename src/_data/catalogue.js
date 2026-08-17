/**
 * Makes the catalogue available to the build.
 *
 * data.js is a plain browser script (top-level `const ANIME = [...]`), deliberately
 * so the site runs without a bundler. Rather than duplicate it in a module format —
 * two copies that would drift — we evaluate it once in a sandbox and read the
 * bindings out of the completion value.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const source = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');

const { ANIME, GAMES, STREAM_MAP, JP_TITLES, FRANCHISES } =
  vm.runInNewContext(`${source}\n;({ ANIME, GAMES, STREAM_MAP, JP_TITLES, FRANCHISES })`);

const slugify = title => title
  .toLowerCase()
  .replace(/['’]/g, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

/* Two entries can slug identically ("DOOM" and "DOOM (2016)" both → "doom").
   Disambiguate with the year rather than a counter, so URLs stay meaningful and
   stable if the catalogue is reordered. */
function withSlugs(items, sect) {
  const counts = new Map();
  items.forEach(item => {
    const base = slugify(item.title);
    counts.set(base, (counts.get(base) || 0) + 1);
  });
  return items.map(item => {
    const base = slugify(item.title);
    const slug = counts.get(base) > 1 ? `${base}-${item.year}` : base;
    return { ...item, sect, slug, url: `${sect}/${slug}/` };
  });
}

const anime = withSlugs(ANIME, 'anime');
const games = withSlugs(GAMES, 'games');
const entries = [...anime, ...games];

// Same tag-overlap rule the modal uses, resolved once at build time.
const related = entry => {
  const pool = entry.sect === 'anime' ? anime : games;
  return pool
    .filter(x => x.title !== entry.title)
    .map(x => ({ x, overlap: x.tags.filter(t => entry.tags.includes(t)).length }))
    .sort((a, b) => b.overlap - a.overlap || b.x.rating - a.x.rating)
    .slice(0, 4)
    .map(e => e.x);
};

/* A stable ranking each entry can cite a position in — highest rated first,
   ties broken by year so the order never depends on array insertion order. */
const ranked = { anime: [...anime].sort(byRatingThenYear), games: [...games].sort(byRatingThenYear) };
function byRatingThenYear(a, b) { return b.rating - a.rating || a.year - b.year; }

function neighbours(entry) {
  const order = ranked[entry.sect];
  const i = order.findIndex(x => x.title === entry.title);
  const at = n => (order[n] ? { title: order[n].title, url: order[n].url, rating: order[n].rating, year: order[n].year } : null);
  // `ratingRank` — not `rank` — because entry.rank already means the tier letter (S/A/B/C).
  return { ratingRank: i + 1, ratingTotal: order.length, prev: at(i - 1), next: at(i + 1) };
}

export default {
  anime,
  games,
  entries: entries.map(entry => ({
    ...entry,
    jp: JP_TITLES[entry.title] || null,
    platforms: STREAM_MAP[entry.title] || [],
    franchise: FRANCHISES[entry.title] || null,
    related: related(entry),
    ...neighbours(entry),
  })),
  counts: { anime: anime.length, games: games.length, total: entries.length },
};

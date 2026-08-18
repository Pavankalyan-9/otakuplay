/**
 * Hub pages: the layer between the catalogue and the per-title entry pages.
 *
 * People search "best mecha anime" and "best 90s pc games", not individual
 * titles, so each genre, decade and franchise gets its own ranked page built
 * from data that already exists.
 */
import catalogue from './catalogue.js';
import genres from './genres.js';

const LABELS = Object.fromEntries(
  [...genres.anime, ...genres.games].map(g => [g.id, g.label]));

const SECTION_NOUN = { anime: 'Anime', games: 'PC Games' };

const byRating = (a, b) => b.rating - a.rating || a.year - b.year;

/* A hub with one or two entries is a thin page — worse than no page, since it
   invites a "low value content" judgement and wastes crawl budget. */
const MIN_ENTRIES = 3;

function genreHubs() {
  const hubs = [];
  for (const sect of ['anime', 'games']) {
    for (const { id, label } of genres[sect]) {
      const entries = catalogue[sect].filter(x => x.tags.includes(id)).sort(byRating);
      if (entries.length < MIN_ENTRIES) continue;
      hubs.push({
        kind: 'genre',
        sect,
        slug: id,
        url: `${sect}/genre/${id}/`,
        heading: `Best ${label} ${SECTION_NOUN[sect]}`,
        title: `Best ${label} ${SECTION_NOUN[sect]} of All Time — ${entries.length} Ranked`,
        description: `The ${entries.length} best ${label.toLowerCase()} ${sect === 'anime' ? 'anime' : 'PC games'} ever made, ranked — from ${entries[0].title} down, with ratings, studios and where to ${sect === 'anime' ? 'watch' : 'play'}.`,
        intro: `Every ${label.toLowerCase()} title in the OtakuPlay catalogue, ranked by rating. ${entries.length} of ${catalogue[sect].length} ${sect === 'anime' ? 'anime' : 'games'} qualify.`,
        entries,
      });
    }
  }
  return hubs;
}

function decadeHubs() {
  const hubs = [];
  for (const sect of ['anime', 'games']) {
    const decades = [...new Set(catalogue[sect].map(x => Math.floor(x.year / 10) * 10))].sort();
    for (const decade of decades) {
      const entries = catalogue[sect]
        .filter(x => Math.floor(x.year / 10) * 10 === decade)
        .sort(byRating);
      if (entries.length < MIN_ENTRIES) continue;
      hubs.push({
        kind: 'decade',
        sect,
        slug: `${decade}s`,
        url: `${sect}/decade/${decade}s/`,
        heading: `Best ${SECTION_NOUN[sect]} of the ${decade}s`,
        title: `Best ${SECTION_NOUN[sect]} of the ${decade}s — ${entries.length} Ranked`,
        description: `The ${entries.length} best ${sect === 'anime' ? 'anime' : 'PC games'} released between ${decade} and ${decade + 9}, ranked — led by ${entries[0].title} (${entries[0].year}).`,
        intro: `Everything in the catalogue released between ${decade} and ${decade + 9}, ranked by rating.`,
        entries,
      });
    }
  }
  return hubs;
}

function yearHubs() {
  const hubs = [];
  for (const sect of ['anime', 'games']) {
    const years = [...new Set(catalogue[sect].map(x => x.year))].sort();
    for (const year of years) {
      const entries = catalogue[sect].filter(x => x.year === year).sort(byRating);
      if (entries.length < MIN_ENTRIES) continue;
      hubs.push({
        kind: 'year',
        sect,
        slug: `${year}`,
        url: `${sect}/year/${year}/`,
        heading: `Best ${SECTION_NOUN[sect]} of ${year}`,
        title: `Best ${SECTION_NOUN[sect]} of ${year} — ${entries.length} Ranked`,
        description: `The ${entries.length} best ${sect === 'anime' ? 'anime' : 'PC games'} released in ${year}, ranked — led by ${entries[0].title}.`,
        intro: `Everything in the catalogue released in ${year}, ranked by rating.`,
        entries,
      });
    }
  }
  return hubs;
}

function franchiseHubs() {
  const groups = new Map();
  for (const entry of catalogue.entries) {
    if (!entry.franchise) continue;
    if (!groups.has(entry.franchise)) groups.set(entry.franchise, []);
    groups.get(entry.franchise).push(entry);
  }

  const slugify = s => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return [...groups.entries()]
    .filter(([, entries]) => entries.length >= 2)   // a franchise of one isn't a franchise
    .map(([name, entries]) => {
      const sorted = [...entries].sort((a, b) => a.year - b.year);
      return {
        kind: 'franchise',
        sect: sorted[0].sect,
        slug: slugify(name),
        url: `franchise/${slugify(name)}/`,
        heading: `The ${name} Series`,
        title: `${name} — Every Entry Ranked | OtakuPlay`,
        description: `All ${entries.length} ${name} entries in the OtakuPlay catalogue, in release order — ${sorted.map(e => e.year).join(', ')}.`,
        intro: `Every ${name} title in the catalogue, in release order.`,
        entries: sorted,
        titles: sorted.map(e => e.title),
      };
    });
}

const all = [...genreHubs(), ...decadeHubs(), ...yearHubs(), ...franchiseHubs()];

export default {
  all,
  genre: all.filter(h => h.kind === 'genre'),
  decade: all.filter(h => h.kind === 'decade'),
  year: all.filter(h => h.kind === 'year'),
  franchise: all.filter(h => h.kind === 'franchise'),
  labels: LABELS,
};

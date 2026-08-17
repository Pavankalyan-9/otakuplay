# ⚡ OtakuPlay

A ranked, decade-by-decade catalogue of the best anime (1963–2025) and best PC games (1993–2025) — 219 curated titles with genres, studios, ratings, awards and streaming/store availability.

A static, five-page site with no runtime framework and no backend: Eleventy assembles the pages at build time, and the catalogue itself is plain JavaScript. Everything you track (favorites, status, personal ratings, notes) stays in your browser's `localStorage` and can be exported to JSON — there is no account and nothing is sent to a server.

## Features

- **219 curated entries** — 108 anime, 111 PC games, grouped by decade with era labels, with cover art
- **Filter & sort** — genre (multi-select, any/all), year range, studio, minimum rating, watch/play status, favorites, new releases; sort by year, rating, A→Z or tier
- **Personal library** — mark status (watched / watching / plan / dropped), rate 1–10, keep private notes
- **Recommendations** — "because you liked X" picks scored from your own ratings, statuses and favorites
- **Insights page** — your library stats plus catalogue breakdowns by decade, genre and studio
- **Shareable URLs** — filters, sort, search and individual entries are all encoded in the hash
- **Japanese titles** — toggle native titles with the 🇯🇵 button
- **Keyboard** — `/` focuses search, `R` picks a random visible title, `Esc` closes the modal
- **Installable PWA** — works offline after the first visit
- **Import / export** — take your library with you as JSON

## Pages

| URL | What's there |
| --- | --- |
| `/` | Landing — highest rated picks, decades, what the site is |
| `/anime/` | The full anime catalogue with filters |
| `/games/` | The full PC games catalogue with filters |
| `/insights/` | Your library, recommendations, catalogue stats |
| `/about/` | How rankings are chosen, data sources, where your data lives |
| `/anime/<slug>/` | A page per title — 219 of them, generated from `data.js` |

Each page has its own title, description, canonical URL and social image. Entry pages also carry schema.org structured data (`TVSeries`, `Movie` or `VideoGame`) with the editorial score modelled as a `Review`, and all 224 URLs are listed in `sitemap.xml`.

## Running it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>. `npm run dev` rebuilds and live-reloads as you edit.
`npm run build` writes the site to `_site/`, and `npm run serve` serves that build — useful
for testing the service worker against real static files.

## Tests

Playwright covers the bugs that have actually shipped here — empty Insights tab, hidden tier headers, the New filter disagreeing with its badge, corrupt `localStorage`, off-screen mobile header — plus URL round-tripping, filters, the personal library, keyboard access and offline rendering. They run on desktop and mobile viewports, and CI blocks the deploy if any fail.

```bash
npm test
```

Cross-origin requests (cover art, fonts) are stubbed so runs stay fast and hermetic.

## Project layout

| File | What's in it |
| --- | --- |
| `src/` | Page templates plus the shared layout and partials |
| `src/entry.njk` | Paginated template generating one page per catalogue entry |
| `src/_data/catalogue.js` | Loads `data.js` into the build and assigns entry slugs |
| `.eleventy.js` | Build config — passthrough assets, depth-aware relative paths |
| `data.js` | The catalogue: `ANIME`, `GAMES`, `STREAM_MAP`, `JP_TITLES`, `FRANCHISES` |
| `app.js` | All UI logic — rendering, filtering, routing, stats, persistence |
| `style.css` | Design system, components, responsive + reduced-motion rules |
| `sw.js` | Service worker (stale-while-revalidate, network-first navigations) |
| `manifest.json` | PWA metadata and icons |
| `icons/` | Favicon, PWA icons, Open Graph image |
| `scripts/fetch-art.mjs` | One-off cover-art fetcher (AniList + Steam) |
| `tests/` | Playwright regression suite |

## Adding a title

Append an object to `ANIME` or `GAMES` in `data.js`:

```js
{ rank:"S", emoji:"🗡️", bg:"linear-gradient(135deg,#0a0a14,#1a1a2e)",
  title:"Example Title", year:2025, rating:8.7,
  tags:["action","fantasy"],
  desc:"One paragraph on why it earns its place.",
  info:"12 Episodes", studio:"Studio Name",
  awards:[{ cls:'aoty', text:'🏆 AOTY 2025' }] }
```

Notes:

- `rank` is the tier badge (`S`, `A`, …) and drives the Tier sort.
- `tags` must match an id in `src/_data/genres.js`, otherwise the title can't be filtered to. A test asserts this in both directions.
- The 🆕 New badge and filter are derived from `year >= NEW_SINCE` (`app.js`) — there's no per-entry flag to keep in sync.
- Optional extras: add the title as a key in `STREAM_MAP` (platform badges), `JP_TITLES` (Japanese title) or `FRANCHISES` (franchise badge).

Then pull its cover art:

```bash
npm run art
```

This queries AniList for anime and the Steam store for games, verifies each hit against the release year we already store, and writes an `img` URL back into `data.js`. Results are cached in `scripts/art-cache.json`, so re-runs only fetch what's missing. Titles it can't match (Blizzard games aren't on Steam, for instance) keep their gradient — add a `SEARCH_ALIASES` or `MANUAL_ART` entry in the script if you want to force one.

Art is referenced from the official CDNs rather than committed here, so the repo stays small and no publisher artwork is redistributed. The trade-off is that covers need a network connection — offline, cards fall back to their gradients.

## Deploying

Pushing to `main` publishes to GitHub Pages via `.github/workflows/pages.yml`. Enable it once under **Settings → Pages → Source: GitHub Actions**.

After deploying an update, returning visitors get a "new version available" prompt rather than a stale cached copy.

## License

MIT — see [LICENSE](LICENSE). Ratings and rankings are curated editorial picks; all titles belong to their respective rights holders.

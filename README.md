# ⚡ OtakuPlay

A ranked, decade-by-decade catalogue of the best anime (1963–2025) and best PC games (1992–2025) — 271 curated titles with genres, studios, ratings, awards and streaming/store availability.

A static, five-page site with no runtime framework and no backend: Eleventy assembles the pages at build time, and the catalogue itself is plain JavaScript. Everything you track (favorites, status, personal ratings, notes) stays in your browser's `localStorage` and can be exported to JSON — there is no account and nothing is sent to a server.

## Features

- **271 curated entries** — 132 anime, 139 PC games, grouped by decade with era labels, with cover art
- **Filter & sort** — genre (multi-select, any/all), year range, studio, minimum rating, watch/play status, favorites, new releases; sort by year, rating, A→Z or tier
- **Personal library** — mark status (watched / watching / plan / dropped), rate 1–10, keep private notes
- **Recommendations** — "because you liked X" picks scored from your own ratings, statuses and favorites
- **Sort/filter by your own rating** — "My Rating" sort and a "★ My Ratings" filter, alongside the catalogue's rating
- **Global search** — `Ctrl+K` searches every anime and game from any page, not just the one you're on
- **Insights page** — your library stats plus catalogue breakdowns by decade, genre and studio
- **Genre, decade & franchise hubs** — ~70 generated pages like *Best Mecha Anime* or *The Soulsborne Series*
- **Sync across devices** — a link or QR code moves your library to another device; no account, nothing sent to a server
- **Shareable URLs** — filters, sort, search and individual entries are all encoded in the hash
- **Japanese titles** — toggle native titles with the 🇯🇵 button
- **Keyboard** — `/` focuses search, `R` picks a random visible title, `Ctrl+K` opens global search, `Esc` closes any dialog
- **Installable PWA** — works offline after the first visit
- **Import / export** — take your library with you as JSON
- **Custom 404** — search and quick links back in, instead of GitHub Pages' default

## Pages

| URL | What's there |
| --- | --- |
| `/` | Landing — highest rated picks, decades, what the site is |
| `/anime/` | The full anime catalogue with filters |
| `/games/` | The full PC games catalogue with filters |
| `/insights/` | Your library, recommendations, catalogue stats |
| `/about/` | How rankings are chosen, data sources, where your data lives |
| `/anime/<slug>/` | A page per title — 271 of them, generated from `data.js` |
| `/anime/genre/<id>/`, `/anime/decade/<1990s>/` | Ranked hub pages — ~70 total, skipped when fewer than 3 entries qualify |
| `/franchise/<slug>/` | Every entry in a franchise (`FRANCHISES` in `data.js`), in release order |
| `/404.html` | Custom not-found page with search and quick links |

Each page has its own title, description, canonical URL and social image (entries and hubs use their own cover art, not the generic site card). Entry pages carry schema.org structured data (`TVSeries`, `Movie` or `VideoGame`, editorial score modelled as a `Review`) and hub pages carry `ItemList`. Every page is listed in `sitemap.xml` — a test asserts the count against the catalogue size, because this silently dropped to 6 URLs once when Eleventy's `collections.all` didn't pick up paginated pages.

### Sync code

Insights and the catalogue toolbar's `⋯` menu both offer **Sync to another device** — it builds a link (and a QR code) encoding your favorites, statuses, ratings and notes, gzip-compressed into the URL fragment. Fragments never reach a server, so this works entirely without a backend or an account; opening the link on another device offers to merge or replace. QR generation runs the [`qrcode`](https://www.npmjs.com/package/qrcode) package, bundled at build time (`scripts/build-vendor.mjs`) rather than hand-written, so the actual encoding — finder patterns, Reed–Solomon error correction — comes from a tested library.

### Global search

`Ctrl+K` or the header's 🔍 button opens search across both catalogues from any page, built from `search-index.json` (generated at build time, fetched lazily on first open).

## Running it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>. `npm run dev` rebuilds and live-reloads as you edit.
`npm run build` writes the site to `_site/`, and `npm run serve` serves that build — useful
for testing the service worker against real static files.

## Tests and quality gates

```bash
npm test
```

Two Playwright suites run against the built site, on desktop and mobile viewports.
CI blocks the deploy if either fails.

- **`tests/regressions.spec.js`** — every bug that has actually shipped here (empty
  Insights section, hidden tier headers, the New filter disagreeing with its badge,
  corrupt `localStorage`, an off-screen mobile header, an unreachable filter drawer),
  plus URL round-tripping, filters, the personal library, entry pages and offline rendering.
- **`tests/quality.spec.js`** — axe accessibility checks (WCAG 2.1 A/AA) across all six
  page types including the open filter drawer, and a layout-shift budget. Runs with
  `reducedMotion: 'reduce'` so the card entrance animation can't be sampled mid-fade
  and reported as a false contrast failure.

Cross-origin requests (cover art, fonts) are stubbed so runs stay fast and hermetic. The
sync-code tests decode a rendered QR with an independent library ([`jsqr`](https://www.npmjs.com/package/jsqr))
rather than just checking the canvas has *some* content.

## Analytics

Off by default: with no site code configured, no script is emitted and nothing is
tracked — which is what `/about/` promises visitors.

To enable cookieless page counts, register the domain at
[GoatCounter](https://www.goatcounter.com) and set the code in `src/_data/site.js`:

```js
analytics: { code: 'your-site-code', endpoint: 'https://gc.zgo.at/count.js' }
```

It sets no cookies, collects no personal data and needs no consent banner.

## Project layout

| File | What's in it |
| --- | --- |
| `src/` | Page templates plus the shared layout and partials |
| `src/entry.njk` | Paginated template generating one page per catalogue entry |
| `src/hub.njk` | Paginated template generating genre/decade/franchise hub pages |
| `src/404.njk` | Custom not-found page (built to `/404.html`, where GitHub Pages looks for it) |
| `src/search-index.njk` | Builds `search-index.json` from the catalogue for global search |
| `src/_data/catalogue.js` | Loads `data.js` into the build, assigns slugs, computes rank/prev/next |
| `src/_data/hubs.js` | Builds the genre/decade/franchise hub list from the catalogue |
| `scripts/build-vendor.mjs` | Bundles `qrcode` for the browser (esbuild) — output isn't committed |
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

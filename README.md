# ⚡ OtakuPlay

A ranked, decade-by-decade catalogue of the best anime (1963–2025) and best PC games (1993–2025) — 219 curated titles with genres, studios, ratings, awards and streaming/store availability.

It's a dependency-free static site: no build step, no framework, no backend. Everything you track (favorites, status, personal ratings, notes) stays in your browser's `localStorage` and can be exported to JSON.

## Features

- **219 curated entries** — 108 anime, 111 PC games, grouped by decade with era labels
- **Filter & sort** — genre (multi-select), minimum rating, watch/play status, favorites, new releases; sort by year, rating, A→Z or tier
- **Personal library** — mark status (watched / watching / plan / dropped), rate 1–10, keep private notes
- **Insights tab** — your library stats plus catalogue breakdowns by decade, genre and studio
- **Shareable URLs** — filters, sort, search and individual entries are all encoded in the hash
- **Japanese titles** — toggle native titles with the 🇯🇵 button
- **Keyboard** — `/` focuses search, `R` picks a random visible title, `Esc` closes the modal, full tab navigation
- **Installable PWA** — works offline after the first visit
- **Import / export** — take your library with you as JSON

## Running it locally

Any static file server works. The service worker and JSON import need `http://`, not `file://`:

```bash
python -m http.server 5173
```

Then open <http://localhost:5173>.

## Project layout

| File | What's in it |
| --- | --- |
| `index.html` | Page structure, controls, modal shell |
| `data.js` | The catalogue: `ANIME`, `GAMES`, `STREAM_MAP`, `JP_TITLES`, `FRANCHISES` |
| `app.js` | All UI logic — rendering, filtering, routing, stats, persistence |
| `style.css` | Design system, components, responsive + reduced-motion rules |
| `sw.js` | Service worker (stale-while-revalidate, network-first navigations) |
| `manifest.json` | PWA metadata and icons |
| `icons/` | Favicon, PWA icons, Open Graph image |

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
- `tags` must match a `data-filter` value in the genre bar in `index.html`, otherwise the title can't be filtered to.
- The 🆕 New badge and filter are derived from `year >= NEW_SINCE` (`app.js`) — there's no per-entry flag to keep in sync.
- Optional extras: add the title as a key in `STREAM_MAP` (platform badges), `JP_TITLES` (Japanese title) or `FRANCHISES` (franchise badge).

## Deploying

Pushing to `main` publishes to GitHub Pages via `.github/workflows/pages.yml`. Enable it once under **Settings → Pages → Source: GitHub Actions**.

After deploying an update, returning visitors get a "new version available" prompt rather than a stale cached copy.

## License

MIT — see [LICENSE](LICENSE). Ratings and rankings are curated editorial picks; all titles belong to their respective rights holders.

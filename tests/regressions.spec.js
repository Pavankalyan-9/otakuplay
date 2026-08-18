// @ts-check
import { test, expect } from '@playwright/test';
import jsQR from 'jsqr';

/**
 * Every test here pins a bug that actually shipped, or a feature whose failure
 * mode is silent (wrong-but-plausible output rather than an error). The comment
 * on each block is the bug it protects against — keep it when editing.
 */

// 1x1 transparent PNG — stands in for every cover image.
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');

/* Keep the suite hermetic: cover art and Google Fonts live on third-party CDNs,
   and a page here pulls hundreds of them. Stubbing keeps runs fast, offline-safe
   and free of console noise that would trip the no-errors assertion. */
/** Genre, rating, year, studio, match-mode and status controls live in the
 *  filter drawer now — open it before touching them. */
async function openFilters(page, sect = 'anime') {
  const toggle = page.locator('#' + sect + '-filter-toggle');
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(page.locator('#' + sect + '-filter-panel')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    if (host === '127.0.0.1' || host === 'localhost') return route.continue();
    switch (route.request().resourceType()) {
      case 'image':      return route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL });
      case 'stylesheet': return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
      default:           return route.fulfill({ status: 204, body: '' });
    }
  });

  await page.goto('/anime/');
  await page.waitForFunction(() => document.querySelectorAll('#anime-grid .card').length > 0);
});

test.describe('catalogue rendering', () => {
  test('renders every anime entry', async ({ page }) => {
    expect(await page.locator('#anime-grid .card').count()).toBeGreaterThan(100);
    await expect(page.locator('#anime-count')).toContainText('titles');
  });

  test('each catalogue page ships only its own section', async ({ page }) => {
    // The games page must not carry the anime grid, and vice versa.
    await expect(page.locator('#games-grid')).toHaveCount(0);

    await page.goto('/games/');
    await page.waitForFunction(() => document.querySelectorAll('#games-grid .card').length > 0);
    expect(await page.locator('#games-grid .card').count()).toBeGreaterThan(100);
    await expect(page.locator('#anime-grid')).toHaveCount(0);
  });

  test('landing page shows highlights and counters from the data', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.querySelectorAll('.highlight-item').length > 0);
    expect(await page.locator('#highlight-anime .highlight-item').count()).toBe(5);
    expect(await page.locator('#highlight-games .highlight-item').count()).toBe(5);
    expect(await page.locator('.era-card').count()).toBeGreaterThan(5);
    // Counters are computed from data.js, not hardcoded — they used to drift.
    await expect(page.locator('#stat-anime')).not.toHaveText('0');
  });

  test('page loads with no console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.reload();
    await page.waitForFunction(() => document.querySelectorAll('#anime-grid .card').length > 0);
    expect(errors).toEqual([]);
  });
});

test.describe('bugs that shipped once', () => {
  /* The Insights tab used to render an empty section because the tab handler
     never called renderStats(). It's a page of its own now, but the guarantee is
     the same: arriving at Insights shows stats. */
  test('Insights page renders its stats', async ({ page }) => {
    await page.goto('/insights/');
    await expect(page.locator('#stats-content .stat-ov-card').first()).toBeVisible();
    expect(await page.locator('#stats-content .stat-ov-card').count()).toBeGreaterThan(6);
  });

  test('every page is reachable from the nav', async ({ page }) => {
    for (const [label, path] of [['PC Games', '/games/'], ['Top 100', '/top-100/'], ['Insights', '/insights/'], ['About', '/about/']]) {
      await page.goto('/anime/');
      await page.getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(path.replace(/\//g, '\\/') + '$'));
      await expect(page.locator('[aria-current="page"]')).toHaveText(label);
    }
  });

  // Tier headers were keyed "tier-S" while cards carried a numeric decade, so the
  // "any visible children?" check hid every header.
  test('tier sort shows its group headers, best tier first', async ({ page }) => {
    await page.locator('#anime-sort').selectOption('tier');
    const headers = page.locator('#anime-grid .decade-header:not(.hidden)');
    expect(await headers.count()).toBeGreaterThan(0);
    await expect(headers.first()).toContainText('Tier S');
  });

  // The New filter used year >= 2024 while the badge used a hand-maintained flag,
  // so badged cards vanished when you filtered for New.
  test('New filter shows exactly the cards carrying a New badge', async ({ page }) => {
    await openFilters(page);
    await page.locator('#anime-section .filter-btn[data-filter="new"]').click();
    const visible = page.locator('#anime-grid .card:not(.hidden)');
    const count = await visible.count();
    expect(count).toBeGreaterThan(0);
    expect(await visible.locator('.card-new-badge').count()).toBe(count);
  });

  // Three top-level JSON.parse calls threw on malformed storage and blanked the page.
  test('survives corrupt localStorage', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('otakuplay-favs', '{{{not json');
      localStorage.setItem('otakuplay-status', 'null');
      localStorage.setItem('otakuplay-ratings', '[1,2,3]');
    });
    await page.reload();
    await expect(page.locator('#anime-grid .card').first()).toBeVisible();
  });

  // The JP toggle used to be pushed off-screen by header overflow below 760px.
  // The mobile project is the one that matters here — the toggle used to sit
  // beyond the right edge below 760px.
  test('header controls stay on screen', async ({ page }) => {
    const box = await page.locator('#jp-toggle').boundingBox();
    const width = page.viewportSize()?.width ?? 0;
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
  });

  test('first-visit onboarding tip shows once, dismisses, and never nags again', async ({ page }) => {
    await expect(page.locator('.onboard-banner')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('otakuplay-onboarded'))).toBe('1');

    // Marked "seen" on render, not only on dismissal — navigating away with
    // it still open must not bring it back on the next catalogue page.
    await page.goto('/games/');
    await expect(page.locator('.onboard-banner')).toHaveCount(0);

    await page.goto('/anime/');
    await expect(page.locator('.onboard-banner')).toHaveCount(0);
  });

  test('theme toggle switches to light and persists across reload', async ({ page }) => {
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(246, 246, 251)');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Toggling back removes the attribute entirely rather than setting "dark" —
    // the inline no-flash script only special-cases the "light" value.
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');
  });
});

test.describe('URL state', () => {
  test('round-trips filters, sort, rating, status and year range', async ({ page }) => {
    await page.goto('/anime/#filter=mecha&sort=rating&minRating=8&status=all&from=1979&to=2000');
    await page.waitForFunction(() => document.querySelectorAll('#anime-grid .card').length > 0);

    await openFilters(page);
    await expect(page.locator('#anime-section .filter-btn[data-filter="mecha"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#anime-sort')).toHaveValue('rating');
    await expect(page.locator('#anime-rating-val')).toHaveText('8+');
    await expect(page.locator('#anime-section .year-from')).toHaveValue('1979');

    const years = await page.locator('#anime-grid .card:not(.hidden)').evaluateAll(
      cards => cards.map(c => Number(c.getAttribute('data-year'))));
    expect(years.length).toBeGreaterThan(0);
    expect(Math.min(...years)).toBeGreaterThanOrEqual(1979);
    expect(Math.max(...years)).toBeLessThanOrEqual(2000);
  });

  // A hand-edited or stale link must never leave the grid empty.
  test('nonsensical year range falls back to the full span', async ({ page }) => {
    await page.goto('/anime/#from=9999&to=1');
    await page.waitForFunction(() => document.querySelectorAll('#anime-grid .card').length > 0);
    const visible = await page.locator('#anime-grid .card:not(.hidden)').count();
    const total   = await page.locator('#anime-grid .card').count();
    expect(visible).toBe(total);
  });

  test('entry deep link opens that entry', async ({ page }) => {
    await page.goto('/games/#entry=Elden%20Ring');
    await expect(page.locator('#modal-title')).toHaveText('Elden Ring');
    await expect(page.locator('#detail-modal')).toHaveClass(/open/);
  });
});

test.describe('filters', () => {
  test('genre match mode switches between any and all', async ({ page }) => {
    await openFilters(page);
    await page.locator('#anime-section .filter-btn[data-filter="action"]').click();
    await page.locator('#anime-section .filter-btn[data-filter="drama"]').click();
    const anyCount = await page.locator('#anime-grid .card:not(.hidden)').count();

    await page.locator('#anime-section .genre-mode-btn[data-mode="all"]').click();
    const allCards = page.locator('#anime-grid .card:not(.hidden)');
    const allCount = await allCards.count();

    expect(allCount).toBeLessThan(anyCount);
    const tags = await allCards.evaluateAll(cards => cards.map(c => c.getAttribute('data-tags')));
    for (const t of tags) expect(t).toMatch(/action/), expect(t).toMatch(/drama/);
  });

  test('studio filter narrows to one studio', async ({ page }) => {
    await openFilters(page);
    await page.locator('#anime-section .studio-select').selectOption('Studio Ghibli');
    const cards = page.locator('#anime-grid .card:not(.hidden)');
    expect(await cards.count()).toBeGreaterThan(0);
    const studios = await cards.evaluateAll(c => c.map(x => x.getAttribute('data-studio')));
    expect(new Set(studios)).toEqual(new Set(['Studio Ghibli']));
  });

  test('search with no hits offers a working reset', async ({ page }) => {
    await page.locator('#anime-search').fill('zzzzzznotathing');
    await expect(page.locator('#anime-grid .empty-state')).toBeVisible();
    await page.locator('#anime-grid .empty-reset').click();
    await expect(page.locator('#anime-grid .empty-state')).toHaveCount(0);
    await expect(page.locator('#anime-search')).toHaveValue('');
  });
});

test.describe('toolbar and filter drawer', () => {
  // The controls used to be a 293px, 7-row sticky panel that the cards scrolled
  // under. The bar must stay compact and the drawer must start closed.
  test('controls stay compact and the drawer starts closed', async ({ page }) => {
    await expect(page.locator('#anime-filter-panel')).toBeHidden();
    await expect(page.locator('#anime-chips')).toBeHidden();

    // Was 293px of stacked rows. Phones wrap the toolbar onto a second line.
    const height = await page.locator('#anime-section .controls-row').evaluate(el => el.getBoundingClientRect().height);
    const budget = (page.viewportSize()?.width ?? 1280) < 700 ? 150 : 110;
    expect(height).toBeLessThan(budget);

    await openFilters(page);
    await expect(page.locator('#anime-filters .filter-btn').first()).toBeVisible();
    await expect(page.locator('#anime-filter-toggle')).toHaveAttribute('aria-expanded', 'true');
  });

  test('active filters show as chips that clear individually', async ({ page }) => {
    await openFilters(page);
    await page.locator('#anime-section .filter-btn[data-filter="mecha"]').click();
    await page.locator('#anime-section .studio-select').selectOption('Sunrise');

    const chips = page.locator('#anime-chips .chip:not(.chip-clear)');
    await expect(chips).toHaveCount(2);
    await expect(page.locator('#anime-filter-count')).toHaveText('2');

    const narrowed = await page.locator('#anime-grid .card:not(.hidden)').count();
    await page.locator('#anime-chips .chip[data-kind="studio"]').click();

    await expect(chips).toHaveCount(1);
    await expect(page.locator('#anime-section .studio-select')).toHaveValue('all');
    expect(await page.locator('#anime-grid .card:not(.hidden)').count()).toBeGreaterThan(narrowed);
  });

  test('overflow menu holds the data actions', async ({ page }) => {
    await expect(page.locator('#anime-more-menu')).toBeHidden();
    await page.locator('#anime-more').click();
    await expect(page.locator('#anime-more-menu')).toBeVisible();
    await expect(page.locator('#anime-more-menu .export-btn')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#anime-more-menu')).toBeHidden();
  });
});

test.describe('global search', () => {
  test('finds a game while on the anime page, and Enter opens it', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.locator('#search-modal')).toHaveClass(/open/);
    await expect(page.locator('#global-search-input')).toBeFocused();

    // A title match ("Elden Ring") outranks a description-only match (Dragon
    // Age: Origins mentions "Ferelden") — description search is real but weak.
    await page.locator('#global-search-input').fill('elden');
    await expect(page.locator('.search-result-title').first()).toHaveText('Elden Ring');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/games\/elden-ring\/$/);
  });

  test('an unmatched query shows an empty state, not a stale result', async ({ page }) => {
    await page.locator('.open-global-search').first().click();
    const input = page.locator('#global-search-input');
    await input.fill('elden ring');
    await expect(page.locator('.search-result')).toHaveCount(1);
    await input.fill('zzzznotarealtitle');
    await expect(page.locator('.search-box-empty')).toBeVisible();
    await expect(page.locator('.search-result')).toHaveCount(0);
  });

  test('Escape closes it and returns focus to the trigger', async ({ page }) => {
    const trigger = page.locator('.open-global-search').first();
    await trigger.click();
    await expect(page.locator('#search-modal')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#search-modal')).not.toHaveClass(/open/);
    await expect(trigger).toBeFocused();
  });
});

test.describe('modal interaction', () => {
  /* These use real mouse clicks on purpose. An `inert` modal shipped once: it
     opened, but every click fell through to the page behind it. Escape and
     scripted .click() both bypass hit-testing, so the old tests passed while the
     modal was completely dead to a user. */
  test('the close button actually closes it', async ({ page }) => {
    await page.locator('#anime-grid .card').first().click();
    await expect(page.locator('#detail-modal')).toHaveClass(/open/);

    // Would fail if anything intercepted pointer events over the button.
    await page.locator('#modal-close').click();
    await expect(page.locator('#detail-modal')).not.toHaveClass(/open/);
  });

  test('the modal receives clicks rather than the page behind it', async ({ page }) => {
    await page.locator('#anime-grid .card').first().click();
    const modal = page.locator('#detail-modal');
    await expect(modal).toHaveClass(/open/);
    await expect(modal).not.toHaveAttribute('inert', /.*/);

    // Whatever sits under the close button must be inside the dialog.
    const owner = await page.evaluate(() => {
      const r = document.getElementById('modal-close').getBoundingClientRect();
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return document.getElementById('detail-modal').contains(el);
    });
    expect(owner).toBe(true);
  });

  test('buttons inside the modal work', async ({ page }) => {
    await page.locator('#anime-grid .card').first().click();

    const fav = page.locator('.modal-fav-btn');
    await expect(fav).toContainText('Add to Favorites');
    await fav.click();
    await expect(fav).toContainText('Favorited');

    await page.locator('.modal-status-opt[data-status="watching"]').click();
    await expect(page.locator('.modal-status-opt[data-status="watching"]')).toHaveAttribute('aria-pressed', 'true');

    await expect(page.locator('.modal-trailer-btn')).toHaveAttribute('href', /youtube\.com/);
    await expect(page.locator('.modal-page-btn')).toHaveAttribute('href', /\/anime\/[a-z0-9-]+\/$/);
  });

  test('a closed modal is inert so it never swallows clicks', async ({ page }) => {
    await expect(page.locator('#detail-modal')).toHaveAttribute('inert', /.*/);
    // The card underneath must still be clickable.
    await page.locator('#anime-grid .card').first().click();
    await expect(page.locator('#detail-modal')).toHaveClass(/open/);
  });
});

test.describe('entry pages', () => {
  test('an entry has its own page with correct metadata', async ({ page }) => {
    await page.goto('/anime/cowboy-bebop/');
    await expect(page.locator('h1')).toHaveText('Cowboy Bebop');
    await expect(page).toHaveTitle(/Cowboy Bebop \(1998\)/);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href', /\/anime\/cowboy-bebop\/$/);
    await expect(page.locator('.entry-related-card').first()).toBeVisible();
  });

  test('cover art opens a lightbox, traps focus, and Escape returns focus to the art', async ({ page }) => {
    await page.goto('/anime/cowboy-bebop/');
    const art = page.locator('.entry-art.zoomable');
    await art.click();

    const lightbox = page.locator('#lightbox-modal');
    await expect(lightbox).toHaveClass(/open/);
    await expect(page.locator('#lightbox-img')).toHaveAttribute('src', /^https:\/\//);
    await expect(page.locator('#lightbox-close')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(lightbox).not.toHaveClass(/open/);
    await expect(art).toBeFocused();

    // Keyboard activation (not just mouse) opens it too.
    await art.focus();
    await page.keyboard.press('Enter');
    await expect(lightbox).toHaveClass(/open/);
  });

  // Malformed structured data is worse than none — it gets the page penalised.
  test('structured data is valid and describes the entry', async ({ page }) => {
    await page.goto('/games/elden-ring/');
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(raw ?? '');
    expect(data['@type']).toBe('VideoGame');
    expect(data.name).toBe('Elden Ring');
    expect(data.review.reviewRating.ratingValue).toBeGreaterThan(0);
    expect(data.url).toContain('/games/elden-ring/');
  });

  test('catalogue cards link to entry pages but still open the modal', async ({ page }) => {
    const link = page.locator('#anime-grid .card-open-btn').first();
    await expect(link).toHaveAttribute('href', /\/anime\/[a-z0-9-]+\/$/);

    // A plain click should open the modal, not navigate away.
    await link.click();
    await expect(page.locator('#detail-modal')).toHaveClass(/open/);
    await expect(page).toHaveURL(/\/anime\/(#|$)/);
  });

  test('tracking on an entry page reaches the catalogue', async ({ page }) => {
    await page.goto('/anime/akira/');
    await page.locator('#entry-status .modal-status-opt[data-status="watched"]').click();
    await page.locator('#entry-stars .modal-pr-star[data-r="9"]').click();

    await page.reload();
    await expect(page.locator('#entry-status .modal-status-opt.active')).toHaveAttribute('data-status', 'watched');
    await expect(page.locator('#modal-pr-display')).toHaveText('My rating: 9/10');

    await page.goto('/anime/');
    await expect(page.locator('.card[data-title="Akira"] .card-badge-row')).toContainText('Watched');
  });

  /* The sitemap once silently dropped to 6 URLs — collections.all doesn't
     reliably include paginated pages — while the site itself built fine and
     every other test stayed green. Compare against the entry count the build
     actually produced (search-index.json), not a hardcoded number, so this
     scales with the catalogue but still catches that class of regression. */
  test('the sitemap lists every entry, hub and top-level page', async ({ request }) => {
    const [xml, index] = await Promise.all([
      (await request.get('/sitemap.xml')).text(),
      (await request.get('/search-index.json')).json(),
    ]);
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    const TOP_LEVEL_PAGES = 7; // /, /anime/, /games/, /top-100/, /insights/, /about/, /changelog/

    expect(urls.length).toBeGreaterThanOrEqual(index.length + TOP_LEVEL_PAGES);
    expect(urls.some(u => u.endsWith('/anime/cowboy-bebop/'))).toBe(true);
    expect(urls.some(u => u.endsWith('/games/elden-ring/'))).toBe(true);
    expect(urls.some(u => u.endsWith('/anime/genre/mecha/'))).toBe(true);
    expect(urls.some(u => /\/decade\/\d{4}s\/$/.test(u))).toBe(true);
    expect(urls.some(u => u.includes('/franchise/'))).toBe(true);
  });

  test('the changelog and its RSS feed are built from real git history', async ({ page, request }) => {
    await page.goto('/changelog/');
    const items = page.locator('.changelog-item');
    expect(await items.count()).toBeGreaterThan(0);
    // A hash-linked entry and its matching in-page anchor.
    const firstHash = await items.first().getAttribute('id');
    expect(firstHash).toMatch(/^[0-9a-f]{7}$/);
    await expect(page.locator(`.changelog-hash[href*="${firstHash}"]`).first()).toBeVisible();

    const feedRes = await request.get('/feed.xml');
    expect(feedRes.status()).toBe(200);
    const feedText = await feedRes.text();

    // Well-formed XML, not just "some text that looks like tags" — a real
    // parser catches an unescaped "&" in a commit subject that regex would miss.
    const parseErrors = await page.evaluate(xml => {
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      return doc.getElementsByTagName('parsererror').length;
    }, feedText);
    expect(parseErrors).toBe(0);
    expect(feedText).toContain('<rss version="2.0">');
    expect((feedText.match(/<item>/g) || []).length).toBeGreaterThan(0);
  });
});

test.describe('sync code', () => {
  test('generates a link and a genuinely scannable QR code', async ({ page }) => {
    await page.goto('/insights/');
    await page.evaluate(() => {
      localStorage.setItem('otakuplay-ratings', JSON.stringify({ 'Cowboy Bebop': 9, 'Elden Ring': 10 }));
      localStorage.setItem('otakuplay-status', JSON.stringify({ Akira: 'watched' }));
    });
    await page.reload();

    await page.locator('#insights-sync-btn').click();
    await page.locator('#sync-generate-btn').click();
    await page.waitForSelector('#sync-result:not([hidden])');

    const link = await page.locator('#sync-link-input').inputValue();
    expect(link).toContain('/insights/#sync=');

    // Decode the pixels that were actually drawn, with an independent decoder —
    // not just "the canvas has some content", but that it encodes this exact link.
    const raw = await page.evaluate(() => {
      const c = document.getElementById('sync-qr-canvas');
      const ctx = c.getContext('2d');
      const img = ctx.getImageData(0, 0, c.width, c.height);
      return { data: Array.from(img.data), width: c.width, height: c.height };
    });
    const decoded = jsQR(new Uint8ClampedArray(raw.data), raw.width, raw.height);
    expect(decoded?.data).toBe(link);
  });

  test('opening a sync link on another device offers merge or replace', async ({ page, context }) => {
    await page.goto('/insights/');
    await page.evaluate(() => {
      localStorage.setItem('otakuplay-favs', JSON.stringify(['Frieren: Beyond Journey\'s End']));
      localStorage.setItem('otakuplay-ratings', JSON.stringify({ 'Dark Souls': 10 }));
    });
    await page.reload();
    await page.locator('#insights-sync-btn').click();
    await page.locator('#sync-generate-btn').click();
    await page.waitForSelector('#sync-result:not([hidden])');
    const link = await page.locator('#sync-link-input').inputValue();

    // A second, empty tab — this device has never seen this library.
    const incoming = await context.newPage();
    await incoming.goto(link);
    await expect(incoming.locator('#sync-modal')).toHaveClass(/open/);
    await expect(incoming.locator('#sync-incoming-summary')).toContainText('1 favorite');
    await expect(incoming.locator('#sync-incoming-summary')).toContainText('1 rating');

    // The code must not survive in the URL — reloading shouldn't re-prompt.
    expect(await incoming.evaluate(() => location.hash)).toBe('');

    await incoming.locator('#sync-merge-btn').click();
    await incoming.waitForTimeout(300);
    const state = await incoming.evaluate(() => ({
      favs: JSON.parse(localStorage.getItem('otakuplay-favs') || '[]'),
      ratings: JSON.parse(localStorage.getItem('otakuplay-ratings') || '{}'),
    }));
    expect(state.favs).toContain("Frieren: Beyond Journey's End");
    expect(state.ratings['Dark Souls']).toBe(10);
  });

  // A hand-edited or corrupted code must fail safely, not throw past the catch.
  test('a corrupted sync code shows an error instead of crashing', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/insights/#sync=1not-valid-base64-or-gzip');
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
    await expect(page.locator('#sync-modal')).not.toHaveClass(/open/);
  });

  test('comparing with a friend never touches your own library', async ({ page, context }) => {
    // A second tab stands in for the friend's own device/library.
    const friend = await context.newPage();
    await friend.goto('/insights/');
    await friend.evaluate(() => {
      localStorage.setItem('otakuplay-ratings', JSON.stringify({ 'Cowboy Bebop': 9, 'Death Note': 3 }));
    });
    await friend.reload();
    await friend.locator('#insights-sync-btn').click();
    await friend.locator('#sync-generate-btn').click();
    await friend.waitForSelector('#sync-result:not([hidden])');
    const friendLink = await friend.locator('#sync-link-input').inputValue();
    await friend.close();

    await page.goto('/insights/');
    await page.evaluate(() => {
      localStorage.setItem('otakuplay-ratings', JSON.stringify({ 'Cowboy Bebop': 7, Berserk: 9 }));
    });
    await page.reload();

    await page.locator('#insights-sync-btn').click();
    await page.locator('#sync-open-compare-btn').click();
    await expect(page.locator('#sync-compare-input-view')).toBeVisible();
    await page.locator('#sync-compare-input').fill(friendLink);
    await page.locator('#sync-compare-run-btn').click();

    await expect(page.locator('#sync-compare-result-view')).toBeVisible();
    const result = page.locator('#sync-compare-result');
    await expect(result).toContainText('Berserk');       // you loved it, they haven't tried it
    await expect(result.locator('.stat-ov-num').first()).toHaveText('1'); // one shared title: Cowboy Bebop

    // The comparison is read-only — my own ratings must be exactly what I set them to.
    const myRatings = await page.evaluate(() => JSON.parse(localStorage.getItem('otakuplay-ratings')));
    expect(myRatings).toEqual({ 'Cowboy Bebop': 7, Berserk: 9 });
  });
});

test.describe('personal library', () => {
  test('status survives a reload and drives the status filter', async ({ page }) => {
    await page.locator('#anime-grid .card-open-btn').first().click();
    const title = await page.locator('#modal-title').textContent();
    await page.locator('.modal-status-opt[data-status="watched"]').click();
    await page.keyboard.press('Escape');

    await page.reload();
    await page.waitForFunction(() => document.querySelectorAll('#anime-grid .card').length > 0);
    await openFilters(page);
    await page.locator('#anime-status-row .status-btn[data-status="watched"]').click();

    const cards = page.locator('#anime-grid .card:not(.hidden)');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText(title ?? '');
  });

  test('recommendations appear once you rate something, and exclude it', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('otakuplay-ratings', JSON.stringify({ 'Dark Souls': 10, 'Elden Ring': 9 }));
    });
    await page.goto('/insights/');

    const recs = page.locator('.rec-card');
    expect(await recs.count()).toBeGreaterThan(0);
    const titles = await recs.locator('.rec-title').allTextContents();
    expect(titles).not.toContain('Dark Souls');
    await expect(recs.first().locator('.rec-because')).toContainText('Because you liked');
  });

  test('next-up queue orders "plan" titles and survives reload', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('otakuplay-status', JSON.stringify({
        'Cowboy Bebop': 'plan', 'Death Note': 'plan', 'Berserk': 'plan',
      }));
    });
    await page.goto('/insights/');

    const titlesBefore = page.locator('.queue-title');
    await expect(titlesBefore).toHaveText(['Cowboy Bebop', 'Death Note', 'Berserk']);

    // Move the second item up — it should swap with the first.
    await page.locator('.queue-move[data-title="Death Note"][data-dir="up"]').click();
    await expect(titlesBefore).toHaveText(['Death Note', 'Cowboy Bebop', 'Berserk']);

    await page.reload();
    await expect(page.locator('.queue-title')).toHaveText(['Death Note', 'Cowboy Bebop', 'Berserk']);

    // Clearing status drops a title out of the queue entirely.
    await page.locator('.queue-open[data-title="Berserk"]').click();
    await page.locator('.modal-status-opt[data-status=""]').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('.queue-title')).toHaveText(['Death Note', 'Cowboy Bebop']);
  });

  test('shareable Top 10 card downloads a real PNG, and needs 3+ ratings first', async ({ page }) => {
    await page.goto('/insights/');
    await page.locator('#share-top10-btn').click();
    await expect(page.locator('.toast:has-text("Rate at least 3 titles")')).toBeVisible();

    await page.evaluate(() => {
      localStorage.setItem('otakuplay-ratings', JSON.stringify({
        'Cowboy Bebop': 9, 'Death Note': 10, 'Berserk': 8,
      }));
    });
    await page.reload();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#share-top10-btn').click(),
    ]);
    expect(download.suggestedFilename()).toBe('otakuplay-my-top-10.png');
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buf = Buffer.concat(chunks);
    // PNG magic bytes — confirms a real image came out the other end, not an empty or broken blob.
    expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(buf.length).toBeGreaterThan(1000);
  });
});

test.describe('accessibility', () => {
  test('catalogue is reachable and openable by keyboard', async ({ page }) => {
    const first = page.locator('#anime-grid .card-open-btn').first();
    await first.focus();
    await expect(first).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#detail-modal')).toHaveClass(/open/);
  });

  test('modal traps focus and restores it on close', async ({ page }) => {
    const opener = page.locator('#anime-grid .card-open-btn').first();
    await opener.focus();
    await page.keyboard.press('Enter');

    await expect(page.locator('#modal-close')).toBeFocused();
    for (let i = 0; i < 25; i++) await page.keyboard.press('Tab');
    const inside = await page.evaluate(() =>
      document.getElementById('detail-modal').contains(document.activeElement));
    expect(inside).toBe(true);

    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
  });

  test('dialog and tablist carry the right roles', async ({ page }) => {
    const modal = page.locator('#detail-modal');
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    // Navigation is real links now, so the current page is marked with aria-current.
    await expect(page.locator('.header nav')).toHaveAttribute('aria-label', 'Main');
    await expect(page.locator('.header [aria-current="page"]')).toHaveText('Anime');
  });
});

test.describe('offline support', () => {
  test.use({ serviceWorkers: 'allow' });

  /* Smoke test for the worker's navigation path: repeated reloads while it is
     active must keep serving a full document. It does NOT exercise the 304
     branch — http-server sends `no-store`, so the browser never revalidates.
     Reproducing that needs a server that sends a cacheable ETag. */
  test('reloading under an active worker still renders', async ({ page }) => {
    await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration())?.active,
      null, { timeout: 15_000 });

    for (let i = 0; i < 2; i++) {
      await page.reload();
      await expect(page.locator('#anime-grid .card').first()).toBeVisible();
      expect(await page.locator('#anime-grid .card').count()).toBeGreaterThan(100);
    }
  });

  test('shell and catalogue still render with the network cut', async ({ page, context }) => {
    // `reg.active` only means the worker finished installing — it doesn't mean
    // *this page* is under its control yet, which is the actual precondition
    // for an offline reload to be intercepted rather than hit the network.
    // Checking `serviceWorker.controller` directly caught a real gap: on a
    // bigger build (more assets to cache during install) the old check could
    // pass while this page still weren't controlled, and the reload below
    // failed outright with ERR_INTERNET_DISCONNECTED instead of being served
    // from cache.
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 20_000 });

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#anime-grid .card').first()).toBeVisible();
    await context.setOffline(false);
  });
});

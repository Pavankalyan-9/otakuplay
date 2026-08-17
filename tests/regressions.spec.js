// @ts-check
import { test, expect } from '@playwright/test';

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
    for (const [label, path] of [['PC Games', '/games/'], ['Insights', '/insights/'], ['About', '/about/']]) {
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
    // Give the worker a chance to install and cache the shell.
    await page.waitForFunction(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg?.active;
    }, null, { timeout: 15_000 });
    await page.waitForTimeout(1000);

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#anime-grid .card').first()).toBeVisible();
    await context.setOffline(false);
  });
});

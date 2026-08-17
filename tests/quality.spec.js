// @ts-check
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Quality gates. The accessibility work on this site was done by hand — these
 * stop it eroding. The layout-shift check guards a property that currently holds
 * because every image sits in a fixed-aspect container; it would break the moment
 * someone drops in an unsized image.
 */

const PAGES = [
  ['landing',   '/'],
  ['catalogue', '/anime/'],
  ['insights',  '/insights/'],
  ['about',     '/about/'],
  ['entry',     '/anime/cowboy-bebop/'],
  ['hub',       '/anime/genre/mecha/'],
];

// Cover art and fonts come from third-party CDNs; stub them so results are stable.
async function stubThirdParty(page) {
  await page.route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    if (host === '127.0.0.1' || host === 'localhost') return route.continue();
    return route.request().resourceType() === 'stylesheet'
      ? route.fulfill({ status: 200, contentType: 'text/css', body: '' })
      : route.fulfill({ status: 204, body: '' });
  });
}

test.describe('accessibility', () => {
  for (const [name, path] of PAGES) {
    test(`${name} page has no WCAG A/AA violations`, async ({ page }) => {
      await stubThirdParty(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Report what broke, not just a count.
      const summary = violations.map(v => `${v.id} (${v.impact}) — ${v.nodes.length} node(s): ${v.help}`);
      expect(summary, summary.join('\n')).toEqual([]);
    });
  }

  test('the filter drawer stays accessible when open', async ({ page }) => {
    await stubThirdParty(page);
    await page.goto('/anime/');
    await page.locator('#anime-filter-toggle').click();
    await expect(page.locator('#anime-filter-panel')).toBeVisible();

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(violations.map(v => v.id)).toEqual([]);
  });
});

test.describe('layout stability', () => {
  for (const [name, path] of [['catalogue', '/anime/'], ['entry', '/anime/cowboy-bebop/'], ['hub', '/anime/genre/mecha/']]) {
    test(`${name} page holds its layout while images load`, async ({ page }) => {
      await page.addInitScript(() => {
        window.__cls = 0;
        new PerformanceObserver(list => {
          for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.waitForTimeout(1200);

      // Core Web Vitals calls anything under 0.1 "good"; we sit two orders below.
      const cls = await page.evaluate(() => window.__cls);
      expect(cls).toBeLessThan(0.1);
    });
  }
});

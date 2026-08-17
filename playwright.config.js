// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // The site is served by a single-threaded static server; more workers than this
  // starve each other and turn real assertions into timeouts. This was 4 when the
  // catalogue was 219 titles / 296 pages; at 271 titles / 356 pages that number
  // reproducibly caused 8 unrelated tests to fail under contention (session-closed
  // protocol errors, 30s timeouts on plain navigation) while every one of them
  // passed cleanly and quickly alone. Re-tune this if the catalogue keeps growing.
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'on-first-retry',
    // The worker would otherwise serve one test's assets to the next and make
    // reloads racy. The offline suite opts back in with test.use().
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile',  use: { ...devices['Pixel 5'] } },
  ],
  // Serves the Eleventy output — "npm test" builds before running. Calls the
  // local devDependency binary directly rather than `npx --yes http-server`:
  // npx's own resolution step was intermittently slow enough to blow past the
  // startup timeout on its own, with no test code involved.
  webServer: {
    command: 'http-server _site -p 5174 -c-1 --silent',
    url: 'http://127.0.0.1:5174/',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});

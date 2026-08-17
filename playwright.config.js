// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // The site is served by a single-threaded static server; more workers than this
  // starve each other and turn real assertions into timeouts.
  workers: 4,
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
  // Serves the repo root as-is: the site has no build step.
  webServer: {
    command: 'npx --yes http-server . -p 5174 -c-1 --silent',
    url: 'http://127.0.0.1:5174/index.html',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});

/* OtakuPlay service worker.
   Strategy: stale-while-revalidate for app shell + assets, network-first for navigations.
   The old version was pure cache-first with a fixed cache name, so a deployed update
   could never reach a returning visitor. */

const VERSION = 'v3';
const CACHE   = `otakuplay-${VERSION}`;
const ASSETS  = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './app.js',
  './manifest.json',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      // Individual failures (e.g. a renamed icon) must not abort the whole install.
      .then(cache => Promise.allSettled(ASSETS.map(url => cache.add(url))))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page asks for this after the user accepts the "new version" prompt.
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function isCacheable(request, response) {
  return response && response.ok && response.type === 'basic' && request.method === 'GET';
}

/* Defensive: a 304 answers conditional headers the HTTP cache attached to the
   request. It carries no body, so handing one to respondWith() would render a
   blank page — the cached copy it refers to is what the page actually wants.
   GitHub Pages serves ETags, so this path is reachable in production. */
async function notModified(response, cacheKey) {
  const cached = await caches.match(cacheKey);
  if (cached) return cached;
  return fetch(new Request(typeof cacheKey === 'string' ? cacheKey : cacheKey.url, { cache: 'reload' }));
}

// Navigations: network first, so a new build is picked up immediately.
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.status === 304) return notModified(response, './index.html');
    if (isCacheable(request, response)) {
      const copy = response.clone();
      caches.open(CACHE).then(c => c.put('./index.html', copy));
    }
    return response;
  } catch {
    return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
  }
}

// Assets: serve from cache instantly, refresh the entry in the background.
async function handleAsset(request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then(response => {
      if (response.status === 304) return cached || notModified(response, request);
      if (isCacheable(request, response)) {
        const copy = response.clone();
        caches.open(CACHE).then(c => c.put(request, copy));
      }
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Never intercept the worker itself or one-off cache-busted URLs.
  if (url.pathname.endsWith('/sw.js') || url.search) return;

  event.respondWith(request.mode === 'navigate' ? handleNavigation(request) : handleAsset(request));
});

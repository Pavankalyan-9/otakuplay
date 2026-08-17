/* OtakuPlay service worker.
   Strategy: stale-while-revalidate for app shell + assets, network-first for navigations.
   The old version was pure cache-first with a fixed cache name, so a deployed update
   could never reach a returning visitor. */

const VERSION = 'v2';
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

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Never cache the worker itself or one-off cache-busted URLs.
  if (url.pathname.endsWith('/sw.js') || url.search) return;

  // Navigations: try the network first so a new build is picked up immediately.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          if (isCacheable(request, response)) caches.open(CACHE).then(c => c.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html').then(cached => cached || caches.match('./')))
    );
    return;
  }

  // Assets: serve from cache instantly, refresh the entry in the background.
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          if (isCacheable(request, response)) {
            const copy = response.clone();
            caches.open(CACHE).then(c => c.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// Student Companion AI — minimal offline shell service worker.
//
// Static build assets (/assets/*.js, /assets/*.css) are content-hashed by
// Vite — a new deploy ships new filenames, never mutates an old one. That
// means it's always correct to go to the network first for them; the old
// cache-first strategy here caused real deploys to appear to "not update"
// because a browser that had cached an old hashed bundle would keep being
// served that exact old file, even through a hard refresh, until the cache
// happened to be evicted. Network-first with a cache fallback (for offline
// use) fixes that while keeping the offline shell working.
const CACHE = 'sca-v3';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Never intercept API calls or auth.
  if (url.pathname.startsWith('/api') || url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    return;
  }

  // Navigations: network first, fall back to cached shell.
  //
  // caches.match resolves to undefined on a miss, and returning undefined
  // from respondWith throws "Failed to convert value to 'Response'" — turning
  // a recoverable network blip into a hard page error. Always resolve to a
  // real Response.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match('/index.html');
        return (
          cached ||
          new Response(
            '<!doctype html><meta charset="utf-8"><title>Offline</title>' +
              '<body style="font-family:system-ui;padding:2rem;text-align:center">' +
              '<h1>You appear to be offline</h1>' +
              '<p>Check your connection and reload.</p>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          )
        );
      })
    );
    return;
  }

  // Static assets: network first (so a new deploy is always picked up),
  // fall back to cache only when offline. Still caches a fresh copy of
  // whatever the network returns, so the offline shell stays usable.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          // Same undefined-on-miss trap as above: respondWith must always
          // receive a Response, so surface a real 504 rather than throwing.
          const cached = await caches.match(request);
          return (
            cached ||
            new Response('', { status: 504, statusText: 'Offline and not cached' })
          );
        })
    );
  }
});

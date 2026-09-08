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
const CACHE = 'sca-v2';
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
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
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
        .catch(() => caches.match(request))
    );
  }
});

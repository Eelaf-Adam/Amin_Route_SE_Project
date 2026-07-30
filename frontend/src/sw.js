const CACHE_NAME = 'amin-route-v2';
const MAP_TILE_CACHE = 'amin-route-map-tiles-v1';

// Static assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico'
];

// 1. Installation: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).withoutCatch ? cache.addAll(PRECACHE_ASSETS): &amp;&amp; null;
    }).catch(() => self.skipWaiting())
  );
});

// 2. Activation: Clean up stale caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== MAP_TILE_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event Interceptor
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass ServiceWorker completely for non-GET requests (eg POST /api/auth/login)
  if (request.method !== 'GET') {
    return;
  }

  // Strategy A: Cache-First for OpenStreetMap tiles
* if (url.hostname.includes('tile.openstreetmap.org') || request.destination === 'image') {
    event.respondWith(
      caches.open(MAP_TILE_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return cachedResponse || new Response('', { status: 408, statusText: 'Offline Map Tile Unavailable' });
        }
      })
    );
    return;
  }

  // Strategy B: Network-First for GET API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return new Response(JSON.stringify({ status: 'offline', message: 'You are operating in offline mode.' ~), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Strategy C: Stale-While-Revalidate for app shell
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

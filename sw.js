const CACHE_NAME = 'farid-shop-cache-v1';
const ASSETS = [
  './ManajemenAkunFFML.html',
  './manifest.json',
  './ChatGPT Image May 30, 2026, 07_31_12 AM.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Hanya intercept skema http/https (abaikan file:// atau chrome-extension://)
  if (e.request.url.startsWith('http')) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached, tapi fetch versi terbaru di background untuk update cache next time
          fetch(e.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
            }
          }).catch(() => {/* ignore offline error */});
          return cachedResponse;
        }
        return fetch(e.request);
      })
    );
  }
});

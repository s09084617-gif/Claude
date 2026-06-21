const CACHE = 'fitwid-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/about.html',
  '/coaching.html',
  '/pricing.html',
  '/results.html',
  '/apply.html',
  '/client-portal.html',
  '/generator.html',
  '/manifest.json',
  '/images/logo-coach-sahil.png',
  '/images/hero-banner.jpg',
  '/images/sahil-physique.png',
  '/app-icons/icon-192x192.png',
  '/app-icons/icon-512x512.png',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
      return cached || network;
    })
  );
});

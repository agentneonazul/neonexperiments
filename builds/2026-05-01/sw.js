// Skill Crystallizer — Service Worker
// Cache-first for app shell, network-only for API calls.

const CACHE = 'crystallizer-v2';
const SHELL = ['./', './manifest.json', './icon.svg', './icon-maskable.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Let API calls, fonts, and external resources go straight to network
  if (
    url.includes('groq.com') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com')
  ) return;

  // Cache-first for app shell
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

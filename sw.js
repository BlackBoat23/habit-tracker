const CACHE = 'dougs-tracker-v1';
const APP_SHELL = [
  '/habit-tracker/Habit-Tracker.html',
  '/habit-tracker/manifest.json',
  '/habit-tracker/icon-192.png',
  '/habit-tracker/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_SHELL)));
  self.skipWaiting();
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
  // Always go network-first for Google APIs (Drive, OAuth)
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('accounts.google.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }
  // Network-first for everything else; fall back to cache for offline use
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r && r.status === 200) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

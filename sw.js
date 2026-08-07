const CACHE_NAME = 'yawmeyati-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/dashboard.js',
  './js/sheets.js',
  './js/daily.js',
  './js/attendance.js',
  './js/tasks.js',
  './js/notes.js',
  './js/utils.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(e.request, res.clone());
        return res;
      });
    }).catch(()=> caches.match('./index.html')))
  );
});

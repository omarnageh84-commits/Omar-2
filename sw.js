const CACHE_NAME = 'yawmeyati-v4-pro';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/utils.js',
  './js/sheets.js',
  './js/daily.js',
  './js/attendance.js',
  './js/tasks.js',
  './js/notes.js',
  './js/dashboard.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k!== CACHE_NAME).map(k => caches.delete(k)))));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

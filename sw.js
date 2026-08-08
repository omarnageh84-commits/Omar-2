const CACHE_NAME = 'yawmeyati-v6-pro';
const ASSETS = [
  './','./index.html','./manifest.json',
  './css/style.css',
  './js/app.js','./js/utils.js','./js/sheets.js',
  './js/daily.js','./js/attendance.js','./js/dashboard.js','./js/notes.js','./js/tasks.js'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).catch(()=>caches.match('./index.html'))));
});

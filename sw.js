
const CACHE='app-omar-v2';
const ASSETS=['./','./index.html','./home.html','./daily.html','./attendance.html','./tasks.html','./themes.js','./drive-sync.js','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});

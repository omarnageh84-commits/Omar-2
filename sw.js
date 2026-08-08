const CACHE='yawmeyati-v8-fix';
const ASSETS=[
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/utils.js',
  './js/sheets.js',
  './js/dashboard.js',
  './js/daily.js',
  './js/attendance.js',
  './js/notes.js',
  './js/tasks.js',
  './manifest.json'
];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=>Promise.allSettled(ASSETS.map(url=>c.add(url))))
  );
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',e=>{
  if(e.request.url.includes('script.google.com')) return;
  if(e.request.method!=='GET') return;
  e.respondWith(
    fetch(e.request).then(res=>{
      if(res.ok && e.request.url.startsWith(self.location.origin)){
        const clone=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request, clone));
      }
      return res;
    }).catch(()=>caches.match(e.request).then(m=>m || caches.match('./index.html')))
  );
});

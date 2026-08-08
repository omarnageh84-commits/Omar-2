const CACHE='yawmeyati-v10-final';
const ASSETS=[
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/utils.js',
  './js/dashboard.js',
  './js/daily.js',
  './js/attendance.js',
  './js/notes.js',
  './js/tasks.js',
  './manifest.json'
];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>{ if(k!==CACHE) return caches.delete(k); }))).then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',e=>{
  if(e.request.url.includes('script.google.com')) return;
  if(e.request.method!=='GET') return;
  if(e.request.url.includes('/js/')){
    e.respondWith(
      fetch(e.request, {cache:'no-store'}).then(res=>{
        if(res.ok){ const clone=res.clone(); caches.open(CACHE).then(c=>c.put(e.request, clone)); }
        return res;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    fetch(e.request).then(res=>{
      if(res.ok && e.request.url.startsWith(self.location.origin)){
        const clone=res.clone(); caches.open(CACHE).then(c=>c.put(e.request, clone));
      }
      return res;
    }).catch(()=>caches.match(e.request).then(m=>m || caches.match('./index.html')))
  );
});

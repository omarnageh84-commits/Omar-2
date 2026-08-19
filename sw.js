const CACHE='app-omar-v5-icon';
const ASSETS=['./','./index.html','./home.html','./daily.html','./attendance.html','./tasks.html','./tasks-new.html','./important.html','./debts.html','./themes.js','./drive-sync.js','./manifest.json','./icon_192.png','./icon_512.png'];

// Install - نزّل ملفات المشروع بس
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{})
  );
});

// Activate - امسح الكاش القديم
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>{
      return Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    }).then(()=>self.clients.claim())
  );
});

// Fetch - ذكي
self.addEventListener('fetch',e=>{
  const url = e.request.url;

  // 1. اي حاجة لـ Google (Apps Script / Drive / googleusercontent) متعملهاش cache خالص - سيبها تعدي
  if(url.includes('script.google.com') || url.includes('script.googleusercontent.com') || url.includes('googleapis.com') || url.includes('drive.google.com')){
    return; // خلي المتصفح يجيبها عادي بدون تدخل الـ SW
  }

  // 2. ملفات المشروع نفسه - Cache First
  e.respondWith(
    caches.match(e.request).then(r=>{
      if(r) return r;
      return fetch(e.request).then(res=>{
        // خزن نسخة جديدة للـ assets بس
        if(e.request.method === 'GET' && res.status === 200 && e.request.url.startsWith(self.location.origin)){
          let clone = res.clone();
          caches.open(CACHE).then(c=>c.put(e.request, clone));
        }
        return res;
      }).catch(()=>r);
    })
  );
});

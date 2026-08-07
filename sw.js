const CACHE="yawmeyati-v6";
const FILES=["./","./index.html","./manifest.json","./css/style.css","./js/app.js","./js/daily.js","./js/attendance.js","./js/notes.js","./js/tasks.js","./js/dashboard.js","./js/sheets.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)))});
self.addEventListener("fetch",e=>{
  e.respondWith(
    caches.match(e.request).then(r=>{
      return r || fetch(e.request).then(res=>{
        caches.open(CACHE).then(c=>c.put(e.request,res.clone()));
        return res;
      }).catch(()=>r);
    })
  );
});

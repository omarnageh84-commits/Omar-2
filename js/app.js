let _syncTimeout=null;
const APP={
  get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}},
  set:(k,v)=>{
    localStorage.setItem(k,JSON.stringify(v));
    // Auto Sync after any save (debounced 2 sec)
    if(localStorage.getItem('gs_url') && ['expenses','debts','attendance','notes'].includes(k)){
      clearTimeout(_syncTimeout);
      _syncTimeout=setTimeout(()=>{ 
        if(typeof syncToGoogleSheetSilent==='function') syncToGoogleSheetSilent();
      },2000);
    }
  }
};
const uid=()=>Math.random().toString(36).slice(2,9);
function toast(m){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.style.cssText='position:fixed;top:14px;left:50%;transform:translateX(-50%);background:#fff;color:#111;padding:10px 16px;border-radius:12px;z-index:999;font-size:13px;font-weight:700';document.body.appendChild(t)}t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2200)}
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js')}

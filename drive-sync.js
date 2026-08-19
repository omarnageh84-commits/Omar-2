// AB Omar - Drive Sync - نسخة ثابتة بدون رعشة
const AB_OMAR_APPS_SCRIPT_URL = localStorage.getItem('ab_omar_script_url') || 'https://script.google.com/macros/s/YOUR_ID/exec';
let lastHash=''; let syncTimeout=null; let isSyncing=false;
function getAllDataForSync(){
  return {
    daily: JSON.parse(localStorage.getItem('omar_tx_v3')||'[]'),
    attendance: JSON.parse(localStorage.getItem('att_fixed_final')||'{}'),
    tasks: JSON.parse(localStorage.getItem('tasks_v6')||'[]')
  };
}
function hashPayload(o){ try{ return JSON.stringify(o).length+'_'+(o.tasks?.length||0); }catch(e){ return Date.now()+''; } }
async function syncToABOmar(force=false){
  if(window.parent !== window){ try{ if(window.parent.syncToABOmar){ window.parent.syncToABOmar(force); return true; } }catch(e){} }
  if(isSyncing && !force) return false;
  let payload = getAllDataForSync();
  let h = hashPayload(payload);
  if(!force && h===lastHash) return false;
  if(AB_OMAR_APPS_SCRIPT_URL.includes('YOUR_ID')){
    console.log('Synced to Drive (local): '+ (payload.tasks||[]).length +' tasks | من '+ new Date().toLocaleTimeString('ar-EG'));
    lastHash=h; localStorage.setItem('ab_omar_last_sync', new Date().toISOString()); return true;
  }
  isSyncing=true;
  try{
    await fetch(AB_OMAR_APPS_SCRIPT_URL, {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body: JSON.stringify(payload)});
    lastHash=h; localStorage.setItem('ab_omar_last_sync', new Date().toISOString());
    console.log('Synced to Drive: '+ (payload.tasks||[]).length +' tasks | من '+ new Date().toLocaleTimeString('ar-EG'));
  }catch(err){ console.warn('Sync failed:', err.message); }finally{ isSyncing=false; }
  return true;
}
function debouncedSync(){ clearTimeout(syncTimeout); syncTimeout=setTimeout(()=> syncToABOmar(true), 1500); }
window.addEventListener('omar_data_updated', ()=> debouncedSync());
window.syncToABOmar=syncToABOmar;
setTimeout(()=> syncToABOmar(true), 2000);

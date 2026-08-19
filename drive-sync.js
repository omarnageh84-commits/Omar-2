// AB Omar - Drive Sync - نسخة نهائية ثابتة - https://script.google.com/macros/s/AKfycbyV8WQb8MIN3Dxfc7IBBXIYjgza-xFq6p_ujvu66z_95mcfvr4t5ZpAXRzAZbdkCDgC/exec
const AB_OMAR_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyV8WQb8MIN3Dxfc7IBBXIYjgza-xFq6p_ujvu66z_95mcfvr4t5ZpAXRzAZbdkCDgC/exec";
let lastHash=''; let syncTimeout=null; let isSyncing=false;
function getAllDataForSync(){
  return {
    daily: JSON.parse(localStorage.getItem('omar_tx_v3')||'[]'),
    attendance: JSON.parse(localStorage.getItem('att_fixed_final')||'{}'),
    attendance_log: JSON.parse(localStorage.getItem('attendance_log')||'[]'),
    tasks: JSON.parse(localStorage.getItem('tasks_v6')||'[]'),
    important: JSON.parse(localStorage.getItem('omar_important')||'[]')
  };
}
function hashPayload(o){ try{ return JSON.stringify(o).length+'_'+(o.tasks?.length||0)+'_'+(o.daily?.length||0); }catch(e){ return Date.now()+''; } }
async function syncToABOmar(force=false){
  if(window.parent !== window){ try{ if(window.parent.syncToABOmar){ window.parent.syncToABOmar(force); return true; } }catch(e){} }
  if(isSyncing && !force) return false;
  let payload = getAllDataForSync();
  let h = hashPayload(payload);
  if(!force && h===lastHash) return false;
  isSyncing=true;
  try{
    await fetch(AB_OMAR_APPS_SCRIPT_URL, {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body: JSON.stringify(payload)});
    lastHash=h; localStorage.setItem('ab_omar_last_sync', new Date().toISOString());
    console.log('✅ Synced to Drive: '+ (payload.tasks||[]).length +' tasks, '+ (payload.daily||[]).length +' tx | '+ new Date().toLocaleTimeString('ar-EG'));
  }catch(err){ console.warn('Sync failed:', err.message); }finally{ isSyncing=false; }
  return true;
}
function debouncedSync(){ clearTimeout(syncTimeout); syncTimeout=setTimeout(()=> syncToABOmar(true), 1200); }
window.addEventListener('omar_data_updated', ()=> debouncedSync());
// حفظ تلقائي عند أي تغيير في localStorage
window.addEventListener('storage', (e)=> { if(e.key && e.key.includes('omar_') || e.key && e.key.includes('tasks_') || e.key && e.key.includes('att_')) debouncedSync(); });
window.syncToABOmar=syncToABOmar;
setTimeout(()=> syncToABOmar(true), 2000);
localStorage.setItem('ab_omar_script_url', AB_OMAR_APPS_SCRIPT_URL);

// AB Omar - Drive Sync Layer - 4 sheets - Arabic RTL - Live
const AB_OMAR_SHEET_ID = '12KpLcWLt7Xzb09A6D8qErKOvEhZvqX9-AUTn5052RdQ';
const AB_OMAR_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyxnCT0rkaR__Y5Abp0LzxiLM-FCe1KSCkt_Ef3itfFkwnAHbnCNt-qamBQW6Rugt8K/exec';
const AB_OMAR_CONFIG = { sheets: { daily: 'اليومية', attendance: 'الحضور', tasks: 'المهام', home_stats: 'الرئيسية' } };
function getAllDataForSync(){
  return {
    daily: JSON.parse(localStorage.getItem('omar_tx_v3')||'[]'),
    attendance: JSON.parse(localStorage.getItem('att_fixed_final')||'{}'),
    attendance_log: JSON.parse(localStorage.getItem('attendance_log')||'[]'),
    tasks: JSON.parse(localStorage.getItem('tasks_v6')||'[]')
  };
}
async function syncToABOmar(){
  let data = getAllDataForSync();
  if(AB_OMAR_APPS_SCRIPT_URL){
    try{
      await fetch(AB_OMAR_APPS_SCRIPT_URL, { method:'POST', mode:'no-cors', body: JSON.stringify(data) });
      console.log('✅ Synced to Drive:', data.tasks.length, 'tasks |', new Date().toLocaleTimeString('ar-EG'));
    }catch(e){ console.error('❌ Sync failed', e); }
  } else {
    console.log('App-Omar ready:', data.tasks);
  }
  localStorage.setItem('ab_omar_last_sync', new Date().toISOString());
  return data;
}
setInterval(()=>{ syncToABOmar(); }, 10000);
window.syncToABOmar = syncToABOmar;
window.AB_OMAR_CONFIG = AB_OMAR_CONFIG;

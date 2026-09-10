// drive.js - محرك المزامنة المستقل والآمن
window.SCRIPT_URL = window.SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxbH5SKWiK66ddjeLegvSff42vwg-QoBRBk4GotPGs7TPM0lx84kuus9vDzhP-kcVNF/exec';

window.db = window.db || { lastSync: null };
let _saveTimer = null;
let _isSaving = false;

function updateSyncStatus(txt){
  let dot = document.getElementById('syncDot');
  let txtEl = document.getElementById('syncText');
  if(!dot || !txtEl) return;
  if(txt.includes('رفع') || txt.includes('تحميل') || txt.includes('عمل')){ dot.textContent = '⏳'; txtEl.textContent = txt; }
  else if(txt.includes('متزامن') || txt.includes('تخزين')){ dot.textContent = '🟢'; txtEl.textContent = 'تم التخزين'; }
  else { dot.textContent = '⚠️'; txtEl.textContent = 'أوفلاين'; }
}

window.saveToLocal = function(){
  try{
    localStorage.setItem('app-omar-db', JSON.stringify(window.db));
  }catch(e){}
};

window.saveToDrive = function(){
  window.saveToLocal();
  if(_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(_doSaveToDrive, 800);
};

async function _doSaveToDrive(){
  if(_isSaving){
    _saveTimer = setTimeout(_doSaveToDrive, 1200);
    return;
  }
  _isSaving = true;
  updateSyncStatus('جاري العمل...');
  try{
    let allData = {
      daily: JSON.parse(localStorage.getItem('omar_tx_v3') || '[]'),
      tasks: JSON.parse(localStorage.getItem('omar_tasks_v1') || '[]'),
      cats: JSON.parse(localStorage.getItem('omar_cats_v1') || '[]'),
      attendance: JSON.parse(localStorage.getItem('att_fixed_final') || '{}'),
      hols: JSON.parse(localStorage.getItem('att_hols_fixed') || '{}'),
      notes: JSON.parse(localStorage.getItem('att_notes') || '{}'),
      timestamp: new Date().toISOString()
    };
    let payload = { fileName: "all_project_data.json", content: allData };
    await fetch(window.SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {'Content-Type': 'text/plain'},
      body: JSON.stringify(payload)
    });
    window.db.lastSync = new Date().toISOString();
    window.saveToLocal();
    updateSyncStatus('تم التخزين');
  }catch(err){
    updateSyncStatus('أوفلاين');
  }finally{
    _isSaving = false;
  }
}

window.saveToDriveNow = _doSaveToDrive;

window.loadFromDrive = async function(){
  updateSyncStatus('تم التنزيل');
  try{
    let res = await fetch(window.SCRIPT_URL + '?fileName=all_project_data.json&t=' + Date.now());
    let json = await res.json();
    let payload = json.data || json;
    let content = payload.content || payload;
    if(content){
      if(content.daily) localStorage.setItem('omar_tx_v3', JSON.stringify(content.daily));
      if(content.tasks) localStorage.setItem('omar_tasks_v1', JSON.stringify(content.tasks));
      if(content.cats) localStorage.setItem('omar_cats_v1', JSON.stringify(content.cats));
      if(content.attendance) localStorage.setItem('att_fixed_final', JSON.stringify(content.attendance));
      if(content.hols) localStorage.setItem('att_hols_fixed', JSON.stringify(content.hols));
      if(content.notes) localStorage.setItem('att_notes', JSON.stringify(content.notes));
      window.saveToLocal();
      updateSyncStatus('تم التخزين');
    }
  }catch(err){
    updateSyncStatus('أوفلاين');
  }
  if(window.renderAll) try{ window.renderAll(); }catch(e){}
};

window.addEventListener('DOMContentLoaded', ()=>{
  window.loadFromDrive();
});

window.syncToABOmar = function(){ window.saveToDrive(); };
window.syncToABOmarNow = function(){ window.saveToDriveNow(); };

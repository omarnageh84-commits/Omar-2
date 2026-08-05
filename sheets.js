let GOOGLE_SCRIPT_URL = localStorage.getItem('gs_url') || '';

async function syncToGoogleSheet(){
  let url = localStorage.getItem('gs_url') || GOOGLE_SCRIPT_URL || prompt('حط لينك Google Apps Script Web App:');
  if(!url) return;
  if(!localStorage.getItem('gs_url')) localStorage.setItem('gs_url', url);
  GOOGLE_SCRIPT_URL = url;
  let payload={expenses:APP.get('expenses',[]),debts:APP.get('debts',[]),attendance:APP.get('attendance',[]),notes:APP.get('notes',[]),timestamp:new Date().toISOString()};
  try{toast('⏳ جاري الرفع...'); await fetch(url,{method:'POST',mode:'no-cors',body:JSON.stringify(payload)}); toast('✅ اترفع للشيت');}catch(e){toast('❌ فشل')}
}

// Silent sync (without toast) for auto-sync
async function syncToGoogleSheetSilent(){
  let url = localStorage.getItem('gs_url'); if(!url) return;
  let payload={expenses:APP.get('expenses',[]),debts:APP.get('debts',[]),attendance:APP.get('attendance',[]),notes:APP.get('notes',[]),timestamp:new Date().toISOString()};
  try{ await fetch(url,{method:'POST',mode:'no-cors',body:JSON.stringify(payload)}); console.log('Auto-synced to sheet');}catch(e){console.log('Auto-sync failed')}
}

async function loadFromGoogleSheet(){
  let url=localStorage.getItem('gs_url'); if(!url){toast('حط لينك الشيت أولاً'); return;}
  try{toast('⏳ جاري تحميل البيانات...'); let r=await fetch(url); let d=await r.json(); 
    // Save without triggering auto-sync loop
    if(d.expenses) localStorage.setItem('expenses',JSON.stringify(d.expenses)); 
    if(d.debts) localStorage.setItem('debts',JSON.stringify(d.debts)); 
    if(d.attendance) localStorage.setItem('attendance',JSON.stringify(d.attendance)); 
    if(d.notes) localStorage.setItem('notes',JSON.stringify(d.notes)); 
    toast('✅ تم التحميل'); setTimeout(()=>location.reload(),800);
  }catch(e){toast('❌ فشل التحميل')}
}

// AUTO SYNC ON APP OPEN
document.addEventListener('DOMContentLoaded', ()=>{
  let url = localStorage.getItem('gs_url');
  if(url){
    console.log('Auto loading from sheet...');
    // Auto load after 1.5 sec from open
    setTimeout(()=>{ loadFromGoogleSheetSilent(); }, 1500);
  }
});

async function loadFromGoogleSheetSilent(){
  let url=localStorage.getItem('gs_url'); if(!url) return;
  try{ 
    let r=await fetch(url); let d=await r.json(); 
    let hasNew = false;
    if(d.expenses && JSON.stringify(d.expenses) !== localStorage.getItem('expenses')){ localStorage.setItem('expenses',JSON.stringify(d.expenses)); hasNew=true; }
    if(d.debts && JSON.stringify(d.debts) !== localStorage.getItem('debts')){ localStorage.setItem('debts',JSON.stringify(d.debts)); hasNew=true; }
    if(d.attendance && JSON.stringify(d.attendance) !== localStorage.getItem('attendance')){ localStorage.setItem('attendance',JSON.stringify(d.attendance)); hasNew=true; }
    if(d.notes && JSON.stringify(d.notes) !== localStorage.getItem('notes')){ localStorage.setItem('notes',JSON.stringify(d.notes)); hasNew=true; }
    if(hasNew){
      toast('🔄 تم تحديث البيانات من الشيت');
      setTimeout(()=>location.reload(),1000);
    }
  }catch(e){console.log('Silent load failed')}
}

async function exportAllExcel(){
  let s=document.createElement('script');
  if(!window.XLSX){await new Promise(r=>{s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=r;document.head.appendChild(s)});}
  let wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(APP.get('expenses',[])),'مصروفاتي');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(APP.get('debts',[])),'ديوني');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(APP.get('attendance',[])),'الحضور');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(APP.get('notes',[])),'ملاحظاتي');
  XLSX.writeFile(wb,'مشروعي.xlsx');
}

const GOOGLE_SCRIPT_URL = localStorage.getItem('gs_url') || '';
async function syncToGoogleSheet(){
  let url = GOOGLE_SCRIPT_URL || prompt('حط لينك Google Apps Script:');
  if(!url) return;
  if(!GOOGLE_SCRIPT_URL) localStorage.setItem('gs_url',url);
  let payload={
    expenses:APP.get('expenses',[]),
    debts:APP.get('debts',[]),
    attendance:APP.get('attendance',[]),
    notes:APP.get('notes',[])
  };
  try{
    toast('⏳ جاري الرفع...');
    await fetch(localStorage.getItem('gs_url'),{method:'POST',mode:'no-cors',body:JSON.stringify(payload)});
    toast('✅ اترفع للشيت');
  }catch(e){toast('❌ فشل')}
}
async function loadFromGoogleSheet(){
  let url=localStorage.getItem('gs_url');
  if(!url){toast('حط لينك الشيت أولاً');return;}
  try{
    let r=await fetch(url); let d=await r.json();
    if(d.expenses) APP.set('expenses',d.expenses);
    if(d.debts) APP.set('debts',d.debts);
    if(d.attendance) APP.set('attendance',d.attendance);
    if(d.notes) APP.set('notes',d.notes);
    toast('✅ تم التحميل'); setTimeout(()=>location.reload(),800);
  }catch(e){toast('❌ فشل التحميل')}
}
async function exportAllExcel(){
  if(!window.XLSX){alert('حمل الصفحة بنت');return;}
  let wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(APP.get('expenses',[])),'مصروفاتي');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(APP.get('debts',[])),'ديوني');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(APP.get('attendance',[])),'الحضور');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(APP.get('notes',[])),'ملاحظاتي');
  XLSX.writeFile(wb,'مشروعي.xlsx');
}

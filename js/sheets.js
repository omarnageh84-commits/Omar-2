// sheets.js - V6 Pro - مزامنة اختيارية مع Google Sheets
export const SHEET_URL = ""; // حط لينك الـ Web App هنا لو هتستخدمه

export async function syncToSheet(tab, data){
  if(!SHEET_URL) return;
  try{
    await fetch(SHEET_URL, {
      method:'POST', mode:'no-cors',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ tab, data, ts: new Date().toISOString() })
    });
  }catch(e){ console.warn('Sheet sync failed', e); }
}

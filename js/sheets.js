// حط رابط الـ Web App بتاع Google Apps Script هنا
export const SHEET_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

export async function syncToSheet(tab, data){
  try{
    await fetch(SHEET_URL, {
      method:'POST', mode:'no-cors',
      body: JSON.stringify({tab, data, phone: localStorage.getItem('userPhone')||''})
    });
    // ابعت ايميل تلقائي
    if(navigator.onLine) console.log('Synced', tab);
  }catch(e){ console.log('Offline, saved locally') }
}

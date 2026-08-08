// حط رابط الـ Google Apps Script Web App هنا
const SHEET_URL = "https://script.google.com/macros/s/YOUR_ID/exec";

export async function syncToSheet(type, data){
  if(SHEET_URL.includes("YOUR_ID")) return; // لو لسه محطيتش الرابط مش هيبعت
  try{
    await fetch(SHEET_URL,{
      method:'POST',
      mode:'no-cors',
      body:JSON.stringify({type, data, time:new Date().toISOString()})
    });
  }catch(e){ console.log('Sheet sync skipped', e); }
}

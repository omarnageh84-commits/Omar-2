export const SHEET_URL = "https://script.google.com/macros/s/YOUR_ID/exec";
export async function sync(tab,data){
  try{ await fetch(SHEET_URL,{method:'POST',mode:'no-cors',body:JSON.stringify({tab,data})}); }catch{}
}

export const L=(k,d)=>{ try{ return JSON.parse(localStorage.getItem(k))?? d; }catch{ return d; } };
export const S=(k,v)=> localStorage.setItem(k, JSON.stringify(v));
export const uid=()=> Math.random().toString(36).slice(2,9);
export const fmt=(n)=>{
  if(n===null||n===undefined||isNaN(n)) return '-';
  const num=Number(n);
  return num.toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:2}) + ' ج';
};
export const fmtNum=(n)=>{
  if(n===null||n===undefined||isNaN(n)) return '-';
  return Number(n).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:2});
};
export const fmtTime=(t)=> t||'-';

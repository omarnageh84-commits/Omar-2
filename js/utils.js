export const L=(k,d)=>{ try{ const v=localStorage.getItem(k); return v? JSON.parse(v) : d; }catch{ return d; } };
export const S=(k,v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){ console.error(e); } };
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
export const today=()=>{
  try{
    return new Date().toLocaleDateString('ar-EG',{weekday:'long', year:'numeric', month:'long', day:'numeric'});
  }catch{
    return new Date().toISOString().slice(0,10);
  }
};

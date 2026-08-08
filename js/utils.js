export const $ = s => document.querySelector(s);
export const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));
export const load = (k,d=[]) => { try{return JSON.parse(localStorage.getItem(k))||d}catch{return d} }
export const calcHours = (inT, outT) => {
  if(!inT ||!outT) return 0;
  let [h1,m1]=inT.split(':').map(Number); let [h2,m2]=outT.split(':').map(Number);
  let diff = (h2*60+m2)-(h1*60+m1); if(diff<0) diff+=1440;
  return +(diff/60).toFixed(2);
}
export const todayStr = () => new Date().toISOString().slice(0,10);

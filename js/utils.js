
export const S=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
export const L=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}};
export const calc=(a,b)=>{if(!a||!b)return 0;let[h1,m1]=a.split(':').map(Number),[h2,m2]=b.split(':').map(Number);let x=(h2*60+m2)-(h1*60+m1);if(x<0)x+=1440;return +(x/60).toFixed(2)};
export const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
export const fmt=n=>new Intl.NumberFormat('ar-EG',{maximumFractionDigits:0}).format(n||0)+' ج';
export const today=()=>new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});

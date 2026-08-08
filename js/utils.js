export const S=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
export const L=(k,d)=>{try{const v=localStorage.getItem(k); return v?JSON.parse(v):d;}catch{return d;}};
export const calc=(a,b)=>{if(!a||!b)return 0; const [h1,m1]=a.split(':').map(Number), [h2,m2]=b.split(':').map(Number); let diff=(h2*60+m2)-(h1*60+m1); if(diff<0)diff+=1440; return +(diff/60).toFixed(2);};
export const today=()=>new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
export const formatEGP=(n)=>new Intl.NumberFormat('ar-EG',{style:'currency',currency:'EGP',maximumFractionDigits:0}).format(n||0);
export const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);

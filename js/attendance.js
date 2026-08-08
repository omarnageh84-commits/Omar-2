import { L, S, uid, fmtNum } from './utils.js';
const KEY='attendance_v7';
const SETTINGS='att_settings_v8';
const DAILY_KEY='daily_v6';
const DEFAULT={ totalSalary: 1100, workDays: 26, required: 15000, pharmacyDebt: 4450 };

function getDays(y,m){ const arr=[]; const d=new Date(y,m,1); while(d.getMonth()===m){ arr.push(new Date(d)); d.setDate(d.getDate()+1); } return arr; }
function smartParse(v){
  if(!v) return '';
  v=String(v).trim().replace(',', '.');
  if(!v) return '';
  if(v.includes(':')){ let [h,m]=v.split(':'); h=parseInt(h)||0; m=parseInt(m)||0; if(m>59) m=59; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }
  if(v.includes('.')){ let [h,m]=v.split('.'); h=parseInt(h)||0; let ms=(m||'').trim(); if(ms==='') ms='0'; if(ms.length===1) ms=String(parseInt(ms)*10); if(ms.length>2) ms=ms.slice(0,2); let mm=parseInt(ms)||0; if(mm>59) mm=59; return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`; }
  let num=v.replace(/[^0-9]/g,'');
  if(num.length===3) return `0${num[0]}:${num.slice(1)}`;
  if(num.length===4) return `${num.slice(0,2)}:${num.slice(2)}`;
  return v;
}
function calcHours(a,b){
  if(!a||!b) return 0;
  const parse=(t)=>{ t=smartParse(t); if(!t||!t.includes(':')) return null; const [h,m]=t.split(':').map(Number); return h*60+m; };
  const pa=parse(a), pb=parse(b); if(pa===null||pb===null) return 0;
  let d=pb-pa; if(d<0) d+=24*60; return d/60;
}
function getAutoPharmacyDebt(){
  try{
    const daily=L(DAILY_KEY,[]);
    let sum=0;
    daily.forEach(r=>{
      const cat=(r.category||'').toLowerCase();
      if(cat.includes('صيدلية') || cat.includes('صيدليه')){
        sum+= Number(r.amount)||0;
      }
    });
    return sum;
  }catch{ return 0; }
}

export function renderAttendance(){
  const data=L(KEY,[]); let st=L(SETTINGS, DEFAULT);
  const autoDebt=getAutoPharmacyDebt();
  let pharmacyDebt = Number(st.pharmacyDebt);
  if((!pharmacyDebt || pharmacyDebt===4450) && autoDebt>0){ pharmacyDebt=autoDebt; }

  const totalSalary=Number(st.totalSalary)||1100;
  const workDays=Number(st.workDays)||26;
  const required=Number(st.required)||15000;
  const hourPrice = workDays? (totalSalary/workDays) : 0;
  const now=new Date(), y=now.getFullYear(), m=now.getMonth(), days=getDays(y,m), cur=`${y}-${String(m+1).padStart(2,'0')}`;
  const monthData=data.filter(x=>(x.date||'').slice(0,7)===cur);
  const totalHours=monthData.reduce((s,x)=>s+(Number(x.hours)||0),0);
  const net = hourPrice * totalHours;
  const reqDaily = hourPrice && workDays? (required / hourPrice / workDays) : 0;
  const remain = net - pharmacyDebt;

  return `<div style="padding:2px; height:100dvh; display:flex; flex-direction:column; gap:4px">
    <div style="background:#0f172a; color:#fff; padding:4px; font-size:10px; font-weight:800; text-align:center; border-radius:10px; flex:0 0 auto">📊 الحسابات - ربع الصفحة - حسابات صحيحة</div>
    <div class="card" style="margin:0; padding:0; overflow:hidden; border-radius:12px; border:1px solid #e5e7eb; flex:0 0 auto">
      <div style="display:grid; grid-template-columns:1fr 1fr; background:#fff; font-size:10px">
        <div style="border-left:1px solid #f3f4f6">
          <div style="display:grid; grid-template-columns:58px 1fr; align-items:center; padding:3px 6px; border-bottom:1px solid #f3f4f6; height:24px; direction:rtl"><span style="font-size:9px; color:#475569">الساعة [محرر]</span><input data-k="totalSalary" class="inline-edit" type="number" value="${totalSalary}" style="width:100%; padding:2px 4px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; font-weight:700; text-align:center; height:18px"></div>
          <div style="display:grid; grid-template-columns:58px 1fr; align-items:center; padding:3px 6px; border-bottom:1px solid #f3f4f6; height:24px; direction:rtl"><span style="font-size:9px; color:#475569">كم يوم [ثابت 26]</span><input data-k="workDays" class="inline-edit" type="number" value="${workDays}" style="width:100%; padding:2px 4px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; font-weight:700; text-align:center; height:18px"></div>
          <div style="display:grid; grid-template-columns:58px 1fr; align-items:center; padding:3px 6px; border-bottom:1px solid #f3f4f6; height:22px; direction:rtl"><span style="font-size:8px; color:#64748b">سعر الساعة=الساعة/كم يوم [ثابت]</span><span style="font-size:10px; font-weight:800; color:#10b981; text-align:center">${hourPrice.toFixed(2)}</span></div>
          <div style="display:grid; grid-template-columns:58px 1fr; align-items:center; padding:3px 6px; border-bottom:1px solid #f3f4f6; height:22px; direction:rtl"><span style="font-size:8px; color:#64748b">عدد الساعات جمع الحضور [ثابت]</span><span style="font-size:10px; font-weight:700; text-align:center">${totalHours.toFixed(1)}</span></div>
          <div style="display:grid; grid-template-columns:58px 1fr; align-items:center; padding:3px 6px; background:#ecfdf5; height:22px; direction:rtl"><span style="font-size:8px; font-weight:800; color:#065f46">الصافي=سعر*عدد [ثابت]</span><span style="font-size:11px; font-weight:900; color:#059669; text-align:center">${net.toFixed(0)}</span></div>
        </div>
        <div>
          <div style="display:grid; grid-template-columns:58px 1fr; align-items:center; padding:3px 6px; border-bottom:1px solid #f3f4f6; height:24px; direction:rtl"><span style="font-size:9px; color:#475569">المطلوب [محرر]</span><input data-k="required" class="inline-edit" type="number" value="${required}" style="width:100%; padding:2px 4px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; font-weight:700; text-align:center; height:18px"></div>
          <div style="display:grid; grid-template-columns:58px 1fr; align-items:center; padding:3px 6px; border-bottom:1px solid #f3f4f6; height:22px; direction:rtl"><span style="font-size:8px; color:#64748b">المطلوب يوميا=المطلوب/سعر/كم يوم [ثابت]</span><span style="font-size:10px; font-weight:700; color:#f59e0b; text-align:center">${reqDaily.toFixed(2)}</span></div>
          <div style="display:grid; grid-template-columns:58px 1fr; align-items:center; padding:3px 6px; border-bottom:1px solid #f3f4f6; height:24px; direction:rtl"><span style="font-size:8px; color:#475569">ديون الصيدلية [محرر/اوتوماتيك ${autoDebt>0?`(${autoDebt})`:''}]</span><input data-k="pharmacyDebt" class="inline-edit" type="number" value="${pharmacyDebt}" style="width:100%; padding:2px 4px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; font-weight:700; text-align:center; height:18px"></div>
          <div style="height:18px; border-bottom:1px solid #f3f4f6"></div>
          <div style="display:grid; grid-template-columns:58px 1fr; align-items:center; padding:3px 6px; background:#fff1f2; height:22px; direction:rtl"><span style="font-size:8px; font-weight:800">المتبقي=الصافي-الديون [ثابت]</span><span style="font-size:11px; font-weight:900; color:${remain<0?'#e11d48':'#059669'}; text-align:center">${fmtNum(remain)}</span></div>
        </div>
      </div>
    </div>
    <div class="card" style="margin:0; padding:0; overflow:hidden; border-radius:12px; border:1px solid #e5e7eb; flex:1 1 auto; display:flex; flex-direction:column; min-height:0">
      <div style="display:flex; justify-content:space-between; padding:4px 8px; background:#f9fafb; border-bottom:1px solid #e5e7eb; font-size:8px; font-weight:700; flex:0 0 auto"><span>${cur} - عدد الساعات: ${totalHours.toFixed(1)} - الصافي: ${net.toFixed(0)}</span><span style="background:#10b981; color:#fff; padding:1px 6px; border-radius:20px">75% للادخال</span></div>
      <div style="overflow:auto; flex:1 1 auto"><table class="pro-table" style="margin:0; width:100%; border:0; font-size:10px"><thead style="position:sticky; top:0; background:#fff; z-index:2"><tr style="font-size:7px; color:#9ca3af"><th style="padding:2px; width:26px">ي</th><th style="padding:2px; width:28%">حضور</th><th style="padding:2px; width:28%">انصراف</th><th style="padding:2px; width:28px">س</th><th style="padding:2px">م</th></tr></thead><tbody>${days.map(d=>{ const iso=d.toISOString().slice(0,10); const rec=data.find(x=>(x.date||'').slice(0,10)===iso)||{id:uid(), date:d.toISOString(), in:'', out:'', hours:0, note:''}; return `<tr style="border-top:1px solid #f9fafb"><td style="padding:1px; text-align:center"><b style="font-size:8px">${d.getDate()}</b></td><td style="padding:1px"><input type="text" inputmode="decimal" placeholder="7.33" value="${rec.in||''}" data-d="${iso}" data-f="in" class="time-input" style="width:100%; padding:3px 1px; border:1px solid ${rec.in?'#a7f3d0':'#e5e7eb'}; border-radius:4px; font-size:9px; text-align:center; background:${rec.in?'#ecfdf5':'#fff'}; height:18px"></td><td style="padding:1px"><input type="text" inputmode="decimal" placeholder="19.33" value="${rec.out||''}" data-d="${iso}" data-f="out" class="time-input" style="width:100%; padding:3px 1px; border:1px solid ${rec.out?'#fecaca':'#e5e7eb'}; border-radius:4px; font-size:9px; text-align:center; background:${rec.out?'#fff1f2':'#fff'}; height:18px"></td><td style="padding:1px; text-align:center; font-weight:800; font-size:8px; background:${rec.hours?'#f0fdf4':'#fff'}">${rec.hours?Number(rec.hours).toFixed(1):'-'}</td><td style="padding:1px"><input type="text" value="${rec.note||''}" data-d="${iso}" data-f="note" placeholder="" style="width:100%; padding:2px 2px; border:1px solid #f3f4f6; border-radius:3px; font-size:7px; height:16px"></td></tr>`}).join('')}</tbody></table></div>
    </div>
  </div>`;
}
export function handleAttendance(btn,e,rerender){
  let st=L(SETTINGS, DEFAULT); let data=L(KEY,[]);
  const t=e.target;
  if(t.classList.contains('inline-edit')){ st[t.dataset.k]=parseFloat(t.value)||0; S(SETTINGS,st); setTimeout(()=>rerender(), 50); return; }
  if(t.classList.contains('time-input')){
    const iso=t.dataset.d, f=t.dataset.f; let rec=data.find(x=>(x.date||'').slice(0,10)===iso);
    if(!rec){ rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''}; data.push(rec); }
    let parsed=smartParse(t.value); if(parsed) t.value=parsed;
    rec[f]=parsed||t.value;
    rec.hours=calcHours(rec.in, rec.out);
    S(KEY,data); setTimeout(()=>rerender(), 80); return;
  }
  if(t.dataset.f==='note'){ const iso=t.dataset.d; let rec=data.find(x=>(x.date||'').slice(0,10)===iso); if(!rec){ rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''}; data.push(rec); } rec.note=t.value; S(KEY,data); return; }
}

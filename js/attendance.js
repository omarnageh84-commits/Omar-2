import { L, S, uid, fmtNum } from './utils.js';
const KEY='attendance_v7';
const SETTINGS='att_settings_v8';
const DEFAULT={ totalSalary: 1100, workDays: 26, required: 15000, pharmacyDebt: 4450 };

function getDays(y,m){ const arr=[]; const d=new Date(y,m,1); while(d.getMonth()===m){ arr.push(new Date(d)); d.setDate(d.getDate()+1); } return arr; }

function smartParse(v){
  if(!v) return '';
  v=String(v).trim().replace(',', '.').replace('،', '.');
  if(!v) return '';
  if(v.includes(':')){
    let [h,m]=v.split(':'); h=parseInt(h)||0; m=parseInt(m)||0; if(m>59) m=59; if(h>23) h=23; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }
  if(v.includes('.')){
    let [h,m]=v.split('.'); h=parseInt(h)||0; let ms=(m||'').trim();
    if(ms==='') ms='0';
    if(ms.length===1) ms=String(parseInt(ms)*10);
    if(ms.length>2) ms=ms.slice(0,2);
    let mm=parseInt(ms)||0; if(mm>59) mm=59; if(h>23) h=23;
    return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  }
  let num=v.replace(/[^0-9]/g,'');
  if(num.length===3){ let h=parseInt(num[0]); let m=parseInt(num.slice(1)); if(m>59) m=59; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }
  if(num.length===4){ let h=parseInt(num.slice(0,2)); let m=parseInt(num.slice(2)); if(h>23) h=23; if(m>59) m=59; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }
  if(num.length<=2){ let h=parseInt(num)||0; return `${String(h).padStart(2,'0')}:00`; }
  return '';
}
function calcHours(inT,outT){
  if(!inT||!outT) return 0;
  const p=(t)=>{ const [h,m]=t.split(':').map(Number); return h*60+m; };
  try{ let a=p(inT), b=p(outT); let diff=b-a; if(diff<0) diff+=24*60; return diff/60; }catch{ return 0; }
}
export function renderAttendance(){
  const data=L(KEY,[]); const st=L(SETTINGS, DEFAULT);
  const totalSalary=Number(st.totalSalary)||0; const workDaysSet=Number(st.workDays)||26;
  const hourPrice=workDaysSet?(totalSalary/workDaysSet):0; const required=Number(st.required)||0; const pharmacyDebt=Number(st.pharmacyDebt)||0;
  const now=new Date(); const year=now.getFullYear(), month=now.getMonth(); const days=getDays(year,month); const cur=`${year}-${String(month+1).padStart(2,'0')}`;
  const monthData=data.filter(x=>(x.date||'').slice(0,7)===cur);
  const presentCount=monthData.filter(x=>x.in&&x.out).length; const totalHours=monthData.reduce((s,x)=>s+(Number(x.hours)||0),0);
  const net=totalHours*hourPrice; const requiredDailyHours=hourPrice?(required/hourPrice/workDaysSet):0; const remaining=net-pharmacyDebt;
  return `<div style="padding:4px"><div style="display:grid; grid-template-columns:1fr 1fr; gap:5px"><div class="card" style="margin:0; padding:0; overflow:hidden; border:1px solid #1e293b"><div style="background:#0f172a; color:#fff; padding:5px; font-size:10px; font-weight:800; text-align:center">📊 الحسابات</div><table class="pro-table" style="margin:0; border:0; font-size:10px"><tr><td style="padding:5px 6px">الساعة</td><td style="padding:5px 6px; text-align:left; font-weight:700">${fmtNum(totalSalary)}</td></tr><tr><td style="padding:5px 6px">كم يوم</td><td style="padding:5px 6px; text-align:left">${workDaysSet}</td></tr><tr><td style="padding:5px 6px">سعر الساعة</td><td style="padding:5px 6px; text-align:left; color:#10b981; font-weight:800">${hourPrice.toFixed(2)}</td></tr><tr><td style="padding:5px 6px">عدد الساعات</td><td style="padding:5px 6px; text-align:left; font-weight:800">${totalHours.toFixed(1)}</td></tr><tr style="background:#ecfdf5"><td style="padding:6px; font-weight:800; color:#065f46">الصافي</td><td style="padding:6px; text-align:left; font-weight:900; color:#059669">${fmtNum(net)}</td></tr><tr><td style="padding:5px 6px">المطلوب</td><td style="padding:5px 6px; text-align:left">${fmtNum(required)}</td></tr><tr><td style="padding:5px 6px; font-size:9px">المطلوب يوميا</td><td style="padding:5px 6px; text-align:left; color:#f59e0b; font-weight:700">${requiredDailyHours.toFixed(2)}</td></tr><tr><td style="padding:5px 6px">ديون للصيدلية</td><td style="padding:5px 6px; text-align:left">${fmtNum(pharmacyDebt)}</td></tr><tr style="background:#fef2f2"><td style="padding:6px; font-weight:800">المتبقي</td><td style="padding:6px; text-align:left; font-weight:900; color:${remaining>=0?'#059669':'#e11d48'}">${fmtNum(remaining)}</td></tr></table></div><div class="card" style="margin:0; padding:0; overflow:hidden; border:1px solid #1e293b"><div style="background:#1e293b; color:#fff; padding:5px; font-size:10px; font-weight:800; text-align:center">⚙️ الإعدادات - تعديل مباشر</div><table class="pro-table" style="margin:0; border:0; font-size:10px"><tr><td style="padding:4px 6px; font-size:9px">الساعة (الراتب)</td><td style="padding:4px"><input data-k="totalSalary" class="edit-inline" type="number" inputmode="decimal" value="${totalSalary}" style="width:100%; padding:5px 6px; border:1px solid #334155; border-radius:6px; background:#0f172a; color:#fff; font-size:11px; text-align:center"></td></tr><tr><td style="padding:4px 6px; font-size:9px">كم يوم</td><td style="padding:4px"><input data-k="workDays" class="edit-inline" type="number" value="${workDaysSet}" style="width:100%; padding:5px 6px; border:1px solid #334155; border-radius:6px; background:#0f172a; color:#fff; font-size:11px; text-align:center"></td></tr><tr><td style="padding:4px 6px; font-size:9px; color:#94a3b8">سعر الساعة</td><td style="padding:4px 6px; font-size:10px; color:#4ade80; text-align:center">${hourPrice.toFixed(2)}</td></tr><tr><td style="padding:4px 6px; font-size:9px">المطلوب</td><td style="padding:4px"><input data-k="required" class="edit-inline" type="number" value="${required}" style="width:100%; padding:5px 6px; border:1px solid #334155; border-radius:6px; background:#0f172a; color:#fff; font-size:11px; text-align:center"></td></tr><tr><td style="padding:4px 6px; font-size:9px">ديون الصيدلية</td><td style="padding:4px"><input data-k="pharmacyDebt" class="edit-inline" type="number" value="${pharmacyDebt}" style="width:100%; padding:5px 6px; border:1px solid #334155; border-radius:6px; background:#0f172a; color:#fff; font-size:11px; text-align:center"></td></tr></table></div></div><div class="card" style="margin:5px 0 0 0; padding:0; overflow:hidden; border:1px solid #e2e8f0"><div style="display:flex; justify-content:space-between; padding:6px 8px; background:#10b981; color:#fff; font-size:10px; font-weight:800"><span>${cur}</span><span style="background:rgba(255,255,255,.25); padding:2px 8px; border-radius:20px; font-size:9px">${presentCount} / ${totalHours.toFixed(1)}س</span></div><div style="overflow:auto"><table class="pro-table" style="margin:0; width:100%; font-size:10px"><tr style="background:#f8fafc; font-size:9px"><th style="padding:4px; width:38px">اليوم</th><th style="padding:4px; width:22%">حضور</th><th style="padding:4px; width:22%">انصراف</th><th style="padding:4px; width:50px">ساعات</th><th style="padding:4px">ملاحظة</th></tr>${days.map(d=>{ const iso=d.toISOString().slice(0,10); const rec=data.find(x=>(x.date||'').slice(0,10)===iso)||{id:uid(), date:d.toISOString(), in:'', out:'', hours:0, note:''}; return `<tr><td style="padding:3px 2px; text-align:center"><b style="font-size:11px">${d.getDate()}</b><br><span style="font-size:7px; color:#94a3b8">${d.toLocaleDateString('ar-EG',{weekday:'short'})}</span></td><td style="padding:2px"><input type="text" inputmode="decimal" placeholder="7.33" value="${rec.in||''}" data-d="${iso}" data-f="in" class="time-input" style="width:100%; padding:6px 2px; border:1px solid ${rec.in?'#a7f3d0':'#e2e8f0'}; border-radius:6px; font-size:11px; text-align:center; background:${rec.in?'#ecfdf5':'#fff'}"></td><td style="padding:2px"><input type="text" inputmode="decimal" placeholder="19.33" value="${rec.out||''}" data-d="${iso}" data-f="out" class="time-input" style="width:100%; padding:6px 2px; border:1px solid ${rec.out?'#fecaca':'#e2e8f0'}; border-radius:6px; font-size:11px; text-align:center; background:${rec.out?'#fff1f2':'#fff'}"></td><td style="padding:2px; text-align:center; font-weight:800; font-size:10px; background:${rec.hours?'#f0fdf4':'#fff'}">${rec.hours?Number(rec.hours).toFixed(1):'-'}</td><td style="padding:2px"><input type="text" value="${rec.note||''}" data-d="${iso}" data-f="note" placeholder="..." style="width:100%; padding:5px 4px; border:1px solid #f1f5f9; border-radius:5px; font-size:9px; background:#f8fafc"></td></tr>`}).join('')}</table></div><div style="padding:4px 8px; font-size:8px; color:#94a3b8; background:#f8fafc; text-align:center">اكتب 7.33 → 07:33 | 19.33 → 19:33 | 7.3 → 07:30</div></div></div>`;
}
let currentEditKey=null;
export function handleAttendance(btn,e,rerender){
  const st=L(SETTINGS, DEFAULT); let data=L(KEY,[]);
  const t=e.target;
  if(t.classList.contains('edit-inline')){
    const k=t.dataset.k; let v=parseFloat(t.value)||0; st[k]=v; S(SETTINGS,st); setTimeout(()=>rerender(), 150); return;
  }
  if(t.classList.contains('time-input') && e.type==='change'){
    const iso=t.dataset.d, f=t.dataset.f; let rec=data.find(x=>(x.date||'').slice(0,10)===iso);
    if(!rec){ rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''}; data.push(rec); }
    let parsed=smartParse(t.value); t.value=parsed; rec[f]=parsed; rec.hours=calcHours(rec.in, rec.out); S(KEY,data); setTimeout(()=>rerender(), 200); return;
  }
  if(t.dataset.f==='note'){ const iso=t.dataset.d; let rec=data.find(x=>(x.date||'').slice(0,10)===iso); if(!rec){ rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''}; data.push(rec); } rec.note=t.value; S(KEY,data); return; }
}

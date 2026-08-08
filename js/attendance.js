import { L, S, uid, fmtNum } from './utils.js';
const KEY='attendance_v7';
const SETTINGS='att_settings_v8';
const DEFAULT={ totalSalary: 1100, workDays: 26, required: 15000, pharmacyDebt: 4450 };
function getDays(y,m){ const arr=[]; const d=new Date(y,m,1); while(d.getMonth()===m){ arr.push(new Date(d)); d.setDate(d.getDate()+1); } return arr; }
function smartParse(v){
  if(!v) return '';
  v=String(v).trim().replace(',', '.').replace('،','.').replace('٫','.');
  if(!v) return '';
  if(v.includes(':')){ let [h,m]=v.split(':'); h=parseInt(h)||0; m=parseInt(m)||0; if(m>59) m=59; if(h>23) h=23; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }
  if(v.includes('.')){ let [h,m]=v.split('.'); h=parseInt(h)||0; let ms=(m||'').trim(); if(ms==='') ms='0'; if(ms.length===1) ms=String(parseInt(ms)*10); if(ms.length>2) ms=ms.slice(0,2); let mm=parseInt(ms)||0; if(mm>59) mm=59; if(h>23) h=23; return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`; }
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
  const totalHours=monthData.reduce((s,x)=>s+(Number(x.hours)||0),0);
  const net=totalHours*hourPrice;
  const requiredDailyHours=hourPrice?(required/hourPrice/workDaysSet):0;
  const remaining=net-pharmacyDebt;
  return `
  <div style="padding:4px">
    <div class="card" style="margin:0; padding:0; overflow:hidden; border-radius:18px; border:1px solid #e5e7eb">
      <div style="background:#0f172a; color:#fff; padding:10px; font-size:14px; font-weight:800; text-align:center">📊 الحسابات</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; background:#fff">
        <div style="border-right:1px solid #f3f4f6">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 10px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:13px; font-weight:700">الساعة</span><input data-k="totalSalary" class="inline-edit" type="number" value="${totalSalary}" style="width:70px; padding:5px 8px; border:1.2px solid #e5e7eb; border-radius:8px; font-size:12px; font-weight:800; text-align:center"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 10px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:13px; font-weight:700">كم يوم</span><input data-k="workDays" class="inline-edit" type="number" value="${workDaysSet}" style="width:70px; padding:5px 8px; border:1.2px solid #e5e7eb; border-radius:8px; font-size:12px; font-weight:800; text-align:center"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 10px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:13px; font-weight:700">سعر الساعة</span><span style="font-size:15px; font-weight:900; color:#10b981">${hourPrice.toFixed(2)}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 10px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:13px; font-weight:700">عدد الساعات</span><span style="font-size:14px; font-weight:800">${totalHours.toFixed(1)}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#ecfdf5; direction:rtl"><span style="font-size:13px; font-weight:800; color:#065f46">الصافي</span><span style="font-size:16px; font-weight:900; color:#059669">${net.toFixed(0)}</span></div>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 10px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:13px; font-weight:700">المطلوب</span><input data-k="required" class="inline-edit" type="number" value="${required}" style="width:70px; padding:5px 8px; border:1.2px solid #e5e7eb; border-radius:8px; font-size:12px; font-weight:800; text-align:center"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 10px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:13px; font-weight:700">المطلوب يوميا</span><span style="font-size:15px; font-weight:800; color:#f59e0b">${requiredDailyHours.toFixed(2)}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 10px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:12px; font-weight:700">ديون<br>للصيدلية</span><input data-k="pharmacyDebt" class="inline-edit" type="number" value="${pharmacyDebt}" style="width:70px; padding:5px 8px; border:1.2px solid #e5e7eb; border-radius:8px; font-size:12px; font-weight:800; text-align:center"></div>
          <div style="height:20px; border-bottom:1px solid #f9fafb"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#fff1f2; direction:rtl"><span style="font-size:13px; font-weight:800">المتبقي</span><span style="font-size:16px; font-weight:900; color:#e11d48">${fmtNum(remaining)}</span></div>
        </div>
      </div>
    </div>
    <div class="card" style="margin:6px 0 0 0; padding:0; overflow:hidden; border-radius:16px; border:1px solid #e5e7eb">
      <div style="display:flex; justify-content:space-between; padding:7px 12px; background:#f9fafb; border-bottom:1px solid #e5e7eb; font-size:10px; font-weight:700"><span>${cur}</span><span style="background:#10b981; color:#fff; padding:2px 8px; border-radius:20px">${totalHours.toFixed(1)}س • ${net.toFixed(0)}ج</span></div>
      <div style="overflow:auto; max-height:32vh"><table class="pro-table" style="margin:0; width:100%; border:0; font-size:11px"><thead style="position:sticky; top:0; background:#fff; z-index:2"><tr style="font-size:9px; color:#9ca3af"><th style="padding:6px 4px; width:36px">اليوم</th><th style="padding:6px; width:26%">حضور</th><th style="padding:6px; width:26%">انصراف</th><th style="padding:6px; width:44px">ساعات</th><th style="padding:6px">م</th></tr></thead><tbody>${days.map(d=>{ const iso=d.toISOString().slice(0,10); const rec=data.find(x=>(x.date||'').slice(0,10)===iso)||{id:uid(), date:d.toISOString(), in:'', out:'', hours:0, note:''}; return `<tr style="border-top:1px solid #f9fafb"><td style="padding:4px 2px; text-align:center"><b style="font-size:11px">${d.getDate()}</b></td><td style="padding:3px"><input type="text" inputmode="decimal" placeholder="7.33" value="${rec.in||''}" data-d="${iso}" data-f="in" class="time-input" style="width:100%; padding:6px 2px; border:1px solid ${rec.in?'#a7f3d0':'#e5e7eb'}; border-radius:8px; font-size:11px; text-align:center; background:${rec.in?'#ecfdf5':'#fff'}"></td><td style="padding:3px"><input type="text" inputmode="decimal" placeholder="19.33" value="${rec.out||''}" data-d="${iso}" data-f="out" class="time-input" style="width:100%; padding:6px 2px; border:1px solid ${rec.out?'#fecaca':'#e5e7eb'}; border-radius:8px; font-size:11px; text-align:center; background:${rec.out?'#fff1f2':'#fff'}"></td><td style="padding:3px; text-align:center; font-weight:800; font-size:10px; background:${rec.hours?'#f0fdf4':'#fff'}">${rec.hours?Number(rec.hours).toFixed(1):'-'}</td><td style="padding:3px"><input type="text" value="${rec.note||''}" data-d="${iso}" data-f="note" placeholder="" style="width:100%; padding:5px 3px; border:1px solid #f3f4f6; border-radius:6px; font-size:9px"></td></tr>`}).join('')}</tbody></table></div>
      <div style="padding:4px; font-size:7px; color:#9ca3af; background:#f9fafb; text-align:center">7.33 → 07:33 | 19.33 → 19:33</div>
    </div>
  </div>`;
}
export function handleAttendance(btn,e,rerender){
  const st=L(SETTINGS, DEFAULT); let data=L(KEY,[]);
  const t=e.target;
  if(t.classList.contains('inline-edit')){ const k=t.dataset.k; let v=parseFloat(t.value)||0; st[k]=v; S(SETTINGS,st); setTimeout(()=>rerender(), 80); return; }
  if(t.classList.contains('time-input') && (e.type==='change' || e.type==='blur')){ const iso=t.dataset.d, f=t.dataset.f; let rec=data.find(x=>(x.date||'').slice(0,10)===iso); if(!rec){ rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''}; data.push(rec); } let parsed=smartParse(t.value); if(parsed) t.value=parsed; rec[f]=parsed||''; rec.hours=calcHours(rec.in, rec.out); S(KEY,data); setTimeout(()=>rerender(), 100); return; }
  if(t.dataset.f==='note'){ const iso=t.dataset.d; let rec=data.find(x=>(x.date||'').slice(0,10)===iso); if(!rec){ rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''}; data.push(rec); } rec.note=t.value; S(KEY,data); return; }
    }

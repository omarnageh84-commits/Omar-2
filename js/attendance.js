import { L, S, uid, fmtNum } from './utils.js';
const KEY='attendance_v7';
const SETTINGS='att_settings_v8';
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
function calcHours(a,b){ if(!a||!b) return 0; const p=t=>{ const [h,m]=t.split(':').map(Number); return h*60+m; }; try{ let d=p(b)-p(a); if(d<0) d+=24*60; return d/60; }catch{ return 0; } }
export function renderAttendance(){
  const data=L(KEY,[]); const st=L(SETTINGS, DEFAULT);
  const totalSalary=Number(st.totalSalary)||0, workDaysSet=Number(st.workDays)||26;
  const hourPrice=workDaysSet?(totalSalary/workDaysSet):0, required=Number(st.required)||0, pharmacyDebt=Number(st.pharmacyDebt)||0;
  const now=new Date(), y=now.getFullYear(), m=now.getMonth(), days=getDays(y,m), cur=`${y}-${String(m+1).padStart(2,'0')}`;
  const monthData=data.filter(x=>(x.date||'').slice(0,7)===cur);
  const totalHours=monthData.reduce((s,x)=>s+(Number(x.hours)||0),0), net=totalHours*hourPrice, reqDay=hourPrice?(required/hourPrice/workDaysSet):0, remain=net-pharmacyDebt;
  return `<div style="padding:2px; height:100vh; display:flex; flex-direction:column">
    <div class="card" style="margin:0; padding:0; overflow:hidden; border-radius:12px; border:1px solid #e5e7eb; flex:0 0 auto">
      <div style="background:#0f172a; color:#fff; padding:4px; font-size:10px; font-weight:800; text-align:center">📊 الحسابات - ربع الصفحة - المحرر والثابت</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; background:#fff; font-size:10px">
        <div style="border-right:1px solid #f3f4f6">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 6px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:9px; font-weight:600">الساعة [محرر]</span><input data-k="totalSalary" class="inline-edit" type="number" value="${totalSalary}" style="width:52px; padding:2px 4px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; font-weight:700; text-align:center; background:#fff"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 6px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:9px; font-weight:600">كم يوم [محرر]</span><input data-k="workDays" class="inline-edit" type="number" value="${workDaysSet}" style="width:52px; padding:2px 4px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; font-weight:700; text-align:center"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 6px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:9px">سعر الساعة [ثابت]</span><span style="font-size:10px; font-weight:800; color:#10b981">${hourPrice.toFixed(2)}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 6px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:9px">عدد الساعات [ثابت]</span><span style="font-size:10px; font-weight:700">${totalHours.toFixed(1)}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 6px; background:#ecfdf5; direction:rtl"><span style="font-size:9px; font-weight:800">الصافي [ثابت]</span><span style="font-size:11px; font-weight:900; color:#059669">${net.toFixed(0)}</span></div>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 6px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:9px; font-weight:600">المطلوب [محرر]</span><input data-k="required" class="inline-edit" type="number" value="${required}" style="width:52px; padding:2px 4px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; font-weight:700; text-align:center"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 6px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:9px">المطلوب يوميا [ثابت]</span><span style="font-size:10px; font-weight:700; color:#f59e0b">${reqDay.toFixed(2)}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 6px; border-bottom:1px solid #f9fafb; direction:rtl"><span style="font-size:9px; font-weight:600">ديون الصيدلية [محرر]</span><input data-k="pharmacyDebt" class="inline-edit" type="number" value="${pharmacyDebt}" style="width:52px; padding:2px 4px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; font-weight:700; text-align:center"></div>
          <div style="height:12px; border-bottom:1px solid #f9fafb"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 6px; background:#fff1f2; direction:rtl"><span style="font-size:9px; font-weight:800">المتبقي [ثابت]</span><span style="font-size:11px; font-weight:900; color:#e11d48">${fmtNum(remain)}</span></div>
        </div>
      </div>
    </div>
    <div class="card" style="margin:4px 0 0 0; padding:0; overflow:hidden; border-radius:12px; border:1px solid #e5e7eb; flex:1 1 auto; display:flex; flex-direction:column">
      <div style="display:flex; justify-content:space-between; padding:4px 8px; background:#f9fafb; border-bottom:1px solid #e5e7eb; font-size:9px; font-weight:700; flex:0 0 auto"><span>${cur}</span><span style="background:#10b981; color:#fff; padding:1px 6px; border-radius:20px">${totalHours.toFixed(1)}س • ${net.toFixed(0)}ج</span></div>
      <div style="overflow:auto; flex:1 1 auto"><table class="pro-table" style="margin:0; width:100%; border:0; font-size:10px"><thead style="position:sticky; top:0; background:#fff; z-index:2"><tr style="font-size:8px; color:#9ca3af"><th style="padding:3px; width:28px">ي</th><th style="padding:3px; width:28%">حضور</th><th style="padding:3px; width:28%">انصراف</th><th style="padding:3px; width:32px">س</th><th style="padding:3px">م</th></tr></thead><tbody>${days.map(d=>{ const iso=d.toISOString().slice(0,10); const rec=data.find(x=>(x.date||'').slice(0,10)===iso)||{id:uid(), date:d.toISOString(), in:'', out:'', hours:0, note:''}; return `<tr style="border-top:1px solid #f9fafb"><td style="padding:2px; text-align:center"><b style="font-size:9px">${d.getDate()}</b></td><td style="padding:1px"><input type="text" inputmode="decimal" placeholder="7.33" value="${rec.in||''}" data-d="${iso}" data-f="in" class="time-input" style="width:100%; padding:4px 1px; border:1px solid ${rec.in?'#a7f3d0':'#e5e7eb'}; border-radius:5px; font-size:10px; text-align:center; background:${rec.in?'#ecfdf5':'#fff'}"></td><td style="padding:1px"><input type="text" inputmode="decimal" placeholder="19.33" value="${rec.out||''}" data-d="${iso}" data-f="out" class="time-input" style="width:100%; padding:4px 1px; border:1px solid ${rec.out?'#fecaca':'#e5e7eb'}; border-radius:5px; font-size:10px; text-align:center; background:${rec.out?'#fff1f2':'#fff'}"></td><td style="padding:1px; text-align:center; font-weight:800; font-size:9px; background:${rec.hours?'#f0fdf4':'#fff'}">${rec.hours?Number(rec.hours).toFixed(1):'-'}</td><td style="padding:1px"><input type="text" value="${rec.note||''}" data-d="${iso}" data-f="note" placeholder="" style="width:100%; padding:3px 2px; border:1px solid #f3f4f6; border-radius:4px; font-size:8px"></td></tr>`}).join('')}</tbody></table></div>
    </div>
  </div>`;
}
export function handleAttendance(btn,e,rerender){
  const st=L(SETTINGS, DEFAULT); let data=L(KEY,[]);
  const t=e.target;
  if(t.classList.contains('inline-edit')){ st[t.dataset.k]=parseFloat(t.value)||0; S(SETTINGS,st); setTimeout(()=>rerender(), 50); return; }
  if(t.classList.contains('time-input')){ const iso=t.dataset.d, f=t.dataset.f; let rec=data.find(x=>(x.date||'').slice(0,10)===iso); if(!rec){ rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''}; data.push(rec); } let p=smartParse(t.value); if(p) t.value=p; rec[f]=p||t.value; rec.hours=calcHours(rec.in, rec.out); S(KEY,data); setTimeout(()=>rerender(), 60); return; }
  if(t.dataset.f==='note'){ const iso=t.dataset.d; let rec=data.find(x=>(x.date||'').slice(0,10)===iso); if(!rec){ rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''}; data.push(rec); } rec.note=t.value; S(KEY,data); return; }
}

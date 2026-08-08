
import { L, S, uid, fmtNum } from './utils.js';
const KEY='attendance_v7';
const SETTINGS='att_settings_v8';
const DAILY_KEY='daily_v6';
const DEFAULT={ totalSalary: 1200, workDays: 26, required: 15000, pharmacyDebt: 14765 };

function pad(n){ return String(n).padStart(2,'0'); }
function toLocalISO(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function getDays(y,m){
  const arr=[]; const date=new Date(y,m,1);
  while(date.getMonth()===m){
    arr.push({ d: new Date(date), iso: toLocalISO(date) });
    date.setDate(date.getDate()+1);
  }
  return arr;
}
function toEn(str){ return String(str).replace(/[٠١٢٣٤٥٦٧٨٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٬/g,',').trim(); }
function toMinutes(t){
  if(!t) return null;
  let s=toEn(t); let isPM=s.includes('م')||/pm/i.test(s), isAM=s.includes('ص')||/am/i.test(s);
  s=s.replace(/[^\d:.\s]/g,' ').trim().replace('.', ':');
  let h=0,mn=0;
  if(s.includes(':')){ let p=s.split(':'); h=parseInt(p[0])||0; mn=parseInt(p[1])||0; }
  else if(s) h=parseInt(s)||0;
  if(isPM&&h<12) h+=12; if(isAM&&h==12) h=0;
  return h*60+mn;
}
function calcHours(a,b){
  if(!a||!b) return 0;
  let pa=toMinutes(a), pb=toMinutes(b);
  if(pa===null||pb===null) return 0;
  if(pa===pb) return 0;
  let diff=pb-pa; if(diff<0) diff+=24*60;
  return diff/60;
}
function format12(t){
  let mins=toMinutes(t); if(mins===null) return '';
  let h=Math.floor(mins/60)%24, mm=mins%60;
  let per=h>=12?'م':'ص'; let h12=h%12; if(h12==0) h12=12;
  return `${h12}:${pad(mm)} ${per}`;
}
function fmtMoney(n){ let num=Number(toEn(String(n)).replace(/,/g,'')); return isNaN(num)?'0':num.toLocaleString('en-US'); }
function smartParse(v){
  if(!v) return '';
  v=toEn(v).replace(/[صم]/g,'').trim().replace(',', '.');
  if(/^\d{1,2}$/.test(v)){ let h=parseInt(v); if(h<=23) return `${pad(h)}:00`; }
  if(v.includes(':')){ let [h,m]=v.split(':'); return `${pad(parseInt(h)||0)}:${pad(parseInt(m)||0)}`; }
  return v;
}
export function renderAttendance(){
  const data=L(KEY,[]); let st=L(SETTINGS, DEFAULT);
  let pharmacyDebt=Number(toEn(String(st.pharmacyDebt)).replace(/,/g,''))||14765;
  let totalSalary=Number(toEn(String(st.totalSalary)).replace(/,/g,''))||1200;
  let workDays=Number(toEn(String(st.workDays)).replace(/,/g,''))||26;
  let required=Number(toEn(String(st.required)).replace(/,/g,''))||15000;
  let pricePerHour=workDays? totalSalary/workDays : 0;
  const now=new Date(), y=now.getFullYear(), m=now.getMonth(), days=getDays(y,m), cur=`${y}-${pad(m+1)}`;
  let totalHours=0; data.forEach(x=>{ if((x.date||'').slice(0,7)===cur) totalHours+=calcHours(x.in,x.out); });
  let net=pricePerHour*totalHours;
  let dailyNeeded=(pricePerHour*workDays)? required/(pricePerHour*workDays) : 0;
  let remain=net-pharmacyDebt;
  return `<div style="padding:2px; height:100dvh; display:flex; flex-direction:column; gap:3px">
    <div class="card" style="margin:0; padding:0; overflow:hidden; border-radius:10px; border:1px solid #e5e7eb; flex:0 0 auto">
      <div style="background:#0f172a; color:#fff; padding:4px; font-size:9px; font-weight:700; text-align:center">الحسابات - ربع صفحة</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; background:#fff">
        <div style="display:flex; flex-direction:column">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:24px; border-bottom:1px solid #f3f4f6; border-left:1px solid #f3f4f6"><span style="font-size:9px">الساعة</span><input data-k="totalSalary" class="inline-edit" type="text" value="${fmtMoney(totalSalary)}" style="width:70px; height:20px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; text-align:center; font-weight:700"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:24px; border-bottom:1px solid #f3f4f6; border-left:1px solid #f3f4f6"><span style="font-size:9px">كم يوم</span><input data-k="workDays" class="inline-edit" type="text" value="${workDays}" style="width:56px; height:20px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; text-align:center; font-weight:700"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:22px; border-bottom:1px solid #f3f4f6; border-left:1px solid #f3f4f6"><span style="font-size:9px; color:#64748b">سعر الساعة</span><span style="font-size:10px; font-weight:800; color:#10b981">${pricePerHour.toFixed(2)}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:22px; border-bottom:1px solid #f3f4f6; border-left:1px solid #f3f4f6"><span style="font-size:9px; color:#64748b">عدد الساعات</span><span style="font-size:11px; font-weight:800">${totalHours.toFixed(1)}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:24px; background:#ecfdf5; border-left:1px solid #f3f4f6"><span style="font-size:9px; font-weight:700">الصافي</span><span style="font-size:12px; font-weight:900; color:#059669">${fmtMoney(net.toFixed(0))}</span></div>
        </div>
        <div style="display:flex; flex-direction:column">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:24px; border-bottom:1px solid #f3f4f6"><span style="font-size:9px">المطلوب</span><input data-k="required" class="inline-edit" type="text" value="${fmtMoney(required)}" style="width:70px; height:20px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; text-align:center; font-weight:700"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:24px; border-bottom:1px solid #f3f4f6"><span style="font-size:9px; color:#64748b">مطلوب يومه</span><span style="font-size:10px; font-weight:700; color:#f59e0b">${dailyNeeded.toFixed(2)}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:24px; border-bottom:1px solid #f3f4f6"><span style="font-size:9px">ديون صيدليه</span><input data-k="pharmacyDebt" class="inline-edit" type="text" value="${fmtMoney(pharmacyDebt)}" style="width:70px; height:20px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; text-align:center; font-weight:700"></div>
          <div style="height:22px; border-bottom:1px solid #f3f4f6"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:24px; background:#fff1f2"><span style="font-size:8px; font-weight:700">المتبقي</span><span style="font-size:12px; font-weight:900; color:${remain<0?'#e11d48':'#059669'}">${fmtMoney(remain.toFixed(0))}</span></div>
        </div>
      </div>
    <div class="card" style="margin:0; padding:0; overflow:hidden; border-radius:10px; border:1px solid #e5e7eb; flex:1 1 auto; display:flex; flex-direction:column; min-height:0">
      <div style="display:flex; justify-content:space-between; padding:4px 8px; background:#f9fafb; border-bottom:1px solid #e5e7eb; font-size:8px; font-weight:700;"><span>${cur} - ${totalHours.toFixed(1)}س - ${fmtMoney(net.toFixed(0))}ج</span><span style="background:#10b981; color:#fff; padding:1px 8px; border-radius:20px">75%</span></div>
      <div style="overflow:auto; flex:1 1 auto"><table class="pro-table" style="margin:0; width:100%; border:0; font-size:10px"><thead style="position:sticky; top:0; background:#fff"><tr style="font-size:8px; color:#9ca3af"><th style="padding:4px; width:28px">ي</th><th style="padding:4px; width:32%">حضور</th><th style="padding:4px; width:32%">انصراف</th><th style="padding:4px; width:36px">س</th><th style="padding:4px">م</th></tr></thead><tbody>${days.map(obj=>{
        const iso=obj.iso; const rec=data.find(x=> (x.date||'').slice(0,10)===iso )||{id:uid(), date:iso, in:'', out:'', hours:0, note:''};
        const dayHours=calcHours(rec.in, rec.out);
        return `<tr style="border-top:1px solid #f9fafb"><td style="padding:2px; text-align:center"><b style="font-size:9px">${obj.d.getDate()}</b></td><td style="padding:2px"><input type="text" placeholder="7 ص" value="${rec.in? format12(rec.in) : ''}" data-d="${iso}" data-f="in" class="time-input" style="width:100%; padding:4px 1px; border:1px solid ${rec.in?'#a7f3d0':'#e5e7eb'}; border-radius:6px; font-size:10px; text-align:center; height:22px"></td><td style="padding:2px"><input type="text" placeholder="7 م" value="${rec.out? format12(rec.out) : ''}" data-d="${iso}" data-f="out" class="time-input" style="width:100%; padding:4px 1px; border:1px solid ${rec.out?'#fecaca':'#e5e7eb'}; border-radius:6px; font-size:10px; text-align:center; height:22px"></td><td style="padding:2px; text-align:center; font-weight:800; font-size:9px; color:${dayHours>0?'#059669':'#9ca3af'}">${dayHours>0?dayHours.toFixed(1):'-'}</td><td style="padding:2px"><input type="text" value="${rec.note||''}" data-d="${iso}" data-f="note" placeholder="" style="width:100%; padding:3px; border:1px solid #f3f4f6; border-radius:4px; font-size:8px; height:20px"></td></tr>`
      }).join('')}</tbody></table></div>
    </div>
  </div>`;
}
export function handleAttendance(btn,e,rerender){
  let st=L(SETTINGS, DEFAULT); let data=L(KEY,[]); const t=e.target;
  if(t.classList.contains('inline-edit')){ let raw=toEn(t.value).replace(/,/g,''); st[t.dataset.k]=raw===''?'0':parseFloat(raw)||0; S(SETTINGS,st); if(e.type==='change'){ t.value=fmtMoney(st[t.dataset.k]); rerender(); } return; }
  if(t.classList.contains('time-input')){ const iso=t.dataset.d, f=t.dataset.f; let rec=data.find(x=> (x.date||'').slice(0,10)===iso); if(!rec){ rec={id:uid(), date:iso, in:'', out:'', hours:0, note:''}; data.push(rec); } if(e.type==='input'){ rec[f]=t.value; S(KEY,data); } else { let p=smartParse(t.value); if(p){ rec[f]=p; t.value=format12(p); } rec.hours=calcHours(rec.in, rec.out); S(KEY,data); rerender(); } return; }
  if(t.dataset.f==='note'){ const iso=t.dataset.d; let rec=data.find(x=> (x.date||'').slice(0,10)===iso); if(!rec){ rec={id:uid(), date:iso, in:'', out:'', hours:0, note:''}; data.push(rec); } rec.note=t.value; S(KEY,data); return; }
        }

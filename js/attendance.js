import { L, S, uid, fmtNum } from './utils.js';
const KEY='attendance_v7';
const SETTINGS='att_settings_v8';
const DEFAULT={ totalSalary: 1100, workDays: 26, required: 15000, pharmacyDebt: 4450 };

function getDays(y,m){ const arr=[]; const d=new Date(y,m,1); while(d.getMonth()===m){ arr.push(new Date(d)); d.setDate(d.getDate()+1); } return arr; }
function parseTime(t){ if(!t) return null; const [h,m]=t.split(':').map(Number); if(isNaN(h)||isNaN(m)) return null; return h*60+m; }
function calcHours(inT,outT){ const a=parseTime(inT), b=parseTime(outT); if(a===null||b===null) return 0; let diff=b-a; if(diff<0) diff+=24*60; return diff/60; }

export function renderAttendance(){
  const data=L(KEY,[]); const st=L(SETTINGS, DEFAULT);
  const totalSalary=Number(st.totalSalary)||0; const workDaysSet=Number(st.workDays)||26;
  const hourPrice=workDaysSet?(totalSalary/workDaysSet):0; const required=Number(st.required)||0; const pharmacyDebt=Number(st.pharmacyDebt)||0;
  const now=new Date(); const year=now.getFullYear(), month=now.getMonth(); const days=getDays(year,month); const cur=`${year}-${String(month+1).padStart(2,'0')}`;
  const monthData=data.filter(x=>(x.date||'').slice(0,7)===cur);
  const presentCount=monthData.filter(x=>x.in&&x.out).length; const totalHours=monthData.reduce((s,x)=>s+(Number(x.hours)||0),0);
  const net=totalHours*hourPrice; const requiredDaily=workDaysSet?(required/workDaysSet):0;
  const requiredDailyHours=hourPrice?(required/hourPrice/workDaysSet):0;
  const remainingPharmacy=net-pharmacyDebt; const remainingTotal=net-required-pharmacyDebt;

  return `
  <div style="padding:0 6px">
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:6px 0">
      <div class="card" style="margin:0; padding:0; overflow:hidden; background:#1e293b; border:0">
        <div style="background:#0f172a; color:#fff; padding:8px 10px; font-size:11px; font-weight:800; text-align:center">⚙️ الإعدادات</div>
        <table class="pro-table" style="margin:0; border:0; background:#1e293b; color:#e2e8f0">
          <tr><td style="text-align:left; color:#fff; border-color:#334155"><div style="display:flex; gap:4px"><span>${fmtNum(totalSalary)}</span> <button class="btn-sm" style="background:#fff; color:#1e293b; padding:3px 8px; border-radius:20px" data-action="editS" data-k="totalSalary">✏️</button></div></td><td style="text-align:right; font-size:10px; border-color:#334155">الساعة (الراتب)</td></tr>
          <tr><td style="text-align:left; color:#fff; border-color:#334155"><div style="display:flex; gap:4px"><span>${fmtNum(workDaysSet)}</span> <button class="btn-sm" style="background:#fff; color:#1e293b; padding:3px 8px; border-radius:20px" data-action="editS" data-k="workDays">✏️</button></div></td><td style="text-align:right; font-size:10px; border-color:#334155">كم يوم</td></tr>
          <tr><td style="text-align:left; color:#4ade80; font-weight:800; border-color:#334155">${fmtNum(hourPrice)}</td><td style="text-align:right; font-size:10px; border-color:#334155">سعر الساعة</td></tr>
          <tr><td style="text-align:left; color:#fff; border-color:#334155"><div style="display:flex; gap:4px"><span>${fmtNum(required)}</span> <button class="btn-sm" style="background:#fff; color:#1e293b; padding:3px 8px; border-radius:20px" data-action="editS" data-k="required">✏️</button></div></td><td style="text-align:right; font-size:10px; border-color:#334155">المطلوب</td></tr>
          <tr><td style="text-align:left; color:#fff; border-color:#334155"><div style="display:flex; gap:4px"><span>${fmtNum(pharmacyDebt)}</span> <button class="btn-sm" style="background:#fff; color:#1e293b; padding:3px 8px; border-radius:20px" data-action="editS" data-k="pharmacyDebt">✏️</button></div></td><td style="text-align:right; font-size:10px; border-color:#334155">ديون الصيدلية</td></tr>
        </table>
      </div>
      <div class="card" style="margin:0; padding:0; overflow:hidden; background:#0f172a; border:0">
        <div style="background:#334155; color:#fff; padding:8px 10px; font-size:11px; font-weight:800; text-align:center">📊 الحسابات - زي صورتك</div>
        <table class="pro-table" style="margin:0; border:0; background:#0f172a; color:#cbd5e1">
          <tr><td style="text-align:left; color:#fff; font-size:12px; border-color:#1e293b">${fmtNum(totalSalary)}</td><td style="text-align:right; font-size:10px; border-color:#1e293b">الساعة</td></tr>
          <tr><td style="text-align:left; color:#fff; border-color:#1e293b">${workDaysSet}</td><td style="text-align:right; font-size:10px; border-color:#1e293b">كم يوم</td></tr>
          <tr><td style="text-align:left; color:#4ade80; font-weight:800; border-color:#1e293b">${fmtNum(hourPrice)}</td><td style="text-align:right; font-size:10px; border-color:#1e293b">سعر الساعة</td></tr>
          <tr><td style="text-align:left; color:#fff; font-weight:800; font-size:13px; border-color:#1e293b">${totalHours.toFixed(1)}</td><td style="text-align:right; font-size:10px; border-color:#1e293b">عدد الساعات</td></tr>
          <tr style="border:2px dashed #10b981"><td style="text-align:left; color:#10b981; font-weight:900; font-size:14px; border-color:#1e293b">${fmtNum(net)}</td><td style="text-align:right; font-weight:800; color:#10b981; border-color:#1e293b">الصافي</td></tr>
          <tr><td style="text-align:left; color:#fff; border-color:#1e293b">${fmtNum(required)}</td><td style="text-align:right; font-size:10px; border-color:#1e293b">المطلوب</td></tr>
          <tr><td style="text-align:left; color:#fbbf24; border-color:#1e293b">${requiredDailyHours.toFixed(2)}</td><td style="text-align:right; font-size:9px; border-color:#1e293b">المطلوب عمل يوميا</td></tr>
          <tr><td style="text-align:left; color:#fff; border-color:#1e293b">${fmtNum(pharmacyDebt)}</td><td style="text-align:right; font-size:10px; border-color:#1e293b">ديون للصيدلية</td></tr>
          <tr><td style="text-align:left; color:${remainingPharmacy>=0?'#4ade80':'#f87171'}; font-weight:900; font-size:13px; border-color:#1e293b">${fmtNum(remainingPharmacy)}</td><td style="text-align:right; font-weight:800; border-color:#1e293b">المتبقي</td></tr>
        </table>
      </div>
    </div>
    <div id="editModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:9999; align-items:center; justify-content:center; padding:20px">
      <div style="background:#fff; border-radius:16px; padding:16px; width:100%; max-width:320px">
        <b id="modalLabel" style="font-size:13px"></b>
        <input id="modalInput" type="number" inputmode="decimal" style="width:100%; margin-top:10px; padding:12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:16px; direction:ltr">
        <div style="display:flex; gap:8px; margin-top:12px"><button class="btn" style="flex:1" data-action="saveModal">حفظ ✅</button><button class="btn-ghost" style="flex:1; padding:10px; border-radius:10px; border:0; background:#f1f5f9" data-action="closeModal">إلغاء</button></div>
      </div>
    </div>
    <div class="card" style="margin:6px 0 0 0; padding:0; overflow:hidden">
      <div style="display:flex; justify-content:space-between; padding:10px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; font-size:11px; font-weight:800"><span>📅 ${cur}</span><span style="background:rgba(255,255,255,.2); padding:3px 10px; border-radius:20px">${presentCount} حضور / ${totalHours.toFixed(1)} س</span></div>
      <div style="overflow:auto; max-height:70vh">
        <table class="pro-table" style="margin:0; width:100%; min-width:600px"><thead style="position:sticky; top:0; z-index:2; background:#f8fafc"><tr><th style="width:55px">اليوم</th><th style="width:110px">حضور</th><th style="width:110px">انصراف</th><th style="width:70px">ساعات</th><th>ملاحظة</th></tr></thead>
        <tbody>${days.map(d=>{ const iso=d.toISOString().slice(0,10); const rec=data.find(x=>(x.date||'').slice(0,10)===iso)||{id:uid(), date:d.toISOString(), in:'', out:'', hours:0, note:''}; const isToday=iso===new Date().toISOString().slice(0,10); return `<tr style="${isToday?'background:#ecfdf5':''}"><td style="text-align:center; padding:8px 2px"><b>${d.getDate()}</b><br><small style="font-size:9px">${d.toLocaleDateString('ar-EG',{weekday:'short'})}</small></td><td style="padding:6px"><input type="time" value="${rec.in||''}" data-d="${iso}" data-f="in" style="width:100%; padding:10px; border:1.5px solid ${rec.in?'#10b981':'#e2e8f0'}; border-radius:10px; font-size:14px; text-align:center; background:${rec.in?'#ecfdf5':'#fff'}"></td><td style="padding:6px"><input type="time" value="${rec.out||''}" data-d="${iso}" data-f="out" style="width:100%; padding:10px; border:1.5px solid ${rec.out?'#e11d48':'#e2e8f0'}; border-radius:10px; font-size:14px; text-align:center; background:${rec.out?'#fff1f2':'#fff'}"></td><td style="text-align:center; font-weight:900; font-size:13px; color:${rec.hours?'#0f172a':'#cbd5e1'}">${rec.hours?Number(rec.hours).toFixed(1):'-'}</td><td style="padding:6px"><input type="text" value="${rec.note||''}" data-d="${iso}" data-f="note" placeholder="..." style="width:100%; padding:10px; border:1px solid #f1f5f9; border-radius:10px; font-size:11px; background:#f8fafc"></td></tr>`}).join('')}</tbody></table>
      </div>
    </div>
  </div>`;
}
let currentEditKey=null;
export function handleAttendance(btn,e,rerender){
  const st=L(SETTINGS, DEFAULT); let data=L(KEY,[]);
  if(btn.dataset.action==='editS'){ currentEditKey=btn.dataset.k; const m={totalSalary:'الساعة (الراتب)', workDays:'كم يوم', required:'المطلوب', pharmacyDebt:'ديون الصيدلية'}; const modal=document.getElementById('editModal'); if(modal){ document.getElementById('modalLabel').textContent=m[currentEditKey]||currentEditKey; document.getElementById('modalInput').value=st[currentEditKey]||''; modal.style.display='flex'; setTimeout(()=>document.getElementById('modalInput').focus(),100); } return; }
  if(btn.dataset.action==='saveModal'){ const v=parseFloat((document.getElementById('modalInput').value||'').replace(/,/g,''))||0; if(currentEditKey){ st[currentEditKey]=v; S(SETTINGS,st); document.getElementById('editModal').style.display='none'; currentEditKey=null; rerender(); } return; }
  if(btn.dataset.action==='closeModal'){ document.getElementById('editModal').style.display='none'; currentEditKey=null; return; }
  const t=e.target; if(!t.dataset.d) return; const iso=t.dataset.d, f=t.dataset.f; let rec=data.find(x=>(x.date||'').slice(0,10)===iso); if(!rec){ rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''}; data.push(rec); }
  if(f==='in'||f==='out'){ rec[f]=t.value; rec.hours=calcHours(rec.in, rec.out); S(KEY,data); setTimeout(()=>rerender(),300); return; }
  if(f==='note'){ rec.note=t.value; S(KEY,data); return; }
}

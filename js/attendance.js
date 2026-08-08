import { L, S, uid, fmtNum } from './utils.js';
const KEY='attendance_v7';
const SETTINGS='att_settings_v7';
const DEFAULT={hourPrice:42, required:15000, pharmacyDebt:4450, dayPrice:0};

function getDays(year, month){
  const arr=[]; const d=new Date(year, month, 1);
  while(d.getMonth()===month){ arr.push(new Date(d)); d.setDate(d.getDate()+1); }
  return arr;
}

export function renderAttendance(){
  const data=L(KEY,[]);
  const st=L(SETTINGS, DEFAULT);
  const now=new Date(); const year=now.getFullYear(), month=now.getMonth();
  const days=getDays(year, month);
  const cur=`${year}-${String(month+1).padStart(2,'0')}`;
  const monthData=data.filter(x=> (x.date||'').slice(0,7)===cur);
  const workDays=monthData.filter(x=>x.in).length;
  const totalHours=monthData.reduce((s,x)=>s+(x.hours||0),0);
  const totalMoney=totalHours*(st.hourPrice||0);
  const remaining=totalMoney - st.required - st.pharmacyDebt;
  const dailyReq=st.required / 26;

  return `
  <div style="padding:0 6px">
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:6px 0">
      <!-- جدول المحررين -->
      <div class="card" style="margin:0; padding:0; overflow:hidden; background:#1e293b; border:0">
        <div style="background:#0f172a; color:#fff; padding:7px 10px; font-size:10px; font-weight:800; text-align:center">⚙️ الإعدادات - قابل للتعديل</div>
        <table class="pro-table" style="margin:0; border:0; border-radius:0; background:#1e293b; color:#e2e8f0">
          <tr style="background:#1e293b"><td style="text-align:left; font-size:11px; color:#fff; border-color:#334155">${fmtNum(st.hourPrice)} <button class="btn-sm" style="background:#fff; color:#1e293b; padding:3px 6px" data-action="editS" data-k="hourPrice">✏️</button></td><td style="text-align:right; font-size:10px; border-color:#334155">الساعة</td></tr>
          <tr style="background:#1e293b"><td style="text-align:left; font-size:11px; color:#fff; border-color:#334155">${fmtNum(st.hourPrice)} <button class="btn-sm" style="background:#fff; color:#1e293b; padding:3px 6px" data-action="editS" data-k="hourPrice">✏️</button></td><td style="text-align:right; font-size:10px; border-color:#334155">سعر الساعة</td></tr>
          <tr style="background:#1e293b"><td style="text-align:left; font-size:11px; color:#fff; border-color:#334155">${fmtNum(st.required)} <button class="btn-sm" style="background:#fff; color:#1e293b; padding:3px 6px" data-action="editS" data-k="required">✏️</button></td><td style="text-align:right; font-size:10px; border-color:#334155">المطلوب</td></tr>
          <tr style="background:#1e293b"><td style="text-align:left; font-size:11px; color:#fff; border-color:#334155">${fmtNum(st.pharmacyDebt)} <button class="btn-sm" style="background:#fff; color:#1e293b; padding:3px 6px" data-action="editS" data-k="pharmacyDebt">✏️</button></td><td style="text-align:right; font-size:10px; border-color:#334155">ديون الصيدلية</td></tr>
        </table>
      </div>
      <!-- جدول الحسابات -->
      <div class="card" style="margin:0; padding:0; overflow:hidden; background:#0f172a; border:0">
        <div style="background:#334155; color:#fff; padding:7px 10px; font-size:10px; font-weight:800; text-align:center">📊 الحسابات</div>
        <table class="pro-table" style="margin:0; border:0; border-radius:0; background:#0f172a; color:#cbd5e1">
          <tr style="background:#0f172a"><td style="text-align:left; color:#fff; font-size:11px; border-color:#1e293b">${workDays}</td><td style="text-align:right; font-size:10px; border-color:#1e293b">كم يوم</td></tr>
          <tr style="background:#0f172a"><td style="text-align:left; color:#fff; font-size:11px; border-color:#1e293b">${totalHours.toFixed(1)}</td><td style="text-align:right; font-size:10px; border-color:#1e293b">عدد الساعات</td></tr>
          <tr style="background:#0f172a"><td style="text-align:left; color:#38bdf8; font-size:11px; border-color:#1e293b">${fmtNum(totalMoney)}</td><td style="text-align:right; font-size:10px; border-color:#1e293b">الصافي</td></tr>
          <tr style="background:#0f172a"><td style="text-align:left; color:#fbbf24; font-size:10px; border-color:#1e293b">${dailyReq.toFixed(2)}</td><td style="text-align:right; font-size:10px; border-color:#1e293b">المطلوب يوميا</td></tr>
          <tr style="background:#0f172a"><td style="text-align:left; color:${remaining>=0?'#4ade80':'#f87171'}; font-weight:800; font-size:12px; border-color:#1e293b">${fmtNum(remaining)}</td><td style="text-align:right; font-size:10px; border-color:#1e293b; font-weight:800">المتبقي</td></tr>
        </table>
      </div>
    </div>

    <!-- جدول الحضور - احترافي وسهل -->
    <div class="card" style="margin:6px 0 0 0; padding:0; overflow:hidden">
      <div style="display:flex; justify-content:space-between; padding:8px 10px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; font-size:11px; font-weight:800">
        <span>📅 ${cur} - ${days.length} يوم</span><span style="background:rgba(255,255,255,.2); padding:3px 8px; border-radius:20px; font-size:9px">${workDays} حضور</span>
      </div>
      <div style="overflow:auto; max-height:65vh">
        <table class="pro-table" style="margin:0; border-radius:0; min-width:100%">
          <tr style="position:sticky; top:0; z-index:2; background:#f8fafc"><th style="width:46px">اليوم</th><th style="width:90px">الحضور</th><th style="width:90px">الانصراف</th><th style="width:52px">الصافي</th><th>ملاحظات</th></tr>
          ${days.map(d=>{
            const iso=d.toISOString().slice(0,10);
            const rec=data.find(x=> (x.date||'').slice(0,10)===iso) || {id:uid(), date:d.toISOString(), in:'', out:'', hours:0, note:''};
            const isToday=iso===new Date().toISOString().slice(0,10);
            const isFri=d.getDay()===5;
            return `<tr style="${isToday?'background:#ecfdf5; border-left:3px solid #10b981':''} ${isFri?'background:#fff1f2':''}">
              <td style="text-align:center; padding:6px 2px"><b style="font-size:11px">${d.getDate()}</b><br><small style="font-size:8px; color:${isFri?'#e11d48':'#64748b'}">${d.toLocaleDateString('en-US',{weekday:'short'})}</small>${isToday?'<br><span style="font-size:7px; background:#10b981; color:#fff; padding:1px 3px; border-radius:8px">اليوم</span>':''}</td>
              <td style="padding:4px"><div style="display:flex; gap:2px"><input type="time" value="${rec.in||''}" data-d="${iso}" data-f="in" class="att-in" style="flex:1; padding:7px 4px; border:1.2px solid ${rec.in?'#10b981':'#e2e8f0'}; border-radius:8px; font-size:11px; text-align:center; background:${rec.in?'#ecfdf5':'#fff'}"><button class="btn-sm" style="background:#f1f5f9; padding:4px" data-action="quick" data-d="${iso}" data-t="now" data-f="in">⏰</button></div></td>
              <td style="padding:4px"><div style="display:flex; gap:2px"><input type="time" value="${rec.out||''}" data-d="${iso}" data-f="out" class="att-out" style="flex:1; padding:7px 4px; border:1.2px solid ${rec.out?'#e11d48':'#e2e8f0'}; border-radius:8px; font-size:11px; text-align:center; background:${rec.out?'#fff1f2':'#fff'}"><button class="btn-sm" style="background:#f1f5f9; padding:4px" data-action="quick" data-d="${iso}" data-t="now" data-f="out">⏰</button></div></td>
              <td style="text-align:center; font-weight:800; font-size:11px; color:${rec.hours?'#0f172a':'#94a3b8'}">${rec.hours? rec.hours.toFixed(1):'-'}</td>
              <td style="padding:4px"><input type="text" value="${rec.note||''}" data-d="${iso}" data-f="note" placeholder="..." style="width:100%; padding:6px 6px; border:1px solid #f1f5f9; border-radius:7px; font-size:10px; background:#f8fafc"></td>
            </tr>`;
          }).join('')}
        </table>
      </div>
    </div>
  </div>
  `;
}

export function handleAttendance(btn,e,rerender){
  const st=L(SETTINGS, DEFAULT);
  let data=L(KEY,[]);
  if(btn.dataset.action==='editS'){
    const k=btn.dataset.k; const lab={hourPrice:'سعر الساعة', required:'المطلوب', pharmacyDebt:'ديون الصيدلية'}; const v=prompt(lab[k]+' (EN numbers):', st[k]); if(v===null) return; st[k]=parseFloat(v.replace(/,/g,''))||0; S(SETTINGS,st); rerender(); return;
  }
  if(btn.dataset.action==='quick'){
    const iso=btn.dataset.d, f=btn.dataset.f; let rec=data.find(x=> (x.date||'').slice(0,10)===iso); if(!rec){ rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''}; data.push(rec); }
    const now=new Date(); rec[f]=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`; calc(rec); S(KEY,data); rerender(); return;
  }
  const t=e.target; if(!t.dataset.d) return; const iso=t.dataset.d, f=t.dataset.f; let rec=data.find(x=> (x.date||'').slice(0,10)===iso); if(!rec){ rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''}; data.push(rec); }
  if(f==='in' || f==='out'){ rec[f]=t.value; calc(rec); S(KEY,data); if(f==='out') rerender(); else { t.style.borderColor='#10b981'; t.style.background='#ecfdf5'; } return; }
  if(f==='note'){ rec.note=t.value; S(KEY,data); return; }
}
function calc(r){ if(!r.in||!r.out){ r.hours=0; return; } const [h1,m1]=r.in.split(':').map(Number); const [h2,m2]=r.out.split(':').map(Number); let diff=(h2*60+m2)-(h1*60+m1); if(diff<0) diff+=24*60; r.hours=diff/60; }

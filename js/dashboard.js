import { L, fmt } from './utils.js';

export function renderDashboard(){
  const daily=L('daily_v6',[]);
  const tasks=L('tasks_v6',[]);
  const notes=L('notes_v6',[]);
  const att=L('attendance_v7',[]);
  const now=new Date();
  const curMonth=now.toISOString().slice(0,7);

  const income=daily.filter(x=>x.type==='income' && (x.date||'').slice(0,7)===curMonth).reduce((s,x)=>s+x.amount,0);
  const expense=daily.filter(x=>x.type==='expense' && (x.date||'').slice(0,7)===curMonth).reduce((s,x)=>s+x.amount,0);
  const due=daily.filter(x=>x.type==='due').reduce((s,x)=>s+x.amount,0);
  const deferred=daily.filter(x=>x.type==='deferred').reduce((s,x)=>s+x.amount,0);
  const pending=tasks.filter(x=>!x.done).length;
  const workDays=att.filter(x=> (x.date||'').slice(0,7)===curMonth && x.in).length;

  return `
  <div class="card" style="background:linear-gradient(135deg,#0f172a,#1e293b); color:#fff; border:0">
    <div style="display:flex; justify-content:space-between; align-items:center">
      <div><b style="font-size:14px">👋 أهلا يا عمر</b><div style="font-size:10px; opacity:.7; margin-top:2px">${now.toLocaleDateString('ar-EG',{weekday:'long', day:'numeric', month:'long'})}</div></div>
      <div style="background:rgba(255,255,255,.15); padding:6px 10px; border-radius:20px; font-size:10px">📊 ${curMonth}</div>
    </div>
    <div class="stat-grid" style="margin-top:14px">
      <div style="background:rgba(255,255,255,.08); border-radius:10px; padding:10px"><small style="color:#94a3b8">صافي الشهر</small><b style="font-size:14px; color:${income-expense>=0?'#10b981':'#fb7185'}">${fmt(income-expense)}</b><small style="opacity:.6">${fmt(income)} دخل - ${fmt(expense)} مصروف</small></div>
      <div style="background:rgba(255,255,255,.08); border-radius:10px; padding:10px"><small style="color:#94a3b8">الديون</small><b style="font-size:14px; color:#f59e0b">${fmt(due+deferred)}</b><small style="opacity:.6">${fmt(due)} مستحقة + ${fmt(deferred)} مؤجلة</small></div>
      <div style="background:rgba(255,255,255,.08); border-radius:10px; padding:10px"><small style="color:#94a3b8">الحضور</small><b style="font-size:14px">${workDays} يوم</b><small style="opacity:.6">${att.filter(x=>x.in).length} إجمالي الأيام</small></div>
      <div style="background:rgba(255,255,255,.08); border-radius:10px; padding:10px"><small style="color:#94a3b8">المهام</small><b style="font-size:14px">${pending} متبقي</b><small style="opacity:.6">${tasks.length} إجمالي - ${notes.length} ملاحظة</small></div>
    </div>
  </div>

  <div class="card">
    <b style="font-size:11px">📈 ملخص سريع - آخر 7 أيام</b>
    <table class="pro-table" style="margin-top:8px">
      <tr><th>اليوم</th><th>دخل</th><th>مصروف</th><th>عمل</th></tr>
      ${Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-i); const iso=d.toISOString().slice(0,10); const dayIncome=daily.filter(x=>x.type==='income' && (x.date||'').slice(0,10)===iso).reduce((s,x)=>s+x.amount,0); const dayExp=daily.filter(x=>x.type==='expense' && (x.date||'').slice(0,10)===iso).reduce((s,x)=>s+x.amount,0); const dayWork=att.find(x=>(x.date||'').slice(0,10)===iso); return `<tr><td style="font-size:10px">${d.toLocaleDateString('ar-EG',{weekday:'short', day:'numeric'})}</td><td style="color:#10b981; font-size:10px">${dayIncome?fmt(dayIncome).replace(' ج',''): '-'}</td><td style="color:#e11d48; font-size:10px">${dayExp?fmt(dayExp).replace(' ج',''): '-'}</td><td style="font-size:10px">${dayWork?.in||'-'} - ${dayWork?.out||'-'}</td></tr>`}).join('')}
    </table>
  </div>

  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:0 8px">
    <div class="card" style="margin:0"><b style="font-size:11px">🔥 مهام عاجلة</b><div style="margin-top:8px">${tasks.filter(x=>!x.done).slice(0,3).map(t=>`<div style="font-size:10px; background:#f8fafc; padding:6px 8px; border-radius:8px; margin-bottom:4px; border-left:2px solid ${t.cat==='عاجل'?'#e11d48':'#10b981'}">${t.text.slice(0,25)}</div>`).join('') || '<small style="color:#94a3b8; font-size:10px">لا يوجد مهام</small>'}</div></div>
    <div class="card" style="margin:0"><b style="font-size:11px">📝 آخر ملاحظات</b><div style="margin-top:8px">${notes.slice(0,3).map(n=>`<div style="font-size:10px; background:#f8fafc; padding:6px 8px; border-radius:8px; margin-bottom:4px">${(n.icon||'📄')} ${n.title.slice(0,20)}</div>`).join('') || '<small style="color:#94a3b8; font-size:10px">لا يوجد</small>'}</div></div>
  </div>
  `;
}

import { L, fmt } from './utils.js';
export function renderDashboard(){
  let d=L('daily_v6',[]), a=L('att_v6',[]), t=L('tasks_v6',[]);
  let tot=a.reduce((s,r)=>s+(r.h||0),0), inc=d.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0), exp=d.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
  return `<div class="card" style="background:linear-gradient(135deg,#0d9b6e,#10b981);color:#fff;border:0"><h2 style="margin:0">الصافي: ${fmt(inc-exp)}</h2><p>دخل ${fmt(inc)} - مصروف ${fmt(exp)} - ${tot.toFixed(1)} ساعة</p></div>
  <div class="stat-grid"><div class="stat"><small>مهام</small><b>${t.filter(x=>!x.done).length}</b></div><div class="stat"><small>حركات</small><b>${d.length}</b></div></div>
  <div class="card"><b>آخر الحركات</b>${d.slice(0,5).map(x=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid #f1f5f9"><span>${x.desc}</span><b>${x.amount}</b></div>`).join('')||'لا يوجد'}</div>`;
}

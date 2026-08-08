import { L, formatEGP } from './utils.js';
export function renderDashboard(){
  const daily=L('daily_v6',[]), att=L('att_v6',[]), tasks=L('notion_tasks_v6',[]), notes=L('notion_notes_v6',[]);
  const total=att.reduce((s,r)=>s+(r.h||0),0);
  const inc=daily.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0);
  const exp=daily.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
  return `<div class="card" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff"><h3 style="margin:0">يومياتي Pro V6.1</h3><p>${total.toFixed(1)} ساعة • ${formatEGP(inc-exp)} صافي</p></div>
  <div class="card"><b>آخر الحركات</b>${daily.slice(0,5).map(x=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid #eee"><span>${x.desc}</span><b>${x.amount}</b></div>`).join('')||'لا يوجد'}</div>`;
}

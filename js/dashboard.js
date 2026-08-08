import { L } from './utils.js';
export function renderDashboard(){
  let d=L('daily_v5',[]), n=L('notion_notes',[]), t=L('notion_tasks',[]);
  return `<div class="card" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff"><h3>التقارير العامة</h3><small>كل تبويب وفئاته</small></div>
  <div class="card"><b>اليومية</b><div class="h-scroll"><table class="report"><tr><th>النوع</th><th>العدد</th><th>الإجمالي</th></tr><tr><td>دخل</td><td>${d.filter(x=>x.t==='دخل').length}</td><td>${d.filter(x=>x.t==='دخل').reduce((s,x)=>s+x.a,0)}</td></tr><tr><td>مصروف</td><td>${d.filter(x=>x.t==='مصروف').length}</td><td>${d.filter(x=>x.t==='مصروف').reduce((s,x)=>s+x.a,0)}</td></tr><tr><td>ديون</td><td>${d.filter(x=>x.t==='دين').length}</td><td>${d.filter(x=>x.t==='دين').reduce((s,x)=>s+x.a,0)}</td></tr></table></div></div>
  <div class="card"><b>النوتس:</b> ${n.length} - <b>التاسكس:</b> ${t.length} مكتمل ${t.filter(x=>x.done).length}</div>`;
}

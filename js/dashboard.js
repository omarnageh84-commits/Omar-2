function renderDashboard(){
  let el=document.getElementById('tab-home');
  if(!el) return;
  let daily=JSON.parse(localStorage.getItem('daily_v4')||'{"income":[],"exp":[],"debt":[]}');
  let att=JSON.parse(localStorage.getItem('att_v2')||'[]');
  let tasks=JSON.parse(localStorage.getItem('tasks_v2')||'[]');
  let cfg=JSON.parse(localStorage.getItem('salaryConfig')||'{"hourPrice":1100,"pharmacy":0}');
  let inc=daily.income.reduce((s,x)=>s+x.amount,0);
  let exp=daily.exp.reduce((s,x)=>s+x.amount,0);
  let safi=inc-exp;
  let hrs=att.reduce((s,r)=>s+(r.total||0),0);
  el.innerHTML=`
  <div style="zoom:0.92">
    <div style="background:linear-gradient(135deg,#10b981,#059669);border-radius:14px;padding:12px;color:#fff;margin-bottom:8px">
      <div style="font-size:16px;font-weight:900">أهلا يا عمر 👋</div>
      <div style="font-size:8px;margin-top:4px;background:rgba(255,255,255,.2);display:inline-block;padding:2px 8px;border-radius:99px">${hrs.toFixed(1)} ساعة • ${daily.income.length+daily.exp.length} عملية</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
      <div style="background:#000;color:#fff;border-radius:12px;padding:10px"><div style="font-size:7px;opacity:.6">الصافي</div><div style="font-size:14px;font-weight:900;font-family:monospace">${safi.toLocaleString('en-US')} ج</div></div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:10px"><div style="font-size:7px">ساعات</div><div style="font-size:14px;font-weight:900;font-family:monospace">${hrs.toFixed(1)}h</div></div>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:8px">
      <div style="font-size:9px;font-weight:800;margin-bottom:6px">📌 آخر العمليات</div>
      ${[...daily.income.slice(-3).reverse().map(x=>`<div style="display:flex;justify-content:space-between;font-size:9px;padding:4px 0;border-bottom:1px solid #f8fafc"><span>💊 ${x.cat} ${x.amount}</span><span style="color:#94a3b8">${x.date}</span></div>`),...daily.exp.slice(-3).reverse().map(x=>`<div style="display:flex;justify-content:space-between;font-size:9px;padding:4px 0"><span>💸 ${x.cat} ${x.amount}</span><span style="color:#94a3b8">${x.date}</span></div>`)].join('')||'<div style="text-align:center;color:#94a3b8;font-size:8px;padding:10px">لا يوجد بيانات</div>'}
    </div>
  </div>`;
}
document.addEventListener('DOMContentLoaded',()=>{setTimeout(renderDashboard,300)});

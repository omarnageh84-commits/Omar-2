// js/dashboard.js - تبويب الرئيسية البرو
function renderDashboard(){
  let el = document.getElementById('tab-main');
  if(!el) el = document.getElementById('main-tab');
  if(!el) return;

  // سحب البيانات من كل البرنامج
  let daily = JSON.parse(localStorage.getItem('daily_v4') || '{"income":[],"exp":[],"debt":[]}');
  let att = JSON.parse(localStorage.getItem('att_v2') || '[]');
  let tasks = JSON.parse(localStorage.getItem('tasks_v2') || '[]');
  let salaryConfig = JSON.parse(localStorage.getItem('salaryConfig') || '{"hourPrice":1100,"pharmacy":5000}');

  let inc = daily.income.reduce((s,x)=>s+x.amount,0);
  let exp = daily.exp.reduce((s,x)=>s+x.amount,0);
  let debtOn = daily.debt.filter(d=>d.type==='عليّ').reduce((s,x)=>s+x.amount,0);
  let safi = inc - exp;
  let totalHours = att.reduce((s,r)=>s+(r.total||0),0);
  let doneTasks = tasks.filter(t=>t.done).length;

  el.innerHTML = `
  <div style="zoom:0.9;padding:8px">
    <!-- هيدر -->
    <div style="background:linear-gradient(135deg,#10b981,#059669);border-radius:14px;padding:12px;color:#fff;margin-bottom:8px">
      <div style="font-size:10px;opacity:.8">الجمعة، 7 أغسطس</div>
      <div style="font-size:16px;font-weight:900;margin-top:2px">أهلا يا عمر 👋</div>
      <div style="font-size:8px;margin-top:4px;background:rgba(255,255,255,.2);display:inline-block;padding:2px 8px;border-radius:99px">${totalHours.toFixed(1)} ساعة عمل • ${daily.income.length + daily.exp.length} عملية اليوم</div>
    </div>

    <!-- كروت سريعة -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
      <div style="background:#000;color:#fff;border-radius:12px;padding:10px"><div style="font-size:7px;opacity:.6">الصافي</div><div style="font-size:15px;font-weight:900;font-family:monospace">${safi.toLocaleString('en-US')} ج</div><div style="font-size:7px;margin-top:2px;color:#86efac">دخل ${inc.toLocaleString('en-US')} - مصروف ${exp.toLocaleString('en-US')}</div></div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:10px"><div style="font-size:7px;color:#64748b">ساعات الشهر</div><div style="font-size:15px;font-weight:900;font-family:monospace">${totalHours.toFixed(1)}h</div><div style="font-size:7px;margin-top:2px">المطلوب ${salaryConfig.hourPrice||1100} ساعة</div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px">
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:8px;text-align:center"><div style="font-size:7px;color:#dc2626">ديون عليك</div><div style="font-size:11px;font-weight:900;color:#dc2626;font-family:monospace">${debtOn.toLocaleString('en-US')}</div></div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:8px;text-align:center"><div style="font-size:7px;color:#16a34a">مهام منجزة</div><div style="font-size:11px;font-weight:900">${doneTasks}/${tasks.length}</div></div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:8px;text-align:center"><div style="font-size:7px">ديون صيدلية</div><div style="font-size:11px;font-weight:900;color:#dc2626;font-family:monospace">${salaryConfig.pharmacy||0}</div></div>
    </div>

    <!-- آخر العمليات -->
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:8px;margin-bottom:6px">
      <div style="font-size:9px;font-weight:800;margin-bottom:6px">📌 آخر 3 عمليات</div>
      ${[...daily.income.slice(-3).reverse().map(x=>`<div style="display:flex;justify-content:space-between;font-size:9px;padding:4px 0;border-bottom:1px solid #f8fafc"><span>💊 ${x.cat} - ${x.amount.toLocaleString('en-US')} ج</span><span style="color:#94a3b8;font-size:7px">${x.date}</span></div>`), ...daily.exp.slice(-3).reverse().map(x=>`<div style="display:flex;justify-content:space-between;font-size:9px;padding:4px 0;border-bottom:1px solid #f8fafc"><span>💸 ${x.cat} - ${x.amount.toLocaleString('en-US')} ج</span><span style="color:#94a3b8;font-size:7px">${x.date}</span></div>`)].join('') || '<div style="font-size:8px;color:#94a3b8;text-align:center;padding:10px">لا يوجد عمليات بعد</div>'}
    </div>

    <div style="text-align:center"><button onclick="location.reload()" style="font-size:8px;background:#f1f5f9;border:0;padding:6px 12px;border-radius:99px">🔄 تحديث</button></div>
  </div>
  `;
}

// شغلها اول ما الصفحة تفتح
document.addEventListener('DOMContentLoaded', renderDashboard);
setTimeout(renderDashboard, 500);

function renderDashboard(){
  let el=document.getElementById('tab-home'); if(!el) return;
  // بيقرا من نفس المفاتيح اللي في الصور بتاعتك tasks_pro و notes_pro
  let daily=JSON.parse(localStorage.getItem('daily_v4')||'{"income":[],"exp":[],"debt":[]}');
  let att=JSON.parse(localStorage.getItem('att_v2')||'[]');
  let tasks=JSON.parse(localStorage.getItem('tasks_pro')||'[]');
  let notes=JSON.parse(localStorage.getItem('notes_pro')||'[]');
  let cfg=JSON.parse(localStorage.getItem('salaryConfig')||'{"hourPrice":1100,"pharmacy":5000}');

  let inc=daily.income.reduce((s,x)=>s+(x.amount||0),0);
  let exp=daily.exp.reduce((s,x)=>s+(x.amount||0),0);
  let hrs=att.reduce((s,r)=>s+(r.total||0),0);
  let done=tasks.filter(t=>t.done).length;

  el.innerHTML=`
  <div style="zoom:0.92">
    <div style="background:linear-gradient(135deg,#10b981,#059669);border-radius:16px;padding:14px;color:#fff;margin-bottom:10px">
      <div style="font-size:15px;font-weight:900">أهلا يا عمر 👋</div>
      <div style="font-size:8px;opacity:.9;margin-top:4px">الرئيسية فيها ايه؟ دي لوحة تحكم بتجمع كل حاجة: الفلوس، الساعات، المهام، الملاحظات</div>
      <div style="display:flex;gap:6px;margin-top:8px">
        <span style="background:rgba(255,255,255,.2);padding:2px 8px;border-radius:99px;font-size:8px">${hrs.toFixed(1)} ساعة عمل</span>
        <span style="background:rgba(255,255,255,.2);padding:2px 8px;border-radius:99px;font-size:8px">${tasks.length} مهمة</span>
        <span style="background:rgba(255,255,255,.2);padding:2px 8px;border-radius:99px;font-size:8px">${notes.length} ملاحظة</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
      <div style="background:#000;color:#fff;border-radius:12px;padding:10px"><div style="font-size:7px;opacity:.6">الصافي (دخل-مصروف)</div><div style="font-size:14px;font-weight:900;font-family:monospace">${(inc-exp).toLocaleString('en-US')} ج</div><div style="font-size:7px;margin-top:2px;color:#86efac">${inc.toLocaleString('en-US')} دخل / ${exp.toLocaleString('en-US')} مصروف</div></div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:10px"><div style="font-size:7px;color:#64748b">ساعات الشهر</div><div style="font-size:14px;font-weight:900;font-family:monospace">${hrs.toFixed(1)}h</div><div style="font-size:7px">مطلوب ${cfg.hourPrice||1100}</div></div>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:8px">
      <div style="font-size:9px;font-weight:800">📌 آخر العمليات</div>
      <div style="font-size:8px;color:#94a3b8;margin-top:4px">لو فاضي يبقى لسه مضفتش مصروف او دخل في اليومية</div>
    </div>
  </div>`;
}

function renderHome(){
  let inc = incomes.reduce((s,x)=>s+ +x.amount,0);
  let exp = expenses.reduce((s,x)=>s+ +x.amount,0);
  // بيقرأ من النظام الجديد V2
  let forMe = debts.filter(d=>d.type==='لي').reduce((s,x)=>s+ (x.remaining||0),0);
  let onMe = debts.filter(d=>d.type==='عليّ').reduce((s,x)=>s+ (x.remaining||0),0);
  let total = inc - exp;

  document.getElementById('tab-home').innerHTML=`
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div class="stat" style="background:#ecfdf5;border:1px solid #bbf7d0">دخل الشهر<br><b style="font-size:18px">${inc} ج.م</b></div>
    <div class="stat" style="background:#fef2f2;border:1px solid #fecaca">مصروف<br><b style="font-size:18px">${exp} ج.م</b></div>
    <div class="stat" style="background:#0f172a;color:#fff;grid-column:span 2;display:flex;justify-content:space-between;align-items:center">الصافي <b style="font-size:22px;color:${total>=0?'#4ade80':'#f87171'}">${total} ج.م</b></div>
    <div class="stat" style="background:#fffbeb;border:1px solid #fde68a;grid-column:span 2">
      <div style="display:flex;justify-content:space-between"><span>💚 لك: <b>${forMe}</b></span><span>❤️ عليك: <b>${onMe}</b></span></div>
      <div style="margin-top:8px;height:6px;background:#f1f5f9;border-radius:99px;display:flex;overflow:hidden">
        <div style="width:${forMe+onMe>0? (forMe/(forMe+onMe))*100:50}%;background:#10b981"></div>
        <div style="width:${forMe+onMe>0? (onMe/(forMe+onMe))*100:50}%;background:#ef4444"></div>
      </div>
    </div>
  </div>
  <div style="margin-top:16px"><b>آخر العمليات</b>
    ${[...incomes.slice(-2).map(x=>`<div class="card"><small>${x.date}</small><span style="color:#10b981">+${x.amount} ${x.cat}</span></div>`),
      ...expenses.slice(-2).map(x=>`<div class="card"><small>مصروف</small><span style="color:#ef4444">-${x.amount} ${x.cat}</span></div>`),
      ...debts.slice(-2).map(x=>`<div class="card"><small>${x.name}</small><span>الباقي ${x.remaining} ج.م</span></div>`)
      ].join('')}
  </div>`;
}

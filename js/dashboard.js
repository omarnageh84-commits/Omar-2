function renderHome(){
  let inc = JSON.parse(localStorage.getItem('incomes')||'[]').reduce((s,x)=>s+ +x.amount,0);
  let exp = JSON.parse(localStorage.getItem('expenses')||'[]').reduce((s,x)=>s+ +x.amount,0);
  let debts = JSON.parse(localStorage.getItem('debts')||'[]');
  let forMe = debts.filter(d=>d.type==='لي' && d.status!=='مسدد').reduce((s,x)=>s+ +x.amount,0);
  let onMe = debts.filter(d=>d.type==='عليّ' && d.status!=='مسدد').reduce((s,x)=>s+ +x.amount,0);
  document.getElementById('tab-home').innerHTML = `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div class="stat" style="background:#ecfdf5">دخل الشهر<br><b>${inc} ج.م</b></div>
    <div class="stat" style="background:#fef2f2">مصروف الشهر<br><b>${exp} ج.م</b></div>
    <div class="stat" style="background:#0f172a;color:#fff">الصافي<br><b>${inc-exp} ج.م</b></div>
    <div class="stat" style="background:#fffbeb">صافي الديون<br><small>لك ${forMe} / عليك ${onMe}</small></div>
  </div>`;
}

let incomes = JSON.parse(localStorage.getItem('incomes')||'[]');
let expenses = JSON.parse(localStorage.getItem('expenses')||'[]');
let debts = JSON.parse(localStorage.getItem('debts')||'[]');
function save(){localStorage.setItem('incomes',JSON.stringify(incomes)); localStorage.setItem('expenses',JSON.stringify(expenses)); localStorage.setItem('debts',JSON.stringify(debts)); renderHome();}

function renderIncome(){
  let total = incomes.reduce((s,x)=>s+ +x.amount,0);
  document.getElementById('daily-income').innerHTML = `
  <div class="input-row">
    <input id="in-amount" type="number" placeholder="المبلغ">
    <select id="in-cat"><option>راتب</option><option>مبيعات</option><option>تحويل</option><option>أخرى</option></select>
    <button class="btn" onclick="addIncome()">+</button>
  </div>
  <b>الإجمالي: ${total} ج.م</b>
  ${incomes.map((x,i)=>`<div class="card"><span>${x.cat} - ${x.date}</span><b style="color:#10b981">${x.amount} ج.م <span onclick="delIncome(${i})" style="cursor:pointer">❌</span></b></div>`).join('')}`;
}
function addIncome(){
  let a=document.getElementById('in-amount').value; if(!a) return;
  incomes.push({amount:a,cat:document.getElementById('in-cat').value,date:new Date().toLocaleDateString('ar-EG')}); save(); renderIncome();
}
function delIncome(i){incomes.splice(i,1); save(); renderIncome();}

function renderExp(){
  let total = expenses.reduce((s,x)=>s+ +x.amount,0);
  document.getElementById('daily-exp').innerHTML = `
  <div class="input-row">
    <input id="ex-amount" type="number" placeholder="المبلغ">
    <select id="ex-cat"><option>أكل</option><option>إيجار</option><option>مواصلات</option><option>فواتير</option><option>أخرى</option></select>
    <button class="btn" style="background:#ef4444" onclick="addExp()">+</button>
  </div>
  <b>الإجمالي: ${total} ج.م</b>
  ${expenses.map((x,i)=>`<div class="card"><span>${x.cat}</span><b style="color:#ef4444">${x.amount} ج.م <span onclick="delExp(${i})" style="cursor:pointer">❌</span></b></div>`).join('')}`;
}
function addExp(){let a=document.getElementById('ex-amount').value; if(!a) return; expenses.push({amount:a,cat:document.getElementById('ex-cat').value,date:new Date().toLocaleDateString()}); save(); renderExp();}
function delExp(i){expenses.splice(i,1); save(); renderExp();}

function renderDebt(){
  let forMe = debts.filter(d=>d.type==='لي' && d.status!=='مسدد').reduce((s,x)=>s+ +x.amount,0);
  let onMe = debts.filter(d=>d.type==='عليّ' && d.status!=='مسدد').reduce((s,x)=>s+ +x.amount,0);
  document.getElementById('daily-debt').innerHTML = `
  <div class="input-row" style="flex-wrap:wrap">
    <input id="d-name" placeholder="اسم الشخص" style="flex:1 1 100%">
    <input id="d-amount" type="number" placeholder="المبلغ">
    <select id="d-type"><option>لي</option><option>عليّ</option></select>
    <select id="d-status"><option>معلق</option><option>مسدد</option></select>
    <button class="btn" style="background:#f59e0b;flex:1 1 100%" onclick="addDebt()">إضافة دين</button>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:10px"><div class="stat" style="flex:1;background:#dcfce7">لك<br><b>${forMe} ج.م</b></div><div class="stat" style="flex:1;background:#fee2e2">عليك<br><b>${onMe} ج.م</b></div></div>
  ${debts.map((d,i)=>`<div class="card" style="background:${d.type==='لي'?'#f0fdf4':'#fef2f2'}"><div><b>${d.name}</b><br><small>${d.type} - ${d.status}</small></div><b>${d.amount} ج.م <span onclick="delDebt(${i})" style="cursor:pointer">❌</span></b></div>`).join('')}`;
}
function addDebt(){let n=document.getElementById('d-name').value, a=document.getElementById('d-amount').value; if(!n||!a) return; debts.push({name:n,amount:a,type:document.getElementById('d-type').value,status:document.getElementById('d-status').value}); save(); renderDebt();}
function delDebt(i){debts.splice(i,1); save(); renderDebt();}

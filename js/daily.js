// js/daily.js - النسخة النهائية

let incomes = JSON.parse(localStorage.getItem('incomes') || '[]');
let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
let catsIncome = JSON.parse(localStorage.getItem('catsIncome') || '["راتب","مبيعات","تحويل","أخرى"]');
let catsExp = JSON.parse(localStorage.getItem('catsExp') || '["أكل","إيجار","مواصلات","فواتير","أخرى"]');
let debts = JSON.parse(localStorage.getItem('debts_v2') || '[]');
// شكل الدين: {name, type:'لي'|'عليّ', total, paid, remaining, history:[]}

function saveDaily(){
  localStorage.setItem('incomes', JSON.stringify(incomes));
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('catsIncome', JSON.stringify(catsIncome));
  localStorage.setItem('catsExp', JSON.stringify(catsExp));
  localStorage.setItem('debts_v2', JSON.stringify(debts));
  if(typeof renderHome === 'function') renderHome();
}

// ================== الدخل ==================
function renderIncome(){
  let opts = catsIncome.map(c=>`<option>${c}</option>`).join('');
  document.getElementById('daily-income').innerHTML=`
  <div class="input-row">
    <input id="in-a" type="number" placeholder="المبلغ">
    <select id="in-c">${opts}</select>
    <button class="btn" onclick="addIncome()">+</button>
  </div>
  <div style="display:flex;gap:6px;margin-bottom:10px">
    <button class="btn-small" onclick="addCat('income')">+ فئة</button>
    <button class="btn-small" onclick="manageCats('income')">⚙️ إدارة</button>
  </div>
  <b>الإجمالي: ${incomes.reduce((s,x)=>s+ +x.amount,0)} ج.م</b>
  ${incomes.map((x,i)=>`<div class="card"><span>${x.cat} - ${x.date}</span><b style="color:#10b981">${x.amount} ج.م <span onclick="delI(${i})" style="cursor:pointer">❌</span></b></div>`).join('')}`;
}
function addIncome(){ let a=document.getElementById('in-a').value; if(!a) return; incomes.push({amount:a,cat:document.getElementById('in-c').value,date:new Date().toLocaleDateString('ar-EG')}); saveDaily(); renderIncome(); }
function delI(i){ incomes.splice(i,1); saveDaily(); renderIncome(); }

// ================== المصاريف ==================
function renderExp(){
  let opts = catsExp.map(c=>`<option>${c}</option>`).join('');
  document.getElementById('daily-exp').innerHTML=`
  <div class="input-row">
    <input id="ex-a" type="number" placeholder="المبلغ">
    <select id="ex-c">${opts}</select>
    <button class="btn" style="background:#ef4444" onclick="addExp()">+</button>
  </div>
  <div style="display:flex;gap:6px;margin-bottom:10px">
    <button class="btn-small" onclick="addCat('exp')">+ فئة</button>
    <button class="btn-small" onclick="manageCats('exp')">⚙️ إدارة</button>
  </div>
  <b>الإجمالي: ${expenses.reduce((s,x)=>s+ +x.amount,0)} ج.م</b>
  ${expenses.map((x,i)=>`<div class="card"><span>${x.cat}</span><b style="color:#ef4444">${x.amount} ج.م <span onclick="delE(${i})" style="cursor:pointer">❌</span></b></div>`).join('')}`;
}
function addExp(){ let a=document.getElementById('ex-a').value; if(!a) return; expenses.push({amount:a,cat:document.getElementById('ex-c').value}); saveDaily(); renderExp(); }
function delE(i){ expenses.splice(i,1); saveDaily(); renderExp(); }

// ================== إدارة الفئات ==================
function addCat(type){
  let name=prompt('اكتب اسم الفئة الجديدة:'); if(!name) return;
  if(type==='income') catsIncome.push(name); else catsExp.push(name);
  saveDaily(); type==='income'?renderIncome():renderExp();
}
function manageCats(type){
  let list = type==='income'? catsIncome : catsExp;
  let html = list.map((c,i)=>`<div class="card"><span>${c}</span><div style="display:flex;gap:4px"><button class="btn-small" onclick="editCat('${type}',${i})">✏️ تعديل</button><button class="btn-small" style="background:#fee2e2;color:#b91c1c" onclick="deleteCat('${type}',${i})">🗑️ مسح</button></div></div>`).join('');
  document.getElementById(type==='income'?'daily-income':'daily-exp').innerHTML=`<div><b>إدارة فئات ${type==='income'?'الدخل':'المصاريف'}</b>${html}<button class="btn" style="width:100%;margin-top:10px;background:#334155" onclick="${type==='income'?'renderIncome()':'renderExp()'}">رجوع</button></div>`;
}
function editCat(type,i){ let oldName=type==='income'?catsIncome[i]:catsExp[i]; let newName=prompt('عدل اسم الفئة:',oldName); if(!newName) return; if(type==='income') catsIncome[i]=newName; else catsExp[i]=newName; saveDaily(); type==='income'?renderIncome():renderExp(); }
function deleteCat(type,i){ if(!confirm('تمسح الفئة دي؟')) return; if(type==='income') catsIncome.splice(i,1); else catsExp.splice(i,1); saveDaily(); type==='income'?renderIncome():renderExp(); }

// ================== الديون - نظام كشف حساب ==================
function renderDebt(){
  let forMe = debts.filter(d=>d.type==='لي').reduce((s,x)=>s+x.remaining,0);
  let onMe = debts.filter(d=>d.type==='عليّ').reduce((s,x)=>s+x.remaining,0);
  document.getElementById('daily-debt').innerHTML=`
  <div class="input-row">
    <input id="d-n" placeholder="اسم الشخص (مثال: عمر)" style="flex:1 1 100%">
    <input id="d-a" type="number" placeholder="المبلغ" style="flex:1">
    <select id="d-t" style="flex:1"><option value="عليّ">عليّ - واخد منه</option><option value="لي">لي - مسلفه</option></select>
    <select id="d-kind" style="flex:1"><option value="دين">دين جديد</option><option value="سداد">سداد جزء</option></select>
    <button class="btn" style="background:#f59e0b;width:100%;margin-top:4px" onclick="addDebt()">حفظ العملية</button>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:12px">
    <div class="stat" style="flex:1;background:#dcfce7">لك: ${forMe} ج.م</div>
    <div class="stat" style="flex:1;background:#fee2e2">عليك: ${onMe} ج.م</div>
  </div>
  ${debts.length===0?'<small style="color:#94a3b8">لسه مفيش ديون متسجلة</small>':''}
  ${debts.map((d,i)=>`
    <div class="card" style="flex-direction:column;align-items:stretch;background:${d.type==='لي'?'#f0fdf4':'#fef2f2'};border-right:5px solid ${d.remaining>0?'#f59e0b':'#10b981'}">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><b style="font-size:15px">${d.name}</b> <small>(${d.type})</small><br>
        <small>إجمالي: ${d.total} | مسدد: ${d.paid} | <b style="color:${d.remaining>0?'#b45309':'#047857'}">الباقي: ${d.remaining} ج.م</b></small></div>
        <div style="display:flex;gap:4px"><button class="btn-small" style="background:#fffbeb" onclick="payDebt(${i})">💵 سداد</button><span onclick="delD(${i})" style="cursor:pointer">❌</span></div>
      </div>
      <div style="margin-top:6px;font-size:11px;color:#64748b;border-top:1px dashed #e2e8f0;padding-top:6px">
        ${d.history.slice(-3).reverse().map(h=>`• ${h.kind} ${h.amount} ج.م - ${h.date}`).join('<br>')}
      </div>
    </div>
  `).join('')}`;
}

function addDebt(){
  let name = document.getElementById('d-n').value.trim();
  let amount = parseFloat(document.getElementById('d-a').value);
  let type = document.getElementById('d-t').value;
  let kind = document.getElementById('d-kind').value;
  if(!name ||!amount) return alert('اكتب الاسم والمبلغ');

  let person = debts.find(d => d.name.toLowerCase() === name.toLowerCase() && d.type === type);

  if(!person){
    if(kind === 'سداد') return alert('ماينفعش تسجل سداد لـ '+name+' وهو مش عليه دين من النوع ده');
    debts.push({
      name: name, type: type, total: amount, paid: 0, remaining: amount,
      history: [{amount: amount, kind: 'دين', date: new Date().toLocaleDateString('ar-EG')}]
    });
  } else {
    if(kind === 'دين'){
      person.total += amount;
      person.remaining += amount;
      person.history.push({amount: amount, kind: 'دين جديد', date: new Date().toLocaleDateString('ar-EG')});
    } else {
      person.paid += amount;
      person.remaining -= amount;
      if(person.remaining < 0) person.remaining = 0;
      person.history.push({amount: amount, kind: 'سداد', date: new Date().toLocaleDateString('ar-EG')});
      if(person.remaining === 0) setTimeout(()=>alert(`✅ حساب ${person.name} اتقفل - الباقي صفر`),100);
    }
  }
  saveDaily(); renderDebt();
  document.getElementById('d-n').value=''; document.getElementById('d-a').value='';
}

function payDebt(i){
  let amount = prompt(`هتسدد كام لـ ${debts[i].name} ؟ الباقي ${debts[i].remaining} ج.م`);
  if(!amount) return;
  amount = parseFloat(amount);
  if(isNaN(amount)) return;
  debts[i].paid += amount;
  debts[i].remaining -= amount;
  if(debts[i].remaining < 0) debts[i].remaining = 0;
  debts[i].history.push({amount: amount, kind: 'سداد', date: new Date().toLocaleDateString('ar-EG')});
  saveDaily(); renderDebt();
}

function delD(i){ if(confirm(`تمسح حساب ${debts[i].name} كله؟`)){ debts.splice(i,1); saveDaily(); renderDebt(); } }

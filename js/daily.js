let incomes=JSON.parse(localStorage.getItem('incomes')||'[]');
let expenses=JSON.parse(localStorage.getItem('expenses')||'[]');
let debts=JSON.parse(localStorage.getItem('debts')||'[]');
let catsIncome=JSON.parse(localStorage.getItem('catsIncome')||'["راتب","مبيعات","تحويل","أخرى"]');
let catsExp=JSON.parse(localStorage.getItem('catsExp')||'["أكل","إيجار","مواصلات","فواتير","أخرى"]');

function saveDaily(){localStorage.setItem('incomes',JSON.stringify(incomes));localStorage.setItem('expenses',JSON.stringify(expenses));localStorage.setItem('debts',JSON.stringify(debts));localStorage.setItem('catsIncome',JSON.stringify(catsIncome));localStorage.setItem('catsExp',JSON.stringify(catsExp));}

function renderIncome(){
 let opts=catsIncome.map(c=>`<option>${c}</option>`).join('');
 document.getElementById('daily-income').innerHTML=`<div class="input-row"><input id="in-a" type="number" placeholder="المبلغ"><select id="in-c">${opts}</select><button class="btn" onclick="addIncome()">+</button></div><div style="display:flex;gap:6px;margin-bottom:8px"><button class="btn-small" onclick="addCat('income')">+ فئة</button><button class="btn-small" onclick="manageCats('income')">⚙️ إدارة الفئات</button></div><b>الإجمالي: ${incomes.reduce((s,x)=>s+ +x.amount,0)} ج.م</b>${incomes.map((x,i)=>`<div class="card"><span>${x.cat} - ${x.date}</span><b>${x.amount} ج.م <span onclick="delI(${i})">❌</span></b></div>`).join('')}`;
}
function renderExp(){
 let opts=catsExp.map(c=>`<option>${c}</option>`).join('');
 document.getElementById('daily-exp').innerHTML=`<div class="input-row"><input id="ex-a" type="number" placeholder="المبلغ"><select id="ex-c">${opts}</select><button class="btn" style="background:#ef4444" onclick="addExp()">+</button></div><div style="display:flex;gap:6px;margin-bottom:8px"><button class="btn-small" onclick="addCat('exp')">+ فئة</button><button class="btn-small" onclick="manageCats('exp')">⚙️ إدارة الفئات</button></div><b>الإجمالي: ${expenses.reduce((s,x)=>s+ +x.amount,0)} ج.م</b>${expenses.map((x,i)=>`<div class="card"><span>${x.cat}</span><b>${x.amount} ج.م <span onclick="delE(${i})">❌</span></b></div>`).join('')}`;
}
function addCat(type){
 let name=prompt('اسم الفئة الجديدة:'); if(!name) return;
 if(type==='income') catsIncome.push(name); else catsExp.push(name);
 saveDaily(); type==='income'?renderIncome():renderExp();
}
function manageCats(type){
 let list=type==='income'?catsIncome:catsExp;
 let html=list.map((c,i)=>`<div class="card"><span>${c}</span><div><button class="btn-small" onclick="editCat('${type}',${i})">✏️</button><button class="btn-small" style="background:#fee2e2" onclick="deleteCat('${type}',${i})">🗑️</button></div></div>`).join('');
 document.getElementById(type==='income'?'daily-income':'daily-exp').innerHTML=`<b>إدارة فئات ${type==='income'?'الدخل':'المصاريف'}</b>${html}<button class="btn" style="width:100%;margin-top:10px;background:#334155" onclick="${type==='income'?'renderIncome()':'renderExp()'}">رجوع</button>`;
}
function editCat(type,i){let old=type==='income'?catsIncome[i]:catsExp[i];let ne=prompt('عدل الاسم:',old);if(!ne)return;if(type==='income')catsIncome[i]=ne;else catsExp[i]=ne;saveDaily();type==='income'?renderIncome():renderExp();}
function deleteCat(type,i){if(!confirm('تمسح الفئة؟'))return;if(type==='income')catsIncome.splice(i,1);else catsExp.splice(i,1);saveDaily();type==='income'?renderIncome():renderExp();}
function addIncome(){let a=document.getElementById('in-a').value;if(!a)return;incomes.push({amount:a,cat:document.getElementById('in-c').value,date:new Date().toLocaleDateString('ar-EG')});saveDaily();renderIncome();}
function delI(i){incomes.splice(i,1);saveDaily();renderIncome();}
function addExp(){let a=document.getElementById('ex-a').value;if(!a)return;expenses.push({amount:a,cat:document.getElementById('ex-c').value});saveDaily();renderExp();}
function delE(i){expenses.splice(i,1);saveDaily();renderExp();}
function renderDebt(){let forMe=debts.filter(d=>d.type==='لي'&&d.status!=='مسدد').reduce((s,x)=>s+ +x.amount,0);let onMe=debts.filter(d=>d.type==='عليّ'&&d.status!=='مسدد').reduce((s,x)=>s+ +x.amount,0);document.getElementById('daily-debt').innerHTML=`<div class="input-row"><input id="d-n" placeholder="الاسم"><input id="d-a" type="number" placeholder="المبلغ"><select id="d-t"><option>لي</option><option>عليّ</option></select><select id="d-s"><option>معلق</option><option>مسدد</option></select><button class="btn" style="background:#f59e0b;width:100%" onclick="addDebt()">إضافة</button></div><div style="display:flex;gap:8px;margin-bottom:8px"><div class="stat" style="flex:1;background:#dcfce7">لك ${forMe} ج.م</div><div class="stat" style="flex:1;background:#fee2e2">عليك ${onMe} ج.م</div></div>${debts.map((d,i)=>`<div class="card"><div><b>${d.name}</b><br><small>${d.type}-${d.status}</small></div><b>${d.amount} ج.م <span onclick="delD(${i})">❌</span></b></div>`).join('')}`;}
function addDebt(){let n=document.getElementById('d-n').value,a=document.getElementById('d-a').value;if(!n||!a)return;debts.push({name:n,amount:a,type:document.getElementById('d-t').value,status:document.getElementById('d-s').value});saveDaily();renderDebt();}
function delD(i){debts.splice(i,1);saveDaily();renderDebt();}

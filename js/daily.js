// js/daily.js - نسخة نهائية برو

let incomes = JSON.parse(localStorage.getItem('incomes') || '[]');
let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
let catsIncome = JSON.parse(localStorage.getItem('catsIncome') || '["راتب","مبيعات","تحويل","أخرى"]');
let catsExp = JSON.parse(localStorage.getItem('catsExp') || '["أكل","إيجار","مواصلات","فواتير","أخرى"]');
let debts = JSON.parse(localStorage.getItem('debts_v2') || '[]');

function saveDaily(){
  localStorage.setItem('incomes', JSON.stringify(incomes));
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('catsIncome', JSON.stringify(catsIncome));
  localStorage.setItem('catsExp', JSON.stringify(catsExp));
  localStorage.setItem('debts_v2', JSON.stringify(debts));
  if(typeof renderHome === 'function') renderHome();
}

function renderIncome(){
  let opts = catsIncome.map(c=>`<option>${c}</option>`).join('');
  document.getElementById('daily-income').innerHTML=`<div class="input-row"><input id="in-a" type="number" placeholder="المبلغ"><select id="in-c">${opts}</select><button class="btn" onclick="addIncome()">+</button></div><div style="display:flex;gap:6px;margin-bottom:10px"><button class="btn-small" onclick="addCat('income')">+ فئة</button><button class="btn-small" onclick="manageCats('income')">⚙️ إدارة</button></div><b>الإجمالي: ${incomes.reduce((s,x)=>s+ +x.amount,0)} ج.م</b>${incomes.map((x,i)=>`<div class="card"><span>${x.cat} - ${x.date}</span><b>${x.amount} ج.م <span onclick="delI(${i})">❌</span></b></div>`).join('')}`;
}
function addIncome(){ let a=document.getElementById('in-a').value; if(!a) return; incomes.push({amount:a,cat:document.getElementById('in-c').value,date:new Date().toLocaleDateString('ar-EG')}); saveDaily(); renderIncome(); }
function delI(i){ incomes.splice(i,1); saveDaily(); renderIncome(); }

function renderExp(){
  let opts = catsExp.map(c=>`<option>${c}</option>`).join('');
  document.getElementById('daily-exp').innerHTML=`<div class="input-row"><input id="ex-a" type="number" placeholder="المبلغ"><select id="ex-c">${opts}</select><button class="btn" style="background:#ef4444" onclick="addExp()">+</button></div><div style="display:flex;gap:6px;margin-bottom:10px"><button class="btn-small" onclick="addCat('exp')">+ فئة</button><button class="btn-small" onclick="manageCats('exp')">⚙️ إدارة</button></div><b>الإجمالي: ${expenses.reduce((s,x)=>s+ +x.amount,0)} ج.م</b>${expenses.map((x,i)=>`<div class="card"><span>${x.cat}</span><b>${x.amount} ج.م <span onclick="delE(${i})">❌</span></b></div>`).join('')}`;
}
function addExp(){ let a=document.getElementById('ex-a').value; if(!a) return; expenses.push({amount:a,cat:document.getElementById('ex-c').value}); saveDaily(); renderExp(); }
function delE(i){ expenses.splice(i,1); saveDaily(); renderExp(); }

function addCat(type){ let name=prompt('اسم الفئة الجديدة:'); if(!name) return; if(type==='income') catsIncome.push(name); else catsExp.push(name); saveDaily(); type==='income'?renderIncome():renderExp(); }
function manageCats(type){
  let list = type==='income'? catsIncome : catsExp;
  let html = list.map((c,i)=>`<div class="card"><span>${c}</span><div style="display:flex;gap:4px"><button class="btn-small" onclick="editCat('${type}',${i})">✏️</button><button class="btn-small" style="background:#fee2e2" onclick="deleteCat('${type}',${i})">🗑️</button></div></div>`).join('');
  document.getElementById(type==='income'?'daily-income':'daily-exp').innerHTML=`<div><b>إدارة فئات ${type==='income'?'الدخل':'المصاريف'}</b>${html}<button class="btn" style="width:100%;margin-top:10px;background:#334155" onclick="${type==='income'?'renderIncome()':'renderExp()'}">رجوع</button></div>`;
}
function editCat(type,i){ let oldName=type==='income'?catsIncome[i]:catsExp[i]; let newName=prompt('عدل الاسم:',oldName); if(!newName) return; if(type==='income') catsIncome[i]=newName; else catsExp[i]=newName; saveDaily(); type==='income'?renderIncome():renderExp(); }
function deleteCat(type,i){ if(!confirm('تمسح الفئة؟')) return; if(type==='income') catsIncome.splice(i,1); else catsExp.splice(i,1); saveDaily(); type==='income'?renderIncome():renderExp(); }

// ============ ديون برو - إدخال احترافي ============
function renderDebt(){
  let forMe = debts.filter(d=>d.type==='لي').reduce((s,x)=>s+x.remaining,0);
  let onMe = debts.filter(d=>d.type==='عليّ').reduce((s,x)=>s+x.remaining,0);
  document.getElementById('daily-debt').innerHTML=`
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:12px;margin-bottom:12px">
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button id="btn-mode-debt" class="btn" style="flex:1" onclick="setDebtMode('debt')">+ دين جديد</button>
      <button id="btn-mode-pay" class="btn-small" style="flex:1;padding:10px" onclick="setDebtMode('pay')">💵 تسديد</button>
    </div>
    <input id="d-n" placeholder="اسم الشخص" list="names-list" style="width:100%;margin-bottom:8px;padding:10px;border-radius:10px;border:1px solid #e2e8f0">
    <datalist id="names-list">${debts.map(d=>`<option value="${d.name}">`).join('')}</datalist>
    <div style="display:flex;gap:8px">
      <input id="d-a" type="number" placeholder="المبلغ" style="flex:1;padding:10px;border-radius:10px;border:1px solid #e2e8f0">
      <select id="d-t" style="flex:1;padding:10px;border-radius:10px"><option value="عليّ">عليّ (واخد)</option><option value="لي">لي (مسلف)</option></select>
    </div>
    <button id="d-action-btn" class="btn" style="width:100%;margin-top:10px;background:#0f172a" onclick="handleDebtAction()">حفظ الدين</button>
    <small id="d-hint" style="color:#64748b;display:block;margin-top:6px;text-align:center">اكتب اسم موجود وهيظهرلك الباقي أوتوماتيك</small>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
    <div class="stat" style="background:#ecfdf5;text-align:center;border:1px solid #bbf7d0"><small>ليك</small><br><b>${forMe}</b></div>
    <div class="stat" style="background:#fef2f2;text-align:center;border:1px solid #fecaca"><small>عليك</small><br><b>${onMe}</b></div>
  </div>
  ${debts.map((d,i)=>{
    let percent = d.total>0? Math.min(100,Math.round((d.paid/d.total)*100)) : 0;
    return `<div class="card" onclick="openLedger(${i})" style="flex-direction:column;padding:0;overflow:hidden;cursor:pointer"><div style="padding:12px;width:100%;display:flex;justify-content:space-between"><div><b>${d.name}</b> <small style="background:${d.type==='لي'?'#dcfce7':'#fee2e2'};padding:2px 6px;border-radius:99px">${d.type}</small><br><small>الباقي <b>${d.remaining} ج.م</b> من ${d.total}</small></div><b>${percent}%</b></div><div style="height:5px;background:#f1f5f9;width:100%"><div style="height:100%;width:${percent}%;background:${percent===100?'#10b981':'#f59e0b'}"></div></div></div>`
  }).join('')}
  <div id="ledger-modal" class="hidden" style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:999;padding:20px;display:flex;align-items:center;justify-content:center"><div id="ledger-content" style="background:#fff;width:100%;max-width:380px;border-radius:20px;padding:16px;max-height:80vh;overflow:auto"></div></div>
  `;
  // تحديث الهينت لما يكتب اسم موجود
  setTimeout(()=>{
    const input = document.getElementById('d-n');
    if(input){
      input.addEventListener('input', ()=>{
        let p = debts.find(d=>d.name.toLowerCase()===input.value.toLowerCase());
        document.getElementById('d-hint').innerHTML = p? `📌 ${p.name} عليه باقي <b>${p.remaining} ج.م</b> - دوس تسديد` : 'اسم جديد - هيتعمله حساب جديد';
      });
    }
  },100);
}

let debtMode = 'debt';
function setDebtMode(mode){
  debtMode=mode;
  document.getElementById('btn-mode-debt').className = mode==='debt'? 'btn' : 'btn-small';
  document.getElementById('btn-mode-pay').className = mode==='pay'? 'btn' : 'btn-small';
  document.getElementById('btn-mode-debt').style.flex='1'; document.getElementById('btn-mode-pay').style.flex='1';
  document.getElementById('btn-mode-debt').style.padding='10px'; document.getElementById('btn-mode-pay').style.padding='10px';
  document.getElementById('d-action-btn').innerText = mode==='debt'? 'حفظ الدين الجديد' : 'تأكيد السداد';
  document.getElementById('d-action-btn').style.background = mode==='debt'? '#0f172a' : '#10b981';
}

function handleDebtAction(){
  let name = document.getElementById('d-n').value.trim();
  let amount = parseFloat(document.getElementById('d-a').value);
  let type = document.getElementById('d-t').value;
  if(!name||!amount) return alert('اكتب الاسم والمبلغ');
  let person = debts.find(d=>d.name.toLowerCase()===name.toLowerCase() && d.type===type);
  if(debtMode==='debt'){
    if(!person){ debts.push({name,type,total:amount,paid:0,remaining:amount,history:[{amount,kind:'دين',date:new Date().toLocaleDateString('ar-EG')}]}); }
    else { person.total+=amount; person.remaining+=amount; person.history.push({amount,kind:'دين جديد',date:new Date().toLocaleDateString('ar-EG')}); }
  } else {
    if(!person) return alert('الاسم ده مش موجود في '+type);
    person.paid+=amount; person.remaining-=amount; if(person.remaining<0) person.remaining=0;
    person.history.push({amount,kind:'سداد',date:new Date().toLocaleDateString('ar-EG')});
    if(person.remaining===0) setTimeout(()=>alert('✅ حساب '+person.name+' خلص'),100);
  }
  saveDaily(); renderDebt(); document.getElementById('d-n').value=''; document.getElementById('d-a').value='';
}

function openLedger(i){
  let d=debts[i];
  document.getElementById('ledger-modal').classList.remove('hidden');
  document.getElementById('ledger-content').innerHTML=`
    <div style="display:flex;justify-content:space-between"><h3 style="margin:0">📒 ${d.name}</h3><span onclick="document.getElementById('ledger-modal').classList.add('hidden')" style="cursor:pointer">✕</span></div>
    <div style="background:#f8fafc;padding:10px;border-radius:12px;margin:10px 0;text-align:center">الباقي <b>${d.remaining}</b> | ${d.paid}/${d.total}</div>
    <div style="display:flex;gap:6px;margin-bottom:10px"><input id="quick-amount" type="number" placeholder="مبلغ" style="flex:1;padding:8px;border-radius:8px;border:1px solid #e2e8f0"><button class="btn" onclick="quickPay(${i})">سداد</button><button class="btn" style="background:#334155" onclick="quickDebt(${i})">+ دين</button></div>
    <div>${d.history.map((h,hi)=>`<div class="card" style="padding:8px;font-size:13px"><span>${h.date} - ${h.kind} <b>${h.amount}</b></span><div><span onclick="editHistory(${i},${hi})">✏️</span> <span onclick="delHistory(${i},${hi})">🗑️</span></div></div>`).slice().reverse().join('')}</div>
  `;
}
function quickPay(i){ let a=parseFloat(document.getElementById('quick-amount').value); if(!a) return; debts[i].paid+=a; debts[i].remaining-=a; if(debts[i].remaining<0) debts[i].remaining=0; debts[i].history.push({amount:a,kind:'سداد',date:new Date().toLocaleDateString('ar-EG')}); saveDaily(); openLedger(i); renderDebt(); }
function quickDebt(i){ let a=parseFloat(document.getElementById('quick-amount').value); if(!a) return; debts[i].total+=a; debts[i].remaining+=a; debts[i].history.push({amount:a,kind:'دين جديد',date:new Date().toLocaleDateString('ar-EG')}); saveDaily(); openLedger(i); renderDebt(); }
function editHistory(pi,hi){ let ne=prompt('المبلغ الجديد:',debts[pi].history[hi].amount); if(!ne) return; let diff=parseFloat(ne)-debts[pi].history[hi].amount; debts[pi].history[hi].amount=parseFloat(ne); if(debts[pi].history[hi].kind.includes('سداد')){debts[pi].paid+=diff; debts[pi].remaining-=diff;} else {debts[pi].total+=diff; debts[pi].remaining+=diff;} saveDaily(); openLedger(pi); renderDebt(); }
function delHistory(pi,hi){ if(!confirm('تمسح؟')) return; let h=debts[pi].history[hi]; if(h.kind.includes('سداد')){debts[pi].paid-=h.amount; debts[pi].remaining+=h.amount;} else {debts[pi].total-=h.amount; debts[pi].remaining-=h.amount;} debts[pi].history.splice(hi,1); saveDaily(); openLedger(pi); renderDebt(); }

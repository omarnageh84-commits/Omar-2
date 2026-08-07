// js/daily.js - اليومية الاحترافية
let incomeData = JSON.parse(localStorage.getItem('daily_income_pro') || '[]');
let expData = JSON.parse(localStorage.getItem('daily_exp_pro') || '[]');
let debtsData = JSON.parse(localStorage.getItem('daily_debt_pro') || '[]');

function saveDaily(){
  localStorage.setItem('daily_income_pro', JSON.stringify(incomeData));
  localStorage.setItem('daily_exp_pro', JSON.stringify(expData));
  localStorage.setItem('daily_debt_pro', JSON.stringify(debtsData));
}

// --- INCOME ---
function renderIncome(){
  let totalToday = incomeData.filter(d=> d.date===todayKey()).reduce((s,x)=>s+x.amount,0);
  let totalMonth = incomeData.reduce((s,x)=>s+x.amount,0);
  
  document.getElementById('daily-income').innerHTML=`
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
    <div style="background:#000;color:#fff;border-radius:14px;padding:10px"><div style="font-size:8px;opacity:.6">اليوم</div><div style="font-size:16px;font-weight:900;font-family:monospace">${totalToday.toLocaleString('en-US')} ج</div></div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:10px"><div style="font-size:8px;color:#16a34a">الشهر</div><div style="font-size:16px;font-weight:900;color:#15803d;font-family:monospace">${totalMonth.toLocaleString('en-US')} ج</div></div>
  </div>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:8px;display:flex;gap:6px;margin-bottom:8px;position:sticky;top:0;z-index:5">
    <input id="incAmount" type="text" inputmode="decimal" placeholder="المبلغ - اكتب 1500" style="flex:1;background:#f8fafc;border:0;border-radius:99px;padding:10px 12px;font-size:13px;font-weight:700;outline:none;color:#000">
    <input id="incNote" type="text" placeholder="ملاحظة" style="width:90px;background:#f8fafc;border:0;border-radius:99px;padding:10px 10px;font-size:11px;outline:none;color:#000">
    <button onclick="addIncome()" style="background:#000;color:#fff;border:0;width:40px;height:40px;border-radius:50%;font-weight:900">+</button>
  </div>

  <div style="display:flex;flex-direction:column;gap:5px;max-height:380px;overflow:auto">
    ${incomeData.slice().reverse().map((r,i)=>`
      <div style="background:#fff;border:1px solid #f1f5f9;border-radius:12px;padding:8px 10px;display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:12px;font-weight:800;font-family:monospace">${r.amount.toLocaleString('en-US')} ج</div><div style="font-size:8px;color:#94a3b8">${r.note||'دخل'} • ${r.date}</div></div>
        <div style="display:flex;gap:8px;align-items:center"><span style="font-size:8px;background:#f0fdf4;color:#16a34a;padding:2px 6px;border-radius:99px">دخل</span><span onclick="delIncome(${incomeData.length-1-i})" style="color:#ef4444;font-size:12px;cursor:pointer">✕</span></div>
      </div>
    `).join('') || `<div style="text-align:center;padding:30px;color:#cbd5e1;font-size:11px">لا يوجد دخل اليوم</div>`}
  </div>
  `;
}
function addIncome(){
  let a=document.getElementById('incAmount').value.replace(',','.'), n=document.getElementById('incNote').value;
  let amt=parseFloat(a); if(!amt) return;
  incomeData.push({amount:amt, note:n, date:todayKey(), id:Date.now()}); saveDaily(); renderIncome();
}
function delIncome(idx){ incomeData.splice(idx,1); saveDaily(); renderIncome(); }

// --- EXPENSE ---
function renderExp(){
  let totalToday = expData.filter(d=> d.date===todayKey()).reduce((s,x)=>s+x.amount,0);
  document.getElementById('daily-exp').innerHTML=`
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:14px;padding:10px;margin-bottom:8px;display:flex;justify-content:space-between"><div><div style="font-size:8px;color:#dc2626">مصروف اليوم</div><div style="font-size:16px;font-weight:900;color:#dc2626;font-family:monospace">${totalToday.toLocaleString('en-US')} ج</div></div><div style="font-size:20px">💸</div></div>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:8px;display:flex;gap:6px;margin-bottom:8px">
    <input id="expAmount" type="text" inputmode="decimal" placeholder="المبلغ" style="flex:1;background:#f8fafc;border:0;border-radius:99px;padding:10px 12px;font-size:13px;font-weight:700;outline:none;color:#000">
    <input id="expNote" type="text" placeholder="ليه؟" style="width:90px;background:#f8fafc;border:0;border-radius:99px;padding:10px 10px;font-size:11px;outline:none;color:#000">
    <button onclick="addExp()" style="background:#dc2626;color:#fff;border:0;width:40px;height:40px;border-radius:50%;font-weight:900">+</button>
  </div>
  <div style="display:flex;flex-direction:column;gap:5px">${expData.slice().reverse().map((r,i)=>`<div style="background:#fff;border:1px solid #f1f5f9;border-radius:12px;padding:8px 10px;display:flex;justify-content:space-between"><div><div style="font-size:12px;font-weight:800">${r.amount.toLocaleString('en-US')} ج</div><div style="font-size:8px;color:#94a3b8">${r.note||'مصروف'} • ${r.date}</div></div><span onclick="delExp(${expData.length-1-i})" style="color:#ef4444;cursor:pointer">✕</span></div>`).join('')}</div>
  `;
}
function addExp(){ let a=document.getElementById('expAmount').value, n=document.getElementById('expNote').value; let amt=parseFloat(a); if(!amt) return; expData.push({amount:amt, note:n, date:todayKey(), id:Date.now()}); saveDaily(); renderExp(); }
function delExp(idx){ expData.splice(idx,1); saveDaily(); renderExp(); }

// --- DEBT (يدوي - انت اللي تحط 5000) ---
function renderDebt(){
  let total = debtsData.reduce((s,x)=>s+(x.type==='عليّ'? x.remaining: -x.remaining),0);
  document.getElementById('daily-debt').innerHTML=`
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
    <div><div style="font-size:8px;color:#b45309">صافي ديونك</div><div style="font-size:16px;font-weight:900;font-family:monospace;color:${total>=0?'#dc2626':'#16a34a'}">${total.toLocaleString('en-US')} ج ${total>=0?'عليك':'ليك'}</div></div>
    <div style="font-size:8px;background:#000;color:#fff;padding:4px 8px;border-radius:99px">يدوي 100%</div>
  </div>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:8px;display:grid;grid-template-columns:1fr 1fr 60px;gap:4px;margin-bottom:8px">
    <input id="debtName" placeholder="الاسم" style="background:#f8fafc;border:0;border-radius:8px;padding:8px;font-size:11px;color:#000;outline:none">
    <input id="debtAmount" type="number" placeholder="5000" style="background:#fff1f2;border:1.5px solid #fecaca;border-radius:8px;padding:8px;font-size:12px;font-weight:800;color:#dc2626;outline:none;text-align:center">
    <select id="debtType" style="border:0;background:#f8fafc;border-radius:8px;font-size:10px;color:#000"><option value="عليّ">عليّ</option><option value="ليّا">ليّا</option></select>
    <button onclick="addDebt()" style="grid-column:span 3;background:#000;color:#fff;border:0;padding:8px;border-radius:8px;font-size:11px;font-weight:700">+ إضافة دين</button>
  </div>

  <div style="display:flex;flex-direction:column;gap:5px">${debtsData.slice().reverse().map((r,i)=>`<div style="background:#fff;border:1px solid #f1f5f9;border-radius:12px;padding:8px 10px;display:flex;justify-content:space-between"><div><div style="font-size:11px;font-weight:700">${r.name}</div><div style="font-size:8px;color:#94a3b8">${r.type} • ${r.remaining.toLocaleString('en-US')} ج</div></div><span onclick="delDebt(${debtsData.length-1-i})" style="color:#ef4444">✕</span></div>`).join('')}</div>
  `;
}
function addDebt(){
  let name=document.getElementById('debtName').value, amt=parseFloat(document.getElementById('debtAmount').value), type=document.getElementById('debtType').value;
  if(!name||!amt) return;
  debtsData.push({name, remaining:amt, type, id:Date.now()}); saveDaily(); renderDebt();
  // عشان خانة الصيدلية تفضل يدوي، مش بنربطها
}
function delDebt(idx){ debtsData.splice(idx,1); saveDaily(); renderDebt(); }

function todayKey(){ return new Date().toISOString().slice(0,10); }

// js/daily.js - نظام اليومية الاحترافي - شغال 100%
let store = JSON.parse(localStorage.getItem('daily_v4') || '{"income":[],"exp":[],"debt":[]}');
let view = localStorage.getItem('daily_view') || 'today';

function save(){ localStorage.setItem('daily_v4', JSON.stringify(store)); }
function today(){ return new Date().toISOString().slice(0,10); }
function saveView(v){ view=v; localStorage.setItem('daily_view',v); renderAll(); }

function getStats(){
  let inc = store.income.reduce((s,x)=>s+x.amount,0);
  let exp = store.exp.reduce((s,x)=>s+x.amount,0);
  let debtOn = store.debt.filter(d=>d.type==='عليّ').reduce((s,x)=>s+x.amount,0);
  let debtFor = store.debt.filter(d=>d.type==='ليّا').reduce((s,x)=>s+x.amount,0);
  return {inc, exp, net: inc-exp, debtOn, debtFor, safi: (inc-exp)-debtOn+debtFor};
}

function filterDate(arr){
  if(view==='all') return arr;
  if(view==='today') return arr.filter(x=>x.date===today());
  if(view==='week'){ let d=new Date(); d.setDate(d.getDate()-7); return arr.filter(x=> new Date(x.date) >= d); }
  if(view==='month'){ let m=new Date().getMonth(), y=new Date().getFullYear(); return arr.filter(x=>{ let dd=new Date(x.date); return dd.getMonth()===m && dd.getFullYear()===y; }); }
  return arr;
}

// ===== الدخل =====
function renderIncome(){
  let s=getStats(); let list=filterDate(store.income);
  let el=document.getElementById('daily-income'); if(!el) return;
  el.innerHTML=`
  <div style="zoom:0.88">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:6px">
      <div style="background:#000;color:#fff;border-radius:10px;padding:8px;text-align:center"><div style="font-size:7px;opacity:.6">دخل</div><div style="font-size:12px;font-weight:900;font-family:monospace">${s.inc.toLocaleString('en-US')}</div></div>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:8px;text-align:center"><div style="font-size:7px;color:#dc2626">مصروف</div><div style="font-size:12px;font-weight:900;color:#dc2626;font-family:monospace">${s.exp.toLocaleString('en-US')}</div></div>
      <div style="background:${s.safi>=0?'#f0fdf4':'#fef2f2'};border:1px solid ${s.safi>=0?'#bbf7d0':'#fecaca'};border-radius:10px;padding:8px;text-align:center"><div style="font-size:7px">الصافي</div><div style="font-size:12px;font-weight:900;color:${s.safi>=0?'#16a34a':'#dc2626'};font-family:monospace">${s.safi.toLocaleString('en-US')}</div></div>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:6px;display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <span style="font-size:9px;font-weight:700">📊 ${view==='today'?'اليوم':view==='week'?'أسبوع':view==='month'?'الشهر':'الكل'} - ${list.length} عملية - ${list.reduce((a,b)=>a+b.amount,0).toLocaleString('en-US')} ج</span>
      <select onchange="saveView(this.value)" style="font-size:8px;border:1px solid #e5e7eb;border-radius:99px;padding:2px 6px;background:#fff;color:#000"><option value="today" ${view==='today'?'selected':''}>اليوم</option><option value="week" ${view==='week'?'selected':''}>أسبوع</option><option value="month" ${view==='month'?'selected':''}>شهر</option><option value="all" ${view==='all'?'selected':''}>الكل</option></select>
    </div>
    <div style="background:#fff;border:2px solid #000;border-radius:12px;padding:8px;margin-bottom:8px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
        <input id="incAmt" type="text" inputmode="decimal" placeholder="المبلغ - 1500" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;font-size:14px;font-weight:900;text-align:center;font-family:monospace;outline:none;color:#000">
        <select id="incCat" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;font-size:11px;color:#000"><option>💊 مبيعات</option><option>💉 تركيبات</option><option>📦 نواقص</option><option>💰 سلفة</option><option>🔁 مرتجع</option></select>
      </div>
      <div style="display:flex;gap:6px"><input id="incNote" placeholder="ملاحظة..." style="flex:1;background:#f8fafc;border:0;border-radius:99px;padding:8px 12px;font-size:11px;outline:none;color:#000"><button onclick="addInc()" style="background:#000;color:#fff;border:0;padding:8px 16px;border-radius:99px;font-size:11px;font-weight:700;cursor:pointer">حفظ +</button></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;max-height:300px;overflow:auto">
      ${list.slice().reverse().map(r=>`<div style="background:#fff;border:1px solid #f1f5f9;border-right:3px solid #22c55e;border-radius:10px;padding:8px;display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:11px;font-weight:800;font-family:monospace">${r.amount.toLocaleString('en-US')} ج</div><div style="font-size:7px;color:#64748b">${r.cat} • ${r.note||''} • ${r.date}</div></div><div style="display:flex;gap:8px"><span style="font-size:7px;color:#94a3b8">${r.time||''}</span><span onclick="delItem('income',${store.income.indexOf(r)})" style="cursor:pointer;color:#ef4444;font-size:12px">✕</span></div></div>`).join('') || '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:10px">لا يوجد دخل</div>'}
    </div>
  </div>`;
}
function addInc(){
  let amt=parseFloat(document.getElementById('incAmt').value);
  let cat=document.getElementById('incCat').value;
  let note=document.getElementById('incNote').value;
  if(!amt) return alert('اكتب المبلغ');
  store.income.push({amount:amt, cat, note, date:today(), time:new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}), id:Date.now()});
  save(); renderIncome();
}

// ===== المصاريف =====
function renderExp(){
  let s=getStats(); let list=filterDate(store.exp);
  let el=document.getElementById('daily-exp'); if(!el) return;
  el.innerHTML=`
  <div style="zoom:0.88">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px">
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:8px;text-align:center"><div style="font-size:7px;color:#dc2626">مصروف ${view}</div><div style="font-size:13px;font-weight:900;color:#dc2626;font-family:monospace">${list.reduce((a,b)=>a+b.amount,0).toLocaleString('en-US')} ج</div></div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:8px;text-align:center"><div style="font-size:7px">العمليات</div><div style="font-size:13px;font-weight:900">${list.length}</div></div>
    </div>
    <div style="background:#fff;border:2px solid #dc2626;border-radius:12px;padding:8px;margin-bottom:8px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
        <input id="expAmt" type="text" inputmode="decimal" placeholder="0.00" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:10px;font-size:14px;font-weight:900;text-align:center;font-family:monospace;color:#dc2626;outline:none">
        <select id="expCat" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;font-size:11px;color:#000"><option>🍔 أكل</option><option>🚕 مواصلات</option><option>🏠 إيجار</option><option>💊 مشتريات</option><option>📱 رصيد</option><option>☕ قهوة</option><option>💡 فواتير</option><option>👥 عمالة</option></select>
      </div>
      <div style="display:flex;gap:6px"><input id="expNote" placeholder="ليه؟" style="flex:1;background:#f8fafc;border:0;border-radius:99px;padding:8px 12px;font-size:11px"><button onclick="addExp()" style="background:#dc2626;color:#fff;border:0;padding:8px 16px;border-radius:99px;font-size:11px;font-weight:700;cursor:pointer">حفظ +</button></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;max-height:300px;overflow:auto">${list.slice().reverse().map(r=>`<div style="background:#fff;border:1px solid #f1f5f9;border-right:3px solid #ef4444;border-radius:10px;padding:8px;display:flex;justify-content:space-between"><div><div style="font-size:11px;font-weight:700;font-family:monospace">${r.amount.toLocaleString('en-US')} ج</div><div style="font-size:7px;color:#64748b">${r.cat} • ${r.note||''} • ${r.date}</div></div><span onclick="delItem('exp',${store.exp.indexOf(r)})" style="cursor:pointer;color:#ef4444">✕</span></div>`).join('') || '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:10px">لا يوجد مصاريف</div>'}</div>
  </div>`;
}
function addExp(){
  let amt=parseFloat(document.getElementById('expAmt').value);
  let cat=document.getElementById('expCat').value;
  let note=document.getElementById('expNote').value;
  if(!amt) return alert('اكتب المبلغ');
  store.exp.push({amount:amt, cat, note, date:today(), id:Date.now()});
  save(); renderExp();
}

// ===== الديون - يدوي 100% =====
function renderDebt(){
  let s=getStats(); let list=filterDate(store.debt);
  let el=document.getElementById('daily-debt'); if(!el) return;
  el.innerHTML=`
  <div style="zoom:0.88">
    <div style="background:#000;color:#fff;border-radius:12px;padding:10px;display:grid;grid-template-columns:1fr 1fr;text-align:center;gap:8px;margin-bottom:6px">
      <div><div style="font-size:7px;opacity:.6">عليك</div><div style="font-size:13px;font-weight:900;color:#fca5a5;font-family:monospace">${s.debtOn.toLocaleString('en-US')} ج</div></div>
      <div><div style="font-size:7px;opacity:.6">ليك</div><div style="font-size:13px;font-weight:900;color:#86efac;font-family:monospace">${s.debtFor.toLocaleString('en-US')} ج</div></div>
    </div>
    <div style="background:#fff;border:2px solid #000;border-radius:12px;padding:8px;margin-bottom:8px">
      <div style="display:grid;grid-template-columns:1fr 90px;gap:6px;margin-bottom:6px">
        <input id="debtName" placeholder="اسم العميل / الصيدلية" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;font-size:11px;outline:none;color:#000">
        <input id="debtAmt" type="number" placeholder="5000" style="background:#fff1f2;border:2px solid #ef4444;border-radius:10px;padding:10px;font-size:13px;font-weight:900;text-align:center;color:#dc2626;outline:none">
      </div>
      <div style="display:flex;gap:6px"><select id="debtType" style="flex:1;background:#f8fafc;border:0;border-radius:99px;padding:8px;font-size:11px;color:#000"><option value="عليّ">🔴 عليّ - هدفع</option><option value="ليّا">🟢 ليّا - هاخد</option></select><button onclick="addDebt()" style="background:#000;color:#fff;border:0;padding:8px 16px;border-radius:99px;font-size:11px;font-weight:700;cursor:pointer">حفظ يدوي</button></div>
      <div style="font-size:7px;color:#16a34a;text-align:center;margin-top:4px">✅ يدوي 100% - انت اللي بتحط 5000 بإيدك</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;max-height:300px;overflow:auto">${list.slice().reverse().map(r=>`<div style="background:${r.type==='عليّ'?'#fef2f2':'#f0fdf4'};border:1px solid ${r.type==='عليّ'?'#fecaca':'#bbf7d0'};border-radius:10px;padding:8px;display:flex;justify-content:space-between"><div><div style="font-size:11px;font-weight:700">${r.name}</div><div style="font-size:7px">${r.type} • ${r.amount.toLocaleString('en-US')} ج • ${r.date}</div></div><span onclick="delItem('debt',${store.debt.indexOf(r)})" style="cursor:pointer;color:#ef4444">✕</span></div>`).join('') || '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:10px">لا يوجد ديون</div>'}</div>
  </div>`;
}
function addDebt(){
  let name=document.getElementById('debtName').value.trim();
  let amt=parseFloat(document.getElementById('debtAmt').value);
  let type=document.getElementById('debtType').value;
  if(!name||!amt) return alert('اكتب الاسم والمبلغ - 5000');
  store.debt.push({name, amount:amt, type, date:today(), id:Date.now()});
  save(); renderDebt();
}

function delItem(t,i){ if(!confirm('تمسح؟')) return; store[t].splice(i,1); save(); renderAll(); }
function renderAll(){ renderIncome(); renderExp(); renderDebt(); }

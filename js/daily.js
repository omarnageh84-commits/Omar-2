// js/daily.js - نظام المصاريف الاحترافي المترابط
let dailyStore = JSON.parse(localStorage.getItem('daily_pro_v3') || '{"income":[],"exp":[],"debt":[]}');
let dailyView = localStorage.getItem('daily_view') || 'all'; // all, today, week, month
let dailyCat = {
  income: ['💊 مبيعات','💉 تركيبات','📦 نواقص','💰 سلفة','🔁 مرتجع'],
  exp: ['🍔 أكل','🚕 مواصلات','🏠 إيجار','💊 مشتريات','📱 رصيد','☕ قهوة','💡 فواتير','👥 عمالة'],
  debt: ['صيدلية','عميل','مورد']
};

function saveDaily(){ localStorage.setItem('daily_pro_v3', JSON.stringify(dailyStore)); }

// حسابات مترابطة
function calcStats(){
  let inc = dailyStore.income.reduce((s,x)=>s+x.amount,0);
  let exp = dailyStore.exp.reduce((s,x)=>s+x.amount,0);
  let debtOn = dailyStore.debt.filter(d=>d.type==='عليّ').reduce((s,x)=>s+x.remaining,0);
  let debtFor = dailyStore.debt.filter(d=>d.type==='ليّا').reduce((s,x)=>s+x.remaining,0);
  let net = inc - exp;
  let safi = net - debtOn + debtFor;
  return {inc, exp, net, debtOn, debtFor, safi};
}

function todayKey(){ return new Date().toISOString().slice(0,10); }
function isToday(d){ return d===todayKey(); }

function renderIncome(){
  let stats = calcStats();
  let filtered = filterByDate(dailyStore.income);
  
  document.getElementById('daily-income').innerHTML=`
  <!-- داشبورد مترابط -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px;zoom:0.9">
    <div style="background:#000;color:#fff;border-radius:10px;padding:8px;text-align:center"><div style="font-size:7px;opacity:.6">دخل</div><div style="font-size:12px;font-weight:900;font-family:monospace">${stats.inc.toLocaleString('en-US')}</div></div>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:8px;text-align:center"><div style="font-size:7px;color:#dc2626">مصروف</div><div style="font-size:12px;font-weight:900;color:#dc2626;font-family:monospace">${stats.exp.toLocaleString('en-US')}</div></div>
    <div style="background:${stats.safi>=0?'#f0fdf4':'#fef2f2'};border:1px solid ${stats.safi>=0?'#bbf7d0':'#fecaca'};border-radius:10px;padding:8px;text-align:center"><div style="font-size:7px">الصافي</div><div style="font-size:12px;font-weight:900;color:${stats.safi>=0?'#16a34a':'#dc2626'};font-family:monospace">${stats.safi.toLocaleString('en-US')}</div></div>
  </div>

  <!-- تقرير يومي -->
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:8px;margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;font-size:9px;font-weight:700;margin-bottom:6px"><span>📊 تقرير ${dailyView==='today'?'اليوم':'الشهر'}</span><select onchange="dailyView=this.value;localStorage.setItem('daily_view',this.value);renderDailyAll()" style="font-size:8px;border:1px solid #e5e7eb;border-radius:99px;padding:2px 6px"><option value="today" ${dailyView==='today'?'selected':''}>اليوم</option><option value="week" ${dailyView==='week'?'selected':''}>أسبوع</option><option value="month" ${dailyView==='month'?'selected':''}>شهر</option><option value="all" ${dailyView==='all'?'selected':''}>الكل</option></select></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;text-align:center;font-size:8px">
      <div><div style="color:#64748b">عمليات</div><div style="font-weight:800">${filtered.length}</div></div>
      <div><div style="color:#64748b">أكبر دخل</div><div style="font-weight:800">${filtered.length?Math.max(...filtered.map(x=>x.amount)).toLocaleString('en-US'):0}</div></div>
      <div><div style="color:#64748b">متوسط</div><div style="font-weight:800">${filtered.length?Math.round(filtered.reduce((s,x)=>s+x.amount,0)/filtered.length).toLocaleString('en-US'):0}</div></div>
      <div><div style="color:#64748b">ديون عليك</div><div style="font-weight:800;color:#dc2626">${stats.debtOn.toLocaleString('en-US')}</div></div>
    </div>
  </div>

  <!-- إدخال احترافي سهل -->
  <div style="background:#fff;border:2px solid #000;border-radius:14px;padding:8px;margin-bottom:8px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
      <input id="incAmt" type="text" inputmode="decimal" placeholder="0.00" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;font-size:16px;font-weight:900;text-align:center;font-family:monospace;outline:none;color:#000" oninput="liveCalcIncome()">
      <select id="incCat" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;font-size:11px;color:#000">${dailyCat.income.map(c=>`<option>${c}</option>`).join('')}</select>
    </div>
    <div style="display:flex;gap:6px">
      <input id="incNote" placeholder="ملاحظة (اختياري)" style="flex:1;background:#f8fafc;border:0;border-radius:99px;padding:8px 12px;font-size:11px;outline:none;color:#000">
      <input id="incTime" type="time" value="${new Date().toTimeString().slice(0,5)}" style="background:#f8fafc;border:0;border-radius:99px;padding:6px;font-size:10px">
      <button onclick="addIncomePro()" style="background:#000;color:#fff;border:0;padding:8px 16px;border-radius:99px;font-size:11px;font-weight:700">حفظ +</button>
    </div>
    <div id="incLive" style="font-size:8px;color:#16a34a;margin-top:4px;text-align:center"></div>
  </div>

  <!-- قائمة مفصلة -->
  <div style="max-height:360px;overflow:auto;display:flex;flex-direction:column;gap:4px">
    ${filtered.slice().reverse().map((r,idx)=>{
      let realIdx = dailyStore.income.length-1 - (filtered.length-1 - filtered.slice().reverse().indexOf(r));
      // تبسيط الاندكس
      return `<div style="background:#fff;border:1px solid #f1f5f9;border-right:3px solid #22c55e;border-radius:10px;padding:8px;display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;gap:8px;align-items:center"><div style="width:28px;height:28px;background:#f0fdf4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px">${r.cat?.charAt(0)||'💊'}</div><div><div style="font-size:11px;font-weight:700;font-family:monospace">${r.amount.toLocaleString('en-US')} ج</div><div style="font-size:7px;color:#64748b">${r.cat} • ${r.note||''} • ${r.time||''}</div></div></div>
        <div style="text-align:left"><div style="font-size:7px;color:#94a3b8">${r.date}</div><div style="display:flex;gap:6px;margin-top:2px"><span onclick="editDaily('income',${dailyStore.income.indexOf(r)})" style="font-size:10px;cursor:pointer">✏️</span><span onclick="delDaily('income',${dailyStore.income.indexOf(r)})" style="font-size:10px;cursor:pointer">🗑️</span></div></div>
      </div>`;
    }).join('') || '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:10px">لا يوجد بيانات</div>'}
  </div>
  `;
}

function renderExp(){
  let stats=calcStats(), filtered=filterByDate(dailyStore.exp);
  document.getElementById('daily-exp').innerHTML=`
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:8px"><div style="font-size:8px;color:#dc2626">مصروف ${dailyView}</div><div style="font-size:14px;font-weight:900;color:#dc2626">${filtered.reduce((s,x)=>s+x.amount,0).toLocaleString('en-US')} ج</div></div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:8px"><div style="font-size:8px">عدد العمليات</div><div style="font-size:14px;font-weight:900">${filtered.length}</div></div>
  </div>
  <div style="background:#fff;border:2px solid #dc2626;border-radius:14px;padding:8px;margin-bottom:8px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
      <input id="expAmt" type="text" inputmode="decimal" placeholder="0.00" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:10px;font-size:16px;font-weight:900;text-align:center;font-family:monospace;color:#dc2626;outline:none">
      <select id="expCat" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;font-size:11px">${dailyCat.exp.map(c=>`<option>${c}</option>`).join('')}</select>
    </div>
    <div style="display:flex;gap:6px"><input id="expNote" placeholder="ليه؟" style="flex:1;background:#f8fafc;border:0;border-radius:99px;padding:8px 12px;font-size:11px"><button onclick="addExpPro()" style="background:#dc2626;color:#fff;border:0;padding:8px 16px;border-radius:99px;font-size:11px;font-weight:700">حفظ +</button></div>
  </div>
  <div style="display:flex;flex-direction:column;gap:4px;max-height:360px;overflow:auto">${filtered.slice().reverse().map(r=>`<div style="background:#fff;border:1px solid #f1f5f9;border-right:3px solid #ef4444;border-radius:10px;padding:8px;display:flex;justify-content:space-between"><div><div style="font-size:11px;font-weight:700">${r.amount.toLocaleString('en-US')} ج - ${r.cat}</div><div style="font-size:7px;color:#64748b">${r.note||''} • ${r.date}</div></div><span onclick="delDaily('exp',${dailyStore.exp.indexOf(r)})" style="cursor:pointer">✕</span></div>`).join('')}</div>
  `;
}

function renderDebt(){
  let stats=calcStats();
  document.getElementById('daily-debt').innerHTML=`
  <div style="background:#000;color:#fff;border-radius:14px;padding:10px;margin-bottom:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:center">
    <div><div style="font-size:7px;opacity:.6">عليك</div><div style="font-size:13px;font-weight:900;color:#fca5a5;font-family:monospace">${stats.debtOn.toLocaleString('en-US')} ج</div></div>
    <div><div style="font-size:7px;opacity:.6">ليك</div><div style="font-size:13px;font-weight:900;color:#86efac;font-family:monospace">${stats.debtFor.toLocaleString('en-US')} ج</div></div>
  </div>

  <div style="background:#fff;border:2px solid #000;border-radius:14px;padding:8px;margin-bottom:8px">
    <div style="display:grid;grid-template-columns:1fr 80px;gap:6px;margin-bottom:6px">
      <input id="debtName" placeholder="اسم العميل / الصيدلية" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;font-size:11px;outline:none;color:#000">
      <input id="debtAmtManual" type="number" placeholder="5000" style="background:#fff1f2;border:2px solid #ef4444;border-radius:10px;padding:10px;font-size:14px;font-weight:900;text-align:center;color:#dc2626;outline:none">
    </div>
    <div style="display:flex;gap:6px"><select id="debtTypeSel" style="background:#f8fafc;border-radius:99px;padding:8px;font-size:11px;flex:1"><option value="عليّ">🔴 عليّ (هتدفع)</option><option value="ليّا">🟢 ليّا (هتاخد)</option></select><button onclick="addDebtPro()" style="background:#000;color:#fff;border:0;padding:8px 16px;border-radius:99px;font-size:11px;font-weight:700">حفظ يدوي</button></div>
    <div style="font-size:7px;color:#94a3b8;margin-top:4px;text-align:center">✅ انت اللي بتحط المبلغ يدوي - مش بيتسحب أوتوماتيك</div>
  </div>

  <div style="display:flex;flex-direction:column;gap:4px">${dailyStore.debt.slice().reverse().map(r=>`<div style="background:${r.type==='عليّ'?'#fef2f2':'#f0fdf4'};border:1px solid ${r.type==='عليّ'?'#fecaca':'#bbf7d0'};border-radius:10px;padding:8px;display:flex;justify-content:space-between"><div><div style="font-size:11px;font-weight:700">${r.name}</div><div style="font-size:8px">${r.type} - ${r.remaining.toLocaleString('en-US')} ج</div></div><span onclick="delDaily('debt',${dailyStore.debt.indexOf(r)})" style="cursor:pointer">✕</span></div>`).join('')}</div>
  `;
}

// وظائف مساعدة
function filterByDate(arr){
  if(dailyView==='all') return arr;
  let now=new Date();
  if(dailyView==='today') return arr.filter(x=>x.date===todayKey());
  if(dailyView==='week'){ let weekAgo=new Date(); weekAgo.setDate(now.getDate()-7); return arr.filter(x=> new Date(x.date)>=weekAgo); }
  if(dailyView==='month'){ let m=now.getMonth(), y=now.getFullYear(); return arr.filter(x=>{ let d=new Date(x.date); return d.getMonth()===m && d.getFullYear()===y; }); }
  return arr;
}
function addIncomePro(){
  let amt=parseFloat(document.getElementById('incAmt').value), cat=document.getElementById('incCat').value, note=document.getElementById('incNote').value, time=document.getElementById('incTime').value;
  if(!amt) return; dailyStore.income.push({amount:amt, cat, note, time, date:todayKey(), id:Date.now()}); saveDaily(); renderIncome();
}
function addExpPro(){
  let amt=parseFloat(document.getElementById('expAmt').value), cat=document.getElementById('expCat').value, note=document.getElementById('expNote').value;
  if(!amt) return; dailyStore.exp.push({amount:amt, cat, note, date:todayKey(), id:Date.now()}); saveDaily(); renderExp();
}
function addDebtPro(){
  let name=document.getElementById('debtName').value, amt=parseFloat(document.getElementById('debtAmtManual').value), type=document.getElementById('debtTypeSel').value;
  if(!name||!amt) return alert('اكتب الاسم والمبلغ'); dailyStore.debt.push({name, remaining:amt, type, date:todayKey(), id:Date.now()}); saveDaily(); renderDebt();
}
function delDaily(type, idx){ dailyStore[type].splice(idx,1); saveDaily(); renderDailyAll(); }
function liveCalcIncome(){ let v=document.getElementById('incAmt').value; if(v) document.getElementById('incLive').innerText=`= ${parseFloat(v).toLocaleString('en-US')} جنيه`; }
function renderDailyAll(){ renderIncome(); renderExp(); renderDebt(); }
function renderIncome(){ renderDailyAll(); } // compat

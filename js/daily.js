import { L, S, uid, fmt } from './utils.js';
import { syncToSheet } from './sheets.js';

const KEY='daily_v6';
// الجديد: 4 أنواع فئات - الإجمالي هو الماستر
const CATS='cats_daily_v7';
const DEFAULT_CATS={
  income:['راتب صيدلية','مكافأة','شفت إضافي'],
  expense:['أكل','مواصلات','إيجار','صيدلية','شحن','سوبر ماركت'],
  debt_short:['دين قصير - سلفة','دين قصير - جمعية'], // أقل من سنة
  debt_long:['دين طويل - قرض','دين طويل - تقسيط'] // أكتر من سنة
};

let tab='income'; // income | expense | debt | total
let debtSubTab='short'; // short | long - للديون

function getCats(){ return L(CATS, DEFAULT_CATS); }
function saveCats(c){ S(CATS,c); }

export function renderDaily(){
  const data=L(KEY,[]), cats=getCats();
  const allIncome=data.filter(x=>x.type==='income');
  const allExpense=data.filter(x=>x.type==='expense');
  const allDebtShort=data.filter(x=>x.type==='debt_short');
  const allDebtLong=data.filter(x=>x.type==='debt_long');
  const totalIncome=allIncome.reduce((s,x)=>s+x.amount,0);
  const totalExpense=allExpense.reduce((s,x)=>s+x.amount,0);
  const net=totalIncome-totalExpense;

  // ===== 1. تبويب الإجمالي - الماستر =====
  if(tab==='total'){
    return `
    <div class="card" style="background:linear-gradient(135deg,#0f172a,#1e293b); color:#fff; border:0">
      <div style="display:flex; justify-content:space-between; align-items:center">
        <div><b style="font-size:18px">📊 الإجمالي - لوحة التحكم</b><br><small style="opacity:.7">الماستر اللي بيغذي كل الصفحات</small></div>
        <div style="text-align:left"><div style="background:rgba(255,255,255,.12); padding:10px 16px; border-radius:14px"><small>الصافي</small><br><b style="font-size:18px; color:${net>=0?'#34d399':'#fb7185'}">${fmt(net)}</b></div></div>
      </div>
      <div class="stat-grid" style="margin:14px 0 0; gap:10px">
        <div style="background:rgba(255,255,255,.08); padding:12px; border-radius:14px"><small style="color:#94a3b8">إجمالي الدخل</small><b style="color:#34d399">${fmt(totalIncome)}</b></div>
        <div style="background:rgba(255,255,255,.08); padding:12px; border-radius:14px"><small style="color:#94a3b8">إجمالي المصروف</small><b style="color:#fb7185">${fmt(totalExpense)}</b></div>
      </div>
    </div>

    <!-- جدول 1: الدخل -->
    <div class="card">
      <div class="card-head"><b>🟢 جدول الدخل - ${cats.income.length} فئة</b><span>${fmt(totalIncome)}</span></div>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px">
        ${cats.income.map(c=>{
          const sum=allIncome.filter(x=>x.category===c).reduce((s,x)=>s+x.amount,0);
          return `<div class="cat" style="border-color:#bbf7d0; background:#f0fdf4"> ${c} <small style="background:#dcfce7; padding:2px 8px; border-radius:20px; font-size:10px">${fmt(sum)}</small> <b data-action="editCat" data-type="income" data-old="${c}">✏️</b> <b data-action="delCatMaster" data-type="income" data-cat="${c}">✕</b></div>`
        }).join('')}
      </div>
      <div class="inp"><input id="newIncCat" placeholder="إضافة فئة دخل..."><button class="btn-sm primary" data-action="addCatMaster" data-type="income">+ إضافة</button></div>
      <div style="margin-top:12px; max-height:200px; overflow:auto">
        <table style="width:100%; font-size:12px; border-collapse:collapse"><tr style="background:#f8fafc"><th style="text-align:right; padding:8px">الفئة</th><th>العدد</th><th>الإجمالي</th></tr>
        ${cats.income.map(c=>{ const f=allIncome.filter(x=>x.category===c); return `<tr style="border-top:1px solid #f1f5f9"><td style="padding:8px">${c}</td><td style="text-align:center">${f.length}</td><td><b style="color:#10b981">${fmt(f.reduce((s,x)=>s+x.amount,0))}</b></td></tr>`}).join('')}
        </table>
      </div>
    </div>

    <!-- جدول 2: المصروفات -->
    <div class="card">
      <div class="card-head"><b>🔴 جدول المصروفات - ${cats.expense.length} فئة</b><span>${fmt(totalExpense)}</span></div>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px">
        ${cats.expense.map(c=>{
          const sum=allExpense.filter(x=>x.category===c).reduce((s,x)=>s+x.amount,0);
          return `<div class="cat" style="border-color:#fecdd3; background:#fff1f2"> ${c} <small style="background:#ffe4e6; padding:2px 8px; border-radius:20px; font-size:10px">${fmt(sum)}</small> <b data-action="editCat" data-type="expense" data-old="${c}">✏️</b> <b data-action="delCatMaster" data-type="expense" data-cat="${c}">✕</b></div>`
        }).join('')}
      </div>
      <div class="inp"><input id="newExpCat" placeholder="إضافة فئة مصروف..."><button class="btn-sm" style="background:#e11d48; color:#fff" data-action="addCatMaster" data-type="expense">+ إضافة</button></div>
      <div style="margin-top:12px; max-height:200px; overflow:auto">
        <table style="width:100%; font-size:12px; border-collapse:collapse"><tr style="background:#f8fafc"><th style="text-align:right; padding:8px">الفئة</th><th>العدد</th><th>الإجمالي</th><th>النسبة</th></tr>
        ${cats.expense.map(c=>{ const f=allExpense.filter(x=>x.category===c); const s=f.reduce((a,x)=>a+x.amount,0); return `<tr style="border-top:1px solid #f1f5f9"><td style="padding:8px">${c}</td><td style="text-align:center">${f.length}</td><td><b style="color:#e11d48">${fmt(s)}</b></td><td>${totalExpense?((s/totalExpense)*100).toFixed(0)+'%':'0%'}</td></tr>`}).join('')}
        </table>
      </div>
    </div>

    <!-- جدول 3: الديون - جدولين -->
    <div class="card" style="border:1.8px solid #fde68a; background:linear-gradient(180deg,#fffbeb,#fff)">
      <div class="card-head"><b>🟡 جدول الديون - الماستر</b><span>${fmt(allDebtShort.reduce((s,x)=>s+x.amount,0)+allDebtLong.reduce((s,x)=>s+x.amount,0))}</span></div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
        <div style="background:#fff; border:1.5px solid #fde68a; border-radius:16px; padding:14px">
          <b style="font-size:13px">⏳ قصيرة الأمد <small style="color:#d97706">أقل من سنة</small></b>
          <div style="margin:10px 0; display:flex; flex-wrap:wrap; gap:6px">
            ${cats.debt_short.map(c=>`<span class="cat" style="background:#fffbeb; border-color:#fde68a"> ${c} <b data-action="editCat" data-type="debt_short" data-old="${c}">✏️</b> <b data-action="delCatMaster" data-type="debt_short" data-cat="${c}">✕</b></span>`).join('')}
          </div>
          <div class="inp"><input id="newShortCat" placeholder="دين قصير..."><button class="btn-sm" style="background:#f59e0b; color:#fff" data-action="addCatMaster" data-type="debt_short">+</button></div>
          <table style="width:100%; font-size:11px; margin-top:10px"><tr style="background:#fef3c7"><th>الفئة</th><th>المبلغ</th></tr>
          ${cats.debt_short.map(c=>{const f=allDebtShort.filter(x=>x.category===c); return `<tr><td>${c}</td><td><b>${fmt(f.reduce((s,x)=>s+x.amount,0))}</b></td></tr>`}).join('')}
          </table>
        </div>

        <div style="background:#fff; border:1.5px solid #c7d2fe; border-radius:16px; padding:14px">
          <b style="font-size:13px">🏦 طويلة الأمد <small style="color:#6366f1">أكتر من سنة</small></b>
          <div style="margin:10px 0; display:flex; flex-wrap:wrap; gap:6px">
            ${cats.debt_long.map(c=>`<span class="cat" style="background:#eef2ff; border-color:#c7d2fe"> ${c} <b data-action="editCat" data-type="debt_long" data-old="${c}">✏️</b> <b data-action="delCatMaster" data-type="debt_long" data-cat="${c}">✕</b></span>`).join('')}
          </div>
          <div class="inp"><input id="newLongCat" placeholder="دين طويل..."><button class="btn-sm" style="background:#6366f1; color:#fff" data-action="addCatMaster" data-type="debt_long">+</button></div>
          <table style="width:100%; font-size:11px; margin-top:10px"><tr style="background:#e0e7ff"><th>الفئة</th><th>المبلغ</th></tr>
          ${cats.debt_long.map(c=>{const f=allDebtLong.filter(x=>x.category===c); return `<tr><td>${c}</td><td><b>${fmt(f.reduce((s,x)=>s+x.amount,0))}</b></td></tr>`}).join('')}
          </table>
        </div>
      </div>
    </div>
    `;
  }

  // ===== 2. الصفحات العادية (الدخل - المصروف - الدين) =====
  let curCats=[], filtered=[], title='', color='';
  if(tab==='income'){ curCats=cats.income; filtered=allIncome; title='إضافة دخل'; color='#10b981'; }
  if(tab==='expense'){ curCats=cats.expense; filtered=allExpense; title='إضافة مصروف مفصل'; color='#e11d48'; }
  if(tab==='debt'){
    if(debtSubTab==='short'){ curCats=cats.debt_short; filtered=allDebtShort; title='دين قصير الأمد'; color='#f59e0b'; }
    else{ curCats=cats.debt_long; filtered=allDebtLong; title='دين طويل الأمد'; color='#6366f1'; }
  }

  return `
  <div class="card">
    <div class="seg" style="grid-template-columns:1fr 1fr 1fr 1fr">
      <button class="${tab==='total'?'active':''}" data-action="setTab" data-tab="total">📊 الإجمالي</button>
      <button class="${tab==='income'?'active':''}" data-action="setTab" data-tab="income">دخل</button>
      <button class="${tab==='expense'?'active':''}" data-action="setTab" data-tab="expense">مصروف</button>
      <button class="${tab==='debt'?'active':''}" data-action="setTab" data-tab="debt">ديون</button>
    </div>
    ${tab==='debt'?`<div class="seg" style="margin-top:12px; grid-template-columns:1fr 1fr"><button class="${debtSubTab==='short'?'active':''}" data-action="setDebtSub" data-sub="short">⏳ قصيرة الأمد</button><button class="${debtSubTab==='long'?'active':''}" data-action="setDebtSub" data-sub="long">🏦 طويلة الأمد</button></div>`:''}
    <div style="margin-top:12px; font-size:11px; color:#64748b; background:#f8fafc; padding:8px 12px; border-radius:12px">📌 الفئات بتتسحب من صفحة الإجمالي - عدلها من هناك • <b>${curCats.length} فئة متاحة</b></div>
  </div>

  <div class="card form-card">
    <div class="form-title" style="color:${color}">${tab==='debt'?'💳':'💰'} ${title}</div>
    <div class="form-grid">
      <div class="input-group"><label>الوصف</label><input id="dDesc" placeholder="الوصف..."></div>
      <div class="input-group"><label>المبلغ</label><input id="dAmount" type="number" placeholder="0"></div>
    </div>
    <div class="form-grid">
      <div class="input-group"><label>الفئة (من الإجمالي)</label><select id="dCat">${curCats.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
      <div class="input-group"><label>التاريخ</label><input id="dDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
    </div>
    <div class="input-group" style="margin-top:12px"><label>ملاحظات</label><input id="dNote" placeholder="اختياري..."></div>
    <button class="btn" style="margin-top:14px; background:${color}" data-action="addDaily">💾 حفظ ${tab==='income'?'الدخل':tab==='expense'?'المصروف':'الدين'}</button>
  </div>

  <div style="padding:0 2px">
    ${filtered.map(x=>`
    <div class="list-item">
      <div style="flex:1"><b style="font-size:13px">${x.desc}</b><div class="meta">${x.category} • ${x.date?.slice(0,10)||''} ${x.note?`• ${x.note}`:''}</div></div>
      <div style="display:flex; gap:8px; align-items:center"><b style="color:${color}">${fmt(x.amount)}</b><button class="btn-sm ghost" data-action="editDaily" data-id="${x.id}">✏️</button><button class="btn-sm danger" data-action="delDaily" data-id="${x.id}">✕</button></div>
    </div>`).join('') || `<div class="card" style="text-align:center; color:#94a3b8">📭 لا يوجد ${title} بعد - الفئات من الإجمالي</div>`}
  </div>
  `;
}

export function handleDaily(btn,e,rerender){
  const cats=getCats();
  if(btn.dataset.action==='setTab'){ tab=btn.dataset.tab; rerender(); return; }
  if(btn.dataset.action==='setDebtSub'){ debtSubTab=btn.dataset.sub; rerender(); return; }

  // Master - الإجمالي
  if(btn.dataset.action==='addCatMaster'){
    const type=btn.dataset.type;
    const idMap={income:'newIncCat', expense:'newExpCat', debt_short:'newShortCat', debt_long:'newLongCat'};
    const input=document.getElementById(idMap[type]); const v=input?.value.trim(); if(!v) return;
    cats[type].push(v); saveCats(cats); rerender(); return;
  }
  if(btn.dataset.action==='delCatMaster'){
    if(!confirm('حذف الفئة؟ العمليات المرتبطة هتفضل موجودة')) return;
    const {type,cat}=btn.dataset; cats[type]=cats[type].filter(x=>x!==cat); saveCats(cats); rerender(); return;
  }
  if(btn.dataset.action==='editCat'){
    const {type,old}=btn.dataset; const nv=prompt('الاسم الجديد:', old); if(!nv||!nv.trim()) return;
    // تحديث اسم الفئة في كل العمليات
    cats[type]=cats[type].map(x=>x===old?nv.trim():x); saveCats(cats);
    let all=L(KEY,[]); all.forEach(o=>{ if(o.category===old && (o.type===type || (type.startsWith('debt_')&&o.type.startsWith('debt_')))) o.category=nv.trim(); }); S(KEY,all);
    rerender(); return;
  }

  // العمليات العادية
  if(btn.dataset.action==='addDaily'){
    const desc=document.getElementById('dDesc')?.value.trim(), amount=+document.getElementById('dAmount')?.value;
    const cat=document.getElementById('dCat')?.value, date=document.getElementById('dDate')?.value, note=document.getElementById('dNote')?.value.trim();
    if(!desc||!amount) return alert('كمل البيانات');
    let type=tab; if(tab==='debt') type=debtSubTab==='short'?'debt_short':'debt_long';
    const all=L(KEY,[]); const obj={id:uid(), desc, amount, category:cat, date:date?new Date(date).toISOString():new Date().toISOString(), note, type, created:new Date().toISOString()};
    all.unshift(obj); S(KEY,all); syncToSheet('daily',obj); rerender(); return;
  }
  if(btn.dataset.action==='delDaily'){
    if(!confirm('حذف؟')) return; S(KEY, L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender(); return;
  }
  if(btn.dataset.action==='editDaily'){
    const all=L(KEY,[]); const item=all.find(x=>x.id===btn.dataset.id); if(!item) return;
    const nd=prompt('الوصف:', item.desc); if(nd===null) return;
    const na=prompt('المبلغ:', item.amount); if(na===null) return;
    item.desc=nd.trim()||item.desc; item.amount=+na||item.amount; S(KEY,all); rerender(); return;
  }
}

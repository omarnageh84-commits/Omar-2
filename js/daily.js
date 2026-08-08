import { L, S, uid, fmt } from './utils.js';

const KEY='daily_v6';
const CATS='cats_final_v1';
const DEFAULT={
  income:['راتب صيدلية','مكافأة'],
  expense:['أكل','مواصلات','إيجار','صيدلية'],
  due:['دين مستحق - سلفة','دين مستحق - جمعية'],
  deferred:['دين مؤجل - قرض','أقساط']
};

let tab='income'; // income | expense | debts | total
let debtType='due'; // due | deferred - جوه تبويب الديون

const getCats=()=>L(CATS, DEFAULT);
const saveCats=c=>S(CATS,c);

export function renderDaily(){
  const data=L(KEY,[]);
  const cats=getCats();

  // الإجمالي - صافي كل شهر
  if(tab==='total'){
    // تجميع حسب الشهر
    const months={};
    data.forEach(r=>{
      const m = (r.date||r.created||new Date().toISOString()).slice(0,7); // YYYY-MM
      if(!months[m]) months[m]={income:0,expense:0,due:0,deferred:0};
      months[m][r.type]+=r.amount;
    });
    const sortedMonths=Object.keys(months).sort().reverse();

    return `
    <div class="card" style="padding:10px">
      <div class="seg" style="grid-template-columns:repeat(4,1fr)">
        <button data-action="setTab" data-tab="income">دخل</button>
        <button data-action="setTab" data-tab="expense">مصروف</button>
        <button data-action="setTab" data-tab="debts">الديون</button>
        <button class="active" data-action="setTab" data-tab="total">الإجمالي</button>
      </div>
    </div>

    <div class="card" style="background:#0f172a; color:#fff; border:0">
      <b>📊 الإجمالي - الصافي لكل شهر</b>
      <div style="font-size:11px; opacity:.7; margin-top:4px">صافي الدخل والمصروف والديون المستحقة والمؤجلة</div>
    </div>

    <table class="pro-table">
      <tr><th>الشهر</th><th>دخل</th><th>مصروف</th><th>صافي</th><th>مستحقة</th><th>مؤجلة</th></tr>
      ${sortedMonths.map(m=>{
        const row=months[m];
        const net=row.income-row.expense;
        return `<tr>
          <td><b>${m}</b></td>
          <td style="color:#10b981">${fmt(row.income)}</td>
          <td style="color:#e11d48">${fmt(row.expense)}</td>
          <td style="background:${net>=0?'#ecfdf5':'#fff1f2'}; font-weight:800; color:${net>=0?'#065f46':'#9f1239'}">${fmt(net)}</td>
          <td style="color:#d97706">${fmt(row.due)}</td>
          <td style="color:#6366f1">${fmt(row.deferred)}</td>
        </tr>`
      }).join('') || `<tr><td colspan="6" style="text-align:center; padding:20px; color:#94a3b8">لا يوجد بيانات بعد</td></tr>`}
      <tr style="background:#f8fafc; font-weight:800; border-top:2px solid #0f172a">
        <td>الإجمالي الكلي</td>
        <td style="color:#10b981">${fmt(data.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0))}</td>
        <td style="color:#e11d48">${fmt(data.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0))}</td>
        <td>${fmt(data.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0) - data.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0))}</td>
        <td style="color:#d97706">${fmt(data.filter(x=>x.type==='due').reduce((s,x)=>s+x.amount,0))}</td>
        <td style="color:#6366f1">${fmt(data.filter(x=>x.type==='deferred').reduce((s,x)=>s+x.amount,0))}</td>
      </tr>
    </table>
    `;
  }

  // التبويبات الـ 3 الاحترافية
  let curCats=[], curData=[], title='', color='';
  if(tab==='income'){ curCats=cats.income; curData=data.filter(x=>x.type==='income'); title='الدخل'; color='#10b981'; }
  if(tab==='expense'){ curCats=cats.expense; curData=data.filter(x=>x.type==='expense'); title='المصروف'; color='#e11d48'; }
  if(tab==='debts'){
    curCats = debtType==='due'? cats.due : cats.deferred;
    curData = data.filter(x=>x.type===debtType);
    title = debtType==='due'? 'الديون المستحقة' : 'الديون المؤجلة';
    color = debtType==='due'? '#f59e0b' : '#6366f1';
  }

  return `
  <div class="card" style="padding:10px">
    <div class="seg" style="grid-template-columns:repeat(4,1fr)">
      <button class="${tab==='income'?'active':''}" data-action="setTab" data-tab="income">الدخل</button>
      <button class="${tab==='expense'?'active':''}" data-action="setTab" data-tab="expense">المصروف</button>
      <button class="${tab==='debts'?'active':''}" data-action="setTab" data-tab="debts">الديون</button>
      <button class="${tab==='total'?'active':''}" data-action="setTab" data-tab="total">الإجمالي</button>
    </div>
    ${tab==='debts'?`
    <div class="seg" style="margin-top:8px; grid-template-columns:1fr 1fr">
      <button class="${debtType==='due'?'active':''}" data-action="setDebtType" data-type="due">⏳ مستحقة</button>
      <button class="${debtType==='deferred'?'active':''}" data-action="setDebtType" data-type="deferred">🏦 مؤجلة</button>
    </div>`:''}
  </div>

  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
      <b style="color:${color}">📁 بنود ${title}</b><span style="font-size:11px; background:#f1f5f9; padding:4px 10px; border-radius:20px">${curCats.length} بند</span>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px">
      ${curCats.map(c=>`<span class="cat">${c} <b data-action="editCat" data-cat="${c}">✏️</b> <b data-action="delCat" data-cat="${c}">✕</b></span>`).join('') || `<small style="color:#94a3b8">لا يوجد بنود - أضف واحد</small>`}
    </div>
    <div class="inp">
      <input id="newCatInput" placeholder="إضافة بند جديد...">
      <button class="btn-sm" style="background:${color}; color:#fff; padding:12px 18px" data-action="addCat">+ إضافة بند</button>
    </div>
  </div>

  <div class="card" style="border:1.5px solid ${color}20; background:linear-gradient(180deg,#fff,#fcfdfe)">
    <b style="color:${color}">＋ إضافة ${title}</b>
    <div class="inp" style="margin-top:12px">
      <select id="dCat" style="flex:1; padding:13px; border-radius:12px; border:1.6px solid #eef2f0; font-weight:700"><option value="">اختر البند...</option>${curCats.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
      <input id="dAmount" type="number" placeholder="المبلغ" style="flex:.7">
    </div>
    <div class="inp">
      <input id="dDesc" placeholder="وصف (اختياري)" style="flex:1">
      <input id="dDate" type="date" value="${new Date().toISOString().slice(0,10)}" style="flex:.7">
    </div>
    <button class="btn" style="background:${color}; margin-top:8px" data-action="addRow">💾 حفظ ${title}</button>
  </div>

  <table class="pro-table">
    <tr><th>البند</th><th>المبلغ</th><th>التاريخ</th><th></th></tr>
    ${curData.map(r=>`<tr>
      <td><b>${r.category}</b><br><small style="color:#94a3b8">${r.desc||''}</small></td>
      <td><b style="color:${color}">${fmt(r.amount)}</b></td>
      <td style="font-size:11px">${(r.date||'').slice(0,10)}</td>
      <td><div style="display:flex; gap:4px"><button class="btn-sm" style="background:#eef2ff" data-action="editRow" data-id="${r.id}">✏️</button><button class="btn-sm" style="background:#fff1f2; color:#e11d48" data-action="delRow" data-id="${r.id}">✕</button></div></td>
    </tr>`).join('') || `<tr><td colspan="4" style="text-align:center; padding:20px; color:#94a3b8">لا يوجد ${title} بعد</td></tr>`}
  </table>
  `;
}

export function handleDaily(btn,e,rerender){
  const cats=getCats();
  const getCurKey=()=> tab==='income'? 'income' : tab==='expense'? 'expense' : debtType;

  if(btn.dataset.action==='setTab'){ tab=btn.dataset.tab; rerender(); return; }
  if(btn.dataset.action==='setDebtType'){ debtType=btn.dataset.type; rerender(); return; }

  if(btn.dataset.action==='addCat'){
    const v=document.getElementById('newCatInput')?.value.trim(); if(!v) return;
    const key=getCurKey(); cats[key].push(v); saveCats(cats); rerender(); return;
  }
  if(btn.dataset.action==='delCat'){
    if(!confirm('حذف البند؟')) return;
    const key=getCurKey(); cats[key]=cats[key].filter(x=>x!==btn.dataset.cat); saveCats(cats); rerender(); return;
  }
  if(btn.dataset.action==='editCat'){
    const key=getCurKey(); const old=btn.dataset.cat; const nv=prompt('تعديل البند:',old); if(!nv?.trim()) return;
    cats[key]=cats[key].map(x=>x===old?nv.trim():x); saveCats(cats);
    // عدل كل العمليات القديمة
    let all=L(KEY,[]); all.forEach(o=>{ if(o.category===old && o.type===key) o.category=nv.trim(); }); S(KEY,all);
    rerender(); return;
  }
  if(btn.dataset.action==='addRow'){
    const cat=document.getElementById('dCat')?.value, amount=+document.getElementById('dAmount')?.value;
    const desc=document.getElementById('dDesc')?.value.trim(), date=document.getElementById('dDate')?.value;
    if(!cat) return alert('اختر البند من القائمة');
    if(!amount) return alert('ادخل المبلغ');
    const all=L(KEY,[]);
    const type = tab==='debts'? debtType : tab;
    all.unshift({id:uid(), category:cat, amount, desc, type, date:date?new Date(date).toISOString():new Date().toISOString()});
    S(KEY,all); rerender(); return;
  }
  if(btn.dataset.action==='delRow'){ if(!confirm('حذف الصف؟')) return; S(KEY, L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
  if(btn.dataset.action==='editRow'){
    const all=L(KEY,[]); const item=all.find(x=>x.id===btn.dataset.id); if(!item) return;
    const na=prompt('المبلغ الجديد:',item.amount); if(na===null) return; const nd=prompt('الوصف:',item.desc||''); if(nd===null) return;
    item.amount=+na||item.amount; item.desc=nd.trim(); S(KEY,all); rerender(); return;
  }
}

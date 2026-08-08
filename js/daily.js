import { L, S, uid, fmt } from './utils.js';

const KEY='daily_v6';
const CATS='cats_final_v1';
const DEFAULT={
  income:['راتب صيدلية','مكافأة'],
  expense:['أكل','مواصلات','إيجار','صيدلية'],
  due:['دين مستحق - سلفة','جمعية'],
  deferred:['قرض','أقساط']
};

let tab='income';
let debtType='due';
const getCats=()=>L(CATS, DEFAULT);
const saveCats=c=>S(CATS,c);

// helper: كل الشهور اللي فيها بيانات
function getMonths(data){
  const set=new Set();
  data.forEach(r=>{ const m=(r.date||'').slice(0,7); if(m) set.add(m); });
  if(set.size===0){ // لو مفيش بيانات هات آخر 6 شهور
    for(let i=0;i<6;i++){ let d=new Date(); d.setMonth(d.getMonth()-i); set.add(d.toISOString().slice(0,7)); }
  }
  return Array.from(set).sort();
}

export function renderDaily(){
  const data=L(KEY,[]);
  const cats=getCats();
  const months=getMonths(data);
  const monthLabels=months.map(m=>{ const [y,mo]=m.split('-'); return `${mo}/${y.slice(2)}` });

  // ===== الإجمالي - 4 جداول Pivot =====
  if(tab==='total'){
    const sumCatMonth=(type,cat,month)=> data.filter(x=>x.type===type && x.category===cat && (x.date||'').slice(0,7)===month).reduce((s,x)=>s+x.amount,0);
    const sumMonth=(type,month)=> data.filter(x=>x.type===type && (x.date||'').slice(0,7)===month).reduce((s,x)=>s+x.amount,0);

    const buildPivot=(title,key,type,color)=>{
      const catList=cats[key];
      return `
      <div class="card" style="overflow:auto; padding:0">
        <div style="padding:14px; background:${color}; color:#fff; display:flex; justify-content:space-between"><b>${title}</b><small>${catList.length} بند</small></div>
        <div style="overflow-x:auto">
          <table class="pro-table" style="min-width:600px; margin:0">
            <tr><th style="position:sticky; right:0; background:#f8fafc; z-index:2; min-width:120px">اسم ${title}</th>${monthLabels.map(l=>`<th style="text-align:center; min-width:70px">${l}</th>`).join('')}<th style="background:#0f172a; color:#fff; text-align:center">الإجمالي</th></tr>
            ${catList.map(cat=>{
              const total=months.reduce((s,m)=>s+sumCatMonth(type,cat,m),0);
              return `<tr>
                <td style="position:sticky; right:0; background:#fff; font-weight:800; z-index:1; border-left:2px solid ${color}">${cat}</td>
                ${months.map(m=>`<td style="text-align:center">${sumCatMonth(type,cat,m)? fmt(sumCatMonth(type,cat,m)).replace(' ج','') : '-'}</td>`).join('')}
                <td style="text-align:center; background:#f8fafc; font-weight:800; color:${color}">${fmt(total)}</td>
              </tr>`
            }).join('')}
            <tr style="background:#f8fafc; font-weight:800; border-top:2px solid ${color}">
              <td style="position:sticky; right:0; background:#f8fafc; z-index:1">الإجمالي الشهري</td>
              ${months.map(m=>`<td style="text-align:center; color:${color}">${fmt(sumMonth(type,m)).replace(' ج','')}</td>`).join('')}
              <td style="text-align:center; background:#0f172a; color:#fff">${fmt(data.filter(x=>x.type===type).reduce((s,x)=>s+x.amount,0))}</td>
            </tr>
          </table>
        </div>
      </div>`;
    };

    return `
    <div class="card" style="padding:10px">
      <div class="seg" style="grid-template-columns:repeat(4,1fr)">
        <button data-action="setTab" data-tab="income">الدخل</button>
        <button data-action="setTab" data-tab="expense">المصروف</button>
        <button data-action="setTab" data-tab="debts">الديون</button>
        <button class="active" data-action="setTab" data-tab="total">الإجمالي</button>
      </div>
    </div>

    ${buildPivot('المصروفات','expense','expense','#e11d48')}
    ${buildPivot('الدخل','income','income','#10b981')}
    ${buildPivot('الديون المستحقة','due','due','#f59e0b')}
    ${buildPivot('الديون المؤجلة','deferred','deferred','#6366f1')}

    <div class="card" style="padding:0; overflow:auto">
      <div style="padding:14px; background:#0f172a; color:#fff"><b>📊 تقرير شهري شامل - الكل</b></div>
      <div style="overflow-x:auto">
        <table class="pro-table" style="min-width:600px; margin:0">
          <tr><th>الشهر</th><th style="color:#10b981">دخل</th><th style="color:#e11d48">مصروف</th><th>الصافي</th><th style="color:#f59e0b">مستحقة</th><th style="color:#6366f1">مؤجلة</th></tr>
          ${months.slice().reverse().map(m=>{
            const inc=sumMonth('income',m), exp=sumMonth('expense',m), due=sumMonth('due',m), def=sumMonth('deferred',m);
            const net=inc-exp;
            return `<tr><td><b>${m}</b></td><td style="color:#10b981">${fmt(inc)}</td><td style="color:#e11d48">${fmt(exp)}</td><td style="font-weight:800; background:${net>=0?'#ecfdf5':'#fff1f2'}; color:${net>=0?'#065f46':'#9f1239'}">${fmt(net)}</td><td>${fmt(due)}</td><td>${fmt(def)}</td></tr>`
          }).join('')}
        </table>
      </div>
    </div>
    `;
  }

  // ===== التبويبات العادية =====
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
    ${tab==='debts'?`<div class="seg" style="margin-top:8px; grid-template-columns:1fr 1fr"><button class="${debtType==='due'?'active':''}" data-action="setDebtType" data-type="due">مستحقة</button><button class="${debtType==='deferred'?'active':''}" data-action="setDebtType" data-type="deferred">مؤجلة</button></div>`:''}
  </div>

  <div class="card">
    <div style="display:flex; justify-content:space-between; margin-bottom:10px"><b style="color:${color}">بنود ${title}</b><span style="font-size:11px; background:#f1f5f9; padding:4px 10px; border-radius:20px">${curCats.length} بند</span></div>
    <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px">
      ${curCats.map(c=>`<span class="cat">${c} <b data-action="editCat" data-cat="${c}">✏️</b> <b data-action="delCat" data-cat="${c}">✕</b></span>`).join('')}
    </div>
    <div class="inp"><input id="newCatInput" placeholder="إضافة بند..."><button class="btn-sm" style="background:${color}; color:#fff" data-action="addCat">+ بند</button></div>
  </div>

  <div class="card">
    <div class="inp"><select id="dCat"><option value="">اختر البند...</option>${curCats.map(c=>`<option>${c}</option>`).join('')}</select><input id="dAmount" type="number" placeholder="المبلغ"></div>
    <div class="inp"><input id="dDesc" placeholder="وصف"><input id="dDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
    <button class="btn" style="background:${color}" data-action="addRow">حفظ ${title}</button>
  </div>

  <table class="pro-table">
    <tr><th>البند</th><th>المبلغ</th><th>الشهر</th><th></th></tr>
    ${curData.map(r=>`<tr><td><b>${r.category}</b><br><small style="color:#94a3b8">${r.desc||''}</small></td><td><b style="color:${color}">${fmt(r.amount)}</b></td><td>${(r.date||'').slice(0,7)}</td><td><button class="btn-sm" style="background:#fff1f2; color:#e11d48" data-action="delRow" data-id="${r.id}">✕</button></td></tr>`).join('') || `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:16px">لا يوجد</td></tr>`}
  </table>
  `;
}

export function handleDaily(btn,e,rerender){
  const cats=getCats();
  const getKey=()=> tab==='income'? 'income' : tab==='expense'? 'expense' : debtType;
  if(btn.dataset.action==='setTab'){ tab=btn.dataset.tab; rerender(); return; }
  if(btn.dataset.action==='setDebtType'){ debtType=btn.dataset.type; rerender(); return; }
  if(btn.dataset.action==='addCat'){ const v=document.getElementById('newCatInput')?.value.trim(); if(!v) return; const k=getKey(); cats[k].push(v); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='delCat'){ if(!confirm('حذف البند؟')) return; const k=getKey(); cats[k]=cats[k].filter(x=>x!==btn.dataset.cat); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='editCat'){ const k=getKey(); const old=btn.dataset.cat; const nv=prompt('تعديل:',old); if(!nv?.trim()) return; cats[k]=cats[k].map(x=>x===old?nv.trim():x); saveCats(cats); let all=L(KEY,[]); all.forEach(o=>{ if(o.category===old && o.type===k) o.category=nv.trim(); }); S(KEY,all); rerender(); return; }
  if(btn.dataset.action==='addRow'){
    const cat=document.getElementById('dCat')?.value, amount=+document.getElementById('dAmount')?.value;
    if(!cat) return alert('اختر البند'); if(!amount) return alert('المبلغ');
    const all=L(KEY,[]); all.unshift({id:uid(), category:cat, amount, desc:document.getElementById('dDesc')?.value.trim(), type:getKey(), date:document.getElementById('dDate')?.value? new Date(document.getElementById('dDate').value).toISOString() : new Date().toISOString()}); S(KEY,all); rerender(); return;
  }
  if(btn.dataset.action==='delRow'){ if(!confirm('حذف؟')) return; S(KEY, L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
}

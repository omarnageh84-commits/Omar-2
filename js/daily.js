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

function getMonths(data){
  const set=new Set();
  data.forEach(r=>{ const m=(r.date||'').slice(0,7); if(m) set.add(m); });
  if(set.size===0){ for(let i=0;i<6;i++){ let d=new Date(); d.setMonth(d.getMonth()-i); set.add(d.toISOString().slice(0,7)); } }
  return Array.from(set).sort();
}

export function renderDaily(){
  const data=L(KEY,[]);
  const cats=getCats();
  const months=getMonths(data);
  const monthLabels=months.map(m=>{ const [y,mo]=m.split('-'); return `${mo}/${y.slice(2)}` });

  // ===== الإجمالي هو الماستر الوحيد - هنا بس تعدل الفئات =====
  if(tab==='total'){
    const sumCatMonth=(type,cat,month)=> data.filter(x=>x.type===type && x.category===cat && (x.date||'').slice(0,7)===month).reduce((s,x)=>s+x.amount,0);
    const sumMonth=(type,month)=> data.filter(x=>x.type===type && (x.date||'').slice(0,7)===month).reduce((s,x)=>s+x.amount,0);

    const buildMasterTable=(title,key,type,color)=>{
      return `
      <div class="card" style="padding:0; overflow:hidden; border:1.5px solid ${color}30">
        <div style="padding:12px 14px; background:${color}; color:#fff; display:flex; justify-content:space-between; align-items:center">
          <b>📋 جدول ${title} - الماستر</b><span style="background:rgba(255,255,255,.2); padding:4px 10px; border-radius:20px; font-size:11px">${cats[key].length} بند • يغذي تبويب ${title}</span>
        </div>
        <div style="padding:12px">
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px">
            ${cats[key].map(c=>`<span class="cat" style="border-color:${color}40; background:${color}10">${c} <b data-action="editCatMaster" data-key="${key}" data-old="${c}">✏️</b> <b data-action="delCatMaster" data-key="${key}" data-cat="${c}">✕</b></span>`).join('')}
          </div>
          <div class="inp"><input id="new-${key}" placeholder="إضافة بند جديد في ${title}..."><button class="btn-sm" style="background:${color}; color:#fff; padding:12px 16px" data-action="addCatMaster" data-key="${key}">+ إضافة بند</button></div>
        </div>
        <div style="overflow-x:auto">
          <table class="pro-table" style="min-width:600px; margin:0; border-radius:0">
            <tr><th style="position:sticky; right:0; background:#f8fafc; min-width:110px">البند / الشهر</th>${monthLabels.map(l=>`<th style="text-align:center; min-width:65px">${l}</th>`).join('')}<th style="background:#0f172a; color:#fff">الإجمالي</th></tr>
            ${cats[key].map(cat=>{
              const total=months.reduce((s,m)=>s+sumCatMonth(type,cat,m),0);
              return `<tr><td style="position:sticky; right:0; background:#fff; font-weight:800; border-left:3px solid ${color}">${cat}</td>${months.map(m=>`<td style="text-align:center">${sumCatMonth(type,cat,m)? fmt(sumCatMonth(type,cat,m)).replace(' ج','') : '-'}</td>`).join('')}<td style="text-align:center; font-weight:800; background:#f8fafc; color:${color}">${fmt(total)}</td></tr>`
            }).join('')}
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
        <button class="active" data-action="setTab" data-tab="total">الإجمالي ⭐ ماستر</button>
      </div>
      <div style="margin-top:8px; font-size:10px; background:#fef3c7; color:#92400e; padding:8px 10px; border-radius:8px; font-weight:700">⭐ هنا بس تعدل أسماء الفئات - كل تبويب بيسحب من الجدول بتاعه</div>
    </div>
    ${buildMasterTable('الدخل','income','income','#10b981')}
    ${buildMasterTable('المصروفات','expense','expense','#e11d48')}
    ${buildMasterTable('الديون المستحقة','due','due','#f59e0b')}
    ${buildMasterTable('الديون المؤجلة','deferred','deferred','#6366f1')}

    <div class="card" style="padding:0; overflow:auto">
      <div style="padding:14px; background:#0f172a; color:#fff"><b>📊 تقرير شهري شامل</b></div>
      <table class="pro-table" style="min-width:600px; margin:0"><tr><th>الشهر</th><th>دخل</th><th>مصروف</th><th>صافي</th><th>مستحقة</th><th>مؤجلة</th></tr>
      ${months.slice().reverse().map(m=>{ const inc=sumMonth('income',m), exp=sumMonth('expense',m), due=sumMonth('due',m), def=sumMonth('deferred',m); return `<tr><td><b>${m}</b></td><td style="color:#10b981">${fmt(inc)}</td><td style="color:#e11d48">${fmt(exp)}</td><td style="font-weight:800; background:${inc-exp>=0?'#ecfdf5':'#fff1f2'}">${fmt(inc-exp)}</td><td>${fmt(due)}</td><td>${fmt(def)}</td></tr>`}).join('')}
      </table>
    </div>
    `;
  }

  // ===== الدخل - المصروف - الديون : بيسحبوا الأسماء من الإجمالي فقط =====
  let curCats=[], curData=[], title='', color='', masterKey='';
  if(tab==='income'){ masterKey='income'; curCats=cats.income; curData=data.filter(x=>x.type==='income'); title='الدخل'; color='#10b981'; }
  if(tab==='expense'){ masterKey='expense'; curCats=cats.expense; curData=data.filter(x=>x.type==='expense'); title='المصروف'; color='#e11d48'; }
  if(tab==='debts'){
    masterKey = debtType==='due'? 'due' : 'deferred';
    curCats = cats[masterKey];
    curData = data.filter(x=>x.type===masterKey);
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
    <div style="margin-top:8px; font-size:10px; background:${color}15; color:${color}; padding:6px 10px; border-radius:8px; border:1px solid ${color}30">🔗 بيسحب الأسماء من جدول ${title} في الإجمالي - ${curCats.length} بند متاح</div>
  </div>

  <div class="card">
    <b style="color:${color}">＋ إضافة ${title} - اختر البند من الإجمالي</b>
    <div class="inp" style="margin-top:12px">
      <select id="dCat" style="flex:1"><option value="">▼ اختر البند من جدول ${title} في الإجمالي...</option>${curCats.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
      <input id="dAmount" type="number" placeholder="المبلغ" style="flex:.6">
    </div>
    <div class="inp">
      <input id="dDesc" placeholder="وصف (اختياري)" style="flex:1">
      <input id="dDate" type="date" value="${new Date().toISOString().slice(0,10)}" style="flex:.6">
    </div>
    <button class="btn" style="background:${color}; margin-top:8px" data-action="addRow">💾 حفظ ${title}</button>
    ${curCats.length===0?`<div style="margin-top:10px; padding:10px; background:#fffbeb; border-radius:10px; font-size:11px; color:#92400e">⚠️ لا يوجد بنود - روح تبويب الإجمالي وأضف بنود في جدول ${title} الأول</div>`:''}
  </div>

  <table class="pro-table">
    <tr><th>البند (من الإجمالي)</th><th>المبلغ</th><th>الشهر</th><th></th></tr>
    ${curData.map(r=>`<tr><td><b>${r.category}</b><br><small style="color:#94a3b8">${r.desc||''}</small></td><td><b style="color:${color}">${fmt(r.amount)}</b></td><td style="font-size:11px">${(r.date||'').slice(0,7)}</td><td><div style="display:flex; gap:4px"><button class="btn-sm" style="background:#eef2ff" data-action="editRow" data-id="${r.id}">✏️</button><button class="btn-sm" style="background:#fff1f2; color:#e11d48" data-action="delRow" data-id="${r.id}">✕</button></div></td></tr>`).join('') || `<tr><td colspan="4" style="text-align:center; padding:20px; color:#94a3b8">لا يوجد ${title} - اختر بند من الإجمالي</td></tr>`}
  </table>
  `;
}

export function handleDaily(btn,e,rerender){
  const cats=getCats();
  if(btn.dataset.action==='setTab'){ tab=btn.dataset.tab; rerender(); return; }
  if(btn.dataset.action==='setDebtType'){ debtType=btn.dataset.type; rerender(); return; }

  // الماستر فقط في الإجمالي
  if(btn.dataset.action==='addCatMaster'){ const k=btn.dataset.key; const v=document.getElementById(`new-${k}`)?.value.trim(); if(!v) return; cats[k].push(v); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='delCatMaster'){ if(!confirm('حذف البند من الماستر؟')) return; const {key,cat}=btn.dataset; cats[key]=cats[key].filter(x=>x!==cat); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='editCatMaster'){ const {key,old}=btn.dataset; const nv=prompt('تعديل البند:',old); if(!nv?.trim()) return; cats[key]=cats[key].map(x=>x===old?nv.trim():x); saveCats(cats); let all=L(KEY,[]); all.forEach(o=>{ if(o.category===old && o.type===key) o.category=nv.trim(); }); S(KEY,all); rerender(); return; }

  // الإضافة في التبويبات العادية - بتسحب من الماستر بس
  if(btn.dataset.action==='addRow'){
    const cat=document.getElementById('dCat')?.value, amount=+document.getElementById('dAmount')?.value;
    if(!cat) return alert('⚠️ اختر البند من جدول الإجمالي');
    if(!amount) return alert('ادخل المبلغ');
    const all=L(KEY,[]);
    const type = tab==='debts'? debtType : tab;
    all.unshift({id:uid(), category:cat, amount, desc:document.getElementById('dDesc')?.value.trim(), type, date:document.getElementById('dDate')?.value? new Date(document.getElementById('dDate').value).toISOString() : new Date().toISOString()});
    S(KEY,all); rerender(); return;
  }
  if(btn.dataset.action==='delRow'){ if(!confirm('حذف؟')) return; S(KEY, L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
  if(btn.dataset.action==='editRow'){
    const all=L(KEY,[]); const item=all.find(x=>x.id===btn.dataset.id); if(!item) return;
    const na=prompt('المبلغ:',item.amount); if(na===null) return; const nd=prompt('الوصف:',item.desc||''); if(nd===null) return;
    item.amount=+na||item.amount; item.desc=nd.trim(); S(KEY,all); rerender(); return;
  }
}

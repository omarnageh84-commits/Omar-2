import { L, S, uid, fmt } from './utils.js';

const KEY='daily_v6';
const CATS='cats_final_v1';
const DEFAULT={
  income:['راتب صيدلية','مكافأة'],
  expense:['أكل','مواصلات','إيجار','صيدلية'],
  due:['سلفة','جمعية'],
  deferred:['قرض','أقساط']
};

let tab='income';
let debtType='due';
const getCats=()=>L(CATS, DEFAULT);
const saveCats=c=>S(CATS,c);
function getMonths(data){
  const set=new Set();
  data.forEach(r=>{ const m=(r.date||'').slice(0,7); if(m) set.add(m); });
  if(!set.size){ for(let i=0;i<4;i++){ let d=new Date(); d.setMonth(d.getMonth()-i); set.add(d.toISOString().slice(0,7)); } }
  return Array.from(set).sort();
}

export function renderDaily(){
  const data=L(KEY,[]);
  const cats=getCats();
  const months=getMonths(data);
  const monthLabels=months.map(m=>{ const [y,mo]=m.split('-'); return `${mo}/${y.slice(2)}`; });

  if(tab==='total'){
    const sumCatMonth=(type,cat,month)=> data.filter(x=>x.type===type && x.category===cat && (x.date||'').slice(0,7)===month).reduce((s,x)=>s+x.amount,0);
    const buildMaster=(title,key,type)=>{
      return `
      <div class="card daily-master ${key}">
        <div class="daily-master-header ${key}"><b>📋 جدول ${title}</b><small>${cats[key].length} بند</small></div>
        <div style="overflow-x:auto">
          <table class="pro-table" style="min-width:500px; margin:0; border-radius:0">
            <tr><th class="sticky-col ${key}" style="min-width:110px; background:#f8fafc">البند</th>${monthLabels.map(l=>`<th style="text-align:center; min-width:55px">${l}</th>`).join('')}<th style="text-align:center; background:#0f172a; color:#fff">الإجمالي</th><th style="width:60px"></th></tr>
            ${cats[key].map(cat=>{
              const total=months.reduce((s,m)=>s+sumCatMonth(type,cat,m),0);
              return `<tr><td class="sticky-col ${key}">${cat}</td>${months.map(m=>{ const v=sumCatMonth(type,cat,m); return `<td style="text-align:center">${v? fmt(v).replace(' ج','') : '-'}</td>`}).join('')}<td style="text-align:center; font-weight:800; background:#f8fafc">${fmt(total).replace(' ج','')}</td><td><button class="btn-sm btn-edit-sm" data-action="editCatMaster" data-key="${key}" data-old="${cat}">✏️</button><button class="btn-sm btn-del-sm" data-action="delCatMaster" data-key="${key}" data-cat="${cat}">✕</button></td></tr>`
            }).join('')}
            <tfoot><tr><td colspan="${months.length+3}"><div style="display:flex; gap:6px"><input id="new-${key}" placeholder="إضافة بند جديد في ${title}..."><button class="btn-sm btn-${key}" data-action="addCatMaster" data-key="${key}">+ إضافة</button></div></td></tr></tfoot>
          </table>
        </div>
      </div>`;
    };
    return `<div class="card" style="padding:8px"><div class="seg" style="grid-template-columns:repeat(4,1fr)"><button data-action="setTab" data-tab="income">الدخل</button><button data-action="setTab" data-tab="expense">المصروف</button><button data-action="setTab" data-tab="debts">الديون</button><button class="active" data-action="setTab" data-tab="total">الإجمالي ⭐</button></div></div>
    ${buildMaster('الدخل','income','income')}
    ${buildMaster('المصروفات','expense','expense')}
    ${buildMaster('المستحقة','due','due')}
    ${buildMaster('المؤجلة','deferred','deferred')}`;
  }

  let curCats=[], curData=[], title='', key='';
  if(tab==='income'){ key='income'; curCats=cats.income; curData=data.filter(x=>x.type==='income'); title='الدخل'; }
  if(tab==='expense'){ key='expense'; curCats=cats.expense; curData=data.filter(x=>x.type==='expense'); title='المصروف'; }
  if(tab==='debts'){ key=debtType; curCats=cats[key]; curData=data.filter(x=>x.type===key); title=debtType==='due'?'المستحقة':'المؤجلة'; }

  return `
  <div class="card" style="padding:8px"><div class="seg" style="grid-template-columns:repeat(4,1fr)"><button class="${tab==='income'?'active':''}" data-action="setTab" data-tab="income">الدخل</button><button class="${tab==='expense'?'active':''}" data-action="setTab" data-tab="expense">المصروف</button><button class="${tab==='debts'?'active':''}" data-action="setTab" data-tab="debts">الديون</button><button class="${tab==='total'?'active':''}" data-action="setTab" data-tab="total">الإجمالي</button></div>${tab==='debts'?`<div class="seg" style="margin-top:6px; grid-template-columns:1fr 1fr"><button class="${debtType==='due'?'active':''}" data-action="setDebtType" data-type="due">مستحقة</button><button class="${debtType==='deferred'?'active':''}" data-action="setDebtType" data-type="deferred">مؤجلة</button></div>`:''}</div>

  <div class="card daily-master ${key}">
    <div class="daily-master-header ${key}"><b>💰 ${title} - ${curCats.length} بند</b><small>من جدول ${title}</small></div>
    <table class="pro-table" style="border:0; margin:0; border-radius:0">
      <tr><th>المبلغ</th><th>البند</th><th>التاريخ</th><th style="width:50px"></th></tr>
      ${curData.map(r=>`<tr><td>${fmt(r.amount).replace(' ج','')}</td><td>${r.category}</td><td>${(r.date||'').slice(0,10)}</td><td><button class="btn-sm btn-del-sm" data-action="delRow" data-id="${r.id}">✕</button></td></tr>`).join('') || `<tr><td colspan="4" style="text-align:center; padding:16px; color:#94a3b8">لا يوجد ${title}</td></tr>`}
      <tfoot>
        <tr>
          <td><input id="dAmount" type="number" placeholder="المبلغ"></td>
          <td><select id="dCat"><option value="">اختر البند</option>${curCats.map(c=>`<option>${c}</option>`).join('')}</select></td>
          <td><input id="dDate" type="date" value="${new Date().toISOString().slice(0,10)}"></td>
          <td><button class="btn-sm btn-${key}" data-action="addRow">+ إضافة</button></td>
        </tr>
      </tfoot>
    </table>
  </div>
  `;
}

export function handleDaily(btn,e,rerender){
  const cats=getCats();
  const getKey=()=> tab==='income'? 'income' : tab==='expense'? 'expense' : debtType;
  if(btn.dataset.action==='setTab'){ tab=btn.dataset.tab; rerender(); return; }
  if(btn.dataset.action==='setDebtType'){ debtType=btn.dataset.type; rerender(); return; }
  if(btn.dataset.action==='addCatMaster'){ const k=btn.dataset.key; const v=document.getElementById(`new-${k}`)?.value.trim(); if(!v) return; cats[k].push(v); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='delCatMaster'){ if(!confirm('حذف البند؟')) return; const {key,cat}=btn.dataset; cats[key]=cats[key].filter(x=>x!==cat); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='editCatMaster'){ const {key,old}=btn.dataset; const nv=prompt('تعديل:',old); if(!nv?.trim()) return; cats[key]=cats[key].map(x=>x===old?nv.trim():x); saveCats(cats); let all=L(KEY,[]); all.forEach(o=>{ if(o.category===old && o.type===key) o.category=nv.trim(); }); S(KEY,all); rerender(); return; }
  if(btn.dataset.action==='addRow'){
    const cat=document.getElementById('dCat')?.value, amount=+document.getElementById('dAmount')?.value;
    if(!amount){ alert('ادخل المبلغ أولاً'); return; } if(!cat){ alert('اختر البند'); return; }
    const all=L(KEY,[]); all.unshift({id:uid(), category:cat, amount, desc:'', type:getKey(), date:document.getElementById('dDate')?.value? new Date(document.getElementById('dDate').value).toISOString() : new Date().toISOString()}); S(KEY,all); rerender(); return;
  }
  if(btn.dataset.action==='delRow'){ if(!confirm('حذف؟')) return; S(KEY, L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
}

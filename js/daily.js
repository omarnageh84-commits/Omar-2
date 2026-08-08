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
  if(set.size===0){
    for(let i=0;i<4;i++){ let d=new Date(); d.setMonth(d.getMonth()-i); set.add(d.toISOString().slice(0,7)); }
  }
  return Array.from(set).sort();
}

export function renderDaily(){
  const data=L(KEY,[]);
  const cats=getCats();
  const months=getMonths(data);
  const monthLabels=months.map(m=>{ const [y,mo]=m.split('-'); return `${mo}/${y.slice(2)}`; });

  // ===== الإجمالي هو الماستر الوحيد =====
  if(tab==='total'){
    const sumCatMonth=(type,cat,month)=> data.filter(x=>x.type===type && x.category===cat && (x.date||'').slice(0,7)===month).reduce((s,x)=>s+x.amount,0);
    const sumMonth=(type,month)=> data.filter(x=>x.type===type && (x.date||'').slice(0,7)===month).reduce((s,x)=>s+x.amount,0);

    const buildMaster=(title,key,type,color)=>{
      return `
      <div class="card" style="padding:0; overflow:hidden; border:1.2px solid ${color}20">
        <div style="padding:10px 12px; background:${color}; color:#fff; display:flex; justify-content:space-between; align-items:center">
          <b style="font-size:12px">📋 جدول ${title}</b><span style="background:rgba(255,255,255,.2); padding:3px 8px; border-radius:20px; font-size:10px">${cats[key].length} بند</span>
        </div>
        <div style="overflow-x:auto">
          <table class="pro-table" style="min-width:500px; margin:0; border:0; border-radius:0">
            <tr>
              <th style="min-width:110px; position:sticky; right:0; background:#f8fafc; z-index:1">البند</th>
              ${monthLabels.map(l=>`<th style="text-align:center; min-width:55px">${l}</th>`).join('')}
              <th style="text-align:center; background:#0f172a; color:#fff">الإجمالي</th>
              <th style="width:60px; text-align:center">تحكم</th>
            </tr>
            ${cats[key].map(cat=>{
              const total=months.reduce((s,m)=>s+sumCatMonth(type,cat,m),0);
              return `<tr>
                <td style="position:sticky; right:0; background:#fff; font-weight:800; border-left:2px solid ${color}; font-size:11px">${cat}</td>
                ${months.map(m=>{ const v=sumCatMonth(type,cat,m); return `<td style="text-align:center">${v? fmt(v).replace(' ج','') : '-'}</td>`}).join('')}
                <td style="text-align:center; font-weight:800; background:#f8fafc; color:${color}">${fmt(total).replace(' ج','')}</td>
                <td><div style="display:flex; gap:3px"><button class="btn-sm" style="background:#eef2ff" data-action="editCatMaster" data-key="${key}" data-old="${cat}">✏️</button><button class="btn-sm" style="background:#fff1f2; color:#e11d48" data-action="delCatMaster" data-key="${key}" data-cat="${cat}">✕</button></div></td>
              </tr>`
            }).join('')}
            <tfoot>
              <tr>
                <td colspan="${months.length+3}" style="padding:8px">
                  <div style="display:flex; gap:6px">
                    <input id="new-${key}" placeholder="إضافة بند جديد في ${title}..." style="flex:1">
                    <button class="btn-sm" style="background:${color}; color:#fff; padding:8px 14px" data-action="addCatMaster" data-key="${key}">+ إضافة</button>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`;
    };

    return `
    <div class="card" style="padding:8px">
      <div class="seg" style="grid-template-columns:repeat(4,1fr)">
        <button data-action="setTab" data-tab="income">الدخل</button>
        <button data-action="setTab" data-tab="expense">المصروف</button>
        <button data-action="setTab" data-tab="debts">الديون</button>
        <button class="active" data-action="setTab" data-tab="total">الإجمالي ⭐</button>
      </div>
    </div>
    ${buildMaster('الدخل','income','income','#10b981')}
    ${buildMaster('المصروفات','expense','expense','#e11d48')}
    ${buildMaster('المستحقة','due','due','#f59e0b')}
    ${buildMaster('المؤجلة','deferred','deferred','#6366f1')}
    <div class="card" style="padding:0; overflow:auto">
      <div style="padding:10px 12px; background:#0f172a; color:#fff; font-size:12px"><b>📊 تقرير شهري شامل</b></div>
      <table class="pro-table" style="min-width:500px; margin:0; border-radius:0">
        <tr><th>الشهر</th><th>دخل</th><th>مصروف</th><th>صافي</th><th>مستحقة</th><th>مؤجلة</th></tr>
        ${months.slice().reverse().map(m=>{
          const inc=sumMonth('income',m), exp=sumMonth('expense',m), due=sumMonth('due',m), def=sumMonth('deferred',m);
          return `<tr><td><b>${m}</b></td><td style="color:#10b981">${fmt(inc).replace(' ج','')}</td><td style="color:#e11d48">${fmt(exp).replace(' ج','')}</td><td style="font-weight:800; background:${inc-exp>=0?'#ecfdf5':'#fff1f2'}">${fmt(inc-exp).replace(' ج','')}</td><td>${fmt(due).replace(' ج','')}</td><td>${fmt(def).replace(' ج','')}</td></tr>`
        }).join('')}
      </table>
    </div>
    `;
  }

  // ===== الدخل / المصروف / الديون - بتسحب من الإجمالي =====
  let curCats=[], curData=[], title='', color='', key='';
  if(tab==='income'){ key='income'; curCats=cats.income; curData=data.filter(x=>x.type==='income'); title='الدخل'; color='#10b981'; }
  if(tab==='expense'){ key='expense'; curCats=cats.expense; curData=data.filter(x=>x.type==='expense'); title='المصروف'; color='#e11d48'; }
  if(tab==='debts'){ key=debtType; curCats=cats[key]; curData=data.filter(x=>x.type===key); title=debtType==='due'?'المستحقة':'المؤجلة'; color=debtType==='due'?'#f59e0b':'#6366f1'; }

  return `
  <div class="card" style="padding:8px">
    <div class="seg" style="grid-template-columns:repeat(4,1fr)">
      <button class="${tab==='income'?'active':''}" data-action="setTab" data-tab="income">الدخل</button>
      <button class="${tab==='expense'?'active':''}" data-action="setTab" data-tab="expense">المصروف</button>
      <button class="${tab==='debts'?'active':''}" data-action="setTab" data-tab="debts">الديون</button>
      <button class="${tab==='total'?'active':''}" data-action="setTab" data-tab="total">الإجمالي</button>
    </div>
    ${tab==='debts'?`<div class="seg" style="margin-top:6px; grid-template-columns:1fr 1fr"><button class="${debtType==='due'?'active':''}" data-action="setDebtType" data-type="due">مستحقة</button><button class="${debtType==='deferred'?'active':''}" data-action="setDebtType" data-type="deferred">مؤجلة</button></div>`:''}
  </div>

  <div class="card" style="padding:0; overflow:hidden; border:1px solid ${color}20">
    <div style="padding:10px 12px; display:flex; justify-content:space-between; background:${color}10; border-bottom:1px solid ${color}20">
      <b style="color:${color}; font-size:12px">💰 ${title} - ${curCats.length} بند</b><small style="font-size:10px; color:#64748b">من جدول ${title} في الإجمالي</small>
    </div>
    <table class="pro-table" style="border:0; margin:0; border-radius:0">
      <tr><th>البند</th><th>المبلغ</th><th>التاريخ</th><th style="width:50px"></th></tr>
      ${curData.map(r=>`<tr><td><b style="font-size:11px">${r.category}</b><br><small style="color:#94a3b8; font-size:9px">${r.desc||''}</small></td><td><b style="color:${color}">${fmt(r.amount).replace(' ج','')}</b></td><td style="font-size:10px">${(r.date||'').slice(0,7)}</td><td><button class="btn-sm" style="background:#fff1f2; color:#e11d48" data-action="delRow" data-id="${r.id}">✕</button></td></tr>`).join('') || `<tr><td colspan="4" style="text-align:center; padding:16px; color:#94a3b8; font-size:11px">لا يوجد ${title}</td></tr>`}
      <tfoot>
        <tr>
          <td><select id="dCat" style="padding:7px; font-size:11px"><option value="">اختر البند</option>${curCats.map(c=>`<option>${c}</option>`).join('')}</select></td>
          <td><input id="dAmount" type="number" placeholder="المبلغ"></td>
          <td><input id="dDate" type="date" value="${new Date().toISOString().slice(0,10)}"></td>
          <td><button class="btn-sm" style="background:${color}; color:#fff" data-action="addRow">+ إضافة</button></td>
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
    if(!cat){ alert('اختر البند'); return; } if(!amount){ alert('المبلغ'); return; }
    const all=L(KEY,[]); all.unshift({id:uid(), category:cat, amount, desc:'', type:getKey(), date:document.getElementById('dDate')?.value? new Date(document.getElementById('dDate').value).toISOString() : new Date().toISOString()});
    S(KEY,all); rerender(); return;
  }
  if(btn.dataset.action==='delRow'){ if(!confirm('حذف؟')) return; S(KEY, L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
}

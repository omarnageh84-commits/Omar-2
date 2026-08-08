import { L, S, uid, fmt } from './utils.js';
const KEY='daily_v6', CATS='cats_v7_master';
const DEFAULT={
  income:['راتب صيدلية','مكافأة','شفت إضافي'],
  expense:['أكل','مواصلات','إيجار','صيدلية','سوبر ماركت','شحن'],
  due:['دين مستحق - سلفة','دين مستحق - جمعية','ذمم'],
  deferred:['دين مؤجل - قرض','دين مؤجل - تقسيط','أقساط']
};
let tab='income'; // ترتيب: income, expense, due, deferred, total (total آخر واحد شمال)

const getCats=()=>L(CATS, DEFAULT);
const saveCats=c=>S(CATS,c);

export function renderDaily(){
  const data=L(KEY,[]), cats=getCats();
  const by = t => data.filter(x=>x.type===t);
  const sum = arr => arr.reduce((s,x)=>s+x.amount,0);

  // الإجمالي آخر تبويب على الشمال - جواه 4 جداول
  if(tab==='total'){
    return `
    <div class="card" style="background:#0f172a; color:#fff; border:0">
      <b>📊 الإجمالي - الماستر</b><br><small style="opacity:.6">كل الجداول بتغذي الصفحات التانية</small>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px">
        <div style="background:rgba(255,255,255,.08); padding:10px; border-radius:12px"><small>دخل</small><br><b style="color:#34d399">${fmt(sum(by('income')))}</b></div>
        <div style="background:rgba(255,255,255,.08); padding:10px; border-radius:12px"><small>مصروف</small><br><b style="color:#fb7185">${fmt(sum(by('expense')))}</b></div>
        <div style="background:rgba(255,255,255,.08); padding:10px; border-radius:12px"><small>مستحق</small><br><b style="color:#fbbf24">${fmt(sum(by('due')))}</b></div>
        <div style="background:rgba(255,255,255,.08); padding:10px; border-radius:12px"><small>مؤجل</small><br><b style="color:#a78bfa">${fmt(sum(by('deferred')))}</b></div>
      </div>
    </div>

    ${renderMasterTable('الدخل','income','income','🟢','الدخل',by('income'))}
    ${renderMasterTable('المصروفات','expense','expense','🔴','المصروف',by('expense'))}
    ${renderMasterTable('الديون المستحقة','due','due','🟡','دين مستحق',by('due'))}
    ${renderMasterTable('الديون المؤجلة','deferred','deferred','🟣','دين مؤجل',by('deferred'))}
    `;
  }

  // الصفحات العادية
  const map={income:{title:'دخل',c:cats.income,d:by('income'),col:'#10b981'}, expense:{title:'مصروف',c:cats.expense,d:by('expense'),col:'#e11d48'}, due:{title:'دين مستحق',c:cats.due,d:by('due'),col:'#f59e0b'}, deferred:{title:'دين مؤجل',c:cats.deferred,d:by('deferred'),col:'#6366f1'}};
  const cur=map[tab];
  return `
  <div class="card" style="padding:10px">
    <div class="seg cols-5">
      <button class="${tab==='income'?'active':''}" data-action="setTab" data-tab="income">دخل</button>
      <button class="${tab==='expense'?'active':''}" data-action="setTab" data-tab="expense">مصروف</button>
      <button class="${tab==='due'?'active':''}" data-action="setTab" data-tab="due">مستحقة</button>
      <button class="${tab==='deferred'?'active':''}" data-action="setTab" data-tab="deferred">مؤجلة</button>
      <button class="${tab==='total'?'active':''}" data-action="setTab" data-tab="total">الإجمالي</button>
    </div>
    <div style="margin-top:8px; font-size:10px; color:#64748b; background:#f8fafc; padding:6px 10px; border-radius:8px">الفئات من الإجمالي - ${cur.c.length} فئة</div>
  </div>
  <div class="card">
    <b style="color:${cur.col}">+ ${cur.title}</b>
    <div class="inp"><input id="dDesc" placeholder="الوصف"><input id="dAmount" type="number" placeholder="المبلغ"></div>
    <div class="inp"><select id="dCat">${cur.c.map(x=>`<option>${x}</option>`).join('')}</select><input id="dDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
    <button class="btn" style="background:${cur.col}" data-action="addRow">حفظ</button>
  </div>
  <table class="pro-table"><tr><th>الوصف</th><th>الفئة</th><th>المبلغ</th><th></th></tr>
  ${cur.d.map(r=>`<tr><td>${r.desc}<br><small style="color:#94a3b8">${r.date?.slice(0,10)||''}</small></td><td>${r.category}</td><td><b>${fmt(r.amount)}</b></td><td><div class="table-actions"><button class="btn-edit" data-action="editRow" data-id="${r.id}">✏️</button><button class="btn-del" data-action="delRow" data-id="${r.id}">✕</button></div></td></tr>`).join('') || `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px">لا يوجد</td></tr>`}
  </table>
  `;
}

function renderMasterTable(title,key,type,icon,label,rows){
  const cats=getCats();
  const sum=rows.reduce((s,x)=>s+x.amount,0);
  return `
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px"><b>${icon} جدول ${title}</b><span style="background:#f1f5f9; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:800">${rows.length} صف • ${fmt(sum)}</span></div>
    <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px">
      ${cats[key].map(c=>`<span class="cat">${c} <b data-action="editCat" data-key="${key}" data-old="${c}">✏️</b> <b data-action="delCat" data-key="${key}" data-cat="${c}">✕</b></span>`).join('')}
    </div>
    <div class="inp"><input id="new-${key}" placeholder="إضافة فئة ${label}..."><button class="btn-sm" style="background:#0f172a; color:#fff" data-action="addCat" data-key="${key}">+ إضافة فئة</button></div>
    <table class="pro-table">
      <tr><th>الاسم</th><th>الوصف</th><th>المبلغ</th><th>إجراءات</th></tr>
      ${rows.map(r=>`<tr><td><b>${r.category}</b></td><td>${r.desc}</td><td><b style="color:${type==='income'?'#10b981':type==='expense'?'#e11d48':type==='due'?'#f59e0b':'#6366f1'}">${fmt(r.amount)}</b></td><td><div class="table-actions"><button class="btn-edit" data-action="editRowMaster" data-id="${r.id}">✏️</button><button class="btn-del" data-action="delRow" data-id="${r.id}">✕</button></div></td></tr>`).join('') || `<tr><td colspan="4" style="text-align:center; color:#94a3b8">فارغ - ضيف أول صف من تبويب ${label}</td></tr>`}
    </table>
  </div>`;
}

export function handleDaily(btn,e,rerender){
  const cats=getCats();
  if(btn.dataset.action==='setTab'){ tab=btn.dataset.tab; rerender(); return; }
  if(btn.dataset.action==='addCat'){ const k=btn.dataset.key; const v=document.getElementById(`new-${k}`)?.value.trim(); if(!v) return; cats[k].push(v); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='delCat'){ if(!confirm('حذف الفئة؟')) return; const {key,cat}=btn.dataset; cats[key]=cats[key].filter(x=>x!==cat); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='editCat'){ const {key,old}=btn.dataset; const nv=prompt('الاسم الجديد:',old); if(!nv?.trim()) return; cats[key]=cats[key].map(x=>x===old?nv.trim():x); saveCats(cats); let all=L(KEY,[]); all.forEach(o=>{ if(o.category===old && o.type===key) o.category=nv.trim(); }); S(KEY,all); rerender(); return; }
  if(btn.dataset.action==='addRow'){
    const desc=document.getElementById('dDesc')?.value.trim(), amount=+document.getElementById('dAmount')?.value, cat=document.getElementById('dCat')?.value, date=document.getElementById('dDate')?.value;
    if(!desc||!amount) return alert('كمل البيانات');
    const all=L(KEY,[]); all.unshift({id:uid(), desc, amount, category:cat, type:tab, date:date?new Date(date).toISOString():new Date().toISOString()}); S(KEY,all); rerender(); return;
  }
  if(btn.dataset.action==='delRow'){ if(!confirm('حذف الصف؟')) return; S(KEY, L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
  if(btn.dataset.action==='editRow' || btn.dataset.action==='editRowMaster'){
    const all=L(KEY,[]); const item=all.find(x=>x.id===btn.dataset.id); if(!item) return;
    const nd=prompt('الوصف:',item.desc); if(nd===null) return; const na=prompt('المبلغ:',item.amount); if(na===null) return;
    item.desc=nd.trim()||item.desc; item.amount=+na||item.amount; S(KEY,all); rerender(); return;
  }
}

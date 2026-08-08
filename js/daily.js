import { L, S, uid, formatEGP } from './utils.js';
const KEY='daily_v6', CATS_KEY='cats_daily_v6';
let activeTab='income';
export function renderDaily(){
  const data=L(KEY,[]), cats=L(CATS_KEY,{income:['راتب','مكافأة'],expense:['أكل','مواصلات'],debt:['دين لي','دين علي']});
  const cur=cats[activeTab]||[], filtered=data.filter(x=>x.type===activeTab);
  const rep={}; cur.forEach(c=>rep[c]=filtered.filter(x=>x.category===c).reduce((s,x)=>s+x.amount,0));
  return `<div class="card"><div class="seg"><button class="${activeTab==='income'?'active':''}" data-action="setTab" data-tab="income">دخل</button><button class="${activeTab==='expense'?'active':''}" data-action="setTab" data-tab="expense">مصروف</button><button class="${activeTab==='debt'?'active':''}" data-action="setTab" data-tab="debt">ديون</button></div>
  ${cur.map(c=>`<span class="cat">${c} <b data-action="delCat" data-type="${activeTab}" data-cat="${c}">x</b></span>`).join('')}<div class="inp"><input id="newCat" placeholder="فئة جديدة"><button class="btn-sm" style="background:var(--green);color:#fff" data-action="addCat" data-type="${activeTab}">+ إضافة</button></div></div>
  <div class="card"><div class="inp"><input id="dDesc" placeholder="الوصف"><input id="dAmount" type="number" placeholder="المبلغ"></div><div class="inp"><select id="dCat">${cur.map(c=>`<option>${c}</option>`).join('')}</select></div><button class="btn" data-action="addDaily">إضافة</button></div>
  <div class="card"><div class="h-scroll"><table><tr><th>الفئة</th><th>الإجمالي</th></tr>${Object.entries(rep).map(([k,v])=>`<tr><td>${k}</td><td>${formatEGP(v)}</td></tr>`).join('')}</table></div></div>
  <div style="margin:10px">${filtered.map(x=>`<div class="card" style="display:flex;justify-content:space-between;margin:6px 0"><span>${x.desc}</span><span><b>${x.amount}</b> <button class="btn-sm" style="background:#fee2e2" data-action="delDaily" data-id="${x.id}">x</button></span></div>`).join('')}</div>`;
}
export function handleDaily(btn,e,rerender){
  const a=btn.dataset.action;
  if(a==='setTab'){activeTab=btn.dataset.tab; rerender();}
  if(a==='addCat'){const v=document.getElementById('newCat')?.value.trim(); if(!v)return; const c=L(CATS_KEY,{income:[],expense:[],debt:[]}); c[btn.dataset.type].push(v); S(CATS_KEY,c); rerender();}
  if(a==='delCat'){const c=L(CATS_KEY,{income:[],expense:[],debt:[]}); c[btn.dataset.type]=c[btn.dataset.type].filter(x=>x!==btn.dataset.cat); S(CATS_KEY,c); rerender();}
  if(a==='addDaily'){const desc=document.getElementById('dDesc')?.value.trim(), amount=+document.getElementById('dAmount')?.value, cat=document.getElementById('dCat')?.value; if(!desc||!amount)return alert('كمل البيانات'); const all=L(KEY,[]); all.unshift({id:uid(),desc,amount,category:cat,type:activeTab,date:new Date().toISOString()}); S(KEY,all); rerender();}
  if(a==='delDaily'){let all=L(KEY,[]); all=all.filter(x=>x.id!==btn.dataset.id); S(KEY,all); rerender();}
}

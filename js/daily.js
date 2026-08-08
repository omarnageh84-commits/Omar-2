// daily.js - V6.1 FIXED
import { L, S, uid, formatEGP } from './utils.js';
import { syncToSheet } from './sheets.js';

const KEY = 'daily_v6';
const CATS_KEY = 'cats_daily_v6';
let activeTab = 'income';

export function renderDaily(){
  const data = L(KEY, []);
  const cats = L(CATS_KEY, {income:['راتب','مكافأة'], expense:['أكل','مواصلات','صيدلية'], debt:['دين لي','دين علي']});
  const curCats = cats[activeTab] || [];
  const labelMap = {income:'دخل', expense:'مصروف', debt:'دين'};
  const filtered = data.filter(x=>x.type===activeTab);
  const report = {};
  curCats.forEach(c=> report[c]=filtered.filter(x=>x.category===c).reduce((s,x)=>s+x.amount,0));

  return `
    <div class="card">
      <div class="seg">
        <button class="${activeTab==='income'?'active':''}" data-action="setDailyTab" data-tab="income">دخل</button>
        <button class="${activeTab==='expense'?'active':''}" data-action="setDailyTab" data-tab="expense">مصروف</button>
        <button class="${activeTab==='debt'?'active':''}" data-action="setDailyTab" data-tab="debt">ديون</button>
      </div>
      <div><b>فئات ${labelMap[activeTab]}:</b><br>
        ${curCats.map(c=>`<span class="cat">${c} <b data-action="delCat" data-type="${activeTab}" data-cat="${c}">x</b></span>`).join('')}
        <div class="inp"><input id="newCat" placeholder="فئة جديدة"><button class="btn-sm" style="background:var(--green);color:#fff" data-action="addCat" data-type="${activeTab}">+ إضافة</button></div>
      </div>
    <div class="card">
      <div class="inp"><input id="dDesc" placeholder="الوصف"><input id="dAmount" type="number" placeholder="المبلغ"></div>
      <div class="inp"><select id="dCat">${curCats.map(c=>`<option>${c}</option>`).join('')}</select></div>
      <button class="btn" data-action="addDaily">إضافة ${labelMap[activeTab]}</button>
    </div>
    <div class="card"><b>التقرير</b><div class="h-scroll"><table class="report"><tr><th>الفئة</th><th>الإجمالي</th></tr>
      ${Object.entries(report).map(([k,v])=>`<tr><td>${k}</td><td>${formatEGP(v)}</td></tr>`).join('')}</table></div></div>
    <div style="margin:10px">${filtered.map(x=>`<div class="card" style="display:flex;justify-content:space-between;margin:6px 0"><div><b>${x.desc}</b><br><small>${x.category}</small></div><div><b>${formatEGP(x.amount)}</b> <button class="btn-sm" style="background:#fee2e2" data-action="delDaily" data-id="${x.id}">x</button></div></div>`).join('')}</div>
  `;
}

export function handleDaily(btn, e, rerender){
  const action = btn.dataset.action;
  if(action==='setDailyTab'){ activeTab = btn.dataset.tab; rerender(); return; }
  if(action==='addCat'){
    const v = document.getElementById('newCat')?.value.trim(); if(!v) return;
    const cats = L(CATS_KEY, {income:[],expense:[],debt:[]}); cats[btn.dataset.type].push(v); S(CATS_KEY,cats); rerender();
  }
  if(action==='delCat'){
    const cats = L(CATS_KEY, {income:[],expense:[],debt:[]}); cats[btn.dataset.type]=cats[btn.dataset.type].filter(c=>c!==btn.dataset.cat); S(CATS_KEY,cats); rerender();
  }
  if(action==='addDaily'){
    const desc=document.getElementById('dDesc')?.value.trim(); const amount=+document.getElementById('dAmount')?.value; const cat=document.getElementById('dCat')?.value;
    if(!desc||!amount) return alert('كمل البيانات');
    const all=L(KEY,[]); const item={id:uid(),desc,amount,category:cat,type:activeTab,date:new Date().toISOString()};
    all.unshift(item); S(KEY,all); syncToSheet('daily',item); rerender();
  }
  if(action==='delDaily'){ let all=L(KEY,[]); all=all.filter(x=>x.id!==btn.dataset.id); S(KEY,all); rerender(); }
}

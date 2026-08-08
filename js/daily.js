import { L, S, uid } from './utils.js';
import { syncToSheet } from './sheets.js';
const KEY='daily_v6', CATS='cats_daily_v6';
let tab='income';
export function renderDaily(){
  let data=L(KEY,[]), cats=L(CATS,{income:['راتب'],expense:['أكل','مواصلات'],debt:['دين لي']});
  let cur=cats[tab]||[], filtered=data.filter(x=>x.type===tab);
  return `<div class="card"><div class="seg"><button class="${tab==='income'?'active':''}" data-action="setTab" data-tab="income">دخل</button><button class="${tab==='expense'?'active':''}" data-action="setTab" data-tab="expense">مصروف</button><button class="${tab==='debt'?'active':''}" data-action="setTab" data-tab="debt">دين</button></div>
  ${cur.map(c=>`<span class="cat">${c} <b data-action="delCat" data-cat="${c}">✕</b></span>`).join('')}<div class="inp"><input id="newCat" placeholder="فئة"><button class="btn-sm" style="background:#10b981;color:#fff" data-action="addCat">+</button></div></div>
  <div class="card"><div class="inp"><input id="dDesc" placeholder="الوصف"><input id="dAmount" type="number" placeholder="المبلغ"></div><div class="inp"><select id="dCat">${cur.map(c=>`<option>${c}</option>`).join('')}</select></div><button class="btn" data-action="addDaily">حفظ</button></div>
  <div style="margin:10px">${filtered.map(x=>`<div class="card" style="display:flex;justify-content:space-between"><span>${x.desc} - ${x.category}</span><span><b>${x.amount}</b> <button class="btn-sm" style="background:#fff1f2" data-action="delDaily" data-id="${x.id}">✕</button></span></div>`).join('')}</div>`;
}
export function handleDaily(btn,e,rerender){
  if(btn.dataset.action==='setTab'){tab=btn.dataset.tab; rerender();}
  if(btn.dataset.action==='addCat'){let v=document.getElementById('newCat').value.trim(); if(!v)return; let c=L(CATS,{income:[],expense:[],debt:[]}); c[tab].push(v); S(CATS,c); rerender();}
  if(btn.dataset.action==='delCat'){let c=L(CATS,{income:[],expense:[],debt:[]}); c[tab]=c[tab].filter(x=>x!==btn.dataset.cat); S(CATS,c); rerender();}
  if(btn.dataset.action==='addDaily'){let d=document.getElementById('dDesc').value, a=+document.getElementById('dAmount').value, cat=document.getElementById('dCat').value; if(!d||!a)return alert('كمل البيانات'); let all=L(KEY,[]); let obj={id:uid(),desc:d,amount:a,category:cat,type:tab,date:new Date().toISOString()}; all.unshift(obj); S(KEY,all); syncToSheet('daily',obj); rerender();}
  if(btn.dataset.action==='delDaily'){S(KEY,L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender();}
}

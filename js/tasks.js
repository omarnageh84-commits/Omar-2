import { L, S, uid } from './utils.js';
import { syncToSheet } from './sheets.js';
const KEY='tasks_v6', CATS='cats_tasks_v6';
export function renderTasks(){
  let tasks=L(KEY,[]), cats=L(CATS,['عاجل','مهم','عادي']);
  return `<div class="card">${cats.map(c=>`<span class="cat">${c} <b data-action="delTCat" data-cat="${c}">✕</b></span>`).join('')}<div class="inp"><input id="newTCat" placeholder="فئة"><button class="btn-sm" style="background:#0ea5e9;color:#fff" data-action="addTCat">+</button></div></div>
  <div class="card"><div class="inp"><input id="tT" placeholder="مهمة"><select id="tC">${cats.map(c=>`<option>${c}</option>`).join('')}</select></div><button class="btn" style="background:#0ea5e9" data-action="addT">إضافة</button></div>
  <div style="margin:10px">${tasks.map(t=>`<div class="card" style="display:flex;justify-content:space-between"><span>${t.done?'✅':''} ${t.text} - ${t.cat}</span><span><input type="checkbox" ${t.done?'checked':''} data-action="toggleT" data-id="${t.id}"> <button class="btn-sm" style="background:#fff1f2" data-action="delT" data-id="${t.id}">✕</button></span></div>`).join('')}</div>`;
}
export function handleTasks(btn,e,rerender){
  let tasks=L(KEY,[]), cats=L(CATS,[]);
  if(btn.dataset.action==='addTCat'){let v=document.getElementById('newTCat').value.trim(); if(!v)return; cats.push(v); S(CATS,cats); rerender();}
  if(btn.dataset.action==='delTCat'){S(CATS,cats.filter(x=>x!==btn.dataset.cat)); rerender();}
  if(btn.dataset.action==='addT'){let v=document.getElementById('tT').value; if(!v)return; let obj={id:uid(),text:v,cat:document.getElementById('tC').value,done:false}; tasks.unshift(obj); S(KEY,tasks); syncToSheet('tasks',obj); rerender();}
  if(btn.dataset.action==='delT'){S(KEY,tasks.filter(x=>x.id!==btn.dataset.id)); rerender();}
  if(btn.dataset.action==='toggleT'){let t=tasks.find(x=>x.id===btn.dataset.id); if(t){t.done=!t.done; S(KEY,tasks); rerender();}}
}

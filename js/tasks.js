import { L, S, uid } from './utils.js';
const KEY='notion_tasks_v6', CATS='cats_tasks_v6';
export function renderTasks(){
  const tasks=L(KEY,[]), cats=L(CATS,['عاجل','مهم','عادي']);
  return `<div class="card">${cats.map(c=>`<span class="cat">${c} <b data-action="delTCat" data-cat="${c}">x</b></span>`).join('')}<div class="inp"><input id="newTCat" placeholder="فئة"><button class="btn-sm" style="background:var(--blue);color:#fff" data-action="addTCat">+ فئة</button></div></div>
  <div class="card"><div class="inp"><input id="tT" placeholder="مهمة"><select id="tC">${cats.map(c=>`<option>${c}</option>`).join('')}</select></div><button class="btn" style="background:var(--blue)" data-action="addT">إضافة</button></div>
  <div style="margin:10px">${tasks.map(t=>`<div class="card" style="display:flex;justify-content:space-between"><span>${t.done?'✅':''} ${t.text} - ${t.cat}</span><span><input type="checkbox" ${t.done?'checked':''} data-action="toggleT" data-id="${t.id}"> <button class="btn-sm" style="background:#fee2e2" data-action="delT" data-id="${t.id}">x</button></span></div>`).join('')}</div>`;
}
export function handleTasks(btn,e,rerender){
  let tasks=L(KEY,[]), cats=L(CATS,[]);
  if(btn.dataset.action==='addTCat'){const v=document.getElementById('newTCat')?.value.trim(); if(!v)return; cats.push(v); S(CATS,cats); rerender();}
  if(btn.dataset.action==='delTCat'){S(CATS,cats.filter(x=>x!==btn.dataset.cat)); rerender();}
  if(btn.dataset.action==='addT'){const v=document.getElementById('tT')?.value.trim(); if(!v)return; const cat=document.getElementById('tC')?.value; tasks.unshift({id:uid(),text:v,cat,done:false}); S(KEY,tasks); rerender();}
  if(btn.dataset.action==='delT'){S(KEY,tasks.filter(x=>x.id!==btn.dataset.id)); rerender();}
  if(btn.dataset.action==='toggleT'){const t=tasks.find(x=>x.id===btn.dataset.id); if(t){t.done=!t.done; S(KEY,tasks); rerender();}}
}

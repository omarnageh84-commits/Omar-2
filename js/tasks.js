// tasks.js - V6 Pro - المهام فقط
import { L, S, uid } from './utils.js';

const KEY = 'notion_tasks_v6';
const CATS_KEY = 'cats_tasks_v6';

export function renderTasks(){
  const tasks = L(KEY, []);
  const cats = L(CATS_KEY, ['عاجل','مهم','عادي']);

  return `
    <div class="card"><b>فئات المهام:</b><br>
      ${cats.map(c=>`<span class="cat">${c} <b data-action="delTCat" data-cat="${c}">x</b></span>`).join('')}
      <div class="inp"><input id="newTCat" placeholder="فئة"><button class="btn-sm" style="background:var(--blue);color:#fff" data-action="addTCat">+ فئة</button></div>
    </div>
    <div class="card">
      <div class="inp"><input id="tT" placeholder="مهمة جديدة"><select id="tC">${cats.map(c=>`<option>${c}</option>`).join('')}</select></div>
      <button class="btn" style="background:var(--blue)" data-action="addT">إضافة مهمة</button>
    </div>
    <div class="card"><b>الملخص</b>
      <div class="h-scroll"><table class="report"><tr><th>الفئة</th><th>مكتمل / الكل</th></tr>
      ${cats.map(c=>{ const all=tasks.filter(t=>t.cat===c); return `<tr><td>${c}</td><td>${all.filter(t=>t.done).length}/${all.length}</td></tr>`}).join('')}
      </table></div>
    </div>
    <div style="margin:10px">
      ${tasks.map(t=>`<div class="card" style="display:flex; justify-content:space-between; align-items:center; margin:6px 0; ${t.done?'opacity:.6; text-decoration:line-through':''}">
        <span>${t.done?'✅':''} ${t.text} <small style="background:#f3f4f6; padding:2px 8px; border-radius:10px">${t.cat}</small></span>
        <span style="display:flex; gap:6px"><input type="checkbox" ${t.done?'checked':''} data-action="toggleT" data-id="${t.id}"> <button class="btn-sm" style="background:#fee2e2" data-action="delT" data-id="${t.id}">x</button></span>
      </div>`).join('') || '<div class="empty"><span>🎯</span>لا مهام</div>'}
    </div>
  `;
}

export function bindTasksEvents(root, rerender){
  root.addEventListener('click', e=>{
    const b = e.target.closest('[data-action]'); if(!b) return;
    let tasks = L(KEY, []); let cats = L(CATS_KEY, []);
    if(b.dataset.action==='addTCat'){ const v=document.getElementById('newTCat')?.value.trim(); if(!v) return; cats.push(v); S(CATS_KEY,cats); rerender(); }
    if(b.dataset.action==='delTCat'){ S(CATS_KEY, cats.filter(x=>x!==b.dataset.cat)); rerender(); }
    if(b.dataset.action==='addT'){ const v=document.getElementById('tT')?.value.trim(); if(!v) return; const cat=document.getElementById('tC')?.value; tasks.unshift({id:uid(), text:v, cat, done:false}); S(KEY,tasks); rerender(); }
    if(b.dataset.action==='delT'){ S(KEY, tasks.filter(x=>x.id!==b.dataset.id)); rerender(); }
    if(b.dataset.action==='toggleT'){ const t=tasks.find(x=>x.id===b.dataset.id); if(t){ t.done=!t.done; S(KEY,tasks); rerender(); } }
  });
}

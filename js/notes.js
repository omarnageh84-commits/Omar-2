// notes.js - V6 Pro - الملاحظات فقط
import { L, S, uid } from './utils.js';
import { syncToSheet } from './sheets.js';

const KEY = 'notion_notes_v6';
const CATS_KEY = 'cats_notes_v6';

export function renderNotes(){
  const notes = L(KEY, []);
  const cats = L(CATS_KEY, ['شغل','شخصي','أفكار']);
  return `
    <div class="card"><b>فئات الملاحظات:</b><br>
      ${cats.map(c=>`<span class="cat">${c} <b data-action="delNCat" data-cat="${c}">x</b></span>`).join('')}
      <div class="inp"><input id="newNCat" placeholder="فئة جديدة"><button class="btn-sm" style="background:var(--green);color:#fff" data-action="addNCat">+ فئة</button></div>
    </div>
    <div class="card">
      <div class="inp"><input id="nT" placeholder="عنوان الملاحظة"><select id="nC">${cats.map(c=>`<option>${c}</option>`).join('')}</select></div>
      <div class="inp"><textarea id="nB" rows="3" placeholder="التفاصيل..."></textarea></div>
      <button class="btn" data-action="addN">إضافة ملاحظة</button>
    </div>
    <div style="margin:10px">
      ${notes.map(n=>`<div class="card"><div style="display:flex; justify-content:space-between"><b>${n.title}</b><small>${n.cat}</small></div><p style="font-size:13px; white-space:pre-wrap">${n.body||''}</p><div style="display:flex; justify-content:space-between"><small>${new Date(n.date).toLocaleDateString('ar-EG')}</small><button class="btn-sm" style="background:#fee2e2" data-action="delN" data-id="${n.id}">حذف</button></div></div>`).join('') || '<div class="empty"><span>📝</span>لا ملاحظات بعد</div>'}
    </div>
  `;
}

export function bindNotesEvents(root, rerender){
  root.addEventListener('click', e=>{
    const b = e.target.closest('[data-action]'); if(!b) return;
    const notes = L(KEY, []); let cats = L(CATS_KEY, []);
    if(b.dataset.action==='addNCat'){ const v=document.getElementById('newNCat')?.value.trim(); if(!v) return; cats.push(v); S(CATS_KEY,cats); rerender(); }
    if(b.dataset.action==='delNCat'){ S(CATS_KEY, cats.filter(x=>x!==b.dataset.cat)); rerender(); }
    if(b.dataset.action==='addN'){
      const title=document.getElementById('nT')?.value.trim(); if(!title) return;
      const body=document.getElementById('nB')?.value; const cat=document.getElementById('nC')?.value;
      const item={id:uid(), title, body, cat, date:new Date().toISOString()};
      notes.unshift(item); S(KEY, notes); syncToSheet('notes', item); rerender();
    }
    if(b.dataset.action==='delN'){ S(KEY, notes.filter(x=>x.id!==b.dataset.id)); rerender(); }
  });
}

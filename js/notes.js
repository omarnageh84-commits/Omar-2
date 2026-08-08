import { L, S, uid } from './utils.js';
const KEY='notion_notes_v6', CATS='cats_notes_v6';
export function renderNotes(){
  const notes=L(KEY,[]), cats=L(CATS,['شغل','شخصي']);
  return `<div class="card">${cats.map(c=>`<span class="cat">${c} <b data-action="delNCat" data-cat="${c}">x</b></span>`).join('')}<div class="inp"><input id="newNCat" placeholder="فئة"><button class="btn-sm" style="background:var(--green);color:#fff" data-action="addNCat">+ فئة</button></div></div>
  <div class="card"><div class="inp"><input id="nT" placeholder="عنوان"><select id="nC">${cats.map(c=>`<option>${c}</option>`).join('')}</select></div><div class="inp"><textarea id="nB" rows="3" placeholder="تفاصيل"></textarea></div><button class="btn" data-action="addN">إضافة</button></div>
  <div style="margin:10px">${notes.map(n=>`<div class="card"><b>${n.title}</b> - <small>${n.cat}</small><p>${n.body||''}</p><button class="btn-sm" style="background:#fee2e2" data-action="delN" data-id="${n.id}">حذف</button></div>`).join('')}</div>`;
}
export function handleNotes(btn,e,rerender){
  let notes=L(KEY,[]), cats=L(CATS,[]);
  if(btn.dataset.action==='addNCat'){const v=document.getElementById('newNCat')?.value.trim(); if(!v)return; cats.push(v); S(CATS,cats); rerender();}
  if(btn.dataset.action==='delNCat'){S(CATS,cats.filter(x=>x!==btn.dataset.cat)); rerender();}
  if(btn.dataset.action==='addN'){const title=document.getElementById('nT')?.value.trim(); if(!title)return; const body=document.getElementById('nB')?.value, cat=document.getElementById('nC')?.value; notes.unshift({id:uid(),title,body,cat,date:new Date().toISOString()}); S(KEY,notes); rerender();}
  if(btn.dataset.action==='delN'){S(KEY,notes.filter(x=>x.id!==btn.dataset.id)); rerender();}
}

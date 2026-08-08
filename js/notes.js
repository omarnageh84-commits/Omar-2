import { L, S, uid } from './utils.js';
const KEY='notes_v6', CATS='cats_notes_v6';
let view='board'; // board | list
let filter='all';
let search='';

export function renderNotes(){
  const notes=L(KEY,[]), cats=L(CATS,['💼 شغل','👤 شخصي','💡 أفكار','📚 دراسة']);
  const filtered=notes.filter(n=>{
    const matchSearch =!search || n.title.includes(search) || n.body?.includes(search);
    const matchCat = filter==='all' || n.cat===filter;
    return matchSearch && matchCat;
  });

  return `
  <div class="card" style="padding:14px; border:0; background:linear-gradient(180deg,#fff,#fbfbfa)">
    <div style="display:flex; justify-content:space-between; align-items:center">
      <div><b style="font-size:20px">📝 الملاحظات</b><div style="font-size:11px; color:#9b9a97">Notion-style database • ${filtered.length} صفحة</div></div>
      <div style="display:flex; gap:6px">
        <button class="btn-sm ${view==='board'?'primary':''}" data-action="setView" data-view="board">Board</button>
        <button class="btn-sm ${view==='list'?'primary':''}" data-action="setView" data-view="list">List</button>
      </div>
    </div>
    <div class="inp" style="margin-top:14px"><input id="searchNotes" value="${search}" placeholder="🔍 بحث في الملاحظات..." data-action="search" style="background:#f7f6f3; border-color:#edecea"></div>
    <div style="display:flex; gap:6px; overflow-x:auto; padding:8px 0">
      <button class="cat" style="${filter==='all'?'background:#111; color:#fff; border-color:#111':''}" data-action="setFilter" data-cat="all">الكل ${notes.length}</button>
      ${cats.map(c=>`<button class="cat" style="${filter===c?'background:#111; color:#fff; border-color:#111':''}" data-action="setFilter" data-cat="${c}">${c}</button>`).join('')}
    </div>
    <div style="display:flex; gap:6px; margin-top:6px">
      <input id="newNCat" placeholder="فئة جديدة..." style="flex:1; padding:8px 12px; border-radius:8px; border:1.5px solid #edecea; font-size:12px">
      <button class="btn-sm" style="background:#111; color:#fff" data-action="addCat">+ فئة</button>
    </div>
  </div>

  <div class="card" style="background:#f7f6f3; border:1.5px dashed #e9e8e6">
    <b style="font-size:13px">＋ صفحة جديدة</b>
    <div class="inp"><input id="nIcon" placeholder="أيقونة مثلاً: 🔥" style="max-width:70px"><input id="nT" placeholder="عنوان الصفحة... Untitled" style="flex:1"></div>
    <div class="inp"><select id="nC">${cats.map(c=>`<option>${c}</option>`).join('')}</select><select id="nStatus"><option>📝 مسودة</option><option>🚀 جاهزة</option><option>✅ مكتملة</option><option>📌 مهمة</option></select></div>
    <div class="inp"><textarea id="nB" rows="3" placeholder="اكتب محتوى الصفحة... اكتب / للأوامر" style="background:#fff"></textarea></div>
    <button class="btn" style="background:#111; box-shadow:none" data-action="addNote">＋ إنشاء صفحة</button>
  </div>

  ${view==='board'? `
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:0 12px">
    ${cats.map(cat=>{
      const catNotes=filtered.filter(n=>n.cat===cat);
      return `<div style="background:#f7f6f3; border-radius:14px; padding:12px"><div style="font-size:12px; font-weight:800; margin-bottom:10px; display:flex; justify-content:space-between"><span>${cat}</span><span style="background:#fff; padding:2px 8px; border-radius:20px; font-size:10px">${catNotes.length}</span></div>
      ${catNotes.map(n=>`
        <div style="background:#fff; border:1px solid #edecea; border-radius:12px; padding:12px; margin-bottom:8px; box-shadow:0 1px 2px rgba(0,0,0,.04)">
          <div style="font-size:16px">${n.icon||'📄'}</div><b style="font-size:13px; display:block; margin:4px 0">${n.title}</b>
          <div style="font-size:11px; color:#9b9a97; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${(n.body||'لا يوجد محتوى').slice(0,60)}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px"><span style="font-size:10px; background:#f1f1ef; padding:3px 8px; border-radius:20px">${n.status||'📝 مسودة'}</span><div style="display:flex; gap:4px"><button class="btn-sm" style="background:#f1f1ef" data-action="editNote" data-id="${n.id}">✏️</button><button class="btn-sm" style="background:#fbe4e6; color:#e11d48" data-action="delNote" data-id="${n.id}">✕</button></div></div>
        </div>`).join('') || `<div style="text-align:center; color:#b8b7b5; font-size:11px; padding:16px">لا صفحات</div>`}
      </div>`
    }).join('')}
  </div>` : `
  <table class="pro-table"><tr><th>📄 الصفحة</th><th>الفئة</th><th>الحالة</th><th></th></tr>
  ${filtered.map(n=>`<tr><td><span style="font-size:14px">${n.icon||'📄'}</span> <b>${n.title}</b><br><small style="color:#9b9a97">${(n.body||'').slice(0,40)}</small></td><td><span style="background:#f1f1ef; padding:4px 8px; border-radius:20px; font-size:10px">${n.cat}</span></td><td style="font-size:11px">${n.status||''}</td><td><div style="display:flex; gap:4px"><button class="btn-sm" style="background:#f1f1ef" data-action="editNote" data-id="${n.id}">✏️</button><button class="btn-sm" style="background:#fbe4e6" data-action="delNote" data-id="${n.id}">✕</button></div></td></tr>`).join('') || `<tr><td colspan="4" style="text-align:center; padding:20px; color:#9b9a97">📭 لا يوجد ملاحظات</td></tr>`}
  </table>
  `}
  `;
}

export function handleNotes(btn,e,rerender){
  if(btn.dataset.action==='setView'){ view=btn.dataset.view; rerender(); return; }
  if(btn.dataset.action==='setFilter'){ filter=btn.dataset.cat; rerender(); return; }
  if(e.target.id==='searchNotes' && e.type==='input'){ search=e.target.value; rerender(); return; }
  if(btn.dataset.action==='search'){ search=document.getElementById('searchNotes')?.value||''; rerender(); return; }
  if(btn.dataset.action==='addCat'){ const v=document.getElementById('newNCat')?.value.trim(); if(!v) return; const c=L(CATS,[]); c.push(v); S(CATS,c); rerender(); return; }
  if(btn.dataset.action==='addNote'){
    const t=document.getElementById('nT')?.value.trim(); if(!t) return alert('عنوان الصفحة');
    const notes=L(KEY,[]); notes.unshift({id:uid(), icon:document.getElementById('nIcon')?.value||'📄', title:t, body:document.getElementById('nB')?.value, cat:document.getElementById('nC')?.value, status:document.getElementById('nStatus')?.value, date:new Date().toISOString()}); S(KEY,notes); rerender(); return;
  }
  if(btn.dataset.action==='delNote'){ if(!confirm('حذف الصفحة؟')) return; S(KEY, L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
  if(btn.dataset.action==='editNote'){
    const notes=L(KEY,[]); const n=notes.find(x=>x.id===btn.dataset.id); if(!n) return;
    const nt=prompt('العنوان:',n.title); if(nt===null) return; const nb=prompt('المحتوى:',n.body||''); if(nb===null) return;
    n.title=nt.trim()||n.title; n.body=nb; S(KEY,notes); rerender(); return;
  }
}

import { L, S, uid } from './utils.js';
const KEY='notes_v7';
let openId=null, tab='all';
const CATS=['شخصي','عمل','صيدلية','أفكار','مذكرة'];

export function renderNotes(){
  const notes=L(KEY,[]);
  if(openId){
    const n=notes.find(x=>x.id===openId); if(!n){ openId=null; } else {
      const subTasks=n.subTasks||[]; const done=subTasks.filter(x=>x.done).length; const pct=subTasks.length? Math.round(done/subTasks.length*100):0;
      return `
      <div class="card" style="margin:0; border-radius:0; min-height:100vh; background:#fff">
        <div style="display:flex; justify-content:space-between; padding:10px; background:#0f172a; color:#fff"><button class="btn-sm" style="background:rgba(255,255,255,.15); color:#fff" data-action="back">← رجوع</button><div style="display:flex; gap:4px"><span style="font-size:10px; background:${pct===100?'#10b981':'#f59e0b'}; padding:4px 8px; border-radius:20px">${pct}% مكتمل</span><button class="btn-sm btn-del-sm" data-action="delNote" data-id="${n.id}">حذف</button></div></div>
        <div style="padding:14px">
          <div style="display:flex; gap:6px; margin-bottom:10px"><select id="nCatPage" style="padding:7px; border-radius:8px; font-size:11px; border:1.2px solid #e2e8f0"><option>${n.cat||'شخصي'}</option>${CATS.map(c=>`<option ${c===n.cat?'selected':''}>${c}</option>`).join('')}</select><span style="font-size:9px; background:#f1f5f9; padding:6px 10px; border-radius:20px">${(n.date||'').slice(0,10)}</span></div>
          <input id="nTitlePage" value="${n.title}" style="width:100%; font-size:16px; font-weight:800; border:0; border-bottom:1.5px solid #f1f5f9; padding:8px 0; outline:none">
          <textarea id="nBodyPage" rows="6" style="width:100%; margin-top:10px; padding:10px; border:1.2px solid #eef2f0; border-radius:10px; font-size:12px; outline:none">${n.body||''}</textarea>
          ${n.image?`<img src="${n.image}" style="width:100%; border-radius:12px; margin-top:10px">`:''}
          <div style="margin-top:12px; background:#f8fafc; border-radius:10px; padding:10px"><b style="font-size:11px">✅ مهام فرعية - ${done}/${subTasks.length}</b><div style="background:#e2e8f0; height:6px; border-radius:10px; margin:8px 0"><div style="width:${pct}%; height:100%; background:#10b981; border-radius:10px"></div></div><div class="inp"><input id="subT" placeholder="مهمة فرعية..."><button class="btn-sm btn-dark" data-action="addSub" data-id="${n.id}">+ إضافة</button></div>${subTasks.map(s=>`<div style="display:flex; justify-content:space-between; background:#fff; padding:7px 8px; border-radius:8px; margin-top:4px; border:1px solid #f1f5f9"><label style="display:flex; gap:6px; font-size:11px"><input type="checkbox" ${s.done?'checked':''} data-action="toggleSub" data-sid="${s.id}" data-pid="${n.id}"> ${s.text}</label><button class="btn-sm btn-del-sm" data-action="delSub" data-sid="${s.id}" data-pid="${n.id}">✕</button></div>`).join('')}</div>
          <div style="display:flex; gap:6px; margin-top:10px"><button class="btn-sm btn-dark" data-action="savePage" data-id="${n.id}">💾 حفظ</button><label class="btn-sm btn-ghost" style="cursor:pointer"><input type="file" accept="image/*" hidden data-action="updateImg" data-id="${n.id}">🖼️ صورة</label></div>
        </div>
      </div>`;
    }
  }

  const filtered=tab==='all'? notes : notes.filter(x=>x.cat===tab);
  return `
  <div class="card" style="padding:8px"><div class="seg" style="grid-template-columns:repeat(5,1fr)"><button class="${tab==='all'?'active':''}" data-action="setTab" data-tab="all">الكل</button>${CATS.map(c=>`<button class="${tab===c?'active':''}" data-action="setTab" data-tab="${c}">${c}</button>`).join('')}</div>
    <div style="margin-top:8px" class="inp"><input id="nT" placeholder="عنوان سريع..."><select id="nC" style="max-width:90px">${CATS.map(c=>`<option>${c}</option>`).join('')}</select><button class="btn-sm btn-dark" data-action="addQuick">+</button></div>
  </div>
  <div style="padding:0 6px; display:grid; grid-template-columns:1fr 1fr; gap:6px">
    ${filtered.map(n=>{
      const sub=n.subTasks||[]; const pct=sub.length? Math.round(sub.filter(x=>x.done).length/sub.length*100):0;
      return `<div class="card" style="margin:0; cursor:pointer; border-left:3px solid ${pct===100?'#10b981':'#6366f1'}" data-action="open" data-id="${n.id}">
        <div style="display:flex; justify-content:space-between"><span style="font-size:9px; background:#f1f5f9; padding:2px 6px; border-radius:10px">${n.cat||'شخصي'}</span><small style="font-size:8px; color:#94a3b8">${pct}%</small></div>
        <b style="font-size:11px; display:block; margin:6px 0">${n.title.slice(0,22)}</b>
        <div style="font-size:9px; color:#64748b; height:24px; overflow:hidden">${(n.body||'').slice(0,40)}</div>
        ${sub.length? `<div style="background:#e2e8f0; height:4px; border-radius:10px; margin-top:6px"><div style="width:${pct}%; height:100%; background:#10b981; border-radius:10px"></div></div>`:''}
        ${n.image? `<img src="${n.image}" style="width:100%; height:50px; object-fit:cover; border-radius:6px; margin-top:6px">`:''}
      </div>`;
    }).join('')}
  </div>
  ${filtered.length===0? '<div class="card" style="text-align:center; color:#94a3b8; font-size:11px">لا يوجد ملاحظات</div>':''}
  `;
}

export function handleNotes(btn,e,rerender){
  let notes=L(KEY,[]);
  if(btn.dataset.action==='setTab'){ tab=btn.dataset.tab; rerender(); return; }
  if(btn.dataset.action==='addQuick'){ const t=document.getElementById('nT')?.value.trim(); if(!t) return; notes.unshift({id:uid(), title:t, body:'', cat:document.getElementById('nC')?.value||'شخصي', subTasks:[], date:new Date().toISOString()}); S(KEY,notes); rerender(); return; }
  if(btn.dataset.action==='open'){ openId=btn.dataset.id; rerender(); return; }
  if(btn.dataset.action==='back'){ openId=null; rerender(); return; }
  if(btn.dataset.action==='savePage'){ const n=notes.find(x=>x.id===btn.dataset.id); if(!n) return; n.title=document.getElementById('nTitlePage')?.value||n.title; n.body=document.getElementById('nBodyPage')?.value||''; n.cat=document.getElementById('nCatPage')?.value||n.cat; S(KEY,notes); openId=null; rerender(); return; }
  if(btn.dataset.action==='delNote'){ if(!confirm('حذف؟')) return; S(KEY, notes.filter(x=>x.id!==btn.dataset.id)); openId=null; rerender(); return; }
  if(btn.dataset.action==='addSub'){ const n=notes.find(x=>x.id===btn.dataset.id); const txt=document.getElementById('subT')?.value.trim(); if(!txt||!n) return; n.subTasks=n.subTasks||[]; n.subTasks.push({id:uid(), text:txt, done:false}); S(KEY,notes); rerender(); return; }
  if(btn.dataset.action==='toggleSub'){ const n=notes.find(x=>x.id===btn.dataset.pid); const s=n?.subTasks?.find(x=>x.id===btn.dataset.sid); if(s){ s.done=!s.done; S(KEY,notes); rerender(); } return; }
  if(btn.dataset.action==='delSub'){ const n=notes.find(x=>x.id===btn.dataset.pid); if(n){ n.subTasks=n.subTasks.filter(x=>x.id!==btn.dataset.sid); S(KEY,notes); rerender(); } return; }
  if(e.target.type==='file' && e.type==='change'){ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{ const n=notes.find(x=>x.id===e.target.dataset.id); if(e.target.dataset.action==='updateImg' && n){ n.image=reader.result; S(KEY,notes); rerender(); } }; reader.readAsDataURL(file); }
}

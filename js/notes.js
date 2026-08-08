import { L, S, uid } from './utils.js';
const KEY='notes_v7';
const CATS_KEY='notes_cats_v8';
const DEFAULT_CATS=['شخصي','عمل','صيدلية','أفكار','مذكرة'];
const PRIORITY=['عام','مهم','غير مهم','سري'];
let openId=null, tab='all', subTab='all';
const getCats=()=>L(CATS_KEY, DEFAULT_CATS);
const saveCats=(c)=>S(CATS_KEY, c);
export function renderNotes(){
  const notes=L(KEY,[]); const CATS=getCats();
  if(openId){
    const n=notes.find(x=>x.id===openId); if(!n){ openId=null; } else {
      return `<div class="card" style="margin:0; min-height:100vh; padding:0"><div style="display:flex; justify-content:space-between; padding:10px; background:#0f172a; color:#fff"><button class="btn-sm" style="background:rgba(255,255,255,.15); color:#fff" data-action="back">← رجوع</button><button class="btn-sm btn-del-sm" data-action="delNote" data-id="${n.id}">حذف</button></div>
      <div style="padding:14px"><div style="display:flex; gap:6px; flex-wrap:wrap"><select id="nCatPage" style="padding:7px; border-radius:8px; font-size:11px">${CATS.map(c=>`<option ${c===n.cat?'selected':''}>${c}</option>`).join('')}</select><select id="nPrioPage" style="padding:7px; border-radius:8px; font-size:11px">${PRIORITY.map(p=>`<option ${p===n.priority?'selected':''}>${p}</option>`).join('')}</select></div>
      <input id="nTitlePage" value="${n.title}" style="width:100%; font-size:16px; font-weight:800; border:0; border-bottom:1.5px solid #f1f5f9; padding:8px 0"><textarea id="nBodyPage" rows="6" style="width:100%; margin-top:10px; padding:10px; border:1px solid #eef2f0; border-radius:10px; font-size:12px">${n.body||''}</textarea>
      <div style="margin-top:12px; border:1.5px solid #e2e8f0; border-radius:12px; overflow:hidden"><div style="display:flex; justify-content:space-between; padding:8px; background:#f8fafc"><b style="font-size:10px">🎨 رسم حر</b><div style="display:flex; gap:4px"><button class="btn-sm" style="background:#fff; border:1px solid #e2e8f0" data-action="clearDraw">مسح</button><button class="btn-sm btn-dark" data-action="saveDraw" data-id="${n.id}">حفظ</button></div></div><canvas id="drawCanvas" width="360" height="220" style="width:100%; background:#fff; touch-action:none"></canvas><div style="display:flex; gap:6px; padding:6px; background:#f8fafc"><input type="color" id="drawColor" value="${n.drawColor||'#0f172a'}" style="width:36px; height:28px"><input type="range" id="drawSize" min="1" max="12" value="${n.drawSize||3}" style="flex:1"></div></div>
      ${n.drawing?`<img src="${n.drawing}" style="width:100%; border-radius:12px; margin-top:8px; border:1px solid #e2e8f0">`:''}
      <button class="btn-sm btn-dark" style="margin-top:10px" data-action="savePage" data-id="${n.id}">💾 حفظ</button></div></div>`;
    }
  }
  const filteredCat=tab==='all'? notes : notes.filter(x=>x.cat===tab);
  const filtered=subTab==='all'? filteredCat : filteredCat.filter(x=>(x.priority||'عام')===subTab);
  return `<div class="card" style="padding:8px"><div style="display:flex; gap:4px; overflow:auto"><div class="seg" style="flex:1; display:flex; gap:2px; overflow:auto"><button class="${tab==='all'?'active':''}" data-action="setTab" data-tab="all">الكل</button>${CATS.map(c=>`<button class="${tab===c?'active':''}" data-action="setTab" data-tab="${c}">${c} <span data-action="delCat" data-cat="${c}" style="color:#e11d48">✕</span></button>`).join('')}</div><input id="newCat" placeholder="تبويب" style="width:60px; padding:5px; border:1px solid #e2e8f0; border-radius:7px; font-size:9px"><button class="btn-sm btn-dark" data-action="addCat">+</button></div>
  <div class="seg" style="grid-template-columns:repeat(4,1fr); margin-top:6px; background:#f8fafc"><button class="${subTab==='all'?'active':''}" data-action="setSubTab" data-sub="all" style="font-size:9px">الكل</button>${PRIORITY.map(p=>`<button class="${subTab===p?'active':''}" data-action="setSubTab" data-sub="${p}" style="font-size:9px">${p}</button>`).join('')}</div>
  <div style="margin-top:8px" class="inp"><input id="nT" placeholder="عنوان..."><select id="nC" style="max-width:60px">${CATS.map(c=>`<option>${c}</option>`).join('')}</select><select id="nP" style="max-width:60px">${PRIORITY.map(p=>`<option>${p}</option>`).join('')}</select><button class="btn-sm btn-dark" data-action="addQuick">+</button></div></div>
  <div style="padding:0 6px; display:grid; grid-template-columns:1fr 1fr; gap:6px">${filtered.map(n=>`<div class="card" style="margin:0; cursor:pointer" data-action="open" data-id="${n.id}"><span style="font-size:8px; background:#f1f5f9; padding:2px 6px; border-radius:10px">${n.cat} • ${n.priority||'عام'}</span><b style="font-size:11px; display:block; margin:6px 0">${n.title.slice(0,22)}</b><div style="font-size:9px; color:#64748b; height:22px; overflow:hidden">${(n.body||'').slice(0,35)}</div><div>${n.drawing?'🎨':''}</div></div>`).join('')}</div>`;
}
function initDraw(c,n){ if(!c) return; const ctx=c.getContext('2d'); let d=false,l=null; const p=(e)=>{ const r=c.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:(t.clientX-r.left)*(c.width/r.width), y:(t.clientY-r.top)*(c.height/r.height)}; }; const col=document.getElementById('drawColor'), sz=document.getElementById('drawSize'); if(n?.drawing){ const im=new Image(); im.onload=()=>ctx.drawImage(im,0,0); im.src=n.drawing; } const s=(e)=>{ d=true; l=p(e); }; const m=(e)=>{ if(!d) return; const po=p(e); ctx.strokeStyle=col?.value||'#0f172a'; ctx.lineWidth=sz?.value||3; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(po.x,po.y); ctx.stroke(); l=po; }; const en=()=>{ d=false; }; c.addEventListener('mousedown',s); c.addEventListener('mousemove',m); c.addEventListener('mouseup',en); c.addEventListener('touchstart',s,{passive:false}); c.addEventListener('touchmove',m,{passive:false}); c.addEventListener('touchend',en); }
export function handleNotes(btn,e,rerender){
  let notes=L(KEY,[]); let cats=getCats();
  if(btn.dataset.action==='setTab'){ tab=btn.dataset.tab; rerender(); return; }
  if(btn.dataset.action==='setSubTab'){ subTab=btn.dataset.sub; rerender(); return; }
  if(btn.dataset.action==='addCat'){ const v=document.getElementById('newCat')?.value.trim(); if(!v||cats.includes(v)) return; cats.push(v); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='delCat'){ if(!confirm('حذف '+btn.dataset.cat+'؟')) return; saveCats(cats.filter(x=>x!==btn.dataset.cat)); if(tab===btn.dataset.cat) tab='all'; rerender(); return; }
  if(btn.dataset.action==='addQuick'){ const t=document.getElementById('nT')?.value.trim(); if(!t) return; notes.unshift({id:uid(), title:t, body:'', cat:document.getElementById('nC')?.value||'شخصي', priority:document.getElementById('nP')?.value||'عام', date:new Date().toISOString()}); S(KEY,notes); rerender(); return; }
  if(btn.dataset.action==='open'){ openId=btn.dataset.id; rerender(); setTimeout(()=>{ const n=notes.find(x=>x.id===openId); const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,n); },100); return; }
  if(btn.dataset.action==='back'){ openId=null; rerender(); return; }
  if(btn.dataset.action==='savePage'){ const n=notes.find(x=>x.id===btn.dataset.id); if(!n) return; n.title=document.getElementById('nTitlePage')?.value||n.title; n.body=document.getElementById('nBodyPage')?.value||''; n.cat=document.getElementById('nCatPage')?.value||n.cat; n.priority=document.getElementById('nPrioPage')?.value||n.priority; S(KEY,notes); openId=null; rerender(); return; }
  if(btn.dataset.action==='delNote'){ if(!confirm('حذف؟')) return; S(KEY, notes.filter(x=>x.id!==btn.dataset.id)); openId=null; rerender(); return; }
  if(btn.dataset.action==='clearDraw'){ const cv=document.getElementById('drawCanvas'); if(cv) cv.getContext('2d').clearRect(0,0,cv.width,cv.height); return; }
  if(btn.dataset.action==='saveDraw'){ const cv=document.getElementById('drawCanvas'); const n=notes.find(x=>x.id===btn.dataset.id); if(cv&&n){ n.drawing=cv.toDataURL(); S(KEY,notes); alert('تم حفظ الرسم'); } return; }
}

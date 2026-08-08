import { L, S, uid } from './utils.js';
const KEY='tasks_v7';
const CATS_KEY='tasks_cats_v8';
const DEFAULT_CATS=['عمل','صيدلية','شخصي','عاجل'];
const PRIORITY=['عام','مهم','غير مهم','عاجل جدا'];
let tab='all'; let subTab='all'; let openId=null;
const getCats=()=>L(CATS_KEY, DEFAULT_CATS);
const saveCats=(c)=>S(CATS_KEY, c);
export function renderTasks(){
  const tasks=L(KEY,[]); const CATS=getCats();
  if(openId){
    const t=tasks.find(x=>x.id===openId); if(!t){ openId=null; } else {
      return `<div class="card" style="margin:0; min-height:100vh; padding:0"><div style="display:flex; justify-content:space-between; padding:10px; background:#0f172a; color:#fff"><button class="btn-sm" style="background:rgba(255,255,255,.15); color:#fff" data-action="back">← رجوع</button><span style="background:${t.done?'#10b981':'#f59e0b'}; padding:4px 8px; border-radius:20px; font-size:9px">${t.done?'مكتملة':'قيد التنفيذ'}</span></div>
      <div style="padding:14px"><input id="tTitlePage" value="${t.text}" style="width:100%; font-size:15px; font-weight:800; border:0; border-bottom:1.5px solid #f1f5f9; padding:8px 0"><div style="display:flex; gap:6px; margin:10px 0"><select id="tCatPage" style="padding:7px; border-radius:8px; font-size:11px">${CATS.map(c=>`<option ${c===t.cat?'selected':''}>${c}</option>`).join('')}</select><select id="tPrioPage" style="padding:7px; border-radius:8px; font-size:11px">${PRIORITY.map(p=>`<option ${p===t.priority?'selected':''}>${p}</option>`).join('')}</select></div>
      <div style="margin-top:12px; border:1.5px solid #e2e8f0; border-radius:12px; overflow:hidden"><div style="display:flex; justify-content:space-between; padding:8px; background:#f8fafc"><b style="font-size:10px">🎨 رسم</b><div style="display:flex; gap:4px"><button class="btn-sm" style="background:#fff; border:1px solid #e2e8f0" data-action="clearDraw">مسح</button><button class="btn-sm btn-dark" data-action="saveDraw" data-id="${t.id}">حفظ</button></div></div><canvas id="drawCanvas" width="340" height="200" style="width:100%; background:#fff; touch-action:none"></canvas><div style="display:flex; gap:6px; padding:6px; background:#f8fafc"><input type="color" id="drawColor" value="${t.drawColor||'#0f172a'}" style="width:36px; height:30px"><input type="range" id="drawSize" min="1" max="10" value="${t.drawSize||3}" style="flex:1"></div></div>${t.drawing?`<img src="${t.drawing}" style="width:100%; border-radius:10px; margin-top:8px">`:''}
      <button class="btn-sm btn-dark" style="margin-top:10px" data-action="savePage" data-id="${t.id}">💾 حفظ</button></div></div>`;
    }
  }
  const filteredByCat=tab==='all'? tasks : tasks.filter(x=>x.cat===tab);
  const filtered=subTab==='all'? filteredByCat : filteredByCat.filter(x=>(x.priority||'عام')===subTab);
  return `<div class="card" style="padding:8px"><div style="display:flex; gap:4px; overflow:auto"><div class="seg" style="flex:1; display:flex; gap:2px; overflow:auto"><button class="${tab==='all'?'active':''}" data-action="setTab" data-tab="all">الكل</button>${CATS.map(c=>`<button class="${tab===c?'active':''}" data-action="setTab" data-tab="${c}">${c} <span data-action="delCat" data-cat="${c}" style="color:#e11d48">✕</span></button>`).join('')}</div><input id="newCat" placeholder="تبويب" style="width:60px; padding:6px; border:1px solid #e2e8f0; border-radius:8px; font-size:10px"><button class="btn-sm btn-dark" data-action="addCat">+</button></div>
    <div class="seg" style="grid-template-columns:repeat(4,1fr); margin-top:6px; background:#f8fafc"><button class="${subTab==='all'?'active':''}" data-action="setSubTab" data-sub="all" style="font-size:9px">الكل</button>${PRIORITY.map(p=>`<button class="${subTab===p?'active':''}" data-action="setSubTab" data-sub="${p}" style="font-size:9px">${p}</button>`).join('')}</div>
    <div class="inp" style="margin-top:8px"><input id="tT" placeholder="مهمة..."><select id="tP" style="max-width:60px">${CATS.map(c=>`<option>${c}</option>`).join('')}</select><select id="tPrio" style="max-width:65px">${PRIORITY.map(p=>`<option>${p}</option>`).join('')}</select><button class="btn-sm btn-dark" data-action="addTask">+</button></div></div>
  <table class="pro-table" style="margin:8px; width:calc(100% - 16px)"><tr><th>✅</th><th>المهمة</th><th>أولوية</th><th>🎨</th><th></th></tr>${filtered.map(t=>`<tr data-action="open" data-id="${t.id}"><td><input type="checkbox" ${t.done?'checked':''} data-action="toggle" data-id="${t.id}"></td><td><b style="font-size:11px">${t.text}</b><br><small style="font-size:8px; color:#94a3b8">${t.cat} • ${t.priority||'عام'}</small></td><td><span style="font-size:8px; background:#f1f5f9; padding:2px 6px; border-radius:10px">${t.priority||'عام'}</span></td><td>${t.drawing?'🎨':''}</td><td><button class="btn-sm btn-del-sm" data-action="del" data-id="${t.id}">✕</button></td></tr>`).join('') || `<tr><td colspan="5" style="text-align:center; color:#94a3b8">لا مهام</td></tr>`}</table>`;
}
function initDraw(c,t){ if(!c) return; const ctx=c.getContext('2d'); let d=false,l=null; const pos=(e)=>{ const r=c.getBoundingClientRect(); const tt=e.touches?e.touches[0]:e; return {x:(tt.clientX-r.left)*(c.width/r.width), y:(tt.clientY-r.top)*(c.height/r.height)}; }; const col=document.getElementById('drawColor'), sz=document.getElementById('drawSize'); if(t?.drawing){ const im=new Image(); im.onload=()=>ctx.drawImage(im,0,0); im.src=t.drawing; } const s=(e)=>{ d=true; l=pos(e); }; const m=(e)=>{ if(!d) return; const p=pos(e); ctx.strokeStyle=col?.value||'#0f172a'; ctx.lineWidth=sz?.value||3; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(p.x,p.y); ctx.stroke(); l=p; }; const e=()=>{ d=false; }; c.addEventListener('mousedown',s); c.addEventListener('mousemove',m); c.addEventListener('mouseup',e); c.addEventListener('touchstart',s,{passive:false}); c.addEventListener('touchmove',m,{passive:false}); c.addEventListener('touchend',e); }
export function handleTasks(btn,e,rerender){
  let tasks=L(KEY,[]); let cats=getCats();
  if(btn.dataset.action==='setTab'){ tab=btn.dataset.tab; rerender(); return; }
  if(btn.dataset.action==='setSubTab'){ subTab=btn.dataset.sub; rerender(); return; }
  if(btn.dataset.action==='addCat'){ const v=document.getElementById('newCat')?.value.trim(); if(!v||cats.includes(v)) return; cats.push(v); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='delCat'){ if(!confirm('حذف '+btn.dataset.cat+'؟')) return; saveCats(cats.filter(x=>x!==btn.dataset.cat)); if(tab===btn.dataset.cat) tab='all'; rerender(); return; }
  if(btn.dataset.action==='open'){ openId=btn.dataset.id; rerender(); setTimeout(()=>{ const t=tasks.find(x=>x.id===openId); const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,t); },100); return; }
  if(btn.dataset.action==='back'){ openId=null; rerender(); return; }
  if(btn.dataset.action==='addTask'){ const txt=document.getElementById('tT')?.value.trim(); if(!txt) return; tasks.unshift({id:uid(), text:txt, cat:document.getElementById('tP')?.value||'عمل', priority:document.getElementById('tPrio')?.value||'عام', date:new Date().toISOString(), done:false}); S(KEY,tasks); rerender(); return; }
  if(btn.dataset.action==='del'){ S(KEY, tasks.filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
  if(btn.dataset.action==='toggle'){ const t=tasks.find(x=>x.id===btn.dataset.id); if(t){ t.done=!t.done; S(KEY,tasks); rerender(); } return; }
  if(btn.dataset.action==='savePage'){ const t=tasks.find(x=>x.id===btn.dataset.id); if(!t) return; t.text=document.getElementById('tTitlePage')?.value||t.text; t.cat=document.getElementById('tCatPage')?.value||t.cat; t.priority=document.getElementById('tPrioPage')?.value||t.priority; S(KEY,tasks); openId=null; rerender(); return; }
  if(btn.dataset.action==='clearDraw'){ const cv=document.getElementById('drawCanvas'); if(cv) cv.getContext('2d').clearRect(0,0,cv.width,cv.height); return; }
  if(btn.dataset.action==='saveDraw'){ const cv=document.getElementById('drawCanvas'); const t=tasks.find(x=>x.id===btn.dataset.id); if(cv&&t){ t.drawing=cv.toDataURL(); S(KEY,tasks); alert('تم حفظ الرسم'); } return; }
}

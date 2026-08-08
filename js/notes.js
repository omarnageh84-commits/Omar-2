// js/notes.js - Notion + Media Pro
import { L, S, uid } from './utils.js';
const KEY='notes_v7'; let recMedia=null;
export function renderNotes(){
  const notes=L(KEY,[]);
  return `
  <div class="card daily-master total" style="padding:0"><div class="daily-master-header total"><b>📝 الملاحظات Pro</b><small>${notes.length} صفحة</small></div>
    <div style="padding:10px">
      <div class="inp"><input id="nT" placeholder="عنوان الصفحة..."><button class="btn-sm btn-dark" data-action="startVoice" title="ميكروفون">🎙️</button><label class="btn-sm btn-ghost" style="cursor:pointer"><input type="file" id="nImg" accept="image/*" hidden data-action="pickImg">🖼️</label><button class="btn-sm btn-ghost" data-action="openDraw">✏️ رسم</button></div>
      <div class="inp"><textarea id="nB" rows="3" placeholder="اكتب... أو استخدم الميكروفون"></textarea></div>
      <div id="nPreview" style="margin:6px 0"></div>
      <div id="drawBox" style="display:none; border:1.5px dashed #e2e8f0; border-radius:10px; padding:8px; margin:6px 0"><canvas id="drawCanvas" width="300" height="150" style="width:100%; background:#fff; border-radius:8px; touch-action:none"></canvas><div style="display:flex; gap:6px; margin-top:6px"><button class="btn-sm btn-ghost" data-action="clearDraw">مسح</button><button class="btn-sm btn-dark" data-action="saveDraw">حفظ الرسم</button></div></div>
      <button class="btn btn-dark" data-action="addNote">+ إنشاء صفحة</button>
    </div>
  </div>
  <div style="padding:0 8px">${notes.map(n=>`<div class="card" style="margin:8px 0"><div style="display:flex; justify-content:space-between"><b style="font-size:11px">${n.icon||'📄'} ${n.title}</b><div><button class="btn-sm btn-edit-sm" data-action="editNote" data-id="${n.id}">✏️</button><button class="btn-sm btn-del-sm" data-action="delNote" data-id="${n.id}">✕</button></div></div><div style="font-size:10px; color:#64748b; margin:6px 0; white-space:pre-wrap">${n.body||''}</div>${n.image?`<img src="${n.image}" style="width:100%; border-radius:10px; margin:6px 0; max-height:180px; object-fit:cover">`:''}${n.drawing?`<img src="${n.drawing}" style="width:100%; border-radius:10px; margin:6px 0; border:1px solid #e2e8f0">`:''}${n.audio?`<audio controls src="${n.audio}" style="width:100%; margin:6px 0"></audio>`:''}<small style="font-size:9px; color:#94a3b8">${(n.date||'').slice(0,10)}</small></div>`).join('') || '<div class="card" style="text-align:center; color:#94a3b8; font-size:11px">لا يوجد ملاحظات</div>'}</div>
  `;
}
export function handleNotes(btn,e,rerender){
  const notes=L(KEY,[]);
  if(btn.dataset.action==='addNote'){
    const t=document.getElementById('nT')?.value.trim(); if(!t) return alert('العنوان');
    const body=document.getElementById('nB')?.value; const img=document.getElementById('nPreview')?.dataset.img; const draw=document.getElementById('nPreview')?.dataset.draw; const audio=document.getElementById('nPreview')?.dataset.audio;
    notes.unshift({id:uid(), title:t, body, image:img||'', drawing:draw||'', audio:audio||'', date:new Date().toISOString()}); S(KEY,notes); rerender(); return;
  }
  if(btn.dataset.action==='delNote'){ if(!confirm('حذف؟')) return; S(KEY, notes.filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
  if(btn.dataset.action==='pickImg'){
    const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{ const prev=document.getElementById('nPreview'); if(prev){ prev.dataset.img=reader.result; prev.innerHTML+=`<img src="${reader.result}" style="width:100%; border-radius:8px; margin:4px 0">`; } }; reader.readAsDataURL(file); return;
  }
  if(btn.dataset.action==='startVoice'){
    if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)){ alert('المتصفح لا يدعم الميكروفون'); return; }
    const Recog=window.SpeechRecognition||window.webkitSpeechRecognition; const r=new Recog(); r.lang='ar-EG'; r.onresult=(ev)=>{ document.getElementById('nB').value+=' '+ev.results[0][0].transcript; }; r.start(); btn.textContent='🔴 يسمع...'; r.onend=()=>{ btn.textContent='🎙️'; }; return;
  }
  if(btn.dataset.action==='openDraw'){ const box=document.getElementById('drawBox'); box.style.display=box.style.display==='none'?'block':'none'; initDraw(); return; }
  if(btn.dataset.action==='clearDraw'){ const c=document.getElementById('drawCanvas'); const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); return; }
  if(btn.dataset.action==='saveDraw'){ const c=document.getElementById('drawCanvas'); const data=c.toDataURL(); const prev=document.getElementById('nPreview'); prev.dataset.draw=data; prev.innerHTML+=`<img src="${data}" style="width:100%; border-radius:8px; border:1px solid #e2e8f0; margin:4px 0">`; document.getElementById('drawBox').style.display='none'; return; }
  if(e.target.id==='nImg' && e.type==='change'){ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{ const prev=document.getElementById('nPreview'); if(!prev.dataset.img) prev.innerHTML=''; prev.dataset.img=reader.result; prev.innerHTML=`<img src="${reader.result}" style="width:100%; border-radius:8px">`+prev.innerHTML; }; reader.readAsDataURL(file); }
}
function initDraw(){ const c=document.getElementById('drawCanvas'); if(!c || c.dataset.init) return; c.dataset.init='1'; const ctx=c.getContext('2d'); ctx.lineWidth=2; ctx.lineCap='round'; let drawing=false; const pos=(e)=>{ const rect=c.getBoundingClientRect(); const t=e.touches?.[0]||e; return {x:(t.clientX-rect.left)*(c.width/rect.width), y:(t.clientY-rect.top)*(c.height/rect.height)}; }; c.addEventListener('pointerdown',e=>{ drawing=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); }); c.addEventListener('pointermove',e=>{ if(!drawing) return; const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); }); window.addEventListener('pointerup',()=>{ drawing=false; }); }

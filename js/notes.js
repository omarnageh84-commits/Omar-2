import { L, S, uid } from './utils.js';
const KEY='notes_v7';
const CATS_KEY='notes_cats_v8';
const DEFAULT_CATS=['شخصي','عمل','صيدلية','أفكار','مذكرة'];
const PRIORITY=['عام','مهم','غير مهم','سري'];
let tab='all', subTab='all', openId=null, showManage=false;
let mediaRecorder=null, audioChunks=[], isRecording=false;
const getCats=()=>L(CATS_KEY, DEFAULT_CATS);
const saveCats=(c)=>S(CATS_KEY, c);

export function renderNotes(){
  const notes=L(KEY,[]); const CATS=getCats();
  if(openId){
    const n=notes.find(x=>x.id===openId);
    if(!n){ openId=null; }
    else {
      if(!n.subtasks) n.subtasks=[];
      if(!n.attachments) n.attachments=[];
      return `<div class="card" style="margin:0; min-height:100vh; padding:0"><div style="display:flex; justify-content:space-between; padding:10px; background:#0f172a; color:#fff"><button class="btn-sm" style="background:rgba(255,255,255,.15); color:#fff" data-action="back">← رجوع</button><button class="btn-sm btn-del-sm" data-action="delNote" data-id="${n.id}">حذف</button></div>
      <div style="padding:14px">
        <div style="display:flex; gap:6px"><select id="nCatPage" style="flex:1; padding:7px; border-radius:8px; font-size:11px; border:1px solid #e2e8f0">${CATS.map(c=>`<option ${c===n.cat?'selected':''}>${c}</option>`).join('')}</select><select id="nPrioPage" style="flex:1; padding:7px; border-radius:8px; font-size:11px; border:1px solid #e2e8f0">${PRIORITY.map(p=>`<option ${p===n.priority?'selected':''}>${p}</option>`).join('')}</select></div>
        <input id="nTitlePage" value="${n.title}" style="width:100%; font-size:16px; font-weight:800; border:0; border-bottom:1.5px solid #f1f5f9; padding:8px 0; margin-top:8px"><textarea id="nBodyPage" rows="4" style="width:100%; margin-top:10px; padding:10px; border:1px solid #eef2f0; border-radius:10px; font-size:12px">${n.body||''}</textarea>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:10px; margin-top:12px">
          <b style="font-size:11px">✅ مهام فرعية داخل الملاحظة</b>
          <div style="display:flex; gap:4px; margin-top:8px"><input id="newSubNote" placeholder="نقطة..." style="flex:1; padding:8px; border:1px solid #e2e8f0; border-radius:8px; font-size:11px"><button class="btn-sm btn-dark" data-action="addSub" data-id="${n.id}">+</button></div>
          <div style="margin-top:8px">${n.subtasks.map(s=>`<div style="display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #f1f5f9; padding:6px 8px; border-radius:8px; margin-top:4px"><input type="checkbox" ${s.done?'checked':''} data-action="toggleSub" data-id="${n.id}" data-subid="${s.id}"><span style="flex:1; font-size:11px; ${s.done?'text-decoration:line-through; color:#94a3b8':''}">${s.text}</span><button class="btn-sm" style="background:#fee2e2; color:#e11d48; padding:2px 6px; border-radius:6px" data-action="delSub" data-id="${n.id}" data-subid="${s.id}">✕</button></div>`).join('')}</div>
        </div>

        <div style="border:1.5px solid #e2e8f0; border-radius:12px; overflow:hidden; margin-top:12px">
          <div style="padding:8px; background:#f8fafc"><b style="font-size:10px">📎 صور - كاميرا - فويس</b></div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; padding:8px">
            <button class="btn-sm" style="background:#e0f2fe; border:1px solid #bae6fd; padding:10px 4px; border-radius:10px; font-size:10px; font-weight:700" data-action="pickImage" data-id="${n.id}">🖼️ صورة</button>
            <button class="btn-sm" style="background:#dcfce7; border:1px solid #bbf7d0; padding:10px 4px; border-radius:10px; font-size:10px; font-weight:700" data-action="pickCamera" data-id="${n.id}">📷 كاميرا</button>
            <button class="btn-sm" style="background:${isRecording?'#fee2e2':'#fef3c7'}; border:1px solid #fde68a; padding:10px 4px; border-radius:10px; font-size:10px; font-weight:700" data-action="toggleRec" data-id="${n.id}">${isRecording?'⏹️ إيقاف':'🎙️ فويس'}</button>
          </div>
          <input type="file" id="noteImageInput" accept="image/*" style="display:none">
          <input type="file" id="noteCameraInput" accept="image/*" capture="environment" style="display:none">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; padding:8px">
            ${n.attachments.map((a,i)=> a.type==='image'? `<div style="position:relative"><img src="${a.data}" style="width:100%; height:80px; object-fit:cover; border-radius:8px"><button style="position:absolute; top:2px; right:2px; background:#e11d48; color:#fff; border:0; border-radius:50%; width:18px; height:18px" data-action="delAtt" data-id="${n.id}" data-index="${i}">✕</button></div>` : `<div style="background:#f1f5f9; border-radius:8px; padding:6px; position:relative"><audio src="${a.data}" controls style="width:100%; height:28px"></audio><button style="position:absolute; top:2px; right:2px; background:#e11d48; color:#fff; border:0; border-radius:50%; width:16px; height:16px; font-size:8px" data-action="delAtt" data-id="${n.id}" data-index="${i}">✕</button></div>`).join('')}
          </div>
        </div>

        <div style="margin-top:12px; border:1.5px solid #e2e8f0; border-radius:12px; overflow:hidden"><div style="display:flex; justify-content:space-between; padding:8px; background:#f8fafc"><b style="font-size:10px">🎨 رسم حر</b><div style="display:flex; gap:4px"><button class="btn-sm" style="background:#fff; border:1px solid #e2e8f0" data-action="clearDraw">مسح</button><button class="btn-sm btn-dark" data-action="saveDraw" data-id="${n.id}">حفظ</button></div></div><canvas id="drawCanvas" width="360" height="220" style="width:100%; background:#fff; touch-action:none"></canvas><div style="display:flex; gap:6px; padding:6px; background:#f8fafc"><input type="color" id="drawColor" value="${n.drawColor||'#0f172a'}" style="width:36px; height:28px"><input type="range" id="drawSize" min="1" max="12" value="${n.drawSize||3}" style="flex:1"></div></div>
        <button class="btn-sm btn-dark" style="margin-top:10px; width:100%; padding:10px" data-action="savePage" data-id="${n.id}">💾 حفظ الكل</button>
      </div></div>`;
    }
  }
  const filteredCat=tab==='all'? notes : notes.filter(x=>x.cat===tab);
  const filtered=subTab==='all'? filteredCat : filteredCat.filter(x=>(x.priority||'عام')===subTab);
  return `<div class="card" style="padding:8px"><div style="display:flex; gap:6px; align-items:center"><select id="catFilter" style="flex:1; padding:8px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:11px; font-weight:700"><option value="all">كل الفئات</option>${CATS.map(c=>`<option value="${c}" ${tab===c?'selected':''}>${c}</option>`).join('')}</select><select id="prioFilter" style="flex:1; padding:8px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:11px"><option value="all">كل الأولويات</option>${PRIORITY.map(p=>`<option value="${p}" ${subTab===p?'selected':''}>${p}</option>`).join('')}</select><button class="btn-sm btn-dark" data-action="toggleManage" style="padding:8px 10px; border-radius:10px">⚙️</button></div>${showManage?`<div style="margin-top:8px; padding:10px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0"><b style="font-size:10px">إدارة الفئات</b><div style="display:flex; gap:4px; margin-top:6px"><input id="newCat" placeholder="فئة جديدة" style="flex:1; padding:7px; border:1px solid #e2e8f0; border-radius:8px; font-size:11px"><button class="btn-sm btn-dark" data-action="addCat">إضافة</button></div></div>`:''}<div style="margin-top:8px" class="inp"><input id="nT" placeholder="ملاحظة سريعة..."><button class="btn-sm btn-dark" data-action="addQuick">+</button></div></div>
  <div style="padding:0 6px; display:grid; grid-template-columns:1fr 1fr; gap:6px">${filtered.map(n=>`<div class="card" style="margin:0; cursor:pointer" data-action="open" data-id="${n.id}"><span style="font-size:8px; background:#f1f5f9; padding:2px 6px; border-radius:10px">${n.cat} • ${n.priority||'عام'} ${n.subtasks?.length? '• '+n.subtasks.filter(s=>s.done).length+'/'+n.subtasks.length : ''} ${n.attachments?.length? '• 📎'+n.attachments.length : ''}</span><b style="font-size:11px; display:block; margin:6px 0">${n.title.slice(0,22)}</b><div style="font-size:9px; color:#64748b; height:22px; overflow:hidden">${(n.body||'').slice(0,35)}</div><div>${n.drawing?'🎨':''}</div></div>`).join('')}</div>`;
}

function initDraw(c,n){ if(!c) return; const ctx=c.getContext('2d'); let d=false,l=null; const p=(e)=>{ const r=c.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:(t.clientX-r.left)*(c.width/r.width), y:(t.clientY-r.top)*(c.height/r.height)}; }; const col=document.getElementById('drawColor'), sz=document.getElementById('drawSize'); if(n?.drawing){ const im=new Image(); im.onload=()=>ctx.drawImage(im,0,0); im.src=n.drawing; } const s=(e)=>{ d=true; l=p(e); }; const m=(e)=>{ if(!d) return; const po=p(e); ctx.strokeStyle=col?.value||'#0f172a'; ctx.lineWidth=sz?.value||3; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(po.x,po.y); ctx.stroke(); l=po; }; const en=()=>{ d=false; }; c.addEventListener('mousedown',s); c.addEventListener('mousemove',m); c.addEventListener('mouseup',en); c.addEventListener('touchstart',s,{passive:false}); c.addEventListener('touchmove',m,{passive:false}); c.addEventListener('touchend',en); }

export function handleNotes(btn,e,rerender){
  let notes=L(KEY,[]);
  if(e.target.id==='noteImageInput' && e.target.files[0]){
    const file=e.target.files[0]; const reader=new FileReader();
    reader.onload=()=>{ const n=notes.find(x=>x.id===openId); if(n){ if(!n.attachments) n.attachments=[]; n.attachments.push({type:'image', data:reader.result}); S(KEY,notes); rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,n); },100); } };
    reader.readAsDataURL(file); return;
  }
  if(e.target.id==='noteCameraInput' && e.target.files[0]){
    const file=e.target.files[0]; const reader=new FileReader();
    reader.onload=()=>{ const n=notes.find(x=>x.id===openId); if(n){ if(!n.attachments) n.attachments=[]; n.attachments.push({type:'image', data:reader.result}); S(KEY,notes); rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,n); },100); } };
    reader.readAsDataURL(file); return;
  }

  let cats=getCats();
  if(e.target.id==='catFilter'){ tab=e.target.value; rerender(); return; }
  if(e.target.id==='prioFilter'){ subTab=e.target.value; rerender(); return; }
  if(btn.dataset.action==='toggleManage'){ showManage=!showManage; rerender(); return; }
  if(btn.dataset.action==='addCat'){ const v=document.getElementById('newCat')?.value.trim(); if(!v||cats.includes(v)) return; cats.push(v); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='addQuick'){ const t=document.getElementById('nT')?.value.trim(); if(!t) return; notes.unshift({id:uid(), title:t, body:'', cat:tab!=='all'?tab:cats[0]||'شخصي', priority:subTab!=='all'?subTab:'عام', date:new Date().toISOString(), subtasks:[], attachments:[]}); S(KEY,notes); rerender(); return; }
  if(btn.dataset.action==='open'){ openId=btn.dataset.id; rerender(); setTimeout(()=>{ const n=notes.find(x=>x.id===openId); const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,n); },100); return; }
  if(btn.dataset.action==='back'){ openId=null; rerender(); return; }
  if(btn.dataset.action==='savePage'){ const n=notes.find(x=>x.id===btn.dataset.id); if(!n) return; n.title=document.getElementById('nTitlePage')?.value||n.title; n.body=document.getElementById('nBodyPage')?.value||''; n.cat=document.getElementById('nCatPage')?.value||n.cat; n.priority=document.getElementById('nPrioPage')?.value||n.priority; S(KEY,notes); openId=null; rerender(); return; }
  if(btn.dataset.action==='delNote'){ if(!confirm('حذف؟')) return; S(KEY, notes.filter(x=>x.id!==btn.dataset.id)); openId=null; rerender(); return; }

  if(btn.dataset.action==='addSub'){ const inp=document.getElementById('newSubNote'); const txt=inp?.value.trim(); if(!txt) return; const n=notes.find(x=>x.id===btn.dataset.id); if(n){ if(!n.subtasks) n.subtasks=[]; n.subtasks.push({id:uid(), text:txt, done:false}); S(KEY,notes); rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,n); },100); } return; }
  if(btn.dataset.action==='toggleSub'){ const n=notes.find(x=>x.id===btn.dataset.id); if(n){ const s=n.subtasks.find(x=>x.id===btn.dataset.subid); if(s) s.done=!s.done; S(KEY,notes); rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,n); },100); } return; }
  if(btn.dataset.action==='delSub'){ const n=notes.find(x=>x.id===btn.dataset.id); if(n){ n.subtasks=n.subtasks.filter(x=>x.id!==btn.dataset.subid); S(KEY,notes); rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,n); },100); } return; }

  if(btn.dataset.action==='pickImage'){ document.getElementById('noteImageInput')?.click(); return; }
  if(btn.dataset.action==='pickCamera'){ document.getElementById('noteCameraInput')?.click(); return; }
  if(btn.dataset.action==='delAtt'){ const n=notes.find(x=>x.id===btn.dataset.id); if(n){ n.attachments.splice(parseInt(btn.dataset.index),1); S(KEY,notes); rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,n); },100); } return; }

  if(btn.dataset.action==='toggleRec'){
    const n=notes.find(x=>x.id===btn.dataset.id);
    if(!isRecording){
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
        mediaRecorder=new MediaRecorder(stream); audioChunks=[];
        mediaRecorder.ondataavailable=e=>audioChunks.push(e.data);
        mediaRecorder.onstop=()=>{
          const blob=new Blob(audioChunks,{type:'audio/webm'});
          const reader=new FileReader();
          reader.onload=()=>{ if(n){ if(!n.attachments) n.attachments=[]; n.attachments.push({type:'audio', data:reader.result}); S(KEY,notes); isRecording=false; rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,n); },100); } };
          reader.readAsDataURL(blob);
        };
        mediaRecorder.start(); isRecording=true; rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,n); },100);
      });
    } else { mediaRecorder.stop(); isRecording=false; }
    return;
  }

  if(btn.dataset.action==='clearDraw'){ const cv=document.getElementById('drawCanvas'); if(cv) cv.getContext('2d').clearRect(0,0,cv.width,cv.height); return; }
  if(btn.dataset.action==='saveDraw'){ const cv=document.getElementById('drawCanvas'); const n=notes.find(x=>x.id===btn.dataset.id); if(cv&&n){ n.drawing=cv.toDataURL(); S(KEY,notes); alert('تم حفظ الرسم'); } return; }
      }

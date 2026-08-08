import { L, S, uid } from './utils.js';
const KEY='tasks_v7';
const CATS_KEY='tasks_cats_v8';
const DEFAULT_CATS=['عمل','صيدلية','شخصي','عاجل'];
const PRIORITY=['عام','مهم','غير مهم','عاجل جدا'];
let tab='all'; let subTab='all'; let openId=null; let showManage=false;
let mediaRecorder=null, audioChunks=[], isRecording=false;

const getCats=()=>L(CATS_KEY, DEFAULT_CATS);
const saveCats=(c)=>S(CATS_KEY, c);

export function renderTasks(){
  const tasks=L(KEY,[]); const CATS=getCats();
  if(openId){
    const t=tasks.find(x=>x.id===openId);
    if(!t){ openId=null; }
    else {
      if(!t.subtasks) t.subtasks=[];
      if(!t.attachments) t.attachments=[];
      const subProgress = t.subtasks.length? `${t.subtasks.filter(s=>s.done).length}/${t.subtasks.length}` : '0/0';
      return `<div class="card" style="margin:0; min-height:100vh; padding:0; overflow:auto">
      <div style="display:flex; justify-content:space-between; padding:10px; background:#0f172a; color:#fff; position:sticky; top:0; z-index:10">
        <button class="btn-sm" style="background:rgba(255,255,255,.15); color:#fff" data-action="back">← رجوع</button>
        <span style="font-size:10px">${subProgress} مهام فرعية</span>
      </div>
      <div style="padding:12px">
        <input id="tTitlePage" value="${t.text}" style="width:100%; font-size:15px; font-weight:800; border:0; border-bottom:1.5px solid #f1f5f9; padding:8px 0">
        <div style="display:flex; gap:6px; margin:10px 0">
          <select id="tCatPage" style="flex:1; padding:8px; border-radius:8px; font-size:12px; border:1px solid #e2e8f0">${CATS.map(c=>`<option ${c===t.cat?'selected':''}>${c}</option>`).join('')}</select>
          <select id="tPrioPage" style="flex:1; padding:8px; border-radius:8px; font-size:12px; border:1px solid #e2e8f0">${PRIORITY.map(p=>`<option ${p===t.priority?'selected':''}>${p}</option>`).join('')}</select>
        </div>

        <!-- مهام فرعية -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:10px; margin-top:10px">
          <b style="font-size:11px">📋 مهام فرعية</b>
          <div style="display:flex; gap:4px; margin-top:8px">
            <input id="newSubTask" placeholder="مهمة فرعية..." style="flex:1; padding:8px; border:1px solid #e2e8f0; border-radius:8px; font-size:11px">
            <button class="btn-sm btn-dark" data-action="addSub" data-id="${t.id}">+</button>
          </div>
          <div style="margin-top:8px">
            ${t.subtasks.map(s=>`<div style="display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #f1f5f9; padding:6px 8px; border-radius:8px; margin-top:4px">
              <input type="checkbox" ${s.done?'checked':''} data-action="toggleSub" data-id="${t.id}" data-subid="${s.id}">
              <span style="flex:1; font-size:11px; ${s.done?'text-decoration:line-through; color:#94a3b8':''}">${s.text}</span>
              <button class="btn-sm" style="background:#fee2e2; color:#e11d48; padding:2px 6px; border-radius:6px; font-size:10px" data-action="delSub" data-id="${t.id}" data-subid="${s.id}">✕</button>
            </div>`).join('') || '<div style="font-size:9px; color:#94a3b8; text-align:center; padding:6px">لا مهام فرعية</div>'}
          </div>
        </div>

        <!-- مرفقات -->
        <div style="border:1.5px solid #e2e8f0; border-radius:12px; overflow:hidden; margin-top:12px">
          <div style="display:flex; justify-content:space-between; padding:8px; background:#f8fafc; align-items:center">
            <b style="font-size:10px">📎 مرفقات - صور / فويس / كاميرا</b>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; padding:8px">
            <button class="btn-sm" style="background:#e0f2fe; border:1px solid #bae6fd; padding:10px 4px; border-radius:10px; font-size:10px; font-weight:700" data-action="pickImage" data-id="${t.id}">🖼️ صورة</button>
            <button class="btn-sm" style="background:#dcfce7; border:1px solid #bbf7d0; padding:10px 4px; border-radius:10px; font-size:10px; font-weight:700" data-action="pickCamera" data-id="${t.id}">📷 كاميرا</button>
            <button class="btn-sm" id="recBtn" style="background:${isRecording?'#fee2e2':'#fef3c7'}; border:1px solid ${isRecording?'#fecaca':'#fde68a'}; padding:10px 4px; border-radius:10px; font-size:10px; font-weight:700" data-action="toggleRec" data-id="${t.id}">${isRecording?'⏹️ إيقاف':'🎙️ فويس'}</button>
          </div>
          <input type="file" id="taskImageInput" accept="image/*" style="display:none">
          <input type="file" id="taskCameraInput" accept="image/*" capture="environment" style="display:none">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; padding:8px">
            ${t.attachments.map((a,i)=> a.type==='image'? `<div style="position:relative"><img src="${a.data}" style="width:100%; height:80px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0"><button style="position:absolute; top:2px; right:2px; background:#e11d48; color:#fff; border:0; border-radius:50%; width:18px; height:18px; font-size:10px" data-action="delAtt" data-id="${t.id}" data-index="${i}">✕</button></div>` : `<div style="background:#f1f5f9; border-radius:8px; padding:6px; position:relative"><audio src="${a.data}" controls style="width:100%; height:28px"></audio><button style="position:absolute; top:2px; right:2px; background:#e11d48; color:#fff; border:0; border-radius:50%; width:16px; height:16px; font-size:8px" data-action="delAtt" data-id="${t.id}" data-index="${i}">✕</button></div>`).join('')}
          </div>
        </div>

        <div style="border:1.5px solid #e2e8f0; border-radius:12px; overflow:hidden; margin-top:10px">
          <div style="display:flex; justify-content:space-between; padding:8px; background:#f8fafc"><b style="font-size:10px">🎨 رسم</b><div style="display:flex; gap:4px"><button class="btn-sm" style="background:#fff; border:1px solid #e2e8f0" data-action="clearDraw">مسح</button><button class="btn-sm btn-dark" data-action="saveDraw" data-id="${t.id}">حفظ</button></div></div>
          <canvas id="drawCanvas" width="340" height="200" style="width:100%; background:#fff; touch-action:none"></canvas>
        </div>
        <button class="btn-sm btn-dark" style="margin-top:12px; width:100%; padding:10px" data-action="savePage" data-id="${t.id}">💾 حفظ الكل</button>
      </div></div>`;
    }
  }
  const filteredByCat=tab==='all'? tasks : tasks.filter(x=>x.cat===tab);
  const filtered=subTab==='all'? filteredByCat : filteredByCat.filter(x=>(x.priority||'عام')===subTab);
  return `<div class="card" style="padding:8px"><div style="display:flex; gap:6px; align-items:center"><select id="catFilter" style="flex:1; padding:8px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:11px; font-weight:700"><option value="all">كل التبويبات</option>${CATS.map(c=>`<option value="${c}" ${tab===c?'selected':''}>${c}</option>`).join('')}</select><select id="prioFilter" style="flex:1; padding:8px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:11px"><option value="all">كل الأولويات</option>${PRIORITY.map(p=>`<option value="${p}" ${subTab===p?'selected':''}>${p}</option>`).join('')}</select><button class="btn-sm btn-dark" data-action="toggleManage" style="padding:8px 10px; border-radius:10px">⚙️</button></div>${showManage?`<div style="margin-top:8px; padding:10px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0"><b style="font-size:10px">إدارة الفئات</b><div style="display:flex; gap:4px; margin-top:6px"><input id="newCat" placeholder="اسم فئة جديدة" style="flex:1; padding:7px; border:1px solid #e2e8f0; border-radius:8px; font-size:11px"><button class="btn-sm btn-dark" data-action="addCat">إضافة</button></div></div>`:''}<div class="inp" style="margin-top:8px"><input id="tT" placeholder="مهمة جديدة..."><button class="btn-sm btn-dark" data-action="addTask">+</button></div></div>
  <table class="pro-table" style="margin:8px; width:calc(100% - 16px)"><tr><th>✅</th><th>المهمة</th><th>فئة</th><th></th></tr>${filtered.map(t=>{
    let sub = t.subtasks? `${t.subtasks.filter(s=>s.done).length}/${t.subtasks.length}` : '';
    let att = t.attachments? `📎${t.attachments.length}` : '';
    return `<tr data-action="open" data-id="${t.id}" style="cursor:pointer"><td><input type="checkbox" ${t.done?'checked':''} data-action="toggle" data-id="${t.id}"></td><td><b style="font-size:11px">${t.text}</b><br><small style="font-size:8px; color:#94a3b8">${t.cat} • ${t.priority||'عام'} ${sub? '• '+sub : ''} ${att}</small></td><td><span style="font-size:8px; background:#f1f5f9; padding:3px 7px; border-radius:10px">${t.priority||'عام'}</span></td><td><button class="btn-sm btn-del-sm" data-action="del" data-id="${t.id}">✕</button></td></tr>`
  }).join('') || `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:10px">لا مهام</td></tr>`}</table>`;
}

function initDraw(c,t){ if(!c) return; const ctx=c.getContext('2d'); let d=false,l=null; const pos=(e)=>{ const r=c.getBoundingClientRect(); const tt=e.touches?e.touches[0]:e; return {x:(tt.clientX-r.left)*(c.width/r.width), y:(tt.clientY-r.top)*(c.height/r.height)}; }; if(t?.drawing){ const im=new Image(); im.onload=()=>ctx.drawImage(im,0,0); im.src=t.drawing; } const s=(e)=>{ d=true; l=pos(e); }; const m=(e)=>{ if(!d) return; const p=pos(e); ctx.strokeStyle='#0f172a'; ctx.lineWidth=3; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(p.x,p.y); ctx.stroke(); l=p; }; const en=()=>{ d=false; }; c.addEventListener('mousedown',s); c.addEventListener('mousemove',m); c.addEventListener('mouseup',en); c.addEventListener('touchstart',s,{passive:false}); c.addEventListener('touchmove',m,{passive:false}); c.addEventListener('touchend',en); }

export function handleTasks(btn,e,rerender){
  let tasks=L(KEY,[]);
  // ملفات
  if(e.target.id==='taskImageInput' && e.target.files[0]){
    const file=e.target.files[0]; const reader=new FileReader();
    reader.onload=()=>{ const t=tasks.find(x=>x.id===openId); if(t){ if(!t.attachments) t.attachments=[]; t.attachments.push({type:'image', data:reader.result}); S(KEY,tasks); rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,t); },100); } };
    reader.readAsDataURL(file); return;
  }
  if(e.target.id==='taskCameraInput' && e.target.files[0]){
    const file=e.target.files[0]; const reader=new FileReader();
    reader.onload=()=>{ const t=tasks.find(x=>x.id===openId); if(t){ if(!t.attachments) t.attachments=[]; t.attachments.push({type:'image', data:reader.result}); S(KEY,tasks); rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,t); },100); } };
    reader.readAsDataURL(file); return;
  }

  let cats=getCats();
  if(e.target.id==='catFilter'){ tab=e.target.value; rerender(); return; }
  if(e.target.id==='prioFilter'){ subTab=e.target.value; rerender(); return; }
  if(btn.dataset.action==='toggleManage'){ showManage=!showManage; rerender(); return; }
  if(btn.dataset.action==='addCat'){ const v=document.getElementById('newCat')?.value.trim(); if(!v||cats.includes(v)) return; cats.push(v); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='open'){ openId=btn.dataset.id; rerender(); setTimeout(()=>{ const t=tasks.find(x=>x.id===openId); const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,t); },100); return; }
  if(btn.dataset.action==='back'){ openId=null; rerender(); return; }
  if(btn.dataset.action==='addTask'){ const txt=document.getElementById('tT')?.value.trim(); if(!txt) return; tasks.unshift({id:uid(), text:txt, cat:tab!=='all'?tab:cats[0]||'عمل', priority:subTab!=='all'?subTab:'عام', date:new Date().toISOString(), done:false, subtasks:[], attachments:[]}); S(KEY,tasks); rerender(); return; }
  if(btn.dataset.action==='del'){ S(KEY, tasks.filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
  if(btn.dataset.action==='toggle'){ const t=tasks.find(x=>x.id===btn.dataset.id); if(t){ t.done=!t.done; S(KEY,tasks); rerender(); } return; }

  // مهام فرعية
  if(btn.dataset.action==='addSub'){ const inp=document.getElementById('newSubTask'); const txt=inp?.value.trim(); if(!txt) return; const t=tasks.find(x=>x.id===btn.dataset.id); if(t){ if(!t.subtasks) t.subtasks=[]; t.subtasks.push({id:uid(), text:txt, done:false}); S(KEY,tasks); rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,t); },100); } return; }
  if(btn.dataset.action==='toggleSub'){ const t=tasks.find(x=>x.id===btn.dataset.id); if(t){ const s=t.subtasks.find(x=>x.id===btn.dataset.subid); if(s) s.done=!s.done; S(KEY,tasks); rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,t); },100); } return; }
  if(btn.dataset.action==='delSub'){ const t=tasks.find(x=>x.id===btn.dataset.id); if(t){ t.subtasks=t.subtasks.filter(x=>x.id!==btn.dataset.subid); S(KEY,tasks); rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,t); },100); } return; }

  // مرفقات
  if(btn.dataset.action==='pickImage'){ document.getElementById('taskImageInput')?.click(); return; }
  if(btn.dataset.action==='pickCamera'){ document.getElementById('taskCameraInput')?.click(); return; }
  if(btn.dataset.action==='delAtt'){ const t=tasks.find(x=>x.id===btn.dataset.id); if(t){ t.attachments.splice(parseInt(btn.dataset.index),1); S(KEY,tasks); rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,t); },100); } return; }

  // فويس
  if(btn.dataset.action==='toggleRec'){
    const t=tasks.find(x=>x.id===btn.dataset.id);
    if(!isRecording){
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
        mediaRecorder=new MediaRecorder(stream); audioChunks=[];
        mediaRecorder.ondataavailable=e=>audioChunks.push(e.data);
        mediaRecorder.onstop=()=>{
          const blob=new Blob(audioChunks,{type:'audio/webm'});
          const reader=new FileReader();
          reader.onload=()=>{ if(t){ if(!t.attachments) t.attachments=[]; t.attachments.push({type:'audio', data:reader.result}); S(KEY,tasks); isRecording=false; rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,t); },100); } };
          reader.readAsDataURL(blob);
        };
        mediaRecorder.start(); isRecording=true; rerender(); setTimeout(()=>{ const cv=document.getElementById('drawCanvas'); if(cv) initDraw(cv,t); },100);
      });
    } else {
      mediaRecorder.stop(); isRecording=false;
    }
    return;
  }

  if(btn.dataset.action==='savePage'){ const t=tasks.find(x=>x.id===btn.dataset.id); if(!t) return; t.text=document.getElementById('tTitlePage')?.value||t.text; t.cat=document.getElementById('tCatPage')?.value||t.cat; t.priority=document.getElementById('tPrioPage')?.value||t.priority; S(KEY,tasks); openId=null; rerender(); return; }
  if(btn.dataset.action==='clearDraw'){ const cv=document.getElementById('drawCanvas'); if(cv) cv.getContext('2d').clearRect(0,0,cv.width,cv.height); return; }
  if(btn.dataset.action==='saveDraw'){ const cv=document.getElementById('drawCanvas'); const t=tasks.find(x=>x.id===btn.dataset.id); if(cv&&t){ t.drawing=cv.toDataURL(); S(KEY,tasks); alert('تم حفظ الرسم'); } return; }
  }

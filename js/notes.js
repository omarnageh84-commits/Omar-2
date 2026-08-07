let notes = JSON.parse(localStorage.getItem('notes_pro') || '[]');
let curColor='yellow', editingNoteId=null, mediaRecorder, audioChunks=[];
let tempSubs=[], tempImage=null, tempAudio=null, tempDraw=null;

function saveNotes(){ localStorage.setItem('notes_pro', JSON.stringify(notes)); }

function attachVoiceFile(input){
  let file=input.files[0]; if(!file) return;
  if(file.size > 5*1024*1024) return alert('التسجيل كبير اوي - اقل من 5 ميجا');
  let r=new FileReader();
  r.onload=e=>{
    tempAudio=e.target.result;
    let p=document.getElementById('attachPreview');
    if(p) p.innerHTML+='🎤 تسجيل مرفق ✓<br>';
  };
  r.readAsDataURL(file);
}

function renderNotes(){
  let el=document.getElementById('tab-notes'); if(!el) return;
  let pinned=notes.filter(n=>n.pinned);
  let others=notes.filter(n=>!n.pinned);
  let sorted=[...pinned,...others].sort((a,b)=>b.id-a.id);
  el.innerHTML=`
  <div style="zoom:0.96">
    <div style="background:#fff;border:2px solid #000;border-radius:16px;padding:10px;margin-bottom:10px;box-shadow:4px 4px 0 #000">
      <input id="noteTitle" placeholder="عنوان الملاحظة..." value="${editingNoteId? (notes.find(n=>n.id===editingNoteId)?.title||'') : ''}" style="width:100%;border:0;background:transparent;font-size:13px;font-weight:800;outline:none;color:#000;margin-bottom:6px">
      <textarea id="noteText" placeholder="اكتب هنا..." rows="2" style="width:100%;border:0;background:transparent;font-size:12px;outline:none;resize:none;color:#334155">${editingNoteId? (notes.find(n=>n.id===editingNoteId)?.text||'') : ''}</textarea>
      <div id="tempSubs" style="margin:6px 0;display:flex;flex-direction:column;gap:4px">${tempSubs.map((s,i)=>`<div style="display:flex;gap:4px;align-items:center;background:#f1f5f9;padding:4px 8px;border-radius:8px;font-size:10px"><span>• ${s.text}</span><b onclick="tempSubs.splice(${i},1);renderTempSubs()" style="color:#ef4444;cursor:pointer;margin-right:auto">✕</b></div>`).join('')}</div>
      <div style="display:flex;gap:4px;margin-bottom:8px">
        <input id="tempSubInput" placeholder="+ مهمة فرعية..." style="flex:1;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:99px;padding:6px 10px;font-size:10px;color:#000">
        <button onclick="addTempSub()" style="border:0;background:#000;color:#fff;border-radius:99px;padding:6px 12px;font-size:10px;font-weight:800">+</button>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;flex-wrap:wrap;gap:6px">
        <div style="display:flex;gap:4px">
          ${[['yellow','#fef08a'],['green','#bbf7d0'],['blue','#bfdbfe'],['pink','#fec8f8'],['purple','#ddd6fe']].map(([k,c])=>`<button onclick="setNoteColor('${k}')" class="dot" data-c="${k}" style="width:22px;height:22px;border-radius:50%;background:${c};border:2px solid ${curColor===k?'#000':'transparent'}"></button>`).join('')}
        </div>
        <div style="display:flex;gap:4px;align-items:center">
          <button onclick="startVoiceNote()" id="voiceBtn" style="width:36px;height:36px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;font-size:16px">🎤</button>
          <button onclick="document.getElementById('voiceFileInput').click()" style="width:36px;height:36px;border-radius:10px;border:1px solid #e2e8f0;background:#fef3c7;font-size:14px" title="فتح المسجل">📁</button>
          <label style="width:36px;height:36px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px">🖼️<input type="file" accept="image/*" onchange="attachImage(this)" hidden></label>
          <button onclick="toggleDraw()" style="width:36px;height:36px;border-radius:10px;border:1px solid #e2e8f0;background:#fff">✏️</button>
          <button onclick="addNote()" style="background:#000;color:#fff;border:0;padding:8px 16px;border-radius:99px;font-size:11px;font-weight:800">${editingNoteId?'تحديث':'حفظ'}</button>
        </div>
      <input type="file" id="voiceFileInput" accept="audio/*" onchange="attachVoiceFile(this)" style="display:none">
      <canvas id="drawCanvas" width="340" height="150" style="display:none;border:1px dashed #cbd5e1;border-radius:10px;margin-top:8px;background:#fff;touch-action:none"></canvas>
      <div id="attachPreview" style="margin-top:6px;font-size:9px;color:#10b981">${(tempImage?'🖼️ صورة مرفقة ✓<br>':'')+(tempAudio?'🎤 تسجيل مرفق ✓<br>':'')+(tempDraw?'✏️ رسم مرفق':'')}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${sorted.map(n=>`<div style="background:${n.color||'#fff'};border:1px solid #e5e7eb;border-radius:14px;padding:10px">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <div style="flex:1">
              <div style="font-size:12px;font-weight:800">${n.pinned?'📌':''} ${n.title||'بدون عنوان'}</div>
              <div style="font-size:11px;margin-top:3px;white-space:pre-wrap;color:#334155">${n.text||''}</div>
              ${n.image? `<img src="${n.image}" onclick="window.open(this.src)" style="width:100%;border-radius:10px;margin-top:6px;max-height:200px;object-fit:cover">` : ''}
              ${n.audio? `<audio controls src="${n.audio}" style="width:100%;margin-top:6px;height:32px"></audio>` : ''}
              ${n.drawing? `<img src="${n.drawing}" style="width:100%;border-radius:8px;margin-top:6px;border:1px solid #e2e8f0">` : ''}
            </div>
            <div style="display:flex;flex-direction:column;gap:4px">
              <button onclick="pinNote(${n.id})" style="border:0;background:#fff;width:28px;height:28px;border-radius:8px">📌</button>
              <button onclick="editNoteStart(${n.id})" style="border:0;background:#fff;width:28px;height:28px;border-radius:8px">✎</button>
              <button onclick="deleteNote(${n.id})" style="border:0;background:#fee2e2;width:28px;height:28px;border-radius:8px">🗑️</button>
            </div>
          </div>
        </div>`).join('') || '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:11px">لا يوجد ملاحظات - دوس 🎤 لتسجيل صوت</div>'}
    </div>
  </div>`;
  initDraw(); renderTempSubs();
}
function addTempSub(){ let el=document.getElementById('tempSubInput'); let v=el?.value.trim(); if(!v) return; tempSubs.push({text:v,done:false}); el.value=''; renderTempSubs(); }
function renderTempSubs(){ let c=document.getElementById('tempSubs'); if(!c) return; c.innerHTML=tempSubs.map((s,i)=>`<div style="display:flex;gap:4px;align-items:center;background:#f1f5f9;padding:4px 8px;border-radius:8px;font-size:10px"><span>• ${s.text}</span><b onclick="tempSubs.splice(${i},1);renderTempSubs()" style="color:#ef4444;cursor:pointer;margin-right:auto">✕</b></div>`).join(''); }
function attachImage(input){ let file=input.files[0]; if(!file) return; let r=new FileReader(); r.onload=e=>{ tempImage=e.target.result; let p=document.getElementById('attachPreview'); if(p) p.innerHTML+='🖼️ صورة مرفقة ✓<br>'; }; r.readAsDataURL(file); }
function setNoteColor(c){ curColor=c; document.querySelectorAll('.dot').forEach(d=>d.style.border=d.dataset.c===c?'2px solid #000':'2px solid transparent'); }
function addNote(){
  let title=document.getElementById('noteTitle')?.value.trim()||'';
  let text=document.getElementById('noteText')?.value.trim()||'';
  if(!title &&!text && tempSubs.length===0 &&!tempImage &&!tempAudio) return alert('اكتب حاجة');
  let colorMap={yellow:'#fef08a',green:'#bbf7d0',blue:'#bfdbfe',pink:'#fec8f8',purple:'#ddd6fe'};
  let canvas=document.getElementById('drawCanvas'); if(canvas && canvas.style.display!=='none') tempDraw=canvas.toDataURL();
  if(editingNoteId){
    let n=notes.find(x=>x.id===editingNoteId); if(n){ n.title=title; n.text=text; n.color=colorMap[curColor]; if(tempImage) n.image=tempImage; if(tempAudio) n.audio=tempAudio; if(tempDraw) n.drawing=tempDraw; }
  }else{
    notes.push({id:Date.now(),title,text,color:colorMap[curColor],subs:[...tempSubs],image:tempImage,audio:tempAudio,drawing:tempDraw,pinned:false,date:new Date().toLocaleDateString('ar-EG')});
    if(window.ارسل_ملاحظة) ارسل_ملاحظة(title, text, colorMap[curColor]);
  }
  editingNoteId=null; tempSubs=[]; tempImage=null; tempAudio=null; tempDraw=null; saveNotes(); renderNotes();
}
function editNoteStart(id){ editingNoteId=id; renderNotes(); window.scrollTo(0,0); }
function deleteNote(id){ if(!confirm('مسح؟')) return; notes=notes.filter(x=>x.id!==id); saveNotes(); renderNotes(); }
function pinNote(id){ let n=notes.find(x=>x.id===id); if(n){ n.pinned=!n.pinned; saveNotes(); renderNotes(); } }
async function startVoiceNote(){
  let btn=document.getElementById('voiceBtn');
  if(mediaRecorder && mediaRecorder.state==='recording'){ mediaRecorder.stop(); btn.innerText='🎤'; btn.style.background='#fff'; return; }
  try{
    if(!navigator.mediaDevices ||!navigator.mediaDevices.getUserMedia) throw new Error('no mic api');
    let stream=await navigator.mediaDevices.getUserMedia({audio:true});
    mediaRecorder=new MediaRecorder(stream); audioChunks=[];
    mediaRecorder.ondataavailable=e=>{ if(e.data.size>0) audioChunks.push(e.data); };
    mediaRecorder.onstop=()=>{
      let blob=new Blob(audioChunks,{type:'audio/webm'});
      let reader=new FileReader();
      reader.onload=e=>{ tempAudio=e.target.result; document.getElementById('attachPreview').innerHTML+='🎤 تسجيل مرفق ✓<br>'; stream.getTracks().forEach(t=>t.stop()); };
      reader.readAsDataURL(blob);
    };
    mediaRecorder.start(); btn.innerText='⏹️'; btn.style.background='#fee2e2';
  }catch(e){
    // فشل؟ افتح اختيار ملف صوتي (ده اللي هيشتغل في الـ APK)
    document.getElementById('voiceFileInput').click();
  }
}
function toggleDraw(){ let c=document.getElementById('drawCanvas'); c.style.display = c.style.display==='none'?'block':'none'; }
function initDraw(){
  let c=document.getElementById('drawCanvas'); if(!c) return; let ctx=c.getContext('2d'), drawing=false;
  const getPos=(e)=>{ let r=c.getBoundingClientRect(); let x=(e.touches?e.touches[0].clientX:e.clientX)-r.left; let y=(e.touches?e.touches[0].clientY:e.clientY)-r.top; return {x,y}; };
  c.onmousedown=e=>{drawing=true; let p=getPos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y);};
  c.onmouseup=()=>{drawing=false; ctx.beginPath();};
  c.onmousemove=e=>{ if(!drawing) return; let p=getPos(e); ctx.lineWidth=2; ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x,p.y); };
  c.ontouchstart=e=>{drawing=true; let p=getPos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); e.preventDefault();};
  c.ontouchend=()=>{drawing=false; ctx.beginPath();};
  c.ontouchmove=e=>{ if(!drawing) return; let p=getPos(e); ctx.lineWidth=2; ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x,p.y); e.preventDefault(); };
}

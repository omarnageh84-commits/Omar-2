// js/notes.js - برو ماكس مع صورة وصوت ورسم ومهام فرعية
let notes = JSON.parse(localStorage.getItem('notes_pro') || '[]');
let curColor='yellow', editingNoteId=null, mediaRecorder, audioChunks=[];
function saveNotes(){ localStorage.setItem('notes_pro', JSON.stringify(notes)); }

function renderNotes(){
  let el=document.getElementById('tab-notes'); if(!el) return;
  let pinned=notes.filter(n=>n.pinned);
  let others=notes.filter(n=>!n.pinned);
  let sorted=[...pinned,...others].sort((a,b)=>b.id-a.id);

  el.innerHTML=`
  <div style="zoom:0.96">
    <!-- كومبوسر برو -->
    <div id="noteComposer" style="background:#fff;border:2px solid #000;border-radius:16px;padding:10px;margin-bottom:10px;box-shadow:4px 4px 0 #000">
      <input id="noteTitle" placeholder="عنوان الملاحظة..." maxlength="40" style="width:100%;border:0;background:transparent;font-size:13px;font-weight:800;outline:none;color:#000;margin-bottom:6px" value="${editingNoteId? (notes.find(n=>n.id===editingNoteId)?.title||'') : ''}">
      <textarea id="noteText" placeholder="اكتب هنا... تقدر تضيف مهام فرعية تحت 👇" rows="2" style="width:100%;border:0;background:transparent;font-size:12px;outline:none;resize:none;color:#334155">${editingNoteId? (notes.find(n=>n.id===editingNoteId)?.text||'') : ''}</textarea>

      <!-- مهام فرعية مؤقتة قبل الحفظ -->
      <div id="tempSubs" style="margin:6px 0;display:flex;flex-direction:column;gap:4px"></div>
      <div style="display:flex;gap:4px;margin-bottom:8px">
        <input id="tempSubInput" placeholder="+ مهمة فرعية..." style="flex:1;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:99px;padding:6px 10px;font-size:10px;color:#000">
        <button onclick="addTempSub()" style="border:0;background:#000;color:#fff;border-radius:99px;padding:6px 12px;font-size:10px;font-weight:800">+</button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
        <div style="display:flex;gap:4px">
          ${[['yellow','#fef08a'],['green','#bbf7d0'],['blue','#bfdbfe'],['pink','#fec8f8'],['purple','#ddd6fe']].map(([k,c])=>`<button onclick="setNoteColor('${k}')" class="dot" data-c="${k}" style="width:22px;height:22px;border-radius:50%;background:${c};border:2px solid ${curColor===k?'#000':'transparent'}"></button>`).join('')}
        </div>
        <div style="display:flex;gap:4px">
          <button onclick="startVoiceNote()" id="voiceBtn" style="width:32px;height:32px;border-radius:10px;border:1px solid #e2e8f0;background:#fff">🎤</button>
          <label style="width:32px;height:32px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer">🖼️<input type="file" accept="image/*" onchange="attachImage(this)" hidden></label>
          <button onclick="toggleDraw()" style="width:32px;height:32px;border-radius:10px;border:1px solid #e2e8f0;background:#fff">✏️</button>
          <button onclick="addNote()" style="background:#000;color:#fff;border:0;padding:6px 14px;border-radius:99px;font-size:11px;font-weight:800">${editingNoteId?'تحديث':'حفظ'}</button>
        </div>
      <canvas id="drawCanvas" class="hidden" width="340" height="150" style="border:1px dashed #cbd5e1;border-radius:10px;margin-top:8px;background:#fff;touch-action:none"></canvas>
      <div id="attachPreview" style="margin-top:6px"></div>
    </div>

    <!-- ليست الملاحظات -->
    <div style="display:flex;flex-direction:column;gap:8px">
      ${sorted.map(n=>{
        let done=n.subs? n.subs.filter(s=>s.done).length : 0;
        let total=n.subs? n.subs.length : 0;
        let pct= total? Math.round(done/total*100):0;
        return `
        <div style="background:${n.color==='#fef08a'?'#fefce8':n.color==='#bbf7d0'?'#f0fdf4':n.color==='#bfdbfe'?'#eff6ff':n.color==='#fec8f8'?'#fdf2f8':'#f5f3ff'};border:1px solid #e5e7eb;border-radius:14px;padding:10px;position:relative">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <div style="flex:1">
              <div style="font-size:12px;font-weight:800;display:flex;gap:4px;align-items:center">${n.pinned?'📌':''} ${n.title||'بدون عنوان'}</div>
              <div style="font-size:11px;margin-top:3px;white-space:pre-wrap;color:#334155">${n.text}</div>
              ${total? `<div style="margin-top:6px"><div style="height:4px;background:#e2e8f0;border-radius:99px;overflow:hidden"><div style="height:100%;width:${pct}%;background:#000;transition:.3s"></div></div><div style="font-size:8px;margin-top:2px;color:#64748b">${done}/${total} - ${pct}% خلصت</div></div>`:''}
              ${n.subs? n.subs.map((s,i)=>`<div style="display:flex;gap:5px;align-items:center;margin-top:4px;background:rgba(255,255,255,.7);padding:4px 6px;border-radius:8px"><input type="checkbox" ${s.done?'checked':''} onchange="toggleSub(${n.id},${i})"><span style="font-size:10px;flex:1;text-decoration:${s.done?'line-through':''}">${s.text}</span><b onclick="delSub(${n.id},${i})" style="color:#ef4444;cursor:pointer;font-size:10px">✕</b></div>`).join('') : ''}
              ${n.image? `<img src="${n.image}" style="width:100%;border-radius:10px;margin-top:6px;max-height:200px;object-fit:cover">` : ''}
              ${n.audio? `<audio controls src="${n.audio}" style="width:100%;margin-top:6px;height:28px"></audio>` : ''}
              ${n.drawing? `<img src="${n.drawing}" style="width:100%;border-radius:8px;margin-top:6px;border:1px solid #e2e8f0">` : ''}
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;margin-right:6px">
              <button onclick="pinNote(${n.id})" style="border:0;background:#fff;width:26px;height:26px;border-radius:8px">${n.pinned?'📍':'📌'}</button>
              <button onclick="editNoteStart(${n.id})" style="border:0;background:#fff;width:26px;height:26px;border-radius:8px">✎</button>
              <button onclick="deleteNote(${n.id})" style="border:0;background:#fee2e2;width:26px;height:26px;border-radius:8px">🗑️</button>
            </div>
          </div>
          <div style="margin-top:6px;display:flex;gap:4px">
            <input id="subIn${n.id}" placeholder="+ مهمة فرعية سريعة" style="flex:1;font-size:9px;padding:4px 8px;border-radius:99px;border:1px solid #e2e8f0;background:#fff;color:#000">
            <button onclick="addSub(${n.id})" style="border:0;background:#000;color:#fff;border-radius:99px;padding:4px 10px;font-size:9px">+</button>
          </div>
        </div>`;
      }).join('') || '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:11px">لا يوجد ملاحظات - اضف اول ملاحظة بصوت او صورة</div>'}
    </div>
  </div>`;
  initDraw();
}

let tempSubs=[];
function addTempSub(){
  let el=document.getElementById('tempSubInput'); let v=el.value.trim(); if(!v) return;
  tempSubs.push({text:v,done:false}); el.value=''; renderTempSubs();
}
function renderTempSubs(){
  document.getElementById('tempSubs').innerHTML=tempSubs.map((s,i)=>`<div style="display:flex;gap:4px;align-items:center;background:#f1f5f9;padding:4px 8px;border-radius:8px;font-size:10px"><span>• ${s.text}</span><b onclick="tempSubs.splice(${i},1);renderTempSubs()" style="color:#ef4444;cursor:pointer;margin-right:auto">✕</b></div>`).join('');
}
let tempImage=null,tempAudio=null,tempDraw=null;
function attachImage(input){
  let file=input.files[0]; if(!file) return;
  let reader=new FileReader(); reader.onload=e=>{ tempImage=e.target.result; document.getElementById('attachPreview').innerHTML+=`<div>🖼️ صورة مرفقة <b onclick="tempImage=null;this.parentElement.remove()" style="color:#ef4444;cursor:pointer">✕</b></div>`; }; reader.readAsDataURL(file);
}
function setNoteColor(c){ curColor=c; document.querySelectorAll('.dot').forEach(d=>d.style.border=d.dataset.c===c?'2px solid #000':'2px solid transparent'); }
function addNote(){
  let title=document.getElementById('noteTitle').value.trim();
  let text=document.getElementById('noteText').value.trim();
  if(!title &&!text && tempSubs.length===0 &&!tempImage &&!tempAudio) return alert('اكتب حاجة');
  let colorMap={yellow:'#fef08a',green:'#bbf7d0',blue:'#bfdbfe',pink:'#fec8f8',purple:'#ddd6fe'};
  let canvas=document.getElementById('drawCanvas'); if(!canvas.classList.contains('hidden')) tempDraw=canvas.toDataURL();
  if(editingNoteId){
    let n=notes.find(x=>x.id===editingNoteId); n.title=title; n.text=text; n.color=colorMap[curColor]; if(tempImage) n.image=tempImage; if(tempAudio) n.audio=tempAudio; if(tempDraw) n.drawing=tempDraw; if(tempSubs.length) n.subs=[...(n.subs||[]),...tempSubs];
  }else{
    notes.push({id:Date.now(),title,text,color:colorMap[curColor],subs:[...tempSubs],image:tempImage,audio:tempAudio,drawing:tempDraw,pinned:false,date:new Date().toLocaleDateString('ar-EG')});
  }
  editingNoteId=null; tempSubs=[]; tempImage=null; tempAudio=null; tempDraw=null; saveNotes(); renderNotes();
}
function editNoteStart(id){ editingNoteId=id; let n=notes.find(x=>x.id===id); curColor=Object.keys({yellow:'#fef08a',green:'#bbf7d0',blue:'#bfdbfe',pink:'#fec8f8',purple:'#ddd6fe'}).find(k=>({yellow:'#fef08a',green:'#bbf7d0',blue:'#bfdbfe',pink:'#fec8f8',purple:'#ddd6fe'}[k]===n.color))||'yellow'; renderNotes(); }
function deleteNote(id){
  let n=notes.find(x=>x.id===id);
  if(!confirm(`⚠️ مسح الملاحظة "${n.title||n.text.slice(0,20)}" ؟`)) return;
  notes=notes.filter(x=>x.id!==id); saveNotes(); renderNotes();
}
function pinNote(id){ let n=notes.find(x=>x.id===id); n.pinned=!n.pinned; saveNotes(); renderNotes(); }
function addSub(id){ let el=document.getElementById('subIn'+id); let v=el.value.trim(); if(!v) return; let n=notes.find(x=>x.id===id); if(!n.subs) n.subs=[]; n.subs.push({text:v,done:false}); el.value=''; saveNotes(); renderNotes(); }
function toggleSub(id,i){ let n=notes.find(x=>x.id===id); n.subs[i].done=!n.subs[i].done; saveNotes(); renderNotes(); if(n.subs.every(s=>s.done)) alert(`🎉 خلصت ${n.title||'الملاحظة'} 100%!`); }
function delSub(id,i){ if(!confirm('مسح المهمة الفرعية؟')) return; let n=notes.find(x=>x.id===id); n.subs.splice(i,1); saveNotes(); renderNotes(); }

// صوت
async function startVoiceNote(){
  let btn=document.getElementById('voiceBtn');
  if(mediaRecorder && mediaRecorder.state==='recording'){ mediaRecorder.stop(); btn.innerText='🎤'; return; }
  try{
    let stream=await navigator.mediaDevices.getUserMedia({audio:true});
    mediaRecorder=new MediaRecorder(stream); audioChunks=[];
    mediaRecorder.ondataavailable=e=>audioChunks.push(e.data);
    mediaRecorder.onstop=()=>{ let blob=new Blob(audioChunks,{type:'audio/webm'}); let reader=new FileReader(); reader.onload=e=>{ tempAudio=e.target.result; document.getElementById('attachPreview').innerHTML+=`<div>🎤 تسجيل صوتي مرفق <b onclick="tempAudio=null;this.parentElement.remove()" style="color:#ef4444">✕</b></div>`; }; reader.readAsDataURL(blob); };
    mediaRecorder.start(); btn.innerText='⏹️'; btn.style.background='#fee2e2';
  }catch(e){ alert('الميك مش شغال في MIT لازم تسمح بالميك'); }
}
function toggleDraw(){ document.getElementById('drawCanvas').classList.toggle('hidden'); }
function initDraw(){
  let c=document.getElementById('drawCanvas'); if(!c) return; let ctx=c.getContext('2d'), drawing=false;
  c.addEventListener('mousedown',()=>drawing=true); c.addEventListener('mouseup',()=>{drawing=false; ctx.beginPath();});
  c.addEventListener('mousemove',e=>{ if(!drawing) return; let r=c.getBoundingClientRect(); ctx.lineWidth=2; ctx.lineCap='round'; ctx.lineTo(e.clientX-r.left,e.clientY-r.top); ctx.stroke(); ctx.beginPath(); ctx.moveTo(e.clientX-r.left,e.clientY-r.top); });
  c.addEventListener('touchstart',e=>{drawing=true; e.preventDefault();}); c.addEventListener('touchend',()=>{drawing=false; ctx.beginPath();});
  c.addEventListener('touchmove',e=>{ if(!drawing) return; let r=c.getBoundingClientRect(); ctx.lineWidth=2; ctx.lineTo(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top); ctx.stroke(); ctx.beginPath(); ctx.moveTo(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top); e.preventDefault(); },{passive:false});
}

let notes=loadLS('omar_notes',[]);
let noteEditId=null;
function saveNotes(){ saveLS('omar_notes', notes); saveLS('omar_note_cats', catsNote); }
function renderNoteCats(){
  const box=document.getElementById('note-cats'); if(!box) return;
  box.innerHTML=`
    <div style="display:flex;gap:6px;overflow-x:auto;padding:8px 0">
      ${['الكل',...catsNote].map(c=>`<button onclick="filterNote('${c}')" style="white-space:nowrap;padding:6px 12px;border-radius:99px;border:0;font-size:12px;font-weight:700;background:${currentNoteFilter===c?'#10b981':'#e5e7eb'};color:${currentNoteFilter===c?'#fff':'#374151'}">${c}</button>`).join('')}
      <button onclick="addNoteCat()" style="padding:6px 10px;border-radius:99px;border:1px dashed #10b981;color:#10b981;background:#fff">+ فئة</button>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${catsNote.map(c=>`<span style="font-size:10px;background:#f3f4f6;padding:2px 6px;border-radius:6px">${c} <b onclick="deleteNoteCat('${c}')" style="color:red;cursor:pointer">✕</b></span>`).join('')}
    </div>`;
  const sel=document.getElementById('note-cat-select');
  if(sel) sel.innerHTML=catsNote.map(c=>`<option value="${c}">${c}</option>`).join('');
}
function filterNote(c){ currentNoteFilter=c; renderNotes(); }
function addNoteCat(){ let n=prompt('اسم الفئة:'); if(!n) return; n=n.trim(); if(catsNote.includes(n)) return; catsNote.push(n); saveNotes(); renderNoteCats(); renderNotes(); }
function deleteNoteCat(c){ if(!confirm('تمسح '+c+'؟')) return; catsNote=catsNote.filter(x=>x!==c); notes=notes.map(n=>n.cat===c?{...n,cat:'عام'}:n); saveNotes(); renderNoteCats(); renderNotes(); }
function addNote(){
  const txt=document.getElementById('note-text'); if(!txt||!txt.value.trim()) return alert('اكتب الملاحظة');
  let cat=document.getElementById('note-cat-select')?.value||'البيت';
  let img=document.getElementById('note-img-base')?.value||'';
  let aud=document.getElementById('note-aud-base')?.value||'';
  if(noteEditId){ let i=notes.findIndex(x=>x.id===noteEditId); if(i>-1) notes[i]={...notes[i], text:txt.value.trim(), cat, image:img||notes[i].image, audio:aud||notes[i].audio}; noteEditId=null; document.getElementById('note-btn').innerText='إضافة'; }
  else notes.unshift({id:uid(), text:txt.value.trim(), cat, image:img, audio:aud, date:new Date().toISOString()});
  txt.value=''; document.getElementById('note-img-base').value=''; document.getElementById('note-aud-base').value=''; document.getElementById('note-preview').innerHTML=''; saveNotes(); renderNotes();
}
function editNote(id){ let n=notes.find(x=>x.id===id); if(!n) return; document.getElementById('note-text').value=n.text; document.getElementById('note-cat-select').value=n.cat; document.getElementById('note-img-base').value=n.image||''; document.getElementById('note-aud-base').value=n.audio||''; noteEditId=id; document.getElementById('note-btn').innerText='حفظ'; }
function deleteNote(id){ if(!confirm('تمسح؟')) return; notes=notes.filter(x=>x.id!==id); saveNotes(); renderNotes(); }
function onNoteImg(input){ if(input.files[0]) fileToBase64(input.files[0], b64=>{ document.getElementById('note-img-base').value=b64; document.getElementById('note-preview').innerHTML='<img src="'+b64+'" style="width:100%;border-radius:12px;margin-top:8px">'; }); }
function onNoteAud(input){ if(input.files[0]) fileToBase64(input.files[0], b64=>{ document.getElementById('note-aud-base').value=b64; document.getElementById('note-preview').innerHTML+='<audio controls src="'+b64+'" style="width:100%;margin-top:8px"></audio>'; }); }
let mediaRec=null, chunks=[];
function toggleNoteMic(){
  const btn=document.getElementById('note-mic-btn');
  if(mediaRec && mediaRec.state==='recording'){ mediaRec.stop(); btn.innerText='🎤'; return; }
  navigator.mediaDevices.getUserMedia({audio:true}).then(s=>{
    chunks=[]; mediaRec=new MediaRecorder(s);
    mediaRec.ondataavailable=e=>chunks.push(e.data);
    mediaRec.onstop=()=>{ const blob=new Blob(chunks,{type:'audio/webm'}); fileToBase64(blob,b64=>{ document.getElementById('note-aud-base').value=b64; document.getElementById('note-preview').innerHTML+='<audio controls src="'+b64+'" style="width:100%;margin-top:8px"></audio>'; }); };
    mediaRec.start(); btn.innerText='⏹️';
  }).catch(()=>document.getElementById('note-aud-file').click());
}
function renderNotes(){
  renderNoteCats(); const list=document.getElementById('notes-list'); if(!list) return;
  let filtered=currentNoteFilter==='الكل'?notes:notes.filter(n=>n.cat===currentNoteFilter);
  if(filtered.length===0){ list.innerHTML='<div style="text-align:center;padding:30px;color:#9ca3af">مفيش ملاحظات في '+currentNoteFilter+'</div>'; return; }
  list.innerHTML=filtered.map(n=>`
    <div style="background:#fff;border-radius:16px;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between"><span style="background:#dcfce7;color:#166534;font-size:11px;padding:3px 8px;border-radius:99px">${n.cat}</span><div><button onclick="editNote('${n.id}')" style="border:0;background:#e0f2fe;width:28px;height:28px;border-radius:8px">✏️</button><button onclick="deleteNote('${n.id}')" style="border:0;background:#fee2e2;width:28px;height:28px;border-radius:8px">🗑️</button></div></div>
      <div style="font-weight:600;margin-top:6px;white-space:pre-wrap">${n.text}</div>
      ${n.image?`<img src="${n.image}" style="width:100%;border-radius:12px;margin-top:8px">`:''}
      ${n.audio?`<audio controls src="${n.audio}" style="width:100%;margin-top:8px"></audio>`:''}
    </div>`).join('');
}

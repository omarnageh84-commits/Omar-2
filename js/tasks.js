let tasks=loadLS('omar_tasks',[]);
let taskEditId=null;
function saveTasks(){ saveLS('omar_tasks', tasks); saveLS('omar_task_cats', catsTask); }
function renderTaskCats(){
  const box=document.getElementById('task-cats'); if(!box) return;
  box.innerHTML=`
    <div style="display:flex;gap:6px;overflow-x:auto;padding:8px 0">
      ${['الكل',...catsTask].map(c=>`<button onclick="filterTask('${c}')" style="white-space:nowrap;padding:6px 12px;border-radius:99px;border:0;font-size:12px;font-weight:700;background:${currentTaskFilter===c?'#10b981':'#e5e7eb'};color:${currentTaskFilter===c?'#fff':'#374151'}">${c}</button>`).join('')}
      <button onclick="addTaskCat()" style="padding:6px 10px;border-radius:99px;border:1px dashed #10b981;color:#10b981;background:#fff">+ فئة</button>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${catsTask.map(c=>`<span style="font-size:10px;background:#f3f4f6;padding:2px 6px;border-radius:6px">${c} <b onclick="deleteTaskCat('${c}')" style="color:red">✕</b></span>`).join('')}</div>`;
  const sel=document.getElementById('task-cat-select'); if(sel) sel.innerHTML=catsTask.map(c=>`<option value="${c}">${c}</option>`).join('');
}
function filterTask(c){ currentTaskFilter=c; renderTasks(); }
function addTaskCat(){ let n=prompt('اسم فئة:'); if(!n) return; n=n.trim(); if(catsTask.includes(n)) return; catsTask.push(n); saveTasks(); renderTaskCats(); renderTasks(); }
function deleteTaskCat(c){ if(!confirm('تمسح '+c+'؟')) return; catsTask=catsTask.filter(x=>x!==c); tasks=tasks.map(t=>t.cat===c?{...t,cat:'عام'}:t); saveTasks(); renderTaskCats(); renderTasks(); }
function addTask(){
  const txt=document.getElementById('task-text'); if(!txt||!txt.value.trim()) return alert('اكتب المهمة');
  let cat=document.getElementById('task-cat-select')?.value||'البيت';
  let img=document.getElementById('task-img-base')?.value||''; let aud=document.getElementById('task-aud-base')?.value||'';
  if(taskEditId){ let i=tasks.findIndex(x=>x.id===taskEditId); if(i>-1) tasks[i]={...tasks[i], text:txt.value.trim(), cat, image:img||tasks[i].image, audio:aud||tasks[i].audio}; taskEditId=null; document.getElementById('task-btn').innerText='إضافة'; }
  else tasks.unshift({id:uid(), text:txt.value.trim(), cat, done:false, image:img, audio:aud, date:new Date().toISOString()});
  txt.value=''; document.getElementById('task-img-base').value=''; document.getElementById('task-aud-base').value=''; document.getElementById('task-preview').innerHTML=''; saveTasks(); renderTasks();
}
function toggleTask(id){ let t=tasks.find(x=>x.id===id); if(t) t.done=!t.done; saveTasks(); renderTasks(); }
function editTask(id){ let t=tasks.find(x=>x.id===id); if(!t) return; document.getElementById('task-text').value=t.text; document.getElementById('task-cat-select').value=t.cat; document.getElementById('task-img-base').value=t.image||''; document.getElementById('task-aud-base').value=t.audio||''; taskEditId=id; document.getElementById('task-btn').innerText='حفظ'; }
function deleteTask(id){ if(!confirm('تمسح؟')) return; tasks=tasks.filter(x=>x.id!==id); saveTasks(); renderTasks(); }
function onTaskImg(input){ if(input.files[0]) fileToBase64(input.files[0], b64=>{ document.getElementById('task-img-base').value=b64; document.getElementById('task-preview').innerHTML='<img src="'+b64+'" style="width:100%;border-radius:12px;margin-top:8px">'; }); }
function onTaskAud(input){ if(input.files[0]) fileToBase64(input.files[0], b64=>{ document.getElementById('task-aud-base').value=b64; document.getElementById('task-preview').innerHTML+='<audio controls src="'+b64+'" style="width:100%;margin-top:8px"></audio>'; }); }
function toggleTaskMic(){ const btn=document.getElementById('task-mic-btn'); if(mediaRec && mediaRec.state==='recording'){ mediaRec.stop(); btn.innerText='🎤'; return; } navigator.mediaDevices.getUserMedia({audio:true}).then(s=>{ chunks=[]; mediaRec=new MediaRecorder(s); mediaRec.ondataavailable=e=>chunks.push(e.data); mediaRec.onstop=()=>{ const b=new Blob(chunks,{type:'audio/webm'}); fileToBase64(b,bb=>{ document.getElementById('task-aud-base').value=bb; document.getElementById('task-preview').innerHTML+='<audio controls src="'+bb+'" style="width:100%;margin-top:8px"></audio>'; }); }; mediaRec.start(); btn.innerText='⏹️'; }).catch(()=>document.getElementById('task-aud-file').click()); }
function renderTasks(){
  renderTaskCats(); const list=document.getElementById('tasks-list'); if(!list) return;
  let filtered=currentTaskFilter==='الكل'?tasks:tasks.filter(x=>x.cat===currentTaskFilter);
  if(filtered.length===0){ list.innerHTML='<div style="text-align:center;padding:30px;color:#9ca3af">مفيش مهام في '+currentTaskFilter+'</div>'; return; }
  list.innerHTML=filtered.map(t=>`
    <div style="background:#fff;border-radius:16px;padding:14px;margin-bottom:10px;opacity:${t.done?'.6':1}">
      <div style="display:flex;gap:10px"><input type="checkbox" ${t.done?'checked':''} onchange="toggleTask('${t.id}')" style="width:20px;height:20px"><div style="flex:1"><div style="display:flex;justify-content:space-between"><span style="background:#dcfce7;color:#166534;font-size:10px;padding:2px 6px;border-radius:99px">${t.cat}</span><div><button onclick="editTask('${t.id}')" style="border:0;background:#e0f2fe;width:26px;height:26px;border-radius:7px">✏️</button><button onclick="deleteTask('${t.id}')" style="border:0;background:#fee2e2;width:26px;height:26px;border-radius:7px">🗑️</button></div></div><div style="font-weight:600;margin-top:4px;text-decoration:${t.done?'line-through':''}">${t.text}</div>${t.image?`<img src="${t.image}" style="width:100%;border-radius:12px;margin-top:8px">`:''}${t.audio?`<audio controls src="${t.audio}" style="width:100%;margin-top:8px"></audio>`:''}</div></div>
    </div>`).join('');
}

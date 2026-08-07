// js/tasks.js - أفضل تبويب مهام في التاريخ
let tasks = JSON.parse(localStorage.getItem('tasks_pro') || '[]');
let taskFilter='all';

function saveTasks(){ localStorage.setItem('tasks_pro', JSON.stringify(tasks)); }

function renderTasks(){
  let done = tasks.filter(t=>t.done).length;
  let total = tasks.length;
  let pct = total? Math.round((done/total)*100):0;

  let filtered = tasks.filter(t=>{
    if(taskFilter==='done' &&!t.done) return false;
    if(taskFilter==='todo' && t.done) return false;
    if(taskFilter==='high' && t.pri!=='high') return false;
    return true;
  }).sort((a,b)=> a.done - b.done || b.pri.localeCompare(a.pri) || b.id - a.id);

  document.getElementById('tab-tasks').innerHTML=`
  <div style="background:#000;color:#fff;border-radius:16px;padding:12px;margin-bottom:8px;position:relative;overflow:hidden">
    <div style="position:absolute;top:-20px;right:-20px;width:80px;height:80px;background:#22c55e;border-radius:50%;opacity:.2"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;position:relative">
      <div><div style="font-size:13px;font-weight:800">مهامي اليوم</div><div style="font-size:9px;opacity:.7">${done}/${total} مكتمل • ${pct}%</div></div>
      <div style="width:38px;height:38px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;border:2px solid #333">${pct}%</div>
    </div>
    <div style="height:4px;background:#222;border-radius:99px;margin-top:8px;overflow:hidden"><div style="height:100%;width:${pct}%;background:#22c55e;transition:.5s"></div></div>
  </div>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:6px;display:flex;gap:4px;margin-bottom:8px;position:sticky;top:0;z-index:5">
    <input id="taskInput" placeholder="مهمة جديدة + Enter..." style="flex:1;border:0;background:#f8fafc;border-radius:99px;padding:8px 12px;font-size:12px;outline:none;color:#000" onkeydown="if(event.key==='Enter') addTask()" />
    <select id="taskPri" style="border:0;background:#f8fafc;border-radius:99px;font-size:10px;padding:6px;color:#000"><option value="low">عادي</option><option value="med">مهم</option><option value="high">🔥 عاجل</option></select>
    <button onclick="addTask()" style="background:#000;color:#fff;border:0;width:34px;height:34px;border-radius:50%;font-size:14px;cursor:pointer">+</button>
  </div>

  <div style="display:flex;gap:4px;margin-bottom:8px;overflow:auto">
    ${['all','todo','done','high'].map(f=>`<button onclick="taskFilter='${f}';renderTasks()" style="border:0;padding:5px 12px;border-radius:99px;font-size:10px;white-space:nowrap;cursor:pointer;${taskFilter===f?'background:#000;color:#fff':'background:#f1f5f9;color:#64748b'}">${{all:'الكل',todo:'متبقي',done:'مكتمل',high:'عاجل'}[f]}</button>`).join('')}
  </div>

  <div style="display:flex;flex-direction:column;gap:6px">
    ${filtered.map(t=>`
      <div onclick="toggleTask(${t.id})" style="background:${t.done?'#f8fafc':'#fff'};border:1px solid ${t.done?'#f1f5f9':'#e5e7eb'};border-right:3px solid ${t.pri==='high'?'#ef4444':t.pri==='med'?'#f59e0b':'#e5e7eb'};border-radius:12px;padding:10px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:.2s;opacity:${t.done?'.6':1}">
        <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${t.done?'#22c55e':'#cbd5e1'};background:${t.done?'#22c55e':''};display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;flex-shrink:0">${t.done?'✓':''}</div>
        <div style="flex:1"><div style="font-size:12px;font-weight:600;color:${t.done?'#94a3b8':'#0f172a'};text-decoration:${t.done?'line-through':''}">${t.text}</div><div style="font-size:8px;color:#94a3b8;display:flex;gap:6px;margin-top:2px"><span>${t.pri==='high'?'🔥 عاجل':t.pri==='med'?'⚡ مهم':'• عادي'}</span><span style="font-family:monospace">${new Date(t.id).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span></div></div>
        <button onclick="event.stopPropagation();deleteTask(${t.id})" style="border:0;background:#fff1f2;color:#ef4444;width:24px;height:24px;border-radius:50%;font-size:10px;cursor:pointer">✕</button>
      </div>
    `).join('') || `<div style="text-align:center;padding:40px;color:#cbd5e1"><div style="font-size:30px">✨</div><div style="font-size:11px;margin-top:6px">مفيش مهام - يومك فاضي!</div></div>`}
  </div>

  ${total>0? `<div style="margin-top:10px;display:flex;gap:6px"><button onclick="clearDone()" style="flex:1;border:1px dashed #fecaca;background:#fef2f2;color:#dc2626;padding:8px;border-radius:10px;font-size:10px;cursor:pointer">🗑️ مسح المكتمل (${done})</button><button onclick="clearAllTasks()" style="border:1px solid #e5e7eb;background:#fff;padding:8px 12px;border-radius:10px;font-size:10px">مسح الكل</button></div>`:''}
  `;
}

function addTask(){
  let input=document.getElementById('taskInput'), pri=document.getElementById('taskPri').value;
  let txt=input.value.trim(); if(!txt) return;
  tasks.push({id:Date.now(), text:txt, pri, done:false});
  saveTasks(); input.value=''; renderTasks();
}
function toggleTask(id){ let t=tasks.find(x=>x.id===id); if(t) t.done=!t.done; saveTasks(); renderTasks(); }
function deleteTask(id){ tasks=tasks.filter(x=>x.id!==id); saveTasks(); renderTasks(); }
function clearDone(){ tasks=tasks.filter(x=>!x.done); saveTasks(); renderTasks(); }
function clearAllTasks(){ if(!confirm('تمسح الكل؟')) return; tasks=[]; saveTasks(); renderTasks(); }

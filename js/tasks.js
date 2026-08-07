let tasks=JSON.parse(localStorage.getItem('tasks_pro')||'[]');
let taskFilter='all', editingTaskId=null;

function saveTasks(){ localStorage.setItem('tasks_pro', JSON.stringify(tasks)); }

function renderTasks(){
  let el=document.getElementById('tab-tasks'); if(!el) return;
  let done=tasks.filter(t=>t.done).length, total=tasks.length, pct= total? Math.round(done/total*100):0;
  let filtered=tasks.filter(t=>{
    if(taskFilter==='done' &&!t.done) return false;
    if(taskFilter==='todo' && t.done) return false;
    if(taskFilter!=='all' && taskFilter!=='done' && taskFilter!=='todo' && t.cat!==taskFilter) return false;
    return true;
  }).sort((a,b)=>a.done-b.done || b.id-a.id);

  el.innerHTML=`
  <div style="zoom:0.96">
    <div style="background:#000;color:#fff;border-radius:16px;padding:12px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:12px;font-weight:800">إجمالي مهامي</div><div style="font-size:8px;opacity:.7">${done}/${total} • ${pct}%</div></div>
        <div style="width:38px;height:38px;border-radius:50%;background:#1a1a1a;border:2px solid #333;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">${pct}%</div>
      </div>
      <div style="height:4px;background:#222;border-radius:99px;margin-top:8px;overflow:hidden"><div style="height:100%;width:${pct}%;background:#22c55e"></div></div>
    </div>
    <div style="display:flex;gap:4px;background:#f1f5f9;padding:3px;border-radius:99px;margin-bottom:8px;overflow-x:auto">
      ${[['all','الكل'],['work','💼 شغل'],['personal','👤 شخصي'],['todo','متبقي'],['done','منجز']].map(([k,l])=>`<button onclick="taskFilter='${k}';renderTasks()" style="flex:1;white-space:nowrap;border:0;padding:6px 10px;border-radius:99px;font-size:9px;font-weight:700;background:${taskFilter===k?'#fff':'transparent'};box-shadow:${taskFilter===k?'0 1px 4px rgba(0,0,0,.1)':''}">${l}</button>`).join('')}
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:6px;display:flex;gap:4px;margin-bottom:8px">
      <input id="taskInput" placeholder="${editingTaskId?'عدل المهمة...':'مهمة جديدة + Enter...'}" style="flex:1;border:0;background:#f8fafc;border-radius:99px;padding:8px 12px;font-size:12px;outline:none;color:#000">
      <select id="taskCat" style="border:0;background:#f8fafc;border-radius:99px;font-size:9px;padding:6px;color:#000"><option value="personal">👤 شخصي</option><option value="work">💼 شغل</option><option value="other">📌 عام</option></select>
      <select id="taskPri" style="border:0;background:#f8fafc;border-radius:99px;font-size:9px;padding:6px;color:#000"><option value="low">عادي</option><option value="med">مهم</option><option value="high">🔥 عاجل</option></select>
      <button onclick="addTask()" style="background:#000;color:#fff;border:0;border-radius:99px;padding:8px 14px;font-size:11px;font-weight:800">${editingTaskId?'✓':' +'}</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${filtered.map(t=>`<div style="background:${t.done?'#f0fdf4':'#fff'};border:1px solid ${t.pri==='high'?'#fecaca':'#e5e7eb'};border-radius:14px;padding:10px">
          <div style="display:flex;gap:6px;align-items:center">
            <input type="checkbox" ${t.done?'checked':''} onchange="toggleTask(${t.id})" style="width:18px;height:18px">
            <div style="flex:1">
              <div style="font-size:11px;font-weight:800;text-decoration:${t.done?'line-through':''}">${t.cat==='work'?'💼 ':t.cat==='personal'?'👤 ':''}${t.pri==='high'?'🔥':''} ${t.text}</div>
              <div style="font-size:7px;color:#94a3b8">${t.cat||'عام'} • ${t.date||''}</div>
            </div>
            <button onclick="editTask(${t.id})" style="border:0;background:#e0f2fe;width:26px;height:26px;border-radius:8px">✎</button>
            <button onclick="deleteTask(${t.id})" style="border:0;background:#fee2e2;width:26px;height:26px;border-radius:8px">🗑️</button>
          </div>
        </div>`).join('') || '<div style="text-align:center;padding:20px;color:#94a3b8">لا يوجد مهام</div>'}
    </div>
  </div>`;
  if(editingTaskId){ let inp=document.getElementById('taskInput'); let t=tasks.find(x=>x.id===editingTaskId); if(inp && t){ inp.value=t.text; inp.focus(); } }
}

function addTask(){
  let el=document.getElementById('taskInput'); let v=el.value.trim(); if(!v) return;
  let pri=document.getElementById('taskPri').value;
  let cat=document.getElementById('taskCat').value;
  if(editingTaskId){
    let t=tasks.find(x=>x.id===editingTaskId); t.text=v; t.pri=pri; t.cat=cat; editingTaskId=null;
  }else{
    tasks.push({id:Date.now(),text:v,done:false,pri,cat,subs:[],date:new Date().toLocaleDateString('ar-EG')});
    if(window.ارسل_مهمة) ارسل_مهمة(v, pri);
  }
  el.value=''; saveTasks(); renderTasks();
}
function toggleTask(id){ let t=tasks.find(x=>x.id===id); t.done=!t.done; saveTasks(); renderTasks(); }
function editTask(id){ editingTaskId=id; renderTasks(); }
function deleteTask(id){ if(!confirm('مسح المهمة؟')) return; tasks=tasks.filter(x=>x.id!==id); saveTasks(); renderTasks(); }

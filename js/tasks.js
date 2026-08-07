// js/tasks.js - برو ماكس مهام فرعية + صورة + صوت
let tasks=JSON.parse(localStorage.getItem('tasks_pro')||'[]');
let taskFilter='all';
function saveTasks(){ localStorage.setItem('tasks_pro', JSON.stringify(tasks)); }
function renderTasks(){
  let el=document.getElementById('tab-tasks'); if(!el) return;
  let done=tasks.filter(t=>t.done).length, total=tasks.length, pct= total? Math.round(done/total*100):0;
  let filtered=tasks.filter(t=>{
    if(taskFilter==='done' &&!t.done) return false;
    if(taskFilter==='todo' && t.done) return false;
    return true;
  }).sort((a,b)=>a.done-b.done || b.id-a.id);

  el.innerHTML=`
  <div style="zoom:0.96">
    <div style="background:#000;color:#fff;border-radius:16px;padding:12px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:12px;font-weight:800">إجمالي مهامي</div><div style="font-size:8px;opacity:.7">${done}/${total} • ${pct}%</div></div>
        <div style="width:38px;height:38px;border-radius:50%;background:#1a1a1a;border:2px solid #333;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">${pct}%</div>
      </div>
      <div style="height:4px;background:#222;border-radius:99px;margin-top:8px;overflow:hidden"><div style="height:100%;width:${pct}%;background:#22c55e;transition:.5s"></div></div>
    </div>
    <div style="display:flex;gap:4px;background:#f1f5f9;padding:3px;border-radius:99px;margin-bottom:8px">
      ${[['all','الكل'],['todo','متبقي'],['done','منجز']].map(([k,l])=>`<button onclick="taskFilter='${k}';renderTasks()" style="flex:1;border:0;padding:6px;border-radius:99px;font-size:10px;font-weight:700;background:${taskFilter===k?'#fff':'transparent'};box-shadow:${taskFilter===k?'0 1px 4px rgba(0,0,0,.1)':''}">${l}</button>`).join('')}
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:6px;display:flex;gap:4px;margin-bottom:8px">
      <input id="taskInput" placeholder="مهمة جديدة + Enter..." style="flex:1;border:0;background:#f8fafc;border-radius:99px;padding:8px 12px;font-size:12px;outline:none;color:#000" onkeydown="if(event.key==='Enter') addTask()">
      <select id="taskPri" style="border:0;background:#f8fafc;border-radius:99px;font-size:10px;padding:6px;color:#000"><option value="low">عادي</option><option value="med">مهم</option><option value="high">🔥 عاجل</option></select>
      <button onclick="addTask()" style="background:#000;color:#fff;border:0;border-radius:99px;padding:8px 14px;font-size:11px;font-weight:800">+</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${filtered.map(t=>{
        let sDone=t.subs? t.subs.filter(s=>s.done).length:0, sTotal=t.subs? t.subs.length:0, sPct=sTotal? Math.round(sDone/sTotal*100):0;
        return `<div style="background:${t.done?'#f0fdf4':'#fff'};border:1px solid ${t.pri==='high'?'#fecaca':'#e5e7eb'};border-radius:14px;padding:10px;opacity:${t.done?'.7':1}">
          <div style="display:flex;gap:6px;align-items:center">
            <input type="checkbox" ${t.done?'checked':''} onchange="toggleTask(${t.id})" style="width:18px;height:18px">
            <div style="flex:1">
              <div style="font-size:11px;font-weight:800;text-decoration:${t.done?'line-through':''};display:flex;gap:4px">${t.pri==='high'?'🔥':''} ${t.text}</div>
              ${sTotal? `<div style="margin-top:4px"><div style="height:3px;background:#e2e8f0;border-radius:99px;overflow:hidden"><div style="height:100%;width:${sPct}%;background:#000"></div></div><div style="font-size:7px;color:#64748b;margin-top:2px">${sDone}/${sTotal} • ${sPct}% من المهمة دي</div></div>`:''}
              ${t.subs? t.subs.map((s,i)=>`<div style="display:flex;gap:4px;align-items:center;margin-top:4px;background:#f8fafc;padding:4px 6px;border-radius:8px"><input type="checkbox" ${s.done?'checked':''} onchange="toggleSubTask(${t.id},${i})"><span style="font-size:10px;flex:1;text-decoration:${s.done?'line-through':''}">${s.text}</span><b onclick="delSubTask(${t.id},${i})" style="color:#ef4444;cursor:pointer;font-size:10px">✕</b></div>`).join(''):''}
            </div>
            <button onclick="deleteTask(${t.id})" style="border:0;background:#fee2e2;width:26px;height:26px;border-radius:8px">🗑️</button>
          </div>
          <div style="display:flex;gap:4px;margin-top:6px">
            <input id="subTaskIn${t.id}" placeholder="+ مهمة فرعية" style="flex:1;font-size:9px;padding:4px 8px;border-radius:99px;border:1px solid #e2e8f0;background:#fff;color:#000">
            <button onclick="addSubTask(${t.id})" style="border:0;background:#000;color:#fff;border-radius:99px;padding:4px 10px;font-size:9px">+</button>
          </div>
        </div>`;
      }).join('') || '<div style="text-align:center;padding:20px;color:#94a3b8">لا يوجد مهام</div>'}
    </div>
  </div>`;
}
function addTask(){
  let el=document.getElementById('taskInput'); let v=el.value.trim(); if(!v) return;
  let pri=document.getElementById('taskPri').value;
  tasks.push({id:Date.now(),text:v,done:false,pri,subs:[],date:new Date().toLocaleDateString('ar-EG')});
  el.value=''; saveTasks(); renderTasks();
}
function toggleTask(id){ let t=tasks.find(x=>x.id===id); t.done=!t.done; saveTasks(); renderTasks(); if(t.done) { if(navigator.vibrate) navigator.vibrate(50); } }
function deleteTask(id){ let t=tasks.find(x=>x.id===id); if(!confirm(`⚠️ مسح "${t.text}" ؟`)) return; tasks=tasks.filter(x=>x.id!==id); saveTasks(); renderTasks(); }
function addSubTask(id){ let el=document.getElementById('subTaskIn'+id); let v=el.value.trim(); if(!v) return; let t=tasks.find(x=>x.id===id); if(!t.subs) t.subs=[]; t.subs.push({text:v,done:false}); el.value=''; saveTasks(); renderTasks(); }
function toggleSubTask(id,i){ let t=tasks.find(x=>x.id===id); t.subs[i].done=!t.subs[i].done; if(t.subs.every(s=>s.done)) { alert(`🎉 خلصت "${t.text}" 100%!`); t.done=true; } saveTasks(); renderTasks(); }
function delSubTask(id,i){ if(!confirm('مسح الفرعية؟')) return; let t=tasks.find(x=>x.id===id); t.subs.splice(i,1); saveTasks(); renderTasks(); }

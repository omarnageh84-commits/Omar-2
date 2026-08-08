// js/tasks.js - Tasks Pro
import { save, load } from './utils.js';
import { syncToSheet } from './sheets.js';

const KEY = 'tasks_pro';

function getTasks() {
  return load(KEY, []);
}

export function renderTasks() {
  const tasks = getTasks();
  const doneCount = tasks.filter(t => t.done).length;

  return `
  <div class="card" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <h3 style="margin:0">مهامي Pro ✅</h3>
        <small>${doneCount}/${tasks.length} مكتمل</small>
      </div>
      <div style="background:rgba(255,255,255,.2);padding:8px 12px;border-radius:12px;font-weight:800">${Math.round(tasks.length? (doneCount/tasks.length)*100 : 0)}%</div>
    </div>
    <div style="background:rgba(255,255,255,.3);height:6px;border-radius:10px;margin-top:10px;overflow:hidden">
      <div style="width:${tasks.length? (doneCount/tasks.length)*100 : 0}%;height:100%;background:#fff"></div>
    </div>
  </div>

  <div class="card">
    <div class="input-row">
      <input id="t_text" placeholder="مهمة جديدة... اكتب واضغط Enter" style="flex:1">
    </div>
    <div class="input-row">
      <select id="t_priority"><option value="عادي">🟢 عادي</option><option value="مهم">🟡 مهم</option><option value="عاجل">🔴 عاجل</option></select>
      <select id="t_cat"><option>صيدلية</option><option>شخصي</option><option>شغل</option><option>دراسة</option></select>
      <input type="date" id="t_date">
    </div>
    <button class="btn" id="addTaskBtn">إضافة مهمة +</button>
  </div>

  <div class="card">
    <div class="input-row">
      <input id="t_search" placeholder="🔍 بحث في المهام...">
      <select id="t_filter"><option value="all">الكل</option><option value="active">نشطة</option><option value="done">مكتملة</option><option value="عاجل">عاجل فقط</option></select>
    </div>
    <div id="tasksList">
      ${renderList(tasks)}
    </div>
  </div>
  `;
}

function renderList(tasks) {
  if (!tasks.length) return `<p style="text-align:center;color:#999;padding:20px">لا يوجد مهام، اضف أول مهمة فوق 👆</p>`;

  // ترتيب: المثبتة أولا، ثم العاجلة، ثم الباقي
  let sorted = [...tasks].sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0) || (a.done?1:0) - (b.done?1:0));

  return sorted.map((t) => `
    <div class="task-item ${t.done?'done':''}" data-id="${t.id}" style="display:flex;gap:10px;align-items:center;padding:12px;border:1px solid #f0f0f0;border-radius:14px;margin:8px 0;background:${t.pinned?'#fffbeb':'#fff'};opacity:${t.done?'0.6':1}">
      <input type="checkbox" ${t.done?'checked':''} data-check="${t.id}" style="width:20px;height:20px">
      <div style="flex:1">
        <div style="font-weight:600;text-decoration:${t.done?'line-through':''}">${t.text}</div>
        <div style="font-size:11px;color:#888;display:flex;gap:8px;margin-top:4px">
          <span>${t.priority}</span><span>•</span><span>${t.cat}</span>${t.date?`<span>•</span><span>📅 ${t.date}</span>`:''}
        </div>
      <button data-pin="${t.id}" style="border:0;background:transparent;font-size:16px">${t.pinned?'📌':'📍'}</button>
      <button data-del="${t.id}" style="border:0;background:#fee2e2;color:#ef4444;border-radius:8px;padding:6px 10px">حذف</button>
    </div>
  `).join('');
}

export function bindTasks() {
  document.addEventListener('click', (e) => {
    const tasks = getTasks();

    if (e.target.id === 'addTaskBtn' || e.target.id === 't_text' && e.key === 'Enter') {
      addNew();
    }
    if (e.target.dataset.check!== undefined) {
      let id = e.target.dataset.check;
      let t = tasks.find(x => x.id == id);
      if(t){ t.done =!t.done; save(KEY, tasks); syncToSheet('tasks', t); refresh(); }
    }
    if (e.target.dataset.del) {
      let id = e.target.dataset.del;
      let filtered = tasks.filter(x => x.id!= id);
      save(KEY, filtered); refresh();
    }
    if (e.target.dataset.pin) {
      let id = e.target.dataset.pin;
      let t = tasks.find(x => x.id == id);
      if(t){ t.pinned =!t.pinned; save(KEY, tasks); refresh(); }
    }
  });

  document.addEventListener('keydown', (e)=>{
    if(e.target.id === 't_text' && e.key === 'Enter') addNew();
  });

  document.addEventListener('input', (e)=>{
    if(e.target.id === 't_search' || e.target.id === 't_filter'){
      let q = document.getElementById('t_search')?.value.toLowerCase()||'';
      let f = document.getElementById('t_filter')?.value||'all';
      let tasks = getTasks();
      let filtered = tasks.filter(t=>{
        let matchSearch = t.text.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q);
        let matchFilter = f==='all' || (f==='active'&&!t.done) || (f==='done'&&t.done) || (t.priority===f);
        return matchSearch && matchFilter;
      });
      document.getElementById('tasksList').innerHTML = renderList(filtered);
    }
  });

  function addNew(){
    let text = document.getElementById('t_text')?.value.trim();
    if(!text) return;
    let tasks = getTasks();
    let newTask = {
      id: Date.now(),
      text,
      priority: document.getElementById('t_priority').value,
      cat: document.getElementById('t_cat').value,
      date: document.getElementById('t_date').value,
      done: false,
      pinned: false,
      created: new Date().toISOString()
    };
    tasks.unshift(newTask);
    save(KEY, tasks);
    syncToSheet('tasks', newTask);
    refresh();
  }

  function refresh(){
    let tasks = getTasks();
    let search = document.getElementById('t_search');
    if(search) search.dispatchEvent(new Event('input'));
    else {
      const listEl = document.getElementById('tasksList');
      if(listEl) listEl.innerHTML = renderList(tasks);
    }
    document.getElementById('t_text').value='';
    // تحديث الهيدر
    const content = document.getElementById('appContent');
    if(content) content.querySelectorAll('.card')[0].innerHTML = renderTasks().split('</div>')[0].split('<div')[1]? '' : '';
    // اسهل حل: اعادة رندر كامل للتاب
    import('./app.js').then(m=>{ if(m.currentTab==='tasks') document.getElementById('appContent').innerHTML = renderTasks(); });
  }
}

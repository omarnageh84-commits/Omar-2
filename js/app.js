// app.js - V6 Pro - Router فقط، لا منطق داخلي
import { today } from './utils.js';
import { renderDashboard } from './dashboard.js';
import { renderDaily, bindDailyEvents } from './daily.js';
import { renderAttendance, bindAttendanceEvents } from './attendance.js';
import { renderNotes, bindNotesEvents } from './notes.js';
import { renderTasks, bindTasksEvents } from './tasks.js';

const root = document.getElementById('root');
const dateTop = document.getElementById('dateTop');
if(dateTop) dateTop.textContent = today();

let currentTab = 'dashboard';

const routes = {
  dashboard: { render: renderDashboard, bind: null },
  daily: { render: renderDaily, bind: bindDailyEvents },
  attendance: { render: renderAttendance, bind: bindAttendanceEvents },
  notes: { render: renderNotes, bind: bindNotesEvents },
  tasks: { render: renderTasks, bind: bindTasksEvents },
};

function render(){
  const r = routes[currentTab];
  if(!r) return;
  root.innerHTML = r.render();
  // ربط الأحداث مرة واحدة بعد الرندر
  if(r.bind){
    const newRoot = root.cloneNode(true);
    root.parentNode.replaceChild(newRoot, root);
    const freshRoot = document.getElementById('root');
    r.bind(freshRoot, render);
    // تحديث المرجع
    window._root = freshRoot;
  }
  document.querySelectorAll('.nav button').forEach(b=>{
    b.classList.toggle('active', b.dataset.t===currentTab);
  });
  window.scrollTo({top:0, behavior:'smooth'});
}

document.querySelectorAll('.nav button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    currentTab = btn.dataset.t;
    render();
  });
});

render();

// PWA Install
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js');
}

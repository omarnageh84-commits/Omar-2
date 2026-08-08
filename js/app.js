// app.js - V6.1 FIXED - Router ثابت مفيش تهنيج
import { today } from './utils.js';
import { renderDashboard } from './dashboard.js';
import { renderDaily, handleDaily } from './daily.js';
import { renderAttendance, handleAttendance } from './attendance.js';
import { renderNotes, handleNotes } from './notes.js';
import { renderTasks, handleTasks } from './tasks.js';

const root = document.getElementById('root');
const dateTop = document.getElementById('dateTop');
if(dateTop) dateTop.textContent = today();

let currentTab = 'dashboard';

const routes = {
  dashboard: { render: renderDashboard, handler: null },
  daily: { render: renderDaily, handler: handleDaily },
  attendance: { render: renderAttendance, handler: handleAttendance },
  notes: { render: renderNotes, handler: handleNotes },
  tasks: { render: renderTasks, handler: handleTasks },
};

function render(){
  const r = routes[currentTab];
  root.innerHTML = r.render();
  document.querySelectorAll('.nav button').forEach(b=>{
    b.classList.toggle('active', b.dataset.t===currentTab);
  });
  window.scrollTo({top:0, behavior:'smooth'});
}

// دوسة واحدة بس للـ Nav - برا الـ root فعمره ما يعلق
document.querySelector('.nav').addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-t]');
  if(!btn) return;
  currentTab = btn.dataset.t;
  render();
});

// تفويض واحد لكل الأحداث جوه الصفحة - مفيش تكرار
root.addEventListener('click', (e)=>{
  const btn = e.target.closest('[data-action]');
  if(!btn) return;
  const handler = routes[currentTab].handler;
  if(handler) handler(btn, e, render);
});

root.addEventListener('change', (e)=>{
  const inp = e.target.closest('[data-action]');
  if(!inp) return;
  const handler = routes[currentTab].handler;
  if(handler) handler(inp, e, render);
});

render();

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js');
}

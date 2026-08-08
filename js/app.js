// app.js - V6.1 FINAL FIXED
import { today } from './utils.js';
import { renderDashboard } from './dashboard.js';
import { renderDaily, handleDaily } from './daily.js';
import { renderAttendance, handleAttendance } from './attendance.js';
import { renderNotes, handleNotes } from './notes.js';
import { renderTasks, handleTasks } from './tasks.js';

const root = document.getElementById('root');
document.getElementById('dateTop').textContent = today();

let currentTab = 'dashboard';
const routes = {
  dashboard: { render: renderDashboard, handle: null },
  daily: { render: renderDaily, handle: handleDaily },
  attendance: { render: renderAttendance, handle: handleAttendance },
  notes: { render: renderNotes, handle: handleNotes },
  tasks: { render: renderTasks, handle: handleTasks },
};

function render(){
  root.innerHTML = routes[currentTab].render();
  document.querySelectorAll('.nav button').forEach(b=> b.classList.toggle('active', b.dataset.t===currentTab));
}

document.querySelector('.nav').addEventListener('click', e=>{
  const btn = e.target.closest('button[data-t]');
  if(!btn) return;
  currentTab = btn.dataset.t;
  render();
});

root.addEventListener('click', e=>{
  const btn = e.target.closest('[data-action]');
  if(!btn) return;
  routes[currentTab].handle?.(btn, e, render);
});
root.addEventListener('change', e=>{
  const el = e.target.closest('[data-action]');
  if(!el) return;
  routes[currentTab].handle?.(el, e, render);
});

render();
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');

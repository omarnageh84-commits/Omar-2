import { today } from './utils.js';
import { renderDashboard } from './dashboard.js';
import { renderDaily, handleDaily } from './daily.js';
import { renderAttendance, handleAttendance } from './attendance.js';
import { renderNotes, handleNotes } from './notes.js';
import { renderTasks, handleTasks } from './tasks.js';

const root = document.getElementById('root');
const topDate = document.getElementById('dateTop');
if(topDate) topDate.textContent = today();

let currentTab = 'dashboard';
const routes = {
  dashboard: {render: renderDashboard},
  daily: {render: renderDaily, handle: handleDaily},
  attendance: {render: renderAttendance, handle: handleAttendance},
  notes: {render: renderNotes, handle: handleNotes},
  tasks: {render: renderTasks, handle: handleTasks},
};

function render(){
  try{
    root.innerHTML = routes[currentTab].render();
    document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active', b.dataset.t===currentTab));
  }catch(e){ console.error(e); root.innerHTML = `<div class="card">خطأ: ${e.message}</div>`; }
}

document.querySelector('.nav').addEventListener('click', e=>{
  const b = e.target.closest('button[data-t]'); if(!b) return;
  currentTab = b.dataset.t; render();
});

root.addEventListener('click', e=>{
  const btn = e.target.closest('[data-action]'); if(!btn) return;
  routes[currentTab].handle?.(btn, e, render);
});
root.addEventListener('change', e=>{
  const el = e.target.closest('[data-action]'); if(!el) return;
  routes[currentTab].handle?.(el, e, render);
});

render();

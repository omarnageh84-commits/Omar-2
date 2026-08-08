import { today } from './utils.js';
import { renderDashboard } from './dashboard.js';
import { renderDaily, handleDaily } from './daily.js';
import { renderAttendance, handleAttendance } from './attendance.js';
import { renderNotes, handleNotes } from './notes.js';
import { renderTasks, handleTasks } from './tasks.js';

const root=document.getElementById('root');
document.getElementById('dateTop').textContent=today();
let cur='dashboard';
const routes={
  dashboard:{r:renderDashboard},
  daily:{r:renderDaily,h:handleDaily},
  attendance:{r:renderAttendance,h:handleAttendance},
  notes:{r:renderNotes,h:handleNotes},
  tasks:{r:renderTasks,h:handleTasks}
};
function draw(){root.innerHTML=routes[cur].r(); document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.t===cur));}
document.querySelector('.nav').addEventListener('click',e=>{let b=e.target.closest('button[data-t]'); if(!b)return; cur=b.dataset.t; draw();});
root.addEventListener('click',e=>{let b=e.target.closest('[data-action]'); if(!b)return; routes[cur].h?.(b,e,draw);});
root.addEventListener('change',e=>{let b=e.target.closest('[data-action]'); if(!b)return; routes[cur].h?.(b,e,draw);});
draw();
if('serviceWorker' in navigator) navigator.serviceWorker.register('../sw.js');

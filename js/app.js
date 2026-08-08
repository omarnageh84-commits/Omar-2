import { today } from './utils.js';
import { renderDashboard } from './dashboard.js';
import { renderDaily, bindDaily } from './daily.js';
import { renderAttendance, bindAttendance } from './attendance.js';
import { renderNotes } from './notes.js';
import { renderTasks } from './tasks.js';

document.getElementById('dateTop').innerText = today();
let cur='dashboard';
const root=document.getElementById('root');

function router(tab){
  cur=tab;
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.t===tab));
  if(tab==='dashboard') root.innerHTML=renderDashboard();
  if(tab==='daily'){ root.innerHTML=renderDaily(); bindDaily(); }
  if(tab==='attendance'){ root.innerHTML=renderAttendance(); bindAttendance(); }
  if(tab==='notes') root.innerHTML=renderNotes();
  if(tab==='tasks') root.innerHTML=renderTasks();
}

document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>router(b.dataset.t));
router('dashboard');

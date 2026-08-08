import { today } from './utils.js';
import { renderDashboard } from './dashboard.js';
import { renderDaily, handleDaily } from './daily.js';
import { renderAttendance, handleAttendance } from './attendance.js';
import { renderNotes, handleNotes } from './notes.js';
import { renderTasks, handleTasks } from './tasks.js';

const root=document.getElementById('root');
const dateTop=document.getElementById('dateTop');
if(dateTop){ try{ dateTop.textContent=today(); }catch(e){ dateTop.textContent=new Date().toISOString().slice(0,10); } }

let cur='dashboard';
const routes={
  dashboard:{r:renderDashboard},
  daily:{r:renderDaily,h:handleDaily},
  attendance:{r:renderAttendance,h:handleAttendance},
  notes:{r:renderNotes,h:handleNotes},
  tasks:{r:renderTasks,h:handleTasks}
};

function draw(){
  try{
    if(!root) return;
    const fn = routes[cur]?.r;
    if(!fn){ root.innerHTML='<div class=card>الصفحة غير موجودة</div>'; return; }
    root.innerHTML=fn();
    document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.t===cur));
  }catch(err){
    root.innerHTML=`<div class="card" style="color:#e11d48">حصل خطأ: ${err.message}</div>`;
  }
}

document.querySelector('.nav')?.addEventListener('click',e=>{
  let b=e.target.closest('button[data-t]'); if(!b) return;
  cur=b.dataset.t;
  setTimeout(()=>draw(), 30);
});

function handleEvent(e){
  const t=e.target;
  const isAttTime = t.classList.contains('time-input');
  const isAttNote = t.dataset.f==='note';
  const isInlineEdit = t.classList.contains('inline-edit');
  let b=t.closest('[data-action]');
  if(!b &&!isAttTime &&!isAttNote &&!isInlineEdit) return;
  if(!b) b=t;

  const isInput = e.type === 'input';

  try{
    if(isInput){
      // لو بتكتب في الحضور متعملش رندر خالص سيبه يكتب 12 براحته
      if(cur==='attendance' && (isAttTime || isAttNote)){
        routes[cur].h?.(b,e,()=>{});
        return;
      }
      routes[cur].h?.(b,e,()=>{});
    } else {
      // لما يخلص (change / blur) اعمل رندر ويجمع الساعات
      routes[cur].h?.(b,e,()=> setTimeout(()=>draw(), 50));
    }
  }catch(err){ console.error(err); }
}

root?.addEventListener('click', (e)=>{
  if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  handleEvent(e);
});
root?.addEventListener('change', handleEvent);
root?.addEventListener('input', handleEvent);
root?.addEventListener('blur', (e)=>{
  if(cur==='attendance' && (e.target.classList.contains('time-input') || e.target.dataset.f==='note' || e.target.classList.contains('inline-edit'))){
    // لما يخرج من الخانة اجمع
    setTimeout(()=>draw(), 50);
  }
}, true);

draw();

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js?v=11').then(()=>{
    navigator.serviceWorker.getRegistrations().then(regs=>{
      regs.forEach(r=>{ if(r.active &&!r.active.scriptURL.includes('v=11')) r.unregister(); });
    });
  });
}

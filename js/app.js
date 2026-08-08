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

let isTyping = false;

function draw(){
  try{
    if(!root) return;
    // لو بتكتب في الحضور متعملش رندر خالص
    if(isTyping && cur === 'attendance') return;

    const fn = routes[cur]?.r;
    if(!fn){ root.innerHTML='<div class=card>الصفحة غير موجودة</div>'; return; }
    root.innerHTML=fn();
    document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.t===cur));
  }catch(err){
    console.error('Render error in',cur,err);
    if(root) root.innerHTML=`<div class="card" style="color:#e11d48">حصل خطأ في ${cur}: ${err.message}<br><button class="btn-sm btn-dark" onclick="localStorage.clear();location.reload()">مسح وإعادة تحميل</button></div>`;
  }
}

document.querySelector('.nav')?.addEventListener('click',e=>{
  let b=e.target.closest('button[data-t]'); if(!b) return;
  isTyping = false;
  cur=b.dataset.t; draw();
});

function handleEvent(e){
  const t=e.target;
  const isAtt = t.classList.contains('inline-edit') || t.classList.contains('time-input') || t.dataset.f;
  let b=t.closest('[data-action]');
  if(!b &&!isAtt) return;
  if(!b) b=t;

  const isInputEvent = e.type === 'input';
  if(isInputEvent) isTyping = true;

  try{
    // في حالة الكتابة منعملش draw خالص
    const rerenderFn = isInputEvent? ()=>{} : ()=>{ isTyping = false; setTimeout(draw, 20); };
    routes[cur].h?.(b,e,rerenderFn);
  }catch(err){ console.error(err); }
}

root?.addEventListener('click', handleEvent);
root?.addEventListener('change', (e)=>{
  isTyping = false;
  handleEvent(e);
});

// ده الحل الاساسي - نوقف الـ draw وانت بتكتب
root?.addEventListener('input', handleEvent);

// لما تخلص كتابة وتطلع من الخانة اعمل حساب
root?.addEventListener('focusout', (e)=>{
  const t=e.target;
  if(t.classList.contains('time-input') || t.classList.contains('inline-edit') || t.dataset.f){
    setTimeout(()=>{
      isTyping = false;
      handleEvent(new Event('change', {bubbles:true}));
      draw();
    }, 100);
  }
});

draw();

if('serviceWorker' in navigator){
  // اعمل الغاء للـ SW القديم عشان يحدث
  navigator.serviceWorker.getRegistrations().then(regs=>{
    regs.forEach(r=> r.unregister());
  });
}

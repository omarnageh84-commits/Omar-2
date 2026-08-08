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
    // لو في input مفتوح متعملش رندر خالص
    const active = document.activeElement;
    if(active && active.tagName === 'INPUT' && root.contains(active) && cur === 'attendance'){
      return;
    }
    const fn = routes[cur]?.r;
    if(!fn){ root.innerHTML='<div class=card>الصفحة غير موجودة</div>'; return; }
    root.innerHTML=fn();
    document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.t===cur));
  }catch(err){
    console.error('Render error in',cur,err);
    root.innerHTML=`<div class="card" style="color:#e11d48">حصل خطأ في ${cur}: ${err.message}<br><button class="btn-sm btn-dark" onclick="localStorage.clear();location.reload()">مسح وإعادة تحميل</button></div>`;
  }
}

document.querySelector('.nav')?.addEventListener('click',e=>{
  let b=e.target.closest('button[data-t]'); if(!b) return;
  cur=b.dataset.t;
  // استنى الكيبورد يقفل وبعدين اعمل رسم
  setTimeout(draw, 50);
});

function handleEvent(e){
  const t=e.target;
  const isAtt = t.classList.contains('inline-edit') || t.classList.contains('time-input') || t.dataset.f;
  let b=t.closest('[data-action]');
  if(!b &&!isAtt) return;
  if(!b) b=t;

  const isInput = e.type === 'input';

  try{
    if(isInput){
      // وانت بتكتب احفظ بس متعملش اي رندر
      routes[cur].h?.(b,e,()=>{});
    } else {
      // لما تخلص (change) اعمل رندر متأخر
      routes[cur].h?.(b,e,()=> setTimeout(draw, 100));
    }
  }catch(err){ console.error(err); }
}

// مهم جدا: لو بتدوس على input متعملش اي حاجة في الـ click
root?.addEventListener('click', (e)=>{
  if(e.target.tagName === 'INPUT') return;
  handleEvent(e);
});

root?.addEventListener('change', handleEvent);
root?.addEventListener('input', handleEvent);

draw();

if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(regs=> regs.forEach(r=> r.unregister()));
}

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
    const activeElement = document.activeElement;
    const activeInfo = activeElement? { id: activeElement.dataset.d + '-' + activeElement.dataset.f, value: activeElement.value, start: activeElement.selectionStart, end: activeElement.selectionEnd } : null;

    root.innerHTML=fn();
    document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.t===cur));

    // رجع الفوكس لو كنا بنكتب في الحضور
    if(activeInfo && cur === 'attendance'){
      const toFocus = document.querySelector(`[data-d="${activeInfo.id.split('-')[0]}"][data-f="${activeInfo.id.split('-').slice(1).join('-')}"]`) || document.querySelector(`[data-k="${activeElement.dataset.k}"]`);
      // مش هنرجع الفوكس اوتوماتيك في حالة الـ input عشان المشكلة، بس هنسيبها للـ change
    }

  }catch(err){
    console.error('Render error in',cur,err);
    if(root) root.innerHTML=`<div class="card" style="color:#e11d48">حصل خطأ في ${cur}: ${err.message}<br><button class="btn-sm btn-dark" onclick="localStorage.clear();location.reload()">مسح وإعادة تحميل</button></div>`;
  }
}

document.querySelector('.nav')?.addEventListener('click',e=>{
  let b=e.target.closest('button[data-t]'); if(!b) return;
  cur=b.dataset.t; draw();
});

function handleEvent(e, shouldRerender){
  const t=e.target;
  const isAttendanceInput = t.classList.contains('inline-edit') || t.classList.contains('time-input') || t.dataset.f || t.id==='catFilter' || t.id==='prioFilter' || t.id==='catSelect' || t.id==='prioSelect';
  let b=t.closest('[data-action]');
  if(!b &&!isAttendanceInput) return;
  if(!b) b=t;

  // لو event جاي من input بنخليه false عشان ميعملش rerender
  if(e.type === 'input') shouldRerender = false;
  if(shouldRerender === undefined) shouldRerender = true;

  try{
    const rerenderFn = shouldRerender? draw : ()=>{};
    routes[cur].h?.(b,e,rerenderFn);
  }catch(err){ console.error(err); }
}

root?.addEventListener('click', (e)=> handleEvent(e, true));
root?.addEventListener('change', (e)=> handleEvent(e, true));
root?.addEventListener('blur', (e)=>{
  const t=e.target;
  if(t.classList.contains('time-input') || t.classList.contains('inline-edit')){
    handleEvent(e, true);
  }
}, true);

// الحل الاساسي: في الكتابة متحاولش تعمل draw
root?.addEventListener('input', (e)=>{
  const t=e.target;
  if(t.classList.contains('inline-edit') || t.classList.contains('time-input') || t.dataset.f==='note'){
    handleEvent(e, false);
  }
});

draw();

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').then(r=>console.log('SW ok')).catch(err=>console.warn('SW fail',err));
  });
}

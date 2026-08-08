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
    console.error('Render error in',cur,err);
    if(root) root.innerHTML=`<div class="card" style="color:#e11d48">حصل خطأ في ${cur}: ${err.message}<br><button class="btn-sm btn-dark" onclick="localStorage.clear();location.reload()">مسح وإعادة تحميل</button></div>`;
  }
}

document.querySelector('.nav')?.addEventListener('click',e=>{
  let b=e.target.closest('button[data-t]'); if(!b) return;
  cur=b.dataset.t; draw();
});

// دالة مساعدة بتأجل الـ draw لبعد ما حدث الـ blur يخلص
function safeDraw(){
  setTimeout(()=> draw(), 0);
}

function handleEvent(e, shouldRerender = true){
  const t=e.target;
  const isAttendanceInput = t.classList.contains('inline-edit') || t.classList.contains('time-input') || t.dataset.f || t.id==='catFilter' || t.id==='prioFilter' || t.id==='catSelect' || t.id==='prioSelect';
  let b=t.closest('[data-action]');
  if(!b &&!isAttendanceInput) return;
  if(!b) b=t;

  if(e.type === 'input') shouldRerender = false;

  try{
    const rerenderFn = shouldRerender? safeDraw : ()=>{};
    routes[cur].h?.(b,e,rerenderFn);
  }catch(err){ console.error(err); }
}

root?.addEventListener('click', (e)=> handleEvent(e, true));
root?.addEventListener('change', (e)=> handleEvent(e, true));

// شيلنا الـ blur اللي كان بيعمل مشكلة، وبقينا نعتمد على change فقط
// ولو عايز تظبط التنسيق عند الخروج اعمله بـ timeout
root?.addEventListener('focusout', (e)=>{
  const t=e.target;
  if(t.classList.contains('time-input') || t.classList.contains('inline-edit')){
    setTimeout(()=> handleEvent(e, true), 10);
  }
});

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

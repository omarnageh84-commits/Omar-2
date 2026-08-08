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

function draw(preserveFocus=false){
  try{
    if(!root) return;
    let activeInfo=null;
    if(preserveFocus){
      const a=document.activeElement;
      if(a && (a.tagName==='INPUT' || a.tagName==='TEXTAREA')){
        activeInfo={d:a.dataset.d, f:a.dataset.f, k:a.dataset.k, id:a.id, start:a.selectionStart, end:a.selectionEnd, value:a.value};
      }
    }
    const fn = routes[cur]?.r;
    if(!fn){ root.innerHTML='<div class=card>الصفحة غير موجودة</div>'; return; }
    root.innerHTML=fn();
    document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.t===cur));

    // رجع الفوكس مكان ما كان
    if(activeInfo){
      let selector='';
      if(activeInfo.d && activeInfo.f) selector=`[data-d="${activeInfo.d}"][data-f="${activeInfo.f}"]`;
      else if(activeInfo.k) selector=`[data-k="${activeInfo.k}"]`;
      else if(activeInfo.id) selector=`#${activeInfo.id}`;
      if(selector){
        const el=root.querySelector(selector);
        if(el){
          el.focus();
          try{ if(activeInfo.start!=null) el.setSelectionRange(activeInfo.start, activeInfo.end); }catch{}
        }
      }
    }
  }catch(err){
    console.error('Render error in',cur,err);
    root.innerHTML=`<div class="card" style="color:#e11d48">حصل خطأ في ${cur}: ${err.message}<br><button class="btn-sm btn-dark" onclick="localStorage.clear(); caches.keys().then(k=>k.forEach(x=>caches.delete(x))); location.reload(true)">مسح وإعادة تحميل</button></div>`;
  }
}

document.querySelector('.nav')?.addEventListener('click',e=>{
  let b=e.target.closest('button[data-t]'); if(!b) return;
  cur=b.dataset.t;
  setTimeout(()=>draw(false), 30);
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
      // وانت بتكتب احفظ واعمل رندر مع حفظ الفوكس
      routes[cur].h?.(b,e,()=>{});
      if(cur==='attendance'){
        // اعمل رندر سريع مع حفظ مكان الكتابة
        draw(true);
      }
    } else {
      routes[cur].h?.(b,e,()=> setTimeout(()=>draw(false), 80));
    }
  }catch(err){ console.error(err); }
}

root?.addEventListener('click', (e)=>{
  if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  handleEvent(e);
});
root?.addEventListener('change', handleEvent);
root?.addEventListener('input', handleEvent);

draw(false);

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js?v=10').then(()=>{
    navigator.serviceWorker.getRegistrations().then(regs=>{
      regs.forEach(r=>{ if(r.active &&!r.active.scriptURL.includes('v=10')) r.unregister(); });
    });
  });
        }

// js/app.js - النسخة النهائية البرو

// التاريخ بأرقام انجليزي
document.getElementById('date').innerText = new Date().toLocaleDateString('ar-EG-u-nu-latn', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

function openTab(e, id){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  let target = document.getElementById('tab-'+id);
  if(target) target.classList.add('active');
  
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  e.currentTarget.classList.add('active');

  if(id==='home') renderHome();
  if(id==='att') renderAtt();
  if(id==='notes') renderNotes();
  if(id==='tasks') renderTasks();
  if(id==='daily'){
    // افتراضي على الدخل
    setDaily('income');
  }
}

function setDaily(t){
  document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  let pill = document.getElementById('p-'+t);
  if(pill) pill.classList.add('active');

  document.getElementById('daily-income').classList.toggle('hidden', t!=='income');
  document.getElementById('daily-exp').classList.toggle('hidden', t!=='exp');
  document.getElementById('daily-debt').classList.toggle('hidden', t!=='debt');

  if(t==='income') renderIncome(); 
  if(t==='exp') renderExp(); 
  if(t==='debt') renderDebt();
}

// تحميل أولي
window.addEventListener('DOMContentLoaded', ()=>{
  try{
    if(typeof renderHome==='function') renderHome();
    if(typeof renderAtt==='function') renderAtt();
  }catch(e){}
});

// js/app.js - النسخة النهائية البرو الموحدة
document.getElementById('date').innerText = new Date().toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long' });

// قفل التدوير نهائي للـ APK
if(screen.orientation && screen.orientation.lock){ try{ screen.orientation.lock('portrait').catch(()=>{}) }catch(e){} }

function openTab(e, id){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  let target = document.getElementById('tab-'+id);
  if(target) target.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  if(e) e.currentTarget.classList.add('active');
  
  if(id==='home' && typeof renderDashboard==='function') renderDashboard();
  if(id==='daily'){ setDaily('exp'); } // افتراضي مصاريف زي ما طلبت
  if(id==='att' && typeof renderAtt==='function') renderAtt();
  if(id==='notes' && typeof renderNotes==='function') renderNotes();
  if(id==='tasks' && typeof renderTasks==='function') renderTasks();
}

function setDaily(t){
  document.querySelectorAll('.pills .pill').forEach(p=>p.classList.remove('active'));
  let pill=document.getElementById('p-'+t); if(pill) pill.classList.add('active');
  document.getElementById('daily-income').classList.toggle('hidden', t!=='income');
  document.getElementById('daily-exp').classList.toggle('hidden', t!=='exp');
  document.getElementById('daily-debt').classList.toggle('hidden', t!=='debt');
  if(t==='income' && typeof renderIncome==='function') renderIncome(); 
  if(t==='exp' && typeof renderExp==='function') renderExp(); 
  if(t==='debt' && typeof renderDebt==='function') renderDebt();
}

// تحميل اولي
window.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(()=>{
    if(typeof renderDashboard==='function') renderDashboard();
    setDaily('exp'); // يفتح مصاريف اول حاجة
  },300);
});

// للتوافق مع الاسمين
function renderHome(){ if(typeof renderDashboard==='function') renderDashboard(); }

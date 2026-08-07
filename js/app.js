document.getElementById('date').innerText = new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});

function openTab(e,name){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  e.currentTarget.classList.add('active');
  if(name==='home' && window.renderDashboard) renderDashboard();
  if(name==='daily' && window.renderDaily) renderDaily();
  if(name==='att' && window.renderAtt) renderAtt();
  if(name==='notes' && window.renderNotes) renderNotes();
  if(name==='tasks' && window.renderTasks) renderTasks();
}
function setDaily(t){
  document.getElementById('daily-exp').classList.toggle('hidden', t!=='exp');
  document.getElementById('daily-income').classList.toggle('hidden', t!=='income');
  document.getElementById('daily-debt').classList.toggle('hidden', t!=='debt');
  document.getElementById('p-exp').classList.toggle('active', t==='exp');
  document.getElementById('p-income').classList.toggle('active', t==='income');
  document.getElementById('p-debt').classList.toggle('active', t==='debt');
}

// === سحب لتحت للتحديث - زي فيس بوك ===
let _startY=0;
let _pullDiv=null;
window.addEventListener('load', ()=>{
  _pullDiv=document.createElement('div');
  _pullDiv.style.cssText='position:fixed;top:-60px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:10px 18px;border-radius:99px;font-size:12px;font-weight:800;z-index:99999;transition:top.25s;box-shadow:0 4px 12px rgba(0,0,0,.2)';
  _pullDiv.innerText='↓ اسحب لتحديث الصفحة';
  document.body.appendChild(_pullDiv);
});
window.addEventListener('touchstart', e=>{
  if(window.scrollY<10) _startY=e.touches[0].clientY;
},{passive:true});
window.addEventListener('touchmove', e=>{
  if(!_startY) return;
  let diff=e.touches[0].clientY-_startY;
  if(diff>20 && window.scrollY<10){
    _pullDiv.style.top=(Math.min(diff,90)-60)+'px';
    if(diff>85) _pullDiv.innerText='↻ سيب للتحديث';
    else _pullDiv.innerText='↓ اسحب لتحديث الصفحة';
  }
},{passive:true});
window.addEventListener('touchend', e=>{
  if(!_startY) return;
  let diff=e.changedTouches[0].clientY-_startY;
  _startY=0;
  if(diff>85 && window.scrollY<10){
    _pullDiv.innerText='⏳ بيحدث...';
    _pullDiv.style.top='20px';
    setTimeout(()=>location.reload(), 350);
  }else{
    _pullDiv.style.top='-60px';
  }
},{passive:true});

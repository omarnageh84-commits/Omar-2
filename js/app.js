// Omar App - Main - Fixed 7 Aug 2026
let catsNote = JSON.parse(localStorage.getItem('omar_note_cats')||'["البيت","المنزل","شغل","شخصي","مهم"]');
let catsTask = JSON.parse(localStorage.getItem('omar_task_cats')||'["البيت","المنزل","شغل","يومي"]');
let currentNoteFilter='الكل', currentTaskFilter='الكل';
let currentDaily='exp';

document.addEventListener('DOMContentLoaded',()=>{
  try{
    const d=document.getElementById('date');
    if(d) d.innerText=new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    if(window.renderDashboard) renderDashboard();
    if(window.renderDaily) renderDaily();
    initPull();
  }catch(e){console.log(e)}
});

function openTab(e,name){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const tab=document.getElementById('tab-'+name);
  if(tab) tab.classList.add('active');
  if(e&&e.currentTarget) e.currentTarget.classList.add('active');
  if(name==='home' && window.renderDashboard) renderDashboard();
  if(name==='daily') { if(window.renderDaily) renderDaily(); setDaily(currentDaily); }
  if(name==='att' && window.renderAtt) renderAtt();
  if(name==='notes' && window.renderNotes) renderNotes();
  if(name==='tasks' && window.renderTasks) renderTasks();
}
function setDaily(t){
  currentDaily=t;
  document.getElementById('daily-exp')?.classList.toggle('hidden', t!=='exp');
  document.getElementById('daily-income')?.classList.toggle('hidden', t!=='income');
  document.getElementById('daily-debt')?.classList.toggle('hidden', t!=='debt');
  document.getElementById('p-exp')?.classList.toggle('active', t==='exp');
  document.getElementById('p-income')?.classList.toggle('active', t==='income');
  document.getElementById('p-debt')?.classList.toggle('active', t==='debt');
  if(window.renderDaily) renderDaily(t);
}

// سحب لتحت للتحديث - شغال جوه MIT APK
let _sY=0, _pull=null;
function initPull(){
  _pull=document.createElement('div');
  _pull.id='pullRef';
  _pull.style.cssText='position:fixed;top:-60px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:10px 20px;border-radius:99px;font-size:12px;font-weight:900;z-index:99999;transition:top.25s';
  _pull.innerText='↓ اسحب للتحديث';
  document.body.appendChild(_pull);
}
window.addEventListener('touchstart', e=>{
  if(window.scrollY<8) _sY=e.touches[0].clientY;
},{passive:true});
window.addEventListener('touchmove', e=>{
  if(!_sY) return;
  let diff=e.touches[0].clientY-_sY;
  if(diff>10 && window.scrollY<8){
    _pull.style.top=(Math.min(diff,100)-60)+'px';
    _pull.innerText= diff>85? '↻ اترك للتحديث' : '↓ اسحب للتحديث';
  }
},{passive:true});
window.addEventListener('touchend', e=>{
  if(!_sY) return;
  let diff=e.changedTouches[0].clientY-_sY;
  _sY=0;
  if(diff>85 && window.scrollY<15){
    _pull.innerText='⏳ بيحدث...';
    _pull.style.top='18px';
    setTimeout(()=>location.reload(),400);
  }else{
    _pull.style.top='-60px';
  }
},{passive:true});

function uid(){ return Date.now()+''+Math.floor(Math.random()*999); }
function saveLS(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function loadLS(k,def){ try{ return JSON.parse(localStorage.getItem(k))||def }catch{ return def } }
function fileToBase64(file, cb){
  const r=new FileReader();
  r.onload=e=>cb(e.target.result);
  r.readAsDataURL(file);
}

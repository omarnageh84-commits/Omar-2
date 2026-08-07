function openTab(id){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  event.currentTarget.classList.add('active');
  if(id==='home') renderHome();
}
function setDaily(type){
  document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  document.getElementById('p-'+type).classList.add('active');
  document.getElementById('daily-income').classList.add('hidden');
  document.getElementById('daily-exp').classList.add('hidden');
  document.getElementById('daily-debt').classList.add('hidden');
  document.getElementById('daily-'+type).classList.remove('hidden');
  if(type==='income') renderIncome();
  if(type==='exp') renderExp();
  if(type==='debt') renderDebt();
}
document.getElementById('date').innerText = new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
// init
renderHome(); renderIncome();

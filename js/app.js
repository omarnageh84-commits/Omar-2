document.getElementById('date').innerText=new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
function openTab(e,id){
 document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
 document.getElementById('tab-'+id).classList.add('active');
 document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
 e.currentTarget.classList.add('active');
 if(id==='home') renderHome();
 if(id==='att') renderAtt();
 if(id==='notes') renderNotes();
 if(id==='tasks') renderTasks();
 if(id==='daily') renderIncome();
}
function setDaily(t){
 document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
 document.getElementById('p-'+t).classList.add('active');
 document.getElementById('daily-income').classList.toggle('hidden',t!=='income');
 document.getElementById('daily-exp').classList.toggle('hidden',t!=='exp');
 document.getElementById('daily-debt').classList.toggle('hidden',t!=='debt');
 if(t==='income') renderIncome(); if(t==='exp') renderExp(); if(t==='debt') renderDebt();
}

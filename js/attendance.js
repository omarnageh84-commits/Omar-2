let att = JSON.parse(localStorage.getItem('att')||'[]');
document.getElementById('tab-att').innerHTML=`<div style="display:flex;gap:10px"><button class="btn" style="flex:1;padding:30px" onclick="checkIn()">حضور ✅</button><button class="btn" style="flex:1;padding:30px;background:#334155" onclick="checkOut()">انصراف ⏹️</button></div><div id="att-list"></div>`;
function checkIn(){att.push({date:new Date().toLocaleDateString(),in:new Date().toLocaleTimeString(),out:'...'}); saveAtt();}
function checkOut(){if(att.length) att[att.length-1].out=new Date().toLocaleTimeString(); saveAtt();}
function saveAtt(){localStorage.setItem('att',JSON.stringify(att)); renderAtt();}
function renderAtt(){document.getElementById('att-list').innerHTML=att.slice(-10).reverse().map(a=>`<div class="card"><span>${a.date}</span><span>${a.in} - ${a.out}</span></div>`).join('');}
renderAtt();

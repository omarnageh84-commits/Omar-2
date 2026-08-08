import { L, S } from './utils.js';
export function renderTasks(){
  let tasks=L('notion_tasks',[]), cats=L('cats_tasks',['عاجل','مهم','عادي']);
  return `<div class="card"><b>فئات التاسكس:</b> ${cats.map(c=>`<span class="cat">${c} <b onclick="window.delTCat('${c}')">x</b></span>`).join('')}<div class="inp"><input id="newTCat" placeholder="فئة"><button class="btn-sm" style="background:#0ea5e9;color:#fff" onclick="window.addTCat()">+ فئة</button></div></div>
  <div class="card"><div class="inp"><input id="tT" placeholder="مهمة"><select id="tC">${cats.map(c=>`<option>${c}</option>`).join('')}</select></div><button class="btn" style="background:#0ea5e9" onclick="window.addT()">إضافة</button></div>
  <div class="card"><div class="h-scroll"><table class="report"><tr><th>الفئة</th><th>مكتمل / الكل</th></tr>${cats.map(c=>{let all=tasks.filter(t=>t.cat===c); return `<tr><td>${c}</td><td>${all.filter(t=>t.done).length}/${all.length}</td></tr>`}).join('')}</table></div></div>
  <div style="margin:10px">${tasks.map((x,i)=>`<div class="card" style="display:flex;justify-content:space-between"><span>${x.done?'✅':''} ${x.text} - ${x.cat}</span><span><input type="checkbox" ${x.done?'checked':''} onchange="window.toggleT(${i})"> <button class="btn-sm" style="background:#fee2e2" onclick="window.delT(${i})">x</button></span></div>`).join('')}</div>`;
  window.addTCat=()=>{ let v=newTCat.value.trim(); if(!v) return; let c=L('cats_tasks',[]); c.push(v); S('cats_tasks',c); document.getElementById('root').innerHTML=renderTasks(); };
  window.delTCat=(cat)=>{ let c=L('cats_tasks',[]).filter(x=>x!==cat); S('cats_tasks',c); document.getElementById('root').innerHTML=renderTasks(); };
  window.addT=()=>{ let v=tT.value,cat=tC.value; if(!v) return; let t=L('notion_tasks',[]); t.unshift({text:v,cat,done:false}); S('notion_tasks',t); document.getElementById('root').innerHTML=renderTasks(); };
  window.toggleT=(i)=>{ let t=L('notion_tasks',[]); t[i].done=!t[i].done; S('notion_tasks',t); document.getElementById('root').innerHTML=renderTasks(); };
  window.delT=(i)=>{ let t=L('notion_tasks',[]); t.splice(i,1); S('notion_tasks',t); document.getElementById('root').innerHTML=renderTasks(); };
}

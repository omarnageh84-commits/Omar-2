import { L, S } from './utils.js';
import { sync } from './sheets.js';

let tab='income';
export function renderDaily(){
  let data=L('daily_v5',[]);
  let cats=L('cats_daily',{income:['راتب','مكافأة'],expense:['أكل','مواصلات','صيدلية'],debt:['دين لي','دين علي']});
  let curCats = tab==='income'?cats.income:tab==='expense'?cats.expense:cats.debt;
  let filtered=data.filter(x=> (tab==='income'&&x.t==='دخل')||(tab==='expense'&&x.t==='مصروف')||(tab==='debt'&&x.t==='دين'));

  // تقرير الفئات
  let report={}; curCats.forEach(c=>report[c]=filtered.filter(x=>x.c===c).reduce((s,x)=>s+x.a,0));

  return `
  <div class="card">
    <div class="seg">
      <button class="${tab==='income'?'active':''}" onclick="window.setDailyTab('income')">دخل 💰</button>
      <button class="${tab==='expense'?'active':''}" onclick="window.setDailyTab('expense')">مصروف 💸</button>
      <button class="${tab==='debt'?'active':''}" onclick="window.setDailyTab('debt')">ديون 📒</button>
    </div>
    <div style="margin:8px 0"><b>فئات ${tab}:</b> ${curCats.map(c=>`<span class="cat">${c} <b onclick="window.delCat('${tab}','${c}')">x</b></span>`).join('')}
      <div class="inp"><input id="newCat" placeholder="فئة جديدة"><button class="btn-sm" style="background:var(--green);color:#fff" onclick="window.addCat('${tab}')">+ إضافة فئة</button></div>
    </div>
    <div class="inp"><input id="dDesc" placeholder="الوصف"><input id="dAmount" type="number" placeholder="المبلغ"><select id="dCat">${curCats.map(c=>`<option>${c}</option>`).join('')}</select></div>
    <button class="btn" onclick="window.addDaily()">إضافة ${tab}</button>
  </div>

  <div class="card"><b>📊 تقرير ${tab} - حسب الفئة</b>
    <div class="h-scroll"><table class="report"><tr><th>الفئة</th><th>الإجمالي</th><th>العدد</th></tr>
    ${curCats.map(c=>`<tr><td>${c}</td><td>${report[c]||0}</td><td>${filtered.filter(x=>x.c===c).length}</td></tr>`).join('')}
    </table></div>
  </div>

  <div class="card">${filtered.map((x,i)=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #eee"><span>${x.d} - <small>${x.c}</small></span><span><b>${x.a}</b> <b onclick="window.delDaily(${L('daily_v5',[]).indexOf(x)})" style="color:red;cursor:pointer">حذف</b></span></div>`).join('')||'فاضي'}</div>
  `;
}

export function bindDaily(){
  window.setDailyTab = (t)=>{ tab=t; document.getElementById('root').innerHTML=renderDaily(); bindDaily(); };
  window.addCat = (type)=>{
    let v=document.getElementById('newCat').value.trim(); if(!v) return;
    let cats=L('cats_daily',{income:[],expense:[],debt:[]}); cats[type].push(v); S('cats_daily',cats); document.getElementById('root').innerHTML=renderDaily(); bindDaily();
  };
  window.delCat = (type,cat)=>{
    let cats=L('cats_daily',{income:[],expense:[],debt:[]}); cats[type]=cats[type].filter(c=>c!==cat); S('cats_daily',cats); document.getElementById('root').innerHTML=renderDaily(); bindDaily();
  };
  window.addDaily = ()=>{
    let d=dDesc.value,a=+dAmount.value,c=dCat.value; if(!d||!a) return;
    let t=tab==='income'?'دخل':tab==='expense'?'مصروف':'دين', all=L('daily_v5',[]); all.unshift({d,a,c,t,date:new Date().toISOString()}); S('daily_v5',all); sync('daily',{d,a,c,t}); document.getElementById('root').innerHTML=renderDaily(); bindDaily();
  };
  window.delDaily = (i)=>{ let all=L('daily_v5',[]); all.splice(i,1); S('daily_v5',all); document.getElementById('root').innerHTML=renderDaily(); bindDaily(); };
}

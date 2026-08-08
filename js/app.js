// js/app.js - V5.1 Fixed - كل حاجة هنا
import { L, S, calc, today } from './utils.js';

const root = document.getElementById('root');
document.getElementById('dateTop').innerText = today();
let curTab = 'dashboard';
let dailyTab = 'income';

// ====== DAILY FUNCTIONS - لازم تبقى Global قبل أي رندر ======
window.setDailyTab = (t) => { dailyTab = t; renderDaily(); };
window.addCat = (type) => {
  let v = document.getElementById('newCat').value.trim(); if(!v) return;
  let cats = L('cats_daily',{income:['راتب'],expense:['أكل'],debt:['دين']});
  cats[type].push(v); S('cats_daily',cats); renderDaily();
};
window.delCat = (type, cat) => {
  let cats = L('cats_daily',{income:[],expense:[],debt:[]});
  cats[type] = cats[type].filter(c=>c!==cat); S('cats_daily',cats); renderDaily();
};
window.addDaily = () => {
  let d = document.getElementById('dDesc').value, a = +document.getElementById('dAmount').value, c = document.getElementById('dCat').value;
  if(!d||!a) return alert('كمل البيانات');
  let t = dailyTab==='income'?'دخل':dailyTab==='expense'?'مصروف':'دين';
  let all = L('daily_v5',[]); all.unshift({d,a,c,t,date:new Date().toISOString()}); S('daily_v5',all); renderDaily();
};
window.delDaily = (i) => { let all = L('daily_v5',[]); all.splice(i,1); S('daily_v5',all); renderDaily(); };

// ====== ATTENDANCE FUNCTIONS ======
window.saveAttHeader = () => {
  S('pharm', +document.getElementById('pharmIn').value||0);
  S('rate', +document.getElementById('rateIn').value||40.74);
  S('target', +document.getElementById('targetIn').value||423);
  renderAttendance();
};
window.upAtt = (day,type,val) => {
  let l = L('att',[]), r = l.find(x=>x.day===day)||{day,in:'',out:'',h:0};
  r[type]=val; if(r.in&&r.out) r.h = calc(r.in,r.out);
  let i = l.findIndex(x=>x.day===day); if(i>-1) l[i]=r; else l.push(r);
  S('att',l); renderAttendance();
};
window.nowAtt = (d,t) => { window.upAtt(d,t,new Date().toTimeString().slice(0,5)); };

// ====== NOTES & TASKS FUNCTIONS ======
window.addNCat = () => { let v=document.getElementById('newNCat').value.trim(); if(!v) return; let c=L('cats_notes',['شغل']); c.push(v); S('cats_notes',c); renderNotes(); };
window.delNCat = (cat) => { let c=L('cats_notes',[]).filter(x=>x!==cat); S('cats_notes',c); renderNotes(); };
window.addN = () => { let t=document.getElementById('nT').value,b=document.getElementById('nB').value,cat=document.getElementById('nC').value; if(!t) return; let n=L('notion_notes',[]); n.unshift({title:t,body:b,cat,date:new Date().toISOString()}); S('notion_notes',n); renderNotes(); };
window.delN = (i) => { let n=L('notion_notes',[]); n.splice(i,1); S('notion_notes',n); renderNotes(); };

window.addTCat = () => { let v=document.getElementById('newTCat').value.trim(); if(!v) return; let c=L('cats_tasks',[]); c.push(v); S('cats_tasks',c); renderTasks(); };
window.delTCat = (cat) => { let c=L('cats_tasks',[]).filter(x=>x!==cat); S('cats_tasks',c); renderTasks(); };
window.addT = () => { let v=document.getElementById('tT').value,cat=document.getElementById('tC').value; if(!v) return; let t=L('notion_tasks',[]); t.unshift({text:v,cat,done:false}); S('notion_tasks',t); renderTasks(); };
window.toggleT = (i) => { let t=L('notion_tasks',[]); t[i].done=!t[i].done; S('notion_tasks',t); renderTasks(); };
window.delT = (i) => { let t=L('notion_tasks',[]); t.splice(i,1); S('notion_tasks',t); renderTasks(); };

// ====== RENDER FUNCTIONS ======
function renderDashboard(){
  let d=L('daily_v5',[]), att=L('att',[]), tot=att.reduce((s,r)=>s+(r.h||0),0);
  root.innerHTML = `<div class="card" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff"><h3 style="margin:0">يومياتي Pro V5.1</h3><p>${tot.toFixed(1)} ساعة • ${d.length} عملية</p></div>`;
}

function renderDaily(){
  let data=L('daily_v5',[]), cats=L('cats_daily',{income:['راتب','مكافأة'],expense:['أكل','مواصلات','صيدلية'],debt:['دين لي','دين علي']});
  let curCats = dailyTab==='income'?cats.income:dailyTab==='expense'?cats.expense:cats.debt;
  let filtered = data.filter(x=> (dailyTab==='income'&&x.t==='دخل')||(dailyTab==='expense'&&x.t==='مصروف')||(dailyTab==='debt'&&x.t==='دين'));
  let report={}; curCats.forEach(c=>report[c]=filtered.filter(x=>x.c===c).reduce((s,x)=>s+x.a,0));
  root.innerHTML = `
  <div class="card"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;background:#f1f5f9;padding:5px;border-radius:12px"><button onclick="setDailyTab('income')" style="padding:8px;border-radius:8px;border:0;background:${dailyTab==='income'?'#10b981':'transparent'};color:${dailyTab==='income'?'#fff':'#000'}">دخل</button><button onclick="setDailyTab('expense')" style="padding:8px;border-radius:8px;border:0;background:${dailyTab==='expense'?'#10b981':'transparent'}">مصروف</button><button onclick="setDailyTab('debt')" style="padding:8px;border-radius:8px;border:0;background:${dailyTab==='debt'?'#10b981':'transparent'}">ديون</button></div>
  <div style="margin:8px 0"><b>فئات ${dailyTab}:</b> ${curCats.map(c=>`<span style="background:#f3f4f6;padding:5px 10px;border-radius:20px;font-size:11px;margin:2px;display:inline-block">${c} <b onclick="delCat('${dailyTab}','${c}')" style="color:red;cursor:pointer">x</b></span>`).join('')}<div style="display:flex;gap:6px;margin-top:6px"><input id="newCat" placeholder="فئة جديدة" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:8px"><button onclick="addCat('${dailyTab}')" style="padding:8px 12px;background:#10b981;color:#fff;border:0;border-radius:8px">+</button></div></div>
  <div style="display:flex;gap:6px;margin:6px 0"><input id="dDesc" placeholder="الوصف" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:10px"><input id="dAmount" type="number" placeholder="المبلغ" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:10px"><select id="dCat" style="flex:1;padding:10px;border-radius:10px">${curCats.map(c=>`<option>${c}</option>`).join('')}</select></div><button onclick="addDaily()" style="width:100%;padding:12px;background:#10b981;color:#fff;border:0;border-radius:12px;font-weight:800">إضافة ${dailyTab}</button></div>
  <div class="card"><b>تقرير الفئات</b><div style="overflow:auto"><table style="min-width:400px;width:100%;font-size:11px"><tr><th>الفئة</th><th>الإجمالي</th></tr>${curCats.map(c=>`<tr><td>${c}</td><td>${report[c]||0}</td></tr>`).join('')}</table></div></div>
  <div class="card">${filtered.map((x)=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #eee"><span>${x.d} - ${x.c}</span><b>${x.a} <span onclick="delDaily(${data.indexOf(x)})" style="color:red">حذف</span></b></div>`).join('')||'فاضي'}</div>`;
}

function renderAttendance(){
  let rate=L('rate',40.74), pharm=L('pharm',0), target=L('target',423), m=L('att',Array.from({length:31},(_,i)=>({day:i+1,in:'',out:'',h:0}))); if(m.length<31) m=Array.from({length:31},(_,i)=>m.find(x=>x.day===i+1)||{day:i+1,in:'',out:'',h:0});
  let tot=m.reduce((s,r)=>s+(r.h||0),0), remain=422.8-tot;
  root.innerHTML=`<div class="card"><div style="font-weight:800;text-align:center">💰 ملخص المرتب - الحضور والانصراف</div><div style="overflow:auto;direction:ltr"><table style="direction:rtl;min-width:600px;width:100%;font-size:11px"><tr><th>عدد الساعات</th><th>الصافي</th><th>المطلوب</th><th>مطلوب يوميا</th><th>ديون للصيدلية</th><th>المتبقي</th></tr><tr><td>${tot.toFixed(1)}</td><td>${(tot*rate).toFixed(0)}</td><td><input id="targetIn" value="${target}" style="width:50px"></td><td>13.64</td><td><input id="pharmIn" value="${pharm}" style="width:50px"></td><td>${remain.toFixed(1)}</td></tr></table></div><div style="display:flex;gap:6px;margin-top:8px"><button onclick="saveAttHeader()" style="padding:10px 16px;background:#10b981;color:#fff;border:0;border-radius:10px">حفظ</button><input id="rateIn" value="${rate}" style="flex:1"><input type="range" min="20" max="60" value="${rate}" oninput="rateIn.value=this.value" style="flex:1"></div></div><div class="card">${m.map(r=>`<div style="display:grid;grid-template-columns:22px 1fr 1fr 40px;gap:4px;align-items:center;border:1px solid #eee;border-radius:10px;padding:4px;margin:4px 0;font-size:11px"><b>${r.day}</b><div style="display:flex;gap:2px"><input type="time" value="${r.in}" onchange="upAtt(${r.day},'in',this.value)" style="flex:1"><button onclick="nowAtt(${r.day},'in')" style="font-size:8px;background:#eef2ff;border:1px dashed blue;border-radius:6px">الآن</button></div><div style="display:flex;gap:2px"><input type="time" value="${r.out}" onchange="upAtt(${r.day},'out',this.value)" style="flex:1"><button onclick="nowAtt(${r.day},'out')" style="font-size:8px;background:#eef2ff;border:1px dashed blue;border-radius:6px">الآن</button></div><b style="color:#10b981">${r.h||'--'}</b></div>`).join('')}</div>`;
}

function renderNotes(){
  let notes=L('notion_notes',[]), cats=L('cats_notes',['شغل','صيدلية','شخصي']);
  root.innerHTML=`<div class="card"><b>فئات الملاحظات:</b> ${cats.map(c=>`<span style="background:#f3f4f6;padding:4px 8px;border-radius:12px;font-size:11px;margin:2px">${c} <b onclick="delNCat('${c}')" style="color:red">x</b></span>`).join('')}<div style="display:flex;gap:4px;margin-top:6px"><input id="newNCat" placeholder="فئة جديدة" style="flex:1"><button onclick="addNCat()" style="background:#111;color:#fff;border:0;border-radius:8px;padding:6px 10px">+</button></div></div><div class="card"><input id="nT" placeholder="عنوان الملاحظة" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:10px"><textarea id="nB" placeholder="التفاصيل..." style="width:100%;min-height:60px;border:1px solid #ddd;border-radius:10px;margin-top:6px"></textarea><select id="nC" style="width:100%;margin-top:6px;padding:8px">${cats.map(c=>`<option>${c}</option>`).join('')}</select><button onclick="addN()" style="width:100%;margin-top:6px;padding:10px;background:#111;color:#fff;border:0;border-radius:10px">حفظ ملاحظة</button></div><div style="margin:10px">${notes.map((n,i)=>`<div class="card"><b>📄 ${n.title}</b> - ${n.cat}<br><small>${n.body}</small><br><button onclick="delN(${i})" style="background:#fee2e2;border:0;border-radius:6px;padding:4px 8px;margin-top:6px">حذف</button></div>`).join('')}</div>`;
}

function renderTasks(){
  let tasks=L('notion_tasks',[]), cats=L('cats_tasks',['عاجل','مهم','عادي']);
  root.innerHTML=`<div class="card"><b>فئات المهام:</b> ${cats.map(c=>`<span style="background:#f3f4f6;padding:4px 8px;border-radius:12px;font-size:11px;margin:2px">${c} <b onclick="delTCat('${c}')" style="color:red">x</b></span>`).join('')}<div style="display:flex;gap:4px;margin-top:6px"><input id="newTCat" placeholder="فئة" style="flex:1"><button onclick="addTCat()" style="background:#0ea5e9;color:#fff;border:0;border-radius:8px;padding:6px 10px">+</button></div></div><div class="card"><div style="display:flex;gap:6px"><input id="tT" placeholder="مهمة جديدة" style="flex:1"><select id="tC">${cats.map(c=>`<option>${c}</option>`).join('')}</select></div><button onclick="addT()" style="width:100%;margin-top:6px;padding:10px;background:#0ea5e9;color:#fff;border:0;border-radius:10px">إضافة مهمة</button></div><div style="margin:10px">${tasks.map((x,i)=>`<div class="card" style="display:flex;justify-content:space-between"><span>${x.done?'✅':''} ${x.text} - ${x.cat}</span><span><input type="checkbox" ${x.done?'checked':''} onchange="toggleT(${i})"> <button onclick="delT(${i})" style="background:#fee2e2;border:0;border-radius:6px">x</button></span></div>`).join('')}</div>`;
}

// الروتر - مع تصحيح الاسماء
document.querySelectorAll('.nav button').forEach(b=>{
  b.onclick = () => {
    document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    let t = b.dataset.t;
    if(t==='dashboard') renderDashboard();
    if(t==='daily') renderDaily();
    if(t==='attendance') renderAttendance();
    if(t==='notes') renderNotes();
    if(t==='tasks') renderTasks();
  };
});

// شغل الافتراضي
renderDashboard();

// تصحيح اسماء التبويبات في الـ HTML
document.querySelector('[data-t="notes"]').innerText = 'ملاحظات';
document.querySelector('[data-t="tasks"]').innerText = 'مهام';

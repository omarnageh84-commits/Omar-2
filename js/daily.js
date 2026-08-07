// js/daily.js - نسخة SLIM مضغوطة احترافية
let daily = JSON.parse(localStorage.getItem('daily_v4') || '{"income":[],"exp":[],"debt":[],"cats":{"income":["مبيعات","حوافز","سلفة"],"exp":["مواصلات","أكل","شحن","قهوة","مصروف بيت"],"debt":["عليّ","ليّ"]}}');
if(!daily.cats) daily.cats={income:["مبيعات"],exp:["مواصلات","أكل"],debt:["عليّ","ليّ"]};
let dailyView = localStorage.getItem('daily_view') || 'today';
function saveDaily(){ localStorage.setItem('daily_v4', JSON.stringify(daily)); localStorage.setItem('daily_view', dailyView); }
function renderDailyAll(){ renderExp(); }
function renderIncome(){ renderList('income'); }
function renderExp(){ renderList('exp'); }
function renderDebt(){ renderList('debt'); }
function getFiltered(type){
  let list = daily[type];
  let now = new Date();
  if(dailyView==='today') return list.filter(x=> new Date(x.fullDate).toDateString()===now.toDateString());
  if(dailyView==='week'){ let w=new Date(); w.setDate(now.getDate()-7); return list.filter(x=> new Date(x.fullDate)>=w); }
  if(dailyView==='month'){ return list.filter(x=> new Date(x.fullDate).getMonth()===now.getMonth()); }
  return list;
}
function renderList(type){
  let el=document.getElementById('daily-'+type); if(!el) return;
  let all=daily[type]; let list=getFiltered(type);
  let total=list.reduce((s,x)=>s+(x.amount||0),0);
  let cats=daily.cats[type];
  let isExp=type==='exp', isInc=type==='income';

  el.innerHTML=`
  <div style="zoom:0.88">
    <!-- فلتر -->
    <div style="display:flex;gap:3px;background:#f1f5f9;padding:2px;border-radius:99px;margin-bottom:6px">
      ${[['today','اليوم'],['week','أسبوع'],['month','شهر'],['all','الكل']].map(([k,l])=>`<button onclick="dailyView='${k}';saveDaily();renderList('${type}')" style="flex:1;border:0;padding:4px;border-radius:99px;font-size:8px;font-weight:700;cursor:pointer;background:${dailyView===k?'#000':'transparent'};color:${dailyView===k?'#fff':'#64748b'}">${l}</button>`).join('')}
    </div>

    <!-- اجمالي SLIM -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px">
      <div style="background:${isExp?'#fef2f2':isInc?'#000':'#f8fafc'};color:${isExp?'#dc2626':isInc?'#fff':'#000'};border-radius:10px;padding:6px 8px;border:1px solid ${isExp?'#fecaca':'#e5e7eb'};display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:6px;opacity:.7">${list.length} عملية</div><div style="font-size:12px;font-weight:900;font-family:monospace">${total.toLocaleString('en-US')} ج</div></div>
        <div style="font-size:9px;opacity:.5">📊</div>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:6px 8px;display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:6px;color:#64748b">متوسط</div><div style="font-size:11px;font-weight:900;font-family:monospace">${list.length?Math.round(total/list.length):0} ج</div></div>
        <div style="font-size:8px;color:#10b981">● مباشر</div>
      </div>
    </div>

    <!-- فورم SLIM -->
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:6px;margin-bottom:6px;box-shadow:0 2px 6px rgba(0,0,0,.03)">
      <div style="display:flex;gap:4px;margin-bottom:4px">
        <div style="flex:1.2;position:relative">
          <input type="number" id="${type}Amount" placeholder="0" inputmode="numeric" style="width:100%;background:#000;color:#fff;border:0;border-radius:8px;padding:8px 8px;font-size:14px;font-weight:900;font-family:monospace;outline:none">
          <span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#fff;opacity:.5;font-size:7px">جنيه</span>
        </div>
        <select id="${type}Cat" style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:6px;font-size:9px;font-weight:700;color:#000">
          ${cats.map(c=>`<option value="${c}">${c}</option>`).join('')}
        </select>
        <button onclick="addDaily('${type}')" style="background:#000;color:#fff;border:0;border-radius:8px;padding:0 12px;font-weight:900;font-size:10px;cursor:pointer">+ حفظ</button>
      </div>
      <div style="display:flex;gap:4px">
        <input id="${type}Note" placeholder="ملاحظة... (اختياري)" style="flex:1;background:#f8fafc;border:1px solid #f1f5f9;border-radius:99px;padding:4px 8px;font-size:8px;outline:none;color:#000">
      </div>

      <!-- فئات SLIM -->
      <details style="margin-top:6px;background:#f8fafc;border-radius:8px;padding:4px 6px">
        <summary style="font-size:8px;font-weight:800;cursor:pointer;list-style:none;display:flex;justify-content:space-between">⚙️ إدارة الفئات (${cats.length}) <span style="color:#64748b;font-size:7px">▼</span></summary>
        <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:5px">
          ${cats.map((c,i)=>`<span style="background:#fff;border:1px solid #e2e8f0;padding:2px 6px;border-radius:99px;font-size:7px;display:flex;gap:3px;align-items:center;font-weight:600">${c} <b onclick="editCat('${type}',${i})" style="color:#10b981;cursor:pointer">✎</b> <b onclick="deleteCat('${type}',${i})" style="color:#ef4444;cursor:pointer">✕</b></span>`).join('')}
        </div>
        <div style="display:flex;gap:3px;margin-top:5px">
          <input id="${type}NewCat" placeholder="فئة جديدة..." style="flex:1;padding:3px 6px;border-radius:99px;font-size:7px;border:1px solid #e2e8f0;background:#fff;color:#000">
          <button onclick="addCat('${type}')" style="border:0;background:#000;color:#fff;padding:3px 8px;border-radius:99px;font-size:7px;font-weight:800">إضافة</button>
        </div>
      </details>
    </div>

    <!-- ليست SLIM -->
    <div style="display:flex;flex-direction:column;gap:3px">
      ${list.slice().reverse().map(x=>{
        let rIdx=all.indexOf(x);
        return `
        <div style="background:#fff;border:1px solid #f1f5f9;border-radius:8px;padding:5px 7px;display:flex;justify-content:space-between;align-items:center;height:34px">
          <div style="display:flex;gap:6px;align-items:center;overflow:hidden">
            <div style="width:20px;height:20px;border-radius:6px;background:${isExp?'#fef2f2':isInc?'#000':'#f1f5f9'};color:${isExp?'#dc2626':isInc?'#fff':'#000'};display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0">${isExp?'💸':isInc?'💊':'💳'}</div>
            <div style="overflow:hidden">
              <div style="font-size:9px;font-weight:800;display:flex;gap:3px;align-items:center;white-space:nowrap"><span style="font-family:monospace;font-size:10px">${x.amount.toLocaleString('en-US')} ج</span><span style="background:#f1f5f9;padding:0 4px;border-radius:99px;font-size:6px;font-weight:600">${x.cat}</span></div>
              <div style="font-size:6px;color:#94a3b8;margin-top:0px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x.note||'بدون'} • ${x.time||''}</div>
            </div>
          </div>
          <div style="display:flex;gap:2px;flex-shrink:0">
            <button onclick="editDaily('${type}',${rIdx})" style="width:22px;height:22px;border:0;background:#f0fdf4;color:#16a34a;border-radius:6px;cursor:pointer;font-size:9px">✎</button>
            <button onclick="deleteDaily('${type}',${rIdx})" style="width:22px;height:22px;border:0;background:#fef2f2;color:#ef4444;border-radius:6px;cursor:pointer;font-size:9px">🗑️</button>
          </div>
        </div>`;
      }).join('') || `<div style="text-align:center;padding:16px 8px;background:#fff;border:1px dashed #e2e8f0;border-radius:10px"><div style="font-size:16px">📭</div><div style="font-size:8px;color:#94a3b8;margin-top:3px">لا يوجد عمليات اليوم</div></div>`}
    </div>
  </div>`;
}

function addDaily(type){
  let amtEl=document.getElementById(type+'Amount'); let amt=parseFloat(amtEl.value);
  if(!amt||amt<=0){ amtEl.style.outline='2px solid #ef4444'; return; }
  let cat=document.getElementById(type+'Cat').value;
  let note=document.getElementById(type+'Note').value.trim();
  let now=new Date();
  daily[type].push({amount:amt,cat,note,date:now.toLocaleDateString('ar-EG'),time:now.toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'}),fullDate:now.toISOString()});
  saveDaily(); renderList(type); if(typeof renderDashboard==='function') renderDashboard();
  document.getElementById(type+'Amount').value=''; document.getElementById(type+'Note').value='';
}
function deleteDaily(type,i){
  let item=daily[type][i];
  if(!confirm(`⚠️ مسح ${item.amount} ج - ${item.cat} ؟`)) return;
  daily[type].splice(i,1); saveDaily(); renderList(type); if(typeof renderDashboard==='function') renderDashboard();
}
function editDaily(type,i){
  let item=daily[type][i];
  let newAmt=prompt(`تعديل المبلغ (الحالي: ${item.amount}):`, item.amount);
  if(newAmt===null) return; let n=parseFloat(newAmt); if(!n) return;
  if(!confirm(`تعديل من ${item.amount} إلى ${n} ؟`)) return;
  daily[type][i].amount=n; saveDaily(); renderList(type); if(typeof renderDashboard==='function') renderDashboard();
}
function addCat(type){
  let el=document.getElementById(type+'NewCat'); let v=el.value.trim(); if(!v) return;
  if(daily.cats[type].includes(v)) return alert('موجودة');
  daily.cats[type].push(v); saveDaily(); renderList(type);
}
function deleteCat(type,i){
  let name=daily.cats[type][i];
  if(daily.cats[type].length<=1) return alert('لازم فئة واحدة');
  if(!confirm(`مسح فئة "${name}" ؟`)) return;
  daily.cats[type].splice(i,1); saveDaily(); renderList(type);
}
function editCat(type,i){
  let old=daily.cats[type][i]; let v=prompt(`تعديل "${old}" إلى:`, old);
  if(!v||v.trim()===old) return; v=v.trim();
  if(confirm(`تعديل كل العمليات القديمة "${old}" إلى "${v}" ؟`)){ daily[type].forEach(x=>{ if(x.cat===old) x.cat=v; }); }
  daily.cats[type][i]=v; saveDaily(); renderList(type);
}

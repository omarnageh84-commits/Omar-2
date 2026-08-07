// js/daily.js - احترافي برو ماكس
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
  let el=document.getElementById('daily-'+type);
  if(!el) return;
  let all=daily[type];
  let list=getFiltered(type);
  let total=list.reduce((s,x)=>s+(x.amount||0),0);
  let totalAll=all.reduce((s,x)=>s+(x.amount||0),0);
  let cats=daily.cats[type];
  let isExp=type==='exp', isInc=type==='income';

  el.innerHTML=`
  <div style="zoom:0.96">
    <!-- فلتر العرض -->
    <div style="display:flex;gap:4px;background:#f1f5f9;padding:3px;border-radius:99px;margin-bottom:8px">
      ${[['today','اليوم'],['week','أسبوع'],['month','شهر'],['all','الكل']].map(([k,l])=>`<button onclick="dailyView='${k}';saveDaily();renderList('${type}')" style="flex:1;border:0;padding:6px;border-radius:99px;font-size:10px;font-weight:700;cursor:pointer;background:${dailyView===k?'#000':'transparent'};color:${dailyView===k?'#fff':'#64748b'}">${l}</button>`).join('')}
    </div>

    <!-- كروت الاجمالي برو -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
      <div style="background:${isExp?'#fef2f2':isInc?'#000':'#f8fafc'};color:${isExp?'#dc2626':isInc?'#fff':'#000'};border-radius:14px;padding:10px;border:1px solid ${isExp?'#fecaca':'#e5e7eb'}">
        <div style="font-size:7px;opacity:.7;letter-spacing:1px">${dailyView==='today'?'اليوم':'الفترة'} • ${list.length} عملية</div>
        <div style="font-size:16px;font-weight:900;font-family:monospace;margin-top:2px">${total.toLocaleString('en-US')} <span style="font-size:9px">ج</span></div>
        <div style="font-size:7px;margin-top:3px;opacity:.6">الكل: ${totalAll.toLocaleString('en-US')} ج</div>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:10px">
        <div style="font-size:7px;color:#64748b">متوسط العملية</div>
        <div style="font-size:14px;font-weight:900;font-family:monospace;margin-top:2px">${list.length?Math.round(total/list.length).toLocaleString('en-US'):0} ج</div>
        <div style="font-size:7px;color:#10b981;margin-top:3px">● مباشر</div>
      </div>
    </div>

    <!-- فورم الاضافة برو -->
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:10px;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,.04)">
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <div style="flex:1.3;position:relative">
          <input type="number" id="${type}Amount" placeholder="0" inputmode="numeric" style="width:100%;background:#000;color:#fff;border:0;border-radius:12px;padding:12px 10px;font-size:18px;font-weight:900;font-family:monospace;outline:none">
          <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#fff;opacity:.6;font-size:10px">جنيه - المبلغ</span>
        </div>
        <select id="${type}Cat" style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px;font-size:11px;font-weight:700;color:#000">
          ${cats.map(c=>`<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:6px">
        <input id="${type}Note" placeholder="ملاحظة... (اختياري)" style="flex:1;background:#f8fafc;border:1px solid #f1f5f9;border-radius:99px;padding:8px 12px;font-size:11px;outline:none;color:#000">
        <button onclick="addDaily('${type}')" style="background:#000;color:#fff;border:0;border-radius:99px;padding:0 18px;font-weight:900;font-size:11px;cursor:pointer">+ حفظ</button>
      </div>

      <!-- ادارة الفئات برو -->
      <details style="margin-top:10px;background:#f8fafc;border-radius:12px;padding:8px">
        <summary style="font-size:10px;font-weight:800;cursor:pointer;list-style:none;display:flex;justify-content:space-between">⚙️ إدارة الفئات (${cats.length}) <span style="color:#64748b">▼</span></summary>
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px">
          ${cats.map((c,i)=>`<span style="background:#fff;border:1px solid #e2e8f0;padding:4px 8px;border-radius:99px;font-size:10px;display:flex;gap:5px;align-items:center;font-weight:600">${c} <b onclick="editCat('${type}',${i})" style="color:#10b981;cursor:pointer">✎</b> <b onclick="deleteCat('${type}',${i})" style="color:#ef4444;cursor:pointer">✕</b></span>`).join('')}
        </div>
        <div style="display:flex;gap:5px;margin-top:8px">
          <input id="${type}NewCat" placeholder="اسم فئة جديدة..." style="flex:1;padding:6px 10px;border-radius:99px;font-size:10px;border:1px solid #e2e8f0;background:#fff;color:#000">
          <button onclick="addCat('${type}')" style="border:0;background:#000;color:#fff;padding:6px 14px;border-radius:99px;font-size:10px;font-weight:800;cursor:pointer">إضافة</button>
        </div>
      </details>
    </div>

    <!-- ليست العمليات برو -->
    <div style="display:flex;flex-direction:column;gap:6px">
      ${list.slice().reverse().map((x,idx)=>{
        let realIdx=all.length-1-all.slice().reverse().findIndex(a=>a===x); // tricky
        let rIdx=all.indexOf(x);
        return `
        <div style="background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:10px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 1px 4px rgba(0,0,0,.03)">
          <div style="display:flex;gap:8px;align-items:center">
            <div style="width:32px;height:32px;border-radius:10px;background:${isExp?'#fef2f2':isInc?'#000':'#f1f5f9'};color:${isExp?'#dc2626':isInc?'#fff':'#000'};display:flex;align-items:center;justify-content:center;font-size:14px">${isExp?'💸':isInc?'💊':'💳'}</div>
            <div>
              <div style="font-size:11px;font-weight:800;display:flex;gap:4px;align-items:center"><span style="font-family:monospace;font-size:12px">${x.amount.toLocaleString('en-US')} ج</span><span style="background:#f1f5f9;padding:1px 6px;border-radius:99px;font-size:8px">${x.cat}</span></div>
              <div style="font-size:8px;color:#94a3b8;margin-top:1px">${x.note||'بدون ملاحظة'} • ${x.time||''} ${x.date||''}</div>
            </div>
          </div>
          <div style="display:flex;gap:4px">
            <button onclick="editDaily('${type}',${rIdx})" style="width:28px;height:28px;border:0;background:#f0fdf4;color:#16a34a;border-radius:8px;cursor:pointer">✎</button>
            <button onclick="deleteDaily('${type}',${rIdx})" style="width:28px;height:28px;border:0;background:#fef2f2;color:#ef4444;border-radius:8px;cursor:pointer">🗑️</button>
          </div>
        </div>`;
      }).join('') || `<div style="text-align:center;padding:30px 10px;background:#fff;border:1px dashed #e2e8f0;border-radius:16px"><div style="font-size:24px">📭</div><div style="font-size:11px;color:#94a3b8;margin-top:6px">لا يوجد عمليات في ${dailyView==='today'?'اليوم':''}</div><div style="font-size:8px;color:#cbd5e1">اضف اول عملية من فوق</div></div>`}
    </div>
  </div>`;
}

function addDaily(type){
  let amtEl=document.getElementById(type+'Amount');
  let amt=parseFloat(amtEl.value);
  if(!amt||amt<=0){ amtEl.style.border='2px solid #ef4444'; return alert('❌ دخل المبلغ صح'); }
  let cat=document.getElementById(type+'Cat').value;
  let note=document.getElementById(type+'Note').value.trim();
  let now=new Date();
  daily[type].push({amount:amt,cat,note,date:now.toLocaleDateString('ar-EG'),time:now.toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'}),fullDate:now.toISOString()});
  saveDaily(); renderList(type); if(typeof renderDashboard==='function') renderDashboard();
  document.getElementById(type+'Amount').value=''; document.getElementById(type+'Note').value='';
  // اهتزاز بسيط
  if(navigator.vibrate) navigator.vibrate(30);
}
function deleteDaily(type,i){
  let item=daily[type][i];
  if(!confirm(`⚠️ تحذير نهائي!\n\nهل أنت متأكد من مسح العملية دي؟\n\n💰 المبلغ: ${item.amount} ج\n📁 الفئة: ${item.cat}\n📝 ${item.note||'بدون ملاحظة'}\n\nلا يمكن التراجع بعد المسح!`)) return;
  if(!confirm(`تأكيد أخير - امسح ${item.amount} ج ؟`)) return;
  daily[type].splice(i,1); saveDaily(); renderList(type); if(typeof renderDashboard==='function') renderDashboard();
}
function editDaily(type,i){
  let item=daily[type][i];
  let newAmt=prompt(`تعديل المبلغ (الحالي: ${item.amount}):`, item.amount);
  if(newAmt===null) return;
  let n=parseFloat(newAmt); if(!n) return;
  if(!confirm(`⚠️ تأكيد تعديل؟\nمن: ${item.amount} ج\nإلى: ${n} ج`)) return;
  daily[type][i].amount=n;
  let newCat=prompt('تعديل الفئة:', item.cat); if(newCat) daily[type][i].cat=newCat;
  saveDaily(); renderList(type); if(typeof renderDashboard==='function') renderDashboard();
}
function addCat(type){
  let el=document.getElementById(type+'NewCat'); let v=el.value.trim();
  if(!v) return alert('اكتب اسم الفئة');
  if(daily.cats[type].includes(v)) return alert('الفئة موجودة بالفعل');
  daily.cats[type].push(v); saveDaily(); renderList(type);
}
function deleteCat(type,i){
  let name=daily.cats[type][i];
  if(daily.cats[type].length<=1) return alert('لازم تسيب فئة واحدة على الأقل');
  if(!confirm(`⚠️ مسح فئة "${name}" نهائي؟\nالعمليات القديمة هتفضل موجودة لكن مش هتعرف تضيف بيها تاني`)) return;
  daily.cats[type].splice(i,1); saveDaily(); renderList(type);
}
function editCat(type,i){
  let old=daily.cats[type][i];
  let v=prompt(`تعديل فئة "${old}" إلى:`, old);
  if(!v||v.trim()===old) return;
  v=v.trim();
  // اسأل هل يعدل القديم كمان
  if(confirm(`هل تريد تعديل كل العمليات القديمة اللي كانت "${old}" إلى "${v}" ؟`)){
    daily[type].forEach(x=>{ if(x.cat===old) x.cat=v; });
  }
  daily.cats[type][i]=v; saveDaily(); renderList(type);
}

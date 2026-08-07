// js/attendance.js - كتابة عشرية + قلب شهر + أرشيف 3 شهور + إدخال أسهل

let attData = JSON.parse(localStorage.getItem('att_v2') || '[]');
let salaryConfig = JSON.parse(localStorage.getItem('salaryConfig') || '{"hourPrice":1100,"days":26,"target":15000,"pharmacy":5000}');
let attArchive = JSON.parse(localStorage.getItem('att_archive') || '[]');
let currentMonthKey = localStorage.getItem('att_current_month') || (new Date().getFullYear()+'-'+(new Date().getMonth()+1));

function saveAtt(){
  localStorage.setItem('att_v2', JSON.stringify(attData));
  localStorage.setItem('salaryConfig', JSON.stringify(salaryConfig));
  localStorage.setItem('att_archive', JSON.stringify(attArchive));
  localStorage.setItem('att_current_month', currentMonthKey);
}
function getDays(y,m){ return new Date(y,m,0).getDate(); }
function calcH(i,o){ if(!i||!o) return 0; let [h1,m1]=i.split(':').map(Number), [h2,m2]=o.split(':').map(Number); let d=(h2*60+m2)-(h1*60+m1); if(d<0) d+=1440; return +(d/60).toFixed(1); }

// تحويل 7.3 -> 07:30 و 19.33 -> 19:33
function parseSmartTime(val){
  if(!val) return '';
  val = val.toString().trim().replace(',', '.');
  // لو كتب 7.3 أو 19.33
  if(val.includes('.')){
    let [h, mm] = val.split('.');
    h = parseInt(h)||0;
    mm = mm.padEnd(2,'0').slice(0,2); // 3 -> 30, 33 -> 33
    if(mm.length===1) mm = mm+'0';
    if(parseInt(mm)>59) mm='59';
    return `${String(h).padStart(2,'0')}:${mm}`;
  }
  // لو كتب 730 -> 07:30
  if(/^\d{3,4}$/.test(val)){
    if(val.length===3){ return `0${val[0]}:${val.slice(1)}`; }
    if(val.length===4){ return `${val.slice(0,2)}:${val.slice(2)}`; }
  }
  return val; // لو كتبها صح 07:30
}

function checkRollover(){
  let nowKey = new Date().getFullYear()+'-'+(new Date().getMonth()+1);
  if(currentMonthKey && currentMonthKey!==nowKey && attData.length>0){
    // أرشف الشهر القديم
    attArchive.push({month: currentMonthKey, data: attData, config: {...salaryConfig}, at: Date.now()});
    if(attArchive.length>3) attArchive = attArchive.slice(-3); // آخر 3 بس
    attData=[]; currentMonthKey=nowKey; saveAtt();
  }
}

function initMonth(){
  checkRollover();
  let now=new Date(), days=getDays(now.getFullYear(), now.getMonth()+1), map={};
  attData.forEach(r=>map[r.day]=r);
  let nd=[]; for(let d=1;d<=days;d++){ nd.push(map[d]||{day:d,in:'',out:'',total:0}); }
  attData=nd; currentMonthKey=now.getFullYear()+'-'+(now.getMonth()+1); saveAtt();
}

function renderAtt(){
  if(attData.length!==getDays(new Date().getFullYear(), new Date().getMonth()+1)) initMonth();
  let totalHours = attData.reduce((s,r)=>s+(r.total||0),0);
  let hp=salaryConfig.hourPrice||1100, days=salaryConfig.days||26, target=salaryConfig.target||15000, pharmacy=salaryConfig.pharmacy||5000;
  let pricePerHour=days? (hp/days).toFixed(2):0, net=(pricePerHour*totalHours).toFixed(0), dailyReq=hp? (target/hp).toFixed(2):0, remaining=net-pharmacy;

  let lastDayFilled = attData.length>0 && attData[attData.length-1].in && attData[attData.length-1].out;
  if(lastDayFilled && currentMonthKey === (new Date().getFullYear()+'-'+(new Date().getMonth()+1))){
    setTimeout(()=>{ if(confirm('خلصت الشهر! أقلب لشهر جديد وأأرشف ده؟')){ attArchive.push({month:currentMonthKey,data:attData,config:{...salaryConfig},at:Date.now()}); if(attArchive.length>3) attArchive=attArchive.slice(-3); attData=[]; initMonth(); renderAtt(); } }, 300);
  }

  document.getElementById('tab-att').innerHTML=`
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:6px">
    <div style="background:#fef9c3;padding:3px;text-align:center;font-size:9px;font-weight:800;display:flex;justify-content:space-between;padding:3px 6px">
      <span>💰 ${new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'})}</span><span style="font-size:7px;background:#fff;padding:1px 4px;border-radius:4px">أرشيف ${attArchive.length}/3</span>
    </div>
    <div style="zoom:0.68">
      <div style="display:grid;grid-template-columns:repeat(9,1fr);background:#f8fafc;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;font-size:8px;font-weight:800;text-align:center">
        <div style="padding:4px 0;border-left:1px solid #e5e7eb">الساعة</div><div style="padding:4px 0;border-left:1px solid #e5e7eb">كم يوم</div><div style="padding:4px 0;border-left:1px solid #e5e7eb">سعر الساعة</div><div style="padding:4px 0;border-left:1px solid #e5e7eb">عدد الساعات</div><div style="padding:4px 0;border-left:1px solid #e5e7eb">الصافي</div><div style="padding:4px 0;border-left:1px solid #e5e7eb">المطلوب</div><div style="padding:4px 0;border-left:1px solid #e5e7eb">مطلوب يوميا</div><div style="padding:4px 0;border-left:1px solid #e5e7eb">ديون صيدلية</div><div style="padding:4px 0;background:#fee2e2">المتبقي</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(9,1fr);font-size:11px;font-weight:800;text-align:center;font-family:monospace;align-items:center">
        <div style="padding:2px;border-left:1px solid #f1f5f9"><input type="number" value="${hp}" onchange="editConfig('hourPrice',this.value)" style="width:100%;border:1.5px solid #facc15;text-align:center;padding:5px 1px;border-radius:4px;background:#fefce8;font-size:11px"></div>
        <div style="padding:2px;border-left:1px solid #f1f5f9"><input type="number" value="${days}" onchange="editConfig('days',this.value)" style="width:100%;border:1.5px solid #facc15;text-align:center;padding:5px 1px;border-radius:4px;background:#fefce8;font-size:11px"></div>
        <div style="padding:7px 1px;border-left:1px solid #f1f5f9;background:#f0fdf4;color:#15803d">${pricePerHour}</div>
        <div style="padding:7px 1px;border-left:1px solid #f1f5f9">${totalHours.toFixed(1)}</div>
        <div style="padding:7px 1px;border-left:1px solid #f1f5f9;background:#ecfdf5">${net}</div>
        <div style="padding:2px;border-left:1px solid #f1f5f9"><input type="number" value="${target}" onchange="editConfig('target',this.value)" style="width:100%;border:1.5px solid #facc15;text-align:center;padding:5px 1px;border-radius:4px;background:#fefce8;font-size:11px"></div>
        <div style="padding:7px 1px;border-left:1px solid #f1f5f9;color:#b45309">${dailyReq}</div>
        <div style="padding:2px;border-left:1px solid #f1f5f9"><input type="number" value="${pharmacy}" onchange="editConfig('pharmacy',this.value)" style="width:100%;border:1.5px solid #fca5a5;text-align:center;padding:5px 1px;border-radius:4px;background:#fef2f2;font-size:11px;color:#dc2626"></div>
        <div style="padding:7px 1px;background:${remaining>=0?'#ecfdf5':'#fee2e2'};color:${remaining>=0?'#15803d':'#dc2626'}">${remaining}</div>
      </div>
    </div>
  </div>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
    <div style="padding:5px 8px;background:#f1f5f9;font-size:9px;display:flex;justify-content:space-between"><span>📅 الحضور - اكتب 7.3 = 07:30</span><span style="font-family:monospace">${totalHours.toFixed(1)}h</span></div>
    <div style="max-height:420px;overflow:auto">
      ${attData.map((r,i)=>`
        <div style="display:grid;grid-template-columns:20px 1fr 1fr 30px;gap:3px;padding:4px;border-bottom:1px solid #f8fafc;align-items:center">
          <div style="text-align:center;font-size:10px;font-weight:700">${r.day}</div>
          <div style="position:relative"><input id="in-${i}" type="text" inputmode="decimal" placeholder="7.3" value="${r.in? toDisplay(r.in):''}" onblur="smartInput(${i},'in',this.value)" onfocus="this.select()" style="width:100%;padding:5px 2px;border:1px solid #e2e8f0;border-radius:5px;font-size:11px;text-align:center;background:${r.in?'#f0fdf4':'#fff'};color:#000"><small style="position:absolute;left:2px;top:1px;font-size:6px;color:#16a34a">${r.in? toAmPm(r.in):''}</small></div>
          <div style="position:relative"><input id="out-${i}" type="text" inputmode="decimal" placeholder="19.3" value="${r.out? toDisplay(r.out):''}" onblur="smartInput(${i},'out',this.value)" onfocus="this.select()" style="width:100%;padding:5px 2px;border:1px solid #e2e8f0;border-radius:5px;font-size:11px;text-align:center;background:${r.out?'#fef2f2':'#fff'};color:#000"><small style="position:absolute;left:2px;top:1px;font-size:6px;color:#dc2626">${r.out? toAmPm(r.out):''}</small></div>
          <div style="text-align:center;font-size:9px;font-weight:700;color:${r.total?'#16a34a':'#ccc'};font-family:monospace" onclick="fillNow(${i})">${r.total||'NOW'}</div>
        </div>
      `).join('')}
    </div>
  </div>
  `;
}

function toDisplay(t){ if(!t) return ''; let [h,m]=t.split(':').map(Number); return `${h}.${String(m).padStart(2,'0')}`; }
function toAmPm(t){ if(!t) return ''; let [h,m]=t.split(':').map(Number); let ap=h>=12?'م':'ص'; let h12=h%12||12; return `${h12}:${String(m).padStart(2,'0')} ${ap}`; }

function smartInput(i,field,val){
  if(!val){ attData[i][field]=''; attData[i].total=calcH(attData[i].in,attData[i].out); saveAtt(); renderAtt(); return; }
  let parsed = parseSmartTime(val);
  // تأكد إنه وقت صحيح
  let [h,m]=parsed.split(':').map(Number);
  if(isNaN(h)||isNaN(m)||h>23||m>59){ alert('اكتب زي 7.3 أو 19.33'); return; }
  attData[i][field]=parsed;
  attData[i].total=calcH(attData[i].in,attData[i].out);
  saveAtt(); renderAtt();
}
function fillNow(i){
  let now=new Date(), t=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  if(!attData[i].in) attData[i].in=t; else if(!attData[i].out) attData[i].out=t; else attData[i].out=t;
  attData[i].total=calcH(attData[i].in,attData[i].out); saveAtt(); renderAtt();
}
function editConfig(k,v){ salaryConfig[k]=parseFloat(v)||0; saveAtt(); renderAtt(); }

if(attData.length===0) initMonth();

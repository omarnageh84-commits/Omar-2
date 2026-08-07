// js/attendance.js - محدث مربوط بالشيت + ديون يدوي فقط + 7.3 = 7:30
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

function parseSmartTime(val){
  if(!val) return '';
  val = val.toString().trim().replace(',', '.');
  if(val.includes('.')){
    let [h, mm] = val.split('.');
    h = parseInt(h)||0;
    mm = mm.padEnd(2,'0').slice(0,2);
    if(mm.length===1) mm = mm+'0';
    if(parseInt(mm)>59) mm='59';
    return `${String(h).padStart(2,'0')}:${mm}`;
  }
  if(/^\d{3,4}$/.test(val)){
    if(val.length===3){ return `0${val[0]}:${val.slice(1)}`; }
    if(val.length===4){ return `${val.slice(0,2)}:${val.slice(2)}`; }
  }
  return val;
}

function checkRollover(){
  let nowKey = new Date().getFullYear()+'-'+(new Date().getMonth()+1);
  if(currentMonthKey && currentMonthKey!==nowKey && attData.length>0){
    attArchive.push({month: currentMonthKey, data: attData, config: {...salaryConfig}, at: Date.now()});
    if(attArchive.length>3) attArchive = attArchive.slice(-3);
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
  let hp=salaryConfig.hourPrice||1100, days=salaryConfig.days||26, target=salaryConfig.target||15000, pharmacy=salaryConfig.pharmacy||0;
  let pricePerHour=days? (hp/days).toFixed(2):0, net=(pricePerHour*totalHours).toFixed(0), dailyReq=hp? (target/hp).toFixed(2):0, remaining=net-pharmacy;

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
        <div style="padding:2px;border-left:1px solid #f1f5f9"><input type="number" inputmode="numeric" value="${pharmacy}" onchange="editConfig('pharmacy',this.value)" placeholder="5000" style="width:100%;border:2px solid #ef4444;text-align:center;padding:6px 1px;border-radius:5px;background:#fff1f2;font-size:12px;color:#dc2626;font-weight:900"></div>
        <div style="padding:7px 1px;background:${remaining>=0?'#ecfdf5':'#fee2e2'};color:${remaining>=0?'#15803d':'#dc2626'}">${remaining}</div>
      </div>
    </div>
  </div>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
    <div style="display:grid;grid-template-columns:32px 1fr 1fr 60px;gap:1px;background:#f1f5f9;padding:4px;font-size:8px;font-weight:800;text-align:center">
      <div>يوم</div><div>دخول (7.3=7:30)</div><div>خروج</div><div>ساعات</div>
    </div>
    <div style="max-height:340px;overflow:auto">
      ${attData.map(r=>`
        <div style="display:grid;grid-template-columns:32px 1fr 1fr 60px;gap:1px;padding:2px 4px;border-bottom:1px solid #f1f5f9;align-items:center;background:${r.total? '#f0fdf4':'#fff'}">
          <div style="font-size:10px;font-weight:800;text-align:center">${r.day}</div>
          <input value="${r.in}" id="in${r.day}" onchange="updateAtt(${r.day},'in',this.value)" placeholder="07:00" style="border:1px solid #e2e8f0;border-radius:6px;padding:5px 4px;font-size:11px;text-align:center;font-family:monospace;background:#fff;color:#000">
          <input value="${r.out}" id="out${r.day}" onchange="updateAtt(${r.day},'out',this.value)" placeholder="16:00" style="border:1px solid #e2e8f0;border-radius:6px;padding:5px 4px;font-size:11px;text-align:center;font-family:monospace;background:#fff;color:#000">
          <div style="font-size:10px;font-weight:800;text-align:center;font-family:monospace;color:${r.total?'#15803d':'#94a3b8'}">${r.total? r.total.toFixed(1):'-'}</div>
        </div>
      `).join('')}
    </div>
  </div>
  `;
}

function editConfig(k,v){ salaryConfig[k]=parseFloat(v)||0; saveAtt(); renderAtt(); if(typeof renderDashboard==='function') renderDashboard(); }
function updateAtt(day, type, val){
  let parsed = parseSmartTime(val);
  let r=attData.find(x=>x.day===day); if(!r) return;
  r[type]=parsed;
  r.total=calcH(r.in, r.out);
  saveAtt(); renderAtt();
  if(r.in && r.out && window.ارسل_حضور){
    ارسل_حضور(r.in, r.out, r.total);
  }
  if(typeof renderDashboard==='function') renderDashboard();
}

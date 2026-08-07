// js/attendance.js - نسخة خفيفة وسهلة

let attData = JSON.parse(localStorage.getItem('att_v2') || '[]');
let salaryConfig = JSON.parse(localStorage.getItem('salaryConfig') || '{"hourPrice":1100,"days":26,"target":8000}');

function saveAtt(){ localStorage.setItem('att_v2', JSON.stringify(attData)); localStorage.setItem('salaryConfig', JSON.stringify(salaryConfig)); }
function getDays(){ return new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate(); }
function calcH(i,o){ if(!i||!o) return 0; let [h1,m1]=i.split(':').map(Number), [h2,m2]=o.split(':').map(Number); let d=(h2*60+m2)-(h1*60+m1); if(d<0) d+=1440; return +(d/60).toFixed(1); }
function initMonth(){ let days=getDays(), now=new Date(), map={}; attData.forEach(r=>map[r.day]=r); let nd=[]; for(let d=1;d<=days;d++){ nd.push(map[d]||{day:d,dateStr:d+'/'+(now.getMonth()+1),in:'',out:'',total:0,note:''}); } attData=nd; saveAtt(); }

function renderAtt(){
  if(attData.length!==getDays()) initMonth();
  let totalHours = attData.reduce((s,r)=>s+(r.total||0),0);
  let debts = JSON.parse(localStorage.getItem('debts_v2')||'[]');
  let pharmacy = debts.filter(d=>d.type==='عليّ').reduce((s,x)=>s+x.remaining,0);

  let hp = salaryConfig.hourPrice||1100;
  let days = salaryConfig.days||26;
  let target = salaryConfig.target||8000;
  let pricePerHour = days? +(hp/days).toFixed(2) : 0; // 42.31
  let net = +(pricePerHour*totalHours).toFixed(0);
  let dailyReq = hp? +(target/hp).toFixed(2) : 0; // 7.27

  document.getElementById('tab-att').innerHTML=`
  <!-- فوق: 3 خانات قابلة للتحرير فقط -->
  <div style="background:#fffbef;border:1px solid #fde68a;border-radius:12px;padding:8px;margin-bottom:8px">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
      <div><small style="font-size:10px">الساعة (الشهر)</small><input type="number" value="${hp}" oninput="updateSalary('hourPrice',this.value)" style="width:100%;padding:6px;border-radius:8px;border:1px solid #e5e7eb;font-size:12px"></div>
      <div><small style="font-size:10px">كم يوم (26)</small><input type="number" value="${days}" oninput="updateSalary('days',this.value)" style="width:100%;padding:6px;border-radius:8px;border:1px solid #e5e7eb;font-size:12px"></div>
      <div><small style="font-size:10px">المطلوب (هدفك)</small><input type="number" value="${target}" oninput="updateSalary('target',this.value)" style="width:100%;padding:6px;border-radius:8px;border:1px solid #e5e7eb;font-size:12px"></div>
    </div>
  </div>

  <!-- الجدول الثابت - داخل الصفحة كامل بدون سكرول أفقي -->
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:10px">
    <div style="display:grid;grid-template-columns:repeat(9,1fr);background:#f8fafc;font-size:9px;font-weight:700;text-align:center;border-bottom:1px solid #e5e7eb">
      <div style="padding:5px;border-left:1px solid #e5e7eb">الساعة</div>
      <div style="padding:5px;border-left:1px solid #e5e7eb">كم يوم</div>
      <div style="padding:5px;border-left:1px solid #e5e7eb">سعر الساعة</div>
      <div style="padding:5px;border-left:1px solid #e5e7eb">عدد الساعات</div>
      <div style="padding:5px;border-left:1px solid #e5e7eb">الصافي</div>
      <div style="padding:5px;border-left:1px solid #e5e7eb">المطلوب</div>
      <div style="padding:5px;border-left:1px solid #e5e7eb">مطلوب يوميا</div>
      <div style="padding:5px;border-left:1px solid #e5e7eb">ديون للصيدلية</div>
      <div style="padding:5px;background:#fee2e2">المتبقي</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(9,1fr);font-size:11px;font-weight:700;text-align:center">
      <div style="padding:7px;border-left:1px solid #f1f5f9">${hp}</div>
      <div style="padding:7px;border-left:1px solid #f1f5f9">${days}</div>
      <div style="padding:7px;border-left:1px solid #f1f5f9;color:#059669">${pricePerHour}</div>
      <div style="padding:7px;border-left:1px solid #f1f5f9">${totalHours.toFixed(1)}</div>
      <div style="padding:7px;border-left:1px solid #f1f5f9;background:#ecfdf5">${net}</div>
      <div style="padding:7px;border-left:1px solid #f1f5f9">${target}</div>
      <div style="padding:7px;border-left:1px solid #f1f5f9;color:#d97706">${dailyReq}</div>
      <div style="padding:7px;border-left:1px solid #f1f5f9;color:#dc2626">${pharmacy}</div>
      <div style="padding:7px;background:${(net-pharmacy)>=0?'#ecfdf5':'#fee2e2'};color:${(net-pharmacy)>=0?'#059669':'#dc2626'}">${net-pharmacy}</div>
    </div>
  </div>

  <!-- حضور وانصراف أسهل -->
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="padding:8px;background:#f8fafc;font-size:12px;font-weight:700;display:flex;justify-content:space-between"><span>📅 الحضور - ${getDays()} يوم</span><span>${totalHours.toFixed(1)}س</span></div>
    ${attData.map((r,i)=>`
      <div style="display:grid;grid-template-columns:32px 1fr 1fr 50px;gap:4px;padding:6px;border-bottom:1px solid #f8fafc;align-items:center;background:${r.total?'#fff':'#fcfcfc'}">
        <div style="text-align:center"><b style="font-size:12px">${r.day}</b><br><small style="font-size:9px;color:#94a3b8">${r.dateStr}</small></div>
        <div style="display:flex;gap:2px"><input type="time" value="${r.in}" onchange="updateAtt(${i},'in',this.value)" style="flex:1;padding:5px;border-radius:6px;border:1px solid #e5e7eb;font-size:11px"><button onclick="nowIn(${i})" style="border:0;background:#ecfdf5;border-radius:6px;padding:3px;font-size:10px">الآن</button></div>
        <div style="display:flex;gap:2px"><input type="time" value="${r.out}" onchange="updateAtt(${i},'out',this.value)" style="flex:1;padding:5px;border-radius:6px;border:1px solid #e5e7eb;font-size:11px"><button onclick="nowOut(${i})" style="border:0;background:#fef2f2;border-radius:6px;padding:3px;font-size:10px">الآن</button></div>
        <div style="text-align:center"><b style="font-size:11px;color:${r.total?'#059669':'#cbd5e1'}">${r.total?r.total+'س':''}</b></div>
      </div>
    `).join('')}
  </div>
  `;
}

function updateAtt(i,f,v){ attData[i][f]=v; if(f==='in'||f==='out') attData[i].total=calcH(attData[i].in,attData[i].out); saveAtt(); renderAtt(); }
function updateSalary(k,v){ salaryConfig[k]=parseFloat(v)||0; saveAtt(); renderAtt(); }
function nowIn(i){ let t=new Date().toTimeString().slice(0,5); attData[i].in=t; attData[i].total=calcH(t,attData[i].out); saveAtt(); renderAtt(); }
function nowOut(i){ let t=new Date().toTimeString().slice(0,5); attData[i].out=t; attData[i].total=calcH(attData[i].in,t); saveAtt(); renderAtt(); }

if(attData.length===0) initMonth();

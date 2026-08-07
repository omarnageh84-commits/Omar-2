// js/attendance.js - مصغر جدا 68% عشان يظهر كامل

let attData = JSON.parse(localStorage.getItem('att_v2') || '[]');
let salaryConfig = JSON.parse(localStorage.getItem('salaryConfig') || '{"hourPrice":1100,"days":26,"target":15000,"pharmacy":5000}');

function saveAtt(){ localStorage.setItem('att_v2', JSON.stringify(attData)); localStorage.setItem('salaryConfig', JSON.stringify(salaryConfig)); }
function getDays(){ return new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate(); }
function calcH(i,o){ if(!i||!o) return 0; let [h1,m1]=i.split(':').map(Number), [h2,m2]=o.split(':').map(Number); let d=(h2*60+m2)-(h1*60+m1); if(d<0) d+=1440; return +(d/60).toFixed(1); }
function initMonth(){ let days=getDays(), map={}; attData.forEach(r=>map[r.day]=r); let nd=[]; for(let d=1;d<=days;d++){ nd.push(map[d]||{day:d,in:'',out:'',total:0}); } attData=nd; saveAtt(); }

function renderAtt(){
  if(attData.length!==getDays()) initMonth();
  let totalHours = attData.reduce((s,r)=>s+(r.total||0),0);
  let hp = salaryConfig.hourPrice||1100;
  let days = salaryConfig.days||26;
  let target = salaryConfig.target||15000;
  let pharmacy = salaryConfig.pharmacy||5000;

  let pricePerHour = days? (hp/days).toFixed(2) : 0;
  let net = (pricePerHour*totalHours).toFixed(0);
  let dailyReq = hp? (target/hp).toFixed(2) : 0;
  let remaining = net - pharmacy;

  document.getElementById('tab-att').innerHTML=`
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:6px">
    <div style="background:#fef9c3;padding:3px;text-align:center;font-size:9px;font-weight:800">💰 ملخص - Aug 2026</div>

    <div style="zoom:0.68">
      <div style="display:grid;grid-template-columns:repeat(9,1fr);background:#f8fafc;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;font-size:9px;font-weight:800;text-align:center">
        <div style="padding:4px 0;border-left:1px solid #e5e7eb">الساعة</div>
        <div style="padding:4px 0;border-left:1px solid #e5e7eb">كم يوم</div>
        <div style="padding:4px 0;border-left:1px solid #e5e7eb">سعر الساعة</div>
        <div style="padding:4px 0;border-left:1px solid #e5e7eb">عدد الساعات</div>
        <div style="padding:4px 0;border-left:1px solid #e5e7eb">الصافي</div>
        <div style="padding:4px 0;border-left:1px solid #e5e7eb">المطلوب</div>
        <div style="padding:4px 0;border-left:1px solid #e5e7eb">مطلوب يوميا</div>
        <div style="padding:4px 0;border-left:1px solid #e5e7eb">ديون صيدلية</div>
        <div style="padding:4px 0;background:#fee2e2">المتبقي</div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(9,1fr);font-size:12px;font-weight:800;text-align:center;font-family:monospace;align-items:center">
        <div style="padding:2px;border-left:1px solid #f1f5f9"><input type="number" value="${hp}" onchange="editConfig('hourPrice',this.value)" style="width:100%;border:1.5px solid #facc15;text-align:center;padding:6px 1px;border-radius:5px;background:#fefce8;font-weight:800;font-size:12px;color:#000"></div>
        <div style="padding:2px;border-left:1px solid #f1f5f9"><input type="number" value="${days}" onchange="editConfig('days',this.value)" style="width:100%;border:1.5px solid #facc15;text-align:center;padding:6px 1px;border-radius:5px;background:#fefce8;font-weight:800;font-size:12px;color:#000"></div>
        <div style="padding:8px 1px;border-left:1px solid #f1f5f9;background:#f0fdf4;color:#15803d">${pricePerHour}</div>
        <div style="padding:8px 1px;border-left:1px solid #f1f5f9">${totalHours.toFixed(1)}</div>
        <div style="padding:8px 1px;border-left:1px solid #f1f5f9;background:#ecfdf5">${net}</div>
        <div style="padding:2px;border-left:1px solid #f1f5f9"><input type="number" value="${target}" onchange="editConfig('target',this.value)" style="width:100%;border:1.5px solid #facc15;text-align:center;padding:6px 1px;border-radius:5px;background:#fefce8;font-weight:800;font-size:12px;color:#000"></div>
        <div style="padding:8px 1px;border-left:1px solid #f1f5f9;color:#b45309">${dailyReq}</div>
        <div style="padding:2px;border-left:1px solid #f1f5f9"><input type="number" value="${pharmacy}" onchange="editConfig('pharmacy',this.value)" style="width:100%;border:1.5px solid #fca5a5;text-align:center;padding:6px 1px;border-radius:5px;background:#fef2f2;font-weight:800;font-size:12px;color:#dc2626"></div>
        <div style="padding:8px 1px;background:${remaining>=0?'#ecfdf5':'#fee2e2'};color:${remaining>=0?'#15803d':'#dc2626'}">${remaining}</div>
      </div>
    </div>
  </div>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
    <div style="padding:4px 8px;background:#f8fafc;font-size:10px;font-weight:700;display:flex;justify-content:space-between"><span>📅 الحضور - 31 يوم</span><span style="font-family:monospace">${totalHours.toFixed(1)}h</span></div>
    <div style="max-height:420px;overflow:auto">
      ${attData.map((r,i)=>`
        <div style="display:grid;grid-template-columns:20px 1fr 1fr 32px;gap:2px;padding:3px;border-bottom:1px solid #f8fafc;align-items:center">
          <div style="text-align:center;font-size:10px;font-weight:700">${r.day}</div>
          <input type="time" value="${r.in}" onchange="updateAtt(${i},'in',this.value)" style="padding:3px;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;background:#fff;color:#000">
          <input type="time" value="${r.out}" onchange="updateAtt(${i},'out',this.value)" style="padding:3px;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;background:#fff;color:#000">
          <div style="text-align:center;font-size:9px;font-weight:700;color:${r.total?'#16a34a':'#ccc'};font-family:monospace">${r.total||''}</div>
        </div>
      `).join('')}
    </div>
  </div>
  `;
}

function updateAtt(i,f,v){ attData[i][f]=v; if(f==='in'||f==='out') attData[i].total=calcH(attData[i].in,attData[i].out); saveAtt(); renderAtt(); }
function editConfig(k,v){ salaryConfig[k]=parseFloat(v)||0; saveAtt(); renderAtt(); }

if(attData.length===0) initMonth();

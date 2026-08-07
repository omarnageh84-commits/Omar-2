// js/attendance.js - نسخة مصححة - الجدول فوق وصغير

let attData = JSON.parse(localStorage.getItem('att_v2') || '[]');
let salaryConfig = JSON.parse(localStorage.getItem('salaryConfig') || '{"hourPrice": 1100, "days": 26, "target": 15000}');

function saveAtt(){
  localStorage.setItem('att_v2', JSON.stringify(attData));
  localStorage.setItem('salaryConfig', JSON.stringify(salaryConfig));
}
function getDaysInMonth(){ return new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate(); }
function calcHours(i,o){ if(!i||!o) return 0; let [h1,m1]=i.split(':').map(Number); let [h2,m2]=o.split(':').map(Number); let d=(h2*60+m2)-(h1*60+m1); if(d<0) d+=1440; return +(d/60).toFixed(2); }
function initMonth(){
  let days=getDaysInMonth(), now=new Date(), map={}; attData.forEach(r=>map[r.day]=r); let nd=[];
  for(let d=1;d<=days;d++){ if(map[d]) nd.push(map[d]); else nd.push({day:d,dateStr:new Date(now.getFullYear(),now.getMonth(),d).toLocaleDateString('ar-EG'),in:'',out:'',total:0,note:''}); }
  attData=nd; saveAtt();
}

function renderAtt(){
  if(attData.length!==getDaysInMonth()) initMonth();
  let totalHours = attData.reduce((s,r)=>s+(r.total||0),0);
  let debts = JSON.parse(localStorage.getItem('debts_v2')||'[]');
  let pharmacyDebts = debts.filter(d=>d.type==='عليّ').reduce((s,x)=>s+x.remaining,0);

  let hourPrice = salaryConfig.hourPrice||1100;
  let days = salaryConfig.days||26;
  let target = salaryConfig.target||15000;

  let pricePerHour = days>0? +(hourPrice/days).toFixed(2) : 0; // 1100/26=42
  let net = +(pricePerHour * totalHours).toFixed(0); // 42*50=2115
  let dailyReq = hourPrice>0? +(target/hourPrice).toFixed(2) : 0; // 15000/1100=13.64
  let remaining = net - pharmacyDebts; // -2035

  document.getElementById('tab-att').innerHTML=`
  <!-- الجدول الملخص فوق - صغير -->
  <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:10px;transform:scale(0.92);transform-origin:top center">
    <div style="background:#fef3c7;padding:6px 10px;font-size:13px;font-weight:700;display:flex;justify-content:space-between">
      <span>💰 ملخص المرتب</span><span style="font-size:11px;color:#92400e">${new Date().toLocaleDateString('ar-EG',{month:'long'})}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;padding:6px;gap:6px;background:#fffbeb">
      <div><small style="font-size:10px">الساعة (الشهر)</small><input type="number" value="${hourPrice}" onchange="updateSalary('hourPrice',this.value)" style="width:100%;padding:5px;border-radius:6px;border:1px solid #e5e7eb;font-size:12px"></div>
      <div><small style="font-size:10px">كم يوم (26)</small><input type="number" value="${days}" onchange="updateSalary('days',this.value)" style="width:100%;padding:5px;border-radius:6px;border:1px solid #e5e7eb;font-size:12px"></div>
      <div><small style="font-size:10px">المطلوب (هدفك)</small><input type="number" value="${target}" onchange="updateSalary('target',this.value)" style="width:100%;padding:5px;border-radius:6px;border:1px solid #e5e7eb;font-size:12px"></div>
    </div>
    <div style="overflow:auto">
      <table style="width:100%;border-collapse:collapse;font-size:11px;text-align:center">
        <tr style="background:#f8fafc;color:#475569"><th style="padding:5px;border:1px solid #e5e7eb">الساعة</th><th style="padding:5px;border:1px solid #e5e7eb">كم يوم</th><th style="padding:5px;border:1px solid #e5e7eb">سعر الساعة</th><th style="padding:5px;border:1px solid #e5e7eb">عدد الساعات</th><th style="padding:5px;border:1px solid #e5e7eb">الصافي</th><th style="padding:5px;border:1px solid #e5e7eb">المطلوب</th><th style="padding:5px;border:1px solid #e5e7eb">مطلوب يوميا</th><th style="padding:5px;border:1px solid #e5e7eb">ديون للصيدلية</th><th style="padding:5px;border:1px solid #e5e7eb;background:#fee2e2">المتبقي</th></tr>
        <tr style="font-weight:700;background:#fff">
          <td style="padding:6px;border:1px solid #e5e7eb">${hourPrice}</td>
          <td style="padding:6px;border:1px solid #e5e7eb">${days}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;color:#059669">${pricePerHour}</td>
          <td style="padding:6px;border:1px solid #e5e7eb">${totalHours.toFixed(1)}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;background:#ecfdf5">${net}</td>
          <td style="padding:6px;border:1px solid #e5e7eb">${target}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;color:#d97706">${dailyReq}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;color:#dc2626">${pharmacyDebts}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;background:${remaining>=0?'#ecfdf5':'#fee2e2'};color:${remaining>=0?'#059669':'#dc2626'}">${remaining}</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- جدول الحضور تحت -->
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="padding:8px 10px;background:#f8fafc;font-weight:700;font-size:12px;display:flex;justify-content:space-between"><span>📅 الحضور - ${getDaysInMonth()} يوم</span><small>إجمالي: ${totalHours.toFixed(1)}س</small></div>
    <div style="overflow:auto;max-height:420px">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead style="position:sticky;top:0;background:#f1f5f9"><tr><th style="padding:6px;border-bottom:1px solid #e5e7eb;text-align:right">اليوم</th><th style="padding:6px;border-bottom:1px solid #e5e7eb">حضور</th><th style="padding:6px;border-bottom:1px solid #e5e7eb">انصراف</th><th style="padding:6px;border-bottom:1px solid #e5e7eb">الإجمالي</th><th style="padding:6px;border-bottom:1px solid #e5e7eb">ملاحظة</th></tr></thead>
        <tbody>
          ${attData.map((r,i)=>`<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:5px"><b>${r.day}</b></td><td style="padding:3px"><input type="time" value="${r.in}" onchange="updateAtt(${i},'in',this.value)" style="width:75px;border:1px solid #e5e7eb;border-radius:5px;padding:3px;font-size:11px"></td><td style="padding:3px"><input type="time" value="${r.out}" onchange="updateAtt(${i},'out',this.value)" style="width:75px;border:1px solid #e5e7eb;border-radius:5px;padding:3px;font-size:11px"></td><td style="padding:5px;text-align:center"><b style="font-size:11px;color:${r.total>0?'#059669':'#cbd5e1'}">${r.total?r.total:''}</b></td><td style="padding:3px"><input type="text" value="${r.note}" placeholder="..." onchange="updateAtt(${i},'note',this.value)" style="width:55px;border:1px solid #e5e7eb;border-radius:5px;padding:3px;font-size:10px"></td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function updateAtt(i,f,v){ attData[i][f]=v; if(f==='in'||f==='out'){ attData[i].total=calcHours(attData[i].in,attData[i].out); } saveAtt(); if(f==='in'||f==='out') renderAtt(); else localStorage.setItem('att_v2',JSON.stringify(attData)); }
function updateSalary(k,v){ salaryConfig[k]=parseFloat(v)||0; saveAtt(); renderAtt(); }
if(attData.length===0) initMonth();

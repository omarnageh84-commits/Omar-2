// js/attendance.js - نظام حضور احترافي للصيدلية

let attData = JSON.parse(localStorage.getItem('att_v2') || '[]');
let salaryConfig = JSON.parse(localStorage.getItem('salaryConfig') || '{"monthly": 6000, "days": 26, "target": 8000, "workHours": 8}');

function saveAtt(){
  localStorage.setItem('att_v2', JSON.stringify(attData));
  localStorage.setItem('salaryConfig', JSON.stringify(salaryConfig));
  if(typeof renderHome === 'function') renderHome();
}

function getDaysInMonth(){
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
}

function calcHours(inTime, outTime){
  if(!inTime ||!outTime) return 0;
  let [h1,m1] = inTime.split(':').map(Number);
  let [h2,m2] = outTime.split(':').map(Number);
  let diff = (h2*60+m2) - (h1*60+m1);
  if(diff < 0) diff += 24*60; // شيفت ليلي
  return +(diff/60).toFixed(2);
}

function initMonth(){
  let days = getDaysInMonth();
  let now = new Date();
  let existing = {};
  attData.forEach(r=>existing[r.day]=r);
  let newData = [];
  for(let d=1; d<=days; d++){
    if(existing[d]) newData.push(existing[d]);
    else {
      let date = new Date(now.getFullYear(), now.getMonth(), d);
      newData.push({day:d, dateStr: date.toLocaleDateString('ar-EG'), in:'', out:'', total:0, note:''});
    }
  }
  attData = newData;
  saveAtt();
}

function renderAtt(){
  if(attData.length===0 || attData.length!== getDaysInMonth()) initMonth();

  let totalHours = attData.reduce((s,r)=>s+(r.total||0),0);
  let pharmacyDebts = 0;
  try{
    let debts = JSON.parse(localStorage.getItem('debts_v2')||'[]');
    pharmacyDebts = debts.filter(d=>d.type==='عليّ').reduce((s,x)=>s+x.remaining,0);
  }catch(e){}

  let monthly = salaryConfig.monthly || 0;
  let days = salaryConfig.days || 26;
  let workHours = salaryConfig.workHours || 8;
  let target = salaryConfig.target || 0;

  let hourlyRate = days>0 && workHours>0? +(monthly / days / workHours).toFixed(2) : 0;
  let net = +(hourlyRate * totalHours).toFixed(2);
  let dailyRequired = days>0? +(target / days).toFixed(2) : 0;
  let remaining = +(net - pharmacyDebts).toFixed(2);

  document.getElementById('tab-att').innerHTML=`
  <div style="background:#0f172a;color:#fff;padding:12px;border-radius:14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
    <div><b>📅 ${new Date().toLocaleDateString('ar-EG',{month:'long',year:'numeric'})}</b><br><small>الشهر ${getDaysInMonth()} يوم - عمل ${days} يوم</small></div>
    <button class="btn-small" style="background:#fff;color:#0f172a" onclick="exportAtt()">📤 تصدير</button>
  </div>

  <!-- الجدول الأول: الحضور اليومي -->
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:16px">
    <div style="padding:10px;background:#f8fafc;font-weight:700;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between"><span>جدول الحضور والانصراف</span><small style="color:#64748b">إجمالي الساعات: ${totalHours.toFixed(2)} س</small></div>
    <div style="overflow:auto;max-height:400px">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead style="position:sticky;top:0;background:#f1f5f9;z-index:1"><tr><th style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">التاريخ</th><th style="padding:8px;border-bottom:1px solid #e2e8f0">حضور</th><th style="padding:8px;border-bottom:1px solid #e2e8f0">انصراف</th><th style="padding:8px;border-bottom:1px solid #e2e8f0">الإجمالي</th><th style="padding:8px;border-bottom:1px solid #e2e8f0">ملاحظات</th></tr></thead>
        <tbody>
          ${attData.map((r,i)=>`
            <tr style="border-bottom:1px solid #f1f5f9;background:${r.total>0?'#fff':'#fafafa'}">
              <td style="padding:6px"><b>${r.day}</b><br><small style="font-size:10px;color:#94a3b8">${r.dateStr.split(' ')[0]}</small></td>
              <td style="padding:4px"><input type="time" value="${r.in}" onchange="updateAtt(${i},'in',this.value)" style="width:85px;border:1px solid #e2e8f0;border-radius:6px;padding:4px"></td>
              <td style="padding:4px"><input type="time" value="${r.out}" onchange="updateAtt(${i},'out',this.value)" style="width:85px;border:1px solid #e2e8f0;border-radius:6px;padding:4px"></td>
              <td style="padding:6px;text-align:center"><b style="color:${r.total>0?'#059669':'#94a3b8'}">${r.total? r.total+'س' : '-'}</b></td>
              <td style="padding:4px"><input type="text" value="${r.note}" placeholder="..." onchange="updateAtt(${i},'note',this.value)" style="width:70px;border:1px solid #e2e8f0;border-radius:6px;padding:4px;font-size:11px"></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- الجدول الثاني: الحسابات -->
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
    <div style="padding:10px;background:#fef3c7;font-weight:700;border-bottom:1px solid #fde68a">💰 ملخص المرتب والحسابات</div>
    <div style="padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#fffbeb">
      <div><small>الراتب الشهري (الساعة / الشهر)</small><input type="number" value="${monthly}" onchange="updateSalary('monthly',this.value)" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e2e8f0"></div>
      <div><small>كم يوم (ثابت 26)</small><input type="number" value="${days}" onchange="updateSalary('days',this.value)" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e2e8f0"></div>
      <div><small>ساعات العمل يوميا</small><input type="number" value="${workHours}" onchange="updateSalary('workHours',this.value)" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e2e8f0"></div>
      <div><small>المطلوب (هدفك)</small><input type="number" value="${target}" onchange="updateSalary('target',this.value)" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e2e8f0"></div>
    </div>
    <div style="overflow:auto">
      <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:center">
        <thead><tr style="background:#f8fafc">
          <th style="padding:8px;border:1px solid #e2e8f0">الراتب</th><th style="padding:8px;border:1px solid #e2e8f0">كم يوم</th><th style="padding:8px;border:1px solid #e2e8f0">سعر الساعة</th><th style="padding:8px;border:1px solid #e2e8f0">عدد الساعات</th><th style="padding:8px;border:1px solid #e2e8f0">الصافي</th><th style="padding:8px;border:1px solid #e2e8f0">المطلوب</th><th style="padding:8px;border:1px solid #e2e8f0">مطلوب يوميا</th><th style="padding:8px;border:1px solid #e2e8f0">ديون صيدلية</th><th style="padding:8px;border:1px solid #e2e8f0;background:#fef2f2">المتبقي</th>
        </tr></thead>
        <tbody>
          <tr style="font-weight:700;background:#fff">
            <td style="padding:10px;border:1px solid #e2e8f0">${monthly} ج.م</td>
            <td style="padding:10px;border:1px solid #e2e8f0">${days}</td>
            <td style="padding:10px;border:1px solid #e2e8f0;color:#059669">${hourlyRate} ج.م</td>
            <td style="padding:10px;border:1px solid #e2e8f0">${totalHours.toFixed(1)} س</td>
            <td style="padding:10px;border:1px solid #e2e8f0;background:#ecfdf5">${net} ج.م</td>
            <td style="padding:10px;border:1px solid #e2e8f0">${target} ج.م</td>
            <td style="padding:10px;border:1px solid #e2e8f0">${dailyRequired} ج.م</td>
            <td style="padding:10px;border:1px solid #e2e8f0;color:#dc2626">${pharmacyDebts} ج.م<br><small style="font-size:9px">من الديون</small></td>
            <td style="padding:10px;border:1px solid #e2e8f0;background:#fef2f2;color:${remaining>=0?'#059669':'#dc2626'};font-size:14px">${remaining} ج.م</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="padding:10px;font-size:11px;color:#64748b;line-height:1.6;background:#f8fafc">
      • سعر الساعة = الراتب ÷ كم يوم ÷ ساعات العمل<br>
      • عدد الساعات = مجموع ساعات الجدول الأول<br>
      • الصافي = سعر الساعة × عدد الساعات<br>
      • مطلوب يوميا = المطلوب ÷ كم يوم<br>
      • المتبقي = الصافي - ديون الصيدلية (من صفحة الديون)
    </div>
  </div>
  `;
}

function updateAtt(i, field, val){
  attData[i][field]=val;
  if(field==='in' || field==='out'){
    attData[i].total = calcHours(attData[i].in, attData[i].out);
  }
  saveAtt();
  // تحديث بدون إعادة رسم كامل عشان ما يفقدش الفوكس
  if(field==='in' || field==='out'){
    let totalHours = attData.reduce((s,r)=>s+(r.total||0),0);
    // هنعيد رسم الجدول التاني بس
    renderAtt();
  } else {
    localStorage.setItem('att_v2', JSON.stringify(attData));
  }
}

function updateSalary(key, val){
  salaryConfig[key]=parseFloat(val)||0;
  saveAtt();
  renderAtt();
}

function exportAtt(){
  let csv = "اليوم,التاريخ,حضور,انصراف,إجمالي,ملاحظات\n" + attData.map(r=>`${r.day},${r.dateStr},${r.in},${r.out},${r.total},${r.note}`).join('\n');
  let blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  let a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`حضور-${new Date().getMonth()+1}.csv`; a.click();
}

// تشغيل أول مرة
if(attData.length===0) initMonth();

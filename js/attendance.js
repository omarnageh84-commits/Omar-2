// js/attendance.js - الجدول بس - كله قابل للتعديل جوه الجدول

let attData = JSON.parse(localStorage.getItem('att_v2') || '[]');
let salaryConfig = JSON.parse(localStorage.getItem('salaryConfig') || '{"hourPrice":1100,"days":26,"target":15000,"pharmacy":5000}');

function saveAtt(){ localStorage.setItem('att_v2', JSON.stringify(attData)); localStorage.setItem('salaryConfig', JSON.stringify(salaryConfig)); }
function getDays(){ return new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate(); }
function calcH(i,o){ if(!i||!o) return 0; let [h1,m1]=i.split(':').map(Number), [h2,m2]=o.split(':').map(Number); let d=(h2*60+m2)-(h1*60+m1); if(d<0) d+=1440; return +(d/60).toFixed(1); }
function initMonth(){ let days=getDays(), now=new Date(), map={}; attData.forEach(r=>map[r.day]=r); let nd=[]; for(let d=1;d<=days;d++){ nd.push(map[d]||{day:d,dateStr:d+'/'+(now.getMonth()+1),in:'',out:'',total:0}); } attData=nd; saveAtt(); }

function renderAtt(){
  if(attData.length!==getDays()) initMonth();
  let totalHours = attData.reduce((s,r)=>s+(r.total||0),0);

  let hp = salaryConfig.hourPrice||1100;
  let days = salaryConfig.days||26;
  let target = salaryConfig.target||15000;
  let pharmacy = salaryConfig.pharmacy||0;

  // لو مفيش ديون محفوظة، ناخد من صفحة الديون
  if(pharmacy===0){
    try{ let debts=JSON.parse(localStorage.getItem('debts_v2')||'[]'); pharmacy=debts.filter(d=>d.type==='عليّ').reduce((s,x)=>s+x.remaining,0); }catch(e){}
  }

  let pricePerHour = days? +(hp/days).toFixed(2) : 0;
  let net = +(pricePerHour*totalHours).toFixed(0);
  let dailyReq = hp? +(target/hp).toFixed(2) : 0;

  document.getElementById('tab-att').innerHTML=`
  <!-- الجدول الملخص - كله جوه الجدول بدون بوكس فوق -->
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:10px">
    <div style="padding:6px 10px;background:#fef3c7;font-size:12px;font-weight:700">💰 ملخص المرتب - ${new Date().toLocaleDateString('ar-EG',{month:'long'})}</div>

    <div style="overflow:auto">
      <table style="width:100%;border-collapse:collapse;font-size:11px;text-align:center">
        <thead>
          <tr style="background:#f8fafc;color:#475569;font-size:9px">
            <th style="padding:6px;border:1px solid #e5e7eb">الساعة</th>
            <th style="padding:6px;border:1px solid #e5e7eb">كم يوم</th>
            <th style="padding:6px;border:1px solid #e5e7eb">سعر الساعة</th>
            <th style="padding:6px;border:1px solid #e5e7eb">عدد الساعات</th>
            <th style="padding:6px;border:1px solid #e5e7eb">الصافي</th>
            <th style="padding:6px;border:1px solid #e5e7eb">المطلوب</th>
            <th style="padding:6px;border:1px solid #e5e7eb">مطلوب يوميا</th>
            <th style="padding:6px;border:1px solid #e5e7eb">ديون للصيدلية</th>
            <th style="padding:6px;border:1px solid #e5e7eb;background:#fee2e2">المتبقي</th>
          </tr>
        </thead>
        <tbody>
          <tr style="font-weight:700">
            <td style="padding:2px;border:1px solid #e5e7eb"><input type="number" value="${hp}" onchange="editConfig('hourPrice',this.value)" style="width:100%;border:0;text-align:center;font-weight:700;padding:6px;background:#fffbeb;border-radius:4px"></td>
            <td style="padding:2px;border:1px solid #e5e7eb"><input type="number" value="${days}" onchange="editConfig('days',this.value)" style="width:100%;border:0;text-align:center;font-weight:700;padding:6px;background:#fffbeb;border-radius:4px"></td>
            <td style="padding:6px;border:1px solid #e5e7eb;color:#059669;background:#f0fdf4">${pricePerHour}</td>
            <td style="padding:6px;border:1px solid #e5e7eb">${totalHours.toFixed(1)}</td>
            <td style="padding:6px;border:1px solid #e5e7eb;background:#ecfdf5">${net}</td>
            <td style="padding:2px;border:1px solid #e5e7eb"><input type="number" value="${target}" onchange="editConfig('target',this.value)" style="width:100%;border:0;text-align:center;font-weight:700;padding:6px;background:#fffbeb;border-radius:4px"></td>
            <td style="padding:6px;border:1px solid #e5e7eb;color:#d97706">${dailyReq}</td>
            <td style="padding:2px;border:1px solid #e5e7eb"><input type="number" value="${pharmacy}" onchange="editConfig('pharmacy',this.value)" style="width:100%;border:0;text-align:center;font-weight:700;padding:6px;background:#fef2f2;color:#dc2626;border-radius:4px"></td>
            <td style="padding:6px;border:1px solid #e5e7eb;background:${(net-pharmacy)>=0?'#ecfdf5':'#fee2e2'};color:${(net-pharmacy)>=0?'#059669':'#dc2626'}">${net-pharmacy}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="padding:5px 8px;background:#f8fafc;font-size:9px;color:#94a3b8;display:flex;justify-content:space-between">
      <span>دوس على أي رقم أصفر لتعديله</span>
      <span onclick="resetConfig()" style="cursor:pointer;color:#ef4444">🗑️ مسح الكل</span>
    </div>
  </div>

  <!-- حضور وانصراف -->
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="padding:6px 10px;background:#f8fafc;font-size:11px;font-weight:700;display:flex;justify-content:space-between"><span>📅 الحضور - ${getDays()} يوم</span><span>${totalHours.toFixed(1)} س</span></div>
    <div style="max-height:380px;overflow:auto">
      ${attData.map((r,i)=>`
        <div style="display:grid;grid-template-columns:28px 1fr 1fr 42px;gap:4px;padding:5px;border-bottom:1px solid #f8fafc;align-items:center">
          <div style="text-align:center"><b style="font-size:11px">${r.day}</b></div>
          <div style="display:flex;gap:2px"><input type="time" value="${r.in}" onchange="updateAtt(${i},'in',this.value)" style="flex:1;padding:4px;border-radius:5px;border:1px solid #e5e7eb;font-size:11px"><button onclick="nowIn(${i})" style="border:0;background:#ecfdf5;border-radius:5px;padding:2px 4px;font-size:9px">الآن</button></div>
          <div style="display:flex;gap:2px"><input type="time" value="${r.out}" onchange="updateAtt(${i},'out',this.value)" style="flex:1;padding:4px;border-radius:5px;border:1px solid #e5e7eb;font-size:11px"><button onclick="nowOut(${i})" style="border:0;background:#fef2f2;border-radius:5px;padding:2px 4px;font-size:9px">الآن</button></div>
          <div style="text-align:center"><b style="font-size:10px;color:${r.total?'#059669':'#cbd5e1'}">${r.total||''}</b></div>
        </div>
      `).join('')}
    </div>
  </div>
  `;
}

function updateAtt(i,f,v){ attData[i][f]=v; if(f==='in'||f==='out') attData[i].total=calcH(attData[i].in,attData[i].out); saveAtt(); renderAtt(); }
function editConfig(k,v){ salaryConfig[k]=parseFloat(v)||0; saveAtt(); renderAtt(); }
function resetConfig(){ if(!confirm('تمسح كل قيم الجدول؟')) return; salaryConfig={hourPrice:1100,days:26,target:8000,pharmacy:0}; saveAtt(); renderAtt(); }
function nowIn(i){ let t=new Date().toTimeString().slice(0,5); attData[i].in=t; attData[i].total=calcH(t,attData[i].out); saveAtt(); renderAtt(); }
function nowOut(i){ let t=new Date().toTimeString().slice(0,5); attData[i].out=t; attData[i].total=calcH(attData[i].in,t); saveAtt(); renderAtt(); }

if(attData.length===0) initMonth();

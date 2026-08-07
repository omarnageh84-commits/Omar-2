// js/attendance.js - أرقام انجليزي وخانات ظاهرة

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
  let pharmacy = salaryConfig.pharmacy||0;

  if(pharmacy===0){
    try{ let debts=JSON.parse(localStorage.getItem('debts_v2')||'[]'); pharmacy=debts.filter(d=>d.type==='عليّ').reduce((s,x)=>s+x.remaining,0); salaryConfig.pharmacy=pharmacy; }catch(e){}
  }

  let pricePerHour = days? (hp/days).toFixed(2) : 0;
  let net = (pricePerHour*totalHours).toFixed(0);
  let dailyReq = hp? (target/hp).toFixed(2) : 0;
  let remaining = net - pharmacy;

  // إجبار الأرقام انجليزي
  document.documentElement.setAttribute('lang','en');

  document.getElementById('tab-att').innerHTML=`
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:10px">
    <div style="padding:8px 10px;background:#fef3c7;font-size:13px;font-weight:700">💰 ملخص المرتب - August 2026</div>
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:11px;text-align:center;direction:ltr">
        <thead>
          <tr style="background:#f8fafc;color:#333;font-size:10px">
            <th style="padding:6px;border:1px solid #e5e7eb;min-width:60px">الساعة</th>
            <th style="padding:6px;border:1px solid #e5e7eb;min-width:50px">كم يوم</th>
            <th style="padding:6px;border:1px solid #e5e7eb;min-width:60px">سعر الساعة</th>
            <th style="padding:6px;border:1px solid #e5e7eb;min-width:60px">عدد الساعات</th>
            <th style="padding:6px;border:1px solid #e5e7eb;min-width:60px">الصافي</th>
            <th style="padding:6px;border:1px solid #e5e7eb;min-width:60px">المطلوب</th>
            <th style="padding:6px;border:1px solid #e5e7eb;min-width:60px">مطلوب يوميا</th>
            <th style="padding:6px;border:1px solid #e5e7eb;min-width:70px">ديون للصيدلية</th>
            <th style="padding:6px;border:1px solid #e5e7eb;background:#fee2e2;min-width:60px">المتبقي</th>
          </tr>
        </thead>
        <tbody>
          <tr style="font-weight:700;font-family:monospace">
            <td style="padding:2px;border:1px solid #e5e7eb"><input type="number" value="${hp}" onchange="editConfig('hourPrice',this.value)" style="width:100%;border:2px solid #fbbf24;text-align:center;padding:8px;background:#fffbeb;border-radius:6px;font-weight:700;font-size:13px;color:#000"></td>
            <td style="padding:2px;border:1px solid #e5e7eb"><input type="number" value="${days}" onchange="editConfig('days',this.value)" style="width:100%;border:2px solid #fbbf24;text-align:center;padding:8px;background:#fffbeb;border-radius:6px;font-weight:700;font-size:13px;color:#000"></td>
            <td style="padding:8px;border:1px solid #e5e7eb;background:#f0fdf4;color:#059669">${pricePerHour}</td>
            <td style="padding:8px;border:1px solid #e5e7eb">${totalHours.toFixed(1)}</td>
            <td style="padding:8px;border:1px solid #e5e7eb;background:#ecfdf5">${net}</td>
            <td style="padding:2px;border:1px solid #e5e7eb"><input type="number" value="${target}" onchange="editConfig('target',this.value)" style="width:100%;border:2px solid #fbbf24;text-align:center;padding:8px;background:#fffbeb;border-radius:6px;font-weight:700;font-size:13px;color:#000"></td>
            <td style="padding:8px;border:1px solid #e5e7eb;color:#d97706">${dailyReq}</td>
            <td style="padding:2px;border:1px solid #e5e7eb"><input type="number" value="${pharmacy}" onchange="editConfig('pharmacy',this.value)" style="width:100%;border:2px solid #ef4444;text-align:center;padding:8px;background:#fef2f2;border-radius:6px;font-weight:700;font-size:13px;color:#dc2626"></td>
            <td style="padding:8px;border:1px solid #e5e7eb;background:${remaining>=0?'#ecfdf5':'#fee2e2'};color:${remaining>=0?'#059669':'#dc2626'}">${remaining}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="padding:5px 8px;background:#f8fafc;font-size:10px;color:#64748b;display:flex;justify-content:space-between;direction:ltr">
      <span>Click yellow to edit</span>
      <span onclick="resetConfig()" style="cursor:pointer;color:#ef4444">🗑️ Clear</span>
    </div>
  </div>

  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="padding:8px 10px;background:#f8fafc;font-size:12px;font-weight:700;display:flex;justify-content:space-between"><span>📅 الحضور - ${getDays()} يوم</span><span style="font-family:monospace">${totalHours.toFixed(1)}h</span></div>
    <div style="max-height:400px;overflow:auto">
      ${attData.map((r,i)=>`
        <div style="display:grid;grid-template-columns:30px 1fr 1fr 45px;gap:6px;padding:6px;border-bottom:1px solid #f1f5f9;align-items:center">
          <div style="text-align:center;font-weight:700;font-size:12px">${r.day}</div>
          <div style="display:flex;gap:3px"><input type="time" value="${r.in}" onchange="updateAtt(${i},'in',this.value)" style="flex:1;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;background:#fff;color:#000"><button onclick="nowIn(${i})" style="border:0;background:#dcfce7;padding:4px 6px;border-radius:5px;font-size:10px">NOW</button></div>
          <div style="display:flex;gap:3px"><input type="time" value="${r.out}" onchange="updateAtt(${i},'out',this.value)" style="flex:1;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;background:#fff;color:#000"><button onclick="nowOut(${i})" style="border:0;background:#fee2e2;padding:4px 6px;border-radius:5px;font-size:10px">NOW</button></div>
          <div style="text-align:center;font-weight:700;font-size:11px;color:${r.total?'#059669':'#ccc'}">${r.total?r.total:''}</div>
        </div>
      `).join('')}
    </div>
  </div>
  `;
}

function updateAtt(i,f,v){ attData[i][f]=v; if(f==='in'||f==='out') attData[i].total=calcH(attData[i].in,attData[i].out); saveAtt(); renderAtt(); }
function editConfig(k,v){ salaryConfig[k]=parseFloat(v)||0; saveAtt(); renderAtt(); }
function resetConfig(){ if(!confirm('Clear all?')) return; salaryConfig={hourPrice:1100,days:26,target:15000,pharmacy:0}; saveAtt(); renderAtt(); }
function nowIn(i){ let t=new Date().toTimeString().slice(0,5); attData[i].in=t; attData[i].total=calcH(t,attData[i].out); saveAtt(); renderAtt(); }
function nowOut(i){ let t=new Date().toTimeString().slice(0,5); attData[i].out=t; attData[i].total=calcH(attData[i].in,t); saveAtt(); renderAtt(); }

if(attData.length===0) initMonth();

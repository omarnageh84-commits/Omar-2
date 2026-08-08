import { L, S } from './utils.js';

const DAILY_KEY='daily_v6';
const ATT_KEY='attendance_v7';
const SET_KEY='att_settings_v8';
const TASK_KEY='tasks_v7';
const NOTE_KEY='notes_v7';

function toEn(s){ return String(s).replace(/[٠١٢٣٤٥٦٧٨٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٬/g,',').trim(); }
function parseNum(v, def=0){ let s=toEn(String(v)).replace(/,/g,'').trim(); if(s===''||s==='0') return 0; let n=Number(s); return isNaN(n)? def : n; }
function toMinutes(t, isOut=false){
  if(!t) return null;
  let s=toEn(t).toLowerCase(); let isPM=s.includes('م')||s.includes('p'); let isAM=s.includes('ص')||s.includes('a');
  if(!isPM&&!isAM){ isPM=isOut; isAM=!isOut; }
  s=s.replace(/[^\d:.\s]/g,' ').trim().replace('.', ':');
  let h=0,mn=0; if(s.includes(':')){ let p=s.split(':'); h=parseInt(p[0])||0; mn=parseInt(p[1])||0; } else if(s) h=parseInt(s)||0;
  if(isPM&&h<12) h+=12; if(isAM&&h==12) h=0; return h*60+mn;
}
function calcHours(a,b){ if(!a||!b) return 0; let pa=toMinutes(a,false), pb=toMinutes(b,true); if(pa===null||pb===null) return 0; if(pa===pb) return 0; let d=pb-pa; if(d<0) d+=24*60; return d/60; }
function fmtMoney(n){ return (Number(n)||0).toLocaleString('en-US'); }
function getDaysLast7(){
  const arr=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); arr.push(d); } return arr;
}
function toLocalISO(d){ const pad=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

export function renderDashboard(){
  const daily=L(DAILY_KEY,[]);
  const att=L(ATT_KEY,[]);
  const set=L(SET_KEY,{totalSalary:1200, workDays:26, required:15000, pharmacyDebt:0});
  const tasks=L(TASK_KEY,[]);
  const notes=L(NOTE_KEY,[]);

  const now=new Date(); const curMonth=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const curMonthData=daily.filter(x=>(x.date||'').slice(0,7)===curMonth);
  const incomeMonth=curMonthData.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0);
  const expenseMonth=curMonthData.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
  const dueMonth=curMonthData.filter(x=>x.type==='due').reduce((s,x)=>s+x.amount,0);
  const deferredMonth=curMonthData.filter(x=>x.type==='deferred').reduce((s,x)=>s+x.amount,0);

  const totalSalary=parseNum(set.totalSalary,1200);
  const workDays=parseNum(set.workDays,26);
  const pharmacyDebt=parseNum(set.pharmacyDebt,0);
  const required=parseNum(set.required,15000);
  const pricePerHour=workDays? totalSalary/workDays : 0;

  let totalHoursMonth=0, daysWorked=0;
  att.forEach(x=>{
    if((x.date||'').slice(0,7)===curMonth){
      const h=calcHours(x.in,x.out);
      if(h>0){ totalHoursMonth+=h; daysWorked++; }
    }
  });
  const net=pricePerHour*totalHoursMonth;
  const remain=net - pharmacyDebt;
  const salaryProgress = workDays? Math.min(100, (daysWorked/workDays)*100) : 0;
  const hoursProgress = (workDays*12)? Math.min(100, (totalHoursMonth/(workDays*12))*100) : 0;

  const last7=getDaysLast7();
  const last7Data=last7.map(d=>{
    const iso=toLocalISO(d);
    const dayData=daily.filter(x=>(x.date||'').slice(0,10)===iso);
    const inc=dayData.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0);
    const exp=dayData.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
    const attRec=att.find(x=>(x.date||'').slice(0,10)===iso);
    const h=attRec? calcHours(attRec.in, attRec.out) : 0;
    return { d, iso, name:d.toLocaleDateString('ar-EG',{weekday:'short'}), inc, exp, h };
  });

  const totalInc7=last7Data.reduce((s,x)=>s+x.inc,0);
  const totalExp7=last7Data.reduce((s,x)=>s+x.exp,0);
  const maxVal=Math.max(...last7Data.map(x=>Math.max(x.inc,x.exp)), 100);

  const pendingTasks=tasks.filter(t=>!t.done).length;
  const totalTasks=tasks.length;

  return `
  <div style="padding:6px; display:flex; flex-direction:column; gap:6px; background:#f8fafc; min-height:100vh">

    <!-- هيدر ترحيب احترافي -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%); border-radius:16px; padding:12px 14px; color:#fff; position:relative; overflow:hidden">
      <div style="position:absolute; top:-20px; left:-20px; width:80px; height:80px; background:rgba(16,185,129,.15); border-radius:50%; filter:blur(10px)"></div>
      <div style="position:absolute; bottom:-20px; right:-20px; width:100px; height:100px; background:rgba(99,102,241,.15); border-radius:50%; filter:blur(12px)"></div>
      <div style="display:flex; justify-content:space-between; align-items:center; position:relative; z-index:1">
        <div>
          <div style="font-size:16px; font-weight:900; display:flex; align-items:center; gap:6px">👋 أهلا يا عمر</div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px">${now.toLocaleDateString('ar-EG',{weekday:'long', year:'numeric', month:'long', day:'numeric'})} - ${curMonth}</div>
        </div>
        <div style="text-align:left">
          <div style="background:rgba(255,255,255,.12); padding:5px 10px; border-radius:20px; font-size:9px; font-weight:700; border:1px solid rgba(255,255,255,.1)">📊 ${new Date().toLocaleDateString('en-CA')}</div>
          <div style="font-size:9px; color:#10b981; margin-top:4px; text-align:center; font-weight:700">${daysWorked} يوم عمل • ${totalHoursMonth.toFixed(1)}س</div>
        </div>
      <!-- بروجرس الراتب -->
      <div style="margin-top:10px; background:rgba(255,255,255,.08); border-radius:20px; height:6px; overflow:hidden; position:relative; z-index:1"><div style="width:${salaryProgress}%; height:100%; background:linear-gradient(90deg,#10b981,#34d399); border-radius:20px; transition:.5s"></div></div>
      <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:8px; color:#64748b; position:relative; z-index:1"><span>التقدم الشهري</span><span style="color:#10b981; font-weight:700">${salaryProgress.toFixed(0)}%</span></div>
    </div>

    <!-- 4 كروت احترافية صغيرة -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px">
      <!-- صافي الشهر -->
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:8px 10px; position:relative; overflow:hidden">
        <div style="position:absolute; top:0; right:0; width:3px; height:100%; background:${net>=0?'#10b981':'#e11d48'}"></div>
        <div style="display:flex; justify-content:space-between; align-items:center"><span style="font-size:9px; color:#64748b; font-weight:600">صافي الشهر</span><span style="background:${net>=0?'#ecfdf5':'#fff1f2'}; color:${net>=0?'#059669':'#e11d48'}; font-size:8px; padding:2px 6px; border-radius:10px; font-weight:800">${net>=0?'↑ ربح':'↓ خسارة'}</span></div>
        <div style="font-size:16px; font-weight:900; margin-top:4px; color:${net>=0?'#059669':'#e11d48'}">${fmtMoney(net)} <span style="font-size:9px">ج</span></div>
        <div style="font-size:8px; color:#94a3b8; margin-top:2px; display:flex; gap:6px"><span style="color:#10b981">↑ ${fmtMoney(incomeMonth)} دخل</span><span style="color:#e11d48">↓ ${fmtMoney(expenseMonth)} مصروف</span></div>
      </div>
      <!-- الديون -->
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:8px 10px; position:relative; overflow:hidden">
        <div style="position:absolute; top:0; right:0; width:3px; height:100%; background:#f59e0b"></div>
        <div style="display:flex; justify-content:space-between; align-items:center"><span style="font-size:9px; color:#64748b; font-weight:600">الديون والمستحق</span><span style="background:#fffbeb; color:#d97706; font-size:8px; padding:2px 6px; border-radius:10px; font-weight:800">${fmtMoney(dueMonth+deferredMonth)} ج</span></div>
        <div style="font-size:16px; font-weight:900; margin-top:4px; color:#d97706">${fmtMoney(remain)} <span style="font-size:9px">ج</span></div>
        <div style="font-size:8px; color:#94a3b8; margin-top:2px">المتبقي = صافي - ديون ${fmtMoney(pharmacyDebt)} • صافي حضور ${fmtMoney(pharmacyDebt)}؟</div>
      </div>
      <!-- الحضور -->
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:8px 10px; position:relative; overflow:hidden">
        <div style="position:absolute; top:0; right:0; width:3px; height:100%; background:#6366f1"></div>
        <div style="display:flex; justify-content:space-between; align-items:center"><span style="font-size:9px; color:#64748b; font-weight:600">الحضور - إجمالي الأيام</span><span style="background:#eef2ff; color:#4f46e5; font-size:8px; padding:2px 6px; border-radius:10px; font-weight:800">${pricePerHour.toFixed(1)} ج/س</span></div>
        <div style="font-size:16px; font-weight:900; margin-top:4px; color:#1e293b">${daysWorked} <span style="font-size:10px">يوم</span> / ${totalHoursMonth.toFixed(1)} <span style="font-size:10px">ساعة</span></div>
        <div style="background:#f1f5f9; border-radius:20px; height:5px; margin-top:6px; overflow:hidden"><div style="width:${hoursProgress}%; height:100%; background:linear-gradient(90deg,#6366f1,#8b5cf6); border-radius:20px"></div></div>
      </div>
      <!-- المهام -->
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:8px 10px; position:relative; overflow:hidden">
        <div style="position:absolute; top:0; right:0; width:3px; height:100%; background:#06b6d4"></div>
        <div style="display:flex; justify-content:space-between; align-items:center"><span style="font-size:9px; color:#64748b; font-weight:600">المهام والملاحظات</span><span style="background:${pendingTasks>0?'#fef3c7':'#ecfdf5'}; color:${pendingTasks>0?'#d97706':'#059669'}; font-size:8px; padding:2px 6px; border-radius:10px; font-weight:800">${pendingTasks>0? pendingTasks+' متبقي' : 'منجز ✓'}</span></div>
        <div style="font-size:16px; font-weight:900; margin-top:4px; color:#1e293b">${pendingTasks} <span style="font-size:11px; font-weight:600">متبقي</span></div>
        <div style="font-size:8px; color:#94a3b8; margin-top:2px">${totalTasks} إجمالي - ${notes.length} ملاحظة - ${tasks.filter(t=>t.done).length} منجز</div>
      </div>
    </div>

    <!-- ملخص 7 أيام - احترافي -->
    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; border-bottom:1px solid #f1f5f9">
        <b style="font-size:11px; display:flex; align-items:center; gap:6px">📈 ملخص سريع - آخر 7 أيام</b>
        <div style="display:flex; gap:4px"><span style="font-size:7px; background:#ecfdf5; color:#059669; padding:2px 6px; border-radius:10px">دخل ${fmtMoney(totalInc7)}</span><span style="font-size:7px; background:#fff1f2; color:#e11d48; padding:2px 6px; border-radius:10px">مصروف ${fmtMoney(totalExp7)}</span></div>
      </div>

      <!-- شارت صغير -->
      <div style="display:flex; align-items:end; gap:3px; padding:8px 10px; height:60px; background:#f8fafc">
        ${last7Data.map(day=>{
          const hInc = maxVal? (day.inc/maxVal)*50 : 2;
          const hExp = maxVal? (day.exp/maxVal)*50 : 2;
          return `<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:2px">
            <div style="display:flex; gap:2px; align-items:end; height:50px">
              <div style="width:6px; height:${hInc}px; background:#10b981; border-radius:3px; min-height:2px" title="دخل ${day.inc}"></div>
              <div style="width:6px; height:${hExp}px; background:#e11d48; border-radius:3px; min-height:2px" title="مصروف ${day.exp}"></div>
            </div>
            <span style="font-size:7px; color:#64748b; font-weight:600">${day.name}</span>
          </div>`;
        }).join('')}
      </div>

      <table style="width:100%; font-size:10px; border-collapse:collapse">
        <tr style="background:#f8fafc; color:#64748b; font-size:8px"><th style="padding:6px; text-align:right; font-weight:600">اليوم</th><th style="padding:6px; text-align:center">دخل</th><th style="padding:6px; text-align:center">مصروف</th><th style="padding:6px; text-align:center">عمل</th></tr>
        ${last7Data.slice().reverse().map(d=>`
          <tr style="border-top:1px solid #f8fafc">
            <td style="padding:6px 10px; font-weight:700; font-size:10px">${d.name} <span style="font-size:8px; color:#94a3b8">${d.iso.slice(5)}</span></td>
            <td style="padding:6px; text-align:center; color:${d.inc>0?'#059669':'#cbd5e1'}; font-weight:700">${d.inc? fmtMoney(d.inc) : '-'}</td>
            <td style="padding:6px; text-align:center; color:${d.exp>0?'#e11d48':'#cbd5e1'}; font-weight:700">${d.exp? fmtMoney(d.exp) : '-'}</td>
            <td style="padding:6px; text-align:center; color:${d.h>0?'#4f46e5':'#cbd5e1'}; font-size:9px; font-weight:600">${d.h? d.h.toFixed(1)+'س' : '---'}</td>
          </tr>
        `).join('')}
      </table>
    </div>

    <!-- ازرار سريعة -->
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:5px">
      <button data-action="go" data-tab="daily" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:8px 2px; font-size:9px; font-weight:700; display:flex; flex-direction:column; align-items:center; gap:3px"><span style="font-size:16px">💳</span>إضافة مصروف</button>
      <button data-action="go" data-tab="attendance" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:8px 2px; font-size:9px; font-weight:700; display:flex; flex-direction:column; align-items:center; gap:3px"><span style="font-size:16px">⏱️</span>تسجيل حضور</button>
      <button data-action="go" data-tab="tasks" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:8px 2px; font-size:9px; font-weight:700; display:flex; flex-direction:column; align-items:center; gap:3px"><span style="font-size:16px">✅</span>مهمة جديدة</button>
      <button data-action="go" data-tab="notes" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:8px 2px; font-size:9px; font-weight:700; display:flex; flex-direction:column; align-items:center; gap:3px"><span style="font-size:16px">📝</span>ملاحظة سريعة</button>
    </div>
  </div>`;
}

export function handleDashboard(btn,e,rerender){
  if(btn.dataset.action==='go'){
    const tab=btn.dataset.tab;
    document.querySelectorAll('.nav button').forEach(b=>{ if(b.dataset.t===tab) b.click(); });
  }
}

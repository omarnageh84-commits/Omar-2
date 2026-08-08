import { L } from './utils.js';
const DAILY_KEY='daily_v6';
const ATT_KEY='attendance_v7';
const ATT_SET='att_settings_v8';
const TASKS_KEY='tasks_v7';
const NOTES_KEY='notes_v7';

function toEn(s){ return String(s).replace(/[٠١٢٣٤٥٦٧٨٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)); }
function toMinutes(t){
  if(!t) return null;
  let s=toEn(t); let isPM=s.includes('م')||/pm/i.test(s), isAM=s.includes('ص')||/am/i.test(s);
  s=s.replace(/[^\d:]/g,' ').trim().replace('.', ':');
  let h=0,m=0; if(s.includes(':')){ let p=s.split(':'); h=parseInt(p[0])||0; m=parseInt(p[1])||0; } else h=parseInt(s)||0;
  if(isPM&&h<12) h+=12; if(isAM&&h==12) h=0;
  return h*60+m;
}
function calcHours(a,b){
  if(!a||!b) return 0;
  let pa=toMinutes(a), pb=toMinutes(b); if(pa===null||pb===null) return 0;
  let d=pb-pa; if(d<0) d+=24*60; return d/60;
}
function fmt(n){ return Number(n||0).toLocaleString('en-US'); }

export function renderDashboard(){
  const now=new Date();
  const curM = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const daily=L(DAILY_KEY,[]);
  const att=L(ATT_KEY,[]);
  const attSet=L(ATT_SET, {totalSalary:1100, workDays:26});
  const tasks=L(TASKS_KEY,[]);
  const notes=L(NOTES_KEY,[]);

  // مالية الشهر
  let incomeM=0, expenseM=0;
  daily.forEach(r=>{
    if((r.date||'').slice(0,7)===curM){
      let am=Number(r.amount)||0;
      if((r.type||'').includes('دخل') || (r.category||'').includes('دخل')) incomeM+=am;
      else expenseM+=am;
    }
  });
  let netM = incomeM - expenseM;

  // حضور
  let totalHours=0, daysWorked=0;
  att.forEach(x=>{
    if((x.date||'').slice(0,7)===curM){
      let h=calcHours(x.in, x.out);
      if(h>0){ totalHours+=h; daysWorked++; }
    }
  });
  let salaryPerDay = (Number(attSet.totalSalary)||1100) / (Number(attSet.workDays)||26);
  let salaryEarned = salaryPerDay * totalHours / 8; // افتراض 8 ساعات يوم عمل لو عايزها بالساعة شيل /8 وخليها totalHours * (totalSalary/workDays/8)
  // على حسب حسابك القديم: الصافي = سعر الساعة * عدد الساعات
  let pricePerHour = (Number(attSet.totalSalary)||1100) / (Number(attSet.workDays)||26);
  let attNet = pricePerHour * totalHours;

  // مهام وملاحظات
  let pendingTasks = tasks.filter(t=>!t.done).length;
  let urgentTasks = tasks.filter(t=> (t.priority==='عاجل جدا' || t.priority==='مهم') &&!t.done).slice(0,3);
  let recentNotes = notes.slice(0,3);

  // آخر 7 ايام
  let last7=[];
  for(let i=0;i<7;i++){
    let d=new Date(); d.setDate(d.getDate()-i);
    let iso=d.toISOString().slice(0,10);
    let dayName=d.toLocaleDateString('ar-EG',{weekday:'long'});
    let dayIncome=0, dayExpense=0;
    daily.forEach(r=>{ if((r.date||'').slice(0,10)===iso){ let am=Number(r.amount)||0; if((r.type||'').includes('دخل')) dayIncome+=am; else dayExpense+=am; } });
    last7.push({name:dayName, iso, income:dayIncome, expense:dayExpense});
  }

  return `
  <div style="padding:8px; display:flex; flex-direction:column; gap:10px">
    <!-- ترحيب -->
    <div style="background:linear-gradient(135deg,#0f172a,#1e293b); color:#fff; border-radius:16px; padding:14px 16px; display:flex; justify-content:space-between; align-items:center">
      <div>
        <div style="font-size:16px; font-weight:800">👋 أهلا يا عمر</div>
        <div style="font-size:11px; opacity:.7; margin-top:2px">${now.toLocaleDateString('ar-EG',{weekday:'long', day:'numeric', month:'long'})} - ${curM}</div>
      </div>
      <div style="background:rgba(255,255,255,.1); padding:6px 10px; border-radius:20px; font-size:10px; font-weight:700">📊 ${curM}</div>
    </div>

    <!-- 4 كروت رئيسية -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px">
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:12px">
        <div style="font-size:9px; color:#64748b; font-weight:700">صافي الشهر</div>
        <div style="font-size:18px; font-weight:900; color:${netM>=0?'#0d9b6e':'#e11d48'}; margin-top:4px">${fmt(netM)} <span style="font-size:10px">ج</span></div>
        <div style="font-size:9px; margin-top:6px; display:flex; gap:6px"><span style="color:#0d9b6e">↑ ${fmt(incomeM)} دخل</span><span style="color:#e11d48">↓ ${fmt(expenseM)} مصروف</span></div>
      </div>
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:12px">
        <div style="font-size:9px; color:#64748b; font-weight:700">الديون والمستحق</div>
        <div style="font-size:18px; font-weight:900; color:#f59e0b; margin-top:4px">${fmt(attSet.pharmacyDebt||0)} <span style="font-size:10px">ج</span></div>
        <div style="font-size:9px; color:#94a3b8; margin-top:6px">صافي الحضور ${fmt(attNet.toFixed(0))} ج - مستحقة 0</div>
      </div>
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:12px">
        <div style="font-size:9px; color:#64748b; font-weight:700">الحضور - إجمالي الأيام</div>
        <div style="font-size:18px; font-weight:900; color:#0f172a; margin-top:4px">${daysWorked} <span style="font-size:12px; font-weight:700">يوم</span> <span style="font-size:10px; color:#64748b">/ ${totalHours.toFixed(1)} ساعة</span></div>
        <div style="height:4px; background:#f1f5f9; border-radius:10px; margin-top:8px"><div style="height:100%; width:${Math.min(100, (daysWorked/26)*100)}%; background:#0d9b6e; border-radius:10px"></div></div>
      </div>
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:12px">
        <div style="font-size:9px; color:#64748b; font-weight:700">المهام والملاحظات</div>
        <div style="font-size:18px; font-weight:900; color:#0f172a; margin-top:4px">${pendingTasks} <span style="font-size:12px">متبقي</span></div>
        <div style="font-size:9px; color:#94a3b8; margin-top:6px">${tasks.length} إجمالي - ${notes.length} ملاحظة</div>
      </div>
    </div>

    <!-- ملخص سريع 7 ايام -->
    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden">
      <div style="padding:10px 12px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9">
        <b style="font-size:12px">📈 ملخص سريع - آخر 7 أيام</b>
        <span style="font-size:9px; background:#f1f5f9; padding:3px 8px; border-radius:20px">دخل / مصروف</span>
      </div>
      <table style="width:100%; font-size:11px; border-collapse:collapse">
        <tr style="background:#f8fafc; font-size:9px; color:#64748b"><th style="padding:8px; text-align:right">اليوم</th><th style="padding:8px">دخل</th><th style="padding:8px">مصروف</th><th style="padding:8px">عمل</th></tr>
        ${last7.map(d=>`
          <tr style="border-top:1px solid #f8fafc">
            <td style="padding:8px; font-weight:700">${d.name}</td>
            <td style="padding:8px; color:#0d9b6e; text-align:center">${d.income? fmt(d.income) : '-'}</td>
            <td style="padding:8px; color:#e11d48; text-align:center">${d.expense? fmt(d.expense) : '-'}</td>
            <td style="padding:8px; text-align:center; color:#94a3b8">---</td>
          </tr>
        `).join('')}
      </table>
    </div>

    <!-- مهام عاجلة -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px">
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:10px">
        <b style="font-size:11px">🔥 مهام عاجلة</b>
        <div style="margin-top:8px; display:flex; flex-direction:column; gap:6px">
          ${urgentTasks.length? urgentTasks.map(t=>`<div style="background:#fff7ed; border:1px solid #ffedd5; border-radius:8px; padding:6px 8px; font-size:10px; font-weight:700">${t.text.slice(0,25)}</div>`).join('') : '<div style="font-size:10px; color:#94a3b8; text-align:center; padding:10px">لا يوجد مهام</div>'}
        </div>
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:10px">
        <b style="font-size:11px">📝 آخر ملاحظات</b>
        <div style="margin-top:8px; display:flex; flex-direction:column; gap:6px">
          ${recentNotes.length? recentNotes.map(n=>`<div style="background:#f8fafc; border:1px solid #f1f5f9; border-radius:8px; padding:6px 8px; font-size:10px; font-weight:700">${n.title.slice(0,25)}</div>`).join('') : '<div style="font-size:10px; color:#94a3b8; text-align:center; padding:10px">لا يوجد</div>'}
        </div>
      </div>
    </div>
  </div>`;
}

export function handleDashboard(){}

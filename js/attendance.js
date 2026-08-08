import { L, S, uid } from './utils.js';
const KEY='attendance_v7';
const SETTINGS='att_settings_v7';
const DEFAULT_SETTINGS={hourPrice:42, required:15000, pharmacyDebt:4450};

function getDaysInMonth(year, month){
  const days=[]; const date=new Date(year, month, 1);
  while(date.getMonth()===month){ days.push(new Date(date)); date.setDate(date.getDate()+1); }
  return days;
}

export function renderAttendance(){
  const data=L(KEY,[]);
  const settings=L(SETTINGS, DEFAULT_SETTINGS);
  const now=new Date();
  const year=now.getFullYear(), month=now.getMonth();
  const days=getDaysInMonth(year, month);
  const curMonthStr=`${year}-${String(month+1).padStart(2,'0')}`;

  // حسابات التقرير
  const monthData=data.filter(x=> (x.date||'').slice(0,7)===curMonthStr);
  const workDays=monthData.filter(x=>x.in).length;
  const totalHours=monthData.reduce((s,x)=>s+(x.hours||0),0);
  const totalMoney=totalHours*settings.hourPrice;
  const remaining=totalMoney-settings.required-settings.pharmacyDebt;
  const dailyRequired=settings.required/26; // افتراضي 26 يوم عمل

  // جدول أفقي زي صورتك - تقرير
  const reportRow=(label,value,editableKey)=>{
    return `<tr>
      <td style="text-align:left; font-weight:800; direction:ltr; font-family:monospace; font-size:12px">${typeof value==='number'? value.toLocaleString('ar-EG') : value}</td>
      <td style="text-align:right; font-size:11px">${label} ${editableKey? `<button class="btn-sm btn-edit-sm" data-action="editSetting" data-key="${editableKey}">✏️</button>`:''}</td>
    </tr>`;
  };

  return `
  <div style="margin:0; padding:0; width:100vw; margin-left:-8px; margin-right:-8px">
    <div class="card daily-master" style="margin:0 8px; border-radius:12px">
      <div class="daily-master-header total"><b>📊 تقرير الحضور - ${curMonthStr}</b><small>${workDays} يوم عمل</small></div>
      <table class="pro-table" style="margin:0; border-radius:0; background:#1e293b; color:#fff; border:0">
        <tbody>
          ${reportRow('الساعة', settings.hourPrice, 'hourPrice')}
          ${reportRow('كم يوم', workDays, null)}
          ${reportRow('سعر الساعه', settings.hourPrice, 'hourPrice')}
          ${reportRow('عدد الساعات', totalHours.toFixed(1), null)}
          ${reportRow('الصافي', totalMoney.toFixed(0), null)}
          ${reportRow('المطلوب', settings.required, 'required')}
          ${reportRow('المطلوب عمل يوميا', dailyRequired.toFixed(2), null)}
          ${reportRow('ديون للصيدليه', settings.pharmacyDebt, 'pharmacyDebt')}
          <tr style="background:#0f172a"><td style="text-align:left; font-weight:900; color:${remaining>=0?'#10b981':'#fb7185'}; font-size:13px">${remaining.toFixed(0)}</td><td style="text-align:right; font-weight:800">المتبقي</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card daily-master" style="margin:8px 8px 0 8px; border-radius:12px; padding:0">
      <div class="daily-master-header income" style="border-radius:12px 12px 0 0"><b>📅 أيام الشهر - حضور وانصراف</b><small>النزول ببكره - ${days.length} يوم</small></div>
      <div style="overflow:auto; max-height:70vh">
        <table class="pro-table" style="min-width:100%; margin:0; border-radius:0">
          <tr style="position:sticky; top:0; z-index:2"><th style="min-width:60px">اليوم</th><th style="min-width:65px">الحضور</th><th style="min-width:65px">الانصراف</th><th style="min-width:50px">الصافي</th><th>ملاحظات</th></tr>
          ${days.map(d=>{
            const iso=d.toISOString().slice(0,10);
            const rec=data.find(x=> (x.date||'').slice(0,10)===iso) || {date:d.toISOString(), in:'', out:'', hours:0, note:''};
            const isToday=iso===new Date().toISOString().slice(0,10);
            const isFuture=d>now;
            return `<tr style="${isToday?'background:#ecfdf5':''} ${isFuture?'opacity:.5':''}">
              <td style="font-size:10px; font-weight:${isToday?'800':'600'}">${d.getDate()}<br><small style="font-size:8px; color:${d.getDay()===5?'#e11d48':'#94a3b8'}">${d.toLocaleDateString('ar-EG',{weekday:'short'})}</small> ${isToday?'<span style="background:#10b981; color:#fff; padding:1px 4px; border-radius:10px; font-size:8px">اليوم</span>':''}</td>
              <td><input type="time" value="${rec.in||''}" data-action="setIn" data-date="${iso}" style="width:100%; padding:5px; border:1px solid #e2e8f0; border-radius:6px; font-size:10px"></td>
              <td><input type="time" value="${rec.out||''}" data-action="setOut" data-date="${iso}" style="width:100%; padding:5px; border:1px solid #e2e8f0; border-radius:6px; font-size:10px"></td>
              <td style="text-align:center; font-weight:700; color:${rec.hours? '#0f172a':'#94a3b8'}; font-size:10px">${rec.hours? rec.hours.toFixed(1)+'س' : '-'}</td>
              <td><input type="text" value="${rec.note||''}" placeholder="ملاحظة" data-action="setNote" data-date="${iso}" style="width:100%; padding:5px; border:1px solid #e2e8f0; border-radius:6px; font-size:10px"></td>
            </tr>`;
          }).join('')}
        </table>
      </div>
      <div style="padding:8px; background:#f8fafc; font-size:9px; color:#64748b; text-align:center">⏰ الحساب: الانصراف - الحضور = صافي الساعات • النزول ببكره تلقائي</div>
    </div>
  </div>
  `;
}

export function handleAttendance(btn,e,rerender){
  const settings=L(SETTINGS, DEFAULT_SETTINGS);
  let data=L(KEY,[]);

  if(btn.dataset.action==='editSetting'){
    const key=btn.dataset.key;
    const labels={hourPrice:'سعر الساعة', required:'المطلوب', pharmacyDebt:'ديون الصيدلية'};
    const v=prompt(`تعديل ${labels[key]}:`, settings[key]);
    if(v===null) return; settings[key]=+v||0; S(SETTINGS,settings); rerender(); return;
  }

  const target=e.target;
  const iso=target.dataset.date || btn.dataset.date;
  if(!iso) return;

  let rec=data.find(x=> (x.date||'').slice(0,10)===iso);
  if(!rec){ rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''}; data.push(rec); }

  if(target.dataset.action==='setIn' || e.type==='change' && target.type==='time' && target.dataset.action==='setIn'){
    rec.in=target.value; calcHours(rec); S(KEY,data); rerender(); return;
  }
  if(target.dataset.action==='setOut' || target.type==='time' && target.dataset.action==='setOut'){
    rec.out=target.value; calcHours(rec); S(KEY,data); rerender(); return;
  }
  if(target.dataset.action==='setNote'){
    rec.note=target.value; S(KEY,data); return;
  }
  if(e.type==='change' && target.type==='text'){
    rec.note=target.value; S(KEY,data); return;
  }
}

function calcHours(rec){
  if(!rec.in ||!rec.out) { rec.hours=0; return; }
  const [h1,m1]=rec.in.split(':').map(Number); const [h2,m2]=rec.out.split(':').map(Number);
  let diff=(h2*60+m2)-(h1*60+m1); if(diff<0) diff+=24*60; rec.hours=diff/60;
}

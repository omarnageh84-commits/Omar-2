import { L, S, uid, fmtNum } from './utils.js';
const KEY='attendance_v7';
const SETTINGS='att_settings_v8';
const DAILY_KEY='daily_v6';
const DEFAULT={ totalSalary: 1100, workDays: 26, required: 15000, pharmacyDebt: 4450 };

function getDays(y,m){ const arr=[]; const d=new Date(y,m,1); while(d.getMonth()===m){ arr.push(new Date(d)); d.setDate(d.getDate()+1); } return arr; }

// يحول الارقام العربي ٠١٢ لانجليزي 012
function toEnDigits(str){
  return String(str).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[٬,]/g,'');
}

function smartParse(v){
  if(!v) return '';
  v = toEnDigits(v).trim().toLowerCase();
  v = v.replace(/ص/g,'').replace(/م/g,'').replace(/a/g,'').replace(/p/g,'').trim();
  v = v.replace(',', '.');

  if(/^\d{1,2}$/.test(v)){
    let h = parseInt(v);
    if(h>=0 && h<=23) return `${String(h).padStart(2,'0')}:00`;
  }
  if(v.includes(':')){
    let [h,m]=v.split(':'); h=parseInt(h)||0; m=parseInt(m)||0;
    if(h>23) h=23; if(m>59) m=59;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }
  if(v.includes('.')){
    let [h,m]=v.split('.'); h=parseInt(h)||0;
    let mm=parseInt((m||'0').padEnd(2,'0').slice(0,2))||0;
    if(mm>59) mm=59;
    return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  }
  let num=v.replace(/[^0-9]/g,'');
  if(num.length===3) return `0${num[0]}:${num.slice(1)}`;
  if(num.length===4) return `${num.slice(0,2)}:${num.slice(2)}`;
  return v;
}

function format12(t){
  if(!t) return '';
  const mins = toMinutes(t);
  if(mins===null) return t;
  let h = Math.floor(mins/60)%24;
  let m = mins % 60;
  const period = h >= 12? 'م' : 'ص';
  let h12 = h % 12; if(h12===0) h12=12;
  return `${h12}:${String(m).padStart(2,'0')} ${period}`;
}

function toMinutes(t){
  if(!t) return null;
  let raw = String(t);
  let isPM = raw.includes('م') || /p/i.test(raw);
  let isAM = raw.includes('ص') || /a/i.test(raw);
  raw = toEnDigits(raw).replace(/[صمAPMapm]/g,'').trim();

  if(!raw.includes(':') &&!isNaN(raw) && raw!==''){
    return parseFloat(raw)*60;
  }

  let parsed = smartParse(raw);
  if(!parsed||!parsed.includes(':')) return null;
  let [h,m]=parsed.split(':').map(Number);
  if(isNaN(h)||isNaN(m)) return null;
  if(isPM && h < 12) h += 12;
  if(isAM && h === 12) h = 0;
  return h*60+m;
}

function calcHours(a,b){
  if(!a||!b) return 0;
  const pa=toMinutes(a), pb=toMinutes(b);
  if(pa===null||pb===null) return 0;
  let d=pb-pa; if(d<=0) d+=24*60; // لو نفس الساعة يحسبها 24 ساعه؟ لو عايزها 0 خليها <0
  if(d>16*60) d = pb - pa; // لو الفرق اكبر من 16 ساعه يبقى هو مش بايت، ارجع للفرق العادي
  // تصحيح بسيط للفرق السالب
  let diff = pb - pa;
  if(diff<0) diff+=24*60;
  return diff/60;
}

function getAutoPharmacyDebt(){
  try{ const daily=L(DAILY_KEY,[]); let sum=0; daily.forEach(r=>{ if((r.category||'').includes('صيدلية')||(r.category||'').includes('صيدليه')) sum+=Number(r.amount)||0; }); return sum; }catch{ return 0; }
}

// فورمات 10000 -> 10,000
function fmtMoney(n){
  if(isNaN(n)) return '0';
  return Number(n).toLocaleString('en-US');
}

export function renderAttendance(){
  const data=L(KEY,[]); let st=L(SETTINGS, DEFAULT);
  const autoDebt=getAutoPharmacyDebt();
  let pharmacyDebt=Number(st.pharmacyDebt); if((!pharmacyDebt||pharmacyDebt===4450)&&autoDebt>0) pharmacyDebt=autoDebt;
  const totalSalary=Number(st.totalSalary)||1100, workDays=Number(st.workDays)||26, required=Number(st.required)||15000;
  const hourPrice=workDays?(totalSalary/workDays):0;
  const now=new Date(), y=now.getFullYear(), m=now.getMonth(), days=getDays(y,m), cur=`${y}-${String(m+1).padStart(2,'0')}`;

  let totalHours = 0;
  data.forEach(x=>{
    if((x.date||'').slice(0,7)===cur){
      totalHours += calcHours(x.in, x.out);
    }
  });

  const net=hourPrice*totalHours;
  const reqDaily=hourPrice&&workDays?(required/hourPrice/workDays):0;
  const remain=net-pharmacyDebt;

  return `<div style="padding:2px; height:100dvh; display:flex; flex-direction:column; gap:3px">
    <div class="card" style="margin:0; padding:0; overflow:hidden; border-radius:10px; border:1px solid #e5e7eb; flex:0 0 auto">
      <div style="background:#0f172a; color:#fff; padding:3px; font-size:9px; font-weight:700; text-align:center">الحسابات - ربع صفحة</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; background:#fff">
        <div style="display:flex; flex-direction:column">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:22px; border-bottom:1px solid #f3f4f6; border-left:1px solid #f3f4f6"><span style="font-size:9px">الساعة</span><input data-k="totalSalary" class="inline-edit" type="text" inputmode="numeric" value="${fmtMoney(totalSalary)}" style="width:70px; height:18px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; text-align:center; font-weight:700"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:22px; border-bottom:1px solid #f3f4f6; border-left:1px solid #f3f4f6"><span style="font-size:9px">كم يوم</span><input data-k="workDays" class="inline-edit" type="text" inputmode="numeric" value="${workDays}" style="width:56px; height:18px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; text-align:center; font-weight:700"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:20px; border-bottom:1px solid #f3f4f6; border-left:1px solid #f3f4f6"><span style="font-size:9px; color:#64748b">سعر الساعة</span><span style="font-size:10px; font-weight:800; color:#10b981">${fmtMoney(hourPrice.toFixed(2))}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:20px; border-bottom:1px solid #f3f4f6; border-left:1px solid #f3f4f6"><span style="font-size:9px; color:#64748b">عدد الساعات</span><span style="font-size:10px; font-weight:700">${totalHours.toFixed(1)}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:22px; background:#ecfdf5; border-left:1px solid #f3f4f6"><span style="font-size:9px; font-weight:700">الصافي</span><span style="font-size:11px; font-weight:900; color:#059669">${fmtMoney(net.toFixed(0))}</span></div>
        </div>
        <div style="display:flex; flex-direction:column">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:22px; border-bottom:1px solid #f3f4f6"><span style="font-size:9px">المطلوب</span><input data-k="required" class="inline-edit" type="text" inputmode="numeric" value="${fmtMoney(required)}" style="width:70px; height:18px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; text-align:center; font-weight:700"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:22px; border-bottom:1px solid #f3f4f6"><span style="font-size:9px; color:#64748b">المطلوب يوميا</span><span style="font-size:10px; font-weight:700; color:#f59e0b">${reqDaily.toFixed(2)}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:22px; border-bottom:1px solid #f3f4f6"><span style="font-size:9px">ديون الصيدلية ${autoDebt>0?'('+fmtMoney(autoDebt)+')':''}</span><input data-k="pharmacyDebt" class="inline-edit" type="text" inputmode="numeric" value="${fmtMoney(pharmacyDebt)}" style="width:70px; height:18px; border:1px solid #e5e7eb; border-radius:6px; font-size:10px; text-align:center; font-weight:700"></div>
          <div style="height:20px; border-bottom:1px solid #f3f4f6"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 6px; height:22px; background:#fff1f2"><span style="font-size:9px; font-weight:700">المتبقي</span><span style="font-size:11px; font-weight:900; color:${remain<0?'#e11d48':'#059669'}">${fmtMoney(fmtNum(remain))}</span></div>
        </div>
      </div>
    </div>
    <div class="card" style="margin:0; padding:0; overflow:hidden; border-radius:10px; border:1px solid #e5e7eb; flex:1 1 auto; display:flex; flex-direction:column; min-height:0">
      <div style="display:flex; justify-content:space-between; padding:3px 8px; background:#f9fafb; border-bottom:1px solid #e5e7eb; font-size:8px; font-weight:700; flex:0 0 auto"><span>${cur} - ${totalHours.toFixed(1)}س - ${fmtMoney(net.toFixed(0))}ج</span><span style="background:#10b981; color:#fff; padding:1px 6px; border-radius:20px">75% ادخال</span></div>
      <div style="overflow:auto; flex:1 1 auto"><table class="pro-table" style="margin:0; width:100%; border:0; font-size:10px"><thead style="position:sticky; top:0; background:#fff"><tr style="font-size:7px; color:#9ca3af"><th style="padding:2px; width:24px">ي</th><th style="padding:2px; width:30%">حضور</th><th style="padding:2px; width:30%">انصراف</th><th style="padding:2px; width:28px">س</th><th style="padding:2px">م</th></tr></thead><tbody>${days.map(d=>{
        const iso=d.toISOString().slice(0,10);
        const rec=data.find(x=>(x.date||'').slice(0,10)===iso)||{id:uid(), date:d.toISOString(), in:'', out:'', hours:0, note:''};
        const dayHours = calcHours(rec.in, rec.out);
        return `<tr style="border-top:1px solid #f9fafb">
          <td style="padding:1px; text-align:center"><b style="font-size:8px">${d.getDate()}</b></td>
          <td style="padding:1px"><input type="text" placeholder="7 ص" value="${rec.in? format12(rec.in) : ''}" data-d="${iso}" data-f="in" class="time-input" inputmode="numeric" style="width:100%; padding:3px 1px; border:1px solid ${rec.in?'#a7f3d0':'#e5e7eb'}; border-radius:4px; font-size:9px; text-align:center; height:18px"></td>
          <td style="padding:1px"><input type="text" placeholder="7 م" value="${rec.out? format12(rec.out) : ''}" data-d="${iso}" data-f="out" class="time-input" inputmode="numeric" style="width:100%; padding:3px 1px; border:1px solid ${rec.out?'#fecaca':'#e5e7eb'}; border-radius:4px; font-size:9px; text-align:center; height:18px"></td>
          <td style="padding:1px; text-align:center; font-weight:800; font-size:8px; color:${dayHours>0?'#059669':'#9ca3af'}">${dayHours>0?dayHours.toFixed(1):'-'}</td>
          <td style="padding:1px"><input type="text" value="${rec.note||''}" data-d="${iso}" data-f="note" placeholder="" style="width:100%; padding:2px; border:1px solid #f3f4f6; border-radius:3px; font-size:7px; height:16px"></td>
        </tr>`
      }).join('')}</tbody></table></div>
    </div>
  </div>`;
}

export function handleAttendance(btn,e,rerender){
  let st=L(SETTINGS, DEFAULT);
  let data=L(KEY,[]);
  const t=e.target;

  if(t.classList.contains('inline-edit')){
    // يشيل الفواصل قبل الحفظ 10,000 -> 10000
    let raw = toEnDigits(t.value).replace(/,/g,'');
    st[t.dataset.k]= raw === ''? 0 : parseFloat(raw)||0;
    S(SETTINGS,st);
    if(e.type === 'change'){
      // يرجع يعرضها بفاصلة
      t.value = fmtMoney(st[t.dataset.k]);
      rerender();
    }
    return;
  }

  if(t.classList.contains('time-input')){
    const iso=t.dataset.d, f=t.dataset.f;
    let rec=data.find(x=>(x.date||'').slice(0,10)===iso);
    if(!rec){
      rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''};
      data.push(rec);
    }

    if(e.type === 'input'){
      rec[f]=t.value;
      S(KEY,data);
    } else {
      let p=smartParse(t.value);
      if(p){
        rec[f]=p;
        t.value = format12(p);
      } else {
        rec[f]=t.value;
      }
      rec.hours=calcHours(rec.in, rec.out);
      S(KEY,data);
      rerender();
    }
    return;
  }

  if(t.dataset.f==='note'){
    const iso=t.dataset.d;
    let rec=data.find(x=>(x.date||'').slice(0,10)===iso);
    if(!rec){
      rec={id:uid(), date:new Date(iso).toISOString(), in:'', out:'', hours:0, note:''};
      data.push(rec);
    }
    rec.note=t.value;
    S(KEY,data);
    return;
  }
      }

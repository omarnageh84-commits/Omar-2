// attendance.js - V6.1 FIXED - الحضور فقط - احترافي ومنفصل تماما
import { L, S, calc } from './utils.js';
import { syncToSheet } from './sheets.js';

const KEY = 'att_v6';
const PHARM_KEY = 'pharm_v6';
const RATE_KEY = 'rate_v6';
const TARGET_KEY = 'target_v6';

export function renderAttendance(){
  const pharm = L(PHARM_KEY, 0);
  const rate = L(RATE_KEY, 40.74);
  const target = L(TARGET_KEY, 423);
  const list = L(KEY, []);
  const days = Array.from({length: 31}, (_,i) => i+1);
  const totalHours = list.reduce((s,r) => s + (r.h || 0), 0);
  const totalPay = totalHours * rate;

  return `
    <div class="card">
      <b>⚙️ إعدادات العمل</b>
      <div class="inp">
        <input id="pharmIn" type="number" value="${pharm}" placeholder="رقم الصيدلية">
        <input id="rateIn" type="number" step="0.01" value="${rate}" placeholder="سعر الساعة">
        <input id="targetIn" type="number" value="${target}" placeholder="التارجت">
      </div>
      <button class="btn" data-action="saveAttHeader">💾 حفظ الإعدادات</button>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px; font-size:12px">
        <div style="background:#f0fdf4; padding:10px; border-radius:10px; border:1px solid #bbf7d0">
          <small>إجمالي الساعات</small><br><b style="font-size:16px">${totalHours.toFixed(2)} ساعة</b>
        </div>
        <div style="background:#eff6ff; padding:10px; border-radius:10px; border:1px solid #bfdbfe">
          <small>الإجمالي المادي</small><br><b style="font-size:16px">${totalPay.toFixed(0)} جنيه</b>
        </div>
      </div>
    </div>

    <div style="margin:10px">
      ${days.map(d => {
        const row = list.find(x => x.day == d) || {day: d, in: '', out: '', h: 0};
        return `
          <div class="att">
            <b style="font-size:13px">${d}</b>
            <input type="time" value="${row.in}" data-action="upAtt" data-day="${d}" data-type="in">
            <input type="time" value="${row.out}" data-action="upAtt" data-day="${d}" data-type="out">
            <div style="display:flex; gap:4px; align-items:center">
              <span style="font-size:11px; font-weight:800; color:var(--green)">${row.h? row.h+'س' : ''}</span>
              <button class="now" data-action="nowAtt" data-day="${d}" data-type="in">الآن</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function handleAttendance(btn, e, rerender){
  const action = btn.dataset.action;

  if(action === 'saveAttHeader'){
    S(PHARM_KEY, +document.getElementById('pharmIn').value || 0);
    S(RATE_KEY, +document.getElementById('rateIn').value || 0);
    S(TARGET_KEY, +document.getElementById('targetIn').value || 0);
    rerender();
    return;
  }

  if(action === 'nowAtt'){
    const time = new Date().toTimeString().slice(0,5);
    upsert(btn.dataset.day, btn.dataset.type, time);
    rerender();
    return;
  }

  if(action === 'upAtt'){
    // للـ change event القيمة بتيجي من الـ input نفسه
    const value = btn.value || e.target.value;
    upsert(btn.dataset.day, btn.dataset.type, value);
    rerender();
    return;
  }
}

function upsert(day, type, val){
  let list = L(KEY, []);
  let row = list.find(x => x.day == day) || {day: +day, in: '', out: '', h: 0};
  row[type] = val;
  if(row.in && row.out){
    row.h = calc(row.in, row.out);
  } else {
    row.h = 0;
  }
  const idx = list.findIndex(x => x.day == day);
  if(idx > -1) list[idx] = row;
  else list.push(row);

  // ترتيب حسب اليوم
  list.sort((a,b) => a.day - b.day);

  S(KEY, list);
  syncToSheet('attendance', row);
}

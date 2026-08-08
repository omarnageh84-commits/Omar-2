// attendance.js - V6.2 FINAL - حضور وانصراف بدون مشاكل
import { L, S, calc } from './utils.js';
import { syncToSheet } from './sheets.js';

const KEY = 'att_v6';

export function renderAttendance(){
  const pharm = L('pharm_v6', 0);
  const rate = L('rate_v6', 40.74);
  const target = L('target_v6', 423);
  const list = L(KEY, []);

  const totalHours = list.reduce((s,r) => s + (r.h || 0), 0);
  const totalPay = totalHours * rate;

  return `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
        <b>⚙️ إعدادات العمل</b>
        <small style="color:#6b7280">${new Date().toLocaleDateString('ar-EG',{month:'long', year:'numeric'})}</small>
      </div>
      <div class="inp">
        <input id="pharmIn" type="number" value="${pharm}" placeholder="رقم الصيدلية">
        <input id="rateIn" type="number" step="0.01" value="${rate}" placeholder="سعر الساعة">
        <input id="targetIn" type="number" value="${target}" placeholder="التارجت">
      </div>
      <button class="btn" data-action="saveHeader">💾 حفظ الإعدادات</button>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px">
        <div style="background:#f0fdf4; padding:12px; border-radius:12px; text-align:center; border:1px solid #bbf7d0">
          <small style="color:#15803d">إجمالي الساعات</small><br>
          <b style="font-size:18px; color:#15803d">${totalHours.toFixed(2)}</b>
        </div>
        <div style="background:#eff6ff; padding:12px; border-radius:12px; text-align:center; border:1px solid #bfdbfe">
          <small style="color:#1d4ed8">الإجمالي المادي</small><br>
          <b style="font-size:18px; color:#1d4ed8">${totalPay.toFixed(0)} ج</b>
        </div>
      </div>
    </div>

    <div class="card" style="padding:8px">
      <div style="display:grid; grid-template-columns:32px 1fr 1fr auto; gap:8px; padding:8px 12px; font-size:11px; font-weight:800; color:#6b7280">
        <span>اليوم</span><span style="text-align:center">دخول</span><span style="text-align:center">خروج</span><span>ساعات</span>
      </div>
      ${Array.from({length:31}, (_,i)=>{
        const day = i+1;
        const row = list.find(x=>x.day==day) || {day, in:'', out:'', h:0};
        return `
        <div class="att">
          <b>${day}</b>
          <input type="time" value="${row.in}" data-action="setIn" data-day="${day}">
          <input type="time" value="${row.out}" data-action="setOut" data-day="${day}">
          <div class="att-row-actions">
            ${row.h?`<span style="background:var(--green-light); color:var(--green-dark); padding:6px 10px; border-radius:8px; font-weight:800; font-size:12px">${row.h}س</span>`:''}
            <button class="now" data-action="nowIn" data-day="${day}">دخول الآن</button>
            <button class="now" style="border-color:#bbf7d0; color:var(--green)" data-action="nowOut" data-day="${day}">خروج الآن</button>
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

export function handleAttendance(btn, e, rerender){
  const action = btn.dataset.action;
  const day = btn.dataset.day;

  if(action === 'saveHeader'){
    S('pharm_v6', +document.getElementById('pharmIn').value || 0);
    S('rate_v6', +document.getElementById('rateIn').value || 0);
    S('target_v6', +document.getElementById('targetIn').value || 0);
    rerender();
    return;
  }

  if(action === 'nowIn'){
    upsert(day, 'in', nowTime()); rerender(); return;
  }
  if(action === 'nowOut'){
    upsert(day, 'out', nowTime()); rerender(); return;
  }
  if(action === 'setIn'){
    upsert(day, 'in', btn.value); rerender(); return;
  }
  if(action === 'setOut'){
    upsert(day, 'out', btn.value); rerender(); return;
  }
}

function nowTime(){
  return new Date().toTimeString().slice(0,5);
}

function upsert(day, type, val){
  let list = L(KEY, []);
  let row = list.find(x=>x.day==day) || {day:+day, in:'', out:'', h:0};
  row[type] = val;
  if(row.in && row.out){
    row.h = calc(row.in, row.out);
  } else {
    row.h = 0;
  }
  const idx = list.findIndex(x=>x.day==day);
  if(idx > -1) list[idx] = row;
  else list.push(row);
  list.sort((a,b)=>a.day-b.day);
  S(KEY, list);
  syncToSheet('attendance', row);
}

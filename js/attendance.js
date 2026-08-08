// attendance.js - V6 Pro - الحضور فقط
import { L, S, calc } from './utils.js';
import { syncToSheet } from './sheets.js';

const KEY = 'att_v6';

export function renderAttendance(){
  const pharm = L('pharm_v6',0), rate = L('rate_v6',40.74), target = L('target_v6',423);
  const list = L(KEY, []);
  const days = Array.from({length:31},(_,i)=>i+1);
  const total = list.reduce((s,r)=>s+(r.h||0),0);

  return `
    <div class="card">
      <div class="inp"><input id="pharmIn" type="number" value="${pharm}" placeholder="صيدلية"><input id="rateIn" type="number" value="${rate}" placeholder="الساعة"><input id="targetIn" type="number" value="${target}" placeholder="التارجت"></div>
      <button class="btn" data-action="saveAttHeader">حفظ الإعدادات</button>
      <div style="margin-top:10px; font-size:12px">الإجمالي: <b>${total.toFixed(2)} ساعة</b></div>
    </div>
    <div style="margin:10px">
      ${days.map(d=>{
        const row = list.find(x=>x.day===d) || {day:d,in:'',out:'',h:0};
        return `<div class="att">
          <b>${d}</b>
          <input type="time" value="${row.in}" data-action="upAtt" data-day="${d}" data-type="in">
          <input type="time" value="${row.out}" data-action="upAtt" data-day="${d}" data-type="out">
          <span>${row.h?row.h+'س':''} <button class="now" data-action="nowAtt" data-day="${d}" data-type="in">الآن</button></span>
        </div>`;
      }).join('')}
    </div>
  `;
}

export function bindAttendanceEvents(root, rerender){
  root.addEventListener('click', e=>{
    const b = e.target.closest('[data-action]'); if(!b) return;
    if(b.dataset.action==='saveAttHeader'){
      S('pharm_v6', +document.getElementById('pharmIn').value||0);
      S('rate_v6', +document.getElementById('rateIn').value||0);
      S('target_v6', +document.getElementById('targetIn').value||0);
      rerender();
    }
    if(b.dataset.action==='nowAtt'){
      const time = new Date().toTimeString().slice(0,5);
      upsert(b.dataset.day, b.dataset.type, time); rerender();
    }
  });
  root.addEventListener('change', e=>{
    const inp = e.target.closest('[data-action="upAtt"]'); if(!inp) return;
    upsert(inp.dataset.day, inp.dataset.type, inp.value); rerender();
  });
  function upsert(day, type, val){
    let list = L(KEY, []);
    let row = list.find(x=>x.day==day) || {day:+day,in:'',out:'',h:0};
    row[type]=val; if(row.in&&row.out) row.h=calc(row.in,row.out);
    const idx = list.findIndex(x=>x.day==day);
    if(idx>-1) list[idx]=row; else list.push(row);
    S(KEY, list); syncToSheet('attendance', row);
  }
}

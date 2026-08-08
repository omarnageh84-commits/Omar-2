import { L, S, calc, fmt } from './utils.js';
import { syncToSheet } from './sheets.js';
const KEY='att_v6';
export function renderAttendance(){
  let list=L(KEY,[]), rate=L('rate_v6',40.74), total=list.reduce((s,r)=>s+(r.h||0),0);
  return `<div class="card"><b>الحضور</b> ${fmt(total*rate)}<div class="inp"><input id="rateIn" type="number" value="${rate}"><button class="btn-sm" style="background:#10b981;color:#fff" data-action="saveRate">حفظ</button></div></div>
  ${Array.from({length:31},(_,i)=>{let d=i+1,r=list.find(x=>x.day==d)||{day:d,in:'',out:'',h:0}; return `<div class="att"><b>${d}</b><input type="time" value="${r.in}" data-action="setIn" data-day="${d}"><input type="time" value="${r.out}" data-action="setOut" data-day="${d}"><span><button class="now" data-action="nowIn" data-day="${d}">الآن</button> ${r.h?r.h+'س':''}</span></div>`}).join('')}`;
}
export function handleAttendance(btn,e,rerender){
  let day=btn.dataset.day;
  if(btn.dataset.action==='saveRate'){S('rate_v6',+document.getElementById('rateIn').value||0); rerender();}
  if(btn.dataset.action==='nowIn'){upsert(day,'in',new Date().toTimeString().slice(0,5)); rerender();}
  if(btn.dataset.action==='setIn'){upsert(day,'in',btn.value); rerender();}
  if(btn.dataset.action==='setOut'){upsert(day,'out',btn.value); rerender();}
}
function upsert(day,type,val){let l=L('att_v6',[]), r=l.find(x=>x.day==day)||{day:+day,in:'',out:'',h:0}; r[type]=val; if(r.in&&r.out) r.h=calc(r.in,r.out); let i=l.findIndex(x=>x.day==day); if(i>-1)l[i]=r; else l.push(r); l.sort((a,b)=>a.day-b.day); S('att_v6',l); import('./sheets.js').then(m=>m.syncToSheet('attendance',r));}

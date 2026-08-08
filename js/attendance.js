import { L, S, calc } from './utils.js';
export const renderAttendance=()=>{
  const rate=L('rate_v6',40.74), list=L('att_v6',[]), total=list.reduce((s,r)=>s+(r.h||0),0);
  return `<div class="card"><div class="inp"><input id="rateIn" type="number" value="${rate}" placeholder="سعر الساعة"><input id="pharmIn" type="number" value="${L('pharm_v6',0)}" placeholder="الصيدلية"></div><button class="btn" data-action="saveHeader">حفظ</button><div style="margin-top:10px">الاجمالي: <b>${total.toFixed(2)} ساعة</b></div></div>
  <div style="margin:10px">${Array.from({length:31},(_,i)=>{
    const d=i+1, r=list.find(x=>x.day==d)||{day:d,in:'',out:'',h:0};
    return `<div class="att" style="display:grid; grid-template-columns:30px 1fr 1fr auto; gap:6px; background:#fff; border-radius:12px; padding:8px; margin:6px 0"><b>${d}</b><input type="time" value="${r.in}" data-action="setIn" data-day="${d}"><input type="time" value="${r.out}" data-action="setOut" data-day="${d}"><div style="display:flex; gap:4px"><button class="now" data-action="nowIn" data-day="${d}">دخول</button><button class="now" data-action="nowOut" data-day="${d}">خروج</button><b style="color:#10b981">${r.h?r.h+'س':''}</b></div></div>`
  }).join('')}</div>`;
};
export const handleAttendance=(btn,e,rerender)=>{
  const d=btn.dataset.day;
  if(btn.dataset.action==='saveHeader'){S('rate_v6',+document.getElementById('rateIn').value||0);S('pharm_v6',+document.getElementById('pharmIn').value||0);rerender();}
  if(btn.dataset.action==='nowIn'){upsert(d,'in',new Date().toTimeString().slice(0,5));rerender();}
  if(btn.dataset.action==='nowOut'){upsert(d,'out',new Date().toTimeString().slice(0,5));rerender();}
  if(btn.dataset.action==='setIn'){upsert(d,'in',btn.value);rerender();}
  if(btn.dataset.action==='setOut'){upsert(d,'out',btn.value);rerender();}
};
function upsert(day,type,val){let list=L('att_v6',[]),row=list.find(x=>x.day==day)||{day:+day,in:'',out:'',h:0};row[type]=val;if(row.in&&row.out)row.h=calc(row.in,row.out);const i=list.findIndex(x=>x.day==day);if(i>-1)list[i]=row;else list.push(row);list.sort((a,b)=>a.day-b.day);S('att_v6',list);}

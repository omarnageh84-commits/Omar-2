export function handleAttendance(btn, e, rerender){
  if(btn.dataset.action==='saveAttHeader'){
    S('pharm_v6', +document.getElementById('pharmIn').value||0);
    S('rate_v6', +document.getElementById('rateIn').value||0);
    S('target_v6', +document.getElementById('targetIn').value||0);
    rerender();
  }
  if(btn.dataset.action==='nowAtt'){
    upsert(btn.dataset.day, btn.dataset.type, new Date().toTimeString().slice(0,5)); rerender();
  }
  if(btn.dataset.action==='upAtt'){
    upsert(btn.dataset.day, btn.dataset.type, btn.value); rerender();
  }
}
function upsert(day,type,val){
  let list=L('att_v6',[]); let row=list.find(x=>x.day==day)||{day:+day,in:'',out:'',h:0};
  row[type]=val; if(row.in&&row.out) row.h=calc(row.in,row.out);
  const idx=list.findIndex(x=>x.day==day); if(idx>-1) list[idx]=row; else list.push(row);
  S('att_v6',list); syncToSheet('attendance',row);
}

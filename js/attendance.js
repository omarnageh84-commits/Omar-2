import { L, S, calc } from './utils.js';

export function renderAttendance(){
  let rate=L('rate',40.74), pharm=L('pharm',0), target=L('target',423), m=L('att',Array.from({length:31},(_,i)=>({day:i+1,in:'',out:'',h:0})));
  if(m.length<31) m=Array.from({length:31},(_,i)=>m.find(x=>x.day===i+1)||{day:i+1,in:'',out:'',h:0});
  let tot=m.reduce((s,r)=>s+(r.h||0),0), remain=422.8 - tot;

  return `
  <div class="card" style="padding:8px">
    <div style="font-weight:800;text-align:center">💰 ملخص المرتب - أغسطس - الحضور والانصراف</div>
    <div class="h-scroll" style="margin-top:8px">
      <table>
        <tr><th>عدد الساعات</th><th>الصافي</th><th>المطلوب</th><th>مطلوب يوميا</th><th>ديون للصيدلية</th><th>المتبقي</th></tr>
        <tr><td>${tot.toFixed(1)}</td><td>${(tot*rate).toFixed(0)}</td><td><input id="targetIn" value="${target}" style="width:60px;border:1px solid #ddd;border-radius:6px;text-align:center"></td><td>13.64</td><td><input id="pharmIn" value="${pharm}" style="width:60px;border:1px solid #ddd;border-radius:6px;text-align:center"></td><td>${remain.toFixed(1)}</td></tr>
      </table>
    </div>
    <div class="inp" style="margin-top:10px">
      <button class="btn" style="width:90px" onclick="window.saveAttHeader()">حفظ</button>
      <input id="rateIn" value="${rate}" style="flex:1;border:1px solid #ddd;border-radius:10px;padding:8px;text-align:center"><span style="font-size:11px">٤.٧٤</span>
      <input type="range" min="20" max="60" value="${rate}" oninput="rateIn.value=this.value" style="flex:1">
    </div>
  </div>
  <div class="card" style="padding:6px">
    <div style="display:flex;justify-content:space-between;font-weight:800;padding:4px"><span>${tot.toFixed(1)} س</span><span>الحضور - 31 يوم</span></div>
    ${m.map(r=>`<div class="att"><b>${r.day}</b><div style="display:flex;gap:2px"><input type="time" value="${r.in}" onchange="window.upAtt(${r.day},'in',this.value)" style="flex:1;border:1px solid #eee;border-radius:8px;padding:4px"><button class="now" onclick="window.nowAtt(${r.day},'in')">الآن</button></div><div style="display:flex;gap:2px"><input type="time" value="${r.out}" onchange="window.upAtt(${r.day},'out',this.value)" style="flex:1;border:1px solid #eee;border-radius:8px;padding:4px"><button class="now" onclick="window.nowAtt(${r.day},'out')">الآن</button></div><b style="color:#10b981">${r.h?r.h.toFixed(2):'--'}</b></div>`).join('')}
  </div>`;
}

export function bindAttendance(){
  window.saveAttHeader=()=>{ S('pharm',+pharmIn.value||0); S('rate',+rateIn.value||40.74); S('target',+targetIn.value||423); document.getElementById('root').innerHTML=renderAttendance(); bindAttendance(); };
  window.upAtt=(day,type,val)=>{ let l=L('att',[]),r=l.find(x=>x.day===day)||{day,in:'',out:'',h:0}; r[type]=val; if(r.in&&r.out) r.h=calc(r.in,r.out); let i=l.findIndex(x=>x.day===day); if(i>-1) l[i]=r; else l.push(r); S('att',l); document.getElementById('root').innerHTML=renderAttendance(); bindAttendance(); };
  window.nowAtt=(d,t)=>{ window.upAtt(d,t,new Date().toTimeString().slice(0,5)); };
}

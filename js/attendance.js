import { load, save, calcHours } from './utils.js';
import { syncToSheet } from './sheets.js';

export function renderAttendance(){
  let month = load('attendance', Array.from({length:31},(_,i)=>({day:i+1, in:'', out:'', hours:0})));
  let total = month.reduce((s,r)=>s+r.hours,0);
  return `
  <div class="card">
    <div style="display:flex;justify-content:space-between"><b>11.7 س</b><b>الحضور - 31 يوم 📅</b></div>
  </div>
  <div class="card">
    ${month.map(r=>`
    <div class="att-row">
      <b>${r.day}</b>
      <div style="display:flex;gap:4px"><input type="time" data-day="${r.day}" data-type="in" value="${r.in}" style="flex:1"><button class="now-btn" onclick="setNow(${r.day},'in')">الآن</button></div>
      <div style="display:flex;gap:4px"><input type="time" data-day="${r.day}" data-type="out" value="${r.out}" style="flex:1"><button class="now-btn" onclick="setNow(${r.day},'out')">الآن</button></div>
      <span style="color:#10b981;font-weight:800">${r.hours||'--'}</span>
    </div>`).join('')}
    <div style="text-align:center;margin-top:12px"><b>الإجمالي: ${total.toFixed(2)} ساعة</b></div>
  </div>
  <script>window.setNow=(d,t)=>{let now=new Date().toTimeString().slice(0,5); document.querySelector(\`input[data-day="\${d}"][data-type="\${t}"]\`).value=now; document.querySelector(\`input[data-day="\${d}"][data-type="\${t}"]\`).dispatchEvent(new Event('change'))}</script>
  `;
}

export function bindAttendance(){
  document.addEventListener('change', e=>{
    if(e.target.matches('input[type="time"]')){
      let day=+e.target.dataset.day; let type=e.target.dataset.type;
      let list = JSON.parse(localStorage.getItem('attendance'))||[];
      let row = list.find(x=>x.day===day)||{day,in:'',out:'',hours:0};
      row[type]=e.target.value;
      if(row.in && row.out){
        const calc = (a,b)=>{let [h1,m1]=a.split(':').map(Number);let[h2,m2]=b.split(':').map(Number);let d=(h2*60+m2)-(h1*60+m1);if(d<0)d+=1440;return +(d/60).toFixed(2)};
        row.hours=calc(row.in,row.out);
      }
      let idx=list.findIndex(x=>x.day===day); if(idx>-1) list[idx]=row; else list.push(row);
      localStorage.setItem('attendance', JSON.stringify(list));
      syncToSheet('attendance', row);
      document.getElementById('appContent').innerHTML = renderAttendance();
    }
  });
}

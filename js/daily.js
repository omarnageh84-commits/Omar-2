import { load, save } from './utils.js';
import { syncToSheet } from './sheets.js';

export function renderDaily(){
  const data = load('daily', { rate:40.74, pharmacy:0, target:410, records:[] });
  return `
  <div class="card" style="background:#10b981;color:#fff">
    <div style="display:flex;justify-content:space-between"><span>الجمعة ${new Date().toLocaleDateString('ar-EG')}</span><b>يومياتي 💼</b></div>
  </div>
  <div class="card table-card">
    <h4>💰 ملخص المرتب - ${new Date().toLocaleString('ar-EG',{month:'long'})}</h4>
    <div class="summary-grid">
      <div><span>سعر الساعة</span><b>${data.rate}</b></div>
      <div><span>عدد الساعات</span><b>${data.records.reduce((s,r)=>s+r.hours,0).toFixed(1)}</b></div>
      <div><span>الصافي</span><b class="positive">${(data.records.reduce((s,r)=>s+r.hours,0)*data.rate).toFixed(0)}</b></div>
      <div><span>المتبقي</span><b class="negative">${(data.records.reduce((s,r)=>s+r.hours,0)*data.rate - data.target).toFixed(0)}</b></div>
    </div>
    <div class="input-row">
      <input id="rate" type="number" value="${data.rate}" placeholder="سعر الساعة">
      <input id="pharmacy" type="number" value="${data.pharmacy}" placeholder="ديون صيدلية">
    </div>
    <button class="btn" id="saveRate">حفظ</button>
  </div>
  <div class="card">
    <h4>سجل اليومية</h4>
    <div class="input-row">
      <input id="d_amount" placeholder="المبلغ / وصف">
      <select id="d_type"><option>دخل</option><option>مصروف</option><option>دين صيدلية</option></select>
    </div>
    <button class="btn" id="addDaily">إضافة +</button>
    <div id="dailyList">${data.records.map(r=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #eee"><span>${r.desc}</span><b class="${r.type=='مصروف'?'negative':'positive'}">${r.amount}</b></div>`).join('')}</div>
  </div>`;
}

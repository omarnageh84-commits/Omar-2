// dashboard.js - V6 Pro - الرئيسية فقط
import { L, formatEGP } from './utils.js';

export function renderDashboard(){
  const daily = L('daily_v6', []);
  const att = L('att_v6', []);
  const tasks = L('notion_tasks_v6', []);
  const notes = L('notion_notes_v6', []);

  const totalHours = att.reduce((s,r)=>s+(r.h||0),0);
  const income = daily.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0);
  const expense = daily.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
  const doneTasks = tasks.filter(t=>t.done).length;

  return `
    <div class="card" style="background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:0">
      <h2 style="margin:0 0 4px">أهلا يا عمر 👋</h2>
      <p style="margin:0; opacity:.9; font-size:13px">${totalHours.toFixed(1)} ساعة عمل • ${daily.length} حركة مالية</p>
      <div class="stat-grid" style="margin-top:16px">
        <div style="background:rgba(255,255,255,.18); padding:12px; border-radius:12px"><b>${formatEGP(income-expense)}</b><br><small>الصافي</small></div>
        <div style="background:rgba(255,255,255,.18); padding:12px; border-radius:12px"><b>${doneTasks}/${tasks.length}</b><br><small>مهام منجزة</small></div>
      </div>
    </div>

    <div class="stat-grid" style="margin:0 12px">
      <div class="card" style="margin:0"><small>ملاحظات</small><h3 style="margin:4px 0">${notes.length}</h3></div>
      <div class="card" style="margin:0"><small>مهام متبقية</small><h3 style="margin:4px 0">${tasks.length-doneTasks}</h3></div>
    </div>

    <div class="card"><b>آخر الحركات</b>
      ${daily.slice(0,5).map(x=>`<div style="display:flex; justify-content:space-between; padding:8px 0; border-top:1px solid #f3f4f6"><span>${x.desc} - ${x.category}</span><b style="color:${x.type==='income'?'#10b981':'#ef4444'}">${x.type==='income'?'+':'-'}${x.amount}</b></div>`).join('') || '<div class="empty"><span>📭</span>لا يوجد حركات</div>'}
    </div>
  `;
}

import { L, S, uid, fmt } from './utils.js';
import { syncToSheet } from './sheets.js';

const KEY='daily_v6', CATS='cats_daily_v6';
let tab='income';

const PAY_METHODS=['كاش 💵','فودافون كاش 📱','إنستا باي 🏦','فيزا 💳','آجل'];

export function renderDaily(){
  const data=L(KEY,[]), cats=L(CATS,{income:['راتب صيدلية','مكافأة','شفت إضافي'],expense:['أكل','مواصلات','إيجار','صيدلية','شحن'],debt:['دين لي','دين علي']});
  const curCats=cats[tab]||[];
  const filtered=data.filter(x=>x.type===tab);
  const total=filtered.reduce((s,x)=>s+x.amount,0);

  // تقرير حسب الفئة
  let report={}; curCats.forEach(c=>report[c]=filtered.filter(x=>x.category===c).reduce((s,x)=>s+x.amount,0));

  return `
  <div class="card form-card">
    <div class="seg">
      <button class="${tab==='expense'?'active':''}" data-action="setTab" data-tab="expense">مصروف 🔴</button>
      <button class="${tab==='income'?'active':''}" data-action="setTab" data-tab="income">دخل 🟢</button>
      <button class="${tab==='debt'?'active':''}" data-action="setTab" data-tab="debt">دين 🟡</button>
    </div>

    <div style="margin-top:18px">
      <div class="form-title">📂 الفئات - ${tab==='income'?'الدخل':tab==='expense'?'المصروف':'الديون'}</div>
      <div class="chip-select">
        ${curCats.map(c=>`<div class="chip">${c} <b data-action="delCat" data-cat="${c}" style="margin-right:6px; color:#e11d48; cursor:pointer">✕</b></div>`).join('')}
      </div>
      <div class="inp"><input id="newCat" placeholder="إضافة فئة جديدة... مثلا: أوبر"><button class="btn-sm" style="background:var(--green);color:#fff;padding:12px 18px;border-radius:12px" data-action="addCat">+ إضافة</button></div>
    </div>
  </div>

  <div class="card form-card">
    <div class="form-title">${tab==='income'?'💰 إضافة دخل جديد':'💸 إضافة مصروف جديد - مفصل'}</div>

    <div class="form-grid">
      <div class="input-group"><label>الوصف / السبب</label><input id="dDesc" placeholder="${tab==='income'?'مثال: راتب صيدلية النهار':'مثال: غدا - مواصلات - شحن'}"></div>
      <div class="input-group"><label>المبلغ (ج)</label><input id="dAmount" type="number" inputmode="numeric" placeholder="0"></div>
    </div>

    <div class="quick-amounts">
      <button data-action="quick" data-val="50">50</button>
      <button data-action="quick" data-val="100">100</button>
      <button data-action="quick" data-val="200">200</button>
      <button data-action="quick" data-val="500">500</button>
      <button data-action="quick" data-val="1000">1000</button>
    </div>

    <div class="form-grid">
      <div class="input-group"><label>الفئة</label><select id="dCat">${curCats.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
      <div class="input-group"><label>طريقة الدفع</label><select id="dPay">${PAY_METHODS.map(p=>`<option>${p}</option>`).join('')}</select></div>
    </div>

    <div class="form-grid" style="margin-top:12px">
      <div class="input-group"><label>التاريخ</label><input id="dDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
      <div class="input-group"><label>ملاحظات (اختياري)</label><input id="dNote" placeholder="تفاصيل إضافية..."></div>
    </div>

    <button class="btn" style="margin-top:16px" data-action="addDaily">💾 حفظ العملية • ${tab==='income'?'دخل':'مصروف'}</button>
    <div style="text-align:center; margin-top:10px; font-size:11px; color:var(--muted)">يتم المزامنة تلقائياً مع Google Sheet 📊</div>
  </div>

  <div class="card report-card">
    <div style="display:flex; justify-content:space-between; align-items:center"><b>📊 تقرير ${tab==='income'?'الدخل':'المصروف'} - الإجمالي: ${fmt(total)}</b><span style="font-size:11px; background:#d8f5e8; color:#0d9b6e; padding:6px 12px; border-radius:20px; font-weight:800">${filtered.length} عملية</span></div>
    ${Object.entries(report).map(([k,v])=> v>0? `<div class="report-row"><span>• ${k}</span><b>${fmt(v)} <small style="color:#94a3b8">(${(v/total*100||0).toFixed(0)}%)</small></b></div>` : '').join('') || '<div style="padding:14px; text-align:center; color:#94a3b8">لا يوجد بيانات</div>'}
  </div>

  <div style="padding:0 2px">
    ${filtered.map(x=>`
    <div class="list-item">
      <div style="flex:1">
        <b style="font-size:13.5px">${x.desc}</b>
        <div class="meta">${x.category} • ${x.pay||'كاش'} • ${x.date?.slice(0,10)||''} ${x.note?'• '+x.note:''}</div>
      </div>
      <div style="display:flex; align-items:center; gap:10px">
        <b style="color:${x.type==='income'?'#10b981':'#e11d48'}; font-size:14px">${x.type==='income'?'+':''}${fmt(x.amount)}</b>
        <button class="btn-sm" style="background:#fff1f2; color:#e11d48" data-action="delDaily" data-id="${x.id}">✕</button>
      </div>
    </div>`).join('') || '<div class="card" style="text-align:center; color:#94a3b8">📭 لا يوجد ${tab} بعد</div>'}
  </div>
  `;
}

export function handleDaily(btn,e,rerender){
  if(btn.dataset.action==='setTab'){tab=btn.dataset.tab; rerender(); return;}
  if(btn.dataset.action==='quick'){document.getElementById('dAmount').value=btn.dataset.val; return;}
  if(btn.dataset.action==='addCat'){let v=document.getElementById('newCat')?.value.trim(); if(!v) return; let c=L(CATS,{income:[],expense:[],debt:[]}); c[tab].push(v); S(CATS,c); rerender(); return;}
  if(btn.dataset.action==='delCat'){let c=L(CATS,{income:[],expense:[],debt:[]}); c[tab]=c[tab].filter(x=>x!==btn.dataset.cat); S(CATS,c); rerender(); return;}
  if(btn.dataset.action==='addDaily'){
    let desc=document.getElementById('dDesc')?.value.trim(), amount=+document.getElementById('dAmount')?.value, cat=document.getElementById('dCat')?.value, pay=document.getElementById('dPay')?.value, date=document.getElementById('dDate')?.value, note=document.getElementById('dNote')?.value.trim();
    if(!desc||!amount) return alert('⚠️ اكتب الوصف والمبلغ');
    let all=L(KEY,[]);
    let obj={id:uid(), desc, amount, category:cat, pay, date: date? new Date(date).toISOString(): new Date().toISOString(), note, type:tab, created:new Date().toISOString()};
    all.unshift(obj); S(KEY,all); syncToSheet('daily',obj); rerender();
    // تصفير بعد الحفظ
    setTimeout(()=>{ document.getElementById('dDesc').value=''; document.getElementById('dAmount').value=''; document.getElementById('dNote').value=''; document.getElementById('dDesc').focus(); },100);
    return;
  }
  if(btn.dataset.action==='delDaily'){ if(!confirm('حذف العملية؟')) return; S(KEY, L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender(); return;}
}

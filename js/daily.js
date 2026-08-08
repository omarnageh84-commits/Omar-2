import { L, S, uid, fmt } from './utils.js';

const KEY='daily_v6';
const CATS='cats_final_v1';
const DEFAULT={
  income:['راتب صيدلية','مكافأة'],
  expense:['أكل','مواصلات','إيجار','صيدلية'],
  due:['سلفة','جمعية'],
  deferred:['قرض','أقساط']
};

let tab='income';
let debtType='due';
let pendingImage=null;
let pendingAudio=null;
let mediaRecorder=null, audioChunks=[], isRecording=false;

const getCats=()=>L(CATS, DEFAULT);
const saveCats=c=>S(CATS,c);

function getMonths(data){
  const set=new Set();
  data.forEach(r=>{ const m=(r.date||'').slice(0,7); if(m) set.add(m); });
  if(!set.size){ for(let i=0;i<4;i++){ let d=new Date(); d.setMonth(d.getMonth()-i); set.add(d.toISOString().slice(0,7)); } }
  return Array.from(set).sort();
}

export function renderDaily(){
  const data=L(KEY,[]);
  const cats=getCats();
  const months=getMonths(data);
  const monthLabels=months.map(m=>{ const [y,mo]=m.split('-'); return `${mo}/${y.slice(2)}`; });

  if(tab==='total'){
    const sumCatMonth=(type,cat,month)=> data.filter(x=>x.type===type && x.category===cat && (x.date||'').slice(0,7)===month).reduce((s,x)=>s+x.amount,0);
    const buildMaster=(title,key,type)=>{
      return `<div class="card daily-master ${key}" style="margin:4px"><div class="daily-master-header ${key}" style="padding:6px 8px"><b style="font-size:11px">📋 ${title}</b><small style="font-size:9px">${cats[key].length} بند</small></div><div style="overflow-x:auto"><table class="pro-table" style="min-width:400px; margin:0; font-size:10px"><tr><th class="sticky-col ${key}" style="min-width:90px">البند</th>${monthLabels.map(l=>`<th style="text-align:center; min-width:45px; font-size:9px">${l}</th>`).join('')}<th style="text-align:center; background:#0f172a; color:#fff; font-size:9px">الإجمالي</th><th style="width:40px"></th></tr>${cats[key].map(cat=>{ const total=months.reduce((s,m)=>s+sumCatMonth(type,cat,m),0); return `<tr><td class="sticky-col ${key}" style="font-size:10px">${cat}</td>${months.map(m=>{ const v=sumCatMonth(type,cat,m); return `<td style="text-align:center; font-size:9px">${v? fmt(v).replace(' ج','') : '-'}</td>`}).join('')}<td style="text-align:center; font-weight:800; background:#f8fafc; font-size:10px">${fmt(total).replace(' ج','')}</td><td><button class="btn-sm btn-edit-sm" style="padding:2px 4px; font-size:9px" data-action="editCatMaster" data-key="${key}" data-old="${cat}">✏️</button><button class="btn-sm btn-del-sm" style="padding:2px 4px; font-size:9px" data-action="delCatMaster" data-key="${key}" data-cat="${cat}">✕</button></td></tr>`}).join('')}<tfoot><tr><td colspan="${months.length+3}"><div style="display:flex; gap:4px"><input id="new-${key}" placeholder="بند جديد..." style="padding:6px; font-size:10px"><button class="btn-sm btn-${key}" style="padding:6px 8px; font-size:10px" data-action="addCatMaster" data-key="${key}">+</button></div></td></tr></tfoot></table></div></div>`;
    };
    return `<div class="card" style="padding:4px; margin:4px"><div class="seg" style="grid-template-columns:repeat(4,1fr); gap:4px"><button style="padding:6px; font-size:10px" data-action="setTab" data-tab="income">الدخل</button><button style="padding:6px; font-size:10px" data-action="setTab" data-tab="expense">المصروف</button><button style="padding:6px; font-size:10px" data-action="setTab" data-tab="debts">الديون</button><button class="active" style="padding:6px; font-size:10px" data-action="setTab" data-tab="total">الإجمالي</button></div></div>${buildMaster('الدخل','income','income')}${buildMaster('المصروفات','expense','expense')}${buildMaster('المستحقة','due','due')}${buildMaster('المؤجلة','deferred','deferred')}`;
  }

  let curCats=[], curData=[], title='', key='', btnColor='';
  if(tab==='income'){ key='income'; curCats=cats.income; curData=data.filter(x=>x.type==='income'); title='الدخل'; btnColor='#10b981'; }
  if(tab==='expense'){ key='expense'; curCats=cats.expense; curData=data.filter(x=>x.type==='expense'); title='المصروف'; btnColor='#e11d48'; }
  if(tab==='debts'){ key=debtType; curCats=cats[key]; curData=data.filter(x=>x.type===key); title=debtType==='due'?'المستحقة':'المؤجلة'; btnColor='#f59e0b'; }

  return `
  <div class="card" style="padding:4px; margin:4px"><div class="seg" style="grid-template-columns:repeat(4,1fr); gap:3px"><button style="padding:5px; font-size:9px" class="${tab==='income'?'active':''}" data-action="setTab" data-tab="income">الدخل</button><button style="padding:5px; font-size:9px" class="${tab==='expense'?'active':''}" data-action="setTab" data-tab="expense">المصروف</button><button style="padding:5px; font-size:9px" class="${tab==='debts'?'active':''}" data-action="setTab" data-tab="debts">الديون</button><button style="padding:5px; font-size:9px" class="${tab==='total'?'active':''}" data-action="setTab" data-tab="total">الإجمالي</button></div>${tab==='debts'?`<div class="seg" style="margin-top:4px; grid-template-columns:1fr 1fr; gap:3px"><button style="padding:5px; font-size:9px" class="${debtType==='due'?'active':''}" data-action="setDebtType" data-type="due">مستحقة</button><button style="padding:5px; font-size:9px" class="${debtType==='deferred'?'active':''}" data-action="setDebtType" data-type="deferred">مؤجلة</button></div>`:''}</div>

  <div class="card" style="padding:0; overflow:hidden; border-radius:12px; border:1px solid #e5e7eb; margin:4px">
    <div class="daily-master-header ${key}" style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px"><b style="font-size:11px">💰 ${title} 💲</b><button class="btn-sm" style="background:#fff; color:#0f172a; padding:4px 10px; border-radius:16px; font-size:9px; font-weight:800" data-action="toggleAddCat">+ بند جديد</button></div>
    <div id="addCatBox" style="display:none; padding:6px; background:#f8fafc; border-bottom:1px solid #e2e8f0; gap:6px"><input id="newCatInline" placeholder="اسم البند..." style="flex:1; padding:6px; border:1px solid #e2e8f0; border-radius:8px; font-size:10px"><button class="btn-sm btn-dark" style="padding:6px 10px; font-size:10px" data-action="addCatInline" data-key="${key}">حفظ</button></div>

    <div style="padding:6px; background:#fff">
      <!-- القيمة الاول وبعدين البند - زي ما طلبت -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px">
        <input id="dAmount" type="number" inputmode="numeric" placeholder="المبلغ" style="padding:8px; border:1.2px solid #e2e8f0; border-radius:10px; font-size:12px; font-weight:800; text-align:center; height:36px">
        <select id="dCat" style="padding:8px; border:1.2px solid #e2e8f0; border-radius:10px; font-size:10px; font-weight:600; background:#f8fafc; height:36px"><option value="">اختر البند</option>${curCats.map(c=>`<option>${c}</option>`).join('')}</select>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-top:5px">
        <input id="dDate" type="date" value="${new Date().toISOString().slice(0,10)}" style="padding:8px; border:1.2px solid #e2e8f0; border-radius:10px; font-size:10px; background:#f8fafc; height:34px; text-align:center">
        <input id="dDesc" placeholder="ملاحظة (اختياري)" style="padding:8px; border:1.2px solid #e2e8f0; border-radius:10px; font-size:10px; height:34px">
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px; margin-top:6px">
        <button class="btn-sm" style="background:${pendingImage?'#dcfce7':'#dbeafe'}; border:1px solid ${pendingImage?'#86efac':'#bfdbfe'}; padding:7px 2px; border-radius:10px; font-size:10px; font-weight:700; height:36px" data-action="pickImage">صورة 🖼️</button>
        <button class="btn-sm" style="background:#dcfce7; border:1px solid #bbf7d0; padding:7px 2px; border-radius:10px; font-size:10px; font-weight:700; height:36px" data-action="pickCamera">كاميرا 📷</button>
        <button class="btn-sm" style="background:${isRecording?'#fee2e2':'#fef9c3'}; border:1px solid ${isRecording?'#fecaca':'#fde68a'}; padding:7px 2px; border-radius:10px; font-size:10px; font-weight:700; height:36px" data-action="toggleRec">${isRecording?'إيقاف':'فويس 🎙️'}</button>
      </div>

      ${pendingImage? `<div style="margin-top:6px"><img src="${pendingImage}" style="width:60px; height:60px; border-radius:8px; border:1px solid #86efac"><button class="btn-sm btn-del-sm" style="margin-right:6px; padding:4px 8px; font-size:10px" data-action="clearImage">مسح</button></div>` : ''}
      ${pendingAudio? `<div style="margin-top:6px"><audio src="${pendingAudio}" controls style="height:26px; width:100%"></audio></div>` : ''}

      <input type="file" id="dailyImageInput" accept="image/*" style="display:none">
      <input type="file" id="dailyCameraInput" accept="image/*" capture="environment" style="display:none">

      <button class="btn-sm" style="width:100%; margin-top:7px; padding:10px; font-size:12px; font-weight:800; border-radius:10px; background:${btnColor}; color:#fff; border:0; height:42px" data-action="addRow">+ إضافة ${title} 💾</button>
    </div>

    <table class="pro-table" style="border:0; margin:0; font-size:10px"><tr><th style="padding:5px; font-size:9px">المبلغ</th><th style="padding:5px; font-size:9px">البند</th><th style="padding:5px; font-size:9px">التاريخ</th><th style="padding:5px; font-size:9px">📎</th><th style="width:28px"></th></tr>${curData.slice(0,30).map(r=>`<tr><td style="padding:5px; font-weight:700; font-size:10px">${fmt(r.amount).replace(' ج','')}</td><td style="padding:5px; font-size:10px">${r.category}</td><td style="padding:5px; font-size:9px">${(r.date||'').slice(0,10)}</td><td style="padding:5px">${r.image?'🖼️':''}${r.audio?'🎙️':''}</td><td style="padding:2px"><button class="btn-sm btn-del-sm" style="padding:2px 5px; font-size:9px" data-action="delRow" data-id="${r.id}">✕</button></td></tr>`).join('') || `<tr><td colspan="5" style="text-align:center; padding:12px; font-size:10px; color:#94a3b8">فارغ</td></tr>`}</table>
  </div>`;
}

export function handleDaily(btn,e,rerender){
  const cats=getCats(); const getKey=()=> tab==='income'? 'income' : tab==='expense'? 'expense' : debtType;
  if(e.target.id==='dailyImageInput' && e.target.files[0]){ const r=new FileReader(); r.onload=()=>{ pendingImage=r.result; rerender(); }; r.readAsDataURL(e.target.files[0]); return; }
  if(e.target.id==='dailyCameraInput' && e.target.files[0]){ const r=new FileReader(); r.onload=()=>{ pendingImage=r.result; rerender(); }; r.readAsDataURL(e.target.files[0]); return; }
  if(btn.dataset.action==='setTab'){ tab=btn.dataset.tab; pendingImage=null; pendingAudio=null; rerender(); return; }
  if(btn.dataset.action==='setDebtType'){ debtType=btn.dataset.type; pendingImage=null; pendingAudio=null; rerender(); return; }
  if(btn.dataset.action==='toggleAddCat'){ const b=document.getElementById('addCatBox'); if(b) b.style.display=b.style.display==='none'||b.style.display===''? 'flex':'none'; return; }
  if(btn.dataset.action==='addCatInline'){ const k=btn.dataset.key; const v=document.getElementById('newCatInline')?.value.trim(); if(!v||cats[k].includes(v)) return; cats[k].push(v); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='addCatMaster'){ const k=btn.dataset.key; const v=document.getElementById(`new-${k}`)?.value.trim(); if(!v) return; cats[k].push(v); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='delCatMaster'){ if(!confirm('حذف؟')) return; const {key,cat}=btn.dataset; cats[key]=cats[key].filter(x=>x!==cat); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='editCatMaster'){ const {key,old}=btn.dataset; const nv=prompt('تعديل:',old); if(!nv?.trim()) return; cats[key]=cats[key].map(x=>x===old?nv.trim():x); saveCats(cats); let all=L(KEY,[]); all.forEach(o=>{ if(o.category===old && o.type===key) o.category=nv.trim(); }); S(KEY,all); rerender(); return; }
  if(btn.dataset.action==='pickImage'){ document.getElementById('dailyImageInput')?.click(); return; }
  if(btn.dataset.action==='pickCamera'){ document.getElementById('dailyCameraInput')?.click(); return; }
  if(btn.dataset.action==='clearImage'){ pendingImage=null; rerender(); return; }
  if(btn.dataset.action==='clearAudio'){ pendingAudio=null; rerender(); return; }
  if(btn.dataset.action==='toggleRec'){
    if(!isRecording){
      navigator.mediaDevices.getUserMedia({audio:true}).then(s=>{ mediaRecorder=new MediaRecorder(s); audioChunks=[]; mediaRecorder.ondataavailable=ev=>audioChunks.push(ev.data); mediaRecorder.onstop=()=>{ const b=new Blob(audioChunks,{type:'audio/webm'}); const r=new FileReader(); r.onload=()=>{ pendingAudio=r.result; isRecording=false; rerender(); }; r.readAsDataURL(b); }; mediaRecorder.start(); isRecording=true; rerender(); }).catch(()=>alert('الميكروفون غير متاح'));
    } else { mediaRecorder?.stop(); isRecording=false; } return;
  }
  if(btn.dataset.action==='addRow'){
    const cat=document.getElementById('dCat')?.value; const amount=Number(document.getElementById('dAmount')?.value);
    if(!amount){ alert('المبلغ'); return; } if(!cat){ alert('البند'); return; }
    const all=L(KEY,[]); all.unshift({id:uid(), category:cat, amount, desc:document.getElementById('dDesc')?.value||'', type:getKey(), date:document.getElementById('dDate')?.value? new Date(document.getElementById('dDate').value).toISOString() : new Date().toISOString(), image:pendingImage||null, audio:pendingAudio||null});
    S(KEY,all); pendingImage=null; pendingAudio=null; rerender(); return;
  }
  if(btn.dataset.action==='delRow'){ if(!confirm('حذف؟')) return; S(KEY, L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
  if(btn.dataset.action==='viewImage'){ window.open(btn.dataset.src, '_blank'); return; }
  if(btn.dataset.action==='playAudio'){ const rec=L(KEY,[]).find(x=>x.id===btn.dataset.id); if(rec?.audio) new Audio(rec.audio).play(); return; }
}

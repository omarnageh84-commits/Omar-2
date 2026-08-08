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
      return `
      <div class="card daily-master ${key}">
        <div class="daily-master-header ${key}"><b>📋 جدول ${title}</b><small>${cats[key].length} بند</small></div>
        <div style="overflow-x:auto">
          <table class="pro-table" style="min-width:500px; margin:0; border-radius:0">
            <tr><th class="sticky-col ${key}" style="min-width:110px; background:#f8fafc">البند</th>${monthLabels.map(l=>`<th style="text-align:center; min-width:55px">${l}</th>`).join('')}<th style="text-align:center; background:#0f172a; color:#fff">الإجمالي</th><th style="width:60px"></th></tr>
            ${cats[key].map(cat=>{
              const total=months.reduce((s,m)=>s+sumCatMonth(type,cat,m),0);
              return `<tr><td class="sticky-col ${key}">${cat}</td>${months.map(m=>{ const v=sumCatMonth(type,cat,m); return `<td style="text-align:center">${v? fmt(v).replace(' ج','') : '-'}</td>`}).join('')}<td style="text-align:center; font-weight:800; background:#f8fafc">${fmt(total).replace(' ج','')}</td><td><button class="btn-sm btn-edit-sm" data-action="editCatMaster" data-key="${key}" data-old="${cat}">✏️</button><button class="btn-sm btn-del-sm" data-action="delCatMaster" data-key="${key}" data-cat="${cat}">✕</button></td></tr>`
            }).join('')}
            <tfoot><tr><td colspan="${months.length+3}"><div style="display:flex; gap:6px"><input id="new-${key}" placeholder="إضافة بند جديد في ${title}..."><button class="btn-sm btn-${key}" data-action="addCatMaster" data-key="${key}">+ إضافة</button></div></td></tr></tfoot>
          </table>
        </div>
      </div>`;
    };
    return `<div class="card" style="padding:8px"><div class="seg" style="grid-template-columns:repeat(4,1fr)"><button data-action="setTab" data-tab="income">الدخل</button><button data-action="setTab" data-tab="expense">المصروف</button><button data-action="setTab" data-tab="debts">الديون</button><button class="active" data-action="setTab" data-tab="total">الإجمالي ⭐</button></div></div>
    ${buildMaster('الدخل','income','income')}
    ${buildMaster('المصروفات','expense','expense')}
    ${buildMaster('المستحقة','due','due')}
    ${buildMaster('المؤجلة','deferred','deferred')}`;
  }

  let curCats=[], curData=[], title='', key='';
  if(tab==='income'){ key='income'; curCats=cats.income; curData=data.filter(x=>x.type==='income'); title='الدخل'; }
  if(tab==='expense'){ key='expense'; curCats=cats.expense; curData=data.filter(x=>x.type==='expense'); title='المصروف'; }
  if(tab==='debts'){ key=debtType; curCats=cats[key]; curData=data.filter(x=>x.type===key); title=debtType==='due'?'المستحقة':'المؤجلة'; }

  return `
  <div class="card" style="padding:8px"><div class="seg" style="grid-template-columns:repeat(4,1fr)"><button class="${tab==='income'?'active':''}" data-action="setTab" data-tab="income">الدخل</button><button class="${tab==='expense'?'active':''}" data-action="setTab" data-tab="expense">المصروف</button><button class="${tab==='debts'?'active':''}" data-action="setTab" data-tab="debts">الديون</button><button class="${tab==='total'?'active':''}" data-action="setTab" data-tab="total">الإجمالي</button></div>${tab==='debts'?`<div class="seg" style="margin-top:6px; grid-template-columns:1fr 1fr"><button class="${debtType==='due'?'active':''}" data-action="setDebtType" data-type="due">مستحقة</button><button class="${debtType==='deferred'?'active':''}" data-action="setDebtType" data-type="deferred">مؤجلة</button></div>`:''}</div>

  <div class="card daily-master ${key}">
    <div class="daily-master-header ${key}" style="display:flex; justify-content:space-between; align-items:center"><b>💰 ${title} - ${curCats.length} بند</b><button class="btn-sm" style="background:#fff; color:#0f172a; padding:4px 10px; border-radius:20px; font-size:10px; font-weight:800" data-action="toggleAddCat">+ بند جديد</button></div>

    <div id="addCatBox" style="display:none; padding:8px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:none; gap:6px"><input id="newCatInline" placeholder="اسم البند الجديد في ${title}..." style="flex:1; padding:8px; border:1px solid #e2e8f0; border-radius:8px; font-size:11px"><button class="btn-sm btn-dark" data-action="addCatInline" data-key="${key}">حفظ البند</button></div>

    <table class="pro-table" style="border:0; margin:0; border-radius:0">
      <tr><th>المبلغ</th><th>البند</th><th>التاريخ</th><th>📎</th><th style="width:40px"></th></tr>
      ${curData.map(r=>`<tr>
        <td>${fmt(r.amount).replace(' ج','')} ${r.image? '🖼️' : ''} ${r.audio? '🎙️' : ''}</td>
        <td>${r.category}</td>
        <td>${(r.date||'').slice(0,10)}</td>
        <td><div style="display:flex; gap:2px">${r.image? `<img src="${r.image}" data-action="viewImage" data-src="${r.image}" style="width:24px; height:24px; border-radius:4px; object-fit:cover; border:1px solid #e2e8f0">` : ''} ${r.audio? `<button class="btn-sm" style="padding:2px 4px; font-size:9px" data-action="playAudio" data-id="${r.id}">▶️</button>` : ''}</div></td>
        <td><button class="btn-sm btn-del-sm" data-action="delRow" data-id="${r.id}">✕</button></td>
      </tr>`).join('') || `<tr><td colspan="5" style="text-align:center; padding:16px; color:#94a3b8">لا يوجد ${title}</td></tr>`}
    </table>

    <div style="background:#fff; padding:10px; border-top:2px solid #0f172a">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px">
        <input id="dAmount" type="number" inputmode="numeric" placeholder="المبلغ" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:12px; font-weight:700">
        <select id="dCat" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:11px"><option value="">اختر البند</option>${curCats.map(c=>`<option>${c}</option>`).join('')}</select>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px">
        <input id="dDate" type="date" value="${new Date().toISOString().slice(0,10)}" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:11px">
        <input id="dDesc" placeholder="ملاحظة (اختياري)" style="padding:10px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:11px">
      </div>

      <!-- صور وفويس -->
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-top:8px">
        <button class="btn-sm" style="background:${pendingImage?'#dcfce7':'#e0f2fe'}; border:1px solid ${pendingImage?'#86efac':'#bae6fd'}; padding:8px; border-radius:10px; font-size:10px; font-weight:700" data-action="pickImage">🖼️ ${pendingImage?'تم ✓':'صورة'}</button>
        <button class="btn-sm" style="background:#dcfce7; border:1px solid #bbf7d0; padding:8px; border-radius:10px; font-size:10px; font-weight:700" data-action="pickCamera">📷 كاميرا</button>
        <button class="btn-sm" style="background:${isRecording?'#fee2e2':'#fef3c7'}; border:1px solid #fde68a; padding:8px; border-radius:10px; font-size:10px; font-weight:700" data-action="toggleRec">${isRecording?'⏹️ إيقاف':'🎙️ فويس'}</button>
      </div>
      ${pendingImage? `<div style="margin-top:6px; position:relative; display:inline-block"><img src="${pendingImage}" style="width:70px; height:70px; border-radius:10px; object-fit:cover; border:1px solid #e2e8f0"><button style="position:absolute; top:-6px; right:-6px; background:#e11d48; color:#fff; border:0; border-radius:50%; width:20px; height:20px" data-action="clearImage">✕</button></div>` : ''}
      ${pendingAudio? `<div style="margin-top:6px; background:#f1f5f9; padding:6px; border-radius:8px; display:flex; align-items:center; gap:6px"><audio src="${pendingAudio}" controls style="height:28px; flex:1"></audio><button class="btn-sm btn-del-sm" data-action="clearAudio">✕</button></div>` : ''}

      <input type="file" id="dailyImageInput" accept="image/*" style="display:none">
      <input type="file" id="dailyCameraInput" accept="image/*" capture="environment" style="display:none">

      <button class="btn-sm btn-${key}" style="width:100%; margin-top:8px; padding:10px; font-size:12px; font-weight:800; border-radius:10px" data-action="addRow">+ إضافة ${title} 💾</button>
    </div>
  `;
}

export function handleDaily(btn,e,rerender){
  const cats=getCats();
  const getKey=()=> tab==='income'? 'income' : tab==='expense'? 'expense' : debtType;

  // صور
  if(e.target.id==='dailyImageInput' && e.target.files[0]){
    const reader=new FileReader(); reader.onload=()=>{ pendingImage=reader.result; rerender(); }; reader.readAsDataURL(e.target.files[0]); return;
  }
  if(e.target.id==='dailyCameraInput' && e.target.files[0]){
    const reader=new FileReader(); reader.onload=()=>{ pendingImage=reader.result; rerender(); }; reader.readAsDataURL(e.target.files[0]); return;
  }

  if(btn.dataset.action==='setTab'){ tab=btn.dataset.tab; pendingImage=null; pendingAudio=null; rerender(); return; }
  if(btn.dataset.action==='setDebtType'){ debtType=btn.dataset.type; pendingImage=null; pendingAudio=null; rerender(); return; }

  if(btn.dataset.action==='toggleAddCat'){
    const box=document.getElementById('addCatBox');
    if(box){ box.style.display = box.style.display==='none' || box.style.display===''? 'flex' : 'none'; }
    return;
  }
  if(btn.dataset.action==='addCatInline'){
    const k=btn.dataset.key; const v=document.getElementById('newCatInline')?.value.trim();
    if(!v) return; if(cats[k].includes(v)){ alert('البند موجود'); return; }
    cats[k].push(v); saveCats(cats); rerender(); return;
  }
  if(btn.dataset.action==='addCatMaster'){ const k=btn.dataset.key; const v=document.getElementById(`new-${k}`)?.value.trim(); if(!v) return; cats[k].push(v); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='delCatMaster'){ if(!confirm('حذف البند؟')) return; const {key,cat}=btn.dataset; cats[key]=cats[key].filter(x=>x!==cat); saveCats(cats); rerender(); return; }
  if(btn.dataset.action==='editCatMaster'){ const {key,old}=btn.dataset; const nv=prompt('تعديل:',old); if(!nv?.trim()) return; cats[key]=cats[key].map(x=>x===old?nv.trim():x); saveCats(cats); let all=L(KEY,[]); all.forEach(o=>{ if(o.category===old && o.type===key) o.category=nv.trim(); }); S(KEY,all); rerender(); return; }

  if(btn.dataset.action==='pickImage'){ document.getElementById('dailyImageInput')?.click(); return; }
  if(btn.dataset.action==='pickCamera'){ document.getElementById('dailyCameraInput')?.click(); return; }
  if(btn.dataset.action==='clearImage'){ pendingImage=null; rerender(); return; }
  if(btn.dataset.action==='clearAudio'){ pendingAudio=null; rerender(); return; }

  if(btn.dataset.action==='toggleRec'){
    if(!isRecording){
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
        mediaRecorder=new MediaRecorder(stream); audioChunks=[];
        mediaRecorder.ondataavailable=ev=>audioChunks.push(ev.data);
        mediaRecorder.onstop=()=>{
          const blob=new Blob(audioChunks,{type:'audio/webm'});
          const reader=new FileReader(); reader.onload=()=>{ pendingAudio=reader.result; isRecording=false; rerender(); }; reader.readAsDataURL(blob);
        };
        mediaRecorder.start(); isRecording=true; rerender();
      }).catch(()=>alert('الميكروفون غير متاح'));
    } else { mediaRecorder?.stop(); isRecording=false; }
    return;
  }

  if(btn.dataset.action==='addRow'){
    const cat=document.getElementById('dCat')?.value;
    const amountStr=document.getElementById('dAmount')?.value;
    const amount=Number(amountStr);
    if(!amount){ alert('ادخل المبلغ أولاً'); return; }
    if(!cat){ alert('اختر البند - ولو مش موجود دوس + بند جديد فوق'); return; }
    const all=L(KEY,[]);
    all.unshift({
      id:uid(),
      category:cat,
      amount,
      desc:document.getElementById('dDesc')?.value||'',
      type:getKey(),
      date:document.getElementById('dDate')?.value? new Date(document.getElementById('dDate').value).toISOString() : new Date().toISOString(),
      image: pendingImage||null,
      audio: pendingAudio||null
    });
    S(KEY,all);
    pendingImage=null; pendingAudio=null;
    rerender(); return;
  }

  if(btn.dataset.action==='delRow'){ if(!confirm('حذف المعاملة؟')) return; S(KEY, L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
  if(btn.dataset.action==='viewImage'){ window.open(btn.dataset.src, '_blank'); return; }
  if(btn.dataset.action==='playAudio'){
    const rec=L(KEY,[]).find(x=>x.id===btn.dataset.id);
    if(rec?.audio){ const a=new Audio(rec.audio); a.play(); }
    return;
  }
}

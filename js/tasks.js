import { L, S, uid } from './utils.js';
const KEY='tasks_v6', CATS='cats_tasks_v6';
let view='board'; // board | list
let filter='all';
const STATUS=['📝 To Do','⚡ In Progress','✅ Done'];
const PRIORITY={عاجل:{c:'#e11d48',bg:'#fff1f2',dot:'🔴'}, مهم:{c:'#d97706',bg:'#fffbeb',dot:'🟡'}, عادي:{c:'#059669',bg:'#ecfdf5',dot:'🟢'}};

export function renderTasks(){
  const tasks=L(KEY,[]), cats=L(CATS,['عاجل','مهم','عادي']);
  const filtered=tasks.filter(t=> filter==='all' || t.status===filter || t.cat===filter );

  return `
  <div class="card" style="padding:14px; border:0; background:#fff">
    <div style="display:flex; justify-content:space-between">
      <div><b style="font-size:20px">✅ المهام</b><div style="font-size:11px; color:#9b9a97">Notion Tasks • ${filtered.filter(t=>!t.done).length} متبقية • ${filtered.filter(t=>t.done).length} مكتملة</div></div>
      <div style="display:flex; gap:6px"><button class="btn-sm ${view==='board'?'primary':''}" data-action="setView" data-view="board">Board</button><button class="btn-sm ${view==='list'?'primary':''}" data-action="setView" data-view="list">List</button></div>
    </div>
    <div style="display:flex; gap:6px; margin-top:12px; overflow-x:auto">
      <button class="cat" style="${filter==='all'?'background:#111; color:#fff':''}" data-action="setFilter" data-filter="all">الكل</button>
      ${STATUS.map(s=>`<button class="cat" style="${filter===s?'background:#111; color:#fff':''}" data-action="setFilter" data-filter="${s}">${s}</button>`).join('')}
      ${cats.map(c=>`<button class="cat" style="${filter===c?'background:#111; color:#fff':''}" data-action="setFilter" data-filter="${c}">${PRIORITY[c]?.dot||''} ${c}</button>`).join('')}
    </div>
  </div>

  <div class="card" style="background:#f7f6f3; border:1.5px dashed #e9e8e6">
    <b style="font-size:13px">＋ مهمة جديدة</b>
    <div class="inp"><input id="tT" placeholder="ماذا تريد أن تنجز؟"><select id="tP">${cats.map(c=>`<option>${c}</option>`).join('')}</select></div>
    <div class="inp"><select id="tS">${STATUS.map(s=>`<option>${s}</option>`).join('')}</select><input id="tDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
    <button class="btn" style="background:#111" data-action="addTask">＋ إضافة مهمة</button>
  </div>

  ${view==='board'? `
  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; padding:0 12px; overflow-x:auto">
    ${STATUS.map(st=>{
      const stTasks=filtered.filter(t=> (t.status||'📝 To Do')===st);
      return `<div style="background:#f7f6f3; border-radius:14px; padding:10px; min-width:160px">
        <div style="font-size:12px; font-weight:800; margin-bottom:10px; display:flex; justify-content:space-between"><span>${st}</span><span style="background:#fff; padding:2px 8px; border-radius:20px; font-size:10px">${stTasks.length}</span></div>
        ${stTasks.map(t=>{
          const p=PRIORITY[t.cat]||PRIORITY['عادي'];
          return `<div style="background:#fff; border:1px solid #edecea; border-radius:12px; padding:10px; margin-bottom:8px; border-left:3px solid ${p.c}">
            <div style="display:flex; justify-content:space-between; align-items:start"><b style="font-size:12px; flex:1">${t.text}</b><input type="checkbox" ${t.done?'checked':''} data-action="toggle" data-id="${t.id}" style="width:16px; height:16px"></div>
            <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap">
              <span style="font-size:9px; background:${p.bg}; color:${p.c}; padding:3px 8px; border-radius:20px; font-weight:800">${p.dot} ${t.cat}</span>
              ${t.date?`<span style="font-size:9px; background:#f1f1ef; padding:3px 8px; border-radius:20px">📅 ${t.date.slice(0,10)}</span>`:''}
            </div>
            <div style="display:flex; gap:4px; margin-top:8px; justify-content:flex-end">
              <button class="btn-sm" style="background:#f1f1ef; font-size:10px" data-action="move" data-id="${t.id}">➡️</button>
              <button class="btn-sm" style="background:#fbe4e6; color:#e11d48; font-size:10px" data-action="del" data-id="${t.id}">✕</button>
            </div>
          </div>`
        }).join('') || `<div style="text-align:center; color:#b8b7b5; font-size:10px; padding:12px; border:1.5px dashed #e9e8e6; border-radius:10px">لا مهام</div>`}
      </div>`
    }).join('')}
  </div>` : `
  <table class="pro-table"><tr><th>✅</th><th>المهمة</th><th>الحالة</th><th>الأولوية</th><th></th></tr>
  ${filtered.map(t=>{
    const p=PRIORITY[t.cat]||PRIORITY['عادي'];
    return `<tr style="${t.done?'opacity:.5; text-decoration:line-through':''}"><td><input type="checkbox" ${t.done?'checked':''} data-action="toggle" data-id="${t.id}"></td><td><b style="font-size:12px">${t.text}</b><br><small style="color:#9b9a97">${t.date?.slice(0,10)||''}</small></td><td style="font-size:11px">${t.status||'📝 To Do'}</td><td><span style="background:${p.bg}; color:${p.c}; padding:4px 8px; border-radius:20px; font-size:10px; font-weight:800">${p.dot} ${t.cat}</span></td><td><div style="display:flex; gap:4px"><button class="btn-sm" style="background:#f1f1ef" data-action="move" data-id="${t.id}">➡️</button><button class="btn-sm" style="background:#fbe4e6" data-action="del" data-id="${t.id}">✕</button></div></td></tr>`
  }).join('') || `<tr><td colspan="5" style="text-align:center; padding:20px; color:#9b9a97">📭 لا مهام</td></tr>`}
  </table>
  `}
  `;
}

export function handleTasks(btn,e,rerender){
  if(btn.dataset.action==='setView'){ view=btn.dataset.view; rerender(); return; }
  if(btn.dataset.action==='setFilter'){ filter=btn.dataset.filter; rerender(); return; }
  if(btn.dataset.action==='addTask'){
    const txt=document.getElementById('tT')?.value.trim(); if(!txt) return;
    const tasks=L(KEY,[]); tasks.unshift({id:uid(), text:txt, cat:document.getElementById('tP')?.value, status:document.getElementById('tS')?.value||'📝 To Do', date:document.getElementById('tDate')?.value, done:false}); S(KEY,tasks); rerender(); return;
  }
  if(btn.dataset.action==='del'){ S(KEY, L(KEY,[]).filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
  if(btn.dataset.action==='toggle'){ const tasks=L(KEY,[]); const t=tasks.find(x=>x.id===btn.dataset.id); if(t){ t.done=!t.done; if(t.done) t.status='✅ Done'; S(KEY,tasks); rerender(); } return; }
  if(btn.dataset.action==='move'){
    const tasks=L(KEY,[]); const t=tasks.find(x=>x.id===btn.dataset.id); if(!t) return;
    const idx=STATUS.indexOf(t.status||'📝 To Do'); t.status=STATUS[(idx+1)%STATUS.length]; if(t.status==='✅ Done') t.done=true; else t.done=false; S(KEY,tasks); rerender(); return;
  }
}

import { L, S, uid } from './utils.js';
const KEY='tasks_v7';
export function renderTasks(){
  const tasks=L(KEY,[]);
  return `
  <div class="card daily-master total" style="padding:0"><div class="daily-master-header total"><b>✅ المهام Pro</b><small>${tasks.filter(x=>!x.done).length} متبقي</small></div>
    <div style="padding:10px">
      <div class="inp"><input id="tT" placeholder="مهمة جديدة..."><button class="btn-sm btn-dark" data-action="startVoiceTask">🎙️</button><label class="btn-sm btn-ghost"><input type="file" id="tImg" accept="image/*" hidden>🖼️</label></div>
      <div class="inp"><select id="tP"><option>عادي</option><option>مهم</option><option>عاجل</option></select><input id="tDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
      <div id="tPreview"></div>
      <button class="btn btn-dark" data-action="addTask">+ إضافة مهمة</button>
    </div>
  </div>
  <table class="pro-table" style="margin:8px; width:calc(100% - 16px)"><tr><th>✅</th><th>المهمة</th><th>الأولوية</th><th></th></tr>
  ${tasks.map(t=>`<tr style="${t.done?'opacity:.5':''}"><td><input type="checkbox" ${t.done?'checked':''} data-action="toggle" data-id="${t.id}"></td><td><b style="font-size:11px">${t.text}</b><br>${t.image?`<img src="${t.image}" style="width:60px; height:40px; object-fit:cover; border-radius:6px; margin-top:4px">`:''}<br><small style="font-size:9px; color:#94a3b8">${(t.date||'').slice(0,10)}</small></td><td><span class="cat" style="background:${t.cat==='عاجل'?'#fff1f2':t.cat==='مهم'?'#fffbeb':'#ecfdf5'}; color:${t.cat==='عاجل'?'#e11d48':t.cat==='مهم'?'#d97706':'#059669'}">${t.cat}</span></td><td><button class="btn-sm btn-del-sm" data-action="del" data-id="${t.id}">✕</button></td></tr>`).join('') || `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:12px">لا مهام</td></tr>`}
  </table>
  `;
}
export function handleTasks(btn,e,rerender){
  let tasks=L(KEY,[]);
  if(btn.dataset.action==='addTask'){ const txt=document.getElementById('tT')?.value.trim(); if(!txt) return; const img=document.getElementById('tPreview')?.dataset.img; tasks.unshift({id:uid(), text:txt, cat:document.getElementById('tP')?.value||'عادي', date:document.getElementById('tDate')?.value, image:img||'', done:false}); S(KEY,tasks); rerender(); return; }
  if(btn.dataset.action==='del'){ S(KEY, tasks.filter(x=>x.id!==btn.dataset.id)); rerender(); return; }
  if(btn.dataset.action==='toggle'){ const t=tasks.find(x=>x.id===btn.dataset.id); if(t){ t.done=!t.done; S(KEY,tasks); rerender(); } return; }
  if(btn.dataset.action==='startVoiceTask'){ const Recog=window.SpeechRecognition||window.webkitSpeechRecognition; if(!Recog){ alert('لا يدعم'); return; } const r=new Recog(); r.lang='ar-EG'; r.onresult=(ev)=>{ document.getElementById('tT').value+=' '+ev.results[0][0].transcript; }; r.start(); return; }
  if(e.target.id==='tImg' && e.type==='change'){ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{ const prev=document.getElementById('tPreview'); prev.dataset.img=reader.result; prev.innerHTML=`<img src="${reader.result}" style="width:100%; border-radius:8px; max-height:120px; object-fit:cover">`; }; reader.readAsDataURL(file); }
}

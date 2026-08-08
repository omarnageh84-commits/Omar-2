// js/notes.js - Notes Pro
import { save, load } from './utils.js';
import { syncToSheet } from './sheets.js';

const KEY = 'notes_pro';
const COLORS = ['#ffffff','#fef9c3','#dcfce7','#dbeafe','#fce7f3','#ffedd5'];

function getNotes(){ return load(KEY, []); }

export function renderNotes(){
  const notes = getNotes();
  return `
  <div class="card" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff">
    <h3 style="margin:0">ملاحظاتي 📝</h3>
    <small>${notes.length} ملاحظة • ${notes.filter(n=>n.pinned).length} مثبتة</small>
  </div>

  <div class="card">
    <textarea id="n_text" placeholder="اكتب ملاحظة جديدة... (ادعم #تاجات)" style="width:100%;min-height:80px;border:1px solid #eee;border-radius:12px;padding:12px;resize:none"></textarea>
    <div class="input-row">
      <div style="display:flex;gap:6px" id="colorPicker">
        ${COLORS.map(c=>`<div data-color="${c}" style="width:26px;height:26px;border-radius:50%;background:${c};border:2px solid #ddd;cursor:pointer"></div>`).join('')}
      </div>
      <input id="n_tags" placeholder="#تاج" style="flex:1">
    </div>
    <button class="btn" id="addNoteBtn" style="background:#f59e0b">حفظ الملاحظة +</button>
  </div>

  <div class="card">
    <input id="n_search" placeholder="🔍 بحث في الملاحظات والتاجات..." style="width:100%;padding:12px;border:1px solid #eee;border-radius:12px">
    <div id="notesGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
      ${renderGrid(notes)}
    </div>
  </div>
  `;
}

function renderGrid(notes){
  if(!notes.length) return `<div style="grid-column:span 2;text-align:center;color:#999;padding:20px">لا يوجد ملاحظات بعد</div>`;

  let sorted = [...notes].sort((a,b)=> (b.pinned?1:0)-(a.pinned?1:0) || new Date(b.created)-new Date(a.created));

  return sorted.map(n=>`
    <div style="background:${n.color||'#fff'};border:1px solid #f0f0f0;border-radius:16px;padding:12px;position:relative;min-height:100px">
      ${n.pinned?'<div style="position:absolute;top:6px;left:6px">📌</div>':''}
      <div style="font-size:13px;white-space:pre-wrap;line-height:1.6">${highlightTags(n.text)}</div>
      <div style="margin-top:8px;font-size:10px;color:#666">${new Date(n.created).toLocaleDateString('ar-EG')} ${n.tags? '• '+n.tags:''}</div>
      <div style="display:flex;gap:6px;margin-top:8px">
        <button data-pin-note="${n.id}" style="flex:1;border:0;background:#fff;border-radius:8px;padding:6px;font-size:11px">تثبيت</button>
        <button data-del-note="${n.id}" style="flex:1;border:0;background:#fee2e2;color:#ef4444;border-radius:8px;padding:6px;font-size:11px">حذف</button>
        <button data-copy-note="${n.id}" style="flex:1;border:0;background:#e0f2fe;color:#0284c7;border-radius:8px;padding:6px;font-size:11px">نسخ</button>
      </div>
    </div>
  `).join('');
}

function highlightTags(text){
  return text.replace(/#(\w+|[\u0600-\u06FF]+)/g, '<span style="color:#10b981;font-weight:700">#$1</span>');
}

let selectedColor = '#ffffff';

export function bindNotes(){
  document.addEventListener('click', e=>{
    if(e.target.dataset.color){
      selectedColor = e.target.dataset.color;
      document.querySelectorAll('#colorPicker div').forEach(d=>d.style.outline='none');
      e.target.style.outline='2px solid #000';
    }
    if(e.target.id === 'addNoteBtn'){
      addNote();
    }
    if(e.target.dataset.delNote){
      let id = e.target.dataset.delNote;
      let notes = getNotes().filter(x=>x.id!=id);
      save(KEY, notes); refreshGrid();
    }
    if(e.target.dataset.pinNote){
      let id = e.target.dataset.pinNote;
      let notes = getNotes();
      let n = notes.find(x=>x.id==id);
      if(n){ n.pinned=!n.pinned; save(KEY, notes); refreshGrid(); }
    }
    if(e.target.dataset.copyNote){
      let id = e.target.dataset.copyNote;
      let n = getNotes().find(x=>x.id==id);
      if(n){ navigator.clipboard.writeText(n.text); alert('اتنسخت ✅'); }
    }
  });

  document.addEventListener('input', e=>{
    if(e.target.id==='n_search'){
      let q = e.target.value.toLowerCase();
      let notes = getNotes().filter(n=> n.text.toLowerCase().includes(q) || (n.tags&&n.tags.toLowerCase().includes(q)));
      document.getElementById('notesGrid').innerHTML = renderGrid(notes);
    }
  });

  function addNote(){
    let text = document.getElementById('n_text')?.value.trim();
    if(!text) return;
    let notes = getNotes();
    let newNote = {
      id: Date.now(),
      text,
      tags: document.getElementById('n_tags').value,
      color: selectedColor,
      pinned: false,
      created: new Date().toISOString()
    };
    notes.unshift(newNote);
    save(KEY, notes);
    syncToSheet('notes', newNote);
    document.getElementById('n_text').value='';
    document.getElementById('n_tags').value='';
    refreshGrid();
  }

  function refreshGrid(){
    let q = document.getElementById('n_search')?.value||'';
    let notes = getNotes();
    if(q) notes = notes.filter(n=> n.text.toLowerCase().includes(q.toLowerCase()));
    let grid = document.getElementById('notesGrid');
    if(grid) grid.innerHTML = renderGrid(notes);
  }
}

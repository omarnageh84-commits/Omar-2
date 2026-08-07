
// js/notes.js - أفخم تبويب ملاحظات
let notes = JSON.parse(localStorage.getItem('notes_pro') || '[]');
let noteFilter = 'all';

function saveNotes(){ localStorage.setItem('notes_pro', JSON.stringify(notes)); }

function renderNotes(){
  let q = (document.getElementById('noteSearch')?.value || '').toLowerCase();
  let filtered = notes.filter(n=>{
    if(noteFilter==='pinned' &&!n.pinned) return false;
    if(noteFilter!=='all' && noteFilter!=='pinned' && n.color!==noteFilter) return false;
    if(q &&!n.text.toLowerCase().includes(q) &&!n.title.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a,b)=> b.pinned - a.pinned || b.id - a.id);

  document.getElementById('tab-notes').innerHTML=`
  <div style="position:sticky;top:0;z-index:10;background:#fff;padding:8px;border-radius:12px;margin-bottom:8px;border:1px solid #e5e7eb">
    <!-- إضافة سريعة -->
    <div style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;padding:8px;transition:.2s" id="noteComposer">
      <input id="noteTitle" placeholder="عنوان الملاحظة..." style="width:100%;border:0;background:transparent;font-size:13px;font-weight:800;outline:none;margin-bottom:4px;color:#000" maxlength="30">
      <textarea id="noteText" placeholder="اكتب ملاحظتك هنا... دوس Enter للحفظ" rows="2" style="width:100%;border:0;background:transparent;font-size:12px;outline:none;resize:none;color:#334155" onkeydown="if(event.key==='Enter'&&event.ctrlKey) addNote()"></textarea>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
        <div style="display:flex;gap:4px">
          <button onclick="setNoteColor('yellow')" class="dot active" style="background:#fef08a" data-c="yellow"></button>
          <button onclick="setNoteColor('green')" class="dot" style="background:#bbf7d0" data-c="green"></button>
          <button onclick="setNoteColor('blue')" class="dot" style="background:#bfdbfe" data-c="blue"></button>
          <button onclick="setNoteColor('pink')" class="dot" style="background:#fbcfe8" data-c="pink"></button>
          <button onclick="setNoteColor('purple')" class="dot" style="background:#ddd6fe" data-c="purple"></button>
        </div>
        <button onclick="addNote()" style="background:#000;color:#fff;border:0;padding:6px 14px;border-radius:99px;font-size:11px;font-weight:700;cursor:pointer">+ إضافة</button>
      </div>
    </div>

    <!-- بحث وفلتر -->
    <div style="display:flex;gap:6px;margin-top:8px">
      <div style="flex:1;background:#f1f5f9;border-radius:99px;padding:5px 10px;display:flex;align-items:center;gap:6px"><span style="font-size:10px">🔍</span><input id="noteSearch" oninput="renderNotes()" placeholder="بحث..." style="border:0;background:transparent;font-size:11px;outline:none;width:100%;color:#000"></div>
      <select onchange="noteFilter=this.value;renderNotes()" style="border:1px solid #e5e7eb;border-radius:99px;font-size:10px;padding:5px;background:#fff;color:#000"><option value="all">الكل</option><option value="pinned">📌 مثبت</option><option value="yellow">أصفر</option><option value="green">أخضر</option><option value="blue">أزرق</option></select>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
    ${filtered.length? filtered.map(n=>`
      <div style="background:${getNoteBg(n.color)};border-radius:12px;padding:8px;position:relative;min-height:80px;transform:rotate(${n.id%2?'-0.5deg':'0.5deg'});box-shadow:0 2px 8px rgba(0,0,0,.06);border:1px solid rgba(0,0,0,.04)">
        ${n.pinned?'<div style="position:absolute;top:-6px;right:8px;font-size:10px">📌</div>':''}
        <div style="font-size:11px;font-weight:800;margin-bottom:3px;color:#1e293b;line-height:1.2">${n.title||'بدون عنوان'}</div>
        <div style="font-size:10px;color:#334155;line-height:1.4;white-space:pre-wrap;word-break:break-word">${n.text}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <span style="font-size:7px;color:#64748b;font-family:monospace">${new Date(n.id).toLocaleDateString('en-GB')}</span>
          <div style="display:flex;gap:6px">
            <span onclick="togglePinNote(${n.id})" style="cursor:pointer;font-size:11px">${n.pinned?'📌':'📍'}</span>
            <span onclick="deleteNote(${n.id})" style="cursor:pointer;font-size:11px">🗑️</span>
          </div>
        </div>
      </div>
    `).join('') : `<div style="grid-column:span 2;text-align:center;padding:30px;color:#94a3b8;font-size:12px">لا يوجد ملاحظات<br><span style="font-size:20px">📝</span></div>`}
  </div>
  <style>.dot{width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #e5e7eb;cursor:pointer}.dot.active{box-shadow:0 0 0 2px #000}</style>
  `;
}

let selectedColor='yellow';
function setNoteColor(c){ selectedColor=c; document.querySelectorAll('.dot').forEach(d=>d.classList.toggle('active', d.dataset.c===c)); }
function getNoteBg(c){ return {yellow:'#fefce8',green:'#f0fdf4',blue:'#eff6ff',pink:'#fdf2f8',purple:'#f5f3ff'}[c]||'#fefce8'; }
function addNote(){
  let t=document.getElementById('noteTitle').value.trim(), x=document.getElementById('noteText').value.trim();
  if(!x) return;
  notes.push({id:Date.now(), title:t, text:x, color:selectedColor, pinned:false});
  saveNotes(); document.getElementById('noteTitle').value=''; document.getElementById('noteText').value=''; renderNotes();
}
function deleteNote(id){ if(!confirm('تمسحها؟')) return; notes=notes.filter(n=>n.id!==id); saveNotes(); renderNotes(); }
function togglePinNote(id){ let n=notes.find(x=>x.id===id); if(n) n.pinned=!n.pinned; saveNotes(); renderNotes(); }

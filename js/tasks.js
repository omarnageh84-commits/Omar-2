// tasks.js
export function renderTasks(){
  const tasks = JSON.parse(localStorage.getItem('tasks')||'[]');
  return `<div class="card"><h4>مهام Pro ✅</h4>
  <div class="input-row"><input id="t_input" placeholder="مهمة جديدة..."><button class="btn" style="width:80px" id="addTask">+</button></div>
  ${tasks.map((t,i)=>`<div style="display:flex;justify-content:space-between;padding:10px;border:1px solid #eee;border-radius:12px;margin:6px 0"><span>${t.done?'✅':''} ${t.text}</span><small>${t.priority}</small></div>`).join('')}</div>`;
}
// notes.js نفس الفكرة مع بحث وتاجات

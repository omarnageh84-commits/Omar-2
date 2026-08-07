function backupNow(){
  const keys = ['daily_v4','att_v2','tasks_pro','notes_pro','salaryConfig', 'sync_queue_v1'];
  const data = {};
  keys.forEach(k => { data[k] = localStorage.getItem(k); });
  data._date = new Date().toISOString();
  data._app = 'yawmeyati';

  const blob = new Blob([JSON.stringify(data)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yawmeyati-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  alert('✅ اتحفظ ملف باك أب - ارفعه على Google Drive عشان يبقى مربوط بجيميلك');
}

function restoreBackup(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e)=>{
    try{
      const data = JSON.parse(e.target.result);
      if(confirm('هيرجع كل البيانات من الملف ده؟ هيبدل الحالي')){
        Object.keys(data).forEach(k=>{
          if(k.startsWith('_')) return;
          if(data[k]) localStorage.setItem(k, data[k]);
        });
        alert('✅ رجع كل حاجة! اعمل Refresh');
        location.reload();
      }
    }catch(err){ alert('الملف بايظ'); }
  };
  reader.readAsText(file);
}

function renderDashboard(){
  let el=document.getElementById('tab-home'); if(!el) return;
  let daily=JSON.parse(localStorage.getItem('daily_v4')||'{"income":[],"exp":[],"debt":[]}');
  let att=JSON.parse(localStorage.getItem('att_v2')||'[]');
  let tasks=JSON.parse(localStorage.getItem('tasks_pro')||'[]');
  let notes=JSON.parse(localStorage.getItem('notes_pro')||'[]');
  let cfg=JSON.parse(localStorage.getItem('salaryConfig')||'{"hourPrice":1100,"pharmacy":5000}');
  let queue=JSON.parse(localStorage.getItem('sync_queue_v1')||'[]');

  let inc=daily.income.reduce((s,x)=>s+(x.amount||0),0);
  let exp=daily.exp.reduce((s,x)=>s+(x.amount||0),0);
  let hrs=att.reduce((s,r)=>s+(r.total||0),0);
  let done=tasks.filter(t=>t.done).length;

  el.innerHTML=`
  <div style="zoom:0.92">
    <div style="background:linear-gradient(135deg,#10b981,#059669);border-radius:16px;padding:14px;color:#fff;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:15px;font-weight:900">أهلا يا عمر 👋</div>
        <div style="font-size:8px;background:rgba(255,255,255,.2);padding:3px 8px;border-radius:99px">${navigator.onLine? '🟢 أونلاين' : '🔴 أوفلاين'} ${queue.length>0? '| ⏳ '+queue.length+' في الانتظار' : ''}</div>
      </div>
      <div style="font-size:8px;opacity:.9;margin-top:4px">كله محفوظ على الجهاز + مربوط بالشيت كباك أب</div>
      <div style="display:flex;gap:6px;margin-top:8px">
        <span style="background:rgba(255,255,255,.2);padding:2px 8px;border-radius:99px;font-size:8px">${hrs.toFixed(1)} ساعة</span>
        <span style="background:rgba(255,255,255,.2);padding:2px 8px;border-radius:99px;font-size:8px">${tasks.length} مهمة</span>
        <span style="background:rgba(255,255,255,.2);padding:2px 8px;border-radius:99px;font-size:8px">${notes.length} ملاحظة</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
      <div style="background:#000;color:#fff;border-radius:12px;padding:10px"><div style="font-size:7px;opacity:.6">الصافي</div><div style="font-size:14px;font-weight:900;font-family:monospace">${(inc-exp).toLocaleString('en-US')} ج</div><div style="font-size:7px;margin-top:2px;color:#86efac">${inc.toLocaleString('en-US')} دخل / ${exp.toLocaleString('en-US')} مصروف</div></div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:10px"><div style="font-size:7px;color:#64748b">ساعات الشهر</div><div style="font-size:14px;font-weight:900;font-family:monospace">${hrs.toFixed(1)}h</div><div style="font-size:7px">مطلوب ${cfg.hourPrice||1100}</div></div>
    </div>

    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:10px;margin-bottom:8px">
      <div style="font-size:9px;font-weight:800">📦 النسخ الاحتياطي (مربوط بجيميلك)</div>
      <div style="display:flex;gap:6px;margin-top:8px">
        <button onclick="backupNow()" style="flex:1;background:#10b981;color:#fff;border:0;padding:8px;border-radius:8px;font-size:10px;font-weight:800">حفظ نسخة على Drive</button>
        <label style="flex:1;background:#f1f5f9;border:1px dashed #cbd5e1;padding:8px;border-radius:8px;font-size:10px;text-align:center;cursor:pointer">
          استرجاع نسخة
          <input type="file" accept=".json" onchange="restoreBackup(this)" style="display:none">
        </label>
      </div>
      <div style="font-size:7px;color:#94a3b8;margin-top:6px">• النسخة بتتحفظ كـ JSON ترفعها على Drive بتاعك • لو البرنامج اتمسح افتحه تاني ودوس استرجاع • الشيت شغال كباك أب تلقائي كمان</div>
    </div>

    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:8px">
      <div style="font-size:9px;font-weight:800">📌 آخر العمليات</div>
      <div style="font-size:8px;color:#94a3b8;margin-top:4px">لو فاضي يبقى لسه مضفتش مصروف او دخل في اليومية</div>
    </div>
  </div>`;
}

let dailyData = JSON.parse(localStorage.getItem('omar_daily')||'{"exp":[],"income":[],"debt":[]}');
function saveDaily(){ localStorage.setItem('omar_daily', JSON.stringify(dailyData)); }

function addDaily(type){
  const titleEl=document.getElementById(type+'-title');
  const amountEl=document.getElementById(type+'-amount');
  const catEl=document.getElementById(type+'-cat');
  if(!titleEl||!amountEl) return;
  let title=titleEl.value.trim();
  let amount=parseFloat(amountEl.value);
  let cat=catEl?catEl.value.trim():'عام';
  if(!title||isNaN(amount)) return alert('اكتب الاسم والمبلغ');
  dailyData[type].unshift({id:uid(), title, amount, cat, date:new Date().toISOString()});
  titleEl.value=''; amountEl.value=''; if(catEl) catEl.value='';
  saveDaily(); renderDaily(currentDaily); renderDashboard();
}
function deleteDaily(type,id){
  if(!confirm('تمسح؟')) return;
  dailyData[type]=dailyData[type].filter(x=>x.id!==id);
  saveDaily(); renderDaily(currentDaily); renderDashboard();
}
function renderDaily(filter){
  filter=filter||currentDaily||'exp';
  ['exp','income','debt'].forEach(t=>{
    const list=document.getElementById(t+'-list');
    if(!list) return;
    const arr=dailyData[t]||[];
    if(arr.length===0){
      list.innerHTML='<div style="text-align:center;padding:24px;color:#9ca3af">مفيش بيانات لسه</div>';
      return;
    }
    list.innerHTML=arr.map(i=>`
      <div style="background:#fff;border-radius:14px;padding:12px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-weight:800">${i.title}</div><div style="font-size:11px;color:#6b7280">${i.cat} • ${new Date(i.date).toLocaleDateString('ar-EG')}</div></div>
        <div style="display:flex;gap:10px"><span style="font-weight:900;color:${t==='income'?'#10b981':t==='debt'?'#f59e0b':'#ef4444'}">${i.amount} ج</span><button onclick="deleteDaily('${t}','${i.id}')" style="border:0;background:#fee2e2;color:#dc2626;width:28px;height:28px;border-radius:8px">✕</button></div>
      </div>
    `).join('');
  });
}
function renderDashboard(){
  const exp=(dailyData.exp||[]).reduce((s,x)=>s+Number(x.amount||0),0);
  const inc=(dailyData.income||[]).reduce((s,x)=>s+Number(x.amount||0),0);
  const debt=(dailyData.debt||[]).reduce((s,x)=>s+Number(x.amount||0),0);
  const e1=document.getElementById('total-exp'); if(e1) e1.innerText=exp+' ج';
  const e2=document.getElementById('total-income'); if(e2) e2.innerText=inc+' ج';
  const e3=document.getElementById('total-debt'); if(e3) e3.innerText=debt+' ج';
  const e4=document.getElementById('balance'); if(e4) e4.innerText=(inc-exp)+' ج';
}

// js/sheets.js - مربوط بشيتك + طابور أوفلاين + باك أب
const رابط_الشيت = "https://script.google.com/macros/s/AKfycbzzu1hkso3V5dOD8CvSq2-3upDCQPhnoyzt2LuVyy1B95uwJoCGwezqRR4g5QQnbA9A/exec";
const QUEUE_KEY = 'sync_queue_v1';

// --- طابور الأوفلاين ---
function احفظ_في_الطابور(بيانات){
  let q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  q.push(بيانات);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

function ارفع_الطابور(){
  let q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  if(q.length === 0 ||!navigator.onLine) return;
  console.log('بيرفع الطابور:', q.length);
  q.forEach(item => {
    fetch(رابط_الشيت, {
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(item)
    });
  });
  localStorage.removeItem(QUEUE_KEY);
  if(window.renderDashboard) renderDashboard();
}

// اول ما النت يرجع ارفع
window.addEventListener('online', ارفع_الطابور);
window.addEventListener('load', () => {
  setTimeout(ارفع_الطابور, 3000);
});

function مزامنة(نوع, بيانات){
  let حزمة = {نوع, حركة:'اضافة',...بيانات};
  // لو مفيش نت احفظه في الطابور
  if(!navigator.onLine){
    احفظ_في_الطابور(حزمة);
    return;
  }
  try{
    fetch(رابط_الشيت, {
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(حزمة)
    }).catch(()=> احفظ_في_الطابور(حزمة));
  }catch(e){
    احفظ_في_الطابور(حزمة);
  }
}

// دوال الارسال زي ما هي
window.ارسل_مصروف = (مبلغ, فئة, ملاحظة)=>{
  let الان=new Date();
  مزامنة('مصاريف', {التاريخ:الان.toLocaleDateString('ar-EG'), الوقت:الان.toLocaleTimeString('ar-EG'), المبلغ:مبلغ, الفئة:فئة, الملاحظة:ملاحظة, التاريخ_الكامل:الان.toISOString()});
};
window.ارسل_دخل = (مبلغ, فئة, ملاحظة)=>{
  let الان=new Date();
  مزامنة('دخل', {التاريخ:الان.toLocaleDateString('ar-EG'), الوقت:الان.toLocaleTimeString('ar-EG'), المبلغ:مبلغ, الفئة:فئة, الملاحظة:ملاحظة, التاريخ_الكامل:الان.toISOString()});
};
window.ارسل_دين = (مبلغ, فئة, ملاحظة)=>{
  let الان=new Date();
  مزامنة('ديون', {التاريخ:الان.toLocaleDateString('ar-EG'), الوقت:الان.toLocaleTimeString('ar-EG'), المبلغ:مبلغ, الفئة:فئة, الملاحظة:ملاحظة, التاريخ_الكامل:الان.toISOString()});
};
window.ارسل_حضور = (دخول, خروج, ساعات)=>{
  مزامنة('حضور', {التاريخ:new Date().toLocaleDateString('ar-EG'), دخول, خروج, الساعات:ساعات, الصيدلية:'الزهراء'});
};
window.ارسل_مهمة = (نص, اهمية)=>{
  مزامنة('مهام', {المعرف:Date.now(), النص:نص, منجز:'لا', الأهمية:اهمية, المهام_الفرعية:'[]', التاريخ:new Date().toLocaleDateString('ar-EG')});
};
window.ارسل_ملاحظة = (عنوان, نص, لون)=>{
  مزامنة('ملاحظات', {المعرف:Date.now(), العنوان:عنوان, النص:نص, اللون:لون, مثبت:'لا', فرعية:'[]', التاريخ:new Date().toLocaleDateString('ar-EG')});
};

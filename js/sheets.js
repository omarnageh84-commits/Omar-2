// js/sheets.js - رابط الشيت بتاعك متركب جاهز
const رابط_الشيت = "https://script.google.com/macros/s/AKfycbzzu1hkso3V5dOD8CvSq2-3upDCQPhnoyzt2LuVyy1B95uwJoCGwezqRR4g5QQnbA9A/exec";

function مزامنة(نوع, بيانات){
  try{
    fetch(رابط_الشيت, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({type: نوع,...بيانات})
    });
  }catch(e){ console.log('مفيش نت'); }
}

// دوال جاهزة لكل تبويب
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
window.ارسل_مهمة = (نص, اهمية, فرعية)=>{
  مزامنة('مهام', {المعرف:Date.now(), النص:نص, منجز:'لا', الأهمية:اهمية, المهام_الفرعية:فرعية||[], التاريخ:new Date().toLocaleDateString('ar-EG')});
};
window.ارسل_ملاحظة = (عنوان, نص, لون)=>{
  مزامنة('ملاحظات', {المعرف:Date.now(), العنوان:عنوان, النص:نص, اللون:لون, مثبت:'لا', فرعية:[], التاريخ:new Date().toLocaleDateString('ar-EG')});
};
window.ارسل_حضور = (دخول, خروج, ساعات)=>{
  مزامنة('حضور', {التاريخ:new Date().toLocaleDateString('ar-EG'), دخول, خروج, الساعات:ساعات, الصيدلية:'الزهراء'});
};

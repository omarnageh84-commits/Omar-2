// js/sheets.js - مربوط بشيتك مباشرة
const رابط_الشيت = "https://script.google.com/macros/s/AKfycbzzu1hkso3V5dOD8CvSq2-3upDCQPhnoyzt2LuVyy1B95uwJoCGwezqRR4g5QQnbA9A/exec";

function مزامنة(نوع, بيانات){
  try{
    fetch(رابط_الشيت, {
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({نوع, حركة:'اضافة',...بيانات})
    });
  }catch(e){}
}
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


# مشروعي الخاص - منظم + مربوط بـ Google Sheets

## 📁 ترتيب المشروع:
```
├── index.html              ← التطبيق الرئيسي (التبويبات الديناميكية)
├── expenses.html           ← رابط مختصر لمصروفاتي
├── debts.html              ← رابط مختصر لديوني
├── attendance.html         ← رابط مختصر للحضور
├── notes.html              ← رابط مختصر لملاحظاتي
├── css/
│   └── style.css           ← ستايل زي الصورة (داكن + أخضر)
├── js/
│   ├── app.js              ← LocalStorage
│   └── sheets.js           ← ربط Google Sheets + Excel
├── apps-script/
│   └── Code.gs             ← كود Google Apps Script
├── manifest.json           ← PWA
├── sw.js                   ← Offline
└── icons/
```

## 🔗 الربط بـ Google Sheets (مباشر):

### الخطوة 1: اعمل Google Sheet جديد
- افتح sheets.google.com > New Sheet
- سميه "مشروعي الخاص"

### الخطوة 2: حط كود الربط
- Extensions > Apps Script
- امسح الكود اللي هناك وحط كود الملف `apps-script/Code.gs`
- Save

### الخطوة 3: Deploy
- Deploy > New Deployment
- Type: Web App
- Description: مشروعي
- Execute as: Me
- Who has access: Anyone
- Deploy > انسخ اللينك اللي هيطلع

### الخطوة 4: اربط التطبيق
- افتح `js/sheets.js` وحط اللينك في:
  `const GOOGLE_SCRIPT_URL = 'https://script.google.com/...';`
- او سيبه فاضي والتطبيق هيطلبه منك أول مرة تدوس "رفع للشيت"

### الاستخدام:
- زر "رفع للشيت" -> يرفع كل البيانات (مصروفاتي/ديوني/الحضور/ملاحظاتي) لـ 4 شيتات منفصلة في Google Sheets
- زر "تحميل من الشيت" -> يجيب البيانات من الشيت

## 📱 تحويل لـ APK:
- ارفع المجلد كله على GitHub Repo جديد
- فعل Settings > Pages > main / root
- خد اللينك وحطه في MIT App Inventor WebViewer HomeUrl
- او استخدم الملف .aia المرفق

## 💾 تصدير Excel:
- زر "تصدير إكسل" يطلع ملف فيه 4 شيتات
- يفتح مباشرة في Excel و Google Sheets

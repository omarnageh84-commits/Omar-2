const themes = {
  black: { "--bg": "#F4F4F5", "--bg-soft": "#E4E4E7", "--card": "#FFFFFF", "--card-border": "#D4D4D8", "--text": "#18181B", "--text-soft": "#71717A", "--primary": "#18181B", "--hero": "#18181B", "--accent": "#18181B", "--nav-bg": "rgba(255,255,255,0.92)" },
  red: { "--bg": "#FFF1F2", "--bg-soft": "#FFE4E6", "--card": "#FFFFFF", "--card-border": "#FECDD3", "--text": "#881337", "--text-soft": "#FB7185", "--primary": "#E11D48", "--hero": "#E11D48", "--accent": "#F43F5E", "--nav-bg": "rgba(255,241,242,0.92)" },
  purple: { "--bg": "#F5F3FF", "--bg-soft": "#EDE9FE", "--card": "#FFFFFF", "--card-border": "#DDD6FE", "--text": "#4C1D95", "--text-soft": "#A78BFA", "--primary": "#7C3AED", "--hero": "#7C3AED", "--accent": "#8B5CF6", "--nav-bg": "rgba(245,243,255,0.92)" },
  green: { "--bg": "#F0FDF4", "--bg-soft": "#DCFCE7", "--card": "#FFFFFF", "--card-border": "#BBF7D0", "--text": "#14532D", "--text-soft": "#4ADE80", "--primary": "#16A34A", "--hero": "#16A34A", "--accent": "#22C55E", "--nav-bg": "rgba(240,253,244,0.92)" },
  blue: { "--bg": "#EFF6FF", "--bg-soft": "#DBEAFE", "--card": "#FFFFFF", "--card-border": "#BFDBFE", "--text": "#1E3A8A", "--text-soft": "#60A5FA", "--primary": "#2563EB", "--hero": "#2563EB", "--accent": "#3B82F6", "--nav-bg": "rgba(239,246,255,0.92)" },
  orange: { "--bg": "#FFFBEB", "--bg-soft": "#FEF3C7", "--card": "#FFFFFF", "--card-border": "#FDE68A", "--text": "#92400E", "--text-soft": "#FBBF24", "--primary": "#D97706", "--hero": "#D97706", "--accent": "#F59E0B", "--nav-bg": "rgba(255,251,235,0.92)" },
  clay: { "--bg": "#FDF6F3", "--bg-soft": "#F5E6E0", "--card": "#FFFFFF", "--card-border": "#E7D5CC", "--text": "#5D4037", "--text-soft": "#A1887F", "--primary": "#A0522D", "--hero": "#8D4A32", "--accent": "#BC6C4E", "--nav-bg": "rgba(253,246,243,0.92)" },
  teal: { "--bg": "#F0FDFA", "--bg-soft": "#CCFBF1", "--card": "#FFFFFF", "--card-border": "#99F6E4", "--text": "#134E4A", "--text-soft": "#2DD4BF", "--primary": "#0D9488", "--hero": "#0D9488", "--accent": "#14B8A6", "--nav-bg": "rgba(240,253,250,0.92)" },
  pink: { "--bg": "#FDF2F8", "--bg-soft": "#FCE7F3", "--card": "#FFFFFF", "--card-border": "#FBCFE8", "--text": "#831843", "--text-soft": "#F472B6", "--primary": "#DB2777", "--hero": "#DB2777", "--accent": "#EC4899", "--nav-bg": "rgba(253,242,248,0.92)" },
  yellow: { "--bg": "#FEFCE8", "--bg-soft": "#FEF9C3", "--card": "#FFFFFF", "--card-border": "#FEF08A", "--text": "#713F12", "--text-soft": "#EAB308", "--primary": "#CA8A04", "--hero": "#CA8A04", "--accent": "#EAB308", "--nav-bg": "rgba(254,252,232,0.92)" },
  indigo: { "--bg": "#EEF2FF", "--bg-soft": "#E0E7FF", "--card": "#FFFFFF", "--card-border": "#C7D2FE", "--text": "#312E81", "--text-soft": "#818CF8", "--primary": "#4F46E5", "--hero": "#4F46E5", "--accent": "#6366F1", "--nav-bg": "rgba(238,242,255,0.92)" }
};

function applyTheme(name){
  let t=themes[name]; if(!t) { t=themes['green']; name='green'; }
  try{
    Object.entries(t).forEach(([k,v])=>{ if(document.documentElement) document.documentElement.style.setProperty(k,v); });
    localStorage.setItem('omar_theme',name); localStorage.setItem('theme',name);
    let meta=document.querySelector('meta[name="theme-color"]'); if(meta) meta.content=t["--hero"];
    document.querySelectorAll('.theme-dot,.tdot').forEach(d=>{ if(d.dataset) d.classList.toggle('active',d.dataset.theme===name); });
    try{
      document.querySelectorAll('.page').forEach(f=>{
        if(f.contentDocument && f.contentDocument.documentElement){
          Object.entries(t).forEach(([k,v])=>{ try{ f.contentDocument.documentElement.style.setProperty(k,v); }catch(e){} });
        }
      });
    }catch(e){}
  }catch(e){ console.warn('Theme apply warning:', e.message); }
}

function applyThemeToDoc(doc, name){
  let t=themes[name]||themes['green'];
  if(!doc || !doc.documentElement) return;
  Object.entries(t).forEach(([k,v])=>{ try{ doc.documentElement.style.setProperty(k,v); }catch(e){} });
}

// --- الإضافة اللي كانت ناقصة: رسم الدوتس ---
function renderThemeDots(){
  const container = document.getElementById('themeDots');
  if(!container) return; // لو الصفحة مفهاش مكان الثيمات متعملش حاجة
  if(container.children.length > 0) return; // لو مرسومة قبل كده متعدهاش
  Object.keys(themes).forEach(name=>{
    const dot = document.createElement('div');
    dot.className = 'theme-dot';
    dot.dataset.theme = name;
    const color = themes[name]["--primary"] || themes[name]["--hero"];
    dot.style.cssText = `width:20px;height:20px;border-radius:50%;background:${color};cursor:pointer;border:2px solid var(--card-border);display:inline-block;transition:.2s;`;
    dot.title = name;
    dot.onclick = ()=> applyTheme(name);
    container.appendChild(dot);
  });
  // ستايل الـ active
  const style = document.createElement('style');
  style.textContent = `.theme-dot.active{transform:scale(1.25);box-shadow:0 0 0 2px var(--bg), 0 0 0 4px var(--primary);}`;
  document.head.appendChild(style);
}

window.applyTheme=applyTheme;
window.applyThemeToDoc=applyThemeToDoc;
window.themes=themes;
window.renderThemeDots=renderThemeDots;

document.addEventListener('DOMContentLoaded',()=>{
  renderThemeDots();
  applyTheme(localStorage.getItem('omar_theme')||'green');
});

// لو الملف اتحمل بعد الـ DOMContentLoaded
if(document.readyState !== 'loading'){
  renderThemeDots();
  applyTheme(localStorage.getItem('omar_theme')||'green');
}

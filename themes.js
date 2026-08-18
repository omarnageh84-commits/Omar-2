const themes = {
  black: { "--bg": "#F4F4F5", "--bg-soft": "#E4E4E7", "--card": "#FFFFFF", "--card-border": "#D4D4D8", "--text": "#18181B", "--text-soft": "#71717A", "--primary": "#18181B", "--hero": "#18181B", "--accent": "#18181B", "--nav-bg": "rgba(255,255,255,0.92)" },
  red: { "--bg": "#FFF1F2", "--bg-soft": "#FFE4E6", "--card": "#FFFFFF", "--card-border": "#FECDD3", "--text": "#881337", "--text-soft": "#FB7185", "--primary": "#E11D48", "--hero": "#E11D48", "--accent": "#F43F5E", "--nav-bg": "rgba(255,241,242,0.92)" },
  purple: { "--bg": "#F5F3FF", "--bg-soft": "#EDE9FE", "--card": "#FFFFFF", "--card-border": "#DDD6FE", "--text": "#4C1D95", "--text-soft": "#A78BFA", "--primary": "#7C3AED", "--hero": "#7C3AED", "--accent": "#8B5CF6", "--nav-bg": "rgba(245,243,255,0.92)" },
  green: { "--bg": "#F0FDF4", "--bg-soft": "#DCFCE7", "--card": "#FFFFFF", "--card-border": "#BBF7D0", "--text": "#14532D", "--text-soft": "#4ADE80", "--primary": "#16A34A", "--hero": "#16A34A", "--accent": "#22C55E", "--nav-bg": "rgba(240,253,244,0.92)" },
  blue: { "--bg": "#EFF6FF", "--bg-soft": "#DBEAFE", "--card": "#FFFFFF", "--card-border": "#BFDBFE", "--text": "#1E3A8A", "--text-soft": "#60A5FA", "--primary": "#2563EB", "--hero": "#2563EB", "--accent": "#3B82F6", "--nav-bg": "rgba(239,246,255,0.92)" },
  orange: { "--bg": "#FFFBEB", "--bg-soft": "#FEF3C7", "--card": "#FFFFFF", "--card-border": "#FDE68A", "--text": "#92400E", "--text-soft": "#FBBF24", "--primary": "#D97706", "--hero": "#D97706", "--accent": "#F59E0B", "--nav-bg": "rgba(255,251,235,0.92)" }
};
function applyTheme(name){
  let t=themes[name]; if(!t) return;
  Object.entries(t).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));
  localStorage.setItem('omar_theme',name); localStorage.setItem('theme',name);
  let meta=document.querySelector('meta[name="theme-color"]'); if(meta) meta.content=t["--hero"];
  document.querySelectorAll('.theme-dot,.tdot').forEach(d=>d.classList.toggle('active',d.dataset.theme===name));
  try{ document.querySelectorAll('.page').forEach(f=>{ if(f.contentDocument){ Object.entries(t).forEach(([k,v])=>f.contentDocument.documentElement.style.setProperty(k,v)); } }); }catch(e){}
}
window.applyTheme=applyTheme;
document.addEventListener('DOMContentLoaded',()=>{ applyTheme(localStorage.getItem('omar_theme')||'green'); });

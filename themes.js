const themes = {
  graphite: { "--bg": "#F8FAFC", "--bg-soft": "#F1F5F9", "--card": "#FFFFFF", "--card-border": "#E2E8F0", "--text": "#0F172A", "--text-soft": "#94A3B8", "--primary": "#334155", "--hero": "#0F172A", "--accent": "#475569", "--nav-bg": "rgba(248,250,252,0.92)" },
  sage: { "--bg": "#F6F7F4", "--bg-soft": "#E8EBE3", "--card": "#FFFFFF", "--card-border": "#D6DCCF", "--text": "#2D3A2E", "--text-soft": "#8A9A82", "--primary": "#5B7553", "--hero": "#5B7553", "--accent": "#7A9A70", "--nav-bg": "rgba(246,247,244,0.92)" },
  sand: { "--bg": "#FDFCF8", "--bg-soft": "#F7F0E6", "--card": "#FFFFFF", "--card-border": "#E8DDC8", "--text": "#3C3A36", "--text-soft": "#B8A896", "--primary": "#B08D57", "--hero": "#8C6A3F", "--accent": "#C4A77A", "--nav-bg": "rgba(253,252,248,0.92)" },
  ocean: { "--bg": "#F7F9FB", "--bg-soft": "#E6EEF4", "--card": "#FFFFFF", "--card-border": "#CBD9E6", "--text": "#1E293B", "--text-soft": "#7A9CB5", "--primary": "#0E7490", "--hero": "#0E7490", "--accent": "#22A0BF", "--nav-bg": "rgba(247,249,251,0.92)" },
  midnight: { "--bg": "#0F172A", "--bg-soft": "#1E293B", "--card": "#1E293B", "--card-border": "#334155", "--text": "#F1F5F9", "--text-soft": "#64748B", "--primary": "#E2E8F0", "--hero": "#F8FAFC", "--accent": "#94A3B8", "--nav-bg": "rgba(15,23,42,0.92)" },
  forest: { "--bg": "#F4F7F4", "--bg-soft": "#DCE8DC", "--card": "#FFFFFF", "--card-border": "#B8D0B8", "--text": "#1A2E1A", "--text-soft": "#7AA07A", "--primary": "#2D5A2D", "--hero": "#2D5A2D", "--accent": "#4A7A4A", "--nav-bg": "rgba(244,247,244,0.92)" },
  clay: { "--bg": "#FDF8F6", "--bg-soft": "#F3E6E0", "--card": "#FFFFFF", "--card-border": "#E5CFC5", "--text": "#4A2C2A", "--text-soft": "#B58B82", "--primary": "#9B4A3B", "--hero": "#9B4A3B", "--accent": "#C06A5A", "--nav-bg": "rgba(253,248,246,0.92)" },
  stone: { "--bg": "#FAFAF9", "--bg-soft": "#F5F5F4", "--card": "#FFFFFF", "--card-border": "#E7E5E4", "--text": "#1C1917", "--text-soft": "#A8A29E", "--primary": "#57534E", "--hero": "#1C1917", "--accent": "#78716C", "--nav-bg": "rgba(250,250,249,0.92)" },
  lavender: { "--bg": "#FAF8FD", "--bg-soft": "#EDE8F6", "--card": "#FFFFFF", "--card-border": "#DDD6EE", "--text": "#2E2340", "--text-soft": "#9A8AB5", "--primary": "#6D5B8A", "--hero": "#6D5B8A", "--accent": "#8B7AA8", "--nav-bg": "rgba(250,248,253,0.92)" },
  green: { "--bg": "#F0FDF4", "--bg-soft": "#DCFCE7", "--card": "#FFFFFF", "--card-border": "#BBF7D0", "--text": "#14532D", "--text-soft": "#4ADE80", "--primary": "#16A34A", "--hero": "#16A34A", "--accent": "#22C55E", "--nav-bg": "rgba(240,253,244,0.92)" },
  blue: { "--bg": "#EFF6FF", "--bg-soft": "#DBEAFE", "--card": "#FFFFFF", "--card-border": "#BFDBFE", "--text": "#1E3A8A", "--text-soft": "#60A5FA", "--primary": "#2563EB", "--hero": "#2563EB", "--accent": "#3B82F6", "--nav-bg": "rgba(239,246,255,0.92)" }
};
const themeChannel = new BroadcastChannel('omar_theme_channel');
function applyThemeToDoc(doc, t){ Object.entries(t).forEach(([k,v])=>doc.documentElement.style.setProperty(k,v)); }
function renderThemeDots(){
  document.querySelectorAll('.theme-dots, #themeDots').forEach(wrap=>{
    wrap.innerHTML=''; let cur=localStorage.getItem('omar_theme')||'graphite';
    let btn=document.createElement('div'); btn.style.cssText=`display:flex;align-items:center;gap:6px;background:var(--bg-soft);border:1px solid var(--card-border);border-radius:8px;padding:6px 9px;cursor:pointer;font-size:10px;font-weight:700;min-width:110px;justify-content:space-between`;
    btn.innerHTML=`<div style="display:flex;gap:5px;align-items:center"><div style="width:12px;height:12px;border-radius:3px;background:${themes[cur]['--hero']}"></div><span>${cur}</span></div><span>▼</span>`;
    let dd=document.createElement('div'); dd.style.cssText=`display:none;position:absolute;top:100%;left:0;right:0;margin-top:4px;background:var(--card);border:1px solid var(--card-border);border-radius:10px;box-shadow:0 10px 25px -5px rgba(0,0,0,.15);z-index:100;max-height:240px;overflow:auto;padding:4px`;
    Object.entries(themes).forEach(([name,t])=>{
      let it=document.createElement('div'); it.style.cssText=`display:flex;gap:8px;padding:7px 8px;border-radius:6px;cursor:pointer;font-size:10px;font-weight:600;${name===cur?'background:var(--bg-soft);border:1px solid var(--card-border)':''}`;
      it.innerHTML=`<div style="display:flex;gap:2px"><div style="width:12px;height:12px;border-radius:3px;background:${t['--bg']};border:1px solid ${t['--card-border']}"></div><div style="width:12px;height:12px;border-radius:3px;background:${t['--hero']}"></div></div><span style="flex:1">${name}</span>${name===cur?'✓':''}`;
      it.onclick=(e)=>{e.stopPropagation(); applyTheme(name); dd.style.display='none'; renderThemeDots();}; dd.appendChild(it);
    });
    let w=document.createElement('div'); w.style.cssText='position:relative;flex:1'; w.appendChild(btn); w.appendChild(dd);
    btn.onclick=(e)=>{e.stopPropagation(); dd.style.display=dd.style.display==='none'?'block':'none';};
    wrap.appendChild(w);
  });
}
function applyTheme(name){
  let t=themes[name]; if(!t) return; applyThemeToDoc(document,t);
  localStorage.setItem('omar_theme',name); localStorage.setItem('_theme_bump',Date.now());
  document.querySelectorAll('.page').forEach(f=>{ if(f.contentDocument) applyThemeToDoc(f.contentDocument,t); });
  themeChannel.postMessage({type:'theme',name}); setTimeout(renderThemeDots,50);
}
function applyThemeLocal(name){ let t=themes[name]; if(!t) return; applyThemeToDoc(document,t); setTimeout(renderThemeDots,50); }
window.applyTheme=applyTheme; window.applyThemeLocal=applyThemeLocal; window.renderThemeDots=renderThemeDots;
themeChannel.onmessage=(e)=>{ if(e.data?.name) applyThemeLocal(e.data.name); };
window.addEventListener('storage',e=>{ if(e.key==='omar_theme') applyThemeLocal(e.newValue); });
document.addEventListener('DOMContentLoaded',()=>{ applyThemeLocal(localStorage.getItem('omar_theme')||'graphite'); renderThemeDots(); });

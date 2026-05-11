(function() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
  document.body.appendChild(container);

  window.API = async function(path, opts = {}) {
    // Detect if we are on GitHub Pages or local
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // REPLACE this with your actual backend URL after you host it
    const REMOTE_BACKEND = 'https://libmasys.wuaze.com/'; 
    const LOCAL_BACKEND = '../../backend/';
    
    const API_BASE = isLocal ? LOCAL_BACKEND : REMOTE_BACKEND;
    const response = await fetch(API_BASE + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...opts
    });
    const raw = await response.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { throw new Error('Invalid JSON'); }
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  window.showToast = function(message, type = 'info', duration = 3500) {
    const colors = { success:'#2e7d32', error:'#CE1126', info:'#0038A8', warning:'#fcd116' };
    const icons  = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
    const toast  = document.createElement('div');
    toast.style.cssText = `
      background:rgba(15,25,15,0.85);
      backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);
      border:1px solid ${colors[type]};
      border-left:4px solid ${colors[type]};
      color:#fff;
      padding:14px 18px;
      border-radius:12px;
      font-family:'Inter',sans-serif;
      font-size:14px;
      font-weight:500;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);
      display:flex;
      align-items:center;
      gap:10px;
      max-width:360px;
      animation:slideIn .3s ease;
      cursor:pointer;
    `;
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    toast.addEventListener('click', () => removeToast(toast));
    container.appendChild(toast);
    setTimeout(() => removeToast(toast), duration);
  };

  function removeToast(toast) {
    toast.style.animation = 'slideOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
    @keyframes slideOut { to{opacity:0;transform:translateX(40px)} }
  `;
  document.head.appendChild(style);
})();

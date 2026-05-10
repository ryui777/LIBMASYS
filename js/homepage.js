// HAMBURGER MENU
const menuBtn  = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay  = document.querySelector('.menu-overlay');

if (menuBtn) {
  menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    sideMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    menuBtn.classList.toggle('active');
  });
}
if (overlay) {
  overlay.addEventListener('click', () => {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
    if (menuBtn) menuBtn.classList.remove('active');
  });
}
const closeBtn = document.getElementById('closeBtn');
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
    if (menuBtn) menuBtn.classList.remove('active');
  });
}
document.addEventListener('click', e => {
  if (sideMenu && !sideMenu.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
    menuBtn.classList.remove('active');
  }
});

// SESSION CHECK
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res  = await fetch('api/session.php').then(r => r.json());
    const user = res.loggedIn ? res.user : null;

    const signUpLink  = document.querySelector('nav a.sig');
    const logInLink   = document.querySelector('nav a.log');
    const logoutBtn   = document.getElementById('logoutBtnDesktop');
    const profileCont = document.getElementById('profileContainer');
    const profileName = document.getElementById('profileName');

    const adminLink    = document.querySelector('a[href="admin-pg.html"]');
    const adminBorLink = document.querySelector('a[href="admin-bor.html"]');

    if (user) {
      if (signUpLink)  signUpLink.style.display  = 'none';
      if (logInLink)   logInLink.style.display    = 'none';
      if (logoutBtn)   logoutBtn.style.display    = 'inline-flex';
      if (profileCont) profileCont.style.display  = 'flex';
      if (profileName) profileName.textContent    = `Hi, ${user.name.split(' ')[0]}!`;
      if (user.role !== 'admin') {
        if (adminLink)    adminLink.style.display    = 'none';
        if (adminBorLink) adminBorLink.style.display = 'none';
      }
    } else {
      if (logoutBtn)   logoutBtn.style.display   = 'none';
      if (profileCont) profileCont.style.display = 'none';
      if (adminLink)    adminLink.style.display    = 'none';
      if (adminBorLink) adminBorLink.style.display = 'none';
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await fetch('api/logout.php', { method: 'POST' });
        window.location.reload();
      });
    }
  } catch {
    const adminLink    = document.querySelector('a[href="admin-pg.html"]');
    const adminBorLink = document.querySelector('a[href="admin-bor.html"]');
    if (adminLink)    adminLink.style.display    = 'none';
    if (adminBorLink) adminBorLink.style.display = 'none';
  }
});

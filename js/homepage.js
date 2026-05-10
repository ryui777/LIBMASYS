// HAMBURGER MENU
const menuBtn  = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay  = document.querySelector('.menu-overlay');

if (menuBtn) {
  menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = sideMenu.classList.contains('active');

    if (isOpen) {
      sideMenu.classList.remove('active');
      overlay.classList.remove('active');
      menuBtn.classList.remove('active');
    } else {
      sideMenu.classList.add('active');
      overlay.classList.add('active');
      menuBtn.classList.add('active');
    }
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

document.querySelectorAll('.info-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.info-item');
    const isOpen = item.classList.contains('active');

    document.querySelectorAll('.info-item').forEach(panel => {
      panel.classList.remove('active');
      panel.querySelector('.info-trigger')?.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
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

    const adminLinks = document.querySelectorAll('a[href="admin-pg.html"]');
    const adminBorLinks = document.querySelectorAll('a[href="admin-bor.html"]');
    const libraryLinks = document.querySelectorAll('a[href="user-db.html"]');

    if (user) {
      if (signUpLink)  signUpLink.style.display  = 'none';
      if (logInLink)   logInLink.style.display    = 'none';
      if (logoutBtn)   logoutBtn.style.display    = 'inline-flex';
      if (profileCont) profileCont.style.display  = 'flex';
      if (profileName) profileName.textContent    = `Hi, ${user.name.split(' ')[0]}!`;
      if (user.role !== 'admin') {
        adminLinks.forEach(link => link.style.display = 'none');
        adminBorLinks.forEach(link => link.style.display = 'none');
      } else {
        adminLinks.forEach(link => link.style.display = '');
        adminBorLinks.forEach(link => link.style.display = '');
        libraryLinks.forEach(link => link.style.display = 'none');
      }
    } else {
      if (logoutBtn)   logoutBtn.style.display   = 'none';
      if (profileCont) profileCont.style.display = 'none';
      adminLinks.forEach(link => link.style.display = 'none');
      adminBorLinks.forEach(link => link.style.display = 'none');
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await fetch('api/logout.php', { method: 'POST' });
        window.location.reload();
      });
    }
  } catch {
    document.querySelectorAll('a[href="admin-pg.html"]').forEach(link => link.style.display = 'none');
    document.querySelectorAll('a[href="admin-bor.html"]').forEach(link => link.style.display = 'none');
  }
});

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

  loadFeaturedBooks();
});

async function loadFeaturedBooks() {
  const grid = document.getElementById('featuredBooks');
  if (!grid) return;

  grid.innerHTML = '<p style="color:var(--muted);padding:20px;">Loading featured books...</p>';

  try {
    const books = await fetch('api/books.php').then(r => r.json());
    const featured = Array.isArray(books) ? books.slice(0, 4) : [];

    if (!featured.length) {
      grid.innerHTML = '<div class="empty-state"><p>No featured books yet.</p></div>';
      return;
    }

    grid.innerHTML = '';
    featured.forEach(book => {
      const card = document.createElement('a');
      card.className = 'book-card featured-book';
      card.href = 'books.html';
      card.innerHTML = `
        <img src="${book.img || 'images/default.jpg'}" alt="${book.title}" loading="lazy">
        <h3>${book.title}</h3>
        <p>${book.author}</p>
        <span>${book.category || 'Library Book'}</span>`;
      grid.appendChild(card);
    });
  } catch {
    grid.innerHTML = '<div class="empty-state"><p>Featured books are unavailable.</p></div>';
  }
}

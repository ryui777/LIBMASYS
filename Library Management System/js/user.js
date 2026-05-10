function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId)?.classList.add('active');
  document.querySelector(`.tab[onclick="showTab('${tabId}')"]`)?.classList.add('active');
}

async function loadUserBorrowed() {
  const list = document.getElementById('borrowedList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--muted)">Loading…</p>';
  let data = [];
  try {
    data = await fetch('api/borrow.php').then(r => r.json());
  } catch {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const all  = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
    data = user ? all.filter(b => b.email === user.email) : [];
  }
  list.innerHTML = '';
  if (!data.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>You haven\'t borrowed any books yet.</p></div>';
    return;
  }
  data.forEach(book => {
    const div = document.createElement('div');
    div.className = 'borrow-card' + (book.status === 'Returned' ? ' returned' : '');
    div.innerHTML = `
      <h4>${book.title || book.book_title}</h4>
      <p><strong>Borrowed:</strong> ${book.borrowed_date || book.date}</p>
      <p><strong>Due:</strong> ${book.due_date || book.dueDate || 'N/A'}</p>
      <p><strong>Status:</strong> <span class="${book.status === 'Returned' ? 'status-returned' : 'status-borrowed'}">${book.status}</span></p>
      ${book.status !== 'Returned' ? `<button class="return-btn" onclick="markReturned(${book.id})">✅ Mark as Returned</button>` : ''}`;
    list.appendChild(div);
  });
}

window.markReturned = async function(id) {
  try {
    const res = await fetch('api/return.php', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id }) }).then(r => r.json());
    if (res.success) { showToast('Returned successfully!', 'success'); loadUserBorrowed(); }
    else showToast(res.error || 'Failed.', 'error');
  } catch { showToast('Could not connect to server.', 'error'); }
};

async function loadUserFavorites() {
  const favList = document.getElementById('favList');
  if (!favList) return;
  favList.innerHTML = '<p style="color:var(--muted)">Loading…</p>';
  let data = [];
  try {
    data = await fetch('api/favorites.php').then(r => r.json());
  } catch {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const all  = JSON.parse(localStorage.getItem('favorites') || '[]');
    data = user ? all.filter(f => f.email === user.email) : [];
  }
  favList.innerHTML = '';
  if (!data.length) {
    favList.innerHTML = '<div class="empty-state"><div class="empty-icon">❌</div><p>No favorites yet.</p></div>';
    return;
  }
  data.forEach(fav => {
    const div = document.createElement('div');
    div.className = 'book-card';
    div.innerHTML = `
      <img src="${fav.img || 'images/default.jpg'}" alt="${fav.title}" style="width:100%;height:120px;object-fit:cover;border-radius:10px;">
      <h3>${fav.title}</h3>
      <p>${fav.category || fav.desc || ''}</p>
      <button onclick="removeFavorite(${fav.id})" style="margin-top:8px;width:100%;padding:8px;border:none;border-radius:8px;background:rgba(206,17,38,0.25);color:#ff6b6b;cursor:pointer;font-weight:600;">Remove</button>`;
    favList.appendChild(div);
  });
}

window.removeFavorite = async function(id) {
  try {
    const res = await fetch('api/favorites.php', { method:'DELETE', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id }) }).then(r => r.json());
    if (res.success) { showToast('Removed from favorites.', 'info'); loadUserFavorites(); }
    else showToast(res.error || 'Failed.', 'error');
  } catch { showToast('Could not connect.', 'error'); }
};

window.addEventListener('DOMContentLoaded', async () => {
  // Auth guard
  try {
    const s = await fetch('api/session.php').then(r => r.json());
    if (!s.loggedIn) { window.location.href = 'log.html'; return; }
    const nameEl = document.getElementById('dashUsername');
    if (nameEl) nameEl.textContent = s.user.name;
  } catch {
    if (!JSON.parse(localStorage.getItem('loggedInUser'))) { window.location.href = 'log.html'; return; }
  }
  loadUserBorrowed();
  loadUserFavorites();
  document.getElementById('borrowed')?.classList.add('active');
  document.querySelectorAll('.tab')[0]?.classList.add('active');
});

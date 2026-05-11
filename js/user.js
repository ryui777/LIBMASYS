// TAB SYSTEM
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));

  document.getElementById(tabId)?.classList.add('active');
  document.querySelector(`.tab[onclick="showTab('${tabId}')"]`)?.classList.add('active');
}


// ==========================
// LOAD BORROWED BOOKS
// ==========================
async function loadUserBorrowed() {
  const list = document.getElementById('borrowedList');
  if (!list) return;

  list.innerHTML = '<p style="color:var(--muted)">Loading...</p>';

  let data = [];
  try {
    data = await fetch('api/borrow.php').then(r => r.json());
  } catch {
    list.innerHTML = '<div class="empty-state"><p>Unable to load borrowed books.</p></div>';
    return;
  }

  list.innerHTML = '';

  if (!data.length) {
    list.innerHTML = '<div class="empty-state"><p>No borrowed books yet.</p></div>';
    return;
  }

  const isAdmin = currentUser?.role === 'admin';

  data.forEach(book => {
    const div = document.createElement('div');
    div.className = 'borrow-card' + (book.status === 'Returned' ? ' returned' : '');

    div.innerHTML = `
      <h4>${book.title}</h4>
      <p><strong>Borrowed:</strong> ${book.borrowed_date}</p>
      <p><strong>Due:</strong> ${book.due_date || 'N/A'}</p>
      <p>
        <strong>Status:</strong>
        <span class="${book.status === 'Returned' ? 'status-returned' : 'status-borrowed'}">
          ${book.status}
        </span>
      </p>

      ${
        book.status !== 'Returned' && isAdmin
          ? `<button class="return-btn" onclick="markReturned(${book.id})">
              Mark as Returned
            </button>`
          : ''
      }
    `;

    list.appendChild(div);
  });
}


// ==========================
// MARK AS RETURNED (ADMIN ONLY)
// ==========================
window.markReturned = async function(id) {
  if (currentUser?.role !== 'admin') {
    showToast('Unauthorized action.', 'error');
    return;
  }

  try {
    const res = await fetch('api/return.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(r => r.json());

    if (res.success) {
      showToast('Marked as returned.', 'success');
      loadUserBorrowed();
    } else {
      showToast(res.error || 'Failed.', 'error');
    }
  } catch {
    showToast('Server error.', 'error');
  }
};


// ==========================
// FAVORITES
// ==========================
async function loadUserFavorites() {
  const favList = document.getElementById('favList');
  if (!favList) return;

  favList.innerHTML = '<p style="color:var(--muted)">Loading...</p>';

  let data = [];
  try {
    data = await fetch('api/favorites.php').then(r => r.json());
  } catch {
    favList.innerHTML = '<div class="empty-state"><p>Unable to load favorites.</p></div>';
    return;
  }

  favList.innerHTML = '';

  if (!data.length) {
    favList.innerHTML = '<div class="empty-state"><p>No favorites yet.</p></div>';
    return;
  }

  data.forEach(fav => {
    const div = document.createElement('div');
    div.className = 'book-card';

    div.innerHTML = `
      <img src="${fav.img || 'images/default.jpg'}" style="width:100%;height:120px;object-fit:cover;border-radius:10px;">
      <h3>${fav.title}</h3>
      <p>${fav.category || ''}</p>

      <button onclick="removeFavorite(${fav.id})"
        style="margin-top:8px;width:100%;padding:8px;border:none;border-radius:8px;
        background:rgba(206,17,38,0.25);color:#ff6b6b;font-weight:600;">
        Remove
      </button>
    `;

    favList.appendChild(div);
  });
}


// REMOVE FAVORITE
window.removeFavorite = async function(id) {
  try {
    const res = await fetch('api/favorites.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(r => r.json());

    if (res.success) {
      showToast('Removed from favorites.', 'info');
      loadUserFavorites();
    } else {
      showToast(res.error || 'Failed.', 'error');
    }
  } catch {
    showToast('Server error.', 'error');
  }
};


// ==========================
// ON PAGE LOAD
// ==========================
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const session = await fetch('api/session.php').then(r => r.json());

    if (!session.loggedIn) {
      window.location.href = 'log.html';
      return;
    }

    currentUser = session.user;

    const nameEl = document.getElementById('dashUsername');
    if (nameEl) nameEl.textContent = currentUser.name;

  } catch {
    window.location.href = 'log.html';
    return;
  }

  loadUserBorrowed();
  loadUserFavorites();

  document.getElementById('borrowed')?.classList.add('active');
  document.querySelectorAll('.tab')[0]?.classList.add('active');

  setInterval(() => {
    loadUserBorrowed();
    loadUserFavorites();
  }, 5000);
});

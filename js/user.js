function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId)?.classList.add('active');
  document.querySelector(`.tab[onclick="showTab('${tabId}')"]`)?.classList.add('active');
}

async function loadUserBorrowed() {
  const list = document.getElementById('borrowedList');
  if (!list) return;

  list.innerHTML = '<p style="color:var(--muted)">Loading...</p>';

  let data = [];
  try {
    data = await API('api/borrow.php');
  } catch {
    list.innerHTML = '<div class="empty-state"><p>Unable to load borrowed books. Check Apache and MySQL.</p></div>';
    return;
  }

  list.innerHTML = '';
  if (!data.length) {
    list.innerHTML = '<div class="empty-state"><p>You have not borrowed any books yet.</p></div>';
    return;
  }

  data.forEach(book => {
    const div = document.createElement('div');
    div.className = 'borrow-card' + (book.status === 'Returned' ? ' returned' : '');
    div.innerHTML = `
      <h4>${book.title}</h4>
      <p><strong>Borrowed:</strong> ${book.borrowed_date}</p>
      <p><strong>Due:</strong> ${book.due_date || 'N/A'}</p>
      <p><strong>Status:</strong> <span class="${book.status === 'Returned' ? 'status-returned' : 'status-borrowed'}">${book.status}</span></p>
      ${book.status !== 'Returned' ? `<button class="return-btn" onclick="markReturned(${book.id})">Mark as Returned</button>` : ''}`;
    list.appendChild(div);
  });
}

window.markReturned = async function(id) {
  try {
    const res = await API('api/return.php', {
      method: 'POST',
      body: JSON.stringify({ id })
    });

    if (res.success) {
      showToast('Returned successfully.', 'success');
      loadUserBorrowed();
    } else {
      showToast(res.error || 'Failed.', 'error');
    }
  } catch {
    showToast('Could not connect to server.', 'error');
  }
};

async function loadUserFavorites() {
  const favList = document.getElementById('favList');
  if (!favList) return;

  favList.innerHTML = '<p style="color:var(--muted)">Loading...</p>';

  let data = [];
  try {
    data = await API('api/favorites.php');
  } catch {
    favList.innerHTML = '<div class="empty-state"><p>Unable to load favorites. Check Apache and MySQL.</p></div>';
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
      <img src="${fav.img || 'images/default.jpg'}" alt="${fav.title}" style="width:100%;height:120px;object-fit:cover;border-radius:10px;">
      <h3>${fav.title}</h3>
      <p>${fav.category || ''}</p>
      <button onclick="removeFavorite(${fav.id})" style="margin-top:8px;width:100%;padding:8px;border:none;border-radius:8px;background:rgba(206,17,38,0.25);color:#ff6b6b;cursor:pointer;font-weight:600;">Remove</button>`;
    favList.appendChild(div);
  });
}

window.removeFavorite = async function(id) {
  try {
    const res = await API('api/favorites.php', {
      method: 'DELETE',
      body: JSON.stringify({ id })
    });

    if (res.success) {
      showToast('Removed from favorites.', 'info');
      loadUserFavorites();
    } else {
      showToast(res.error || 'Failed.', 'error');
    }
  } catch {
    showToast('Could not connect.', 'error');
  }
};

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const session = await API('api/session.php');
    if (!session.loggedIn) {
      window.location.href = 'log.html';
      return;
    }

    const nameEl = document.getElementById('dashUsername');
    if (nameEl) nameEl.textContent = session.user.name;
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

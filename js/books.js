let allBooks = [];
let currentUser = null;
let borrowedBookIds = new Set();
let favoriteBookIds = new Set();

async function loadSession() {
  try {
    const session = await API('api/session.php');
    currentUser = session.loggedIn ? session.user : null;
  } catch {
    currentUser = null;
  }
}

async function loadStudentState() {
  borrowedBookIds = new Set();
  favoriteBookIds = new Set();

  if (!currentUser || currentUser.role !== 'user') return;

  const [borrowed, favorites] = await Promise.all([
    API('api/borrow.php').catch(() => []),
    API('api/favorites.php').catch(() => [])
  ]);

  borrowed
    .filter(item => item.status === 'Borrowed')
    .forEach(item => borrowedBookIds.add(Number(item.book_id)));

  favorites.forEach(item => favoriteBookIds.add(Number(item.book_id)));
}

async function loadBooks(search = '', category = '') {
  const grid = document.querySelector('.book-grid');
  if (!grid) return;

  grid.innerHTML = '<p style="color:var(--muted);padding:20px;">Loading books...</p>';

  try {
    await loadSession();
    const url = `api/books.php?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`;
    allBooks = await API(url);
    await loadStudentState();

    if (!Array.isArray(allBooks) || allBooks.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p>No books found.</p></div>';
      return;
    }

    renderBooks(allBooks);
  } catch {
    grid.innerHTML = '<div class="empty-state"><p>Unable to load books. Start Apache and MySQL, then refresh.</p></div>';
  }
}

function renderBooks(books) {
  const grid = document.querySelector('.book-grid');
  grid.innerHTML = '';

  books.forEach(book => {
    const bookId = Number(book.id);
    const borrowed = borrowedBookIds.has(bookId);
    const favorite = favoriteBookIds.has(bookId);
    const isAdmin = currentUser?.role === 'admin';

    const card = document.createElement('div');
    card.className = `book-card page-fade${favorite ? ' favorited' : ''}${borrowed ? ' borrowed-card' : ''}`;
    card.innerHTML = `
      <img src="${book.img || 'images/default.jpg'}" alt="${book.title}" loading="lazy">
      <h3>${book.title}</h3>
      <p>${book.author}</p>
      <p style="font-size:12px;color:rgba(255,255,255,0.4)">${book.category || ''}</p>
      ${renderActions(book, borrowed, favorite, isAdmin)}`;
    grid.appendChild(card);

    if (isAdmin) {
      card.querySelector('.manage')?.addEventListener('click', () => {
        window.location.href = 'admin-pg.html';
      });
      return;
    }

    card.querySelector('.borrow')?.addEventListener('click', () => borrowBook(book));
    card.querySelector('.favorite')?.addEventListener('click', () => addFavorite(book));
  });
}

function renderActions(book, borrowed, favorite, isAdmin) {
  if (!currentUser) {
    return '<div class="book-actions"><button class="borrow">Log in to borrow</button></div>';
  }

  if (isAdmin) {
    return '<div class="book-actions"><button class="manage">Manage in CRUD</button></div>';
  }

  return `
    <div class="book-actions">
      <button class="borrow" data-id="${book.id}" ${borrowed ? 'disabled' : ''}>${borrowed ? 'Borrowed' : 'Borrow'}</button>
      <button class="favorite" data-id="${book.id}" ${favorite ? 'disabled' : ''}>${favorite ? 'Favorited' : 'Favorite'}</button>
    </div>`;
}

async function borrowBook(book) {
  if (!currentUser) {
    window.location.href = 'log.html';
    return;
  }

  try {
    const res = await API('api/borrow.php', {
      method: 'POST',
      body: JSON.stringify({ book_id: book.id })
    });

    if (res.success) {
      borrowedBookIds.add(Number(book.id));
      renderBooks(allBooks);
      showToast(`Borrowed. Due: ${res.due_date}`, 'success');
    } else {
      showToast(res.error || 'Could not borrow.', 'error');
    }
  } catch {
    showToast('Please log in or start XAMPP.', 'warning');
  }
}

async function addFavorite(book) {
  if (!currentUser) {
    window.location.href = 'log.html';
    return;
  }

  try {
    const res = await API('api/favorites.php', {
      method: 'POST',
      body: JSON.stringify({ book_id: book.id })
    });

    if (res.success) {
      favoriteBookIds.add(Number(book.id));
      renderBooks(allBooks);
      showToast('Added to favorites.', 'success');
    } else {
      showToast(res.error || 'Could not add.', 'error');
    }
  } catch {
    showToast('Please log in or start XAMPP.', 'warning');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const searchInp = document.getElementById('bookSearch');
  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get('q') || '';

  if (searchInp && initialSearch) searchInp.value = initialSearch;
  loadBooks(initialSearch);

  if (searchInp) {
    let timer;
    searchInp.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => loadBooks(searchInp.value), 400);
    });
  }

  setInterval(async () => {
    if (!allBooks.length) return;
    await loadStudentState();
    renderBooks(allBooks);
  }, 5000);
});

let allBooks = [];

async function loadBooks(search = '', category = '') {
  const grid = document.querySelector('.book-grid');
  if (!grid) return;
  grid.innerHTML = '<p style="color:var(--muted);padding:20px;">Loading books...</p>';
  try {
    const url = `api/books.php?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`;
    allBooks = await fetch(url).then(r => r.json());
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
    const card = document.createElement('div');
    card.className = 'book-card page-fade';
    card.innerHTML = `
      <img src="${book.img || 'images/default.jpg'}" alt="${book.title}" loading="lazy">
      <h3>${book.title}</h3>
      <p>${book.author}</p>
      <p style="font-size:12px;color:rgba(255,255,255,0.4)">${book.category || ''}</p>
      <div class="book-actions">
        <button class="borrow" data-id="${book.id}" data-title="${book.title}">Borrow</button>
        <button class="favorite" data-id="${book.id}">Favorite</button>
      </div>`;
    grid.appendChild(card);

    card.querySelector('.borrow').addEventListener('click', async () => {
      try {
        const res = await fetch('api/borrow.php', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ book_id: book.id })
        }).then(r => r.json());
        if (res.success) showToast(`Borrowed. Due: ${res.due_date}`, 'success');
        else showToast(res.error || 'Could not borrow.', 'error');
      } catch {
        showToast('Please log in or start XAMPP.', 'warning');
      }
    });

    card.querySelector('.favorite').addEventListener('click', async () => {
      try {
        const res = await fetch('api/favorites.php', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ book_id: book.id })
        }).then(r => r.json());
        if (res.success) showToast('Added to favorites.', 'success');
        else showToast(res.error || 'Could not add.', 'error');
      } catch {
        showToast('Please log in or start XAMPP.', 'warning');
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadBooks();
  const searchInp = document.getElementById('bookSearch');
  if (searchInp) {
    let timer;
    searchInp.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => loadBooks(searchInp.value), 400);
    });
  }
});

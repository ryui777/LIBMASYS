let books = [];
let editingId = null;

async function requireAdmin() {
  const session = await API('api/session.php');
  if (!session.loggedIn || session.user.role !== 'admin') {
    window.location.href = 'homepage.html';
    return false;
  }
  return true;
}

async function loadBooks() {
  try {
    books = await API('api/books.php');
  } catch {
    books = [];
    showToast('Unable to load books. Check Apache and MySQL.', 'error');
  }
  renderStats();
  renderBooks();
}

function renderStats() {
  const el = document.getElementById('statBooks');
  if (el) el.textContent = books.length;
}

function renderBooks() {
  const list = document.getElementById('adminBookList');
  if (!list) return;

  list.innerHTML = '';
  if (!books.length) {
    list.innerHTML = '<div class="empty-state"><p>No books yet. Add one.</p></div>';
    return;
  }

  books.forEach(book => {
    const div = document.createElement('div');
    div.className = 'book-card';
    div.innerHTML = `
      <img src="${book.img || 'images/default.jpg'}" alt="${book.title}" style="width:100%;height:130px;object-fit:cover;border-radius:10px;">
      <h3 style="font-size:14px;margin:8px 0 4px">${book.title}</h3>
      <p style="font-size:12px;color:var(--muted)">${book.author}</p>
      <p style="font-size:12px;color:rgba(255,255,255,0.35)">${book.category || ''}</p>
      <div class="admin-actions">
        <button class="edit-btn" onclick="editBook(${book.id})">Edit</button>
        <button class="delete-btn" onclick="deleteBook(${book.id})">Delete</button>
      </div>`;
    list.appendChild(div);
  });
}

window.addOrUpdateBook = async function() {
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const category = document.getElementById('category').value.trim();
  const img = document.getElementById('image').value.trim() || 'images/default.jpg';
  if (!title || !author) return showToast('Title and author are required.', 'warning');

  const btn = document.querySelector('.add-btn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    let res;
    if (editingId) {
      res = await API('api/books.php', {
        method: 'PUT',
        body: JSON.stringify({ id: editingId, title, author, category, img })
      });
    } else {
      res = await API('api/books.php', {
        method: 'POST',
        body: JSON.stringify({ title, author, category, img })
      });
    }

    if (res.success || res.id) {
      showToast(editingId ? 'Book updated.' : 'Book added.', 'success');
      editingId = null;
      clearForm();
      document.querySelector('.add-btn').textContent = 'Add Book';
      loadBooks();
    } else {
      showToast(res.error || 'Failed to save.', 'error');
    }
  } catch {
    showToast('Unable to save. Check Apache and MySQL.', 'error');
  }

  btn.disabled = false;
};

window.editBook = function(id) {
  const book = books.find(b => b.id == id);
  if (!book) return;

  document.getElementById('title').value = book.title;
  document.getElementById('author').value = book.author;
  document.getElementById('category').value = book.category || '';
  document.getElementById('image').value = book.img || '';
  editingId = id;
  document.querySelector('.add-btn').textContent = 'Update Book';
  document.getElementById('title').focus();
};

window.deleteBook = async function(id) {
  if (!confirm('Delete this book?')) return;

  try {
    const res = await API('api/books.php', {
      method: 'DELETE',
      body: JSON.stringify({ id })
    });

    if (res.success) {
      showToast('Book deleted.', 'info');
      loadBooks();
    } else {
      showToast(res.error || 'Failed.', 'error');
    }
  } catch {
    showToast('Unable to delete. Check Apache and MySQL.', 'error');
  }
};

function clearForm() {
  ['title', 'author', 'category', 'image'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  if (await requireAdmin()) loadBooks();
});

async function requireAdmin() {
  const session = await fetch('api/session.php').then(r => r.json());
  if (!session.loggedIn || session.user.role !== 'admin') {
    window.location.href = 'homepage.html';
    return false;
  }
  return true;
}

async function loadBorrowed() {
  const container = document.getElementById('adminBorrowedList');
  if (!container) return;

  container.innerHTML = '<p style="color:var(--muted);padding:20px;">Loading...</p>';

  let borrowed = [];
  try {
    borrowed = await fetch('api/borrow.php').then(r => r.json());
  } catch {
    container.innerHTML = '<div class="empty-state"><p>Unable to load borrowed books. Check Apache and MySQL.</p></div>';
    return;
  }

  container.innerHTML = '';
  if (!borrowed.length) {
    container.innerHTML = '<div class="empty-state"><p>No borrowed books yet.</p></div>';
    return;
  }

  borrowed.forEach(book => {
    const div = document.createElement('div');
    div.className = 'borrow-card' + (book.status === 'Returned' ? ' returned' : '');
    div.innerHTML = `
      <h4>${book.title || 'Unknown'}</h4>
      <p><strong>User:</strong> ${book.userName || 'Unknown'}</p>
      <p><strong>Email:</strong> ${book.email || 'N/A'}</p>
      <p><strong>Borrowed:</strong> ${book.borrowed_date || 'N/A'}</p>
      <p><strong>Due:</strong> ${book.due_date || 'N/A'}</p>
      <p><strong>Status:</strong> <span class="${book.status === 'Returned' ? 'status-returned' : 'status-borrowed'}">${book.status}</span></p>
      ${book.status !== 'Returned' ? `<button class="return-btn" onclick="markReturned(${book.id}, this)">Mark Returned</button>` : ''}`;
    container.appendChild(div);
  });
}

window.markReturned = async function(id, btn) {
  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    const res = await fetch('api/return.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(r => r.json());

    if (res.success) {
      showToast('Marked as returned.', 'success');
      loadBorrowed();
    } else {
      showToast(res.error || 'Failed.', 'error');
      btn.disabled = false;
      btn.textContent = 'Mark Returned';
    }
  } catch {
    showToast('Unable to update. Check Apache and MySQL.', 'error');
    btn.disabled = false;
    btn.textContent = 'Mark Returned';
  }
};

window.addEventListener('DOMContentLoaded', async () => {
  if (await requireAdmin()) {
    loadBorrowed();
    setInterval(loadBorrowed, 5000);
  }
});

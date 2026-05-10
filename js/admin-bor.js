async function loadBorrowed() {
  const container = document.getElementById('adminBorrowedList');
  if (!container) return;
  container.innerHTML = '<p style="color:var(--muted);padding:20px;">Loading…</p>';
  let borrowed = [];
  try {
    borrowed = await fetch('api/borrow.php').then(r => r.json());
  } catch {
    borrowed = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
  }
  container.innerHTML = '';
  if (!borrowed.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No borrowed books yet.</p></div>';
    return;
  }
  borrowed.forEach(book => {
    const div = document.createElement('div');
    div.className = 'borrow-card' + (book.status === 'Returned' ? ' returned' : '');
    div.innerHTML = `
      <h4>${book.title || book.book_title || 'Unknown'}</h4>
      <p><strong>User:</strong> ${book.userName || book.name || 'Unknown'}</p>
      <p><strong>Email:</strong> ${book.email || '—'}</p>
      <p><strong>Borrowed:</strong> ${book.borrowed_date || book.date || '—'}</p>
      <p><strong>Due:</strong> ${book.due_date || book.dueDate || '—'}</p>
      <p><strong>Status:</strong> <span class="${book.status === 'Returned' ? 'status-returned' : 'status-borrowed'}">${book.status}</span></p>
      ${book.status !== 'Returned' ? `<button class="return-btn" onclick="markReturned(${book.id || ''}, this)">✅ Mark Returned</button>` : ''}`;
    container.appendChild(div);
  });
}

window.markReturned = async function(id, btn) {
  btn.disabled = true; btn.textContent = 'Processing…';
  try {
    const res = await fetch('api/return.php', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id }) }).then(r => r.json());
    if (res.success) { showToast('Marked as returned.', 'success'); loadBorrowed(); }
    else { showToast(res.error || 'Failed.', 'error'); btn.disabled = false; btn.textContent = '✅ Mark Returned'; }
  } catch {
    let borrowed = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
    if (id < borrowed.length) { borrowed[id].status = 'Returned'; localStorage.setItem('borrowedBooks', JSON.stringify(borrowed)); }
    showToast('Marked as returned.', 'success'); loadBorrowed();
  }
};

window.addEventListener('DOMContentLoaded', loadBorrowed);

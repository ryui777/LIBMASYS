let borrowedCache = [];

// =====================
// ADMIN CHECK
// =====================
async function requireAdmin() {
    const session = await fetch('api/session.php').then(r => r.json());

    if (!session.loggedIn || session.user.role !== 'admin') {
        window.location.href = 'homepage.html';
        return false;
    }
    return true;
}

// =====================
// LOAD BORROWED DATA
// =====================
async function loadBorrowed() {
    const container = document.getElementById('adminBorrowedList');
    if (!container) return;

    container.innerHTML = '<p style="color:var(--muted);padding:20px;">Loading...</p>';

    try {
        borrowedCache = await fetch('api/borrow.php').then(r => r.json());
    } catch (err) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Unable to load borrowed books. Check server.</p>
            </div>`;
        return;
    }

    if (!Array.isArray(borrowedCache) || borrowedCache.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No borrowed books yet.</p>
            </div>`;
        return;
    }

    container.innerHTML = '';

    borrowedCache.forEach(book => {
        const div = document.createElement('div');
        div.className = 'borrow-card' + (book.status === 'Returned' ? ' returned' : '');

        div.innerHTML = `
            <h4>${book.title || 'Unknown'}</h4>
            <p><strong>User:</strong> ${book.userName || 'Unknown'}</p>
            <p><strong>Email:</strong> ${book.email || 'N/A'}</p>
            <p><strong>Borrowed:</strong> ${book.borrowed_date || 'N/A'}</p>
            <p><strong>Due:</strong> ${book.due_date || 'N/A'}</p>
            <p>
                <strong>Status:</strong>
                <span class="${book.status === 'Returned' ? 'status-returned' : 'status-borrowed'}">
                    ${book.status || 'N/A'}
                </span>
            </p>

            ${
                book.status !== 'Returned'
                    ? `<button class="return-btn" onclick="markReturned(${book.id}, this)">
                        Mark Returned
                       </button>`
                    : ''
            }
        `;

        container.appendChild(div);
    });
}

// =====================
// MARK AS RETURNED
// =====================
window.markReturned = async function (id, btn) {
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
    } catch (err) {
        showToast('Server error.', 'error');
        btn.disabled = false;
        btn.textContent = 'Mark Returned';
    }
};

// =====================
// EXPORT PDF
// =====================
window.exportToPDF = function () {
    const ok = confirm("Download PDF report of borrowed books?");
    if (!ok) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Borrowed Books Report", 14, 12);

    const rows = borrowedCache.map(b => [
        b.title || "Unknown",
        b.userName || "Unknown",
        b.email || "N/A",
        b.borrowed_date || "N/A",
        b.due_date || "N/A",
        b.status || "N/A"
    ]);

    doc.autoTable({
        head: [["Title", "User", "Email", "Borrowed", "Due", "Status"]],
        body: rows
    });

    doc.save("borrowed-books.pdf");
};


// =====================
// EXPORT EXCEL
// =====================
window.exportToExcel = function () {
    const ok = confirm("Download Excel report of borrowed books?");
    if (!ok) return;

    const data = borrowedCache.map(b => ({
        Title: b.title || "Unknown",
        User: b.userName || "Unknown",
        Email: b.email || "N/A",
        Borrowed: b.borrowed_date || "N/A",
        Due: b.due_date || "N/A",
        Status: b.status || "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Borrowed Books");
    XLSX.writeFile(wb, "borrowed-books.xlsx");
};

// =====================
// INIT
// =====================
window.addEventListener('DOMContentLoaded', async () => {
    if (await requireAdmin()) {
        loadBorrowed();
        setInterval(loadBorrowed, 5000);
    }
});

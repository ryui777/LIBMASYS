// ── UTILITIES ──────────────────────────────────────
// API wrapper is now globally defined in toast.js

// ── PASSWORD TOGGLE ─────────────────────────────────
document.querySelectorAll('.toggle-pass').forEach(icon => {
  icon.addEventListener('click', () => {
    const inp = icon.closest('.input-grp').querySelector('input');
    const isPass = inp.type === 'password';
    inp.type = isPass ? 'text' : 'password';
    icon.name = isPass ? 'eye' : 'eye-off';
  });
});

document.querySelectorAll('.role-option input').forEach(input => {
  input.addEventListener('change', () => {
    document.querySelectorAll('.role-option').forEach(option => {
      option.classList.toggle('active', option.querySelector('input').checked);
    });
  });
});

// ── SESSION → REDIRECT IF ALREADY LOGGED IN ─────────
API('api/session.php').then(s => {
  if (s.loggedIn) window.location.href = 'homepage.html';
});

// ── SIGN UP ──────────────────────────────────────────
const signUpForm = document.getElementById('SignUpForm');
if (signUpForm) {
  signUpForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name  = document.getElementById('fname').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass  = document.getElementById('pass').value;
    const cpass = document.getElementById('conpass').value;

    if (!name || !email || !pass) return showToast('Please fill all fields.', 'warning');
    if (pass.length < 8) return showToast('Password must be at least 8 characters.', 'warning');
    if (pass !== cpass) return showToast('Passwords do not match.', 'error');

    const btn = signUpForm.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Creating account…';

    try {
      const res = await API('api/register.php', { method: 'POST', body: JSON.stringify({ name, email, password: pass }) });
      if (res.success) {
        showToast('Account created! Redirecting to login…', 'success');
        setTimeout(() => window.location.href = 'log.html', 1800);
      } else {
        showToast(res.error || 'Registration failed.', 'error');
        btn.disabled = false; btn.textContent = 'Sign Up';
      }
    } catch (err) {
      showToast(err.message || 'Cannot reach API. Check Apache/XAMPP and URL.', 'error');
      btn.disabled = false; btn.textContent = 'Sign Up';
    }
  });
}

// ── LOGIN ─────────────────────────────────────────────
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = loginForm.querySelector('input[name="email"]').value.trim();
    const pass  = loginForm.querySelector('input[name="password"]').value;
    const remember = loginForm.querySelector('input[name="rememberMe"]')?.checked;
    const role = loginForm.querySelector('input[name="role"]:checked')?.value || 'user';

    if (!email || !pass) return showToast('Please enter email and password.', 'warning');

    const btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Logging in…';

    try {
      const res = await API('api/login.php', { method: 'POST', body: JSON.stringify({ email, password: pass, role }) });
      if (res.success) {
        if (remember) localStorage.setItem('rememberEmail', email);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        setTimeout(() => {
          window.location.href = res.user.role === 'admin' ? 'admin-pg.html' : 'books.html';
        }, 900);
      } else {
        showToast(res.error || 'Invalid credentials.', 'error');
        btn.disabled = false; btn.textContent = 'Log In';
      }
    } catch (err) {
      showToast(err.message || 'Cannot reach API. Check Apache/XAMPP and URL.', 'error');
      btn.disabled = false; btn.textContent = 'Log In';
    }
  });

  const remembered = localStorage.getItem('rememberEmail');
  if (remembered) {
    const emailInput = loginForm.querySelector('input[name="email"]');
    if (emailInput) { emailInput.value = remembered; loginForm.querySelector('input[name="rememberMe"]').checked = true; }
  }
}

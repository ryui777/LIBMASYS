// ── UTILITIES ──────────────────────────────────────
const API = (path, opts = {}) =>
  fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts })
    .then(r => r.json());

// ── PASSWORD TOGGLE ─────────────────────────────────
document.querySelectorAll('.toggle-pass').forEach(icon => {
  icon.addEventListener('click', () => {
    const inp = icon.closest('.input-grp').querySelector('input');
    const isPass = inp.type === 'password';
    inp.type = isPass ? 'text' : 'password';
    icon.name = isPass ? 'eye' : 'eye-off';
  });
});

// ── SESSION → REDIRECT IF ALREADY LOGGED IN ─────────
fetch('api/session.php').then(r => r.json()).then(s => {
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
    } catch {
      showToast('Server error. Make sure XAMPP is running.', 'error');
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

    if (!email || !pass) return showToast('Please enter email and password.', 'warning');

    const btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Logging in…';

    try {
      const res = await API('api/login.php', { method: 'POST', body: JSON.stringify({ email, password: pass }) });
      if (res.success) {
        if (remember) localStorage.setItem('rememberEmail', email);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        setTimeout(() => window.location.href = 'homepage.html', 1200);
      } else {
        showToast(res.error || 'Invalid credentials.', 'error');
        btn.disabled = false; btn.textContent = 'Log In';
      }
    } catch {
      showToast('Server error. Make sure XAMPP is running.', 'error');
      btn.disabled = false; btn.textContent = 'Log In';
    }
  });

  const remembered = localStorage.getItem('rememberEmail');
  if (remembered) {
    const emailInput = loginForm.querySelector('input[name="email"]');
    if (emailInput) { emailInput.value = remembered; loginForm.querySelector('input[name="rememberMe"]').checked = true; }
  }
}

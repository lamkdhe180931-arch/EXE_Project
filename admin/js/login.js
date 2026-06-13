// Login page logic. No guard here — this is where a token is obtained.
(function () {
  'use strict';
  var core = window.AdminCore;

  // Already a valid admin? Skip straight to the dashboard.
  if (core.isTokenValid(Admin.getToken()) && core.getRole(Admin.getToken()) === 'ADMIN') {
    window.location.href = 'index.html';
    return;
  }

  var form = document.getElementById('login-form');
  var msg = document.getElementById('msg');

  function showError(text) {
    msg.textContent = text;
    msg.classList.add('is-show');
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    msg.classList.remove('is-show');

    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;

    try {
      var res = await fetch(Admin.API_BASE + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });
      var data = await res.json();
      if (!res.ok) {
        showError(data.error || 'Đăng nhập thất bại');
        return;
      }
      // Only admins may use this panel — reject customers even if credentials are valid.
      if (!data.user || data.user.role !== 'ADMIN') {
        showError('Tài khoản này không có quyền quản trị.');
        return;
      }
      Admin.setToken(data.accessToken);
      window.location.href = 'index.html';
    } catch (err) {
      showError('Không kết nối được máy chủ. Kiểm tra backend đang chạy?');
    }
  });
})();

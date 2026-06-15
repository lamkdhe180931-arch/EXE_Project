// Admin auth + shared chrome. Depends on core.js (window.AdminCore).
// Load order per page: core.js → auth.js → <page>.js
(function () {
  'use strict';
  var core = window.AdminCore;

  // Backend base URL. Override for deploy: localStorage.setItem('artdict_api', 'https://api...').
  var API_BASE = (localStorage.getItem('artdict_api') || 'http://localhost:3000') + '/api';
  var TOKEN_KEY = 'artdict_admin_token';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }

  function toLogin() { window.location.href = 'login.html'; }

  // Guard a protected page: must have a valid, non-expired ADMIN token.
  function guard() {
    var token = getToken();
    if (!core.isTokenValid(token) || core.getRole(token) !== 'ADMIN') {
      clearToken();
      toLogin();
      return false;
    }
    return true;
  }

  // fetch wrapper — attaches Bearer, parses JSON, redirects to login on 401.
  async function api(path, options) {
    options = options || {};
    var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    var token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    // no-store: the admin panel must always see fresh data — never a cached GET
    // (otherwise the list won't reflect a create/edit/delete made this session).
    var res = await fetch(API_BASE + path, Object.assign({ cache: 'no-store' }, options, { headers: headers }));
    if (res.status === 401) {
      clearToken();
      toLogin();
      throw new Error('Phiên đăng nhập đã hết hạn');
    }
    var data = null;
    try { data = await res.json(); } catch (e) { /* 204/empty body */ }
    if (!res.ok) {
      throw new Error((data && data.error) || ('Lỗi ' + res.status));
    }
    return data;
  }

  function logout() {
    clearToken();
    toLogin();
  }

  // Render the shared sidebar into <div id="admin-nav"> and wire logout.
  var NAV = [
    { href: 'index.html', key: 'dashboard', label: 'Tổng quan' },
    { href: 'products.html', key: 'products', label: 'Sản phẩm' },
    { href: 'orders.html', key: 'orders', label: 'Đơn hàng' },
    { href: 'artists.html', key: 'artists', label: 'Nghệ sĩ' },
    { href: 'posts.html', key: 'posts', label: 'Bài viết' },
  ];
  function renderChrome(active) {
    var nav = document.getElementById('admin-nav');
    if (!nav) return;
    var links = NAV.map(function (n) {
      var cls = n.key === active ? ' class="is-active"' : '';
      return '<a href="' + n.href + '"' + cls + '>' + n.label + '</a>';
    }).join('');
    var role = core.getRole(getToken()) || '';
    nav.innerHTML =
      '<div class="sidebar__brand">Art<span>dict.</span></div>' +
      links +
      '<div class="sidebar__spacer"></div>' +
      '<div class="sidebar__user">' + role + '</div>' +
      '<a href="#" id="admin-logout">Đăng xuất</a>';
    var btn = document.getElementById('admin-logout');
    if (btn) btn.addEventListener('click', function (e) { e.preventDefault(); logout(); });
  }

  // escape user/content text before injecting as HTML in tables.
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Init a protected page in one call: guard → render chrome.
  function initPage(active) {
    if (!guard()) return false;
    renderChrome(active);
    return true;
  }

  window.Admin = {
    API_BASE: API_BASE,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    guard: guard,
    api: api,
    logout: logout,
    renderChrome: renderChrome,
    initPage: initPage,
    esc: esc,
  };
})();

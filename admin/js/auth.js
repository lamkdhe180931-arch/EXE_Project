// Admin auth + shared chrome. Depends on core.js (window.AdminCore).
// Load order per page: core.js → auth.js → <page>.js
(function () {
  'use strict';
  var core = window.AdminCore;

  var defaultApiBase = 'http://localhost:3000';
  if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    defaultApiBase = 'http://' + window.location.hostname + ':3000';
  }
  var API_BASE = (localStorage.getItem('artdict_api') || defaultApiBase) + '/api';
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

  // Client-side paginator for a list table (10 rows/page by default).
  //   bodyId     — id of the <tbody> to fill
  //   rowsHtml   — fn(sliceItems) → <tr>…</tr> HTML string for the page slice
  //   emptyHtml  — full <tr> HTML shown when there are no items
  // Returns { set(items) } — call set() with the FULL list; it slices + draws
  // controls. The page keeps its own full array for id lookups (edit/delete).
  function makePager(bodyId, rowsHtml, emptyHtml) {
    var PER = 10;
    var core = window.AdminCore;
    var body = document.getElementById(bodyId);
    var wrap = body.closest('.table-wrap');
    var bar = document.createElement('div');
    bar.className = 'pager';
    if (wrap && wrap.parentNode) wrap.parentNode.insertBefore(bar, wrap.nextSibling);

    var items = [];
    var page = 1;

    function draw() {
      if (!items.length) { body.innerHTML = emptyHtml; bar.innerHTML = ''; return; }
      var pages = core.pageCount(items.length, PER);
      page = core.clampPage(page, items.length, PER);
      body.innerHTML = rowsHtml(core.pageSlice(items, page, PER));
      if (pages <= 1) { bar.innerHTML = ''; return; }
      bar.innerHTML =
        '<button class="btn btn--ghost btn--sm" data-pg="prev"' + (page === 1 ? ' disabled' : '') + '>← Trước</button>' +
        '<span class="pager__info">Trang ' + page + ' / ' + pages + ' · ' + items.length + ' dòng</span>' +
        '<button class="btn btn--ghost btn--sm" data-pg="next"' + (page === pages ? ' disabled' : '') + '>Sau →</button>';
    }

    bar.addEventListener('click', function (e) {
      var dir = e.target.getAttribute('data-pg');
      if (!dir) return;
      var pages = core.pageCount(items.length, PER);
      if (dir === 'prev' && page > 1) { page -= 1; draw(); }
      if (dir === 'next' && page < pages) { page += 1; draw(); }
    });

    return {
      set: function (newItems) { items = newItems || []; page = 1; draw(); },
    };
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
    makePager: makePager,
    esc: esc,
  };
})();

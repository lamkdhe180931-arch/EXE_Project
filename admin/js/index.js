// Dashboard overview. Stats derived client-side from /orders + /products.
(function () {
  'use strict';
  if (!Admin.initPage('dashboard')) return;

  var LOW_STOCK = 5;

  function vnd(n) { return (n || 0).toLocaleString('vi-VN') + '₫'; }
  function fmtDate(s) { return s ? new Date(s).toLocaleDateString('vi-VN') : ''; }

  function showError(text) {
    var m = document.getElementById('msg');
    m.textContent = text;
    m.classList.add('is-show');
  }

  async function load() {
    try {
      var results = await Promise.all([Admin.api('/orders'), Admin.api('/products')]);
      var orders = results[0] || [];
      var products = results[1] || [];

      var revenue = orders
        .filter(function (o) { return o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED'; })
        .reduce(function (sum, o) { return sum + (o.total || 0); }, 0);
      var pending = orders.filter(function (o) { return o.status === 'PENDING'; }).length;
      var lowStock = products.filter(function (p) { return (p.stock || 0) <= LOW_STOCK; }).length;

      document.getElementById('stat-revenue').textContent = vnd(revenue);
      document.getElementById('stat-orders').textContent = orders.length;
      document.getElementById('stat-pending').textContent = pending;
      document.getElementById('stat-lowstock').textContent = lowStock;

      var rows = orders.slice(0, 8).map(function (o) {
        var who = Admin.esc(o.guestEmail || (o.user && o.user.email) || ('user#' + o.userId));
        return (
          '<tr><td>#' + o.id + '</td><td>' + who + '</td><td>' + vnd(o.total) +
          '</td><td><span class="badge badge--' + o.status + '">' + o.status + '</span></td><td>' +
          fmtDate(o.createdAt) + '</td></tr>'
        );
      });
      document.getElementById('recent-orders').innerHTML =
        rows.length ? rows.join('') : '<tr><td colspan="5" class="muted">Chưa có đơn nào.</td></tr>';
    } catch (err) {
      showError(err.message);
      document.getElementById('recent-orders').innerHTML =
        '<tr><td colspan="5" class="muted">Không tải được dữ liệu.</td></tr>';
    }
  }

  load();
})();

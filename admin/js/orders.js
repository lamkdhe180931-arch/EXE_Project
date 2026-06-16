// Orders list + status transitions. Allowed transitions come from AdminCore.
(function () {
  'use strict';
  if (!Admin.initPage('orders')) return;
  var core = window.AdminCore;

  function vnd(n) { return (n || 0).toLocaleString('vi-VN') + '₫'; }
  function fmtDate(s) { return s ? new Date(s).toLocaleDateString('vi-VN') : ''; }

  var msg = document.getElementById('msg');
  function flash(text, ok) {
    msg.textContent = text;
    msg.className = 'msg is-show ' + (ok ? 'msg--ok' : 'msg--error');
  }

  function statusControl(order) {
    var nexts = core.nextStatuses(order.status);
    if (!nexts.length) return '<span class="muted">—</span>';
    var opts = [order.status].concat(nexts).map(function (s) {
      return '<option value="' + s + '">' + s + '</option>';
    }).join('');
    return (
      '<div class="row-actions">' +
      '<select data-id="' + order.id + '" data-current="' + order.status + '">' + opts + '</select>' +
      '<button class="btn btn--sm" data-apply="' + order.id + '">Lưu</button>' +
      '</div>'
    );
  }

  function customerCell(o) {
    var name = o.guestName || (o.user && o.user.name) || '';
    var email = o.guestEmail || (o.user && o.user.email) || '';
    var phone = o.guestPhone || '';
    var lines = [];
    lines.push('<strong>' + (name ? Admin.esc(name) : '<span class="muted">— chưa có tên</span>') + '</strong>');
    if (email) lines.push('<span class="muted">✉ ' + Admin.esc(email) + '</span>');
    if (phone) lines.push('<span class="muted">☎ ' + Admin.esc(phone) + '</span>');
    return lines.join('<br>');
  }

  function rowHtml(o) {
    var address = o.shippingAddress
      ? Admin.esc(o.shippingAddress)
      : '<span class="muted">—</span>';
    return (
      '<tr><td>#' + o.id + '</td>' +
      '<td>' + customerCell(o) + '</td>' +
      '<td style="max-width:260px;white-space:normal">' + address + '</td>' +
      '<td>' + vnd(o.total) + '</td>' +
      '<td><span class="badge badge--' + o.status + '">' + o.status + '</span></td>' +
      '<td>' + statusControl(o) + '</td><td>' + fmtDate(o.createdAt) + '</td></tr>'
    );
  }

  var pager = Admin.makePager(
    'orders-body',
    function (slice) { return slice.map(rowHtml).join(''); },
    '<tr><td colspan="7" class="muted">Chưa có đơn nào.</td></tr>'
  );

  function render(orders) {
    pager.set(orders || []);
  }

  async function apply(id) {
    var select = document.querySelector('select[data-id="' + id + '"]');
    var next = select.value;
    if (next === select.getAttribute('data-current')) {
      flash('Chưa thay đổi trạng thái.', false);
      return;
    }
    try {
      await Admin.api('/orders/' + id + '/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      flash('Đã cập nhật đơn #' + id + ' → ' + next, true);
      load();
    } catch (err) {
      flash(err.message, false);
    }
  }

  function load() {
    Admin.api('/orders')
      .then(render)
      .catch(function (err) {
        flash(err.message, false);
        document.getElementById('orders-body').innerHTML =
          '<tr><td colspan="7" class="muted">Không tải được đơn hàng.</td></tr>';
      });
  }

  document.getElementById('orders-body').addEventListener('click', function (e) {
    var id = e.target.getAttribute('data-apply');
    if (id) apply(id);
  });

  load();
})();

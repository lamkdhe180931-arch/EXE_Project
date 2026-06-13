// Artists list + create. The form maps to the fixed { quote, qa:[{id,q,a}] }
// JSON via AdminCore.buildArtistPayload (the part under test).
(function () {
  'use strict';
  if (!Admin.initPage('artists')) return;
  var core = window.AdminCore;

  var msg = document.getElementById('msg');
  function flash(text, ok) {
    msg.textContent = text;
    msg.className = 'msg is-show ' + (ok ? 'msg--ok' : 'msg--error');
  }

  function render(artists) {
    if (!artists.length) {
      document.getElementById('artists-body').innerHTML =
        '<tr><td colspan="6" class="muted">Chưa có nghệ sĩ nào.</td></tr>';
      return;
    }
    document.getElementById('artists-body').innerHTML = artists.map(function (a) {
      return (
        '<tr><td>' + a.id + '</td><td>' + Admin.esc(a.name) + '</td><td>' + Admin.esc(a.slug) +
        '</td><td>' + Admin.esc(a.role) + '</td><td>' + Admin.esc(a.city) + '</td>' +
        '<td><button class="btn btn--ghost btn--sm" data-del="' + a.id + '">Xóa</button></td></tr>'
      );
    }).join('');
  }

  function load() {
    Admin.api('/artists')
      .then(render)
      .catch(function (err) {
        flash(err.message, false);
        document.getElementById('artists-body').innerHTML =
          '<tr><td colspan="6" class="muted">Không tải được danh sách.</td></tr>';
      });
  }

  function val(id) { return document.getElementById(id).value.trim(); }

  document.getElementById('artist-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var payload = core.buildArtistPayload({
      name: val('name'), slug: val('slug'), role: val('role'), city: val('city'),
      since: val('since'), avatarUrl: val('avatarUrl'), quote: val('quote'),
      q1: val('q1'), a1: val('a1'), q2: val('q2'), a2: val('a2'), q3: val('q3'), a3: val('a3'),
    });
    try {
      await Admin.api('/artists', { method: 'POST', body: JSON.stringify(payload) });
      flash('Đã tạo nghệ sĩ "' + payload.name + '"', true);
      e.target.reset();
      load();
    } catch (err) {
      flash(err.message, false);
    }
  });

  document.getElementById('artists-body').addEventListener('click', async function (e) {
    var id = e.target.getAttribute('data-del');
    if (!id) return;
    if (!window.confirm('Xóa nghệ sĩ #' + id + '?')) return;
    try {
      await Admin.api('/artists/' + id, { method: 'DELETE' });
      flash('Đã xóa nghệ sĩ #' + id, true);
      load();
    } catch (err) {
      flash(err.message, false);
    }
  });

  load();
})();

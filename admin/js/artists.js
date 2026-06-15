// Artists list + create/edit. The form maps to the fixed { quote, qa:[{id,q,a}] }
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

  var loaded = [];
  var editId = null;

  function rowHtml(a) {
    return (
      '<tr><td>' + a.id + '</td><td>' + Admin.esc(a.name) + '</td><td>' + Admin.esc(a.slug) +
      '</td><td>' + Admin.esc(a.role) + '</td><td>' + Admin.esc(a.city) + '</td>' +
      '<td>' +
      '<button class="btn btn--ghost btn--sm" data-edit="' + a.id + '">Sửa</button>' +
      '<button class="btn btn--ghost btn--sm" data-del="' + a.id + '">Xóa</button>' +
      '</td></tr>'
    );
  }

  var pager = Admin.makePager(
    'artists-body',
    function (slice) { return slice.map(rowHtml).join(''); },
    '<tr><td colspan="6" class="muted">Chưa có nghệ sĩ nào.</td></tr>'
  );

  function render(artists) {
    loaded = artists || [];
    pager.set(loaded);
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

  function setVal(id, v) { document.getElementById(id).value = v == null ? '' : v; }

  function setMode(a) {
    editId = a ? a.id : null;
    document.getElementById('artist-form-title').textContent =
      a ? ('Sửa nghệ sĩ #' + a.id) : 'Thêm nghệ sĩ mới';
    document.getElementById('artist-submit').textContent =
      a ? 'Cập nhật' : 'Tạo nghệ sĩ';
    document.getElementById('artist-cancel').hidden = !a;

    if (!a) { document.getElementById('artist-form').reset(); return; }
    document.getElementById('avatarFile').value = ''; // don't carry a stale pick into edit
    var c = a.content || {};
    var qa = Array.isArray(c.qa) ? c.qa : [];
    setVal('name', a.name); setVal('slug', a.slug); setVal('role', a.role);
    setVal('city', a.city); setVal('since', a.since); setVal('avatarUrl', a.avatarUrl);
    setVal('quote', c.quote);
    setVal('q1', qa[0] && qa[0].q); setVal('a1', qa[0] && qa[0].a);
    setVal('q2', qa[1] && qa[1].q); setVal('a2', qa[1] && qa[1].a);
    setVal('q3', qa[2] && qa[2].q); setVal('a3', qa[2] && qa[2].a);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function val(id) { return document.getElementById(id).value.trim(); }

  // Read a single picked file as a data URL (Cloudinary accepts these).
  function readFileAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  document.getElementById('artist-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var payload = core.buildArtistPayload({
      name: val('name'), slug: val('slug'), role: val('role'), city: val('city'),
      since: val('since'), avatarUrl: val('avatarUrl'), quote: val('quote'),
      q1: val('q1'), a1: val('a1'), q2: val('q2'), a2: val('a2'), q3: val('q3'), a3: val('a3'),
    });
    try {
      var saved = editId
        ? await Admin.api('/artists/' + editId, { method: 'PATCH', body: JSON.stringify(payload) })
        : await Admin.api('/artists', { method: 'POST', body: JSON.stringify(payload) });

      // If a file was picked, upload it to the saved artist (overrides avatarUrl).
      var files = document.getElementById('avatarFile').files;
      if (files && files.length) {
        var image = await readFileAsDataURL(files[0]);
        await Admin.api('/artists/' + saved.id + '/avatar', {
          method: 'POST',
          body: JSON.stringify({ image: image }),
        });
      }
      flash((editId ? 'Đã cập nhật nghệ sĩ "' : 'Đã tạo nghệ sĩ "') + payload.name + '"', true);
      setMode(null);
      load();
    } catch (err) {
      flash(err.message, false);
    }
  });

  document.getElementById('artist-cancel').addEventListener('click', function () {
    setMode(null);
  });

  document.getElementById('artists-body').addEventListener('click', async function (e) {
    var editAttr = e.target.getAttribute('data-edit');
    if (editAttr) {
      var a = loaded.find(function (x) { return String(x.id) === editAttr; });
      if (a) setMode(a);
      return;
    }
    var id = e.target.getAttribute('data-del');
    if (!id) return;
    if (!window.confirm('Xóa nghệ sĩ #' + id + '?')) return;
    try {
      await Admin.api('/artists/' + id, { method: 'DELETE' });
      flash('Đã xóa nghệ sĩ #' + id, true);
      if (String(editId) === id) setMode(null);
      load();
    } catch (err) {
      flash(err.message, false);
    }
  });

  load();
})();

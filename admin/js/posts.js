// Posts list + create/edit (News / Journal). Backed by Phase 5 /api/posts.
(function () {
  'use strict';
  if (!Admin.initPage('posts')) return;

  var msg = document.getElementById('msg');
  function flash(text, ok) {
    msg.textContent = text;
    msg.className = 'msg is-show ' + (ok ? 'msg--ok' : 'msg--error');
  }

  var loaded = [];
  var editId = null;
  var editPublishedAt = null; // original publishedAt of the post being edited

  function render(posts) {
    loaded = posts || [];
    if (!loaded.length) {
      document.getElementById('posts-body').innerHTML =
        '<tr><td colspan="6" class="muted">Chưa có bài viết nào.</td></tr>';
      return;
    }
    document.getElementById('posts-body').innerHTML = loaded.map(function (p) {
      var state = p.publishedAt
        ? '<span class="badge badge--PAID">Đã xuất bản</span>'
        : '<span class="badge badge--PENDING">Nháp</span>';
      return (
        '<tr><td>' + p.id + '</td><td>' + Admin.esc(p.type) + '</td><td>' + Admin.esc(p.title) +
        '</td><td>' + Admin.esc(p.slug) + '</td><td>' + state + '</td>' +
        '<td><button class="btn btn--ghost btn--sm" data-edit="' + p.id + '">Sửa</button></td></tr>'
      );
    }).join('');
  }

  function load() {
    Admin.api('/posts')
      .then(render)
      .catch(function (err) {
        flash(err.message, false);
        document.getElementById('posts-body').innerHTML =
          '<tr><td colspan="6" class="muted">Không tải được bài viết.</td></tr>';
      });
  }

  function setMode(p) {
    editId = p ? p.id : null;
    editPublishedAt = p ? p.publishedAt : null;
    document.getElementById('post-form-title').textContent =
      p ? ('Sửa bài #' + p.id) : 'Viết bài mới';
    document.getElementById('post-submit').textContent = p ? 'Cập nhật' : 'Lưu bài';
    document.getElementById('post-cancel').hidden = !p;

    if (!p) { document.getElementById('post-form').reset(); return; }
    document.getElementById('type').value = p.type || 'NEWS';
    document.getElementById('title').value = p.title || '';
    document.getElementById('slug').value = p.slug || '';
    document.getElementById('body').value = p.body || '';
    document.getElementById('publishNow').checked = !!p.publishedAt;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function val(id) { return document.getElementById(id).value.trim(); }

  document.getElementById('post-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var publish = document.getElementById('publishNow').checked;
    var body = {
      type: document.getElementById('type').value,
      title: val('title'),
      slug: val('slug'),
      body: val('body'),
    };
    try {
      if (editId) {
        // Explicit publish state: keep the original publish date when already
        // published, stamp now when newly published, null to revert to draft.
        body.publishedAt = publish
          ? (editPublishedAt || new Date().toISOString())
          : null;
        await Admin.api('/posts/' + editId, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        if (publish) body.publishedAt = new Date().toISOString();
        await Admin.api('/posts', { method: 'POST', body: JSON.stringify(body) });
      }
      flash((editId ? 'Đã cập nhật bài "' : 'Đã lưu bài "') + body.title + '"', true);
      setMode(null);
      load();
    } catch (err) {
      flash(err.message, false);
    }
  });

  document.getElementById('post-cancel').addEventListener('click', function () {
    setMode(null);
  });

  document.getElementById('posts-body').addEventListener('click', function (e) {
    var editAttr = e.target.getAttribute('data-edit');
    if (!editAttr) return;
    var p = loaded.find(function (x) { return String(x.id) === editAttr; });
    if (p) setMode(p);
  });

  load();
})();

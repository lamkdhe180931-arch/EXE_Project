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

  function rowHtml(p) {
    var state = p.publishedAt
      ? '<span class="badge badge--PAID">Đã xuất bản</span>'
      : '<span class="badge badge--PENDING">Nháp</span>';
    var toggleLabel = p.publishedAt ? 'Ẩn' : 'Đăng';
    return (
      '<tr><td>' + p.id + '</td><td>' + Admin.esc(p.type) + '</td><td>' + Admin.esc(p.title) +
      '</td><td>' + Admin.esc(p.slug) + '</td><td>' + state + '</td>' +
      '<td>' +
      '<button class="btn btn--ghost btn--sm" data-toggle="' + p.id + '">' + toggleLabel + '</button>' +
      '<button class="btn btn--ghost btn--sm" data-edit="' + p.id + '">Sửa</button>' +
      '<button class="btn btn--ghost btn--sm" data-del="' + p.id + '">Xóa</button>' +
      '</td></tr>'
    );
  }

  var pager = Admin.makePager(
    'posts-body',
    function (slice) { return slice.map(rowHtml).join(''); },
    '<tr><td colspan="6" class="muted">Chưa có bài viết nào.</td></tr>'
  );

  function render(posts) {
    loaded = posts || [];
    pager.set(loaded);
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
    document.getElementById('coverUrl').value = p.coverImage || '';
    document.getElementById('coverFile').value = ''; // don't carry a stale pick into edit
    document.getElementById('publishNow').checked = !!p.publishedAt;
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

  document.getElementById('post-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var publish = document.getElementById('publishNow').checked;
    var body = {
      type: document.getElementById('type').value,
      title: val('title'),
      slug: val('slug'),
      body: val('body'),
      coverImage: val('coverUrl') || null,
    };
    try {
      var saved;
      if (editId) {
        // Explicit publish state: keep the original publish date when already
        // published, stamp now when newly published, null to revert to draft.
        body.publishedAt = publish
          ? (editPublishedAt || new Date().toISOString())
          : null;
        saved = await Admin.api('/posts/' + editId, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        if (publish) body.publishedAt = new Date().toISOString();
        saved = await Admin.api('/posts', { method: 'POST', body: JSON.stringify(body) });
      }

      // If a cover file was picked, upload it to the saved post (overrides URL).
      var files = document.getElementById('coverFile').files;
      if (files && files.length) {
        var image = await readFileAsDataURL(files[0]);
        await Admin.api('/posts/' + saved.id + '/cover', {
          method: 'POST',
          body: JSON.stringify({ image: image }),
        });
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

  document.getElementById('posts-body').addEventListener('click', async function (e) {
    var editAttr = e.target.getAttribute('data-edit');
    if (editAttr) {
      var p = loaded.find(function (x) { return String(x.id) === editAttr; });
      if (p) setMode(p);
      return;
    }

    var toggleAttr = e.target.getAttribute('data-toggle');
    if (toggleAttr) {
      var tp = loaded.find(function (x) { return String(x.id) === toggleAttr; });
      if (!tp) return;
      // Published → revert to draft (null); draft → publish now.
      var publishedAt = tp.publishedAt ? null : new Date().toISOString();
      try {
        await Admin.api('/posts/' + tp.id, {
          method: 'PATCH',
          body: JSON.stringify({ publishedAt: publishedAt }),
        });
        flash(publishedAt ? 'Đã xuất bản bài #' + tp.id : 'Đã ẩn bài #' + tp.id, true);
        load();
      } catch (err) {
        flash(err.message, false);
      }
      return;
    }

    var delAttr = e.target.getAttribute('data-del');
    if (!delAttr) return;
    if (!window.confirm('Xóa bài viết #' + delAttr + '?')) return;
    try {
      await Admin.api('/posts/' + delAttr, { method: 'DELETE' });
      flash('Đã xóa bài #' + delAttr, true);
      if (String(editId) === delAttr) setMode(null);
      load();
    } catch (err) {
      flash(err.message, false);
    }
  });

  load();
})();

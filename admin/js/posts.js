// Posts list + create (News / Journal). Backed by Phase 5 /api/posts.
(function () {
  'use strict';
  if (!Admin.initPage('posts')) return;

  var msg = document.getElementById('msg');
  function flash(text, ok) {
    msg.textContent = text;
    msg.className = 'msg is-show ' + (ok ? 'msg--ok' : 'msg--error');
  }

  function render(posts) {
    if (!posts.length) {
      document.getElementById('posts-body').innerHTML =
        '<tr><td colspan="5" class="muted">Chưa có bài viết nào.</td></tr>';
      return;
    }
    document.getElementById('posts-body').innerHTML = posts.map(function (p) {
      var state = p.publishedAt
        ? '<span class="badge badge--PAID">Đã xuất bản</span>'
        : '<span class="badge badge--PENDING">Nháp</span>';
      return (
        '<tr><td>' + p.id + '</td><td>' + Admin.esc(p.type) + '</td><td>' + Admin.esc(p.title) +
        '</td><td>' + Admin.esc(p.slug) + '</td><td>' + state + '</td></tr>'
      );
    }).join('');
  }

  function load() {
    Admin.api('/posts')
      .then(render)
      .catch(function (err) {
        flash(err.message, false);
        document.getElementById('posts-body').innerHTML =
          '<tr><td colspan="5" class="muted">Không tải được bài viết.</td></tr>';
      });
  }

  function val(id) { return document.getElementById(id).value.trim(); }

  document.getElementById('post-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var body = {
      type: document.getElementById('type').value,
      title: val('title'),
      slug: val('slug'),
      body: val('body'),
    };
    if (document.getElementById('publishNow').checked) {
      body.publishedAt = new Date().toISOString();
    }
    try {
      await Admin.api('/posts', { method: 'POST', body: JSON.stringify(body) });
      flash('Đã lưu bài "' + body.title + '"', true);
      e.target.reset();
      load();
    } catch (err) {
      flash(err.message, false);
    }
  });

  load();
})();

// Products list + create/edit (artist picker + optional image upload).
(function () {
  'use strict';
  if (!Admin.initPage('products')) return;

  function vnd(n) { return (n || 0).toLocaleString('vi-VN') + '₫'; }

  var msg = document.getElementById('msg');
  function flash(text, ok) {
    msg.textContent = text;
    msg.className = 'msg is-show ' + (ok ? 'msg--ok' : 'msg--error');
  }

  var loaded = [];   // last-fetched products, for the edit lookup
  var editId = null; // null = create mode; an id = editing that product

  function rowHtml(p) {
    var artist = p.artist ? Admin.esc(p.artist.name) : '<span class="muted">—</span>';
    return (
      '<tr><td>' + p.id + '</td><td>' + Admin.esc(p.name) + '</td><td>' + vnd(p.price) +
      '</td><td>' + (p.stock || 0) + '</td><td>' + Admin.esc(p.category) + '</td><td>' + artist +
      '</td><td>' +
      '<button class="btn btn--ghost btn--sm" data-edit="' + p.id + '">Sửa</button>' +
      '<button class="btn btn--ghost btn--sm" data-del="' + p.id + '">Xóa</button>' +
      '</td></tr>'
    );
  }

  var pager = Admin.makePager(
    'products-body',
    function (slice) { return slice.map(rowHtml).join(''); },
    '<tr><td colspan="7" class="muted">Chưa có sản phẩm nào.</td></tr>'
  );

  function render(products) {
    loaded = products || [];
    pager.set(loaded);
  }

  async function loadArtists() {
    try {
      var artists = await Admin.api('/artists');
      var sel = document.getElementById('artistId');
      artists.forEach(function (a) {
        var opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = a.name;
        sel.appendChild(opt);
      });
    } catch (err) { /* non-fatal: product can be created without an artist */ }
  }

  function loadProducts() {
    Admin.api('/products')
      .then(render)
      .catch(function (err) {
        flash(err.message, false);
        document.getElementById('products-body').innerHTML =
          '<tr><td colspan="7" class="muted">Không tải được sản phẩm.</td></tr>';
      });
  }

  // Toggle the shared form between create and edit. `p` = product to edit, or null.
  function setMode(p) {
    editId = p ? p.id : null;
    document.getElementById('product-form-title').textContent =
      p ? ('Sửa sản phẩm #' + p.id) : 'Thêm sản phẩm mới';
    document.getElementById('product-submit').textContent =
      p ? 'Cập nhật' : 'Tạo sản phẩm';
    document.getElementById('product-cancel').hidden = !p;

    if (!p) { document.getElementById('product-form').reset(); return; }
    document.getElementById('name').value = p.name || '';
    document.getElementById('slug').value = p.slug || '';
    document.getElementById('price').value = p.price != null ? p.price : '';
    document.getElementById('stock').value = p.stock != null ? p.stock : 0;
    document.getElementById('category').value = p.category || '';
    document.getElementById('artistId').value = p.artistId != null ? String(p.artistId) : '';
    document.getElementById('description').value = p.description || '';
    document.getElementById('images').value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Read selected files as data URLs (the upload endpoint accepts these via Cloudinary).
  function readFilesAsDataURLs(fileList) {
    return Promise.all(Array.prototype.map.call(fileList, function (file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }));
  }

  function val(id) { return document.getElementById(id).value.trim(); }

  document.getElementById('product-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var artistId = val('artistId');
    var body = {
      name: val('name'),
      slug: val('slug'),
      price: Number(val('price')),
      stock: Number(val('stock') || '0'),
      category: val('category'),
      description: val('description') || null,
      artistId: artistId ? Number(artistId) : null,
    };
    try {
      var product = editId
        ? await Admin.api('/products/' + editId, { method: 'PATCH', body: JSON.stringify(body) })
        : await Admin.api('/products', { method: 'POST', body: JSON.stringify(body) });

      // New image files are appended (the PATCH body never touches images).
      var files = document.getElementById('images').files;
      if (files && files.length) {
        var images = await readFilesAsDataURLs(files);
        await Admin.api('/products/' + product.id + '/images', {
          method: 'POST',
          body: JSON.stringify({ images: images }),
        });
      }
      flash((editId ? 'Đã cập nhật sản phẩm "' : 'Đã tạo sản phẩm "') + body.name + '"', true);
      setMode(null);
      loadProducts();
    } catch (err) {
      flash(err.message, false);
    }
  });

  document.getElementById('product-cancel').addEventListener('click', function () {
    setMode(null);
  });

  document.getElementById('products-body').addEventListener('click', async function (e) {
    var editAttr = e.target.getAttribute('data-edit');
    if (editAttr) {
      var p = loaded.find(function (x) { return String(x.id) === editAttr; });
      if (p) setMode(p);
      return;
    }
    var id = e.target.getAttribute('data-del');
    if (!id) return;
    if (!window.confirm('Xóa sản phẩm #' + id + '? Sản phẩm sẽ bị gỡ khỏi cửa hàng.')) return;
    try {
      await Admin.api('/products/' + id, { method: 'DELETE' });
      flash('Đã xóa sản phẩm #' + id, true);
      if (String(editId) === id) setMode(null);
      loadProducts();
    } catch (err) {
      flash(err.message, false);
    }
  });

  loadArtists();
  loadProducts();
})();

// Products list + create (with artist picker + optional image upload).
(function () {
  'use strict';
  if (!Admin.initPage('products')) return;

  function vnd(n) { return (n || 0).toLocaleString('vi-VN') + '₫'; }

  var msg = document.getElementById('msg');
  function flash(text, ok) {
    msg.textContent = text;
    msg.className = 'msg is-show ' + (ok ? 'msg--ok' : 'msg--error');
  }

  function render(products) {
    if (!products.length) {
      document.getElementById('products-body').innerHTML =
        '<tr><td colspan="7" class="muted">Chưa có sản phẩm nào.</td></tr>';
      return;
    }
    document.getElementById('products-body').innerHTML = products.map(function (p) {
      var artist = p.artist ? Admin.esc(p.artist.name) : '<span class="muted">—</span>';
      return (
        '<tr><td>' + p.id + '</td><td>' + Admin.esc(p.name) + '</td><td>' + vnd(p.price) +
        '</td><td>' + (p.stock || 0) + '</td><td>' + Admin.esc(p.category) + '</td><td>' + artist +
        '</td><td><button class="btn btn--ghost btn--sm" data-del="' + p.id + '">Ẩn</button></td></tr>'
      );
    }).join('');
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
      artistId: artistId ? Number(artistId) : null,
    };
    try {
      var product = await Admin.api('/products', { method: 'POST', body: JSON.stringify(body) });

      var files = document.getElementById('images').files;
      if (files && files.length) {
        var images = await readFilesAsDataURLs(files);
        await Admin.api('/products/' + product.id + '/images', {
          method: 'POST',
          body: JSON.stringify({ images: images }),
        });
      }
      flash('Đã tạo sản phẩm "' + body.name + '"', true);
      e.target.reset();
      loadProducts();
    } catch (err) {
      flash(err.message, false);
    }
  });

  document.getElementById('products-body').addEventListener('click', async function (e) {
    var id = e.target.getAttribute('data-del');
    if (!id) return;
    if (!window.confirm('Ẩn sản phẩm #' + id + '? (xóa mềm)')) return;
    try {
      await Admin.api('/products/' + id, { method: 'DELETE' });
      flash('Đã ẩn sản phẩm #' + id, true);
      loadProducts();
    } catch (err) {
      flash(err.message, false);
    }
  });

  loadArtists();
  loadProducts();
})();

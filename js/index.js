/* ============================================================
   ARTDICT — home page: render the "đang mở bán" grid from the API.
   Mirrors catalogue.js cards but links are root-relative (/pages/…) and
   the list is capped to a teaser of 6. Depends on /js/api.js; the async
   fetch resolves after /js/artdict.js boots, so window.Artdict.rescan is
   available to bind tilt/reveal/add-to-cart on the injected cards.
   ============================================================ */
(function () {
  "use strict";

  var CAT = (window.ArtdictAPI && ArtdictAPI.CATEGORIES) || {};
  var grid = document.getElementById("home-products");
  if (!grid) return;

  var LIMIT = 6;

  function vnd(n) {
    return (n || 0).toLocaleString("vi-VN") + "₫";
  }
  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cardHTML(p, i) {
    var slug = p.category || "khac";
    var label = CAT[slug] || slug;
    var img = (p.images && p.images[0] && p.images[0].url) || "";
    var soldOut = (p.stock || 0) <= 0;
    var delay = (i % 3) * 60;

    var media = img
      ? '<img src="' + esc(ArtdictAPI.img(img, 600)) + '" alt="' + esc(p.name) + '" loading="lazy" />'
      : '<div class="ph"><span class="ph__label">' + esc(p.name) + "</span></div>";

    var badge = soldOut
      ? '<span class="card__badge-rect" style="background: var(--ink)">Hết hàng</span>'
      : "";

    var action = soldOut
      ? '<span class="card__add" style="opacity:.5;color:color-mix(in srgb,var(--ink) 50%,transparent)">Sold out</span>'
      : '<button class="card__add" data-add="' +
        esc(p.slug) +
        '" data-name="' +
        esc(p.name) +
        '" data-cat="' +
        esc(label) +
        '" data-price="' +
        (p.price || 0) +
        '" data-img="' +
        esc(ArtdictAPI.img(img, 200)) +
        '">Thêm +</button>';

    return (
      '<a class="card ' +
      (soldOut ? "card--soldout " : "") +
      'reveal" data-tilt data-cat="' +
      esc(slug) +
      '" href="/pages/product.html?slug=' +
      encodeURIComponent(p.slug) +
      '" data-delay="' +
      delay +
      '">' +
      '<div class="card__media card__media--upload">' +
      badge +
      media +
      "</div>" +
      '<div class="card__meta-upload">' +
      '<p class="card__number">№ ' +
      pad(i + 1) +
      " &nbsp;–&nbsp; " +
      esc(label) +
      "</p>" +
      '<div class="card__row">' +
      '<h3 class="card__name">' +
      esc(p.name) +
      "</h3>" +
      '<div class="card__price-group">' +
      '<span class="price card__price">' +
      vnd(p.price) +
      "</span>" +
      action +
      "</div></div></div></a>"
    );
  }

  function message(text) {
    grid.innerHTML =
      '<p style="grid-column:1/-1;padding:40px 0;color:color-mix(in srgb,var(--ink) 60%,transparent)">' +
      esc(text) +
      "</p>";
  }

  /* ---------- BỘ SƯU TẬP THEO TÁC GIẢ (lưới bento) ---------- */
  var bento = document.getElementById("craft-bento");
  var BENTO_SPAN = ["craft-card--a", "craft-card--b", "craft-card--c", "craft-card--d"];

  function coverOf(products) {
    for (var i = 0; i < products.length; i++) {
      var im = products[i].images && products[i].images[0];
      if (im && im.url) return im.url;
    }
    return "";
  }

  function bentoCardHTML(col, i) {
    var a = col.artist;
    var cover = coverOf(col.products);
    var name = ArtdictAPI.collectionName(a, col.products);
    var media = cover
      ? '<img class="craft-card__img" src="' +
        esc(ArtdictAPI.img(cover, 800)) +
        '" alt="' +
        esc(name) +
        '" loading="lazy" />'
      : "";
    return (
      '<a class="craft-card ' +
      BENTO_SPAN[i] +
      ' reveal" data-tilt data-delay="' +
      (i % 2) * 90 +
      '" href="/pages/catalogue.html?collection=' +
      encodeURIComponent(a.slug) +
      '">' +
      media +
      '<div class="craft-card__label">' +
      '<span class="craft-card__tag">' +
      esc(a.name) +
      "</span>" +
      esc(name) +
      "</div></a>"
    );
  }

  function renderBento(collections) {
    if (!bento || !collections.length) return;
    bento.innerHTML = collections.slice(0, 4).map(bentoCardHTML).join("");
    if (window.Artdict && window.Artdict.rescan) window.Artdict.rescan(bento);
  }

  function buildCollections(products, artists) {
    var byId = {};
    products.forEach(function (p) {
      if (p.artistId == null) return;
      (byId[p.artistId] = byId[p.artistId] || []).push(p);
    });
    return artists
      .filter(function (a) {
        return (byId[a.id] || []).length > 0;
      })
      .map(function (a) {
        return { artist: a, products: byId[a.id] };
      })
      .sort(function (x, y) {
        return y.products.length - x.products.length;
      });
  }

  /* ---------- STATS (số liệu thật + lượt xem) ---------- */
  function setStat(id, val) {
    var el = document.getElementById(id);
    if (!el) return;
    el.dataset.count = String(val); // để main.js đếm tới số này
    el.textContent = String(val); // set trực tiếp (reduced-motion / phòng race)
  }

  // Lượt xem trang: bộ đếm localStorage, sàn 300, mỗi lượt xem +1.
  function bumpViews() {
    var KEY = "artdict_views";
    var n = 0;
    try {
      n = parseInt(localStorage.getItem(KEY) || "0", 10) || 0;
    } catch (e) {}
    n = n < 0 ? 1 : n + 1;
    try {
      localStorage.setItem(KEY, String(n));
    } catch (e) {}
    return 299 + n; // lượt đầu = 300
  }

  setStat("stat-views", bumpViews());

  // Replace the static placeholder cards immediately so stale mock data
  // never lingers on screen while the request is in flight.
  grid.innerHTML = ArtdictAPI.skeletonCards(LIMIT);

  Promise.all([
    ArtdictAPI.get("/products"),
    ArtdictAPI.get("/artists").catch(function () {
      return [];
    }),
  ])
    .then(function (res) {
      var products = res[0] || [];
      var artists = res[1] || [];

      // Số liệu thật.
      setStat("stat-designs", products.length);
      setStat("stat-artists", artists.length);

      // Bộ sưu tập theo tác giả (4 bộ nhiều sản phẩm nhất).
      renderBento(buildCollections(products, artists));

      // Lưới "đang mở bán".
      if (!products.length) {
        message("Chưa có sản phẩm nào đang mở bán.");
        return;
      }
      grid.innerHTML = products.slice(0, LIMIT).map(cardHTML).join("");
      if (window.Artdict && window.Artdict.rescan) window.Artdict.rescan(grid);
    })
    .catch(function (err) {
      message("Không tải được sản phẩm (" + err.message + ").");
    });
})();

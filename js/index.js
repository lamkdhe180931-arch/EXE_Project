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

  // Replace the static placeholder cards immediately so stale mock data
  // never lingers on screen while the request is in flight.
  grid.innerHTML = ArtdictAPI.skeletonCards(LIMIT);

  ArtdictAPI.get("/products")
    .then(function (products) {
      products = products || [];
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

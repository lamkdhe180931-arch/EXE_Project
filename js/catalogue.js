/* ============================================================
   ARTDICT — catalogue page: render product grid from the API.
   Depends on /js/api.js (ArtdictAPI) and runs before /js/artdict.js
   (calls window.Artdict.rescan to bind tilt/reveal/add-to-cart to
   the freshly injected cards).
   ============================================================ */
(function () {
  "use strict";

  // Canonical category map (slug → label) — single source of truth in api.js.
  var CAT = (window.ArtdictAPI && ArtdictAPI.CATEGORIES) || {};

  var grid = document.getElementById("grid");
  if (!grid) return;

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
      ? '<img src="' + esc(img) + '" alt="' + esc(p.name) + '" loading="lazy" />'
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
        esc(img) +
        '">Thêm +</button>';

    return (
      '<a class="card ' +
      (soldOut ? "card--soldout " : "") +
      'reveal" data-tilt data-cat="' +
      esc(slug) +
      '" href="product.html?slug=' +
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

  // Set the count chip on each filter pill from the live data.
  function updateCounts(products) {
    var counts = {};
    products.forEach(function (p) {
      var c = p.category || "khac";
      counts[c] = (counts[c] || 0) + 1;
    });
    document.querySelectorAll(".filter-pill").forEach(function (pill) {
      var f = pill.dataset.filter;
      var n = f === "all" ? products.length : counts[f] || 0;
      var span = pill.querySelector(".fp-count");
      if (span) span.textContent = pad(n);
    });
  }

  function message(text) {
    grid.innerHTML =
      '<p style="grid-column:1/-1;padding:40px 0;color:color-mix(in srgb,var(--ink) 60%,transparent)">' +
      esc(text) +
      "</p>";
  }

  function render(products) {
    updateCounts(products);
    if (!products.length) {
      message("Chưa có sản phẩm nào. Hãy thêm sản phẩm trong trang quản trị.");
      return;
    }
    grid.innerHTML = products.map(cardHTML).join("");

    // Bind tilt / reveal / quick-add to the new cards.
    if (window.Artdict && window.Artdict.rescan) window.Artdict.rescan(grid);

    // Deep-link support: re-apply a non-default filter to the fresh cards
    // (artdict's initFilters ran against an empty grid at DOMContentLoaded).
    var active = document.querySelector(".filter-pill.is-active");
    if (active && active.dataset.filter !== "all") active.click();
  }

  ArtdictAPI.get("/products")
    .then(render)
    .catch(function (err) {
      message(
        "Không tải được sản phẩm (" +
          err.message +
          "). Kiểm tra backend đang chạy ở :3000.",
      );
    });
})();

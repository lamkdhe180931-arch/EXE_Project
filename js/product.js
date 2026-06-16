/* ============================================================
   ARTDICT — product detail page: render from GET /api/products/:slug.
   Reads ?slug= from the URL. Depends on /js/api.js (ArtdictAPI) and
   runs before /js/artdict.js (rescan binds gallery/tilt/reveal/add).
   ============================================================ */
(function () {
  "use strict";

  var CAT = (window.ArtdictAPI && ArtdictAPI.CATEGORIES) || {};

  function vnd(n) {
    return (n || 0).toLocaleString("vi-VN") + "₫";
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function $(id) {
    return document.getElementById(id);
  }

  function getSlug() {
    return new URLSearchParams(window.location.search).get("slug");
  }

  function notFound(msg) {
    var main = document.querySelector("main.pd");
    if (!main) return;
    main.innerHTML =
      '<div style="padding:160px 0 120px;text-align:center">' +
      '<p class="eyebrow">404</p>' +
      '<h1 class="pd-title" style="margin:14px 0 20px">' +
      esc(msg || "Không tìm thấy sản phẩm") +
      "</h1>" +
      '<a class="circle-btn" href="catalogue.html">Về bộ sưu tập</a></div>';
  }

  function renderGallery(images, name) {
    var thumbs = $("pd-thumbs");
    var main = document.querySelector("[data-gallery-main]");
    if (!images || !images.length) {
      if (thumbs) thumbs.innerHTML = "";
      if (main)
        main.innerHTML =
          '<div class="ph"><span class="ph__label">' + esc(name) + "</span></div>";
      return;
    }
    if (thumbs)
      thumbs.innerHTML = images
        .map(function (im, i) {
          return (
            '<button class="thumb' +
            (i === 0 ? " is-active" : "") +
            '" data-thumb data-full="' +
            esc(ArtdictAPI.img(im.url, 1200)) +
            '" data-label="' +
            esc(name) +
            '"><div class="ph"><img src="' +
            esc(ArtdictAPI.img(im.url, 200)) +
            '" alt="' +
            esc(name) +
            '" loading="lazy" /></div></button>'
          );
        })
        .join("");
    if (main)
      main.innerHTML =
        '<img src="' + esc(ArtdictAPI.img(images[0].url, 1200)) + '" alt="' + esc(name) + '" />';
  }

  function relatedCardHTML(p, i) {
    var slug = p.category || "khac";
    var label = CAT[slug] || slug;
    var img = (p.images && p.images[0] && p.images[0].url) || "";
    var soldOut = (p.stock || 0) <= 0;
    var media = img
      ? '<img src="' + esc(ArtdictAPI.img(img, 600)) + '" alt="' + esc(p.name) + '" loading="lazy" />'
      : '<div class="ph"><span class="ph__label">' + esc(p.name) + "</span></div>";
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
      'reveal" data-tilt href="product.html?slug=' +
      encodeURIComponent(p.slug) +
      '" data-delay="' +
      i * 60 +
      '"><div class="card__media card__media--upload">' +
      (soldOut
        ? '<span class="card__badge-rect" style="background:var(--ink)">Hết hàng</span>'
        : "") +
      media +
      '</div><div class="card__meta-upload"><p class="card__number">' +
      esc(label) +
      '</p><div class="card__row"><h3 class="card__name">' +
      esc(p.name) +
      '</h3><div class="card__price-group"><span class="price card__price">' +
      vnd(p.price) +
      "</span>" +
      action +
      "</div></div></div></a>"
    );
  }

  function renderRelated(all, currentSlug) {
    var grid = $("related-grid");
    if (!grid) return;
    var others = all
      .filter(function (p) {
        return p.slug !== currentSlug;
      })
      .slice(0, 3);
    grid.innerHTML = others.map(relatedCardHTML).join("");
    if (window.Artdict && window.Artdict.rescan) window.Artdict.rescan(grid);
  }

  function render(p) {
    var slug = p.category || "khac";
    var label = CAT[slug] || slug;
    var soldOut = (p.stock || 0) <= 0;
    var img = (p.images && p.images[0] && p.images[0].url) || "";

    document.title = p.name + " — Artdict";

    var crumbCat = $("pd-crumb-cat");
    if (crumbCat) {
      crumbCat.textContent = label;
      crumbCat.href = "catalogue.html?filter=" + encodeURIComponent(slug);
    }
    var crumbName = $("pd-crumb-name");
    if (crumbName) crumbName.textContent = p.name;

    var eyebrow = $("pd-eyebrow");
    if (eyebrow) eyebrow.textContent = label;

    var badge = $("pd-badge");
    if (badge) {
      if (soldOut) {
        badge.textContent = "Hết hàng";
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    }

    var title = $("pd-title");
    if (title) title.textContent = "“" + p.name + "”";

    var price = $("pd-price");
    if (price) price.textContent = vnd(p.price);

    // Product-specific prose from the DB; keep the generic fallback if empty.
    var lede = $("pd-lede");
    if (lede && p.description) lede.textContent = p.description;

    // Size selector only makes sense for apparel; drop it otherwise.
    if (slug !== "aothun") {
      var sizeBlock = $("pd-size-block");
      if (sizeBlock) sizeBlock.remove();
    }

    renderGallery(p.images, p.name);

    var add = $("pd-add");
    if (add) {
      add.setAttribute("data-product-add", p.slug);
      add.setAttribute("data-name", p.name);
      add.setAttribute("data-cat", label);
      add.setAttribute("data-price", p.price || 0);
      add.setAttribute("data-img", ArtdictAPI.img(img, 200));
      if (soldOut) {
        add.disabled = true;
        add.textContent = "Hết hàng";
        add.style.opacity = ".5";
        add.style.pointerEvents = "none";
      }
    }

    // Bind gallery + reveal/tilt on the freshly injected product DOM.
    if (window.Artdict && window.Artdict.rescan) window.Artdict.rescan(document);
  }

  var slug = getSlug();
  if (!slug) {
    notFound("Thiếu mã sản phẩm");
    return;
  }

  ArtdictAPI.get("/products/" + encodeURIComponent(slug))
    .then(function (p) {
      render(p);
      return ArtdictAPI.get("/products");
    })
    .then(function (all) {
      renderRelated(all, slug);
    })
    .catch(function (err) {
      notFound(err.message || "Không tìm thấy sản phẩm");
    });
})();

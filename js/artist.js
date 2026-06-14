/* ============================================================
   ARTDICT — artist detail/interview page.
   Reads ?slug=; renders from GET /api/artists (whole list → current
   + "next artist"), and GET /api/products?artistId= for their works.
   Depends on /js/api.js; runs before /js/artdict.js (rescan).
   ============================================================ */
(function () {
  "use strict";

  var main = document.querySelector("main.iv-top");
  if (!main) return;

  var CAT = (window.ArtdictAPI && ArtdictAPI.CATEGORIES) || {};

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }
  function vnd(n) {
    return (n || 0).toLocaleString("vi-VN") + "₫";
  }
  function firstName(name) {
    var parts = String(name || "").trim().split(/\s+/);
    return parts[parts.length - 1] || name;
  }
  function $(id) {
    return document.getElementById(id);
  }
  function getSlug() {
    return new URLSearchParams(window.location.search).get("slug");
  }

  function notFound(msg) {
    main.innerHTML =
      '<div style="padding:160px 0 120px;text-align:center">' +
      '<p class="eyebrow">404</p>' +
      '<h1 class="iv-name" style="margin:14px 0 20px">' +
      esc(msg || "Không tìm thấy tác giả") +
      "</h1>" +
      '<a class="circle-btn" href="artists.html">Tất cả tác giả</a></div>';
  }

  function qaHTML(qa, i) {
    var paras = String(qa.a || "")
      .split(/\n{2,}/)
      .filter(Boolean);
    if (!paras.length) paras = [String(qa.a || "")];
    var body = paras
      .map(function (p, idx) {
        if (idx === 0 && p) {
          return (
            '<p><span class="lead-letter">' +
            esc(p.charAt(0)) +
            "</span>" +
            esc(p.slice(1)) +
            "</p>"
          );
        }
        return "<p>" + esc(p) + "</p>";
      })
      .join("");
    return (
      '<article class="qa reveal" id="qa-' +
      i +
      '"><h2 class="qa__q">' +
      esc(qa.q) +
      '</h2><div class="qa__a">' +
      body +
      "</div></article>"
    );
  }

  function workCardHTML(p, i) {
    var slug = p.category || "khac";
    var label = CAT[slug] || slug;
    var img = (p.images && p.images[0] && p.images[0].url) || "";
    var soldOut = (p.stock || 0) <= 0;
    var media = img
      ? '<img src="' + esc(img) + '" alt="' + esc(p.name) + '" loading="lazy" />'
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
        esc(img) +
        '">Thêm +</button>';
    return (
      '<a class="card ' +
      (soldOut ? "card--soldout " : "") +
      'reveal" data-tilt href="product.html?slug=' +
      encodeURIComponent(p.slug) +
      '" data-delay="' +
      i * 60 +
      '"><div class="card__media card__media--upload">' +
      (soldOut ? '<span class="card__badge-rect" style="background:var(--ink)">Hết hàng</span>' : "") +
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

  function setText(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }

  function render(artist, all, products) {
    var idx = all.findIndex(function (a) {
      return a.slug === artist.slug;
    });
    var num = pad(idx >= 0 ? idx + 1 : 1);
    var fname = firstName(artist.name);

    document.title = artist.name + " — Phỏng vấn · Artdict";

    setText("iv-crumb-name", artist.name);
    setText("iv-eyebrow", "artdictờ · " + num);
    setText("iv-name", artist.name);
    setText("iv-role", artist.role);
    setText("iv-city", artist.city);
    setText("iv-since", "Từ " + artist.since);

    var portrait = $("iv-portrait");
    if (portrait) {
      portrait.innerHTML = artist.avatarUrl
        ? '<img src="' + esc(artist.avatarUrl) + '" alt="' + esc(artist.name) + '" />'
        : '<div class="ph" style="font-weight:400"><span class="ph__label">chân dung · ' +
          esc(fname) +
          "</span></div>";
    }

    var quote = (artist.content && artist.content.quote) || "";
    setText("iv-quote", quote);
    setText("iv-by", "— " + artist.name);

    // Q&A + table of contents
    var qa = (artist.content && Array.isArray(artist.content.qa) && artist.content.qa) || [];
    var qas = $("iv-qas");
    if (qas) qas.innerHTML = qa.map(qaHTML).join("");
    var toc = $("iv-toc-list");
    if (toc)
      toc.innerHTML = qa
        .map(function (q, i) {
          return '<li><a href="#qa-' + i + '">' + pad(i + 1) + " — " + esc(q.q) + "</a></li>";
        })
        .join("");

    // Works by this artist
    var works = (products || []).slice(0, 3);
    var worksTitle = $("iv-works-title");
    if (worksTitle) worksTitle.textContent = "Tác phẩm của " + fname;
    var setWorks = $("iv-meta-works");
    if (setWorks)
      setWorks.textContent = works.length
        ? works
            .map(function (p) {
              return p.name;
            })
            .join(" · ")
        : "—";
    var grid = $("iv-works-grid");
    var related = $("iv-related");
    if (works.length && grid) {
      grid.innerHTML = works.map(workCardHTML).join("");
    } else if (related) {
      related.style.display = "none";
    }

    // Next artist
    if (all.length > 1) {
      var next = all[(Math.max(idx, 0) + 1) % all.length];
      setText("iv-next-k", "artdictờ tiếp theo · " + pad(((Math.max(idx, 0) + 1) % all.length) + 1));
      var nextLink = $("iv-next-link");
      if (nextLink) {
        nextLink.textContent = next.name + " →";
        nextLink.href = "artist.html?slug=" + encodeURIComponent(next.slug);
      }
    } else {
      var nextWrap = $("iv-next");
      if (nextWrap) nextWrap.style.display = "none";
    }

    if (window.Artdict && window.Artdict.rescan) window.Artdict.rescan(document);
  }

  var slug = getSlug();
  if (!slug) {
    notFound("Thiếu mã tác giả");
    return;
  }

  ArtdictAPI.get("/artists")
    .then(function (all) {
      var artist = (all || []).find(function (a) {
        return a.slug === slug;
      });
      if (!artist) {
        notFound("Không tìm thấy tác giả");
        return;
      }
      return ArtdictAPI.get("/products?artistId=" + artist.id)
        .catch(function () {
          return [];
        })
        .then(function (products) {
          render(artist, all, products || []);
        });
    })
    .catch(function (err) {
      notFound(err.message || "Không tải được tác giả");
    });
})();

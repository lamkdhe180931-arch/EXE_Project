/* ============================================================
   ARTDICT — post read view (shared by NEWS & JOURNAL).
   Reads ?slug= from the URL, fetches GET /api/posts/:slug, renders
   plain-text body into paragraphs. Depends on /js/api.js; runs
   before /js/artdict.js (rescan binds reveal on injected DOM).
   ============================================================ */
(function () {
  "use strict";

  var TYPE_LABEL = { NEWS: "Tin tức", JOURNAL: "Tạp chí" };
  var TYPE_BACK = { NEWS: "news.html", JOURNAL: "journal.html" };

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
  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function notFound(msg) {
    var main = document.querySelector("main.post-read");
    if (!main) return;
    main.innerHTML =
      '<div style="padding:140px 0 120px;text-align:center">' +
      '<p class="eyebrow">404</p>' +
      '<h1 class="post-read__title" style="margin:14px auto 24px">' +
      esc(msg || "Không tìm thấy bài viết") +
      "</h1>" +
      '<a class="circle-btn" href="news.html">Về News</a></div>';
  }

  function render(p) {
    var label = TYPE_LABEL[p.type] || "Bài viết";
    document.title = p.title + " — Artdict";

    var crumbType = $("post-crumb-type");
    if (crumbType) {
      crumbType.textContent = label;
      crumbType.href = TYPE_BACK[p.type] || "news.html";
    }
    var crumbName = $("post-crumb-name");
    if (crumbName) crumbName.textContent = p.title;

    var eyebrow = $("post-eyebrow");
    if (eyebrow) eyebrow.textContent = label;

    var title = $("post-title");
    if (title) title.textContent = p.title;

    var meta = $("post-meta");
    if (meta) {
      var date = fmtDate(p.publishedAt);
      meta.innerHTML = date
        ? esc(label) + '<span class="sep"></span>' + esc(date)
        : esc(label);
    }

    // Plain-text body → paragraphs split on blank lines.
    var bodyEl = $("post-body");
    if (bodyEl) {
      var paras = String(p.body || "")
        .split(/\n\s*\n/)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      bodyEl.innerHTML = paras
        .map(function (t) {
          return "<p>" + esc(t).replace(/\n/g, "<br/>") + "</p>";
        })
        .join("");
    }

    var back = $("post-back");
    if (back) back.href = TYPE_BACK[p.type] || "news.html";

    if (window.Artdict && window.Artdict.rescan) window.Artdict.rescan(document);
  }

  var slug = getSlug();
  if (!slug) {
    notFound("Thiếu mã bài viết");
    return;
  }

  ArtdictAPI.get("/posts/" + encodeURIComponent(slug))
    .then(render)
    .catch(function (err) {
      notFound(err.message || "Không tìm thấy bài viết");
    });
})();

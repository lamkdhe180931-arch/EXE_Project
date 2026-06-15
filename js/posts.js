/* ============================================================
   ARTDICT — posts list page (news / journal).
   Reads data-type ("NEWS" | "JOURNAL") from #post-list, fetches
   GET /api/posts?type=…, shows only published posts (publishedAt set),
   newest first. Depends on /js/api.js; runs before /js/artdict.js (rescan).
   ============================================================ */
(function () {
  "use strict";

  var list = document.getElementById("post-list");
  if (!list) return;
  var type = list.getAttribute("data-type") || "NEWS";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // "15 tháng 6, 2026"
  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // First paragraph of plain-text body, trimmed to a teaser length.
  function excerpt(body) {
    var first = String(body || "")
      .split(/\n\s*\n/)[0]
      .replace(/\s+/g, " ")
      .trim();
    if (first.length <= 180) return first;
    return first.slice(0, 180).replace(/\s+\S*$/, "") + "…";
  }

  function rowHTML(p) {
    var href = "post.html?slug=" + encodeURIComponent(p.slug);
    return (
      '<a class="post-row reveal" href="' +
      href +
      '">' +
      '<div class="post-row__date">' +
      esc(fmtDate(p.publishedAt)) +
      "</div>" +
      '<div class="post-row__main">' +
      '<h2 class="post-row__title">' +
      esc(p.title) +
      "</h2>" +
      '<p class="post-row__excerpt">' +
      esc(excerpt(p.body)) +
      "</p>" +
      "</div>" +
      '<span class="post-row__arrow" aria-hidden="true">→</span>' +
      "</a>"
    );
  }

  function message(text) {
    list.innerHTML =
      '<p style="padding:34px 0;color:color-mix(in srgb,var(--ink) 60%,transparent)">' +
      esc(text) +
      "</p>";
  }

  ArtdictAPI.get("/posts?type=" + encodeURIComponent(type))
    .then(function (posts) {
      var published = (posts || []).filter(function (p) {
        return p.publishedAt;
      });
      if (!published.length) {
        message(
          type === "JOURNAL"
            ? "Chưa có bài tạp chí nào. Quay lại sau nhé."
            : "Chưa có tin tức nào. Quay lại sau nhé.",
        );
        return;
      }
      list.innerHTML = published.map(rowHTML).join("");
      if (window.Artdict && window.Artdict.rescan) window.Artdict.rescan(list);
    })
    .catch(function (err) {
      message("Không tải được bài viết (" + err.message + ").");
    });
})();

/* ============================================================
   ARTDICT — artists list page: render from GET /api/artists.
   Work chips come from GET /api/products (grouped by artistId).
   Depends on /js/api.js; runs before /js/artdict.js (rescan).
   ============================================================ */
(function () {
  "use strict";

  var list = document.getElementById("artists-list");
  if (!list) return;

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
  function firstName(name) {
    var parts = String(name || "").trim().split(/\s+/);
    return parts[parts.length - 1] || name;
  }

  function rowHTML(a, i, byArtist) {
    var avatar = a.avatarUrl
      ? '<img src="' + esc(a.avatarUrl) + '" alt="' + esc(a.name) + '" loading="lazy" />'
      : '<div class="ph"><span class="ph__label">chân dung · ' +
        esc(firstName(a.name)) +
        "</span></div>";
    var quote = (a.content && a.content.quote) || "";
    var chips = (byArtist[a.id] || [])
      .map(function (n) {
        return '<span class="work-chip">' + esc(n) + "</span>";
      })
      .join("");
    var href = "artist.html?slug=" + encodeURIComponent(a.slug);
    return (
      '<article class="artist-row reveal">' +
      '<a class="artist-row__media" href="' +
      href +
      '" style="display:block"><div class="artist-portrait">' +
      '<span class="artist-portrait__n">' +
      pad(i + 1) +
      "</span>" +
      avatar +
      "</div></a>" +
      '<div class="artist-row__text">' +
      '<p class="eyebrow">' +
      esc(a.city) +
      "</p>" +
      '<h2 class="artist-row__name">' +
      esc(a.name) +
      "</h2>" +
      '<div class="artist-row__role">' +
      esc(a.role) +
      ' <span class="sep"></span> artdictờ</div>' +
      (quote
        ? '<p class="artist-row__quote"><span class="q-mark">“</span>' +
          esc(quote) +
          '<span class="q-mark">”</span></p>'
        : "") +
      (chips ? '<div class="artist-works">' + chips + "</div>" : "") +
      '<a class="circle-btn" href="' +
      href +
      '">Đọc phỏng vấn →</a>' +
      "</div></article>"
    );
  }

  // Stats strip: [0] số tác giả, [1] số thành phố, [2] 100% (giữ tĩnh).
  function updateStats(artists) {
    var cities = {};
    artists.forEach(function (a) {
      if (a.city) cities[a.city] = 1;
    });
    var nEls = document.querySelectorAll(".art-stat__n");
    if (nEls[0]) nEls[0].textContent = pad(artists.length);
    if (nEls[1]) nEls[1].textContent = pad(Object.keys(cities).length);
  }

  function message(text) {
    list.innerHTML =
      '<p style="padding:30px 0;color:color-mix(in srgb,var(--ink) 60%,transparent)">' +
      esc(text) +
      "</p>";
  }

  Promise.all([
    ArtdictAPI.get("/artists"),
    ArtdictAPI.get("/products").catch(function () {
      return [];
    }),
  ])
    .then(function (res) {
      var artists = res[0] || [];
      var products = res[1] || [];
      var byArtist = {};
      products.forEach(function (p) {
        if (p.artistId) (byArtist[p.artistId] = byArtist[p.artistId] || []).push(p.name);
      });
      updateStats(artists);
      if (!artists.length) {
        message("Chưa có tác giả nào.");
        return;
      }
      list.innerHTML = artists
        .map(function (a, i) {
          return rowHTML(a, i, byArtist);
        })
        .join("");
      if (window.Artdict && window.Artdict.rescan) window.Artdict.rescan(list);
    })
    .catch(function (err) {
      message("Không tải được tác giả (" + err.message + ").");
    });
})();

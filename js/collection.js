/* ============================================================
   ARTDICT — collection page: bộ sưu tập THEO TÁC GIẢ.
   Gộp sản phẩm theo nghệ sĩ (mỗi tác giả có SP = 1 bộ sưu tập) từ
   GET /api/artists + /api/products. Mỗi thẻ dẫn tới
   catalogue.html?collection=<artistSlug> để lọc theo bộ sưu tập.
   Depends on /js/api.js; chạy TRƯỚC /js/artdict.js (rescan bind
   tilt/reveal cho các thẻ render động).
   ============================================================ */
(function () {
  "use strict";

  var grid = document.getElementById("grid");
  if (!grid) return;

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

  // Tên bộ sưu tập theo TÁC GIẢ. DB chưa có trường "tên bộ sưu tập" nên đặt
  // theo chủ đề tác phẩm của từng tác giả (key = slug nghệ sĩ). Thêm/đổi tác
  // giả thì sửa map này; tác giả chưa có tên rơi vào fallback theo danh mục.
  var COLLECTION_NAMES = {
    "nguyen-quy-thien": "Mèo Nổ & Vì Sao",
    "nguyen-minh-hoang": "Ma Quỷ Dân Gian",
    "pham-lam-khoa": "Chuyện Thường Ngày",
    "nguyen-cong-hieu": "Nhân Miêu Ký",
    "nguyen-le-manh-dat": "Thế Giới Emmat",
    "nguyen-tien-dung": "The Boy Who Lived",
    "nguyen-thi-thu-trang": "Long Ly Quy Phụng",
    "nguyen-vinh-quang": "Bính Ngọ 2026",
    "le-ai-linh": "Lân Sư",
    "hoang-hong-anh": "Vũ Điệu Lân",
  };

  // Fallback: chưa đặt tên → gọi theo danh mục chiếm ưu thế của bộ sưu tập.
  var CAT_NAME = {
    aothun: "Tuyển Tập Áo",
    mu: "Tuyển Tập Mũ",
    vongtay: "Tuyển Tập Vòng Tay",
    sotay: "Tuyển Tập Sổ Tay",
    nhandan: "Tuyển Tập Nhãn Dán",
    mockhoa: "Tuyển Tập Móc Khóa",
    tranh: "Tuyển Tập Tranh In",
    khac: "Tuyển Tập Giới Hạn",
  };

  function collectionName(artist, products) {
    if (COLLECTION_NAMES[artist.slug]) return COLLECTION_NAMES[artist.slug];
    var counts = {},
      top = "",
      max = 0;
    products.forEach(function (p) {
      var c = p.category || "khac";
      counts[c] = (counts[c] || 0) + 1;
      if (counts[c] > max) {
        max = counts[c];
        top = c;
      }
    });
    return CAT_NAME[top] || "Tuyển Tập Giới Hạn";
  }

  // Cover = ảnh đầu tiên tìm được trong các sản phẩm của bộ sưu tập.
  function coverOf(products) {
    for (var i = 0; i < products.length; i++) {
      var im = products[i].images && products[i].images[0];
      if (im && im.url) return im.url;
    }
    return "";
  }

  // Span + nhịp bento theo vị trí. Hai thẻ đầu = "feature" (ngắn 60%):
  // wide(4) + third(2) = trọn 1 hàng. Còn lại third(2), 3 thẻ/hàng.
  function spanClass(i, total) {
    if (total === 1) return "col-card--full";
    if (i === 0) return "col-card--wide col-card--feat";
    if (i === 1) return "col-card--third col-card--feat";
    return "col-card--third";
  }

  function cardHTML(col, i, total) {
    var a = col.artist;
    var cover = coverOf(col.products);
    var hasImg = !!cover;
    var span = spanClass(i, total);
    // Có ảnh → scrim tối + chữ sáng (đọc rõ trên ảnh). Chưa có ảnh → nền
    // tint đặc (giữ đa dạng nền như bản mock).
    var tint = hasImg
      ? " col-card--photo"
      : i % 2 === 0
        ? " col-card--crimson"
        : " col-card--ink";
    var w = i === 0 ? 900 : i === 1 ? 520 : 620;
    var media = hasImg
      ? '<img src="' +
        esc(ArtdictAPI.img(cover, w)) +
        '" alt="' +
        esc(a.name) +
        '" loading="lazy" />'
      : '<span class="col-card__ghost" aria-hidden="true">' + pad(i + 1) + "</span>";
    var cname = collectionName(a, col.products);
    var n = col.products.length;

    return (
      '<a class="col-card ' +
      span +
      tint +
      ' reveal" data-tilt data-delay="' +
      (i % 3) * 70 +
      '" href="catalogue.html?collection=' +
      encodeURIComponent(a.slug) +
      '">' +
      '<div class="col-card__ph">' +
      media +
      "</div>" +
      '<div class="col-card__label">' +
      '<h2 class="col-card__name">' +
      esc(cname) +
      "</h2>" +
      '<p class="col-card__by">' +
      esc(a.name) +
      "</p>" +
      '<div class="col-card__foot">' +
      '<span class="col-card__count">' +
      n +
      " sản phẩm</span>" +
      '<span class="col-card__go">Xem →</span>' +
      "</div></div></a>"
    );
  }

  // Thẻ đóng lưới — cửa vào toàn bộ danh mục (không phải BST theo tác giả).
  function allCardHTML(seq, totalProducts) {
    return (
      '<a class="col-card col-card--full col-card--ink reveal" data-tilt href="catalogue.html">' +
      '<div class="col-card__ph"><span class="col-card__ghost" aria-hidden="true">' +
      pad(seq) +
      "</span></div>" +
      '<div class="col-card__label">' +
      '<p class="col-card__artist">Artdict</p>' +
      '<h2 class="col-card__name">Tất cả sản phẩm</h2>' +
      '<div class="col-card__foot">' +
      '<span class="col-card__count">' +
      totalProducts +
      " sản phẩm</span>" +
      '<span class="col-card__go">Xem tất cả →</span>' +
      "</div></div></a>"
    );
  }

  function message(text) {
    grid.innerHTML =
      '<p style="grid-column:1/-1;padding:40px 0;color:color-mix(in srgb,var(--ink) 60%,transparent)">' +
      esc(text) +
      "</p>";
  }

  function render(collections, totalProducts) {
    var count = document.querySelector(".col-meta__count");
    if (count)
      count.innerHTML = "<b>" + pad(collections.length) + "</b> bộ sưu tập đang mở";

    if (!collections.length) {
      message(
        "Chưa có bộ sưu tập nào. Hãy thêm sản phẩm và gán tác giả trong trang quản trị.",
      );
      return;
    }

    var total = collections.length;
    var html = collections
      .map(function (c, i) {
        return cardHTML(c, i, total);
      })
      .join("");
    html += allCardHTML(total + 1, totalProducts);
    grid.innerHTML = html;

    // Bind tilt / reveal cho các thẻ vừa chèn.
    if (window.Artdict && window.Artdict.rescan) window.Artdict.rescan(grid);
  }

  Promise.all([ArtdictAPI.get("/artists"), ArtdictAPI.get("/products")])
    .then(function (res) {
      var artists = res[0] || [];
      var products = res[1] || [];
      var byId = {};
      products.forEach(function (p) {
        if (p.artistId == null) return;
        (byId[p.artistId] = byId[p.artistId] || []).push(p);
      });
      // Chỉ tác giả có ≥1 sản phẩm; nhiều SP nhất lên trước (vào ô feature).
      var collections = artists
        .filter(function (a) {
          return (byId[a.id] || []).length > 0;
        })
        .map(function (a) {
          return { artist: a, products: byId[a.id] };
        })
        .sort(function (x, y) {
          return y.products.length - x.products.length;
        });
      render(collections, products.length);
    })
    .catch(function (err) {
      message(
        "Không tải được bộ sưu tập (" +
          err.message +
          "). Kiểm tra backend đang chạy ở :3000.",
      );
    });
})();

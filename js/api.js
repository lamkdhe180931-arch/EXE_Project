/* ============================================================
   ARTDICT — public API client (read-only)
   Mirrors admin convention. Override base for deploy:
     localStorage.setItem('artdict_api', 'https://api.artdict.vn')
   Load BEFORE the page script (catalogue.js, product.js, …).
   ============================================================ */
(function () {
  "use strict";

  var defaultApiBase = "";
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    defaultApiBase = "http://localhost:3000";
  }

  var BASE =
    (localStorage.getItem("artdict_api") || defaultApiBase) + "/api";

  // GET JSON; throws Error(message) on non-2xx so callers can show a state.
  async function get(path) {
    var res = await fetch(BASE + path);
    var data = null;
    try {
      data = await res.json();
    } catch (e) {
      /* empty body */
    }
    if (!res.ok) {
      throw new Error((data && data.error) || "Lỗi " + res.status);
    }
    return data;
  }

  // POST JSON. On non-2xx, throws Error(message) with the server `error` text
  // and an `.data` field carrying the parsed body (e.g. orderId on a 502).
  async function post(path, body) {
    var res = await fetch(BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    var data = null;
    try {
      data = await res.json();
    } catch (e) {
      /* empty body */
    }
    if (!res.ok) {
      var err = new Error((data && data.error) || "Lỗi " + res.status);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  // Cloudinary on-the-fly transform: rewrite a Cloudinary delivery URL to serve
  // a CDN-optimised image (auto WebP/AVIF, auto quality, capped to the display
  // width) instead of the full-res original. Cuts product-image weight ~10–30×.
  // Non-Cloudinary URLs (data:, /assets, external) pass through unchanged, and
  // a URL that already carries a transform is left alone.
  function img(url, width) {
    if (!url || typeof url !== "string") return url || "";
    var marker = "/image/upload/";
    var up = url.indexOf(marker);
    if (url.indexOf("res.cloudinary.com") === -1 || up === -1) return url;
    var rest = url.slice(up + marker.length);
    // Already carries a transform segment (e.g. f_auto,…/) → leave untouched.
    if (/^[a-z]{1,3}_[^/]*\//.test(rest)) return url;
    return url.slice(0, up + marker.length) +
      "f_auto,q_auto,c_limit,w_" + (width || 600) + "/" + rest;
  }

  // Shimmer placeholder cards shown immediately while products fetch, so the
  // grid never flashes empty. Replaced wholesale by real cards on resolve.
  function skeletonCards(n) {
    var one =
      '<div class="card-skel" aria-hidden="true">' +
      '<div class="skel card-skel__media"></div>' +
      '<div class="skel card-skel__line card-skel__line--sm"></div>' +
      '<div class="skel card-skel__line card-skel__line--lg"></div>' +
      "</div>";
    var out = "";
    for (var i = 0; i < (n || 6); i++) out += one;
    return out;
  }

  // Canonical category vocabulary — slug (DB + catalogue filter pills) → label.
  // Single source of truth shared by catalogue.js and product.js.
  var CATEGORIES = {
    aothun: "Áo thun",
    mu: "Mũ",
    vongtay: "Vòng tay",
    sotay: "Sổ tay",
    nhandan: "Nhãn dán",
    mockhoa: "Móc khóa",
    tranh: "Tranh",
    khac: "Khác",
  };

  // Tên bộ sưu tập THEO TÁC GIẢ (dùng chung cho collection.html + index.html).
  // DB chưa có trường "tên bộ sưu tập" nên đặt theo chủ đề tác phẩm của từng
  // tác giả (key = slug nghệ sĩ). Thêm/đổi tác giả thì sửa map này; tác giả
  // chưa có tên rơi vào fallback theo danh mục chiếm ưu thế.
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

  var CAT_COLLECTION_NAME = {
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
    if (artist && COLLECTION_NAMES[artist.slug]) return COLLECTION_NAMES[artist.slug];
    var counts = {},
      top = "",
      max = 0;
    (products || []).forEach(function (p) {
      var c = p.category || "khac";
      counts[c] = (counts[c] || 0) + 1;
      if (counts[c] > max) {
        max = counts[c];
        top = c;
      }
    });
    return CAT_COLLECTION_NAME[top] || "Tuyển Tập Giới Hạn";
  }

  window.ArtdictAPI = {
    base: BASE,
    get: get,
    post: post,
    img: img,
    skeletonCards: skeletonCards,
    CATEGORIES: CATEGORIES,
    COLLECTION_NAMES: COLLECTION_NAMES,
    collectionName: collectionName,
  };
})();

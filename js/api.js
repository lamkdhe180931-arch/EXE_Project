/* ============================================================
   ARTDICT — public API client (read-only)
   Mirrors admin convention. Override base for deploy:
     localStorage.setItem('artdict_api', 'https://api.artdict.vn')
   Load BEFORE the page script (catalogue.js, product.js, …).
   ============================================================ */
(function () {
  "use strict";

  var BASE =
    (localStorage.getItem("artdict_api") || "http://localhost:3000") + "/api";

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

  window.ArtdictAPI = { base: BASE, get: get, CATEGORIES: CATEGORIES };
})();

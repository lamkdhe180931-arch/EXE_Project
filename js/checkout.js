/* ============================================================
   ARTDICT — checkout page.
   Renders the cart summary from localStorage, collects guest details,
   maps cart slugs → productId via GET /api/products, then
   POST /api/orders → redirect to the returned MoMo pay URL.
   Depends on /js/api.js; runs before /js/artdict.js.
   ============================================================ */
(function () {
  "use strict";

  var CART_KEY = "artdict_cart_v1"; // mirror of artdict.js cart store
  var summary = document.getElementById("co-summary");
  var form = document.getElementById("co-form");
  if (!summary || !form) return;

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
  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function clearCart() {
    localStorage.setItem(CART_KEY, "[]");
  }

  function setError(msg) {
    var box = document.getElementById("co-error");
    if (!box) return;
    if (!msg) {
      box.hidden = true;
      box.textContent = "";
    } else {
      box.hidden = false;
      box.textContent = msg;
    }
  }

  function lineHTML(i) {
    var media = i.img
      ? '<img src="' + esc(i.img) + '" alt="" loading="lazy" />'
      : '<div class="ph"></div>';
    return (
      '<div class="co-line">' +
      '<div class="co-line__media">' +
      media +
      "</div>" +
      '<div class="co-line__info">' +
      '<div class="co-line__name">' +
      esc(i.name) +
      "</div>" +
      '<div class="co-line__meta">' +
      esc(i.cat || "") +
      (i.size ? " · Size " + esc(i.size) : "") +
      " · SL " +
      i.qty +
      "</div></div>" +
      '<div class="co-line__price">' +
      vnd(i.price * i.qty) +
      "</div></div>"
    );
  }

  function renderEmpty() {
    var main = document.querySelector("main.co");
    if (!main) return;
    main.innerHTML =
      '<div style="padding:140px 0 120px;text-align:center">' +
      '<p class="eyebrow">Thanh toán</p>' +
      '<h1 class="co-title" style="margin:14px 0 22px">Giỏ của bạn đang trống</h1>' +
      '<a class="circle-btn circle-btn--solid" href="catalogue.html">Khám phá bộ sưu tập</a></div>';
  }

  var cart = readCart();
  if (!cart.length) {
    renderEmpty();
    return;
  }

  // Render summary lines + total.
  var total = cart.reduce(function (s, i) {
    return s + i.price * i.qty;
  }, 0);
  summary.innerHTML =
    '<div class="co-lines">' +
    cart.map(lineHTML).join("") +
    "</div>" +
    '<div class="co-total"><span>Tổng cộng</span><span class="co-total__val">' +
    vnd(total) +
    "</span></div>" +
    '<p class="co-ship-note">Miễn phí vận chuyển toàn quốc.</p>';

  // Submit → build order payload, POST, redirect to MoMo.
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setError("");
    var btn = document.getElementById("co-submit");
    var fd = new FormData(form);
    var payload = {
      guestName: String(fd.get("name") || "").trim(),
      guestEmail: String(fd.get("email") || "").trim(),
      guestPhone: String(fd.get("phone") || "").trim(),
      shippingAddress: String(fd.get("address") || "").trim(),
    };

    btn.disabled = true;
    var oldLabel = btn.textContent;
    btn.textContent = "Đang xử lý…";

    function fail(msg) {
      setError(msg);
      btn.disabled = false;
      btn.textContent = oldLabel;
    }

    // Map cart slugs → numeric productId (server re-validates price/stock).
    ArtdictAPI.get("/products")
      .then(function (products) {
        var idBySlug = {};
        (products || []).forEach(function (p) {
          idBySlug[p.slug] = p.id;
        });
        var items = [];
        for (var k = 0; k < cart.length; k++) {
          var c = cart[k];
          var pid = idBySlug[c.id];
          if (!pid) {
            throw new Error(
              'Sản phẩm "' + c.name + '" không còn khả dụng — vui lòng xoá khỏi giỏ.',
            );
          }
          var item = { productId: pid, qty: c.qty };
          if (c.size) item.size = c.size;
          items.push(item);
        }
        payload.items = items;
        return ArtdictAPI.post("/orders", payload);
      })
      .then(function (res) {
        clearCart();
        if (res && res.momoPaymentUrl) {
          window.location.href = res.momoPaymentUrl;
        } else {
          // Order created but no pay URL returned — go to the result page.
          window.location.href =
            "payment-return.html?orderId=" +
            encodeURIComponent(res && res.orderId) +
            "&pending=1";
        }
      })
      .catch(function (err) {
        // 502 from the server still created a PENDING order (carries orderId).
        if (err && err.data && err.data.orderId) {
          clearCart();
          window.location.href =
            "payment-return.html?orderId=" +
            encodeURIComponent(err.data.orderId) +
            "&pending=1";
          return;
        }
        fail(err.message || "Không đặt được đơn. Vui lòng thử lại.");
      });
  });
})();

/* ============================================================
   ARTDICT — payment result page.
   Reads the MoMo redirect query (resultCode, orderId, message) — or our
   own ?pending=1 fallback — and shows a success / pending / failed state.
   NOTE: the order's real PAID status is set server-side by the MoMo IPN
   callback, not by this browser redirect. This page only reflects the
   redirect outcome. Depends on nothing beyond the DOM.
   ============================================================ */
(function () {
  "use strict";

  var root = document.getElementById("pr-card");
  if (!root) return;

  var q = new URLSearchParams(window.location.search);
  var resultCode = q.get("resultCode");
  var orderId = q.get("orderId");
  var message = q.get("message");
  var pending = q.get("pending") === "1";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  var state;
  if (resultCode === "0") {
    state = {
      cls: "is-ok",
      mark: "✓",
      eyebrow: "Thanh toán thành công",
      title: "Cảm ơn bạn!",
      body:
        "Chúng tôi đã nhận thanh toán và đang chuẩn bị đơn của bạn. Email xác nhận sẽ được gửi trong giây lát.",
    };
  } else if (pending) {
    state = {
      cls: "is-pending",
      mark: "•",
      eyebrow: "Đơn đã được tạo",
      title: "Đang chờ thanh toán",
      body:
        "Đơn của bạn đã được ghi nhận nhưng chưa hoàn tất thanh toán. Chúng tôi sẽ liên hệ qua email để hỗ trợ bạn hoàn tất.",
    };
  } else {
    state = {
      cls: "is-fail",
      mark: "✕",
      eyebrow: "Thanh toán chưa hoàn tất",
      title: "Đơn chưa được thanh toán",
      body:
        (message ? "MoMo báo: " + esc(message) + ". " : "") +
        "Bạn có thể thử lại từ giỏ hàng. Chưa có khoản nào bị trừ.",
    };
  }

  root.className = "pr-card " + state.cls;
  root.innerHTML =
    '<div class="pr-mark">' +
    state.mark +
    "</div>" +
    '<p class="eyebrow pr-eyebrow">' +
    esc(state.eyebrow) +
    "</p>" +
    '<h1 class="pr-title">' +
    esc(state.title) +
    "</h1>" +
    (orderId
      ? '<p class="pr-order">Mã đơn hàng <strong>#' +
        esc(orderId) +
        "</strong></p>"
      : "") +
    '<p class="pr-body">' +
    state.body +
    "</p>" +
    '<div class="pr-actions">' +
    '<a class="circle-btn circle-btn--solid" href="/index.html">Về trang chủ</a>' +
    '<a class="circle-btn" href="catalogue.html">Tiếp tục mua sắm</a>' +
    "</div>";
})();

// Email service (Resend SDK). Docs: https://resend.com/docs/send-with-nodejs
const { Resend } = require('resend');

// Lazy: read env at call time so tests can set RESEND_API_KEY / EMAIL_FROM and
// so a missing key never crashes at module load.
function client() {
  return new Resend(process.env.RESEND_API_KEY || '');
}
function from() {
  return process.env.EMAIL_FROM || 'Artdict <no-reply@artdict.vn>';
}

async function send({ to, subject, html, replyTo }) {
  const { data, error } = await client().emails.send({
    from: from(),
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
  if (error) {
    throw new Error(error.message || 'Gửi email thất bại');
  }
  return { id: data.id };
}

// Recipient for order emails: guest email if present, else the registered user's.
function orderRecipient(order) {
  return order.guestEmail || (order.user && order.user.email) || null;
}

// Order confirmation — fires when MoMo callback marks the order PAID.
async function sendOrderConfirmation(order) {
  const to = orderRecipient(order);
  if (!to) return null;

  return send({
    to,
    subject: `Artdict — Xác nhận đơn hàng #${order.id}`,
    html:
      `<p>Cảm ơn bạn đã đặt hàng tại Artdict.</p>` +
      `<p>Mã đơn: <strong>#${order.id}</strong></p>` +
      `<p>Tổng thanh toán: <strong>${order.total}₫</strong></p>`,
  });
}

// Order shipped — fires when an admin sets the order status to SHIPPED.
async function sendOrderShipped(order) {
  const to = orderRecipient(order);
  if (!to) return null;

  return send({
    to,
    subject: `Artdict — Đơn hàng #${order.id} đã được giao đi`,
    html:
      `<p>Đơn hàng <strong>#${order.id}</strong> của bạn đã rời kho và đang trên đường tới.</p>` +
      `<p>Cảm ơn bạn đã ủng hộ Artdict.</p>`,
  });
}

// Escape applicant-supplied text before embedding it in the admin email body.
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Artist application — fires when someone submits the "gửi tác phẩm" form;
// goes to the admin inbox, reply-to set to the applicant so admin can respond.
async function sendArtistApplication(adminEmail, applicant) {
  const a = applicant || {};
  return send({
    to: adminEmail,
    replyTo: a.email || undefined,
    subject: `Artdict — Hồ sơ nghệ sĩ mới: ${a.name || 'Ẩn danh'}`,
    html:
      `<p><strong>Tên:</strong> ${esc(a.name)}</p>` +
      `<p><strong>Email:</strong> ${esc(a.email)}</p>` +
      `<p><strong>Thành phố:</strong> ${esc(a.city)}</p>` +
      `<p><strong>Portfolio:</strong> ${esc(a.portfolio)}</p>` +
      `<p><strong>Lời nhắn:</strong></p><p>${esc(a.message)}</p>`,
  });
}

module.exports = {
  send,
  sendOrderConfirmation,
  sendOrderShipped,
  sendArtistApplication,
};

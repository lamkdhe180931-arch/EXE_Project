// Email service (Resend). Docs: https://resend.com/docs/api-reference/emails
// Lazy env + built-in global `fetch` — no SDK dependency.
function config() {
  return {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'Artdict <no-reply@artdict.vn>',
    endpoint: process.env.RESEND_ENDPOINT || 'https://api.resend.com/emails',
  };
}

async function send({ to, subject, html }) {
  const c = config();
  const resp = await fetch(c.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${c.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: c.from, to, subject, html }),
  });
  const data = await resp.json();
  if (!data.id) {
    throw new Error(data.message || 'Gửi email thất bại');
  }
  return { id: data.id };
}

// Order confirmation — recipient is the guest email, else the registered user's.
async function sendOrderConfirmation(order) {
  const to = order.guestEmail || (order.user && order.user.email);
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

module.exports = { send, sendOrderConfirmation };

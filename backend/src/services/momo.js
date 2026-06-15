// MoMo Payment service (v2 gateway).
// Docs: https://developers.momo.vn — endpoint `/v2/gateway/api/create`.
// Env is read lazily so requiring this module never throws when MOMO_* is unset
// (e.g. in unrelated test suites). HMAC-SHA256 uses the built-in `crypto`;
// the HTTP call uses the built-in global `fetch` (Node >= 18) so we add no deps.
const crypto = require('crypto');

function config() {
  return {
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
    accessKey: process.env.MOMO_ACCESS_KEY || '',
    secretKey: process.env.MOMO_SECRET_KEY || '',
    redirectUrl:
      process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payment/return',
    ipnUrl:
      process.env.MOMO_IPN_URL ||
      'http://localhost:3000/api/orders/momo-callback',
    endpoint:
      process.env.MOMO_ENDPOINT ||
      'https://test-payment.momo.vn/v2/gateway/api/create',
  };
}

function sign(rawString, secretKey) {
  return crypto.createHmac('sha256', secretKey).update(rawString).digest('hex');
}

// Create a payment request and return the MoMo-hosted pay URL.
async function createPayment({ orderId, amount, orderInfo, extraData = '' }) {
  const c = config();
  // MoMo requires a globally-unique orderId per partner (forever) — re-paying a
  // failed order needs a fresh one, and the shared public sandbox rejects ids it
  // has seen. Append a uniqueness suffix; the IPN handler recovers the real DB id
  // with parseInt(), which stops at the '-' separator.
  const id = `${orderId}-${Date.now()}`;
  const requestId = id;
  const requestType = 'captureWallet';

  const rawSignature =
    `accessKey=${c.accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${c.ipnUrl}` +
    `&orderId=${id}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${c.partnerCode}` +
    `&redirectUrl=${c.redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  const body = {
    partnerCode: c.partnerCode,
    accessKey: c.accessKey,
    requestId,
    amount: Number(amount),
    orderId: id,
    orderInfo,
    redirectUrl: c.redirectUrl,
    ipnUrl: c.ipnUrl,
    extraData,
    requestType,
    lang: 'vi',
    signature: sign(rawSignature, c.secretKey),
  };

  const resp = await fetch(c.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await resp.json();

  if (data.resultCode !== 0) {
    const err = new Error(data.message || 'Tạo thanh toán MoMo thất bại');
    err.resultCode = data.resultCode;
    throw err;
  }

  return {
    payUrl: data.payUrl,
    deeplink: data.deeplink,
    requestId,
    orderId: data.orderId,
  };
}

// Verify the HMAC signature MoMo sends with its IPN (server-to-server) callback.
function verifyIpnSignature(body) {
  const c = config();
  const raw =
    `accessKey=${c.accessKey}` +
    `&amount=${body.amount}` +
    `&extraData=${body.extraData}` +
    `&message=${body.message}` +
    `&orderId=${body.orderId}` +
    `&orderInfo=${body.orderInfo}` +
    `&orderType=${body.orderType}` +
    `&partnerCode=${body.partnerCode}` +
    `&payType=${body.payType}` +
    `&requestId=${body.requestId}` +
    `&responseTime=${body.responseTime}` +
    `&resultCode=${body.resultCode}` +
    `&transId=${body.transId}`;
  const expected = Buffer.from(sign(raw, c.secretKey));
  const received = Buffer.from(String(body.signature || ''));
  // Constant-time compare; length guard because timingSafeEqual throws on
  // mismatched lengths.
  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

module.exports = { createPayment, verifyIpnSignature };

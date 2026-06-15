const crypto = require('crypto');

// Deterministic sandbox config so signatures are reproducible in tests.
process.env.MOMO_PARTNER_CODE = 'MOMOTEST';
process.env.MOMO_ACCESS_KEY = 'accesskey123';
process.env.MOMO_SECRET_KEY = 'secretkey123';
process.env.MOMO_REDIRECT_URL = 'http://localhost:3000/payment/return';
process.env.MOMO_IPN_URL = 'http://localhost:3000/api/orders/momo-callback';
process.env.MOMO_ENDPOINT = 'https://test-payment.momo.vn/v2/gateway/api/create';

const momo = require('../services/momo');

const realFetch = global.fetch;
afterAll(() => {
  global.fetch = realFetch;
});

describe('momo.createPayment', () => {
  test('posts to the MoMo endpoint and returns payUrl on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        resultCode: 0,
        payUrl: 'https://test-payment.momo.vn/pay/abc',
        orderId: '42',
      }),
    });

    const result = await momo.createPayment({
      orderId: 42,
      amount: 250000,
      orderInfo: 'Artdict đơn #42',
    });

    expect(result.payUrl).toBe('https://test-payment.momo.vn/pay/abc');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('https://test-payment.momo.vn/v2/gateway/api/create');
    expect(options.method).toBe('POST');

    const sent = JSON.parse(options.body);
    expect(sent.amount).toBe(250000);
    // orderId carries the DB id plus a uniqueness suffix; the IPN recovers the
    // DB id via parseInt(), which stops at the '-'.
    expect(sent.orderId).toMatch(/^42-\d+$/);
    expect(parseInt(sent.orderId, 10)).toBe(42);
    expect(sent.requestId).toBe(sent.orderId);
    // HMAC-SHA256 hex digest
    expect(sent.signature).toMatch(/^[a-f0-9]{64}$/);
  });

  test('throws when MoMo returns a non-zero resultCode', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ resultCode: 99, message: 'Hệ thống bận' }),
    });

    await expect(
      momo.createPayment({ orderId: 1, amount: 100, orderInfo: 'x' })
    ).rejects.toThrow('Hệ thống bận');
  });
});

describe('momo.verifyIpnSignature', () => {
  // Sign a body with the documented MoMo IPN field order, then assert verify.
  function signedBody(overrides = {}) {
    const body = {
      partnerCode: 'MOMOTEST',
      orderId: '42',
      requestId: '42',
      amount: 250000,
      orderInfo: 'Artdict đơn #42',
      orderType: 'momo_wallet',
      transId: 9999,
      resultCode: 0,
      message: 'Successful.',
      payType: 'qr',
      responseTime: 1700000000000,
      extraData: '',
      ...overrides,
    };
    const raw =
      `accessKey=${process.env.MOMO_ACCESS_KEY}` +
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
    body.signature = crypto
      .createHmac('sha256', process.env.MOMO_SECRET_KEY)
      .update(raw)
      .digest('hex');
    return body;
  }

  test('returns true for a correctly signed IPN body', () => {
    expect(momo.verifyIpnSignature(signedBody())).toBe(true);
  });

  test('returns false when a field is tampered after signing', () => {
    const body = signedBody();
    body.amount = 1; // tamper
    expect(momo.verifyIpnSignature(body)).toBe(false);
  });
});

const request = require('supertest');
const { createApp } = require('../app');
const { makeMockDb } = require('./helpers/mockDb');
const { signAccess } = require('../lib/jwt');

const adminToken = () => `Bearer ${signAccess({ userId: 1, role: 'ADMIN' })}`;
const customerToken = (userId = 2) =>
  `Bearer ${signAccess({ userId, role: 'CUSTOMER' })}`;

let app;
let db;
let momo;
let email;

beforeEach(() => {
  db = makeMockDb();
  momo = {
    createPayment: jest
      .fn()
      .mockResolvedValue({ payUrl: 'https://pay.momo/abc' }),
    verifyIpnSignature: jest.fn().mockReturnValue(true),
  };
  email = {
    sendOrderConfirmation: jest.fn().mockResolvedValue({ id: 'em_1' }),
    sendOrderShipped: jest.fn().mockResolvedValue({ id: 'em_2' }),
  };
  app = createApp(db, { momo, email });
});

// ─── POST /api/orders — create ─────────────────────────────────────────────────

describe('POST /api/orders', () => {
  test('201: authenticated customer creates a PENDING order with MoMo pay url', async () => {
    db.product.findMany.mockResolvedValue([
      { id: 1, name: 'Áo', slug: 'ao', price: 250000, stock: 10, isActive: true },
    ]);
    db.order.create.mockResolvedValue({
      id: 7,
      userId: 2,
      status: 'PENDING',
      total: 500000,
      items: [{ productId: 1, qty: 2, priceAtTime: 250000 }],
    });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', customerToken())
      .send({ items: [{ productId: 1, qty: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body.orderId).toBe(7);
    expect(res.body.total).toBe(500000);
    expect(res.body.momoPaymentUrl).toBe('https://pay.momo/abc');

    // total computed server-side; priceAtTime snapshotted from the server price
    expect(db.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 2,
          status: 'PENDING',
          total: 500000,
          items: {
            create: [
              expect.objectContaining({
                productId: 1,
                qty: 2,
                priceAtTime: 250000,
              }),
            ],
          },
        }),
      })
    );
    expect(momo.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: 7, amount: 500000 })
    );
  });

  test('snapshots server price + sums multi-item total (ignores client price)', async () => {
    db.product.findMany.mockResolvedValue([
      { id: 1, name: 'Áo', price: 250000, stock: 10, isActive: true },
      { id: 2, name: 'Mũ', price: 150000, stock: 5, isActive: true },
    ]);
    db.order.create.mockResolvedValue({ id: 8, status: 'PENDING', total: 650000 });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', customerToken())
      .send({
        items: [
          { productId: 1, qty: 2, price: 1 }, // client price must be ignored
          { productId: 2, qty: 1 },
        ],
      });

    expect(res.status).toBe(201);
    const data = db.order.create.mock.calls[0][0].data;
    expect(data.total).toBe(650000); // 250000*2 + 150000
    expect(data.items.create).toEqual([
      expect.objectContaining({ productId: 1, qty: 2, priceAtTime: 250000 }),
      expect.objectContaining({ productId: 2, qty: 1, priceAtTime: 150000 }),
    ]);
  });

  test('201: guest checkout with email, userId is null', async () => {
    db.product.findMany.mockResolvedValue([
      { id: 1, name: 'Áo', price: 250000, stock: 10, isActive: true },
    ]);
    db.order.create.mockResolvedValue({
      id: 9,
      status: 'PENDING',
      total: 250000,
      userId: null,
    });

    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productId: 1, qty: 1 }],
        guestEmail: 'khach@example.com',
        guestName: 'Khách',
      });

    expect(res.status).toBe(201);
    const data = db.order.create.mock.calls[0][0].data;
    expect(data.userId).toBeNull();
    expect(data.guestEmail).toBe('khach@example.com');
  });

  test('400: guest checkout without email is rejected', async () => {
    db.product.findMany.mockResolvedValue([
      { id: 1, name: 'Áo', price: 250000, stock: 10, isActive: true },
    ]);
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 1, qty: 1 }] });

    expect(res.status).toBe(400);
    expect(db.order.create).not.toHaveBeenCalled();
  });

  test('401: a present but invalid token is rejected (not silently treated as guest)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer not-a-real-token')
      .send({ items: [{ productId: 1, qty: 1 }] });

    expect(res.status).toBe(401);
  });

  test('502: MoMo failure still persists the order and returns its id', async () => {
    db.product.findMany.mockResolvedValue([
      { id: 1, name: 'Áo', price: 250000, stock: 10, isActive: true },
    ]);
    db.order.create.mockResolvedValue({ id: 10, status: 'PENDING', total: 250000 });
    momo.createPayment.mockRejectedValue(new Error('MoMo down'));

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', customerToken())
      .send({ items: [{ productId: 1, qty: 1 }] });

    expect(res.status).toBe(502);
    expect(res.body.orderId).toBe(10);
  });
});

describe('POST /api/orders — cart validation', () => {
  test('400: empty cart', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', customerToken())
      .send({ items: [] });
    expect(res.status).toBe(400);
  });

  test('400: non-positive quantity', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', customerToken())
      .send({ items: [{ productId: 1, qty: 0 }] });
    expect(res.status).toBe(400);
    expect(db.order.create).not.toHaveBeenCalled();
  });

  test('400: product missing or inactive', async () => {
    db.product.findMany.mockResolvedValue([]); // nothing found
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', customerToken())
      .send({ items: [{ productId: 99, qty: 1 }] });
    expect(res.status).toBe(400);
    expect(db.order.create).not.toHaveBeenCalled();
  });

  test('400: quantity exceeds stock', async () => {
    db.product.findMany.mockResolvedValue([
      { id: 1, name: 'Áo', price: 250000, stock: 2, isActive: true },
    ]);
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', customerToken())
      .send({ items: [{ productId: 1, qty: 5 }] });
    expect(res.status).toBe(400);
    expect(db.order.create).not.toHaveBeenCalled();
  });
});

// ─── POST /api/orders/momo-callback — IPN ──────────────────────────────────────

describe('POST /api/orders/momo-callback', () => {
  const ipnBody = (overrides = {}) => ({
    partnerCode: 'MOMOTEST',
    orderId: '7',
    requestId: '7',
    amount: 500000,
    orderInfo: 'Artdict đơn #7',
    orderType: 'momo_wallet',
    transId: 123456,
    resultCode: 0,
    message: 'Successful.',
    payType: 'qr',
    responseTime: 1700000000000,
    extraData: '',
    signature: 'sig',
    ...overrides,
  });

  test('204: valid signature + resultCode 0 → PAID, txId saved, stock decremented per item', async () => {
    momo.verifyIpnSignature.mockReturnValue(true);
    db.order.findUnique.mockResolvedValue({
      id: 7,
      status: 'PENDING',
      items: [
        { productId: 1, qty: 2 },
        { productId: 2, qty: 1 },
      ],
    });
    db.order.update.mockResolvedValue({});
    db.product.update.mockResolvedValue({});

    const res = await request(app)
      .post('/api/orders/momo-callback')
      .send(ipnBody());

    expect(res.status).toBe(204);
    // Status flip + stock decrements must run in a single transaction.
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(db.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 7 },
        data: expect.objectContaining({
          status: 'PAID',
          momoTransactionId: '123456',
        }),
      })
    );
    expect(db.product.update).toHaveBeenCalledTimes(2);
    expect(db.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { stock: { decrement: 2 } },
      })
    );
    expect(email.sendOrderConfirmation).toHaveBeenCalledTimes(1);
  });

  test('400: invalid signature leaves the order untouched', async () => {
    momo.verifyIpnSignature.mockReturnValue(false);

    const res = await request(app)
      .post('/api/orders/momo-callback')
      .send(ipnBody({ signature: 'bad' }));

    expect(res.status).toBe(400);
    expect(db.order.update).not.toHaveBeenCalled();
    expect(db.product.update).not.toHaveBeenCalled();
  });

  test('204: failed payment (resultCode != 0) does not mark PAID or decrement stock', async () => {
    momo.verifyIpnSignature.mockReturnValue(true);

    const res = await request(app)
      .post('/api/orders/momo-callback')
      .send(ipnBody({ resultCode: 1006 }));

    expect(res.status).toBe(204);
    expect(db.order.update).not.toHaveBeenCalled();
    expect(db.product.update).not.toHaveBeenCalled();
  });

  test('204: duplicate IPN for an already-PAID order is idempotent (no double decrement)', async () => {
    momo.verifyIpnSignature.mockReturnValue(true);
    db.order.findUnique.mockResolvedValue({
      id: 7,
      status: 'PAID',
      items: [{ productId: 1, qty: 2 }],
    });

    const res = await request(app)
      .post('/api/orders/momo-callback')
      .send(ipnBody());

    expect(res.status).toBe(204);
    expect(db.order.update).not.toHaveBeenCalled();
    expect(db.product.update).not.toHaveBeenCalled();
  });

  test('204: a failing confirmation email does not break the callback', async () => {
    momo.verifyIpnSignature.mockReturnValue(true);
    db.order.findUnique.mockResolvedValue({
      id: 7,
      status: 'PENDING',
      items: [{ productId: 1, qty: 1 }],
    });
    db.order.update.mockResolvedValue({});
    db.product.update.mockResolvedValue({});
    email.sendOrderConfirmation.mockRejectedValue(new Error('Resend down'));

    const res = await request(app)
      .post('/api/orders/momo-callback')
      .send(ipnBody());

    expect(res.status).toBe(204);
  });
});

// ─── GET /api/orders — admin list ──────────────────────────────────────────────

describe('GET /api/orders', () => {
  test('200: admin lists all orders', async () => {
    db.order.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', adminToken());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('403: customer cannot list all orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', customerToken());
    expect(res.status).toBe(403);
  });

  test('401: unauthenticated', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/orders/my — current user's orders ────────────────────────────────

describe('GET /api/orders/my', () => {
  test("200: returns only the caller's orders", async () => {
    db.order.findMany.mockResolvedValue([{ id: 5, userId: 2 }]);
    const res = await request(app)
      .get('/api/orders/my')
      .set('Authorization', customerToken(2));
    expect(res.status).toBe(200);
    expect(db.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 2 } })
    );
  });

  test('401: unauthenticated', async () => {
    const res = await request(app).get('/api/orders/my');
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/orders/:id — admin or owner ──────────────────────────────────────

describe('GET /api/orders/:id', () => {
  test('200: admin can view any order', async () => {
    db.order.findUnique.mockResolvedValue({ id: 5, userId: 2, items: [] });
    const res = await request(app)
      .get('/api/orders/5')
      .set('Authorization', adminToken());
    expect(res.status).toBe(200);
  });

  test('200: owner can view their own order', async () => {
    db.order.findUnique.mockResolvedValue({ id: 5, userId: 2, items: [] });
    const res = await request(app)
      .get('/api/orders/5')
      .set('Authorization', customerToken(2));
    expect(res.status).toBe(200);
  });

  test('403: a different customer cannot view the order', async () => {
    db.order.findUnique.mockResolvedValue({ id: 5, userId: 2, items: [] });
    const res = await request(app)
      .get('/api/orders/5')
      .set('Authorization', customerToken(99));
    expect(res.status).toBe(403);
  });

  test('404: order not found', async () => {
    db.order.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .get('/api/orders/999')
      .set('Authorization', adminToken());
    expect(res.status).toBe(404);
  });
});

// ─── PATCH /api/orders/:id/status — admin ──────────────────────────────────────

describe('PATCH /api/orders/:id/status', () => {
  test('200: admin updates status', async () => {
    db.order.findUnique.mockResolvedValue({ id: 5, status: 'PAID' });
    db.order.update.mockResolvedValue({ id: 5, status: 'SHIPPED' });
    const res = await request(app)
      .patch('/api/orders/5/status')
      .set('Authorization', adminToken())
      .send({ status: 'SHIPPED' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SHIPPED');
  });

  test('400: invalid status value', async () => {
    const res = await request(app)
      .patch('/api/orders/5/status')
      .set('Authorization', adminToken())
      .send({ status: 'NOPE' });
    expect(res.status).toBe(400);
    expect(db.order.update).not.toHaveBeenCalled();
  });

  test('404: order not found', async () => {
    db.order.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/orders/999/status')
      .set('Authorization', adminToken())
      .send({ status: 'SHIPPED' });
    expect(res.status).toBe(404);
  });

  test('403: customer cannot update status', async () => {
    const res = await request(app)
      .patch('/api/orders/5/status')
      .set('Authorization', customerToken())
      .send({ status: 'SHIPPED' });
    expect(res.status).toBe(403);
  });

  test('sends a shipped email when the status becomes SHIPPED', async () => {
    db.order.findUnique.mockResolvedValue({ id: 5, status: 'PAID' });
    db.order.update.mockResolvedValue({
      id: 5,
      status: 'SHIPPED',
      guestEmail: 'g@e.com',
    });
    const res = await request(app)
      .patch('/api/orders/5/status')
      .set('Authorization', adminToken())
      .send({ status: 'SHIPPED' });
    expect(res.status).toBe(200);
    expect(email.sendOrderShipped).toHaveBeenCalledTimes(1);
  });

  test('does not re-send the shipped email when the order is already SHIPPED', async () => {
    db.order.findUnique.mockResolvedValue({ id: 5, status: 'SHIPPED' });
    db.order.update.mockResolvedValue({
      id: 5,
      status: 'SHIPPED',
      guestEmail: 'g@e.com',
    });
    await request(app)
      .patch('/api/orders/5/status')
      .set('Authorization', adminToken())
      .send({ status: 'SHIPPED' });
    expect(email.sendOrderShipped).not.toHaveBeenCalled();
  });

  test('does not send a shipped email for other status changes', async () => {
    db.order.findUnique.mockResolvedValue({ id: 5, status: 'PAID' });
    db.order.update.mockResolvedValue({ id: 5, status: 'DELIVERED' });
    await request(app)
      .patch('/api/orders/5/status')
      .set('Authorization', adminToken())
      .send({ status: 'DELIVERED' });
    expect(email.sendOrderShipped).not.toHaveBeenCalled();
  });

  test('200: a failing shipped email does not break the status update', async () => {
    db.order.findUnique.mockResolvedValue({ id: 5, status: 'PAID' });
    db.order.update.mockResolvedValue({
      id: 5,
      status: 'SHIPPED',
      guestEmail: 'g@e.com',
    });
    email.sendOrderShipped.mockRejectedValue(new Error('Resend down'));
    const res = await request(app)
      .patch('/api/orders/5/status')
      .set('Authorization', adminToken())
      .send({ status: 'SHIPPED' });
    expect(res.status).toBe(200);
  });
});

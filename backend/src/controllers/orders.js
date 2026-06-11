const VALID_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function makeOrdersController(db, deps = {}) {
  // External boundaries are injectable for testing; default to the real ones.
  const momo = deps.momo || require('../services/momo');

  // POST /api/orders — optional auth (guest allowed). Cart already validated by
  // `validateCart`, which put server-priced items + total on `req.cart`.
  async function create(req, res) {
    const { items, total } = req.cart;
    const isGuest = !req.user;
    const { guestEmail, guestName, guestPhone, shippingAddress } = req.body;

    if (isGuest && !guestEmail) {
      return res
        .status(400)
        .json({ error: 'Cần email để đặt đơn dạng khách (guest checkout)' });
    }

    const order = await db.order.create({
      data: {
        userId: req.user ? req.user.userId : null,
        guestEmail: isGuest ? guestEmail : null,
        guestName: isGuest ? guestName ?? null : null,
        guestPhone: isGuest ? guestPhone ?? null : null,
        shippingAddress: shippingAddress ?? null,
        status: 'PENDING',
        total,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            qty: i.qty,
            priceAtTime: i.priceAtTime,
            size: i.size,
          })),
        },
      },
      include: { items: true },
    });

    let payment;
    try {
      payment = await momo.createPayment({
        orderId: order.id,
        amount: order.total,
        orderInfo: `Artdict đơn #${order.id}`,
      });
    } catch {
      // Order persists as PENDING; client can retry payment with the orderId.
      return res.status(502).json({
        error: 'Không tạo được liên kết thanh toán MoMo',
        orderId: order.id,
      });
    }

    return res.status(201).json({
      orderId: order.id,
      total: order.total,
      status: order.status,
      momoPaymentUrl: payment.payUrl,
    });
  }

  // POST /api/orders/momo-callback — MoMo server-to-server IPN (no user auth;
  // trust is established by the HMAC signature instead).
  async function momoCallback(req, res) {
    if (!momo.verifyIpnSignature(req.body)) {
      return res.status(400).json({ error: 'Chữ ký MoMo không hợp lệ' });
    }

    // Acknowledge non-successful payments without touching the order.
    if (Number(req.body.resultCode) !== 0) {
      return res.status(204).end();
    }

    const orderId = parseInt(req.body.orderId, 10);
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }
    // Idempotent: MoMo may resend the IPN — never decrement stock twice.
    if (order.status === 'PAID') {
      return res.status(204).end();
    }

    // Mark paid + decrement stock atomically: a mid-way crash must not leave a
    // PAID order with un-decremented stock.
    await db.$transaction([
      db.order.update({
        where: { id: orderId },
        data: { status: 'PAID', momoTransactionId: String(req.body.transId) },
      }),
      ...order.items.map((item) =>
        db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        })
      ),
    ]);

    // TODO Phase 6: gửi email xác nhận đơn hàng qua Resend.
    return res.status(204).end();
  }

  // GET /api/orders — admin: every order, newest first.
  async function list(_req, res) {
    const orders = await db.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  }

  // GET /api/orders/my — the authenticated user's own orders.
  async function listMine(req, res) {
    const orders = await db.order.findMany({
      where: { userId: req.user.userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  }

  // GET /api/orders/:id — admin or the order's owner only.
  async function detail(req, res) {
    const id = parseInt(req.params.id, 10);
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }
    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = order.userId === req.user.userId;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Không có quyền xem đơn này' });
    }
    return res.json(order);
  }

  // PATCH /api/orders/:id/status — admin.
  async function updateStatus(req, res) {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }
    const order = await db.order.update({ where: { id }, data: { status } });
    return res.json(order);
  }

  return { create, momoCallback, list, listMine, detail, updateStatus };
}

module.exports = makeOrdersController;

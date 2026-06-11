// Cart-validation middleware. Loads the referenced products server-side,
// rejects unavailable products / insufficient stock, and snapshots the price
// at purchase time. On success it attaches `req.cart = { items, total }`,
// where each item carries `priceAtTime` — the controller never trusts a
// client-supplied price.
function makeValidateCart(db) {
  return async function validateCart(req, res, next) {
    const items = req.body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Giỏ hàng trống' });
    }
    for (const it of items) {
      if (!Number.isInteger(it.qty) || it.qty <= 0) {
        return res.status(400).json({ error: 'Số lượng không hợp lệ' });
      }
    }

    const ids = [...new Set(items.map((i) => i.productId))];
    const products = await db.product.findMany({ where: { id: { in: ids } } });
    const byId = new Map(products.map((p) => [p.id, p]));

    const validated = [];
    let total = 0;
    for (const it of items) {
      const product = byId.get(it.productId);
      if (!product || !product.isActive) {
        return res
          .status(400)
          .json({ error: `Sản phẩm #${it.productId} không khả dụng` });
      }
      if (it.qty > product.stock) {
        return res
          .status(400)
          .json({ error: `Không đủ tồn kho cho "${product.name}"` });
      }
      validated.push({
        productId: product.id,
        qty: it.qty,
        size: it.size ?? null,
        priceAtTime: product.price,
      });
      total += product.price * it.qty;
    }

    req.cart = { items: validated, total };
    next();
  };
}

module.exports = makeValidateCart;

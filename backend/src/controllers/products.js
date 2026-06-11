function makeProductsController(db) {
  async function list(req, res) {
    const where = { isActive: true };
    if (req.query.category) where.category = req.query.category;
    if (req.query.artistId) where.artistId = parseInt(req.query.artistId, 10);

    const products = await db.product.findMany({
      where,
      include: { images: { orderBy: { order: 'asc' } }, artist: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(products);
  }

  async function detail(req, res) {
    const product = await db.product.findUnique({
      where: { slug: req.params.slug },
      include: { images: { orderBy: { order: 'asc' } }, artist: true },
    });
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }
    return res.json(product);
  }

  async function create(req, res) {
    const { name, slug, price, stock, category, artistId } = req.body;
    if (!name || !slug || price == null || !category) {
      return res.status(400).json({ error: 'name, slug, price, category là bắt buộc' });
    }
    const product = await db.product.create({
      data: { name, slug, price, stock: stock ?? 0, category, artistId: artistId ?? null },
    });
    return res.status(201).json(product);
  }

  async function update(req, res) {
    const id = parseInt(req.params.id, 10);
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });

    const allowed = ['name', 'slug', 'price', 'stock', 'category', 'artistId', 'isActive'];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    const product = await db.product.update({ where: { id }, data });
    return res.json(product);
  }

  async function softDelete(req, res) {
    const id = parseInt(req.params.id, 10);
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });

    await db.product.update({ where: { id }, data: { isActive: false } });
    return res.json({ message: 'Đã xóa sản phẩm' });
  }

  return { list, detail, create, update, softDelete };
}

module.exports = makeProductsController;

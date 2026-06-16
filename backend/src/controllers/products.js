function makeProductsController(db, deps = {}) {
  const cloudinary = deps.cloudinary || require('../services/cloudinary');

  async function list(req, res) {
    const where = { isActive: true };
    if (req.query.category) where.category = req.query.category;
    if (req.query.artistId) where.artistId = parseInt(req.query.artistId, 10);

    const products = await db.product.findMany({
      where,
      // The grid/cards only ever use the first image — fetch just that one so
      // the list payload stays small as products accumulate galleries.
      include: { images: { orderBy: { order: 'asc' }, take: 1 }, artist: true },
      orderBy: { createdAt: 'desc' },
    });
    // Public read data: let browsers/CDN serve repeat visits from cache while
    // revalidating in the background. Admin reads use cache:'no-store' so they
    // are unaffected.
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
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
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.json(product);
  }

  async function create(req, res) {
    const { name, slug, price, stock, category, artistId, description } = req.body;
    if (!name || !slug || price == null || !category) {
      return res.status(400).json({ error: 'name, slug, price, category là bắt buộc' });
    }
    const product = await db.product.create({
      data: {
        name, slug, price, stock: stock ?? 0, category,
        artistId: artistId ?? null,
        description: description ?? null,
      },
    });
    return res.status(201).json(product);
  }

  async function update(req, res) {
    const id = parseInt(req.params.id, 10);
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });

    const allowed = ['name', 'slug', 'price', 'stock', 'category', 'artistId', 'description', 'isActive'];
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

  async function uploadImages(req, res) {
    const id = parseInt(req.params.id, 10);
    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    const images = req.body.images;
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Cần ít nhất 1 ảnh' });
    }

    const created = [];
    for (let i = 0; i < images.length; i++) {
      const { url } = await cloudinary.uploadImage(images[i]);
      created.push({ productId: id, url, order: i });
    }
    await db.productImage.createMany({ data: created });
    return res.status(201).json({ images: created });
  }

  return { list, detail, create, update, softDelete, uploadImages };
}

module.exports = makeProductsController;

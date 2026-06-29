const { resolveSlug } = require('../utils/slug');

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

  // Mọi trường đều KHÔNG bắt buộc: thiếu thì điền mặc định hợp lý. Slug bỏ trống
  // sẽ tự sinh từ tên (hoặc 'san-pham') và bảo đảm duy nhất.
  async function create(req, res) {
    const { name, slug, price, stock, category, artistId, description } = req.body;
    const finalSlug = await resolveSlug(db.product, slug, name, 'san-pham', null);
    const priceN = Number(price);
    const stockN = Number(stock);
    const artistN = parseInt(artistId, 10);
    const product = await db.product.create({
      data: {
        name: name == null ? '' : String(name),
        slug: finalSlug,
        price: Number.isFinite(priceN) ? Math.trunc(priceN) : 0,
        stock: Number.isFinite(stockN) ? Math.trunc(stockN) : 0,
        category: category || 'khac',
        artistId: Number.isFinite(artistN) ? artistN : null,
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
    // Slug rỗng → giữ nguyên slug cũ; có giá trị → bảo đảm duy nhất (loại trừ chính nó).
    if (data.slug !== undefined) {
      if (!String(data.slug).trim()) delete data.slug;
      else data.slug = await resolveSlug(db.product, data.slug, existing.name, 'san-pham', id);
    }
    if (data.price !== undefined) { const n = Number(data.price); data.price = Number.isFinite(n) ? Math.trunc(n) : 0; }
    if (data.stock !== undefined) { const n = Number(data.stock); data.stock = Number.isFinite(n) ? Math.trunc(n) : 0; }
    if (data.artistId !== undefined) { const n = parseInt(data.artistId, 10); data.artistId = Number.isFinite(n) ? n : null; }
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

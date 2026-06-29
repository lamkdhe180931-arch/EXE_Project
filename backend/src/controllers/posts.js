const VALID_TYPES = ['NEWS', 'JOURNAL'];
const { resolveSlug } = require('../utils/slug');

function makePostsController(db, deps = {}) {
  const cloudinary = deps.cloudinary || require('../services/cloudinary');

  // GET /api/posts — public; optional ?type=NEWS|JOURNAL filter, newest first.
  async function list(req, res) {
    const { type } = req.query;
    const where = {};
    if (type) {
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({ error: 'type phải là NEWS hoặc JOURNAL' });
      }
      where.type = type;
    }
    const posts = await db.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return res.json(posts);
  }

  // GET /api/posts/:slug — public detail.
  async function detail(req, res) {
    const post = await db.post.findUnique({ where: { slug: req.params.slug } });
    if (!post) return res.status(404).json({ error: 'Bài viết không tồn tại' });
    return res.json(post);
  }

  // POST /api/posts — admin. Mọi trường KHÔNG bắt buộc: type mặc định NEWS,
  // slug bỏ trống → tự sinh từ tiêu đề (hoặc 'bai-viet'). `publishedAt` null = nháp.
  async function create(req, res) {
    const { type, title, slug, body, coverImage, publishedAt } = req.body;
    const finalType = type || 'NEWS';
    if (!VALID_TYPES.includes(finalType)) {
      return res.status(400).json({ error: 'type phải là NEWS hoặc JOURNAL' });
    }
    const finalSlug = await resolveSlug(db.post, slug, title, 'bai-viet', null);
    const post = await db.post.create({
      data: {
        type: finalType,
        title: title == null ? '' : String(title),
        slug: finalSlug,
        body: body == null ? '' : String(body),
        coverImage: coverImage ?? null,
        publishedAt: publishedAt ?? null,
      },
    });
    return res.status(201).json(post);
  }

  // PATCH /api/posts/:id — admin.
  async function update(req, res) {
    const id = parseInt(req.params.id, 10);
    const existing = await db.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Bài viết không tồn tại' });

    const allowed = ['type', 'title', 'slug', 'body', 'coverImage', 'publishedAt'];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    if (data.type && !VALID_TYPES.includes(data.type)) {
      return res.status(400).json({ error: 'type phải là NEWS hoặc JOURNAL' });
    }
    if (data.slug !== undefined) {
      if (!String(data.slug).trim()) delete data.slug;
      else data.slug = await resolveSlug(db.post, data.slug, existing.title, 'bai-viet', id);
    }
    const post = await db.post.update({ where: { id }, data });
    return res.json(post);
  }

  // DELETE /api/posts/:id — admin.
  async function remove(req, res) {
    const id = parseInt(req.params.id, 10);
    const existing = await db.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Bài viết không tồn tại' });

    await db.post.delete({ where: { id } });
    return res.json({ message: 'Đã xóa bài viết' });
  }

  // POST /api/posts/:id/cover — admin. Upload a cover image (data URL or remote
  // URL) to Cloudinary and save the resulting URL onto the post.
  async function uploadCover(req, res) {
    const id = parseInt(req.params.id, 10);
    const existing = await db.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Bài viết không tồn tại' });

    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Cần một ảnh' });

    const { url } = await cloudinary.uploadImage(image);
    const post = await db.post.update({ where: { id }, data: { coverImage: url } });
    return res.json(post);
  }

  return { list, detail, create, update, remove, uploadCover };
}

module.exports = makePostsController;

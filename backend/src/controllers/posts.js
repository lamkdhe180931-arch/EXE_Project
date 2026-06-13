const VALID_TYPES = ['NEWS', 'JOURNAL'];

function makePostsController(db) {
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

  // POST /api/posts — admin. `publishedAt` optional (null = draft).
  async function create(req, res) {
    const { type, title, slug, body, publishedAt } = req.body;
    if (!type || !title || !slug || !body) {
      return res
        .status(400)
        .json({ error: 'type, title, slug, body là bắt buộc' });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: 'type phải là NEWS hoặc JOURNAL' });
    }
    const post = await db.post.create({
      data: { type, title, slug, body, publishedAt: publishedAt ?? null },
    });
    return res.status(201).json(post);
  }

  // PATCH /api/posts/:id — admin.
  async function update(req, res) {
    const id = parseInt(req.params.id, 10);
    const existing = await db.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Bài viết không tồn tại' });

    const allowed = ['type', 'title', 'slug', 'body', 'publishedAt'];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    if (data.type && !VALID_TYPES.includes(data.type)) {
      return res.status(400).json({ error: 'type phải là NEWS hoặc JOURNAL' });
    }
    const post = await db.post.update({ where: { id }, data });
    return res.json(post);
  }

  return { list, detail, create, update };
}

module.exports = makePostsController;

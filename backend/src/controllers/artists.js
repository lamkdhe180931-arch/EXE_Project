function makeArtistsController(db) {
  async function list(_req, res) {
    const artists = await db.artist.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(artists);
  }

  async function detail(req, res) {
    const artist = await db.artist.findUnique({ where: { slug: req.params.slug } });
    if (!artist) return res.status(404).json({ error: 'Nghệ sĩ không tồn tại' });
    return res.json(artist);
  }

  async function create(req, res) {
    const { name, slug, role, city, since, avatarUrl, content } = req.body;
    if (!name || !slug || !role || !city || !since || !content) {
      return res.status(400).json({ error: 'name, slug, role, city, since, content là bắt buộc' });
    }
    if (!content.quote || !Array.isArray(content.qa) || content.qa.length !== 3) {
      return res.status(400).json({ error: 'content phải có quote và đúng 3 câu hỏi qa[]' });
    }
    const artist = await db.artist.create({
      data: { name, slug, role, city, since, avatarUrl: avatarUrl ?? null, content },
    });
    return res.status(201).json(artist);
  }

  async function update(req, res) {
    const id = parseInt(req.params.id, 10);
    const existing = await db.artist.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Nghệ sĩ không tồn tại' });

    const allowed = ['name', 'slug', 'role', 'city', 'since', 'avatarUrl', 'content'];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    const artist = await db.artist.update({ where: { id }, data });
    return res.json(artist);
  }

  async function remove(req, res) {
    const id = parseInt(req.params.id, 10);
    const existing = await db.artist.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Nghệ sĩ không tồn tại' });

    await db.artist.delete({ where: { id } });
    return res.json({ message: 'Đã xóa nghệ sĩ' });
  }

  return { list, detail, create, update, remove };
}

module.exports = makeArtistsController;

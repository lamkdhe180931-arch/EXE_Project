function makeArtistsController(db, deps = {}) {
  const email = deps.email || require('../services/email');
  const cloudinary = deps.cloudinary || require('../services/cloudinary');

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

  // POST /api/artists/:id/avatar — admin. Upload a single portrait (data URL or
  // remote URL) to Cloudinary and save the resulting URL onto the artist.
  async function uploadAvatar(req, res) {
    const id = parseInt(req.params.id, 10);
    const existing = await db.artist.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Nghệ sĩ không tồn tại' });

    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Cần một ảnh' });

    const { url } = await cloudinary.uploadImage(image);
    const artist = await db.artist.update({ where: { id }, data: { avatarUrl: url } });
    return res.json(artist);
  }

  // POST /api/artists/apply — public; an artist submits their portfolio. We email
  // the admin inbox (no DB row). The email is the only record, so a send failure
  // must surface (502) rather than be swallowed — otherwise the application is lost.
  async function apply(req, res) {
    const { name, email: applicantEmail, portfolio, city, message } = req.body;
    if (!name || !applicantEmail || !portfolio) {
      return res
        .status(400)
        .json({ error: 'name, email, portfolio là bắt buộc' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
    try {
      await email.sendArtistApplication(adminEmail, {
        name,
        email: applicantEmail,
        portfolio,
        city,
        message,
      });
    } catch {
      return res.status(502).json({ error: 'Không gửi được hồ sơ, vui lòng thử lại' });
    }

    return res.status(202).json({ message: 'Đã nhận hồ sơ, Artdict sẽ liên hệ lại' });
  }

  return { list, detail, create, update, remove, apply, uploadAvatar };
}

module.exports = makeArtistsController;

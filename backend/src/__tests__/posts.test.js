const request = require('supertest');
const { createApp } = require('../app');
const { makeMockDb } = require('./helpers/mockDb');
const { signAccess } = require('../lib/jwt');

const adminToken = () => `Bearer ${signAccess({ userId: 1, role: 'ADMIN' })}`;
const customerToken = () => `Bearer ${signAccess({ userId: 2, role: 'CUSTOMER' })}`;

let app;
let db;

beforeEach(() => {
  db = makeMockDb();
  app = createApp(db);
});

const mockPost = {
  id: 1,
  type: 'NEWS',
  title: 'Ra mắt bộ sưu tập Mèo Nổ',
  slug: 'ra-mat-meo-no',
  body: 'Nội dung bài viết...',
  publishedAt: '2026-06-01T00:00:00.000Z',
  createdAt: '2026-06-01T00:00:00.000Z',
};

// ─── GET list ────────────────────────────────────────────────────────────────

describe('GET /api/posts', () => {
  test('200: returns posts newest first', async () => {
    db.post.findMany.mockResolvedValue([mockPost]);
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(db.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  test('200: filters by ?type=NEWS', async () => {
    db.post.findMany.mockResolvedValue([mockPost]);
    const res = await request(app).get('/api/posts?type=NEWS');
    expect(res.status).toBe(200);
    expect(db.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { type: 'NEWS' } })
    );
  });

  test('400: rejects an invalid type', async () => {
    const res = await request(app).get('/api/posts?type=BOGUS');
    expect(res.status).toBe(400);
    expect(db.post.findMany).not.toHaveBeenCalled();
  });
});

// ─── GET detail ──────────────────────────────────────────────────────────────

describe('GET /api/posts/:slug', () => {
  test('200: returns a post by slug', async () => {
    db.post.findUnique.mockResolvedValue(mockPost);
    const res = await request(app).get('/api/posts/ra-mat-meo-no');
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('ra-mat-meo-no');
  });

  test('404: unknown slug', async () => {
    db.post.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/posts/khong-co');
    expect(res.status).toBe(404);
  });
});

// ─── POST create ─────────────────────────────────────────────────────────────

describe('POST /api/posts', () => {
  const validBody = {
    type: 'JOURNAL',
    title: 'Ghi chép xưởng vẽ',
    slug: 'ghi-chep-xuong-ve',
    body: 'Một buổi chiều trong xưởng...',
  };

  test('201: admin creates a post', async () => {
    db.post.create.mockResolvedValue({ id: 2, ...validBody });
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', adminToken())
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.slug).toBe('ghi-chep-xuong-ve');
  });

  test('400: missing required fields', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', adminToken())
      .send({ title: 'Chỉ có tiêu đề' });
    expect(res.status).toBe(400);
    expect(db.post.create).not.toHaveBeenCalled();
  });

  test('201: accepts an optional coverImage', async () => {
    db.post.create.mockResolvedValue({ id: 5, ...validBody, coverImage: 'https://x/c.png' });
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', adminToken())
      .send({ ...validBody, coverImage: 'https://x/c.png' });
    expect(res.status).toBe(201);
    expect(db.post.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ coverImage: 'https://x/c.png' }) })
    );
  });

  test('400: invalid type', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', adminToken())
      .send({ ...validBody, type: 'BLOG' });
    expect(res.status).toBe(400);
    expect(db.post.create).not.toHaveBeenCalled();
  });

  test('403: customer cannot create', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', customerToken())
      .send(validBody);
    expect(res.status).toBe(403);
  });

  test('401: unauthenticated', async () => {
    const res = await request(app).post('/api/posts').send(validBody);
    expect(res.status).toBe(401);
  });
});

// ─── PATCH update ────────────────────────────────────────────────────────────

describe('PATCH /api/posts/:id', () => {
  test('200: admin updates a post', async () => {
    db.post.findUnique.mockResolvedValue(mockPost);
    db.post.update.mockResolvedValue({ ...mockPost, title: 'Tiêu đề mới' });
    const res = await request(app)
      .patch('/api/posts/1')
      .set('Authorization', adminToken())
      .send({ title: 'Tiêu đề mới' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Tiêu đề mới');
  });

  test('404: post not found', async () => {
    db.post.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/posts/999')
      .set('Authorization', adminToken())
      .send({ title: 'x' });
    expect(res.status).toBe(404);
  });

  test('403: customer cannot update', async () => {
    const res = await request(app)
      .patch('/api/posts/1')
      .set('Authorization', customerToken())
      .send({ title: 'x' });
    expect(res.status).toBe(403);
  });
});

// ─── DELETE ──────────────────────────────────────────────────────────────────

describe('DELETE /api/posts/:id', () => {
  test('200: admin deletes a post', async () => {
    db.post.findUnique.mockResolvedValue(mockPost);
    db.post.delete.mockResolvedValue(mockPost);

    const res = await request(app)
      .delete('/api/posts/1')
      .set('Authorization', adminToken());

    expect(res.status).toBe(200);
    expect(db.post.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  test('404: post not found', async () => {
    db.post.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .delete('/api/posts/999')
      .set('Authorization', adminToken());
    expect(res.status).toBe(404);
  });

  test('403: customer cannot delete', async () => {
    const res = await request(app)
      .delete('/api/posts/1')
      .set('Authorization', customerToken());
    expect(res.status).toBe(403);
  });
});

// ─── POST cover image (Cloudinary) ───────────────────────────────────────────

describe('POST /api/posts/:id/cover', () => {
  let cloudinary;
  beforeEach(() => {
    cloudinary = {
      uploadImage: jest
        .fn()
        .mockResolvedValue({ url: 'https://res.cloudinary.com/demo/cover.png' }),
    };
    app = createApp(db, { cloudinary });
  });

  test('200: admin uploads a cover → Cloudinary called, coverImage saved', async () => {
    db.post.findUnique.mockResolvedValue(mockPost);
    db.post.update.mockResolvedValue({
      ...mockPost,
      coverImage: 'https://res.cloudinary.com/demo/cover.png',
    });

    const res = await request(app)
      .post('/api/posts/1/cover')
      .set('Authorization', adminToken())
      .send({ image: 'data:image/png;base64,AAA' });

    expect(res.status).toBe(200);
    expect(cloudinary.uploadImage).toHaveBeenCalledWith('data:image/png;base64,AAA');
    expect(db.post.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { coverImage: 'https://res.cloudinary.com/demo/cover.png' },
    });
    expect(res.body.coverImage).toBe('https://res.cloudinary.com/demo/cover.png');
  });

  test('400: no image provided', async () => {
    db.post.findUnique.mockResolvedValue(mockPost);
    const res = await request(app)
      .post('/api/posts/1/cover')
      .set('Authorization', adminToken())
      .send({});
    expect(res.status).toBe(400);
    expect(cloudinary.uploadImage).not.toHaveBeenCalled();
  });

  test('404: post not found', async () => {
    db.post.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/posts/999/cover')
      .set('Authorization', adminToken())
      .send({ image: 'x' });
    expect(res.status).toBe(404);
  });

  test('403: customer cannot upload', async () => {
    const res = await request(app)
      .post('/api/posts/1/cover')
      .set('Authorization', customerToken())
      .send({ image: 'x' });
    expect(res.status).toBe(403);
  });
});

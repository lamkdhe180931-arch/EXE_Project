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

const mockArtist = {
  id: 1,
  name: 'Nguyễn Mực Tàu',
  slug: 'nguyen-muc-tau',
  role: 'Họa sĩ minh họa',
  city: 'TP.HCM',
  since: 2019,
  avatarUrl: '/assets/art-1.png',
  content: {
    quote: 'Tôi không vẽ để treo lên tường. Tôi vẽ để người ta mặc nó ra phố.',
    qa: [
      { id: 'cau-chuyen', q: 'Câu chuyện đằng sau?', a: 'Mình lớn lên...\n\nMực Tàu là...' },
      { id: 'ngon-ngu', q: 'Ngôn ngữ tạo hình?', a: 'Mình giới hạn...' },
      { id: 'goc-nhin', q: 'Nghệ thuật nên sống ở đâu?', a: 'Trong tủ quần áo...' },
    ],
  },
  createdAt: new Date().toISOString(),
};

// ─── GET list ────────────────────────────────────────────────────────────────

describe('GET /api/artists', () => {
  test('200: returns array of artists', async () => {
    db.artist.findMany.mockResolvedValue([mockArtist]);
    const res = await request(app).get('/api/artists');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });
});

// ─── GET detail ──────────────────────────────────────────────────────────────

describe('GET /api/artists/:slug', () => {
  test('200: returns artist with full content JSON (quote + qa[])', async () => {
    db.artist.findUnique.mockResolvedValue(mockArtist);
    const res = await request(app).get('/api/artists/nguyen-muc-tau');

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('nguyen-muc-tau');
    // content JSON block must be intact
    expect(res.body.content).toBeDefined();
    expect(res.body.content.quote).toBeTruthy();
    expect(Array.isArray(res.body.content.qa)).toBe(true);
    expect(res.body.content.qa).toHaveLength(3);
    // each qa item has id, q, a
    expect(res.body.content.qa[0]).toMatchObject({ id: expect.any(String), q: expect.any(String), a: expect.any(String) });
  });

  test('404: unknown slug', async () => {
    db.artist.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/artists/no-one');
    expect(res.status).toBe(404);
  });
});

// ─── POST create ─────────────────────────────────────────────────────────────

describe('POST /api/artists', () => {
  const validBody = {
    name: 'New Artist', slug: 'new-artist',
    role: 'Họa sĩ', city: 'Hà Nội', since: 2020,
    content: {
      quote: 'My quote',
      qa: [
        { id: 'q1', q: 'Question?', a: 'Answer.' },
        { id: 'q2', q: 'Q2?', a: 'A2.' },
        { id: 'q3', q: 'Q3?', a: 'A3.' },
      ],
    },
  };

  test('201: admin creates artist', async () => {
    db.artist.create.mockResolvedValue({ id: 2, ...validBody });
    const res = await request(app)
      .post('/api/artists')
      .set('Authorization', adminToken())
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.slug).toBe('new-artist');
  });

  test('201: fields optional — creates with only a name (slug auto-generated)', async () => {
    db.artist.create.mockResolvedValue({ id: 9, name: 'Only name', slug: 'only-name' });
    const res = await request(app)
      .post('/api/artists')
      .set('Authorization', adminToken())
      .send({ name: 'Only name' });
    expect(res.status).toBe(201);
    expect(db.artist.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: 'only-name' }) })
    );
  });

  test('201: accepts content with fewer than 3 Q&A (no longer required)', async () => {
    db.artist.create.mockResolvedValue({ id: 10, ...validBody });
    const body = { ...validBody, content: { quote: 'q', qa: [{ id: 'q1', q: 'Q?', a: 'A.' }] } };
    const res = await request(app)
      .post('/api/artists')
      .set('Authorization', adminToken())
      .send(body);
    expect(res.status).toBe(201);
    expect(db.artist.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ content: expect.objectContaining({ qa: expect.any(Array) }) }) })
    );
  });

  test('403: customer cannot create artist', async () => {
    const res = await request(app)
      .post('/api/artists')
      .set('Authorization', customerToken())
      .send(validBody);
    expect(res.status).toBe(403);
  });

  test('401: unauthenticated', async () => {
    const res = await request(app).post('/api/artists').send(validBody);
    expect(res.status).toBe(401);
  });
});

// ─── PATCH update ────────────────────────────────────────────────────────────

describe('PATCH /api/artists/:id', () => {
  test('200: admin updates artist', async () => {
    db.artist.findUnique.mockResolvedValue(mockArtist);
    db.artist.update.mockResolvedValue({ ...mockArtist, city: 'Hà Nội' });

    const res = await request(app)
      .patch('/api/artists/1')
      .set('Authorization', adminToken())
      .send({ city: 'Hà Nội' });

    expect(res.status).toBe(200);
    expect(res.body.city).toBe('Hà Nội');
  });

  test('404: artist not found', async () => {
    db.artist.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/artists/999')
      .set('Authorization', adminToken())
      .send({ city: 'Hà Nội' });
    expect(res.status).toBe(404);
  });
});

// ─── DELETE ──────────────────────────────────────────────────────────────────

describe('DELETE /api/artists/:id', () => {
  test('200: admin deletes artist', async () => {
    db.artist.findUnique.mockResolvedValue(mockArtist);
    db.artist.delete.mockResolvedValue(mockArtist);

    const res = await request(app)
      .delete('/api/artists/1')
      .set('Authorization', adminToken());

    expect(res.status).toBe(200);
    expect(db.artist.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  test('404: artist not found', async () => {
    db.artist.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .delete('/api/artists/999')
      .set('Authorization', adminToken());
    expect(res.status).toBe(404);
  });

  test('403: customer cannot delete', async () => {
    const res = await request(app)
      .delete('/api/artists/1')
      .set('Authorization', customerToken());
    expect(res.status).toBe(403);
  });
});

// ─── POST avatar (Cloudinary) ────────────────────────────────────────────────

describe('POST /api/artists/:id/avatar', () => {
  let cloudinary;
  beforeEach(() => {
    cloudinary = {
      uploadImage: jest
        .fn()
        .mockResolvedValue({ url: 'https://res.cloudinary.com/demo/a.png' }),
    };
    app = createApp(db, { cloudinary });
  });

  test('200: admin uploads an avatar → Cloudinary called, avatarUrl saved', async () => {
    db.artist.findUnique.mockResolvedValue(mockArtist);
    db.artist.update.mockResolvedValue({
      ...mockArtist,
      avatarUrl: 'https://res.cloudinary.com/demo/a.png',
    });

    const res = await request(app)
      .post('/api/artists/1/avatar')
      .set('Authorization', adminToken())
      .send({ image: 'data:image/png;base64,AAA' });

    expect(res.status).toBe(200);
    expect(cloudinary.uploadImage).toHaveBeenCalledWith('data:image/png;base64,AAA');
    expect(db.artist.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { avatarUrl: 'https://res.cloudinary.com/demo/a.png' },
    });
    expect(res.body.avatarUrl).toBe('https://res.cloudinary.com/demo/a.png');
  });

  test('400: no image provided', async () => {
    db.artist.findUnique.mockResolvedValue(mockArtist);
    const res = await request(app)
      .post('/api/artists/1/avatar')
      .set('Authorization', adminToken())
      .send({});
    expect(res.status).toBe(400);
    expect(cloudinary.uploadImage).not.toHaveBeenCalled();
  });

  test('404: artist not found', async () => {
    db.artist.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/artists/999/avatar')
      .set('Authorization', adminToken())
      .send({ image: 'x' });
    expect(res.status).toBe(404);
  });

  test('403: customer cannot upload', async () => {
    const res = await request(app)
      .post('/api/artists/1/avatar')
      .set('Authorization', customerToken())
      .send({ image: 'x' });
    expect(res.status).toBe(403);
  });
});

// ─── POST apply — public artist application ───────────────────────────────────

describe('POST /api/artists/apply', () => {
  let email;
  let applyApp;

  beforeEach(() => {
    process.env.ADMIN_EMAIL = 'admin@artdict.vn';
    email = {
      sendArtistApplication: jest.fn().mockResolvedValue({ id: 'em_app' }),
    };
    applyApp = createApp(db, { email });
  });

  const validApplication = {
    name: 'Mai',
    email: 'mai@e.com',
    city: 'Sài Gòn',
    portfolio: 'behance.net/mai',
    message: 'Mình muốn hợp tác.',
  };

  test('202: forwards a valid application to the admin inbox', async () => {
    const res = await request(applyApp)
      .post('/api/artists/apply')
      .send(validApplication);

    expect(res.status).toBe(202);
    expect(email.sendArtistApplication).toHaveBeenCalledTimes(1);
    const [adminEmail, applicant] = email.sendArtistApplication.mock.calls[0];
    expect(adminEmail).toBe('admin@artdict.vn');
    expect(applicant.name).toBe('Mai');
    expect(applicant.portfolio).toBe('behance.net/mai');
  });

  test('400: rejects when required fields are missing', async () => {
    const res = await request(applyApp)
      .post('/api/artists/apply')
      .send({ name: 'Mai' });

    expect(res.status).toBe(400);
    expect(email.sendArtistApplication).not.toHaveBeenCalled();
  });

  test('502: surfaces an email failure so the applicant can retry', async () => {
    email.sendArtistApplication.mockRejectedValue(new Error('Resend down'));
    const res = await request(applyApp)
      .post('/api/artists/apply')
      .send(validApplication);

    expect(res.status).toBe(502);
  });
});

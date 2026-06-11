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

  test('400: missing required fields', async () => {
    const res = await request(app)
      .post('/api/artists')
      .set('Authorization', adminToken())
      .send({ name: 'Only name' });
    expect(res.status).toBe(400);
  });

  test('400: content.qa must have exactly 3 items', async () => {
    const body = { ...validBody, content: { quote: 'q', qa: [{ id: 'q1', q: 'Q?', a: 'A.' }] } };
    const res = await request(app)
      .post('/api/artists')
      .set('Authorization', adminToken())
      .send(body);
    expect(res.status).toBe(400);
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

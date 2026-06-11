const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createApp } = require('../app');
const { makeMockDb } = require('./helpers/mockDb');

let app;
let db;

beforeEach(() => {
  db = makeMockDb();
  app = createApp(db);
});

// ─── Register ────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  const validBody = { email: 'test@test.com', name: 'Tester', password: 'secret123' };

  test('201: creates user, returns id/email/name (no password)', async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockResolvedValue({
      id: 1, email: 'test@test.com', name: 'Tester', role: 'CUSTOMER',
    });

    const res = await request(app).post('/api/auth/register').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, email: 'test@test.com', name: 'Tester' });
    expect(res.body.password).toBeUndefined();
    expect(res.body.passwordHash).toBeUndefined();
  });

  test('409: duplicate email', async () => {
    db.user.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com' });

    const res = await request(app).post('/api/auth/register').send(validBody);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email/i);
  });

  test('400: missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' }); // missing name + password

    expect(res.status).toBe(400);
  });

  test('400: invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', name: 'Tester', password: 'secret123' });

    expect(res.status).toBe(400);
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  const hash = bcrypt.hashSync('secret123', 10);
  const mockUser = { id: 1, email: 'test@test.com', name: 'Tester', role: 'CUSTOMER', passwordHash: hash };

  test('200: valid credentials → accessToken + httpOnly refresh cookie', async () => {
    db.user.findUnique.mockResolvedValue(mockUser);
    db.refreshToken.create.mockResolvedValue({ token: 'any' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user).toMatchObject({ id: 1, email: 'test@test.com', role: 'CUSTOMER' });
    // httpOnly cookie set
    const setCookie = res.headers['set-cookie'] || [];
    expect(setCookie.some(c => c.includes('refreshToken'))).toBe(true);
    expect(setCookie.some(c => c.toLowerCase().includes('httponly'))).toBe(true);
  });

  test('401: wrong password', async () => {
    db.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  test('401: unknown email', async () => {
    db.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'secret123' });

    expect(res.status).toBe(401);
  });
});

// ─── Refresh ─────────────────────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  const { signRefresh } = require('../lib/jwt');

  test('200: valid cookie → new accessToken', async () => {
    const token = signRefresh({ userId: 1, role: 'CUSTOMER' });
    db.refreshToken.findUnique.mockResolvedValue({
      id: 1, token, userId: 1, expiresAt: new Date(Date.now() + 1e9),
    });

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refreshToken=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  test('401: no cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });

  test('401: token not in DB (already revoked)', async () => {
    const token = signRefresh({ userId: 1, role: 'CUSTOMER' });
    db.refreshToken.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refreshToken=${token}`]);

    expect(res.status).toBe(401);
  });
});

// ─── Logout ──────────────────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  const { signRefresh } = require('../lib/jwt');

  test('200: clears cookie and revokes token', async () => {
    const token = signRefresh({ userId: 1, role: 'CUSTOMER' });
    db.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [`refreshToken=${token}`]);

    expect(res.status).toBe(200);
    // cookie should be cleared
    const setCookie = res.headers['set-cookie'] || [];
    expect(setCookie.some(c => c.includes('refreshToken=;') || c.includes('refreshToken=,'))).toBe(true);
  });

  test('200: no cookie → still 200 (idempotent)', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
  });
});

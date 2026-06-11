const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const { verifyToken, requireAdmin } = require('../middlewares/auth');
const { signAccess } = require('../lib/jwt');

// Minimal app to test middleware in isolation
function makeTestApp(middleware) {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.get('/protected', middleware, (req, res) => {
    res.json({ userId: req.user.userId, role: req.user.role });
  });
  return app;
}

describe('verifyToken middleware', () => {
  test('passes with valid Bearer token, attaches req.user', async () => {
    const token = signAccess({ userId: 42, role: 'CUSTOMER' });
    const app = makeTestApp(verifyToken);

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ userId: 42, role: 'CUSTOMER' });
  });

  test('401: no Authorization header', async () => {
    const app = makeTestApp(verifyToken);
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
  });

  test('401: malformed token', async () => {
    const app = makeTestApp(verifyToken);
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer not-a-valid-jwt');
    expect(res.status).toBe(401);
  });
});

describe('requireAdmin middleware', () => {
  function makeAdminApp() {
    const app = express();
    app.use(cookieParser());
    app.use(express.json());
    app.get('/admin', verifyToken, requireAdmin, (req, res) => {
      res.json({ ok: true });
    });
    return app;
  }

  test('passes when role is ADMIN', async () => {
    const token = signAccess({ userId: 1, role: 'ADMIN' });
    const res = await request(makeAdminApp())
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('403: CUSTOMER token on admin route', async () => {
    const token = signAccess({ userId: 2, role: 'CUSTOMER' });
    const res = await request(makeAdminApp())
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

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

// ─── GET list ────────────────────────────────────────────────────────────────

describe('GET /api/products', () => {
  const mockProducts = [
    { id: 1, name: 'Áo Artdict', slug: 'ao-artdict', price: 250000, stock: 10, category: 'ao', isActive: true, images: [] },
    { id: 2, name: 'Mũ xanh', slug: 'mu-xanh', price: 150000, stock: 5, category: 'mu', isActive: true, images: [] },
  ];

  test('200: returns array of active products', async () => {
    db.product.findMany.mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });

  test('200: filter by category', async () => {
    db.product.findMany.mockResolvedValue([mockProducts[0]]);

    const res = await request(app).get('/api/products?category=ao');

    expect(res.status).toBe(200);
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'ao' }) })
    );
  });

  test('200: filter by artistId', async () => {
    db.product.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/products?artistId=3');
    expect(res.status).toBe(200);
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ artistId: 3 }) })
    );
  });
});

// ─── GET detail ──────────────────────────────────────────────────────────────

describe('GET /api/products/:slug', () => {
  test('200: returns product with images', async () => {
    db.product.findUnique.mockResolvedValue({
      id: 1, name: 'Áo Artdict', slug: 'ao-artdict', price: 250000,
      stock: 10, category: 'ao', isActive: true,
      images: [{ id: 1, url: '/assets/ao-artdict.png', order: 0 }],
      artist: null,
    });

    const res = await request(app).get('/api/products/ao-artdict');

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('ao-artdict');
    expect(res.body.images).toHaveLength(1);
  });

  test('404: unknown slug', async () => {
    db.product.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/products/unknown-slug');
    expect(res.status).toBe(404);
  });

  test('404: inactive product', async () => {
    db.product.findUnique.mockResolvedValue({
      id: 2, slug: 'ao-artdict', isActive: false, images: [],
    });
    const res = await request(app).get('/api/products/ao-artdict');
    expect(res.status).toBe(404);
  });
});

// ─── POST create ─────────────────────────────────────────────────────────────

describe('POST /api/products', () => {
  const validBody = {
    name: 'New Product', slug: 'new-product', price: 200000,
    stock: 20, category: 'ao',
  };

  test('201: admin creates product', async () => {
    db.product.create.mockResolvedValue({ id: 3, ...validBody, isActive: true, images: [] });

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', adminToken())
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(3);
  });

  test('400: missing required fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', adminToken())
      .send({ name: 'Only name' });
    expect(res.status).toBe(400);
  });

  test('403: customer cannot create product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', customerToken())
      .send(validBody);
    expect(res.status).toBe(403);
  });

  test('401: unauthenticated', async () => {
    const res = await request(app).post('/api/products').send(validBody);
    expect(res.status).toBe(401);
  });
});

// ─── PATCH update ────────────────────────────────────────────────────────────

describe('PATCH /api/products/:id', () => {
  test('200: admin updates product', async () => {
    db.product.findUnique.mockResolvedValue({ id: 1, isActive: true });
    db.product.update.mockResolvedValue({ id: 1, name: 'Updated', price: 300000, isActive: true });

    const res = await request(app)
      .patch('/api/products/1')
      .set('Authorization', adminToken())
      .send({ name: 'Updated', price: 300000 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  test('404: product not found', async () => {
    db.product.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/products/999')
      .set('Authorization', adminToken())
      .send({ name: 'x' });

    expect(res.status).toBe(404);
  });

  test('403: customer cannot update', async () => {
    const res = await request(app)
      .patch('/api/products/1')
      .set('Authorization', customerToken())
      .send({ name: 'x' });
    expect(res.status).toBe(403);
  });
});

// ─── DELETE (soft) ───────────────────────────────────────────────────────────

describe('DELETE /api/products/:id', () => {
  test('200: admin soft-deletes product (isActive = false)', async () => {
    db.product.findUnique.mockResolvedValue({ id: 1, isActive: true });
    db.product.update.mockResolvedValue({ id: 1, isActive: false });

    const res = await request(app)
      .delete('/api/products/1')
      .set('Authorization', adminToken());

    expect(res.status).toBe(200);
    expect(db.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } })
    );
  });

  test('404: product not found', async () => {
    db.product.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .delete('/api/products/999')
      .set('Authorization', adminToken());
    expect(res.status).toBe(404);
  });

  test('403: customer cannot delete', async () => {
    const res = await request(app)
      .delete('/api/products/1')
      .set('Authorization', customerToken());
    expect(res.status).toBe(403);
  });
});

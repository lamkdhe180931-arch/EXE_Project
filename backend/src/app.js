const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const artistsRouter = require('./routes/artists');
const ordersRouter = require('./routes/orders');
const postsRouter = require('./routes/posts');

function createApp(db, deps = {}) {
  const app = express();

  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:8000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      // In development, allow any origin to support local network devices (e.g. 192.168.x.x)
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));
  // Limit raised for base64 image uploads (POST /products/:id/images) — the
  // default 100kb rejects even a small photo as 413 Payload Too Large.
  app.use(express.json({ limit: '25mb' }));
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV });
  });

  app.use('/api/auth', authRouter(db));
  app.use('/api/products', productsRouter(db, deps));
  app.use('/api/artists', artistsRouter(db, deps));
  app.use('/api/orders', ordersRouter(db, deps));
  app.use('/api/posts', postsRouter(db, deps));

  return app;
}

module.exports = { createApp };

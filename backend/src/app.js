const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const artistsRouter = require('./routes/artists');
const ordersRouter = require('./routes/orders');

function createApp(db, deps = {}) {
  const app = express();

  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV });
  });

  app.use('/api/auth', authRouter(db));
  app.use('/api/products', productsRouter(db));
  app.use('/api/artists', artistsRouter(db));
  app.use('/api/orders', ordersRouter(db, deps));

  return app;
}

module.exports = { createApp };

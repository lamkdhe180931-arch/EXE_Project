const { Router } = require('express');
const makeProductsController = require('../controllers/products');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

function productsRouter(db) {
  const router = Router();
  const { list, detail, create, update, softDelete } = makeProductsController(db);

  router.get('/', list);
  router.get('/:slug', detail);
  router.post('/', verifyToken, requireAdmin, create);
  router.patch('/:id', verifyToken, requireAdmin, update);
  router.delete('/:id', verifyToken, requireAdmin, softDelete);

  // Cloudinary upload — cần CLOUDINARY_* env vars (Phase 3 service)
  router.post('/:id/images', verifyToken, requireAdmin, (_req, res) => {
    res.status(501).json({ error: 'Cloudinary service chưa được cấu hình' });
  });

  return router;
}

module.exports = productsRouter;

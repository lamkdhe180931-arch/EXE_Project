const { Router } = require('express');
const makeProductsController = require('../controllers/products');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

function productsRouter(db, deps = {}) {
  const router = Router();
  const { list, detail, create, update, softDelete, uploadImages } =
    makeProductsController(db, deps);

  router.get('/', list);
  router.get('/:slug', detail);
  router.post('/', verifyToken, requireAdmin, create);
  router.patch('/:id', verifyToken, requireAdmin, update);
  router.delete('/:id', verifyToken, requireAdmin, softDelete);

  router.post('/:id/images', verifyToken, requireAdmin, uploadImages);

  return router;
}

module.exports = productsRouter;

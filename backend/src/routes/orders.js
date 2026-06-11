const { Router } = require('express');
const makeOrdersController = require('../controllers/orders');
const makeValidateCart = require('../middlewares/validateCart');
const {
  verifyToken,
  requireAdmin,
  optionalAuth,
} = require('../middlewares/auth');

function ordersRouter(db, deps = {}) {
  const router = Router();
  const ctrl = makeOrdersController(db, deps);
  const validateCart = makeValidateCart(db);

  router.post('/', optionalAuth, validateCart, ctrl.create);
  router.post('/momo-callback', ctrl.momoCallback);

  // `/my` must precede `/:id` so it is not captured as an id param.
  router.get('/', verifyToken, requireAdmin, ctrl.list);
  router.get('/my', verifyToken, ctrl.listMine);
  router.get('/:id', verifyToken, ctrl.detail);
  router.patch('/:id/status', verifyToken, requireAdmin, ctrl.updateStatus);

  return router;
}

module.exports = ordersRouter;

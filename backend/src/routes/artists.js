const { Router } = require('express');
const makeArtistsController = require('../controllers/artists');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

function artistsRouter(db, deps = {}) {
  const router = Router();
  const { list, detail, create, update, remove, apply, uploadAvatar } =
    makeArtistsController(db, deps);

  router.get('/', list);
  router.post('/apply', apply); // public artist application (no auth)
  router.get('/:slug', detail);
  router.post('/', verifyToken, requireAdmin, create);
  router.patch('/:id', verifyToken, requireAdmin, update);
  router.delete('/:id', verifyToken, requireAdmin, remove);
  router.post('/:id/avatar', verifyToken, requireAdmin, uploadAvatar);

  return router;
}

module.exports = artistsRouter;

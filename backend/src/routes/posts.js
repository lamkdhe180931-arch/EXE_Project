const { Router } = require('express');
const makePostsController = require('../controllers/posts');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

function postsRouter(db, deps = {}) {
  const router = Router();
  const { list, detail, create, update, remove, uploadCover } =
    makePostsController(db, deps);

  router.get('/', list);
  router.get('/:slug', detail);
  router.post('/', verifyToken, requireAdmin, create);
  router.patch('/:id', verifyToken, requireAdmin, update);
  router.delete('/:id', verifyToken, requireAdmin, remove);
  router.post('/:id/cover', verifyToken, requireAdmin, uploadCover);

  return router;
}

module.exports = postsRouter;

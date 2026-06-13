const { Router } = require('express');
const makePostsController = require('../controllers/posts');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

function postsRouter(db) {
  const router = Router();
  const { list, detail, create, update } = makePostsController(db);

  router.get('/', list);
  router.get('/:slug', detail);
  router.post('/', verifyToken, requireAdmin, create);
  router.patch('/:id', verifyToken, requireAdmin, update);

  return router;
}

module.exports = postsRouter;

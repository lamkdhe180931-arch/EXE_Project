const { Router } = require('express');
const makeAuthController = require('../controllers/auth');

function authRouter(db) {
  const router = Router();
  const { register, login, refresh, logout } = makeAuthController(db);

  router.post('/register', register);
  router.post('/login', login);
  router.post('/refresh', refresh);
  router.post('/logout', logout);

  return router;
}

module.exports = authRouter;

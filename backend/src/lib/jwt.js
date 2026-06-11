const jwt = require('jsonwebtoken');

const ACCESS_SECRET = () => process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

function signAccess(payload) {
  return jwt.sign(payload, ACCESS_SECRET(), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
}

function signRefresh(payload) {
  return jwt.sign(payload, REFRESH_SECRET(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
}

function verifyAccess(token) {
  return jwt.verify(token, ACCESS_SECRET());
}

function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET());
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };

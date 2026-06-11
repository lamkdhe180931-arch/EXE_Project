const { verifyAccess } = require('../lib/jwt');

function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token xác thực không tồn tại' });
  }

  const token = header.slice(7);
  try {
    req.user = verifyAccess(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Chỉ admin mới có quyền này' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };

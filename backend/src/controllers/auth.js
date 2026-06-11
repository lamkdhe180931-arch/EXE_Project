const bcrypt = require('bcryptjs');
const { signAccess, signRefresh, verifyRefresh } = require('../lib/jwt');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function makeAuthController(db) {
  async function register(req, res) {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'email, name và password là bắt buộc' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Email không hợp lệ' });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email đã được sử dụng' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { email, name, passwordHash, role: 'CUSTOMER' },
    });

    return res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  }

  async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email và password là bắt buộc' });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });

    const payload = { userId: user.id, role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    return res.json({
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  }

  async function refresh(req, res) {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'Refresh token không tồn tại' });

    let payload;
    try {
      payload = verifyRefresh(token);
    } catch {
      return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const stored = await db.refreshToken.findUnique({ where: { token } });
    if (!stored) return res.status(401).json({ error: 'Token đã bị thu hồi' });

    const accessToken = signAccess({ userId: payload.userId, role: payload.role });
    return res.json({ accessToken });
  }

  async function logout(req, res) {
    const token = req.cookies?.refreshToken;
    if (token) {
      await db.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });
    return res.json({ message: 'Đã đăng xuất' });
  }

  return { register, login, refresh, logout };
}

module.exports = makeAuthController;

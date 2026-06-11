# Artdict Backend — Task Tracker

## Phase 1 — Foundation ✅

- [x] `backend/` directory structure + package.json (CommonJS, Prisma 5, Jest)
- [x] `prisma/schema.prisma` — 8 models validated (`prisma generate` ✓)
- [x] `.env.example` — keys: Neon, JWT, Cloudinary, MoMo, Resend, CORS
- [x] `src/app.js` — `createApp(db)` factory pattern (testable DI)
- [x] `src/index.js` — entrypoint + Prisma singleton
- [x] `src/lib/jwt.js` — signAccess / signRefresh / verifyAccess / verifyRefresh
- [x] `src/lib/prisma.js` — Prisma client singleton
- [x] Jest setup (clearMocks, resetMocks, testPathIgnorePatterns)
- [x] `__tests__/helpers/mockDb.js` — SDK-style mock DB

---

## Phase 2 — Auth API ✅  (12 tests passing)

- [x] `POST /api/auth/register` — tạo tài khoản, hash bcrypt, 409 nếu trùng email
- [x] `POST /api/auth/login` — verify password, access token + **httpOnly refresh cookie**
- [x] `POST /api/auth/refresh` — verify cookie + DB lookup, trả access token mới
- [x] `POST /api/auth/logout` — revoke token DB + clearCookie (idempotent)
- [x] `src/middlewares/auth.js` — `verifyToken` (Bearer JWT)
- [x] `src/middlewares/auth.js` — `requireAdmin` (role check, 403)

**JWT strategy:**
- Access token: 15m, lưu memory FE
- Refresh token: 7d, httpOnly cookie + lưu DB (bảng RefreshToken)

---

## Phase 3 — Product & Artist API ✅  (29 tests passing)

### Products (16 tests)
- [x] `GET /api/products` — danh sách active, filter `?category=` và `?artistId=`
- [x] `GET /api/products/:slug` — chi tiết + images + artist, 404 nếu inactive
- [x] `POST /api/products` — tạo mới (Admin), validate required fields
- [x] `PATCH /api/products/:id` — cập nhật (Admin), 404 nếu không tìm thấy
- [x] `DELETE /api/products/:id` — soft delete `isActive=false` (Admin)
- [x] `POST /api/products/:id/images` — **upload Cloudinary** (signed REST qua `fetch`+`crypto`, không thêm dep); tạo `ProductImage` (url = `secure_url`, order = index). Cần `CLOUDINARY_*` thật khi deploy.

### Artists (13 tests)
- [x] `GET /api/artists` — danh sách
- [x] `GET /api/artists/:slug` — chi tiết với **content JSON** (`{ quote, qa[{id,q,a}] }`)
- [x] `POST /api/artists` — tạo (Admin), **validate: quote + đúng 3 qa items**
- [x] `PATCH /api/artists/:id` — cập nhật (Admin)
- [x] `DELETE /api/artists/:id` — xóa cứng (Admin)

**Artist `content` JSON schema (Prisma `Json` type):**
```json
{
  "quote": "...",
  "qa": [
    { "id": "slug-1", "q": "Câu hỏi 1?", "a": "Trả lời...\n\nĐoạn 2..." },
    { "id": "slug-2", "q": "Câu hỏi 2?", "a": "..." },
    { "id": "slug-3", "q": "Câu hỏi 3?", "a": "..." }
  ]
}
```

---

## Test Summary

| Suite | Tests | Status |
|---|---|---|
| auth.test.js | 12 | ✅ PASS |
| middleware.test.js | 5 | ✅ PASS |
| products.test.js | 16 | ✅ PASS |
| artists.test.js | 13 | ✅ PASS |
| momo.test.js | 4 | ✅ PASS |
| orders.test.js | 28 | ✅ PASS |
| cloudinary.test.js | 2 | ✅ PASS |
| email.test.js | 5 | ✅ PASS |
| **Tổng** | **90** | **✅ 90/90** |

---

## Phase 4 — Order & Checkout ✅  (31 tests passing)

### MoMo service (`src/services/momo.js`) — 4 tests
- [x] `createPayment()` — ký HMAC-SHA256, POST `/v2/gateway/api/create` qua `fetch` built-in, trả `payUrl`; throw nếu `resultCode != 0`
- [x] `verifyIpnSignature()` — xác minh chữ ký IPN, so sánh **constant-time** (`crypto.timingSafeEqual`)
- [x] Không thêm dependency — dùng `fetch` + `crypto` của Node ≥18; HTTP được mock trong test

### Orders (`src/routes/orders.js`) — 27 tests
- [x] `POST /api/orders` — **optional auth** (guest OK): validate giỏ → tạo Order `PENDING` → gọi MoMo → `{ orderId, total, momoPaymentUrl }`
- [x] `src/middlewares/validateCart.js` — kiểm tra tồn tại/active/đủ tồn kho, **snapshot `priceAtTime` từ giá server** (bỏ qua giá client), tính `total`
- [x] Guest checkout — `userId` null + bắt buộc `guestEmail`; token có-nhưng-sai → 401 (không âm thầm hạ xuống guest)
- [x] `POST /api/orders/momo-callback` — verify HMAC → `PAID` + trừ tồn kho **trong `$transaction`** + **idempotent** (IPN trùng không trừ kho 2 lần); chữ ký sai → 400; thanh toán fail → ack 204 không đổi đơn
- [x] `GET /api/orders` (Admin) · `GET /api/orders/my` (Customer) · `GET /api/orders/:id` (Admin/Owner) · `PATCH /api/orders/:id/status` (Admin)
- [x] `src/middlewares/auth.js` — thêm `optionalAuth`; `src/app.js` — `createApp(db, deps)` để inject `momo`

> Trừ tồn kho khi callback `PAID` (theo plan flow). **Email xác nhận (Resend): đã nối vào callback** (best-effort — xem Phase 6). Phí ship & tra cứu đơn guest bằng email+mã: open question, hoãn.

## Phase 5 — Content API ⏳
- News / Journal CRUD

## Phase 6 — Email 🔄 (một phần)
- [x] Resend integration (`src/services/email.js`, `fetch`, không thêm dep) — 5 tests
- [x] Order Confirmation — gửi khi MoMo callback `PAID` (best-effort, không chặn ack); recipient = `guestEmail` || `user.email`
- [ ] Template Order Shipped, Artist Application

## Phase 7 — Admin Panel HTML ⏳
- Dashboard CRUD UI

---

## Còn lại từ Phase 3
- [x] `POST /api/products/:id/images` — Cloudinary upload ✅ (cần `CLOUDINARY_*` env khi deploy)

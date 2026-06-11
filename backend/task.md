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
- [ ] `POST /api/products/:id/images` — **stub 501** — chờ Cloudinary service (Phase 3 còn lại)

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
| **Tổng** | **46** | **✅ 46/46** |

---

## Phase 4 — Order & Checkout ⏳ (chưa bắt đầu)
- MoMo payment integration
- Guest checkout flow
- Order status management

## Phase 5 — Content API ⏳
- News / Journal CRUD

## Phase 6 — Email ⏳
- Resend integration
- Order confirmation template

## Phase 7 — Admin Panel HTML ⏳
- Dashboard CRUD UI

---

## Còn lại từ Phase 3
- [ ] `POST /api/products/:id/images` — Cloudinary upload (cần `CLOUDINARY_*` env)

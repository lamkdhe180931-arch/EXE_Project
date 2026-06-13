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

## Phase 3 — Product & Artist API ✅  (32 tests passing)

### Products (16 tests)
- [x] `GET /api/products` — danh sách active, filter `?category=` và `?artistId=`
- [x] `GET /api/products/:slug` — chi tiết + images + artist, 404 nếu inactive
- [x] `POST /api/products` — tạo mới (Admin), validate required fields
- [x] `PATCH /api/products/:id` — cập nhật (Admin), 404 nếu không tìm thấy
- [x] `DELETE /api/products/:id` — soft delete `isActive=false` (Admin)
- [x] `POST /api/products/:id/images` — **upload Cloudinary** (signed REST qua `fetch`+`crypto`, không thêm dep); tạo `ProductImage` (url = `secure_url`, order = index). Cần `CLOUDINARY_*` thật khi deploy.

### Artists (16 tests)
- [x] `GET /api/artists` — danh sách
- [x] `GET /api/artists/:slug` — chi tiết với **content JSON** (`{ quote, qa[{id,q,a}] }`)
- [x] `POST /api/artists` — tạo (Admin), **validate: quote + đúng 3 qa items**
- [x] `PATCH /api/artists/:id` — cập nhật (Admin)
- [x] `DELETE /api/artists/:id` — xóa cứng (Admin)
- [x] `POST /api/artists/apply` (public) — ứng tuyển nghệ sĩ → email admin (Phase 6, xem dưới)

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
| artists.test.js | 16 | ✅ PASS |
| momo.test.js | 4 | ✅ PASS |
| orders.test.js | 32 | ✅ PASS |
| cloudinary.test.js | 2 | ✅ PASS |
| email.test.js | 8 | ✅ PASS |
| posts.test.js | 13 | ✅ PASS |
| **Tổng** | **113** | **✅ 113/113** |

> Ngoài ra: `admin/__tests__/core.test.js` — **14 tests** logic thuần admin (decodeJwt/isTokenValid/getRole/buildArtistPayload/nextStatuses), chạy bằng Jest riêng trong `admin/` (`cd admin && npm test`).

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

> Trừ tồn kho khi callback `PAID` (theo plan flow). **Email xác nhận (Resend): đã nối vào callback** (best-effort — xem Phase 6).
> **Chốt open question:** phí ship = miễn phí toàn bộ (`total` = tiền hàng, không thêm cột `shippingFee`); không làm tra cứu đơn guest (chỉ email xác nhận).

## Phase 5 — Content API ✅  (13 tests passing)
- [x] `GET /api/posts` — danh sách, filter `?type=NEWS|JOURNAL` (400 nếu type sai), mới nhất trước
- [x] `GET /api/posts/:slug` — chi tiết, 404 nếu không có
- [x] `POST /api/posts` (Admin) — validate `type/title/slug/body`, `type ∈ {NEWS,JOURNAL}`; `publishedAt` optional (null = nháp)
- [x] `PATCH /api/posts/:id` (Admin) — cập nhật, 404 nếu không có
- [x] `src/controllers/posts.js` + `src/routes/posts.js` + wire `src/app.js`

## Phase 6 — Email ✅ (3 template + wiring xong)
- [x] Resend integration (`src/services/email.js`) — 8 tests, mock `jest.mock('resend')`
  > **Đổi quyết định (2026-06-11):** chuyển từ `fetch` thuần sang **SDK `resend`** (thêm dep `resend@^6`) theo yêu cầu chủ dự án. Ghi đè quyết định "không thêm dep" trước đó cho service email.
- [x] Order Confirmation — gửi khi MoMo callback `PAID` (best-effort, không chặn ack); recipient = `guestEmail` || `user.email`
- [x] Order Shipped — gửi khi Admin `PATCH /orders/:id/status` → `SHIPPED` (best-effort; chỉ gửi khi **chuyển sang** SHIPPED, không gửi lại nếu đã SHIPPED)
- [x] Artist Application — `sendArtistApplication(adminEmail, applicant)` (escape HTML input, `replyTo` = email ứng viên)
- [x] `POST /api/artists/apply` (public) — nhận form ứng tuyển nghệ sĩ → gửi tới `ADMIN_EMAIL`; validate `name/email/portfolio`; **502 nếu gửi mail lỗi** (không lưu DB nên không nuốt lỗi — để ứng viên gửi lại). Cần `ADMIN_EMAIL` env khi deploy.
  > FE: `pages/submit.html` hiện là `mailto:` — có thể đổi sang POST endpoint này sau (frontend, ngoài phạm vi backend).

## Phase 7 — Admin Panel HTML ✅
Thư mục `admin/` (ngang hàng `backend/`), HTML/CSS/JS thuần. Logic thuần tách ra `admin/js/core.js` (14 tests).

- [x] `admin/login.html` + `js/login.js` — login `POST /api/auth/login`, lưu `accessToken` vào localStorage; **chặn non-ADMIN** dù đúng mật khẩu
- [x] `admin/js/auth.js` — `guard()` (token hết hạn/không phải ADMIN → redirect `login.html`); `api()` gắn `Authorization: Bearer`, gặp 401 → clear + về login; render sidebar dùng chung; `esc()` chống XSS
- [x] `admin/js/core.js` — `decodeJwt` · `isTokenValid(exp)` · `getRole` · `buildArtistPayload` · `nextStatuses` (đã test, 14)
- [x] `admin/index.html` — dashboard (doanh thu PAID+, tổng đơn, đơn chờ, tồn thấp) + đơn gần đây
- [x] `admin/products.html` — list + form tạo: **chọn Artist** (fetch `/api/artists`) + **upload ảnh** (file → dataURL → `POST /products/:id/images {images:[]}`); ẩn (soft-delete)
- [x] `admin/orders.html` — list + dropdown đổi status (theo `nextStatuses`) → `PATCH /orders/:id/status`
- [x] `admin/artists.html` — form **3 block Q&A cố định** → `buildArtistPayload` → `{ quote, qa:[{id,q,a}] }` → `POST /api/artists`; list + xóa
- [x] `admin/posts.html` — list + viết bài NEWS/JOURNAL → `POST /api/posts` (nối Phase 5)

> **Ghi chú / loose ends Phase 7:**
> - **CORS:** backend chỉ allow `FRONTEND_URL` (mặc định `http://localhost:8000`). Để panel chạy: serve cả repo qua 1 static server tại `:8000` rồi mở `http://localhost:8000/admin/login.html` (cùng origin → CORS ok). Khi deploy: set `FRONTEND_URL`/CORS cho đúng origin admin.
> - **Tài tài khoản ADMIN:** chạy `npm run db:seed` (cần `ADMIN_EMAIL`+`ADMIN_PASSWORD`+DB thật) — xem `backend/prisma/seed.js`.
> - **Test harness admin:** thêm Jest cục bộ trong `admin/` (lệch quy tắc "no toolchain" của site công khai, nhưng đã được chốt — chỉ test logic thuần, không build site).
> - **Animation rule:** admin là dashboard nội bộ → cố ý tĩnh (rule scroll-animation áp cho trang showcase công khai, không phải admin). Responsive mobile có (sidebar xếp ngang < 768px).
> - Danh sách sản phẩm admin chỉ hiện `isActive` (API lọc) — sản phẩm đã ẩn không hiện lại.

---

## Còn lại từ Phase 3
- [x] `POST /api/products/:id/images` — Cloudinary upload ✅ (cần `CLOUDINARY_*` env khi deploy)

# CLAUDE.md — Artdict
Hướng dẫn cho Claude. **Đọc rules trong `.claude/rules/` TRƯỚC khi code.**

| Rule | Chủ đề |
|---|---|
| `mandatory-rules.md` | 3 quy tắc bắt buộc (screenshot + mobile + animation) |
| `project-overview.md`| Artdict: định vị, khán giả, nguồn cảm hứng |
| `tech-stack.md` | HTML/CSS/JS + GSAP, cấu trúc thư mục |
| `design-workflow.md` | Image-first, dials, checklist build/sửa |
| `brand-identity.md` | Brand DNA (màu, typography, micro-animation) |
| `design-discipline.md`| Anti-slop (hero, eyebrow, layout, copy) |
| `typography.md` | Editorial Typography (1 font hiển thị) |
| `accessibility-performance.md`| A11y & hiệu suất (ảnh, fonts) |
| `assets.md` | Kho tài sản `assets/` |
| `coding-discipline.md`| Suy nghĩ trước, code đơn giản, hướng mục tiêu |

## Imports
@.claude/rules/mandatory-rules.md
@.claude/rules/project-overview.md
@.claude/rules/tech-stack.md
@.claude/rules/design-workflow.md
@.claude/rules/brand-identity.md
@.claude/rules/design-discipline.md
@.claude/rules/typography.md
@.claude/rules/accessibility-performance.md
@.claude/rules/assets.md
@.claude/rules/coding-discipline.md

---

# Tiến độ dự án
*Cập nhật: 2026-06-13*

## 1. Frontend (`/`)
- **Hoàn thành**: `index.html`, components, `catalogue.html`, `collection.html`, `about.html`, `submit.html`, `artists.html`, `artist.html`, `product.html`. Tất cả đã dùng **ảnh thật**. Hợp nhất `style.css`.
- **Tồn đọng**:
  - `collab.html`, `news.html`, `journal.html`, `size-guide.html` còn là stub "coming soon".
  - `submit.html` vẫn là `mailto:` — chưa nối vào `POST /api/artists/apply` (tùy chọn, ngoài phạm vi backend).
- **Đã kiểm tra** (`node shot.js`, desktop 1440 + mobile 390): các trang chính render đúng, không vỡ layout mobile; `.reveal` hiển thị đúng ở chế độ reduced-motion. Logic đổi ảnh gallery (`data-full`) đã nối — chưa click-test live trên trình duyệt.

## 2. Backend (`backend/`) — **CODE XONG HẾT (Phase 1-7)**
**Stack**: Node + Express 5 + Prisma 5.22 + Postgres (Neon). TDD Jest. **Test: 113/113 PASS** (+ admin 14 test logic thuần).

- **Hoàn thành**: Setup · Auth (15m access, 7d refresh httpOnly) · Products & Artists CRUD · **Order & Checkout + MoMo** (`POST /orders` optional auth/guest, `validateCart` snapshot `priceAtTime` từ giá server, IPN `momo-callback`: verify HMAC → `PAID` → trừ kho `$transaction`, idempotent) · **upload ảnh Cloudinary** (`POST /products/:id/images`) · **Email Resend** (3 template: Order Confirmation nối callback PAID, Order Shipped nối `PATCH status→SHIPPED`, Artist Application qua `POST /api/artists/apply`) · **Content/Posts API** (`/api/posts` NEWS/JOURNAL) · **seed admin** (`npm run db:seed`).
  > Email đổi từ `fetch` thuần → **SDK `resend`** (thêm dep `resend@^6`, theo yêu cầu chủ dự án — ghi đè quyết định "no dep" cũ cho email).
- **Admin Panel** (`admin/`, ngang hàng `backend/`): HTML/CSS/JS thuần. login + dashboard + products (artist picker + upload ảnh) + orders (đổi status) + artists (3 block Q&A) + posts. Logic thuần ở `admin/js/core.js` (14 test). **Cố ý tĩnh** (rule animation áp cho trang showcase công khai, không phải dashboard nội bộ).

- **Tồn đọng (chỉ còn cấu hình + chạy thật — KHÔNG còn việc code):**
  - **Chưa tạo `backend/.env`** (chứa secret thật → user tự điền, xem hướng dẫn dưới). Đã có `.env.example`.
  - **Chưa migrate DB**: cần `DATABASE_URL` Neon thật → `npm run db:migrate` (schema đã `prisma validate` ✓).
  - **Chưa seed admin**: cần `ADMIN_EMAIL`+`ADMIN_PASSWORD` → `npm run db:seed`.
  - Credential bên thứ 3 (chỉ cần khi dùng tính năng đó): `CLOUDINARY_*` (upload ảnh) · `MOMO_*` (thanh toán) · `RESEND_API_KEY`+`EMAIL_FROM` (email). **E2E tạo Product+Post KHÔNG cần các key này** — chỉ cần `DATABASE_URL` + `JWT_*` + admin seed.
  - **Chưa commit git** — đang ở branch `feature/artdict-ui`, nhiều file mới chưa add.

- **Quyết định chốt** (2026-06-11): phí ship = **miễn phí toàn bộ** (total = tiền hàng, không cột `shippingFee`); tra cứu đơn guest = **không làm** (khách chỉ nhận email xác nhận).

---

# Hướng dẫn setup môi trường để chạy thật

> Thứ tự: điền `.env` → cài dep → generate client → migrate DB → seed admin → chạy 2 server → mở admin.

## Bước 1 — Tạo `backend/.env` (user tự điền secret)
Copy `backend/.env.example` → `backend/.env`. Tối thiểu cho E2E (tạo Product+Post):
```
DATABASE_URL="<chuỗi Neon: Dashboard neon.tech → Connection string, có ?sslmode=require>"
JWT_ACCESS_SECRET="<random 1>"
JWT_REFRESH_SECRET="<random 2>"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:8000"
ADMIN_EMAIL="admin@artdict.vn"
ADMIN_PASSWORD="<mật khẩu admin mạnh>"
```
Sinh JWT secret (chạy 2 lần, dán vào 2 dòng trên):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Tính năng bên thứ 3 (điền khi cần): `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET/FOLDER` · `RESEND_API_KEY`+`EMAIL_FROM` · `MOMO_PARTNER_CODE/ACCESS_KEY/SECRET_KEY/ENDPOINT/REDIRECT_URL/IPN_URL`. MoMo sandbox công khai: `PARTNER_CODE=MOMO`, `ACCESS_KEY=F8BBA842ECF85`, `SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz`, `ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create`.

## Bước 2 — Cài + migrate + seed (trong `backend/`)
```bash
cd backend
npm install
npm run db:generate     # prisma generate
npm run db:migrate       # prisma migrate dev — đặt tên "init"
npm run db:seed          # tạo tài khoản ADMIN từ .env
```

## Bước 3 — Chạy E2E local (2 cửa sổ terminal)
```bash
# Terminal 1 — backend API :3000
cd backend && npm run dev

# Terminal 2 — static server :8000 tại GỐC repo (frontend + admin cùng origin)
python -m http.server 8000
```
Mở **http://localhost:8000/admin/login.html** → login bằng `ADMIN_EMAIL`/`ADMIN_PASSWORD` → tạo 1 Product + 1 Post.

> **CORS bắt buộc**: backend chỉ allow origin `FRONTEND_URL` (`http://localhost:8000`). Phải serve admin qua `:8000`, **không** mở `file://`. Gọi sang `:3000` là cross-origin nhưng đã được allow.



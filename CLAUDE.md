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
*Cập nhật: 2026-06-14*

## 1. Frontend công khai (`/`)
- **Hoàn thành (giao diện)**: `index.html`, components, `catalogue.html`, `collection.html`, `about.html`, `submit.html`, `artists.html`, `artist.html`, `product.html`. Tất cả dùng **ảnh thật**, `style.css` hợp nhất.
- **Nối API (đang làm — mục A):** ✅ **Sản phẩm đã nối** (`catalogue.html` + `product.html` fetch `/api/products` qua `js/api.js` + `js/catalogue.js` + `js/product.js`; `artdict.js` thêm `rescan()` để bind tilt/reveal/filter/gallery/add-to-cart cho card render động). ⏳ **Còn TĨNH (hardcode)**: nghệ sĩ (`artists`/`artist`), bài viết (`news`/`journal`), ứng tuyển (`submit` vẫn `mailto:`), giỏ hàng/checkout. (Admin panel đã nối API đầy đủ từ trước.)
- **Tồn đọng giao diện**:
  - `collab.html`, `news.html`, `journal.html`, `size-guide.html` còn là stub "coming soon" (48 dòng/file).
  - `submit.html` vẫn là `mailto:artist@artdict.vn` — chưa nối `POST /api/artists/apply`.
- **Đã kiểm tra** (`node shot.js`, desktop 1440 + mobile 390): các trang chính render đúng, không vỡ layout mobile; `.reveal` hiển thị đúng ở chế độ reduced-motion. Logic đổi ảnh gallery (`data-full`) đã nối — chưa click-test live trên trình duyệt.

## 2. Backend (`backend/`) — **CODE XONG HẾT (Phase 1-7)**
**Stack**: Node + Express 5 + Prisma 5.22 + Postgres (Neon). TDD Jest. **Test: 113/113 PASS** (+ admin 14 test logic thuần).

- **Hoàn thành**: Setup · Auth (15m access, 7d refresh httpOnly) · Products & Artists CRUD · **Order & Checkout + MoMo** (`POST /orders` optional auth/guest, `validateCart` snapshot `priceAtTime` từ giá server, IPN `momo-callback`: verify HMAC → `PAID` → trừ kho `$transaction`, idempotent) · **upload ảnh Cloudinary** (`POST /products/:id/images`) · **Email Resend** (3 template: Order Confirmation nối callback PAID, Order Shipped nối `PATCH status→SHIPPED`, Artist Application qua `POST /api/artists/apply`) · **Content/Posts API** (`/api/posts` NEWS/JOURNAL) · **seed admin** (`npm run db:seed`).
  > Email đổi từ `fetch` thuần → **SDK `resend`** (thêm dep `resend@^6`, theo yêu cầu chủ dự án — ghi đè quyết định "no dep" cũ cho email).
- **Admin Panel** (`admin/`, ngang hàng `backend/`): HTML/CSS/JS thuần. login + dashboard + products (artist picker + upload ảnh) + orders (đổi status) + artists (3 block Q&A) + posts. Logic thuần ở `admin/js/core.js` (14 test). **Cố ý tĩnh** (rule animation áp cho trang showcase công khai, không phải dashboard nội bộ).

- **Trạng thái chạy thật (2026-06-14): ĐÃ CHẠY E2E TRÊN NEON ✓ — hết tồn đọng BE bắt buộc.**
  - `backend/.env` đã tạo (JWT secret sinh sẵn; `DATABASE_URL` Neon thật). DB đã `db:migrate` (migration `init` đã commit) + `db:seed` (admin `admin@artdict.vn`). 127/127 test pass; `prisma validate` ✓.
  - **E2E verified** bằng smoke test: boot app → login admin → tạo + list Product & Post → POST khi chưa auth bị `401` → đã dọn sạch row test (DB chỉ còn admin user).
  - Toàn bộ Phase 1-7 + admin + migration **đã commit** lên `feature/artdict-ui` (chưa push).
  - Credential bên thứ 3 vẫn rỗng (chỉ cần khi bật tính năng đó): `CLOUDINARY_*` (upload ảnh) · `MOMO_*` (thanh toán) · `RESEND_API_KEY`+`EMAIL_FROM` (email). Backend chạy bình thường không cần các key này.

- **Quyết định chốt** (2026-06-11): phí ship = **miễn phí toàn bộ** (total = tiền hàng, không cột `shippingFee`); tra cứu đơn guest = **không làm** (khách chỉ nhận email xác nhận).

---

# Kế hoạch tiếp theo
*Ưu tiên A → D. Backend đã xong & chạy thật — phần lớn việc còn lại là **nối frontend công khai vào API** rồi đưa lên production.*

## A. Nối frontend công khai vào API (ưu tiên cao nhất)
Hiện chỉ admin tiêu thụ API; trang công khai vẫn hardcode. Làm lần lượt, mỗi bước có cách kiểm chứng:
1. ✅ **Sản phẩm (XONG 2026-06-14)** — `catalogue.html` + `product.html` fetch `GET /api/products` (+ `/:slug`). Đã verify bằng screenshot (desktop+mobile) với 6 SP demo trên Neon: catalogue render đúng + filter/đếm theo `category` slug + sold-out + placeholder khi thiếu ảnh; product có gallery/giá/related động, size chỉ hiện cho `aothun`, sold-out disable nút, slug sai → trang 404. **Taxonomy đã chốt**: 8 slug cố định (`aothun/mu/vongtay/sotay/nhandan/mockhoa/tranh/khac`), ô category ở admin đổi `input`→`select`. **Map slug→nhãn** ở `js/api.js` (`ArtdictAPI.CATEGORIES`) là nguồn chung.
   > **Giới hạn còn lại** (model `Product` thiếu field): trang product dùng **lede generic** + accordion "chất liệu/bảo quản" **tĩnh** (vd trang sổ tay vẫn ghi "Cotton 250gsm" — sai). Muốn đúng từng SP cần thêm field `description`/`details` (+ `oldPrice` nếu muốn hiện giảm giá) vào schema → migration BE.
2. **Nghệ sĩ** — `artists.html` + `artist.html` fetch `GET /api/artists` (+ `/:slug`). → *kiểm*: danh sách khớp DB.
3. **Bài viết** — dựng `news.html` / `journal.html` từ stub, fetch `GET /api/posts?type=NEWS|JOURNAL` (+ `/:slug`). → *kiểm*: post tạo ở admin hiện ra.
4. **Ứng tuyển** — `submit.html`: đổi `mailto:` → form `POST /api/artists/apply`. → *kiểm*: submit tạo log/email ở backend.
5. **Giỏ hàng + checkout** — UI giỏ → `POST /api/orders` → redirect MoMo → trang `payment/return`. → *kiểm*: 1 đơn sandbox chạy hết luồng → IPN `momo-callback` đẩy đơn sang `PAID`.

> **CORS**: frontend gọi API phải nằm trong origin được allow. Local đã allow `:8000`; khi deploy phải set `FRONTEND_URL` = domain thật.

## B. Hoàn thiện trang còn stub
Sau khi A.3 nối xong `news`/`journal`, còn `collab.html` + `size-guide.html` — dựng nội dung thật theo `design-discipline.md` + `mandatory-rules.md` (animation scroll + mobile + screenshot đối chiếu).

## C. Bật tính năng bên thứ 3 (điền key vào `backend/.env` — xem Bước 1)
- **Cloudinary** (`CLOUDINARY_*`) — upload ảnh sản phẩm thật từ admin (`POST /products/:id/images`).
- **MoMo** (`MOMO_*`) — dùng sandbox công khai (key sẵn ở Bước 1) để test thanh toán thật.
- **Resend** (`RESEND_API_KEY` + domain đã verify ở `EMAIL_FROM`) — gửi email xác nhận / đã gửi hàng / ứng tuyển.

## D. Cứng hoá & deploy
1. **Đổi `ADMIN_PASSWORD`** (đang là dev pw yếu `123`) → mật khẩu mạnh, rồi `npm run db:seed` lại (upsert idempotent).
2. **Push** `feature/artdict-ui` lên remote (**đang còn 5 commit chưa push**) → mở PR vào `main`.
3. **Deploy**: BE (Render/Railway/Fly) + DB Neon (đã có) + FE static (Netlify/Vercel/Cloudflare Pages). Set env production — đặc biệt `FRONTEND_URL`, `DATABASE_URL`, JWT secret, và các key mục C.

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
>
> **Tránh lỗi 404 "File not found"**: `python -m http.server 8000` phải chạy **ngay tại gốc repo** (`c:\Users\Admin\Desktop\Adddirct`), KHÔNG trong `backend/`, KHÔNG `cd ..` ra `Desktop/`. Dùng đường dẫn tuyệt đối cho chắc: `cd C:\Users\Admin\Desktop\Adddirct` rồi mới chạy. Kiểm tra đúng chỗ: mở `http://localhost:8000/` thấy trang chủ Artdict (hoặc listing có `admin/ assets/ css/`).



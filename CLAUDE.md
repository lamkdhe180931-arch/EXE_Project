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
*Cập nhật: 2026-06-15*

## 1. Frontend công khai (`/`)
- **Hoàn thành (giao diện)**: `index.html`, components, `catalogue.html`, `collection.html`, `about.html`, `submit.html`, `artists.html`, `artist.html`, `product.html`. Tất cả dùng **ảnh thật**, `style.css` hợp nhất.
- **Nối API (đang làm — mục A):** ✅ **Sản phẩm** (`catalogue`/`product` ← `/api/products`) + ✅ **Nghệ sĩ** (`artists`/`artist` ← `/api/artists`, works qua `?artistId=`) + ✅ **Bài viết** (`news`/`journal`/`post` ← `/api/posts`) + ✅ **Giỏ hàng + Checkout** (`checkout`/`payment-return` ← `POST /api/orders` → MoMo) + ✅ **Trang chủ** (`index.html` lưới "đang mở bán" ← `/api/products`, teaser 6 SP, slug thật) đã nối, qua `js/api.js` (giờ có cả `post()`) + page script riêng (`catalogue/product/artists/artist/posts/post/checkout/payment-return/index.js`); `artdict.js` thêm `rescan()` (bind tilt/reveal/filter/gallery/add-to-cart cho DOM động) + nối nút "Thanh toán" + `clearCart` + modal **size guide** (product áo thun). ⏳ **Còn TĨNH (hardcode)**: chỉ còn ứng tuyển (`submit` cố ý giữ `mailto:` — chủ dự án chốt chỉ hiện Gmail nhận CV/portfolio, KHÔNG nối `POST /api/artists/apply`). (Admin panel đã nối API đầy đủ từ trước.)
  > **index.html nạp cả `main.js` (GSAP cho hero/manifesto/craft/stats, dùng `[data-reveal]`/`.tilt`) lẫn `artdict.js` + `api.js` + `index.js`.** Thẻ SP động dùng convention của artdict (`.reveal`/`[data-tilt]`/`data-add`) + `Artdict.rescan` → không đụng main.js. *Lưu ý*: stats `48/12/3k+` vẫn là **số mẫu** (chưa nối; "đơn giao" không có API công khai).
- **Tồn đọng giao diện**:
  - `collab.html` còn là stub "coming soon" (chủ dự án bảo **tạm để đó**).
  - `size-guide.html`: nội dung size đã chuyển vào **modal trong `product.html`** (chỉ hiện cho áo thun); file stub đứng riêng giờ **mồ côi** (không link từ đâu, chưa xoá). Số đo trong bảng là **tham khảo** — chờ số thật.
  - `submit.html` cố ý giữ `mailto:` (placeholder `artist@artdict.vn`, **chờ chủ dự án cho Gmail thật** để thay 3 chỗ: link/chữ/nút copy). KHÔNG nối API.
- **Đã kiểm tra** (`node shot.js`, desktop 1440 + mobile 390): các trang chính render đúng, không vỡ layout mobile; `.reveal` hiển thị đúng ở chế độ reduced-motion. Logic đổi ảnh gallery (`data-full`) đã nối — chưa click-test live trên trình duyệt.

## 2. Backend (`backend/`) — **CODE XONG HẾT (Phase 1-7)**
**Stack**: Node + Express 5 + Prisma 5.22 + Postgres (Neon). TDD Jest. **Test: 126/126 PASS** (+ admin 19 test logic thuần = 145). Migration: `init` + `add_product_description` + `add_post_cover_image`. `Product.description` (nullable) đã thêm khi làm A.1 (migration `add_product_description`).

- **Hoàn thành**: Setup · Auth (15m access, 7d refresh httpOnly) · Products & Artists CRUD · **Order & Checkout + MoMo** (`POST /orders` optional auth/guest, `validateCart` snapshot `priceAtTime` từ giá server, IPN `momo-callback`: verify HMAC → `PAID` → trừ kho `$transaction`, idempotent) · **upload ảnh Cloudinary** (`POST /products/:id/images`) · **Email Resend** (3 template: Order Confirmation nối callback PAID, Order Shipped nối `PATCH status→SHIPPED`, Artist Application qua `POST /api/artists/apply`) · **Content/Posts API** (`/api/posts` NEWS/JOURNAL) · **seed admin** (`npm run db:seed`).
  > Email đổi từ `fetch` thuần → **SDK `resend`** (thêm dep `resend@^6`, theo yêu cầu chủ dự án — ghi đè quyết định "no dep" cũ cho email).
  > **Fix upload ảnh (2026-06-15)**: `app.js` nâng `express.json({ limit: '25mb' })` (mặc định 100kb → ảnh base64 bị **413 Payload Too Large**). `cloudinary.js` thêm **fallback dev**: chưa có `CLOUDINARY_*` → lưu thẳng data URL/URL vào DB (test local không cần key); có key → upload CDN thật. *(app.js cũng mang sẵn 1 thay đổi CORS cho phép biến thể `localhost`/`127.0.0.1`.)*
- **Admin Panel** (`admin/`, ngang hàng `backend/`): HTML/CSS/JS thuần. login + dashboard + products (artist picker + upload ảnh) + orders (đổi status) + artists (3 block Q&A) + posts. **CRUD đầy đủ**: tạo + **sửa** (nút "Sửa" mỗi dòng tái dùng form tạo, đổi sang chế độ cập nhật → `PATCH /:id`) + xóa (products soft-delete, artists xóa, **posts xóa** — xem dưới). `auth.js` fetch dùng `cache:'no-store'` để list refresh đúng sau mutate. Logic thuần ở `admin/js/core.js` (14 test). **Cố ý tĩnh** (rule animation áp cho trang showcase công khai, không phải dashboard nội bộ).
  > **Hoàn thiện CRUD bài viết (2026-06-15)**: thêm `DELETE /api/posts/:id` (BE: controller `remove` + route, hard-delete, mirror artists; +3 test) + nút **"Xóa"** mỗi dòng + nút **toggle trạng thái nhanh "Đăng"/"Ẩn"** (PATCH `publishedAt` null↔now ngay trên dòng, không cần mở form Sửa). Verify E2E: tạo bài throwaway → click Đăng (publishedAt set) → click Xóa (GET 404). *Lưu ý*: nút "Sửa" của posts & artists **đã có sẵn từ trước** (commit `e53cd3e`) — nếu admin không thấy là do **trình duyệt cache bản cũ**, hard-refresh `Ctrl+Shift+R`.
  > **Upload avatar nghệ sĩ + nút xóa sản phẩm + phân trang (2026-06-15)**:
  > • **Avatar nghệ sĩ từ máy**: thêm `POST /api/artists/:id/avatar` (BE: controller `uploadAvatar` qua Cloudinary, set `avatarUrl`; +4 test) + form nghệ sĩ thêm `<input type=file>` (FileReader→data URL, upload sau khi lưu artist, mirror flow ảnh sản phẩm). Verify E2E: upload PNG thật → URL Cloudinary CDN trả về + lưu vào DB.
  > • **Nút xóa sản phẩm**: products vốn ĐÃ có nút xóa nhưng nhãn "Ẩn" (soft-delete) → đổi nhãn thành **"Xóa"** cho khớp posts/artists (giữ soft-delete vì order tham chiếu product, xóa cứng vỡ FK).
  > • **Phân trang admin (10 dòng/trang)**: client-side cho cả 4 list (products/posts/artists/orders) qua helper chung `Admin.makePager` (auth.js) + logic thuần `AdminCore.pageCount/clampPage/pageSlice` (core.js, +5 test); thanh "← Trước · Trang x/y · N dòng · Sau →" tự ẩn khi ≤1 trang. `loaded` giữ full list (edit/delete lookup theo id chạy xuyên trang). Verify E2E: 16 post → trang 1 = 10 dòng, trang 2 = 6, Trước/Sau OK, không lỗi console.
  > **Ảnh bìa bài viết + tinh chỉnh FE công khai (2026-06-15)**:
  > • **`Post.coverImage` (nullable)**: migration `add_post_cover_image`; `posts` controller create/update nhận `coverImage` + `POST /api/posts/:id/cover` (Cloudinary, mirror artist avatar; +5 test). Admin posts form thêm ô URL + file picker (upload sau khi lưu). `post.html` (công khai) render `<figure class="post-read__cover">` nếu có ảnh (qua `js/post.js`). Verify E2E: PATCH cover demo → ảnh hiện; create với coverImage → lưu OK.
  > • **`post.html` tiêu đề 1 dòng**: `.post-read__title` bỏ `max-width:16ch` → `white-space:nowrap` + font clamp(1.8–3.4rem); mobile ≤700px revert `normal` (tránh tràn ngang).
  > • **`submit.html` hero 1 dòng**: bỏ `max-width:22ch` ở `.sub-hero`, `.sub-hero__title` font clamp(2–4.4rem) + `nowrap`; mobile ≤560px revert `normal`.
  > • **Footer gap + artist quote/drop-cap (2026-06-15)**: `main.wrap { padding-bottom: clamp(72px,9vw,130px) }` → nội dung mọi trang `pages/` (catalogue/product/…) tách khỏi footer (trước đây dán sát). `artist.html` pull-quote (`.iv-banner .pull-quote`) căn giữa + `max-width:38ch` (~2 dòng) + by-line center; drop-cap `.lead-letter` nhỏ 50% (`calc(var(--fs-display-lg)*0.5)`). Verify screenshot desktop.
  > • **`artists.html` (công khai) phân trang 5 tác giả/trang** (client-side trong `js/artists.js`, thanh `.list-pager` ← Trước/Sau, số thứ tự chân dung liên tục giữa trang) + **ảnh đồng nhất 1 size, nhỏ ~30%**: `.artist-row` cột ảnh CỐ ĐỊNH `clamp(200px,26vw,350px)` (không phải `fr`) đặt ảnh/chữ bằng `grid-column` thay vì `order` — sửa lỗi ảnh **to/nhỏ xen kẽ** (hàng chẵn `order:2` trước đây làm ảnh rơi vào cột rộng). Verify: cả 4 portrait đều 350×438, mobile 1 cột không tràn ngang.

- **Trạng thái chạy thật (2026-06-15): ĐÃ CHẠY E2E TRÊN NEON ✓ — hết tồn đọng BE bắt buộc.**
  - `backend/.env` đã tạo (JWT secret sinh sẵn; `DATABASE_URL` Neon thật). DB đã `db:migrate` (2 migration: `init` + `add_product_description`, đã commit) + `db:seed` (admin `admin@artdict.vn`). 128/128 test pass; `prisma validate` ✓.
  - **E2E verified** bằng smoke test + screenshot frontend (A.1/A.2). Trên Neon hiện có **demo data** để review live: 3 nghệ sĩ + 6 sản phẩm (slug `demo-*`, đã liên kết artistId) — seed bằng `backend/_demo_seed.js` (throwaway, untracked). Lưu ý còn vài row rác cũ ("ÁO" / "NGON") chưa xoá.
  - Phase 1-7 + admin + 2 migration + **A.1/A.2/A.3 + A.5 (nối frontend) + B (index động + size-guide modal) + admin CRUD sửa + fix 413 upload ảnh** đã commit lên `feature/artdict-ui` — **chưa push** (nhiều commit; xem `git status`).
  - Trên Neon còn có 4 post demo (`backend/_demo_seed_posts.js`, throwaway) cho A.3.
  - Credential bên thứ 3: ✅ **`MOMO_*`** (sandbox công khai) + ✅ **`CLOUDINARY_*`** (key thật của chủ dự án — upload ảnh CDN đã bật) đã điền vào `backend/.env` (`.env` gitignored nên không lên git). Còn rỗng (chỉ cần khi bật): `RESEND_API_KEY`+`EMAIL_FROM` (email). Backend chạy bình thường không cần key còn rỗng.

- **Quyết định chốt** (2026-06-11): phí ship = **miễn phí toàn bộ** (total = tiền hàng, không cột `shippingFee`); tra cứu đơn guest = **không làm** (khách chỉ nhận email xác nhận).

---

# Kế hoạch tiếp theo
*Ưu tiên A → D. Backend đã xong & chạy thật — phần lớn việc còn lại là **nối frontend công khai vào API** rồi đưa lên production.*

## A. Nối frontend công khai vào API (ưu tiên cao nhất)
Hiện chỉ admin tiêu thụ API; trang công khai vẫn hardcode. Làm lần lượt, mỗi bước có cách kiểm chứng:
1. ✅ **Sản phẩm (XONG 2026-06-14)** — `catalogue.html` + `product.html` fetch `GET /api/products` (+ `/:slug`). Đã verify bằng screenshot (desktop+mobile) với 6 SP demo trên Neon: catalogue render đúng + filter/đếm theo `category` slug + sold-out + placeholder khi thiếu ảnh; product có gallery/giá/related động, size chỉ hiện cho `aothun`, sold-out disable nút, slug sai → trang 404. **Taxonomy đã chốt**: 8 slug cố định (`aothun/mu/vongtay/sotay/nhandan/mockhoa/tranh/khac`), ô category ở admin đổi `input`→`select`. **Map slug→nhãn** ở `js/api.js` (`ArtdictAPI.CATEGORIES`) là nguồn chung.
   > **Đã thêm `Product.description`** (theo yêu cầu chủ dự án): lede trang product lấy từ `description` (admin có ô textarea); accordion "chất liệu" tĩnh-sai đã gỡ, "bảo quản/vận chuyển" sửa thành copy phổ quát. Còn **tùy chọn chưa làm**: `oldPrice` nếu muốn hiện % giảm giá (model chưa có).

> **Hạ tầng nối API đã dựng (tái dùng cho A.3-A.5):** `js/api.js` = client chung (`ArtdictAPI.get(path)` + `ArtdictAPI.CATEGORIES`); mỗi trang 1 page-script riêng load TRƯỚC `js/artdict.js`; `artdict.js` có `window.Artdict.rescan(root)` để bind tilt/reveal/filter/gallery/add-to-cart cho DOM render động. Verify = backend `:3000` + serve `:8000` (CORS) + `node _verify_shot.js <tên> <path>` (Playwright cố định port 8000; `shot.js` gốc port random nên bị CORS chặn — không dùng cho trang gọi API).
2. ✅ **Nghệ sĩ (XONG 2026-06-14)** — `artists.html` (list + stats động + work-chips từ `/products?artistId=`) & `artist.html` (hero/meta/pull-quote/Q&A từ `content.qa`/works/next-artist) fetch `GET /api/artists`. Verify screenshot desktop+mobile + 404. *Lưu ý*: model `Artist` không có `bio` → trang list bỏ đoạn bio (chỉ quote); Q&A render từ `content.qa[]` (đúng 3 mục).
3. ✅ **Bài viết (XONG 2026-06-15)** — dựng mới `news.html` + `journal.html` (list, fetch `GET /api/posts?type=NEWS|JOURNAL`, lọc `publishedAt` set = chỉ hiện bài đã publish) + `post.html` (detail dùng chung NEWS/JOURNAL, đọc `?slug=`, `body` text thuần → split `\n\n` thành `<p>`, lede = đoạn đầu in to). Page script `js/posts.js` (đọc `data-type` từ `#post-list`) + `js/post.js`. CSS `.post-*` (list date-led + read view măng-sét ~64ch) thêm vào `style.css`. Layout family mới (date-led list) khác lưới catalogue & row nghệ sĩ. Header dropdown "Khám phá" thêm link **Tạp chí** (journal trước đó chưa link). Verify screenshot desktop+mobile (list + detail + 404) với 4 post demo trên Neon (`backend/_demo_seed_posts.js`, throwaway). *Lưu ý*: list News còn 1 post rác cũ "sdfsd" trên Neon (giống row rác "ÁO"/"NGON" — chưa xoá).
4. ⏸️ **Ứng tuyển (CHỐT: KHÔNG nối API)** — chủ dự án quyết định `submit.html` chỉ hiển thị **Gmail** để nhận CV/portfolio (giữ `mailto:`, không làm form `POST /api/artists/apply`). Việc còn lại duy nhất: thay placeholder `artist@artdict.vn` → Gmail thật (3 chỗ: `mailto:` href, chữ hiển thị, `data-copy` nút sao chép). **Chờ chủ dự án cho địa chỉ.**
5. ✅ **Giỏ hàng + Checkout (XONG 2026-06-15)** — nút "Thanh toán" trong cart drawer (trước đây CHẾT) → `/pages/checkout.html`. `checkout.html` + `js/checkout.js`: render giỏ từ localStorage (`artdict_cart_v1`) + form khách (tên/email/sđt/địa chỉ) → map slug→`productId` qua `GET /api/products` → `POST /api/orders` (guest) → redirect `momoPaymentUrl`. `payment-return.html` + `js/payment-return.js`: đọc query MoMo (`resultCode`/`orderId`) hiện 3 trạng thái (thành công/đang chờ/thất bại). `js/api.js` thêm `post()`. `js/artdict.js` thêm `clearCart` + wire nút checkout. **Verify**: `POST /orders` → 201 + payUrl MoMo thật (key sandbox công khai đã điền vào `backend/.env`, `.env` gitignored); screenshot checkout (desktop+mobile) + 3 trạng thái return + giỏ trống + click-test nút "Thanh toán" điều hướng đúng. 114/114 test BE pass.
   > **Sửa nhỏ backend (cần cho sandbox)**: `momo.js` đổi MoMo `orderId` → `"<dbId>-<timestamp>"` (duy nhất theo yêu cầu MoMo; sandbox dùng chung từ chối id số nhỏ trùng). IPN vẫn `parseInt(orderId)` lấy lại dbId (dừng ở `-`) nên `orders.js`/IPN KHÔNG đổi; cập nhật 1 assertion `momo.test.js`.
   > **Còn lại (chỉ chạy được sau deploy)**: IPN `momo-callback` đẩy đơn → `PAID` cần URL public (MoMo không gọi được `localhost`). Deploy phải set `MOMO_IPN_URL` + `MOMO_REDIRECT_URL` (đang trỏ `http://localhost:8000/pages/payment-return.html`) về domain thật.

> **CORS**: frontend gọi API phải nằm trong origin được allow. Local đã allow `:8000`; khi deploy phải set `FRONTEND_URL` = domain thật.

## B. Hoàn thiện trang còn stub
- ✅ **size-guide**: đã chuyển thành **modal trong `product.html`** (áo thun) — không cần trang riêng (stub mồ côi, chưa xoá). Số đo là **tham khảo**, chờ số thật.
- ⏸️ **`collab.html`**: chủ dự án bảo **tạm để đó** (chưa làm).
- ✅ **Trang chủ động**: lưới SP `index.html` đã nối API (xem mục 1).

## C. Bật tính năng bên thứ 3 (điền key vào `backend/.env` — xem Bước 1)
- ✅ **Cloudinary** (`CLOUDINARY_*`) — ĐÃ điền key thật, upload ảnh CDN từ admin hoạt động. (Chưa có key thì `cloudinary.js` fallback lưu data URL vào DB — chỉ nên dùng để test.)
- ✅ **MoMo** (`MOMO_*`) — sandbox công khai đã điền (test thanh toán).
- ⏳ **Resend** (`RESEND_API_KEY` + domain đã verify ở `EMAIL_FROM`) — gửi email xác nhận / đã gửi hàng / ứng tuyển. **Chưa bật.**

## D. Cứng hoá & deploy
1. **Đổi `ADMIN_PASSWORD`** (đang là dev pw yếu `123`) → mật khẩu mạnh, rồi `npm run db:seed` lại (upsert idempotent).
2. **Push** `feature/artdict-ui` lên remote (**còn nhiều commit chưa push** — xem `git log origin/feature/artdict-ui..HEAD`) → mở PR vào `main`.
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



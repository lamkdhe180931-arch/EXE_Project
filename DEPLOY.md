# 🚀 DEPLOY — Đưa Artdict lên mạng

Runbook đưa Artdict từ máy local → chạy thật trên Internet. Làm **theo đúng thứ tự**.

## Kiến trúc khi đã deploy

```
   Khách / Admin (trình duyệt)
            │  https
            ▼
   ┌─────────────────────┐     /api/*  (proxy)     ┌──────────────────────┐
   │  Vercel  (FE tĩnh)  │ ──────────────────────▶ │  Render (backend API) │
   │  index.html, /pages │                          │  Express + Prisma     │
   │  /admin, /js, /css  │ ◀────────────────────── │                       │
   └─────────────────────┘                          └───────────┬──────────┘
                                                                  │
                                                                  ▼
                                                         ┌──────────────────┐
                                                         │   Neon Postgres  │
                                                         └──────────────────┘
```

- Trình duyệt **chỉ nói chuyện với Vercel**. Mọi lời gọi `/api/...` được Vercel **chuyển tiếp** sang backend Render (cấu hình ở [`vercel.json`](vercel.json)). Vì là cùng một tên miền → **không vướng CORS, cookie đăng nhập admin chạy ngon**.
- Backend Render đọc/ghi dữ liệu vào **Neon Postgres** (bạn đã có sẵn).
- Ảnh sản phẩm/nghệ sĩ tải lên **Cloudinary** (bạn đã có key).

---

## Bước 0 — Đẩy code lên GitHub (bắt buộc)

Render & Vercel build **từ GitHub**, nên các file cấu hình mới (`render.yaml`, `.vercelignore`) phải có trên repo trước.

- Repo: `github.com/lamkdhe180931-arch/EXE_Project`, nhánh `feature/artdict-ui`.
- Cần `git add` + `commit` + `push` nhánh này (hoặc merge vào `main` rồi deploy từ `main`).
- 👉 *Nói "commit và push" là tôi (Claude) làm giúp bước này.*

> ⚠️ File `backend/.env` **không** lên GitHub (đã gitignore) — đó là điều đúng. Secret sẽ nhập trực tiếp trên Render ở Bước 1.

---

## Bước 1 — Deploy backend lên Render

1. Vào https://dashboard.render.com → **New +** → **Blueprint**.
2. Kết nối GitHub → chọn repo `EXE_Project`, nhánh `feature/artdict-ui`.
3. Render đọc [`render.yaml`](render.yaml) và hiện form. Nó sẽ **hỏi bạn điền các biến secret** — điền:
   | Biến | Điền gì |
   |---|---|
   | `DATABASE_URL` | Chuỗi kết nối Neon (lấy ở neon.tech → Connection string, có `?sslmode=require`). **Dùng đúng DB đang có dữ liệu/sẽ chứa dữ liệu thật.** |
   | `ADMIN_PASSWORD` | **Mật khẩu mạnh** (≥12 ký tự, có hoa/thường/số/ký hiệu). Đây là pw đăng nhập admin. |
   | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Lấy từ `backend/.env` trên máy bạn (đã có sẵn). |
   | `FRONTEND_URL` | **Tạm để trống / điền tạm** — sẽ cập nhật ở Bước 4 sau khi có domain Vercel. |
   | `MOMO_REDIRECT_URL` | **Tạm để trống** — cập nhật ở Bước 4. |
4. Bấm **Apply / Create**. Render sẽ:
   - cài deps → `prisma generate` → **`prisma migrate deploy`** (tạo bảng) → **seed tài khoản admin**.
   - Theo dõi tab **Logs**. Thành công khi thấy `Artdict API running...` + health `/health` xanh.
5. Ghi lại URL Render, dạng `https://artdict-backend.onrender.com`.
   - ✅ Nếu URL **đúng** là `artdict-backend.onrender.com` → khớp sẵn `vercel.json`, không cần sửa.
   - ⚠️ Nếu Render đặt tên khác (vd có hậu tố) → **nhớ URL này** để sửa ở Bước 2 + cập nhật `MOMO_IPN_URL`.

> **Kiểm tra nhanh:** mở `https://<url-render>/health` → phải thấy `{"status":"ok","env":"production"}`.
> Mở `https://<url-render>/api/products` → thấy `[]` hoặc danh sách sản phẩm (JSON) = backend + DB OK.

---

## Bước 2 — Khớp `vercel.json` với URL Render (nếu cần)

Mặc định [`vercel.json`](vercel.json) trỏ `https://artdict-backend.onrender.com`.
- Nếu URL Render **giống hệt** → bỏ qua bước này.
- Nếu **khác** → sửa `destination` trong `vercel.json` thành `https://<url-render-thật>/api/:path*`, và sửa `MOMO_IPN_URL` trên Render thành `https://<url-render-thật>/api/orders/momo-callback`. Rồi commit + push lại.

---

## Bước 3 — Deploy frontend lên Vercel

1. Vào https://vercel.com → **Add New** → **Project** → import repo `EXE_Project` (nhánh `feature/artdict-ui`).
2. Cấu hình:
   - **Framework Preset:** `Other`
   - **Build Command:** *(để trống)*
   - **Output Directory:** *(để trống / `.`)*
   - **Root Directory:** *(để trống — gốc repo)*
3. **Deploy**. Xong, lấy domain, dạng `https://artdict.vercel.app` (hoặc tên bạn đặt).
4. Kiểm tra: mở domain Vercel → thấy trang chủ Artdict. Mở `https://<domain>/admin/login.html` → thấy trang đăng nhập.

> `vercel.json` tự động chuyển `/api/*` sang Render — không cần cấu hình thêm.

---

## Bước 4 — Nối 2 đầu (quan trọng — đừng quên)

Giờ đã có domain Vercel, quay lại **Render → service → Environment**, cập nhật:

| Biến | Giá trị |
|---|---|
| `FRONTEND_URL` | `https://<domain-vercel>` (vd `https://artdict.vercel.app`) |
| `MOMO_REDIRECT_URL` | `https://<domain-vercel>/pages/payment-return.html` |

→ Lưu → Render **tự Redeploy**. Sau khi xanh lại là hoàn tất nối.

---

## Bước 5 — Dọn dữ liệu demo/rác (làm 1 lần)

Trên **máy bạn** (thư mục `backend/`, `.env` đang trỏ đúng Neon production):

```bash
cd backend
node _cleanup.js                 # XEM TRƯỚC — in toàn bộ dữ liệu, không xóa gì
```

Đọc danh sách. Các dòng `[DEMO]` sẽ bị xóa tự động. Với dòng rác khác (vd "ÁO", "NGON", "sdfsd"), ghi lại **#id** của chúng, rồi:

```bash
node _cleanup.js --apply --product-ids=<id,id> --post-ids=<id> --artist-ids=<id>
```

> An toàn: sản phẩm đã có đơn hàng sẽ được **ẩn** thay vì xóa (không vỡ dữ liệu đơn cũ).
> *(Hoặc đơn giản hơn: bỏ qua script, vào admin online bấm nút **Xóa** từng dòng rác.)*

---

## Bước 6 — Smoke test (nghiệm thu)

Trên domain Vercel thật:
- [ ] Trang chủ + `/pages/catalogue.html` hiện sản phẩm (sau khi nhập liệu).
- [ ] `/admin/login.html` → đăng nhập bằng `admin@artdict.vn` + `ADMIN_PASSWORD` vừa đặt → vào được dashboard.
- [ ] Tạo thử 1 sản phẩm + upload 1 ảnh trong admin → ảnh hiện (URL Cloudinary).
- [ ] Đặt thử 1 đơn ở trang khách → nhảy sang trang thanh toán MoMo (sandbox).

➡️ Xong là **sẵn sàng nhập dữ liệu thật** qua admin online.

---

## 📋 Bảng ENV production đầy đủ (tham chiếu)

| Biến | Nguồn / giá trị | Ghi chú |
|---|---|---|
| `NODE_ENV` | `production` | Đã set trong render.yaml |
| `DATABASE_URL` | Neon | **Secret** |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Render tự sinh | Không cần đụng |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | `15m` / `7d` | Đã set |
| `ADMIN_EMAIL` | `admin@artdict.vn` | Đã set |
| `ADMIN_PASSWORD` | bạn đặt | **Secret — mạnh** |
| `CLOUDINARY_*` | key của bạn | **Secret** |
| `FRONTEND_URL` | domain Vercel | Set ở Bước 4 |
| `MOMO_REDIRECT_URL` | domain Vercel + `/pages/payment-return.html` | Set ở Bước 4 |
| `MOMO_IPN_URL` | domain Render + `/api/orders/momo-callback` | Đã set sẵn (sửa nếu URL Render khác) |
| `MOMO_PARTNER_CODE/ACCESS_KEY/SECRET_KEY/ENDPOINT` | sandbox công khai | Đã set — **chỉ demo** |
| `EMAIL_FROM` | `Artdict <no-reply@artdict.vn>` | Đã set |
| `RESEND_API_KEY` | *(để trống)* | Email tắt — không bật đợt này |

---

## ⚠️ Cần biết

- **MoMo đang là SANDBOX** → thanh toán chạy demo, **KHÔNG có tiền thật**. Muốn nhận tiền thật phải đăng ký merchant MoMo (thủ tục doanh nghiệp) rồi thay `MOMO_PARTNER_CODE/ACCESS_KEY/SECRET_KEY/ENDPOINT` bằng key thật.
- **Email chưa bật** → khách đặt hàng **không nhận email xác nhận**. Bật sau: đăng ký Resend, verify domain, thêm `RESEND_API_KEY` vào Render rồi Redeploy.
- **Render gói free "ngủ" sau ~15 phút** không ai truy cập → lần gọi đầu tiên sau đó **chậm ~50 giây** (cold start). Muốn luôn nhanh: nâng gói trả phí, hoặc dùng dịch vụ "ping" định kỳ.
- **Đổi mật khẩu admin** sau này: đổi `ADMIN_PASSWORD` trên Render → Manual Deploy / Redeploy (build tự seed lại, idempotent).

## 🔧 Sự cố thường gặp

| Hiện tượng | Nguyên nhân & cách xử lý |
|---|---|
| Trang khách trống, console lỗi `/api/...` 404 | `vercel.json` trỏ sai URL Render, hoặc Render chưa chạy. Kiểm tra `https://<render>/health`. |
| Lần đầu vào web rất chậm rồi mới hiện | Render free cold start (~50s). Bình thường. |
| Admin đăng nhập xong bị đá ra lại | Cookie/refresh — đảm bảo cả 2 đều **https**, `NODE_ENV=production` đã set. |
| Deploy Render fail ở bước build | Xem Logs: thường do `DATABASE_URL` sai hoặc Neon đang ngủ/chặn IP. |
| Upload ảnh lỗi | Thiếu/sai `CLOUDINARY_*` trên Render. |

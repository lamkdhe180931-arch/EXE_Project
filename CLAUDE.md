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
*Cập nhật: 2026-06-11*

## 1. Frontend (`/`)
- **Hoàn thành**: `index.html`, components, `catalogue.html`, `collection.html`, `about.html`, `submit.html`, `artists.html`, `artist.html`, `product.html`. Tất cả đã dùng **ảnh thật**. Hợp nhất `style.css`.
- **Tồn đọng**:
  - `collab.html`, `news.html`, `journal.html`, `size-guide.html` còn là stub "coming soon".
- **Đã kiểm tra** (`node shot.js`, desktop 1440 + mobile 390): các trang chính render đúng, không vỡ layout mobile; `.reveal` hiển thị đúng ở chế độ reduced-motion. Logic đổi ảnh gallery (`data-full`) đã nối — chưa click-test live trên trình duyệt.

## 2. Backend (`backend/`)
**Stack**: Node + Express 5 + Prisma 5.22 + Postgres (Neon). TDD Jest.

- **Hoàn thành (Phase 1-4 + upload ảnh + email đơn)**: Setup · Auth (15m access, 7d refresh httpOnly) · Products & Artists CRUD · **Order & Checkout + MoMo** (`POST /orders` optional auth/guest, `validateCart` snapshot `priceAtTime` từ giá server, IPN `momo-callback`: verify HMAC → `PAID` → trừ kho trong `$transaction`, idempotent) · **upload ảnh Cloudinary** (`POST /products/:id/images`) · **email xác nhận đơn (Resend)** nối vào callback PAID (best-effort). MoMo/Cloudinary/Resend đều dùng `fetch`+`crypto` built-in (không thêm dep), mock trong test. (Test: **90/90 PASS**.)
- **Tồn đọng**:
  - DB Migrate: **Chờ `DATABASE_URL` Neon thật** → `npm run db:migrate` (schema đã `prisma validate` ✓, sẵn sàng). Test backend dùng mockDb nên không cần DB.
  - Env thật khi deploy: `CLOUDINARY_*` · `MOMO_*` · `RESEND_API_KEY` (code + test đã xong, chỉ thiếu credential).
  - Chưa làm: Phase 5 (Content/Posts), Phase 6 còn lại (template Shipped/Application), Phase 7 (Admin Panel HTML).
- **Quyết định chốt** (2026-06-11): phí ship = **miễn phí toàn bộ** (total = tiền hàng, không cần cột `shippingFee` — đúng với code hiện tại); tra cứu đơn guest = **không làm** (khách chỉ nhận email xác nhận).



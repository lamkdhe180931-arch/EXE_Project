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

- **Hoàn thành (Phase 1-3)**: Setup, Auth API (15m access, 7d refresh HTTP-only), Products & Artists CRUD. (Test: 46/46 PASS). **Đã commit + push** (`5c2d73e`).
- **Tồn đọng**:
  - `POST /products/:id/images`: Chờ Cloudinary.
  - DB Migrate: Chờ chuỗi kết nối Neon.
  - Chưa làm: Phase 4 (Order/MoMo), 5/6/7 (Content, Email, Admin).



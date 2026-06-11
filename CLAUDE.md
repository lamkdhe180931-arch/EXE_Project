# CLAUDE.md — Artdict

Hướng dẫn cho Claude khi làm việc trong repo này. **Đọc các rule bên dưới TRƯỚC khi viết code.**

Các quy tắc dự án được tách theo chủ đề trong `.claude/rules/` và được import vào đây. Mỗi file một chủ đề:

| Rule                           | Chủ đề                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `mandatory-rules.md`           | 3 quy tắc bắt buộc (screenshot + mobile + animation) — **không được bỏ qua** |
| `project-overview.md`          | Artdict là gì: định vị, khán giả, nguồn cảm hứng                             |
| `tech-stack.md`                | Stack vanilla HTML/CSS/JS + GSAP, cấu trúc thư mục, quy ước                  |
| `design-workflow.md`           | Quy trình image-first, dials, checklist khi build/sửa                        |
| `brand-identity.md`            | Brand DNA: bảng màu, typography, bố cục, micro-animation (token LOCK)        |
| `design-discipline.md`         | Kỷ luật anti-slop (hero, eyebrow, layout, copy, button a11y)                 |
| `typography.md`                | Phân cấp thông tin chữ nghệ thuật (Editorial Typography) sử dụng 1 font      |
| `accessibility-performance.md` | A11y & performance: reduced-motion, viewport, responsive, ảnh, fonts         |
| `assets.md`                    | Kho tài sản `assets/` + mapping tên ASCII                                    |
| `coding-discipline.md`         | Kỷ luật viết code: suy nghĩ trước, đơn giản, phẫu thuật, hướng mục tiêu      |

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

# Tiến độ dự án (Progress Log)

> Phần này KHÔNG phải rule — là nhật ký trạng thái để phiên làm việc sau nắm được bối cảnh. Cập nhật cuối phiên. Rule luôn nằm trong `.claude/rules/`.

## Trạng thái từng phần (cập nhật: 2026-06-10)

| Phần                                  | Trạng thái      | Ghi chú                                                                              |
| ------------------------------------- | --------------- | ------------------------------------------------------------------------------------ |
| `index.html` (trang chủ)              | ✅ Xong         | Hero collage, marquee, catalogue, manifesto, craft bento, stats, wordmark, CTA       |
| Web Components header/footer          | ✅ Xong         | Logo = `art-2.png` (Frame 112.png); mega menu sáng; hover bridge; giỏ hàng icon tròn |
| `pages/catalogue.html`                | ✅ Xong         | Filter pills hoạt động; vẫn dùng placeholder `.ph` cho ảnh sản phẩm                  |
| `pages/product.html`                  | ✅ Xong         | Gallery thumbs, size, qty, accordion, related, cart drawer; vẫn dùng `.ph`           |
| `pages/artists.html`                  | ✅ Xong         | 5 artist rows, join-band CTA, stats header — CSS artist-row đầy đủ                   |
| `pages/artist.html`                   | ✅ Xong         | Interview layout hoàn chỉnh: iv-hero/iv-meta/iv-banner/iv-body/iv-toc/qa/lead-letter |
| Stub pages (6 trang)                  | ✅ Xong         | collab · about · news · journal · size-guide · submit — đều có nav clearance đúng    |
| **Hợp nhất CSS**                      | ✅ Xong         | `style.css` = nguồn DUY NHẤT. `artdict.css` rỗng                                     |
| Nav height `--nav-h: 80px`            | ✅ Xong         | Desktop 800px / mobile 65px; tất cả trang đã clearance đúng                          |
| Dead links header/footer              | ✅ Xong         | 0 `href="#"` còn lại; social links dùng placeholder URLs thật                        |
| Typography tokens                     | ✅ Xong         | `--body` = Plus Jakarta Sans; `--lh-body` = 1.68; `--fw-black` = 900                 |
| Coding discipline rule                | ✅ Xong         | `.claude/rules/coding-discipline.md` đã import vào CLAUDE.md                         |
| **Ảnh thật thay placeholder `.ph`**   | ⚠️ Chưa         | Catalogue · product · artists · artist vẫn dùng sọc — vi phạm design-discipline      |
| Trang Collab / About / News           | ⚠️ Stub         | Có trang nhưng chỉ là "Đang xây dựng" — cần nội dung thật                            |
| Scroll animation artists/artist pages | ⚠️ Cần xác nhận | `.reveal` class có sẵn — cần kiểm tra GSAP ScrollTrigger pick up đúng                |

## Bước tiếp theo (phiên sau)

1. **[Ưu tiên cao] Thay `.ph` bằng ảnh thật** — dùng assets sẵn có:
   - `ao-artdict.png`, `ao-meo-no-1.png`, `ao-meo-no-2.png`, `ao-do-de-choi.png` → áo thun
   - `mu.png`, `mu-xanh.png` → mũ
   - `so-tay.png` → sổ tay
   - `art-1.png`, `art-2.png` → ảnh nghệ thuật / portrait tác giả
   - Áp dụng cho: catalogue.html (grid), product.html (gallery), artist.html (portrait + related)

2. **[Ưu tiên trung] Xác nhận GSAP ScrollTrigger** cho artists.html và artist.html — các `.reveal` chưa được test thực tế trên trình duyệt sau khi thêm CSS iv-\*. Chạy `node shot.js` để kiểm tra.

3. **[Ưu tiên trung] Hoàn thiện Collab page** (`pages/collab.html`) — đây là trang quan trọng cho brand story; hiện chỉ là stub "Đang xây dựng".

4. **[Cần làm] Mobile screenshot verification** — chụp desktop + mobile toàn bộ trang sau khi thêm ảnh thật (mandatory-rules.md quy tắc #1 + #2).

5. **[Ghi nhận cần xem xét] Typography Acid Grotesk trên Vietnamese body text** — `--display` vẫn dùng Acid Grotesk cho heading/UI. Nếu font chưa bao phủ ký tự tiếng Việt đầy đủ, cân nhắc fallback `"Space Grotesk"` cho các element heading có nội dung tiếng Việt dài.

## Quyết định quan trọng & lý do

- **Hợp nhất 2 hệ CSS vào `style.css`, để `artdict.css` rỗng** → tránh xung đột class trùng, một nguồn duy nhất.
- **Token `--bg: #f8f8ff`** + alias `--cream-50`/`--cream`/`--card` → markup cũ vẫn chạy. Lưu ý: lệch khỏi LOCK `#fcfaf2` trong brand-identity.md — yêu cầu trực tiếp của chủ dự án.
- **Bento `.craft-bento .craft-card` scope** → index.html (tile tối) và product.html (strip kem) không đè nhau.
- **Mega menu hover bridge** (`::after` pseudo, 24px) → giữ CSS `:hover` sống khi cursor vượt khoảng trống giữa trigger và panel.
- **Logo = `art-2.png`** (Frame 112.png) thay `logo-dark.png`; kích thước 80px width desktop / 46px height mobile.
- **`--nav-h: 120px`** desktop, 80px mobile — tất cả trang clearance dùng `calc(var(--nav-h) + X)`.
- **`--body` = Plus Jakarta Sans** (tách khỏi Acid Grotesk) → body reading text dùng font tối ưu tiếng Việt; Acid Grotesk chỉ cho display/heading/UI.
- **`--lh-body: 1.68`** (tăng từ 1.55) → tiếng Việt có dấu chồng cần line-height rộng hơn.

---
description: Accessibility & performance cho stack vanilla — reduced-motion, viewport, responsive, ảnh, fonts
globs:
  - "css/**"
  - "js/**"
  - "**/*.html"
---

# Accessibility & Performance (vanilla)

- **`prefers-reduced-motion`:** bọc mọi GSAP ScrollTrigger/animation lớn trong kiểm tra `window.matchMedia('(prefers-reduced-motion: reduce)')`. Nếu reduce → render tĩnh, không pin/scrub.
- **Viewport:** hero full-height dùng `min-height: 100dvh` (KHÔNG `100vh` — nhảy layout trên mobile Safari).
- **Grid > flex-math:** dùng CSS Grid thay vì `calc(33% - ...)`.
- **Mobile collapse rõ ràng:** mỗi layout đa cột phải khai báo fallback `< 768px`. Masonry và collage hero phải có phương án mobile.
- **Ảnh:** `loading="lazy"` cho ảnh dưới fold, kích thước `width`/`height` để tránh layout shift. Ảnh trong `assets/` nặng (vài MB) — cân nhắc nén/resize trước khi production.
- **Fonts:** `font-display: swap`, preconnect tới Google Fonts nếu dùng `<link>`.
- Breakpoints chuẩn: `sm 640 · md 768 · lg 1024 · xl 1280`.

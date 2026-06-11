---
description: Tech stack đã chốt (vanilla HTML/CSS/JS + GSAP), kiến trúc workspace đa trang & quy ước codebase
alwaysApply: true
---

# Tech Stack & quy ước (đã chốt với chủ dự án)

- **HTML + CSS + JS thuần (vanilla). KHÔNG framework, KHÔNG build step, KHÔNG Node toolchain.**
- **Animation: GSAP + ScrollTrigger qua CDN.** Đây là thư viện animation DUY NHẤT — không thêm thư viện khác.
- **Fonts: Google Fonts qua `<link>`** (vanilla, không có `next/font`) — `Space Grotesk` + `Plus Jakarta Sans`, kèm `font-display: swap`.
- **CSS: viết tay với CSS Custom Properties (biến)** cho toàn bộ token màu/spacing/type. KHÔNG dùng Tailwind (không có build). Một file `css/style.css` dùng chung cho mọi trang.
- **JS: `defer`.** Tách logic theo concern. Không jQuery.

## Kiến trúc workspace đa trang (site nhiều trang)

```
/index.html            # trang chủ
/pages/                # các trang phụ (product.html, about.html, …) — xem pages/README.md
/components/            # CHROME TÁI SỬ DỤNG (Web Components)
    site-header.js      # <site-header active="…">
    site-footer.js      # <site-footer>
/css/style.css          # tokens + layout + components (dùng chung)
/js/main.js             # GSAP init + tương tác (nav, reveal, tilt, converge, counter…)
/assets/                # ảnh (xem assets.md) — dùng bản copy ASCII
/shot.js                # tool screenshot (static server + Playwright) cho quy tắc #1
/screenshots/           # output screenshot
```

### Header & Footer = Web Components (tái sử dụng)

- Header/footer **KHÔNG copy-paste** vào từng trang. Chúng là Web Components trong `components/`:
  `<site-header active="catalogue"></site-header>` … `<site-footer></site-footer>`.
- Render bằng JS (innerHTML) nên không cần build/fetch; sửa 1 chỗ → mọi trang cập nhật.
- Thuộc tính `active` đánh dấu link điều hướng hiện tại (home | catalogue | craft | manifesto | contact).
- Thứ tự script trong mỗi trang: nạp `components/*.js` (defer) TRƯỚC `js/main.js` (defer) để `main.js` thấy được `#nav` đã render.

### Đường dẫn ROOT-RELATIVE + chạy qua local server (bắt buộc)

- Mọi đường dẫn nội bộ dùng **root-relative** (`/css/…`, `/js/…`, `/assets/…`, `/components/…`, `/index.html#…`) để đồng nhất giữa `index.html` và các trang trong `pages/`.
- Vì vậy phải chạy qua **local server**, không mở `file://`:
  `python -m http.server` tại thư mục gốc → mở `http://localhost:8000`.
- Tool `shot.js` tự dựng static server nội bộ rồi chụp — cứ `node shot.js`.

### Tạo trang mới (quy trình chuẩn)

1. Tạo file trong `pages/` (hoặc gốc nếu là trang chính).
2. `<head>`: link `/css/style.css` + Google Fonts giống `index.html`.
3. `<body>`: `<site-header active="…">` … nội dung … `<site-footer>`.
4. Cuối `<body>`: script `components/*.js` → GSAP CDN → `js/main.js` (đúng thứ tự).
5. Mọi section mới tuân `mandatory-rules.md` (animation scroll + mobile) và `design-discipline.md`.

## Quy ước

- Class CSS: kebab-case / BEM nhất quán cho cả repo.
- Không hard-code màu rời rạc trong CSS — luôn dùng biến từ `:root` (xem `brand-identity.md`).
- Thêm asset mới → tạo bản copy tên ASCII (xem `assets.md`).

---
description: Quy tắc bắt buộc tuyệt đối khi làm việc trên Artdict — không được bỏ qua
alwaysApply: true
---

# Quy tắc bắt buộc (không được bỏ qua)

1. **Screenshot & đối chiếu sau mỗi thay đổi lớn.** Sau khi dựng/sửa một section hoặc thay đổi đáng kể, mở trang trong trình duyệt, **chụp screenshot** (cả desktop và mobile viewport), rồi **so sánh trực quan với design gốc** (`assets/www.shopify.com_vn.png` cho cấu trúc + DNA thương hiệu trong `brand-identity.md` cho màu/typography). Báo cáo điểm khớp/lệch trước khi coi là xong. Nếu không có cách chạy trình duyệt trong môi trường, nói rõ và mô tả cách user tự kiểm tra. (Tool có sẵn: `shot.js` ở gốc repo — dùng lại Playwright cài ở `Desktop/website test`.)
2. **Mobile-friendly là điều kiện bắt buộc, không phải tuỳ chọn.** Mọi section phải responsive, kiểm tra ở `< 768px` (và `< 480px`). Collage hero và masonry phải có phương án mobile rõ ràng. Không có section nào được vỡ layout/tràn ngang trên mobile. Chi tiết kỹ thuật ở `accessibility-performance.md`.
3. **MỌI section phải có animation khi scroll.** Không có section tĩnh. Tối thiểu: scroll-reveal (fade/translate khi vào viewport) bằng GSAP ScrollTrigger. Các section chính dùng hiệu ứng đặc trưng mạnh hơn (overlapping scroll, text converge, parallax, 3D tilt — xem `brand-identity.md`). **Bắt buộc** bọc trong `prefers-reduced-motion` (xem `accessibility-performance.md`) — reduce thì render tĩnh, không pin/scrub.

---
description: Quy trình image-first, dials thiết kế, và checklist khi build/sửa UI
globs:
  - "**/*.html"
  - "css/**"
  - "js/**"
---

# Quy trình thiết kế & build

## Image-First (bắt buộc trước khi viết UI trực quan)

Repo này đã cài **taste-skill** tại `.claude/skills/taste-skill/`. Khi được giao việc thiết kế/dựng giao diện có tính trực quan cao:

1. **Nêu "Design Read" 1 dòng** trước khi code (loại trang / khán giả / ngôn ngữ thị giác / hướng thẩm mỹ).
2. **Nếu có tool tạo ảnh:** tạo ảnh tham chiếu cho từng section TRƯỚC, phân tích sâu (typography, spacing, màu, button, layout), rồi mới code theo ảnh. Một section = một ảnh lớn, rõ — không nhồi nhiều section vào một ảnh nhỏ.
3. Nếu không có tool tạo ảnh: dùng ảnh sản phẩm thật trong `assets/` + ảnh placeholder mô tả (`picsum.photos/seed/...`). **Không** vẽ "fake screenshot" bằng `<div>`, không vẽ SVG minh hoạ thủ công.
4. Đối chiếu lại với `design-discipline.md` + `accessibility-performance.md` trước khi coi là xong.

**Dials cho dự án này:** `DESIGN_VARIANCE: 8` · `MOTION_INTENSITY: 7` · `VISUAL_DENSITY: 3` (premium consumer + art-direction, airy gallery).

## Checklist khi build / sửa

1. Nêu Design Read 1 dòng.
2. Nếu là việc trực quan: ưu tiên image-first (ở trên).
3. Dùng token màu/type từ `brand-identity.md` — không hard-code.
4. Chạy checklist anti-slop (`design-discipline.md`) + a11y (`accessibility-performance.md`) trước khi báo xong.
5. Tuân thủ `mandatory-rules.md` (screenshot + mobile + animation).
6. Báo cáo trung thực: nếu chưa test trên trình duyệt, nói rõ; nếu bỏ qua bước nào, nói rõ.

**Tham khảo sâu hơn:** `.claude/skills/taste-skill/skills/taste-skill/SKILL.md` (kỷ luật frontend đầy đủ) và `image-to-code-skill/SKILL.md` (quy trình image-first).

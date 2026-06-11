---
description: Brand DNA Artdict — bảng màu, typography, bố cục, micro-animation (token khoá cứng)
globs:
  - "css/**"
  - "**/*.html"
  - "js/**"
---

# Brand DNA — TOKEN KHOÁ CỨNG (từ README, bắt buộc kế thừa)

Đây là bản sắc thương hiệu. Mọi redesign phải giữ các giá trị này.

## 1. Bảng màu (Signature Palette) — LOCK

```css
:root {
  /* Nền kem ấm — base background (KHÔNG dùng trắng tinh #fff) */
  --cream-50: #fcfaf2; /* nền chính */
  --cream-100: #f5eedc; /* nền phụ / section xen kẽ */

  /* Đỏ Crimson — accent thương hiệu DUY NHẤT */
  --crimson: #a80c14; /* accent chính: link active, hover, badge, tiêu đề Hero */
  --crimson-hi: #ff000d; /* biến sáng: dùng rất tiết chế cho điểm nhấn mạnh */

  /* Đen tuyền — chiều sâu & tương phản cao */
  --ink: #0f0f0f; /* text chính + section tối (Manifesto) để ngắt nhịp cuộn */
}
```

**Color Consistency Lock:** đỏ crimson là accent DUY NHẤT trên toàn trang. Không thêm xanh/teal/vàng làm accent ở bất kỳ section nào. Dùng crimson **có chủ đích, tiết chế** (active link, nút hover, badge, H1 Hero) để không gây loãng thị giác. Nền kem là nền tảng; section đen `--ink` dùng để ngắt nhịp (vd: Manifesto).

## 2. Typography (Editorial) — LOCK

- **Space Grotesk** → Display font: logo, H1/H2/H3, con số nổi bật. Hình học tối giản, có nét khuyết phá cách.
- **Plus Jakarta Sans** → Body font: nội dung, đảm bảo hiển thị **tiếng Việt có dấu hoàn hảo**.
- **Tight tracking** trên tiêu đề chính: `letter-spacing: -0.04em` đến `-0.05em` + `line-height` chặt (`1` đến `1.05`) → cảm giác catalogue cao cấp, chữ nén chặt.
- Nhấn mạnh trong tiêu đề: dùng **italic/bold cùng font Space Grotesk**, KHÔNG chèn serif lạ vào.

## 3. Bố cục bất đối xứng & phá cách

- **Collage Hero:** mockup sản phẩm xếp nghiêng lệch góc ngẫu nhiên kiểu mood board / tường cảm hứng. KHÔNG hero căn giữa hộp grid truyền thống.
- **Masonry động:** danh mục sản phẩm dùng lưới Pinterest, thẻ cao thấp khác nhau, tạo nhịp chuyển động thị giác.
- **Whitespace biên tập rộng:** chừa khoảng trống quanh tác phẩm lớn, không nhồi nhét.

## 4. Micro-animation "sống động" (MOTION_INTENSITY 7 — phải thực sự chuyển động)

- **Overlapping Scroll:** section sáng/tối cuộn đè lên nhau bằng sticky/parallax tạo chiều sâu 3D.
- **Text Converge:** tiêu đề Hero co giãn/hợp nhất theo scroll — tagline `Đồ để chơi! Chất để đời!`.
- **Hover 3D Tilt:** thẻ category/sản phẩm xoay nhẹ theo trục X/Y dựa trên vị trí chuột (`perspective`).
- **Circular Buttons:** nút điều hướng có vòng tròn bao quanh; hover → `scale` to, đổi nền sang crimson hoặc kem, mũi tên dịch nhẹ sang phải.
- Dùng spring/ease tự nhiên (vd `power3.out`), KHÔNG linear cứng. Mọi animation phải có lý do (hierarchy/feedback/storytelling), không animation "cho đẹp".

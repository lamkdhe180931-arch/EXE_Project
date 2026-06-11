---
description: Hướng dẫn phân cấp thông tin Typography (Editorial Style) sử dụng 1 font chữ duy nhất
globs:
  - "css/**/*.css"
  - "**/*.html"
---

# Editorial Typography Rules (Single Font System)

Hệ thống quy tắc này giúp tối ưu hóa hiển thị, tránh sự đơn điệu và tạo ra sự phân cấp thông tin (visual hierarchy) đẳng cấp nghệ thuật khi chỉ sử dụng một font chữ duy nhất trên trang web.

## 1. Tương phản về Độ đậm (Weight Contrast) - LOCK

- **Tiêu đề chính/lớn (Display headings):** BẮT BUỘC dùng độ dày tối đa (`font-weight: 700` đến `850` hoặc sử dụng biến `--fw-bold`/`--fw-black`). Mục tiêu: tạo độ đầm, sức nặng thị giác mạnh mẽ.
- **Nội dung đọc (Body text):** BẮT BUỘC giữ ở mức tiêu chuẩn (`font-weight: 400` hoặc `--fw-regular`). Không được dùng chữ quá dày hoặc quá mảnh cho đoạn văn dài để đảm bảo tối ưu trải nghiệm đọc.
- **Các thông số phụ, nhãn nhỏ (Eyebrows/Meta/Captions):** Sử dụng mức siêu mảnh (`font-weight: 300` / `--fw-light`) hoặc trung bình (`font-weight: 500` / `--fw-medium`) để tách biệt thông tin.

## 2. Tương phản về Kích thước (Size Scale)

- Phải tạo khoảng cách cực đại (high contrast ratio) giữa kích cỡ chữ tiêu đề và chữ nội dung.
- **Tiêu đề Hero/Manifesto:** Kích thước khổng lồ (`clamp(2.5rem, 8vw, 7.2rem)` trở lên).
- **Body text tiêu chuẩn:** Giữ quanh mốc `16px` (`1rem`).
- Sự chênh lệch kích thước này tạo cảm giác hoành tráng giống như một trang bìa tạp chí thời trang/nghệ thuật.

## 3. Khoảng cách chữ (Letter Spacing / Tracking) - CRITICAL

- **Tiêu đề lớn (Headline):** PHẢI nén chặt chữ lại (`letter-spacing` âm từ `-0.03em` đến `-0.05em`). Điều này làm chữ trông đan cài tinh tế, tạo cảm giác thiết kế chặt chẽ và chuyên nghiệp.
- **Tiêu đề phụ/Nhãn nhỏ (Eyebrow):** PHẢI giãn rộng chữ ra (`letter-spacing` dương từ `0.15em` đến `0.22em`) và viết **IN HOA**. Kỹ thuật này biến các dòng chữ nhỏ thành một đường kẻ phân tách bố cục thanh lịch.

## 4. Chữ In hoa (Uppercase) & Chữ nghiêng (Italic)

- **Chữ in hoa nhỏ (Uppercase & small-caps):** Áp dụng cho các nhãn phân loại, nhãn Eyebrows nhỏ ở đầu section, nút bấm (buttons) để tạo tính hình học cứng cáp cho giao diện.
- **Chữ in nghiêng (Italic):** Không dùng serif khác loại, chỉ dùng kiểu in nghiêng của chính font chữ hiện tại. Chèn một vài từ in nghiêng một cách có chọn lọc vào giữa tiêu đề chính hoặc trong các câu trích dẫn để ngắt nhịp thị giác (visual accent).

## 5. Khoảng cách dòng (Line Height / Leading)

- **Quy tắc tỷ lệ nghịch:** Chữ càng lớn thì khoảng cách dòng càng hẹp.
- **Tiêu đề khổng lồ:** Đặt `line-height` cực sát (`0.9` đến `1.05`) để các dòng chữ không bị rời rạc.
- **Nội dung đọc nhỏ:** Để `line-height` rộng rãi (`1.55` đến `1.68`) giúp mắt đọc thoải mái hơn, tránh bị mỏi khi đọc tiếng Việt có nhiều dấu thanh chồng chéo.

## 6. Màu sắc và Độ mờ (Color & Opacity Hierarchy)

- **Thông tin chính (Tiêu đề, nội dung quan trọng):** Dùng màu tương phản cao nhất (`var(--ink)` hoặc accent `var(--crimson)` đỏ thẫm).
- **Thông tin phụ (Ngày tháng, tác giả, mô tả nhỏ):** Làm chìm đi bằng cách giảm độ đậm hoặc giảm opacity xuống `60%` - `65%` (`color-mix` hoặc `rgba`).

---

## Ví dụ thực tế trong Code (CSS):

```css
/* SAI - Thiếu tương phản, chữ đều đều giống nhau */
h1 {
  font-size: 24px;
  font-weight: 500;
  letter-spacing: normal;
  line-height: 1.5;
}
p {
  font-size: 16px;
  font-weight: 500;
}

/* ĐÚNG - Phân cấp biên tập nghệ thuật rõ rệt */
h1 {
  font-size: clamp(2.5rem, 8vw, 6.5rem);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-display-lg); /* Nén chặt: -0.05em */
  line-height: var(--lh-tightest); /* Sát sạt: 0.85 */
}
p {
  font-size: var(--fs-body-md); /* 1rem */
  font-weight: var(--fw-regular); /* 400 */
  line-height: var(--lh-body); /* Rộng rãi: 1.68 */
}
.eyebrow {
  font-size: var(--fs-body-xs); /* 12px */
  font-weight: var(--fw-semibold); /* 600 */
  letter-spacing: var(--ls-eyebrow-lg); /* Giãn rộng: 0.22em */
  text-transform: uppercase;
}
```

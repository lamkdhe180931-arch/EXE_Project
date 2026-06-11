---
description: Kỷ luật thiết kế anti-slop (hero, eyebrow, layout, copy, button a11y) từ taste-skill
globs:
  - "**/*.html"
  - "css/**"
---

# Kỷ luật thiết kế (Anti-Slop — áp dụng từ taste-skill)

- **Hero phải vừa viewport đầu tiên:** headline ≤ 2 dòng desktop, subtext ≤ 20 từ, CTA thấy được không cần cuộn. Tối đa 4 phần tử text trong hero (eyebrow/headline/subtext/CTA). Không nhồi trust-strip, pricing, bullet list vào hero.
- **Eyebrow restraint:** tối đa 1 nhãn eyebrow (chữ in hoa nhỏ giãn chữ) mỗi 3 section. Đừng đặt eyebrow trên MỌI tiêu đề — đó là tell AI dễ nhận nhất.
- **Cấm lặp layout:** một "layout family" (vd 3-cột-card, full-width-quote, split text-image) xuất hiện tối đa 1 lần. Trang nhiều section phải dùng ≥ 4 layout family khác nhau. Tối đa 2 section liền kề kiểu image+text-split; cái thứ 3 là fail.
- **Anti nested-box:** không card-trong-card-trong-card, không wrapper bo góc khổng lồ ôm mọi thứ. Ưu tiên whitespace, `border-t`, `divide` thay vì hộp lồng hộp.
- **Shape lock:** chọn MỘT thang bo góc và giữ nguyên (gợi ý: nút = pill tròn theo README; thẻ/ảnh = một radius nhất quán; sharp 0 cho khối editorial). Đừng trộn lung tung.
- **Theme lock:** trang chủ đạo nền kem sáng. Section đen `--ink` là thiết bị ngắt nhịp có chủ đích (1 lần, vd Manifesto), không phải đảo theme ngẫu nhiên.
- **Ảnh thật, không filler:** dùng ảnh sản phẩm trong `assets/`. Hero cần visual thật (collage mockup), không phải gradient blob.
- **Button a11y:** mọi nút kiểm tra tương phản WCAG AA (text/nền ≥ 4.5:1). Nút ghost trên ảnh phải có scrim/stroke. Label CTA ≤ 3 từ, không wrap 2 dòng ở desktop. Một intent = một label trên toàn trang.
- **Copy self-audit:** đọc lại mọi chữ hiển thị, loại bỏ filler ("unleash", "elevate", "next-gen", "seamless") và copy AI gượng ép. Tiếng Việt phải tự nhiên, đúng dấu. Không em-dash trang trí.
- **Số liệu:** không bịa số "chính xác giả" (vd "92%", "4.1×") trừ khi có dữ liệu thật hoặc đánh dấu rõ là mẫu.

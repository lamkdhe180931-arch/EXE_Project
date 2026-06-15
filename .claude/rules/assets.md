---
description: Kho tài sản có sẵn trong assets/ — mapping tên file gốc, bản copy ASCII, ý nghĩa logo
globs:
  - "assets/**"
  - "**/*.html"
---

# Tài sản có sẵn (`assets/`)

> **Cập nhật 2026-06-15 (deploy hygiene):** các **bản gốc tên có dấu**, ảnh dự phòng (`12/13/14.png`, `ờ.png`), `art-2.png` và `www.shopify.com_vn.png` **đã được xoá** để giảm gói deploy (65 MB → ~2 MB). Chỉ còn bản ASCII/WebP code thực sự dùng. Khôi phục từ git history nếu cần bản gốc độ phân giải cao. Ảnh nghệ thuật gradient nay là **WebP** (`art-1.webp`, `art-3.webp`, `art-4.webp`), không còn `art-1/3/4.png`.

| File gốc                                       | Bản copy ASCII (dùng trong code)      | Dùng cho                                                   |
| ---------------------------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| `Logo bản tối.png`                             | `logo-dark.png`                       | Logo Artdict (pixel-art "Art" + "dict.") — nền sáng        |
| `Logo bản sáng.png`                            | `logo-light.png`                      | Logo bản sáng — nền tối                                    |
| `Áo Artdict.png`                               | `ao-artdict.png`                      | Mockup áo thun                                             |
| `Áo Mèo Nổ 1/2.png`                            | `ao-meo-no-1.png` / `ao-meo-no-2.png` | Mockup áo "Mèo Nổ"                                         |
| `Áo Đồ để chơi Chất để đời 1.png`              | `ao-do-de-choi.png`                   | Mockup áo "Đồ để chơi"                                     |
| `Mũ Đồ để chơi Chất để đời 1.png` (+ bản Xanh) | `mu.png` / `mu-xanh.png`              | Mockup mũ                                                  |
| `Sổ tay.png`                                   | `so-tay.png`                          | Mockup sổ tay                                              |
| `Ảnh 2.png`, `Frame 112.png`                   | `art-1.png` / `art-2.png`             | Ảnh nghệ thuật / supporting visuals                        |
| `12/13/14.png`, `ờ.png`                        | —                                     | Ảnh nghệ thuật dự phòng                                    |
| `www.shopify.com_vn.png`                       | —                                     | **Chỉ là tham chiếu cấu trúc** — không phải asset hiển thị |

**Lưu ý filename:** tên gốc có dấu + khoảng trắng gây lỗi URL. Code tham chiếu **bản copy ASCII** (slug không dấu). Bản gốc vẫn giữ nguyên, không xoá. Khi thêm asset mới, tạo bản copy ASCII tương ứng.

Logo là chữ "Art" kiểu pixel-art viết tay + "dict." in nghiêng đậm → phản ánh tinh thần "nghệ thuật số phá cách". Cân nhắc dùng motif pixel này làm họa tiết phụ.

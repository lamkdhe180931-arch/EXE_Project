# Artdict - Trưng bày Nghệ thuật Tối giản (Minimalist Art Showcase)

Chào mừng bạn đến với **Artdict**, không gian triển lãm kỹ thuật số được thiết kế để trưng bày các sản phẩm nghệ thuật đương đại với phong cách cao cấp, tối giản và chuyên nghiệp.

Thiết kế của Artdict được lấy cảm hứng từ các phòng triển lãm nghệ thuật hiện đại và danh mục thiết kế cao cấp, nổi bật với sự kết hợp màu kem và đỏ crimson, kiểu chữ cấu trúc đậm nét và các hiệu ứng tương tác vi mô mượt mà theo thao tác cuộn.

---

## 🎨 Triết lý Thiết kế & Thẩm mỹ

Artdict được xây dựng dựa trên niềm tin rằng không gian trưng bày nên tôn vinh tác phẩm nghệ thuật, chứ không phải cạnh tranh với nó.

*   **Tối giản Ấm áp & Tương phản Cao**: Chúng tôi sử dụng một bảng màu tinh tế—Kem (`#fcfaf2`), Đỏ Crimson (`#a80c14`) và Đen Tuyền (`#0f0f0f`)—để thiết lập một hệ thống phân cấp rõ ràng, mang lại cảm giác nghệ thuật mạnh mẽ.
*   **Bố cục Động**: Thay vì các bố cục hình hộp tiêu chuẩn, phần hero và gallery có các sắp xếp xếp chồng tự nhiên. Phần Tuyên ngôn tự động cuộn đè lên phần hero cố định, tạo cảm giác về chiều sâu không gian.
*   **Kiểu chữ Tinh tế**: Sử dụng font chữ hình học không chân hiện đại (**Space Grotesk** và **Plus Jakarta Sans**) với khoảng cách chữ chặt chẽ để thể hiện diện mạo đương đại và chuyên nghiệp của chúng tôi, hỗ trợ hiển thị tiếng Việt hoàn hảo không bị lỗi dấu.
*   **Hoạt ảnh Tương tác Vi mô**: Mọi thao tác di chuột, kích hoạt cuộn và điều hướng menu đều đi kèm với các hiệu ứng chuyển cảnh mượt mà. Bao gồm hiệu ứng nghiêng 3D, bố cục lưới masonry và hiệu ứng hợp nhất chữ theo thao tác cuộn.

---

## 📂 Cấu trúc Dự án

Dự án được xây dựng bằng các công nghệ web thuần (Vanilla) để tối ưu hóa tốc độ tải và kiểm soát hoạt ảnh tốt nhất:

```text
├── index.html          # Cấu trúc cốt lõi và thẻ ngữ nghĩa của không gian triển lãm (Tiếng Việt)
├── style.css           # Hệ thống thiết kế CSS tùy chỉnh, kiểu chữ, lưới và hoạt ảnh mượt mà
├── main.js             # Javascript thuần để theo dõi cuộn trang, IntersectionObservers và hiệu ứng di chuột
├── assets/             # Các tài nguyên tác phẩm nghệ thuật và mockup
├── coding_style.md     # Quy chuẩn viết mã và thiết kế của dự án
└── README.md           # Tài liệu hướng dẫn dự án (Tiếng Việt)
```

---

## 🚀 Hướng dẫn Chạy Dự án

Để chạy dự án trên máy cục bộ của bạn:

1.  **Mở Thư mục**:
    Mở thư mục dự án trong trình soạn thảo mã nguồn bạn thích (ví dụ: VS Code).
    
2.  **Khởi chạy Server Cục bộ**:
    Vì dự án sử dụng HTML, CSS và JS thuần, bạn có thể chạy nó bằng bất kỳ server cục bộ đơn giản nào. Ví dụ:
    ```bash
    # Sử dụng Node.js npx
    npx browser-sync start --server --files "*.html, *.css, *.js"
    ```
    Hoặc bạn có thể dùng extension **Live Server** của VS Code để chạy nhanh chỉ với một cú nhấp chuột.

---

## ✅ Các Tính năng Đã Hoàn Thành

- [x] **Hero Collage Tương tác**: Phần mở đầu hiển thị các mockup tác phẩm xếp chồng lên nhau. Tiêu đề căn chỉnh và hợp nhất hoàn hảo thông qua hoạt ảnh cuộn trang.
- [x] **Phần Tuyên ngôn Ấn tượng**: Khối màu tối tương phản cao trình bày tầm nhìn cốt lõi của studio, tự động cuộn đè lên phần hero cố định.
- [x] **Lưới Danh mục dạng Masonry**: Bố cục kiểu Pinterest động cho các danh mục sản phẩm, có hiệu ứng nghiêng 3D khi di chuột và phóng to hình ảnh.
- [x] **Trưng bày Dự án Tương tác dạng Cột**: Bố cục hai cột nơi người dùng di chuột qua tên dự án để thấy hình ảnh xem trước hiển thị mượt mà ở khung bên trái cố định.
- [x] **Điều hướng & Menu Thích ứng**: Menu điều hướng phủ toàn màn hình mượt mà kích hoạt qua nút menu tối giản, sử dụng CSS `mix-blend-mode: difference` để hiển thị tốt trên mọi nền.
- [x] **Chân trang Biên tập (Editorial Footer)**: Khu vực liên hệ có kích thước chữ siêu lớn đầy ấn tượng để khuyến khích hợp tác.
- [x] **Hiệu ứng Xuất hiện khi Cuộn (Scroll Reveal)**: Tất cả các phần và mục sử dụng `IntersectionObserver` để tự động mờ dần và trượt vào khung nhìn khi người dùng cuộn xuống.
- [x] **Hỗ trợ Tiếng Việt & Font Space Grotesk**: Toàn bộ trang web đã được Việt hóa và tối ưu hóa font chữ Space Grotesk để không bị lỗi hiển thị dấu tiếng Việt, tinh chỉnh khoảng cách dòng (line-height) ngăn việc mất chữ khi zoom 100%.

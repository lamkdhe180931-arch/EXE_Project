# 📖 Hướng dẫn sử dụng Artdict (cho người vận hành)

> Dành cho người **không rành kỹ thuật**. Cứ làm theo từng bước, có hình minh hoạ bằng chữ "bạn sẽ thấy...". Khi gặp lỗi, xem mục **8. Xử lý sự cố** ở cuối.

---

## 1. Hệ thống gồm những gì?

Artdict có **2 mặt**:

| | Trang khách (công khai) | Trang quản trị (Admin) |
|---|---|---|
| **Ai dùng?** | Khách hàng vào xem & mua | Bạn — người vận hành |
| **Địa chỉ** | `http://localhost:8000/` | `http://localhost:8000/admin/login.html` |
| **Làm gì?** | Xem sản phẩm, nghệ sĩ, bài viết, đặt mua | Thêm/sửa sản phẩm, xem đơn hàng, viết bài… |

Đằng sau có **2 "máy chủ"** phải bật thì web mới chạy:
1. **Máy chủ Web** — hiện trang cho người xem.
2. **Máy chủ Backend** — kho dữ liệu (sản phẩm, đơn hàng…).

👉 **Bạn không cần hiểu kỹ thuật.** Chỉ cần nhớ: **bật cả 2, đừng đóng giữa chừng.**

---

## 2. Cách MỞ web (bật hệ thống)

### Cách dễ nhất — nhấp đúp 1 file

1. Mở thư mục dự án `Adddirct`.
2. Tìm file **`MO-WEB.bat`** → **nhấp đúp** vào nó.
3. Sẽ hiện ra **2 cửa sổ màu đen/xanh** (đó là 2 máy chủ) — **ĐỪNG ĐÓNG chúng**. Cứ thu nhỏ lại.
4. Sau ~5 giây, trình duyệt **tự mở** 2 tab: trang khách và trang đăng nhập admin.

> ⚠️ **Tuyệt đối không tắt 2 cửa sổ đen đó** khi đang bán hàng. Tắt = web sập, khách không vào được.

### Nếu nhấp đúp không chạy (làm tay)

Mở **2 cửa sổ PowerShell** (gõ "PowerShell" ở ô tìm kiếm Windows):

**Cửa sổ 1 — máy chủ backend:**
```
cd C:\Users\Admin\Desktop\Adddirct\backend
npm run dev
```
Thấy chữ `listening on 3000` (hoặc tương tự) = OK.

**Cửa sổ 2 — máy chủ web:**
```
cd C:\Users\Admin\Desktop\Adddirct
python -m http.server 8000
```
Thấy chữ `Serving HTTP on ... port 8000` = OK.

Rồi tự mở trình duyệt vào: **http://localhost:8000/admin/login.html**

---

## 3. Đăng nhập trang quản trị

1. Vào **http://localhost:8000/admin/login.html**
2. Nhập:
   - **Email:** `admin@artdict.vn`
   - **Mật khẩu:** (mật khẩu do người kỹ thuật đặt — hỏi họ nếu chưa biết)
3. Bấm **Đăng nhập** → vào **Bảng điều khiển (Dashboard)**.

> Phía trên có các mục: **Sản phẩm · Đơn hàng · Nghệ sĩ · Bài viết**. Đó là 4 việc chính bạn quản lý.

---

## 4. Quản lý SẢN PHẨM

Vào mục **Sản phẩm**.

### Thêm sản phẩm mới
1. Điền form: **Tên, Giá, Danh mục, Mô tả**, chọn **Nghệ sĩ** (nếu có).
2. **Ảnh:** bấm chọn ảnh từ máy → hệ thống tự tải lên. *(Nên dùng ảnh vuông, rõ nét.)*
3. Bấm **Lưu/Tạo** → sản phẩm xuất hiện trong danh sách bên dưới.
4. Mở trang khách (`http://localhost:8000/pages/catalogue.html`) bấm tải lại (F5) để kiểm tra.

### Sửa sản phẩm
- Bấm nút **Sửa** ở dòng sản phẩm → form điền sẵn → đổi nội dung → **Lưu**.

### Ẩn / hết hàng / xoá
- Bấm **Xóa** để gỡ sản phẩm khỏi trang khách *(thực chất là ẩn đi — đơn hàng cũ vẫn giữ được dữ liệu).*
- **Hết hàng:** chỉnh số lượng kho về 0 → trang khách tự hiện "Hết hàng" và không cho mua.

> **Danh mục** chỉ chọn trong danh sách có sẵn (áo thun, mũ, vòng tay, sổ tay, nhãn dán, móc khoá, tranh, khác). Đừng tự gõ danh mục lạ.

---

## 5. Quản lý ĐƠN HÀNG (quan trọng nhất)

Vào mục **Đơn hàng**. Đây là nơi xem khách đã mua gì.

### Quy trình xử lý 1 đơn
1. Khách đặt hàng → đơn hiện trong danh sách với trạng thái:
   - **PENDING / chờ thanh toán** — khách chưa trả tiền xong.
   - **PAID / đã thanh toán** — ✅ tiền đã về (qua MoMo), **bắt đầu chuẩn bị giao**.
   - **SHIPPED / đã giao** — bạn đã gửi hàng đi.
2. Bấm vào đơn để xem **tên, sđt, địa chỉ, sản phẩm, tổng tiền**.
3. Khi đã gói & gửi hàng → đổi trạng thái đơn sang **SHIPPED / Đã giao**.
   - Lúc này hệ thống **tự gửi email "đã gửi hàng"** cho khách *(nếu tính năng email đã được bật).*

> 💡 Chỉ giao hàng cho đơn **PAID**. Đơn **PENDING** là khách chưa trả tiền — đừng giao.

---

## 6. Quản lý NGHỆ SĨ & BÀI VIẾT

### Nghệ sĩ (mục **Nghệ sĩ**)
- **Thêm/Sửa:** điền tên, mô tả, 3 câu hỏi–đáp (Q&A), và **ảnh đại diện** (chọn từ máy).
- Sản phẩm gắn nghệ sĩ nào sẽ tự hiện ở trang nghệ sĩ đó.

### Bài viết (mục **Bài viết**) — Tin tức & Tạp chí
- **Thêm bài:** điền **Tiêu đề, Loại (Tin tức/Tạp chí), Nội dung**, có thể thêm **Ảnh bìa**.
- **Đăng / Ẩn:** mỗi dòng có nút bật/tắt nhanh — **Đăng** thì khách mới thấy, **Ẩn** thì giấu đi.
- **Sửa / Xóa:** nút ngay trên dòng.
- Viết nội dung: cách 1 dòng trống giữa các đoạn để web tự chia đoạn cho đẹp.

---

## 7. Cách TẮT web (cuối ngày / khi không dùng)

1. Quay lại **2 cửa sổ đen** đã mở lúc đầu.
2. Bấm vào từng cửa sổ, nhấn **Ctrl + C** (hoặc bấm dấu **X** đóng cửa sổ).
3. Xong — web tạm dừng. Muốn mở lại thì nhấp đúp `MO-WEB.bat` như Mục 2.

> Tắt web **không mất dữ liệu**. Sản phẩm, đơn hàng vẫn còn nguyên, lần sau mở lại vẫn đủ.

---

## 8. Xử lý sự cố thường gặp

| Hiện tượng | Nguyên nhân & cách xử lý |
|---|---|
| Trang khách trống / không thấy sản phẩm | Máy chủ **backend** chưa bật. Kiểm tra cửa sổ đen còn chạy không. Thử nhấp lại `MO-WEB.bat`. |
| Đăng nhập admin báo lỗi | Sai mật khẩu, hoặc backend chưa bật. Kiểm tra lại cả hai. |
| "This site can't be reached" | Cửa sổ đen đã bị đóng. Mở lại bằng `MO-WEB.bat`. |
| Sửa xong không thấy thay đổi trên trang khách | Bấm **Ctrl + Shift + R** để tải lại trang (xoá bộ nhớ tạm trình duyệt). |
| Tải ảnh lên báo lỗi | Ảnh quá nặng → dùng ảnh nhỏ hơn (dưới ~10 MB). |
| Trình duyệt không tự mở | Tự gõ vào thanh địa chỉ: `http://localhost:8000/admin/login.html` |

Nếu vẫn không được → chụp màn hình cửa sổ đen (có dòng chữ đỏ) gửi người kỹ thuật.

---

## 9. Ghi nhớ nhanh (in ra dán bàn)

- ✅ **Mở web:** nhấp đúp `MO-WEB.bat` → đợi 5 giây.
- ✅ **Vào quản trị:** `http://localhost:8000/admin/login.html`
- ✅ **2 cửa sổ đen = đừng đóng** khi đang chạy.
- ✅ **Chỉ giao đơn PAID**, giao xong đổi sang **SHIPPED**.
- ✅ **Tắt web:** đóng 2 cửa sổ đen. Dữ liệu vẫn còn.

---

> 📌 **Lưu ý:** Hướng dẫn này dành cho lúc chạy **trên máy tính này** (local). Khi web được **đưa lên mạng (deploy)** chính thức, bạn sẽ **không cần mở 2 cửa sổ đen nữa** — chỉ cần vào địa chỉ admin trên mạng (người kỹ thuật sẽ cung cấp link mới). Mọi thao tác quản lý ở Mục 4–6 vẫn giữ nguyên.

---

## 10. Khi web đã chạy trên mạng (online)

Sau khi deploy (xem `DEPLOY.md`):

- **Trang khách:** `https://<tên-miền>` (người kỹ thuật cung cấp, vd `https://artdict.vercel.app`).
- **Trang quản trị:** `https://<tên-miền>/admin/login.html` — đăng nhập như Mục 3.
- **KHÔNG cần** `MO-WEB.bat` hay 2 cửa sổ đen nữa — web chạy 24/7 trên mạng.
- Thao tác Sản phẩm / Đơn hàng / Nghệ sĩ / Bài viết (Mục 4–6) **giống hệt** bản local.
- ⚠️ Lần đầu vào sau một lúc không ai dùng, trang có thể **chậm ~50 giây** rồi mới hiện (máy chủ "ngủ dậy") — bình thường, cứ đợi.
- 💳 Thanh toán đang ở chế độ **thử nghiệm (MoMo sandbox)** — chưa nhận tiền thật. 📧 Email xác nhận đơn **chưa bật**. Hai mục này bật khi sẵn sàng (xem `DEPLOY.md`).

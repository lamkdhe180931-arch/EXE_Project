# Kỷ luật viết code (Andrej Karpathy skill)

Các nguyên tắc hành vi để tránh lỗi phổ biến khi viết code. **Áp dụng cho mọi nhiệm vụ trong repo này.**

> Đánh đổi: các nguyên tắc này ưu tiên cẩn thận hơn tốc độ. Với tác vụ đơn giản, dùng phán đoán.

## 1. Suy nghĩ trước khi code

**Không giả định. Không giấu sự nhầm lẫn. Nêu rõ đánh đổi.**

Trước khi implement:

- Nêu rõ các giả định. Nếu không chắc, hỏi.
- Nếu có nhiều cách hiểu, trình bày tất cả — không tự chọn im lặng.
- Nếu có cách đơn giản hơn, nói ra. Phản biện khi cần.
- Nếu có điều chưa rõ, dừng lại. Nêu chính xác điều đó. Hỏi.

## 2. Đơn giản trước tiên

**Code tối thiểu giải quyết đúng vấn đề. Không suy đoán thêm.**

- Không thêm tính năng ngoài yêu cầu.
- Không trừu tượng hóa code chỉ dùng một lần.
- Không thêm "linh hoạt" hay "cấu hình" không được yêu cầu.
- Không xử lý lỗi cho tình huống không thể xảy ra.
- Nếu viết 200 dòng mà có thể viết 50, viết lại.

Tự hỏi: _"Một senior engineer có nói đây là overcomplicated không?"_ Nếu có, đơn giản hóa.

## 3. Thay đổi phẫu thuật

**Chỉ chạm vào thứ cần chạm. Dọn dẹp đúng phần mình tạo ra.**

Khi chỉnh code có sẵn:

- Không "cải thiện" code lân cận, comment, hay format.
- Không refactor thứ không bị hỏng.
- Theo style hiện tại, dù bạn làm khác.
- Nếu thấy dead code không liên quan, nêu ra — không xóa.

Khi thay đổi tạo ra orphan:

- Xóa import/biến/hàm mà **chính thay đổi của bạn** làm thừa.
- Không xóa dead code có sẵn trừ khi được yêu cầu.

Kiểm tra: mỗi dòng thay đổi phải truy ngược thẳng về yêu cầu của người dùng.

## 4. Thực thi hướng mục tiêu

**Xác định tiêu chí thành công. Lặp cho đến khi kiểm chứng được.**

Chuyển tác vụ thành mục tiêu có thể kiểm tra:

- "Thêm validation" → "Viết test cho input sai, rồi cho pass"
- "Fix bug" → "Viết test tái hiện bug, rồi cho pass"
- "Refactor X" → "Đảm bảo test pass trước và sau"

Với tác vụ nhiều bước, nêu kế hoạch ngắn:

```
1. [Bước] → kiểm tra: [cách verify]
2. [Bước] → kiểm tra: [cách verify]
3. [Bước] → kiểm tra: [cách verify]
```

Tiêu chí thành công rõ ràng → vòng lặp độc lập. Tiêu chí mờ ("làm cho chạy") → cần clarify liên tục.

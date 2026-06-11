# Backend Artdict — Implementation Plan

Artdict hiện là static HTML/CSS/JS. Kế hoạch này xây dựng một REST API backend đầy đủ để hỗ trợ
quản lý sản phẩm, đơn hàng, nội dung, tích hợp thanh toán MoMo và email tự động.

---

## Stack quyết định

| Layer | Công nghệ |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (Access + Refresh token) |
| Thanh toán | MoMo Payment API |
| Email | Resend |
| Lưu trữ ảnh | Cloudinary |
| Deploy | Railway hoặc Render |
| API Style | REST + Swagger docs |
| Admin FE | HTML/CSS dashboard viết tay |

---

## Proposed Changes

### Phase 1 — Foundation (Khởi tạo dự án & DB)

#### [NEW] `backend/` — thư mục gốc backend
Tạo riêng bên cạnh (hoặc trong) repo Artdict hiện tại.

```
backend/
├── prisma/
│   ├── schema.prisma       ← data model
│   └── migrations/
├── src/
│   ├── index.js            ← entrypoint Express
│   ├── routes/             ← route files
│   ├── controllers/        ← business logic
│   ├── middlewares/        ← auth, error handler
│   ├── services/           ← momo, resend, cloudinary
│   └── utils/
├── .env.example
├── package.json
└── README.md
```

#### [NEW] `prisma/schema.prisma` — Data model

Các bảng cần thiết:

```
User          — id, email, name, role (ADMIN|CUSTOMER), passwordHash, createdAt
RefreshToken  — id, userId, token, expiresAt

Artist        — id, name, slug, bio, avatarUrl, createdAt
Product       — id, name, slug, price, stock, artistId, images[], category, isActive
ProductImage  — id, productId, url, order

Order         — id, userId?, guestEmail, status, total, momoTransactionId, createdAt
OrderItem     — id, orderId, productId, qty, priceAtTime, size

Post          — id, type (NEWS|JOURNAL), title, slug, body, publishedAt
```

> [!IMPORTANT]
> `userId` trong Order nullable để hỗ trợ guest checkout (không bắt user tạo account).

---

### Phase 2 — Auth API

#### [NEW] `src/routes/auth.js`

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản khách hàng |
| POST | `/api/auth/login` | Đăng nhập → trả access + refresh token |
| POST | `/api/auth/refresh` | Lấy access token mới bằng refresh token |
| POST | `/api/auth/logout` | Revoke refresh token |

JWT strategy:
- **Access token**: hết hạn 15 phút, lưu memory FE
- **Refresh token**: hết hạn 7 ngày, lưu DB, gửi qua `httpOnly cookie`

---

### Phase 3 — Product & Artist API

#### [NEW] `src/routes/products.js`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/products` | Public | Danh sách, filter theo category/artist |
| GET | `/api/products/:slug` | Public | Chi tiết sản phẩm |
| POST | `/api/products` | Admin | Tạo sản phẩm mới |
| PATCH | `/api/products/:id` | Admin | Cập nhật sản phẩm |
| DELETE | `/api/products/:id` | Admin | Xóa mềm (isActive = false) |
| POST | `/api/products/:id/images` | Admin | Upload ảnh lên Cloudinary |

#### [NEW] `src/routes/artists.js`

CRUD tương tự, public read — admin write.

---

### Phase 4 — Order & Checkout API

#### [NEW] `src/routes/orders.js`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/orders` | Optional | Tạo đơn hàng (có thể guest) |
| GET | `/api/orders` | Admin | Danh sách tất cả đơn |
| GET | `/api/orders/my` | Customer | Đơn của user hiện tại |
| GET | `/api/orders/:id` | Admin / Owner | Chi tiết đơn |
| PATCH | `/api/orders/:id/status` | Admin | Cập nhật trạng thái |

Luồng checkout:
```
FE gửi POST /api/orders
  → Backend tạo Order (status: PENDING)
  → Gọi MoMo API tạo payment link
  → Trả về { orderId, momoPaymentUrl }
  → FE redirect sang MoMo

MoMo callback POST /api/orders/momo-callback
  → Verify chữ ký HMAC
  → Cập nhật Order status: PAID
  → Trừ tồn kho
  → Gửi email xác nhận (Resend)
```

---

### Phase 5 — Content API (News/Journal)

#### [NEW] `src/routes/posts.js`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/posts?type=NEWS` | Public | Danh sách bài |
| GET | `/api/posts/:slug` | Public | Chi tiết bài |
| POST | `/api/posts` | Admin | Tạo bài mới |
| PATCH | `/api/posts/:id` | Admin | Sửa bài |

---

### Phase 6 — Email Templates (Resend)

#### [NEW] `src/services/email.js`

Template cần thiết:
- **Order Confirmation** — gửi ngay khi MoMo callback thành công
- **Order Shipped** — admin cập nhật status → SHIPPED
- **Artist Application** — khi nghệ sĩ gửi qua submit.html

---

### Phase 7 — Admin Panel (HTML/CSS)

#### [NEW] `admin/` — thư mục riêng, cùng level với `backend/`

Các trang dashboard:
- `admin/index.html` — dashboard tổng quan (doanh thu, đơn mới, tồn kho thấp)
- `admin/products.html` — CRUD sản phẩm + upload ảnh Cloudinary
- `admin/orders.html` — danh sách đơn, cập nhật trạng thái
- `admin/artists.html` — quản lý nghệ sĩ **(xem chi tiết bên dưới)**
- `admin/posts.html` — viết bài news/journal

Bảo vệ bằng: kiểm tra JWT Admin role trước khi render, redirect nếu không hợp lệ.

#### Thiết kế form `admin/artists.html` — Nội dung trang tác giả

**Quyết định: JSON blocks cố định (3 Q&A)** — phù hợp với layout `artist.html` hiện tại.

Admin điền form có cấu trúc sẵn, không cần viết code hay Markdown:

```
[Tên nghệ sĩ]          ___________
[Vai trò]              ___________   (ví dụ: Họa sĩ minh họa)
[Thành phố]            ___________
[Hoạt động từ năm]     ___________
[Ảnh chân dung]        [Upload]
[Pull quote lớn]       ___________   (câu nói nổi bật, hiển thị banner)

─── Câu hỏi phỏng vấn ──────────────────────
Câu 1 - Tiêu đề:      ___________
Câu 1 - Nội dung:     [textarea, hỗ trợ \n\n để xuống đoạn]

Câu 2 - Tiêu đề:      ___________
Câu 2 - Nội dung:     [textarea]

Câu 3 - Tiêu đề:      ___________
Câu 3 - Nội dung:     [textarea]
```

**Cấu trúc JSON lưu trong DB (cột `content` kiểu `jsonb` trong PostgreSQL):**

```json
{
  "quote": "Tôi không vẽ để treo lên tường. Tôi vẽ để người ta mặc nó ra phố.",
  "qa": [
    {
      "id": "cau-chuyen",
      "q": "Câu chuyện đằng sau 'Mực Tàu' bắt đầu từ đâu?",
      "a": "Mình lớn lên trong một con hẻm ở Quận 5...\n\nMực Tàu là nỗ lực mang chất liệu đó lên vải..."
    },
    {
      "id": "ngon-ngu",
      "q": "Ngôn ngữ tạo hình của bạn được định hình thế nào?",
      "a": "Mình giới hạn rất chặt: gần như chỉ có mực đen và đỏ son..."
    },
    {
      "id": "goc-nhin",
      "q": "Với bạn, nghệ thuật nên sống ở đâu?",
      "a": "Trong tủ quần áo, trên ba lô, ở quán cà phê..."
    }
  ]
}
```

**FE render:** `artist.html` gọi `GET /api/artists/:slug`, nhận JSON trên → render Q&A và ToC tự động bằng JS. `\n\n` trong `a` được split thành `<p>` riêng.

**Prisma schema cho Artist:**

```prisma
model Artist {
  id        Int      @id @default(autoincrement())
  name      String
  slug      String   @unique
  role      String
  city      String
  since     Int
  avatarUrl String?
  content   Json     // chứa { quote, qa[] } như trên
  products  Product[]
  createdAt DateTime @default(now())
}
```

---

## Open Questions

> [!IMPORTANT]
> **Tồn kho theo size**: Artdict bán áo thun có size S/M/L/XL. Tồn kho cần tính **theo từng size**
> hay chỉ cần một số tổng cho toàn sản phẩm?
> → *Đề xuất: tồn kho theo size (bảng `ProductVariant`)* — chi tiết hơn, chính xác hơn.

> [!IMPORTANT]
> **Guest checkout**: Khách không có account thì nhập email khi checkout. Sau đó có muốn
> cho phép họ **tra cứu đơn hàng bằng email + mã đơn** không (không cần đăng nhập)?

> [!NOTE]
> **Phí ship**: Artdict tính phí vận chuyển cố định hay tích hợp GHN/GHTK API để tính động?
> → *Đề xuất: cố định trước (miễn phí >500K), tích hợp GHN sau*.

---

## Verification Plan

### Automated Tests
- Unit test controllers với Jest
- Integration test MoMo callback với mock webhook

### Manual Verification
1. Tạo đơn hàng end-to-end: FE → API → MoMo sandbox → callback → email
2. Kiểm tra Admin panel CRUD sản phẩm + upload ảnh
3. Test JWT refresh flow: access token hết hạn → auto refresh

---

## Thứ tự triển khai gợi ý

```
Phase 1: Khởi tạo dự án, schema Prisma, kết nối PG        [~1 ngày]
Phase 2: Auth (register/login/refresh)                      [~1 ngày]
Phase 3: Product & Artist CRUD + Cloudinary                 [~2 ngày]
Phase 4: Order + MoMo integration + Email                   [~2-3 ngày]
Phase 5: Content API                                        [~0.5 ngày]
Phase 6: Admin Panel HTML                                   [~2 ngày]
Deploy lên Railway + config env                             [~0.5 ngày]
```

import { BodyClass } from "@/components/site/BodyClass";
const html = `<main class="pdp-main">
      <!-- Breadcrumb -->
      <div class="pdp-breadcrumb-bar">
        <div class="pdp-container">
          <nav
            class="pdp-breadcrumb"
            id="pdp-breadcrumb"
            aria-label="Breadcrumb"
          >
            <a href="/">Trang chủ</a>
            <span class="pdp-breadcrumb-sep">›</span>
            <a href="#">Áo thun Streetwear</a>
            <span class="pdp-breadcrumb-sep">›</span>
            <span class="pdp-breadcrumb-current"
              >Áo Đồ Để Chơi Chất Để Đời</span
            >
          </nav>
        </div>
      </div>

      <!-- ============================
         PRODUCT SHOWCASE (Dark BG)
         ============================ -->
      <section class="pdp-showcase" id="pdp-showcase">
        <div class="pdp-container">
          <div class="pdp-showcase-grid">
            <!-- Gallery (Left Column) -->
            <div class="pdp-gallery" data-reveal>
              <div class="pdp-gallery-thumbs" id="pdp-thumbs">
                <button
                  class="pdp-thumb active"
                  data-img="/assets/Áo Đồ để chơi Chất để đời 1.png"
                  aria-label="Xem ảnh 1"
                >
                  <img
                    src="/assets/Áo Đồ để chơi Chất để đời 1.png"
                    alt="Áo Đồ Để Chơi - Mặt trước"
                  />
                </button>
                <button
                  class="pdp-thumb"
                  data-img="/assets/Sổ tay.png"
                  aria-label="Xem ảnh 2"
                >
                  <img src="/assets/Sổ tay.png" alt="Sổ tay thiết kế đi kèm" />
                </button>
                <button
                  class="pdp-thumb"
                  data-img="/assets/12.png"
                  aria-label="Xem ảnh 3"
                >
                  <img src="/assets/12.png" alt="Chi tiết hoạ tiết" />
                </button>
                <button
                  class="pdp-thumb"
                  data-img="/assets/Ảnh 2.png"
                  aria-label="Xem ảnh 4"
                >
                  <img src="/assets/Ảnh 2.png" alt="Phong cách phối đồ" />
                </button>
              </div>
              <div class="pdp-gallery-main" id="pdp-main-image">
                <img
                  src="/assets/Áo Đồ để chơi Chất để đời 1.png"
                  alt="Áo Đồ Để Chơi Chất Để Đời"
                  id="pdp-main-img"
                />
              </div>
            </div>

            <!-- Product Info (Right Column) -->
            <div class="pdp-info" data-reveal>
              <h1 class="pdp-product-title" id="pdp-product-title">
                Áo Đồ Để Chơi<br />Chất Để Đời
              </h1>
              <div class="pdp-price" id="pdp-price">350.000 VNĐ</div>
              <p class="pdp-stock">Còn hàng, đủ size & màu sắc.</p>

              <!-- Actions -->
              <div class="pdp-actions">
                <div class="pdp-qty-row">
                  <div class="pdp-qty" id="pdp-qty">
                    <button
                      class="pdp-qty-btn"
                      id="pdp-qty-minus"
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <span class="pdp-qty-value" id="pdp-qty-value">1</span>
                    <button
                      class="pdp-qty-btn"
                      id="pdp-qty-plus"
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                  <button class="pdp-btn-secondary" id="pdp-add-cart">
                    Thêm vào giỏ hàng
                  </button>
                </div>
                <button class="pdp-btn-primary" id="pdp-buy-now">
                  Mua ngay
                </button>
              </div>

              <!-- Features -->
              <div class="pdp-features">
                <div class="pdp-feature" id="feature-gift">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 12v10H4V12" />
                    <path d="M2 7h20v5H2z" />
                    <path d="M12 22V7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                  <span>Miễn phí đóng gói quà tặng đặc biệt</span>
                </div>
                <div class="pdp-feature" id="feature-return">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  <span>Đổi sản phẩm trong vòng 7 ngày với đơn online</span>
                </div>
                <div class="pdp-feature" id="feature-shipping">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>Freeship toàn quốc với đơn trên 500.000đ</span>
                </div>
              </div>

              <!-- Product Specs -->
              <div class="pdp-specs">
                <p class="pdp-specs-note">
                  <em
                    >Lưu ý: Sản phẩm sử dụng đồ tự nhiên nên mỗi sản phẩm sẽ có
                    sắc độ, đường vân và hiệu ứng khác nhau.</em
                  >
                </p>
                <ul class="pdp-specs-list">
                  <li>
                    <strong>Tên sản phẩm:</strong> Áo Đồ Để Chơi Chất Để Đời
                  </li>
                  <li><strong>Chất liệu:</strong> Cotton 100% cao cấp</li>
                  <li><strong>Size:</strong> S / M / L / XL</li>
                  <li><strong>Thiết kế:</strong> Giới hạn 50 chiếc</li>
                </ul>
              </div>

              <!-- Expandable Info Rows -->
              <div class="pdp-info-accordions" id="pdp-info-accordions">
                <div class="pdp-info-row" id="info-row-details">
                  <button class="pdp-info-row-header" aria-expanded="false">
                    <span>Thông tin thêm</span>
                    <span class="pdp-info-row-icon">+</span>
                  </button>
                  <div class="pdp-info-row-content">
                    <p>
                      Áo được in bằng công nghệ DTG (Direct-to-Garment) cao cấp,
                      đảm bảo hình ảnh sắc nét, bền màu sau nhiều lần giặt. Form
                      áo Regular Fit phù hợp nhiều dáng người.
                    </p>
                  </div>
                </div>
                <div class="pdp-info-row" id="info-row-warranty">
                  <button class="pdp-info-row-header" aria-expanded="false">
                    <span>Chính sách bảo hành</span>
                    <span class="pdp-info-row-icon">+</span>
                  </button>
                  <div class="pdp-info-row-content">
                    <p>
                      Bảo hành 30 ngày cho lỗi sản xuất. Đổi trả miễn phí trong
                      7 ngày nếu sản phẩm chưa qua sử dụng và còn nguyên tag.
                    </p>
                  </div>
                </div>
                <div class="pdp-info-row" id="info-row-care">
                  <button class="pdp-info-row-header" aria-expanded="false">
                    <span>Hướng dẫn bảo quản sản phẩm</span>
                    <span class="pdp-info-row-icon">+</span>
                  </button>
                  <div class="pdp-info-row-content">
                    <p>
                      Giặt máy ở nhiệt độ thường, lộn trái khi giặt. Không sử
                      dụng chất tẩy. Phơi trong bóng râm. Ủi mặt trái ở nhiệt độ
                      thấp.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================
         TABS (Dark BG)
         ============================ -->
      <section class="pdp-tabs-section" id="pdp-tabs-section">
        <div class="pdp-container">
          <div class="pdp-tabs" id="pdp-tabs">
            <button class="pdp-tab active" data-tab="desc" id="tab-desc">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Mô tả sản phẩm
            </button>
            <button class="pdp-tab" data-tab="reviews" id="tab-reviews">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                />
              </svg>
              Đánh giá ( 0 )
            </button>
          </div>
        </div>
      </section>

      <!-- ============================
         REVIEWS PANEL (Hidden by default, Dark BG)
         ============================ -->
      <section
        class="pdp-reviews-section"
        id="pdp-reviews-section"
        style="display: none"
      >
        <div class="pdp-container">
          <div class="pdp-reviews-container" data-reveal>
            <div class="pdp-reviews-summary">
              <h3>Đánh giá khách hàng</h3>
              <div class="pdp-rating-stars-large">
                <span class="star-icon">☆</span>
                <span class="star-icon">☆</span>
                <span class="star-icon">☆</span>
                <span class="star-icon">☆</span>
                <span class="star-icon">☆</span>
                <span class="rating-text">Chưa có đánh giá nào</span>
              </div>
              <button class="pdp-btn-outline" id="pdp-write-review-btn">
                Viết đánh giá
              </button>
            </div>

            <!-- Review Form (Hidden by default) -->
            <form
              class="pdp-review-form"
              id="pdp-review-form"
              style="display: none"
            >
              <h4>Viết đánh giá của bạn</h4>
              <div class="pdp-form-group">
                <label>Xếp hạng của bạn</label>
                <div class="pdp-rating-input" id="pdp-rating-input">
                  <span class="star-select" data-value="1">☆</span>
                  <span class="star-select" data-value="2">☆</span>
                  <span class="star-select" data-value="3">☆</span>
                  <span class="star-select" data-value="4">☆</span>
                  <span class="star-select" data-value="5">☆</span>
                </div>
              </div>
              <div class="pdp-form-row">
                <div class="pdp-form-group">
                  <label for="review-name">Tên hiển thị</label>
                  <input
                    type="text"
                    id="review-name"
                    placeholder="Nhập tên hiển thị của bạn"
                    required
                  />
                </div>
                <div class="pdp-form-group">
                  <label for="review-email">Email</label>
                  <input
                    type="email"
                    id="review-email"
                    placeholder="Nhập email của bạn (không công khai)"
                    required
                  />
                </div>
              </div>
              <div class="pdp-form-group">
                <label for="review-title">Tiêu đề đánh giá</label>
                <input
                  type="text"
                  id="review-title"
                  placeholder="Ví dụ: Áo mặc rất mát, thiết kế độc đáo!"
                  required
                />
              </div>
              <div class="pdp-form-group">
                <label for="review-body">Nội dung đánh giá</label>
                <textarea
                  id="review-body"
                  rows="5"
                  placeholder="Viết phản hồi chi tiết về sản phẩm tại đây..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                class="pdp-btn-primary"
                style="width: auto; padding: 0 3rem"
              >
                Gửi đánh giá
              </button>
            </form>
          </div>
        </div>
      </section>

      <!-- ============================
         PRODUCT STORY (Dark → Cream transition)
         ============================ -->
      <section class="pdp-story" id="pdp-story">
        <div class="pdp-container">
          <div class="pdp-story-intro" data-reveal>
            <span class="pdp-story-badge">Câu chuyện sản phẩm</span>
            <h2 class="pdp-story-headline">
              Đằng sau mỗi chế tác<br />luôn là một câu chuyện<br />
              <span class="pdp-story-italic">riêng biệt…</span>
            </h2>
            <div class="pdp-story-lead">
              <p>
                "ÁO ĐỒ ĐỂ CHƠI CHẤT ĐỂ ĐỜI" được ghi lại từ một câu khẩu hiệu
                nổi tiếng — lấy cảm hứng từ triết lý sống hết mình của thế hệ
                trẻ Việt Nam. Mỗi sản phẩm không chỉ là trang phục, mà là một
                tuyên ngôn về phong cách sống, về cách bạn chọn thể hiện bản
                thân mình giữa đám đông.
              </p>
            </div>
            <button class="pdp-story-expand" id="pdp-story-expand">
              <span>Xem thêm</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          <!-- Expandable story detail -->
          <div class="pdp-story-detail" id="pdp-story-detail">
            <p>
              Ý tưởng bắt nguồn từ những buổi tối muộn tại studio thiết kế của
              sinh viên FPT — nơi ranh giới giữa "chơi" và "làm nghệ thuật" trở
              nên mờ nhạt. Nhóm thiết kế muốn tạo ra một chiếc áo vừa mang tính
              đường phố mạnh mẽ, vừa chứa đựng thông điệp sâu sắc về giá trị bền
              vững của sáng tạo.
            </p>
            <p>
              Hoạ tiết trên áo được vẽ tay bởi nghệ sĩ trong nhóm, sau đó được
              số hoá và in bằng công nghệ DTG (Direct-to-Garment) để giữ nguyên
              nét vẽ tay mộc mạc nhưng sắc nét trên vải cotton cao cấp. Mỗi
              chiếc áo là một bản in giới hạn — chỉ 50 chiếc được sản xuất.
            </p>
          </div>
        </div>
      </section>

      <!-- ============================
         MATERIALS & INSPIRATION (Cream BG)
         ============================ -->
      <section class="pdp-materials" id="pdp-materials">
        <div class="pdp-container">
          <div class="pdp-materials-grid">
            <!-- Block 1: Text + Image -->
            <div class="pdp-materials-text" data-reveal>
              <h2 class="pdp-materials-title">
                Câu chuyện từ chất liệu<br />tạo nên cái nhìn<br />
                <span class="pdp-materials-accent">đầy chiêm nghiệm</span>
              </h2>
              <p>
                Với các dòng sản phẩm cao cấp, Artdict chọn lọc chất liệu cotton
                100% hữu cơ từ những nhà cung ứng đáng tin cậy. Cảm nhận Mekong,
                mỗi tấm vải gợi nhớ về dòng sông quê hương, dẻo dai như lời ru
                và mát lành như gió đồng bằng.
              </p>
              <p>
                Ở các công đoạn tinh chỉnh, chúng tôi sử dụng phương pháp nhuộm
                enzyme thân thiện — không chứa hoá chất độc hại, đảm bảo an toàn
                cho da nhạy cảm và giảm thiểu tác động môi trường.
              </p>
            </div>
            <div class="pdp-materials-image" data-reveal>
              <img src="/assets/13.png" alt="Chất liệu và quá trình sáng tạo" />
            </div>

            <!-- Block 2: Image + Text (reversed) -->
            <div class="pdp-materials-image pdp-materials-image-2" data-reveal>
              <img src="/assets/14.png" alt="Quá trình thiết kế và chế tác" />
            </div>
            <div class="pdp-materials-text pdp-materials-text-2" data-reveal>
              <h3 class="pdp-materials-subtitle">
                Hành trình chế tác<br />thủ công bạc
              </h3>
              <p>
                Mỗi món trang sức của Artdict đều được chế tác thủ công bởi nghệ
                thợ kim hoàn lành nghề, mang trọn tâm huyết và niềm đam mê trong
                từng nét chạm khắc tỉ mỉ. Từ bản vẽ phác thảo đầu tiên đến sản
                phẩm hoàn thiện, mỗi tác phẩm trải qua hơn 20 công đoạn thủ
                công, đảm bảo sự hoàn hảo ở từng chi tiết nhỏ nhất.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================
         FAQ SECTION (Cream BG)
         ============================ -->
      <section class="pdp-faq-section" id="pdp-faq-section">
        <div class="pdp-container">
          <h2 class="pdp-faq-title" data-reveal>Câu Hỏi Thường Gặp!</h2>

          <div class="pdp-faq-list" id="pdp-faq-list">
            <div class="pdp-faq-item" data-reveal>
              <button
                class="pdp-faq-question"
                id="faq-q1"
                aria-expanded="false"
              >
                <span
                  >Artdict có nhận thiết kế/custom riêng sản phẩm theo yêu cầu
                  không?</span
                >
                <span class="pdp-faq-icon">+</span>
              </button>
              <div class="pdp-faq-answer">
                <p>
                  Có! Chúng tôi nhận thiết kế custom cho đơn hàng từ 10 sản phẩm
                  trở lên. Liên hệ qua email hoặc Instagram để được tư vấn chi
                  tiết.
                </p>
              </div>
            </div>

            <div class="pdp-faq-item" data-reveal>
              <button
                class="pdp-faq-question"
                id="faq-q2"
                aria-expanded="false"
              >
                <span>Artdict có thu mua sản phẩm cũ không?</span>
                <span class="pdp-faq-icon">+</span>
              </button>
              <div class="pdp-faq-answer">
                <p>
                  Hiện tại chúng tôi chưa có chương trình thu mua lại, nhưng
                  đang phát triển dự án "Art Reborn" — tái chế sản phẩm cũ thành
                  tác phẩm mới.
                </p>
              </div>
            </div>

            <div class="pdp-faq-item" data-reveal>
              <button
                class="pdp-faq-question"
                id="faq-q3"
                aria-expanded="false"
              >
                <span>Sau bao lâu tôi sẽ nhận được hàng?</span>
                <span class="pdp-faq-icon">+</span>
              </button>
              <div class="pdp-faq-answer">
                <p>
                  Đơn hàng nội thành TP.HCM và Hà Nội: 1-2 ngày. Các tỉnh thành
                  khác: 3-5 ngày. Đơn hàng custom sẽ cần thêm 5-7 ngày sản xuất.
                </p>
              </div>
            </div>

            <div class="pdp-faq-item" data-reveal>
              <button
                class="pdp-faq-question"
                id="faq-q4"
                aria-expanded="false"
              >
                <span
                  >Sản phẩm nhỏ của Artdict có thể tặng hoặc hộp quà
                  không?</span
                >
                <span class="pdp-faq-icon">+</span>
              </button>
              <div class="pdp-faq-answer">
                <p>
                  Tất cả sản phẩm đều có thể được đóng gói quà tặng miễn phí với
                  hộp thiết kế riêng của Artdict, kèm thiệp viết tay theo yêu
                  cầu.
                </p>
              </div>
            </div>

            <div class="pdp-faq-item" data-reveal>
              <button
                class="pdp-faq-question"
                id="faq-q5"
                aria-expanded="false"
              >
                <span>Artdict có cung cấp dịch vụ gửi quà không?</span>
                <span class="pdp-faq-icon">+</span>
              </button>
              <div class="pdp-faq-answer">
                <p>
                  Có! Chúng tôi hỗ trợ gửi quà trực tiếp đến người nhận với dịch
                  vụ "Gift Delivery". Bạn chỉ cần cung cấp địa chỉ và lời nhắn,
                  chúng tôi sẽ lo phần còn lại.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================
         RELATED PRODUCTS (Cream BG)
         ============================ -->
      <section class="pdp-related" id="pdp-related">
        <div class="pdp-container">
          <div class="showcase-header" data-reveal>
            <span class="showcase-title">Bạn cũng có thể thích</span>
            <a href="/catalogue" class="showcase-view-all"
              >Xem tất cả &rarr;</a
            >
          </div>

          <div class="showcase-grid" data-reveal>
            <!-- Related Item 1 -->
            <a href="/products/ao-do-de-choi-chat-de-doi" class="showcase-item" id="related-1">
              <div class="showcase-img-wrapper">
                <span class="pdp-related-badge-tag">MỚI</span>
                <img src="/assets/Áo Mèo Nổ 1.png" alt="Áo Thun Mèo Nổ V1" />
              </div>
              <div class="showcase-info">
                <h3 class="product-name">Áo Thun Mèo Nổ V1</h3>
                <span class="product-price">320.000đ</span>
              </div>
            </a>

            <!-- Related Item 2 -->
            <a href="#" class="showcase-item" id="related-2">
              <div class="showcase-img-wrapper">
                <img src="/assets/Áo Mèo Nổ 2.png" alt="Áo Thun Mèo Nổ V2" />
              </div>
              <div class="showcase-info">
                <h3 class="product-name">Áo Thun Mèo Nổ V2</h3>
                <span class="product-price">320.000đ</span>
              </div>
            </a>

            <!-- Related Item 3 -->
            <a href="#" class="showcase-item" id="related-3">
              <div class="showcase-img-wrapper">
                <span class="pdp-related-badge-tag">MỚI</span>
                <img
                  src="/assets/Áo Artdict.png"
                  alt="Áo Thun Artdict Classic"
                />
              </div>
              <div class="showcase-info">
                <h3 class="product-name">Áo Thun Artdict Classic</h3>
                <span class="product-price">380.000đ</span>
              </div>
            </a>

            <!-- Related Item 4 -->
            <a href="#" class="showcase-item" id="related-4">
              <div class="showcase-img-wrapper">
                <img
                  src="/assets/Mũ Đồ để chơi Chất để đời 1.png"
                  alt="Mũ Đồ Để Chơi Chất Để Đời"
                />
              </div>
              <div class="showcase-info">
                <h3 class="product-name">Mũ Đồ Để Chơi Chất Để Đời</h3>
                <span class="product-price">250.000đ</span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </main>`;

export default function ProductPage() {
  return (
    <>
      <BodyClass className="pdp-page" />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

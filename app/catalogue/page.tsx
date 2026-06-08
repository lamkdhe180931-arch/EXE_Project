import { BodyClass } from "@/components/site/BodyClass";
const html = `<main class="catalogue-main">
      <!-- Sub-navigation Bar / Breadcrumb & Filters -->
      <section class="catalogue-meta-bar">
        <div class="meta-left">
          <nav
            class="catalogue-breadcrumb"
            id="catalogue-breadcrumb"
            aria-label="Breadcrumb"
          >
            <a href="/">Trang chủ</a>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current">Bộ sưu tập</span>
          </nav>
        </div>
        <div class="meta-center">
          <span class="product-count" id="product-count-display"
            >12 / 24 sản phẩm</span
          >
        </div>
        <div class="meta-right">
          <button
            class="filter-toggle-btn"
            id="filter-toggle-btn"
            aria-label="Mở bộ lọc"
          >
            Lọc & Sắp xếp
          </button>
        </div>
      </section>

      <!-- Expandable Filter & Sort Panel -->
      <section class="filter-panel" id="filter-panel">
        <div class="filter-panel-inner">
          <!-- Category Filters -->
          <div class="filter-group">
            <span class="filter-label">Danh mục</span>
            <div class="filter-options" id="category-filters-container">
              <button
                class="filter-btn active"
                data-category="all"
                id="filter-all"
              >
                Tất cả
              </button>
              <button class="filter-btn" data-category="áo" id="filter-ao">
                Áo
              </button>
              <button class="filter-btn" data-category="mũ" id="filter-mu">
                Mũ
              </button>
              <button
                class="filter-btn"
                data-category="phụ kiện"
                id="filter-phukien"
              >
                Phụ kiện
              </button>
              <button
                class="filter-btn"
                data-category="bookmark"
                id="filter-bookmark"
              >
                Bookmark
              </button>
              <button
                class="filter-btn"
                data-category="tranh"
                id="filter-tranh"
              >
                Tranh
              </button>
              <button class="filter-btn" data-category="khác" id="filter-khac">
                Khác
              </button>
            </div>
          </div>

          <!-- Sorting Options -->
          <div class="filter-group">
            <span class="filter-label">Sắp xếp theo giá</span>
            <div class="sort-options" id="price-sorts-container">
              <button class="sort-btn" data-sort="default" id="sort-default">
                Mặc định
              </button>
              <button class="sort-btn" data-sort="asc" id="sort-asc">
                Thấp đến Cao
              </button>
              <button class="sort-btn" data-sort="desc" id="sort-desc">
                Cao đến Thấp
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Irregular Masonry Product Grid -->
      <section class="catalogue-grid-section">
        <div class="catalogue-grid" id="catalogue-grid">
          <!-- Product Card 1: Áo Đồ Để Chơi Chất Để Đời -->
          <div
            class="product-card aspect-landscape"
            data-id="1"
            data-category="áo"
            data-price="350000"
          >
            <a href="/products/ao-do-de-choi-chat-de-doi" class="product-card-link">
              <div class="product-image-wrapper bg-navy">
                <img
                  src="/assets/Áo Đồ để chơi Chất để đời 1.png"
                  alt="Áo Đồ Để Chơi Chất Để Đời"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title"
                    >ÁO ĐỒ ĐỂ CHƠI CHẤT ĐỂ ĐỜI</span
                  >
                  <span class="product-card-category-price">ÁO / 350.000đ</span>
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 2: Áo Thun Mèo Nổ V1 -->
          <div
            class="product-card aspect-tall"
            data-id="2"
            data-category="áo"
            data-price="320000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-sage">
                <img
                  src="/assets/Áo Mèo Nổ 1.png"
                  alt="Áo Thun Mèo Nổ V1"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title">ÁO THUN MÈO NỔ V1</span>
                  <span class="product-card-category-price">ÁO / 320.000đ</span>
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 3: Áo Thun Mèo Nổ V2 -->
          <div
            class="product-card aspect-square"
            data-id="3"
            data-category="áo"
            data-price="320000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-terracotta">
                <img
                  src="/assets/Áo Mèo Nổ 2.png"
                  alt="Áo Thun Mèo Nổ V2"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title">ÁO THUN MÈO NỔ V2</span>
                  <span class="product-card-category-price">ÁO / 320.000đ</span>
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 4: Mũ Đồ Để Chơi Đen -->
          <div
            class="product-card aspect-tall"
            data-id="4"
            data-category="mũ"
            data-price="250000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-cream-warm">
                <img
                  src="/assets/Mũ Đồ để chơi Chất để đời 1.png"
                  alt="Mũ Đồ Để Chơi Đen"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title"
                    >MŨ ĐỒ ĐỂ CHƠI CHẤT ĐỂ ĐỜI (ĐEN)</span
                  >
                  <span class="product-card-category-price">MŨ / 250.000đ</span>
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 5: Mũ Đồ Để Chơi Xanh -->
          <div
            class="product-card aspect-landscape"
            data-id="5"
            data-category="mũ"
            data-price="250000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-charcoal">
                <img
                  src="/assets/Mũ Đồ để chơi Chất để đời 1 Xanh.png"
                  alt="Mũ Đồ Để Chơi Xanh"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title"
                    >MŨ ĐỒ ĐỂ CHƠI CHẤT ĐỂ ĐỜI (XANH)</span
                  >
                  <span class="product-card-category-price">MŨ / 250.000đ</span>
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 6: Khuyên Tai Hoa Hướng Dương -->
          <div
            class="product-card aspect-portrait"
            data-id="6"
            data-category="phụ kiện"
            data-price="450000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-teal">
                <img
                  src="/assets/helios.vn_products_khuvsgul-sunflower-stud-helios-silver (1).png"
                  alt="Khuyên Tai Hoa Hướng Dương"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title"
                    >KHUYÊN TAI HƯỚNG DƯƠNG HELIOS</span
                  >
                  <span class="product-card-category-price"
                    >PHỤ KIỆN / 450.000đ</span
                  >
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 7: Bookmark Sổ Tay -->
          <div
            class="product-card aspect-square"
            data-id="7"
            data-category="bookmark"
            data-price="45000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-mustard">
                <img
                  src="/assets/Sổ tay.png"
                  alt="Bookmark Sổ Tay Sáng Tạo"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title"
                    >BOOKMARK SỔ TAY SÁNG TẠO FPT</span
                  >
                  <span class="product-card-category-price"
                    >BOOKMARK / 45.000đ</span
                  >
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 8: Tranh In Sự Trỗi Dậy -->
          <div
            class="product-card aspect-portrait"
            data-id="8"
            data-category="tranh"
            data-price="600000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-slate">
                <img
                  src="/assets/12.png"
                  alt="Tranh In Sự Trỗi Dậy"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title">TRANH IN "SỰ TRỖI DẬY"</span>
                  <span class="product-card-category-price"
                    >TRANH / 600.000đ</span
                  >
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 9: Tranh In Dòng Chảy -->
          <div
            class="product-card aspect-landscape"
            data-id="9"
            data-category="tranh"
            data-price="650000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-ochre">
                <img
                  src="/assets/13.png"
                  alt="Tranh In Dòng Chảy"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title">TRANH IN "DÒNG CHẢY"</span>
                  <span class="product-card-category-price"
                    >TRANH / 650.000đ</span
                  >
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 10: Áo Thun Artdict Classic -->
          <div
            class="product-card aspect-tall"
            data-id="10"
            data-category="áo"
            data-price="380000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-cream-warm">
                <img
                  src="/assets/Áo Artdict.png"
                  alt="Áo Thun Artdict Classic"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title"
                    >ÁO THUN ARTDICT CLASSIC</span
                  >
                  <span class="product-card-category-price">ÁO / 380.000đ</span>
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 11: Tranh In Mạng Đối Lập -->
          <div
            class="product-card aspect-square"
            data-id="11"
            data-category="tranh"
            data-price="700000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-light-grey">
                <img
                  src="/assets/14.png"
                  alt="Tranh In Mảng Đối Lập"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title"
                    >TRANH IN "MẢNG ĐỐI LẬP"</span
                  >
                  <span class="product-card-category-price"
                    >TRANH / 700.000đ</span
                  >
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 12: Chân Dung Nghệ Sĩ -->
          <div
            class="product-card aspect-landscape"
            data-id="12"
            data-category="khác"
            data-price="500000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-dark-brown">
                <img
                  src="/assets/artist_portrait.png"
                  alt="Bản In Chân Dung Nghệ Sĩ"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title"
                    >BẢN IN "CHÂN DUNG NGHỆ SĨ"</span
                  >
                  <span class="product-card-category-price"
                    >KHÁC / 500.000đ</span
                  >
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- PAGE 2 PRODUCTS -->

          <!-- Product Card 13: Áo Đồ Để Chơi Bản Đặc Biệt -->
          <div
            class="product-card aspect-landscape"
            data-id="13"
            data-category="áo"
            data-price="390000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-sage">
                <img
                  src="/assets/Áo Đồ để chơi Chất để đời 1.png"
                  alt="Áo Đồ Để Chơi Bản Đặc Biệt"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title"
                    >ÁO ĐỒ ĐỂ CHƠI (ĐẶC BIỆT)</span
                  >
                  <span class="product-card-category-price">ÁO / 390.000đ</span>
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 14: Áo Thun Mèo Nổ Gold Edition -->
          <div
            class="product-card aspect-tall"
            data-id="14"
            data-category="áo"
            data-price="360000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-navy">
                <img
                  src="/assets/Áo Mèo Nổ 1.png"
                  alt="Áo Thun Mèo Nổ Gold Edition"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title"
                    >ÁO MÈO NỔ (GOLD EDITION)</span
                  >
                  <span class="product-card-category-price">ÁO / 360.000đ</span>
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 15: Áo Thun Mèo Nổ Dark Mode -->
          <div
            class="product-card aspect-square"
            data-id="15"
            data-category="áo"
            data-price="340000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-charcoal">
                <img
                  src="/assets/Áo Mèo Nổ 2.png"
                  alt="Áo Thun Mèo Nổ Dark Mode"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title">ÁO MÈO NỔ (DARK MODE)</span>
                  <span class="product-card-category-price">ÁO / 340.000đ</span>
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 16: Mũ Đồ Để Chơi Xanh Lá -->
          <div
            class="product-card aspect-tall"
            data-id="16"
            data-category="mũ"
            data-price="270000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-cream-warm">
                <img
                  src="/assets/Mũ Đồ để chơi Chất để đời 1 Xanh.png"
                  alt="Mũ Đồ Để Chơi Xanh Lá"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title"
                    >MŨ ĐỒ ĐỂ CHƠI (XANH LÁ)</span
                  >
                  <span class="product-card-category-price">MŨ / 270.000đ</span>
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Product Card 17: Mũ Đồ Để Chơi Bản Classic -->
          <div
            class="product-card aspect-landscape"
            data-id="17"
            data-category="mũ"
            data-price="240000"
          >
            <a href="#" class="product-card-link">
              <div class="product-image-wrapper bg-mustard">
                <img
                  src="/assets/Mũ Đồ để chơi Chất để đời 1.png"
                  alt="Mũ Đồ Để Chơi Bản Classic"
                  class="product-image"
                />
              </div>
              <div class="product-card-meta">
                <div class="product-meta-left">
                  <span class="product-card-title"
                    >MŨ ĐỒ ĐỂ CHƠI (CLASSIC)</span
                  >
                  <span class="product-card-category-price">MŨ / 240.000đ</span>
                </div>
                <div class="product-meta-right">
                  <span class="view-details-txt">VIEW DETAILS</span>
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- Pagination Container -->
        <div class="catalogue-pagination" id="catalogue-pagination">
          <button
            class="pag-btn prev-btn"
            id="pag-prev"
            aria-label="Trang trước"
          >
            &larr; Trước
          </button>
          <div class="pag-numbers" id="pag-numbers">
            <!-- Page numbers will be dynamically rendered via JS -->
          </div>
          <button class="pag-btn next-btn" id="pag-next" aria-label="Trang sau">
            Sau &rarr;
          </button>
        </div>
      </section>
    </main>`;

export default function CataloguePage() {
  return (
    <>
      <BodyClass className="catalogue-page" />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

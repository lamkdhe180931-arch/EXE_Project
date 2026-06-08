const html = `<main>
    <!-- Hero Section (Sticky with scroll-animated text) -->
    <section class="hero" id="hero-sec">
      <!-- Fullscreen Image Slideshow -->
      <div class="hero-slideshow" id="hero-slideshow">
        <div class="slide slide-active" id="slide-1">
          <img src="/assets/Screenshot 2026-05-20 154535.png" alt="Slide 1" />
        </div>
        <div class="slide" id="slide-2">
          <img src="/assets/Screenshot 2026-05-20 154724.png" alt="Slide 2" />
        </div>
        <div class="slide" id="slide-3">
          <img src="/assets/Screenshot 2026-05-20 154814.png" alt="Slide 3" />
        </div>
        <!-- SVG Swirl Mask for transition -->
        <svg class="slide-swirl-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <mask id="swirlMask">
              <circle id="swirlCircle" cx="50" cy="50" r="0" fill="white" />
            </mask>
          </defs>
        </svg>

        <!-- Dot navigation -->
        <div class="slide-dots" id="slide-dots">
          <button class="slide-dot active" data-slide="0" aria-label="Slide 1"></button>
          <button class="slide-dot" data-slide="1" aria-label="Slide 2"></button>
          <button class="slide-dot" data-slide="2" aria-label="Slide 3"></button>
        </div>
      </div>

      <!-- Background Collage behind text -->
      <div class="hero-collage" id="collage-grid">
        <div class="collage-card card-1" id="card-art-1">
          <img src="/assets/12.png" alt="Sản phẩm 12" />
        </div>
        <div class="collage-card card-2" id="card-art-2">
          <img src="/assets/13.png" alt="Sản phẩm 13" />
        </div>
        <div class="collage-card card-3" id="card-art-3">
          <img src="/assets/14.png" alt="Sản phẩm 14" />
        </div>
        <div class="collage-card card-4" id="card-art-4">
          <img src="/assets/Áo Đồ để chơi Chất để đời 1.png" alt="Áo Đồ để chơi Chất để đời" />
        </div>
        <div class="collage-card card-5" id="card-art-5">
          <img src="/assets/Áo Mèo Nổ 1.png" alt="Áo Mèo Nổ 1" />
        </div>
        <div class="collage-card card-6" id="card-art-6">
          <img src="/assets/Áo Mèo Nổ 2.png" alt="Áo Mèo Nổ 2" />
        </div>
        <div class="collage-card card-7" id="card-art-7">
          <img src="/assets/Mũ Đồ để chơi Chất để đời 1 Xanh.png" alt="Mũ Đồ để chơi Chất để đời 1 Xanh" />
        </div>
        <div class="collage-card card-8" id="card-art-8">
          <img src="/assets/Mũ Đồ để chơi Chất để đời 1.png" alt="Mũ Đồ để chơi Chất để đời 1" />
        </div>
      </div>

      <!-- Big Scroll-Animated Title Lines -->
      <div class="hero-scroll-title" id="scroll-title-container">
        <div class="scroll-line scroll-line-1" id="scroll-text-l1">
          Đồ để chơi!
        </div>
        <div class="scroll-line scroll-line-2" id="scroll-text-l2">
          Chất để đời!
        </div>
      </div>

      <div class="scroll-indicator" id="scroll-indicator-btn">
        <span class="scroll-ind-text">Cuộn xuống</span>
        <div class="scroll-ind-arrow">
          <svg viewBox="0 0 24 24">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
      </div>
    </section>

    <!-- Hero Scroll Spacer — extends the scroll distance so the text animation has room to play -->
    <div class="hero-spacer" id="hero-spacer"></div>

    <!-- Manifesto / Brand Story Section (Dark Mode, Slide 4) -->
    <section class="manifesto bg-dark-section" id="manifesto-sec">
      <div class="manifesto-container reveal-section" data-reveal>
        <span class="manifesto-badge">Lý do hình thành</span>
        <h1 class="manifesto-title" id="main-manifesto-heading">
          Nơi <span class="empathy">Nghệ thuật</span> hòa quyện cùng
          <span>Đam mê</span>
        </h1>
        <p class="manifesto-desc" id="manifesto-description">
          <strong>ARTDICT (Art + Addict)</strong> ra đời từ một tầm nhìn quan
          trọng: thu hẹp khoảng cách giữa đào tạo thiết kế và thực tiễn kinh
          doanh. Chúng tôi hỗ trợ các nhà thiết kế tài năng của Đại học FPT có
          nền tảng để thương mại hóa tác phẩm của họ, mang đến cho người mua
          Gen Z một kênh nghệ thuật đích thực, chất lượng cao và mang đậm dấu
          ấn cá nhân.
        </p>
        <button class="btn-circle" id="explore-button" onclick="
              document
                .getElementById('categories-sec')
                .scrollIntoView({ behavior: 'smooth' })
            ">
          <span>Khám phá sứ mệnh của chúng tôi</span>
          <span class="arrow-circle">
            <svg viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </span>
        </button>

        <!-- Brand Core Columns (Slide 4 Details) -->
        <div class="manifesto-grid">
          <div class="manifesto-col" data-reveal>
            <h3>Khoảng trống thực tiễn</h3>
            <p>
              Sinh viên thiết kế FPT có kỹ năng sáng tạo xuất sắc nhưng thiếu
              môi trường và nền tảng ổn định để thử nghiệm, thương mại hóa và
              ra mắt các sản phẩm vật lý.
            </p>
          </div>
          <div class="manifesto-col" data-reveal>
            <h3>Nguồn cung chưa được khai thác</h3>
            <p>
              Vô số sáng tạo xuất sắc của sinh viên không bao giờ được bán hay
              trưng bày, hoặc chỉ giới hạn ở các kênh mạng xã hội cá nhân manh
              mún. Chúng tôi cung cấp một tiêu chuẩn tuyển chọn đáng tin cậy.
            </p>
          </div>
          <div class="manifesto-col" data-reveal>
            <h3>Nhu cầu của Gen Z</h3>
            <p>
              Người tiêu dùng trẻ (18–27 tuổi) tìm kiếm sự cá nhân hóa, tính
              thẩm mỹ và những câu chuyện chân thực. Chúng tôi lấp đầy khoảng
              trống này bằng chất lượng được kiểm định, nguồn gốc minh bạch và
              hỗ trợ trực tiếp cho nghệ sĩ.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Categories Section (2x2 Grid like reference) -->
    <section class="categories" id="categories-sec">
      <div class="categories-container reveal-section" data-reveal>
        <span class="categories-badge">Danh mục sản phẩm</span>
        <h2 class="categories-title">Chúng tôi tạo ra gì</h2>
        <p class="categories-desc">
          Tuyển chọn các sản phẩm thiết kế sáng tạo mang đậm dấu ấn cá nhân từ
          sinh viên thiết kế.
        </p>
        <div class="categories-masonry">
          <a href="#" class="cat-tile" id="cat-prints">
            <img src="/assets/Screenshot 2026-05-20 154535.png" alt="Art Prints" class="cat-tile-img" />
            <div class="cat-tile-overlay">
              <span class="cat-tile-label">TRANH IN</span>
            </div>
          </a>
          <a href="#" class="cat-tile" id="cat-stickers">
            <img src="/assets/Screenshot 2026-05-20 154724.png" alt="Die-cut Stickers" class="cat-tile-img" />
            <div class="cat-tile-overlay">
              <span class="cat-tile-label">STICKER BẾ DÁN</span>
            </div>
          </a>
          <a href="#" class="cat-tile" id="cat-shirts">
            <img src="/assets/Screenshot 2026-05-20 154814.png" alt="Streetwear Tees" class="cat-tile-img" />
            <div class="cat-tile-overlay">
              <span class="cat-tile-label">ÁO THUN STREETWEAR</span>
            </div>
          </a>
          <a href="#" class="cat-tile" id="cat-decor">
            <img src="/assets/art_four.png" alt="Creative Decor" class="cat-tile-img" />
            <div class="cat-tile-overlay">
              <span class="cat-tile-label">ĐỒ DECOR SÁNG TẠO</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- New Shirts Showcase Section (Grid Outline Book-spread Style) -->
    <section class="shirts-showcase" id="shirts-showcase-sec">
      <div class="showcase-container">
        <!-- Showcase Header -->
        <div class="showcase-header" data-reveal>
          <span class="showcase-title">SẢN PHẨM MỚI</span>
          <a href="#" class="showcase-view-all">Xem tất cả &rarr;</a>
        </div>

        <!-- Grid of 4 columns -->
        <div class="showcase-grid" data-reveal>
          <!-- Item 1 -->
          <div class="showcase-item">
            <div class="showcase-img-wrapper">
              <img src="/assets/Áo Đồ để chơi Chất để đời 1.png" alt="Áo Đồ để chơi Chất để đời" />
            </div>
            <div class="showcase-info">
              <h3 class="product-name">Áo Đồ Để Chơi Chất Để Đời</h3>
              <span class="product-price">350.000đ</span>
            </div>
          </div>

          <!-- Item 2 -->
          <div class="showcase-item">
            <div class="showcase-img-wrapper">
              <img src="/assets/Áo Mèo Nổ 1.png" alt="Áo Mèo Nổ 1" />
            </div>
            <div class="showcase-info">
              <h3 class="product-name">Áo Thun Mèo Nổ V1</h3>
              <span class="product-price">320.000đ</span>
            </div>
          </div>

          <!-- Item 3 -->
          <div class="showcase-item">
            <div class="showcase-img-wrapper">
              <img src="/assets/Áo Mèo Nổ 2.png" alt="Áo Mèo Nổ 2" />
            </div>
            <div class="showcase-info">
              <h3 class="product-name">Áo Thun Mèo Nổ V2</h3>
              <span class="product-price">320.000đ</span>
            </div>
          </div>

          <!-- Item 4 -->
          <div class="showcase-item">
            <div class="showcase-img-wrapper">
              <img src="/assets/Áo Artdict.png" alt="Áo Artdict Classic" />
            </div>
            <div class="showcase-info">
              <h3 class="product-name">Áo Thun Artdict Classic</h3>
              <span class="product-price">380.000đ</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>`;

export default function HomePage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

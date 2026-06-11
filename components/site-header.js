/* <site-header active="...">
   active = home | catalogue | newin | collab | tacgia | khampha
   Mega menu with 3-column category dropdown + Khám phá small dropdown. */
class SiteHeader extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute("active") || "home";

    const chevron = `<svg class="nav__chevron" width="11" height="7" viewBox="0 0 11 7" fill="none"><path d="M1 1L5.5 5.5L10 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    const link = (key, href, label) =>
      `<a href="${href}" class="nav__link${active === key ? " is-active" : ""}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`;

    this.innerHTML = `
    <header class="nav" id="nav">
      <div class="nav__inner">

        <a class="nav__logo" href="/" aria-label="Artdict trang chủ">
          <img src="/assets/logo-dark.png" alt="Artdict" class="nav__logo-img" />
        </a>

        <nav class="nav__menu" aria-label="Điều hướng chính">

          <!-- Danh mục → mega menu -->
          <div class="nav__item nav__item--mega">
            <button class="nav__link--btn${active === "catalogue" ? " is-active" : ""}"
                    aria-haspopup="true" aria-expanded="false" id="mega-trigger">
              Danh mục ${chevron}
            </button>
            <div class="mega-menu" id="mega-menu" role="region" aria-label="Danh mục sản phẩm">
              <div class="mega-menu__inner wrap">
                <div class="mega-col">
                  <span class="mega-col__head">Tất cả sản phẩm</span>
                  <a href="/pages/catalogue.html" class="mega-link mega-link--feature">New In</a>
                </div>
                <div class="mega-col">
                  <span class="mega-col__head">Áo / Mũ</span>
                  <a href="/pages/catalogue.html?filter=aothun" class="mega-link">Áo thun</a>
                  <a href="/pages/catalogue.html?filter=mu" class="mega-link">Mũ</a>
                  <a href="/pages/catalogue.html?filter=vongtay" class="mega-link">Vòng tay</a>
                </div>
                <div class="mega-col">
                  <span class="mega-col__head">Ấn Phẩm</span>
                  <a href="/pages/catalogue.html?filter=sotay" class="mega-link">Sổ tay</a>
                  <a href="/pages/catalogue.html?filter=nhandan" class="mega-link">Nhãn dán</a>
                  <a href="/pages/catalogue.html?filter=mockhoa" class="mega-link">Móc khóa</a>
                  <a href="/pages/catalogue.html?filter=tranh" class="mega-link">Tranh</a>
                  <a href="/pages/catalogue.html?filter=khac" class="mega-link">Khác</a>
                </div>
              </div>
            </div>
          </div>

          ${link("newin", "/pages/catalogue.html", "New In")}
          ${link("collab", "/pages/collab.html", "Collab")}
          ${link("tacgia", "/pages/artists.html", "Tác giả")}

          <!-- Khám phá → small dropdown -->
          <div class="nav__item nav__item--drop">
            <button class="nav__link--btn${active === "khampha" ? " is-active" : ""}"
                    aria-haspopup="true" aria-expanded="false">
              Khám phá ${chevron}
            </button>
            <div class="nav__dropdown" role="region" aria-label="Khám phá">
              <a href="/pages/about.html" class="dropdown-link">Về chúng tôi</a>
              <a href="/pages/collection.html" class="dropdown-link">Bộ sưu tập</a>
              <a href="/pages/news.html" class="dropdown-link">News</a>
            </div>
          </div>

        </nav>

        <div class="nav__actions">
          <button class="nav__cart-btn" data-open-cart aria-label="Giỏ hàng">
            <svg class="nav__cart-icon" width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6.2 7.5h11.6l-1 12.2a1 1 0 0 1-1 .9H8.2a1 1 0 0 1-1-.9L6.2 7.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
              <path d="M9 7.5V6a3 3 0 0 1 6 0v1.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
            </svg>
            <span class="nav__cart-count" data-cart-count style="display:none">0</span>
          </button>
        </div>

        <button class="nav__burger" id="burger" aria-label="Mở menu" aria-expanded="false">
          <span></span><span></span>
        </button>

      </div>
    </header>`;

    /* Keyboard accessibility: toggle aria-expanded on click for mega/dropdown triggers */
    this.querySelectorAll("[aria-haspopup]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        /* close all others first */
        this.querySelectorAll("[aria-haspopup]").forEach((b) =>
          b.setAttribute("aria-expanded", "false"),
        );
        btn.setAttribute("aria-expanded", String(!expanded));
      });
    });

    /* Close mega/dropdowns on outside click */
    document.addEventListener(
      "click",
      (e) => {
        if (!this.contains(e.target)) {
          this.querySelectorAll("[aria-haspopup]").forEach((b) =>
            b.setAttribute("aria-expanded", "false"),
          );
        }
      },
      { capture: true },
    );
  }
}
customElements.define("site-header", SiteHeader);

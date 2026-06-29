/* <site-footer> — footer tái sử dụng cho mọi trang. */
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <footer class="footer">
      <div class="footer__top">
        <div class="footer__brand">
          <img src="/assets/logo-light.png" alt="Artdict" class="footer__logo" />
          <p>Đồ để chơi! Chất để đời!</p>
        </div>
        <nav class="footer__cols" aria-label="Liên kết chân trang">
          <div class="footer__col">
            <h4>Sản phẩm</h4>
            <a href="/index.html#catalogue">Áo thun</a>
            <a href="/index.html#catalogue">Mũ</a>
            <a href="/index.html#catalogue">Sổ tay</a>
          </div>
          <div class="footer__col">
            <h4>Artdict</h4>
            <a href="/index.html#manifesto">Manifesto</a>
            <a href="/index.html#craft">Danh mục</a>
            <a href="/index.html#contact">Liên hệ</a>
          </div>
          <div class="footer__col">
            <h4>Kết nối</h4>
            <a href="https://www.instagram.com/artdict_official/" target="_blank" rel="noopener">Instagram</a>
            <a href="https://www.tiktok.com/@artdict_official?_r=1&_t=ZS-97clej7PI9A" target="_blank" rel="noopener">TikTok</a>
            <a href="https://www.facebook.com/profile.php?id=61577523485968" target="_blank" rel="noopener">Facebook</a>
          </div>
        </nav>
      </div>
      <div class="footer__bottom">
        <span>© 2026 Artdict. Made by artists.</span>
        <span>Hà Nội · Việt Nam</span>
      </div>
    </footer>`;
  }
}
customElements.define("site-footer", SiteFooter);

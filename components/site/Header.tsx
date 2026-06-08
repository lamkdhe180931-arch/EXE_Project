export function Header() {
  return (
    <header id="main-header">
      <div className="header-left">
        <div className="logo-container" id="logo-wrapper">
          <div className="logo" id="header-logo">
            <a href="/">
              <img src="/assets/Logo bản sáng.png" alt="ARTDICT" className="header-logo-img" />
            </a>
          </div>
        </div>
        <span className="logo-badge" id="header-badge">
          Nghệ thuật & Quà tặng
        </span>
      </div>
      <nav className="header-nav">
        <a href="/catalogue" className="header-nav-link" id="header-nav-catalogue">
          Sản phẩm
        </a>
        <a href="/authors" className="header-nav-link" id="header-nav-author">
          Tác giả
        </a>
      </nav>
      <div className="menu-trigger" id="menu-open-btn">
        Menu
      </div>
    </header>
  );
}

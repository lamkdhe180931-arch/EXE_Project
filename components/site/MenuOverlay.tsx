import type { CSSProperties } from "react";

export function MenuOverlay() {
  return (
    <>
      <div id="main-menu-overlay" className="menu-overlay">
        <div id="menu-close-btn" className="menu-close">
          Đóng
        </div>
        <nav>
          <ul>
            <li style={{ "--i": 1 } as CSSProperties}>
              <a href="/" className="menu-link" id="nav-home">
                Trang chủ
              </a>
            </li>
            <li style={{ "--i": 2 } as CSSProperties}>
              <a href="/#manifesto-sec" className="menu-link" id="nav-about">
                Tuyên ngôn
              </a>
            </li>
            <li style={{ "--i": 3 } as CSSProperties}>
              <a href="/catalogue" className="menu-link" id="nav-catalogue">
                Sản phẩm
              </a>
            </li>
            <li style={{ "--i": 4 } as CSSProperties}>
              <a href="/#team-sec" className="menu-link" id="nav-team">
                Đội ngũ
              </a>
            </li>
            <li style={{ "--i": 5 } as CSSProperties}>
              <a href="/authors" className="menu-link" id="nav-author">
                Tác giả
              </a>
            </li>
            <li style={{ "--i": 6 } as CSSProperties}>
              <a href="/#footer-sec" className="menu-link" id="nav-contact">
                Liên hệ
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

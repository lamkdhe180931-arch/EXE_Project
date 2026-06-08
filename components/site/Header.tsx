import Image from "next/image";
import Link from "next/link";
import { MenuOverlay } from "@/components/site/MenuOverlay";

export function Header() {
  return (
    <header id="main-header">
      <div className="header-left">
        <div className="logo-container" id="logo-wrapper">
          <div className="logo" id="header-logo">
            <Link href="/" aria-label="Artdict home">
              <Image
                src="/assets/Logo bản sáng.png"
                alt="ARTDICT"
                className="header-logo-img"
                width={112}
                height={36}
                priority
              />
            </Link>
          </div>
        </div>
        <span className="logo-badge" id="header-badge">
          Nghệ thuật & Quà tặng
        </span>
      </div>
      <nav className="header-nav" aria-label="Primary navigation">
        <Link href="/catalogue" className="header-nav-link" id="header-nav-catalogue">
          Sản phẩm
        </Link>
        <Link href="/authors" className="header-nav-link" id="header-nav-author">
          Tác giả
        </Link>
      </nav>
      <MenuOverlay />
    </header>
  );
}

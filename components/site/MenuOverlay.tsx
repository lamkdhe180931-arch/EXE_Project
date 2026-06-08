"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useState } from "react";

export function MenuOverlay() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        id="menu-open-btn"
        className="menu-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        Menu
      </button>
      <div id="main-menu-overlay" className={open ? "menu-overlay active" : "menu-overlay"}>
        <button
          type="button"
          id="menu-close-btn"
          className="menu-close"
          onClick={closeMenu}
          aria-label="Close menu"
        >
          Đóng
        </button>
        <nav aria-label="Menu navigation">
          <ul>
            <li style={{ "--i": 1 } as CSSProperties}>
              <Link href="/" className="menu-link" id="nav-home" onClick={closeMenu}>
                Trang chủ
              </Link>
            </li>
            <li style={{ "--i": 2 } as CSSProperties}>
              <Link href="/#manifesto-sec" className="menu-link" id="nav-about" onClick={closeMenu}>
                Tuyên ngôn
              </Link>
            </li>
            <li style={{ "--i": 3 } as CSSProperties}>
              <Link href="/catalogue" className="menu-link" id="nav-catalogue" onClick={closeMenu}>
                Sản phẩm
              </Link>
            </li>
            <li style={{ "--i": 4 } as CSSProperties}>
              <Link href="/authors" className="menu-link" id="nav-author" onClick={closeMenu}>
                Tác giả
              </Link>
            </li>
            <li style={{ "--i": 5 } as CSSProperties}>
              <Link href="/#footer-sec" className="menu-link" id="nav-contact" onClick={closeMenu}>
                Liên hệ
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

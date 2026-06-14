/* ============================================================
   ARTDICT — shared interactions
   ============================================================ */
(function () {
  "use strict";

  const VND = (n) => n.toLocaleString("vi-VN") + "\u20ab";
  const CART_KEY = "artdict_cart_v1";
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ---------- Cart store ---------- */
  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    renderCart();
  }
  function addToCart(item) {
    const items = readCart();
    const key = item.id + "|" + (item.size || "");
    const found = items.find((i) => i.id + "|" + (i.size || "") === key);
    if (found) found.qty += item.qty;
    else items.push(item);
    writeCart(items);
    toast("\u0110\u00e3 th\u00eam v\u00e0o gi\u1ecf \u2014 " + item.name);
    openCart();
  }
  function removeFromCart(key) {
    writeCart(readCart().filter((i) => i.id + "|" + (i.size || "") !== key));
  }

  /* ---------- Cart UI ---------- */
  function cartCount() {
    return readCart().reduce((s, i) => s + i.qty, 0);
  }
  function cartTotal() {
    return readCart().reduce((s, i) => s + i.price * i.qty, 0);
  }

  function renderCart() {
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      const c = cartCount();
      el.textContent = c;
      el.style.display = c > 0 ? "" : "none";
    });

    const list = document.querySelector("[data-cart-items]");
    const totalEl = document.querySelector("[data-cart-total]");
    if (!list) return;

    const items = readCart();
    if (!items.length) {
      list.innerHTML =
        '<div class="cart-empty"><div class="cart-empty__mark">\u25c8</div>' +
        "<p>Gi\u1ecf c\u1ee7a b\u1ea1n \u0111ang tr\u1ed1ng.</p>" +
        '<a class="circle-btn" href="catalogue.html">Kh\u00e1m ph\u00e1 b\u1ed9 s\u01b0u t\u1eadp</a></div>';
    } else {
      list.innerHTML = items
        .map((i) => {
          const key = i.id + "|" + (i.size || "");
          const media = i.img
            ? '<img src="' + i.img + '" alt="">'
            : '<div class="ph"></div>';
          return (
            '<div class="cart-item">' +
            '<div class="cart-item__media">' +
            media +
            "</div>" +
            "<div>" +
            '<div class="cart-item__name">' +
            i.name +
            "</div>" +
            '<div class="cart-item__meta">' +
            i.cat +
            (i.size ? " \u00b7 Size " + i.size : "") +
            " \u00b7 SL " +
            i.qty +
            "</div>" +
            '<button class="cart-item__remove" data-remove="' +
            key +
            '">X\u00f3a</button>' +
            "</div>" +
            '<div class="cart-item__price">' +
            VND(i.price * i.qty) +
            "</div>" +
            "</div>"
          );
        })
        .join("");
    }
    if (totalEl) totalEl.textContent = VND(cartTotal());
  }

  function openCart() {
    document.querySelector("[data-cart-drawer]")?.classList.add("open");
    document.querySelector("[data-cart-scrim]")?.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    document.querySelector("[data-cart-drawer]")?.classList.remove("open");
    document.querySelector("[data-cart-scrim]")?.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.innerHTML = '<span class="toast__dot"></span>' + msg;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  /* ---------- 3D tilt on cards ---------- */
  function initTilt(root) {
    if (reduceMotion || window.matchMedia("(hover: none)").matches) return;
    const MAX = 8;
    (root || document).querySelectorAll("[data-tilt]").forEach((card) => {
      let raf;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform =
            "perspective(800px) rotateX(" +
            (-py * MAX).toFixed(2) +
            "deg) rotateY(" +
            (px * MAX).toFixed(2) +
            "deg)";
        });
      });
      card.addEventListener("mouseleave", () => {
        cancelAnimationFrame(raf);
        card.style.transform = "perspective(800px) rotateX(0) rotateY(0)";
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal(root) {
    const els = (root || document).querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const d = en.target.dataset.delay;
            if (d) en.target.style.transitionDelay = d + "ms";
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Filter pills (catalogue) ---------- */
  function initFilters() {
    const pills = document.querySelectorAll("[data-filter]");
    const countEl = document.querySelector("[data-result-count]");
    if (!pills.length) return;

    function apply(cat) {
      let shown = 0;
      // Query live each time so filtering works on dynamically rendered cards.
      document.querySelectorAll(".card[data-cat]").forEach((card) => {
        const match = cat === "all" || card.dataset.cat === cat;
        if (match) {
          card.style.display = "";
          shown++;
          // restart reveal so filtered-in cards animate
          card.classList.remove("in");
          requestAnimationFrame(() => card.classList.add("in"));
        } else {
          card.style.display = "none";
        }
      });
      if (countEl) countEl.textContent = shown;
    }

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => {
          p.classList.remove("is-active");
          p.setAttribute("aria-pressed", "false");
        });
        pill.classList.add("is-active");
        pill.setAttribute("aria-pressed", "true");
        apply(pill.dataset.filter);

        // Update URL without reloading
        const url = new URL(window.location);
        url.searchParams.set("filter", pill.dataset.filter);
        window.history.replaceState({}, "", url);
      });
    });

    // Auto-apply from URL
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get("filter");
    if (filterParam) {
      const targetPill = Array.from(pills).find(
        (p) => p.dataset.filter === filterParam,
      );
      if (targetPill) {
        targetPill.click();
      }
    }
  }

  /* ---------- Accordion ---------- */
  function initAccordion() {
    document.querySelectorAll("[data-acc-trigger]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest("[data-acc-item]");
        const panel = item.querySelector("[data-acc-panel]");
        const open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
      });
    });
  }

  /* ---------- Qty stepper ---------- */
  function initQty() {
    document.querySelectorAll("[data-qty]").forEach((wrap) => {
      const out = wrap.querySelector("[data-qty-val]");
      wrap.querySelectorAll("[data-qty-step]").forEach((btn) => {
        btn.addEventListener("click", () => {
          let v = parseInt(out.textContent, 10) || 1;
          v += parseInt(btn.dataset.qtyStep, 10);
          v = Math.max(1, Math.min(99, v));
          out.textContent = v;
        });
      });
    });
  }

  /* ---------- Size selector ---------- */
  function initSizes() {
    document.querySelectorAll("[data-size-group]").forEach((group) => {
      group.querySelectorAll("[data-size]").forEach((btn) => {
        if (btn.disabled) return;
        btn.addEventListener("click", () => {
          group
            .querySelectorAll("[data-size]")
            .forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          group.dataset.selected = btn.dataset.size;
          group.classList.remove("err");
        });
      });
    });
  }

  /* ---------- Card add-to-cart (catalogue quick add) ---------- */
  function initCardAdd(root) {
    (root || document).querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const d = btn.dataset;
        addToCart({
          id: d.add,
          name: d.name,
          cat: d.cat,
          price: parseInt(d.price, 10),
          qty: 1,
          size: d.size || "",
          img: d.img || "",
        });
      });
    });
  }

  /* ---------- Product page add-to-cart ---------- */
  function initProductAdd() {
    const btn = document.querySelector("[data-product-add]");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const d = btn.dataset;
      const sizeGroup = document.querySelector("[data-size-group]");
      const needsSize = sizeGroup && !sizeGroup.dataset.optional;
      const size = sizeGroup ? sizeGroup.dataset.selected : "";
      if (needsSize && !size) {
        sizeGroup.classList.add("err");
        toast("Vui l\u00f2ng ch\u1ecdn size");
        return;
      }
      const qty =
        parseInt(document.querySelector("[data-qty-val]")?.textContent, 10) ||
        1;
      addToCart({
        id: d.productAdd,
        name: d.name,
        cat: d.cat,
        price: parseInt(d.price, 10),
        qty: qty,
        size: size || "",
        img: d.img || "",
      });
    });
  }

  /* ---------- Product gallery thumbs ---------- */
  function initGallery(root) {
    const scope = root || document;
    const main = scope.querySelector("[data-gallery-main]");
    if (!main) return;
    scope.querySelectorAll("[data-thumb]").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        document
          .querySelectorAll("[data-thumb]")
          .forEach((t) => t.classList.remove("is-active"));
        thumb.classList.add("is-active");
        main.innerHTML = thumb.dataset.full
          ? '<img src="' + thumb.dataset.full + '" alt="">'
          : '<div class="ph"><span class="ph__label">' +
            (thumb.dataset.label || "product shot") +
            "</span></div>";
      });
    });
  }

  /* ---------- Wire cart buttons ---------- */
  function initCartUI() {
    document
      .querySelectorAll("[data-open-cart]")
      .forEach((b) => b.addEventListener("click", openCart));
    document
      .querySelectorAll("[data-close-cart]")
      .forEach((b) => b.addEventListener("click", closeCart));
    document
      .querySelector("[data-cart-scrim]")
      ?.addEventListener("click", closeCart);
    document
      .querySelector("[data-cart-items]")
      ?.addEventListener("click", (e) => {
        const rm = e.target.closest("[data-remove]");
        if (rm) removeFromCart(rm.dataset.remove);
      });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeCart();
    });
  }

  /* ---------- Web Component nav (burger + scroll state) ---------- */
  function initNav() {
    const nav = document.getElementById("nav");
    const burger = document.getElementById("burger");
    if (!nav) return;
    const onScroll = () =>
      nav.classList.toggle("nav--scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (burger) {
      burger.addEventListener("click", () => {
        const open = nav.classList.toggle("nav--open");
        burger.setAttribute("aria-expanded", String(open));
      });
      nav.querySelectorAll(".nav__menu a").forEach((a) =>
        a.addEventListener("click", () => {
          nav.classList.remove("nav--open");
          burger.setAttribute("aria-expanded", "false");
        }),
      );
    }
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initTilt();
    initReveal();
    initFilters();
    initAccordion();
    initQty();
    initSizes();
    initCardAdd();
    initProductAdd();
    initGallery();
    initCartUI();
    renderCart();
  });

  /* ---------- Rescan (bind interactions to dynamically injected cards) ---------- */
  function rescan(root) {
    initTilt(root);
    initReveal(root);
    initCardAdd(root);
    initGallery(root);
  }

  // expose for inline use if needed
  window.Artdict = { addToCart, openCart, closeCart, VND, rescan };
})();

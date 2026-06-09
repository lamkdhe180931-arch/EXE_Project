function initArtdictSite() {
  if (window.__artdictSiteInitialized) return;
  window.__artdictSiteInitialized = true;
  // =============================================
  // DYNAMIC LAYOUT LOADER (Header, Menu, Footer)
  // =============================================
  async function loadLayout() {
    const placeholders = [
      { id: "#header-placeholder", file: "partials/header.html" },
      { id: "#menu-placeholder", file: "partials/menu.html" },
      { id: "#footer-placeholder", file: "partials/footer.html" }
    ];

    for (const item of placeholders) {
      const el = document.querySelector(item.id);
      if (el) {
        try {
          const response = await fetch(item.file);
          if (response.ok) {
            el.outerHTML = await response.text();
          } else {
            console.error(`Failed to load component: ${item.file}`, response.statusText);
          }
        } catch (error) {
          console.error(`Error loading component: ${item.file}`, error);
        }
      }
    }

    highlightActiveLinks();
    initScrollRevealForInjected();
  }

  function highlightActiveLinks() {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith("/catalogue")) {
      const link = document.getElementById("header-nav-catalogue");
      if (link) link.classList.add("active");
    } else if (currentPath.startsWith("/authors")) {
      const link = document.getElementById("header-nav-author");
      if (link) link.classList.add("active");
    }
  }

  function initScrollRevealForInjected() {
    const revealEls = document.querySelectorAll("#footer-sec [data-reveal]");
    if (window.__revealObserver) {
      revealEls.forEach((el) => window.__revealObserver.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("revealed"));
    }
  }

  // Load layout components
  loadLayout();

  // =============================================
  // MENU OVERLAY (Event Delegation)
  // =============================================
  document.addEventListener("click", (e) => {
    if (e.target.closest("#menu-open-btn")) {
      const menuOverlay = document.getElementById("main-menu-overlay");
      if (menuOverlay) {
        menuOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    } else if (e.target.closest("#menu-close-btn") || e.target.closest(".menu-link")) {
      const menuOverlay = document.getElementById("main-menu-overlay");
      if (menuOverlay) {
        menuOverlay.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  });

  // =============================================
  // HERO SLIDESHOW (8s auto-rotate with swirl transition)
  // =============================================
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".slide-dot");
  const timerProgress = document.getElementById("timer-progress");
  let currentSlide = 0;
  let slideInterval = null;
  let transitionTimeout = null;
  const SLIDE_DURATION = 8000; // 8 seconds

  function goToSlide(index, skipAnimation = false) {
    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
      transitionTimeout = null;
    }

    const prevSlide = currentSlide;
    currentSlide = index;

    // Update dots
    dots.forEach((d, i) => {
      if (i === currentSlide) d.classList.add("active");
      else d.classList.remove("active");
    });

    if (skipAnimation || prevSlide === currentSlide) {
      // Just set the active class directly
      slides.forEach((s, i) => {
        if (i === currentSlide) {
          s.classList.add("slide-active");
          s.classList.remove("slide-swirl-in");
        } else {
          s.classList.remove("slide-active", "slide-swirl-in");
        }
      });
    } else {
      // Swirl in the new slide over the previous one (keeps prev visible underneath)
      slides.forEach((s, i) => {
        if (i === prevSlide) {
          s.classList.add("slide-active");
          s.classList.remove("slide-swirl-in");
        } else if (i === currentSlide) {
          s.classList.remove("slide-active");
          s.classList.add("slide-swirl-in");
        } else {
          s.classList.remove("slide-active", "slide-swirl-in");
        }
      });

      // After animation completes, switch to active class
      transitionTimeout = setTimeout(() => {
        slides.forEach((s, i) => {
          if (i === currentSlide) {
            s.classList.add("slide-active");
            s.classList.remove("slide-swirl-in");
          } else {
            s.classList.remove("slide-active", "slide-swirl-in");
          }
        });
        transitionTimeout = null;
      }, 1200);
    }

    // Reset and restart timer animation
    resetTimer();
  }

  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }

  function resetTimer() {
    if (timerProgress) {
      timerProgress.classList.remove("timer-animating");
      // Force reflow
      void timerProgress.offsetWidth;
      timerProgress.classList.add("timer-animating");
    }
  }

  function startSlideshow() {
    stopSlideshow();
    resetTimer();
    slideInterval = setInterval(nextSlide, SLIDE_DURATION);
  }

  function stopSlideshow() {
    if (slideInterval) clearInterval(slideInterval);
  }

  // Dot click handlers
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      if (i === currentSlide) return;
      goToSlide(i);
      startSlideshow(); // Restart timer
    });
  });

  // Start
  if (slides.length > 0) {
    startSlideshow();
  }

  // =============================================
  // HERO SCROLL ANIMATION
  //
  // The hero is sticky at top:0 (z-index:1).
  // The manifesto (z-index:2) scrolls over it, naturally covering it.
  //
  // Scroll phases:
  // Phase 1: Text lines converge from spread to centered
  // Phase 2: Collage cards fly in from below
  // Phase 3: Text color changes (crimson → black) as cards appear
  // Then the manifesto simply scrolls over everything.
  // =============================================
  const heroSection = document.getElementById("hero-sec");
  const heroGrid = document.getElementById("collage-grid");
  const scrollLine1 = document.getElementById("scroll-text-l1");
  const scrollLine2 = document.getElementById("scroll-text-l2");
  const heroSubFade = null; // Removed
  const scrollIndicator = document.getElementById("scroll-indicator-btn");
  const heroSpacer = document.getElementById("hero-spacer");

  let targetP = 0;
  let currentP = 0;
  let mouseX = 0,
    mouseY = 0;
  let gridX = 0,
    gridY = 0;

  // Card configs: initial Y offset (vh), end Y offset, rotation start/end
  // 20% more irregular tilting than before
  const cardCfg = [
    { yS: 100, yE: 0, rS: -8, rE: 5 },
    { yS: 90, yE: 0, rS: 6, rE: -7 },
    { yS: 110, yE: 0, rS: -12, rE: 4 },
    { yS: 95, yE: 0, rS: 9, rE: -6 },
    { yS: 105, yE: 0, rS: 10, rE: -8 },
    { yS: 85, yE: 0, rS: -6, rE: 5 },
    { yS: 100, yE: 0, rS: -9, rE: 7 },
    { yS: 95, yE: 0, rS: 7, rE: -11 },
  ];

  // Color interpolation helper (hex to rgb)
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }
  function lerpColor(hex1, hex2, t) {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Clamp a value between 0 and 1
  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  // Map a value from one range to 0-1
  function mapRange(value, inMin, inMax) {
    return clamp01((value - inMin) / (inMax - inMin));
  }

  function calcProgress() {
    if (!heroSpacer) return;
    const spacerRect = heroSpacer.getBoundingClientRect();
    const wh = window.innerHeight;
    // Progress 0: spacer top is at bottom of viewport
    // Progress 1: spacer bottom has reached top of viewport
    const spacerHeight = heroSpacer.offsetHeight;
    const raw = 1 - spacerRect.bottom / (wh + spacerHeight);
    targetP = clamp01(raw);
  }

  // Mouse sway
  if (heroSection && heroGrid) {
    heroSection.addEventListener("mousemove", (e) => {
      const r = heroSection.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width - 0.5;
      mouseY = (e.clientY - r.top) / r.height - 0.5;
    });
    heroSection.addEventListener("mouseleave", () => {
      mouseX = 0;
      mouseY = 0;
    });
  }

  // Color definitions
  const colorCrimson = "#a80c14";
  const colorBlack = "#fcfaf2"; // Transition to cream for visibility on dark background

  function tick() {
    // Smooth lerp
    currentP += (targetP - currentP) * 0.07;
    if (Math.abs(targetP - currentP) < 0.0001) currentP = targetP;
    const p = currentP;

    // Text converge: spread at p=0, centered at p=0.5
    const converge = mapRange(p, 0, 0.5);

    // Color change: crimson → black (starts after text converges a bit)
    const colorPhase = mapRange(p, 0.3, 0.7);

    // --- Title lines: stay centered, only spread/converge ---
    if (scrollLine1 && scrollLine2) {
      // Horizontal spread: starts spread, converges to center
      const spreadX = lerp(25, 0, converge);

      // Vertical spread: lines converge vertically
      const spreadY1 = lerp(-8, -3, converge);
      const spreadY2 = lerp(8, 3, converge);

      // Color transition (Fixed to brand crimson color as requested by user)
      const textColor = colorCrimson;

      scrollLine1.style.transform = `translate(${-spreadX}vw, ${spreadY1}vh)`;
      scrollLine2.style.transform = `translate(${spreadX}vw, ${spreadY2}vh)`;

      scrollLine1.style.color = textColor;
      scrollLine2.style.color = textColor;
    }

    // Fade subtitle and indicator early
    if (heroSubFade) heroSubFade.style.opacity = Math.max(0, 1 - p * 4);
    if (scrollIndicator) scrollIndicator.style.opacity = Math.max(0, 1 - p * 4);

    // --- Cards: fly up from below ---
    const cardProgress = mapRange(p, 0, 0.6);
    const cards = document.querySelectorAll(".collage-card");
    cards.forEach((card, i) => {
      const c = cardCfg[i] || cardCfg[0];
      const yOff = lerp(c.yS, c.yE, cardProgress);
      const rot = lerp(c.rS, c.rE, cardProgress);
      card.style.transform = `translate3d(0, ${yOff}vh, 0) rotate(${rot}deg)`;
    });

    // Mouse sway on grid
    if (heroGrid) {
      gridX += (mouseX * 30 - gridX) * 0.06;
      gridY += (mouseY * 30 - gridY) * 0.06;
      heroGrid.style.transform = `translate(calc(-50% + ${gridX}px), calc(-50% + ${gridY}px))`;
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("scroll", calcProgress, { passive: true });
  window.addEventListener("resize", calcProgress);
  calcProgress();
  requestAnimationFrame(tick);

  // =============================================
  // SCROLL REVEAL (IntersectionObserver)
  // =============================================
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    window.__revealObserver = obs;
    revealEls.forEach((el) => obs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("revealed"));
  }

  // =============================================
  // CATEGORY TILE 3D TILT
  // =============================================
  document.querySelectorAll(".cat-tile").forEach((tile) => {
    tile.addEventListener("mousemove", (e) => {
      const r = tile.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const ry = (x - 0.5) * 16;
      const rx = (0.5 - y) * 10;
      tile.style.transform = `perspective(800px) rotateY(${ry}deg) rotateX(${rx}deg) scale(1.02)`;
    });
    tile.addEventListener("mouseleave", () => {
      tile.style.transform =
        "perspective(800px) rotateY(0) rotateX(0) scale(1)";
    });
  });

  // =============================================
  // PRODUCT DETAIL PAGE (PDP) INTERACTIONS
  // =============================================
  const pdpPage = document.querySelector(".pdp-page");
  if (pdpPage) {
    // 1. Gallery Interaction: Thumbnail Click -> Change Main Image
    const thumbs = document.querySelectorAll(".pdp-thumb");
    const mainImg = document.getElementById("pdp-main-img");

    if (mainImg && thumbs.length > 0) {
      thumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => {
          // Remove active class from all thumbs
          thumbs.forEach((t) => t.classList.remove("active"));
          // Add active class to clicked thumb
          thumb.classList.add("active");

          // Switch image with fade transition
          const newSrc = thumb.getAttribute("data-img");
          if (mainImg.src !== newSrc) {
            mainImg.classList.add("fade-out");
            setTimeout(() => {
              mainImg.src = newSrc;
              mainImg.classList.remove("fade-out");
            }, 300); // matches transition time
          }
        });
      });
    }

    // 2. Quantity Selector
    const qtyMinus = document.getElementById("pdp-qty-minus");
    const qtyPlus = document.getElementById("pdp-qty-plus");
    const qtyValue = document.getElementById("pdp-qty-value");

    if (qtyMinus && qtyPlus && qtyValue) {
      qtyMinus.addEventListener("click", () => {
        let val = parseInt(qtyValue.textContent) || 1;
        if (val > 1) {
          qtyValue.textContent = val - 1;
        }
      });

      qtyPlus.addEventListener("click", () => {
        let val = parseInt(qtyValue.textContent) || 1;
        if (val < 99) {
          qtyValue.textContent = val + 1;
        }
      });
    }

    // 3. Info Accordions (Details, Warranty, Care)
    const accordionHeaders = document.querySelectorAll(".pdp-info-row-header");
    accordionHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const row = header.parentElement;
        const content = row.querySelector(".pdp-info-row-content");
        const isExpanded = header.getAttribute("aria-expanded") === "true";

        // Toggle self
        header.setAttribute("aria-expanded", !isExpanded);
        row.classList.toggle("active");

        if (!isExpanded) {
          content.style.maxHeight = content.scrollHeight + "px";
        } else {
          content.style.maxHeight = "0px";
        }
      });
    });

    // 4. Tab Switching: "Mô tả sản phẩm" / "Đánh giá (0)"
    const tabs = document.querySelectorAll(".pdp-tab");
    const storySection = document.getElementById("pdp-story");
    const materialsSection = document.getElementById("pdp-materials");
    const reviewsSection = document.getElementById("pdp-reviews-section");

    if (tabs.length > 0) {
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const targetTab = tab.getAttribute("data-tab");

          // Set active tab styling
          tabs.forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");

          // Switch content sections
          if (targetTab === "desc") {
            if (storySection) storySection.style.display = "block";
            if (materialsSection) materialsSection.style.display = "block";
            if (reviewsSection) reviewsSection.style.display = "none";
          } else if (targetTab === "reviews") {
            if (storySection) storySection.style.display = "none";
            if (materialsSection) materialsSection.style.display = "none";
            if (reviewsSection) reviewsSection.style.display = "block";

            // Re-trigger scroll reveal since content was hidden and might be shown now
            const revealEls = reviewsSection.querySelectorAll("[data-reveal]");
            revealEls.forEach((el) => el.classList.add("revealed"));
          }
        });
      });
    }

    // 5. Review Form Interaction (Write Review Toggle)
    const writeReviewBtn = document.getElementById("pdp-write-review-btn");
    const reviewForm = document.getElementById("pdp-review-form");

    if (writeReviewBtn && reviewForm) {
      writeReviewBtn.addEventListener("click", () => {
        const isHidden = reviewForm.style.display === "none";
        reviewForm.style.display = isHidden ? "block" : "none";
        writeReviewBtn.textContent = isHidden
          ? "Hủy viết đánh giá"
          : "Viết đánh giá";
      });
    }

    // 6. Review Form Rating Input
    const starSelects = document.querySelectorAll(
      ".pdp-rating-input .star-select",
    );
    starSelects.forEach((star) => {
      star.addEventListener("click", () => {
        const value = parseInt(star.getAttribute("data-value"));

        starSelects.forEach((s) => {
          const val = parseInt(s.getAttribute("data-value"));
          if (val <= value) {
            s.textContent = "★";
            s.classList.add("selected");
          } else {
            s.textContent = "☆";
            s.classList.remove("selected");
          }
        });
      });
    });

    // Handle form submit
    if (reviewForm) {
      reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert(
          "Cảm ơn bạn đã gửi đánh giá! Đánh giá của bạn đang được kiểm duyệt.",
        );
        reviewForm.reset();
        reviewForm.style.display = "none";
        if (writeReviewBtn) writeReviewBtn.textContent = "Viết đánh giá";
        starSelects.forEach((s) => {
          s.textContent = "☆";
          s.classList.remove("selected");
        });
      });
    }

    // 7. Product Story "Xem thêm" Expand
    const storyExpand = document.getElementById("pdp-story-expand");
    const storyDetail = document.getElementById("pdp-story-detail");

    if (storyExpand && storyDetail) {
      storyExpand.addEventListener("click", () => {
        const isExpanded = storyExpand.classList.contains("active");
        storyExpand.classList.toggle("active");
        storyDetail.classList.toggle("active");

        const btnText = storyExpand.querySelector("span");

        if (!isExpanded) {
          storyDetail.style.maxHeight = storyDetail.scrollHeight + "px";
          if (btnText) btnText.textContent = "Thu gọn";
        } else {
          storyDetail.style.maxHeight = "0px";
          if (btnText) btnText.textContent = "Xem thêm";
        }
      });
    }

    // 8. FAQ Accordion Interaction
    const faqQuestions = document.querySelectorAll(".pdp-faq-question");
    faqQuestions.forEach((q) => {
      q.addEventListener("click", () => {
        const item = q.parentElement;
        const answer = item.querySelector(".pdp-faq-answer");
        const isExpanded = q.getAttribute("aria-expanded") === "true";

        // Close other FAQs
        document.querySelectorAll(".pdp-faq-item").forEach((otherItem) => {
          if (otherItem !== item && otherItem.classList.contains("active")) {
            otherItem.classList.remove("active");
            otherItem
              .querySelector(".pdp-faq-question")
              .setAttribute("aria-expanded", "false");
            otherItem.querySelector(".pdp-faq-answer").style.maxHeight = "0px";
          }
        });

        // Toggle self
        q.setAttribute("aria-expanded", !isExpanded);
        item.classList.toggle("active");

        if (!isExpanded) {
          answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
          answer.style.maxHeight = "0px";
        }
      });
    });

    // 9. Add to Cart / Buy Now UI notification (Toast/Alert)
    const btnAddCart = document.getElementById("pdp-add-cart");
    const btnBuyNow = document.getElementById("pdp-buy-now");

    if (btnAddCart) {
      btnAddCart.addEventListener("click", () => {
        const qty = qtyValue ? qtyValue.textContent : 1;
        alert(`Đã thêm ${qty} sản phẩm vào giỏ hàng!`);
      });
    }

    if (btnBuyNow) {
      btnBuyNow.addEventListener("click", () => {
        alert("Chuyển hướng đến trang thanh toán...");
      });
    }
  }

  // =============================================
  // AUTHOR PAGE INTERACTIONS
  // =============================================
  const portraitWrap = document.querySelector(".author-portrait-wrap");
  if (portraitWrap) {
    portraitWrap.addEventListener("mousemove", (e) => {
      const r = portraitWrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const ry = (x - 0.5) * 8; // subtle angle
      const rx = (0.5 - y) * 6;
      const img = portraitWrap.querySelector("#author-portrait-img");
      if (img) {
        img.style.transform = `scale(1.02) perspective(1000px) rotateY(${ry}deg) rotateX(${rx}deg)`;
      }
    });
    portraitWrap.addEventListener("mouseleave", () => {
      const img = portraitWrap.querySelector("#author-portrait-img");
      if (img) {
        img.style.transform =
          "scale(1) perspective(1000px) rotateY(0) rotateX(0)";
      }
    });
  }

  // =============================================
  // CATALOGUE PAGE INTERACTIONS & MASONRY (WITH PAGINATION)
  // =============================================
  const catalogueGrid = document.getElementById("catalogue-grid");
  if (catalogueGrid) {
    const filterToggleBtn = document.getElementById("filter-toggle-btn");
    const filterPanel = document.getElementById("filter-panel");
    const categoryButtons = document.querySelectorAll(
      "#category-filters-container .filter-btn",
    );
    const sortButtons = document.querySelectorAll(
      "#price-sorts-container .sort-btn",
    );
    const productCountDisplay = document.getElementById(
      "product-count-display",
    );

    // Pagination Controls
    const paginationContainer = document.getElementById("catalogue-pagination");
    const pagPrev = document.getElementById("pag-prev");
    const pagNext = document.getElementById("pag-next");
    const pagNumbers = document.getElementById("pag-numbers");

    const ITEMS_PER_PAGE = 12;
    let currentPage = 1;

    // Store original DOM order of products for default sort
    const productCards = Array.from(
      catalogueGrid.querySelectorAll(".product-card"),
    );
    const originalOrder = productCards.map((card, idx) => ({ card, idx }));

    // Toggle filter panel
    if (filterToggleBtn && filterPanel) {
      filterToggleBtn.addEventListener("click", () => {
        const isActive = filterPanel.classList.toggle("active");
        filterToggleBtn.classList.toggle("active");
        if (isActive) {
          // Trigger relayout in case dimensions changed
          setTimeout(layoutMasonry, 100);
        }
      });
    }

    // Catalogue Grid Layout Function
    function layoutMasonry() {
      catalogueGrid.style.height = "";
      catalogueGrid.querySelectorAll(".product-card").forEach((item) => {
        item.style.width = "";
        item.style.transform = "";
      });
    }

    // Paginate Items Function
    function paginateItems(activeItems) {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;

      activeItems.forEach((card, idx) => {
        if (idx >= startIndex && idx < endIndex) {
          card.style.display = ""; // Visible
        } else {
          card.style.display = "none"; // Hidden
        }
      });
    }

    // Update Pagination UI
    function updatePagination(visibleCount) {
      const totalPages = Math.ceil(visibleCount / ITEMS_PER_PAGE);

      if (totalPages <= 1) {
        if (paginationContainer) paginationContainer.style.display = "none";
        return;
      }

      if (paginationContainer) paginationContainer.style.display = "flex";

      // Enable/Disable Prev & Next
      if (pagPrev) pagPrev.disabled = currentPage === 1;
      if (pagNext) pagNext.disabled = currentPage === totalPages;

      // Render Page Numbers
      if (pagNumbers) {
        pagNumbers.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement("button");
          btn.className = `pag-num ${i === currentPage ? "active" : ""}`;
          btn.textContent = i;
          btn.setAttribute("aria-label", `Trang ${i}`);
          btn.addEventListener("click", () => {
            if (i === currentPage) return;
            currentPage = i;
            handlePageChange();
          });
          pagNumbers.appendChild(btn);
        }
      }
    }

    // Handle Page Change Actions
    function handlePageChange() {
      const activeItems = productCards.filter(
        (card) => !card.classList.contains("filtered-out"),
      );
      paginateItems(activeItems);
      updatePagination(activeItems.length);
      layoutMasonry();

      // Scroll to subheader smoothly
      const metaBar = document.querySelector(".catalogue-meta-bar");
      if (metaBar) {
        metaBar.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    // Prev/Next click handlers
    if (pagPrev) {
      pagPrev.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          handlePageChange();
        }
      });
    }

    if (pagNext) {
      pagNext.addEventListener("click", () => {
        const activeItems = productCards.filter(
          (card) => !card.classList.contains("filtered-out"),
        );
        const totalPages = Math.ceil(activeItems.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
          currentPage++;
          handlePageChange();
        }
      });
    }

    // Filter by Category Function
    function filterCategory(category) {
      currentPage = 1; // Reset to page 1
      let visibleCount = 0;

      productCards.forEach((card) => {
        const cardCat = card.getAttribute("data-category");
        if (category === "all" || cardCat === category) {
          card.classList.remove("filtered-out");
          visibleCount++;
        } else {
          card.classList.add("filtered-out");
        }
      });

      // Update count display
      if (productCountDisplay) {
        productCountDisplay.textContent = `${visibleCount} / ${productCards.length} sản phẩm`;
      }

      // Apply pagination & layout
      const activeItems = productCards.filter(
        (card) => !card.classList.contains("filtered-out"),
      );
      paginateItems(activeItems);
      updatePagination(activeItems.length);
      layoutMasonry();
    }

    // Sort by Price Function
    function sortProducts(sortType) {
      currentPage = 1; // Reset page on sort
      let sortedCards = [...productCards];

      if (sortType === "default") {
        sortedCards.sort((a, b) => {
          const idxA = originalOrder.find((item) => item.card === a).idx;
          const idxB = originalOrder.find((item) => item.card === b).idx;
          return idxA - idxB;
        });
      } else {
        sortedCards.sort((a, b) => {
          const priceA = parseInt(a.getAttribute("data-price")) || 0;
          const priceB = parseInt(b.getAttribute("data-price")) || 0;
          return sortType === "asc" ? priceA - priceB : priceB - priceA;
        });
      }

      // Re-append sorted cards in DOM
      sortedCards.forEach((card) => catalogueGrid.appendChild(card));

      // Update productCards list order to reflect sorted state
      productCards.length = 0;
      productCards.push(...sortedCards);

      // Apply pagination & layout
      const activeItems = productCards.filter(
        (card) => !card.classList.contains("filtered-out"),
      );
      paginateItems(activeItems);
      updatePagination(activeItems.length);
      layoutMasonry();
    }

    // Category button click handlers
    categoryButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        categoryButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        filterCategory(btn.getAttribute("data-category"));
      });
    });

    // Sort button click handlers
    sortButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        sortButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        sortProducts(btn.getAttribute("data-sort"));
      });
    });

    // Handle URL parameters on load (e.g. ?category=áo)
    function handleUrlParams() {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get("category");
      if (categoryParam) {
        const targetBtn = Array.from(categoryButtons).find(
          (btn) =>
            btn.getAttribute("data-category") === categoryParam.toLowerCase(),
        );
        if (targetBtn) {
          targetBtn.click();
          // Open filter panel to show active selection
          if (filterPanel && filterToggleBtn) {
            filterPanel.classList.add("active");
            filterToggleBtn.classList.add("active");
          }
        }
      }
    }

    // Recalculate layout on resize
    window.addEventListener("resize", layoutMasonry);

    // Initial setup
    const activeItems = productCards.filter(
      (card) => !card.classList.contains("filtered-out"),
    );
    paginateItems(activeItems);
    updatePagination(activeItems.length);
    layoutMasonry();

    // Ensure relayout when images load (important for height calculations)
    catalogueGrid.querySelectorAll(".product-image").forEach((img) => {
      if (img.complete) {
        layoutMasonry();
      } else {
        img.addEventListener("load", layoutMasonry);
      }
    });

    // Handle initial url filters
    handleUrlParams();

    // Fallback run to ensure everything is aligned
    setTimeout(layoutMasonry, 500);
  }

  // =============================================
  // WAVY ARTIST SLIDER
  // =============================================
  const wavyContainer = document.getElementById("wavy-slider-container");
  const wavyTrack = document.getElementById("wavy-slider-track");
  const artistCards = Array.from(
    document.querySelectorAll(".artist-wavy-card"),
  );

  if (wavyContainer && wavyTrack && artistCards.length > 0) {
    let containerWidth = wavyContainer.offsetWidth;
    let isPaused = false;
    let sliderPaused = false;
    const cardWidth = 280;
    let stepX = Math.max(
      360,
      Math.ceil((window.innerWidth + cardWidth) / artistCards.length),
    );
    let totalWidth = artistCards.length * stepX;

    // Initialize positions and event listeners for card hovers
    const cardsData = artistCards.map((card, index) => {
      const data = {
        el: card,
        x: index * stepX,
        y: 0,
        hoverProgress: 0,
        isHovered: false,
      };

      card.addEventListener("mouseenter", () => {
        console.log("JS: Card mouseenter", index);
        data.isHovered = true;
      });

      card.addEventListener("mouseleave", () => {
        console.log("JS: Card mouseleave", index);
        data.isHovered = false;
      });

      // Support touch interactions on mobile
      card.addEventListener(
        "touchstart",
        () => {
          data.isHovered = true;
        },
        { passive: true },
      );

      card.addEventListener(
        "touchend",
        () => {
          data.isHovered = false;
        },
        { passive: true },
      );

      return data;
    });

    // Expose debug variable to window for testing
    window.__slider_debug = {
      cardsData,
      getIsPaused: () => isPaused,
      getSliderPaused: () => sliderPaused,
    };

    // Handle mouse events to pause/resume
    wavyContainer.addEventListener("mouseenter", () => {
      console.log("JS: Container mouseenter");
      isPaused = true;
    });

    wavyContainer.addEventListener("mouseleave", () => {
      console.log("JS: Container mouseleave");
      isPaused = false;
    });

    // Handle touch events for mobile
    wavyContainer.addEventListener(
      "touchstart",
      () => {
        isPaused = true;
      },
      { passive: true },
    );

    wavyContainer.addEventListener(
      "touchend",
      () => {
        isPaused = false;
      },
      { passive: true },
    );

    function updateSlider() {
      containerWidth = wavyContainer.offsetWidth;
      const containerCenter = containerWidth / 2;
      const speed = 0.8; // speed of moving left

      sliderPaused = isPaused || cardsData.some((c) => c.isHovered);

      cardsData.forEach((card) => {
        // Move card left if not paused
        if (!sliderPaused) {
          card.x -= speed;
        }

        // Loop card to the right if it goes completely off-screen on the left
        if (card.x < -cardWidth - 100) {
          card.x += totalWidth;
        }

        // Calculate relative position within the slider container
        const cardCenter = card.x + cardWidth / 2;

        // S-curve Y coordinate calculation (sine wave)
        // One full sine wave period spans the container width
        const amplitude = 50; // amplitude of the wave in pixels
        const angle = (cardCenter / containerWidth) * Math.PI * 2;
        card.y = Math.sin(angle) * amplitude;

        // Proximity to center calculation for scaling
        const distFromCenter = Math.abs(cardCenter - containerCenter);
        const maxScaleDist = containerWidth / 1.5;
        let scaleFactor = 0;
        if (distFromCenter < maxScaleDist) {
          const linearFactor = 1 - distFromCenter / maxScaleDist;
          scaleFactor = Math.pow(linearFactor, 2);
        }

        // Interpolate hoverProgress smoothly for zoom/tilt transition
        const targetHover = card.isHovered ? 1 : 0;
        card.hoverProgress += (targetHover - card.hoverProgress) * 0.15;

        // Base scale from 0.92 to 1.10
        const baseScale = 0.92 + scaleFactor * 0.18;

        // Final scale is multiplied by 1.25 on hover (so the whole card grows by 25%)
        const finalScale = baseScale * (1 + card.hoverProgress * 0.25);

        // Tilt rotation of -5 degrees on hover
        const rotation = card.hoverProgress * -5;

        // Add 200 to z-index on hover to ensure hovered card is on top of everything
        const zIndex =
          Math.round(10 + scaleFactor * 90) + (card.isHovered ? 200 : 0);

        // Apply transforms
        card.el.style.transform = `translate3d(${card.x}px, calc(-50% + ${card.y}px), 0) scale(${finalScale}) rotate(${rotation}deg)`;
        card.el.style.zIndex = zIndex;

        // Fading out/in at container boundaries
        let opacity = 1;
        if (cardCenter < 0) {
          opacity = Math.max(0, 1 + cardCenter / cardWidth);
        } else if (cardCenter > containerWidth) {
          opacity = Math.max(0, 1 - (cardCenter - containerWidth) / cardWidth);
        }
        card.el.style.opacity = opacity;
      });

      requestAnimationFrame(updateSlider);
    }

    // Handle window resize
    window.addEventListener("resize", () => {
      containerWidth = wavyContainer.offsetWidth;
      const oldStepX = stepX;
      stepX = Math.max(
        360,
        Math.ceil((window.innerWidth + cardWidth) / artistCards.length),
      );
      totalWidth = artistCards.length * stepX;

      // Adjust card positions proportionally
      cardsData.forEach((card) => {
        card.x = (card.x / oldStepX) * stepX;
      });
    });

    // Run first frame immediately to position items before paint
    updateSlider();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initArtdictSite);
} else {
  initArtdictSite();
}

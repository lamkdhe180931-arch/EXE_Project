document.addEventListener('DOMContentLoaded', () => {

  // =============================================
  // MENU OVERLAY
  // =============================================
  const menuTrigger = document.getElementById('menu-open-btn');
  const menuClose = document.getElementById('menu-close-btn');
  const menuOverlay = document.getElementById('main-menu-overlay');
  const menuLinks = document.querySelectorAll('.menu-link');

  function openMenu() {
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (menuTrigger && menuOverlay && menuClose) {
    menuTrigger.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    menuLinks.forEach(l => l.addEventListener('click', closeMenu));
  }

  // =============================================
  // HERO SLIDESHOW (8s auto-rotate with swirl transition)
  // =============================================
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slide-dot');
  const timerProgress = document.getElementById('timer-progress');
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
      if (i === currentSlide) d.classList.add('active');
      else d.classList.remove('active');
    });

    if (skipAnimation || prevSlide === currentSlide) {
      // Just set the active class directly
      slides.forEach((s, i) => {
        if (i === currentSlide) {
          s.classList.add('slide-active');
          s.classList.remove('slide-swirl-in');
        } else {
          s.classList.remove('slide-active', 'slide-swirl-in');
        }
      });
    } else {
      // Swirl in the new slide over the previous one (keeps prev visible underneath)
      slides.forEach((s, i) => {
        if (i === prevSlide) {
          s.classList.add('slide-active');
          s.classList.remove('slide-swirl-in');
        } else if (i === currentSlide) {
          s.classList.remove('slide-active');
          s.classList.add('slide-swirl-in');
        } else {
          s.classList.remove('slide-active', 'slide-swirl-in');
        }
      });

      // After animation completes, switch to active class
      transitionTimeout = setTimeout(() => {
        slides.forEach((s, i) => {
          if (i === currentSlide) {
            s.classList.add('slide-active');
            s.classList.remove('slide-swirl-in');
          } else {
            s.classList.remove('slide-active', 'slide-swirl-in');
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
      timerProgress.classList.remove('timer-animating');
      // Force reflow
      void timerProgress.offsetWidth;
      timerProgress.classList.add('timer-animating');
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
    dot.addEventListener('click', () => {
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
  const heroSection = document.getElementById('hero-sec');
  const heroGrid = document.getElementById('collage-grid');
  const scrollLine1 = document.getElementById('scroll-text-l1');
  const scrollLine2 = document.getElementById('scroll-text-l2');
  const heroSubFade = null; // Removed
  const scrollIndicator = document.getElementById('scroll-indicator-btn');
  const heroSpacer = document.getElementById('hero-spacer');

  let targetP = 0;
  let currentP = 0;
  let mouseX = 0, mouseY = 0;
  let gridX = 0, gridY = 0;

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

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Clamp a value between 0 and 1
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

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
    const raw = 1 - (spacerRect.bottom / (wh + spacerHeight));
    targetP = clamp01(raw);
  }

  // Mouse sway
  if (heroSection && heroGrid) {
    heroSection.addEventListener('mousemove', (e) => {
      const r = heroSection.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width - 0.5;
      mouseY = (e.clientY - r.top) / r.height - 0.5;
    });
    heroSection.addEventListener('mouseleave', () => { mouseX = 0; mouseY = 0; });
  }

  // Color definitions
  const colorCrimson = '#a80c14';
  const colorBlack = '#fcfaf2'; // Transition to cream for visibility on dark background

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

      // Color transition
      const textColor = lerpColor(colorCrimson, colorBlack, colorPhase);

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
    const cards = document.querySelectorAll('.collage-card');
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

  window.addEventListener('scroll', calcProgress, { passive: true });
  window.addEventListener('resize', calcProgress);
  calcProgress();
  requestAnimationFrame(tick);

  // =============================================
  // SCROLL REVEAL (IntersectionObserver)
  // =============================================
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  // =============================================
  // CATEGORY TILE 3D TILT
  // =============================================
  document.querySelectorAll('.cat-tile').forEach(tile => {
    tile.addEventListener('mousemove', (e) => {
      const r = tile.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const ry = (x - 0.5) * 16;
      const rx = (0.5 - y) * 10;
      tile.style.transform = `perspective(800px) rotateY(${ry}deg) rotateX(${rx}deg) scale(1.02)`;
    });
    tile.addEventListener('mouseleave', () => {
      tile.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
    });
  });

});

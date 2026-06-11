/* ============================================================
   ARTDICT — main.js
   GSAP scroll animation cho mọi section + tilt + converge + counter
   ============================================================ */

const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- NAV ----------
   Nav (scroll state + burger + đóng menu mobile) do /js/artdict.js xử lý.
   index.html nạp cả main.js và artdict.js, nên gom nav về MỘT nguồn duy nhất
   (artdict.js) để tránh bind sự kiện hai lần. */

/* ---------- Nếu reduce motion: hiện mọi thứ tĩnh, dừng ---------- */
if (REDUCE) {
  document
    .querySelectorAll("[data-reveal]")
    .forEach((el) => el.classList.add("is-in"));
  document.querySelectorAll("[data-count]").forEach((el) => {
    el.textContent = el.dataset.count + (el.dataset.suffix || "");
  });
} else {
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1. Scroll-reveal cho MỌI section (rule bắt buộc #3) ---------- */
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => el.classList.add("is-in"),
    });
  });

  /* ---------- 2. Hero: text converge theo scroll ---------- */
  const l1 = document.querySelector('[data-converge="1"]');
  const l2 = document.querySelector('[data-converge="2"]');
  if (l1 && l2) {
    gsap.from(l1, {
      xPercent: -8,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.1,
    });
    gsap.from(l2, {
      xPercent: 8,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.25,
    });
    // hợp nhất / scale nhẹ khi cuộn qua hero
    gsap.to(".hero__title", {
      scale: 0.92,
      yPercent: -6,
      opacity: 0.85,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  /* ---------- 3. Hero collage: parallax float ---------- */
  gsap.utils.toArray(".mock").forEach((el) => {
    const speed = parseFloat(el.dataset.float || "0.05");
    gsap.to(el, {
      yPercent: speed * 180,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  /* ---------- 4. Manifesto: word-by-word reveal (overlapping scroll feel) ---------- */
  const words = gsap.utils.toArray(".manifesto__text [data-word]");
  if (words.length) {
    // Chữ sáng lên LẦN LƯỢT theo scroll: mờ -> rõ, từng chữ một (scrub).
    gsap.fromTo(
      words,
      { opacity: 0.16 },
      {
        opacity: 1,
        ease: "none",
        stagger: { each: 0.5, from: "start" },
        scrollTrigger: {
          trigger: ".manifesto",
          start: "top 80%",
          end: "center 56%",
          scrub: true,
        },
      },
    );
  }

  /* ---------- 5. Danh mục (Xưởng): parallax nhẹ ảnh trong từng card bento ---------- */
  gsap.utils
    .toArray(".craft-card:not(.craft-card--light) .craft-card__img")
    .forEach((img) => {
      gsap.to(img, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: ".craft",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

  /* ---------- 6. Stats: đếm số ---------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => (el.textContent = Math.round(obj.v) + suffix),
        }),
    });
  });

  /* ---------- 7. Wordmark: trượt nhẹ theo scroll ---------- */
  gsap.to(".wordmark__text", {
    xPercent: -4,
    ease: "none",
    scrollTrigger: {
      trigger: ".wordmark",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}

/* ---------- 8. 3D Tilt theo chuột (README: hover tilt) — tắt khi reduce / touch ---------- */
if (!REDUCE && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".tilt").forEach((el) => {
    const MAX = 8; // độ nghiêng tối đa
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg) translateZ(0)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "perspective(800px) rotateY(0) rotateX(0)";
    });
  });

  /* ---------- 9. Collage hero: mouse-parallax theo con trỏ ---------- */
  /* Mỗi mock trôi nhẹ theo chuột, biên độ theo data-float (depth) → cảm giác 3D.
     x/y (chuột) cộng với yPercent (scroll, mục 3) nên không xung đột. */
  const heroEl = document.querySelector(".hero");
  if (heroEl) {
    const movers = gsap.utils.toArray(".mock").map((m) => ({
      xTo: gsap.quickTo(m, "x", { duration: 0.7, ease: "power3.out" }),
      yTo: gsap.quickTo(m, "y", { duration: 0.7, ease: "power3.out" }),
      amp: parseFloat(m.dataset.float || "0.05") * 520,
    }));
    heroEl.addEventListener("mousemove", (e) => {
      const r = heroEl.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      movers.forEach((m) => {
        m.xTo(-px * m.amp);
        m.yTo(-py * m.amp);
      });
    });
    heroEl.addEventListener("mouseleave", () => {
      movers.forEach((m) => {
        m.xTo(0);
        m.yTo(0);
      });
    });
  }
}

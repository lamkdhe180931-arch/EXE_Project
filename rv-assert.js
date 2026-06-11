// Behavioral verification (prints values, no image reads).
const {
  chromium,
} = require("C:/Users/Admin/Desktop/website test/node_modules/playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
};
function srv() {
  const s = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/" || p === "") p = "/index.html";
    fs.readFile(path.join(ROOT, p), (e, d) => {
      if (e) {
        res.writeHead(404);
        res.end("404");
        return;
      }
      res.writeHead(200, {
        "content-type":
          TYPES[path.extname(p).toLowerCase()] || "application/octet-stream",
      });
      res.end(d);
    });
  });
  return new Promise((r) => s.listen(0, () => r(s)));
}
const log = (...a) => console.log(...a);

(async () => {
  const server = await srv();
  const base = `http://localhost:${server.address().port}`;
  const b = await chromium.launch();
  const ctx = await b.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));

  /* ---- 1. SUBMIT: copy button ---- */
  await page.goto(base + "/pages/submit.html", { waitUntil: "networkidle" });
  await page.click("[data-copy]");
  await page.waitForTimeout(300);
  const copyLabel = await page.textContent(".sub-copy__label");
  let clip = "";
  try {
    clip = await page.evaluate(() => navigator.clipboard.readText());
  } catch (e) {
    clip = "(clipboard read blocked)";
  }
  log("\n[SUBMIT] copy label after click :", JSON.stringify(copyLabel));
  log("[SUBMIT] clipboard contents      :", JSON.stringify(clip));
  log(
    "[SUBMIT] mailto present          :",
    await page.isVisible('a[href^="mailto:"]'),
  );

  /* ---- 2. INDEX: add to cart ---- */
  await page.goto(base + "/index.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.evaluate(() =>
    document.querySelector(".catalogue").scrollIntoView(),
  );
  const card = page.locator(".products .card").first();
  await card.hover();
  await page.waitForTimeout(200);
  await card.locator(".card__add").first().click();
  await page.waitForTimeout(700);
  const cart = await page.evaluate(() => ({
    stored: JSON.parse(localStorage.getItem("artdict_cart_v1") || "[]"),
    badge: document.querySelector("[data-cart-count]")?.textContent,
    drawerOpen: document
      .querySelector("[data-cart-drawer]")
      ?.classList.contains("open"),
    total: document.querySelector("[data-cart-total]")?.textContent,
  }));
  log("\n[CART] stored items   :", JSON.stringify(cart.stored));
  log("[CART] badge count    :", cart.badge);
  log("[CART] drawer open    :", cart.drawerOpen);
  log("[CART] total          :", cart.total);

  /* ---- 3. NAV: single binding (burger toggles once) ---- */
  await page.setViewportSize({ width: 480, height: 900 });
  await page.waitForTimeout(200);
  const navState = await page.evaluate(() => {
    const nav = document.getElementById("nav");
    const burger = document.getElementById("burger");
    burger.click();
    const afterFirst = nav.classList.contains("nav--open");
    burger.click();
    const afterSecond = nav.classList.contains("nav--open");
    return { afterFirst, afterSecond };
  });
  log("\n[NAV] open after 1 click :", navState.afterFirst, "(expect true)");
  log("[NAV] open after 2 clicks:", navState.afterSecond, "(expect false)");

  /* ---- 4. MANIFESTO: sequential glow (mid-scroll opacity spread) ---- */
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => {
    const m = document.querySelector(".manifesto");
    window.scrollTo(0, m.offsetTop - window.innerHeight * 0.62);
  });
  await page.waitForTimeout(900);
  const op = await page.evaluate(() => {
    const w = [...document.querySelectorAll(".manifesto__text [data-word]")];
    const val = (el) => parseFloat(getComputedStyle(el).opacity).toFixed(2);
    return {
      first: val(w[0]),
      mid: val(w[Math.floor(w.length / 2)]),
      last: val(w[w.length - 1]),
      n: w.length,
    };
  });
  log(
    "\n[MANIFESTO] words:",
    op.n,
    "| first:",
    op.first,
    "mid:",
    op.mid,
    "last:",
    op.last,
  );
  log(
    "[MANIFESTO] sequential glow (first brighter than last):",
    parseFloat(op.first) > parseFloat(op.last),
  );

  /* ---- 5. COLLAGE: parallax moves mocks + hover scales img ---- */
  await page.goto(base + "/index.html", { waitUntil: "networkidle" }); // fresh load (cart drawer closed)
  await page.waitForTimeout(700);
  const before = await page.evaluate(
    () => getComputedStyle(document.querySelector(".mock--a")).transform,
  );
  const hero = await page.locator(".hero").boundingBox();
  await page.mouse.move(hero.x + 120, hero.y + 120);
  await page.waitForTimeout(700);
  const after = await page.evaluate(
    () => getComputedStyle(document.querySelector(".mock--a")).transform,
  );
  await page.locator(".mock--a").hover();
  await page.waitForTimeout(600);
  const imgT = await page.evaluate(
    () => getComputedStyle(document.querySelector(".mock--a img")).transform,
  );
  log("\n[COLLAGE] mock transform before mousemove:", before.slice(0, 60));
  log("[COLLAGE] mock transform after mousemove :", after.slice(0, 60));
  log("[COLLAGE] parallax changed transform     :", before !== after);
  log("[COLLAGE] img transform on hover (scale) :", imgT.slice(0, 60));

  log("\n[ERRORS]:", errs.length ? errs : "none");
  await b.close();
  server.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

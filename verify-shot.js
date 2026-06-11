// Interaction/verification capture — clicks cart, scrolls manifesto (motion on),
// hovers collage, and logs any console/page errors. Temporary dev tool.
const {
  chromium,
} = require("C:/Users/Admin/Desktop/website test/node_modules/playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.resolve(ROOT, "screenshots");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
};
function startServer() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/" || p === "") p = "/index.html";
    const fp = path.join(ROOT, p);
    fs.readFile(fp, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("404");
        return;
      }
      res.writeHead(200, {
        "content-type":
          TYPES[path.extname(fp).toLowerCase()] || "application/octet-stream",
      });
      res.end(data);
    });
  });
  return new Promise((r) => server.listen(0, () => r(server)));
}

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();
  const errors = [];

  async function mk(viewport, reduce, mobile) {
    const ctx = await browser.newContext({
      viewport,
      reducedMotion: reduce ? "reduce" : "no-preference",
      deviceScaleFactor: mobile ? 2 : 1,
      isMobile: !!mobile,
    });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`[console] ${m.text()}`);
    });
    return { ctx, page };
  }

  // 1) submit.html
  {
    const { ctx, page } = await mk({ width: 1440, height: 900 }, true, false);
    await page.goto(base + "/pages/submit.html", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: OUT + "/submit-desktop-full.png",
      fullPage: true,
    });
    await page.screenshot({ path: OUT + "/submit-desktop-top.png" });
    await ctx.close();
  }
  {
    const { ctx, page } = await mk({ width: 390, height: 844 }, true, true);
    await page.goto(base + "/pages/submit.html", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: OUT + "/submit-mobile-full.png",
      fullPage: true,
    });
    await ctx.close();
  }

  // 2) index cart interaction (motion on)
  {
    const { ctx, page } = await mk({ width: 1440, height: 900 }, false, false);
    await page.goto(base + "/index.html", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.evaluate(() =>
      document.querySelector(".catalogue").scrollIntoView(),
    );
    await page.waitForTimeout(500);
    const card = page.locator(".products .card").first();
    await card.hover();
    await page.waitForTimeout(300);
    await card.locator(".card__add").first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: OUT + "/index-cart-open.png" });
    await ctx.close();
  }

  // 3) manifesto motion (partial + full glow)
  {
    const { ctx, page } = await mk({ width: 1440, height: 900 }, false, false);
    await page.goto(base + "/index.html", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      const m = document.querySelector(".manifesto");
      window.scrollTo(0, m.offsetTop - window.innerHeight * 0.72);
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: OUT + "/index-manifesto-partial.png" });
    await page.evaluate(() => {
      const m = document.querySelector(".manifesto");
      window.scrollTo(0, m.offsetTop - window.innerHeight * 0.32);
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: OUT + "/index-manifesto-full.png" });
    await ctx.close();
  }

  // 4) hero collage composition + hover/parallax
  {
    const { ctx, page } = await mk({ width: 1440, height: 900 }, false, false);
    await page.goto(base + "/index.html", { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await page.screenshot({ path: OUT + "/index-hero-collage.png" });
    const mock = page.locator(".mock--a");
    const box = await mock.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: OUT + "/index-hero-hover.png" });
    await ctx.close();
  }

  await browser.close();
  server.close();
  console.log("DONE " + base);
  if (errors.length) {
    console.log("=== PAGE / CONSOLE ERRORS ===");
    [...new Set(errors)].forEach((e) => console.log(e));
  } else {
    console.log("No console/page errors");
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

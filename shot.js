// Screenshot helper — serve repo qua static server rồi chụp bằng Playwright cài sẵn.
// (Site dùng đường dẫn root-relative + Web Components nên cần http, không chạy file://)
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
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();

  const shoot = async (name, url, viewport, mobile) => {
    const ctx = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
      deviceScaleFactor: mobile ? 2 : 1,
      isMobile: !!mobile,
    });
    const page = await ctx.newPage();
    await page.goto(base + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(OUT, `${name}-full.png`),
      fullPage: true,
    });
    await page.screenshot({ path: path.join(OUT, `${name}-top.png`) });
    await ctx.close();
  };

  await shoot("desktop", "/index.html", { width: 1440, height: 900 }, false);
  await shoot("mobile", "/index.html", { width: 390, height: 844 }, true);
  await shoot(
    "catalogue-desktop",
    "/pages/catalogue.html",
    { width: 1440, height: 900 },
    false,
  );
  await shoot(
    "catalogue-mobile",
    "/pages/catalogue.html",
    { width: 390, height: 844 },
    true,
  );
  await shoot(
    "product-desktop",
    "/pages/product.html",
    { width: 1440, height: 900 },
    false,
  );
  await shoot(
    "product-mobile",
    "/pages/product.html",
    { width: 390, height: 844 },
    true,
  );
  await shoot(
    "about-desktop",
    "/pages/about.html",
    { width: 1440, height: 900 },
    false,
  );
  await shoot(
    "about-mobile",
    "/pages/about.html",
    { width: 390, height: 844 },
    true,
  );
  await shoot(
    "collection-desktop",
    "/pages/collection.html",
    { width: 1440, height: 900 },
    false,
  );
  await shoot(
    "collection-mobile",
    "/pages/collection.html",
    { width: 390, height: 844 },
    true,
  );

  await browser.close();
  server.close();
  console.log("DONE " + base);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

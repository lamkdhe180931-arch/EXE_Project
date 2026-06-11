// Small-size review captures (<=820px wide) so they read within image limits.
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
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
};
function srv() {
  const s = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/" || p === "") p = "/index.html";
    const fp = path.join(ROOT, p);
    fs.readFile(fp, (e, d) => {
      if (e) {
        res.writeHead(404);
        res.end("404");
        return;
      }
      res.writeHead(200, {
        "content-type":
          TYPES[path.extname(fp).toLowerCase()] || "application/octet-stream",
      });
      res.end(d);
    });
  });
  return new Promise((r) => s.listen(0, () => r(s)));
}
(async () => {
  const server = await srv();
  const base = `http://localhost:${server.address().port}`;
  const b = await chromium.launch();

  // small viewport so PNG width stays ~820px
  const ctx = await b.newContext({
    viewport: { width: 820, height: 560 },
    reducedMotion: "no-preference",
  });
  const page = await ctx.newPage();

  // hero collage
  await page.goto(base + "/index.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: OUT + "/rv-collage.png" });
  // hover a mock
  const mk = page.locator(".mock--a");
  const box = await mk.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(700);
  }
  await page.screenshot({ path: OUT + "/rv-hover.png" });
  // manifesto partial
  await page.evaluate(() => {
    const m = document.querySelector(".manifesto");
    window.scrollTo(0, m.offsetTop - window.innerHeight * 0.72);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + "/rv-mani-partial.png" });
  // manifesto fuller
  await page.evaluate(() => {
    const m = document.querySelector(".manifesto");
    window.scrollTo(0, m.offsetTop - window.innerHeight * 0.4);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + "/rv-mani-full.png" });

  // submit mail block
  await page.goto(base + "/pages/submit.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const mail = page.locator(".sub-mail");
  await mail.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const mb = await mail.boundingBox();
  if (mb) {
    await page.screenshot({
      path: OUT + "/rv-submit-mail.png",
      clip: {
        x: 0,
        y: Math.max(0, mb.y - 10),
        width: 820,
        height: Math.min(540, mb.height + 20),
      },
    });
  }
  // submit steps
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + "/rv-submit-top.png" });

  await b.close();
  server.close();
  console.log("DONE");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

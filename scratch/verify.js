const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
  console.log("Starting Playwright verification for catalogue.html...");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const screenshotDir =
    "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\17b705f7-028e-4bfc-be85-6d7dec3afd37";

  // Ensure screenshot directory exists
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 1. Load the page
  console.log("Navigating to http://localhost:3000/catalogue.html...");
  await page.goto("http://localhost:3000/catalogue.html");
  await page.waitForTimeout(1000); // Wait for animations/load

  // 2. Count total products initially
  const allCards = await page.$$(".product-card");
  console.log(`Total products rendered in DOM: ${allCards.length}`);
  if (allCards.length === 0) {
    console.error("FAIL: No products found in DOM!");
    process.exit(1);
  }

  // 3. Take desktop screenshot
  console.log("Setting desktop viewport (1440x900)...");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(screenshotDir, "catalogue_desktop.png"),
    fullPage: true,
  });
  console.log("Saved catalogue_desktop.png");

  // 4. Test category filter: click "Áo"
  console.log('Testing category filter "Áo"...');
  // Open filter panel
  await page.click("#filter-toggle-btn");
  await page.waitForTimeout(500);
  await page.click("#filter-ao");
  await page.waitForTimeout(800); // Wait for transition

  const visibleCardsAo = await page.$$(".product-card:not(.filtered-out)");
  const hiddenCardsAo = await page.$$(".product-card.filtered-out");
  console.log(
    `Products after filtering for "Áo" - Visible: ${visibleCardsAo.length}, Hidden: ${hiddenCardsAo.length}`,
  );

  if (visibleCardsAo.length === 0 || hiddenCardsAo.length === 0) {
    console.error(
      "FAIL: Filtering for 'Áo' did not correctly hide/show items!",
    );
    process.exit(1);
  }
  await page.screenshot({
    path: path.join(screenshotDir, "catalogue_filter_ao.png"),
  });
  console.log("Saved catalogue_filter_ao.png");

  // 5. Test sorting: click "Cao đến Thấp" (desc) on all products
  console.log(
    'Resetting filter to "Tất cả" and testing price sorting (desc)...',
  );
  await page.click("#filter-all");
  await page.waitForTimeout(500);
  await page.click("#sort-desc");
  await page.waitForTimeout(800);

  // Read prices in DOM order
  const cards = await page.$$(".product-card");
  const prices = [];
  for (const card of cards) {
    const priceText = await card.getAttribute("data-price");
    prices.push(parseInt(priceText));
  }
  console.log("Rendered product prices order:", prices);

  // Check if sorted descending
  let isSortedDesc = true;
  for (let i = 0; i < prices.length - 1; i++) {
    if (prices[i] < prices[i + 1]) {
      isSortedDesc = false;
      break;
    }
  }
  console.log(`Prices sorted High to Low: ${isSortedDesc ? "YES" : "NO"}`);
  if (!isSortedDesc) {
    console.error("FAIL: Prices are not sorted descending!");
    process.exit(1);
  }
  await page.screenshot({
    path: path.join(screenshotDir, "catalogue_sort_desc.png"),
  });
  console.log("Saved catalogue_sort_desc.png");

  // 6. Test mobile view
  console.log("Setting mobile viewport (390x844)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(screenshotDir, "catalogue_mobile.png"),
    fullPage: true,
  });
  console.log("Saved catalogue_mobile.png");

  await browser.close();
  console.log("All tests passed successfully!");
})();

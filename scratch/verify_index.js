const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
  console.log("Starting Playwright verification for index.html wavy slider...");
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
  console.log("Navigating to http://localhost:3000/index.html...");
  await page.goto("http://localhost:3000/index.html");
  await page.waitForTimeout(1000); // Wait for initial setup/load

  // Scroll down to the team section to make sure it is in viewport
  console.log("Scrolling to team section...");
  await page.evaluate(() => {
    const el = document.getElementById("team-sec");
    if (el) el.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(1000); // Wait for scroll reveal animations

  // 2. Verify slider elements
  const container = await page.$("#wavy-slider-container");
  const track = await page.$("#wavy-slider-track");
  const cards = await page.$$(".artist-wavy-card");

  console.log(`Slider Container exists: ${!!container}`);
  console.log(`Slider Track exists: ${!!track}`);
  console.log(`Total artist cards found: ${cards.length} (Expected: 10)`);

  if (!container || !track || cards.length !== 10) {
    console.error("FAIL: Missing slider components or incorrect card count!");
    process.exit(1);
  }

  // 3. Take baseline desktop screenshot
  console.log("Setting desktop viewport (1440x900)...");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(screenshotDir, "index_slider_desktop.png"),
  });
  console.log("Saved index_slider_desktop.png");

  // 4. Verify slider is moving
  console.log("Verifying card positions are moving...");
  const getCardPositions = async () => {
    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".artist-wavy-card")).map(
        (card) => {
          const style = window.getComputedStyle(card);
          return style.transform;
        },
      );
    });
  };

  const positions1 = await getCardPositions();
  await page.waitForTimeout(1000); // Wait 1 second
  const positions2 = await getCardPositions();

  let hasMoved = false;
  for (let i = 0; i < positions1.length; i++) {
    if (positions1[i] !== positions2[i]) {
      hasMoved = true;
      break;
    }
  }

  console.log(`Slider is moving: ${hasMoved ? "YES" : "NO"}`);
  if (!hasMoved) {
    console.error("FAIL: Slider is static, not animating!");
    process.exit(1);
  }

  // 5. Verify hover-pause behavior
  console.log("Testing hover-pause behavior...");
  // Hover the first card to pause the slider
  await cards[0].hover();
  await page.waitForTimeout(500); // Wait to settle

  const positionsAfterHover1 = await getCardPositions();
  await page.waitForTimeout(1000); // Wait another second while hovered
  const positionsAfterHover2 = await getCardPositions();

  let hasMovedWhileHovered = false;
  for (let i = 0; i < positionsAfterHover1.length; i++) {
    if (positionsAfterHover1[i] !== positionsAfterHover2[i]) {
      hasMovedWhileHovered = true;
      break;
    }
  }

  console.log(
    `Slider is moving while hovered: ${hasMovedWhileHovered ? "YES" : "NO"}`,
  );
  if (hasMovedWhileHovered) {
    console.error("FAIL: Slider did not pause on hover!");
    process.exit(1);
  }

  // 6. Test mobile view
  console.log("Setting mobile viewport (390x844)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(screenshotDir, "index_slider_mobile.png"),
  });
  console.log("Saved index_slider_mobile.png");

  await browser.close();
  console.log("Index slider verification passed successfully!");
})();

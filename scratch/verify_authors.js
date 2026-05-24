const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
  console.log("Starting Playwright verification for authors.html...");
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
  console.log("Navigating to http://localhost:3000/authors.html...");
  await page.goto("http://localhost:3000/authors.html");
  await page.waitForTimeout(1000); // Wait for initial setup/load

  // 2. Verify layout, container, background, and cards count
  const bodyBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  console.log(`Body Background color: ${bodyBg}`); // Expected: rgb(252, 250, 242) for cream

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

  // 3. Verify title text
  const titleText = await page.evaluate(() => {
    const subtitle = document.querySelector(".team-subtitle-wavy");
    return subtitle ? subtitle.innerText.trim() : "";
  });
  console.log(`Subtitle text:\n${titleText}`);
  if (
    !titleText.includes("Hãy gặp gỡ những tác giả đằng sau những") ||
    !titleText.includes("tác phẩm chất để đời")
  ) {
    console.error("FAIL: Subtitle text is incorrect!");
    process.exit(1);
  }

  // 4. Save desktop screenshot
  console.log("Setting desktop viewport (1440x900)...");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(screenshotDir, "authors_slider_desktop_light.png"),
  });
  console.log("Saved authors_slider_desktop_light.png");

  // 5. Verify the slider animates
  console.log("Verifying card positions are moving...");
  const getCardTransforms = async () => {
    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".artist-wavy-card")).map(
        (card) => {
          return card.style.transform;
        },
      );
    });
  };

  const transforms1 = await getCardTransforms();
  await page.waitForTimeout(1000);
  const transforms2 = await getCardTransforms();

  let hasMoved = false;
  for (let i = 0; i < transforms1.length; i++) {
    if (transforms1[i] !== transforms2[i]) {
      hasMoved = true;
      break;
    }
  }

  console.log(`Slider is moving: ${hasMoved ? "YES" : "NO"}`);
  if (!hasMoved) {
    console.error("FAIL: Slider is static!");
    process.exit(1);
  }

  // 6. Verify card hover effects (scaling & rotation)
  console.log("Testing hover scaling and tilt...");
  // Programmatically trigger hover via dispatching mouseenter event
  await page.evaluate(() => {
    const card = document.querySelectorAll(".artist-wavy-card")[0];
    card.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  });
  await page.waitForTimeout(800); // Wait for interpolation

  const hoverCardTransform = await page.evaluate(() => {
    const card = document.querySelectorAll(".artist-wavy-card")[0];
    return card.style.transform;
  });
  console.log(`Hovered card transform: ${hoverCardTransform}`);

  if (
    !hoverCardTransform.includes("scale") &&
    !hoverCardTransform.includes("rotate")
  ) {
    console.error("FAIL: Hover transform did not apply scale or rotation!");
    process.exit(1);
  }

  // Check if zoom scale is around 1.15 to 1.35 (base scale is ~0.92-1.10, times 1.25 on hover)
  // Let's print out the debug state from window
  const debugState = await page.evaluate(() => {
    return window.__slider_debug
      ? {
          isPaused: window.__slider_debug.getIsPaused(),
          sliderPaused: window.__slider_debug.getSliderPaused(),
          hoverProgress: window.__slider_debug.cardsData[0].hoverProgress,
          isHovered: window.__slider_debug.cardsData[0].isHovered,
        }
      : null;
  });
  console.log("Window debug state:", debugState);
  if (!debugState || !debugState.isHovered || debugState.hoverProgress < 0.9) {
    console.error("FAIL: Hover progress not updated correctly in JS loop!");
    process.exit(1);
  }

  // 7. Save mobile screenshot
  console.log("Setting mobile viewport (390x844)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(screenshotDir, "authors_slider_mobile_light.png"),
  });
  console.log("Saved authors_slider_mobile_light.png");

  await browser.close();
  console.log("Authors slider verification passed successfully!");
})();

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";

async function assertRoute(pathname, markers) {
  const response = await fetch(`${baseUrl}${pathname}`);

  if (!response.ok) {
    throw new Error(`Expected ${pathname} to return 2xx, got ${response.status}`);
  }

  const html = await response.text();
  const missingMarkers = markers.filter((marker) => !html.includes(marker));

  if (missingMarkers.length > 0) {
    throw new Error(`Missing markers on ${pathname}: ${missingMarkers.join(", ")}`);
  }
}

(async () => {
  console.log("Starting smoke verification for Next.js authors page...");

  await assertRoute("/authors", [
    "authors-main",
    "team-sec",
    "wavy-slider-track",
    "team-title-img"
  ]);

  await assertRoute("/authors/kieu-duc-lam", [
    "author-main",
    "author-hero",
    "author-name-title",
    "author-timeline-sec"
  ]);

  console.log("Authors and author detail verification passed successfully!");
})();

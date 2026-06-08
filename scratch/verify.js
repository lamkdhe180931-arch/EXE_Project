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
  console.log("Starting smoke verification for Next.js catalogue page...");

  await assertRoute("/catalogue", ["catalogue-main", "catalogue-grid"]);

  console.log("Catalogue page verification passed successfully!");
})();

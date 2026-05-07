/**
 * Removes Next.js output and webpack’s pack cache.
 * IMPORTANT: Stop `npm run dev` before running, or the running server will hold
 * broken references and keep serving 404s for `/_next/static/chunks/*`.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dirs = [path.join(root, ".next"), path.join(root, "node_modules", ".cache")];

for (const dir of dirs) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("Removed:", path.relative(root, dir) || ".");
  } catch (e) {
    console.warn("Skip:", dir, e.message);
  }
}
console.log("Done. Start the app with: npm run dev");

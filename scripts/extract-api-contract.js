// Extract every API path the frontend calls, so the modular server can be
// verified against the exact public contract it must preserve.
//
// Usage:  node scripts/extract-api-contract.js
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "apps/web/src");

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) files.push(full);
  }
})(SRC);

const found = new Map();
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  // Match axios calls: .get('/path'), .post("/path", ...), .patch(`/path`)
  const re = /\.(get|post|put|patch|delete)\(\s*[`'"]([^`'"]*)[`'"]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const [, method, url] = m;
    const rel = path.relative(ROOT, file);
    const key = `${method.toUpperCase()} ${url}`;
    if (!found.has(key)) found.set(key, new Set());
    found.get(key).add(rel);
  }
}

const rows = [...found.entries()].sort((a, b) => a[0].localeCompare(b[0]));
console.log(`# ${rows.length} distinct (method, url) pairs used by the web app\n`);
for (const [key, srcs] of rows) {
  console.log(key);
  for (const f of [...srcs].sort()) console.log(`    ${f}`);
}

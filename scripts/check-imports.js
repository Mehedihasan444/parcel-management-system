// Verify that every relative import in the web app resolves to a real file.
//
// Vite/Rollup reports these one at a time during a build, which is slow to
// iterate on. This walks the source tree and checks them all in one pass, and
// is case-sensitive so it catches "hooks" vs "Hooks" mistakes that only fail
// on case-sensitive filesystems.
//
// Usage:  node scripts/check-imports.js
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "apps/web");
const SRC = path.join(ROOT, "src");
const EXTENSIONS = ["", ".js", ".jsx", ".ts", ".tsx", ".json"];

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) files.push(full);
  }
})(SRC);

/** Resolves a relative specifier the way Vite would, and reports why not. */
function resolves(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);

  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return true;
  }
  // Directory import: ./Foo -> ./Foo/index.jsx
  if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
    for (const ext of [".js", ".jsx", ".ts", ".tsx"]) {
      const idx = path.join(base, "index" + ext);
      if (fs.existsSync(idx)) return true;
    }
  }
  return false;
}

const problems = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  // Match the import/require specifier, skipping commented-out lines.
  const re = /(?:^|\n)\s*(?:import\s[^'"]*from\s*|import\s*|export\s[^'"]*from\s*)['"](\.[^'"]+)['"]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const specifier = m[1];
    // Ignore specifiers inside line comments.
    const lineStart = text.lastIndexOf("\n", m.index) + 1;
    if (text.slice(lineStart, m.index).trimStart().startsWith("//")) continue;

    if (!resolves(file, specifier)) {
      problems.push({
        file: path.relative(ROOT, file),
        specifier,
      });
    }
  }
}

if (problems.length) {
  console.error(`Found ${problems.length} unresolved relative import(s):\n`);
  for (const p of problems) {
    console.error(`  ${p.file}\n    -> ${p.specifier}`);
  }
  process.exit(1);
}

console.log(`OK: all relative imports in ${files.length} source files resolve.`);

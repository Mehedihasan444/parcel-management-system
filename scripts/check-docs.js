// Verify that every repo-relative path and npm script referenced in the
// documentation actually exists, so the README cannot drift out of sync with
// the tree.
//
// Usage:  node scripts/check-docs.js
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DOCS = ["README.md", "CONTRIBUTING.md", "docs/HISTORY.md"];

const problems = [];

// 1. Relative links in the docs must resolve to real files.
for (const doc of DOCS) {
  const file = path.join(ROOT, doc);
  if (!fs.existsSync(file)) {
    problems.push(`${doc}: missing`);
    continue;
  }

  const text = fs.readFileSync(file, "utf8");
  // Markdown links: [label](target)
  const linkRe = /\[[^\]]*\]\(([^)]+)\)/g;
  let m;
  while ((m = linkRe.exec(text)) !== null) {
    const target = m[1];
    if (/^(https?:|mailto:|#)/.test(target)) continue;

    const clean = target.split("#")[0];
    if (!clean) continue;

    const resolved = path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(resolved)) {
      problems.push(`${doc}: broken link -> ${target}`);
    }
  }
}

// 2. `npm run <script>` references in the docs must exist. A reference may
//    name a root script, or a per-workspace script when it is scoped with
//    `--workspace=<name>` / `-w <name>`.
const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const rootScripts = new Set(Object.keys(rootPkg.scripts || {}));

const workspaceScripts = new Map();
for (const wsGlob of rootPkg.workspaces || []) {
  const base = wsGlob.replace(/\/\*$/, "");
  if (!fs.existsSync(path.join(ROOT, base))) continue;
  for (const entry of fs.readdirSync(path.join(ROOT, base))) {
    const manifest = path.join(ROOT, base, entry, "package.json");
    if (!fs.existsSync(manifest)) continue;
    const pkg = JSON.parse(fs.readFileSync(manifest, "utf8"));
    workspaceScripts.set(pkg.name, new Set(Object.keys(pkg.scripts || {})));
  }
}

for (const doc of DOCS) {
  const file = path.join(ROOT, doc);
  if (!fs.existsSync(file)) continue;

  const text = fs.readFileSync(file, "utf8");
  // Matches `npm run foo` and `npm run foo --workspace=@scope/name`
  const runRe = /npm run ([a-zA-Z0-9:_-]+)((?:[^`\n]*?--workspace=[^\s`]+)?)/g;
  let m;
  while ((m = runRe.exec(text)) !== null) {
    const name = m[1];
    const scope = (m[2] || "").trim();

    if (rootScripts.has(name)) continue; // valid as a root script

    if (scope) {
      // Only the first --workspace value is considered; chained ones are rare.
      const wsName = scope.split("--workspace=")[1].trim();
      const known = workspaceScripts.get(wsName);
      if (known && known.has(name)) continue;
      problems.push(
        `${doc}: references "${name}" with --workspace=${wsName}, which does not define it`
      );
      continue;
    }

    problems.push(`${doc}: references missing root script "npm run ${name}"`);
  }
}

// 3. Paths mentioned inside fenced code blocks as repo files should exist.
const TREE_ENTRIES = [
  "apps/api/src/config",
  "apps/api/src/middleware",
  "apps/api/src/modules",
  "apps/api/src/utils",
  "apps/api/src/routes",
  "apps/api/src/app.js",
  "apps/api/src/server.js",
  "apps/api/scripts/route-contract.test.js",
  "apps/api/scripts/smoke.js",
  "apps/web/src/config",
  "apps/web/src/Components",
  "apps/web/src/Pages",
  "apps/web/src/Hooks",
  "apps/web/src/Firebase",
  "apps/web/scripts/lint.js",
  "docs/HISTORY.md",
  "scripts/audit-secrets.sh",
  "scripts/check-imports.js",
  "scripts/extract-api-contract.js",
  "scripts/filter-repo-replacements.txt",
  "apps/api/.env.example",
  "apps/web/.env.example",
];

for (const entry of TREE_ENTRIES) {
  if (!fs.existsSync(path.join(ROOT, entry))) {
    problems.push(`documented path does not exist: ${entry}`);
  }
}

// 4. README must not claim the reference tags exist without them being present.
for (const tag of ["archive/api-head", "archive/web-head", "pre-monorepo"]) {
  const mentioned = DOCS.some((doc) => {
    const file = path.join(ROOT, doc);
    return fs.existsSync(file) && fs.readFileSync(file, "utf8").includes(tag);
  });
  if (!mentioned) continue;

  const { execFileSync } = require("child_process");
  try {
    execFileSync("git", ["rev-parse", "--verify", tag], { cwd: ROOT, stdio: "ignore" });
  } catch {
    problems.push(`README references tag "${tag}" but it does not exist locally`);
  }
}

if (problems.length) {
  console.error(`Documentation check failed (${problems.length}):\n`);
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

console.log("OK: documentation links, scripts, paths and tags are all valid.");

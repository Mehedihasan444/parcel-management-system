#!/usr/bin/env node
/**
 * Lint the web app. Zero tolerance: any ESLint problem fails the build.
 *
 * The inherited lint debt (unused vars, missing prop-types) was paid off
 * during modernization, so the old problem-count budget is gone. Keep it
 * that way — fix new warnings instead of raising a budget.
 *
 * Usage:  node scripts/lint.js
 *
 * This app is an ES module package ("type": "module"), so this file uses ESM.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync("npx", ["eslint", ".", "-f", "json"], {
  cwd: APP_ROOT,
  encoding: "utf8",
});

if (result.error) {
  console.error("Failed to run eslint:", result.error.message);
  process.exit(1);
}

if (result.status !== 0 && !result.stdout) {
  // eslint failed to run at all (bad config, crash) — surface it verbatim.
  process.stderr.write(result.stderr || "");
  console.error("eslint exited with status", result.status, "and produced no report");
  process.exit(result.status || 1);
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  console.error("Could not parse the eslint JSON report");
  process.exit(1);
}

const counts = new Map();
let total = 0;
let fixable = 0;

for (const file of report) {
  for (const msg of file.messages) {
    total++;
    if (msg.fix) fixable++;
    const key = msg.ruleId || "(parse error)";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
}

console.log("Lint summary for @parcel/web");
console.log("---------------------------");

if (total === 0) {
  console.log("No problems found.");
  process.exit(0);
}

for (const [rule, count] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(count).padStart(4)}  ${rule}`);
}

console.log("");
console.log(`  total: ${total}   auto-fixable: ${fixable}`);
console.error("");
console.error(`FAIL: ${total} problem(s) found. This repo holds a zero-tolerance`);
console.error(`lint policy — fix them instead of adding suppressions.`);
process.exit(1);

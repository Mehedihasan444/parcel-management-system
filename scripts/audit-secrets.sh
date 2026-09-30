#!/usr/bin/env bash
#
# Secret audit for the parcel-management-system monorepo.
#
# Scans EVERY blob in the full history (all refs) for patterns that indicate
# committed credentials, and asserts that sensitive paths never entered git.
# Exits non-zero if anything is found, so it can be wired into CI.
#
# Usage:  ./scripts/audit-secrets.sh
set -euo pipefail

cd "$(dirname "$0")/.."

# git-filter-repo is not always on PATH; fall back to the vendored copy.
FILTER_REPO_BIN="${FILTER_REPO_BIN:-/home/mehedi/projects/git-filter-bin}"
if ! git filter-repo --version >/dev/null 2>&1; then
  if [ -x "$FILTER_REPO_BIN/git-filter-repo" ]; then
    export PATH="$PATH:$FILTER_REPO_BIN"
  fi
fi

echo "== Parcel Management System - history secret audit =="
echo

# Patterns that must never appear committed: Stripe keys, Stripe webhooks,
# private keys, GitHub tokens, Google API keys, MongoDB connection strings
# and literal JWT secret assignments.
#
# The MongoDB pattern deliberately excludes `$` from both credential segments:
# a URI built from `${process.env.X}` interpolation is a template, not a
# leaked secret, and must not be reported.
PATTERNS='sk_live_|sk_test_[0-9A-Za-z]{8,}|pk_live_|whsec_|rk_live_|AIza[0-9A-Za-z_-]{35}|ghp_[0-9A-Za-z]{36}|github_pat_|gho_[0-9A-Za-z]{36}|-----BEGIN [A-Z ]*PRIVATE KEY-----|mongodb(\+srv)?://[^[:space:]"'"'"'$]+:[^[:space:]"'"'"'$]+@'

# Lines that are clearly not credentials, and so are exempt:
#   - placeholder values used by the test and smoke scripts
#   - the PATTERNS line of this script, including older committed copies of
#     it, which necessarily spell out "sk_live_", "AIza[...]" and friends.
# Without this the audit would flag its own source on every run.
ALLOW='sk_test_dummy|test-secret|test-user|test-password|sk_live_\||sk_test_\||AIza\[0-9A-Za-z_-\]'

status=0

echo "-- scanning all blobs in history --"
blobs=$(git rev-list --objects --all | awk '{print $1}' | sort -u)
hits=0
for blob in $blobs; do
  # Only inspect blobs, not trees or commits.
  type=$(git cat-file -t "$blob" 2>/dev/null || true)
  [ "$type" = "blob" ] || continue
  if git cat-file -p "$blob" 2>/dev/null | grep -InE "$PATTERNS" | grep -vE "$ALLOW" | sed "s|^|  $blob: |"; then
    hits=$((hits + 1))
  fi
done
echo "objects scanned: $(echo "$blobs" | wc -w)"

if [ "$hits" -gt 0 ]; then
  echo
  echo "!! $hits blob(s) contain credential-like patterns - see above."
  status=1
else
  echo "OK: no credential-like patterns in any blob."
fi

echo
echo "-- asserting sensitive paths never entered history --"
for path in .env .env.local .env.production; do
  if git --no-pager log --all --oneline -- "apps/api/$path" "apps/web/$path" "$path" 2>/dev/null | grep -q .; then
    echo "!! $path was committed at some point"
    status=1
  else
    echo "OK: $path never committed"
  fi
done

echo
if [ "$status" -eq 0 ]; then
  echo "RESULT: clean"
else
  echo "RESULT: issues found (see above)"
fi
exit "$status"

#!/usr/bin/env node
// Secret scanner (WP-0.12 [W0-SEC-001]) — fails if a likely real secret literal is tracked
// in git. Env vars only; secrets never in code/commits/logs (CLAUDE.md §2). Wired as a CI
// gate (WP-0.10) and runnable locally. Exit 0 = clean, exit 1 = likely secret(s) found.
//
// Scans only git-TRACKED files (so .env.local etc. — gitignored — are out of scope by
// design). Excludes docs, generated artifacts, the lockfile, this file (it defines the
// patterns), and the env template (names only). Patterns are anchored to known credential
// shapes to keep false positives low; local-dev `…@localhost` URLs are intentionally allowed.

import { execSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const EXCLUDE_PREFIXES = [
  "generatedDocs/",
  "governanceReviews/",
  "node_modules/",
  "generated-contracts-registry/",
  "src/generated/",
  ".husky/_/",
];
const EXCLUDE_FILES = new Set([
  "package-lock.json",
  ".env.example",
  "scripts/check-no-secrets.mjs",
]);
const EXCLUDE_EXT = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
  ".webp",
  ".woff",
  ".woff2",
  ".node",
  ".wasm",
];

// Known credential shapes. `…@localhost`/`127.0.0.1` are excluded from the DB-URL rule so
// documented local-dev connection strings (docker-compose) don't false-positive.
const PATTERNS = [
  { name: "private key block", re: /-----BEGIN[A-Z ]*PRIVATE KEY-----/ },
  { name: "AWS access key id", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "GitHub token", re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b/ },
  { name: "GitHub fine-grained PAT", re: /\bgithub_pat_[A-Za-z0-9_]{22,}\b/ },
  { name: "Anthropic API key", re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/ },
  { name: "OpenAI key", re: /\bsk-(?!ant-)[A-Za-z0-9_-]{20,}\b/ },
  { name: "Supabase access token", re: /\bsbp_[A-Za-z0-9]{36,}\b/ },
  { name: "Resend key", re: /\bre_[A-Za-z0-9]{20,}\b/ },
  { name: "Slack token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  {
    name: "JWT (Supabase service/anon key)",
    re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{8,}\b/,
  },
  {
    name: "DB URL with credentials (non-local)",
    re: /\bpostgres(?:ql)?:\/\/[^\s:@/]+:[^\s:@/]+@(?!localhost|127\.0\.0\.1)[^\s/]+/,
  },
];

const files = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean);
const findings = [];

for (const file of files) {
  if (EXCLUDE_FILES.has(file)) continue;
  if (EXCLUDE_PREFIXES.some((p) => file.startsWith(p))) continue;
  if (EXCLUDE_EXT.some((e) => file.toLowerCase().endsWith(e))) continue;

  let content;
  try {
    if (statSync(file).size > 2_000_000) continue;
    const buf = readFileSync(file);
    if (buf.includes(0)) continue; // binary file (NUL byte) — skip
    content = buf.toString("utf8");
  } catch {
    continue;
  }

  content.split("\n").forEach((line, i) => {
    for (const { name, re } of PATTERNS) {
      if (re.test(line)) findings.push({ file, line: i + 1, name });
    }
  });
}

if (findings.length > 0) {
  console.error(`SECRET SCAN FAILED — ${findings.length} likely secret(s) in tracked files:`);
  for (const f of findings) console.error(`  - ${f.file}:${f.line} — ${f.name}`);
  console.error("Move secrets to env (.env.local / CI secrets); never commit them (CLAUDE.md §2).");
  process.exit(1);
}

console.log(
  `secret scan: clean (${files.length} tracked files scanned; ${PATTERNS.length} patterns).`,
);
process.exit(0);

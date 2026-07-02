#!/usr/bin/env node
/**
 * FE Program WBS coverage check (FE-PM v1.0 — Phase-B gate).
 * Asserts every one of the 144 frozen P-* page IDs is owned by EXACTLY ONE FE-* milestone,
 * by parsing the machine-readable block between <!-- coverage:begin --> and <!-- coverage:end -->
 * in project-management/fe-program-wbs.md. Enumerated per-ID check, not a sum check.
 * Exit 0 = invariant holds; exit 1 = violation (details on stderr).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wbs = readFileSync(join(root, "project-management", "fe-program-wbs.md"), "utf8");

// The frozen 144-page universe (page_inventory.md prefixes + counts).
const UNIVERSE = { SH: 6, PUB: 24, AUTH: 8, ACC: 22, BUY: 27, VND: 28, ADM: 29 };
const pad = (n) => String(n).padStart(2, "0");
const expected = new Set(
  Object.entries(UNIVERSE).flatMap(([p, n]) =>
    Array.from({ length: n }, (_, i) => `P-${p}-${pad(i + 1)}`),
  ),
);

const block = wbs.match(/<!-- coverage:begin -->([\s\S]*?)<!-- coverage:end -->/);
if (!block) {
  console.error("FAIL: coverage block markers not found in fe-program-wbs.md");
  process.exit(1);
}

const owners = new Map(); // pageId -> [milestoneIds]
for (const line of block[1].split("\n")) {
  const row = line.match(/^\|\s*(FE-[A-Z]+-\d+)\s*\|(.+)\|\s*$/);
  if (!row) continue;
  const [, milestone, ownsCell] = row;
  for (const token of ownsCell
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)) {
    const range = token.match(/^P-([A-Z]+)-(\d{2})\.\.(\d{2})$/);
    const single = token.match(/^P-([A-Z]+)-(\d{2})$/);
    let ids = [];
    if (range) {
      const [, p, a, b] = range;
      for (let i = Number(a); i <= Number(b); i++) ids.push(`P-${p}-${pad(i)}`);
    } else if (single) {
      ids = [token];
    } else {
      console.error(`FAIL: unparseable owns token "${token}" in ${milestone}`);
      process.exit(1);
    }
    for (const id of ids) {
      if (!owners.has(id)) owners.set(id, []);
      owners.get(id).push(milestone);
    }
  }
}

let ok = true;
const dupes = [...owners].filter(([, m]) => m.length > 1);
const unknown = [...owners.keys()].filter((id) => !expected.has(id));
const missing = [...expected].filter((id) => !owners.has(id));
if (dupes.length) {
  ok = false;
  console.error(
    "FAIL double-homed:",
    dupes.map(([id, m]) => `${id} → ${m.join(" + ")}`).join("; "),
  );
}
if (unknown.length) {
  ok = false;
  console.error("FAIL not in the frozen 144:", unknown.join(", "));
}
if (missing.length) {
  ok = false;
  console.error("FAIL unowned pages:", missing.join(", "));
}

if (ok) {
  console.log(
    `PASS: ${owners.size}/144 pages, each owned exactly once, across ${new Set([...owners.values()].flat()).size} milestones.`,
  );
} else {
  process.exit(1);
}

// FE-PUB-09 MEGA_MENU Phase 0 — taxonomy seed generator (MEGA_MENU_DATA_MODEL.md §4).
//
// Parses Taxonomy Content v1.0's master table (productSpec/CATEGORY_MIGRATION_PLAN.md
// **Appendix C** — the Board-ratified 794-node tree, P1-approved 2026-07-03) and emits
// `src/frontend/navigation/model/taxonomy.v1.json` (flat CategoryNodeData[]). The seed is
// ALWAYS generated, never hand-copied — this script is the only writer, so the menu cannot
// drift from the canonical table.
//
//   node scripts/generate-taxonomy-seed.mjs           # regenerate the seed
//   node scripts/generate-taxonomy-seed.mjs --check   # drift check (CI/verify): fails on ANY
//                                                     # mismatch between Appendix C and the seed
//
// IDs are deterministic name-based UUIDs (v5-style over slug) so regeneration is byte-stable —
// an INTERIM stand-in replaced wholesale by real UUIDv7s when the `list_categories` projection
// lands (`[ESC-7-API-CATNAV]`); consumers key on slug, never on these ids.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "productSpec", "CATEGORY_MIGRATION_PLAN.md");
const TARGET = path.join(ROOT, "src", "frontend", "navigation", "model", "taxonomy.v1.json");

const EXPECTED_TOTAL = 794;
const EXPECTED_BY_LEVEL = { 1: 13, 2: 87, 3: 354, 4: 340 };

/** Deterministic name-based UUID (RFC 4122 v5 shape) over the slug. */
function idForSlug(slug) {
  const hash = createHash("sha1").update(`ivendorz-taxonomy-v1:${slug}`).digest("hex");
  const hex =
    hash.slice(0, 12) +
    "5" + // version nibble: name-based
    hash.slice(13, 16) +
    ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16) + // RFC 4122 variant
    hash.slice(17, 32);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function parseAppendixC(markdown) {
  const appendixStart = markdown.indexOf("## Appendix C");
  if (appendixStart === -1) fail("Appendix C heading not found in CATEGORY_MIGRATION_PLAN.md");
  const section = markdown.slice(appendixStart);
  const lines = section.split(/\r?\n/);

  const rows = [];
  let inTable = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) {
      if (inTable) break; // table ended
      continue;
    }
    // Header + divider rows
    if (/^\|\s*slug\s*\|/i.test(trimmed) || /^\|[\s\-|]+\|$/.test(trimmed)) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    const cells = trimmed
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());
    if (cells.length < 4) fail(`Malformed Appendix C row: ${trimmed}`);
    const [rawSlug, rawLevel, rawParent, rawName] = cells;
    const slug = rawSlug.replace(/`/g, "");
    const parent = rawParent.replace(/`/g, "");
    const level = Number(rawLevel);
    rows.push({
      slug,
      level,
      parentSlug: parent === "—" || parent === "" ? null : parent,
      name: rawName,
    });
  }
  if (rows.length === 0) fail("Appendix C table parsed to zero rows");
  return rows;
}

function validate(rows) {
  const bySlug = new Map();
  const byLevel = { 1: 0, 2: 0, 3: 0, 4: 0 };
  rows.forEach((row, i) => {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.slug))
      fail(`Row ${i + 1}: invalid slug "${row.slug}"`);
    if (bySlug.has(row.slug)) fail(`Duplicate slug "${row.slug}"`);
    if (![1, 2, 3, 4].includes(row.level))
      fail(`"${row.slug}": level ${row.level} outside frozen CHECK 1–4`);
    if (!row.name) fail(`"${row.slug}": empty name`);
    if (row.level === 1) {
      if (row.parentSlug !== null) fail(`Root "${row.slug}" has a parent`);
    } else {
      if (!row.parentSlug) fail(`"${row.slug}" (L${row.level}) has no parent`);
      const parent = bySlug.get(row.parentSlug);
      if (!parent)
        fail(`"${row.slug}": parent "${row.parentSlug}" missing or not depth-first-preceding`);
      if (parent.level !== row.level - 1)
        fail(
          `"${row.slug}" (L${row.level}): parent "${row.parentSlug}" is L${parent.level}, expected L${row.level - 1}`,
        );
    }
    bySlug.set(row.slug, row);
    byLevel[row.level] += 1;
  });
  if (rows.length !== EXPECTED_TOTAL)
    fail(`Node count ${rows.length} ≠ ratified ${EXPECTED_TOTAL} (Taxonomy Content v1.0)`);
  for (const [level, expected] of Object.entries(EXPECTED_BY_LEVEL)) {
    if (byLevel[level] !== expected)
      fail(`L${level} count ${byLevel[level]} ≠ ratified ${expected}`);
  }
  return byLevel;
}

function build(rows) {
  const nodes = rows.map((row) => ({
    id: idForSlug(row.slug),
    slug: row.slug,
    name: row.name,
    level: row.level,
    parentId: row.parentSlug ? idForSlug(row.parentSlug) : null,
  }));
  return {
    $comment:
      "GENERATED by scripts/generate-taxonomy-seed.mjs from productSpec/CATEGORY_MIGRATION_PLAN.md Appendix C (Taxonomy Content v1.0, P1-approved 2026-07-03). DO NOT EDIT BY HAND — regenerate. Interim seed under [ESC-7-API-CATNAV]; ids are deterministic name-based stand-ins, key on slug.",
    version: "1.0",
    nodes,
  };
}

const rows = parseAppendixC(readFileSync(SOURCE, "utf8"));
const byLevel = validate(rows);
const seed = build(rows);
const output = `${JSON.stringify(seed, null, 2)}\n`;

if (process.argv.includes("--check")) {
  if (!existsSync(TARGET))
    fail(`Drift check: ${path.relative(ROOT, TARGET)} does not exist — run the generator`);
  const current = readFileSync(TARGET, "utf8");
  if (current !== output)
    fail(
      "Drift check FAILED: taxonomy.v1.json does not match Appendix C — regenerate (never hand-edit)",
    );
  console.log(
    `✔ Drift check passed — ${rows.length} nodes match Appendix C (L1:${byLevel[1]} L2:${byLevel[2]} L3:${byLevel[3]} L4:${byLevel[4]})`,
  );
} else {
  writeFileSync(TARGET, output);
  console.log(
    `✔ Generated ${path.relative(ROOT, TARGET)} — ${rows.length} nodes (L1:${byLevel[1]} L2:${byLevel[2]} L3:${byLevel[3]} L4:${byLevel[4]})`,
  );
}

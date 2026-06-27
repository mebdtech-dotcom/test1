#!/usr/bin/env node
// Structure-conformance check (WP-0.4 [W0-DDD-001]).
//
// Asserts the nested-DDD module skeleton against REPOSITORY_STRUCTURE.md §3/§4/§5/§8:
//   - the 10 bounded modules, each with the canonical layer shape + 4 contract files
//     + a composition root (<module>.module.ts);
//   - src/shared (framework) and src/server (app-layer wiring);
//   - the four App-Router route groups + app/api;
//   - the tests/ layout.
//
// Spine-only: it checks SHAPE, never content. Module/layer names are the frozen set
// (CLAUDE.md §3); this script coins nothing. Reused by CI (WP-0.10) and the Wave
// Integration Audit (WP-0.13). Exit 0 = conformant, exit 1 = drift (lists violations).

import { existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Frozen module set (CLAUDE.md §3 — letter map M0..M9). Closed list; never extend here.
const MODULES = [
  "core",
  "identity",
  "marketplace",
  "rfq",
  "operations",
  "trust",
  "communication",
  "billing",
  "admin",
  "ai",
];
const MODULE_LAYERS = ["domain", "application", "infrastructure", "api"];
const CONTRACT_FILES = ["index.ts", "services.ts", "events.ts", "types.ts"];
const SHARED = ["db", "ids", "result", "telemetry", "validation"];
const SERVER = ["auth", "authz", "context", "guards"];
const ROUTE_GROUPS = ["(public)", "(auth)", "(app)", "(admin)"];

const violations = [];
const fileMustExist = (rel) => {
  const p = join(ROOT, rel);
  if (!existsSync(p) || !statSync(p).isFile()) violations.push(`missing file: ${rel}`);
};
const dirMustExist = (rel) => {
  const p = join(ROOT, rel);
  if (!existsSync(p) || !statSync(p).isDirectory()) violations.push(`missing dir:  ${rel}`);
};

// 1) The 10 modules: composition root + contracts surface + layer shape.
for (const m of MODULES) {
  const base = `src/modules/${m}`;
  fileMustExist(`${base}/${m}.module.ts`);
  for (const f of CONTRACT_FILES) fileMustExist(`${base}/contracts/${f}`);
  for (const layer of MODULE_LAYERS) dirMustExist(`${base}/${layer}`);
}

// 2) Framework (src/shared) and app-layer wiring (src/server).
for (const s of SHARED) fileMustExist(`src/shared/${s}/index.ts`);
for (const s of SERVER) fileMustExist(`src/server/${s}/index.ts`);

// 3) App Router route groups + api thin-entry dir.
for (const g of ROUTE_GROUPS) dirMustExist(`app/${g}`);
dirMustExist("app/api");

// 4) Tests layout.
dirMustExist("tests/e2e");
dirMustExist("tests/integration");

if (violations.length > 0) {
  console.error(`STRUCTURE CHECK FAILED — ${violations.length} violation(s):`);
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

console.log(
  `STRUCTURE CHECK PASSED — ${MODULES.length} modules × (module.ts + ${CONTRACT_FILES.length} contracts + ${MODULE_LAYERS.length} layers), ` +
    `${SHARED.length} shared, ${SERVER.length} server, ${ROUTE_GROUPS.length} route groups, tests layout.`,
);
process.exit(0);

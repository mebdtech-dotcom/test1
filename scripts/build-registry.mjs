#!/usr/bin/env node
// Generated-contracts-registry builder (WP-0.8 [W0-REG-001]).
//
// Aggregates each module's PUBLIC contract surface (the only importable cross-module
// surface — REPOSITORY_STRUCTURE §3/§5) into the GENERATED, gitignored
// `generated-contracts-registry/` (Doc-6A §11.4; CLAUDE.md §10 — never hand-edited).
//
// It writes ONLY `contracts-manifest.json` and never touches `generated-contracts-registry/prisma/`
// (the Prisma client output, WP-0.5), so `npm run db:generate` and `npm run registry:build`
// co-exist in the registry without clobbering each other.
//
// Spine-only: it catalogs the contract files; it asserts/coins no contract content. Modules
// are DISCOVERED (any src/modules/<m> with a contracts/ dir), so the registry tracks the
// real skeleton; the closed frozen module list is enforced separately by check-structure.mjs.

import {
  readdirSync,
  statSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODULES_DIR = join(ROOT, "src", "modules");
const OUT_DIR = join(ROOT, "generated-contracts-registry");
const CONTRACT_FILES = ["index.ts", "services.ts", "events.ts", "types.ts"];

const modules = readdirSync(MODULES_DIR)
  .filter((name) => {
    const contractsDir = join(MODULES_DIR, name, "contracts");
    return existsSync(contractsDir) && statSync(contractsDir).isDirectory();
  })
  .sort();

const manifest = {
  generator: "scripts/build-registry.mjs",
  note: "GENERATED build artifact — gitignored, never hand-edited (Doc-6A §11.4; CLAUDE.md §10).",
  surface: "cross-module imports allowed only via a module's contracts/ (REPOSITORY_STRUCTURE §3).",
  moduleCount: modules.length,
  modules: modules.map((name) => ({
    module: name,
    entry: `src/modules/${name}/contracts/index.ts`,
    files: CONTRACT_FILES.filter((f) =>
      existsSync(join(MODULES_DIR, name, "contracts", f)),
    ).map((f) => `src/modules/${name}/contracts/${f}`),
  })),
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  join(OUT_DIR, "contracts-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);

console.log(
  `registry: wrote contracts-manifest.json for ${modules.length} modules → generated-contracts-registry/`,
);

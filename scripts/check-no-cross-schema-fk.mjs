#!/usr/bin/env node
// No-cross-schema-FK migration check (WP-0.10 [W0-CI-001]).
//
// Realizes REPOSITORY_STRUCTURE §9 + Doc-6A CHK-6-011 / §5.3 / §11.1: no foreign key crosses a
// schema boundary, and a migration touches only its OWN schema. Scans prisma/migrations/**/
// migration.sql for any `REFERENCES <schema>.<table>` whose target schema is one of the 10
// frozen namespaces but is NOT a schema this migration creates tables in (i.e. a cross-schema
// FK). Exit 1 on violation, 0 otherwise.
//
// At Wave 0 there are no migrations (only migration_lock.toml), so this passes trivially — it is
// a forward tripwire. The authoritative migration-conformance suite is Doc-8D (later waves).

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS_DIR = join(ROOT, "prisma", "migrations");

// The closed, frozen set of module schemas (Doc-2 §10 / Doc-6A R3). Never extend here.
const SCHEMAS = [
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
const schemaAlt = SCHEMAS.join("|");
const createRe = new RegExp(
  `CREATE\\s+(?:TABLE|SCHEMA)\\s+(?:IF NOT EXISTS\\s+)?"?(${schemaAlt})"?[".\\s(]`,
  "gi",
);
const referencesRe = new RegExp(`REFERENCES\\s+"?(${schemaAlt})"?\\.`, "gi");

if (!existsSync(MIGRATIONS_DIR)) {
  console.log("no-cross-schema-fk: no prisma/migrations dir — nothing to check.");
  process.exit(0);
}

const sqlFiles = [];
for (const entry of readdirSync(MIGRATIONS_DIR)) {
  const p = join(MIGRATIONS_DIR, entry);
  if (statSync(p).isDirectory()) {
    const f = join(p, "migration.sql");
    if (existsSync(f)) sqlFiles.push({ file: `prisma/migrations/${entry}/migration.sql`, abs: f });
  }
}

const findings = [];
for (const { file, abs } of sqlFiles) {
  const sql = readFileSync(abs, "utf8");
  const owned = new Set([...sql.matchAll(createRe)].map((m) => m[1].toLowerCase()));
  const referenced = new Set([...sql.matchAll(referencesRe)].map((m) => m[1].toLowerCase()));
  for (const ref of referenced) {
    if (!owned.has(ref)) {
      findings.push({ file, ref, owned: [...owned] });
    }
  }
}

if (findings.length > 0) {
  console.error(`CROSS-SCHEMA-FK CHECK FAILED — ${findings.length} cross-schema reference(s):`);
  for (const f of findings) {
    console.error(
      `  - ${f.file}: REFERENCES schema '${f.ref}' but migration owns [${f.owned.join(", ") || "none"}]`,
    );
  }
  console.error(
    "Cross-schema FKs are forbidden (Doc-6A CHK-6-011); use a bare UUID + service validation.",
  );
  process.exit(1);
}

console.log(`no-cross-schema-fk: clean (${sqlFiles.length} migration file(s) scanned).`);
process.exit(0);

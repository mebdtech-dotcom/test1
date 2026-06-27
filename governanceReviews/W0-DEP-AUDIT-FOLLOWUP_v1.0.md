# Dependency-Audit Follow-Up — `W0-DEP-AUDIT-FOLLOWUP` v1.0

| Field | Value |
|---|---|
| **Type** | Deferred-finding record (Raise ≠ Accept disposition — CLAUDE.md §13) |
| **Raised by** | WP-0.2 [W0-PKG-001] board review (security lens); formalized by WP-0.12 [W0-SEC-001] |
| **Date** | 2026-06-27 |
| **Status** | **DEFERRED** — action at the next legitimate `package-lock.json` regeneration |
| **Wave-0 blocker?** | **No** — all findings are dev-only build/test tooling, not reachable at a Wave-0 bootstrap (no user input, no deployed runtime, headless test runner). |

---

## Why deferred (Validate-Findings gate)

`npm ci` reports 10 vulnerabilities (5 moderate / 3 high / 2 critical). The approved Wave-0
plan binds **"add nothing beyond the lock; do NOT regenerate `package-lock.json`"** (the lock is
the reviewed dependency graph). Every fix requires a **major bump → lock regeneration**, so acting
now would violate the plan. Per Validate-Findings the items are **Applicable/Best-for-product = no
at Wave 0** and are recorded here, not implemented (§13).

## Findings (by package)

| Package | Severity | Direct? | Prod/Dev | Fix needs lock regen? |
|---|---|---|---|---|
| `vitest` (GHSA-5xrq — UI-server arbitrary file read+exec) | critical | direct | **dev** | yes (→ vitest 4, major) |
| `handlebars` (via `eslint-plugin-boundaries` → `@boundaries/elements`) | critical | transitive | **dev** | yes |
| `vite` (`server.fs.deny` bypass) | high | transitive | dev | yes |
| `@boundaries/elements` / `eslint-plugin-boundaries` | high | direct/transitive | dev | yes |
| `postcss` (XSS in CSS stringify, via `next`) | moderate | transitive | **prod** (build-time) | next patch |
| `@vitest/mocker`, `vite-node`, `esbuild` | moderate | transitive | dev | yes |

**Reachability at Wave 0:** the two criticals are not exploitable — `vitest` RCE needs `--ui` server
exposed (the `test` script is headless `vitest run`); `handlebars` needs attacker-controlled template
compilation (never invoked). The lone prod-tree item (`postcss` via `next`) is build-time only on
first-party CSS.

## Action when unblocked

At the next legitimate lock regeneration (e.g. a planned toolchain bump or a dedicated security pass):
bump `vitest` → 4 and re-resolve the vite/esbuild subtree; verify a patched
`eslint-plugin-boundaries`/`@boundaries/elements` line for the handlebars chain; monitor `next` for a
`postcss` patch. Re-run `npm audit` and confirm the criticals/highs clear. This is a governance
decision (lock regen), not a local code change.

---

*Recorded under Raise ≠ Accept (§13): raised with severity, adjudicated as deferred by the presiding
authority via the Validate-Findings gate; not a Wave-0 Exit-Gate blocker.*

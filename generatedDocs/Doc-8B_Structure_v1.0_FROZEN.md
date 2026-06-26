# Doc-8B — Test Foundation & Harness — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26). Effective = `Doc-8B_Structure_Proposal_v0.1` + `Doc-8B_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR). **D1 Board-ratified; `[ESC-8-TOOLING]` RESOLVED** |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8B is the **shared test foundation & harness** — frozen first per `DR-8-HARNESS` (Doc-8A R1); consumed by Doc-8C…8G by pointer |
| Document | **Doc-8B** — realizes the harness conventions of the Doc-8A metastandard (`Doc-8A §4` test-data/tenancy/determinism · `§10` isolation/determinism/hermeticity/CI) as a concrete, consumable foundation: runner, ephemeral test DB, fixtures/factories, multi-tenant seeding, seeded clock + deterministic ID provider, out-of-wire mock boundary + outbox observer, CI merge-gate |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0` §4 + §10 + Appendix A bands **A** (oracle-by-pointer — N/A to harness), **H** (isolation/determinism/CI — `CHK-8-070…074`), **I** (out-of-test — `CHK-8-080/081`). Consumes by pointer: `Doc-2 §6/§7`; `Doc-6A §3/§7` + `Doc-4B` + `Doc-6B core.id_sequences` (ID service — `ERR-8A-1`); `Doc-4L` (event-flow); CLAUDE.md §2/§5/§8/§10 |
| Authority | `Doc-8A` governs (test metastandard); the frozen corpus governs above. Doc-8B is a Doc-8 realization document (below Doc-8A; beside Doc-8C…8G); coins no domain element |
| Contains | Structure only — the ratified decision **D1** (test-tooling stack), the harness section map §0–§9, carried items. **No test code, no fixtures, no CI YAML** — those land in the Doc-8B content passes |
| Program note | Doc-8B introduces **no module, contract, route, field, permission slug, state, event, audit action, POLICY key, or expected behavior**. It builds the shared test infrastructure the discipline suites consume. On any gap: **flag-and-halt**, escalate via the named channel — never coin |

> **Governing rule:** Doc-8B **realizes, never re-decides.** Doc-8A fixed the harness conventions (deterministic, isolated, hermetic, through-contracts, ≥2-org, CI-gated); Doc-8B realizes how those become a concrete runner + fixtures + mock boundary + gate. Its sole new decision is the concrete tooling (D1), Board-ratified at freeze — the Doc-6A R3(b) precedent; coins nothing in the corpus.

---

## D1 — Test-tooling stack (RATIFIED at structure freeze; resolves `[ESC-8-TOOLING]`)

**Board-ratified (Board Chair, 2026-06-26):** a **single TypeScript toolchain** over the Master-Architecture runtime (Next.js 15 / TS / Prisma / Supabase / Inngest — CLAUDE.md §2):

| Layer | Ratified tool | Serves |
|---|---|---|
| Unit / contract / integration runner | **Vitest** (native TS/ESM) | the harness + Bands B/C/D/E/F suites |
| Browser e2e driver | **Playwright** (Next.js App Router support) | Band G journeys over the frozen Doc-5 surface |
| a11y | **`@axe-core/playwright`** | Band G `CHK-8-061` |
| visual-regression | **Playwright snapshots** | Band G `CHK-8-062` |
| RLS / SQL conformance path | **TS-native transactional SQL** (executed through Vitest against the Supabase test DB; per-case DB-role / `SET LOCAL` switching) | the Band-C RLS positive/negative/cross-tenant byte-equivalence gate, at the DB layer, in one toolchain |

**pgTAP was considered and not selected** (it would add a non-TS toolchain + a Supabase test-DB extension dependency; the TS-native SQL path keeps CLAUDE.md §2's end-to-end-TypeScript discipline). Exact version pins live in `package.json` once code exists.

**D1 clears the Doc-8A-carried `[ESC-8-TOOLING]`.** This clearance is recorded as an additive note in the `Doc-8A_SERIES_FROZEN_v1.0` carried-items ledger + the orientation ledgers (the POLICY-patch precedent — each `Doc-3 §12.2` patch clears its `[ESC-*-POLICY]` gate); cross-referenced both directions (Doc-8A ledger ⇄ Doc-8B D1). This is the only new decision Doc-8B makes; everything else realizes Doc-8A §4/§10.

---

## §0 — Control, Precedence & the Doc-8A Binding
- **Purpose:** Doc-8B's place (below Doc-8A; beside Doc-8C…8G; above the harness code); realize-never-redecide; the two freeze obligations — pass the applicable Doc-8A Appendix-A bands (**H, I**; A/B–G N/A) and clear any carried `[ESC-8-*]`. Doc-8B is consumed by Doc-8C…8G **by pointer** (DR-8-HARNESS) and re-authored by none.
- **Dependencies:** `Doc-8A §0/§4/§10/Appendix A`; `Doc-5 Governance Note §8`. **Detail:** short, normative.

## §1 — Scope: what the harness provides (and does not)
- **Purpose:** what Doc-8B realizes (runner config, ephemeral test DB, fixtures/factories, tenant seeding, seeded clock + ID provider, mock boundary + **outbox observer/drainer**, CI gate) and what it does not (no discipline assertions — those are Doc-8C…8G; the harness provides the *means*, not the *cases*). The consume-by-pointer boundary: a suite imports the harness; it never re-implements a fixture or a mock.
- **Dependencies:** `Doc-8A §1/§4`. **Detail:** scope + provides/consumes boundary.

## §2 — Test-Tooling Stack Realization *(D1 — RESOLVED)*
- **Purpose:** fix the ratified tooling (D1: Vitest + Playwright + `@axe-core/playwright` + Playwright snapshots + TS-native transactional SQL) over the Master-Architecture runtime; map each layer to the Appendix-A band(s) it serves; state that tooling is a Board-ratified implementation choice, coined by no corpus document; pins live in `package.json`.
- **Dependencies:** `Doc-8A R3/§2`; CLAUDE.md §2; D1. **Detail:** stack table + band mapping.

## §3 — Ephemeral Test-Database Strategy
- **Purpose:** realize the isolated, ephemeral test DB (`Doc-8A §4.4/§10.1`): a Supabase Postgres test database carrying the realized Doc-6 schema + migrations (Prisma `multiSchema`); **per-test isolation** via transaction rollback (default) or schema reset (DDL/RLS tests); no inter-case bleed; disposable (R12). The realized migrations on the test DB make migration conformance (Band C / `Doc-6A §11`) run against the same schema.
- **Dependencies:** `Doc-8A §4.4/§6/§10.1`; `Doc-6A` (schema/migrations); CLAUDE.md §2. **Detail:** isolation strategy; rollback-vs-reset rule.

## §4 — Fixture & Factory Design *(through-contracts / seed-only)*
- **Purpose:** realize the test-data builders (`Doc-8A §4.2`, `CHK-8-074`): factories creating data **through module contracts or the module's own seed path — never by hand-mutating another module's tables** (One Module One Owner in the harness); standard-column-aware fixtures (`Doc-6A §3`); the Doc-2 §7 role/permission seed set; deterministic, composable builders. A factory for module M never `INSERT`s module N's rows.
- **Dependencies:** `Doc-8A §4.1/§4.2`; `Doc-2 §7`; `Doc-6A §3`. **Detail:** factory convention; through-contracts load-bearing.

## §5 — Multi-Tenant Seeding *(≥2 orgs; active-org context)*
- **Purpose:** realize the tenant seeder (`Doc-8A §4.1`, `CHK-8-074`): **≥2 organizations** for any tenant-scoped suite (vehicle for the Band-C cross-tenant gate); the **server-resolved active-org context** suites act under (client org ID never trusted — CLAUDE.md §5); Hybrid-participation fixtures (one org Buyer+Vendor — Invariant #2) where needed. The seeder forges no client-trusted org ID — it exercises the real resolution path.
- **Dependencies:** `Doc-8A §4.1`; `Doc-2 §6`; CLAUDE.md §5; Invariants #2/#5. **Detail:** tenant-seeding convention.

## §6 — Seeded Clock & Deterministic ID Provider
- **Purpose:** realize determinism (`Doc-8A §4.3/§10.2`, `CHK-8-071`): a **seeded/injected test clock** (no ambient wall-clock); a **deterministic ID provider** — the M0 UUIDv7 service (**`Doc-4B`** owner; **`Doc-6A §3`** convention; **`Doc-6B core.id_sequences`** allocator — the `ERR-8A-1`-corrected anchor) fed the seeded clock so UUIDv7 values are reproducible; or fixed-UUID fixtures where a case pins an ID. **Zero flaky tolerance.**
- **Dependencies:** `Doc-8A §4.3/§10.2`; `Doc-4B`/`Doc-6A §3`/`Doc-6B`; `ERR-8A-1`. **Detail:** clock + ID convention.

## §7 — Out-of-Wire Mock Boundary + Outbox Observer *(hermeticity + Band-F enabler)*
- **Purpose:** realize the hermetic boundary (`Doc-8A §10.3`, `CHK-8-072`): mocked doubles for **Supabase Storage, Realtime, Resend, PostHog, the Inngest dispatch surface, and the M9 AI providers** — simulated, disposable, never live (R12); the contract-mediated path asserted against the double (a `file_ref` produced without a live Storage call). **§7.x — Deterministic outbox observer/drainer (Band-F enabler):** (a) **inspect** `core.outbox_events` rows post-transaction (a suite asserts business write + outbox insert committed/rolled-back together — `Doc-6A §7`, `CHK-8-051`); (b) a controlled **"dispatch tick"** feeding pending rows to the mocked Inngest double so a suite asserts the `pending→dispatched→archived` lifecycle + `Doc-4L` fan-out (`CHK-8-052`) — **without a live async runtime**. Mocking Inngest alone is insufficient; the outbox row must be observable.
- **Dependencies:** `Doc-8A §10.3/§11`; `Doc-6A §7` (outbox); `Doc-4L` (flow); CLAUDE.md §2. **Detail:** mock-boundary + outbox-observer convention; six boundaries enumerated.

## §8 — CI Merge-Gate Wiring
- **Purpose:** realize the CI merge-gate (`Doc-8A §10.4/§10.5`, `CHK-8-073`): the gate **blocks merge on any red conformance suite**; a skipped/relaxed/`.only`-narrowed/deleted conformance test counts as red (never-weaken — `Doc-8A §3.4`); the gate is **necessary, not sufficient** — AI-generated code also clears AI Coding Supervisor/human review, architecture-affecting artifacts need human approval (CLAUDE.md §8). The gate runs every applicable Appendix-A band per suite.
- **Dependencies:** `Doc-8A §10.4/§10.5/§3.4`; CLAUDE.md §8. **Detail:** gate-wiring convention.

## §9 — Conformance & Carried Items
- **Purpose:** Doc-8B **directly satisfies Bands H and I** (`CHK-8-070…074`; `CHK-8-080/081`). **Band A is N/A** (the harness authors no assertions — satisfied by the consuming suites); **Bands B–G are N/A** (the harness provides the means those suites assert with). Doc-8B coins nothing and authors no discipline assertion. Carried register: `DR-8-HARNESS` **satisfied here** (Doc-8B is the provider); `[ESC-8-TOOLING]` **resolved by D1** (recorded back at the Doc-8A manifest); `ERR-8A-1` honored (§6); `[ESC-8-API]`/`[ESC-8-CORPUS]`/`[ESC-8-POLICY]` surface only if content uncovers a gap (by pointer, named channel).
- **Dependencies:** `Doc-8A Appendix A` (bands A/H/I); D1. **Detail:** attestation + band applicability + carried register.

---

## Open Carried Items

| ID | Item | Doc-8B handling | Freeze gate? |
|---|---|---|---|
| **DR-8-HARNESS** | Doc-8B is the shared harness every suite consumes | **Provider — realized here**; consumed by Doc-8C…8G by pointer, re-authored by none | **Satisfied here** |
| `[ESC-8-TOOLING]` | Concrete test frameworks unpinned by the corpus | **RESOLVED by D1** (Vitest + Playwright + TS-native SQL); Board-ratified at structure freeze; recorded back at the Doc-8A SERIES_FROZEN ledger + orientation ledgers | **RESOLVED** |
| `ERR-8A-1` | Structure ID-anchor "Doc-6A §7" → "§3 + Doc-4B" | Honored in §6 (corrected anchor used) | **No** |
| `[ESC-8-API]` / `[ESC-8-CORPUS]` / `[ESC-8-POLICY]` | Surface only if content uncovers a gap | By pointer; named channel; never local | **Per-content: possible** |

## Fences / Out of scope

Authoring any discipline's assertions/cases (Doc-8C…8G) · the harness code/fixtures/CI YAML (Doc-8B content passes) · coining any contract/field/state/event/audit action/POLICY key/expected behavior · changing any Doc-8A convention or frozen-corpus declaration · re-opening D1 as a corpus mandate (it is a Board-ratified implementation choice) · giving any harness component authoritative production state (R12) · the implementation Code under test (downstream).

---

## Provenance & status

- **Provenance:** first Doc-8B artifact, structure-frozen. Realizes `Doc-8A_SERIES_FROZEN_v1.0 §4/§10 + Appendix A bands A/H/I`; consumes the frozen oracle by pointer. Independent Hard Review (2 MINOR + 1 OBS + 1 NIT; 1 REJECTED) + Structure Patch + short re-review + Structure Freeze Audit PASS. D1 Board-ratified. No frozen document edited; nothing coined.
- **Status:** **FROZEN v1.0** — structure only. D1 (tooling) ratified = Vitest + Playwright + TS-native SQL; `[ESC-8-TOOLING]` RESOLVED; section map §0–§9; Band-F outbox observer included; Bands H/I direct, A/B–G N/A.
- **Next:** Doc-8B **content passes** (the harness conventions §0–§9), each through the Board loop; then the discipline suites Doc-8C…8G consume the harness.

*End of Doc-8B Canonical Structure **v1.0 FROZEN**. On any conflict, Doc-8A + the frozen corpus win; flag-and-halt. Doc-8B realizes the Doc-8A harness conventions as a concrete, consumable test foundation (Vitest + Playwright + TS-native SQL); resolves `[ESC-8-TOOLING]`; coins nothing.*

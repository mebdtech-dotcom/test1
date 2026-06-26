# Doc-8B — Test Foundation & Harness — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first Doc-8B artifact. Next: Independent Hard Review (Board) → Structure Patch → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Supersedes | — (first Doc-8B artifact) |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8B is the **shared test foundation & harness** — the cross-cutting document every discipline suite (Doc-8C…8G) consumes; **frozen first** per `DR-8-HARNESS` (Doc-8A R1) |
| Document | **Doc-8B** — realizes the harness *conventions* fixed by the Doc-8A metastandard (`Doc-8A §4` test-data/tenancy/determinism · `§10` isolation/determinism/hermeticity/CI merge-gate) as a concrete, consumable test foundation: runner, ephemeral test DB, fixtures/factories, multi-tenant seeding, seeded clock + deterministic ID provider, out-of-wire mock boundary, CI merge-gate |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0` §4 + §10 (the harness conventions) + Appendix A bands **A** (oracle-by-pointer), **H** (isolation/determinism/CI — `CHK-8-070…074`), **I** (out-of-test — `CHK-8-080/081`) — the bands a harness must satisfy. Consumes the frozen oracle by pointer: `Doc-2 §6/§7` (tenancy/roles), `Doc-6A §3` + `Doc-4B` + `Doc-6B core.id_sequences` (ID service — per `ERR-8A-1`), CLAUDE.md §2 (stack/boundaries) /§5 (active org) /§8 (review rule) /§10 (codegen) |
| Authority | `Doc-8A` governs (the test metastandard); the frozen corpus governs above it. Doc-8B is a **Doc-8 realization document** (below Doc-8A, beside Doc-8C…8G); it realizes Doc-8A conventions and **coins no domain element** |
| Contains | Structure only — the single ratified decision (test-tooling stack — resolves `[ESC-8-TOOLING]`), the harness section map (§0–§9), and carried items. **No test code, no fixtures, no CI YAML, no harness implementation** — those land in the Doc-8B content passes |
| Audience | Architecture Board · QA/Test lead · Doc-8C…8G suite authors · AI Coding Supervisor · release/CI engineering |
| Program note | Doc-8B introduces **no module, contract, route, field, permission slug, state, event, audit action, POLICY key, or expected behavior**. It builds the shared test infrastructure the discipline suites consume. On any gap: **flag-and-halt**, escalate via the named channel — never coin |

> **Governing rule:** Doc-8B **realizes, never re-decides.** Doc-8A fixed the harness *conventions* (deterministic, isolated, hermetic, through-contracts, ≥2-org, CI-gated); Doc-8B realizes *how* those become a concrete runner + fixtures + mock boundary + gate. It re-decides nothing in Doc-8A and coins nothing in the corpus. Its sole *new* decision is the concrete tooling selection (`[ESC-8-TOOLING]`), Board-ratified at freeze — the Doc-6A R3(b) precedent.

---

## The ratified decision proposed at structure freeze (resolves `[ESC-8-TOOLING]`)

- **D1 — Test-tooling stack (resolves `[ESC-8-TOOLING]`; Board-ratified at freeze — the Doc-6A R3(b) precedent).** Doc-8A R3 deferred the concrete frameworks; Doc-8B (the harness) is the document that ratifies them. **Proposed selection (recommendation; Board ratifies or overrides at freeze):**

  | Layer | Proposed tool | Rationale (TS-stack fit; not coined by the corpus) |
  |---|---|---|
  | Unit / contract / integration runner | **Vitest** | Native TS/ESM, fast, same toolchain as Next.js 15; runs Bands B/C/D/E/F + harness |
  | Browser e2e driver | **Playwright** | First-class Next.js App Router support; drives Band G journeys over the frozen Doc-5 surface |
  | RLS / SQL conformance path | **pgTAP** (with a transactional-SQL fallback) against a Supabase Postgres test database | Asserts the Band C RLS positive/negative/cross-tenant byte-equivalence gate at the DB layer where RLS lives |
  | a11y / visual-regression | **`@axe-core/playwright`** (a11y) + **Playwright snapshot** (visual) | Realizes Band G `CHK-8-061/062` inside the e2e driver — no extra toolchain |

  Exact version pins live in `package.json` once code exists (CLAUDE.md §2). **Until Board ratification this remains `[ESC-8-TOOLING]`** — the selection is a recommendation, not a corpus mandate; alternatives (Jest for the runner; Cypress for e2e) are explicitly in-scope for the Board to choose. No tool is coined as architecture.

*This is the only new decision Doc-8B makes; everything else is realization of Doc-8A §4/§10.*

---

## §0 — Control, Precedence & the Doc-8A Binding
- **Purpose:** Doc-8B's place (below Doc-8A; beside Doc-8C…8G; above the harness code); the realize-never-redecide rule; the two freeze obligations — pass the applicable Doc-8A Appendix-A bands (**A, H, I**) and clear any carried `[ESC-8-*]` via its named channel. State that Doc-8B is consumed by Doc-8C…8G **by pointer** (DR-8-HARNESS) and re-authored by none.
- **Dependencies:** `Doc-8A §0/§4/§10/Appendix A`; `Doc-5 Governance Note §8`. **Detail:** short, normative.

## §1 — Scope: what the harness provides (and does not)
- **Purpose:** what Doc-8B realizes (the shared foundation: runner config, ephemeral test DB, fixtures/factories, tenant seeding, seeded clock + ID provider, mock boundary, CI gate) and what it does not (no discipline assertions — those are Doc-8C…8G; the harness provides the *means*, not the *cases*). State the consume-by-pointer boundary: a suite imports the harness; it never re-implements a fixture or a mock.
- **Dependencies:** `Doc-8A §1/§4`. **Detail:** scope + the provides/consumes boundary.

## §2 — Test-Tooling Stack Realization *(resolves `[ESC-8-TOOLING]` — D1)*
- **Purpose:** fix the concrete tooling (D1) over the Master-Architecture runtime (Next.js 15 / TS / Prisma / Supabase / Inngest — CLAUDE.md §2); the runner/e2e/RLS/a11y layers and how each maps to the Appendix-A bands it serves. State that tooling is an implementation choice (Board-ratified), coined by no corpus document; pins live in `package.json`.
- **Dependencies:** `Doc-8A R3/§2`; CLAUDE.md §2; D1. **Detail:** stack table + band mapping.

## §3 — Ephemeral Test-Database Strategy
- **Purpose:** realize the isolated, ephemeral test DB (`Doc-8A §4.4/§10.1`): a Supabase Postgres test database with the realized Doc-6 schema (Prisma `multiSchema`); **per-test isolation** via transaction rollback (default) or schema reset (for DDL/RLS tests); no inter-case state bleed; the DB is disposable (R12). State that the test DB carries the **realized migrations** (so migration conformance — Band C / `Doc-6A §11` — runs against the same schema).
- **Dependencies:** `Doc-8A §4.4/§6/§10.1`; `Doc-6A` (schema/migrations); CLAUDE.md §2 (Supabase). **Detail:** isolation strategy; rollback vs reset rule.

## §4 — Fixture & Factory Design *(through-contracts / seed-only)*
- **Purpose:** realize the test-data builders (`Doc-8A §4.2`, `CHK-8-074`): factories that create data **through module contracts or the module's own seed path — never by hand-mutating another module's tables** (One Module One Owner in the harness); standard-column-aware fixtures (`Doc-6A §3`); the Doc-2 §7 role/permission seed set; deterministic, composable builders. State the prohibition: a factory for module M never `INSERT`s module N's rows.
- **Dependencies:** `Doc-8A §4.1/§4.2`; `Doc-2 §7`; `Doc-6A §3`. **Detail:** factory convention; through-contracts load-bearing.

## §5 — Multi-Tenant Seeding *(≥2 orgs; active-org context)*
- **Purpose:** realize the tenant seeder (`Doc-8A §4.1`, `CHK-8-074`): **≥2 organizations** for any tenant-scoped suite (the vehicle for the Band-C cross-tenant gate); the **server-resolved active-org context** the suites act under (client org ID never trusted — CLAUDE.md §5); Hybrid-participation fixtures (one org Buyer+Vendor — Invariant #2) where a suite needs them. State that the seeder forges no client-trusted org ID — it exercises the real resolution path.
- **Dependencies:** `Doc-8A §4.1`; `Doc-2 §6`; CLAUDE.md §5; Invariants #2/#5. **Detail:** tenant-seeding convention.

## §6 — Seeded Clock & Deterministic ID Provider
- **Purpose:** realize determinism (`Doc-8A §4.3/§10.2`, `CHK-8-071`): a **seeded/injected test clock** (no ambient wall-clock); a **deterministic ID provider** — the M0 UUIDv7 service (**`Doc-4B`** owner; **`Doc-6A §3`** convention; **`Doc-6B core.id_sequences`** allocator — the `ERR-8A-1`-corrected anchor) fed the seeded clock so UUIDv7 values are reproducible; or fixed-UUID fixtures where a case pins an ID. **Zero flaky tolerance** — a non-deterministic test is a defect.
- **Dependencies:** `Doc-8A §4.3/§10.2`; `Doc-4B`/`Doc-6A §3`/`Doc-6B`; `ERR-8A-1`. **Detail:** clock + ID convention; ERR-8A-1 corrected anchor.

## §7 — Out-of-Wire Mock Boundary *(hermeticity)*
- **Purpose:** realize the hermetic boundary (`Doc-8A §10.3`, `CHK-8-072`): mocked doubles for **Supabase Storage, Realtime, Resend, PostHog, the Inngest dispatch surface, and the M9 AI providers** — simulated, disposable, never live (R12). State that the contract-mediated path is asserted against the double (e.g. a `file_ref` is produced without a live Storage call); a mock that reaches the real service is not a mock.
- **Dependencies:** `Doc-8A §10.3/§11`; CLAUDE.md §2 (boundaries). **Detail:** mock-boundary convention; the six boundaries enumerated.

## §8 — CI Merge-Gate Wiring
- **Purpose:** realize the CI merge-gate (`Doc-8A §10.4/§10.5`, `CHK-8-073`): the gate **blocks merge on any red conformance suite**; a skipped/relaxed/`.only`-narrowed/deleted conformance test counts as red (never-weaken — `Doc-8A §3.4`); the gate is **necessary, not sufficient** — AI-generated code also clears AI Coding Supervisor/human review, and architecture-affecting artifacts need human approval (CLAUDE.md §8). State that the gate runs every applicable Appendix-A band per suite.
- **Dependencies:** `Doc-8A §10.4/§10.5/§3.4`; CLAUDE.md §8. **Detail:** gate-wiring convention; never-weaken + necessary-not-sufficient.

## §9 — Conformance & Carried Items
- **Purpose:** Doc-8B's self-check against the applicable Doc-8A Appendix-A bands (**A** oracle-by-pointer, **H** isolation/determinism/CI `CHK-8-070…074`, **I** out-of-test `CHK-8-080/081`); the statement that Doc-8B coins nothing and authors no discipline assertion; the carried-items register (`DR-8-HARNESS` it satisfies as the provider; `[ESC-8-TOOLING]` it resolves via D1 at freeze; `ERR-8A-1` it honors). Bands B–G are **N/A** to the harness (it provides the means those bands' suites consume).
- **Dependencies:** `Doc-8A Appendix A` (bands A/H/I); D1. **Detail:** attestation + carried-item register + band applicability.

---

## Open Carried Items

| ID | Item | Doc-8B handling | Freeze gate? |
|---|---|---|---|
| **DR-8-HARNESS** | Doc-8B is the shared harness every suite consumes | **Doc-8B IS the provider** — realized here, consumed by Doc-8C…8G by pointer, re-authored by none | **Satisfied here** |
| `[ESC-8-TOOLING]` | Concrete test frameworks unpinned by the corpus | **Resolved by D1** at Doc-8B structure freeze (Board-ratified — Doc-6A R3(b) precedent); recommendation Vitest + Playwright + pgTAP + axe; Board may override | **Resolved at freeze** |
| `ERR-8A-1` | Structure ID-anchor "Doc-6A §7" → "§3 + Doc-4B" | Honored in §6 (corrected anchor used); no frozen doc edited | **No** |
| `[ESC-8-API]` / `[ESC-8-CORPUS]` / `[ESC-8-POLICY]` | Surface only if the harness uncovers a gap | By pointer; resolved via named channel; never local | **Per-content: possible** |

## Fences / Out of scope

Authoring any discipline's assertions/cases (Doc-8C…8G) · the actual harness code/fixtures/CI YAML (Doc-8B content passes) · coining any contract/field/state/event/audit action/POLICY key/expected behavior · changing any Doc-8A convention or frozen-corpus declaration · selecting tooling as a corpus mandate (it is a Board-ratified implementation choice — D1) · giving any harness component authoritative production state (R12) · the implementation Code under test (downstream).

---

## Provenance & next steps

- **Provenance:** first Doc-8B artifact. Realizes `Doc-8A_SERIES_FROZEN_v1.0 §4/§10 + Appendix A bands A/H/I`; consumes the frozen oracle by pointer (Doc-2/Doc-6A/Doc-6B/Doc-4B/CLAUDE.md). No frozen document edited; nothing coined.
- **Status:** **PROPOSAL v0.1** — structure only. One ratified decision (D1 tooling, resolves `[ESC-8-TOOLING]`); section map §0–§9; carried items registered.
- **Next in the lifecycle (Board loop):** Independent Hard Review → Structure Patch → short re-review → Structure Freeze Audit → `Doc-8B_Structure_v1.0_FROZEN` → Doc-8B content passes (the harness conventions) → then the discipline suites Doc-8C…8G consume it.

*End of Doc-8B Canonical Structure **Proposal v0.1** — structure only. On any conflict, Doc-8A + the frozen corpus win; flag-and-halt. Doc-8B realizes the Doc-8A harness conventions as a concrete, consumable test foundation; resolves `[ESC-8-TOOLING]` via D1 (Board-ratified); coins nothing. Next: Independent Hard Review.*

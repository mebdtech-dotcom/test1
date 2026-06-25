# iVendorz — Program Status & Authoring Roadmap

**Companion to `iVendorz_Context_Pack_v5.md`.** Detailed per-module ledger + live work queue. Read both into a fresh chat to resume.
**Updated:** 2026-06-26. Non-authoritative orientation — on any conflict, the FROZEN corpus wins; patch this to match.

---

## 1. Frozen baseline (architecture program — COMPLETE)

| Layer | Status |
|---|---|
| Master Architecture (FINAL) · ADR Compendium v1 | **FROZEN** (ranks 0–1) |
| Doc-2 Domain Model & DB Blueprint v1.0.3 · Doc-3 RFQ & Operational Spec v1.0.2 | **FROZEN** |
| Doc-4A API metastandard + Doc-4B…4M (all 10 modules + state/event/integration indexes) | **FROZEN** (`Doc-4_SERIES_FROZEN_v1.0`) |

**The entire Doc-4 architecture corpus is FROZEN.** **Doc-5 API realization program = COMPLETE** (all 10 module realizations FROZEN). Current phase → **Doc-6 (Database)**.

---

## 2. Doc-4 module-contract ledger (all FROZEN)

| M | Doc-4 | Schema | Doc-4 status |
|---|---|---|---|
| 0 Platform Core | Doc-4B | `core` | **FROZEN** |
| 1 Identity & Org | Doc-4C | `identity` | **FROZEN** |
| 2 Marketplace | Doc-4D | `marketplace` | **FROZEN** |
| 3 RFQ Engine (moat) | Doc-4E | `rfq` | **FROZEN** |
| 4 Business Operations | Doc-4F | `operations` | **FROZEN** |
| 5 Trust & Verification | Doc-4G | `trust` | **FROZEN** |
| 6 Communication | Doc-4H | `communication` | **FROZEN** |
| 7 Monetization / Billing | Doc-4I | `billing` | **FROZEN** (+ `Doc-4I_ActivatePlan_Additive_Patch_v1.0` → 33 contracts) |
| 8 Admin Operations | Doc-4J | `admin` | **FROZEN** (authoritative event catalog) |
| 9 AI Layer | Doc-4K | `ai` | **FROZEN** (reserved; owns no authoritative data) |
| — Integration index · State machines | Doc-4L · Doc-4M | — | **FROZEN** |

---

## 3. Doc-5 Implementation Contracts program (API realization — CURRENT PHASE)

Each module = staged-freeze lifecycle: Structure Proposal → Independent Hard Review → Patch → Structure FROZEN → Content Pass-1…3 → Hard Review(s) → Content Freeze Audit → SERIES FROZEN. POLICY keys registered per module via additive `Doc-3_Policy_Key_Registration_Patch_v1.X`.

| Doc-5 | Module | Contracts (caller + out-of-wire) | Status |
|---|---|---|---|
| **5A** | API realization metastandard | §0–§12 + App A/B/C | **FROZEN** — gates 5B…5M via Appendix A |
| **5B** | M0 `core` | — | **FROZEN** (out-of-wire boundary R1 precedent) |
| **5C** | M1 `identity` | 42 | **FROZEN** |
| **5D** | M2 `marketplace` | 71 (64 + 7) | **FROZEN** (first public/anonymous surface; tri-actor) |
| **5E** | M3 `rfq` | 38 (30 + 8) | **FROZEN** (matching/routing engine out-of-wire) |
| **5F** | M4 `operations` | 50 (46 + 4) | **FROZEN** (two-sided tenant User; money-boundary R8) |
| **5G** | M5 `trust` | 40 (34 + 6) | **FROZEN** (governance-signal owner; score firewall) |
| **5H** | M6 `communication` | 23 (19 + 4) | **FROZEN** (delivery-only; append-only) |
| **5I** | M7 `billing` | **33 (27 + 6)** | **FROZEN 2026-06-26** — see §4 |
| **5J** | M8 `admin` | 34 (32 + 2) | **FROZEN** (`Doc-5J_SERIES_FROZEN_v1.0`, 2026-06-26) — structure + content (Pass-1/2/3) + Content Freeze Audit PASS. Admin-only; single event `VendorBanned`; Admin-decides/owning-module-owns; `[ESC-ADM-POLICY]` cleared by Doc-3 v1.7 |
| **5K** | M9 `ai` | 16 (8 read + 8 out-of-wire) | **FROZEN** (`Doc-5K_SERIES_FROZEN_v1.0` + `Doc-5K_Content_v1.0_FROZEN`, 2026-06-26; Structure Patch CE-01). Advisory-only; no score/§8 event; `[REC-AI-WIRE]` honored; `[ESC-AI-POLICY]` cleared by Doc-3 v1.8. Corpus-folded |

**Doc-3 POLICY patches (additive §12.2):** v1.0 (`core`) · v1.1 (`rfq`) · v1.2 (`marketplace`) · v1.3 (`trust`) · v1.4 (`operations`) · v1.5 (`communication`) · v1.6 (`billing`) · v1.7 (`admin`) · **v1.8 (`ai`)** — each clears its module's `[ESC-*-POLICY]` gate (`<ns>.idempotency_dedup_window` + `<ns>.list_page_size_max`; `ai.*` instead registers `ai.list_page_size_max` + 4 `ai.<bc>.ttl_seconds` cache-lifecycle keys — no wire mutation).

---

## 4. Doc-5I (M7 Billing) — FROZEN 2026-06-26 (latest close-out)

- **Manifest:** `Doc-5I_SERIES_FROZEN_v1.0.md`. **Effective set:** `Doc-5I_Structure_v1.0_FROZEN` + `Doc-5I_Structure_Additive_Patch_v1.0` + `Doc-5I_Content_v1.0_Pass1…3` + `Doc-4I_ActivatePlan_Additive_Patch_v1.0` + `Doc-3 …Patch_v1.6_Billing`.
- **33 contracts** = 32 frozen Doc-4I + 1 additive `billing.activate_plan.v1`. Partition: 27 caller-facing (§4–§9) + 6 out-of-wire (§10).
- **Two board gates dispositioned (human-approved, additive):** Gate 1 `[ESC-BILL-ADMINSCOPE]` → re-scope structure §3 Admin-read grant to catalog reads only (org-scoped reads User-only per Doc-4I); Gate 2 `[ESC-BILL-ACTIVATE]` → additive `activate_plan` contract (explicit `draft→active` owner).
- **Facts to preserve:** R5 billing firewall (no state gates trust/eligibility/routing/matching) · R6 `billing.platform_invoices ≠ operations.trade_invoices` (FIXED) · R8 `record_payment` = gateway callback (not §8 event) · R9 only BC-BILL-2 emits 3 §8 events (`SubscriptionPurchased/Renewed/Expired`) · R10 `resolve_entitlements`+`enforce_quota` internal-service (no wire; never a procurement decision) · R11 actor-branched = User-leg wired, System in-process · slugs `can_view_billing`/`can_manage_billing` + `[ESC-BILL-SLUG]`. Carried non-gating: `[ESC-BILL-FIELD/SLUG/AUDIT/EVENT]`, DF-BILL-1…8.

---

## 5. Live work queue

**Doc-5 API realization program — COMPLETE.** All 10 module realizations (M0–M9) content-FROZEN: 5B/5C/5D/5E/5F/5G/5H/5I/5J/5K, gated by the FROZEN Doc-5A metastandard. Doc-3 POLICY patches v1.0–v1.7 applied (one namespace per module).

Next program phases:
1. **Doc-6 (Database)** — Prisma schema realization (one schema per module; ratify "one Prisma namespace per module"); migrations.
2. **Doc-7 (Frontend)** — Next.js App Router UI composition over the frozen API contracts.
3. **Doc-8 (Tests)** — conformance + contract + integration test suites.
4. Then: Development Decomposition → Build Roadmap → Implementation.

*(Corpus tidy DONE: `Doc-5K_SERIES_FROZEN_v1.0` manifest added for peer-parity; `Doc-3 …v1.8_AI` registers the `ai.*` keys and clears `[ESC-AI-POLICY]`. All 10 modules now have a `SERIES_FROZEN` (or `Content_v1.0_FROZEN`) manifest + a cleared POLICY gate.)*

---

## 6. Verification discipline (every deliverable)

Programmatic verification before presenting: inventory ⊆ frozen Doc-4x; tokens/paths/status/errors verbatim or escalated (never invented); error classes ⊆ `Doc-5A §6.2` at fixed status; envelope/pagination per `Doc-5A §5.6/§8`; prohibited request fields (`Doc-4A §9.7`); reads scoped per Doc-4I actor; events per §8 (zero coined); slugs ⊆ §7; audit per §9 by pointer or ESC-marker; REFERENCE≠DEPENDENCY / STATE≠CONFLICT; moat + firewall asserted; document-scope respected; Flag-and-Halt on any corpus conflict (cite both sources; escalate to board for human-approved additive patch — never resolve locally). End with a Sources list.

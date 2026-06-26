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

**The entire Doc-4 architecture corpus is FROZEN.** **Doc-5 API realization program = COMPLETE** (all 10 module realizations FROZEN). **Current phase → Implementation-contract realization across three parallel sibling programs:** Doc-6 (Database — `Doc-6A` + `Doc-6B` + `Doc-6C` + `Doc-6D` FROZEN; next `Doc-6E`), Doc-7 (Frontend — `Doc-7A` FROZEN; next `Doc-7B`/`7C`), and Doc-8 (Test & Conformance — `Doc-8A` metastandard + `Doc-8B` harness + `Doc-8C` Contract/API FROZEN 2026-06-26; next discipline suites `Doc-8D…8G`). All gated by their Appendix A.

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

## 4b. Doc-6 Database Realization program (CURRENT PHASE)

Staged-freeze, mirroring Doc-5: a metastandard (Doc-6A — the Doc-5A analog) + per-module schema realizations Doc-6B…6K (letter map B=M0…K=M9). Realizes Doc-2 v1.0.3 (the binding *what*-authority) on PostgreSQL/Supabase + Prisma `multiSchema`. Consistent-with (not conformant-to) the frozen Doc-5 surface (governance §8).

| Doc-6 | Scope | Status |
|---|---|---|
| **6A** | DB Realization Metastandard | **FROZEN 2026-06-26** (`Doc-6A_SERIES_FROZEN_v1.0`) — R1–R12 + §2.5 attribution; Appendix A = 10 bands / 37 `CHK-6-xxx`; Appendix B = Global Conventions Registry; R3(b) one-Prisma-namespace-per-module Board-ratified. Coins nothing |
| **6B** | M0 `core` schema | **FROZEN 2026-06-26** (`Doc-6B_SERIES_FROZEN_v1.0`) — 5 platform-owned tables (DDL+Prisma); CR1–CR10 + **CR4′** column-scoped immutability (5 triggers); human-ref allocator; 18 `core.*` keys seeded; Appendix A 37/37 (0 FAIL); **DR-6-CORE resolved** |
| **6C** | M1 `identity` schema | **FROZEN 2026-06-26** (`Doc-6C_SERIES_FROZEN_v1.0`) — 9 tables (DDL+Prisma+RLS); first real org-anchor RLS (all 9 explicit) + roles-NULL-seed + dual-party `delegation_grants`; auth boundary (no secret); `human_ref` via `core`; 3 state machines; 45-slug+4-bundle seed; **7 `identity.*` keys (Doc-3 v1.9 RATIFIED)**; Appendix A 37/37. `[ESC-6-POLICY]` cleared |
| **6D** | M2 `marketplace` schema | **FROZEN 2026-06-26** (`Doc-6D_SERIES_FROZEN_v1.0`) — 21 tables / 8 aggregates (DDL+Prisma+RLS+FTS); first **public/anonymous tri-actor RLS** (Public/User/Admin); visibility-scope = publish-state (**no `buyer_private` coined**); capability matrix (4 booleans); §5.3 two-dimension + §5.8 state; **score firewall** (no score column; bands reflected); `financial_tier_history` exclusive-writer-as-consumer (append-only); `vendor_matching_attributes` derived read-model (admin-only); versioned `spec_documents` (column-scoped immutability); 4-level admin-governed category tree; **first real FTS**; Appendix A 37/37. Carries `[ESC-6-DD7]` · `[ESC-MKT-AUDIT]` · `[ESC-6-SCHEMA-SHOWCASE]`; `[ESC-6-POLICY]` cleared (Doc-3 v1.2) |
| 6E…6K | M3…M9 schemas | NOT STARTED |

**Carried into Doc-6E…6K (per-module gates):** `DR-6-CORE/API/STATE` · `[ESC-6-SCHEMA]` · `[ESC-6-POLICY]` (additive Doc-3 §12.2 patch per module — `core`/`rfq`/`marketplace` already registered) · `[ESC-6-API]`.

---

## 4c. Doc-7 Frontend Realization program (STARTED — runs in parallel with Doc-6)

Staged-freeze, mirroring Doc-5/Doc-6: a metastandard (Doc-7A — the Doc-5A/Doc-6A analog) + **surface-partitioned** realizations Doc-7B…7H. Realizes the frozen Doc-5 API surface (`Doc-5A…5K`) + Doc-4M state machines + Doc-2 §6/§7/§0.4 on Next.js 15 App Router + React + Tailwind + shadcn/ui (the fixed Master-Architecture stack). **Consistent-with (not conformant-to) the frozen Doc-5 surface** (governance §8 rule 5); conforms to Doc-4M/Doc-2 (upstream). Partition departs from the backend-module letter map by intent — the UI is composed by deployable surface/route-group, not by module.

| Doc-7 | Scope | Status |
|---|---|---|
| **7A** | Frontend Realization Metastandard | **FROZEN 2026-06-26** (`Doc-7A_SERIES_FROZEN_v1.0`) — structure + content §0–§12 + Appendix A (**25 `CHK-7-xxx` checks / 10 bands A–J**); R1–R12; surface partition; **§3.7 wired-contracts-only boundary**; coins nothing. Structure + 3 content passes each: Pass → Board Hard Review → Patch → closure check PASS; Structure + Content Freeze Audits PASS |
| 7B | Design System & Component Kit *(frozen first)* | **FROZEN 2026-06-26** (`Doc-7B_SERIES_FROZEN_v1.0`) — structure + content §0–§9 + Appendix; BR1–BR12; presentation-only kit (primitives→app components, no content/state/fetch); defines shared embedded components (trust badge/billing/AI panel/thread presentation; **notification center = Doc-7C**); microsite theme-override; status/error/not-found primitives encode non-disclosure once; applicable Appendix A subset (N/A reasons). Structure + 2 content passes each: Pass → Board Hard Review → Patch → closure check PASS; both Freeze Audits PASS |
| 7C | App Shell & Data Layer *(frozen second)* | **FROZEN 2026-06-26** (`Doc-7C_SERIES_FROZEN_v1.0`) — structure + content §0–§9 + Appendix; SR1–SR10; App Router topology (`(public)`/`(auth)`/`(app)`/`(admin)`); server-resolved active-org boundary + org-switcher (re-resolves on switch; seam vs 7E mgmt screens); **server-side-only** typed wired Doc-5 API-client (single data-access seam); defines notification center (composes 7B primitives; mutations = verified `mark_notification_read`/`archive_notification` Doc-5H §5); blob via M0/Doc-4B Storage by pointer (file_ref only; upload-grant = `[ESC-7-API]`). Structure + 2 content passes each Pass→Review→Patch→closure PASS; both Freeze Audits PASS (Content incl. CC-1: CHK-7-042 kept N/A per frozen SR9). **DR-7-SHELL satisfied (7B+7C frozen)** |
| 7D | Public Surface (anonymous) | **FROZEN 2026-06-26** (`Doc-7D_SERIES_FROZEN_v1.0`) — structure + content §0–§9 + Appendix; PR1–PR10; first **surface** doc. BOUND (verified Public reads): `search_catalog`/`list_vendor_directory`/`get_public_vendor_profile` (BC-MKT-6) · microsite = `get_public_vendor_profile` + BC-MKT-4 **published** presentation projection (Doc-5D R5 draft/published split) · trust badge = `get_trust_score`/`get_performance_score`/`get_verified_tier` + public reviews `get_review`/`list_reviews` (Doc-5G public-badge). 3 carried `[ESC-7-API-PRODDETAIL/CATNAV/ADS]` (User-only reads; additive Doc-5D channel). Published-only + no buyer-private concept (Inv #11) + Doc-5G R10. No active-org, no anonymous mutation (CTAs→7E). Structure + 2 content passes each Pass→Review→Patch→closure PASS; both Freeze Audits PASS |
| 7E | Account & Identity Shell | **FROZEN 2026-06-26** (`Doc-7E_SERIES_FROZEN_v1.0`) — structure + content §0–§9 + Appendix; ER1–ER11; `(auth)` (Supabase Auth; **signup coins no `create_user`**, `[ESC-7-API-SIGNUP]` resolved) + `(app)` mgmt. Binds Doc-5C §C4–§C7/§C9/§C10/§C11 + Doc-5I BC-BILL-1…6. Seam: §C8 switcher = Doc-7C. **Content MAJOR caught: `activate_plan` removed (BC-BILL-1 Admin catalog → Doc-7H, not user account).** Subscription = purchase/cancel (Doc-4M); renew/expire System-display. Firewalls R6/R10/R5; soft-delete-only org (DC-1 cascade System). Carried `[ESC-IDN-DELEG-EXPIRY]` (reinstate UI deferred). Structure + 2 content passes each Pass→Review→Patch→closure PASS; both Freeze Audits PASS |
| 7F | Buyer Workspace (the moat) | **FROZEN 2026-06-26** (`Doc-7F_SERIES_FROZEN_v1.0`) — structure + content §0–§10 + Appendix; FR1–FR12. Buyer-leg of Doc-5E §4/§5/§6/§7 + Doc-5F BC-OPS-1 CRM/BC-OPS-2/4/5 buyer-leg + Doc-5D discovery. **Moat guarded end-to-end:** R6 no-auto-decision (award explicit; AI never recommends/ranks-to-winner) · engine out-of-wire (**buyer never invites — invitations engine-generated**; `get_matching_results`=Admin not bound; positive-routing-view only) · R7 (quota=delivery ceiling) · R8 (records not settlement; **vendor issues trade invoice, buyer pays**) · buyer-private CRM never leaks incl. link-suggestions, invisible private exclusion `read_crm_status_for_routing` (Inv #11). Content MAJORs: buyer-never-invites (P1), issue_trade_invoice=vendor-leg (P2). Structure + 3 content passes each Pass→Review→Patch→closure PASS; both Freeze Audits PASS. Carries file-upload `[ESC-7-API]` |
| 7G | Vendor Workspace | **FROZEN 2026-06-26** (`Doc-7G_SERIES_FROZEN_v1.0`) — structure + content §0–§11 + Appendix; GR1–GR12. Vendor-leg of Doc-5E §5 + Doc-5D BC-MKT-1/2/3/4/5 (full microsite set: microsites/profile-experience/custom-domains/showcase) + Doc-5F BC-OPS-2/4/5 vendor-leg + BC-OPS-3 lead pipeline. **Load-bearing byte-equivalence attestation (Inv #11):** blacklist/exclusion undetectable across inbox/pipeline/quotation-outcomes/notifications/**analytics** (denominator=submitted, never all-RFQs; MAJOR guard). Score firewall (declares tier, reads own scores Doc-5G, never mutates); capability matrix (Inv #1); quotation versioning (Inv #8); capacity Controlling-Org private; draft projection (Doc-7D renders published); issue_trade_invoice=vendor (buyer approves=7F); money-boundary R8; quota=billing feature not matching gate. Structure + 2 content passes each Pass→Review→Patch→closure PASS; both Freeze Audits PASS |
| 7H | Admin Console (last surface) | **STRUCTURE FROZEN 2026-06-26** (`Doc-7H_Structure_v1.0_FROZEN`) — HR1–HR12; Doc-5J BC-ADM-1…6 (moderation/bans/suggestions/import/verification/outreach) + cross-module Admin legs (Doc-5D ad-review/category · Doc-5E routing-control · Doc-5G trust-publication · Doc-5I plan-catalog incl. **`activate_plan`** · Doc-5C suspend/reinstate · Doc-5H support). **Admin-decides/owning-module-owns (R5)** · **no active-org** (acts ON target by ID) · single event `VendorBanned` (R9) · Trust firewall R8 (M8 workflow ≠ M5 decision/score; console writes no score) · moat R7 (assist_routing=rules, never award) · link non-disclosure R6 · ban≠blacklist. Hard Review (0 MAJOR + 3 MINOR + 1 NIT) + Structure Freeze Audit PASS. **Content passes NEXT (~2-3) → Doc-7 surfaces COMPLETE** |

**Carried into Doc-7A content + Doc-7B…7H (per-surface gates):** `DR-7-SHELL` (7B+7C frozen before surfaces) · `DR-7-API` (Doc-5 consumability cross-check) · `DR-7-STATE` (Doc-4M drives lifecycle UI) · `[ESC-7-API]` (additive Doc-5x patch — Board) · `[ESC-7-POLICY]` (additive Doc-3 §12.2 patch) · `[ESC-7-DESIGN]` (embedded-component allocation).

---

## 4d. Doc-8 Test & Conformance Realization program (STARTED — Doc-8A + Doc-8B FROZEN 2026-06-26)

Staged-freeze, mirroring Doc-5/6/7: a metastandard (Doc-8A — the Doc-5A/6A/7A analog) + **test-discipline-partitioned** realizations Doc-8B…8G. Realizes the full frozen *what*-corpus (Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A…4M + the 12 invariants/5 firewalled signals/moat — the **test oracle**) and the realization contracts under test (`Doc-5A…5K` API · `Doc-6A…6K` DB · `Doc-7A…7H` FE) as deterministic, isolated, CI-gating conformance suites. **Doc-8 is the conformance harness yet subordinate to its oracle** (governance §3/§8 rule 5): a red test = code defect (fix it) or corpus defect (`[ESC-8-CORPUS]`, flag-and-halt) — never weaken the assertion. Partition departs from the backend-module letter map by intent (the Doc-7 precedent) — by verification discipline, since one conformance concern spans many modules.

| Doc-8 | Scope | Status |
|---|---|---|
| **8A** | Test & Conformance Realization Metastandard | **FROZEN 2026-06-26** (`Doc-8A_SERIES_FROZEN_v1.0`) — structure + content (Pass-1 §0–§4 · Pass-2 §5–§9 · Pass-3 §10–§12 + Appendix A) + freeze audits. R1–R12; test-discipline partition; cross-cutting conformance-concern allocation (assert-once); Appendix A = **39 `CHK-8-001…081` / 9 bands (A–I)** (per-suite freeze gate); inherits RLS byte-equivalence gate (`Doc-6A R8/§4`) + migration gate (`Doc-6A §11`); `ERR-8A-1` folded in. Structure + 3 content passes each Hard-Reviewed + patched + closure-checked (0 BLOCKER/MAJOR/MINOR; 4 REJECTED-false across passes) + Content Freeze Audit PASS. Conformance harness yet subordinate to its oracle. Coins nothing. **Doc-8B NEXT** |
| 8B | Test Foundation & Harness *(frozen first)* | **FROZEN 2026-06-26** (`Doc-8B_SERIES_FROZEN_v1.0`) — structure + content (Pass-1 §0–§4 · Pass-2 §5–§9) + freeze audits. The shared harness Doc-8C…8G consume by pointer (DR-8-HARNESS satisfied): runner, ephemeral test DB (transaction-rollback + savepoint/schema-reset opt-out), through-contracts fixtures/factories, ≥2-org seeding, seeded clock + dual ID mechanisms (UUIDv7 generated / `human_ref` via `core.id_sequences`), six out-of-wire mock doubles + **outbox observer/drainer** (`core.outbox_status`; dispatch `pending→dispatched` + distinct archival), CI merge-gate. **D1 → `[ESC-8-TOOLING]` RESOLVED: Vitest + Playwright + TS-native transactional SQL** (single TS toolchain; pgTAP not selected). Realizes bands H/I (A/B–G N/A). Structure + 2 content passes each Hard-Reviewed + patched + closure-checked (realized-schema corrections vs Doc-6B) + Freeze Audits PASS; `ERR-8A-1` 2nd-order clarification folded in. Coins nothing. **Doc-8C…8G NEXT** |
| 8C | Contract & API Conformance | **FROZEN 2026-06-26** (`Doc-8C_SERIES_FROZEN_v1.0`) — structure + 2 content passes + freeze audits. **Table-driven (C1)** over the frozen Doc-5 caller-facing surface; inventory **derived from frozen `Doc-5x` enumerations** (cross-checked vs `Doc-5A Pass10 §B.1`); **completeness ≡ frozen surface**; **wired-only (C2)**. Realizes bands A/B: envelope/pagination/error/idempotency/prohibited/actor-scope+field-trace. Seam: API-scope here / RLS in 8D. Consumes Doc-8B harness. Authored-not-run. Coins nothing |
| 8D | Persistence, Migration & RLS Conformance | **FROZEN 2026-06-26** (`Doc-8D_SERIES_FROZEN_v1.0`) — structure + 2 content passes + freeze audits. **Defining suite for #8 (immutability) + #11 (RLS byte-equivalence)** (8E references; 8C/8F/8G compose). **D1 schema-inventory-driven** (≡ frozen Doc-6 DDL: `core` 5 + `identity` 9 + `marketplace` 21 = 35 tables; catches schema drift). Band C: schema-constraint · immutability (CR4′; ai.* sole exception) · migration · **RLS gate (`CHK-8-024`, MANDATORY)**: positive (Doc-6D tri-actor) / negative (RLS backstop, app bypassed — 8C owns app per §8 seam) / cross-tenant / **#11 byte-equivalence = buyer-private blacklist-undetectable (`Doc-6F`, deferred)** [`CLAR-8D-1`: marketplace publish-state = general visibility, ≠ #11] · cross-module integrity. D3: core/identity/marketplace ready; grantee RLS→6E, #11→6F deferred. Consumes Doc-8B (DB-role path). Coins nothing |
| 8E | Domain, Invariant & State-Machine Conformance | **FROZEN 2026-06-26** (`Doc-8E_SERIES_FROZEN_v1.0`) — structure + 2 content passes + freeze audits. **Defining suite** (E1) for firewall + 12 invariants + moat + Doc-4M. Firewall = **two assertion shapes**: non-cross-mutation (vary-A-assert-B) + non-dominance (maxed-signal-non-determinative vs frozen `Doc-4G`/`Doc-3`/`Doc-4E` scoring). 12-invariant suites (#8/#11 → **8D-defined, 8E-references**); moat as governed system property (composes 8C/8F; no-re-rank → 8G); Doc-4M edge coverage (`CHK-8-040…042`; convergence → 8G). E2: oracle-frozen / enforcement-deferred (authored-not-run). Realizes bands A/D/E. Consumes Doc-8B. Coins nothing |
| 8F | Integration & Event-Flow Conformance | NOT STARTED — realizes Doc-2 §8 / Doc-4J / Doc-4L (transactional write+emit, outbox→Inngest); awaits Doc-6 outbox table |
| 8G | Frontend & E2E Conformance | NOT STARTED — realizes `Doc-7B…7H` (component/a11y/visual-regression/e2e + UI non-disclosure byte-equivalence); awaits Doc-7 |

**Carried into Doc-8C…8G (per-suite gates):** `DR-8-HARNESS` (satisfied by Doc-8B; consumed by pointer) · `DR-8-CONTRACT` (Doc-5/6/7 testability cross-check) · `DR-8-STATE` (Doc-4M drives state suites) · `DR-8-RLS` (mandatory byte-equivalence band) · `[ESC-8-TOOLING]` **RESOLVED** (Doc-8B D1: Vitest + Playwright + TS-native SQL) · `[ESC-8-API]` · `[ESC-8-CORPUS]` (corpus defect — flag-and-halt) · `[ESC-8-POLICY]` · `[ESC-8-SCOPE]` · `ERR-8A-1` (erratum, folded into manifest). **Per-suite oracle-readiness:** 8B/8C/8E ready now; 8D growing (Doc-6B+6C frozen); 8F/8G await Doc-6/7.

---

## 5. Live work queue

**Doc-5 API realization program — COMPLETE.** All 10 module realizations (M0–M9) content-FROZEN: 5B/5C/5D/5E/5F/5G/5H/5I/5J/5K, gated by the FROZEN Doc-5A metastandard. Doc-3 POLICY patches v1.0–v1.8 applied (one namespace per registered module; M1 identity none).

**Doc-6 Database program — STARTED.** `Doc-6A` (metastandard) + `Doc-6B` (M0 `core`) + `Doc-6C` (M1 `identity`) + `Doc-6D` (M2 `marketplace`) FROZEN 2026-06-26 (+ Doc-3 v1.9 `identity.*` POLICY). **Next: Doc-6E (M3 `rfq`).**
**Doc-7 Frontend program — STARTED.** `Doc-7A` (metastandard) FROZEN.
**Doc-8 Test & Conformance program — STARTED.** `Doc-8A` (metastandard) + `Doc-8B` (Harness) + `Doc-8C` (Contract/API) + `Doc-8E` (Domain/Invariant/Firewall/State) + `Doc-8D` (Persistence/Migration/RLS) FROZEN 2026-06-26 — **5 of 7 Doc-8 deliverables frozen** (8D owns the #8/#11 defining checks 8E references; RLS byte-equivalence gate built, #11 buyer-private facet execution-deferred to `Doc-6F`). **Next: Doc-8F** (Integration/Event-Flow — oracle: Doc-2 §8 / Doc-4J / Doc-4L + realized `core.outbox_events`) **and/or Doc-8G** (Frontend/E2E — awaits more Doc-7).

Next:
1. **Doc-6E (M3 `rfq`)** — next per-module schema; the matching/quotation engine — consumes M2 `vendor_matching_attributes` (via service) + `vendor_profiles` (by UUID); first vendor-side materialized RLS anchor (`rfq_invitation_grantees`); §10.4 partition.
2. **Doc-6F…6K** — remaining module schemas (M4…M9), dependency order, each gated by Doc-6A Appendix A.
3. **Doc-7B/7C** (Design System + App Shell, frozen first) then Doc-7D…7H surface docs.
4. **Doc-8C…8G discipline suites** (consume the FROZEN Doc-8B harness: Vitest + Playwright + TS-native SQL). Per-suite oracle-readiness governs freeze order: **8C** (Doc-5 frozen) + **8E** (Doc-2/3/4M frozen) ready now; **8D** growing (Doc-6B+6C frozen — `core` + `identity` testable); **8F/8G** freeze as Doc-6/7 freeze. The RLS positive/negative/cross-tenant byte-equivalence gate is `Doc-6A R8/§4`; migration gate `Doc-6A §11`. (Doc-8A FROZEN — Appendix A 39 `CHK-8-xxx` checks gate every suite; Doc-8B FROZEN — DR-8-HARNESS satisfied.)
5. Then: Development Decomposition → Build Roadmap → Implementation.

*(Corpus tidy DONE: `Doc-5K_SERIES_FROZEN_v1.0` manifest added for peer-parity; `Doc-3 …v1.8_AI` registers the `ai.*` keys and clears `[ESC-AI-POLICY]`. All 10 modules now have a `SERIES_FROZEN` (or `Content_v1.0_FROZEN`) manifest + a cleared POLICY gate.)*

---

## 6. Verification discipline (every deliverable)

Programmatic verification before presenting: inventory ⊆ frozen Doc-4x; tokens/paths/status/errors verbatim or escalated (never invented); error classes ⊆ `Doc-5A §6.2` at fixed status; envelope/pagination per `Doc-5A §5.6/§8`; prohibited request fields (`Doc-4A §9.7`); reads scoped per Doc-4I actor; events per §8 (zero coined); slugs ⊆ §7; audit per §9 by pointer or ESC-marker; REFERENCE≠DEPENDENCY / STATE≠CONFLICT; moat + firewall asserted; document-scope respected; Flag-and-Halt on any corpus conflict (cite both sources; escalate to board for human-approved additive patch — never resolve locally). End with a Sources list.

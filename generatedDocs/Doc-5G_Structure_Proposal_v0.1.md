# Doc-5G — Trust & Verification (M5 `trust`) API Realization — Structure Proposal v0.1

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first artifact of the §8 staged-freeze flow (Structure Proposal → Independent Hard Review → Structure Patch → Structure FROZEN). Structure only. Pre-incorporates the Doc-5D/5F structure-review lessons and the plan-stage Architecture Board findings (SR-1; per-read disclosure-scope + per-command actor-side rules; dual-audience rule; `check_permission` exclusivity; out-of-wire 5-protocol fence; inventory-ordering non-authoritative; reference-never-restate events; firewall + non-disclosure attestation bands) |
| Module | Module 5 — Trust & Verification (`trust` schema; the governance-signal owner) |
| Realizes | `Doc-4G` (M5 contracts, FROZEN — **40 contracts**, PassB BC-TRUST-1…5 per-Contract-ID blocks; SR-1 reconciled) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Precedent (informational, not authority) | `Doc-5B` (M0) out-of-wire boundary; `Doc-5C` (M1) cross-cutting context / dual-audience / non-disclosure model; `Doc-5D` (M2) tri-actor + per-read projection; `Doc-5F` (M4) two-sided actor + firewall bands. Force derives from `Doc-5A §1.3/§5/§7/§11` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 (FROZEN — Core consumed), Doc-4C v1.0 (FROZEN — Identity consumed), Doc-4G v1.0 (FROZEN), Doc-4M v1.0 (FROZEN — cross-module state-map index), Doc-5A v1.0 (FROZEN) |
| Contains | Structure only — section map, surface partition (with section-pointer column), ratified realization decisions, the carried freeze-gate dependencies. No endpoints, paths, status tables, schemas, contract bodies, or **score values/formulae** |
| Audience | Architecture Board · API Governance Board · Doc-5G content authors (human + AI) · AI Coding Supervisor · backend, QA |

Two governing rules shape this document (the Doc-5B/5C/5D/5F precedent):

1. **Realize, never re-decide.** Doc-4G fixed *what* M5's 40 contracts declare (FROZEN); Doc-5A fixed *how* a contract becomes a concrete HTTP API (FROZEN). Doc-5G realizes Doc-4G's caller-facing surface on the wire and re-decides nothing; every rule binds to Doc-5A / Doc-4G / corpus by pointer.
2. **Conformance is an obligation.** Doc-5G passes the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) before freeze (`Doc-5_Program_Governance_Note_v1.0 §6`). It coins no endpoint, status, header, error class, permission slug, POLICY key, event, or **score value/threshold**.

### SR-1 — Provisional-inventory structure rule (Architecture Board, MAJOR-01)

**Contract count and partition ownership are PROVISIONAL until reconciled against the authoritative Doc-4G PassB per-Contract-ID inventory.** Structure freeze is **BLOCKED** until reconciliation completes; **content authoring MAY proceed** against the partition. Tracked as carried item **`[REC-TRUST-COUNT]`** (channel: Doc-4G PassB inventory verification).

> **Reconciliation (performed at authoring — `[REC-TRUST-COUNT]` RESOLVED):** the authoritative total is **40 contracts**, the unique `trust.*.v1` token set across the five frozen PassB files (`Doc-4G_PassB_Part1…Part5`). The `approve_verification` vs `decide_verification` ambiguity is **closed**: `trust.approve_verification.v1` does **not** exist in any frozen Doc-4G content — it appears only in the non-frozen `Doc-4G_Final_Consolidation_Review_v1.0.md`. The frozen verification-decision contract is **`trust.decide_verification.v1`** (BC-TRUST-1 §G4.3, 21.6 Admin — records approve/reject/confirm/downgrade/request-info). Count = **40** (34 caller-facing + 6 out-of-wire). On any later divergence from the Doc-4G PassB inventory, this rule re-opens.

---

## Decisions ratified at structure freeze (proposed)

- **R1 — Out-of-wire boundary** (Doc-5B/5C/5D/5F R1 precedent; authority `Doc-5A §1.3/§5/§11`). Doc-5G realizes only the caller-facing HTTP surface (Public + User + Admin). The following **6 contracts have no caller wire** (→ §8): `trust.compute_trust_score.v1`, `trust.compute_performance_score.v1` (**score-computation firewall** — R5), `trust.ingest_performance_input.v1` (sole writer of `performance_inputs` — R9), `trust.trigger_performance_review.v1` (all 21.5 System); `trust.expire_verification.v1`, `trust.expire_verified_tier.v1` (21.5 System timers — R7/R8). Out-of-wire also as **mechanisms** (not separate tokens, per the §3 dual-audience rule): the **dual-audience reads' internal-service leg** (`get_verified_tier`, `get_trust_score`, `get_performance_score`, `get_review`, `list_reviews` consumed by M2/M3/M6) and the **System-detected leg** of `create_fraud_signal`. **Flag-and-halt if any wire is proposed for them.**
- **R2 — Multi-actor surface: Public + User + Admin (System out-of-wire).** **Public** badge / published-review reads (no `Authorization`, no `Iv-Active-Organization`); **User** — only `request_verification` (org-owned subject) and `submit_review` (engagement-gated) — carrying a server-validated `Iv-Active-Organization` (`Doc-4A §5.3`; `Doc-5A §7`); **Admin** governance subset (the bulk — verification decisions, score freeze/reactivate, fraud triage, review moderation, admin ratings; **no** org context, `Doc-5A §7.3`). System is out-of-wire (R1).
- **R3 — `trust` route prefix; `trust.` Contract-ID token** (`Doc-5A Appendix B.1` — registered "Reserved"; `Doc-2 §0.3`; token == route, unlike M4). Path grammar (§5.3) derives from the route prefix `trust`. Doc-5G coins neither.
- **R4 — No token invented.** Endpoints bind existing Doc-2 §7 slugs, §9 audit actions, and §8 events; carried gaps are bound by pointer and **escalated, never invented**: `[ESC-TRUST-SLUG]` (Doc-2 §7 additive), `[ESC-TRUST-AUDIT]` (Doc-2 §9 additive), `[ESC-TRUST-POLICY]` (Doc-3 §12.2 additive — score formula thresholds/weights, expiry/review/dedup windows) — `CHK-5A-121` (anti-invention) · `CHK-5A-154` (namespace token) · `Doc-4A §6.4`/§18.2.
- **R5 — Score-computation firewall (the M5 signature; Invariant #6).** `compute_trust_score` / `compute_performance_score` are **System-actor auto-calculation, out-of-wire (§8), never hand-edited, never caller-facing.** **No caller action mutates a score value, and no score value is ever a wire input.** `freeze_*` / `reactivate_*` are **Admin governance over publication/ranking effect only** — they never edit the computed value. **Not-Rated ≠ zero** (threshold gate; absence of history never scores as zero). Attestation bands in Appendix A.
- **R6 — Governance-signal firewall (Invariant #6; DG-7).** Separate score surfaces; **no cross-signal write** — Financial Tier ⇏ Trust Score; Financial Tier ≠ Performance Score; no secondary signal dominates. **DG-7 invariant (verbatim, binding):** *No entitlement, subscription, plan, payment, credit, quota, or commercial state may influence Trust Score, Performance Score, Verification, or Verified Tier.* Realized as §3 wire constraints, never a gating header/param (`Doc-4A §4B`).
- **R7 — Verification: Admin decides, Trust owns.** `request_verification` (User) → `assign_verification` / `decide_verification` / `revoke_verification` (Admin) → **`expire_verification` (System timer — NOT an Admin action; out-of-wire §8)**. `decide_verification` emits `VendorVerified` (outbox). Cross-org case access collapses to `NOT_FOUND` (R10).
- **R8 — Verified-tier-without-ownership (Doc-4G PATCH-01; the M5→M2 seam).** Trust validates / confirms / suspends / downgrades the verified tier (Admin) and **emits `VendorTierChanged[verified]`** (outbox); **Marketplace writes `marketplace.financial_tier_history`, never Trust** (mirror of Doc-5D DD-1). `expire_verified_tier` is a System timer (out-of-wire §8). No cross-module write authored.
- **R9 — Performance-input sole writer.** `ingest_performance_input` is the **only** write path to `performance_inputs` (out-of-wire §8; System event consumer of Operations perf events + RFQ `QuotationSubmitted`); `publish_review` (Admin, §7) **invokes** the ingestion service for the published-review feedback leg, **never writes directly**; dedup is at computation. No caller write path to inputs.
- **R10 — Non-disclosure firewall.** Verification case detail (beyond status), fraud signals, and admin ratings are **staff-internal only** — never tenant-visible, never public; cross-org / protected-fact reads collapse to a uniform `NOT_FOUND` (no timing side-channel) (`Doc-5A §6.3/§7`; `Doc-4A §7.5`). (Invariant #11/#6.)
- **R11 — Event surface via outbox, not webhook.** M5 emits the `trust` event set enumerated in **`Doc-2 §8`** (verification / verified-tier / trust-score / performance-score / performance-review events), bound **by pointer and never restated here**, to the **M0 transactional outbox**; consumed by M2/M3/M6. Doc-5A §11 carries **no** caller-facing webhook/push surface (`Doc-5A §11.3`). Outbox-emission realization (per-command emitter mapping) belongs to the **content phase, not the structure phase**.
- **R12 — AI suggests, modules decide (Invariant #12).** System/AI-detected fraud signals are **observational inputs only; administrative disposition (`review`/`action`/`dismiss`) remains authoritative.** No AI authoritative write (§3 rule).

---

## M5 surface partition (the structural spine — PROVISIONAL per SR-1, reconciled to 40)

> **40 Doc-4G contracts** (PassB BC-TRUST-1…5 per-Contract-ID blocks) — **34 caller-facing**, **6 out-of-wire**. Each row carries an explicit **Doc-5G §** owner; every contract is assigned to exactly one section. **Section ownership (this partition table) is authoritative; the §2 inventory grouping is informational — on any conflict, the partition table wins.** §3 is a cross-cutting wire-model section and **owns no endpoint**.

| Doc-4G contracts | Nature | **Doc-5G §** |
|---|---|---|
| BC-TRUST-1 `request_verification` | User command (21.4; org-owned subject) | **§4** `POST` |
| BC-TRUST-1 `assign_verification`, `decide_verification`, `revoke_verification` · `set_verified_tier`, `confirm_verified_tier`, `suspend_verified_tier`, `downgrade_verified_tier` | Admin governance (21.6, no org context) | **§4** `POST` |
| BC-TRUST-1 `get_verification`, `list_verifications` (staff) · `get_verified_tier` (public badge + internal-service) | Query (21.3) | **§4** `GET` |
| BC-TRUST-2 `freeze_trust_score`, `reactivate_trust_score` | Admin governance (21.6; publication/ranking only — R5) | **§5** `POST` |
| BC-TRUST-2 `get_trust_score` (public badge + internal-service) · `list_trust_score_history` (staff) | Query (21.3) | **§5** `GET` |
| BC-TRUST-3 `freeze_performance_score`, `reactivate_performance_score` | Admin governance (21.6; R5) | **§5** `POST` |
| BC-TRUST-3 `get_performance_score` (public badge + internal-service) · `list_performance_inputs`, `list_performance_score_history` (staff) | Query (21.3) | **§5** `GET` |
| BC-TRUST-4 `create_fraud_signal` (Admin leg), `review_fraud_signal`, `action_fraud_signal`, `dismiss_fraud_signal` · `get_fraud_signal`, `list_fraud_signals` (staff) | Admin governance / Query (21.6 / 21.3; staff-only — R10/R12) | **§6** `POST` / `GET` |
| BC-TRUST-5 `submit_review` | User command (21.4; engagement-gated) | **§7** `POST` |
| BC-TRUST-5 `moderate_review`, `publish_review`, `remove_review`, `set_admin_rating` | Admin governance (21.6; `publish_review` invokes ingestion — R9) | **§7** `POST` |
| BC-TRUST-5 `get_review`, `list_reviews` (public, published only) · `list_admin_ratings` (staff, internal-only) | Query (21.3) | **§7** `GET` |
| BC-TRUST-1 `expire_verification`, `expire_verified_tier` | System timer (21.5; R7/R8) | **§8** out-of-wire |
| BC-TRUST-2 `compute_trust_score` · BC-TRUST-3 `compute_performance_score` | System auto-calc (21.5; **score firewall** R5) | **§8** out-of-wire |
| BC-TRUST-3 `ingest_performance_input` (sole writer), `trigger_performance_review` | System (21.5; R9) | **§8** out-of-wire |

Out-of-wire **mechanisms** (not separate tokens): the dual-audience reads' internal-service leg (`get_verified_tier` / `get_trust_score` / `get_performance_score` / `get_review` / `list_reviews`) and the **System-detected leg** of `create_fraud_signal` — realized exclusively in §8 (§3 dual-audience rule).

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Doc-5G's precedence (… → Doc-4A → Doc-4G → Doc-5A → **Doc-5G** → Code); conform to Doc-5A in full and pass Appendix A; realize-never-redecide; flag-and-halt; the SR-1 provisional-inventory rule.
- **Dependencies:** `Doc-5A §0`; `Doc-5_Program_Governance_Note_v1.0`. **Detail:** short, normative.

## §1 — Scope, Audience & M5 Surface Partition
- **Purpose:** what Doc-5G governs (the M5 caller-facing HTTP surface — Public + User + Admin) and does not; carry the surface-partition table; the **§1.x dependency boundary** (M5 realizes only M5 surfaces; cross-module → owning module's Doc-5x — Identity → Doc-5C, Marketplace → Doc-5D, RFQ → Doc-5E, Operations → Doc-5F, Admin → Doc-5J, Billing → Doc-5I; **M5 consumes/emits, never realizes, those surfaces**); register carried dependencies **DG-1…DG-8** + `[ESC-TRUST-AUDIT]` / `[ESC-TRUST-POLICY]` / `[ESC-TRUST-SLUG]` + **`[REC-TRUST-COUNT]`** (SR-1) by pointer (resolved only via their Doc-4G channels).
- **Dependencies:** `Doc-5A §1`; `Doc-4G §G0`, Appendix (DG-1…DG-8). **Detail:** scope + partition + carried-dependency table.

## §2 — Realized Endpoint Inventory
- **Purpose:** the `trust`-route HTTP surface — one row per **caller-facing** endpoint (the 34 Public/User/Admin commands & queries): method (§5.2), path grammar (§5.3, prefix `trust`), actor + active-org applicability (§7), success status (§5.5). Command tokens = the exact `trust.<operation>` operation names **verbatim from the Doc-4G PassB per-Contract-ID blocks** (`trust.<operation>.v1`; `Doc-4A §21` / `Doc-5A §5`). **Inventory ordering within each section is non-authoritative and informational only (NP-01); section ownership (the partition table) is authoritative — on any conflict, the partition table wins (NP-02).** Every endpoint instantiates the §5.7 template (filled in content).
- **Dependencies:** `Doc-5A §5`, App B.1 (`trust`); `Doc-4G` PassB (40-contract inventory). **Detail:** inventory table (paths in content pass).

## §3 — Cross-Cutting Actor, Score-Firewall & Non-Disclosure Wire Model *(mechanism only — owns no endpoint)*
- **Purpose:** the defining Doc-5G cross-cutting section — realize, on the wire, the mechanism §4–§7 endpoints all depend on (it instantiates no endpoint body): the **Public / User / Admin actor model** (R2); `Authorization` bearer = authentication; **`Iv-Active-Organization` server-validated, never client-trusted** for the User legs; **`check_permission` is the sole authorization authority consumed by M5 surfaces; no parallel or shadow authorization path is permitted (`Doc-4A §5.3`, `Doc-4A §6`)**; the **score-value-never-on-wire** rule (R5 — no `compute_*` and no score value is ever a caller write or wire input); the **governance / Billing firewall as a wire constraint** (R6 — the DG-7 verbatim invariant; no commercial state gates any signal); the **non-disclosure firewall** (R10 — uniform `NOT_FOUND` collapse on protected-fact-gated reads); the **per-read disclosure-scope rule** (every §4–§7 read declares Public-Badge / Staff-Internal / Internal-Service; ambiguity = content blocker) and the **per-command actor-side rule** (every §4–§7 command declares User / Admin; ambiguity = content blocker). **Plus two board-required rules:**
  - **Dual-audience rule (MAJOR-02):** *Where a contract has both caller-facing and Internal-Service consumption paths, Doc-5G realizes only the caller-facing wire leg. Internal-Service consumption is realized exclusively in §8 and creates no additional HTTP surface.*
  - **AI rule (R12 / MIN-03):** *AI-detected fraud signals are observational inputs only; administrative disposition remains authoritative.*
- **Dependencies:** `Doc-5A §6.3/§7`; `Doc-4A §4B/§5/§5.3/§6/§7.5`; `Doc-4C §C3/§C8` (consumed authorization root); `Doc-4G §G3/§G4`. **Detail:** cross-cutting wire-model declaration; no endpoint instantiation.

## §4 — Verification & Verified-Tier Surface Realization (BC-TRUST-1)
- **Purpose:** the §G4 verification surface — `request_verification` (User, org-owned subject) → Admin `assign_verification` / `decide_verification` (emits `VendorVerified`) / `revoke_verification`; the **verified-tier** Admin lifecycle (`set_verified_tier` / `confirm_verified_tier` / `suspend_verified_tier` / `downgrade_verified_tier`, emitting `VendorTierChanged[verified]` — **R8 verified-tier-without-ownership: Trust emits, Marketplace writes `financial_tier_history`**); staff reads (`get_verification`, `list_verifications`) and the dual-audience `get_verified_tier` (public-badge leg here; internal-service leg → §8); the **System expiry timers** (`expire_verification`, `expire_verified_tier`) out-of-wire (§8/R7); each read declares its disclosure scope, each command its actor side (§3 rules); idempotency/concurrency; error mapping with `NOT_FOUND` collapse (R10); **top-level `reference_id` (C-05) — the Doc-5G nominated declaration point, cross-cutting to §5–§7** (`Doc-4A §22.1 C-05`, clarified by `PATCH-D4A-C05-204`: body-bearing responses only, `204` exempt; `CHK-5A-042` [B]); `[ESC-TRUST-AUDIT]` on un-enumerated verification/tier actions.
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4G §G4`; edges `Doc-2 §5.6/§5.7` + `Doc-4M` (state-map index); `Doc-4A §13`. **Detail:** verification + verified-tier realization.

## §5 — Trust & Performance Score Surface Realization (BC-TRUST-2 + BC-TRUST-3)
- **Purpose:** the §G5/§G6 score-governance surface — **only** the Admin governance commands (`freeze_trust_score` / `reactivate_trust_score`; `freeze_performance_score` / `reactivate_performance_score` — publication/ranking effect only, **never score edits**, R5) and the reads (public-badge `get_trust_score` / `get_performance_score` with internal-service leg → §8; staff `list_trust_score_history`, `list_performance_inputs`, `list_performance_score_history`); **the `compute_trust_score`, `compute_performance_score`, `ingest_performance_input`, and `trigger_performance_review` System mechanisms are out-of-wire (§8 — score-computation firewall R5, sole-writer R9)**; Not-Rated ≠ zero on the badge reads; each read declares disclosure scope; idempotency/concurrency; error mapping. No score value or formula on any wire (R5/R6).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4G §G5/§G6`; edges `Doc-2 §5.7/§10.6` + `Doc-4M` (index); `Doc-4A §4B/§13`. **Detail:** score-governance + read realization.

## §6 — Fraud & Risk Signal Surface Realization (BC-TRUST-4)
- **Purpose:** the §G7 fraud surface — the **Admin** staff-reported `create_fraud_signal` (the System/AI-detected leg out-of-wire §8 — R12) and the triage commands `review_fraud_signal` / `action_fraud_signal` / `dismiss_fraud_signal` (`open → reviewed → actioned | dismissed`); staff reads (`get_fraud_signal`, `list_fraud_signals`) — **staff-internal only, never tenant-visible or public** (R10); Trust issues no ban (DG-5 — Admin owns the ban decision); each command declares actor side, each read its Staff-Internal scope; `[ESC-TRUST-AUDIT]` on the un-enumerated fraud actions; idempotency/concurrency; error mapping.
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4G §G7`; edges `Doc-2 §3` (`fraud_signals`) + `Doc-4M` (index); `Doc-4A §7.5`. **Detail:** fraud-triage realization.

## §7 — Reviews & Admin Ratings Surface Realization (BC-TRUST-5)
- **Purpose:** the §G8 reviews surface — `submit_review` (User, engagement-gated) → Admin `moderate_review` (`submitted → approved | rejected`) / `publish_review` (`approved → published`; **invokes the out-of-wire `ingest_performance_input` for the published-review feedback leg — R9, never writes directly**) / `remove_review` (soft-delete); the **public** published-review reads (`get_review`, `list_reviews` — published only, dual-audience internal leg → §8); the **internal-only** `set_admin_rating` (Admin, **never public, never tenant-visible** — R10) and staff `list_admin_ratings`; each read declares disclosure scope, each command actor side; `[ESC-TRUST-AUDIT]` on un-enumerated review/rating actions; idempotency/concurrency; error mapping.
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4G §G8`; edges `Doc-2 §3.6` + `Doc-4M` (index); `Doc-4A §7.5`. **Detail:** review + admin-rating realization.

## §8 — Out-of-Wire Boundary (score-computation firewall · perf-input sole-writer ingestion · perf-review trigger · verification/tier expiry timers · System-detected fraud leg · dual-audience internal legs)
- **Purpose:** declare that the 6 out-of-wire contracts and the out-of-wire mechanisms have **no HTTP wire** — the score-computation firewall (`compute_trust_score`, `compute_performance_score` — System auto-calc, never hand-edited), the sole-writer ingestion (`ingest_performance_input`), the `trigger_performance_review` System effect, the `expire_verification` / `expire_verified_tier` System timers, the System-detected leg of `create_fraud_signal`, and the dual-audience reads' internal-service leg — are in-process services / background workers / event consumers driven by the outbox or timers. **Out-of-wire contracts have no caller wire in any protocol: no REST, no SSE, no WebSocket, no Webhook, no GraphQL.** Implementation is code / Doc-6. **Flag-and-halt if any wire surface in any protocol is proposed** (an architecture change). The score-computation firewall being out-of-wire is the highest-stakes application of R1/R5.
- **Dependencies:** `Doc-4G §G4/§G5/§G6/§G7`, Appendix (DG-3/DG-4/DG-8); `Doc-5A §1.3/§11`. **Detail:** boundary statement only — no realization.

## §9 — Conformance & Carried Items
- **Purpose:** Doc-5G's attestation against Doc-5A **Appendix A** (the freeze gate); the carried-items register (DG-1…DG-8 + `[ESC-TRUST-AUDIT]` / `[ESC-TRUST-POLICY]` / `[ESC-TRUST-SLUG]` + `[REC-TRUST-COUNT]`) by pointer with each named resolution channel; statement that Doc-5G coins nothing (no endpoint/status/header/error-class/slug/POLICY-key/event/score).
- **Dependencies:** `Doc-5A Appendix A`; `Doc-4G §G0`, Appendix. **Detail:** attestation + carried-item register.

## Appendix A — Doc-5G Conformance Attestation
- **Purpose:** per-band pass/fail against the applicable `CHK-5A-xxx` checks for the realized M5 surface; the freeze evidence. Includes three dedicated bands (the M5-unique risks not covered by a single `CHK-5A-xxx`):
  - **Score-computation-firewall band:** *`compute_*` are System-only and out-of-wire; only `freeze_*` / `reactivate_*` (publication/ranking) are caller-facing.*
  - **No-score-value-caller-editable band (NP-03, separate):** *no caller request — User or Admin — can write, set, or edit a Trust Score or Performance Score value; no score value or formula appears on any wire.*
  - **Non-disclosure band:** *verification case detail, fraud signals, and admin ratings are never public or tenant-visible; cross-org/protected reads collapse to `NOT_FOUND`.*
- **Dependencies:** `Doc-5A Appendix A`; §3 (disclosure-scope + actor-side rules, R5/R6/R10). **Detail:** attestation table (content pass).

---

## Open Carried Items (Doc-4G Appendix — resolved only via named channels, never here)

| ID | Item | Doc-5G handling | Freeze gate? |
|---|---|---|---|
| **DG-1** | Identity — `check_permission` / org-context, consumed | Authorization resolved server-side via Identity (`Doc-4C §C3/§C8`); no shadow authz (§3); no Identity surface realized | **No** |
| **DG-2** | Marketplace — declared-tier reference; consumes `VendorTierChanged[verified]` + score events | Trust emits the tier event (R8); Marketplace consumes + writes `financial_tier_history`; no Marketplace surface realized | **No** |
| **DG-3** | RFQ — consumes `QuotationSubmitted` (perf input) + score events; Trust owns no matching | `ingest_performance_input` consumes the RFQ event (out-of-wire §8); no matching/ranking/award authored | **No** |
| **DG-4** | Operations — five performance-input events consumed | `ingest_performance_input` is the sole consumer/writer (out-of-wire §8 — R9); no Operations surface realized | **No** |
| **DG-5** | Admin — fraud triage; **ban decision is Admin-owned** | Fraud triage realized (§6); **Trust issues no ban**; ban bound to `Doc-4J` by pointer | **No** |
| **DG-6** | Communication — notification fan-out on Trust events | Trust emits to the outbox (R11); notification dispatch is Communication-authored; no notification surface realized | **No** |
| **DG-7** | Billing — **firewall** (no signal gated by commercial state) | Realized as the §3/R6 verbatim invariant: *no entitlement, subscription, plan, payment, credit, quota, or commercial state may influence Trust Score, Performance Score, Verification, or Verified Tier*; no Billing input on any wire | **No** |
| **DG-8** | Platform Core — audit-write / outbox-write / timers / UUIDv7 / human-ref / POLICY, consumed | Consumed via Doc-4B mechanisms by pointer; never re-implemented; no Core surface realized | **No** |
| `[ESC-TRUST-SLUG]` | A required staff action may lack a Doc-2 §7 slug | Interim binding to the nearest existing staff slug by pointer; channel: Doc-2 §7 additive; no slug invented | **No** |
| `[ESC-TRUST-AUDIT]` | Verification/tier transitions, fraud actions, admin-rating, ingestion rows not separately enumerated in Doc-2 §9 | Bound by pointer to the nearest Doc-2 §9 action; **interim**, not finalized; channel: Doc-2 §9 additive | **No** |
| `[ESC-TRUST-POLICY]` | `trust.*` POLICY keys — **split by wire-reachability** | Referenced by **intended key name** by pointer; channel: Doc-3 §12.2 additive (precedent `core.*` v1.0 / `rfq.*` v1.1 / `marketplace.*` v1.2; Doc-4A §18.2); not invented (`CHK-5A-121/123`). **(a) Wire-referenced keys** (idempotency dedup window, list page-size) — gate the content Freeze Audit. **(b) Out-of-wire keys** (score thresholds/weights, expiry/review windows — consumed only by §8 System mechanisms, never on the wire) — tracked finalization, not a wire-conformance gate. | **Structure: No.** **Content: YES for the wire-referenced keys** — `CHK-5A-121` content-freeze gate (Doc-5E/5D precedent); resolve via the additive Doc-3 §12.2 `trust.*` registration patch before the content Freeze Audit. Out-of-wire keys: **No**. |
| **`[REC-TRUST-COUNT]`** (SR-1) | 40-vs-41 contract-count reconciliation (`approve_` vs `decide_verification`) | **RESOLVED at authoring** — 40 authoritative across the five frozen PassB files; `approve_verification` absent from frozen Doc-4G (only in the non-frozen Final Consolidation Review); `decide_verification` is the frozen decision contract. Re-opens on any later Doc-4G PassB divergence | **Closed** — structure freeze no longer blocked on count |

## Fences / Out of scope

Cross-module realization (owning module's Doc-5x — §1.x) · any other module's surface · resolving DG-1…DG-8 / `[ESC-TRUST-*]` · framework/DB/job-engine implementation (code/Doc-6) · giving any out-of-wire contract or mechanism a wire in any protocol (REST/SSE/WebSocket/Webhook/GraphQL) · authoring any matching/ranking/award (RFQ/Doc-4E — DG-3), ban decision (Admin/Doc-4J — DG-5), Marketplace tier write (Doc-4D — R8/DG-2), or Billing/commercial gate (Doc-4I — DG-7) · **putting any score value, formula, threshold, or weight on a wire or making a score caller-editable** · coining any endpoint/status/header/error-class/slug/POLICY key/event/score.

---

## Structure self-audit (pre-review)

| Check | Result |
|---|---|
| Every Doc-4G caller-facing contract assigned to exactly one §4–§7 realization section (partition § column) | ✅ — 34 caller-facing → §4(11)/§5(9)/§6(6)/§7(8) |
| Every System / timer / sole-writer contract assigned to §8 out-of-wire | ✅ — 6 |
| Total = 40 (matches Doc-4G PassB BC-TRUST-1…5 inventory; SR-1 reconciled) | ✅ — 34 + 6 |
| SR-1 provisional-inventory rule + `[REC-TRUST-COUNT]` present; 40-vs-41 reconciled with evidence | ✅ — MAJOR-01 |
| Multi-actor (Public / User / Admin) isolated; System out-of-wire; only 2 User commands | ✅ — R2 |
| Score-computation firewall: `compute_*` out-of-wire; no score value on any wire; freeze/reactivate ≠ edit | ✅ — R5 / §8 |
| No-score-value-caller-editable attestation band (separate) in Appendix A | ✅ — NP-03 |
| Governance/Billing firewall: DG-7 verbatim invariant; no commercial state gates a signal | ✅ — R6 / MIN-01 |
| Verification: Admin decides / Trust owns; `expire_verification` = System timer, not Admin | ✅ — R7 / MIN-02 |
| Verified-tier-without-ownership: Trust emits, Marketplace writes `financial_tier_history` | ✅ — R8 |
| Performance-input sole writer (`ingest_performance_input`); `publish_review` invokes, never writes | ✅ — R9 |
| Dual-audience rule: caller leg realized; internal-service leg exclusively §8, no extra HTTP surface | ✅ — MAJOR-02 / §3 |
| AI rule: AI-detected fraud signals observational; admin disposition authoritative | ✅ — R12 / MIN-03 |
| Non-disclosure: verification detail / fraud / admin ratings staff-internal; `NOT_FOUND` collapse | ✅ — R10 |
| §8 protocol fence: no REST / SSE / WebSocket / Webhook / GraphQL | ✅ — MIN-04 |
| Per-read disclosure-scope + per-command actor-side rules declared; ambiguity = content blocker | ✅ — §3 |
| `check_permission` sole authority; no shadow path | ✅ — §3 |
| Event posture: outbox emission (R11), no webhook; Doc-2 §8 by pointer, not restated | ✅ — R11 |
| State-machine edges bound to Doc-2 (source) + Doc-4M (index); no edge invented | ✅ |
| §2 inventory-ordering non-authoritative; partition table wins | ✅ — NP-01 / NP-02 |
| Carried DG-1…DG-8 + `[ESC-TRUST-*]` + `[REC-TRUST-COUNT]` registered by pointer | ✅ |
| Nothing coined; `trust` prefix bound to App B.1 / Doc-2 §0.3 | ✅ — R3/R4 |
| `[ESC-TRUST-POLICY]` split by wire-reachability; wire-referenced keys flagged CHK-5A-121 content-freeze gate (additive Doc-3 §12.2 patch) | ✅ — ADD-1 (Doc-5E/5D precedent) |
| Top-level `reference_id` (C-05) nominated declaration point present (§4, cross-cutting §5–§7) | ✅ — ADD-2 (CHK-5A-042 [B]; pre-empts Doc-5D Pass-2 blocker) |

---

*End of Doc-5G Structure Proposal v0.1. Structure only; pre-incorporates the Doc-5D/5F review lessons and the plan-stage Architecture Board findings (SR-1 / MAJOR-01, MAJOR-02, MIN-01…04, NP-01…03). SR-1 `[REC-TRUST-COUNT]` reconciled to 40. On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt. Next: Independent Hard Review → Structure Patch → promote to `Doc-5G_Structure_v1.0_FROZEN`; then compressed content passes (Pass-1 = §0–§3 + inventory; Pass-2 = §4–§5; Pass-3 = §6–§9 + Appendix A), each conforming to this structure.*

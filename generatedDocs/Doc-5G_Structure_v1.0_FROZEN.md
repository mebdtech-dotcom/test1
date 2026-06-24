# Doc-5G — Trust & Verification (M5 `trust`) API Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents for Doc-5G |
| Freeze Date | 2026-06-25 |
| Supersedes | `Doc-5G_Structure_Proposal_v0.1.md` (Independent Hard Review applied; SR-1 `[REC-TRUST-COUNT]` reconciled to 40; ADD-1 `[ESC-TRUST-POLICY]` content-freeze-gate split + ADD-2 `reference_id` declaration point applied; authoring history retained there) |
| Module | Module 5 — Trust & Verification (`trust` schema) — **the governance-signal owner; where the firewalls are realized** |
| Realizes | `Doc-4G` (M5 contracts, FROZEN — **40 contracts**, PassB BC-TRUST-1…5 per-Contract-ID blocks) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Precedent (informational, not authority) | `Doc-5B`/`Doc-5C`/`Doc-5D`/`Doc-5E` (FROZEN); **`Doc-5C §3` mechanism-only cross-cutting precedent; `Doc-5D` tri-actor + per-read projection; Doc-5E/5D `[ESC-*-POLICY]` content-freeze-gate precedent**; force derives from `Doc-5A §1.3/§5/§7/§11` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0 (Core consumed), Doc-4C v1.0 (Identity consumed), Doc-4G v1.0 (FROZEN — M5 contracts), Doc-4M v1.0 (FROZEN — cross-module state-map index), Doc-5A v1.0 (FROZEN) |
| Contains | Structure only — section map, surface partition (section-pointer column), ratified decisions, carried freeze-gate dependencies. No endpoints, paths, status tables, schemas, contract bodies, or **score values/formulae** |
| Audience | Architecture Board · API Governance Board · Doc-5G content authors (human + AI) · AI Coding Supervisor · backend, QA |

Two governing rules shape the document:

1. **Realize, never re-decide.** Doc-4G fixed *what* M5's 40 contracts declare (FROZEN); Doc-5A fixed *how* a contract becomes HTTP (FROZEN). Doc-5G realizes Doc-4G's **caller-facing** surface and re-decides nothing.
2. **Conformance is an obligation.** Doc-5G passes the Doc-5A **Appendix A** checklist before freeze. It coins no endpoint, status, header, error class, permission slug, POLICY key, event, or **score value/threshold**.

## SR-1 — Inventory reconciliation (RESOLVED at structure freeze)

The authoritative total is **40 contracts** — the unique `trust.*.v1` token set across the five frozen PassB files (`Doc-4G_PassB_Part1…Part5`), independently verified at freeze. The `approve_verification` vs `decide_verification` ambiguity is **closed**: `trust.approve_verification.v1` does **not** exist in any frozen Doc-4G content — it appears only in the non-frozen `Doc-4G_Final_Consolidation_Review_v1.0.md` (§event-map line). The frozen verification-decision contract is **`trust.decide_verification.v1`** (BC-TRUST-1 §G4.3, 21.6 Admin). Count = **40** (34 caller-facing + 6 out-of-wire). `[REC-TRUST-COUNT]` is **closed**; it re-opens only on a later divergence from the Doc-4G PassB inventory.

## Decisions ratified at structure freeze

- **R1 — Out-of-wire boundary** (Doc-5B/5C/5D/5E precedent; authority `Doc-5A §1.3/§5/§11`). Doc-5G realizes only the caller-facing HTTP surface (Public + User + Admin). **6 contracts have no caller wire** (→ §8): `trust.compute_trust_score.v1`, `trust.compute_performance_score.v1` (**score-computation firewall** — R5), `trust.ingest_performance_input.v1` (sole writer of `performance_inputs` — R9), `trust.trigger_performance_review.v1`, `trust.expire_verification.v1`, `trust.expire_verified_tier.v1` (all 21.5 System). Out-of-wire also as **mechanisms** (not separate tokens): the **dual-audience reads' internal-service leg** (`get_verified_tier` / `get_trust_score` / `get_performance_score` / `get_review` / `list_reviews`) and the **System-detected leg** of `create_fraud_signal`. **Flag-and-halt if any wire is proposed for them.**
- **R2 — Multi-actor: Public + User + Admin (System out-of-wire).** **Public** badge / published-review reads (no `Authorization`, no `Iv-Active-Organization`); **User** — only `request_verification` (org-owned subject) and `submit_review` (engagement-gated) — server-validated `Iv-Active-Organization` (`Doc-4A §5.3`; `Doc-5A §7`); **Admin** governance subset (the bulk; no org context, `Doc-5A §7.3`). System out-of-wire (R1).
- **R3 — `trust` route prefix; `trust.` Contract-ID token** (`Doc-5A Appendix B.1` — registered "Reserved"; `Doc-2 §0.3`; token == route).
- **R4 — No token invented.** Bind existing Doc-2 §7 slugs, §9 audit actions, §8 events; carried gaps escalated, never invented: `[ESC-TRUST-SLUG]` (Doc-2 §7), `[ESC-TRUST-AUDIT]` (Doc-2 §9), `[ESC-TRUST-POLICY]` (Doc-3 §12.2) — `CHK-5A-121/154`; `Doc-4A §6.4/§18.2`.
- **R5 — Score-computation firewall (the M5 signature; Invariant #6).** `compute_trust_score` / `compute_performance_score` are **System-actor auto-calculation, out-of-wire (§8), never hand-edited, never caller-facing.** **No caller action mutates a score value, and no score value is ever a wire input.** `freeze_*` / `reactivate_*` are **Admin governance over publication/ranking effect only** — never edit the computed value. **Not-Rated ≠ zero.** Appendix A attestation bands.
- **R6 — Governance-signal firewall (Invariant #6; DG-7).** Separate score surfaces; **no cross-signal write** (Financial Tier ⇏ Trust Score; Financial Tier ≠ Performance Score). **DG-7 invariant (verbatim, binding):** *No entitlement, subscription, plan, payment, credit, quota, or commercial state may influence Trust Score, Performance Score, Verification, or Verified Tier.* Realized as §3 wire constraints, never a gating header/param (`Doc-4A §4B`).
- **R7 — Verification: Admin decides, Trust owns.** `request_verification` (User) → `assign_verification` / `decide_verification` / `revoke_verification` (Admin) → **`expire_verification` (System timer — NOT an Admin action; out-of-wire §8)**. `decide_verification` emits `VendorVerified` (outbox). Cross-org case access → `NOT_FOUND` (R10).
- **R8 — Verified-tier-without-ownership (Doc-4G PATCH-01; the M5→M2 seam).** Trust validates / confirms / suspends / downgrades the verified tier (Admin) and **emits `VendorTierChanged[verified]`** (outbox); **Marketplace writes `marketplace.financial_tier_history`, never Trust** (the reciprocal of Doc-5D DD-1). `expire_verified_tier` is a System timer (out-of-wire §8). No cross-module write authored.
- **R9 — Performance-input sole writer.** `ingest_performance_input` is the **only** write path to `performance_inputs` (out-of-wire §8; System consumer of Operations perf events + RFQ `QuotationSubmitted`); `publish_review` (Admin, §7) **invokes** the ingestion for the published-review feedback leg, **never writes directly**; dedup at computation. No caller write path to inputs.
- **R10 — Non-disclosure firewall.** Verification case detail (beyond status), fraud signals, and admin ratings are **staff-internal only** — never tenant-visible, never public; cross-org / protected-fact reads collapse to a uniform `NOT_FOUND` (no timing side-channel) (`Doc-5A §6.3/§7`; `Doc-4A §7.5`).
- **R11 — Event surface via outbox, not webhook.** M5 emits the `trust` event set enumerated in **`Doc-2 §8`** (verification / verified-tier / trust-score / performance-score / performance-review events), bound **by pointer and never restated here**, to the **M0 transactional outbox**; consumed by M2/M3/M6. No caller webhook/push (`Doc-5A §11.3`). Per-command emitter mapping = content phase.
- **R12 — AI suggests, modules decide (Invariant #12).** System/AI-detected fraud signals are **observational inputs only; administrative disposition (`review`/`action`/`dismiss`) remains authoritative.** No AI authoritative write (§3 rule).

## M5 surface partition (the structural spine — reconciled to 40)

> **40 Doc-4G contracts** (PassB BC-TRUST-1…5) — **34 caller-facing**, **6 out-of-wire**. Each row carries an explicit **Doc-5G §** owner; every contract lands in exactly one section. **Section ownership (this table) is authoritative; §2 inventory grouping is informational — on conflict, the partition table wins.** §3 owns no endpoint. **Independently verified at freeze:** §4(11)/§5(9)/§6(6)/§7(8) = 34 caller-facing; §8 = 6 out-of-wire; total 40.

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

Out-of-wire **mechanisms** (not separate tokens): the dual-audience reads' internal-service leg and the **System-detected leg** of `create_fraud_signal` — realized exclusively in §8 (§3 dual-audience rule).

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Doc-5G's precedence (… → Doc-4A → Doc-4G → Doc-5A → **Doc-5G** → Code); conform to Doc-5A in full + pass Appendix A; realize-never-redecide; flag-and-halt; the SR-1 reconciliation (closed).
- **Dependencies:** `Doc-5A §0`; `Doc-5_Program_Governance_Note_v1.0`. **Detail:** short, normative.

## §1 — Scope, Audience & M5 Surface Partition
- **Purpose:** what Doc-5G governs (the M5 caller-facing HTTP surface — Public + User + Admin) and does not; carry the partition table; the **§1.x dependency boundary** (M5 realizes only M5 surfaces; cross-module → owning module's Doc-5x — Identity → Doc-5C, Marketplace → Doc-5D, RFQ → Doc-5E, Operations → Doc-5F, Billing → Doc-5I, Admin → Doc-5J; M5 consumes/emits, never realizes those surfaces); register carried **DG-1…DG-8** + `[ESC-TRUST-AUDIT]` / `[ESC-TRUST-POLICY]` / `[ESC-TRUST-SLUG]` by pointer.
- **Dependencies:** `Doc-5A §1`; `Doc-4G §G0`, Appendix (DG-1…DG-8). **Detail:** scope + partition + carried-dependency table.

## §2 — Realized Endpoint Inventory
- **Purpose:** the `trust`-route HTTP surface — one row per **caller-facing** endpoint (the 34): method (§5.2), path grammar (§5.3, prefix `trust`), actor + active-org applicability (§7), success status (§5.5). Command tokens = exact `trust.<operation>` names **verbatim from the Doc-4G PassB per-Contract-ID blocks**. **Inventory ordering within each section is non-authoritative/informational; section ownership (the partition table) is authoritative — on conflict, the partition table wins.** Every endpoint instantiates the §5.7 template (filled in content).
- **Dependencies:** `Doc-5A §5`, App B.1 (`trust`); `Doc-4G` PassB (40-contract inventory). **Detail:** inventory table (paths in content pass).

## §3 — Cross-Cutting Actor, Score-Firewall & Non-Disclosure Wire Model *(mechanism only — owns no endpoint)*
- **Section-form authority:** the frozen `Doc-5C §3` / `Doc-5D §3` precedent, grounded in `Doc-5A §7`; a **[realization convention]** factoring the actor/firewall/non-disclosure model out of §4–§7.
- **Purpose:** realize, on the wire, the mechanism §4–§7 depend on: the **Public / User / Admin actor model** (R2); `Authorization` = authentication; **`Iv-Active-Organization` server-validated, never client-trusted** for the User legs; **`check_permission` is the sole authorization authority consumed by M5; no parallel or shadow authorization path** (`Doc-4A §5.3/§6`); the **score-value-never-on-wire** rule (R5); the **governance / Billing firewall as a wire constraint** (R6 — the DG-7 verbatim invariant); the **non-disclosure firewall** (R10 — uniform `NOT_FOUND`); the **per-read disclosure-scope rule** (every read declares Public-Badge / Staff-Internal / Internal-Service; ambiguity = content blocker) and the **per-command actor-side rule** (every command declares User / Admin; ambiguity = content blocker). **Plus two binding rules:**
  - **Dual-audience rule:** *Where a contract has both caller-facing and Internal-Service consumption paths, Doc-5G realizes only the caller-facing wire leg. Internal-Service consumption is realized exclusively in §8 and creates no additional HTTP surface.*
  - **AI rule (R12):** *AI-detected fraud signals are observational inputs only; administrative disposition remains authoritative.*
- **Dependencies:** `Doc-5A §6.3/§7`; `Doc-4A §4B/§5/§5.3/§6/§7.5`; `Doc-4C §C3/§C8` (consumed authorization root); `Doc-4G §G3/§G4`. **Detail:** cross-cutting wire-model declaration; no endpoint instantiation.

## §4 — Verification & Verified-Tier Surface Realization (BC-TRUST-1)
- **Purpose:** the §G4 verification surface — `request_verification` (User) → Admin `assign_verification` / `decide_verification` (emits `VendorVerified`) / `revoke_verification`; the **verified-tier** Admin lifecycle (`set_verified_tier` / `confirm_verified_tier` / `suspend_verified_tier` / `downgrade_verified_tier`, emitting `VendorTierChanged[verified]` — **R8: Trust emits, Marketplace writes `financial_tier_history`**); staff reads (`get_verification`, `list_verifications`) and the dual-audience `get_verified_tier` (public-badge leg here; internal-service leg → §8); the System expiry timers (`expire_verification`, `expire_verified_tier`) out-of-wire (§8/R7); each read declares disclosure scope, each command actor side (§3); idempotency/concurrency; error mapping with `NOT_FOUND` collapse (R10); **top-level `reference_id` (C-05) — the Doc-5G nominated declaration point, cross-cutting to §5–§7** (`Doc-4A §22.1 C-05`; `PATCH-D4A-C05-204`: body-bearing only, `204` exempt; `CHK-5A-042` [B]); `[ESC-TRUST-AUDIT]` on un-enumerated verification/tier actions.
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4G §G4`; edges `Doc-2 §5.6/§5.7` + `Doc-4M` (state-map index); `Doc-4A §13/§22.1`. **Detail:** verification + verified-tier realization.

## §5 — Trust & Performance Score Surface Realization (BC-TRUST-2 + BC-TRUST-3)
- **Purpose:** the §G5/§G6 score-governance surface — **only** the Admin governance commands (`freeze_trust_score` / `reactivate_trust_score`; `freeze_performance_score` / `reactivate_performance_score` — publication/ranking effect only, **never score edits**, R5) and the reads (public-badge `get_trust_score` / `get_performance_score` with internal-service leg → §8; staff `list_trust_score_history`, `list_performance_inputs`, `list_performance_score_history`); **`compute_trust_score`, `compute_performance_score`, `ingest_performance_input`, `trigger_performance_review` System mechanisms out-of-wire (§8 — R5/R9)**; Not-Rated ≠ zero on badge reads; each read declares disclosure scope; idempotency/concurrency; error mapping; top-level `reference_id` (§4). No score value or formula on any wire (R5/R6).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4G §G5/§G6`; edges `Doc-2 §5.7/§10.6` + `Doc-4M` (index); `Doc-4A §4B/§13`. **Detail:** score-governance + read realization.

## §6 — Fraud & Risk Signal Surface Realization (BC-TRUST-4)
- **Purpose:** the §G7 fraud surface — the **Admin** staff-reported `create_fraud_signal` (the System/AI-detected leg out-of-wire §8 — R12) and triage commands `review_fraud_signal` / `action_fraud_signal` / `dismiss_fraud_signal`; staff reads (`get_fraud_signal`, `list_fraud_signals`) — **staff-internal only, never tenant-visible or public** (R10); Trust issues no ban (DG-5 — Admin owns the ban decision); each command declares actor side, each read its Staff-Internal scope; `[ESC-TRUST-AUDIT]` on un-enumerated fraud actions; idempotency/concurrency; error mapping; top-level `reference_id` (§4).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4G §G7`; edges `Doc-2 §3` (`fraud_signals`) + `Doc-4M` (index); `Doc-4A §7.5`. **Detail:** fraud-triage realization.

## §7 — Reviews & Admin Ratings Surface Realization (BC-TRUST-5)
- **Purpose:** the §G8 reviews surface — `submit_review` (User, engagement-gated) → Admin `moderate_review` / `publish_review` (**invokes the out-of-wire `ingest_performance_input` for the published-review feedback leg — R9, never writes directly**) / `remove_review` (soft-delete); the **public** published-review reads (`get_review`, `list_reviews` — published only, internal leg → §8); the **internal-only** `set_admin_rating` (Admin, **never public, never tenant-visible** — R10) and staff `list_admin_ratings`; each read declares disclosure scope, each command actor side; `[ESC-TRUST-AUDIT]` on un-enumerated review/rating actions; idempotency/concurrency; error mapping; top-level `reference_id` (§4).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4G §G8`; edges `Doc-2 §3.6` + `Doc-4M` (index); `Doc-4A §7.5`. **Detail:** review + admin-rating realization.

## §8 — Out-of-Wire Boundary (score-computation firewall · perf-input sole-writer · perf-review trigger · expiry timers · System-detected fraud leg · dual-audience internal legs)
- **Purpose:** declare that the 6 out-of-wire contracts and the out-of-wire mechanisms have **no HTTP wire** — the score-computation firewall (`compute_trust_score`, `compute_performance_score` — System auto-calc, never hand-edited), the sole-writer ingestion (`ingest_performance_input`), the `trigger_performance_review` System effect, the `expire_verification` / `expire_verified_tier` System timers, the System-detected leg of `create_fraud_signal`, and the dual-audience reads' internal-service leg — in-process services / background workers / event consumers driven by the outbox or timers. **No caller wire in any protocol: no REST, no SSE, no WebSocket, no Webhook, no GraphQL.** Implementation is code / Doc-6. **Flag-and-halt if any wire surface in any protocol is proposed.** The score-computation firewall being out-of-wire is the highest-stakes application of R1/R5.
- **Dependencies:** `Doc-4G §G4/§G5/§G6/§G7`, Appendix (DG-3/DG-4/DG-8); `Doc-5A §1.3/§11`. **Detail:** boundary statement only — no realization.

## §9 — Conformance & Carried Items
- **Purpose:** Doc-5G's attestation against Doc-5A **Appendix A** (the freeze gate); the carried-items register (DG-1…DG-8 + `[ESC-TRUST-AUDIT]` / `[ESC-TRUST-POLICY]` / `[ESC-TRUST-SLUG]`) by pointer; statement that Doc-5G coins nothing (no endpoint/status/header/error-class/slug/POLICY-key/event/score). **`[ESC-TRUST-POLICY]` wire-referenced keys (dedup window, list page-size) are a CHK-5A-121 content-freeze gate** (resolved via an additive Doc-3 §12.2 `trust.*` registration patch — precedent `core.*` v1.0 / `rfq.*` v1.1 / `marketplace.*` v1.2; Doc-4A §18.2 — before content freeze); out-of-wire keys (score thresholds/weights, expiry/review windows) are tracked, not a wire-conformance gate.
- **Dependencies:** `Doc-5A Appendix A`; `Doc-4G §G0`, Appendix. **Detail:** attestation + carried-item register.

## Appendix A — Doc-5G Conformance Attestation
- **Purpose:** per-band pass/fail against the applicable `CHK-5A-xxx` checks for the realized M5 surface; the freeze evidence. Includes three dedicated bands (the M5-unique risks):
  - **Score-computation-firewall band:** *`compute_*` are System-only and out-of-wire; only `freeze_*` / `reactivate_*` (publication/ranking) are caller-facing.*
  - **No-score-value-caller-editable band (separate):** *no caller request — User or Admin — can write, set, or edit a Trust Score or Performance Score value; no score value or formula appears on any wire.*
  - **Non-disclosure band:** *verification case detail, fraud signals, and admin ratings are never public or tenant-visible; cross-org/protected reads collapse to `NOT_FOUND`.*
- **Dependencies:** `Doc-5A Appendix A`; §3 (disclosure-scope + actor-side rules, R5/R6/R10). **Detail:** attestation table (content pass).

---

## Open Carried Items (Doc-4G Appendix — resolved only via named channels, never here)

| ID | Item | Doc-5G handling | Freeze gate? |
|---|---|---|---|
| **DG-1** | Identity — `check_permission` / org-context, consumed | Authorization server-side via Identity (`Doc-4C §C3/§C8`); no shadow authz (§3); no Identity surface realized | **No** |
| **DG-2** | Marketplace — declared-tier reference; consumes `VendorTierChanged[verified]` + score events | Trust emits the tier event (R8); Marketplace consumes + writes `financial_tier_history`; no Marketplace surface realized | **No** |
| **DG-3** | RFQ — consumes `QuotationSubmitted` (perf input) + score events; Trust owns no matching | `ingest_performance_input` consumes the RFQ event (out-of-wire §8); no matching/ranking/award authored | **No** |
| **DG-4** | Operations — five performance-input events consumed | `ingest_performance_input` is the sole consumer/writer (out-of-wire §8 — R9); no Operations surface realized | **No** |
| **DG-5** | Admin — fraud triage; **ban decision is Admin-owned** | Fraud triage realized (§6); **Trust issues no ban**; ban bound to `Doc-4J` by pointer | **No** |
| **DG-6** | Communication — notification fan-out on Trust events | Trust emits to the outbox (R11); notification dispatch is Communication-authored; no notification surface realized | **No** |
| **DG-7** | Billing — **firewall** (no signal gated by commercial state) | Realized as the §3/R6 verbatim invariant; no Billing input on any wire | **No** |
| **DG-8** | Platform Core — audit / outbox / timers / UUIDv7 / human-ref / POLICY, consumed | Consumed via Doc-4B mechanisms by pointer; never re-implemented; no Core surface realized | **No** |
| `[ESC-TRUST-SLUG]` | A required staff action may lack a Doc-2 §7 slug | Interim binding to nearest existing staff slug by pointer; channel Doc-2 §7 additive; no slug invented | **No** |
| `[ESC-TRUST-AUDIT]` | Verification/tier transitions, fraud actions, admin-rating, ingestion rows not separately enumerated in Doc-2 §9 | Bound by pointer to nearest Doc-2 §9 action; interim; channel Doc-2 §9 additive | **No** |
| `[ESC-TRUST-POLICY]` | `trust.*` POLICY keys — **split by wire-reachability** | **(a) Wire-referenced** (idempotency dedup window, list page-size) — additive Doc-3 §12.2 `trust.*` patch (precedent `core.*` v1.0 / `rfq.*` v1.1 / `marketplace.*` v1.2; Doc-4A §18.2); referenced by intended name only, registration not implied. **(b) Out-of-wire** (score thresholds/weights, expiry/review windows — consumed only by §8 System mechanisms, never on the wire) — tracked finalization | **Structure: No. Content: YES for wire-referenced keys** (`CHK-5A-121` gate); out-of-wire keys **No** |

## Fences / Out of scope

Cross-module realization (owning module's Doc-5x — §1.x) · any other module's surface · resolving DG-1…DG-8 / `[ESC-TRUST-*]` · framework/DB/job-engine implementation (code/Doc-6) · giving any out-of-wire contract or mechanism a wire in any protocol (REST/SSE/WebSocket/Webhook/GraphQL) · authoring any matching/ranking/award (RFQ/Doc-4E — DG-3), ban decision (Admin/Doc-4J — DG-5), Marketplace tier write (Doc-4D — R8/DG-2), or Billing/commercial gate (Doc-4I — DG-7) · **putting any score value, formula, threshold, or weight on a wire or making a score caller-editable** · coining any endpoint/status/header/error-class/slug/POLICY key/event/score.

---

*End of Doc-5G Canonical Structure v1.0 (FROZEN) — structure only. On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt; score values/formulae bound by pointer, never on a wire. Authoring history + Hard Review disposition retained in `Doc-5G_Structure_Proposal_v0.1.md`. Independently verified at freeze: 40 = 34 caller-facing + 6 out-of-wire; SR-1 reconciled (`decide_verification` frozen; `approve_verification` absent from frozen Doc-4G). `[ESC-TRUST-POLICY]` wire-referenced keys + `reference_id` (C-05, §4) are content-freeze obligations. Next: content passes — Pass-1 (§0–§3 + inventory), Pass-2 (§4–§5), Pass-3 (§6–§9 + Appendix A) — each conforming to this structure.*

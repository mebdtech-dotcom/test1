# Journeys — RFQ Procurement Engine (M3)

**Breadcrumb:** [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) ▸ File D — RFQ Procurement Engine
**Status:** **DRAFT v1.0** — non-authoritative companion (atlas §0 stance applies in full)
**Date:** 2026-07-06
**Owner module:** M3 RFQ Procurement Engine (`rfq` · Doc-4E, Doc-3)
**Journeys:** J-MATCH · J-RINV · J-QUO · J-CMP · J-AWD
**Legend/notation:** atlas §2 · **Actor journeys composed:** `J-PROC` §4, `J-SUP` §6
(marketplace_ux.md — the buyer/vendor click-paths through these lifecycles)

> **Authority stance.** Non-authoritative companion. States resolve to **Doc-2 §5.4/§5.5 + §3**;
> operational semantics to **Doc-3** (eligibility, routing, validity clock, reopening); contracts
> to **Doc-4E** (Part1 lifecycle · Part2 matching · Part3 routing · Part4 quotation · Part5
> evaluation/award). The **moat rails** are binding on every journey here: the engine owns
> invitations (buyers never invite, Doc-3); comparison is read-only, System-generated and never
> recommends a winner (R6); no plan/payment state gates matching, eligibility or award (R7,
> Doc-3 §11.8); deferral is invisible to the buyer (Doc-3 §4.2); byte-equivalence for excluded
> vendors is absolute (Invariant #11). The buyer-side RFQ lifecycle itself (authoring → approval
> → closure) is narrated by `J-PROC` — not restated here. On any conflict the frozen corpus wins
> and this file is patched.

---

## D1. Matching & Routing Journey — `J-MATCH` (⚙ System)

**Breadcrumb:** Atlas ▸ Procurement ▸ Matching & Routing Journey

| Ownership | |
|---|---|
| Owner Module | M3 RFQ Engine (Doc-4E Part2 matching · Part3 routing) |
| Participating Modules | M2 (capability/category eligibility reads by service); M5 (governance signals read-only); M8 (routing-rule governance leg, Stage-gated) |
| Authoritative Documents | Doc-2 §5.4; Doc-3 §3–§5 (routing, throttling, deferral); Doc-4E Part2/Part3 |
| Read-only References | Doc-7F (buyer observability: routing log) |

**Actors:** ⚙ System (out-of-wire workers — the whole pipeline). Supporting — Admin
(`manage_routing_rule` / `assist_routing`, Stage-gated). **No buyer/vendor actor** — buyers never
invite.

**Intent arc:** Demand → Eligibility → Waves → Reach.
**Goal:** convert a moderated RFQ into governed vendor invitations — the platform moat.

**Entry:** RFQ `[matching]` (cleared moderation, `J-PROC-05`).
**Exit:** RFQ `[vendors_notified]`; invitations issued per wave (→ J-RINV).

```
RFQ [matching] → ⚙ gate-before-score eligibility → ⚙ scoring → ⚙ routing waves (throttled) →
invitations [selected]/[deferred] → deliveries → RFQ [vendors_notified]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2) | Outcome / governance |
|---|---|---|---|---|
| J-MATCH-01 | Gate | ⚙ eligibility gates (capability matrix, category, governance signals) | RFQ `[matching]` | **Gate-before-score**; capability = 4-flag matrix (Invariant #1); no plan gates (Doc-3 §11.8) |
| J-MATCH-02 | Score | ⚙ matching pipeline (Doc-4E Part2) | `[matching]` | **No single signal dominates** (§4 firewall); scoring internals never disclosed |
| J-MATCH-03 | Route | ⚙ routing waves + throttling (Doc-4E Part3; `throttle_window`) | invitations `[draft] → [selected]` / `[deferred]` | **Deferral invisible to buyer** (Doc-3 §4.2) |
| J-MATCH-04 | Deliver | ⚙ delivery per wave | invitation `→ [delivered]`; RFQ `→ [vendors_notified]` | `(VendorInvited)` fires **only at `[delivered]`** |
| J-MATCH-05 | Observe | `get_routing_log`, `list_invitations` (buyer) | — | Observability, never control (`J-PROC-07`) |
| J-MATCH-06 | Govern | `manage_routing_rule` / `assist_routing` (Admin, Stage-gated) | — | Rules governed in M8 policy space; engine executes (`J-ADM-05`) |

**Governance rails:** the engine owns invitations end-to-end — no journey step lets a buyer pick
or a vendor request an invitation; AI may only *suggest* inside M9 advisory panels (J-AI), never
decide (Invariant #12).
**Success:** ✔ invitations exist only via the pipeline; ✔ undelivered invitations created no
lead or visibility; ✔ routing log available to the buyer, internals sealed.

**Related:** upstream `J-PROC-05` (moderation) · downstream J-RINV, J-NTF (delivery fan-out) ·
composed by `J-PROC-06/07`.

---

## D2. RFQ Invitation Lifecycle — `J-RINV`

**Breadcrumb:** Atlas ▸ Procurement ▸ RFQ Invitation Lifecycle

| Ownership | |
|---|---|
| Owner Module | M3 RFQ Engine (`rfq_invitations`) |
| Participating Modules | M4 (lead auto-created on delivery, seam M6-2); M6 (delivery notification); M1 (grantee rows honor delegation, J-DEL) |
| Authoritative Documents | Doc-2 §3 (`rfq_invitations`, `rfq_invitation_grantees`); Doc-3 §4–§5; Doc-4E Part3 |
| Read-only References | Doc-7G (vendor inbox) |

**Actors:** ⚙ System (creation/delivery/expiry). Primary — vendor User (respond).

**Intent arc:** Invitation → Opportunity → Commitment (inherits `J-SUP`).
**Goal:** one governed invitation per (RFQ, vendor profile) — `UNIQUE(rfq_id,
vendor_profile_id)` — carrying the vendor's entire access to the RFQ.

**Entry:** routing wave selects the vendor (J-MATCH-03).
**Exit:** `[accepted]` (quote leg opens → J-QUO) — or `[declined]`/`[expired]`.

```
[draft] → [selected] → [deferred]* → [delivered] → [accepted] / [declined] / [expired]
(*throttle wave; invisible to buyer and vendor alike)
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-RINV-01 | Create | ⚙ pipeline output | `[draft] → [selected]` | Buyer-org head row; vendor side **exclusively via `rfq_invitation_grantees`** |
| J-RINV-02 | Defer | ⚙ throttle window | `[selected] → [deferred]` | Excluded from response-rate inputs; **never disclosed** |
| J-RINV-03 | Deliver | ⚙ delivery | `→ [delivered]` | `(VendorInvited)` fires here **only** → seam M6-2 (lead + notification); grantee rows materialized at delivery |
| J-RINV-04 | Receive | `get_invitation`, `list_invitations` (vendor) | `[delivered]` | **Received-only inbox** — vendors never see undelivered anything |
| J-RINV-05 | Respond | `respond_to_invitation` | `→ [accepted]` / `[declined]` | **Decline = no penalty**; formal decline recorded here, never as a quotation state (Doc-2 §5.5 guard) |
| J-RINV-06 | Expire | ⚙ window lapse | `→ [expired]` | Terminal |

**Governance rails:** byte-equivalence — an excluded/blacklisted vendor's experience is
byte-identical to a non-matched vendor's (no invitation, no trace); win-rate denominators use
received invitations only; delegation grant revocation removes grantee rows (J-DEL-07).
**Success:** ✔ one invitation per (rfq, vendor); ✔ lead/visibility only after `[delivered]`;
✔ response recorded without penalty semantics.

**Related:** upstream J-MATCH · downstream J-QUO (on accept), J-LEAD + J-NTF (seam M6-2) ·
composed by `J-SUP-01/02`.

---

## D3. Quotation Lifecycle — `J-QUO`

**Breadcrumb:** Atlas ▸ Procurement ▸ Quotation Lifecycle

| Ownership | |
|---|---|
| Owner Module | M3 RFQ Engine (`quotations`, Doc-4E Part4) |
| Participating Modules | M7 (submission quota vs entitlements, by pointer); M6 (clarification threads) |
| Authoritative Documents | Doc-2 §5.5; Doc-3 §5/§8 (windows, best-and-final, reopening); Doc-4E Part4 (§E7.2 revise · §E7.3 withdraw) |
| Read-only References | Doc-7G (7-step builder) · Doc-7F (buyer reads) |

**Actors:** Primary — vendor User (Controlling Org quota; acting representative allowed via
J-DEL). Supporting — buyer (reads, clarifications). ⚙ System — expiry.

**Intent arc:** Opportunity → Competition → Commitment (inherits `J-SUP`).
**Goal:** a versioned commercial offer whose **revisions are appends, never transitions**.

**Entry:** invitation `[accepted]` + RFQ pre-award with window open; active `rfq_version`.
**Exit:** terminal `[selected]` / `[not_selected]` / `[withdrawn]` / `[expired]`.

```
[draft] → submit → [submitted] ↦ revise (new quotation_version; prior superseded) …
   │                   ├─ withdraw → [withdrawn]
   │                   ├─ buyer selects → [selected]     ├─ rfq closes without selection → [not_selected]
   │                   └─ rfq cancelled/expired → [expired]
   └─ discard → (soft-deleted draft)
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §5.5) | Outcome / governance |
|---|---|---|---|---|
| J-QUO-01 | Draft | quotation builder (8 frozen submit fields) | `[draft]` | One-active-per-vendor-per-RFQ |
| J-QUO-02 | Submit | `submit_quotation` (against active `rfq_version`) | `[draft] → [submitted]` | Emits `(QuotationSubmitted)`; **quota consumed from the Controlling Organization** regardless of acting representative |
| J-QUO-03 | Revise | `rfq.revise_quotation.v1` | `[submitted] ↦ [submitted]` (new `quotation_version`) | Prior version **superseded, never overwritten**; **no domain event; no quota**; soft cap `POLICY quote.max_revisions` (beyond → clarification-thread justification) |
| J-QUO-04 | Clarify | `manage_clarification` (+ M6 thread → J-CHAT) | `[submitted]` | Buyer-driven reopen = best-and-final / window-reopen (Doc-3 §8.2/§8.5) |
| J-QUO-05 | Withdraw | `rfq.withdraw_quotation.v1` (or `request_late_extension`) | `→ [withdrawn]` | Terminal; emits `(QuotationWithdrawn)`; **counts as a response — no performance-score penalty**, but habitual late-withdrawal patterns feed Quote Quality / matching confidence (Doc-3 §8.3); the fully zero-effect action is formal decline (Doc-3 §8.4, J-RINV-05) |
| J-QUO-06 | Outcome | buyer awards / RFQ closes | `→ [selected]` / `[not_selected]` / `[expired]` | Vendor never sees competitor data or exclusion reasons (byte-equivalence) |

**Governance rails:** shortlisting is an **RFQ-level state** (`[shortlisted]`, Doc-2 §5.4) — the
quotation enum has no such state, and none is drawn; RFQ version immutability: once any quotation
exists against version X, X is immutable — edits create X+1 with a revision reason (Doc-2 §5.4
guard); visibility gated per invitation grants.
**Success:** ✔ every revision an append with reason; ✔ terminal state reached exactly once;
✔ quota accounting on Controlling Org.

**Related:** upstream J-RINV (accept) · buyer legs J-CMP, J-AWD · composed by `J-SUP-03/04/05`,
`J-PROC-08`.

---

## D4. Comparison & Evaluation Journey — `J-CMP`

**Breadcrumb:** Atlas ▸ Procurement ▸ Comparison & Evaluation Journey

| Ownership | |
|---|---|
| Owner Module | M3 RFQ Engine (Doc-4E Part5 evaluation/comparison) |
| Participating Modules | M6 (clarification threads); M5 signals display-only |
| Authoritative Documents | Doc-2 §5.4 (`[buyer_reviewing]`, `[shortlisted]`); Doc-4E Part5; Doc-7F §6 (comparison surface, R6) |
| Read-only References | Board Trust-Score display ruling (what signal columns may show) |

**Actors:** Primary — buyer User(s) (`«can_approve_vendor_selection»` for shortlist). ⚙ System —
comparison statement generation.

**Intent arc:** Comparison → Confidence → Decision (inherits `J-PROC`).
**Goal:** structured technical + commercial evaluation over received quotations — with the
platform constitutionally forbidden from recommending.

**Entry:** RFQ `[quotations_received]` (first quotation arrived).
**Exit:** RFQ `[shortlisted]` (→ J-AWD) — or closure without selection.

```
RFQ [quotations_received] → buyer opens comparison → [buyer_reviewing] → clarify (threads) →
technical + commercial review → shortlist → [shortlisted]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §5.4) | Outcome / governance |
|---|---|---|---|---|
| J-CMP-01 | Open | `get_comparison_statement` | `[quotations_received] → [buyer_reviewing]` | **Read-only, ⚙ System-generated, never recommends a winner** (R6) |
| J-CMP-02 | Review quotes | `get_quotation`, `list_quotations_for_rfq` | `[buyer_reviewing]` | Visibility-gated; vendor isolation |
| J-CMP-03 | Clarify | `manage_clarification` (+ M6 thread) | `[buyer_reviewing]` | May trigger best-and-final (J-QUO-04) |
| J-CMP-04 | Evaluate | technical / commercial review (buyer-internal) | `[buyer_reviewing]` | Trust/performance columns display within the Board ruling envelope only |
| J-CMP-05 | Shortlist | `shortlist_quotation` `«can_approve_vendor_selection»` | `→ [shortlisted]` | RFQ-level state; quotations unchanged |

**Governance rails:** no AI/UI element recommends-to-winner, ranks, or auto-selects (R6,
Invariant #12); comparison sheets never leak one vendor's data to another; buyer-private CRM
status may inform the buyer privately (J-CRM) but **never** mutates platform signals.
**Success:** ✔ evaluation complete with recommendation authored by the *buyer*, not the
platform; ✔ shortlist recorded under permission; ✔ zero recommendation artifacts.

**Related:** upstream J-QUO (submissions) · downstream J-AWD · composed by `J-PROC-09/10/11`.

---

## D5. Award Journey — `J-AWD`

**Breadcrumb:** Atlas ▸ Procurement ▸ Award Journey

| Ownership | |
|---|---|
| Owner Module | M3 RFQ Engine (Doc-4E Part5 award) |
| Participating Modules | M4 (engagement created from `(RFQClosedWon)`, seam M6-1); M5 (performance inputs); M1 (award-threshold approval chain, Doc-4C §C11) |
| Authoritative Documents | Doc-2 §5.4/§5.5; Doc-3 §9 (award governance, §9.4 threshold); Doc-4E Part5 |
| Read-only References | Doc-7F §6 |

**Actors:** Primary — buyer User (award authority per workflow settings). ⚙ System — engagement
creation (consumer side).

**Intent arc:** Decision → Commitment → Handover (inherits `J-PROC`).
**Goal:** one explicit, unranked, 1:1 award — and a clean handover into operations.

**Entry:** RFQ `[shortlisted]`.
**Exit:** RFQ `[closed_won]` + engagement `[open]` (J-ENG) — or `[closed_lost]`.

```
RFQ [shortlisted] → award (threshold approval) → quotation [selected] · RFQ [closed_won] →
(RFQClosedWon) → M4 creates engagement [open]              — or → close lost → [closed_lost]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2) | Outcome / governance |
|---|---|---|---|---|
| J-AWD-01 | Approve | award-threshold approval per workflow settings (Doc-3 §9.4; `J-ORG-04` config) | RFQ `[shortlisted]` | Governed by the buyer's own chain |
| J-AWD-02 | Award | `award_rfq` | quotation `→ [selected]`; RFQ `→ [closed_won]` | **Explicit, unranked, 1:1, never auto-recommended**; emits `(QuotationSelected)`; deal value recorded (transaction intelligence) |
| J-AWD-03 | Notify losers | ⚙ closure fan-out | other quotations `→ [not_selected]` | Uniform closure; non-penalizing; no exclusion reasons disclosed |
| J-AWD-04 | Hand over | `(RFQClosedWon)` → seam M6-1 | engagement `[open]` (M4) | **No "vendor accepts award" state exists — never draw one**; M4 creates directly |
| J-AWD-05 | Or close lost | `close_lost_rfq` | RFQ `→ [closed_lost]` | Emits `(RFQClosedLost)`; clean, uniform, non-penalizing |

**Governance rails:** split sourcing = `reissue_rfq`, **never multi-award**; `[closed_won]` also
triggers performance inputs (J-PSC) — by event, not by write; payment/entitlement never
influenced the decision (R7).
**Success:** ✔ exactly one `[selected]` quotation on a won RFQ; ✔ engagement exists before any
post-award document; ✔ audit complete.

**Related:** upstream J-CMP · downstream J-ENG (M6-1), J-PSC (inputs), J-DOC (documents) ·
composed by `J-PROC-12/12b`.

---

## Not Covered (File D ledger)

| Item | Why | Pointer |
|---|---|---|
| RFQ authoring / internal approval / cancellation legs | Owned by `J-PROC-02…05` (marketplace_ux.md §4) — not restated | Doc-2 §5.4; `J-PROC` |
| `ASSUMPTION A-05` (`estimated_value` mandatory at submit) | Carried where it lives — RFQ submission (`J-PROC-03`), not a lifecycle here | Doc-2 §5.4 guard |
| Public RFQ board | Does not exist — no anonymous RFQ visibility (Doc-3 §5.1) | marketplace_ux.md §2 rails |
| Buyer-side supplier discovery / shortlisting pre-RFQ | Presentation-layer discovery inside `J-PROC-01`; buyer-invite concept is Board-gated (ESC-VENDIR R4) | esc_registry.md |

*Cross-links:* actor journeys [`../marketplace_ux.md`](../marketplace_ux.md) §4 (`J-PROC`), §6
(`J-SUP`) · registry [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) §5-D.

*Non-authoritative; coins nothing; on conflict the frozen corpus wins (CLAUDE.md §7/§11).*

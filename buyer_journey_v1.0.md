> **STATUS — v1.0 · 2026-07-06 · FROZEN for implementation (owner, 2026-07-06).** Only Decision
> Register items remain open; any status change edits the **Decision Register only**, never the
> body. Buyer Journey Map + Gap-Closure Plan. **NON-AUTHORITATIVE companion** — conforms to FROZEN **Doc-7F** (Buyer Workspace) · **Doc-4M** (state index; engagement
> rows carried as the §0.1 Flag-and-Halt of `buyer_planning_and_design.md`) · **Doc-3** (RFQ engine
> operational spec) · **Doc-5E/5F/5D** (buyer-leg contracts) and to the consolidated companion
> **`buyer_planning_and_design.md` v1.1** (J-PROC / P-BUY / state→screen source). **Coins nothing** —
> every stage, state, page key, contract slug, and POLICY key below is bound **by pointer**; genuine
> gaps are carried as ESC-class items, never papered over. **PLANNING + STATUS ONLY** — no code, no
> roadmap reorder, no build authorization. On any conflict a frozen document wins (CLAUDE.md §7/§11).

# iVendorz — Buyer Journey v1.0 (Journey Map · Gap Register · Roadmap)

**What this document is.** The single artifact that ties **journey stage → primary actor → frozen
Doc-4M state → P-BUY page → built route → status → success criterion** together for the Buyer
Workspace, plus the honest register of what remains unbuilt and *why*. The journey model itself is
**J-PROC-01…14** (`buyer_planning_and_design.md` §5.1, conforming to Doc-7F FR1); this document adds
the **as-built** binding (FE-BUY-01…10 all ✅ complete, `project-management/fe-program-wbs.md`) and
the gap-closure plan.

- **Part A** — the buyer journey map as built today (spine, hand-off, guardrails, decision points,
  exception flows, proposed KPIs, carried open items).
- **Part B** — the gap-closure implementation plan (only what is corpus-grounded and buildable now).
- **Part C** — the future roadmap: reserved surfaces that require an **additive contract read
  (ESC-class)** or an owner/Board decision before any build.

---

## Part A — Buyer Journey Map (current state)

### A.1 The journey spine

One row per J-PROC stage (§5.1 of `buyer_planning_and_design.md`). **Actor** = the driver of the
stage's state transition per the §5.2 State→Screen map (System-driven states are observe-only on
the buyer leg). **Status:** ✅ Built · ⚙ System (no buyer screen to build — displayed, never
invoked) · 🧩 Composed (reuses another surface). Routes are the shipped `app/(app)/(buyer)/` routes
(illustrative routing vocabulary over opaque UUIDs — §2.2 caveat of the companion).

| # | Stage (J-PROC) | Actor | Doc-4M state(s) | P-BUY page(s) | Built route | Status | Success criterion (stage outcome) |
|---|---|---|---|---|---|---|---|
| 01 | Sourcing / discovery | Buyer | *(none yet)* | P-BUY-02/03/04/05 | `/discover` (02 ✅; 03 ♻ superseded-reuse; 04 = link-out to public `/vendors/[slug]`; 05 🅿 held) | ✅ / 🅿 | Candidate vendors/products identified; intent formed (no invitation sent — engine-only) |
| 02 | Author the RFQ | Buyer | `draft` | P-BUY-07 | `/rfqs/new` (wizard) | ✅ | Complete, resumable draft persisted via contract (`create_rfq` → `update_rfq`) |
| 03 | Submit | Buyer | `draft` → `pending_internal_approval` \| `submitted` | P-BUY-07/08 | wizard submit step | ✅ | RFQ successfully submitted (idempotent; only the machine-permitted action offered, GI-10) |
| 04 | Internal spend approval | Buyer-approver | `pending_internal_approval` | P-BUY-12 | `/approvals` | ✅ | Spend authorized (`approve_rfq` → `submitted`) or rejected with mandatory reason → `draft` |
| 05 | Moderation | System/Admin | `submitted` → `under_review` | P-BUY-08 (chip) | `/rfqs/[rfqId]` | ⚙ | RFQ passes moderation → `matching` (reject → `draft` for normal resubmission) |
| 06 | Match & route | System | `matching` → `vendors_notified` | P-BUY-08 (chip) | `/rfqs/[rfqId]` | ⚙ | Engine dispatches invitations per governed routing (buyer never invokes/dispatches) |
| 07 | Observe routing | Buyer (read-only) | `vendors_notified` | P-BUY-13/10 | `/rfqs/[rfqId]/routing` + activity tab | ✅ | RFQ confirmed live and reaching suppliers (positive facts only; deferral/exclusion invisible) |
| 08 | Quotations arrive | Vendor (System transition) | → `quotations_received` | P-BUY-09/14 | `/rfqs/[rfqId]` quotations tab · `/rfqs/[rfqId]/quotations/[quotationId]` | ✅ | Disclosed quotations received and readable (server-gated `quotation_visibility`) |
| 09 | Compare | Buyer | `buyer_reviewing` | P-BUY-15 | `/rfqs/[rfqId]/compare` | ✅ | Comparison completed over the System-generated statement (read-only; buyer-chosen sort; **no recommendation**) |
| 10 | Clarify / best-and-final | Buyer ↔ Vendor | `buyer_reviewing` | P-BUY-16 | `/rfqs/[rfqId]/clarifications` | ✅ | Open questions resolved; optional `invoke_best_and_final` round closed (POLICY `eval.baf_rounds_max`) |
| 11 | Shortlist | Buyer | → `shortlisted` | P-BUY-14 (action) | quotation detail → `shortlist_quotation` | ✅ | Finalists marked (soft-cap POLICY `eval.shortlist_max`) |
| 12 | Award | Buyer | `shortlisted` → `closed_won` | P-BUY-17 | `/rfqs/[rfqId]/award` | ✅ | Exactly **one** vendor selected — explicit, unranked, 1:1, gated `can_award_rfq`; engagement System-created at `open` |
| 12b | Close lost | Buyer | → `closed_lost` | P-BUY-18 | `/rfqs/[rfqId]/close-lost` | ✅ | RFQ closed cleanly and **non-penalizingly** (Doc-3 §9.5) |
| 13 | Post-award operations | Buyer ↔ Vendor ↔ System | engagement `open → in_delivery → completed → closed` *(Doc-4F/Doc-2 §3.5 reading; §0.1 F&H pending)* | P-BUY-19…25 | `/engagements`, `/engagements/[id]` + `/po` · `/trade-invoice` · `/payments` · `/challan` · `/wcc` (**LOI view missing — Part B WP-1**) | ✅ (LOI gap) | Procurement closed: docs issued/read, payments **recorded** (never settled, R8), engagement `closed` |
| 14 | Private CRM | Buyer | *(none — CRM record)* | P-BUY-26/27 | `/crm`, `/crm/[recordId]` | ✅ | Private vendor record captured (status/notes/rating/approved/blacklist) — never leaks (Inv #11) |

Supporting surfaces outside the linear spine, all ✅ built: **Dashboard** P-BUY-01 `/dashboard`
(KPIs, sourcing + engagement pipelines, work queue, activity) · **RFQ list** P-BUY-06 `/rfqs`
(`?state=draft` / `?state=closed` facets over frozen Doc-4M states) · **Version history** P-BUY-11
`/rfqs/[rfqId]/versions` (Inv #8) · **Documents hub** P-DOC-01 `/documents` · **Notifications**
`/notifications` · Team/Organization/Profile/Settings (🧩 composed from the unmodified Account
views inside the persistent buyer shell — BX-04/05).

### A.2 Public → authenticated hand-off

Anonymous discovery feeds J-PROC-01 before sign-in: `/` · `/marketplace` (+ category/product) ·
`/vendors` · `/vendors/[slug]` (full microsite) · `/categories` · `/search` under `app/(public)/`.
The public surface carries **no buyer-private concept** (Inv #11 — CRM status, approved/blacklist,
and exclusion facts never render there). P-BUY-04 (in-app vendor profile) resolved as a
**link-out to the public microsite** (FE-BUY-10 owner ruling) — one vendor-profile surface, no fork.

### A.3 Guardrails register (pointers — the load-bearing rules every stage obeys)

| Rail | Rule | Anchor |
|---|---|---|
| Engine-only dispatch | The buyer **never invokes matching/routing and never sends an invitation**; the engine dispatches. There is **no invite/dispatch control anywhere** in the buyer nav (a documented LOAD-BEARING ABSENCE). | Doc-7F Pass-2 §4.2 · FR9 · `buyer-nav-model.ts` header · `[ESC-7-7F-INVITE]` carried |
| R6 — no recommendation | Comparison is decision *support*: no recommended/best-value cue, no default winner, no rank-to-winner; award is explicit, unranked, 1:1. AI may explain, never select. | Doc-5E R6 · Doc-3 §9.1/§9.4 · companion §6.1 |
| R7 — payment firewall | No plan/payment/entitlement value ever gates matching, eligibility, scores, or display; every displayed figure is a contract read. | Doc-5E R7 · companion §6.3 |
| R8 — money boundary | Post-award docs and payments are **records/workflow only** — no settlement, escrow, wallet, or funds custody; trade invoice ≠ platform billing invoice (DF-6). | Doc-5F R8 · Doc-4F §F5.5 · companion §6.4 |
| Inv #11 — private exclusion | CRM status/blacklist renders only in the buyer's own workspace (+ buyer-private comparison columns); blacklist is **undetectable** — byte-equivalent vendor experience; deferral/exclusion never shown on routing. | Invariant #11 · Doc-5F R5 · Doc-3 §4.2 · companion §6.5 |
| Inv #5 / #8 / #9 | Server-resolved active org (client org ID never trusted) · versioned-never-overwritten records · presentation never re-ranks the governed matching order (GI-04). | companion §6.6, §5.2 |

### A.4 Decision points (the real branches — and two that are constraints, not branches)

Grounded branches (companion §5.1/§7/§8, Doc-4M):

1. **Submit path:** `submit_rfq` → `pending_internal_approval`, or directly → `submitted` when the
   officer holds `can_approve_rfq` (self-approve path).
2. **Internal approval:** `approve_rfq` → `submitted` · `reject_internal_rfq` (mandatory reason) →
   `draft` redraft loop · requester `cancel_rfq` (audited) → `cancelled`. No auto-approve timeout.
3. **Moderation:** pass → `matching` · reject (reason) → `draft` — a normal resubmission, not a dead end.
4. **Evaluate:** proceed to shortlist vs run clarification / `invoke_best_and_final` (one round,
   POLICY-capped, sealed, visible to **all** invitees — no private extensions).
5. **Resolve:** `award_rfq` → `closed_won` (threshold-approval sub-gate when value exceeds the org's
   configured award threshold, Doc-3 §9.4) **vs** `close_lost_rfq` → `closed_lost`.
6. **Discovery outcome:** research informs the RFQ (reference), or the buyer simply contacts a vendor
   off-platform — there is **no "marketplace purchase" path**: the platform never handles
   buyer↔vendor transaction money.

Constraints the corpus settles as **not** branches:

- **"Invite specific vendors vs automatic matching"** — not a branch. Routing is engine-only;
  whether discovery may ever express *candidate intent* is the carried `[ESC-7-7F-INVITE]`
  Flag-and-Halt (companion §0.3) — until the Board rules, no such control exists.
- **"Single vs multiple award"** — not a branch. Award is 1:1; **split sourcing = `reissue_rfq`**,
  never multi-award (Doc-3 §9.4).
- **"Cancel vs re-open"** — cancel exists (`cancel_rfq`, audited, cascade to `expired` in the same
  transaction); **re-open does not**: terminals never reopen (Doc-3 §1.6); the only forward path is
  `reissue_rfq`, a fresh `draft` linked to the source (Doc-4E §E4.7).

### A.5 Exception flows (major failure paths — all grounded in companion §7)

| Exception | What happens (state · behavior) | Buyer's recovery |
|---|---|---|
| **No quotations received** | RFQ holds in `vendors_notified`; invisible replenishment waves fire first (POLICY `distribution.replenish_check_hours`); if exhausted, System `expire_rfq` → `expired`. Empty copy: "No quotations yet" — never implies exclusion. | `reissue_rfq` |
| **Vendor declines invitation** | No RFQ state change, no vendor penalty (Doc-3 §8.4); engine may replenish invisibly. Buyer never sees "vendor X declined because…". | none needed — observe |
| **Vendor withdraws quotation** | Quotation → `withdrawn`, zero penalty (Doc-3 §8.3); after shortlisting, triggers a buyer alert + optional replenishment. | award a remaining finalist or `close_lost_rfq` |
| **RFQ expires** | System `expire_rfq` → `expired` (terminal); open quotations + invitations cascade → `expired` in the same transaction. | `reissue_rfq` |
| **Amendment needed** | RFQs are versioned, never overwritten (Inv #8): rejected/moderation-failed RFQs return to `draft` for edit + resubmit; history at `/rfqs/[rfqId]/versions` (P-BUY-11). Late-vendor window extension reopens for **all** un-responded invitees (Doc-3 §8.5, POLICY `quote.late_extension_max_days`). | edit draft → `submit_rfq` |
| **RFQ cancelled** | `cancel_rfq` (audited reason) → `cancelled` (terminal), cascade as above. | `reissue_rfq` |
| **Post-award dispute** | Not an engagement state: trade-invoice `→ disputed` via `update_trade_invoice_status`, emitting `DisputeRecorded` (Trust input). Engagement lifecycle unaffected; no money moves (R8). *(Doc-4M divergence carried — §0.1.)* | resolve via records; status transitions on the trade invoice |

### A.6 Journey KPIs (proposed — non-authoritative)

Per-stage measurement definitions for the future Reports scope (Part C). **Proposed only**: nothing
here coins a metric into the corpus, and R7 applies — every figure must ultimately be a contract
read, never client-computed.

| KPI | Definition (stage window) |
|---|---|
| Time to first quotation | `submit_rfq` accepted → first quotation `submitted` (J-PROC-03 → 08) |
| Quotations received per RFQ | count of disclosed quotations at comparison time (J-PROC-08) |
| Comparison completion time | RFQ enters `buyer_reviewing` → `shortlist_quotation` (J-PROC-09 → 11) |
| RFQ cycle time | `create_rfq` → terminal state (`closed_won`/`closed_lost`/`expired`/`cancelled`) |
| Award rate | `closed_won` ÷ all terminal RFQs (a buyer-org metric — never a vendor-facing signal) |

### A.7 Carried open items (flagged, never resolved here)

1. **`[ESC-7-7F-INVITE]`** — form of buyer candidate-targeting in discovery (Doc-7F internal
   tension, companion §0.3). Board-gated.
2. **Engagement state-set divergence** — Doc-4M (`active/completed/disputed/terminated`) vs
   Doc-4F/Doc-2 §3.5 (`open → in_delivery → completed → closed`, the adopted contract-authority
   reading). Companion §0.1; P-BUY-20 state-chip enum finalizes only after reconciliation.
3. **P-BUY-05 Favorites hold** — scope owner-confirmed as product/category (`catalog_favorites`);
   projection gap unresolved; held out of FE-BUY-10 (WBS row, RV-0117).

---

## Part B — Gap-Closure Implementation Plan (corpus-grounded, buildable now)

Scope discipline: during anchor verification, **every one of the six reserved sidebar routes turned
out to carry a recorded "no frozen read exists" rationale in its `page.tsx` header** (BX-04) — they
are ESC-class contract gaps, not merely unbuilt pages, and are therefore listed in **Part C**, not
here. Only work that is grounded in existing frozen contracts appears below. All work is
**presentation-only** (seed-driven, wiring PARKED), follows the FE-PM lane
**Dev → Review-A (Team-4) → Review-B (Team-5) → Board**, and the checkpoint + milestone-close
commit policy (never push).

### WP-1 — Buyer LOI document view *(the one clean, buildable gap)*

- **Gap:** P-BUY-21 is "**PO / LOI**" (one `engagement_documents` family), and `loi` is a frozen
  `doc_kind` (Doc-4F §F5.8: `loi|po|challan|wcc|…`) — but the built buyer view pins
  `doc_kind = po` only (`purchase-order-view-models.ts`); no buyer LOI route exists. The vendor
  workspace (M7) already renders LOI; the buyer Documents hub already labels an LOI facet.
- **Build:** `/engagements/[engagementId]/loi` as a sibling of `/po`, reusing the existing
  engagement doc-view pattern (`purchase-order-view.tsx`, `engagement-document-file-card.tsx`,
  the shared view-model shape pinned to `doc_kind = loi`), same issue/revise/read contract family
  by pointer (`issue_engagement_document` · `revise_engagement_document` ·
  `get_engagement_document`), versioned, 202-then-poll semantics as already documented on the PO
  view. Link it from the P-BUY-20 Documents tab and the `/documents` hub LOI facet.
- **Guardrails:** R8 copy (record, never settlement) · Inv #8 (versioned, never overwritten) ·
  frozen `doc_kind` enum only — nothing coined.
- **Estimate:** S (one route + one view over an existing pattern). No new page ID needed if ruled
  within P-BUY-21's existing ownership (FE-BUY-07 scope) — confirm at WP kickoff; if a new P-DOC/P-BUY
  key is required instead, that is a WBS mint → owner gate.
- **Status:** **Approved by owner 2026-07-06 → Team-2** (see the Decision Register).

### WP-2 — "Compare Quotes" navigation adapter *(owner decision required before build)*

- **Situation:** `/quotations/compare` is reserved; the frozen comparison read
  (`get_comparison_statement`) is **per-RFQ**, and the BX-04 header deliberately declined to build
  a picker ("reserves the nav destination without fabricating a picker or comparison logic").
- **Option on the table:** a pure **navigation adapter** — list the buyer's own RFQs via the frozen
  `list_rfqs` read (states where comparison exists) and route into the already-built
  `/rfqs/[rfqId]/compare`. No new read, no comparison logic, no cross-RFQ merge — navigation over
  existing contracts only.
- **Why gated anyway:** BX-04's recorded rationale explicitly declined this shape; reversing a
  recorded owner-directed disposition is an owner call, not a dev call (Raise ≠ Accept). **Deliverable
  if approved:** S-size build; **if declined:** the placeholder stands as designed.

**Sequencing:** WP-1 first (unconditional), WP-2 only on owner ruling. Nothing else in the buyer
tree is buildable without an additive contract (Part C).

---

## Part C — Future Roadmap (gated capabilities — kept out of current scope)

Each reserved surface below already holds its route via `ImplementationPendingView` with a recorded
grounding note (its `page.tsx` header). The gate that opens each is an **additive contract read
(ESC-class registration → API-Gov/Board)** or an owner ruling — never fabrication. New page IDs
would move the 150-page coverage invariant → owner-gated WBS mint.

| Surface (route) | What's missing (recorded rationale) | Gate to open it |
|---|---|---|
| **Received Quotes** `/quotations` | No cross-RFQ quotation list read in the corpus (quotations exist only per-RFQ via `list_quotations_for_rfq` / `get_quotation`). | Additive buyer-wide read — ESC-class |
| **Purchase Orders** `/purchase-orders` (`?status=active\|history`) | No cross-engagement "all my POs" list read (PO is per-engagement, P-BUY-21). | Additive cross-engagement read — ESC-class |
| **Messages** `/messages` | M6 exposes only per-RFQ clarification threads; no unified-inbox read. | Additive M6 read — ESC-class |
| **Reports & Analytics** `/reports` | Only analytics surface is the per-RFQ comparison statement; no org-wide reporting reads. Every figure must be a contract read (R7). | Additive reporting reads — ESC-class (KPI candidates: §A.6) |
| **Saved Vendors** `/saved-vendors` | No vendor-saving read anywhere; explicitly distinct from P-BUY-05 Favorites (product/category only, owner ruling) and from Vendor CRM (Inv #11). | Additive concept + read — ESC-class |
| **Specification Library** `/spec-library` | Buyer-facing spec library has no corpus concept (exists only vendor-side; never repurposed across the workspace boundary). | Additive concept + read — ESC-class |
| **Favorites** (P-BUY-05) | Frozen contract exists (`catalog_favorites`, product/category) but the projection gap is unresolved — held at FE-BUY-10 (🅿). | Projection-gap resolution → un-hold |
| **Buyer candidate-targeting** | `[ESC-7-7F-INVITE]` — Doc-7F internal tension on discovery "to invite". | Human Board ruling |

**KPI dependency note:** the §A.6 journey KPIs land inside `/reports` when its reads exist — the
KPI definitions travel with that ESC intake, keeping vision (Part C) separate from scope (Part B).

---

## Decision Register (as of 2026-07-06 — owner-ratified)

The one table to read months from now. Statuses: **Approved** (build authorized) ·
**Owner Decision** (awaiting a product ruling) · **ESC Required** (needs an additive contract
intake before any build) · **Future** (deferred vision — no intake opened) · **Hold** (explicitly
held with a recorded reason). Update this register — never the body — when a status changes.

| Item | Status | Owner |
|---|---|---|
| WP-1 Buyer LOI View | ✅ **CLOSED** (2026-07-06 — built, Review-A PASS r3 ∧ Review-B PASS ×2 concordant @ `1ce722a`, RV-0140; WP card: `governanceReviews/milestones/wp-1-buyer-loi-view/`) | Team-2 |
| WP-2 Compare Picker | **Held** (owner, 2026-07-06) behind the product freeze `productSpec/COMPARE_SHEET_UX_FREEZE_v0.1.md` — D1 RULED (side-by-side min 2 / max 5, a UI selection limit only, not a business rule; absent/invalid selection renders the full statement unchanged); D2–D7 await owner sign-off → v1.0 un-gates implementation | Product → Team-2 |
| Received Quotes (`/quotations`) | ESC Required — **intake opened** (`ESC-BUY-QUOTES-LIST`, BOARD-PACKET-BUYER-FE-CONTRACT-GAPS_v1.0) | Board |
| Purchase Orders (`/purchase-orders`) | ESC Required — **intake opened** (`ESC-BUY-PO-LIST`, same packet) | Board |
| Messages (`/messages`) | Future — **intake opened** (`ESC-BUY-MSG-INBOX`, same packet) | Board |
| Reports (`/reports`) | Future — **intake opened** (`ESC-BUY-REPORTS`, same packet) | Board |
| Saved Vendors (`/saved-vendors`) | Hold — **intake opened** (`ESC-BUY-SAVED-VENDORS`, same packet) | Board |
| Spec Library (`/spec-library`) | Future — **intake opened** (`ESC-BUY-SPEC-LIB`, same packet) | Board |
| P-BUY-05 Favorites (projection gap) | Hold (FE-BUY-10, RV-0117) | Board |
| Buyer candidate-targeting `[ESC-7-7F-INVITE]` | Carried Flag-and-Halt | Board (human) |

---

*Verification log: every J-PROC-xx, P-BUY-xx, Doc-4M state slug, contract slug, POLICY key, and
route cited above was grep-confirmed against `buyer_planning_and_design.md`, the frozen corpus
pointers it carries, `app/(app)/(buyer)/` (routes + page headers), and
`project-management/fe-program-wbs.md` at authoring time (2026-07-06). Zero invented identifiers.*

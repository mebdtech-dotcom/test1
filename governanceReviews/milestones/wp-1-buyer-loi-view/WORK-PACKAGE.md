# WORK PACKAGE — WP-1 Buyer LOI Document View

> Owner-approved 2026-07-06 via the `buyer_journey_v1.0.md` Decision Register ("WP-1 Buyer LOI
> View — **Approved** → Team-2"). Not an FE-\* WBS mint: this WP realizes a recorded gap inside an
> already-owned page key (see the kickoff determination below). Card follows `review-process.md` §7.

- **Lane:** G (contract-grounded document family · R8 money-boundary copy · Inv #11 non-disclosure
  collapse — full Dev → Review-A → Review-B per the journey doc's own "normal Dev→A→B→Board lane")
- **Reviewed-SHA record:** 🔵A submitted 2026-07-06 at checkpoint `c382d44` (stable target — the
  commit, not the concurrently-dirty working tree; parallel FE-RFQ-WF commit `2371675` verified
  disjoint by file list)
- **In scope (the delta, concretely):**
  1. New route `app/(app)/(buyer)/engagements/[engagementId]/loi/` — `page.tsx` (server page +
     presentation mock keyed on opaque engagement id, `notFound()` collapse), `loi-view.tsx`
     (host view), `not-found.tsx` (byte-identical genuine-absence boundary), `loading.tsx`
     (SK-DETAIL skeleton) — sibling of the built `/po` view, same shape.
  2. New `app/(app)/(buyer)/_components/loi-view-models.ts` — the `get_engagement_document`
     projection pinned to `doc_kind = "loi"` (frozen enum member, Doc-4F §F5.4/§F5.8), mirroring
     `purchase-order-view-models.ts` **minus** `canApprovePo` (see guardrail 3).
  3. Link wiring (the two surfaces WP-1 names):
     `engagement-detail-view.tsx` (P-BUY-20) `documentLinks()` gains "Letter of intent" → `/loi`
     (listed first — LOI precedes PO in issuance order); `documents/documents-hub-view.tsx`
     `engagementDocLinks()` gains `{ id: "loi", kindKey: "loi" }` with **no `stageKey`** (the
     LifecycleStrip deliberately excludes LOI — its own header comment: "LOI and WCC … stay
     reachable via the Document Type facet and the per-engagement links").
  4. Comment-truthfulness sweep across the buyer tree for route-count claims falsified by the new
     sixth route (the FE-DOC-02 failure class): `_components/engagement-detail-view-models.ts`
     *(round 1 — omitted from this list at first writing; Review-A finding 3, card patched)*, and —
     per Review-A round-1 findings 1/2/7 — `_components/documents-hub-view-models.ts`,
     `_components/engagement-document-file-card.tsx` (consumer enumeration), and ONE scoped
     comment-only exception on the vendor track (see the round-1 disposition below).
- **Out of scope (creep against this list is a Review-A finding):** WP-2 compare picker (owner
  decision pending) · the six ESC-class reserved buyer routes · any vendor-track (`workspace/`)
  file · any `list_engagement_documents` enumeration (`ESC-7G-ENG-03` stays ungrounded) · any
  LifecycleStrip/stage change · any new kit primitive · any approval affordance on the LOI · the
  concurrent uncommitted RFQ-workflow work present in the tree (not this WP's; never staged here).
- **Dependencies:** H: none (all contracts frozen; pattern components exist) · S: none. No
  `esc_registry.md` gate handle applies; `ESC-7G-ENG-03` is referenced as a non-dependency
  (single-doc reach only, same posture as the PO view).
- **Lifecycle ownership:** Builder = Team-2 · Maintainer = Team-2 (buyer track) · Review A =
  Team-4 lane · Review B = Team-5 lane · Board = owner.
- **Key dates:** created 2026-07-06 (kickoff) / started 2026-07-06 / closed —
- **Owner directive (2026-07-06, live):** "no backend now" — reconfirms the presentation-only
  constraint mid-build. Honored: mock-driven only, no wiring, no server data layer, no contract
  code; GI-02 stays PARKED (Wave 4).
- **DoD confirmation:** _§6 checklist checked at close_

## Kickoff determination — page-key ownership (the journey doc's "confirm at WP kickoff" item)

**Ruled within P-BUY-21's existing ownership — no new page ID, no WBS mint, no owner gate.**
Evidence: `buyer_planning_and_design.md` (Board-adjudicated companion) line 118 records the screen
key as `doc: PO / LOI → P-BUY-21 T-DETAILS issue_engagement_document · revise_engagement_document`
— one key for the engagement-document family face; §"Engagement-detail tab set" repeats "drills to
PO/LOI (P-BUY-21)". `page_inventory.md` row 201's short label "Purchase order" names the same key,
it does not narrow it. The LOI route is a second `T-DETAILS` face of P-BUY-21 over the same frozen
contract family, so the 150-page coverage invariant is untouched (no ownership change →
`verify-fe-wbs-coverage.mjs` still PASS trivially; run anyway at gate time). Had a new P-DOC/P-BUY
key been required, that would be a WBS mint → owner gate — it is not.

*Corrections (Review-A round 1, findings 4/8):* the coverage universe is **151** (WBS v1.3 /
P-PUB-25 mint, 2026-07-04), not 150 as first written — `scripts/verify-fe-wbs-coverage.mjs`
re-run PASS **151/151**, conclusion unchanged (no mint, invariant untouched). The
`page_inventory.md` "Purchase order" row for P-BUY-21 is **line 202** (201 is P-BUY-20).

## Contract grounding (verified against the frozen corpus at kickoff, not assumed)

- `Doc-4F_PassB_Part2_BC-OPS-2_FROZEN.md` §F5.4 request schema: `doc_kind : enum<loi|po|wcc>` on
  `ops.issue_engagement_document.v1` / `ops.revise_engagement_document.v1` — `loi` is frozen.
- Same doc, `ops.get_engagement_document.v1` request: optional
  `doc_kind : enum<loi|po|challan|wcc|trade_invoice|payment_record>`; response projects exactly
  `document : { document_id, doc_kind, human_ref, version_no, is_active_revision, storage_ref }` +
  `reference_id`. The view-model carries ONLY these fields.
- Validation matrix: `can_approve_po` is required **for `doc_kind = po` financial approval only**
  (distinct slug). **No LOI approval slug exists** → the LOI view renders NO approval affordance
  (modelling one would coin an authorization concept — deliberately absent, commented in-file).
- Event binding: LOI issuance/revision emit **no operations event** (H.7 — state + audit only);
  irrelevant to presentation but recorded so nobody "adds the missing event chip" later.

## Guardrails (WP-1 text, binding)

1. **R8 / DF-6 money boundary** — LOI copy states record-only, never settlement; no
   pay/settle/escrow affordance.
2. **Inv #8** — versioned, never overwritten; `version_no` + `is_active_revision` are the stamps.
3. **Frozen `doc_kind` only** — pinned `"loi"`; nothing coined (no approval slug, no body fields,
   no monetary total — `content_jsonb` is dev-doc scope, not a projected read field).
4. **Inv #11 / GI-12 / H.9** — unknown/absent LOI and non-party engagement collapse to the same
   `notFound()` → byte-identical `not-found.tsx`; no tell.
5. **202-then-poll semantics** as already documented on the PO view (issue/revise are async
   commands; presentation-only here, wiring PARKED to Wave 4).

## Review-A round 1 — verdict REVISION (2026-07-06, at `c382d44`) · author disposition (§13 gate)

10 findings (0 BLOCKER · 0 MAJOR · 4 MINOR · 5 NIT · 1 OBS), all comment/claim-truthfulness or
card-accuracy class, zero behavioral. Every finding adjudicated through the four-question
Validate-Findings gate; all ten ACCEPTED (valid + applicable + best + consistent):

| # | Sev | Finding (short) | Disposition |
|---|---|---|---|
| 1 | MINOR | `documents-hub-view-models.ts:9` stale "five fixed" | FIXED — five→six + LOI face |
| 2 | MINOR | vendor `documents-hub-view.tsx:64` "five" claim falsified by this WP | FIXED via **scoped comment-only exception** to the "no vendor-track file" out-of-scope rule: the falsehood was CREATED by this WP's own change; a one-line count correction, zero behavior, zero vendor semantics touched (FE-VEN-11 pure-comment-patch precedent). Team-3 informed via this record. |
| 3 | MINOR | WP card in-scope list omitted the 9th file | FIXED — card §In-scope item 4 added |
| 4 | MINOR | Card cited 150-universe; actual 151 since 2026-07-04 | FIXED — correction block added; verify re-run PASS 151/151 |
| 5 | NIT | "carries ONLY those fields" imprecise (2 grounded context fields) | FIXED — wording precise; PO sibling untouched (closed milestone) |
| 6 | NIT | loi-view header said "wired" read (untrue this milestone) | FIXED — "mock this milestone; GI-02 PARKED"; PO sibling untouched |
| 7 | NIT | file-card consumer enumeration missing the 4th composer | FIXED — LOI added to the header enumeration |
| 8 | NIT | card cited inventory row 201 vs 202 | FIXED — correction block |
| 9 | NIT | detail-view line-113 JSX comment inconsistent with its 2 siblings | FIXED — "+ LOI face" added |
| 10 | OBS | 4th near-verbatim engagement-doc T-DETAILS view → promotion candidate | REGISTERED on `project-management/promotion-watchlist.md` (`EngagementDocumentDetail` composition, rule-of-three crossed at 4 consumers); extraction is next-touch work, owner-paced — not smuggled into this WP |

Re-entry: fixes committed as a second checkpoint; resubmitted to **Review-A round 2** (fresh
context) per Amendment v1.3 §13.

## Concurrent-tree disclosure

The working tree carries a parallel session's uncommitted RFQ-workflow work (buyer/vendor RFQ
pages, `_components/rfq-workflow/`, plus dirty `changelog.md`/`review-log.md`/`esc_registry.md`/
`tsconfig.json`/`eslint.config.mjs`). This WP's checkpoint stages ONLY its own files (all listed
in-scope files are clean in the index at kickoff — verified). Tracker files already dirty from the
parallel session get this WP's lines appended but ride uncommitted with that session's flow, per
the established "close record uncommitted" practice. Static-gate results are triaged to attribute
any failure to the correct change-set before submission.

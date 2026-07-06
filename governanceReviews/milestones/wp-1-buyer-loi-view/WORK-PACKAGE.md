# WORK PACKAGE — WP-1 Buyer LOI Document View

> Owner-approved 2026-07-06 via the `buyer_journey_v1.0.md` Decision Register ("WP-1 Buyer LOI
> View — **Approved** → Team-2"). Not an FE-\* WBS mint: this WP realizes a recorded gap inside an
> already-owned page key (see the kickoff determination below). Card follows `review-process.md` §7.

- **Lane:** G (contract-grounded document family · R8 money-boundary copy · Inv #11 non-disclosure
  collapse — full Dev → Review-A → Review-B per the journey doc's own "normal Dev→A→B→Board lane")
- **Reviewed-SHA record:** 🔵A round 1 2026-07-06 at `c382d44` (REVISION, 10 findings, all
  dispositioned — see the round-1 table below) · 🔵A round 2 submitted 2026-07-06 at fix
  checkpoint `6fd1a71` (stable target; concurrent-tree discipline unchanged) · **🔵A round 2:
  TWO independent concurrent reviews at `6fd1a71` returned CONFLICTING verdicts (PASS vs
  REVISION) — reconciled on verified facts to REVISION; see "Round-2 reconciliation" below** ·
  🔵A round 3 submitted 2026-07-06 at fix checkpoint `1ce722a`
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
- **Key dates:** created 2026-07-06 (kickoff) / started 2026-07-06 / **closed 2026-07-06
  (dev-team self-close per Amendment v1.3 §13 — A:PASS ∧ B:PASS, B/M/M = 0 both lanes at
  `1ce722a`; RV-0140)**
- **Owner directive (2026-07-06, live):** "no backend now" — reconfirms the presentation-only
  constraint mid-build. Honored: mock-driven only, no wiring, no server data layer, no contract
  code; GI-02 stays PARKED (Wave 4).
- **DoD confirmation (checked at close, 2026-07-06):** ☑ in-scope page passes the
  page-standards DoD (LOI face of P-BUY-21) · ☑ responsive D/T/M (1440/768/375 live-rendered,
  no horizontal overflow) · ☑ WCAG-AA (axe 0 attributable violations D/T/M + not-found; 1
  pre-existing shell `button-name` hit reproduced identically on the approved PO sibling —
  Board agenda #11) · ☑ tsc/eslint/prettier green (both lanes re-ran independently) · ☑
  realistic mock data (refs unique repo-wide, engagement fixtures consistent, v1 + v2-revised
  paths) · ☑ Review A PASS (round 3, after rounds 1–2 REVISION — 13 findings total, all
  dispositioned, 0 false positives) · ☑ Review B PASS (B/M/M = 0, isolated worktree, real
  install) · ☑ close per Amendment v1.3 §13 (no Board gate triggered — no
  BLOCKER/REGRESSION/Flag-and-Halt/override) · ☑ no TODO/dead code · ☑ no duplicate
  components (composition verified by both lanes) · ☑ promotion candidate registered
  (`EngagementDocumentDetail`, watchlist) · ☑ trackers updated (RV-0140 completed in place,
  changelog, current-focus, execution-board) · ☑ WP card closed (this record).

## Review-B — verdict **PASS** (2026-07-06, at `1ce722a`, fresh context, isolated worktree)

**0 BLOCKER · 0 MAJOR · 0 MINOR · 1 NIT · 2 OBS → B/M/M = 0, gate MET.** Evidence highlights:
static gates all green at the SHA (tsc/eslint exit 0, prettier clean on all WP files, coverage
151/151); LOI renders D/T/M with the frozen-projected fields only; absence path byte-identical
to the PO sibling **modulo kind noun (1853 = 1853 normalized chars)** with no ref leak and
identical status semantics; click-throughs land (detail card + hub cluster; `?stage=po`
WCC-parity drop-out confirmed); zero pay/settle/escrow/approve affordances (role-scan); frozen
enums only; mock refs unique + consistent; vendor files mechanically verified comment-only;
po/challan/wcc/payments/trade-invoice routes byte-untouched across the WP diff. NIT: the
committed card's dangling round-3 SHA parenthetical (retired by the working-tree card + this
record). **OBS escalated to the Board (not WP-1's):** repo-wide `next build` static export is
broken at BOTH `1ce722a` and parent `2371675` — shared-shell `useSearchParams()` without a
Suspense boundary (`shell/sidebar.tsx:154`, `shell/mobile-nav.tsx:146`) aborts prerender of
static (app) pages; attribution decisive (pre-existing; WP-1 adds zero client components).
Registered on the execution-board Board agenda — it currently blocks the RV-0126
isolated-prod-build lane for every milestone.

> **Second concurrent Review-B (2026-07-06, live-tree session, same SHA): ✅ PASS — 0 B · 0 M ·
> 0 MINOR, verdict CONCORDANT** — no reconciliation required, this close stands. Independent
> corpus-text anchor re-verification, live-render of both hub-narrowing branches (`?stage=po`
> drop-out + `?stage=rfq` empty-narrowing fallback), and 1 net-new NIT + 2 net-new OBS (all
> non-gating) recorded in the RV-0140 second-B addendum (review-log). Cumulative: 3 A + 2 B.

## Close statement

WP-1 delivered as approved: the buyer LOI document view is live presentation-only at
`/engagements/[engagementId]/loi`, linked from the P-BUY-20 Documents card and the `/documents`
hub, grounded solely in the frozen `engagement_documents` contract family, with nothing coined.
Checkpoints `c382d44` → `6fd1a71` → `1ce722a` committed; close records ride uncommitted per
practice. 3 Review-A rounds + 1 Review-B; 13 raised findings all adjudicated (all accepted, 0
false positives); one live concurrent-review conflict reconciled transparently on facts.

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

## Review-A round 2 — verdict **PASS** (2026-07-06, at `6fd1a71`, fresh context · Team-4)

- **All 10 round-1 dispositions verified LANDED** in the committed diff (`2371675..6fd1a71`):
  five→six comment sweeps (hub view-models/view, detail view-models), file-card fourth-composer
  enumeration, card corrections (in-scope item 4, 151-universe, inventory row 202), loi-view
  "mock this milestone; GI-02 PARKED" header, view-model "plus two grounded context fields"
  precision, vendor-track exception verified **comment-only** in the diff (one reworded comment,
  zero code), promotion-watchlist `EngagementDocumentDetail` entry present.
- **Frozen anchors independently re-verified** (fresh context, corpus text not comments):
  `Doc-4F_PassB_Part2_BC-OPS-2_FROZEN.md` §F5.8 Response Schema projects exactly
  `document : { document_id, doc_kind, human_ref, version_no, is_active_revision, storage_ref }`
  + `reference_id` — the view-model carries ONLY these plus the two grounded context fields
  (`engagementId` route param; `engagementRef` from `get_engagement`'s projected `human_ref`);
  §F5.4 authorization matrix — `can_create_documents` (issue/revise) with `can_approve_po`
  "distinct slug; **never collapsed** into `can_create_documents`", PO financial approval only →
  the LOI view's no-approval divergence is exactly the frozen posture; V4 (scope) `NOT_FOUND |
  collapse-rule` + "Timing-Uniformity: not-party / not-exist identical" honored by the single
  mock-lookup → `notFound()` path; §12 notes "LOI/PO issuance/revision emit **no** event" — no
  event affordance rendered, correct.
- **Scope**: zero creep vs the card; no LifecycleStrip/stage change (LOI row carries NO
  `stageKey` — WCC-parity drop-out preserved); no new primitive; no approval affordance; R8
  record-only callout present; Inv #8 stamps rendered (`versionNo` + `isActiveRevision`; the
  `eng_02` fixture models the revised path, v2 active). Mock keyed on engagement id is disclosed
  in-file and mirrors the closed PO-view posture (`ESC-7G-ENG-03` single-doc reach, correctly
  left ungrounded).
- **Absence boundary**: unknown/non-party byte-identical within the route by construction (one
  lookup, one `notFound()`); pattern-parity with the PO sibling's `not-found.tsx` verified (same
  layout, same sr-only-heading device, kind-specific copy only). Hub label "LOI" matches the
  established WCC-abbreviation convention and the hub's own pre-existing Document Type facet
  vocabulary — no finding.
- **Gates re-run at `6fd1a71`**: `tsc --noEmit` clean · `eslint .` clean ·
  `verify-fe-wbs-coverage.mjs` **PASS 151/151, 35 milestones** · prettier clean on ALL WP-1
  files (the repo-wide `prettier --check` RED persists on 6 files OUTSIDE this WP — attributed
  in review-log RV-0139 finding m9; not WP-1's).
- **Findings: NONE (0 BLOCKER · 0 MAJOR · 0 MINOR · 0 NIT).** §13 gate B/M/M = 0 **MET** →
  **PASS — hand-off to Team-5 (Review-B)**. Raise ≠ Accept honored: round-1 dispositions were
  the author's; this round verifies and raises nothing new.

> **⚠ SUPERSEDED BY THE RECONCILIATION BELOW** — this PASS record was written by a concurrent
> live session; a second, independently-dispatched fresh-context Review-A round 2 on the SAME
> SHA returned REVISION with 3 verifiable findings this record's sweep missed. Record preserved
> unedited (nothing-overwritten); it does not gate.

## Round-2 reconciliation — two concurrent reviews, one verdict (2026-07-06)

Two independent Review-A round-2 examinations of `6fd1a71` ran concurrently (the RV-0125
live-concurrent-session pattern): the section above (PASS, 0 findings, recorded by a parallel
live session, cites RV-0139) and this WP's dispatched fresh-context reviewer (**REVISION — 0
BLOCKER · 0 MAJOR · 3 MINOR**, plus a 10/10 round-1 fix audit that itself caught one fix-introduced
defect). Per §13, findings are adjudicated on facts, and all three were **verified true in-file
by the author before actioning**:

| # | Sev | Finding | Fact-check | Disposition |
|---|---|---|---|---|
| N1 | MINOR | vendor `documents-hub-view.tsx:23` still said "five fixed per-kind routes" — internally contradicting the corrected "six" at :64 of the same file | CONFIRMED (read in-file) | FIXED — five→six, same scoped comment-only vendor exception as round-1 finding 2 |
| N2 | MINOR | vendor `documents-hub-view-models.ts:10` same stale "five" claim | CONFIRMED (read in-file) | FIXED — five→six, same exception |
| N3 | MINOR | the new watchlist row listed "money `Callout`" in the SHARED shape; challan/WCC views have no Callout and explicitly disclaim any money surface — as written the row could steer a future extraction into rendering a DF-6 money notice on non-financial documents | CONFIRMED (challan-view:19 / wcc-view:19 read in-file) | FIXED — money `Callout` moved to the PER-KIND slots alongside the PO approval section, governance note added to the row |

**Effective round-2 verdict: REVISION** — verified-true findings gate regardless of a concurrent
clean pass (§13: an independent review may override; the gate needs B/M/M = 0 on validated
findings, and three validated MINORs existed at `6fd1a71`). No fault attaches to either reviewer:
both records were honestly produced; the conflict is the expected cost of live concurrent
sessions and is resolved transparently here, RV-0126 style. Re-entering **Review-A round 3** at
the fix checkpoint per Amendment v1.3 §13.

## Review-A round 3 — verdict **PASS** (2026-07-06, at `1ce722a`, fresh context)

- Fix audit N1/N2/N3: **all CONFIRMED FIXED**, pre-states independently reproduced at `6fd1a71`,
  no new falsehood introduced (whole vendor headers re-read consistent; the watchlist row's every
  remaining claim grepped true — money `Callout` verified PO/LOI-only in the rendered code,
  challan:19/wcc:19 disclaimers exact).
- Reconciliation record audited **ACCURATE** (superseded-PASS annotation preserved unedited;
  §13 effective-verdict logic conforms; RV-0125 precedent cite verified in the committed log).
- Final adversarial class sweep across both trees at `1ce722a`: route topology re-grounded
  (exactly six per-kind route dirs), every remaining five/six/ordinal claim judged true or out of
  blast radius. Scope: exactly 4 files, every hunk disposition-traced, comment/tracker-only.
- Findings: **0 BLOCKER · 0 MAJOR · 0 MINOR · 1 NIT** (the Reviewed-SHA bullet's "SHA in the
  round-3 line below" self-reference — retired by this very section recording `1ce722a`).
- **A-lane gate MET → hand-off to Team-5 (Review-B), lane G.** Cumulative Review-A record:
  round 1 REVISION (10) → round 2 dual-record reconciled REVISION (3, all fact-checked) →
  round 3 PASS.

## Concurrent-tree disclosure

The working tree carries a parallel session's uncommitted RFQ-workflow work (buyer/vendor RFQ
pages, `_components/rfq-workflow/`, plus dirty `changelog.md`/`review-log.md`/`esc_registry.md`/
`tsconfig.json`/`eslint.config.mjs`). This WP's checkpoint stages ONLY its own files (all listed
in-scope files are clean in the index at kickoff — verified). Tracker files already dirty from the
parallel session get this WP's lines appended but ride uncommitted with that session's flow, per
the established "close record uncommitted" practice. Static-gate results are triaged to attribute
any failure to the correct change-set before submission.

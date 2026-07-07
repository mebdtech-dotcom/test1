<!--
Type:       Board decision packet (request). NON-AUTHORITATIVE until the Board rules.
Status:     OPEN — awaiting human Board.
Produced:   2026-07-08.
Purpose:    Request the FE page-ID + FE-* milestone mints the visually-approved Review System
            surfaces need, and adjudicate the gating design decisions. Presentation-only scope.
Authority:  Coins nothing. Only the Board may mint page IDs, update the page universe, or mint
            FE-* milestones. On any conflict the frozen corpus wins (CLAUDE.md §7, §11).
Provenance: docs/product/requirements/review_system_planning_and_design.md (planning package) ·
            prototypes/review-system/ (prototype, owner-visually-approved 2026-07-08).
-->

# Board Packet — Review System FE Mints (page IDs + milestones)

> **What this is:** a request to the Board to (1) mint the FE **page IDs** and **FE-\* milestones**
> the visually-approved Review System surfaces need, and (2) rule on the gating design decisions
> (D1–D4). **Scope = presentation-only FE** under the standing "parallelization, not reorder"
> authorization. **This packet requests no backend and mints nothing itself** — new page IDs and
> FE-\* milestones are Board-only (`project-management/fe-program-wbs.md`); the page universe (151,
> `scripts/verify-fe-wbs-coverage.mjs`) is updated only by the Board.

---

## 0. One-page summary

**Where we are.** The Review System planning package (all three rating lanes) passed its
adversarial review, and the high-fidelity clickable prototype covering all five surfaces was
**visually approved by the owner on 2026-07-08**. Surface 2's card layout is settled — **Option A
(testimonial)**. The design direction is confirmed; **no build is authorized yet.**

**What unlocks the build.** Presentation-only FE for these surfaces is legal *now* under the
standing parallel authorization — but only once the Board (a) mints the page IDs / FE-\* milestones
below and (b) rules on the four gating decisions. Backend stays roadmap-gated regardless
(M5 = Wave 3 · M8 moderation = Wave 5; current = Wave 2).

**The asks:**

| # | Board decision | Recommendation | Page-ID impact |
|---|---|---|---|
| **D1** | Surface 2 reviews = section+anchor of the one-page microsite (P-PUB-13)? | **Approve** (§9(c)) | 0 |
| **D2** | Surface 3 moderation placement: new pages vs face of P-ADM-02/03 | **Board decides** — planning package implies no preference (MAJOR-04); trade-offs in §3 | 0 or +2 ADM |
| **D3** | Admin dev ownership for the staff legs (Surfaces 3 & 5) | **Assign** — Admin sequenced last (Buyer→Vendor→RFQ→Admin) | — |
| **D4** | Surface 1 buyer submission: face of engagement detail vs new P-BUY page | **Face** (CS "second face" precedent) | 0 or +1 BUY |

**Mints requested:** the page IDs in §4 (net **0 to +4** on the universe, depending on D2/D4) and the
FE-\* milestones in §5 (FE-BUY / FE-PUB / FE-ADM tracks). **Recommended path lands at +1 (→ 152).**

---

## 1. Provenance (bound by pointer)

- **Planning package:** `docs/product/requirements/review_system_planning_and_design.md` — the
  authoritative spec for Surfaces 1–5, bound to the frozen `Doc-4G_PassB_Part5_BC-TRUST-5`,
  `Doc-4F_PassB_Part1_BC-OPS-1`, `Doc-5G`, `J-REV`, `Doc-7D`. Coins nothing.
- **Prototype (visually approved):** `prototypes/review-system/` (`index.html` + `README.md`) —
  quarantined, non-production; Surfaces 1–5 with every state; **owner visual approval 2026-07-08**.
- **Program constraints:** page universe = **151** (`scripts/verify-fe-wbs-coverage.mjs`); FE track
  naming + Board-only mint rule (`project-management/fe-program-wbs.md`); Admin dev ownership
  **UNASSIGNED** (`project-management/current-focus.md`); wave gates (`generatedDocs/Build_Roadmap_v1.0.md`).

---

## 2. Scope binding (what the Board is authorizing if it approves)

**In scope — presentation-only FE (Phase P):** the five surfaces built with **mock adapters /
static data only** — *no persistence · no fake moderation flows · no simulated publish/state
transitions · no new workflow states · frozen-contract grounding · coins nothing* (planning
package §8 Phase-P guardrails). Every action is a mock; nothing emulates the business state machine.

**Explicitly NOT requested here** (separate gates / channels):

- **Backend** — M5 `trust.public_reviews`/`admin_ratings` tables + the seven BC-TRUST-5 contracts
  (Wave 3); M8 moderation wiring + M4 `ops.set_private_vendor_rating.v1` wiring (Wave 5). Wave-gated.
- **Aggregate-rating display** (§9(a)) — interim-prohibited (DP-R1); future corpus-guidance item.
- **Vendor reply to reviews** (§9(b)) — absent from the corpus; product decision, not requested.
- **Author review-status read** (§9(e)) — no author-scoped read exists; an additive Doc-4G/Doc-5G
  contract question for the API Governance Board, not a coinable UI.

---

## 3. Gating decisions (D1–D4)

### D1 — Surface 2 microsite placement (planning §9(c))
Render `published` reviews as a **section + anchor** within the owner-ruled one-page microsite
HYBRID IA (P-PUB-13, Doc-7D) — **not** a new sub-route. **Recommendation: APPROVE** (consistent
with the frozen one-page HYBRID IA; Doc-7D Pass2 Patch already binds the public published-reviews
view). **Page-ID impact: 0.**

### D2 — Surface 3 moderation-queue placement (planning §9(d)) — **Board decision, no preference implied**
The planning package presents both options **neutrally** (MAJOR-04). Trade-offs for the Board:

| | **Option A — dedicated pages** | **Option B — face of P-ADM-02/03** |
|---|---|---|
| Page IDs | **+2 ADM** (queue + case) | **0** (filter/face of the generic moderation queue + case) |
| Reuse | New consumers of the shared `AdminQueueTable` | Same shared `AdminQueueTable`, existing route |
| Clarity | Review moderation is a first-class, self-labelled surface | Reviews are one content-type among the generic queue |
| Cost | Higher (2 new pages, nav entry) | Lower (extends built surfaces) |

*(Observation, not a recommendation: Option B is the lower-cost path and reuses the built
moderation surface; Option A gives reviews a first-class home. The Board rules; Raise ≠ Accept.)*

### D3 — Admin dev ownership (Surfaces 3 & 5)
The staff legs need an owning team; **Admin dev ownership is currently UNASSIGNED**
(`current-focus.md`). **Recommendation: assign an Admin FE owner and sequence the Admin legs
LAST** per the owner's **Buyer → Vendor → RFQ → Admin** order — i.e. buyer authoring and public
display proceed first; Surfaces 3 & 5 follow once ownership is assigned.

### D4 — Surface 1 buyer submission placement
A **face of the existing engagement-detail surface** (Doc-7F) — entered from a completed
engagement — **or** a new `P-BUY-*` page. **Recommendation: FACE** (no new page ID), per the CS
WP-1 "second face, no new page ID" precedent. **Page-ID impact: 0 (rec) / +1 BUY.**

---

## 4. Page-ID mints requested (contingent on D1–D4)

> Placeholders `«new-N»` mark IDs the **Board** assigns; this packet proposes none by number and
> touches neither the WBS nor `verify-fe-wbs-coverage.mjs`.

| Surface | Requested placement | Page-ID mint | Universe Δ |
|---|---|---|---|
| S1 — Buyer review submission | Face of engagement detail (D4=Face) | none | 0 |
| S2 — Public reviews (Option A) | Section+anchor of P-PUB-13 (D1) | none | 0 |
| S3 — Moderation queue + case | D2=A → `P-ADM-«new-1»`, `P-ADM-«new-2»` · D2=B → face of P-ADM-02/03 | 0 or 2 | 0 or **+2 ADM** |
| S4 — Private CRM ratings | Existing buyer CRM detail (P-BUY-27, built/parked) | none | 0 |
| S5 — Admin ratings (staff) | New staff surface `P-ADM-«new-3»` (or face of a vendor-admin detail) | 0 or 1 | 0 or **+1 ADM** |

**Universe range: 151 → 151…155.** Recommended path (D1 approve · D2=B · D4=face · S5 new page):
**151 → 152** (+1 ADM). Max path (D2=A · S5 new · D4 new): 155.

---

## 5. FE-\* milestone mints requested (Board-only)

Per `fe-program-wbs.md` naming (`FE-<TRACK>-NN`); the Board assigns the numbers.

| Milestone (proposed) | Surface(s) | Track / team | Depends on | Sequence |
|---|---|---|---|---|
| `FE-BUY-«n»` Review submission | S1 (+ S4 CRM activation) | FE-BUY / Team-2 | D4 | **1st** (buyer authoring) |
| `FE-PUB-«n»` Public reviews display (Option A) | S2 | FE-PUB / Team-1 | D1 | 2nd (public display) |
| `FE-ADM-«n»` Review moderation | S3 | FE-ADM / Admin (D3) | D2, D3 | last (Admin) |
| `FE-ADM-«n»` Admin ratings | S5 | FE-ADM / Admin (D3) | D3 | last (Admin) |

- **Surface 4 (CRM ratings)** is the presentation-only *activation* of the already-built parked
  card (`app/(app)/(buyer)/crm/[recordId]/crm-detail-view.tsx`) — folded into the FE-BUY milestone
  as a small item (mock adapter; real wiring stays Wave-5).
- **Ordering** follows the owner's Buyer → Vendor → RFQ → Admin rule: buyer authoring first, public
  display second, staff legs last (gated on D3).

---

## 6. Conformance guardrails carried into the build

- **Governance (from the approved design):** no derived review statistics anywhere (DP-R1);
  published-only public reads via the Marketplace projection (DP-R3); three lanes never merged;
  neutral verified-engagement medallion (provenance, not author identity); only the five frozen
  statuses; staff/CRM firewalls; NOT_FOUND-collapse honoured.
- **Carried markers (open, not resolved here):** `[ESC-TRUST-SLUG]`, `[ESC-TRUST-AUDIT]`,
  `[ESC-OPS-POLICY]` — bound by pointer; no ESC minted by this packet.

---

## 7. Board disposition block

| Decision | Ruling | Notes |
|---|---|---|
| D1 — S2 microsite section+anchor | ☐ Approve ☐ Revise | |
| D2 — S3 moderation placement | ☐ Option A ☐ Option B | |
| D3 — Admin dev ownership | ☐ Assign: __________ | |
| D4 — S1 submission placement | ☐ Face ☐ New P-BUY | |
| Page-ID mints (§4) | ☐ Mint as ruled ☐ Hold | Board assigns numbers + updates universe |
| FE-\* milestone mints (§5) | ☐ Mint ☐ Hold | Board assigns IDs |
| Scope = presentation-only (Phase P) | ☐ Confirm | Backend stays wave-gated |

*On approval, the planning package Surface specs + WBS coverage are updated to the minted IDs, and
Phase-P presentation-only build may begin in the sequence above. Nothing here reorders the roadmap
or authorizes any backend/wiring work.*

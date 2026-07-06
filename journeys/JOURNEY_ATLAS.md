# iVendorz — Journey Atlas (Registry & Governance)

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v1.0** — Journey/Lifecycle registry (non-authoritative companion)
**Date:** 2026-07-06
**Companions:** [`../marketplace_ux.md`](../marketplace_ux.md) (the six actor journeys) ·
[`../information_architecture.md`](../information_architecture.md) · [`../ux_patterns.md`](../ux_patterns.md)
**Domain files:** [`journeys_identity.md`](journeys_identity.md) · [`journeys_trust.md`](journeys_trust.md) ·
[`journeys_marketplace.md`](journeys_marketplace.md) · [`journeys_procurement.md`](journeys_procurement.md) ·
[`journeys_operations.md`](journeys_operations.md) · [`journeys_communication.md`](journeys_communication.md) ·
[`journeys_monetization.md`](journeys_monetization.md) · [`journeys_admin.md`](journeys_admin.md) ·
[`journeys_ai.md`](journeys_ai.md)

---

## 0. Precedence & Authority (read first)

A **non-authoritative companion** — the registry and governance for ALL journey/lifecycle
documentation in this repository. It **coins no architecture, route, contract, state, transition,
permission, event, or journey step**; every cell below is a **pointer** into the frozen corpus.
It sits below the frozen Doc-7 program and conforms upward.

```
Master Architecture → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → {Doc-7B…7H} → Code
                                  ▲ state machines / events / permissions      ▲ this atlas conforms upward
```

- **Authority resolution:** states resolve to **Doc-2 §5** (named machines) or **Doc-2 §3**
  (status enums) + **Doc-3** (RFQ operational semantics); events to **Doc-2 §8 / Doc-4J**;
  permissions to **Doc-2 §7 / Doc-4L §L3**; contracts to the **owning Doc-4x/Doc-5x**; screens to
  **Doc-7D–7H**. **Doc-4M and Doc-4L are cited as navigation only** — both are non-normative
  consolidations and may never be cited as contract sources (Doc-4M §M1).
- **Do not invent transition graphs for §3-only entities** (Doc-4M §M4 warning) — a status enum is
  narrated as its enum, nothing more.
- **On any conflict, the frozen corpus wins and this file is corrected** (CLAUDE.md §7, §11).
  Corpus-internal conflicts are **Flag-and-Halt**, never resolved here.
- The six actor journeys (`J-GST/J-BUY/J-PROC/J-VND/J-SUP/J-ADM`) remain owned by
  [`../marketplace_ux.md`](../marketplace_ux.md) — this atlas registers them and builds on them;
  it **never restates or renumbers them**.

---

## 1. Purpose & Scope

`marketplace_ux.md` answers *"what does each actor do, in order, to get value?"* (six actor
journeys). This atlas and its nine domain files answer the complementary question: *"what is the
full life of each governed thing?"* — one **lifecycle journey** per frozen lifecycle-bearing
entity, seam, or system flow, grouped **one file per owning module** (Golden Rule #2).

Two journey kinds (Glossary, §9):

- **`<Entity> Lifecycle`** — bound to a frozen state machine (Doc-2 §5) or status enum (Doc-2 §3).
- **`<Process> Journey`** — a narrative flow with **no lifecycle enum of its own** (context
  resolution, document-evidenced flows, score-update event flows). These narrate steps and
  pointers only; they draw **no state graph**.

---

## 2. Legend & Notation Standard (defined once — domain files reference, never redefine)

| Token | Meaning |
|---|---|
| `[state]` | A frozen state/status value — must exist verbatim in Doc-2 §5/§3 |
| `(Event)` | A Doc-2 §8 / Doc-4J catalog event (e.g. `(RFQClosedWon)`) |
| `«permission»` | A Doc-2 §7 permission slug (e.g. `«can_approve_po»`) |
| `module.contract.v1` | A wired contract in the owning Doc-4x/Doc-5x |
| `⚙ System` | The System actor (out-of-wire workers: matching, routing, scoring, outbox) |
| `POLICY key` | An M0 config policy key (e.g. `quote.max_revisions`) |

**Arrows:**

| Arrow | Meaning |
|---|---|
| `→` | Forward progression / one-way transition |
| `⇄` | Reversible transition (both edges frozen) |
| `↦` | **Version append** — a new immutable version, explicitly **NOT** a state transition (quotation revision, engagement-document revision) |
| `─▶` | Flow-map connector in one-page ASCII overviews only |

States render in `code` style everywhere. ASCII + Markdown tables only — no mermaid.

---

## 3. Atlas Governance

### 3.1 Journey registration lifecycle

```
proposed → reserved (key in §5 registry) → authored → reviewed (Review A → Review B, §13 gate) → registered
                                                                        └─ deprecated (marked, never deleted)
```

- A journey is **proposed** in conversation/WBS, **reserved** by adding its key to the §5 registry
  *before* authoring, **authored** in its domain file, **reviewed** per repo governance
  (Review A: architecture/governance lens → Review B: quality/adversarial, fresh context;
  merge/freeze gate BLOCKER = MAJOR = MINOR = 0, CLAUDE.md §13), then **registered**.
- **Deprecation:** a journey is marked `deprecated` in the registry with a pointer to its
  successor; its section is annotated, **never deleted**; its key and step IDs are **never
  reused** (mirrors Invariant #8 — nothing authoritative is overwritten or hard-deleted).

### 3.2 ID reservation policy

- Every journey key is `J-<SLUG>` (unique, uppercase); steps are `J-<SLUG>-NN` (two digits,
  monotonic, never renumbered once reviewed).
- The six actor keys `J-GST · J-BUY · J-PROC · J-VND · J-SUP · J-ADM` are **permanently reserved**
  by `marketplace_ux.md` — never reused, extended, or renumbered here.
- Slugs are never recycled, including for deprecated journeys.
- Reservation happens **in the §5 registry before authoring** — an unregistered key appearing in a
  domain file is a review defect.

### 3.3 Authoring rules

Every journey section carries, in this order (Board Review R1, MAJOR-01/02/04, MINOR-04/05):

1. **Breadcrumb** — `Atlas ▸ <Domain file> ▸ <Journey title>`
2. **Ownership block** — `Owner Module` · `Participating Modules` · `Authoritative Documents` ·
   `Read-only References`
3. **Actors** — `Primary` · `Supporting` · `⚙ System` (where applicable)
4. **Intent arc** + **Goal**
5. **Entry / Exit Criteria** — **frozen state/event pointers only**, never coined conditions
6. **ASCII flow** (notation §2)
7. **Step table** — `ID | Step | Key actions (pattern · contract) | Outcome / governance`, plus a
   `State (Doc-2)` column where a machine/enum exists
8. **Governance rails** + **Success checklist**
9. **Related Journeys** — upstream trigger · downstream continuation · composing actor journeys

Every **domain file** carries: a §0 authority stance mirroring this atlas; a reference (not a
copy) to the §2 legend; escalation markers verbatim where mandated (`ASSUMPTION A-06`,
`ASSUMPTION A-07`, `PATCH-02`, `[ESC-AI-EVENT]`, `[ESC-AI-SLUG]`, `[ESC-IDN-SLUG]` …); a closing
**Not Covered** ledger; and a cross-link back to `marketplace_ux.md`.

### 3.4 Cross-reference rules

- Link journeys **by `J-*` key** (and file), never by section number of another companion.
- Authority citations point to Doc-2/Doc-3/owning Doc-4x only (§0). Doc-4M/§M6 seam handles
  (`M6-1`…`M6-8`) may be used as **navigation labels** for cross-module hops.
- Page references use only page IDs already minted in `page_inventory.md` / the FE WBS — a journey
  never invents a page or route.

### 3.5 Cross-cutting authoring principles

1. **Append-only change idiom** — the corpus expresses "change" as versioning (quotation
   revisions `↦`, engagement-document revisions `↦`) and reserves lifecycle enums for containers
   (engagement, thread, verification record). A "revise/amend" step is a `↦` version append,
   never a transition.
2. **Firewalls are display-silent rails** — trust/performance/tier are displayed, never computed,
   in any journey (CLAUDE.md §4); no billing state gates trust/eligibility/routing/matching.
3. **Money boundary** — journeys record post-award documents; the platform never settles
   buyer↔vendor money (records only).
4. **Byte-equivalence / non-disclosure** — no journey step reveals exclusion, deferral, or
   buyer-private status (Invariant #11; CHK-7-040/041).
5. **Users act; Organizations own** — active-org server-resolved in every authenticated journey
   (Invariant #5, Doc-7C §4).
6. **State-machine fidelity** — only Doc-2-permitted transitions appear; §3-only enums get no
   invented graph.

---

## 4. How Actor Journeys and Lifecycle Journeys relate (composition)

The six actor journeys are **click-paths through** the lifecycle journeys. One-page overview:

```
 [J-GST] ─▶ [J-BUY] ──────────▶ [J-PROC] ─────────────────────────────────────────▶ (closed)
              │ J-ORG J-MEM        │ J-MATCH ─▶ J-RINV ─▶ J-QUO ─▶ J-CMP ─▶ J-AWD ─▶ J-ENG ─▶ J-DOC/J-DLV/J-WCC/J-FIN
              │ J-CTX J-DEL        │ J-CRM (private, always-on)                        │ J-DSP (if raised)
              │ J-SUB J-PINV       └ J-NTF/J-CHAT (M6 rails under every hop)           └ J-REV (post-award)
 [J-GST] ─▶ [J-VND] ──────────▶ [J-SUP]
              │ J-CLM J-PRD        │ J-RINV(vendor leg) J-QUO J-LEAD J-CRED
              │ J-SITE J-PORT      └ J-ENG J-DOC J-DLV J-WCC J-FIN (vendor leg)
              │ J-CAT J-ADV
              └ J-VER J-TIER ◀──── [J-ADM]: J-VQ J-MOD J-BAN J-CATA J-IMP J-CMPL
                                            (⚙ System: J-TSC J-PSC J-FRD J-AI)
```

Per-step composition (anchor steps from `marketplace_ux.md`):

| Actor journey step | Invokes lifecycle journey |
|---|---|
| `J-BUY-02/03` | J-ORG, J-CTX |
| `J-BUY-05` | J-MEM, J-DEL |
| `J-BUY-06` | J-SUB (→ J-PINV, J-CRED) |
| `J-PROC-05…07` | J-MATCH, J-RINV |
| `J-PROC-08…11` | J-QUO, J-CMP |
| `J-PROC-12` | J-AWD (→ J-ENG) |
| `J-PROC-13` | J-ENG, J-DOC, J-DLV, J-WCC, J-FIN (+ J-DSP when raised) |
| `J-PROC-14` | J-CRM |
| `J-VND-01/02` | J-CLM (→ J-VER, J-TIER) |
| `J-VND-03` | J-SITE |
| `J-VND-04` | J-PRD (+ J-PORT) |
| `J-VND-05` | J-CAT |
| `J-VND-06` | J-ADV |
| `J-SUP-01/02` | J-RINV (vendor leg), J-LEAD |
| `J-SUP-03/04/05` | J-QUO |
| `J-SUP-06` | J-LEAD (+ J-CRED metering) |
| `J-SUP-07` | J-ENG, J-DLV, J-DOC, J-FIN |
| `J-ADM-01` | J-MOD (+ J-CMPL) |
| `J-ADM-02` | J-VQ (→ J-VER, J-TIER) |
| `J-ADM-03` | J-CATA, J-ADV (review leg), J-CLM (status leg) |
| `J-ADM-04` | J-BAN |
| `J-ADM-05` | J-IMP, J-MATCH (rule assist leg) |
| `J-ADM-06` | J-SUB (activate leg), J-SUC (org suspend/reinstate leg) |

Lifecycle→lifecycle handoffs ride the frozen cross-module seams (navigation labels Doc-4M §M6):
`M6-1 (RFQClosedWon)` J-AWD→J-ENG · `M6-2 (VendorInvited)` J-RINV→J-LEAD+J-NTF · `M6-3
(VendorTierChanged)` J-TIER→J-CLM(profile history) · `M6-4 (VendorBanned)` J-BAN→J-CLM ·
`M6-5` J-VQ→J-VER · `M6-6 (SubscriptionPurchased/Renewed/Expired)` J-SUB→entitlement refresh ·
`M6-7 (VendorOwnershipTransferred)` J-VOT→J-VER(freeze/review) · `M6-8` J-VER→J-CLM (`claimed →
verified`).

---

## 5. Journey Registry

Keys sorted alphabetically **within each domain file**. Type: **L** = `<Entity> Lifecycle`
(state-bound) · **J** = `<Process> Journey` (narrative, no own enum). Status: all new entries are
`authored` pending Review A/B (§3.1). Phase = authoring wave in this program (all presentation/
docs-only; no build-wave gate).

### Reserved — actor journeys (owned by `marketplace_ux.md`, registered here only)

| Key | Title | Owner | Status |
|---|---|---|---|
| J-GST | Guest Journey | — (cross-surface) | registered (v0.2, committed) |
| J-BUY | Buyer Journey | — | registered |
| J-PROC | Procurement Journey | — | registered |
| J-VND | Vendor Journey | — | registered |
| J-SUP | Supplier Journey | — | registered |
| J-ADM | Admin Journey | — | registered |

### File A — [`journeys_identity.md`](journeys_identity.md) (M1 · Doc-4C) — Phase 1

| Key | Type | Title | Frozen lifecycle anchor |
|---|---|---|---|
| J-CTX | J | Active-Org Context Journey | Invariant #5 · Doc-7C §4 (no enum) |
| J-DEL | J | Roles, Permissions & Delegation Journey | Delegation grant `[draft] → [active] ⇄ [suspended] → [revoked]`, `[active] → [expired]` (Doc-2 §5.10); custom role bundles (Doc-4C §C7, `[ESC-IDN-SLUG]`) |
| J-MEM | L | Membership Lifecycle | `[invited] → [pending] → [active] ⇄ [suspended] → [removed]` (Doc-2 §5.2) |
| J-ORG | J | Organization Onboarding Journey | Organization machine (Doc-2 §5.1) |
| J-SUC | J | Organization Ownership & Succession Journey | Doc-4C succession/transfer contracts |

### File B — [`journeys_trust.md`](journeys_trust.md) (M5 · Doc-4G) — Phase 1

| Key | Type | Title | Frozen lifecycle anchor |
|---|---|---|---|
| J-FRD | L | Fraud & Risk Signal Lifecycle | `[open] → [reviewed] → [actioned]/[dismissed]` (Doc-2 §3.6; staff-internal — **never displayed**) |
| J-PSC | J | Performance Score Update Journey | Derived aggregate — **not a state machine** (Doc-2 §8 events) |
| J-REV | L | Public Review Lifecycle | `[submitted]/[approved]/[published]/[rejected]/[removed]` (Doc-2 §3 `public_reviews`) |
| J-TIER | L | Verified Financial Tier Lifecycle | `[pending_verification] → [verified] ⇄ [suspended] → [expired]` (Doc-2 §5.6) |
| J-TSC | J | Trust Score Update Journey | Derived aggregate — **not a state machine** (Doc-2 §8 events) |
| J-VER | L | Vendor Verification Lifecycle | `[requested] → [in_review] → [approved]/[rejected]`; `[in_review] → [requested]` (more info); `[approved] → [expired]/[revoked]` (Doc-2 §5.6) |

### File C — [`journeys_marketplace.md`](journeys_marketplace.md) (M2 · Doc-4D) — Phase 1

| Key | Type | Title | Frozen lifecycle anchor |
|---|---|---|---|
| J-ADV | L | Advertisement Lifecycle | `[draft] → [pending_review] → [scheduled] → [active] ⇄ [paused] → [completed]`; `[pending_review] → [rejected]` (Doc-2 §5.8; **ASSUMPTION A-07**) |
| J-CAT | L | Category Assignment Lifecycle | `[proposed] → [active] → [removed]` (Doc-2 §3) |
| J-CLM | J | Vendor Claim & Onboarding Journey | Claim `[seeded] → [invited] → [claimed] → [verified]`; status `[active] ⇄ [suspended]`, `[active] → [banned] → [active]` (lift) (Doc-2 §5.3) |
| J-PORT | L | Showcase Project Lifecycle | `[draft] → [published]` (Doc-2 §3 `showcase_projects`; Doc-4D §D7.3; **no §8 event — never coin one**) |
| J-PRD | L | Product Lifecycle | `[draft] → [published] ⇄ [unpublished]` (Doc-2 §3) |
| J-SITE | L | Microsite & Custom Domain Lifecycle | Microsite `[draft] → [published] ⇄ [unpublished]`; domain `[pending] → [verified] → [active] → [released]` (Doc-2 §3) |
| J-VOT | J | Vendor Ownership Transfer Journey | Seam M6-7 `(VendorOwnershipTransferred)` → Trust freeze/review |

### File D — [`journeys_procurement.md`](journeys_procurement.md) (M3 · Doc-4E, Doc-3) — Phase 1

| Key | Type | Title | Frozen lifecycle anchor |
|---|---|---|---|
| J-AWD | J | Award Journey | Quotation `[selected]` → RFQ `[closed_won]` → seam M6-1 `(RFQClosedWon)` |
| J-CMP | J | Comparison & Evaluation Journey | Doc-4E Part5 (R6: read-only, never recommends) |
| J-MATCH | J | Matching & Routing Journey (⚙ System) | Doc-4E Part2/Part3 (out-of-wire) |
| J-QUO | L | Quotation Lifecycle | `[draft] → [submitted]` (`↦` revisions) `→ [withdrawn]/[selected]/[not_selected]/[expired]` (Doc-2 §5.5 — shortlist is an **RFQ** state, not a quotation state; `rfq.revise_quotation.v1`) |
| J-RINV | L | RFQ Invitation Lifecycle | `[draft]/[selected]/[deferred]/[delivered]/[accepted]/[declined]/[expired]` (Doc-2 §3) |

### File E — [`journeys_operations.md`](journeys_operations.md) (M4 · Doc-4F) — Phase 2

| Key | Type | Title | Frozen lifecycle anchor |
|---|---|---|---|
| J-CRM | L | Private Vendor Record Lifecycle (buyer CRM) | `[active] ⇄ [archived]` (PATCH-02: claim lifecycle N/A); Invariant #11 |
| J-DLV | J | Delivery Recording Journey | Document-evidenced: `ops.record_delivery.v1` ↦ challan + `(DeliveryRecorded)`; **no goods-delivery machine** |
| J-DOC | J | Engagement Document Chain Journey | LOI/PO/challan/WCC — immutable `↦` versions, **no acceptance states**; `«can_approve_po»` issuer-side |
| J-DSP | J | Dispute Recording Journey | Dispute **recorded** (audit; Doc-2 §9) — **not** an engagement state |
| J-ENG | L | Engagement Lifecycle | `[open] → [in_delivery] → [completed] → [closed]` (Doc-2 §3) |
| J-FIN | J | Finance Records Journey | Trade invoice `[issued]/[partially_paid]/[paid]/[disputed]/[cancelled]`; payment `[recorded]/[confirmed]` — records only |
| J-LEAD | L | Vendor Lead Pipeline Lifecycle | `stage [received]/[quoted]/[negotiation]/[won]/[lost]/[follow_up]` (Doc-2 §3); created only via `(VendorInvited)` at invitation `[delivered]` |
| J-TPL | L | Document Template Lifecycle | `[draft] → [active] ⇄ [archived]` (Doc-2 §5.9) |
| J-WCC | J | Work Completion Journey | WCC document + engagement `[completed]` |

### File F — [`journeys_communication.md`](journeys_communication.md) (M6 · Doc-4H) — Phase 2

| Key | Type | Title | Frozen lifecycle anchor |
|---|---|---|---|
| J-CHAT | L | Messaging Thread Lifecycle | `[open] → [closed]` (`comm.close_thread.v1`; participant-initiated; append-only messages) |
| J-NTF | J | Notification Delivery Journey | Outbox-consumer; channel logs `[queued] → [sent] → [delivered]/[failed]` |
| J-TKT | L | Support Ticket Lifecycle | `[open] → [in_progress] → [resolved] → [closed]` (strictly linear per Doc-4H; Doc-4M variance = `ESC-JRN-TKT-MACHINE`) |

### File G — [`journeys_monetization.md`](journeys_monetization.md) (M7 · Doc-4I) — Phase 2

| Key | Type | Title | Frozen lifecycle anchor |
|---|---|---|---|
| J-CRED | J | Lead Credit Metering Journey | `lead_credit_accounts`/`_transactions` (credits **never gate** lead delivery/matching) |
| J-PINV | L | Platform Invoice Lifecycle | `[issued] → [paid]/[overdue]/[void]` (Doc-2 §3 — no draft state exists) |
| J-SUB | L | Subscription Lifecycle | `[pending_payment] → [active] → [expired]` (+ resubscribe; cancel = flag) — **ASSUMPTION A-06**; seam M6-6 |

### File H — [`journeys_admin.md`](journeys_admin.md) (M8 · Doc-4J) — Phase 3

| Key | Type | Title | Frozen lifecycle anchor |
|---|---|---|---|
| J-BAN | L | Ban Lifecycle | `[active] → [lifted] → [expired]` (linear; expiry archives a **lifted** ban only); `(VendorBanned)`; seam M6-4 |
| J-CATA | J | Category Management Journey | Admin leg of taxonomy (M8-governed) |
| J-CMPL | J | Complaint & Fraud Investigation Journey | Ops leg → J-FRD (Trust owns signals) |
| J-IMP | J | Import Job Journey | BC-ADM import; ⚙ System out-of-wire processing |
| J-MOD | L | Moderation Case Lifecycle | Case `[approved]/[rejected]/[escalated]` (Doc-4J) |
| J-VQ | J | Verification Queue Journey | Seam M6-5; "Admin decides, Trust owns" |

### File I — [`journeys_ai.md`](journeys_ai.md) (M9 · Doc-4K) — Phase 3

| Key | Type | Title | Frozen lifecycle anchor |
|---|---|---|---|
| J-AI | L | AI Derived-Artifact Lifecycle | Cache: `(absent) → [fresh] ⇄ [stale] → [expired]` (tokens = **Doc-4M §M4 navigation keys**; substance = Doc-2 §10.10 cache attributes + §3.10 regenerable/disposable); Invariant #12; `[ESC-AI-EVENT]` `[ESC-AI-SLUG]` |

**Totals:** 6 reserved actor journeys + 45 lifecycle journeys = **51 registered**.

---

## 6. Coverage Matrix — frozen lifecycle entities & seams → owning journey

All **23 lifecycle-bearing entities** consolidated in Doc-4M §M3 (navigation) and the **8 seams**
(§M6) are owned by at least one journey:

| # | Frozen entity (authority) | Journey |
|---|---|---|
| 1 | Organization (Doc-2 §5.1) | J-ORG |
| 2 | Membership (Doc-2 §5.2) | J-MEM |
| 3 | Delegation Grant (Doc-2 §5.10) | J-DEL |
| 4 | Vendor Profile (Doc-2 §5.3) | J-CLM |
| 5 | Category Assignment (Doc-2 §3) | J-CAT |
| 6 | Product (Doc-2 §3) | J-PRD |
| 7 | Microsite (Doc-2 §3) | J-SITE |
| 8 | Custom Domain (Doc-2 §3) | J-SITE |
| 9 | Advertisement (Doc-2 §5.8 · A-07) | J-ADV |
| 10 | RFQ (Doc-2 §5.4 · Doc-3 §1) | J-PROC (actor) + J-MATCH/J-AWD legs |
| 11 | RFQ Invitation (Doc-2 §3) | J-RINV |
| 12 | Quotation (Doc-2 §5.5) | J-QUO |
| 13 | Engagement (Doc-2 §3) | J-ENG |
| 14 | Private Vendor Record (Doc-2 §3 · PATCH-02) | J-CRM |
| 15 | Vendor Lead (Doc-2 §3) | J-LEAD |
| 16 | Document Template (Doc-2 §5.9) | J-TPL |
| 17 | Verification Record (Doc-2 §5.6) | J-VER |
| 18 | Verified Financial Tier (Doc-2 §3/§5.6) | J-TIER |
| 19 | Trust / Performance Score (Doc-2 §8 — **not a machine**) | J-TSC / J-PSC |
| 20 | Support Ticket (Doc-2 §3) | J-TKT |
| 21 | Subscription (Doc-2 §5.7 · A-06) | J-SUB |
| 22 | Platform Invoice (Doc-2 §3) | J-PINV |
| 23 | AI Derived Artifacts (Doc-2 §10.10) | J-AI |

| Seam (navigation label) | Event / hop | Journeys |
|---|---|---|
| M6-1 | `(RFQClosedWon)` → Engagement created | J-AWD → J-ENG |
| M6-2 | `(VendorInvited)` → lead + notification | J-RINV → J-LEAD, J-NTF |
| M6-3 | `(VendorTierChanged)` → tier history | J-TIER → J-CLM |
| M6-4 | `(VendorBanned)` → profile `[banned]` | J-BAN → J-CLM |
| M6-5 | Admin verification decision → Trust | J-VQ → J-VER |
| M6-6 | `(SubscriptionPurchased/Renewed/Expired)` → entitlements | J-SUB |
| M6-7 | `(VendorOwnershipTransferred)` → Trust freeze/review | J-VOT → J-VER |
| M6-8 | Verification approval → claim `[verified]` | J-VER → J-CLM |

---

## 7. Journey → Surface · Contract · Machine · Event matrix

Pointer-only cells (detail lives in the domain files). UI column = Doc-7 surface; page IDs only
where already minted in `page_inventory.md` / FE WBS.

| Journey | UI surface | Anchor contracts | State machine / enum | Events |
|---|---|---|---|---|
| J-ORG | 7E | `create_organization` (Doc-5C) | Doc-2 §5.1 | — |
| J-MEM | 7E | `invite_member`, `accept_invitation` | Doc-2 §5.2 | — |
| J-CTX | 7C shell | `identity.get_active_context.v1` | — | — |
| J-DEL | 7E | `identity.create_role.v1`, `identity.set_role_permissions.v1`, delegation contracts (Doc-4C §C7/§C9) | Doc-2 §5.10 | — |
| J-SUC | 7E | Doc-4C succession contracts | Doc-2 §5.1 dimension | — |
| J-VER | 7G (vendor) · 7H (admin) | verification submission/decision (Doc-4G/Doc-4J) | Doc-2 §5.6 | `(VendorVerified)` |
| J-TIER | 7G · 7H | tier verification (Doc-4G) | Doc-2 §5.6 | `(VendorTierChanged)` |
| J-TSC / J-PSC | display-only (7D/7F/7G) | `get_trust_score`, `get_performance_score` | — (derived) | Doc-2 §8 score events |
| J-REV | 7F (author) · 7D (read) | review contracts (Doc-4G BC-TRUST-5) | Doc-2 §3 `public_reviews` | — |
| J-FRD | ⚙ System · 7H | BC-TRUST-4 (Doc-4G) | Doc-2 §3.6 (staff-internal) | — |
| J-CLM | 7E→7G | `claim_vendor_profile`, `create_vendor_profile`, `update_vendor_profile` | Doc-2 §5.3 | `(VendorClaimed)`, `(VendorSuspended)`; `(VendorBanned)` in |
| J-PRD | 7G · 7D | `create_product`, `update_product`, `set_product_status` | Doc-2 §3 | — |
| J-SITE | 7G · 7D | `publish_*`/`unpublish_*`, domain contracts (Doc-4D) | Doc-2 §3 | `(MicrositePublished)`, `(MicrositeDomainChanged)` |
| J-PORT | 7G · 7D | `marketplace.create/update/publish_showcase_project.v1` (Doc-4D §D7.3) | Doc-2 §3 | — (none; never coin) |
| J-CAT | 7G | `assign_category`, `list_categories` | Doc-2 §3 | — |
| J-ADV | 7G · 7H | `create_advertisement`, `submit_advertisement`, `review_advertisement` | Doc-2 §5.8 (A-07) | — |
| J-VOT | 7G · 7H | ownership-transfer contracts (Doc-4D) | — | `(VendorOwnershipTransferred)` |
| J-RINV | 7G | `get_invitation`, `list_invitations`, `respond_to_invitation` | Doc-2 §3 | `(VendorInvited)` |
| J-QUO | 7G · 7F | `submit_quotation`, `rfq.revise_quotation.v1`, `rfq.withdraw_quotation.v1` | Doc-2 §5.5 | `(QuotationSubmitted)`, `(QuotationWithdrawn)`, `(QuotationSelected)` (revision: none) |
| J-CMP | 7F | `get_comparison_statement` | — | — |
| J-AWD | 7F | `award_rfq`, `close_lost_rfq` | Doc-2 §5.4/§5.5 | `(RFQClosedWon)`, `(QuotationSelected)`, `(RFQClosedLost)` |
| J-MATCH | ⚙ System (7F observe) | matching/routing pipeline (Doc-4E Part2/3), `get_routing_log` | Doc-2 §5.4 | `(RFQMatched)`, `(RFQRouted)` |
| J-ENG | 7F · 7G | engagement contracts (Doc-4F BC-OPS-2) | Doc-2 §3 | `(RFQClosedWon)` in; `(EngagementCompleted)`, `(BuyerFeedbackRecorded)` |
| J-DOC | 7F · 7G | `ops.issue_engagement_document.v1`, `ops.revise_engagement_document.v1` | — (immutable `↦`) | — |
| J-DLV | 7G · 7F | `ops.record_delivery.v1`, `upload_delivery_challan` | — | `(DeliveryRecorded)` |
| J-WCC | 7F · 7G | WCC issuance (Doc-4F) | engagement `[completed]` | `(WorkCompletionIssued)` |
| J-DSP | 7F · 7G | dispute recording (Doc-4F; Doc-2 §9 audit) | — (recorded, not a state) | `(DisputeRecorded)` (via trade invoice `→ [disputed]`) |
| J-LEAD | 7G | `ops.create_lead_on_invitation.v1`, `update_lead_stage`, `add_lead_activity` | Doc-2 §3 | `(VendorInvited)` in |
| J-CRM | 7F | `get/update_crm_status`, `add_crm_note`, `set_approved`, `set_blacklist` | Doc-2 §3 | — |
| J-TPL | 7F | template contracts (Doc-4F BC-OPS-4) | Doc-2 §5.9 | — |
| J-FIN | 7F · 7G | `issue_trade_invoice`, payment records (Doc-4F BC-OPS-5) | Doc-2 §3 | `(DisputeRecorded)` on `→ [disputed]` |
| J-NTF | shell (7C) | BC-COMM-2/3 (Doc-4H) | Doc-2 §3 logs | consumes outbox |
| J-CHAT | 7F · 7G | messaging + `comm.close_thread.v1` (Doc-4H BC-COMM-1) | `[open]→[closed]` | — |
| J-TKT | 7E · 7H | support contracts (Doc-4H BC-COMM-4) | Doc-2 §3 | — |
| J-SUB | 7E | `purchase_subscription`, `billing.activate_plan.v1` (Doc-4I) | Doc-2 §5.7 (A-06) | `(SubscriptionPurchased/Renewed/Expired)` |
| J-PINV | 7E | platform-invoice contracts (Doc-4I) | Doc-2 §3 | — |
| J-CRED | 7G | `credit_lead_account`/`debit_lead_account` (Doc-4I BC-BILL-4) | — | — |
| J-MOD | 7H | `create/assign/decide_moderation_case`, `moderate_rfq` | Doc-4J case states | — |
| J-BAN | 7H | `issue_ban`, `lift_ban` | ban lifecycle (Doc-4J) | `(VendorBanned)` |
| J-VQ | 7H | `queue/assign/decide_verification_task` | — (M5 owns record) | — |
| J-CATA | 7H | `create/update_category`, `set_category_status` | Doc-2 §3 | — |
| J-IMP | 7H | `submit_import_job` | import job states (Doc-4J) | — |
| J-CMPL | 7H | moderation/fraud intake (Doc-4J → Doc-4G) | — | — |
| J-AI | 7F/7G advisory panels (Wave 6) | Doc-4K artifact reads | Doc-2 §10.10 cache | — ([ESC-AI-EVENT]) |

---

## 8. Not Covered — aggregate ledger

| Item | Why absent | Disposition |
|---|---|---|
| Buyer Verification / "Trusted Buyer" | Not ratified: `verification_records` bind to the vendor's owning org (Doc-4G H.3/H.9a/H.10); no buyer-facing verification contract or event | **ESC-JRN-BUYER-VERIF** (esc_registry.md; human Board) |
| Admin Lead Distribution | Not ratified: Doc-4J has no lead entity/function; leads created only via seam M6-2 | **ESC-JRN-LEAD-DIST** (esc_registry.md; human Board) |
| Search & Discovery journey | Already owned by `J-GST`/`J-BUY` (marketplace_ux.md) | Extension hook = marketplace_ux.md §12; no new doc |
| FX-AI · FX-ERP · FX-EMAIL · FX-API · FX-MOBILE · FX-EXTAPPR | Reserved future extensions | Owned by marketplace_ux.md §12 (unchanged) |
| Per-file gaps | — | Each domain file closes with its own Not-Covered ledger; this table aggregates only cross-cutting items |

---

## 9. Glossary

- **Journey** — a narrated path an actor (or ⚙ System) takes through wired contracts; may span
  modules via seams; coins nothing.
- **Lifecycle** — a journey bound to one frozen state machine (Doc-2 §5) or status enum (Doc-2 §3).
- **Seam** — a frozen cross-module hop (event or service), navigated by its Doc-4M §M6 label.
- **Firewall** — the §4 governance-signal separation (CLAUDE.md); display-silent in journeys.
- **Append-only revision (`↦`)** — a new immutable version of a document/quotation; not a
  transition.
- **Byte-equivalence** — an excluded/blacklisted vendor's experience is byte-identical to a
  non-matched vendor's (Invariant #11).
- **Actor journey / lifecycle journey** — see §1.

---

## 10. Appendix — Review adjudication records

### R2 — Review B (fresh-context adversarial, 2026-07-06)

Verdict on the authored suite: REVISION — 2 BLOCKER / 4 MAJOR / 5 MINOR / 1 NIT / 1 OBS. All 13
findings adjudicated **valid + accepted** (§13 gate) and fixed in place:

- **BLOCKER-1** J-BAN drew expiry from `[active]` — frozen machine is linear `active → lifted →
  expired`, expiry archives a **lifted** ban only (`expected_state=lifted`). Redrawn.
- **BLOCKER-2** J-TKT drew reopen/admin-close edges — Doc-4H BC-COMM-4 is strictly linear; the
  Doc-4M §M5 variant edges are an unregistered frozen-vs-frozen variance → **registered as
  `ESC-JRN-TKT-MACHINE`** (Flag-and-Halt, mirrors `ESC-7G-LEAD-MACHINE`). Rebound to Doc-4H.
- **MAJOR-1** `issue_engagement_document` `doc_kind` is `<loi|po|wcc>` — challan is §F5.3-only. Fixed.
- **MAJOR-2** `(WorkCompletionIssued)` exists (WCC issuance → Trust input); the "no event" rail
  scoped to LOI/PO. Fixed in J-DOC/J-WCC + §7.
- **MAJOR-3** `(DisputeRecorded)` exists (trade invoice `→ [disputed]` → Trust input
  `input_type=dispute`). Named in J-DSP/J-FIN + §7; rail reworded to "by event, never by write".
- **MAJOR-4** §7 Events column under-populated — Doc-2 §8 families added (`QuotationSubmitted/
  Withdrawn/Selected`, `RFQMatched/RFQRouted`, `VendorClaimed/VendorSuspended`,
  `MicrositePublished/MicrositeDomainChanged`, `EngagementCompleted`, `RFQClosedLost`,
  `BuyerFeedbackRecorded`).
- **MINORs** J-AI tokens reframed as Doc-4M navigation keys (marked legend exception);
  withdrawal-penalty nuance rebound to Doc-3 §8.3/§8.4; lead-credit citations §6→§11; J-FRD bound
  to the Doc-2 §3.6 signal enum (retyped L); §4 composition `J-ADM-06` org leg → J-SUC.
- **NIT** J-CRM/J-MOD retitled per the §1 convention. **OBS** `ops.record_buyer_feedback.v1`
  vs `trust.submit_review.v1` distinction added to J-ENG rails + File E ledger.

### R1 — Board Review (plan stage, 2026-07-06)

The plan received an Architecture Board Hard Review (0 BLOCKER / 4 MAJOR / 8 MINOR / 9 NIT →
PASS WITH PATCH). All findings adjudicated per CLAUDE.md §13 and **accepted**; realized
structurally in this atlas:

| Finding | Realized where |
|---|---|
| MAJOR-01 ownership boundary | §3.3 item 2 (mandatory Ownership block) |
| MAJOR-02 entry/exit criteria | §3.3 item 5 (frozen-pointer-only criteria) |
| MAJOR-03 atlas governance/versioning | §3 (registration lifecycle, ID policy, deprecation) |
| MAJOR-04 actor↔lifecycle relationship | §4 (composition map) + template §9 (Related Journeys) |
| MINOR-01…08 | §2 legend/notation · §1 title convention · §3.3 actors/breadcrumbs · §7 extended matrix · §8 Not-Covered convention · §3.2 ID reservation |
| NITs (9) | Alphabetical registry (§5), terminology rule (§1/§9), heading order (§3.3), uniform arrows (§2), glossary (§9), `code` states (§2), `⚙ System` label (§2), marketplace_ux.md cross-links (§0/§5) |

Authoring-time anchor resolutions (per plan step 1 — every state set re-read verbatim from
Doc-2 §5/§3, correcting earlier exploration paraphrases): Engagement = `[open] → [in_delivery] →
[completed] → [closed]` (dispute is **recorded**, not a state); Vendor Lead stage =
`[received]/[quoted]/[negotiation]/[won]/[lost]/[follow_up]` per Doc-2 §3 — the Doc-4M variance
is the already-registered reconciliation item `ESC-7G-LEAD-MACHINE`; `identity.create_role.v1`
**exists** (Doc-4C §C7 — custom org-scoped bundles; the four system seeds are immutable;
`[ESC-IDN-SLUG]` carried); Membership includes `[pending]` (§5.2); Delegation Grant starts at
`[draft]` and supports `⇄ [suspended]` (§5.10); Organization = `[active] ⇄ [suspended] →
[soft_deleted]` + restore (§5.1); Verification = `[requested]/[in_review]` with more-info loop
and `[revoked]` (§5.6); Quotation has **no** `shortlisted` state (§5.5 — RFQ-level only, §5.4);
Platform Invoice has **no** `draft` state (`[issued] → [paid]/[overdue]/[void]`, §3). No
corpus-internal conflict found; no Flag-and-Halt raised.

---

*This atlas is non-authoritative. It registers journeys and their governance; it introduces no
architecture change and coins no state, transition, contract, permission, or event. On any
conflict, the frozen document wins and this file is patched to match (CLAUDE.md §7, §11).*

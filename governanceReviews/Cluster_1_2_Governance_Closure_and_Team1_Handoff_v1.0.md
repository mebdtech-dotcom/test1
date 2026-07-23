# Cluster #1 & #2 — Governance Closure and Team-1 Handoff

> **Provenance (branch authoring record) — reconciled to `main` in the D2-08 forward-PR.** The patch this record authored folded on `main` as **Doc-2 v1.0.10 (PATCH-D2-08)**; in-body references to "v1.0.9" are the branch-authoring number (on `main`, v1.0.9 = the Communication Audit patch). Renumber per `governanceReviews/RULING_Doc-2_v1.0.9_Collision_Renumber_SchemeB_v1.0.md` (Scheme B).

**Version:** v1.1 · **Date:** 2026-07-19 (v1.0 base + additive Amendment A1, same day — §7;
no base text altered)
**Status:** CLOSED (all rulings issued) · Team-1 handoff **PARKED** · implementation **NOT authorized**
**Drafted by:** governance session (chat-only; zero project code touched)
**Ruled by:** Owner/Board, 2026-07-19 (D1–D4 issued in-session)
**Authority posture:** This record is the authoritative **session closure and implementation
handoff**. The frozen corpus (`generatedDocs/`) remains authoritative for every module contract;
on any conflict the frozen document wins (CLAUDE.md §7). All entity/event/enum names below that
are not already frozen are **indicative** — exact wire names are minted only in their owning
contract lanes (§5).

---

## 1. Purpose and status

Two vendor-workspace navigation clusters were audited for duplication, ruled on, and consolidated
into a single parked implementation handoff.

```text
GOVERNANCE PACKAGE:        CLOSED
CODE CHANGES THIS SESSION: NONE
IMPLEMENTATION AUTHORIZED: NO
NEXT ACTION:               Explicitly route the handoff to Team 1
```

Proposed escalation handles (registry-verified non-colliding at draft time; mint on first
contract-lane use): `ESC-INQ-ONTOLOGY` · `ESC-OPS-BUYER-CRM` · `ESC-COMM-INBOX`.

---

## 2. Cluster #1 — Leadboard / RFQs overlap

### 2.1 Finding

`/sell/rfqs` ("RFQ Leads" in nav; M3 invitation inbox + quotation authoring, read
`rfq.list_invitations`) and `/sell/leads` ("Leadboard"; M4 private CRM stage board of the same
received invitations, read `ops.list_leads.v1`) present the **same underlying entity — RFQ
invitations delivered on `VendorInvited` — through two lenses**, under two colliding "lead"
labels.

### 2.2 Ruling (owner, 2026-07-19)

Fold the Leadboard's board view into `/sell/rfqs` as an **Inbox ⇄ Board view toggle**; retire
`/sell/leads` as a separate nav destination (board stays reachable as a view); de-collide labels
→ inbox **"RFQs & Quotations"**, board **"Pipeline"** tab.

### 2.3 Review outcome (Dev→A→B pipeline)

- **Team-4 Review-A:** *conformant-with-fixes* — 0 BLOCKER / 0 MAJOR. Pivotal: the leads page's
  "PL-1 / companion §13.2" citation resolves to the **non-frozen** design companion
  (`docs/product/requirements/vendor_planning_and_design.md`, v0.9-rc), not the Journey Atlas.
  The frozen owner **Doc-7G fixes the view inventory + bindings and defers routes/nav to
  implementation** (`Doc-7G_Content_v1.0_Pass2.md:126`, in the frozen effective set per
  `Doc-7G_SERIES_FROZEN_v1.0.md:21`). No Flag-and-Halt required.
- **Team-5 Review-B (adversarial):** **UPHOLDS** the governance clearance on independent
  re-verification (Doc-7G, Doc-4F, Journey Atlas), and raised the completeness gap now recorded
  as F1 plus three MINORs (F2–F4). No frozen doc mandates a distinct pipeline destination; none
  forbids composing an M3 read and an M4 read on one presentation surface.
- **Gate:** BLOCKER 0 · MAJOR 0 · MINOR 0 **achieved only when F1–F7 land together**.

### 2.4 F1–F7 implementation specification

| # | Sev | Requirement |
|---|---|---|
| F1 | MAJOR | Repoint **every** internal `/sell/leads*` reference (documents-hub link, next-actions-card ×3, sell-dashboard "Sales pipeline", lead-detail breadcrumb, board/list card deep-links — most are `${basePath}/leads` template forms invisible to a `/`-prefixed grep) → `/sell/rfqs?view=board` (or detail equivalent), **and** add a **308 redirect** `/sell/leads → /sell/rfqs?view=board`. No redirect infrastructure exists today; introduce it. |
| F2 | MINOR | Add allowlisted `?view=inbox\|board` param; the board view ignores `?state=` (quotation-state is meaningless on a lead board); sidebar `isActive` must match `/sell/rfqs` across its query variants. |
| F3 | MINOR | Decide and implement the `/sell/leads/[leadId]` detail-route fate (keep/re-home); reuse `LeadPipeline`/`LeadBoard`/`LeadList` under the toggle; fix the detail breadcrumb. |
| F4 | MINOR | Retire the "Leadboard" term everywhere it appears (nav label, docs-hub link, detail breadcrumb, "Open Leadboard" CTA, `metadata.title`, `PageHeader` title). |
| F5 | MINOR | The toggle **delegates** to each view's byte-locked canonical empty state (Inbox owns "No invitations…", List owns "No leads…", `[ESC-7B-EMPTY-LOCK]`); never coin a third destination-level empty. |
| F6 | MINOR | The aggregate-free guard binds the **shared `RfqStatCards` band**, not only board columns: no lead-derived count/denominator enters the shared header (ND-8 / Doc-7G GR11); the `QuotaMeter` stays scoped to the inbox/quotation context (Inv #10: entitlement, never plan name). |
| F7 | MINOR | Additive-patch the non-frozen vendor design companion IA to record the nav re-home (companion conforms upward; no frozen doc touched). |

### 2.5 Relationship-cluster audit (context for Cluster #2)

Leadboard / Engagements / Buyer CRM = **funnel + lens, not duplicates**: pre-award pipeline
(`/sell/rfqs` post-merge) → post-award relationships (`/sell/engagements`, M4, created on award)
→ buyer-axis private record (`/sell/buyer-crm`, M4). Also flagged distinct-by-design: **Finance
(M4 trade finance) ≠ Billing & Plan (M7 platform billing)** — label confusion noted, merging
would breach the platform money boundary; terminology deferred (§5).

---

## 3. Cluster #2 — Buyer Inquiries · Messages · Buyer CRM (rulings D1–D4)

Audit verdict: PASS — no duplicate implementation existed (all three surfaces were honest unwired
shells). Immediate ruling kept all three; `/sell/inquiries` locked at **Concept Pending** (no
entity · no API · no persistence · no permissions · no navigation counters · no entitlement
consumption). Struck driver: **M7 lead credits do not evidence an Inquiry aggregate** —
entitlement consumption is decided after ontology, never used as evidence for it.

### D1 — Inquiry ontology · **APPROVED: Option B**

> A buyer inquiry is **not** an independent domain aggregate. It is an **M6 conversation thread
> classified by business context.**

Consequences: no Inquiry entity/fields/lifecycle/dedup anywhere; no conversion object (a buyer
creates an RFQ via M3's normal front door; the thread may link it by ID); M7 metering moot (no
object); anonymous initiation dissolves into M6's authentication posture (public "Contact" CTA =
sign-in → thread; Inv #5); `/sell/inquiries` fate sealed → Messages filter chip (execution per D4).

### D2 — Buyer CRM sources · **APPROVED: five channels + Provenance Ladder**

Ownership settled in the immediate ruling: the surface is **M4-Operations-owned** (unfrozen
concept, now reserved under M4).

| Channel | Ruling |
|---|---|
| Manual vendor entry | APPROVE |
| RFQ participation | APPROVE (auto-create out-of-wire on own-invitation facts — the leads/engagements event pattern) |
| Awarded engagement | APPROVE |
| Conversation participation | APPROVE **AS CONTACT TIER ONLY** |
| Imported private contacts | APPROVE **WITH STRICT CONTROLS** (controls defined at Doc-4F patch time; tunable values → Doc-3 POLICY keys) |

**Provenance Ladder (binding):** not all sources carry equal weight; a mere conversation never
makes the system call anyone a "qualified lead" or "customer."

```text
MANUAL_OR_IMPORTED < CONVERSATION < RFQ_PARTICIPATION < ENGAGEMENT < AWARDED_CUSTOMER
```

(D4 confirmed: manual and imported collapse into one unverified base tier; tokens indicative.)

**Privacy floor (non-negotiable):** a record renders only vendor-authored data plus facts the
vendor holds through its own participation; buyer-side private decisions (blacklist above all —
Inv #11) stay undetectable, symmetrically; CRM data never mutates platform-wide scores (§4
firewall; §3 M4 note). Stage labels speak in private-CRM voice — never platform-voiced award
status.

### D3 — Unified inbox scope · **APPROVED with explicit context boundaries**

- **M6 owns:** the unified inbox, threads, messages, delivery state, unread state. **M6 does not
  own** RFQs, engagements, CRM records, support cases, products, or vendor profiles — it
  references them through approved contracts only.
- **Non-anchored threads:** `GENERAL_INQUIRY` threads APPROVED without a business-record anchor —
  authenticated org↔org only (**anonymous creation NOT approved**); required minimum: buyer org,
  vendor org, initiating user, context classification, subject, initial message. A non-anchored
  thread is not automatically an RFQ, not automatically a qualified lead, consumes no lead
  credits by existing, and is protected by rate limits and abuse controls (values → Doc-3).
  Later association with an RFQ/engagement only via explicit approved action.
- **Context references:** optional contextual anchors via a **primary-context model**
  (`primary_context_type` + `primary_context_reference` + `context_snapshot_label`) — never
  multiple nullable cross-module foreign keys; no cross-module DB FK; the snapshot label is
  presentation-safe history, never a duplicated Product model. Initial public-marketplace
  reference set: `VENDOR_PROFILE` · `PRODUCT` · `SHOWCASE_PROJECT`. RFQ and Engagement
  association through owner contracts.
- **Projection set:** `GENERAL_INQUIRY` · `RFQ` · `ENGAGEMENT`. UI chips:
  `All · Unread · Inquiries · RFQs · Engagements` ("Unread" = cross-context presentation filter,
  not a business classification). **"Orders" REJECTED** as canonical label — the projected M4
  scope (LOI/PO/Challan/Invoice/…) is broader than purchase orders.
- **Authorization:** M6 never infers access from possession of an identifier — it asks the owner
  module (M3 for RFQ context, M4 for engagement context).
- **Projection exclusions (binding):** no buyer internal notes, quotation comparisons, hidden
  shortlist status, other vendors' participation, private award decisions, Buyer CRM data,
  unsupported billing qualification, or cross-organization contact data.
- **Support: SEPARATED.** Platform↔user support ≠ buyer↔vendor commercial messaging. Distinct
  thread classes (`COMMERCIAL_THREAD` / `SUPPORT_THREAD`), distinct inbox projections; the
  conversation-thread **component** may be reused (*shared component ≠ shared inbox*). Support
  never appears in the Buyer Relationships timeline as a buyer interaction.
- **CRM seam:** M6 emits a participation fact (indicative: `commercial_conversation_started`);
  M4 decides the relationship consequence. M6 never creates CRM records, chooses stages,
  classifies contacts, or stores M4 private notes.

### D4 — Navigation, terminology, provenance interpretation · **APPROVED**

1. **`/sell/inquiries` retirement APPROVED**: redirect → `/sell/messages?context=general_inquiry`.
   **Interim rule:** the Concept-Pending shell may stand until the unified inbox is implemented —
   it must accrete no APIs, persistence, permissions, counters, or domain logic meanwhile. At
   implementation: remove the sidebar item, keep the backward-compatible redirect, sweep
   bookmarks/internal links/tests/navigation fixtures.
2. **Messages chips APPROVED AS WRITTEN** (canonical set above). The shipped `messages-view.tsx`
   chip row (`All · Unread · RFQs · Orders`) is label-non-conformant on its face → sweep item C3.
3. **Terminology — two-register split:** UI term = **"Buyer Relationships"** (sidebar, page
   title, breadcrumbs, user-facing copy, empty states); internal domain term remains
   **"Buyer CRM"** (bounded-context docs, service/capability descriptions, analytics identifiers,
   internal code names unless separately approved). Explicitly a presentation change — **no
   `BuyerRelationship` domain concept is minted** to match the label.
4. **Provenance readings CONFIRMED + AMENDED — Provenance ≠ Stage:**
   - `effective_provenance` = strongest verified source **ever observed** (max-over-history,
     monotone); complete provenance history preserved; later weaker events never downgrade;
     manual edits never erase stronger system-observed provenance.
   - **CRM stage** = the vendor's current relationship-management state, vendor-controlled.
   - `Provenance: AWARDED_CUSTOMER + Stage: Dormant` is valid — provenance evidences the
     relationship; stage manages it.

---

## 4. Consolidated Team-1 handoff — "Vendor nav rationalization" (one change-set)

### 4.1 Work items

**Cluster #1 — F1–F7** exactly as specified in §2.4.

**Cluster #2 — C1–C6:**

| # | Item |
|---|---|
| C1 | Retire the `/sell/inquiries` standalone workspace (sidebar item removed) |
| C2 | Backward-compatible 308 redirect `/sell/inquiries → /sell/messages?context=general_inquiry` |
| C3 | Messages chips → `All · Unread · Inquiries · RFQs · Engagements` (drop `Orders`) |
| C4 | UI rename of the M4 surface → **"Buyer Relationships"** (nav, title, breadcrumbs, copy, empty states) |
| C5 | Retain **"Buyer CRM"** as the internal domain term (no entity rename, no new concept) |
| C6 | Implement provenance-tier **presentation** rules (tier display per §3-D2/D4; private-CRM voice; no auto-labels beyond verified tier) |

### 4.2 Dependencies and sequencing

- F1–F7 form one atomic change-set (the review gate 0·0·0 holds only with all seven landed).
- **C1–C3 execute WITH the unified-inbox implementation, not before** (D4 interim rule). C4–C6
  may land earlier as pure presentation changes if routed.
- F-set and C-set touch the same nav surface (`vendor-shell-vm.ts`, sidebar, Messages shell) —
  route together to avoid double churn.
- Contract-lane dispositions (§5) are prerequisites for any **wiring**, not for the
  presentation-only change-set.

### 4.3 Acceptance criteria

1. `/sell/rfqs` hosts Inbox ⇄ Board toggle; `?view=` allowlisted; `?state=` interaction per F2;
   sidebar highlight correct across query variants.
2. Zero remaining internal references to `/sell/leads*` or `/sell/inquiries` as destinations
   (grep must cover `${basePath}`/template-literal forms, not just leading-slash literals); both
   redirects live and hit their targets.
3. No occurrence of the labels "Leadboard" / "RFQ Leads" in user-facing surfaces; "Buyer
   Relationships" renders in all five user-facing registers (C4); internal identifiers unchanged.
4. Canonical empty states remain byte-identical to their component owners (F5); no new empty copy
   introduced.
5. No lead-derived aggregate appears in the shared stat band; QuotaMeter remains inbox-scoped (F6).
6. Messages chips match the canonical set; chips carry no counts until reads are wired.
7. Companion IA additive patch recorded (F7); VX-01 mockup divergence noted additively.
8. `tsc` clean; route sweep under `IVENDORZ_DEMO_MODE=1` renders all affected routes; CI (the
   build oracle) green before any merge claim.

### 4.4 Explicitly excluded work (not authorized by this record)

- Any M6 unified-inbox **read/write implementation**, thread persistence, or send command.
- Any M4 Buyer-CRM/Buyer-Relationships **read/write implementation**, seeding events, or
  provenance computation.
- Any contract, schema, event, or POLICY authoring (owned by §5 lanes, human-approved).
- Any entitlement/lead-credit consumption design (M7 lane, post-ontology, explicitly struck as a
  driver).
- The buyer-side workspace (untouched by this package).

---

## 5. Documentation-lane disposition

Each ruling lands as an **additive patch in its owner's lane**, human-approved (CLAUDE.md §8);
nothing in this record modifies a frozen document.

| Lane | Content to patch (additive) |
|---|---|
| **Doc-4H / M6 (Communication)** | Thread classification model (`COMMERCIAL_THREAD`/`SUPPORT_THREAD`, `GENERAL_INQUIRY` context), primary-context reference contract, unified commercial inbox projection contract + exclusion list, owner-module authorization rule, participation-fact emission |
| **Event catalog lane (Doc-4J authoritative; Doc-2 §8)** | Exact wire name/shape of the participation fact (indicative: `commercial_conversation_started`) |
| **Doc-4F / M4 (Operations) — BC-OPS lane** | Buyer-CRM seeding channels, Provenance Ladder (enum + max-over-history derivation), Provenance≠Stage model, import strict-control behavior, privacy floor |
| **Doc-3 POLICY keys** | Rate-limit / abuse-control / import-control tunable values (keys in Doc-3, behavior in Doc-4 — never in ADR text) |
| **Frontend/navigation contracts (non-frozen companion)** | F7 companion IA patch; VX-01 mockup divergence notes (`/sell/leads`, `/sell/inquiries`); chip set; "Buyer Relationships" UI register |
| **Deferred — Finance/Billing terminology** | "Finance" (M4 trade) vs "Billing & Plan" (M7 platform) label confusion: flagged, **no ruling**; must never merge (platform money boundary). Take up separately if desired |

---

## 6. Authorization gate

```text
STATUS: PARKED
CODE CHANGES: NONE
IMPLEMENTATION AUTHORIZED: NO
NEXT ACTION: Explicitly route to Team 1
```

At routing time, this record may generate the narrower execution-only work order
`Team1_RFQ_Messages_CRM_Navigation_Build_Order_v1.0.md`. Until then, no build activity is
authorized by this document.

---

## 7. Amendment A1 — D4-C4 route amendment (additive, owner-ruled 2026-07-19)

Amends D4 item 3 / handoff item C4 ("route path `/sell/buyer-crm` is NOT renamed"). Recorded as
an additive amendment, not a replacement; the v1.0 base text above is preserved as-written.

```text
D4-C4 AMENDMENT A1

The Buyer CRM surface is renamed at both presentation and route levels.

Canonical index:   /sell/buyer-relationships
Canonical detail:  /sell/buyer-relationships/[relationshipId]

Legacy route:      /sell/buyer-crm
Legacy behavior:   Permanent 308 redirect to the canonical index route;
                   query parameters preserved where technically supported.

Reason:            Align the user-facing navigation label, page title, copied
                   URLs, deep links, and canonical detail hierarchy under one
                   route base.
```

**Implementation constraint (binding):** no two active route trees — `/sell/buyer-crm` is a
redirect source only; it must not render the page, host nested detail routes, or become an
alternate canonical URL. D4-C5 is unchanged: the internal domain term remains "Buyer CRM"; no
`BuyerRelationship` domain concept is minted.

**Execution home:** the amendment executes with the Buyer Relationships presentation build
(design plan build-gate step 4), not as a standalone change. Full design context:
`governanceReviews/Buyer_Relationships_Design_Plan_v0.2.md` (FREEZE-READY, owner rulings of
2026-07-19 §11).

# Journeys — Business Operations (M4)

**Breadcrumb:** [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) ▸ File E — Business Operations
**Status:** **DRAFT v1.0** — non-authoritative companion (atlas §0 stance applies in full)
**Date:** 2026-07-06
**Owner module:** M4 Business Operations (`operations` · Doc-4F)
**Journeys:** J-ENG · J-DOC · J-DLV · J-WCC · J-DSP · J-LEAD · J-CRM · J-TPL · J-FIN
**Legend/notation:** atlas §2 · **Actor journeys composed:** `J-PROC` §4 (buyer leg), `J-SUP` §6
(vendor leg) — marketplace_ux.md

> **Authority stance.** Non-authoritative companion. States resolve to **Doc-2 §5.9 + §3**
> (`engagements`, `vendor_leads`, `private_vendor_records`, `trade_invoices`,
> `payment_records`); contracts to **Doc-4F** (BC-OPS-1 Buyer Private CRM · BC-OPS-2 Procurement
> Engagements · BC-OPS-3 Vendor Lead Pipeline · BC-OPS-4 Document Generation & Templates ·
> BC-OPS-5 Finance Records). Escalation marker carried verbatim: **`PATCH-02`** (claim lifecycle
> never applies to private vendor records). Binding rails for the whole file: **money boundary**
> — the platform records post-award documents and payments, **never settles, escrows, or holds
> buyer↔vendor money**; the **append-only change idiom** — engagement documents change by `↦`
> version, never by status; **`operations.trade_invoices` ≠ `billing.platform_invoices`**;
> buyer-private CRM data **never** mutates platform-wide scores (§4 firewall, Invariant #11).
> On any conflict the frozen corpus wins and this file is patched.

---

## E1. Engagement Lifecycle — `J-ENG`

**Breadcrumb:** Atlas ▸ Operations ▸ Engagement Lifecycle

| Ownership | |
|---|---|
| Owner Module | M4 Operations (BC-OPS-2, `engagements` AR) |
| Participating Modules | M3 (created from `(RFQClosedWon)`, seam M6-1); M5 (completion feeds performance inputs) |
| Authoritative Documents | Doc-2 §3 (`engagements`: `status open/in_delivery/completed/closed`, shared both parties, `human_ref`, award value snapshot); Doc-4F BC-OPS-2 |
| Read-only References | Doc-7F/7G (post-award workspaces) |

**Actors:** Primary — buyer + vendor orgs (shared record, party columns + RLS). ⚙ System —
creation consumer.

**Intent arc:** Award → Fulfilment → Completion → Record.
**Goal:** the post-award container — every document, delivery, payment record, and dispute hangs
off exactly one engagement.

**Entry:** `(RFQClosedWon)` (J-AWD-04) — the engagement is created **directly** by the event
consumer; there is no acceptance step.
**Exit:** `[closed]` (administrative close/archive after `[completed]`).

```
(RFQClosedWon) → [open] → first delivery recorded → [in_delivery] → work completed → [completed] → [closed]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-ENG-01 | Create | ⚙ consumer of `(RFQClosedWon)` (seam M6-1) | `[open]` | `human_ref` + award value snapshot; **no vendor-accept state exists** |
| J-ENG-02 | Document | → J-DOC (LOI/PO issue) | `[open]` | Chain starts inside the container |
| J-ENG-03 | Deliver | → J-DLV (challans recorded) | `[open] → [in_delivery]` | Status may attend deliveries; the recording contract itself performs **no transition** |
| J-ENG-04 | Complete | → J-WCC (WCC issued) | `[in_delivery] → [completed]` | Completion feeds performance inputs (J-PSC) |
| J-ENG-05 | Dispute (if raised) | → J-DSP (recorded on the container) | unchanged | **Dispute is recorded, not a state** (Doc-2 §9 audit) |
| J-ENG-06 | Close | administrative close | `[completed] → [closed]` | Soft close/archive; audit retained |

**Governance rails:** shared tenancy — both parties read via party columns, neither owns the
other's private annotations; buyer feedback has **two distinct frozen instruments** — the
engagement-bound `ops.record_buyer_feedback.v1` (emits `(BuyerFeedbackRecorded)` → Trust
performance input) and the public review `trust.submit_review.v1` (→ J-REV) — never conflated;
dispute evidence requires the **full document chain** (Doc-2 §9).
**Success:** ✔ engagement exists before any post-award document; ✔ status walk matches the
frozen enum only; ✔ closure preserves the immutable record.

**Related:** upstream J-AWD (M6-1) · children J-DOC, J-DLV, J-WCC, J-DSP, J-FIN · feeds J-PSC,
J-REV · composed by `J-PROC-13`, `J-SUP-07`.

---

## E2. Engagement Document Chain Journey — `J-DOC`

**Breadcrumb:** Atlas ▸ Operations ▸ Engagement Document Chain Journey

| Ownership | |
|---|---|
| Owner Module | M4 Operations (BC-OPS-2 documents; BC-OPS-4 generation/templates) |
| Participating Modules | M0 (audit); M6 (delivery of notifications) |
| Authoritative Documents | Doc-4F §F5.4 (`ops.issue_engagement_document.v1`, `ops.revise_engagement_document.v1`); Doc-2 §3 (`lois`/`purchase_orders`/`work_completion_certificates`) |
| Read-only References | Doc-7F/7G document workspaces; J-TPL (template used) |

**Actors:** Primary — issuing party User (`«can_create_documents»` family; **`«can_approve_po»`
additionally required for `doc_kind = po`** — an issuer-side financial-authority slug, never
collapsed into document creation).

**Intent arc:** Commitment → Formalization → Evidence → Archive.
**Goal:** the immutable commercial paper trail: `loi → po → challan → wcc` — where LOI/PO/WCC
ride `ops.issue_engagement_document.v1` (`doc_kind enum<loi|po|wcc>`) and **challans ride
`ops.record_delivery.v1` only** (§F5.3, → J-DLV); trade invoices and payments are **separate
aggregates** (→ J-FIN).

**Entry:** engagement `[open]`+ (J-ENG).
**Exit:** chain archived within the engagement record — documents have **no lifecycle states**,
only versions.

```
issue LOI ↦ … → issue PO («can_approve_po») ↦ revision (reason) → challans (J-DLV) → WCC (J-WCC)
(every ↦ = new version_no; is_active_revision moves; prior versions retained forever)
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| J-DOC-01 | Issue | `ops.issue_engagement_document.v1` (`doc_kind ∈ loi/po/wcc` — challans are §F5.3-only, → J-DLV) | `version_no = 1`, `issued_by/at` recorded; generated docs record the `template_version` used (J-TPL) |
| J-DOC-02 | Approve PO | `«can_approve_po»` gate on `doc_kind = po` | **Issuer-side authority only — no "vendor accepts PO" transition exists anywhere; never draw one** |
| J-DOC-03 | Revise | `ops.revise_engagement_document.v1` | `↦` new `version_no` + `revision_reason`; `is_active_revision` flips; **no event — state + audit only** |
| J-DOC-04 | Evidence | chain accumulates (challan legs → J-DLV; WCC leg → J-WCC) | Dispute evidence requires the **full chain** (J-DSP) |
| J-DOC-05 | Archive | rests within engagement `[closed]` | Immutable forever (Invariant #8) |

**Governance rails:** documents carry **no acceptance/approval status enum** — acceptance
semantics simply do not exist in the frozen model; **LOI/PO** issuance/revision emit **no domain
event** (state + audit only) — WCC issuance is the exception: it emits `(WorkCompletionIssued)`
as a performance input (→ J-WCC); counterparty visibility rides the shared engagement, not
per-document grants.
**Success:** ✔ kinds within the frozen enum only; ✔ every change a reasoned version; ✔ zero
acceptance states drawn.

**Related:** container J-ENG · delivery legs J-DLV · completion J-WCC · money records J-FIN ·
template J-TPL · composed by `J-PROC-13`, `J-SUP-07`.

---

## E3. Delivery Recording Journey — `J-DLV`

**Breadcrumb:** Atlas ▸ Operations ▸ Delivery Recording Journey

| Ownership | |
|---|---|
| Owner Module | M4 Operations (BC-OPS-2) |
| Participating Modules | M0 (outbox: `(DeliveryRecorded)`) |
| Authoritative Documents | Doc-4F §F5.3 (`ops.record_delivery.v1`); Doc-2 §3 (`engagements.status`) |
| Read-only References | Doc-7G (vendor fulfilment) · Doc-7F (buyer receipt view) |

**Actors:** Primary — vendor User (records/uploads). Supporting — buyer (views evidence).

**Intent arc:** Ready → Evidence → Receipt.
**Goal:** document-evidenced delivery — **there is no goods-delivery state machine** (no
`dispatched/in-transit/delivered/received` states exist; none are drawn). Delivery is a chain of
versioned challans.

**Entry:** engagement `[open]` or `[in_delivery]`; PO typically issued (J-DOC).
**Exit:** deliveries evidenced by challans; engagement `[in_delivery]` attended.

```
prepare → record delivery ↦ challan (versioned) + (DeliveryRecorded) → repeat per consignment → hand to J-WCC
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| J-DLV-01 | Record | `ops.record_delivery.v1` (or `upload_delivery_challan`) | Appends a versioned **challan**; emits `(DeliveryRecorded)`; **the contract performs no engagement transition** — `[in_delivery]` may attend it |
| J-DLV-02 | Evidence | challan versions accumulate (`↦`) | Immutable; part of the dispute-evidence chain |
| J-DLV-03 | Receipt view | buyer reads the shared engagement | No "received/accepted" state exists — receipt disagreements ride J-DSP |
| J-DLV-04 | Repeat | per consignment | Multiple challans per engagement are normal |

**Governance rails:** never conflate with Doc-4H "Delivery Tracking" — that is **message/channel
delivery** (`email/sms/whatsapp` logs, → J-NTF), a false friend; physical logistics states are
out of scope platform-wide (no shipment tracker is ratified).
**Success:** ✔ every consignment evidenced; ✔ zero coined logistics states; ✔ event emitted per
recording.

**Related:** container J-ENG · chain J-DOC · completion J-WCC · composed by `J-SUP-07`,
`J-PROC-13`.

---

## E4. Work Completion Journey — `J-WCC`

**Breadcrumb:** Atlas ▸ Operations ▸ Work Completion Journey

| Ownership | |
|---|---|
| Owner Module | M4 Operations (BC-OPS-2, `work_completion_certificates`) |
| Participating Modules | M5 (WCC = proof-of-work Trust/performance input) |
| Authoritative Documents | Doc-4F BC-OPS-2; Doc-2 §3 (`engagements`) |
| Read-only References | Doc-7F/7G |

**Actors:** Primary — buyer User (certifies completion). Supporting — vendor (delivers, views).

**Intent arc:** Progress → Inspection → Acceptance → Standing.
**Goal:** close the fulfilment loop with a Work Completion Certificate — the engagement's
completion evidence and the vendor's performance proof.

**Entry:** engagement `[in_delivery]` with delivery evidence (J-DLV).
**Exit:** WCC issued; engagement `[completed]`.

```
work progresses → inspection (buyer-internal) → issue WCC ↦ → engagement [completed] → performance input (J-PSC)
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-WCC-01 | Progress | deliveries accumulate (J-DLV) | `[in_delivery]` | — |
| J-WCC-02 | Inspect | buyer-internal review of the chain | `[in_delivery]` | Platform records outcomes; inspection process itself is off-platform/buyer-internal |
| J-WCC-03 | Certify | issue WCC (`ops.issue_engagement_document.v1`, `doc_kind wcc`) | — | Versioned like all documents (`↦` revisions with reason); **emits `(WorkCompletionIssued)`** — emit, never score (Doc-4F §F5.4) |
| J-WCC-04 | Complete | engagement transition | `[in_delivery] → [completed]` | WCC = **proof-of-work** — `(WorkCompletionIssued)` consumed by Trust into performance inputs (J-PSC) |
| J-WCC-05 | Review (optional) | → J-REV (buyer feedback, engagement-anchored) | `[completed]` | Post-award-only review gate satisfied |

**Governance rails:** the WCC is a certificate **document**, not a state machine; completion
standing flows to M5 as inputs, never as a score write; a disputed inspection rides J-DSP without
inventing a "failed inspection" state.
**Success:** ✔ WCC in the chain; ✔ engagement `[completed]`; ✔ performance input recorded.

**Related:** upstream J-DLV · container J-ENG · downstream J-PSC, J-REV, J-FIN (final invoicing)
· composed by `J-PROC-13`, `J-SUP-07`.

---

## E5. Dispute Recording Journey — `J-DSP`

**Breadcrumb:** Atlas ▸ Operations ▸ Dispute Recording Journey

| Ownership | |
|---|---|
| Owner Module | M4 Operations (recorded on the engagement; Doc-2 §9 audit) |
| Participating Modules | M6 (threads for resolution talk); M8 (complaint intake leg, → J-CMPL); M5 (context only — never a direct score write) |
| Authoritative Documents | Doc-2 §9 (audit: "dispute recorded"; evidence requires the full chain); Doc-2 §3 (`trade_invoices.status` includes `[disputed]`) |
| Read-only References | Doc-7F/7G |

**Actors:** Primary — either party User. Supporting — staff (if escalated → J-CMPL).

**Intent arc:** Friction → Record → Evidence → Resolution.
**Goal:** capture commercial disagreement **as a record with evidence** — the engagement has no
`disputed` state; a trade invoice does (`[disputed]`, J-FIN).

**Entry:** engagement in any non-`[closed]` state; a disagreement exists.
**Exit:** dispute resolved off-platform or via records; engagement continues its normal walk
(`[in_delivery]`/`[completed]`/`[closed]`).

```
raise → dispute recorded (audit, engagement container) → evidence = full document chain →
(optional) invoice → [disputed] · thread (J-CHAT) · complaint (J-CMPL) → resolution recorded → continue
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| J-DSP-01 | Record | dispute recorded on the engagement (audited mutation, Doc-2 §9) | **Not an engagement state** — the container keeps its frozen enum |
| J-DSP-02 | Evidence | full chain assembled (LOI/PO/challans/invoices/WCC) | **Dispute evidence requires the full chain** (Doc-2 §9) — why J-DOC immutability matters |
| J-DSP-03 | Commercial leg | trade invoice `→ [disputed]` where money is contested | The only frozen `disputed` status in this domain (J-FIN); the transition emits `(DisputeRecorded)` — consumed by Trust as a performance input (`input_type = dispute`) |
| J-DSP-04 | Communicate | engagement thread (J-CHAT); complaint intake (J-CMPL) if platform action is sought | Platform facilitates records + talk — **never arbitrates funds** |
| J-DSP-05 | Resolve | resolution recorded; invoice leaves `[disputed]` per J-FIN edges | Buyer's private stance may change in J-CRM (private, firewalled) |

**Governance rails:** dispute consequences reach scores **by event, never by write** —
`(DisputeRecorded)` feeds Trust performance inputs (`input_type = dispute`, J-PSC); the buyer's
private stance stays firewalled (J-CRM, Invariant #11); the platform records and communicates —
settlement is off-platform (money boundary).
**Success:** ✔ dispute + resolution recorded with evidence; ✔ zero coined states; ✔ zero funds
movement.

**Related:** container J-ENG · evidence J-DOC/J-DLV/J-FIN · talk J-CHAT · escalation J-CMPL ·
private stance J-CRM.

---

## E6. Vendor Lead Pipeline Lifecycle — `J-LEAD`

**Breadcrumb:** Atlas ▸ Operations ▸ Vendor Lead Pipeline Lifecycle

| Ownership | |
|---|---|
| Owner Module | M4 Operations (BC-OPS-3, `vendor_leads` AR + `lead_activities`) |
| Participating Modules | M3 (creation trigger `(VendorInvited)`, seam M6-2); M7 (credit metering leg, → J-CRED) |
| Authoritative Documents | Doc-2 §3 (`vendor_leads`: `stage received/quoted/negotiation/won/lost/follow_up`, tenant-owned vendor side; `lead_activities` append-only); Doc-4F BC-OPS-3 |
| Read-only References | Doc-7G (pipeline board) |

**Actors:** ⚙ System (creation — **received-only; vendors never self-create leads**). Primary —
vendor User (stage/activities).

**Intent arc:** Opportunity → Pursuit → Outcome → Follow-up.
**Goal:** the vendor's private pipeline over received RFQ invitations — a CRM view, not a
procurement instrument.

**Entry:** `(VendorInvited)` at invitation `[delivered]` (seam M6-2) — undelivered invitations
**never** create leads or visibility.
**Exit:** stage `[won]`/`[lost]` (private CRM outcome) or parked `[follow_up]`.

```
⚙ create on (VendorInvited) → [received] → [quoted] → [negotiation] → [won] / [lost] → [follow_up]
```

| ID | Step | Key actions (pattern · contract) | Stage (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-LEAD-01 | Create | ⚙ `ops.create_lead_on_invitation.v1` | `[received]` | Only creation path; per (rfq, vendor) invitation |
| J-LEAD-02 | Work | `update_lead_stage`, `add_lead_activity` (append-only log) | `[received] → [quoted] → [negotiation]` | `value_estimate`, `next_action_at` are vendor-private planning fields |
| J-LEAD-03 | Outcome | stage set on RFQ closure knowledge | `→ [won]` / `[lost]` | **CRM-labelled outcome — firewalled**: private pipeline bookkeeping, never a platform score/standing input |
| J-LEAD-04 | Follow up | stage | `→ [follow_up]` | Relationship continuation |
| J-LEAD-05 | Meter | lead-access usage (`usage_ledger.source=lead_access`) | — | Billing effect only (→ J-CRED); **credits never gate delivery/visibility** |

**Governance rails:** received-only (no self-created leads); the pipeline emits no event; win/loss
here is the **vendor's private view** — authoritative outcomes live in J-QUO/J-AWD; minimal
projection of RFQ data (owned data + contracts only). Stage-spelling note: Doc-4M consolidates a
different lead state set — a **registered frozen-vs-frozen reconciliation item,
`ESC-7G-LEAD-MACHINE`** (esc_registry.md); this journey binds the Doc-2/Doc-4F/Doc-5F spelling
per that item's interim ruling (per-module authority).
**Success:** ✔ every lead traces to a delivered invitation; ✔ append-only activity trail;
✔ zero leakage into platform signals.

**Related:** upstream J-RINV (M6-2) · quota/metering J-CRED · composed by `J-SUP-01/06`.

---

## E7. Private Vendor Record Lifecycle (Buyer CRM) — `J-CRM`

**Breadcrumb:** Atlas ▸ Operations ▸ Private Vendor Record Lifecycle (Buyer CRM)

| Ownership | |
|---|---|
| Owner Module | M4 Operations (BC-OPS-1, `private_vendor_records`) |
| Participating Modules | none authoritative (nullable link to a marketplace profile by ID) |
| Authoritative Documents | Doc-2 §3 (`private_vendor_records`: buyer `organization_id`, `link_status none/suggested/linked`, `link_confidence` — **never disclosed**; `[active] ⇄ [archived]`); Doc-4F BC-OPS-1; **`PATCH-02`** (claim lifecycle N/A) |
| Read-only References | Doc-7F (Vendor Directory — owner UX law: "Vendor Directory", All-Vendors-first, source-not-trust) |

**Actors:** Primary — buyer Users only. **No vendor visibility, ever.**

**Intent arc:** Knowledge → Judgment → Memory.
**Goal:** the buyer's private book of vendors — statuses, notes, approvals, blacklists — the
fifth governance signal, scoped to **one buyer forever**.

**Entry:** buyer org `[active]`; record created manually, from email/excel import, or linked to a
platform profile.
**Exit:** none — a living private book; records `[archived]` when stale.

```
create/import → (optional) link suggestion → [active] record → status/notes/approve/blacklist → [archived] ⇄ [active]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-CRM-01 | Create | manual / import (`source manual/email_list/excel`) | `[active]` | Off-platform vendors welcome — `linked_vendor_profile_id` nullable |
| J-CRM-02 | Link | `link_status [none] → [suggested] → [linked]` (+ `link_confidence`, `link_confirmed_by`) | `[active]` | Suggestion triage may ride M8 staff tooling (`J-ADM-07`) — **non-disclosure preserved** |
| J-CRM-03 | Annotate | `get/update_crm_status`, `add_crm_note` | `[active]` | Buyer-private status ≠ any platform signal |
| J-CRM-04 | Judge | `set_approved`, `set_blacklist` | `[active]` | **Blacklist undetectable** (Invariant #11): excluded ≡ non-matched, byte-equivalent, forever |
| J-CRM-05 | Archive | archival | `[active] ⇄ [archived]` | Reversible; audit retained |

**Governance rails (firewall — binding):** buyer Approved/Blacklisted **never** mutates
platform-wide scores; the claim lifecycle **never** applies here (`PATCH-02`); the record, its
existence, and its judgments are invisible to the vendor and to other buyers, permanently.
**Success:** ✔ private book complete and private; ✔ blacklist effect expressed only through
byte-equivalent non-matching; ✔ zero cross-tenant leakage.

**Related:** informs J-CMP-04 (buyer-internal) and matching exclusions by pointer ·
link triage `J-ADM-07` · composed by `J-PROC-14`. Board-gated directory questions:
ESC-VENDIR R2–R5 (esc_registry.md).

---

## E8. Document Template Lifecycle — `J-TPL`

**Breadcrumb:** Atlas ▸ Operations ▸ Document Template Lifecycle

| Ownership | |
|---|---|
| Owner Module | M4 Operations (BC-OPS-4, Doc-2 §5.9) |
| Participating Modules | none |
| Authoritative Documents | Doc-2 §5.9; Doc-4F BC-OPS-4 |
| Read-only References | Doc-7F (template manager) |

**Actors:** Primary — buyer-org User (org templates).

**Intent arc:** Standardize → Version → Retire.
**Goal:** reusable generation templates whose **every edit is a retained version**.

**Entry:** org `[active]` with document-generation needs.
**Exit:** `[archived]` (reactivatable).

```
[draft] → activate → [active] ↦ edit (new template_version; prior retained) → [archived] ⇄ [active]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §5.9) | Outcome / governance |
|---|---|---|---|---|
| J-TPL-01 | Draft | template authoring (Doc-4F BC-OPS-4) | `[draft]` | — |
| J-TPL-02 | Activate | activation | `[draft] → [active]` | Usable in J-DOC generation |
| J-TPL-03 | Edit | edit | `[active] ↦ [active]` (new `template_version`) | **Never overwritten**; generated documents record the `template_version` used |
| J-TPL-04 | Archive / reactivate | archive · reactivate | `[active] ⇄ [archived]` | Prior generated documents unaffected |

**Governance rails:** template content is Content; where it renders is Presentation (Invariant
#9); versions retained forever (Invariant #8).
**Success:** ✔ generation always pinned to a version; ✔ archive reversible; ✔ zero overwrites.

**Related:** consumed by J-DOC-01 · composed by `J-PROC-13` (document ops).

---

## E9. Finance Records Journey — `J-FIN`

**Breadcrumb:** Atlas ▸ Operations ▸ Finance Records Journey

| Ownership | |
|---|---|
| Owner Module | M4 Operations (BC-OPS-5, `trade_invoices` + `payment_records`) |
| Participating Modules | none — **explicitly not M7** (`operations.trade_invoices` ≠ `billing.platform_invoices`) |
| Authoritative Documents | Doc-2 §3 (`trade_invoices`: `human_ref INV-…`, `{amount, currency}`, `status issued/partially_paid/paid/disputed/cancelled`, `due_date`, versioned; `payment_records`: `{amount, currency}`, `paid_at`, `method_note`, `status recorded/confirmed` — **no funds custody**); Doc-4F BC-OPS-5 |
| Read-only References | Doc-7F/7G finance views |

**Actors:** Primary — vendor User (issues trade invoice) + buyer User (payment confirmation leg).

**Intent arc:** Bill → Track → Reconcile.
**Goal:** record the commercial money trail between the parties — **records only; the platform
never touches the money** (no escrow, no wallet, no settlement).

**Entry:** engagement `[open]`+ with billable delivery/work (J-DLV/J-WCC).
**Exit:** invoice `[paid]` (or `[cancelled]`); payments `[confirmed]`.

```
issue trade invoice [issued] → payments recorded off-platform → [partially_paid] → [paid]
       [issued] → contest → [disputed] (J-DSP)      [issued] → [cancelled]
payment record: [recorded] → counterparty confirms → [confirmed]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-FIN-01 | Invoice | `issue_trade_invoice` (`human_ref INV-…`, `{amount, currency}` — BDT default, per field) | `[issued]` | Versioned + status-tracked; **≠ platform invoice** (J-PINV) |
| J-FIN-02 | Record payment | payment record append (optional link to invoice) | payment `[recorded]` | Money moved **off-platform**; `method_note` is descriptive only |
| J-FIN-03 | Confirm | counterparty confirmation | `[recorded] → [confirmed]` | Two-sided acknowledgment — still zero custody |
| J-FIN-04 | Progress | balances derived from records | `[issued] → [partially_paid] → [paid]` | Reconciliation is **derived** — no invented stat |
| J-FIN-05 | Contest / cancel | dispute leg (J-DSP) · cancellation | `→ [disputed]` / `[cancelled]` | `→ [disputed]` emits `(DisputeRecorded)` (→ Trust performance input, J-PSC) |

**Governance rails (money boundary — binding):** the platform never settles, escrows, holds, or
routes buyer↔vendor funds; it earns only its own revenue (that's J-SUB/J-PINV/J-CRED in M7);
currency stored per value field (Doc-2 §0.4).
**Success:** ✔ every money fact a record with currency; ✔ confirmation two-sided; ✔ zero funds
custody, everywhere, always.

**Related:** container J-ENG · evidence for J-DSP · vendor leg composed by `J-SUP-07`, buyer leg
by `J-PROC-13` · platform-side billing is J-PINV (different module, different money).

---

## Not Covered (File E ledger)

| Item | Why | Pointer |
|---|---|---|
| Goods-delivery state machine (dispatch/transit/received) | Not ratified — delivery is challan-evidenced only | Doc-4F §F5.3; J-DLV |
| PO acceptance / approval workflow (counterparty) | Not ratified — documents are immutable issued versions; `«can_approve_po»` is issuer-side | Doc-4F §F5.4; J-DOC-02 |
| Engagement `disputed` state | Not ratified — dispute is recorded (audit), and only `trade_invoices` carry `[disputed]` | Doc-2 §9/§3; J-DSP |
| ESC-OPS-DOC-* additional document kinds (Mushok/VAT etc.) | Board-gated (FE-DOC track, agenda #13) — kinds stay `loi/po/challan/wcc` until ruled | esc_registry.md |
| Reconciliation dashboards / stat tiles | Derived views only — no reconciliation aggregate is ratified (ENG-03 discipline) | vendor FE track notes |
| Buyer-feedback journey (engagement-bound) | `ops.record_buyer_feedback.v1` (+ `(BuyerFeedbackRecorded)`) is narrated as a J-ENG rail, not a separate journey — distinct from the public review J-REV; expand later if a surface needs it | Doc-4F Part2; Doc-2 §8 |

*Cross-links:* actor journeys [`../marketplace_ux.md`](../marketplace_ux.md) §4 (`J-PROC`), §6
(`J-SUP`) · registry [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) §5-E.

*Non-authoritative; coins nothing; on conflict the frozen corpus wins (CLAUDE.md §7/§11).*

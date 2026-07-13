# RFQ Workflow — the frontend workflow spine

**Scope:** presentation-only (no backend, no writes). This folder is the single home of the
frontend's end-to-end RFQ procurement journey: the journey model, the frozen-transition reference
projection, the lifecycle document registry, the **data-adapter seam** every RFQ page consumes, and
the journey orientation UI. It exists so the complete workflow is implemented **once, before
individual pages** — pages compose it; nothing here decides business outcomes.

**Governance posture (binding for this folder):**

- **No coined states.** Every lifecycle token is the verbatim frozen Doc-4M / Doc-2 §5.4/§5.5 set,
  imported from the kit (`@/frontend/components/rfq`). A *journey stage* is a presentation grouping
  of frozen states — orientation and navigation only, never a lifecycle authority.
- **No business rules in React components.** Views render adapter-supplied view-models; counts,
  facets, ordering and permitted-action sets are produced inside the adapter (the stand-in server),
  exactly where the wired server layer produces them later (R7 / GI-04 / GI-10).
- **One Module, One Owner.** Buyer-leg and vendor-leg reads are separate interfaces (both M3;
  the vendor leg is grant-scoped/received-only). Post-award data is M4-owned and is **not** served
  here — the workflow hands off by navigation only (Doc-4M M6-1 seam; DP10).
- **Byte-identical absence.** Unknown/undisclosed ids resolve to `null` → each page's existing
  genuine-absence render (Inv #11 / GI-12). The mock adapter reproduces the wired collapse.

## Folder map

| File | Role |
| --- | --- |
| `journey.ts` | `RFQ_JOURNEY` (buyer-leg stages), `VENDOR_JOURNEY` (own-facts vendor stages), terminal outcomes, pipeline buckets, resolvers |
| `transitions.ts` | Typed projection of Doc-4M M5 (+ the two Doc-5E §4.2 patched edges) with per-row frozen source pointers; fixture/orientation support, never client-side legality |
| `documents.ts` | Lifecycle document registry — frozen kinds only, each with its owning-module pointer |
| `adapters/types.ts` | `RfqWorkflowData` — one method per frozen Doc-5E read, returning the existing presentation view-models |
| `adapters/mock/` | The stand-in server: full-lifecycle fixture universe + lookup/projection implementation |
| `adapters/index.ts` | **The swap point.** Mock today; the GI-02 server data layer at Wave 4. Pages do not change. |
| `journey-strip.tsx` | `RfqJourneyStrip` / `VendorJourneyStrip` — navigation-not-state orientation rails |
| `pipeline-summary.tsx` | `RfqPipelineSummary` — adapter-supplied journey-bucket count tiles |

## The journey, mapped to the frozen machine

The proposed "complete procurement journey" (Draft → … → RFQ Closed) is realized **entirely on
frozen mechanics**. Mapping of each proposed stage:

| Proposed stage | Frozen realization | Surface |
| --- | --- | --- |
| Draft / Buyer Review | `draft` (versioned RFQ document; review is part of authoring) | `/rfqs/new`, `/rfqs/[id]` |
| Internal approval | `pending_internal_approval` (optional gate; `approve_rfq`) | `/approvals` |
| Submitted / RFQ Validation / Returned | `submitted → under_review`; moderation pass → `matching`; reject → `draft` (Doc-5E §4.2 patched edge; Admin decides — DE-5) | `/rfqs/[id]` |
| Published / Matching / Invitations Sent | `matching → vendors_notified`; invitations `draft → selected → [deferred] → delivered` (deferral invisible to the buyer — Doc-3 §4.2) | `/rfqs/[id]/routing` |
| Invitation Accepted / Declined / Expired | invitation `delivered → accepted \| declined \| expired` (`respond_to_invitation`) | `/sell/rfqs/[id]` |
| Preparing Offer / Ask Clarification | quotation `draft`; clarification thread is M6-owned (`manage_clarification` orchestration; Doc-5H thread) — **not a state change** | `/sell/rfqs/[id]/quotation`, clarifications |
| Quotation Submitted | quotation `draft → submitted` (consumes the Billing quota — DE-7); first submission drives RFQ `vendors_notified → quotations_received` | both legs |
| Return for Amendment / Vendor Revises | **no `revised`/`amendment` state exists.** The frozen loop is: buyer asks via clarification / `invoke_best_and_final`; vendor runs `revise_quotation` → a **new immutable version**, state unchanged (`submitted`), history preserved (Inv #8) | version timelines |
| Quotation Locked | **not a state.** Every submitted version is already immutable; window close (`WindowState`, UI-derived) ends revision in practice. Sealed-until-close is a POLICY redaction the server applies (Doc-3 §10.1) | — |
| Compare Sheet Generated | `get_comparison_statement` — System-generated, read-only; **its first open drives `quotations_received → buyer_reviewing`** (Doc-4E §E8.6, server-side) | `/rfqs/[id]/compare` |
| Technical / Commercial Evaluation | buyer working practice **within** `buyer_reviewing`, over the comparison statement — not distinct states | `/rfqs/[id]/compare` |
| Internal Approval / Award Recommendation / Winner Selected | `shortlist_quotation` → `shortlisted`; **explicit** `award_rfq` → `closed_won` (quotations `selected` / `not_selected`). Org award-threshold approval is server-enforced (Doc-3 §9.4). **No recommendation exists or may be added (R6)** | `/rfqs/[id]/award` |
| Reject All / Re-Invite / Cancel | `close_lost_rfq` → `closed_lost`; `reissue_rfq` → a **new** aggregate (source unchanged, Doc-5E §4.6); `cancel_rfq` from any active state (audited reason) | detail actions |
| LOI / PO / Execution / Delivery / WCC | **M4 territory** via the `RFQClosedWon` → engagement seam (Doc-4M M6-1): engagement document chain `loi/po/challan/wcc` + separate `trade_invoices` / `payment_records` aggregates (record-only — the platform never settles, DF-6) | `/engagements`, `/sell/engagements` |
| RFQ Closed | the RFQ machine is already terminal at `closed_won`; completion lives on the engagement | M4 surfaces |

### Divergence flags (proposed-lifecycle items with NO frozen backing — not modeled)

1. **`Amendment Requested` / `Revised Submission` / `Locked` as states** — do not exist; realized
   via versioning + clarifications as above. Do not coin them.
2. **`Technical Evaluation` / `Commercial Evaluation` / post-quote `Internal Approval` as states**
   — buyer working practice inside `buyer_reviewing`/`shortlisted`; no state, no evaluation-record
   aggregate.
3. **"Award Recommendation"** — forbidden as a system output (R6: no auto-winner/recommendation
   endpoint; comparison is decision support only). The journey stage is "Shortlist & award",
   buyer-explicit.
4. **"Award Notice" / "Evaluation record" / "RFQ Completion Report" as generated documents** — not
   frozen document kinds (see `documents.ts` header). Any addition goes through a Board-gated
   corpus patch (ESC-OPS-DOC-*), never this folder.
5. **"Public Marketplace (Optional)" branch** — routing breadth is the frozen `routing_mode`
   (`open_market` included); there is **no public RFQ board** (`list_rfqs` is buyer-org-scoped, R5).
6. **Engagement state naming** — the buyer VM layer carries a **Flag-and-Halt** (Doc-4F §F5
   `open/in_delivery/completed/closed` vs the Doc-4M row `active/…`). This folder does not touch
   engagement states at all (M4 hand-off is navigation-only) and inherits that pending
   reconciliation untouched.

## The adapter seam (how wiring lands with minimal change)

Every RFQ page now does exactly this:

```tsx
const data = await rfqWorkflowData.buyer.getRfq(rfqId); // or a vendor.* read
return <SomeView data={data} />;
```

At Wave 4, `adapters/index.ts` swaps `mockRfqWorkflowData` for the GI-02 server implementation
(own-org scoped resolvers mapping frozen Doc-5E DTOs → these same view-models, streaming/Suspense
per §11.4, `error_class` branching per GI-05). **No page, view, or fixture-consumer changes.**
Reads run in Server Components only; the browser never calls a Doc-5 contract and never sets
`Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

### Wired pages (this milestone)

Buyer: `/rfqs` (list + journey buckets) · `/rfqs/[id]` (+ journey strip) · `…/compare` ·
`…/award` · `…/versions` · `…/routing` · `…/clarifications` · `…/quotations/[qid]`.
Vendor: `/sell/rfqs` (inbox + quota + buckets) · `/sell/rfqs/[id]` (+ vendor strip) ·
`…/quotation` (builder draft).

### Fixture universe (`adapters/mock/rfq-universe.ts`)

One coherent dataset: a buyer org with an RFQ in **every** frozen state (deep records —
detail → versions → routing → comparison → award — on `rfq-000123`; the vendor-leg RFQ
`rfq-000318` appears on both legs), and a vendor org whose inbox covers delivered / accepted+draft /
submitted-revised / shortlisted / selected / not_selected / declined / expired. Unknown ids are
absent from the universe on purpose — they exercise every page's genuine-absence path.

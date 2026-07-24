# Buyer Quotations — Received Quotes + Compare Quotes (Prototype v0.1)

**Clickable prototype · NON-AUTHORITATIVE.** Coins nothing. No production code changed — the
production routes (`/buy/quotations`, `/buy/quotations/compare`) remain `ImplementationPendingView`
reserved routes exactly as BX-04 shipped them.

```bash
npm run prototype buyer-quotations     # → http://localhost:8080
```

## What this is for

The BX-04 buyer sidebar reserves two Quotations pages with no frozen-corpus read behind them.
This prototype shows what those pages **should** look like, so the gap can be ruled on against an
artifact instead of prose:

| Page | Prototype view | The gap it gives shape to |
|---|---|---|
| **Received Quotes** (`/buy/quotations`) | `#/received` | **`ESC-BUY-QUOTES-LIST`** (registered in `esc_registry.md`) — no cross-RFQ quotation list read exists; quotations are readable only per-RFQ (`list_quotations_for_rfq`, P-BUY-09) or per-document (`get_quotation`, P-BUY-14). Resolution path: additive Doc-5E patch (human Board). |
| **Compare Quotes** (`/buy/quotations/compare`) | `#/compare` | No ESC registered. The frozen comparison read (`get_comparison_statement`, P-BUY-15) is scoped to ONE RFQ. This prototype's position: that is **correct** — see the design decision below — so this page needs **no new read at all**. |

> This prototype is the artifact for that discussion — it is not a ruling, and nothing in it has
> been built into `app/(app)/(workspace)/buy/quotations/`.

## The proposed designs

**Received Quotes** — an org-wide listing of quotations vendors have submitted across the buyer's
RFQs. Summary tiles (awaiting review / shortlisted / validity expiring ≤7 days / concluded),
search, an RFQ filter, and state chips over one table: vendor + QTN ref, owning RFQ, state,
quoted price, validity (with expiring-soon treatment), received date. Rows link into the
already-built per-RFQ pages (P-BUY-14 detail, P-BUY-15 comparison).

**Compare Quotes** — an RFQ **selector**, not a free cross-RFQ mixer: every RFQ with ≥2 disclosed
quotations appears as a card; picking one renders its per-RFQ side-by-side comparison in place
(the RFQ-123 summary table mirrors the built P-BUY-15 page attribute-for-attribute). RFQs with
fewer than two comparable quotations show as disabled cards stating why. The comparison has three
sections:

1. **Summary attributes** — status, quoted price, delivery, warranty, validity, compliance,
   attachments.
2. **Line items** — the RFQ's items as quoted per vendor (qty × unit price → line total, unit
   price disclosed beneath), with a Quoted-total row that reconciles exactly to each vendor's
   quoted price. **Mock until the `ESC-CS-LINEITEMS` schema is ratified** (RFQ `content_jsonb` /
   quotation `price_breakdown_jsonb` are opaque today) — the same posture as the built
   Comparative Statement page.
3. **Commercial terms** — payment terms, price basis, VAT & duties, liquidated damages,
   performance guarantee, as quoted per vendor.

**Scale** — the comparison is not capped at 2–3 vendors: RFQ-119 demonstrates **5 quotations**
side by side with a sticky attribute rail and horizontal scroll inside the card (the page body
never scrolls sideways).

**Download PDF** — the button is real: it opens the browser's print dialog with a print
stylesheet that emits just the comparison (document header + summary + line items + terms).
This is the **built CS page's exact stance**: printing is the user-agent's own print-to-PDF and
needs no contract; a generated file export remains the gated `ESC-CS-EXPORT` stub.

### Design decision carried to review: no cross-RFQ comparison

A "pick any quotes across any RFQs" grid is deliberately absent:

1. **Comparability** — quotations answer different specifications; a side-by-side across RFQs is
   apples-to-oranges and invites price-only reading.
2. **R6** — comparison is descriptive and never recommends. A cross-RFQ grid is one step from a
   cross-vendor leaderboard, which the corpus forbids everywhere.
3. **Scope economy** — the per-RFQ comparison already exists and is frozen. An accelerator into it
   (this page) needs zero new contracts; a cross-RFQ read would need an ESC + Board.

## Governance posture (what was deliberately done / not done)

- **Quotation states are the frozen Doc-4M §5.3 set, verbatim** — `submitted / shortlisted /
  selected / not_selected / withdrawn / expired`. Vendor-private `draft` never appears (the buyer
  reads disclosed quotations only).
- **No ranking anywhere.** Vendors render in the order provided; no best-value badge, no winner
  highlight, no lowest-price emphasis, no sort-by-price default.
- **No new disclosure.** Every field shown is already disclosed on a built P-BUY-09/14/15 surface;
  the list is an aggregation, not a widening.
- **Tiles are row derivations** (counts by frozen state + validity arithmetic), not invented
  analytics.
- **Money format** — `BDT 2,695,000`, no trailing `.00`, per the platform-wide money rule.
- Withdrawn is rendered neutrally (zero-penalty per the frozen vendor lifecycle).

## Reviewing it

- **Review notes** toggle (top banner) — dashed annotation cards state what each page proposes and
  why; turn off for a production-like read.
- Received Quotes: search, RFQ filter, and state chips all work; empty state included.
- Compare Quotes: click RFQ cards to swap the comparison; the "Compare" row-action on Received
  Quotes deep-links here with that RFQ preselected (`#/compare?rfq=…`).
- Inert chrome (sidebar, topbar, other destinations) explains itself via toast instead of dead
  links.

Demo data is illustrative seed per prototype convention, reusing the app's mock `rfq-universe`
entities (RFQ-2026-000123 boiler pumps · RFQ-2026-000119 transformer servicing · vendors Meghna /
Padma / Dhaka Power / Eastern Grid / Rupsha …) so the prototype reads as the same demo world as
the built app. Demo clock ≈ Jul 5, 2026 (the universe's clock).

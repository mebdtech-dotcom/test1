# Compare Sheet UX — Product Decision Record (Freeze Draft)

| | |
| --- | --- |
| **Document** | `productSpec/COMPARE_SHEET_UX_FREEZE_v0.1.md` |
| **Version / status** | v0.1 **DRAFT — owner sign-off required before WP-2 implements anything** (owner ruling 2026-07-06: "This is a product governance decision… Freeze these first. Only then implement.") |
| **Scope** | The buyer Compare Sheet surface (`/rfqs/[rfqId]/compare`, P-BUY-15) — presentation/UX decisions ONLY. Nothing here touches the frozen `get_comparison_statement` contract, the RFQ machine, or module ownership. |
| **Frozen constraints this freeze operates UNDER (by pointer)** | Comparison statement is System-generated, read-only decision support; **never re-ranked, never recommends** (R6 / GI-04 / Doc-3 §9.1). First open drives `quotations_received → buyer_reviewing` server-side (Doc-4E §E8.6). Sealed-until-close redaction is server POLICY (Doc-3 §10.1). Export/signatures are **not frozen capabilities** (`rfq-workflow.md` §7/§9). |
| **Decision state key** | **RULED** = owner-decided 2026-07-06 · **PROPOSED** = drafted here for owner sign-off · a signed v1.0 freezes all seven. |

---

## D1 — Comparison count · **RULED (owner, 2026-07-06)**

**Side-by-side comparison: minimum 2, maximum 5 quotations.**

Owner rationale: industrial buyers rarely evaluate more than 3–5 serious quotations; allowing 10
creates cognitive overload, wider tables, poorer UX, slower decisions. Practice shape:
receive many → narrow → compare up to 5.

**Conformance note (load-bearing, flagged per Raise ≠ Accept):** the cap is a **presentation
column-selection** over the System-generated statement — the statement itself remains the full
disclosed set, and the frozen sequence is unchanged (the comparison read exists from the first
quotation and its first open precedes shortlisting; `shortlist_quotation` remains the FORMAL
narrowing mechanic). The owner's "Shortlist → Compare up to 5" flow is therefore realized as:
full statement (all disclosed quotations listed) → buyer SELECTS ≤ 5 for side-by-side study →
buyer shortlists/awards via the frozen commands. The selection is ephemeral UI state; it is never
persisted, never sent to a contract, and never implies preference to any vendor.

## D2 — Entry points · PROPOSED

1. **RFQ detail → Quotations tab** — primary CTA "Compare quotations" (visible when ≥ 1 disclosed
   quotation exists).
2. **Journey strip** — the "Comparison & evaluation" stage pill deep-links to
   `/rfqs/[rfqId]/compare` (already live).
3. **Direct route** — `/rfqs/[rfqId]/compare` (bookmarkable; unknown/undisclosed id → byte-identical
   not-found).

**Explicitly NOT an entry point:** the reserved cross-RFQ `/quotations/compare` route **stays a
scaffold** — no cross-RFQ comparison read exists in the frozen corpus; introducing one is a Board
intake item, not a UX decision.

## D3 — Selection behavior · PROPOSED

- Checkbox per supplier column/row; selection carried in the URL query via native GET navigation
  (no client state store, consistent with the award wizard's `?sel=` pattern).
- **No default selection** and no "suggested picks" — an empty selection shows the full statement
  list; any pre-selection would be a recommendation (R6).
- Min 2 to enter side-by-side view; at 5 selected, further checkboxes disable with a plain note
  ("Compare up to 5 at a time").
- Order **within** the side-by-side view = the System-supplied statement order filtered to the
  selection — never re-sorted (GI-04).

## D4 — Desktop behavior · PROPOSED

Side-by-side column matrix (the existing kit `ComparisonSummary` + `ComparisonTable`), up to 5
columns; row set = the statement's disclosed fields (price, delivery, warranty, validity,
compliance, attachments count; sealed cells render the sealed explanation, never a blank that
reads as "no price"). Wide content scrolls inside the table container, never the page.

## D5 — Mobile behavior · PROPOSED

Selected suppliers render as **stacked cards** in statement order (same disclosed rows per card);
the side-by-side matrix is a desktop/tablet affordance. No horizontal page scroll; if a matrix
view is offered at all on small screens it scrolls inside its own container.

## D6 — Empty & degenerate states · PROPOSED

- **No statement yet** (pre-first-quotation): genuine absence — the route renders the honest
  "awaiting responses" empty; nothing fabricated.
- **Exactly 1 disclosed quotation:** single-column statement view; the compare affordance is
  hidden (D1 minimum not met) — the surface never fakes a second column.
- **Unknown / undisclosed RFQ id:** byte-identical not-found (Inv #11 / GI-12).

## D7 — Export behavior · PROPOSED

**No export UI in this milestone.** Excel/PDF export and digital signatures are not frozen
capabilities (`rfq-workflow.md` §7 exclusion list); shipping an export button would coin a platform
capability. Browser-native printing is not blocked (it is a user-agent feature, not a platform
export). If export is wanted, it enters through **Board intake** (ESC → discussion → decision →
patch → freeze) as its own item — this freeze deliberately does not decide it.

---

## Process

1. Owner reviews D2–D7 (D1 already ruled) and signs off / amends.
2. On sign-off this document becomes **v1.0 — FROZEN (product)**; WP-2 implementation un-gates for
   Team-2 under the WP-1 rules (mock adapters, no backend, no new states).
3. Any later change = additive amendment + version bump via Board intake — the frozen journey
   documents are never edited in place.

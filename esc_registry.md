# iVendorz — ESC Registry (single source)

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.3** — ESC Registry (non-authoritative companion; the single source for escalation handles)
**Date:** 2026-06-29
**Wave:** 0.3 — Governance Refactor (foundation)
**Companions:** all design-wave docs reference this; see [`shared_conventions.md`](shared_conventions.md)

---

## 0. Purpose & rules

This is the **one place** every escalation (`[ESC-…]`) is defined. Other docs **reference the handle
only** (e.g. "Future: `ESC-7-API/upload`") and **never re-explain** it. The handles are **escalation
pointers, not architecture** — each names a gap in the frozen wired surface that must be resolved via
its **named channel (additive Doc-5x/Doc-3 patch, Board) — never locally** (Doc-7C §0.3; CLAUDE.md §11).
This registry **coins no contract** — it records what is *absent* and the agreed interim presentation.

Precedence: non-authoritative; on conflict the frozen corpus wins.

---

## 1. Registry

| Handle | Scope / gap | Interim presentation | Channel |
|---|---|---|---|
| **`ESC-7-API-CATNAV`** | `list_categories` has **no Public projection** → public Industrial Category Explorer tree blocked | Render `search_catalog` facets only; counts via facet aggregation | Additive Doc-5D public-projection patch (Board) |
| **`ESC-7-API-PRODDETAIL`** | `get_product` is User-only → **no anonymous product detail page** | Products render from `search_catalog` results | Additive Doc-5D patch (Board) |
| **`ESC-7-API-ADS`** | ad reads are User-only → **no anonymous ads** | Ads not rendered on the Public surface | Additive Doc-5D patch (Board) |
| **`ESC-7-API-SIGNUP`** | No client-facing **`create_user` / signup-provision** contract in the wired surface — the user record + Personal Organization + Owner membership are materialized **out-of-band** by M1 lazy-provisioning (Doc-7E §2), not a coined wire contract | Auth entry via **Supabase Auth only**; the signup form is presentation-only and creates no account; provisioning runs on first authenticated request (`ensureProvisioned`, Doc-7C §3.2) | Additive Doc-5C / Doc-7E patch (Board) |
| **`ESC-7-API/upload`** | No client-facing **upload-grant** (signed-URL issuance) in the wired surface | Blobs to Supabase Storage; contract carries `file_ref` only | Additive Doc-5x/Doc-4B patch (Board) |
| **`ESC-7-API/export`** | No dedicated **bulk-export** contract | Export only user-readable (exclusion-applied) data; large export via create-then-poll | Additive Doc-5x patch (Board) |
| **`ESC-7-API/related`** | No **related-products / similar-suppliers** recommendation contract | Show same-category facets, labelled "Same category" — never "Recommended" | Additive Doc-5x patch / future M9 (Board) |
| **`ESC-7-API/stats`** | No **public marketplace-statistics** read | Omit, or show only contract-provided facet counts — never fabricated numbers | Additive Doc-5D patch (Board) |
| **`ESC-7-AI`** | A global conversational AI navigator/assistant beyond M9's wired `Doc-5K` advisory is absent | AI entry reserved "Coming Soon"; limited to `Doc-5K` non-recommending advisory | Additive Doc-5K patch / activation (Board) |
| **`ESC-IDN-DELEG-EXPIRY`** | `reinstate_delegation_grant` UI path pending (Doc-2 §5.10 unresolved) | Delegation reinstate action hidden until resolved | Identity channel (Board) |
| **`ESC-RFQ-POLICY`** / **`ESC-OPS-POLICY`** | Some idempotency dedup-window POLICY keys not yet registered | Use the named POLICY key once registered; never a UI literal | Additive Doc-3 §12.2 patch (Board) |

### Vendor Workspace (Doc-7G design companion — Track 2/3, 2026-06-30)

Source: `vendor_planning_and_design.md` (v0.9-rc, freeze WITHHELD) — detail in its §12/§13. Packets in
`governanceReviews/`: [`BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md`](governanceReviews/BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md)
(the 3 BLOCKERs) · [`API-GOV-INTAKE-VENDOR-FE_v1.0.md`](governanceReviews/API-GOV-INTAKE-VENDOR-FE_v1.0.md)
(contract questions). Freeze convened by [`BOARD-SPRINT-VENDOR-FE-FREEZE_v1.0.md`](governanceReviews/BOARD-SPRINT-VENDOR-FE-FREEZE_v1.0.md). 30-second landscape: [`DECISION-MATRIX-VENDOR-FE_v1.0.md`](governanceReviews/DECISION-MATRIX-VENDOR-FE_v1.0.md).

**Freeze-gating BLOCKERs — human Architecture Board (the only path to companion freeze):**

| Handle | Scope / gap | Interim presentation | Channel |
|---|---|---|---|
| **`ESC-7G-SCORE-DISPLAY`** | Doc-5G §5.3 ("band + display score", Public-Badge) vs companion DP4 "bands only" — re-read shows Invariant 6 (Master §4) is a cross-mutation firewall, **display-silent** | Band-only on every vendor surface; `trust-badge` composed without `score`; frozen-suppressed + Not-Rated handled | Human Architecture Board — frozen-vs-frozen, Flag-and-Halt (BOARD-PACKET §SCORE-DISPLAY) |
| **`ESC-7B-TRUSTSCORE`** | Frozen kit `trust-badge.score?:number` renders raw 0–100 — Invariant-6 footgun; **child of** SCORE-DISPLAY | Never pass `score` in the vendor workspace + lint/test; no frozen-kit change yet | Human Architecture Board / Doc-7B owner |
| **`ESC-7G-A7`** | Doc-7A R6 / Doc-7C SR3 mandate Hybrid "mount both" but specify neither the internal IA nor a `(vendor)` route group (design-introduced) | Co-mounted, grouped-not-merged; Trust read-only; `(vendor)` flagged as a non-routing layout group under `(app)` | Human Architecture Board (Golden Rule 7 sign-off) |

**Contract gaps — API Governance Board (§7 r5; NOT freeze-blocking; each ships a fallback):**

| Handle | Scope / gap | Interim presentation | Channel |
|---|---|---|---|
| **`ESC-7-API` (vendor pipeline count)** | No frozen vendor received-only count read (vendor-leg reads are cursor lists only) | Non-numeric "view" links; no badges/tallies | Additive count read (owner M4, own-org `vendor_leads`-by-stage) — recommend decline for v1 |
| **`ESC-7-API` (participation)** | Derived Platform Participation only on out-of-wire `identity.get_organization.v1`; Doc-7A §3.7 bars client use | No Buyer/Vendor/Hybrid label rendered | Additive **wired** M1 participation read (recommend High) |
| **`ESC-7G-Q-DRAFT`** | No frozen quotation draft-write/read (quotation is created at submit) | Client-local "Saved on this device" autosave | Additive M3 draft contract OR accept client-local (recommend defer) — supersedes companion `[ESC-7G-A6]` |
| **`ESC-7G-ENG-01`** | `ops.get_engagement.v1` projects no `rfq_id` (the column exists, Doc-2 §10) | "[pending projection]" for the engagement→RFQ link | Additive M4 projection of `rfq_id` (recommend approve) |
| **`ESC-7G-ENG-02`** | No buyer-org display-name in engagement scope (UUID only) | Neutral label ("Buyer organization") | Additive M1/M4 name read (Low) |
| **`ESC-7G-ENG-03`** | No `list_engagement_documents` for the BC-OPS-2 record set (only single get; BC-OPS-4 lists rendered artifacts) | E3 per-kind document enumeration build-blocked | Additive M4 child-ref projection on `get_engagement` (recommend approve) |
| **`ESC-7G-LEAD-NOTE`** | No vendor-leg private lead-note contract (note slug is buyer-side BC-OPS-1) | Note-typed `ops.add_lead_activity.v1` (frozen, vendor-owned) | Decline (accept fallback); do **not** coin `add_lead_note` |
| **`ESC-7G-LEAD-REF`** | No `vendor_leads` human-ref scheme | Render no lead human-ref | Decline (coin no `LD-` prefix) or corpus-reconcile |

**Corpus reconciliation — human (frozen-vs-frozen / watch):**

| Handle | Scope / gap | Interim presentation | Channel |
|---|---|---|---|
| **`ESC-7G-LEAD-MACHINE`** | Doc-2/4F/5F lead machine (`received→quoted→negotiation→won\|lost→follow_up`) vs Doc-4M (`new→contacted→qualified→converted\|disqualified`) | Companion binds the Doc-2/Doc-5F spelling (per-module authority) | Human corpus-reconciliation (Flag-and-Halt; not AI, not API-Gov) |
| **`ESC-7G-ENG-04`** | Doc-2 §8 IR-02/IR-03 emit-cardinality on versioned challans/WCC | UI assumes one event per record/issue | Watch item (Doc-2 §8) |

**Resolved during verification (recorded, no longer open):** `ESC-7G-LEAD-FILTER` — frozen `ops.list_leads.v1`
already accepts a `stage` filter (Doc-4F BC-OPS-3); `ESC-7G-Q-01` — bound to `rfq.get_rfq.v1` (grant-scoped);
`ESC-7G-Q-IDEMP` — deleted (idempotency already bound via Doc-4A §14.2). Carried on existing channels:
`[ESC-BILL-SLUG]`, `[ESC-MKT-AUDIT]`, `[ESC-OPS-AUDIT]`, `[ESC-OPS-SLUG]`, `[ESC-RFQ-POLICY]`.

---

### Classification & Matching Decisions (2026-07-01)

Source: `governanceReviews/CLASSIFICATION-DECISION-RECONCILIATION_v1.0.md` (+ `ADR-023` proposal + three
additive patch proposals + `MATCHING-ENGINE-RECONCILIATION_v1.0.md`). All human-Board gated.

| Handle | Scope / gap | Interim presentation | Channel |
|---|---|---|---|
| **`ESC-MKT-VENDORTYPE`** | `vendor_type_preset` enumerates **no values**; net-new vendor "commercial capability" facets (brand/OEM-authorization) unmodeled | Define the value set as metadata (Manufacturer/Supplier/…); commercial-capability facets deferred | Additive `Doc-4D_VendorTypePreset_Values` patch (Board); net-new facets → future M2 patch |
| **`ESC-IDN-BUYERTYPE`** | No buyer-type/segmentation on the profile; Procurement Maturity + department/role/frequency/approval-authority unmodeled | Add `buyer_type` on `buyer_profiles` (Invariant-#2-safe); maturity/role/etc. reserved | Additive `Doc-2_BuyerType` patch v1.0.5 + Doc-6C (Board); net-new fields → future M1 patch |
| **`ESC-CLASS-INDUSTRY`** | Industry taxonomy **not modeled** (supersedes the note below) | Recommend M2-owned 4-level Industry→Sector→Sub-Sector→Application, referenced by ID (Inv #7) | Human Architecture Board — module-ownership decision (`Doc-2_IndustryTaxonomy` patch v1.0.6) |
| **`ESC-RFQ-PROCCAT`** | Buyer "procurement category" (Mechanical/HVAC) vs the frozen category tree | **Reuse `marketplace.categories`**; coin no new entity | Confirm (no patch expected) — Board note |
| **`ESC-RFQ-MATCH-EVOLVE`** | Weighted-engine evolution (policy layer; industry/business-type ranking; subscription-in-rank) | Firewalls hold: no payment/plan input to rank (`Doc-3 §12.1/§4B`); bands not raw scores; industry deferred | M3 owner + Board (`MATCHING-ENGINE-RECONCILIATION_v1.0.md`); each item = its own additive M3 patch |

### Known non-ESC gaps (recorded, not escalations)
- **Industry taxonomy** — now tracked as **`ESC-CLASS-INDUSTRY`** above (was: "not modeled"); the
  `Doc-2_IndustryTaxonomy` patch proposal recommends an M2-owned model for Board ratification.
- **Brand / Standard / Manufacturer taxonomies** remain **not modeled** in the frozen corpus.
  Navigation may *reference* them as wayfinding dimensions but **coins no data model**; introducing any
  is a module-ownership / architecture decision (escalate), not an IA/UX decision. See `IA §5.3`, `GL`.

---

## 2. How docs cite ESC

- A page/section/template names the handle in its `Future:` or a delta line — **no explanation**.
- This registry is the only place gap + interim + channel are described.
- If a new gap is discovered, **add a row here** (record the absence + interim + channel); **do not
  invent a contract** anywhere.

---

*Non-authoritative. Conforms upward; coins nothing. Each handle resolves only via its named channel,
never locally. On any conflict the frozen document wins.*

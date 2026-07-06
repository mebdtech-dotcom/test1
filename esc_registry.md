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
| **`ESC-7-API-PRODDETAIL`** ✅ **RESOLVED 2026-07-03** | `get_product` is User-only → **no anonymous product detail page** | **Ruling (`R-ESC7-PRODDETAIL-FREEZE`):** new Public query contract `marketplace.get_public_product_detail.v1` (BC-MKT-6) composes the canonical Product Detail Projection with the R9 non-disclosure collapse enforced once; `vendor_slug` withheld from the payload, `canonical_url` opaque/builder-only (never client-constructed). Canonical product URL law = `ADR-025_Marketplace_Public_URL_Law` — apex host `/marketplace/product/{name-slug}-{uuid}` (id-anchored, no vendor-host product route in v1); breadcrumb `primary_category_path` picked by deterministic rule (deepest → specialized → primary-level → lowest-UUID). Rate limit bound to registered POLICY `marketplace.public_read_rate_limit`. All three Annex-E instruments (E-1 contract+wire, E-2 POLICY registration, E-3 URL law) folded together 2026-07-03: `Doc-4D_PublicProductDetail_Patch_v1.0.3.md` + `Doc-5D_PublicProductDetail_Patch_v1.0.1.md` + `Doc-3_Policy_Key_Registration_Patch_v1.11_PublicReadRateLimit.md` + `ADR-025_Marketplace_Public_URL_Law.md`. **Unblocks FE-PUB-05** (interim modal-from-`search_catalog` retired at cutover). The FE Doc-7 leg (canonical-URL builder code, redirects, Host Resolution Matrix for products) is a separate future build step, not a further escalation gate. Full record: `governanceReviews/ESC-7-API-PRODDETAIL_Product_Detail_Architecture_Plan_v1.0_PROPOSAL.md` (`R-ESC7-PRODDETAIL-FREEZE`, Round 4 Final Resolution). | Human Architecture Board — ruled (owner, 2026-07-03) |
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
| **`ESC-7G-SCORE-DISPLAY`** ✅ **RESOLVED 2026-07-03** | Doc-5G §5.3 ("band + display score", Public-Badge) vs companion DP4 "bands only" — re-read shows Invariant 6 (Master §4) is a cross-mutation firewall, **display-silent** | **Ruling:** Trust Score (band + numeric 0–100 + verification badges + "Last updated" + high-level contributing factors) may render on **any public-facing surface** — not confined to vendor self-view. Never display: internal weightings/formula, matching/fraud-risk/ranking scores, confidence coefficients, hidden penalties, competitor-relative percentile. **No corpus patch** — Doc-5G/Doc-4G already grant public/no-slug read. Trust Score composition = 4 categorical pillars (Identity & Verification, Operational Reliability, Reputation, Platform Compliance); **exact formula/weights stay open** under `[ESC-TRUST-POLICY]` (backend-implementation-time). Performance Score is **NOT** covered by this ruling — stays band-only pending a separate ruling. Full record: `BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md` §ESC-7G-SCORE-DISPLAY. | Human Architecture Board — ruled (BOARD-PACKET §SCORE-DISPLAY) |
| **`ESC-7B-TRUSTSCORE`** ✅ **RESOLVED 2026-07-03** | Frozen kit `trust-badge.score?:number` renders raw 0–100 — Invariant-6 footgun; **child of** SCORE-DISPLAY | **Ruling: Option 3** — `score` is now a sanctioned prop wherever Trust Score display is authorized (any public-facing surface, per the parent ruling); no kit change. Lint/test discipline retained, re-scoped to forbid `score` only in genuinely internal/governance-only contexts (staff tooling, matching/ranking/fraud surfaces) — never in vendor/buyer/public marketplace surfaces. Full record: `BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md` §ESC-7B-TRUSTSCORE. | Human Architecture Board — ruled |
| **`ESC-7G-A7`** | Doc-7A R6 / Doc-7C SR3 mandate Hybrid "mount both" but specify neither the internal IA nor a `(vendor)` route group (design-introduced) | Co-mounted, grouped-not-merged; Trust read-only; `(vendor)` flagged as a non-routing layout group under `(app)` | Human Architecture Board (Golden Rule 7 sign-off) — **still open** |

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
| **`ESC-IDN-BUYERTYPE`** | No buyer-type/segmentation on the profile; Procurement Maturity + department/role/frequency/approval-authority unmodeled | Add `buyer_type` on `buyer_profiles` (Invariant-#2-safe); maturity/role/etc. reserved | Additive `Doc-2_BuyerType` patch (next Doc-2 version at fold — v1.0.5 was taken by the ADR-024 VendorSubdomainSlug fold 2026-07-03) + Doc-6C (Board); net-new fields → future M1 patch |
| **`ESC-CLASS-INDUSTRY`** | Industry taxonomy **not modeled** (supersedes the note below) | Recommend M2-owned 4-level Industry→Sector→Sub-Sector→Application, referenced by ID (Inv #7) | Human Architecture Board — module-ownership decision (`Doc-2_IndustryTaxonomy` patch — next Doc-2 version at fold) |
| **`ESC-RFQ-PROCCAT`** | Buyer "procurement category" (Mechanical/HVAC) vs the frozen category tree | **Reuse `marketplace.categories`**; coin no new entity | Confirm (no patch expected) — Board note |
| **`ESC-RFQ-MATCH-EVOLVE`** | Weighted-engine evolution (policy layer; industry/business-type ranking; subscription-in-rank) | Firewalls hold: no payment/plan input to rank (`Doc-3 §12.1/§4B`); bands not raw scores; industry deferred | M3 owner + Board (`MATCHING-ENGINE-RECONCILIATION_v1.0.md`); each item = its own additive M3 patch |

### Canonical Vendor Subdomain URLs (Board-ruled 2026-07-03)

Source: `governanceReviews/BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md` (completed decision record +
4-round Findings Adjudication annex). Decision: **ADR-024**; realized by the Doc-2 v1.0.5 linked patch set
(+ Doc-4D v1.0.2 · Doc-6D v1.0.1 · Doc-3 v1.10 · Doc-7D §11 [fold pending]) + FE milestone **FE-PUB-10**.

| Handle | Scope / gap | Interim presentation | Channel |
|---|---|---|---|
| **`ESC-MKT-CANONICAL-URL`** ✅ **RESOLVED 2026-07-03** | Corpus silent on universal vendor subdomains, slug format/immutability/reserved labels, canonical-URL primacy, and redirects — the only subdomain mention (Master §8.4 item 7) is an example under the **entitled** custom-domain feature | **Ruling:** every APPROVED vendor receives one permanent **Platform-issued Vendor Subdomain** `https://{vendor-slug}.ivendorz.com/` — universal, free, never entitlement-gated (NOT a "custom domain"; `create_custom_domain` rejects `*.ivendorz.com`). Vendor Slug law FIXED (`^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`, 3–40, ASCII-only, `xn--` rejected); reserved labels = POLICY key `marketplace.reserved_subdomain_labels` (platform-owned namespaces, never retroactive). Slug vendor-immutable; only M8-mediated migration (permanent 301; old slug never reused — `vendor_slug_history`, Inv #8; URL identity ≠ Vendor identity). **CHR** (Doc-2 v1.0.5 D2-04.3 — authoritative on any conflict): non-routable → ∅; `active` bound custom domain canonical (subdomain 301s; reverts on release); else the subdomain; **fail-closed**, cached derivations invalidated on transitions. Legacy `/vendors/[slug]/*` 301s to the CHR output (composes with ADR-022's 7-page IA); `seo.canonical` advisory; Host Resolution Matrix 404s byte-identical (Inv #11/CHK-7-040 extended to hosts); vendor hosts anonymous — auth cookies never `Domain=.ivendorz.com`; vendor URLs via the canonical URL builder only; locale = path segments (reserved). Full record: `BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md`. | Human Architecture Board — ruled (owner, 4-round CTO review, Final Resolution APPROVED 2026-07-03) |
| **`ESC-MKT-SUBDOMAIN-MIGRATE`** | No admin-mediated **slug-migration wire contract** on the frozen surface (Doc-4D v1.0.2 explicitly does not coin it; Doc-2 v1.0.5 defines only the business semantics + §9 action "slug migration (admin-mediated)") | Slugs are vendor-immutable; **no migration path is exposed anywhere** (no UI, no contract); `vendor_slug_history` stays empty until the contract lands | Additive Doc-4D/Doc-5D patch (API Governance Board / Board) |

### Document Management (FE-DOC intake, 2026-07-03)

Source: owner-directed FE-DOC track creation (WBS v1.2; owner decisions + 3 adjudication rounds
recorded in `governanceReviews/milestones/fe-doc-01-buyer-documents-hub/WORK-PACKAGE.md`). Packet:
[`BOARD-PACKET-DOCUMENT-MANAGEMENT_v1.0.md`](governanceReviews/BOARD-PACKET-DOCUMENT-MANAGEMENT_v1.0.md).
Corpus verification: every kind/feature below is **grep-verified absent** from the frozen corpus —
the frozen post-award document set is exactly `loi | po | challan | wcc` (+ `trade_invoices`,
`payment_records` as separate aggregates) and the template format enum is the fixed five
`challan | bill | letterhead | quotation | wcc` (Doc-4F §F5/§F7; Doc-2 §10.5).

| Handle | Scope / gap | Interim presentation | Channel |
|---|---|---|---|
| **`ESC-OPS-DOC-MUSHOK`** | **Bangladesh-statutory VAT documents (Mushok forms, e.g. 6.3) are unmodeled** — zero corpus mention; no document kind, format, or finance-record subtype exists. Priority-flagged: statutory for the platform's home market | FE-DOC surfaces render **only the frozen kinds/formats**; no Mushok category, placeholder, or coined slug anywhere | Additive Doc-2 §2/§10.5 + Doc-4F §F5/§F7 patch (human Architecture Board) — packet item 2a |
| **`ESC-OPS-DOC-KINDS`** | Credit/debit notes, packing lists, sales orders, contracts/agreements are unmodeled as document kinds (sales order + contract overlap PO/LOI semantics; credit/debit notes are invoice adjustments; packing lists are delivery children) | No placeholder categories, no coined slugs/states; taxonomy shows frozen kinds only | Additive Doc-2 §10.5 (+§5.9) + Doc-4F patch per accepted item; credit/debit routed via BC-OPS-5 Finance-Records owner analysis (human Architecture Board) — packet item 2b |
| **`ESC-OPS-DOC-FEATURES`** | Digital signatures (no PKI/signature aggregate), expiry reminders (no post-award expiry or scheduled-reminder workflow), document favorites/pinning (M2 catalog favorites ≠ document favorites), document tags, document↔project linkage (no frozen link from M4 documents to M2 projects) | No affordance rendered for any of these; hub facets exclude "Project"; no tag/favorite UI | Per-feature channels: Doc-4B/e-sign patch · M6 Doc-5H notification-rule patch · owner-module analysis for favorites/tags/project-linkage (human Architecture Board) — packet item 2c |

### Buyer Vendor Directory & Vendor Discovery (owner intake, 2026-07-03)

Source: owner proposal + 4 review rounds (2026-07-03). Package:
`governanceReviews/BUYER-VENDOR-DIRECTORY-RECONCILIATION_v1.0.md` +
[`BOARD-PACKET-BUYER-VENDOR-DIRECTORY_v1.0.md`](governanceReviews/BOARD-PACKET-BUYER-VENDOR-DIRECTORY_v1.0.md)
(pre-read: `DECISION-MATRIX-BUYER-VENDOR-DIRECTORY_v1.0.md`) + 3 additive patch proposals +
`productSpec/BUYER_VENDOR_DIRECTORY_SPEC_v1.0.md` (non-authoritative). All human-Board gated.
Directory core / Smart-Upgrade linking / vendor types / permissions = **already frozen** (BC-OPS-1;
A-03/PATCH-05 link-not-merge; PATCH-02) — pointed, not escalated. Mushok remains
**`ESC-OPS-DOC-MUSHOK`** (above) — not re-registered here.

| Handle | Scope / gap | Interim presentation | Channel |
|---|---|---|---|
| **`ESC-VENDIR-DISCOVERY`** | Anonymous cross-buyer "Discovered Vendor" aggregation **conflicts with frozen canon** (Inv #6 · Inv #11 · Master §6.4 "analytics, or inference" · §10.4); no module may own it (M9 forbidden by Inv #12). Flag-and-Halt | **No discovery surface, aggregate count, or "referenced by N buyers" signal renders anywhere**; conformant adjacency = M8 missing-vendor intake + Doc-3 §11.4 cell grid | Human Architecture Board — packet **R2** (a: reject · b: consent-based submit via M8 intake, additive · c: **rank-0** Master §4/§6.4/§16.2 patch, Annex A draft, human-only) |
| **`ESC-VENDIR-OFFPLATFORM`** | Private (unlinked) vendors cannot participate in RFQ/engagement flows — every frozen surface binds `vendor_profile_id` (Doc-4E B.3; `operations.engagements` A-02). Owner ruled: pursue buyer-private off-platform **recording** (no vendor side; recording-only per ADR-002; M3 untouched) | Directory renders "Record off-platform purchase" **only after the ruling**; UI never offers RFQ/quote to unlinked private vendors | Human Architecture Board — packet **R3** (Shape A: XOR party ref on frozen engagements · Shape B: parallel buyer-private M4 aggregate) → `Doc-4F/Doc-2_Vendor_Directory` additive patches |
| **`ESC-VENDIR-INVITE`** | Buyer-initiated invite-to-platform unmodeled — frozen seeding is admin-driven (`vendor_claim_records.source enum<excel\|admin\|registration>`); `missing_vendor_suggestions` has **no submit contract** (admin triage/close only) | "Pending Invitation" nav section + Invite button absent until ruled | Human Architecture Board — packet **R4** → `Doc-4D_or_4J_Buyer_Invite` additive patch (M2 source enum + M8 intake submit + M6 delivery; M4 link-back already frozen) |
| **`ESC-VENDIR-FIELDS`** | Field/enum basket: contact/address/registration fields (`details_jsonb` vs first-class), category refs on private records, logo ref, `link_suggestions.match_basis` +`bin`/+`domain`, buyer import/export (no slug/contract), private↔private **Merge** (corpus is link-not-merge; merge silent) | Form fields beyond the frozen set persist via `details_jsonb` (no coined columns); duplicate prompt offers **Archive duplicate** in place of Merge; no import/export affordance | Human Architecture Board — packet **R5** items 1–6 → `Doc-4F/Doc-2_Vendor_Directory` additive patches; OBS-1 (trade-license home) + OBS-2 (Doc-4F "ADR-003 link-not-merge" vs Compendium ADR-003/ADR-005 pointer) noted for errata |

### Journey Atlas (journeys/ intake, 2026-07-06)

Source: the journey/lifecycle companion program ([`journeys/JOURNEY_ATLAS.md`](journeys/JOURNEY_ATLAS.md)
+ 9 domain files). Packet: [`BOARD-PACKET-JOURNEY-ATLAS_v1.0.md`](governanceReviews/BOARD-PACKET-JOURNEY-ATLAS_v1.0.md).
Both items **grep-verified absent** from the frozen corpus during authoring; neither journey is
authorable without coining. The vendor-lead state-machine conflict surfaced by the same authoring
pass is **already registered** as `ESC-7G-LEAD-MACHINE` (above) — not re-registered.

| Handle | Scope / gap | Interim presentation | Channel |
|---|---|---|---|
| **`ESC-JRN-BUYER-VERIF`** | Buyer-side verification ("Trusted Buyer") is **unmodeled** — `verification_records` bind to the vendor's owning org (Doc-4G H.3/H.9a/H.10; subject/type enums fixed "do not extend"; sole event `VendorVerified`); `identity.organizations` carries a `verification_level` field (`unverified/verified/enhanced_verified`, Doc-2 §3) but **no buyer-facing verification contract, flow, or badge exists** | No buyer-verification journey authored (atlas §8 "not ratified — escalated"); no "Trusted Buyer" badge/flow rendered anywhere | Additive Doc-4G/Doc-4C patch (human Architecture Board) — product decision first |
| **`ESC-JRN-LEAD-DIST`** | Admin "lead distribution" is **unmodeled** — Doc-4J has no lead entity or function; `vendor_leads` are created **only** by seam M6-2 (`VendorInvited` at invitation `delivered`); M7 lead credits are a commercial balance, never an assignment instrument | No admin lead-assignment surface or journey; leads remain invitation-born only | Human Architecture Board (owner product decision) — would require Doc-4J + Doc-4F additive patches |
| **`ESC-JRN-TKT-MACHINE`** | Support-ticket machine variance (frozen-vs-frozen): **Doc-4H BC-COMM-4** contracts are strictly linear `open → in_progress → resolved → closed` ("a non-resolved ticket cannot be closed"; no reopen; "no state added; no transition added") while **Doc-4M §M5** consolidates extra edges (`resolved ⇄ in_progress` reopen; `open/in_progress → closed`). Same class as `ESC-7G-LEAD-MACHINE` | Journey J-TKT binds the **Doc-4H** machine (per-module authority); no reopen/admin-close affordance rendered | Human corpus-reconciliation (Flag-and-Halt; not AI, not API-Gov) |

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

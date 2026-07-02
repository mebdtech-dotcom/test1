# Product Detail Capability — Architecture Resolution (`ESC-7-API-PRODDETAIL`)

| | |
|---|---|
| Document | ESC-7-API-PRODDETAIL — Product Detail Capability Architecture Resolution |
| Version | v1.0 · 2026-07-03 |
| Status | **APPROVED — Board Resolution `R-ESC7-PRODDETAIL-FREEZE` (owner Board, 2026-07-03) · Freeze Gate PASS · Conditions: none** (Annex H holds the four-round adjudication record) |
| Authority | **NON-AUTHORITATIVE planning artifact** under the frozen corpus (CLAUDE.md §7). Coins **no** entity, field, state, event, error code, POLICY value, or route-as-API. Everything frozen is bound **by pointer** (CLAUDE.md §11 reference-never-restate). On any conflict, the frozen document wins. |
| Resolves | `esc_registry.md` handle **`ESC-7-API-PRODDETAIL`** (channel: additive Doc-5D patch, Board) — plus the premise reconciliation R-0 (Part I.3) |
| Unblocks | **FE-PUB-05** (P-PUB-11 Product detail, template T-DETAILS; interim = modal from `search_catalog`) once Annex E instruments land |
| Prepared under | CLAUDE.md §8 — AI-generated, human-Board-adjudicated (Raise ≠ Accept, §13); reviewer findings adjudicated in Annex H |
| Approval object | **Part I only** (API contract + architectural decisions). Appendices A–D are informative; Annexes E–H are records. |

> **Proposal-tier size discipline (Board convention candidate — Annex H R4/OBS-4):** Architecture
> Resolution corpus (~150 pp over years) ▸ **Proposal (20–40 pp — this tier)** ▸ Patch (5–10 pp).
> Future ESC proposals must not grow beyond their tier. This document: ≤ ~700 lines, tables over prose.

**Reader map.** Backend/API-Gov → I.3–I.7, I.12, Annexes E–G · Frontend (Team-1) → I.4, I.6–I.10, App B/D ·
SEO → I.4, App A · Search → App B · AI → I.10, I.12, App C · QA → I.11, I.13, Annex F, Doc-8 pointers.

**Coverage of the 16 originally-mandated topics** (restructured per Board MAJOR-01, Annex H):
1 Purpose→I.1 · 2 Scope→I.1/I.8 · 3 URL→I.4 · 4 API→I.5 · 5 Response→I.6/I.7 · 6 Page IA→I.9 ·
7 Actions→I.10 · 8 SEO→App A · 9 Search→App B · 10 RFQ→I.10 · 11 Trust→I.11 · 12 Performance→App D ·
13 Security→I.11 · 14 Future→I.12/App C · 15 Risks→I.13 · 16 Open decisions→I.14.

---

# PART I — Architecture Resolution (the approval object)

## I.1 Purpose & capability overview

**Business purpose.** The Product Detail page is the platform's highest-traffic anonymous
conversion surface: industrial buyers discover a published product, evaluate the vendor, and
convert into governed flows — start/extend an RFQ, favorite, contact the vendor, claim, sign up.
The platform **never handles buyer↔vendor transaction money** (Master corpus; CLAUDE.md §1) — the
page carries **no** cart, checkout, escrow, or payment affordance, ever. RFQ-first by design.

**System purpose.** Establish **one canonical, published-only product read** that every consumer
class renders from — Public Website · Buyer Portal · Vendor Portal · Search Engine (rendering) ·
Internal APIs · AI Services · Mobile Apps (future) — so product truth is composed once, under one
non-disclosure collapse, instead of re-assembled per consumer.

**This resolution resolves exactly one architectural dependency**: the public product-detail read
surface (`ESC-7-API-PRODDETAIL`). Adjacent concerns are facets of the capability that *consume*
that surface; they are specified here only to their boundary, each on its own channel.

```text
Figure PD-02 — Product Detail Capability Facets
(one canonical source; every facet consumes, none redefines)

                 Product Detail Capability
                           │
     ┌─────────┬───────────┼───────────┬─────────┬─────────┐
  Public API   Frontend    SEO       Search    Trust     RFQ
  (I.5, M2)    Contract    (App A)   (App B)   (I.11,    (I.10,
               (I.9)                            M5 reads) M3 flows)
     └────────────┴─── Analytics (SC §4) ── AI (M9 advisory) ──┘
```

**Owning module:** M2 Marketplace & Discovery (`marketplace`, Doc-4D/Doc-5D/Doc-6D), bounded
context **BC-MKT-6 Discovery & Read-Model** for the composed read; BC-MKT-3 owns the product
aggregate. One Module, One Owner — no other module gains product authority here.

## I.2 Architecture Principles (PD-P1…P10)

Reference set for this capability and future ESCs (each bound to its frozen source; coined nowhere):

| # | Principle | Frozen source |
|---|---|---|
| PD-P1 | **Single canonical product source** — all consumers render from one composed read | Doc-4D BC-MKT-6; `get_public_vendor_profile.v1` precedent (Doc-5D §8) |
| PD-P2 | **Read-model composition only** — the composed read derives from owned read-models; it authors nothing | Doc-5D R5/§5.4; REPOSITORY_STRUCTURE read-model rules |
| PD-P3 | **No duplicated ownership** — foreign facts (trust, RFQ, entitlement) are consumed via their owner's contract, never copied | Golden Rule 2; Doc-5D R8 |
| PD-P4 | **Product independent from presentation** — URL slug, page layout, SEO derivation are presentation; the aggregate is untouched | Invariant #9 |
| PD-P5 | **Public data only** — published projection; every non-public fact collapses to byte-identical `NOT_FOUND` | Doc-5D R9; Doc-4A §7; Invariant #11 |
| PD-P6 | **Additive evolution** — fields are added, never renamed/removed; v2 only via decision table | Doc-4A §20 |
| PD-P7 | **Transport neutral** — HTTP/caching semantics are implementation-layer | Doc-4A §2.2 |
| PD-P8 | **Module ownership respected** — M2 surface; M5/M3/M6/M7/M8/M9 by pointer | CLAUDE.md §3/§6 |
| PD-P9 | **Product ≠ Project** — showcase projects never enter this API (I.8) | Doc-2 §10.3 aggregates; this resolution |
| PD-P10 | **Frontend never bypasses the canonical contract** — views bind wired contracts only | Doc-7 program invariant (Doc-7_SERIES_FROZEN); Doc-7D §9.2 DR-7-API |

## I.3 Reconciliation R-0 — the registered premise vs the frozen corpus

**Finding (Flag-and-Halt, CLAUDE.md §11 — escalated via this document; adjudicated Annex H).**
The handle's premise conflicts with the frozen wired surface, in both directions:

| # | Claim | Source A (companion / Doc-7D) | Source B (Doc-5D / Doc-4D — frozen wire authority) |
|---|---|---|---|
| C1 | "`get_product` is User-only → no anonymous product page" | `esc_registry.md:28`; **frozen** `Doc-7D_Content_v1.0_Pass2.md` §9.2 (:86) + Appendix (:105); repeated by `Doc-7D_Content_Freeze_Audit_v1.0.md:20` | **Frozen** `Doc-5D_Content_v1.0_Pass1.md` §2.3 row 29: `marketplace.get_product.v1` **Public / User** *(projection-gated)*; Pass2 §5.4: **Public-or-Controlling-Org** (published → public). Row 30 `list_products` Public = published-only |
| C2 | "`list_categories` is User / has no Public projection" (`ESC-7-API-CATNAV`, registry:27; Doc-7D §9.2:87) | same sources | Pass1 row 18 + Pass2 §5.4: `list_categories` **Public** ("taxonomy is public") |
| C3 | "ad reads are User-only" (`ESC-7-API-ADS`, registry:29) | same sources | Pass1 rows 57/58: `get_advertisement`/`list_advertisements` **Public / User** (public when active) |
| C4 | Doc-5D realized `get_spec_library_entry` **Controlling-Org** (Pass1 row 31; Pass2 §5.4) | — | **Frozen** `Doc-4D_Content_v1.0_PassB_CatalogProductSpec.md:120-122` declares the read group "Actor: public / User — public read of published products/**spec entries**/public documents" — Doc-5D **narrowed** its own module contract |

**Ruling R-0 (recommended by this document; RATIFIED by `R-ESC7-PRODDETAIL-FREEZE`):**
Doc-5D governs the M2 wire surface; **Doc-4D governs Doc-5D** (Doc-5 realizes Doc-4 and conforms
upward; the Doc-7 program self-declares "consistent-with the frozen Doc-5 surface"). Therefore:
- C1–C3: Doc-7D §9.2 rows + freeze-audit note + `esc_registry.md:27–29` + companion echoes
  (`information_architecture.md`, `page_inventory.md:109`, `page_templates.md`, `landing_page_spec.md`,
  `marketplace_ux.md`, buyer/vendor companions, `fe-program-wbs`) carry a **transcription-error
  family** — corrected additively in one sitting (Annex E; CATNAV/ADS stay on their own channels).
- C4: `get_spec_library_entry` receives a **Doc-5D conformance correction** to Public-or-Controlling-Org
  per Doc-4D:120 — a correction, not new surface.
- **Void-clause:** had R-0 been ruled otherwise, I.5–I.7 return to the Board. (Moot post-approval;
  retained for the record.)

**Consequence.** The residual, genuinely-missing pieces (all this resolution adds) are:
(1) one composed canonical Public read; (2) anonymous category-path resolution — the granular
`get_category_assignments.v1` is **vendor-addressed** (`vendor_profile_id : uuid : required`,
Doc-4D:62-64) and Controlling-Org: the wrong shape for product breadcrumbs regardless of actor, so
the path is **embedded** in the composed read; (3) the C4 conformance correction; (4) an
SEO-addressable product URL (I.4) — `products` has **no slug/human_ref**; (5) related products —
stays on `ESC-7-API/related`.

## I.4 Canonical URL & addressing decision

**Ratified regime composed with (never restated):** ADR-024 *Canonical Vendor Subdomain URLs*
(APPROVED & FOLDED 2026-07-03) + Doc-2 v1.0.5 **D2-04** (vendor slug law, **CHR** Canonical Host
Resolution, `vendor_slug_history`) + Doc-4D CanonicalHost Patch v1.0.2 (`seo.canonical` advisory)
+ Doc-3 v1.10 (`marketplace.reserved_subdomain_labels`) + Doc-7D §10 (microsite seven-route path IA)
/ §11 leg (host canonicalization, sitemaps, hreflang reservation, session-free vendor hosts).

**Decision (ratified per R4/OBS-3, Annex H):**

| Aspect | Ruling |
|---|---|
| Canonical host | **Apex marketplace host.** Product detail is **P-PUB-11**, a marketplace catalog page (journey J-GST-03) — deliberately **not** one of the microsite's seven Doc-7D §10.1 routes. Route family sits beside the ratified `/marketplace/category/[slug]` (MEGA_MENU §9.1): **`/marketplace/product/{name-slug}-{uuid}`** |
| v1 invariant | **No vendor-host product-detail route exists at all** (nothing to canonicalize). The microsite Products page lists and **links out** to apex detail. Prevents duplicate content; concentrates domain authority (industrial-marketplace precedent: IndiaMART/Alibaba); decouples product canonicals from CHR transitions; keeps the RFQ CTA single-host (vendor hosts are session-free per Doc-7D §11.6) |
| Resolution key | The fixed-length **UUID tail only** (UUIDv7 — Invariant #8, never reused). The `{name-slug}` segment is **presentation-only** (Invariant #9 / PD-P4): derived at render from `products.name`, never persisted, never authoritative |
| Slugifier | **Versioned deterministic pure function**: ASCII-fold → lowercase → non-alphanumeric→hyphen → collapse → trim → cap ~60. **No Bangla transliteration** (unverifiable); empty/too-short result → **id-only canonical** `/marketplace/product/{uuid}`. The id-only leg exists regardless (RFQ line items hold bare `product_id` UUIDs — deep links need no slug lookup). Slugifier changes are governance events (they move canonicals) |
| Redirects | Stale/absent/wrong slug segment → **permanent 301** to current canonical. Unknown / draft / unpublished / soft-deleted / banned-vendor product → **byte-identical 404, never 410** (410 discloses prior existence — R9; slower deindexing accepted, OBS; sitemap removal compensates) |
| Emission | Product URLs emitted **only via the canonical URL builder** (ADR-024's no-string-concatenation rule, extended); `rel=canonical` + `og:url` = builder output (App A) |
| Multilingual | hreflang/locale = the reserved **locale-path scheme** (Doc-7D §11.7) — nothing emitted today; the id anchor is locale-invariant |
| Not the vendor slug law | The product slug segment is explicitly **outside** D2-04 (no 3–40 bound, no reserved labels, no history table, no migration workflow) — a path cosmetic, not an identity host |

**Alternatives evaluated:** (a) UUID-only URLs — survives, weak SEO keyword signal; kept as the
fallback leg. (b) Persisted product slug column — additive Doc-2 patch; disproportionate now
(uniqueness scope, migration, never-reuse machinery) but **forward-compatible**: the id anchor
guarantees 301 continuity if a future Board ratifies it. (c) **Chosen**: derived slug + id anchor —
a strict subset of both futures. Sub-shape `/{uuid}/{name-slug}` = runner-up; `{name-slug}-{uuid}`
ratified (keyword-forward; fixed-length tail parses deterministically).

## I.5 API contract set

### I.5.1 What already exists (post-R-0) — no change

| Contract (frozen) | Actor / projection | Role in this capability |
|---|---|---|
| `marketplace.get_product.v1` | Public-or-Controlling-Org (Doc-5D Pass1 row 29) | Entity read; vendor draft **preview** leg (Controlling-Org) |
| `marketplace.list_products.v1` | Public = published-only (row 30) | Enumeration (incl. sitemap generation, App A) |
| `marketplace.get_spec_document.v1` | Public-or-Controlling-Org (row 32; RFQ-attached leg is `rfq.rfq_document_grants`, Doc-4E — not M2) | Versioned document access |
| `marketplace.list_categories.v1` | Public (row 18) | Taxonomy |
| `marketplace.search_catalog.v1` | Public (row 62; FTS per Doc-6D MK-CR9) | Discovery entry |
| `marketplace.list_vendor_directory.v1` / `marketplace.get_public_vendor_profile.v1` | Public (rows 63/64) | Vendor surfaces; composition precedent |
| `marketplace.get_showcase_project.v1` | Public / User (row 51) | **Projects — separate aggregate (I.8)** |

### I.5.2 New contract (the single addition) — `marketplace.get_public_product_detail.v1`

| Field | Declaration |
|---|---|
| Purpose | The canonical composed **Product Detail Projection** (I.6) for one published product |
| Owner / home | M2 · **BC-MKT-6 Discovery & Read-Model** (mirrors `get_public_vendor_profile.v1`) |
| Template / naming | Doc-4A 21.3 Query · `module.verb_noun.vN` — no new verb coined |
| Actor | **Public / User** (tri-actor R2: usable with no `Authorization`, no `Iv-Active-Organization`) |
| Visibility | **Single Public projection class** — published products only; **no merged read** (R5). Draft preview stays on the `get_product` Controlling-Org leg |
| Composes (M2-owned only) | product core · category path(s) (id+slug+name chain, ≤4 levels) · spec-entry summaries + document refs · vendor summary card (name, vendor slug for the CHR link via URL builder) · canonical_url (builder output) |
| Non-disclosure | **R9 atomicity**: unknown/draft/unpublished/soft-deleted/banned-vendor → one **byte-identical `NOT_FOUND`** for the whole composition (status/body/timing) — the collapse is enforced once, not per consumer |
| Errors / pagination | Doc-5A §6.2 error envelope by pointer; single-entity read — no pagination; nested lists bounded by `marketplace.list_page_size_max` \[100] (Doc-3 v1.2) |
| Audit / events / idempotency | Read: Audit **no**, Events **none**, Idempotency n/a (Doc-4D read-block convention, e.g. :66/:124) |
| Rate limiting | Declared per Doc-4A §19; bound to a `marketplace.*` public-read POLICY key **referenced by intended name only — registration not implied**; registered via an additive Doc-3 §12.2 batch (Doc-4A §18.2 gate) before contract freeze |
| Instrument | Additive **Doc-4D + Doc-5D patch** (Annex E) — architecture-affecting → human approval (CLAUDE.md §8); wire path per Doc-5A §5.3 at patch time (precedent: `/marketplace/public_vendor_profiles/{id}`) |

**R5 preemption.** R5 bars merging *draft and published* projections in one read (Doc-5D Pass2
§5.4); it does not bar composing multiple entities' **published** projections —
`get_public_vendor_profile.v1` is the frozen proof of shape.

**Trust deliberately not embedded — permitted but rejected.** M2 *may* read trust (CLAUDE.md §3
boundary note) and the 2026-07-03 display ruling is display-silent; embedding is rejected because
(1) it would create a second wire distributor of M5 signal, doubling display-ruling enforcement
points; (2) M2's band copy (`vendor_matching_attributes`) is ruled **internal-only / out-of-wire**
(Doc-5D R6/DD-2); (3) trust changes on M5's cadence, not publish cadence. The page composes
Doc-5G Public-Badge reads **beside** the M2 read (I.11).

### I.5.3 Conformance correction (C4) — `marketplace.get_spec_library_entry.v1`

Doc-5D realization corrected to **Public-or-Controlling-Org** per Doc-4D:120 (public leg projects
entries reachable via **published** products; field-level projection review against Doc-4D §D7.2 at
patch time). This is a conform-upward correction of Doc-5D to its own module contract, not new surface.

### I.5.4 Rejected alternatives

**B-alone (actor-widening only, no composed read):** distributes the R9 collapse across every
consumer forever (a client that 404s the product but still 200s a stale spec-document reference is
an unpublish side-channel); seven consumer classes re-implement a 4-leg composition; SSR fan-out on
the highest-traffic anonymous page. **C-broad (composed read + wide granular opening):** surface
bloat; two paths per fact drift. **Chosen:** composed read + the single C4 correction; granular
reads remain entity authority; composed read = **derived projection over the same read-models**
(byte-consistency conformance row, Annex F).

### I.5.5 Versioning & evolution rules (bound, not invented)

Additive-only after freeze; **never rename, never remove**; optional-field addition is the growth
path; deprecation = documented, non-breaking, with sunset review; compatibility guaranteed within
`v1`; **`v2` only via the Doc-4A §20 breaking-change decision table**. Transport-neutral (Doc-4A
§2.2). Consumers must tolerate unknown fields (additive discipline, PD-P6).

## I.6 Canonical model → projections (CQRS ladder)

```text
Figure PD-03 — Projection Ladder (one aggregate, four projections; R5-aligned)

  Canonical Product (aggregate)          Doc-2 §10.3 · marketplace.products (+ product_spec_links)
        │ draft|published|unpublished    Doc-4M · command-driven (set_product_status)
        ├─► Public Product Projection    get_product.v1 Public leg — published entity read
        ├─► Product Detail Projection    get_public_product_detail.v1 (NEW) — composed page read
        ├─► Search Projection            search_catalog.v1 — FTS read-model (tsvector+GIN)
        └─► Controlling-Org Projection   get_product.v1 org leg — draft preview (never merged, R5)
```

```text
Figure PD-01 — Canonical Product Detail Composition
(what the Product Detail Projection assembles; owners in brackets)

                        Product [M2 · BC-MKT-3]
                           │
              ┌────────────┴────────────┐
        Vendor summary [M2]        Category path [M2 taxonomy]
              │                          │
        Trust badges [M5 · Doc-5G   Breadcrumb [presentation]
        reads BESIDE, never inside]
              │
        Specifications [M2 · spec_library_entries]
              │
        Documents [M2 · spec_documents — versioned, immutable]
              │
        RFQ / conversion actions [M3 · authed flows, pointers only]
              │
        Related products [carried ESC-7-API/related — interim "Same category"]
              ▼
        Public Product Detail  (one composed read · one R9 collapse · one canonical URL)
```

Future ESCs may cite **Figure PD-01 / PD-02 / PD-03** by identifier.

## I.7 Response model (logical — no JSON, no schema)

Field classes: **R** Required · **O** Optional · **C** Conditional (present iff its source exists) ·
**K** Computed (derived at read; never stored). Owner = data authority; all rows are the **Public
projection** unless noted.

| Section | Content (logical) | Class | Owner / source |
|---|---|---|---|
| Identity | product id · name · published state (implicit: only published are served) · timestamps | R | M2 `products` (Doc-2 §10.3) |
| Canonical URL | builder-emitted canonical | **K** | Presentation rule I.4 (never stored) |
| Vendor summary | vendor name · vendor slug (→ CHR microsite link) · vendor id | R | M2 `vendor_profiles` |
| Taxonomy | category path(s): id+slug+name chain (≤4 levels, admin-governed tree) | C | M2 `categories` + `category_assignments` |
| Specifications | linked spec-entry summaries (name, summary) | C | M2 `spec_library_entries` via `product_spec_links` |
| Documents | spec-document refs: doc_type (`urs\|datasheet\|checklist\|drawing\|standard` — frozen enum), version_no / active revision, `file_ref` | C | M2 `spec_documents` (versioned, never overwritten — Invariant #8) |
| Media | image storage refs from `images_jsonb` | C | M2; **GI-09**: contracts carry refs only, delivery via signed/public URL at read. Ordering/alt-text law is corpus-silent → OBS; FE renders defensively |
| Description | long description | O | M2 `products.description` |
| Attributes | **reserved section — empty in v1** (I.7.2) | — | future additive |
| Pricing | **explicit non-goal** (I.7.3) | — | not modeled |
| Availability / inventory | **explicit non-goal** — corpus-silent | — | future additive (I.12) |
| Certifications | vendor-level verified badge → M5 read (I.11); product-level technical standards = `spec_documents` doc_type `standard` — **no certification entity coined** | C | M5 badge · M2 documents |
| Trust indicators | **not in this response** — composed beside from Doc-5G (I.11) | — | M5 |
| RFQ actions | **not data** — presentation CTAs into authed M3 flows (I.10) | — | M3 |
| SEO fields | derived at render from name/description/media (App A) | K | presentation |
| Analytics | **not in the response** — presentation telemetry per SC §4 (I.9) | — | PostHog |
| Related products | **absent** — carried `ESC-7-API/related`; interim "Same category" facets | — | ESC channel |

**Normative exclusion manifest (binding on the patch):** no trust/performance values · no price or
currency · no counts (views/RFQ demand — non-disclosure + fabricated-state) · no draft/internal
fields · no related items · no buyer-private anything (Invariant #11) · no entitlement facts (R8).

### I.7.1 Media strategy

Today's frozen surface: `products.images_jsonb` (storage refs) + `spec_documents.storage_ref`
(PDFs/drawings under the frozen `doc_type` enum — drawings are first-class already). **CAD, video,
3D, rich galleries are corpus-silent** → they plug into the **Media extension point** (I.12) via an
additive media-model patch; nothing fabricated meanwhile. Delivery per GI-09 (refs in contracts;
signed/public URLs at read). Crawler-stable `og:image` is an App-A decision (precedent:
`seo_settings.og_image_ref`, Doc-6D Pass2 §3.3.x).

### I.7.2 Industrial attributes — architectural placement only

Industrial procurement needs structured attributes (operating capacity, pressure, voltage, flow,
material, dimensions, standards, certifications, country of origin, applications). **Where they
live** (no values defined here): today → the **spec library chain**
(`product_spec_links → spec_library_entries → spec_documents`) + description; future → a
**structured attribute model via additive Doc-2 patch** (category-scoped attribute templates a
candidate), landing in the reserved `Attributes` response section additively (PD-P6). This is the
declared differentiator socket vs generic marketplaces — reserved, not invented.

### I.7.3 Pricing visibility — explicit non-goal

The frozen product model has **no price/currency/unit/SKU/MOQ fields** (Doc-2 §10.3; Doc-6D §3.3.1).
Pricing display is therefore **out of scope by construction** (RFQ-first: price discovery happens in
governed quotations, Doc-4E). Any future pricing requires a **Doc-2 additive patch first** — never a
response-field addition (RK-2). Multi-currency readiness (`{amount, currency}` per value field,
Doc-2 §0.4) applies whenever that future arrives. Board confirmation recorded (R4/OBS-2).

## I.8 Product ≠ Project boundary

This API serves **published products only** (PD-P9). `showcase_projects` is a **distinct M2
aggregate** with its own frozen Public read (`get_showcase_project.v1`, Doc-5D Pass1 row 51), its
own lifecycle, and its own pages (P-PUB-15 / microsite Projects). Projects are never forced into
Product Detail and vice versa. Any sharing is **presentation-only** (the T-DETAILS template serves
both — template reuse, never API reuse). A sibling **`ESC-7-API-PROJECTDETAIL`** resolution is the
expected future instrument for project detail (Annex H R3/OBS-1); nothing is pre-committed here.

## I.9 Frontend Contract (Team-1 — what FE receives)

| Aspect | Contract |
|---|---|
| Page / route | P-PUB-11 on `app/(public)` at the I.4 canonical route; template **T-DETAILS** (page_templates §4); regions in rendering order: Breadcrumb → HERO → TABS → CONTENT → RIGHT-RAIL |
| Region mapping | Breadcrumb = taxonomy path (deterministic pick rule when multi-category — I.14 item 8) · HERO = identity + status + trust badge (M5) + primary CTAs · TABS = Overview / Specifications / Documents / Applications · RIGHT-RAIL = vendor card, documents, metadata. "Applications" maps **honestly** to existing content (description/spec/category context) — no fabricated data |
| Data | **One composed read** (`get_public_product_detail.v1`) + Doc-5G badge reads beside; FE never re-composes from granular legs and never bypasses the canonical contract (PD-P10) |
| Loading / skeleton | SK-CARD/SK-DETAIL skeleton presets (shared_conventions §3); skeleton per region, no layout shift |
| Error states | Read fails NOT_FOUND → the route 404s **byte-identically** to genuine absence (no "product removed" page); transient failure → standard error region + retry; **trust-badge failure → render-without-badge (fail-open-to-omit; the page never 404s on M5 unavailability)** |
| Empty states | No specs / no documents / no images / no related → honest empty regions (GI-05 family); never fabricated placeholders |
| SSR / ISR / hydration | Server-Component-rendered, SSR/SSG-friendly, indexable (Doc-7D §7.1). ISR/caching are implementation-layer (PD-P7) with one binding expectation: **no cache tier serves a product past its non-disclosure collapse beyond the Doc-8-registered staleness bound** (invalidate on the `set_product_status` command path or bounded TTL — no ProductPublished event exists; none coined). Hydration: minimal client islands (gallery, tabs, sticky CTA rail) |
| Component ownership | Doc-7B kit primitives only (status-chip, trust-badge, file-link, tabs, data-table, breadcrumb) — **never duplicate a kit primitive** (frozen foundation); page composition owned by Team-1 under `app/(public)`; the interim `app/(public)/_components/product-detail.tsx` modal is **retired at cutover** — modal invocations route/redirect to the canonical URL |
| Mobile | UX §9 rules; sticky action rail on mobile; tables scroll within their container |
| Analytics | SC §4 grammar, presentation-only (PostHog), GI-12 non-disclosure: `product.viewed`, `product.cta_clicked` (family property), `product.document_opened`, `product.vendor_clicked` — **no payload may reveal exclusion/private facts**; names confirmed at build per SC §4 |

## I.10 User actions (actor × action; every action contract-bound)

| Actor | Available on this page | Binding |
|---|---|---|
| Anonymous | View published product · navigate taxonomy/vendor · share (canonical URL) · public compare (P-PUB-20, session-local, contract-less — UX §7.5) · conversion CTAs → `(auth)` | Composed read; **no anonymous RFQ** (Doc-3 §5.1), no anonymous contact (M6 User-only), no anonymous favorite |
| Buyer (User) | Add to RFQ = line-item edit on a draft RFQ / create seeded RFQ (`rfq.update_rfq.v1` / `rfq.create_rfq.v1`; line items carry bare-UUID `product_id`, service-validated) · request quotation from this vendor = buyer-directed inputs at `create_rfq` (no separate contract) · request info / contact vendor = `comm.create_thread.v1` · save = `marketplace.add_catalog_favorite.v1` (target_type `product`) · compare | M3 / M6 / M2 contracts, all authed |
| Vendor Owner / Staff (controlling org) | View public page as anyone; **draft preview via `get_product` Controlling-Org leg** (never merged, R5); manage/publish via workspace (`can_manage_products`; publish entitlement-gated) — **no edit affordances on the public page** | M2 command surface (Doc-4D §D7.2) |
| Admin | Governance via owning-module commands only: `set_product_status` unpublish leg (Doc-4M authority row), category governance (DD-4); **no admin bypass of M2 domain** | Doc-4M; Doc-5D §5 |
| Support | Read-only staff observation; **no staff product surface exists — none coined** (flagged) | — |
| AI Agent | M9 out-of-wire generate (System); User-scoped advisory reads (`ai.get_recommendation.v1` · `ai.get_prediction.v1` · `ai.get_classification.v1` · `ai.get_similar_vendors.v1` + list siblings) — **no Public AI read exists or is proposed; no related-products contract exists** (`ESC-7-API/related`) | Doc-4K/Doc-5K |
| WhatsApp note | No platform contract for visitor-outbound WhatsApp (M6 owns delivery **logs** only, out-of-wire). Any WhatsApp CTA is limited to vendor-published public contact data where the public profile carries it — corpus-silent point, flagged, nothing coined | Doc-4H Part3 |

## I.11 Trust & security boundaries

**Trust (M5 — beside, never inside).** HERO badge + Trust section + vendor card values come from
Doc-5G Public-Badge reads: `trust.get_verified_tier.v1` (binary verified badge),
`trust.get_trust_score.v1` (**numeric + band + badges permitted on any public surface** — Board
display ruling 2026-07-03), `trust.get_performance_score.v1` (**band-only** per the same ruling),
`trust.get_review.v1` / `trust.list_reviews.v1` (**vendor-scoped, post-award, published-only** —
product-scoped reviews do not exist and are not fabricated). Never: formula, inputs, thresholds,
percentile, confidence, hidden penalties. Admin ratings and verification case detail are
Staff-Internal — never on this surface. M2 embeds no scores (I.5.2). Failure mode: fail-open-to-omit.

**Security.** Tri-actor R2 (anonymous read carries no auth headers → anonymous-cacheable).
Public = published projection only; draft/vendor-only facts live on the Controlling-Org leg;
admin-only facts are Staff-Internal. **R9 byte-identical `NOT_FOUND`** across
absent/draft/unpublished/soft-deleted/banned — status, body, **timing**, and every cache tier
(Annex F row F-1). Rate limiting & anti-scraping: Doc-4A §19 declarations with POLICY-bound limits
(RATE_LIMITED/QUOTA error classes; keys via the §18.2 Doc-3 batch); robots/sitemaps per App A;
full-catalog enumeration via Public `list_products` is **accepted** exposure — indexability is the
business choice; residual control = rate limits + infra (no CAPTCHA contract exists in the corpus —
stated, not coined). Abuse/moderation → M8 channel (ban reflects into M2 via `VendorBanned`,
System consumer). OBS: UUIDv7 ordering discloses catalog cadence — accepted. No client-supplied org
context is ever trusted (Invariant #5).

## I.12 Extension Points (reserved sockets — defined, not implemented)

| Socket | Plugs into | Instrument when activated | Stays stable |
|---|---|---|---|
| Media (CAD/video/3D/galleries) | I.7 Media section | Additive Doc-2 media-model patch + Doc-4D/5D/6D legs | refs-only discipline (GI-09); composed read grows additively |
| Attributes (structured industrial) | I.7 reserved `Attributes` section | Additive Doc-2 patch (category-scoped templates candidate) | spec-library chain remains valid |
| Pricing | I.7.3 non-goal → future section | **Doc-2 patch first**, then Doc-4D/5D; multi-currency per Doc-2 §0.4 | RFQ-first flows; money boundary |
| Inventory / availability | new response section | Additive Doc-2 patch | published-only projection |
| Variants | product aggregate evolution | Additive Doc-2 patch (aggregate-shape decision) | UUID anchor + URL scheme |
| Bundles | new aggregate or relation | Additive Doc-2 patch | Product ≠ Bundle ownership decided then |
| Documents (beyond spec enum) | I.7 Documents | Additive Doc-2/4D enum patch (`doc_type` is frozen) | versioned-immutable law |
| AI enrichment | beside the read (M9 advisory) | Doc-5K activation / additive patch; `ESC-7-AI` | "AI suggests; modules decide"; no Public AI read |
| Marketplace Ads (sponsored slots) | page placements | `ESC-7-API-ADS` channel (premise corrected per R-0) | non-disclosure; ads never re-rank |

**Pattern reuse (R4/OBS-1):** this composed-read + capability structure is the **reference pattern**
for future detail capabilities — Vendor Detail, Category Detail, Project Detail, Industry Detail,
Company Detail (cf. the repo's canonical-pattern culture, `REFERENCE_Audited_Write_Pattern_v1.0`).

## I.13 Risks (CLAUDE.md §13 ladder; freeze gate = BLOCKER/MAJOR/MINOR all zero)

| ID | Sev | Risk → Mitigation | Status at approval |
|---|---|---|---|
| RK-1 | BLOCKER | Frozen-vs-frozen premise family unruled (I.3 C1–C4) → R-0 first agenda item; Annex E correction manifest | **Cleared — R-0 ratified by `R-ESC7-PRODDETAIL-FREEZE`; instruments pending (Annex E)** |
| RK-2 | BLOCKER | Pricing/availability/offers coinage vs an unmodeled domain → I.7 exclusion manifest normative; offer-less schema.org (App A); Doc-2-patch-first rule | Cleared by design |
| RK-3 | MAJOR | Cache/SSG staleness vs R5/R9 on unpublish (no domain event) → I.9 invariant; command-path invalidation or bounded TTL; Doc-8 bound; Annex F F-1 | Mitigated; QA-gated |
| RK-4 | MAJOR | Duplicate content apex↔vendor hosts → v1 "no vendor-host detail route" invariant; builder-only URLs; Annex F F-5 | Mitigated |
| RK-5 | MAJOR | Catalog scraping via composed read + Public `list_products` → §19 POLICY-bound limits (§18.2 batch); robots; residual accepted | Mitigated/accepted |
| RK-6 | MAJOR | Partial correction leaves CATNAV/ADS premises stale → one sweep patch, same sitting (Annex E) | Instrument pending |
| RK-7 | MINOR | Slug/slugifier churn → UUID anchor makes all churn 301-safe; slugifier versioned pure function | Mitigated |
| RK-8 | MINOR | Multi-category breadcrumb ambiguity (M:N; `level`/`is_specialized` exist, no primary flag) → deterministic pick rule (I.14 item 8); no Doc-2 flag patch | Rule at patch time |
| RK-9 | MINOR | Spec-entry public leg exposes vendor-internal naming → project only entries linked to published products; field review vs Doc-4D §D7.2 | Patch-time review |
| RK-10 | MINOR | Trust-badge fetch failure degrading page → fail-open-to-omit (I.9/I.11) | Mitigated |
| RK-14 | MAJOR | Product↔Project conflation drift → I.8 boundary; sibling ESC expected | Mitigated by boundary |
| RK-11 | OBS | 404-not-410 slows deindexing → R9-mandated; sitemap removal compensates | Watch |
| RK-12 | OBS | UUIDv7 ordering discloses catalog cadence → public catalog; rate limits | Accepted |
| RK-13 | OBS | Composed-read size creep (years/mobile) → PD-P6 discipline; pruning only at a §20 v2 table | Watch |

## I.14 Board decisions — adjudicated-in-principle by `R-ESC7-PRODDETAIL-FREEZE` (instruments pending)

| # | Decision | Ruling / recommendation | Instrument (Annex E) |
|---|---|---|---|
| 1 | **R-0** premise reconciliation | **RATIFIED**: Doc-5D governs the wire; Doc-4D governs Doc-5D; correction family ordered (incl. CATNAV/ADS sweep) | Doc-7D §9.2 corrigendum + registry/companion corrections |
| 2 | Coin `marketplace.get_public_product_detail.v1` | **APPROVED** (intake) | Additive Doc-4D + Doc-5D patch (human sign-off per CLAUDE.md §8) |
| 3 | Spec-entry conformance correction; category path embedded-only | **APPROVED** (granular assignments read stays vendor-addressed; no widening) | Same Doc-5D patch |
| 4 | Canonical URL: apex + id-anchored derived slug + no-vendor-host-detail invariant | **RATIFIED** (R4/OBS-3: "sufficiently future-proof") | Small ADR (ADR-025-class) + Doc-7 leg |
| 5 | Slug sub-shape `{name-slug}-{uuid}` | **RATIFIED** (runner-up recorded) | Same ADR |
| 6 | Public-read rate-limit POLICY key(s) — names/values | Pending batch | Additive Doc-3 §12.2 patch (§18.2 gate) |
| 7 | Correction instrument form (corrigendum vs versioned patch) — note the freeze audit itself repeated the premise (`Doc-7D_Content_Freeze_Audit_v1.0.md:20`) | Corrigendum recommended | Doc-7D corrigendum |
| 8 | Breadcrumb deterministic pick rule (no primary-flag Doc-2 patch) | Confirmed — rule fixed at patch time | Doc-5D patch text |
| 9 | schema.org offer-less profile + og:image stability approach | Confirmed — App A; reuse `og_image_ref` delivery precedent | Patch/App A note |
| 10 | Confirmations: product reviews out (vendor-scoped only) · trust fail-open-to-omit · AI-crawler robots policy (business) · **FE-PUB-05 un-gates when Annex E items 1–3 land** | Recorded | Program board update |

**Downstream ESCs eased by this resolution (R4/OBS-2):** Related Products (`ESC-7-API/related`),
Compare persistence (if ever), Product SEO, Product Analytics.

---

# APPENDICES (informative — not the approval object)

## Appendix A — SEO plan

| Topic | Plan (pointers) |
|---|---|
| Canonical / og:url | Builder-emitted apex canonical (I.4); vendor `seo.canonical` remains **advisory** (Doc-4D CanonicalHost v1.0.2) and never overrides |
| schema.org | `Product` JSON-LD: name, image (stable URL), description, brand→vendor (Organization), URL = canonical. **No `offers`, no `aggregateRating`** — nothing modeled, nothing fabricated (RK-2); reduced rich-result eligibility accepted |
| Breadcrumb | `BreadcrumbList` JSON-LD from the taxonomy path (I.7) |
| Meta / OG | Title/description derived from name + description (deterministic truncation); `og:image` from product media — **stability decision**: crawlers + WhatsApp link previews (Bangladesh-critical) need a stable public image URL; GI-09 short-lived signed URLs are insufficient → reuse the `seo_settings.og_image_ref` delivery precedent (public-cacheable delivery for **published** product images) |
| Sitemap | Product URLs enter the **apex** sitemap (platform-generated; sharded at scale), enumerated server-side via Public `list_products.v1`; `lastmod` = updated_at; unpublish = sitemap removal + byte-identical 404 (never 410) |
| Robots / indexing | Platform-generated robots.txt (ADR-024 leg); index published product pages only; search-results/param/compare pages canonicalized or noindexed — one canonical host+path per product (RK-4) |
| hreflang | None emitted today; reserved locale-path scheme (Doc-7D §11.7) composes with the id anchor |
| Vendor↔product linking | Product page → vendor microsite via CHR host (builder); microsite Products page → apex product detail; equity flows both ways without duplication |

## Appendix B — Search & discovery integration

`search_catalog.v1` (Public FTS: products.name/description, vendor_profiles.name, categories.name —
Doc-6D MK-CR9) remains the discovery entry; result cards link via the URL builder. Category landing
`/marketplace/category/[slug]` (794 ratified taxonomy slugs; MEGA_MENU §9.1) and the Industrial
Category Explorer feed the same detail route; breadcrumbs render the taxonomy path from the composed
read. Counts stay facet-backed (GI-03; `ESC-7-API-CATNAV` interim until its own patch — premise
corrected per R-0). **R9 count consistency:** unpublished/banned drop from results, facet counts,
and detail identically (Annex F F-3). "More from this vendor" = vendor-scoped `search_catalog`,
labeled "From this vendor"/"Same category" — **never "Recommended"** (UX §7.6; `ESC-7-API/related`).
The search **indexer** is in-process (Doc-5D §5.4/§9 dual-leg rule) — the new wire read carries no
indexing obligation. Meilisearch remains a future infra swap (Doc-6D MK-CR9), invisible at contract level.

## Appendix C — Future expansion (compatibility table)

| Future | Compatible path (all additive) |
|---|---|
| Mobile app | Same composed read (transport-neutral, PD-P7); fewer round-trips is the design |
| API v2 | Only via Doc-4A §20 decision table; PD-P6 makes v1 long-lived |
| ERP integrations | M4 boundary; products referenced by UUID (bare-ID cross-module rule) |
| AI recommendations | M9 advisory (User-scoped); activation via Doc-5K channel; never authoritative (Invariant #12) |
| Inventory · Variants · Pricing engine · Bundles | Doc-2 additive patches first → reserved response sections (I.12) |
| Marketplace ads | `ESC-7-API-ADS` channel; sponsored slots compose beside content, never re-rank |
| Digital catalog / 3D / video | Media extension point (I.12) |
| Localization | Locale-path scheme (Doc-7D §11.7); id anchor locale-invariant |

## Appendix D — Performance strategy (qualitative; budgets are Doc-8's)

Numeric budgets, test criteria, and a11y/perf conformance are **Doc-8-owned** — this appendix
points and never coins. Qualitative plan: server-component SSR/SSG rendering (Doc-7D §7.1);
anonymous responses cacheable (no auth headers, R2) at CDN/ISR layers **as implementation choices**
(PD-P7) under the one correctness invariant: **no cache tier serves a product past its
non-disclosure collapse beyond the Doc-8-registered staleness bound** (invalidation on the
`set_product_status` command path or bounded TTL; CHR cache-invalidation discipline is the ratified
precedent). Bounded fan-out: one composed read + Doc-5G badge reads. Images: storage refs via kit
image conventions, lazy below the fold. Documents: signed URLs at click (GI-09), never preloaded.
Nested lists cursor-paged (`marketplace.list_page_size_max`). Incremental loading: tabs/rail hydrate
as client islands after first paint.

---

# ANNEXES (records)

## Annex E — Patch Manifest (follow-on instruments; none produced here)

| # | Instrument | Content | Channel |
|---|---|---|---|
| E-1 | Additive **Doc-4D + Doc-5D patch** | `marketplace.get_public_product_detail.v1` (I.5.2) + `get_spec_library_entry` conformance correction (I.5.3) + breadcrumb pick rule | API-Gov Board + human approval (CLAUDE.md §8) |
| E-2 | Additive **Doc-3 §12.2 patch** | public-read rate-limit POLICY key batch (intended names; §18.2 gate) | Doc-3 channel |
| E-3 | **ADR-025-class record** + Doc-7 leg | Canonical product URL law (I.4) — apex, id anchor, derived slug, no-vendor-host-detail invariant | ADR channel (human approval) |
| E-4 | **Doc-7D §9.2 corrigendum** | C1/C2 rows + freeze-audit note (`Doc-7D_Content_Freeze_Audit_v1.0.md:20`) corrected to the Doc-5D surface | Corpus-reconciliation (human) |
| E-5 | **Companion sweep** | `esc_registry.md:27–29` premise corrections (PRODDETAIL resolved-by pointer; CATNAV/ADS premises restated truthfully, handles stay open for their residual gaps) · `information_architecture.md` §6.1/§10 · `page_inventory.md:109` · `page_templates.md` · `landing_page_spec.md` · `marketplace_ux.md` · buyer/vendor companions · `fe-program-wbs` | Companion owners |
| E-6 | **Program board update** | FE-PUB-05 ⛔ → ready when E-1/E-3 land; record `R-ESC7-PRODDETAIL-FREEZE` | project-management |

## Annex F — Conformance rows (CHK-style; wired into Doc-8 at patch time)

| # | Check |
|---|---|
| F-1 | **404 byte-equality** across absent/draft/unpublished/soft-deleted/banned — status, body, timing — **including every cache tier** |
| F-2 | **301 slug-correction**: any non-canonical slug segment for a published product 301s to the current canonical; id-only leg resolves |
| F-3 | **R9 count consistency**: an unpublished product disappears from search results, facet counts, sitemaps, and detail identically |
| F-4 | **Builder-only lint**: no string-concatenated product URL in any emitter (pages, metadata, JSON-LD, sitemap, notifications) |
| F-5 | **No vendor-host product route**: no product-detail route resolves under any vendor host (v1 invariant) |
| F-6 | **Byte-consistency**: composed read fields ≡ their granular-read sources for the same published product |

## Annex G — Anchor index (verify-before-deliver; every frozen token cited → source)

| Anchor | Source |
|---|---|
| `ESC-7-API-PRODDETAIL` / `-CATNAV` / `-ADS` / `/related` / `/stats` / `/upload` / `ESC-7-AI` | `esc_registry.md:27–35` (precedence rule :19) |
| `marketplace.get_product.v1` · `list_products.v1` · `get_spec_library_entry.v1` · `get_spec_document.v1` rows | `generatedDocs/Doc-5D_Content_v1.0_Pass1.md:128–131` (§2.3) |
| `list_categories.v1` :117 · `get_category_assignments.v1` :118 · favorites :168–170 · ads :166–167 · `search_catalog.v1` :171 · `list_vendor_directory.v1` :172 · `get_public_vendor_profile.v1` :173 · `get_showcase_project.v1` :155 | `Doc-5D_Content_v1.0_Pass1.md` §2.3–§2.5 |
| Projection classes (§5.4) · pagination/idempotency (§5.5) · dual-leg rule (§5.4/§9) | `Doc-5D_Content_v1.0_Pass2.md:76–83` |
| R1–R10 (R2 tri-actor · R5 · R8 · R9 · R10) | `Doc-5D_Structure_v1.0_FROZEN.md` §1–§3 |
| "Actor: public / User — … spec entries" (C4) | `Doc-4D_Content_v1.0_PassB_CatalogProductSpec.md:120–122`; assignments addressing :62–64; read-block "Audit: no" :66/:124 |
| "no Public `get_product`" + view inventory | `Doc-7D_Content_v1.0_Pass2.md:86–88, :105–107`; freeze-audit premise `Doc-7D_Content_Freeze_Audit_v1.0.md:20` |
| Product aggregate/fields; 8 aggregates / 21 tables; spec chain; `images_jsonb` | Doc-2 §10.3 (`Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md`); DDL `Doc-6D_Content_v1.0_Pass2.md` §3.3.1/§3.3.3; `seo_settings.og_image_ref` :204 |
| Product states `draft\|published\|unpublished` + authority rows | `Doc-4M_FROZEN_v1.0.md` (product machine; Doc-2 §3) |
| ADR-024 · D2-04 (slug law, CHR, history) · reserved labels | `generatedDocs/ADR-024_Canonical_Vendor_Subdomain_URLs.md`; `Doc-2_Patch_v1.0.5.md` (APPROVED & FOLDED); `Doc-3_Policy_Key_Registration_Patch_v1.10_VendorSubdomain.md`; `Doc-4D_CanonicalHost_Patch_v1.0.2.md`; Doc-7D §10/§11 legs |
| `marketplace.list_page_size_max` \[100] · `idempotency_dedup_window` \[24h] | `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace.md` |
| Doc-4A: error classes · cursor-only · §18.2 · §19 · §20 · §2.2 · §7 | `Doc-4A_Content_v1.0_Pass2/3/4/5/6.md` |
| Trust reads + display ruling · reviews vendor-scoped | `Doc-5G_Content_v1.0_Pass1.md` §2.2/§2.3/§2.5; owner Board ruling 2026-07-03 (registry record) |
| `rfq.create_rfq.v1` / `rfq.update_rfq.v1` · line-item product_id · no anonymous RFQ | `Doc-5E_Content_v1.0_Pass1.md` §2.2; Doc-2 §3 (M3); Doc-3 §5.1 |
| `comm.create_thread.v1` (+ M6 thread/notification reads) · WhatsApp delivery logs | `Doc-5H_Content_v1.0_Pass1.md:72–79,96`; Doc-4H PassB Part1 / Part3 |
| `ai.get_recommendation.v1` · `ai.get_prediction.v1` · `ai.get_classification.v1` · `ai.get_similar_vendors.v1` (User-only advisory) | `Doc-4K_FROZEN_v1.0.md:274+`; `Doc-4K_Final_Freeze_Audit_v1.0.md:315–321`; Doc-5K |
| T-DETAILS regions/prohibitions · P-PUB-11/14/15/20 · J-GST-03/05/06 | `page_templates.md` §4; `page_inventory.md:109,111–113,118`; `marketplace_ux.md` §2 |
| SSR/indexable · seven-route IA · FTS · taxonomy/mega-menu route | Doc-7D §7.1/§10.1; `Doc-6D_Structure_v1.0_FROZEN.md` (MK-CR9); `MEGA_MENU_ARCHITECTURE.md` §9.1 |
| SC §4 grammar · GI-03/05/09/10/12 · SK presets | `shared_conventions.md` |
| Interim modal | `app/(public)/_components/product-detail.tsx` |

## Annex H — Board Adjudication Record (Raise ≠ Accept; all findings dispositioned)

**Round 1 (owner Board):** MAJOR-01 scope split (Part I approval object + Appendices A–D) — **accepted/folded**;
MAJOR-02 dedicated Frontend Contract (I.9) — **accepted**; MINOR-01 field classes R/O/C/K (I.7) — **accepted**;
MINOR-02 canonical-model-vs-projection ladder (I.6, Figure PD-03) — **accepted**; MINOR-03 versioning
rules (I.5.5) — **accepted**; MINOR-04 media subsection (I.7.1) — **accepted**; MINOR-05 industrial-attributes
placement (I.7.2) — **accepted**; MINOR-06 Product ≠ Project (I.8, RK-14) — **accepted**; composition
diagram — **accepted** (Figure PD-01).

**Round 2:** capability framing flip (Figure PD-02; API = one facet) — **accepted**; Architecture
Principles after Purpose (I.2, PD-P1…P10) — **accepted**; Extension Points as first-class (I.12) — **accepted**.

**Round 3:** MINOR-1 size discipline (≤ ~700 lines; tier rule in preamble) — **accepted**; MINOR-2
formal figure identifiers (PD-01/02/03) — **accepted**; OBS-1 sibling `ESC-7-API-PROJECTDETAIL`
expected (I.8) — **recorded**; OBS-2 downstream ESCs eased (I.14) — **recorded**; OBS-3 reusable
pattern (I.12) — **recorded**.

**Round 4 — Final Resolution:** `R-ESC7-PRODDETAIL-FREEZE` · **APPROVED** · Freeze Gate **PASS** ·
Conditions **none**. OBS-1 reference pattern for composed-read capabilities — recorded (I.12);
OBS-2 pricing non-coinage correct — recorded (I.7.3); OBS-3 URL strategy sufficiently future-proof —
recorded (I.4); OBS-4 size discipline recommended as a **general Board convention** — recorded
(preamble). Impact: unblocks FE-PUB-05 and eases Product SEO / Related / Compare / Product
Analytics planning. Governance assessment: separation of concerns, ownership boundaries, dependency
management, extension strategy, corpus discipline, low architectural risk — consistent with
platform architecture quality.

**Gate arithmetic at approval:** raised findings 2 MAJOR + 8 MINOR (+1 strong rec, +7 OBS) across
rounds — all accepted and folded → **BLOCKER 0 · MAJOR 0 · MINOR 0** (§13 freeze gate satisfied);
OBS items non-gating, recorded.

---

*End of resolution. On any conflict between this document and a frozen document, the frozen
document wins and this document is patched to match (CLAUDE.md preamble rule).*

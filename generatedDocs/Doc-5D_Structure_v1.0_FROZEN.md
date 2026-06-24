# Doc-5D — Marketplace & Discovery (M2 `marketplace`) API Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents for Doc-5D |
| Freeze Date | 2026-06-24 |
| Supersedes | `Doc-5D_Structure_Proposal_v0.1.md` (v0.2 + round-3 ADD-1/ADD-2 — Independent Hard Review applied; 4 MAJOR + 6 MINOR + 4 NITPICK + 2 round-3 additions resolved; authoring history + review disposition retained there) |
| Module | Module 2 — Marketplace & Discovery (`marketplace` schema) — first large public/anonymous read surface |
| Realizes | `Doc-4D` (M2 contracts, FROZEN — **71 contracts**, PassB per-Contract-ID blocks) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Precedent (informational, not authority) | `Doc-5B`/`Doc-5C`/`Doc-5E` (FROZEN); **`Doc-5C §3` mechanism-only cross-cutting precedent**; **Doc-5E `[ESC-RFQ-POLICY]` content-freeze-gate precedent** (DD-6); force derives from `Doc-5A §1.3/§5/§7/§11` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0 (Identity services consumed), Doc-4D v1.0 (FROZEN — M2 contracts), Doc-4M v1.0 (FROZEN — state machines), Doc-5A v1.0 (FROZEN) |
| Contains | Structure only — section map, surface partition (section-pointer column), ratified decisions, the carried freeze-gate dependencies. No endpoints, paths, status tables, schemas, or contract bodies |
| Audience | Architecture Board · API Governance Board · Doc-5D content authors (human + AI) · AI Coding Supervisor · backend, QA |

Two governing rules shape the document:

1. **Realize, never re-decide.** Doc-4D fixed *what* M2's 71 contracts declare (FROZEN); Doc-5A fixed *how* a contract becomes HTTP (FROZEN). Doc-5D realizes Doc-4D's **caller-facing** surface and re-decides nothing; every rule binds Doc-5A / Doc-4D / corpus by pointer.
2. **Conformance is an obligation.** Doc-5D passes the Doc-5A **Appendix A** checklist before freeze. It coins no endpoint, status, header, error class, permission slug, POLICY key, or event.

## Decisions ratified at structure freeze

- **R1 — Out-of-wire boundary** (Doc-5B/5C/5E precedent; authority `Doc-5A §1.3/§5/§11`). Doc-5D realizes only the caller-facing HTTP surface (Public + User + Admin). **7 contracts have no caller wire** (§9): the System event consumers `marketplace.sync_verified_financial_tier.v1`, `marketplace.reflect_verified_claim_status.v1`, `marketplace.reflect_vendor_ban.v1` (21.5 System); the System read-model rebuild `marketplace.rebuild_vendor_matching_attributes.v1` (21.5 System, DD-2); the infrastructure-driven `marketplace.confirm_custom_domain_verification.v1` (21.5 System); the internal-service `marketplace.get_vendor_matching_attributes.v1` (21.3, RFQ-consumed, DD-2); and the DD-8-blocked `marketplace.reflect_vendor_ban_lift.v1` (21.5 System, non-implementable placeholder — no `VendorBanLifted` event in Doc-2 §8). **Flag-and-halt if any wire is proposed for them.**
- **R2 — Tri-actor surface (the M2 differentiator).** Unlike M0 (Admin-only), M1 (User-primary + Admin), M3 (dual-User + Admin), M2 is the **first module with a large public/anonymous read surface.** Three caller classes: **Public** (anonymous discovery/directory/public-profile and published catalog reads — **no `Authorization`, no `Iv-Active-Organization`**); **User** inside a server-validated active org (`Iv-Active-Organization` carried, **server-validated, never client-trusted** — `Doc-4A §5.3`; `Doc-5A §7`); and the **Admin** governance subset (category lifecycle, advertisement review — 21.6, **no** org context, `Doc-5A §7.3`). System is out-of-wire (R1).
- **R3 — `marketplace` route prefix** (`Doc-5A Appendix B.1` — registered "Reserved"; `Doc-2 §0.3`).
- **R4 — No token invented.** Endpoints bind existing Doc-2 §7 slugs, §9 audit actions, §8 events; carried gaps bound by pointer and **escalated, never invented**: `[ESC-MKT-AUDIT]` (un-enumerated advertisement/product/showcase/custom-domain audit actions in Doc-2 §9), **DD-6** (`marketplace.*` POLICY keys), **DD-3/DD-4** (`staff_*` governance slugs) — `CHK-5A-121` (anti-invention) · `CHK-5A-154` (namespace token) · `Doc-4A §6.4/§18.2`.
- **R5 — Content ≠ Presentation realized as two read projections** (Invariant #9). Draft (controlling-org only) and published (public) projections are **distinct wire surfaces**; the `publish_*` / `unpublish_*` commands drive the literal transition (authoritative state authority **Doc-4M**); no merged read leaks draft state to the public surface. Soft-deleted / unpublished / retired entities are excluded from public reads (`Doc-2 §0.2`).
- **R6 — Matching read-model is projection-only (DD-2).** `get_vendor_matching_attributes` is an **internal-service** read consumed by the RFQ engine (out-of-wire, §9); `rebuild_vendor_matching_attributes` is **System-only** (§9). Doc-5D authors **no** matching / eligibility / routing / ranking / selection surface — that logic is RFQ-owned (`Doc-4E`). M2 **reads** Trust scores, never calculates them (`Master_System_Architecture_v1.0_FINAL` Module 2 description — "may read Trust Score, may not calculate it"; Invariant #6; `Doc-4D` DD-2).
- **R7 — Reflect-never-decide.** The verified financial-tier write, the `claimed → verified` claim transition, and the `banned` status are realized **only** as **System event consumers** (DD-1 Trust-driven, DD-3 Admin-driven), never as a caller-facing decision endpoint. `marketplace.reflect_vendor_ban_lift.v1` remains a **non-implementable placeholder** (DD-8) with a "DO NOT implement" guard until Doc-2 §8 declares the ban-lift event.
- **R8 — Entitlement gating consumed, never authored (DD-5).** The custom-domain-bind and advertisement create/submit surfaces **consume** Billing (`Doc-4I`) entitlement checks; denial collapses to the non-disclosure error class (`NOT_FOUND`, R9). Doc-5D authors no Billing contract; advertisement purchase is Billing-owned (`Doc-4D §D7.4`; DD-5) and referenced by bare UUID.
- **R9 — Non-disclosure firewall on the public wire** (Invariant #11; `Doc-5A §6.3/§7`; `Doc-4A §7.5`). No blacklist / private-CRM / Buyer-Vendor-Status / banned / suspended / soft-deleted fact is surfaced on a Marketplace-facing read; protected-fact-gated reads collapse to a uniform `NOT_FOUND` (no timing side-channel).
- **R10 — Event surface via outbox, not webhook.** M2 **emits domain events** — the `marketplace` emitter set enumerated in **`Doc-2 §8`** (vendor claim/suspend/ownership-transfer, declared-tier change, profile-experience presentation events), bound by pointer and **never restated here**. Emitted to the M0 transactional outbox by the realizing command; Doc-5A §11 carries **no** caller-facing webhook/push surface (`Doc-5A §11.3`). Outbox/emission mechanism is M0-owned and out-of-wire. **The per-command emitter mapping belongs to the content phase, not the structure phase.**

## M2 surface partition (the structural spine)

> **71 Doc-4D contracts** (PassB per-Contract-ID blocks) — **64 caller-facing**, **7 out-of-wire**. Each row carries an explicit **Doc-5D §** owner; every contract lands in exactly one section. **Section ownership (the § column) is authoritative; within-section grouping is informational.** §3 is the cross-cutting wire model and owns no endpoint.

| Doc-4D contracts | Nature | **Doc-5D §** |
|---|---|---|
| BC-MKT-1 `create_vendor_profile`, `claim_vendor_profile`, `update_vendor_profile`, `transfer_vendor_ownership` · `upsert_vendor_capacity_profile` · `set_declared_financial_tier` | User command (21.4; claim/status §5.3 machine) | **§4** `POST` |
| BC-MKT-1 `set_vendor_profile_status` | Admin governance (21.6, no org context) | **§4** `POST` |
| BC-MKT-1 `get_vendor_profile`, `get_vendor_capacity_profile`, `get_declared_financial_tier`, `get_financial_tier_history` | Query (21.3) | **§4** `GET` |
| BC-MKT-2 `create_category`, `update_category`, `set_category_status` | Admin governance (21.6, DD-4) | **§5** `POST` |
| BC-MKT-2 `assign_category`, `update_category_assignment`, `remove_category_assignment` · `list_categories`, `get_category_assignments` | User command / Query (21.4 / 21.3) | **§5** `POST` / `GET` |
| BC-MKT-3 `create_product`, `update_product`, `set_product_status`, `link_product_spec`, `unlink_product_spec`, `create_spec_library_entry`, `update_spec_library_entry`, `add_spec_document`, `supersede_spec_document` · `get_product`, `list_products`, `get_spec_library_entry`, `get_spec_document` | User command / Query (21.4 / 21.3) | **§5** `POST` / `GET` |
| BC-MKT-4 `create_microsite`, `update_microsite`, `publish_microsite`, `unpublish_microsite`, `set_microsite_domain`, `update_profile_sections`, `update_branding_assets`, `update_seo_settings`, `publish_profile`, `unpublish_profile`, `create_custom_domain`, `activate_custom_domain`, `release_custom_domain`, `create_showcase_project`, `update_showcase_project`, `publish_showcase_project` · `get_microsite`, `get_profile_experience`, `get_showcase_project`, `get_custom_domain` | User command / Query (21.4 / 21.3; §5.3 machines; R5; DD-5 on domain) | **§6** `POST` / `GET` |
| BC-MKT-5 `create_advertisement`, `submit_advertisement`, `set_advertisement_state` (User leg) · `get_advertisement`, `list_advertisements` | User command / Query (21.4 / 21.3; §5.8 machine; DD-5) | **§7** `POST` / `GET` |
| BC-MKT-5 `review_advertisement` | Admin governance (21.6) | **§7** `POST` |
| BC-MKT-7 `add_catalog_favorite`, `remove_catalog_favorite` · `list_catalog_favorites` | User command / Query (21.4 / 21.3; membership-only, no slug) | **§7** `POST` / `GET` |
| BC-MKT-6 `search_catalog`, `list_vendor_directory`, `get_public_vendor_profile` | Public Query (21.3, anonymous) | **§8** `GET` |
| BC-MKT-1 `sync_verified_financial_tier`, `reflect_verified_claim_status` | System event consumer (21.5; DD-1) | **§9** out-of-wire |
| BC-MKT-4 `confirm_custom_domain_verification` | System, infra-driven (21.5) | **§9** out-of-wire |
| BC-MKT-6 `get_vendor_matching_attributes` (internal-service) · `rebuild_vendor_matching_attributes` (System) | RFQ read-model / rebuild (21.3 internal-service / 21.5; DD-2) | **§9** out-of-wire |
| BC-MKT-6 `reflect_vendor_ban` · `reflect_vendor_ban_lift` (DD-8 placeholder) | System event consumer (21.5; DD-3/DD-8) | **§9** out-of-wire |

**Verified partition:** §4(11) + §5(21) + §6(20) + §7(9) + §8(3) = **64 caller-facing**; §9 = **7 out-of-wire**; total **71** (= Doc-4D PassB inventory). §3 owns no endpoint. The `set_advertisement_state` **System auto-transition leg** (scheduled activation / completion) is out-of-wire (§9/R1); only its User leg is caller-facing.

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Doc-5D's precedence (… → Doc-4A → Doc-4D → Doc-5A → **Doc-5D** → Code); conform to Doc-5A in full + pass Appendix A; realize-never-redecide; flag-and-halt.
- **Dependencies:** `Doc-5A §0`; `Doc-5_Program_Governance_Note_v1.0`. **Detail:** short, normative.

## §1 — Scope, Audience & M2 Surface Partition
- **Purpose:** what Doc-5D governs (the M2 caller-facing HTTP surface — Public + User + Admin) and does not; carry the surface-partition table; the **§1.x dependency boundary** (M2 owns realization only for M2 surfaces; cross-module → owning module's Doc-5x — Identity → Doc-5C, RFQ → Doc-5E, Trust → Doc-5G, Billing → Doc-5I, Admin → Doc-5J); register carried **DD-1…DD-8** + `[ESC-MKT-AUDIT]` by pointer (resolved only via their Doc-4D Appendix C channels; none resolved here).
- **Dependencies:** `Doc-5A §1`; `Doc-4D §D0`, Appendix C (DD-1…DD-8). **Detail:** scope + partition + carried-dependency table.

## §2 — Realized Endpoint Inventory
- **Purpose:** the `marketplace`-namespace HTTP surface — one row per **caller-facing** endpoint (the 64): method (§5.2), path grammar (§5.3), actor + active-org applicability (§7), success status (§5.5). Command tokens = exact `marketplace.<operation>` names **verbatim from the Doc-4D PassB per-Contract-ID blocks** (`marketplace.<operation>.v1`). Every endpoint instantiates the §5.7 template (filled in content). **Inventory ordering within each section is non-authoritative/informational.** **Section ownership (the partition table) is authoritative; the §2 grouping is informational aggregation — on conflict, the partition table wins.**
- **Dependencies:** `Doc-5A §5`, App B.1 (`marketplace`); `Doc-4D` PassB (71-contract inventory). **Detail:** inventory table (paths in content pass).

## §3 — Cross-Cutting Actor, Visibility & Context Wire Model *(mechanism only — owns no endpoint)*
- **Section-form authority:** the frozen `Doc-5C §3` precedent, grounded in `Doc-5A §7`; a **[realization convention]** factoring the tri-actor/visibility model out of §4–§8 to prevent a five-way restatement.
- **Purpose:** realize, on the wire, the **tri-actor + visibility mechanism** §4–§8 depend on: **Public/anonymous** (no `Authorization`, no org context) vs **User** (`Authorization` bearer = authentication; **`Iv-Active-Organization` server-validated, never client-trusted** — R2) vs **Admin** governance subset (no org context — §7.3); the **three visibility classes** (public / controlling-org-only / internal-service) and which projection each actor receives (R5); the **non-disclosure firewall** (`NOT_FOUND` collapse — R9); the **entitlement-gating consumption** pattern (Billing checks consumed at the gate, denial → `NOT_FOUND` — R8). Three-layer authorization + delegation-grant resolution **server-side** via Identity's `check_permission` — **the sole authorization authority consumed by M2; no parallel or shadow authorization path** (`Doc-4A §5.3/§6`). No endpoint instantiated here.
- **Per-read projection rule (binding):** Every read surface in §4–§8 **shall explicitly declare which projection class it serves — Public, Controlling-Org, or Internal-Service (or N/A)** — in its content-pass contract block. An ambiguous or undeclared projection is a **content-authoring blocker** (R5 applied per read family).
- **Dependencies:** `Doc-5A §6.3/§7`; `Doc-4A §5/§5.3/§6/§7/§7.5/§9.7`; `Doc-4C §C3` (consumed authorization root); `Doc-4D §D6/§D8`. **Detail:** cross-cutting wire-model declaration; no endpoint instantiation.

## §4 — Vendor Profile, Capacity & Financial-Tier Surface Realization (BC-MKT-1)
- **Purpose:** the §D4–§D5 vendor-profile commands (create / claim / update / transfer-ownership) as named-command `POST`s; capacity upsert; **declared** financial-tier set + reads (declared ≠ verified — DD-1, never gated by verification); each §4 read declares its projection class (§3 rule); the vendor **claim** and **status** machines (`seeded → invited → claimed → verified`; `active ⇄ suspended`, `active → banned`) as legal transitions only (no transition invented — **Doc-4M**; entity source `Doc-2 §5.3`); the Admin governance command `set_vendor_profile_status` (21.6, no org context); idempotency/concurrency (§9); error mapping (§6); top-level `reference_id` (C-05). The verified-tier and claim-verified **System consumers** are out-of-wire (§9/R7); ownership transfer triggers the Trust Protection Workflow by pointer (DD-1). **`claim_vendor_profile` content finalization carries DD-7 (cross-frozen-doc, Board-gated).**
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4D §D4/§D5`; `Doc-4M`; `Doc-4A §13`; ADR-005. **Detail:** command + governance + read realization.

## §5 — Catalog, Product & Specification Surface Realization (BC-MKT-2 + BC-MKT-3)
- **Purpose:** the §D7.1 category surface — **Admin** category lifecycle (`create_category`, `update_category`, `set_category_status` — 21.6, `staff_can_manage_categories` per **DD-4**; `draft → active → retired` machine) vs **User** category assignment (`assign_category`, `update_category_assignment`, `remove_category_assignment` — controlling-org scope) plus public/assigned reads; the §D7.2 product & specification surface — products (`draft → published → unpublished`), product↔spec links (N:N), spec-library entries, **versioned** spec-document add/supersede (never overwritten — `Doc-2 §10.3`) plus reads; each §5 read declares its projection class (§3 rule); idempotency/concurrency; error mapping. Product/showcase/ad audit actions carry **`[ESC-MKT-AUDIT]`** (interim binding to nearest Doc-2 §9 action by pointer — not finalized until enumerated).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4D §D7.1/§D7.2`; `Doc-4M`; `Doc-2 §10.3`. **Detail:** Admin-governance + command + read realization.

## §6 — Profile Experience & Presentation Surface Realization (BC-MKT-4)
- **Purpose:** the §D7.3 presentation surface — the **Content ≠ Presentation** realization (R5): draft (controlling-org) vs published (public) projections, with `publish_profile`/`unpublish_profile`, `publish_microsite`/`unpublish_microsite`, `publish_showcase_project` driving the literal transitions (**Doc-4M**); microsites, profile sections, branding assets, SEO settings; the **custom-domain lifecycle** (`create_custom_domain` → infra `confirm_custom_domain_verification` out-of-wire §9 → `activate_custom_domain` → `release_custom_domain`; entitlement-gated — DD-5/R8); showcase projects; published-experience reads; idempotency/concurrency; error mapping. Domain events (`ProfilePublished`, `MicrositePublished`, …) emitted to the M0 outbox (R10) — no webhook surface.
- **Dependencies:** `Doc-5A §5/§6/§9/§11`; `Doc-4D §D7.3`; `Doc-4M`; `Doc-4I` (entitlement, consumed — DD-5). **Detail:** read/write + presentation realization.

## §7 — Advertising & Catalog-Favorites Surface Realization (BC-MKT-5 + BC-MKT-7)
- **Purpose:** the §D7.4 advertising surface — `create_advertisement` / `submit_advertisement` (entitlement-gated — DD-5/R8; `draft → pending_review` machine, **Doc-4M**), the **Admin** `review_advertisement` (21.6; `pending_review → scheduled | rejected`), the `set_advertisement_state` **User leg** (`active ⇄ paused`) with its System auto-transition leg out-of-wire (§9), and ad reads (public when active); the §D7.5 **catalog favorites** — org-scoped product/category bookmarks (`add` / `remove` / `list`), **membership-only, no slug** (per DD-6; distinct from Operations' private-CRM vendor favorites); idempotency/concurrency; error mapping. Advertisement purchase remains a Billing invoice referenced by bare UUID (R8).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4D §D7.4/§D7.5`; `Doc-4M`; `Doc-4I` (entitlement, consumed — DD-5). **Detail:** command + Admin-review + read realization.

## §8 — Discovery & Public Read Surface Realization (BC-MKT-6)
- **Purpose:** the distinctive M2 **public/anonymous** surface (R2) — `search_catalog`, `list_vendor_directory`, `get_public_vendor_profile` as anonymous `GET` reads (no `Authorization`, no org context); soft-delete / retire / unpublish exclusion (`Doc-2 §0.2`, R5) and the **non-disclosure firewall** (banned/suspended/private facts never surfaced; uniform `NOT_FOUND` — R9); pagination/filter (§8); top-level `reference_id`. The `vendor_matching_attributes` read-model + its System rebuild and the ban/claim/tier System consumers are out-of-wire (§9/R6/R7).
- **Dependencies:** `Doc-5A §5/§6/§7/§8`; `Doc-4D §D6`; `Doc-4A §7.5`. **Detail:** public-read realization.

## §9 — Out-of-Wire Boundary (System event consumers · matching read-model internal leg · infra domain-verify · DD-8 blocked ban-lift)
- **Purpose:** declare that the 7 out-of-wire contracts have **no HTTP wire** — the System event consumers (`sync_verified_financial_tier`, `reflect_verified_claim_status`, `reflect_vendor_ban`), the System read-model rebuild (`rebuild_vendor_matching_attributes`), the infra-driven `confirm_custom_domain_verification`, the internal-service RFQ read `get_vendor_matching_attributes`, and the **DD-8 non-implementable** `reflect_vendor_ban_lift` placeholder — are in-process services / background workers / event consumers invoked within other modules' transactions or driven by the outbox. Implementation is code / Doc-6. **No caller wire in any protocol: no REST endpoint, no SSE stream, no WebSocket, no Webhook.** **Flag-and-halt if any wire surface in any protocol is proposed** (architecture change). `reflect_vendor_ban_lift` keeps its "DO NOT implement" guard until Doc-2 §8 declares the ban-lift event.
- **Dependencies:** `Doc-4D §D4/§D6/§D7.3`, Appendix C (DD-2/DD-8); `Doc-5A §1.3/§11`. **Detail:** boundary statement only — no realization.

## §10 — Conformance & Carried Items
- **Purpose:** Doc-5D's attestation against Doc-5A **Appendix A** (the freeze gate); the carried-items register (DD-1…DD-8 + `[ESC-MKT-AUDIT]`) by pointer with each named resolution channel; statement that Doc-5D coins nothing. **DD-6 `marketplace.*` POLICY-key registration is a CHK-5A-121 content-freeze gate** (resolved via an additive Doc-3 §12.2 registration patch — precedent `core.*` v1.0 / `rfq.*` v1.1; Doc-4A §18.2 — before content freeze).
- **Dependencies:** `Doc-5A Appendix A`; `Doc-4D §D0`, Appendix C. **Detail:** attestation + carried-item register.

## Appendix A — Doc-5D Conformance Attestation
- **Purpose:** per-band pass/fail against the applicable `CHK-5A-xxx` checks for the realized M2 surface; the freeze evidence. Includes a dedicated **R5 projection-separation attestation band** (the M2-unique risk not covered by a single `CHK-5A-xxx` check): *all read surfaces explicitly declare a projection class; no single read merges draft and published state.*
- **Dependencies:** `Doc-5A Appendix A`; §3 (per-read projection rule). **Detail:** attestation table (content pass).

---

## Open Carried Items (Doc-4D Appendix C — resolved only via named channels, never here)

| ID | Item | Doc-5D handling | Freeze gate? |
|---|---|---|---|
| **DD-1** | Vendor / capacity / declared-tier **verification** is Trust-owned (`verification_records`, Doc-2 §5.6; Doc-4G) | No verification-record surface; verified-tier + claim-verified System consumers out-of-wire (§9); Trust contract by pointer | **No** — out-of-wire |
| **DD-2** | Matching/routing **logic** is RFQ-owned (Doc-4E); M2 owns the `vendor_matching_attributes` read-model only | `get_vendor_matching_attributes` internal-service projection read (out-of-wire §9); `rebuild_…` System-only; no matching/eligibility/ranking authored | **No** — out-of-wire |
| **DD-3** | Vendor **ban decision** is Admin-owned (`ban_actions`, Doc-4J; `VendorBanned`) | No "ban vendor" endpoint; `reflect_vendor_ban` is a System consumer (§9); banned profiles drop from §8 reads (R9) | **No** |
| **DD-4** | Category **approval** is Admin-staff governance (`staff_can_manage_categories`) | `create/update/set_category_status` Admin (21.6, §5); `assign_category` User (controlling-org) — separate auth paths | **No** |
| **DD-5** | Advertisement / custom-domain **entitlement** is Billing-gated (Doc-4I) | Gated surfaces consume Billing entitlement (R8); denial → `NOT_FOUND` (R9); ad purchase Billing-owned (`Doc-4D §D7.4`), bare UUID; no Billing contract authored | **No** |
| **DD-6** | `marketplace.*` **POLICY-key** registration (dedup window, page/assignment/placement caps, domain-verify window) | Keys referenced by intended name by pointer; resolved via the **Doc-3 §12.2 additive registration patch** (precedent `core.*` v1.0 / `rfq.*` v1.1; Doc-4A §18.2), human/Board-approved; not invented (`CHK-5A-121/123`) | **Structure: No. Content: YES** — `CHK-5A-121` content-freeze gate (Doc-5E `[ESC-RFQ-POLICY]` precedent); content audit blocks if any referenced key is unregistered |
| **DD-7** | `vendor_claim_records` tenancy-class ambiguity (Doc-2 §6 platform-owned vs §10.3/§3.3 marketplace child) | **⚠ Cross-frozen-doc conflict — FLAG-AND-HALT, Board-gated** (parallels Doc-5C O-01). `claim_vendor_profile` mutates it; **mutation ownership NOT resolved here** (architecture-touching → human/Board); channel: additive Doc-2 §6/§3.3 reconciliation. Blocks `claim_vendor_profile` **content** finalization only | **Structure: No** — content-finalization blocker; **does not gate structure freeze** |
| **DD-8** | No `VendorBanLifted` event in Doc-2 §8 → ban-lift non-implementable | `reflect_vendor_ban_lift` is a **blocked, non-implementable placeholder** (§9) with a "DO NOT implement" guard; channel: Doc-2 §8 additive event declaration | **No** — out-of-wire / blocked |
| `[ESC-MKT-AUDIT]` | Advertisement / product-publish / showcase / custom-domain audit actions not separately enumerated in Doc-2 §9 | Bound by pointer to the nearest Doc-2 §9 domain action; **interim**, not finalized; channel: Doc-2 §9 additive enumeration. No audit action invented | **No** |

## Fences / Out of scope

Cross-module realization (owning module's Doc-5x — §1.x) · any other module's surface · resolving DD-1…DD-8 / `[ESC-MKT-AUDIT]` · framework/DB/job-engine implementation (code/Doc-6) · giving any of the 7 out-of-wire contracts a wire (any protocol) · authoring matching/routing/ranking logic (RFQ/Doc-4E — DD-2) · authoring any verification (Trust/Doc-4G — DD-1), ban (Admin/Doc-4J — DD-3), or Billing (Doc-4I — DD-5) contract · the custom-domain DNS-verification mechanism (infra) · coining any endpoint/status/header/error-class/slug/POLICY key/event.

---

*End of Doc-5D Canonical Structure v1.0 (FROZEN) — structure only. On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt. Authoring history + Hard Review disposition retained in `Doc-5D_Structure_Proposal_v0.1.md` (v0.2 + round-3). Partition independently verified: 71 = 64 caller-facing + 7 out-of-wire. Next: content passes — Pass-1 (§0–§3 + inventory), Pass-2 (§4–§6), Pass-3 (§7–§10 + Appendix A) — each conforming to this structure. DD-6 `marketplace.*` POLICY-key registration patch is a content-freeze prerequisite (CHK-5A-121).*

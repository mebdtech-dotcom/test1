# W3-MKT — M2 `marketplace` Wave-3 Gap Analysis & WP Slicing

| Field | Value |
|---|---|
| Document type | Engineering gap analysis (non-authoritative under the frozen corpus) |
| Date | 2026-07-22 |
| Branch | `wave/3-marketplace` (worktree `E:\Projects\ivendorz-wt-m2`) |
| Baseline | `24e62e0` (W3-MKT-1 pilot + W3-MKT-2 directory shipped) |
| Authority basis | Doc-4D (71 frozen contracts) · Doc-5D Pass-1 §2 inventory (64 caller-facing) + Doc-5D_PublicProductDetail_Patch_v1.0.1 (row 65) + Doc-5D_VendorSlugResolve_Patch_v1.0.2 (row 66) · Doc-6D (schema) · Doc-2 §8/§9 · Doc-3 v1.2/v1.10/v1.11 (`marketplace.*` POLICY) |

## 1. Scope of the count

Doc-4D freezes **71 M2 contracts** (Doc-5D Pass-1 §1.2: **64 caller-facing + 7 out-of-wire**).
Two additive, human-approved, FOLDED patches extend the caller-facing wire inventory:
`marketplace.get_public_product_detail.v1` (row 65) and `marketplace.resolve_vendor_slug.v1`
(row 66). The tracked surface is therefore **73 contracts (66 caller-facing + 7 out-of-wire)**.

**Built on this branch before this analysis (3):**

| Row | Contract | WP | Status |
|---|---|---|---|
| 63 | `marketplace.list_vendor_directory.v1` | W3-MKT-2 | BUILT (`14f4f4b`) |
| 64 | `marketplace.get_public_vendor_profile.v1` | W3-MKT-1 | BUILT (`73c9c10`) |
| 66 | `marketplace.resolve_vendor_slug.v1` | W3-MKT-1 | BUILT (`73c9c10`) |

Schema present (pilot migrations): `vendor_profiles` (+ slug CHECK + tri-actor RLS),
`categories`, `category_assignments`, `vendor_slug_history`, directory indexes.
Schema NOT yet realized (Doc-6D Pass-1/2/3 remainder): `vendor_capacity_profiles`,
`declared_financial_tiers`, `financial_tier_history`, `vendor_ownership_history`,
`vendor_matching_attributes`, `vendor_claim_records`, products/spec tables, presentation
tables, advertisements, showcase_projects, catalog_favorites, FTS artifacts.

## 2. Contract status table (73)

Status legend: **BUILT** (contract realized end-to-end + tests) · **PARTIAL** (some layer built)
· **MISSING** (nothing built) · markers: ⛔ = blocked by a carried DD/ESC (do NOT build).

### §4 Vendor Profile, Capacity & Financial-Tier (BC-MKT-1)

| # | Contract | Status | Note |
|---|---|---|---|
| 1 | `marketplace.create_vendor_profile.v1` | **BUILT (this WP — W3-MKT-3)** | D7 audited write + `VendorClaimed` outbox + `human_ref` + platform-issued slug |
| 2 | `marketplace.claim_vendor_profile.v1` | MISSING ⛔ DD-7 | `vendor_claim_records` tenancy unresolved (Doc-2 §6 vs §10.3/§3.3); Doc-5D §4.6 blocks finalization of THIS contract only — additive Doc-2 reconciliation (human/Board) required first |
| 3 | `marketplace.update_vendor_profile.v1` | **BUILT (this WP — W3-MKT-3)** | audited write, optimistic concurrency, no §8 event |
| 4 | `marketplace.transfer_vendor_ownership.v1` | MISSING | needs `vendor_ownership_history` (W3-MKT-5) |
| 5 | `marketplace.set_vendor_profile_status.v1` | MISSING | Admin, `staff_can_ban`, no org context (W3-MKT-5) |
| 6 | `marketplace.get_vendor_profile.v1` | **BUILT (this WP — W3-MKT-3)** | Controlling-Org (User) leg; Public leg is row 64 (already built); internal-service leg = in-process facade |
| 7 | `marketplace.upsert_vendor_capacity_profile.v1` | MISSING | W3-MKT-4 |
| 8 | `marketplace.get_vendor_capacity_profile.v1` | MISSING | W3-MKT-4 |
| 9 | `marketplace.set_declared_financial_tier.v1` | MISSING | W3-MKT-4 (`VendorTierChanged[declared]`) |
| 10 | `marketplace.get_declared_financial_tier.v1` | MISSING | W3-MKT-4 |
| 11 | `marketplace.get_financial_tier_history.v1` | MISSING | W3-MKT-4 |

### §5 Catalog, Product & Specification (BC-MKT-2 + BC-MKT-3)

| # | Contract | Status | Note |
|---|---|---|---|
| 12 | `marketplace.create_category.v1` | MISSING | Admin (DD-4), W3-MKT-6 |
| 13 | `marketplace.update_category.v1` | MISSING | W3-MKT-6 |
| 14 | `marketplace.set_category_status.v1` | MISSING | W3-MKT-6 |
| 15 | `marketplace.assign_category.v1` | MISSING | W3-MKT-6 (≤10/≤5 service invariant) |
| 16 | `marketplace.update_category_assignment.v1` | MISSING | W3-MKT-6 |
| 17 | `marketplace.remove_category_assignment.v1` | MISSING | W3-MKT-6 |
| 18 | `marketplace.list_categories.v1` | MISSING | Public read, W3-MKT-6 |
| 19 | `marketplace.get_category_assignments.v1` | MISSING | W3-MKT-6 |
| 20 | `marketplace.create_product.v1` | MISSING | W3-MKT-7 (products schema) |
| 21 | `marketplace.update_product.v1` | MISSING | W3-MKT-7 |
| 22 | `marketplace.set_product_status.v1` | MISSING | W3-MKT-7 |
| 23 | `marketplace.link_product_spec.v1` | MISSING | W3-MKT-7 |
| 24 | `marketplace.unlink_product_spec.v1` | MISSING | W3-MKT-7 |
| 25 | `marketplace.create_spec_library_entry.v1` | MISSING | W3-MKT-7 |
| 26 | `marketplace.update_spec_library_entry.v1` | MISSING | W3-MKT-7 |
| 27 | `marketplace.add_spec_document.v1` | MISSING | W3-MKT-7 (`201`, versioned) |
| 28 | `marketplace.supersede_spec_document.v1` | MISSING | W3-MKT-7 (`201`, never overwrite) |
| 29 | `marketplace.get_product.v1` | MISSING | W3-MKT-7 (projection-gated) |
| 30 | `marketplace.list_products.v1` | MISSING | W3-MKT-7 |
| 31 | `marketplace.get_spec_library_entry.v1` | MISSING | W3-MKT-7 |
| 32 | `marketplace.get_spec_document.v1` | MISSING | W3-MKT-7 (RFQ-grant leg is RFQ-owned, NOT here) |

### §6 Profile Experience & Presentation (BC-MKT-4)

| # | Contract | Status | Note |
|---|---|---|---|
| 33–37 | `create/update/publish/unpublish_microsite`, `set_microsite_domain` | MISSING | W3-MKT-8 |
| 38–40 | `update_profile_sections/branding_assets/seo_settings` | MISSING | W3-MKT-8 |
| 41–42 | `publish_profile` / `unpublish_profile` | MISSING | W3-MKT-8 (R5 draft↔published) |
| 43–45 | `create/activate/release_custom_domain` | MISSING | W3-MKT-8 (DD-5 entitlement consumed from M7; NOT-FOUND collapse) |
| 46–48 | `create/update/publish_showcase_project` | MISSING | W3-MKT-8 (`publish_showcase_project` emits NO §8 event — Doc-5D Pass-2 BR-M-01) |
| 49–52 | `get_microsite` / `get_profile_experience` / `get_showcase_project` / `get_custom_domain` | MISSING | W3-MKT-8 |

### §7 Advertising & Catalog-Favorites (BC-MKT-5 + BC-MKT-7) · §8 Discovery (BC-MKT-6)

| # | Contract | Status | Note |
|---|---|---|---|
| 53–58 | advertisement create/submit/review/set_state/get/list | MISSING | W3-MKT-9 (DD-5 entitlement; Admin review; `[ESC-MKT-AUDIT]` posture) |
| 59–61 | catalog_favorite add/remove/list | MISSING | W3-MKT-9 (membership-only, no slug) |
| 62 | `marketplace.search_catalog.v1` | MISSING | W3-MKT-10 (Postgres FTS) |
| 63 | `marketplace.list_vendor_directory.v1` | **BUILT** | W3-MKT-2 |
| 64 | `marketplace.get_public_vendor_profile.v1` | **BUILT** | W3-MKT-1 (TrustIndicators + profile-experience projection legs deferred, disclosed on the WP card) |
| 65 | `marketplace.get_public_product_detail.v1` | MISSING | W3-MKT-7 (with the product schema) |
| 66 | `marketplace.resolve_vendor_slug.v1` | **BUILT** | W3-MKT-1 |

### §9 Out-of-wire (7)

| Contract | Status | Note |
|---|---|---|
| `marketplace.sync_verified_financial_tier.v1` | MISSING | W3-MKT-11 (consumes Trust `VendorTierChanged[verified]`; exclusive-writer of `financial_tier_history`) |
| `marketplace.reflect_verified_claim_status.v1` | MISSING | W3-MKT-11 (consumes Trust `VendorVerified`; `claimed→verified`) |
| `marketplace.reflect_vendor_ban.v1` | MISSING | W3-MKT-11 (consumes Admin `VendorBanned`; DD-3) |
| `marketplace.reflect_vendor_ban_lift.v1` | MISSING ⛔ DD-8 | **blocked** — no `VendorBanLifted` event exists in Doc-2 §8; not implementable until an additive §8 patch (never invent the event) |
| `marketplace.get_vendor_matching_attributes.v1` | MISSING | W3-MKT-11 (internal-service, in-process contracts only — DD-2; never HTTP) |
| `marketplace.rebuild_vendor_matching_attributes.v1` | MISSING | W3-MKT-11 (System rebuild of the derived read-model) |
| `marketplace.confirm_custom_domain_verification.v1` | MISSING | W3-MKT-8 follow-on (infra System leg) |

## 3. Totals

| Status | Count |
|---|---|
| BUILT before this analysis | 3 (rows 63, 64, 66) |
| BUILT by W3-MKT-3 (this WP) | 3 (rows 1, 3, 6) |
| MISSING (buildable) | 65 |
| MISSING — governance-blocked ⛔ | 2 (`claim_vendor_profile` DD-7 · `reflect_vendor_ban_lift` DD-8) |
| PARTIAL | 0 |
| **Total tracked** | **73** (71 frozen + 2 folded patch contracts) |

## 4. Proposed WP slicing of the gap

Ordering: profile-aggregate first (every other surface anchors RLS/authority on
`vendor_profiles`), then aggregate children, then admin/category, then product/spec, then
presentation, then ads/favorites, then FTS, then the System consumers + read-model last (they
consume M5/M8 events that Wave-3 peers are building in parallel).

| WP | Slice | Contracts | Schema added |
|---|---|---|---|
| **W3-MKT-3 (this build)** | Vendor-profile write spine: create / update / own-read + the M0 `core.write_outbox_event.v1` adoption (byte-identical to the `wave/3-trust-wp1` realization — clean 3-way merge) + `marketplace.*` POLICY seed | 1, 3, 6 | none (data-only POLICY seed migration) |
| W3-MKT-3b | `marketplace.command_dedup` §B.6 replay store retro-fit (the M1 W2-IDN-6.5 precedent) + Idempotency-Key wiring on all M2 mutations | (cross-cutting) | `marketplace.command_dedup` |
| W3-MKT-4 | Capacity + declared tier + tier history reads | 7–11 | `vendor_capacity_profiles`, `declared_financial_tiers`, `financial_tier_history` (+ immutability triggers) |
| W3-MKT-5 | Ownership transfer + Admin moderation | 4, 5 | `vendor_ownership_history` |
| W3-MKT-6 | Category governance (Admin) + assignments (User) + public taxonomy read | 12–19 | none (tables exist; deferred `categories` FK ALTER) |
| W3-MKT-7 | Products + spec library + public product detail | 20–32, 65 | products/spec tables (Doc-6D Pass-2) |
| W3-MKT-8 | Profile experience / microsites / custom domains / showcase | 33–52 (+ `confirm_custom_domain_verification` §9) | presentation tables (Doc-6D Pass-2) |
| W3-MKT-9 | Advertising + catalog favorites | 53–61 | `advertisements`, `catalog_favorites`, `showcase_projects` remainder (Doc-6D Pass-3) |
| W3-MKT-10 | `search_catalog` FTS | 62 | FTS artifacts (Doc-6D Pass-3 §6) |
| W3-MKT-11 | System consumers + `vendor_matching_attributes` read-model + internal-service matching read | §9 set (minus DD-8) | `vendor_matching_attributes`, `vendor_claim_records` (DD-7-interim posture per Doc-6D §3.1.8) |

## 5. Carried governance items (recorded, NOT resolved here)

| Marker | What | Channel |
|---|---|---|
| **DD-7 / `[ESC-6-DD7]`** | `vendor_claim_records` tenancy (Doc-2 §6 platform-owned vs §10.3/§3.3 marketplace child) blocks `claim_vendor_profile.v1` finalization only | additive Doc-2 §6/§3.3 reconciliation — human/Board |
| **DD-8** | `reflect_vendor_ban_lift.v1` not implementable — no `VendorBanLifted` in Doc-2 §8 | additive Doc-2 §8 patch — never invented in code |
| **`[ESC-MKT-AUDIT]`** | M2 audit-token serialization: Doc-2 §9 enumerates the Vendor-profile business actions ("create", "capability/override change", …) but no Doc-4D/Doc-6D serialization-token patch exists yet. W3-MKT-3 binds its tokens BY POINTER to the ENUMERATED §9 actions (the M5/M7 Wave-3 precedent — `trust`/`billing` `domain/audit-actions.ts`); the token strings are realization serialization, disclosed for a future Doc-4D-class token patch | additive Doc-4D/Doc-6D serialization patch (fold via coordinator) |
| **Idempotency-Key deferral** | W3-MKT-3 mutations do not yet persist the §B.6 replay store (`marketplace.command_dedup`) — the program-wide Wave-3 deferral (M1 §B.6 retro-fit precedent; same posture as M5/M6/M7 writes). Scheduled as W3-MKT-3b | W3-MKT-3b retro-fit |
| **Slug derivation convention** | Doc-2 v1.0.5 D2-04.1/.2 fixes the format law + reserved-label gate + "Platform-issued" but is silent on the name→label derivation algorithm; W3-MKT-3 realizes a deterministic kebab-case derivation + collision suffix as a [realization convention] (server-side only — slug is never a caller input) | disclosed; reviewable at the Doc-5D-class layer |
| **`vendor_profiles_org_write` RLS vs `claim_state='claimed'` default** | Prisma model default is `seeded` (Doc-6D DDL default); the create command sets `claimed` explicitly (Doc-2 §5.3 direct registration; Doc-5D Pass-2 BR-M-02) — no schema change needed | none (conforming) |

## 6. Test-surface note

W3-MKT-3 adds `tests/integration/vendor-profile-write-slice.test.ts` (Doc-8C contract slice, real
PostgreSQL): create→audit+outbox atomicity, one-profile-per-org conflict, update old/new audit +
optimistic concurrency, authorization deny (no `can_manage_vendor_profile`), validation, audit-failure
rollback (both CTO invariants), own-read vs cross-tenant collapse, slug format-law conformance.
No RLS policy is added or changed by this WP (the pilot migration already realized the
`vendor_profiles` tri-actor set), so no new 8D RLS gate is owed beyond the existing pilot gates.

*Non-authoritative. On any conflict the frozen corpus wins.*

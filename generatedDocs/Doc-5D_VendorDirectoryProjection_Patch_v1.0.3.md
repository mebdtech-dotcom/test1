# Doc-5D_VendorDirectoryProjection_Patch_v1.0.3.md

> **✅ STATUS: APPROVED (human — owner/Board ruling 2026-07-11) + FOLDED into the corpus.**
> This is the corpus copy `generatedDocs/Doc-5D_VendorDirectoryProjection_Patch_v1.0.3.md`,
> registered in `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md`, carried **alongside** the unedited
> frozen Doc-5D (`Doc-5D_Structure_v1.0_FROZEN.md` + `Doc-5D_Content_v1.0_Pass1…3` +
> `Doc-5D_PublicProductDetail_Patch_v1.0.1` + `Doc-5D_VendorSlugResolve_Patch_v1.0.2`) —
> **no frozen file edited in place.**
> Origin/provenance: `governanceReviews/Doc-5D_VendorDirectoryProjection_Additive_Patch_PROPOSAL.md`.
>
> **Resolves** `[ESC-MKT-VENDORDIR-PROJECTION]` (`esc_registry.md`) — raised and resolved
> same-session, 2026-07-11, during Wave-3 M2 second-slice scoping: the frozen
> `list_vendor_directory.v1` response names no list-item field list, and its `filters` object is
> untyped while its sibling `search_catalog` types the same group explicitly. Both are
> realization-layer field-shape decisions on an **already-frozen** contract and route — no new
> identifier scheme, no new contract, no Doc-4D change (unlike `VendorSlugResolve`, which added a
> genuinely missing contract).

## Status

Approved Patch — FOLDED 2026-07-11 (human-approved: owner/Board ruling)

| Field | Value |
|---|---|
| Patch ID | **PATCH-5D-VLD-01** |
| Applies to | Doc-5D v1.0.2 (Structure FROZEN + Content Pass1…3 + `PublicProductDetail_Patch_v1.0.1` + `VendorSlugResolve_Patch_v1.0.2`) |
| Produces | Doc-5D **v1.0.3** (v1.0.2 + this patch) |
| Scope | **Two items on the EXISTING row 63, nothing else:** (1) field-level realization of the `public_projection` list-item shape; (2) explicit sub-typing of the `filters` object, mirrored from the sibling `search_catalog` typing on the same Doc-4D line. No new endpoint, no new error code, no schema change, no Doc-4D change. |
| Purpose | Let the backend for `list_vendor_directory.v1` be built against a precise, citable field list instead of an implementer's private guess. |
| Raised by | `[ESC-MKT-VENDORDIR-PROJECTION]` (`esc_registry.md`) — found during Wave-3 M2 second-slice scoping, 2026-07-11; resolved same-session. |
| Authority | CLAUDE.md §7/§8/§11/§13; Doc-4A §21.3 (Query template) · §5.7 (wire modeling); Doc-5A §8 (pagination — cursor-only, filter/sort grammar, `page_info` shape, exclusion-consistency); Doc-4D §D6 BC-MKT-6 (the frozen operation this realizes); `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace` (`marketplace.list_page_size_max`, start 100 — already registered, reused not re-registered) |

---

# PATCH-5D-VLD-01 — Field-level realization of `marketplace.list_vendor_directory.v1` (row 63)

## 1. List-item `public_projection` shape

**Realization choice:** the list item reuses the **same** `public_projection` fields as
`get_public_vendor_profile.v1` (Doc-4D PassB Discovery line 23), **minus** "published
profile-experience" (too heavy for a directory card) and **minus** `TrustIndicators` (M5 doesn't
exist yet — tracked in `W3-MKT-1`'s WP card, not re-litigated here).

| Field | Wire content | Source |
|---|---|---|
| `vendor_profile_id` | uuid | `vendor_profiles.id` |
| `human_ref` | `VENDOR-YYYY-NNNNNN` | `vendor_profiles.human_ref` |
| `name` | string | `vendor_profiles.name` |
| `capability_flags` | 4-flag matrix (Invariant #1) | `vendor_profiles.{can_supply,can_service,can_fabricate,can_consult}` |
| `geography` | `{country, division, district, industrial_zone}` | `vendor_profiles` hard-attribute columns |
| `categories` | active category assignments (id+name+parent chain) | `category_assignments` (`status='active'`) |

**Same DTO, no duplication:** realized in code as the **same** `PublicVendorProfileView` type
already built for `get_public_vendor_profile.v1` — a list item is one array element of that type,
not a second parallel type.

## 2. Filter sub-typing

**Realization choice:** `list_vendor_directory`'s `filters` object is typed identically to
`search_catalog`'s on the same Doc-4D line:

- `category_id : uuid : optional`
- `country / division / district / industrial_zone : enum : optional` (each independently optional)
- `capability : enum : optional` — **one** capability flag name per filter call
  (`can_supply | can_service | can_fabricate | can_consult`); a vendor matches if that single flag
  is `true`. `vendor_type_preset` is **not** realized as a filter here — carried, not coined.

Undeclared filter field → `marketplace_discovery_invalid_input` (VALIDATION), reusing the
existing frozen error code — no new code coined.

## 3. Pagination — realized per the already-fully-specified Doc-5A §8, cited not restated

- Cursor-only (Doc-5A §8.1) — no offset parameter accepted.
- Sort: `name` ascending, server-appended `vendor_profile_id` tiebreaker for total order (`name`
  chosen over "relevance" for this pilot since no search-ranking input exists yet;
  `search_catalog`'s future realization may differ, not coined here).
- `page_size` bounded by the **already-registered** `marketplace.list_page_size_max` (start 100) —
  no new POLICY key.
- `page_info: { next_cursor, has_more }` (Doc-5A §8.6) — `total_count` omitted (optional per §8.6).
- **Exclusion-consistency (Doc-5A §8.7, binding):** the same visibility predicate gates `items`,
  `has_more`, and cursor continuation identically — realized by reusing the **existing**
  `src/modules/marketplace/domain/policies/vendor-visibility.policy.ts` — no second predicate, no
  drift.

## Explicit NOT-changes

No new contract · no new endpoint · no new error code · no schema change (reuses `vendor_profiles`
+ `category_assignments`, both realized by `W3-MKT-1`) · no new POLICY key · no change to
`get_public_vendor_profile.v1` or `resolve_vendor_slug.v1` · `search_catalog.v1` is NOT realized
by this patch — only its filter typing is cited as the pattern this patch mirrors.

---

*End of Doc-5D_VendorDirectoryProjection_Patch_v1.0.3 — field-level realization of
`marketplace.list_vendor_directory.v1` (row 63): list item = the existing `PublicVendorProfileView`
minus profile-experience/TrustIndicators; filters typed per the `search_catalog` sibling; cursor
pagination per the already-fully-specified Doc-5A §8, gated by the existing shared visibility
policy. Coins no contract, no field beyond what's already authorized in general terms, no error
code, no POLICY key. Status: APPROVED — FOLDED 2026-07-11 (owner ruling).*

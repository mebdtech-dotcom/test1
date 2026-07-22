# Doc-5D_VendorDirectoryProjection_Additive_Patch_PROPOSAL.md

> **STATUS: PROPOSAL — awaiting owner/Board ruling.** Not yet folded into the corpus. Drafted
> during Wave 3 M2 second-slice scoping (2026-07-11), triggered by two realization gaps found
> while preparing to build `marketplace.list_vendor_directory.v1`'s backend:
> 1. The frozen `{ items: list<public_projection>, page_info }` response
>    (`Doc-4D_Content_v1.0_PassB_Discovery.md:23`) names no field list for a list item, unlike the
>    single-read `get_public_vendor_profile.v1` on the same line. Doc-5D's own wire-realization
>    section for this row (`Doc-5D_Content_v1.0_Pass3.md` §8, row 63) restates pagination/
>    non-disclosure/error rules but carries no field table either.
> 2. `list_vendor_directory`'s `filters: object{ category_id, geography, capability }`
>    (`Doc-4D_Content_v1.0_PassB_Discovery.md:21`) is untyped, while its sibling `search_catalog`
>    on the line above explicitly types the same filter group (`category_id: uuid`,
>    `country/division/district/industrial_zone: enum`, `capability: enum`,
>    `vendor_type_preset: enum`). The frozen text doesn't say whether the two ops share this typing.
>
> Unlike the `resolve_vendor_slug.v1` gap (a genuinely missing contract, no lookup mode existed at
> all), both items here are realization-layer field-shape decisions on an **already-frozen**
> contract and route — no new identifier scheme, no new contract, no Doc-4D change. This is the
> same kind of call `Doc-5D_PublicProductDetail_Patch_v1.0.1` §1.2 made when it field-realized
> `get_public_product_detail`'s response. Raised as `[ESC-MKT-VENDORDIR-PROJECTION]`
> (`esc_registry.md`), proposed for same-session resolution.

## Status

**PROPOSAL** — drafted 2026-07-11, pending owner/Board ruling.

| Field | Value |
|---|---|
| Patch ID | **PATCH-5D-VLD-01** |
| Applies to | Doc-5D v1.0.2 (Structure FROZEN + Content Pass1…3 + `PublicProductDetail_Patch_v1.0.1` + `VendorSlugResolve_Patch_v1.0.2`) |
| Produces | Doc-5D **v1.0.3** (v1.0.2 + this patch) |
| Scope | **Two items on the EXISTING row 63, nothing else:** (1) field-level realization of the `public_projection` list-item shape; (2) explicit sub-typing of the `filters` object, mirrored from the sibling `search_catalog` typing on the same Doc-4D line. No new endpoint, no new error code, no schema change, no Doc-4D change (both items realize what Doc-4D already authorizes in general terms — "public_projection", "filters" — at the field level, the same job every Doc-5D content pass does). |
| Purpose | Let the backend for `list_vendor_directory.v1` be built against a precise, citable field list instead of an implementer's private guess — the same reason `get_public_product_detail`'s field table exists. |
| Raised by | `[ESC-MKT-VENDORDIR-PROJECTION]` (`esc_registry.md`) — found during Wave-3 M2 second-slice scoping, 2026-07-11; proposed for same-session resolution. |
| Authority | CLAUDE.md §7/§8/§11/§13; Doc-4A §21.3 (Query template) · §5.7 (wire modeling); Doc-5A §8 (pagination — cursor-only, filter/sort grammar, `page_info` shape, exclusion-consistency); Doc-4D §D6 BC-MKT-6 (the frozen operation this realizes); `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace` (`marketplace.list_page_size_max`, start 100 — already registered, reused not re-registered) |

---

# PATCH-5D-VLD-01 — Field-level realization of `marketplace.list_vendor_directory.v1` (row 63)

## 1. List-item `public_projection` shape

**Realization choice:** the list item reuses the **same** `public_projection` fields as
`get_public_vendor_profile.v1` (Doc-4D PassB Discovery line 23), **minus** "published
profile-experience" (too heavy for a directory card — mirrors how `get_public_product_detail`
excludes fields not needed at its own altitude) and **minus** `TrustIndicators` for the same
reason `get_public_vendor_profile.v1` defers it in this Wave (M5 doesn't exist yet — tracked in
`W3-MKT-1`'s WP card, not re-litigated here).

| Field | Wire content | Source |
|---|---|---|
| `vendor_profile_id` | uuid | `vendor_profiles.id` |
| `human_ref` | `VENDOR-YYYY-NNNNNN` | `vendor_profiles.human_ref` |
| `name` | string | `vendor_profiles.name` |
| `capability_flags` | 4-flag matrix (Invariant #1) | `vendor_profiles.{can_supply,can_service,can_fabricate,can_consult}` |
| `geography` | `{country, division, district, industrial_zone}` | `vendor_profiles` hard-attribute columns |
| `categories` | active category assignments (id+name+parent chain) | `category_assignments` (`status='active'`) |

**Same DTO, no duplication:** this is realized in code as the **same** `PublicVendorProfileView`
type already built for `get_public_vendor_profile.v1` (`src/modules/marketplace/contracts/
types.ts`) — a list item is one array element of that type, not a second parallel type. No new
DTO shape is coined; this patch only confirms that reuse is the correct realization rather than
leaving it as an implementer guess.

## 2. Filter sub-typing

**Realization choice:** `list_vendor_directory`'s `filters` object is typed identically to
`search_catalog`'s on the same Doc-4D line — the sibling contract already gives this precise
shape, and there is no basis in the frozen text for the two ops to diverge:

- `category_id : uuid : optional`
- `country / division / district / industrial_zone : enum : optional` (each independently
  optional — matches `VendorGeography`'s per-field nullability already in `types.ts`)
- `capability : enum : optional` — **one** capability flag name per filter call
  (`can_supply | can_service | can_fabricate | can_consult`), not the 4-flag matrix object; a
  vendor matches if that single flag is `true`. (`vendor_type_preset`, present in the group-level
  Query-semantics line but absent from both ops' explicit filter lists, is **not** realized as a
  filter here — carried, not coined, consistent with `list_vendor_directory`'s own line omitting
  it even though `search_catalog`'s omits it too on inspection of the literal object.)

Undeclared filter field → `marketplace_discovery_invalid_input` (VALIDATION), reusing the
existing frozen error code (Doc-4D Discovery line 25) — no new code coined.

## 3. Pagination — realized per the already-fully-specified Doc-5A §8, cited not restated

- Cursor-only (Doc-5A §8.1) — no offset parameter accepted.
- Sort: `name` ascending, server-appended `vendor_profile_id` tiebreaker for total order (Doc-4D
  Discovery line 27: "Sort = relevance/`name` with tiebreaker `id`" — `name` chosen over
  "relevance" for this pilot since no search-ranking input exists yet; `search_catalog`'s future
  realization may differ, not coined here).
- `page_size` bounded by the **already-registered** `marketplace.list_page_size_max` (start 100) —
  no new POLICY key.
- `page_info: { next_cursor, has_more }` (Doc-5A §8.6) — `total_count` omitted (optional per §8.6;
  a running count over an unindexed filter combination is an unnecessary cost for this pilot, and
  Doc-5A marks it optional, not required).
- **Exclusion-consistency (Doc-5A §8.7, binding):** the same visibility predicate gates `items`,
  `has_more`, and cursor continuation identically — realized by reusing the **existing**
  `src/modules/marketplace/domain/policies/vendor-visibility.policy.ts` (built for `W3-MKT-1`,
  already the single authoritative policy for every anonymous Marketplace read) — no second
  predicate, no drift.

## Explicit NOT-changes

No new contract · no new endpoint · no new error code · no schema change (reuses `vendor_profiles`
+ `category_assignments`, both realized by `W3-MKT-1`) · no new POLICY key (reuses
`marketplace.list_page_size_max`, already registered) · no change to `get_public_vendor_profile.v1`
or `resolve_vendor_slug.v1` · `search_catalog.v1` is NOT realized by this patch (a separate,
later slice) — only its filter typing is cited as the pattern this patch mirrors.

---

*End of Doc-5D_VendorDirectoryProjection_Additive_Patch_PROPOSAL — field-level realization of
`marketplace.list_vendor_directory.v1` (row 63): list item = the existing `PublicVendorProfileView`
minus profile-experience/TrustIndicators; filters typed per the `search_catalog` sibling; cursor
pagination per the already-fully-specified Doc-5A §8, gated by the existing shared visibility
policy. Coins no contract, no field beyond what's already authorized in general terms, no error
code, no POLICY key. Awaiting owner/Board ruling.*

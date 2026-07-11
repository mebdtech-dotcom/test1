# Doc-5D_VendorDirectorySlugField_Patch_v1.0.4.md

> **✅ STATUS: APPROVED (human — owner/Board ruling 2026-07-11) + FOLDED into the corpus.**
> This is the corpus copy `generatedDocs/Doc-5D_VendorDirectorySlugField_Patch_v1.0.4.md`,
> registered in `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md`, carried **alongside** the unedited
> `Doc-5D_VendorDirectoryProjection_Patch_v1.0.3` (this is a one-field amendment to it, not an edit
> in place). Found during the same-session build of `list_vendor_directory.v1`'s backend.

## Status

Approved Patch — FOLDED 2026-07-11 (human-approved: owner/Board ruling)

| Field | Value |
|---|---|
| Patch ID | **PATCH-5D-VDS-01** |
| Applies to | Doc-5D v1.0.3 (specifically amends `Doc-5D_VendorDirectoryProjection_Patch_v1.0.3` §1's 6-field list-item table) |
| Produces | Doc-5D **v1.0.4** |
| Scope | **One additive field, nothing else:** `slug` on the `list_vendor_directory.v1` list-item projection only. `get_public_vendor_profile.v1`'s own DTO/wire shape is untouched. No new contract, endpoint, error code, POLICY key, or identifier scheme. |
| Purpose | Without a per-row slug, the Vendor Directory (`app/(public)/vendors/page.tsx`) and Search "Vendors" tab cannot construct a working link to each vendor's microsite — `PublicVendorProfileView` deliberately omits `slug` (the single-read caller already has it from the URL), but a list has no per-row caller-known slug and no other contract supplies one in reverse (`resolve_vendor_slug.v1` is slug→id only). |
| Raised by | Found during the `list_vendor_directory.v1` build, 2026-07-11; flagged by the implementer rather than silently added. |
| Authority | CLAUDE.md §7/§8/§11/§13; `Doc-4D_CanonicalHost_Patch_v1.0.2` §4D-CH-01.4 (already anticipated this: "consumers derive the effective canonical host via CHR from fields already on the wire — the vendor profile's `slug`..."); `Doc-4D_VendorSlugResolve_Patch_v1.0.4`'s scope guard (governs `slug` as an **input**/lookup key on other contracts — does not restrict `slug` as an **output** field); `app/(public)/_components/vendor-url.ts` (ADR-024's one permitted vendor-URL builder, which this field feeds) |

---

# PATCH-5D-VDS-01 — Add `slug` to the `list_vendor_directory.v1` list-item projection

## Why this doesn't touch what it looks like it might touch

- **Not a non-disclosure violation (§7.5):** that invariant protects claim/ban/blacklist/financial
  facts. A vendor that appears in this list is, by construction, already publicly visible — its
  `slug` **is** that vendor's own live canonical microsite URL segment. Returning it discloses
  nothing beyond what the vendor's own public page already discloses.
- **Not a violation of `PATCH-4D-VSR-01`'s scope guard:** that guard states `slug` is accepted
  **only** by `resolve_vendor_slug.v1` — i.e., no other contract gains `slug` as an **input**
  parameter, preventing `slug` from becoming a second ambiguous lookup identifier. This patch adds
  `slug` as an **output** field on a different contract; it does not make any contract *accept* a
  slug it didn't before, and `get_public_vendor_profile.v1`'s own request contract (`vendor_profile_id`
  XOR `human_ref`) is unchanged.
- **Not an identifier-scheme change:** the list item's canonical identifier remains
  `vendorProfileId`/`humanRef` (unchanged, still first per `PublicVendorProfileView`); `slug` is
  an additive, non-authoritative routing field alongside them, not a replacement.

## The field

| Field | Wire content | Source |
|---|---|---|
| `slug` | string (kebab-case, Doc-6D VSS format law) | `vendor_profiles.slug` (live) |

Realized in code as `VendorDirectoryListItem extends PublicVendorProfileView { slug: string }` —
every other field is the existing DTO, reused verbatim; this is the only new field.

## Explicit NOT-changes

`get_public_vendor_profile.v1`'s own response shape (`PublicVendorProfileView`) — **unchanged, not
touched by this patch**. No new contract, endpoint, error code, POLICY key. No change to
`resolve_vendor_slug.v1`'s scope guard (still binding, still slug-as-input-only). No id→slug
reverse-lookup contract created — this field is populated by the list repository's own SQL
projection (`vendor_profiles.slug` is already a column on the row being read), not by a second
call to any resolver.

---

*End of Doc-5D_VendorDirectorySlugField_Patch_v1.0.4 — adds `slug` to the
`list_vendor_directory.v1` list-item projection only, so directory/search-tab cards can link to
each vendor's microsite. Does not touch `get_public_vendor_profile.v1`, does not violate the
slug-as-input-only scope guard (this is an output field), touches no non-disclosure fact. Status:
APPROVED — FOLDED 2026-07-11 (owner ruling).*

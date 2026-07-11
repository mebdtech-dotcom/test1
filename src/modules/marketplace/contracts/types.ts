// Public DTOs / IDs for module "marketplace" (cross-module surface). DTOs/IDs only — domain value-objects
// stay private. Realized per the module's Doc-4D contracts (PassB Discovery) + Doc-6D §3.1 (vendor_profiles)
// + Doc-2 §10.3 (column set) — bound by pointer, never re-authored.
//
// SCOPE (D7-follow-on, M2 public-read slice 1): the PUBLIC vendor-profile read
// (`marketplace.get_public_vendor_profile.v1`). This is the platform's first PUBLIC (anonymous) read surface
// — no auth, no active-org/tenant context; visibility is publish-state RLS (Doc-6D MK-CR2/MK-CR3:
// published + active + non-soft-deleted + non-banned). The CORE profile is realized first; the rich
// published children (microsite / profile sections / branding / SEO / showcase projects / advertisements)
// and the Trust read-model `trust_indicators` (DD-1 — Marketplace READS Trust signals, never calculates
// them — CLAUDE.md §3/§4) are OPTIONAL on the frozen contract and are added in follow-on slices.

/**
 * The four-flag capability MATRIX (Invariant #1 / Doc-6D MK-CR4) — never a single label.
 * Verbatim columns on `vendor_profiles` (Doc-2 §10.3).
 */
export interface VendorCapabilityFlags {
  canSupply: boolean;
  canService: boolean;
  canFabricate: boolean;
  canConsult: boolean;
}

/** Vendor geography (Doc-2 §10.3 hard attributes; Bangladesh administrative hierarchy). All nullable. */
export interface VendorGeography {
  country: string | null;
  division: string | null;
  district: string | null;
  industrialZone: string | null;
}

/** A category a vendor is assigned to (Doc-6D MK-CR8 — platform-owned 4-level tree; public-read). */
export interface VendorCategoryRef {
  categoryId: string;
  name: string;
  /** Parent in the ≤4-level tree (`parent_id` self-FK); null at level 1 (Doc-6D MK-CR8). */
  parentCategoryId: string | null;
}

/**
 * The PUBLIC vendor-profile projection (Doc-4D `get_public_vendor_profile.v1`; Doc-2 §10.3 column set). The
 * CORE published view — what the Public Experience renders for a vendor. The `claim_state`/`status` model is
 * NOT exposed (a returned public profile is, by the publish-state RLS, an active published one — non-disclosure,
 * Doc-6D R9): absent / soft-deleted / banned / unpublished all collapse to `found: false`.
 *
 * Marketplace-owned fields only, EXACTLY the frozen projection (Doc-4D_Content_v1.0_PassB_Discovery.md
 * §BC-MKT-6 — "name, human_ref, capability_flags, geography, categories, TrustIndicators, published
 * profile-experience", verbatim): `vendorTypePreset` and `declaredTier` were dropped from this DTO
 * (2026-07-11 DTO-conformance fix — neither is in the frozen projection; `vendorTypePreset` also sits
 * in tension with Invariant #1's "capability = matrix, never a label" on a PUBLIC surface, and
 * `declaredTier` is Financial-Tier-adjacent on an anonymous surface). `vendorProfileId` stays (needed
 * to construct/chain the response, not an over-render).
 *
 * DEFERRED (tracked, not silently dropped — W3-MKT-1 WP card Outputs): `TrustIndicators` (M5 read-model,
 * DD-1 — M5 does not exist yet) and published "profile-experience" are part of the frozen projection but
 * are NOT realized by this pilot slice.
 */
export interface PublicVendorProfileView {
  /** PK (UUIDv7) of the vendor_profiles row. */
  vendorProfileId: string;
  /** Year-scoped human reference `VENDOR-YYYY-NNNNNN` (Doc-6D MK-CR11; display-only). */
  humanRef: string;
  /** Vendor display name. */
  name: string;
  /** The four-flag capability matrix (Invariant #1). */
  capabilityFlags: VendorCapabilityFlags;
  /** Hard-attribute geography (Doc-2 §10.3). */
  geography: VendorGeography;
  /** Active category assignments (Doc-6D MK-CR8; `status='active'` only). */
  categories: VendorCategoryRef[];
}

/**
 * Outcome of `marketplace.get_public_vendor_profile.v1`. Non-disclosure (Doc-6D R9 / Doc-5A §6.6): an absent,
 * soft-deleted, banned, or unpublished profile all collapse to the SAME `found: false` (the wire `404` —
 * indistinguishable; never leaks which). UNCHANGED by the 2026-07-11 DTO-conformance fix.
 */
export type GetPublicVendorProfileResult =
  { found: true; profile: PublicVendorProfileView } | { found: false };

/**
 * The application-level outcome of the `get_public_vendor_profile` query: the frozen found/not-found
 * result PLUS the pre-SCOPE SYNTAX validation-failure leg (neither/both of `vendorProfileId`/`humanRef`
 * supplied, or a malformed one — Doc-4D PassB Discovery Validation Matrix: SYNTAX before SCOPE).
 * `GetPublicVendorProfileResult` itself is UNCHANGED; this outcome only adds the discriminator the wire
 * mapper (`api/get-public-vendor-profile.handler.ts`) needs to distinguish a `400` VALIDATION from the
 * `404` non-disclosure collapse — never surfaced to the caller as a third `GetPublicVendorProfileResult`
 * branch (the wire `result` shape is byte-identical to the frozen contract on every success).
 */
export type GetPublicVendorProfileOutcome =
  GetPublicVendorProfileResult | { found: false; invalidInput: true };

/**
 * Lookup key for `get_public_vendor_profile` — EXACTLY ONE of `vendorProfileId` (UUIDv7) or `humanRef`
 * (`VENDOR-YYYY-NNNNNN`). Both-or-neither is a VALIDATION error (Doc-4D §C SYNTAX). Public input only —
 * no org/tenant context (this is an anonymous public read).
 */
export interface GetPublicVendorProfileKey {
  vendorProfileId?: string;
  humanRef?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// `marketplace.list_vendor_directory.v1` (Doc-4D_Content_v1.0_PassB_Discovery.md §D6 BC-MKT-6, row
// "list_vendor_directory"; field-level realization
// Doc-5D_VendorDirectoryProjection_Patch_v1.0.3 / PATCH-5D-VLD-01). Paginated public directory read —
// anonymous, no org/tenant context. Pagination per the already-fully-specified `Doc-5A_Content_v1.0_Pass5.md`
// §8 (cursor-only, opaque, POLICY-bound `page_size`, `page_info: { next_cursor, has_more }`, §8.7
// exclusion-consistency). Sort is server-fixed to `name` ascending with an `id` tiebreaker for a total
// order (PATCH-5D-VLD-01 §3) — this contract accepts NO client `sort` parameter (no `field:dir` sort
// grammar is exposed).
// ─────────────────────────────────────────────────────────────────────────────

/** The 4-flag capability names (Invariant #1), wire-cased — the ONLY legal `filters.capability` values. */
export type CapabilityFilterFlag = "can_supply" | "can_service" | "can_fabricate" | "can_consult";

/**
 * `list_vendor_directory`'s `filters` object (Doc-5D PATCH-5D-VLD-01 §2 — typed identically to the
 * `search_catalog` sibling on the same Doc-4D line). Each field independently optional; an undeclared
 * filter field is a `marketplace_discovery_invalid_input` VALIDATION error (reused, not coined).
 * `vendor_type_preset` is carried, not realized here (Doc-5D §2 — not coined by this patch).
 */
export interface ListVendorDirectoryFilters {
  categoryId?: string;
  country?: string;
  division?: string;
  district?: string;
  industrialZone?: string;
  /** ONE capability flag name per filter call (Doc-5D §2) — a vendor matches iff that single flag is `true`. */
  capability?: CapabilityFilterFlag;
}

/** Request shape for `list_vendor_directory` (Doc-4D §D6 line 21; Doc-5A §8 cursor/page_size grammar). */
export interface ListVendorDirectoryRequest {
  filters?: ListVendorDirectoryFilters;
  cursor?: string;
  pageSize?: number;
}

/**
 * A single `marketplace.list_vendor_directory.v1` list item (Doc-5D PATCH-5D-VLD-01 §1 + the
 * PATCH-5D-VDS-01 amendment below). Reuses `PublicVendorProfileView` VERBATIM for every pinned
 * business field (`vendorProfileId`, `humanRef`, `name`, `capabilityFlags`, `geography`,
 * `categories`) — "same DTO, no duplication," per the patch's explicit instruction.
 * `PublicVendorProfileView` itself is UNCHANGED (`get_public_vendor_profile.v1`'s own wire shape is
 * untouched).
 *
 * `slug` (Doc-5D_VendorDirectorySlugField_Patch_v1.0.4 / PATCH-5D-VDS-01, owner-ruled 2026-07-11,
 * resolves `[ESC-MKT-VENDORDIR-SLUGFIELD]`): one additive OUTPUT field beyond
 * PATCH-5D-VLD-01 §1's original 6-field table. Unlike `get_public_vendor_profile.v1` — where the
 * caller already supplies the slug as the incoming URL segment (see
 * `app/(public)/vendors/[slug]/get-vendor.ts`'s `toVendorProfileVM`, "`slug` is carried through from
 * the CALLER … the frozen projection itself carries no slug field") — a LIST has no per-row
 * caller-known slug, and no other contract supplies one in reverse: `resolve_vendor_slug.v1` resolves
 * slug→id only, and its scope guard (PATCH-4D-VSR-01) governs slug as an **input** — it does not
 * restrict slug as a response field on another contract. Without it the Vendor Directory
 * (`app/(public)/vendors/page.tsx`) and Search "Vendors" tab (`app/(public)/search/page.tsx`) cards
 * could not construct a working `vendorHref()` target (ADR-024 Decision 6 —
 * `app/(public)/_components/vendor-url.ts` is the one permitted vendor-URL builder). Not a
 * non-disclosure concern (§7.5 covers claim/ban/blacklist/financial facts; a listed vendor's slug is,
 * by construction, already its own live public URL segment). `get_public_vendor_profile.v1`'s own
 * DTO and `resolve_vendor_slug.v1`'s scope guard are both unchanged by this amendment.
 */
export interface VendorDirectoryListItem extends PublicVendorProfileView {
  slug: string;
}

/** Doc-5A §8.6 page_info (camelCase wire realization — Doc-5A v1.0.1 Option B; `total_count` omitted
 *  per Doc-5D PATCH-5D-VLD-01 §3, optional per §8.6). */
export interface ListVendorDirectoryPageInfo {
  nextCursor?: string;
  hasMore: boolean;
}

/** Result of `list_vendor_directory` — the Doc-5A §8.6 list shape (items + page_info). */
export interface ListVendorDirectoryResult {
  items: VendorDirectoryListItem[];
  pageInfo: ListVendorDirectoryPageInfo;
}

/**
 * The application-level outcome: the frozen list result PLUS the pre-SCOPE SYNTAX validation-failure
 * leg (an undeclared filter field, a malformed `category_id`/`capability`/`cursor`, or an out-of-bound
 * `page_size` — Doc-5A §8.3/§8.4/§8.5; Doc-4D §D6 Validation Matrix: SYNTAX before SCOPE). The wire
 * mapper (`api/list-vendor-directory.handler.ts`) turns `invalidInput` into the
 * `marketplace_discovery_invalid_input` VALIDATION error; the success leg is byte-identical to
 * `ListVendorDirectoryResult` on the wire.
 */
export type ListVendorDirectoryOutcome = ListVendorDirectoryResult | { invalidInput: true };

// ─────────────────────────────────────────────────────────────────────────────
// `marketplace.resolve_vendor_slug.v1` (Doc-4D_VendorSlugResolve_Patch_v1.0.4 / PATCH-4D-VSR-01;
// wire realization Doc-5D_VendorSlugResolve_Patch_v1.0.2 / PATCH-5D-VSR-01). Given the public vendor
// microsite route's `[slug]` URL segment, resolve it to a live vendor, a redirect target, or the
// uniform not-found collapse — identifier resolution ONLY, never vendor metadata (the Response
// Contract's binding exclusion). `slug` is accepted ONLY by this contract (the PATCH-4D-VSR-01 scope
// guard) — never add it as a parameter on `get_public_vendor_profile` or any other Marketplace
// contract.
// ─────────────────────────────────────────────────────────────────────────────

/** Lookup key for `resolve_vendor_slug` — the raw `[slug]` URL segment (public input only). */
export interface ResolveVendorSlugKey {
  slug: string;
}

/**
 * The three WIRE response shapes of `marketplace.resolve_vendor_slug.v1` (Doc-5D PATCH-5D-VSR-01 §1.2)
 * — the ONLY branches ever placed on the wire `result`. `current` carries `vendorProfileId` ONLY (no
 * `human_ref`, no profile metadata). `migrated.currentSlug` is the migration target's CURRENT live
 * slug (re-checked for visibility on every call — the two-hop non-disclosure gate, Invariant #11).
 */
export type ResolveVendorSlugResult =
  | { status: "current"; vendorProfileId: string }
  | { status: "migrated"; currentSlug: string }
  | { status: "not_found" };

/**
 * The application-level outcome of the resolver query: the three wire shapes PLUS the pre-SCOPE
 * SYNTAX validation-failure leg (a malformed `slug` — fails the Doc-6D VSS 6D-VSS-01.1 format law —
 * never reaches repository resolution; Doc-4D PATCH-4D-VSR-01 Validation Matrix: SYNTAX before SCOPE).
 * The wire mapper (`api/resolve-vendor-slug.handler.ts`) turns `invalid_input` into the
 * `marketplace_vendor_slug_invalid_input` VALIDATION error; the other three become the `200` envelope
 * verbatim (byte-identical to `ResolveVendorSlugResult`).
 */
export type ResolveVendorSlugOutcome = ResolveVendorSlugResult | { status: "invalid_input" };

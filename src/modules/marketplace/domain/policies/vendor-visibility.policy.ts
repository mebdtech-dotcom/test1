// M2 domain (PRIVATE) — the SINGLE authoritative visibility predicate for every anonymous
// Marketplace read operation. PURE (no I/O, no governance-signal read).
//
// Reference-never-restate. The predicate is a realization, not a local invention:
//   - published + active   — Doc-6D MK-CR2 / MK-CR3 (Doc-6D_Content_v1.0_Pass1.md §2.2/§2.3: the
//     base RLS `visibility='public' AND deleted_at IS NULL` is status-agnostic — a banned profile
//     stays DB-readable so its public banner can render — but the app-layer PUBLIC PROJECTION reads
//     (`get_public_vendor_profile.v1`, `resolve_vendor_slug.v1`) apply the STRICTER "published +
//     active + non-soft-deleted + non-banned" predicate; RLS is the coarse backstop, this function is
//     the authorization model — CLAUDE.md §2).
//   - non-soft-deleted     — Doc-2 §0.2 soft-delete convention.
//   - non-banned           — the state Marketplace reflects via `reflect_vendor_ban.v1` (DD-3,
//     Doc-4D_Content_v1.0_PassB_Discovery.md — Admin owns the ban decision; Marketplace reflects it
//     as `status: 'banned'`, never authors it).
//
// This file is the SINGLE authoritative visibility policy for all anonymous Marketplace read
// operations (Doc-4D_VendorSlugResolve_Patch_v1.0.4 "Shared visibility predicate" clause) — any
// future public read (e.g. `list_vendor_directory`) consumes this same policy rather than
// re-deriving its own predicate. Both repositories in this slice
// (`infrastructure/data/vendor-profile.repository.ts`, `infrastructure/data/vendor-slug.repository.ts`)
// gate their results through this function, never a local re-derivation.

/** The three `marketplace.vendor_status` values (Doc-2 §5.3 STATUS dimension; Doc-6D §3.1.1). */
export type VendorVisibilityStatus = "active" | "suspended" | "banned";

/** The visibility-relevant facts read off a `vendor_profiles` row (or its slug-history target). */
export interface VendorVisibilityFacts {
  /** `marketplace.vendor_status` (Doc-2 §5.3). Only `active` participates in a public projection. */
  status: VendorVisibilityStatus;
  /** `marketplace.vendor_visibility` (Doc-2 §10.3) — the only value is `'public'` (Doc-6D MK-CR3). */
  visibility: "public";
  /** Soft-delete marker (Doc-2 §0.2); non-null excludes the row from every public projection. */
  deletedAt: Date | null;
}

/**
 * True iff a vendor profile is visible on an anonymous Marketplace public-projection read
 * (`get_public_vendor_profile.v1` / `resolve_vendor_slug.v1`'s `current`/`migrated`-target gate).
 * Published + active + non-soft-deleted + non-banned — ALL four, not merely the base RLS predicate.
 * Fail-closed: any other combination (unpublished, suspended, banned, soft-deleted) is NOT visible.
 */
export function isVendorProfilePubliclyVisible(facts: VendorVisibilityFacts): boolean {
  return facts.visibility === "public" && facts.status === "active" && facts.deletedAt === null;
}

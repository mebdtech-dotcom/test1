// M2 domain (PRIVATE) — the minimal `vendor_profiles` (+ active category assignments) read model for
// the public-projection read (Doc-6D §3.1.1 / §3.1.4 entities; Doc-4D `get_public_vendor_profile.v1`
// / `resolve_vendor_slug.v1`). A read projection of the authoritative `marketplace.vendor_profiles`
// row — NOT a source of truth (the table is). Only the columns the frozen public projection needs are
// carried (Doc-2 §10.3 column set is wider; `vendor_type_preset`, declared tier, capacity, etc. are
// deliberately absent here — not in the frozen public projection, DTO-conformance narrowing).
//
// Reference-never-restate: the column set is owned by Doc-2 §10.3; this type binds it by shape.

import type { VendorVisibilityStatus } from "../policies/vendor-visibility.policy";

/** An active category assignment's category (Doc-6D MK-CR8 — 4-level platform tree; public-read). */
export interface VendorCategoryAssignmentReadModel {
  categoryId: string;
  name: string;
  /** Parent in the ≤4-level tree (`categories.parent_id` self-FK); null at level 1. */
  parentCategoryId: string | null;
}

/** The public-projection-relevant `vendor_profiles` fields, as read from the table. */
export interface VendorProfileReadModel {
  /** PK (UUIDv7). */
  id: string;
  /** Year-scoped human reference `VENDOR-YYYY-NNNNNN` (Doc-6D MK-CR11). */
  humanRef: string;
  /** Vendor display name. */
  name: string;
  canSupply: boolean;
  canService: boolean;
  canFabricate: boolean;
  canConsult: boolean;
  country: string | null;
  division: string | null;
  district: string | null;
  industrialZone: string | null;
  /** `marketplace.vendor_status` (Doc-2 §5.3) — the visibility-policy STATUS input. */
  status: VendorVisibilityStatus;
  /** `marketplace.vendor_visibility` (Doc-2 §10.3) — the only value is `'public'`. */
  visibility: "public";
  /** Soft-delete marker (Doc-2 §0.2) — the visibility-policy input. */
  deletedAt: Date | null;
  /** Active (`status='active'`, non-soft-deleted) category assignments only (Doc-6D MK-CR8). */
  categories: VendorCategoryAssignmentReadModel[];
}

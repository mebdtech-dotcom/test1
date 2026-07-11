// M2 domain (PRIVATE) — the minimal `vendor_profiles` (+ active category assignments) read model for
// `marketplace.list_vendor_directory.v1` (Doc-5D_VendorDirectoryProjection_Patch_v1.0.3 /
// PATCH-5D-VLD-01). A read projection of the authoritative `marketplace.vendor_profiles` row — NOT a
// source of truth (the table is). Reuses `VendorCategoryAssignmentReadModel` from the sibling
// single-profile read model verbatim (no duplication).
//
// `slug` is the ONE field this read model carries beyond `VendorProfileReadModel` (the single-profile
// sibling) — see `contracts/types.ts` `VendorDirectoryListItem` for the flagged rationale (a list has
// no caller-known slug per row, unlike `get_public_vendor_profile.v1`).

import type { VendorVisibilityStatus } from "../policies/vendor-visibility.policy";
import type { VendorCategoryAssignmentReadModel } from "./vendor-profile.read-model";

export type { VendorCategoryAssignmentReadModel };

/** One `vendor_profiles` row as read for the directory list, plus its visibility-policy inputs. */
export interface VendorDirectoryRowReadModel {
  /** PK (UUIDv7). */
  id: string;
  /** Year-scoped human reference `VENDOR-YYYY-NNNNNN` (Doc-6D MK-CR11). */
  humanRef: string;
  /** Vendor display name — also the primary keyset-pagination sort key (Doc-5D §3). */
  name: string;
  /** The live public microsite slug — routing-only (see `contracts/types.ts` for the flagged rationale). */
  slug: string;
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

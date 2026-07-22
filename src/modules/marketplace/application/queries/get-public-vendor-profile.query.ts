// M2 application (PRIVATE) — `marketplace.get_public_vendor_profile.v1` read query
// (Doc-4D_Content_v1.0_PassB_Discovery.md §BC-MKT-6; anonymous Public Discovery read). Orchestration
// only; owns NO state. Single reads: NO explicit transaction (D7's shared-tx exists to bind a write
// to its audit row — not applicable to a read; reads are not audited, Doc-4A §17.1).
//
// Validation Matrix (Doc-4D PassB Discovery, query template): SYNTAX (one identifier for the single
// read) → CONTEXT (public caller — no active-org, Invariant #5 not applicable to an anonymous read)
// → AUTHZ (public; none required) → SCOPE (published/non-excluded rows only; NOT_FOUND collapse).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import {
  findPublicVendorProfileById,
  findPublicVendorProfileByHumanRef,
} from "../../infrastructure/data/vendor-profile.repository";
import { isVendorProfilePubliclyVisible } from "../../domain/policies/vendor-visibility.policy";
import type { VendorProfileReadModel } from "../../domain/read-models/vendor-profile.read-model";
import type {
  GetPublicVendorProfileKey,
  GetPublicVendorProfileOutcome,
  PublicVendorProfileView,
} from "../../contracts/types";

// `VENDOR-YYYY-NNNNNN` (Doc-6D MK-CR11; core.allocate_human_ref('VENDOR', year), Doc-6B §3.3 —
// lpad width 6, `format('%s-%s-%s', type, year, lpad(v, 6, '0'))`).
const HUMAN_REF_FORMAT = /^VENDOR-\d{4}-\d{6}$/;

function toPublicVendorProfileView(row: VendorProfileReadModel): PublicVendorProfileView {
  return {
    vendorProfileId: row.id,
    humanRef: row.humanRef,
    name: row.name,
    capabilityFlags: {
      canSupply: row.canSupply,
      canService: row.canService,
      canFabricate: row.canFabricate,
      canConsult: row.canConsult,
    },
    geography: {
      country: row.country,
      division: row.division,
      district: row.district,
      industrialZone: row.industrialZone,
    },
    categories: row.categories.map((c) => ({
      categoryId: c.categoryId,
      name: c.name,
      parentCategoryId: c.parentCategoryId,
    })),
  };
}

/**
 * `marketplace.get_public_vendor_profile.v1` — resolve the public vendor-profile projection by
 * EXACTLY ONE of `vendorProfileId`/`humanRef`, or the uniform not-found collapse. Absent /
 * soft-deleted / banned / unpublished all collapse to the SAME `{ found: false }` (Doc-6D R9;
 * Invariant #11) — this function never distinguishes them to its caller.
 */
export async function getPublicVendorProfile(
  key: GetPublicVendorProfileKey,
  db: DbExecutor = prisma,
): Promise<GetPublicVendorProfileOutcome> {
  const hasId = key.vendorProfileId !== undefined;
  const hasRef = key.humanRef !== undefined;

  // SYNTAX — exactly one identifier, correctly formatted (Doc-4D PassB Discovery Validation Matrix).
  if (hasId === hasRef) {
    return { found: false, invalidInput: true };
  }
  if (hasId && !UUID_PATTERN.test(key.vendorProfileId as string)) {
    return { found: false, invalidInput: true };
  }
  if (hasRef && !HUMAN_REF_FORMAT.test(key.humanRef as string)) {
    return { found: false, invalidInput: true };
  }

  const row = hasId
    ? await findPublicVendorProfileById(key.vendorProfileId as string, db)
    : await findPublicVendorProfileByHumanRef(key.humanRef as string, db);

  // SCOPE — absent, OR present-but-not-publicly-visible, collapse identically (non-disclosure).
  if (row === null || !isVendorProfilePubliclyVisible(row)) {
    return { found: false };
  }

  return { found: true, profile: toPublicVendorProfileView(row) };
}

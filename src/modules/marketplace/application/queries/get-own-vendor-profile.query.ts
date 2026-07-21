// M2 application (PRIVATE) — `marketplace.get_vendor_profile.v1`, the CONTROLLING-ORG (User) leg
// (Doc-4D PassB §D4; Doc-5D Pass-1 row 6 / Pass-2 §4.4 "Public-or-Controlling-Org"). The Public leg
// is the separate row-64 endpoint (`get_public_vendor_profile.v1`, W3-MKT-1) — the two projections
// are DISTINCT wire surfaces and are never merged (R5 / Invariant #9).
//
// Read semantics (Doc-4D §B.6): single-entity read; lookup by `vendor_profile_id` XOR `human_ref`
// (exactly one — SYNTAX). Absent / cross-tenant / soft-deleted collapse to the SAME `found: false`
// (non-disclosure — Doc-5A §6.6). Reads are not audited (Doc-4A §17.1); no event; idempotency n/a.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import { findOwnVendorProfile } from "../../infrastructure/data/vendor-profile-write.repository";
import type { GetOwnVendorProfileKey, GetOwnVendorProfileOutcome } from "../../contracts/types";

// Doc-2 §0.1 human_ref shape with the M2 'VENDOR' prefix (Doc-6D §3.1.1 MK-CR11 [§2.5] choice).
const HUMAN_REF_PATTERN = /^VENDOR-\d{4}-\d{6}$/;

/**
 * The Controlling-Org vendor-profile read. `activeOrgId` is the SERVER-RESOLVED active org (from
 * `withActiveOrgContext`) — never client input; the repository filters on it AND runs RLS-scoped.
 */
export async function getOwnVendorProfile(
  key: GetOwnVendorProfileKey,
  activeOrgId: string,
  db: DbExecutor = prisma,
): Promise<GetOwnVendorProfileOutcome> {
  const hasId = key.vendorProfileId !== undefined;
  const hasRef = key.humanRef !== undefined;

  // SYNTAX (Doc-4D §B.4 query row): exactly one identifier, well-formed.
  if (hasId === hasRef) return { found: false, invalidInput: true };
  if (hasId && !UUID_PATTERN.test(key.vendorProfileId!)) {
    return { found: false, invalidInput: true };
  }
  if (hasRef && !HUMAN_REF_PATTERN.test(key.humanRef!)) {
    return { found: false, invalidInput: true };
  }

  const profile = await findOwnVendorProfile(key, activeOrgId, db);
  if (profile === null) return { found: false };
  return { found: true, profile };
}

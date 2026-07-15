// Delegation presentation seed — shared by P-ACC-11 (list) and P-ACC-12 (editor). NOT authoritative: a
// wired build resolves grants from `identity.list_delegation_grants.v1` / `identity.get_delegation_grant.v1`
// and the permission catalog from `identity.list_permissions.v1` (Doc-4C §C9 / §C7). PRESENTATION ONLY.
//
// Extracted from `delegation-view.tsx` (P-ACC-11) so the list and the editor read ONE seed and can never
// drift into two dialects of the same grant — the `role-seed.ts` precedent (P-ACC-08/09).
//
// FIELD DISCIPLINE (invent nothing):
//  • Fields map 1:1 to the frozen DTO, which projects OPAQUE IDS ONLY: `{ delegation_grant_id,
//    controlling_organization_id, representative_organization_id, vendor_profile_id, permission_set,
//    valid_from, valid_to, status }` (Doc-4C §C9). No display name is projected — never resolve one here.
//  • Dates are stored ISO (`valid_from` / `valid_to`, `null` = open-ended per the Doc-6C §3.9 CHECK
//    `valid_to IS NULL OR valid_to > valid_from`) and formatted at the render edge via the kit
//    `formatDate` — never pre-formatted in the seed, which would make them uneditable.
//  • Grant states are the FULL frozen §5.10 set: `draft → active → suspended ⇄ active → revoked` /
//    `active → expired` (Doc-2 §5.10:581–588).
import type { StatusTone } from "@/frontend/components/status-chip";
import { PERMISSION_CATALOG, type PermissionItem } from "../roles/role-seed";

/** Frozen §5.10 delegation-grant states. */
export type GrantStatus = "draft" | "active" | "suspended" | "revoked" | "expired";

export interface Grant {
  grantId: string;
  controllingOrgRef: string; // controlling_organization_id (opaque)
  representativeOrgRef: string; // representative_organization_id (opaque)
  vendorProfileRef: string; // vendor_profile_id (opaque)
  permissionSet: string[]; // permission_set (frozen Doc-2 §7 tenant slugs)
  status: GrantStatus;
  validFrom: string; // valid_from (ISO)
  validTo: string | null; // valid_to (ISO; null = open-ended / no expiry)
}

export const STATUS_META: Record<GrantStatus, { label: string; tone: StatusTone }> = {
  draft: { label: "Draft", tone: "info" },
  active: { label: "Active", tone: "success" },
  suspended: { label: "Suspended", tone: "warning" },
  revoked: { label: "Revoked", tone: "danger" },
  expired: { label: "Expired", tone: "neutral" },
};

/**
 * The ownership-class (Owner-only, NEVER-delegable) slugs. Bound by pointer to the Doc-2 §7 Owner-only row
 * and to its domain SSoT `OWNERSHIP_CLASS_SLUGS` in `identity/domain/policies/delegation-grant.policy.ts`
 * — which this presentation tier may NOT import (a module's `domain/` is private; only `contracts/` is
 * importable — CLAUDE.md §10 / Golden Rule #2). Transcribed, coined nowhere.
 *
 * The server is authoritative (`identity_delegation_ownership_class_block`, Doc-4C §C9); mirroring the rule
 * here only keeps the picker from OFFERING a scope the server would reject — it never decides anything.
 */
export const OWNERSHIP_CLASS_SLUGS: readonly string[] = [
  "can_transfer_ownership",
  "can_delete_organization",
  "can_submit_verification",
];

/**
 * The scopes a grant may actually cover: the frozen tenant catalog MINUS the ownership class (Doc-2 §5.10
 * guard — "Grants delegate authority; they do not create it"). Derived from the ONE catalog seed
 * (`role-seed.ts`) rather than re-listing slugs, so a catalog change can never leave this picker stale.
 */
export const DELEGABLE_PERMISSIONS: PermissionItem[] = PERMISSION_CATALOG.filter(
  (p) => !OWNERSHIP_CLASS_SLUGS.includes(p.slug),
);

// Presentation seed — opaque UUID refs exactly as the contract discloses them (bare ids, no names). The
// active org appears as controlling on some grants and representative on others (role_filter = any).
export const ACTIVE_ORG = "0192f0a1-7c3d-7e21-a001-0000000000a1";

export const GRANTS: Grant[] = [
  {
    grantId: "grant_01",
    controllingOrgRef: ACTIVE_ORG,
    representativeOrgRef: "0192f0a1-7c3d-7e21-b002-0000000000b2",
    vendorProfileRef: "0192f0a1-7c3d-7e21-c101-0000000000c1",
    permissionSet: ["can_manage_vendor_profile"],
    status: "active",
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
  },
  {
    grantId: "grant_02",
    controllingOrgRef: ACTIVE_ORG,
    representativeOrgRef: "0192f0a1-7c3d-7e21-b003-0000000000b3",
    vendorProfileRef: "0192f0a1-7c3d-7e21-c102-0000000000c2",
    permissionSet: ["can_manage_vendor_profile", "can_manage_users"],
    status: "suspended",
    validFrom: "2026-01-15",
    validTo: "2026-09-30",
  },
  {
    grantId: "grant_03",
    controllingOrgRef: "0192f0a1-7c3d-7e21-b004-0000000000b4",
    representativeOrgRef: ACTIVE_ORG,
    vendorProfileRef: "0192f0a1-7c3d-7e21-c103-0000000000c3",
    permissionSet: ["can_manage_vendor_profile"],
    status: "active",
    validFrom: "2026-02-01",
    validTo: "2026-08-15",
  },
  {
    grantId: "grant_04",
    controllingOrgRef: ACTIVE_ORG,
    representativeOrgRef: "0192f0a1-7c3d-7e21-b005-0000000000b5",
    vendorProfileRef: "0192f0a1-7c3d-7e21-c104-0000000000c4",
    permissionSet: ["can_manage_workflow_settings"],
    status: "expired",
    validFrom: "2025-06-01",
    validTo: "2026-06-01",
  },
  {
    grantId: "grant_05",
    controllingOrgRef: ACTIVE_ORG,
    representativeOrgRef: "0192f0a1-7c3d-7e21-b006-0000000000b6",
    vendorProfileRef: "0192f0a1-7c3d-7e21-c105-0000000000c5",
    permissionSet: ["can_manage_vendor_profile"],
    status: "revoked",
    validFrom: "2026-03-01",
    validTo: null,
  },
  {
    // draft — controller-side, before the grant is issued (Doc-2 §5.10 `draft`).
    grantId: "grant_06",
    controllingOrgRef: ACTIVE_ORG,
    representativeOrgRef: "0192f0a1-7c3d-7e21-b007-0000000000b7",
    vendorProfileRef: "0192f0a1-7c3d-7e21-c106-0000000000c6",
    permissionSet: ["can_manage_delegations"],
    status: "draft",
    validFrom: "2026-08-01",
    validTo: null,
  },
];

export function getGrantSeed(grantId: string): Grant | undefined {
  return GRANTS.find((g) => g.grantId === grantId);
}

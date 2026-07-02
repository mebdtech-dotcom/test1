// Identity ops (orgs) — presentation SEED (P-ADM-25 · Doc-7H · J-ADM-06). A curated mock of the admin
// organization worklist standing in for the unwired read — NOT data, coins nothing. CROSS-MODULE BOUNDARY:
// organizations are owned by M1/Identity; Admin (M8) DECIDES a governance action but IDENTITY OWNS THE EFFECT
// (R5) — Admin never bypasses the Identity domain. The mutations are `identity.set_organization_status.v1`
// (suspend/reinstate, §5.1) and `identity.admin_recover_ownership.v1` (ownership-succession recovery, §5.5),
// both 21.6 Admin, no active-org context (§5.6), authz `staff_super_admin` (interim, DC-3). Fields bind to
// frozen `organizations` (Doc-2:718): `human_ref ORG-…`, `name`, `org_status`, participation (derived from
// has_buyer_profile/has_vendor_profile). FIREWALL: identity touches no governance signal — no score here. No
// fabricated total (GI-03).
import type { StatusTone } from "@/frontend/components/status-chip";

// Frozen `organizations` status machine (Doc-2 §5.1): active ⇄ suspended; active|suspended → soft_deleted.
export type OrgStatus = "active" | "suspended" | "soft_deleted";
export type OrgParticipation = "Buyer" | "Vendor" | "Hybrid";

export interface OrgOpsVM {
  id: string;
  /** `organizations.human_ref` (ORG-…) — year-scoped human ref. */
  ref: string;
  name: string;
  /** Derived from has_buyer_profile / has_vendor_profile flags. */
  participation: OrgParticipation;
  status: OrgStatus;
}

export const ORG_STATUS_META: Record<OrgStatus, { label: string; tone: StatusTone }> = {
  active: { label: "Active", tone: "success" },
  suspended: { label: "Suspended", tone: "warning" },
  soft_deleted: { label: "Soft-deleted", tone: "neutral" },
};

export const ORG_OPS: OrgOpsVM[] = [
  {
    id: "org-000188",
    ref: "ORG-2026-000188",
    name: "Rupsha Engineering Works",
    participation: "Vendor",
    status: "active",
  },
  {
    id: "org-000181",
    ref: "ORG-2026-000181",
    name: "Delta Fabrication Ltd.",
    participation: "Hybrid",
    status: "active",
  },
  {
    id: "org-000174",
    ref: "ORG-2026-000174",
    name: "Meghna Industrial Buyers",
    participation: "Buyer",
    status: "active",
  },
  {
    id: "org-000169",
    ref: "ORG-2026-000169",
    name: "Bay Valves & Controls",
    participation: "Vendor",
    status: "suspended",
  },
  {
    id: "org-000160",
    ref: "ORG-2026-000160",
    name: "Padma Procurement Cell",
    participation: "Buyer",
    status: "active",
  },
  {
    id: "org-000152",
    ref: "ORG-2026-000152",
    name: "Titas Instrumentation",
    participation: "Vendor",
    status: "suspended",
  },
  {
    id: "org-000144",
    ref: "ORG-2026-000144",
    name: "Karnaphuli Trading (closed)",
    participation: "Buyer",
    status: "soft_deleted",
  },
];

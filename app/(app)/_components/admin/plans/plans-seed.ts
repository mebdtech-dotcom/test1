// Plans — presentation SEED (P-ADM-22 · Doc-7H · J-ADM-06 · `billing.list_plans`). A curated mock of the
// commercial plan catalog standing in for the unwired read — NOT data, coins nothing. `plans` are owned by
// M7/Billing (BC-BILL-1), platform-owned, "marketing configuration" with lifecycle `draft → active → retired`
// (Doc-2 §3.8). A Plan (COMMERCIAL) is NOT a Financial Tier (CAPABILITY) — Invariant #10; and entitlements
// resolve as boolean/numeric/enum, NEVER plan-name checks (Invariant #10) — no plan-name gating is expressed
// here. Fields bind to the frozen `plans` (Doc-2:823): `name`, `billing_cycle(monthly/annual)`, `price`,
// `currency`, `is_active` (marketing-VISIBILITY, distinct from the lifecycle `status`). No fabricated total
// (GI-03).
import type { StatusTone } from "@/frontend/components/status-chip";

// Frozen `plans` lifecycle (Doc-2 §3.8).
export type PlanStatus = "draft" | "active" | "retired";
export type BillingCycle = "monthly" | "annual";

export interface PlanVM {
  /** `plans.id` — opaque platform id (no human_ref); display only. */
  id: string;
  name: string;
  billingCycle: BillingCycle;
  price: number;
  /** Currency stored per value field (multi-currency-ready; BDT today). */
  currency: string;
  /** `plans.is_active` — marketing VISIBILITY, distinct from the lifecycle `status`. */
  isVisible: boolean;
  status: PlanStatus;
}

export const PLAN_STATUS_META: Record<PlanStatus, { label: string; tone: StatusTone }> = {
  draft: { label: "Draft", tone: "warning" },
  active: { label: "Active", tone: "success" },
  retired: { label: "Retired", tone: "neutral" },
};

export const BILLING_CYCLE_SUFFIX: Record<BillingCycle, string> = {
  monthly: "/mo",
  annual: "/yr",
};

/** Format a plan price for display (currency + amount + cycle suffix). */
export function formatPlanPrice(plan: PlanVM): string {
  const amount = plan.price.toLocaleString("en-US");
  return `${plan.currency} ${amount} ${BILLING_CYCLE_SUFFIX[plan.billingCycle]}`;
}

export const PLANS: PlanVM[] = [
  {
    id: "plan-basic",
    name: "Basic",
    billingCycle: "monthly",
    price: 0,
    currency: "BDT",
    isVisible: true,
    status: "active",
  },
  {
    id: "plan-growth",
    name: "Growth",
    billingCycle: "monthly",
    price: 5000,
    currency: "BDT",
    isVisible: true,
    status: "active",
  },
  {
    id: "plan-professional",
    name: "Professional",
    billingCycle: "monthly",
    price: 12000,
    currency: "BDT",
    isVisible: true,
    status: "active",
  },
  {
    id: "plan-professional-annual",
    name: "Professional (Annual)",
    billingCycle: "annual",
    price: 120000,
    currency: "BDT",
    isVisible: true,
    status: "active",
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    billingCycle: "annual",
    price: 480000,
    currency: "BDT",
    isVisible: false,
    status: "draft",
  },
  {
    id: "plan-starter-legacy",
    name: "Starter (legacy)",
    billingCycle: "monthly",
    price: 3000,
    currency: "BDT",
    isVisible: false,
    status: "retired",
  },
];

// Frozen `entitlements` type (Doc-2:369 / Doc-4I §HB-1.4 output — `entitlements:list<{entitlement_id, slug,
// type, value}>`). The type is the FROZEN enum; entitlement SLUGS are a platform-owned catalog (not enumerated
// in the corpus), so the slugs below are illustrative — value-based (boolean/numeric/enum), NEVER plan-name
// checks (Invariant #10).
export type EntitlementType = "boolean" | "numeric" | "enum";

export interface EntitlementRefVM {
  entitlementId: string;
  slug: string;
  type: EntitlementType;
  /** Resolved value (boolean/numeric/enum) — display only. */
  value: string;
}

/** Extended detail for one plan (P-ADM-23 editor) — the frozen `get_plan` projection (plan + entitlements). */
export interface PlanDetailVM extends PlanVM {
  entitlements: EntitlementRefVM[];
}

const PLAN_ENTITLEMENTS: Record<string, EntitlementRefVM[]> = {
  "plan-basic": [
    { entitlementId: "ent-rfq-quota", slug: "rfq.monthly_quota", type: "numeric", value: "5" },
    { entitlementId: "ent-support", slug: "support.tier", type: "enum", value: "standard" },
  ],
  "plan-growth": [
    { entitlementId: "ent-rfq-quota", slug: "rfq.monthly_quota", type: "numeric", value: "25" },
    {
      entitlementId: "ent-microsite",
      slug: "microsite.custom_domain",
      type: "boolean",
      value: "true",
    },
    { entitlementId: "ent-support", slug: "support.tier", type: "enum", value: "standard" },
  ],
  "plan-professional": [
    { entitlementId: "ent-rfq-quota", slug: "rfq.monthly_quota", type: "numeric", value: "100" },
    {
      entitlementId: "ent-microsite",
      slug: "microsite.custom_domain",
      type: "boolean",
      value: "true",
    },
    { entitlementId: "ent-support", slug: "support.tier", type: "enum", value: "priority" },
  ],
  "plan-professional-annual": [
    { entitlementId: "ent-rfq-quota", slug: "rfq.monthly_quota", type: "numeric", value: "100" },
    {
      entitlementId: "ent-microsite",
      slug: "microsite.custom_domain",
      type: "boolean",
      value: "true",
    },
    { entitlementId: "ent-support", slug: "support.tier", type: "enum", value: "priority" },
  ],
  "plan-enterprise": [
    { entitlementId: "ent-rfq-quota", slug: "rfq.monthly_quota", type: "numeric", value: "1000" },
    {
      entitlementId: "ent-microsite",
      slug: "microsite.custom_domain",
      type: "boolean",
      value: "true",
    },
    { entitlementId: "ent-support", slug: "support.tier", type: "enum", value: "dedicated" },
  ],
  "plan-starter-legacy": [
    { entitlementId: "ent-rfq-quota", slug: "rfq.monthly_quota", type: "numeric", value: "10" },
  ],
};

/** Lookup one plan's summary (P-ADM-23 header). */
export function getPlan(id: string): PlanVM | undefined {
  return PLANS.find((p) => p.id === id);
}

/** Lookup one plan's `get_plan` detail (plan + entitlements). Returns undefined for an unknown id (Inv #11). */
export function getPlanDetail(id: string): PlanDetailVM | undefined {
  const summary = getPlan(id);
  const entitlements = PLAN_ENTITLEMENTS[id];
  if (!summary || !entitlements) return undefined;
  return { ...summary, entitlements };
}

/** One entitlement-catalog row (P-ADM-24), with the plans that bundle it. */
export interface EntitlementCatalogRowVM {
  slug: string;
  type: EntitlementType;
  /** Plan names that bundle this entitlement — derived from the plan reads (get_plan). */
  plans: string[];
}

/**
 * Entitlement catalog (P-ADM-24). READ BINDING: there is NO standalone `list_entitlements` contract — the
 * frozen read pair `get_plan`/`list_plans` "serves both plan catalog and entitlement definitions" (Doc-4I
 * reconciliation §Part-1). So the catalog is DERIVED from the plan reads (the sanctioned mechanism): the
 * distinct `{slug, type}` across every plan's `get_plan.entitlements`, with the bundling plans attached. No
 * invented list read; no fabricated total (GI-03).
 */
export function listEntitlementCatalog(): EntitlementCatalogRowVM[] {
  const bySlug = new Map<string, { type: EntitlementType; plans: string[] }>();
  for (const plan of PLANS) {
    for (const e of PLAN_ENTITLEMENTS[plan.id] ?? []) {
      const row = bySlug.get(e.slug) ?? { type: e.type, plans: [] };
      if (!row.plans.includes(plan.name)) row.plans.push(plan.name);
      bySlug.set(e.slug, row);
    }
  }
  return [...bySlug.entries()].map(([slug, v]) => ({ slug, type: v.type, plans: v.plans }));
}

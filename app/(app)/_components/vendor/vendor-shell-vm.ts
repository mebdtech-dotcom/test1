// Vendor Workspace — the ShellViewModel for the canonical Platform Shell (Doc-7G IA · companion §2.2).
//
// PRESENTATION nav structure only, in the shell's own types (NavSection / NavItem) with serializable
// icon KEYS resolved by the shell NAV_ICONS registry. The authoritative navigable set is derived
// SERVER-SIDE from participation + role + entitlement (Inv #10); this static config is the presentation
// default until that gating is wired. Identity is a NEUTRAL PLACEHOLDER until the Doc-7C context layer
// is wired (get_active_context, SR3 — PARKED); no client-supplied org is trusted (Inv #5).
//
// [ESC-7G-A7] (pending the human Architecture Board): the Hybrid "mount-both" IA and the `(vendor)`
// route-group name are NOT ratified. To avoid a URL collision with the `(buyer)` group at `/dashboard`,
// the Vendor Workspace stays on the A7-neutral `/workspace/*` segment — the ONLY thing that changes
// when A7 is ruled is this `BASE` prefix. This config encodes NO Hybrid co-mount decision.
import type { NavItem, NavSection, QuickCreateItem, ShellViewModel } from "../shell";

/** Temporary A7-neutral mount segment (see app/(app)/workspace/layout.tsx) — dropped when A7 is ruled. */
const BASE = "/workspace";

/** Vendor primary navigation (companion §2.2): Dashboard · Company · Presentation · Procurement · Standing. */
export const VENDOR_NAV: NavSection[] = [
  { id: "primary", items: [{ label: "Dashboard", href: `${BASE}/dashboard`, icon: "dashboard" }] },
  {
    id: "company",
    label: "Company",
    items: [
      { label: "Company Profile", href: `${BASE}/company`, icon: "company" },
      { label: "Products", href: `${BASE}/company/products`, icon: "catalog" },
      { label: "Spec Library", href: `${BASE}/company/spec-library`, icon: "specLibrary" },
      { label: "Categories", href: `${BASE}/company/categories`, icon: "categories" },
    ],
  },
  {
    id: "presentation",
    label: "Presentation",
    items: [
      { label: "Microsite & Branding", href: `${BASE}/microsite`, icon: "branding" },
      { label: "Advertising", href: `${BASE}/microsite/ads`, icon: "advertising" },
    ],
  },
  {
    id: "procurement",
    label: "Procurement",
    items: [
      { label: "RFQs & Quotations", href: `${BASE}/rfqs`, icon: "quotations" },
      { label: "Leads & Pipeline", href: `${BASE}/leads`, icon: "pipeline" },
      { label: "Engagements", href: `${BASE}/engagements`, icon: "deals" },
      { label: "Documents", href: `${BASE}/documents`, icon: "documents" },
    ],
  },
  {
    id: "standing",
    label: "Standing & Account",
    items: [
      { label: "Trust & Verification", href: `${BASE}/trust`, icon: "trust" },
      { label: "Billing & Plan", href: `${BASE}/billing`, icon: "billing" },
      { label: "Team & Organization", href: `${BASE}/organization`, icon: "org" },
      { label: "Settings", href: `${BASE}/settings`, icon: "settings" },
    ],
  },
];

/** Vendor `+ Create` actions — each maps to a wired command when wired (BC-MKT-3 / BC-MKT-5). */
export const VENDOR_QUICK_CREATE: QuickCreateItem[] = [
  { label: "Add Product", href: `${BASE}/company/products`, icon: "catalog" },
  { label: "Create Advertisement", href: `${BASE}/microsite/ads`, icon: "advertising" },
];

/** Mobile quick-bar — a thumb-reach SUBSET of the Vendor nav (companion §2.5). */
export const VENDOR_QUICK_BAR: NavItem[] = [
  { label: "Home", href: `${BASE}/dashboard`, icon: "dashboard" },
  { label: "RFQs", href: `${BASE}/rfqs`, icon: "quotations" },
  { label: "Company", href: `${BASE}/company`, icon: "company" },
  { label: "Trust", href: `${BASE}/trust`, icon: "trust" },
];

export const VENDOR_SHELL_VM: ShellViewModel = {
  identity: {
    user: { name: "Your account", email: "" },
    activeOrg: { id: "active", name: "Active organization", participation: "vendor" },
    organizations: [{ id: "active", name: "Active organization", participation: "vendor" }],
  },
  nav: VENDOR_NAV,
  quickCreate: VENDOR_QUICK_CREATE,
  quickBar: VENDOR_QUICK_BAR,
};

// Vendor Workspace — the ShellViewModel for the canonical Platform Shell (Doc-7G IA · companion §2.2).
//
// PRESENTATION nav structure only, in the shell's own types (NavSection / NavItem) with serializable
// icon KEYS resolved by the shell NAV_ICONS registry. The authoritative navigable set is derived
// SERVER-SIDE from participation + role + entitlement (Inv #10); this static config is the presentation
// default until that gating is wired. Identity is a NEUTRAL PLACEHOLDER until the Doc-7C context layer
// is wired (get_active_context, SR3 — PARKED); no client-supplied org is trusted (Inv #5).
//
// [ESC-7G-A7] RATIFIED (Board 2026-07-12, A7.2 Option 1): the Hybrid "mount-both" co-mount IA and the
// owner-chosen `/buy` + `/sell` URL topology are approved. Vendor (Selling) pages live under
// `app/(app)/(workspace)/sell/*`; this config's `BASE` carries the `/sell` prefix. The co-mount itself
// is composed by the seam (`resolveMountedNavGroups`); this VM is the single-surface vendor fixture.
//
// VX-01 (2026-07-03, owner-directed dashboard/nav redesign, verbatim mockup): re-grouped into
// Dashboard / RFQ Leads / Buyer Inquiries / Profile Performance / Digital Showcase / Business Docs /
// Notifications / Team / Settings, using the shell's `NavItem.children` grouping (BX-04, additive,
// no shell change needed). Every leaf in the mockup maps to a REAL existing route except four
// disclosed gaps (Buyer Inquiries, Project Portfolio, Mushok Challan, Notifications-as-a-page),
// which are SCAFFOLDED via `ImplementationPendingView` (the buyer BX-04 precedent) rather than
// fabricated. Mushok Challan specifically instruments the still-open `ESC-OPS-DOC-MUSHOK` gap
// (Bangladesh VAT documents, unmodeled in the frozen corpus) — the nav entry and its page both
// disclose this plainly rather than inventing a document kind.
//
// The mockup's own sidebar is a simplified subset of the real, already-shipped IA — same tension
// Team-2 hit on the buyer side at BX-04 ("4 already-shipped pages the mockup omitted... folded in,
// not dropped"). Every page real and reachable before this redesign (Leads & Pipeline, Engagements,
// Billing & Plan, Categories, Spec Library, Advertising) is folded into the closest matching mockup
// group rather than removed — none of FE-VEN-05..14's shipped pages become unreachable.
import type { NavItem, NavSection, QuickCreateItem, ShellViewModel } from "../shell";

/** Selling-surface URL prefix ([ESC-7G-A7] A7.2 Board-ratified; owner-chosen `/buy` + `/sell`). Vendor
 *  pages live under `app/(app)/(workspace)/sell/*`. */
const BASE = "/sell";

export const VENDOR_NAV: NavSection[] = [
  {
    id: "primary",
    items: [
      { label: "Dashboard", href: `${BASE}/dashboard`, icon: "dashboard" },
      { label: "RFQ Leads", href: `${BASE}/rfqs`, icon: "rfqs" },
      { label: "Leads & Pipeline", href: `${BASE}/leads`, icon: "pipeline" },
      { label: "Engagements", href: `${BASE}/engagements`, icon: "engagements" },
      { label: "Buyer Inquiries", href: `${BASE}/inquiries`, icon: "inquiries" },
    ],
  },
  {
    id: "showcase",
    items: [
      {
        label: "Digital Showcase",
        href: `${BASE}/company`,
        icon: "showcase",
        children: [
          { label: "Company Profile", href: `${BASE}/company` },
          { label: "Product Portfolio", href: `${BASE}/company/products` },
          { label: "Project Portfolio", href: `${BASE}/company/projects` },
          { label: "Categories", href: `${BASE}/company/categories` },
          { label: "Spec Library", href: `${BASE}/company/spec-library` },
          { label: "Microsite & Branding", href: `${BASE}/microsite` },
          { label: "Advertising", href: `${BASE}/microsite/ads` },
          // Same real destination as "Microsite & Branding" — that page hosts the actual
          // `live_url` external link; the vendor side never constructs a public slug URL itself.
          { label: "View Public Page", href: `${BASE}/microsite` },
        ],
      },
    ],
  },
  {
    id: "business-docs",
    items: [
      {
        label: "Business Docs",
        href: `${BASE}/documents`,
        icon: "documents",
        children: [
          { label: "Save PO", href: `${BASE}/documents?stage=po` },
          { label: "Delivery Challan", href: `${BASE}/documents?stage=challan` },
          { label: "Mushok Challan", href: `${BASE}/documents/mushok-challan` },
          { label: "Bill Generation", href: `${BASE}/documents` },
          { label: "Make Offer", href: `${BASE}/rfqs` },
          { label: "Saved Offers", href: `${BASE}/rfqs` },
        ],
      },
    ],
  },
  // Trust is a READ-ONLY governance signal (M5), NOT an editable vendor surface. It is kept in its
  // OWN discrete section — never folded among the editable `primary` leaves (RFQ Leads / Engagements)
  // — per `esc_registry.md:53` ("Trust read-only") and `vendor_planning_and_design.md:97`. This
  // additive extraction improves BOTH single-surface vendor rendering and the Hybrid co-mount, where
  // Trust is the always-terminal group ([ESC-7G-A7] realization). The vendor may only VIEW it.
  {
    id: "performance",
    label: "Trust",
    items: [{ label: "Profile Performance", href: `${BASE}/trust`, icon: "trust" }],
  },
  {
    id: "standing",
    items: [
      { label: "Notifications", href: `${BASE}/notifications`, icon: "notifications" },
      { label: "Billing & Plan", href: `${BASE}/billing`, icon: "billing" },
      { label: "Team", href: `${BASE}/organization`, icon: "team" },
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
  // VX-01: a plain link to the existing Products listing (the closest real search-capable surface)
  // — never a fabricated live-search box (per this field's own type comment, GI-12). `notifications`/
  // `unreadCount` deliberately left unset: no real notifications read is wired yet, and Inv #11
  // requires any badge to be non-disclosure-safe — an invented unread count would violate that.
  search: { placeholder: "Search products, leads, inquiries…", href: `${BASE}/company/products` },
};

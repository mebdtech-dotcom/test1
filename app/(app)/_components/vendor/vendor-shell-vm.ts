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
      // Cluster #1 merge (Team-1 build order F4 · closure record §2.2): the former colliding "RFQ
      // Leads" (this inbox) and "Leadboard" (`/sell/leads`, the same received invitations under a
      // private-CRM lens) are ONE surface now — the standalone Leadboard nav item is removed and its
      // board folds into `/sell/rfqs` as an Inbox ⇄ Pipeline `?view=` toggle (`/sell/leads`
      // 308-redirects there). `activeAcrossQuery` keeps this parent lit across its own `?view=`/
      // `?state=` variants while the documents-hub "Offers" deep-link keeps exact-match (F2).
      { label: "RFQs & Quotations", href: `${BASE}/rfqs`, icon: "rfqs", activeAcrossQuery: true },
      { label: "Engagements", href: `${BASE}/engagements`, icon: "engagements" },
      { label: "Finance", href: `${BASE}/finance`, icon: "reports" },
      { label: "Buyer Inquiries", href: `${BASE}/inquiries`, icon: "inquiries" },
      // VX-03 (owner directive 2026-07-17) — the design's Selling "Buyer CRM" surface. Private
      // per-vendor buyer relationship data (the sell-side mirror of the buyer's M4 Vendor CRM).
      // Terminology (Team-1 build order C4/C5 · closure record D4): the USER-FACING label is "Buyer
      // Relationships"; the internal domain term stays "Buyer CRM" (route path, component name, and
      // directory unchanged — no `BuyerRelationship` concept minted).
      { label: "Buyer Relationships", href: `${BASE}/buyer-relationships`, icon: "crm" },
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
        // VX-03 (owner directive 2026-07-17): aligned to the design's Business Docs sidebar —
        // Dashboard + Templates lead, followed by the per-type document views. Each leaf points at
        // a REAL route: Templates has its own page; the per-type entries deep-link the hub's
        // frozen stage filter (`?stage=`), and Offers reuse the RFQ workspace (a vendor's offer IS
        // its quotation — no separate offers store exists).
        children: [
          { label: "Dashboard", href: `${BASE}/documents` },
          { label: "Templates", href: `${BASE}/documents/templates` },
          { label: "Purchase Orders", href: `${BASE}/documents?stage=po` },
          { label: "Delivery Challans", href: `${BASE}/documents?stage=challan` },
          { label: "Mushok Challans", href: `${BASE}/documents/mushok-challan` },
          { label: "Bill Generation", href: `${BASE}/documents?stage=trade_invoice` },
          { label: "Offers", href: `${BASE}/rfqs?state=submitted` },
        ],
      },
    ],
  },
  // Trust is a READ-ONLY governance signal (M5), NOT an editable vendor surface. It is kept in its
  // OWN discrete section — never folded among the editable `primary` leaves (RFQs & Quotations /
  // Engagements)
  // — per `esc_registry.md:53` ("Trust read-only") and `vendor_planning_and_design.md:97`. This
  // additive extraction improves BOTH single-surface vendor rendering and the Hybrid co-mount, where
  // Trust is the always-terminal group ([ESC-7G-A7] realization). The vendor may only VIEW it.
  {
    id: "performance",
    label: "Trust",
    items: [{ label: "Profile Performance", href: `${BASE}/trust`, icon: "trust" }],
  },
  // Communication group (VX-03 — matches the design's "Communication" sidebar section: Messages,
  // Notifications, Support Tickets).
  {
    id: "communication",
    label: "Communication",
    items: [
      { label: "Messages", href: `${BASE}/messages`, icon: "messages" },
      { label: "Notifications", href: `${BASE}/notifications`, icon: "notifications" },
      { label: "Support Tickets", href: `${BASE}/support`, icon: "support" },
    ],
  },
  {
    id: "standing",
    items: [
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

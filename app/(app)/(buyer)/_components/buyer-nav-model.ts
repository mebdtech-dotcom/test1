// Buyer Workspace navigation CONFIG (Doc-7F §4.1) for the canonical Platform Shell.
//
// PRESENTATION nav structure only, expressed in the shell's own types (NavSection / NavItem) with
// serializable icon KEYS resolved by the shell NAV_ICONS registry. The authoritative navigable set is
// derived SERVER-SIDE from the resolved participation (Buyer/Hybrid) + org role, gated by entitlement/
// permission read via WIRED CONTRACTS — never name-strings (Inv #10). Hiding a link is convenience only;
// the server re-validates every action (Inv #7). This static config is the presentation default the
// shell renders until that server-derived gating is wired (GI-02; PARKED today).
//
// LOAD-BEARING ABSENCE: there is NO "invite / dispatch vendor" item anywhere — the engine dispatches
// invitations; the buyer never does (R6; carried `[ESC-7-7F-INVITE]`). "Vendor CRM" navigates into the
// buyer-private CRM section only; NO CRM status/flag is represented here (Inv #11).
//
// BX-04 (owner-directed 2026-07-03): the canonical Buyer IA, re-grouped Dashboard / Procurement /
// Marketplace / Communication / Analytics / Organization / Account. "RFQs" / "Quotations" / "Purchase
// Orders" are GROUP HEADERS (`children`, additive shell nav capability) — the header itself is not a
// link. `Draft Requests` / `Closed RFQs` filter the SAME `/rfqs` page via a real frozen Doc-4M state
// (`draft`; `Closed` = `closed_won ∪ closed_lost ∪ expired ∪ cancelled` — there is no single frozen
// "archived" state, so this reads "Closed RFQs" not "Archived RFQs"). Four previously-shipped,
// approved pages the mockup didn't name (Approvals P-BUY-12, Engagements P-BUY-19, Documents
// P-DOC-01, Vendor CRM P-BUY-26/27) are folded into the nearest matching group rather than dropped —
// removing a live, closed milestone's only nav entry would be a silent regression, not a redesign.
// Six items (Received Quotes, Compare Quotes, Active Orders, Order History, Saved Vendors,
// Specification Library, Messages, Reports & Analytics) have no frozen-corpus read behind them yet —
// each RESERVES its route via `ImplementationPendingView` (see each `page.tsx`'s own header comment
// for exactly what's missing) rather than a dead link or fabricated data.
//
// SHELL-PERSISTENCE BUG FIX (2026-07-03): Team/Organization/Profile/Settings/Notifications originally
// pointed at `/account/members|organization|profile|settings` and `/notifications` — all OUTSIDE the
// `(buyer)` route group, each with its OWN `layout.tsx` mounting a DIFFERENT `ShellViewModel` (a
// generic Account/shell nav, not `BUYER_NAV`), so every click was a real layout-tree remount
// (verified empirically with a DOM probe). Fixed the same way the Vendor track already fixed the
// identical problem (FE-VEN-10/11/12, composition-not-fork, Board-ruled Option B): new buyer-mounted
// pages (`(buyer)/team`, `/organization`, `/profile`, `/settings`) compose the EXISTING, UNMODIFIED
// Account view components (`MembersView`, `OrganizationProfile`, `UserProfileForm`,
// `SecuritySettings`, `NotificationPreferences`) inside the persistent Buyer shell; `/notifications`
// (a shared P-SH-02 page with zero non-buyer consumers, repo-wide grepped) was relocated bodily into
// `(buyer)/notifications/` at the SAME URL. The original `/account/*` routes are untouched — Account
// stays the canonical surface for anyone landing there directly; these are ADDITIONAL buyer-native
// entry points, not a fork.
import type { NavItem, NavSection, QuickCreateItem } from "../../_components/shell";

export const BUYER_NAV: NavSection[] = [
  { id: "overview", items: [{ label: "Dashboard", href: "/dashboard", icon: "dashboard" }] },
  {
    id: "procurement",
    label: "Procurement",
    items: [
      {
        label: "RFQs",
        href: "/rfqs",
        icon: "rfqs",
        children: [
          { label: "My RFQs", href: "/rfqs" },
          { label: "Draft Requests", href: "/rfqs?state=draft" },
          { label: "Closed RFQs", href: "/rfqs?state=closed" },
          { label: "Approvals", href: "/approvals" },
        ],
      },
      {
        label: "Quotations",
        href: "/quotations",
        icon: "quotations",
        children: [
          { label: "Received Quotes", href: "/quotations" },
          { label: "Compare Quotes", href: "/quotations/compare" },
        ],
      },
      {
        label: "Purchase Orders",
        href: "/purchase-orders",
        icon: "orders",
        children: [
          { label: "Active Orders", href: "/purchase-orders?status=active" },
          { label: "Order History", href: "/purchase-orders?status=history" },
          { label: "Engagements", href: "/engagements" },
        ],
      },
      // FE-DOC-01 (P-DOC-01): the cross-workspace Documents hub, buyer leg (page_inventory §12).
      { label: "Documents", href: "/documents", icon: "documents" },
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    items: [
      { label: "Vendor Directory", href: "/discover", icon: "discover" },
      { label: "Saved Vendors", href: "/saved-vendors", icon: "favorites" },
      { label: "Specification Library", href: "/spec-library", icon: "specLibrary" },
      // Buyer-private (Invariant #11) — never leaks a CRM status/flag anywhere else in this nav.
      { label: "Vendor CRM", href: "/crm", icon: "crm" },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    items: [
      { label: "Messages", href: "/messages", icon: "messages" },
      { label: "Notifications", href: "/notifications", icon: "notifications" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    items: [{ label: "Reports & Analytics", href: "/reports", icon: "reports" }],
  },
  {
    id: "organization",
    label: "Organization",
    items: [
      { label: "Team", href: "/team", icon: "team" },
      { label: "Organization", href: "/organization", icon: "org" },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { label: "Profile", href: "/profile", icon: "account" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

/** Buyer `+ Create` actions — each maps to a wired command when wired (New RFQ → `create_rfq`, Doc-5E §4). */
export const BUYER_QUICK_CREATE: QuickCreateItem[] = [
  { label: "New RFQ", href: "/rfqs/new", icon: "rfqs" },
];

/** Mobile quick-bar — a thumb-reach SUBSET of the Buyer nav. */
export const BUYER_QUICK_BAR: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "RFQs", href: "/rfqs", icon: "rfqs" },
  { label: "Approvals", href: "/approvals", icon: "approvals" },
  { label: "CRM", href: "/crm", icon: "crm" },
];

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
import type { NavItem, NavSection, QuickCreateItem } from "../../_components/shell";

/** The Buyer left-nav, grouped exactly per Doc-7F §4.1 (Overview · Sourcing · RFQs · Operations · Private). */
export const BUYER_NAV: NavSection[] = [
  { id: "overview", items: [{ label: "Dashboard", href: "/dashboard", icon: "dashboard" }] },
  {
    id: "sourcing",
    label: "Sourcing",
    items: [
      { label: "Discover", href: "/discover", icon: "discover" },
      { label: "Favorites", href: "/favorites", icon: "favorites" },
    ],
  },
  {
    id: "rfqs",
    label: "RFQs",
    items: [
      { label: "RFQs", href: "/rfqs", icon: "rfqs" },
      { label: "Approvals", href: "/approvals", icon: "approvals" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { label: "Engagements", href: "/engagements", icon: "engagements" },
      // FE-DOC-01 (P-DOC-01): the cross-workspace Documents hub, buyer leg (page_inventory §12).
      { label: "Documents", href: "/documents", icon: "documents" },
    ],
  },
  {
    id: "private",
    label: "Private",
    items: [{ label: "Vendor CRM", href: "/crm", icon: "crm" }],
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

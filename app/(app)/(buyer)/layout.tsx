// Buyer Workspace layout (Surface F · Doc-7F §4.1) — mounts the CANONICAL Platform Shell. The Buyer's
// bespoke shell (BuyerTopbar / BuyerSidebar / BuyerMobileNav) has been RETIRED in favour of <AppShell>:
// one shell, multiple workspaces. App Router composition only (REPOSITORY_STRUCTURE §8) — no business logic.
//
// PRESENTATION ONLY: the active-org/user identity is a NEUTRAL PLACEHOLDER until the Doc-7C server context
// layer is wired (`get_active_context`, SR3 — PARKED). No client-supplied org id is ever trusted (Inv #5).
// This `(buyer)` route group scopes the shell to buyer pages; Surface E (`/account`) sits OUTSIDE it.
import type { ReactNode } from "react";
import { AppShell, type ShellViewModel } from "../_components/shell";
import { BUYER_NAV, BUYER_QUICK_BAR, BUYER_QUICK_CREATE } from "./_components/buyer-nav-model";
import { BUYER_IDENTITY_SEED } from "./_components/identity-seed";
import { NOTIFICATIONS, UNREAD_COUNT } from "./notifications/notifications-seed";

const BUYER_SHELL_VM: ShellViewModel = {
  identity: {
    user: { name: BUYER_IDENTITY_SEED.userName, email: "" },
    activeOrg: { id: "active", name: BUYER_IDENTITY_SEED.orgName, participation: "buyer" },
    organizations: [{ id: "active", name: BUYER_IDENTITY_SEED.orgName, participation: "buyer" }],
  },
  nav: BUYER_NAV,
  quickCreate: BUYER_QUICK_CREATE,
  quickBar: BUYER_QUICK_BAR,
  // Discover doubles as the buyer's supplier/vendor search surface (`search_catalog`, Doc-4D §B) — a
  // legitimate destination, unlike a fabricated live-search box (GI-12). Presentation-only nav shortcut.
  search: { placeholder: "Search vendors, RFQs…", href: "/discover" },
  // BX-04 bug fix: the SAME seed the full `/notifications` page (relocated into this route group)
  // reads, so the topbar bell dropdown and the full page stay a single source, as before.
  notifications: NOTIFICATIONS,
  unreadCount: UNREAD_COUNT,
};

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={BUYER_SHELL_VM}>{children}</AppShell>;
}

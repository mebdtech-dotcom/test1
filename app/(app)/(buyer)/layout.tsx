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

const BUYER_SHELL_VM: ShellViewModel = {
  identity: {
    user: { name: "Your account", email: "" },
    activeOrg: { id: "active", name: "Active organization", participation: "buyer" },
    organizations: [{ id: "active", name: "Active organization", participation: "buyer" }],
  },
  nav: BUYER_NAV,
  quickCreate: BUYER_QUICK_CREATE,
  quickBar: BUYER_QUICK_BAR,
};

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={BUYER_SHELL_VM}>{children}</AppShell>;
}

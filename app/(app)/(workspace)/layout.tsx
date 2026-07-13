// Shared Buyer+Vendor workspace layout ([ESC-7G-A7] Board-ratified topology, A7.2 Option 1). ONE shell
// mounted ONCE for BOTH the Buying (`/buy/*`) and Selling (`/sell/*`) surfaces, so a Hybrid user crossing
// Buying↔Selling never remounts the shell (no lost sidebar state) — the canonical "one shell, multiple
// workspaces" realized as a single shared `(app)` layout group. Admin (`/admin`) and Account (`/account`)
// keep their own shells OUTSIDE this group. App Router composition only (REPOSITORY_STRUCTURE §8).
//
// The co-mounted nav is the seam-composed `HYBRID_SHELL_VM` (both surface sets, grouped-not-merged, Trust
// terminal). PRESENTATION ONLY: identity/participation are a fixture until the Doc-7C context layer is
// wired (`get_active_context`, SR3 — PARKED); production resolves the navigable surface set server-side
// from participation + role + entitlement (Inv #5/#10). No client-supplied org id is trusted (Inv #5).
import type { ReactNode } from "react";
import { AppShell, type ShellViewModel } from "../_components/shell";
import { HYBRID_SHELL_VM } from "../_components/hybrid/hybrid-shell-vm";
import { NOTIFICATIONS, UNREAD_COUNT } from "./buy/notifications/notifications-seed";

const WORKSPACE_SHELL_VM: ShellViewModel = {
  ...HYBRID_SHELL_VM,
  // BX-04: the SAME seed the full `/buy/notifications` page reads, so the topbar bell dropdown and the
  // full page stay a single source. Buyer-local because that seed lives in this route group.
  notifications: NOTIFICATIONS,
  unreadCount: UNREAD_COUNT,
};

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={WORKSPACE_SHELL_VM}>{children}</AppShell>;
}

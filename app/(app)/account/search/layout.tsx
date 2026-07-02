// Global search layout (P-SH-01 · Doc-7C Shared Authenticated Shell) — mounts the CANONICAL Platform
// Shell for the authenticated search results surface, scoped to `/account/search` ONLY. App Router
// composition only.
//
// PRESENTATION ONLY: identity/active-org is a presentation SEED (a wired build resolves it server-side via
// get_active_context — PARKED; Inv #5 client org id never trusted).
//
// SHELL PLACEMENT (flagged for Team-4): global search is a cross-surface shell page and its authoritative
// nav model + URL are not settled in the frozen corpus. The public catalog search already owns `/search`
// (app/(public)/search) — the two are distinct surfaces — so this authenticated global search mounts under
// the account/shell area at `/account/search` and reuses the existing ACCOUNT_NAV / ACCOUNT_QUICK_BAR
// view-model (least-invention; no nav model coined). Doc-7C may ultimately place it elsewhere — recorded as
// an OBS, not resolved here.
import type { ReactNode } from "react";
import { AppShell, type ShellViewModel } from "../../_components/shell";
import { ACCOUNT_NAV, ACCOUNT_QUICK_BAR } from "../overview/account-nav-model";

const SEARCH_SHELL_VM: ShellViewModel = {
  identity: {
    user: { name: "Anisur Rahman", email: "anisur@padmavalve.com.bd" },
    activeOrg: { id: "active", name: "Padma Valve & Fittings Ltd.", participation: "hybrid" },
    organizations: [{ id: "active", name: "Padma Valve & Fittings Ltd.", participation: "hybrid" }],
  },
  nav: ACCOUNT_NAV,
  quickBar: ACCOUNT_QUICK_BAR,
  breadcrumb: [{ label: "Account", href: "/account/overview" }, { label: "Search" }],
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={SEARCH_SHELL_VM}>{children}</AppShell>;
}

// Buyer profile settings layout (Surface E · Doc-7E · P-ACC-14) — mounts the CANONICAL Platform Shell
// for the bare `/account` route ONLY. A route group (`(index)`) scopes this layout to the index page
// so it does NOT wrap the sibling `/account/*` sub-routes (each already mounts its own copy via its own
// layout.tsx). App Router composition only — no business logic.
//
// PRESENTATION ONLY: identity/active-org is presentation SEED (a wired build resolves it server-side via
// get_active_context, SR3 — PARKED). No client-supplied org id is trusted (Inv #5). The Account nav is
// the SHARED account nav model (single source; also used by the overview hub), not a duplicated shell.
import type { ReactNode } from "react";
import { AppShell } from "../../_components/shell";
import { accountShellVm } from "../overview/account-nav-model";

const ACCOUNT_SHELL_VM = accountShellVm([
  { label: "Account", href: "/account/overview" },
  { label: "Buyer profile" },
]);

export default function AccountBuyerProfileLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={ACCOUNT_SHELL_VM}>{children}</AppShell>;
}

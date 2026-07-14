// Rewards & referrals layout (Surface E · Doc-7E · P-ACC-22) — mounts the CANONICAL Platform Shell for
// this Account & Identity page, scoped to `/account/rewards` ONLY. App Router composition only.
//
// PRESENTATION ONLY: identity/active-org is presentation SEED (a wired build resolves it server-side via
// get_active_context — PARKED). No client-supplied org id is trusted (Inv #5). Reuses the SHARED account
// nav model (single source).
import type { ReactNode } from "react";
import { AppShell } from "../../_components/shell";
import { accountShellVm } from "../overview/account-nav-model";

const ACCOUNT_SHELL_VM = accountShellVm([
  { label: "Account", href: "/account/overview" },
  { label: "Rewards" },
]);

export default function RewardsLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={ACCOUNT_SHELL_VM}>{children}</AppShell>;
}

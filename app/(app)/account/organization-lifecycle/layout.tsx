// Organization lifecycle layout (Surface E · Doc-7E · P-ACC-05) — mounts the CANONICAL Platform Shell
// for this Account & Identity sub-page, scoped to `/account/organization-lifecycle` ONLY (a sibling of
// `/account/organization`, so it does NOT double-wrap that page's shell). App Router composition only.
//
// PRESENTATION ONLY: identity/active-org is presentation SEED (a wired build resolves it server-side via
// get_active_context — PARKED). No client-supplied org id is trusted (Inv #5). Reuses the SHARED account
// nav model (single source). Breadcrumb links back to the Organization page.
import type { ReactNode } from "react";
import { AppShell } from "../../_components/shell";
import { accountShellVm } from "../overview/account-nav-model";

const ACCOUNT_SHELL_VM = accountShellVm([
  { label: "Account", href: "/account/overview" },
  { label: "Organization", href: "/account/organization" },
  { label: "Lifecycle" },
]);

export default function OrganizationLifecycleLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={ACCOUNT_SHELL_VM}>{children}</AppShell>;
}

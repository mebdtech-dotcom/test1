// Security & 2FA layout (Surface E · Doc-7E · P-ACC-03) — mounts the CANONICAL Platform Shell for the
// Account & Identity section, scoped to `/account/security` (and deeper) ONLY. App Router composition
// only. PRESENTATION ONLY: identity/active-org is presentation SEED (get_active_context — PARKED); no
// client-supplied org id is trusted (Inv #5). Reuses the SHARED account nav (single source).
import type { ReactNode } from "react";
import { AppShell } from "../../_components/shell";
import { accountShellVm } from "../overview/account-nav-model";

const ACCOUNT_SHELL_VM = accountShellVm([
  { label: "Account", href: "/account/overview" },
  { label: "Security" },
]);

export default function SecurityLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={ACCOUNT_SHELL_VM}>{children}</AppShell>;
}

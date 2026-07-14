// Account overview layout (Surface E · Doc-7E · P-ACC-01) — mounts the CANONICAL Platform Shell for the
// Account & Identity section. Scoped to `/account/overview` (and deeper) ONLY, so it does NOT wrap the
// sibling `/account` buyer-profile page (P-ACC-14). App Router composition only — no business logic.
//
// PRESENTATION ONLY: the identity/active-org is presentation SEED (a wired build resolves it server-side
// via `get_active_context`, SR3 — PARKED). No client-supplied org id is ever trusted (Inv #5). The
// org's participation is "hybrid" to exercise BOTH platform-participation facets on the overview
// (Buyer + Vendor) — distinct from the user's ORG ROLE (Owner); the two dimensions never conflate (Inv #2).
import type { ReactNode } from "react";
import { AppShell } from "../../_components/shell";
import { accountShellVm } from "./account-nav-model";

const ACCOUNT_SHELL_VM = accountShellVm([
  { label: "Account", href: "/account/overview" },
  { label: "Overview" },
]);

export default function AccountOverviewLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={ACCOUNT_SHELL_VM}>{children}</AppShell>;
}

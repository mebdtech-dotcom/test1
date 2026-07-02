// BillingTabs (FE-VEN-10, P-ACC-16..21 composition). Thin feature adapter over the shared
// WorkspaceTabs infrastructure (Milestone 8 pattern — mirrors CompanyProfileTabs exactly): it only
// maps five named section slots to tabs and owns no tab logic. Section contents are the EXISTING,
// UNMODIFIED Account components, server-rendered and passed in as props — composition only, never
// a fork (Board ruling 2026-07-03, `FE-VEN-14` report §9, Option B). RSC-friendly.
import type { ReactNode } from "react";
import { WorkspaceTabs } from "../shared";

export interface BillingTabsProps {
  plans: ReactNode;
  subscription: ReactNode;
  usage: ReactNode;
  leadCredits: ReactNode;
  invoices: ReactNode;
}

export function BillingTabs({
  plans,
  subscription,
  usage,
  leadCredits,
  invoices,
}: BillingTabsProps) {
  return (
    <WorkspaceTabs
      ariaLabel="Billing sections"
      tabs={[
        { value: "plans", label: "Plans", content: plans },
        { value: "subscription", label: "Subscription", content: subscription },
        { value: "usage", label: "Usage & quota", content: usage },
        { value: "lead-credits", label: "Lead credits", content: leadCredits },
        { value: "invoices", label: "Invoices", content: invoices },
      ]}
    />
  );
}

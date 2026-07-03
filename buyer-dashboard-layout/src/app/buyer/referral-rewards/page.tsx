import type { Metadata } from "next";
import { Copy, Gift, Share2 } from "lucide-react";

import { IvButton } from "@/components/iv/iv-button";
import { IvChip } from "@/components/iv/iv-chip";
import { IvMoney } from "@/components/iv/iv-money";
import { IvStat } from "@/components/iv/iv-stat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatusTone } from "../contracts";

import { BuyerShell } from "../components/buyer-shell";
import { mockBuyerDashboardAdapter } from "../mock-adapter";

export const metadata: Metadata = {
  title: "Referral Rewards — iVendorz",
  description: "Share your referral link and track rewards and history.",
};

// TODO(api): replace with caller-supplied data bound to the governed referral
// contract. The link, totals, and history rows are illustrative placeholders.
const referralLink = "https://ivendorz.com/r/ME-BD-TECH";

const sampleHistory: Array<{
  id: string;
  name: string;
  dateLabel: string;
  reward: { amount: string; currency: string };
  status: { label: string; tone: StatusTone };
}> = [
  {
    id: "r1",
    name: "Star Industries",
    dateLabel: "10 May 2024",
    reward: { amount: "1,000", currency: "BDT" },
    status: { label: "Credited", tone: "success" },
  },
  {
    id: "r2",
    name: "Delta Trading",
    dateLabel: "2 May 2024",
    reward: { amount: "1,000", currency: "BDT" },
    status: { label: "Pending", tone: "warning" },
  },
];

export default async function ReferralRewardsPage() {
  const shell = await mockBuyerDashboardAdapter.getShellContext();

  return (
    <BuyerShell
      title="Referral Rewards"
      description="Invite suppliers and buyers, then track your rewards and history."
      breadcrumbs={[{ label: "Buyer", href: "/buyer" }, { label: "Referral Rewards" }]}
      activeNavId="referral-rewards"
      user={shell.user}
      navBadges={shell.navBadges}
      notificationsLabel={shell.notificationsLabel}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IvStat label="Total invites" value="14" />
        <IvStat label="Successful referrals" value="6" />
        <IvStat label="Rewards earned" value={<IvMoney amount="6,000" currency="BDT" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your referral link</CardTitle>
          <CardDescription>
            Share this link; you earn rewards when invitees join and transact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius)] border border-border bg-muted px-3 py-2">
              <Gift className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate font-mono text-sm text-foreground">{referralLink}</span>
            </div>
            <div className="flex items-center gap-2">
              <IvButton size="sm" variant="secondary" className="gap-1.5">
                <Copy className="size-4" />
                Copy
              </IvButton>
              <IvButton size="sm" className="gap-1.5">
                <Share2 className="size-4" />
                Share
              </IvButton>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reward history</CardTitle>
          <CardDescription>Rewards from your past referrals.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {sampleHistory.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.dateLabel}</p>
              </div>
              <span className="text-sm font-medium text-foreground">
                <IvMoney amount={row.reward.amount} currency={row.reward.currency} />
              </span>
              <IvChip tone={row.status.tone}>{row.status.label}</IvChip>
            </div>
          ))}
        </CardContent>
      </Card>
    </BuyerShell>
  );
}

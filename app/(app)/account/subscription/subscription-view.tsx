"use client";

// Subscription — P-ACC-17 (Doc-7E · T-DETAILS). Client Component holding only ephemeral dialog state
// (Doc-7C §2.3). PRESENTATION-ONLY: cancelling shows an honest interim and changes nothing.
//
// FIELD DISCIPLINE (invent nothing):
//  • Reads map to the frozen `get_subscription` + `list_subscription_events` (BC-BILL-2, Doc-4I);
//    subscription status is the frozen §5.7 set (pending_payment / active / expired). Price shown with
//    the subscription's own currency (multi-currency-ready; BDT here).
//  • Entitlement usage is NUMERIC (Invariant #10 — never a plan-name check); the current plan is what the
//    entitlements resolve to, not a name gate. Plan ≠ financial tier.
//  • CANCEL maps to `cancel_subscription`: it sets `auto_renew = false` and does NOT immediately expire —
//    access continues to the period end (Doc-2 §5.7 / A-06). `purchase_subscription` continues in the
//    Plans catalog (P-ACC-16). The platform bills only its OWN subscription revenue (no buyer↔vendor
//    money).
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { StatusChip } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/primitives/dialog";

// Presentation seed (a wired build resolves these from get_subscription / list_subscription_events).
const SUB = {
  plan: "Growth",
  status: "active" as const,
  billingCycle: "Monthly",
  price: "8,000",
  currency: "BDT",
  periodEnd: "15 Aug 2026",
  autoRenew: true,
};

const USAGE = [
  { label: "Vendor seats", used: 8, total: 25 },
  { label: "Lead credits (this month)", used: 320, total: 500 },
  { label: "RFQs (this month)", used: 12, total: 50 },
];

// list_subscription_events — frozen event kinds (SubscriptionPurchased / SubscriptionRenewed).
const EVENTS = [
  { date: "15 Jul 2026", label: "Renewed", detail: "Growth · Monthly" },
  { date: "15 Jun 2026", label: "Renewed", detail: "Growth · Monthly" },
  { date: "15 Jan 2026", label: "Subscribed", detail: "Growth · Monthly" },
];

export function SubscriptionView({ empty }: { empty: boolean }) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  if (empty) {
    return (
      <EmptyState
        icon={<CheckCircle2 aria-hidden="true" />}
        title="No subscription"
        description="Your organization doesn't have an active subscription yet."
        action={
          <Button asChild>
            <Link href="/account/billing">Browse plans</Link>
          </Button>
        }
      />
    );
  }

  function onCancel() {
    // Presentation-only: nothing happens — honest interim.
    setCancelled(true);
    setCancelOpen(false);
  }

  return (
    <div className="max-w-3xl space-y-6">
      {cancelled ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Cancellation isn’t wired in this preview — nothing changed.</p>
        </div>
      ) : null}

      {/* Hero — current plan + status. */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{SUB.plan}</h2>
              <StatusChip label="Active" tone="success" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {SUB.currency} {SUB.price}
              <span className="text-sm font-normal text-muted-foreground"> / month</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {SUB.autoRenew
                ? `Renews on ${SUB.periodEnd}.`
                : `Active until ${SUB.periodEnd} — won't renew.`}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <Button asChild variant="outline">
              <Link href="/account/billing">Change plan</Link>
            </Button>
            {SUB.autoRenew ? (
              <Button type="button" variant="ghost" onClick={() => setCancelOpen(true)}>
                Cancel subscription
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Entitlement usage — numeric (Inv #10). */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            Usage this period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {USAGE.map((u) => {
            const pct = Math.min(100, Math.round((u.used / u.total) * 100));
            return (
              <div key={u.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{u.label}</span>
                  <span className="text-muted-foreground">
                    {u.used} / {u.total}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={u.used}
                  aria-valuemin={0}
                  aria-valuemax={u.total}
                  aria-label={u.label}
                >
                  <div
                    className="h-full rounded-full bg-iv-brand-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Events timeline. */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            Billing history
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {EVENTS.map((e, i) => (
              <li key={`${e.date}-${i}`} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1 size-2 shrink-0 rounded-full bg-iv-brand-600"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{e.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.detail} · {e.date}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Cancel confirm. */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel your subscription?</DialogTitle>
            <DialogDescription>
              Your <span className="font-semibold text-foreground">{SUB.plan}</span> plan stays
              active until <span className="font-semibold text-foreground">{SUB.periodEnd}</span>{" "}
              and won’t renew after that. You keep full access until then.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>
              Keep subscription
            </Button>
            <Button type="button" variant="destructive" onClick={onCancel}>
              Cancel subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

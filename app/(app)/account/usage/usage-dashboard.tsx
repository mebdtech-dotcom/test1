// Usage & quota dashboard — P-ACC-18 (Doc-7E · T-DASHBOARD). SERVER COMPONENT (read-only; no client
// state). PRESENTATION-ONLY.
//
// FIELD DISCIPLINE (invent nothing):
//  • Cards map to the frozen `get_usage` read (BC-BILL-3, Doc-4I): current consumption vs the org's
//    resolved entitlement limits. Every value is a NUMERIC or BOOLEAN/ENUM ENTITLEMENT — never a
//    plan-name check (Invariant #10; plan ≠ financial tier).
//  • Quota is an ENTITLEMENT limit only: BC-BILL-3 consumes entitlement truth and resolves none — a
//    quota NEVER influences RFQ matching, routing, eligibility, or awards (the procurement moat).
//  • Progress bars carry text values (used / limit + remaining), never colour alone.
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Badge } from "@/frontend/primitives/badge";
import { cn } from "@/frontend/lib/cn";

// Presentation seed (a wired build resolves these from get_usage + the resolved entitlements).
const CURRENT_PLAN = "Growth";
const PERIOD_RESET = "15 Aug 2026";

interface Quota {
  label: string;
  used: number;
  limit: number;
  resets: boolean;
}

const NUMERIC_QUOTAS: Quota[] = [
  { label: "Vendor seats", used: 8, limit: 25, resets: false },
  { label: "Lead credits", used: 320, limit: 500, resets: true },
  { label: "RFQs", used: 12, limit: 50, resets: true },
  { label: "Product listings", used: 34, limit: 100, resets: false },
];

interface Feature {
  label: string;
  included: boolean;
}

const FEATURES: Feature[] = [
  { label: "Public microsite", included: true },
  { label: "Priority support", included: false },
];

export function UsageDashboard() {
  return (
    <div className="space-y-6">
      {/* Billing indicator. */}
      <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          You’re on the <span className="font-medium text-foreground">{CURRENT_PLAN}</span> plan.
          Quotas reset on <span className="font-medium text-foreground">{PERIOD_RESET}</span>.
        </p>
        <Link
          href="/account/billing"
          className="inline-flex items-center gap-1 font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Manage plan
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {/* Numeric quota stat-cards. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {NUMERIC_QUOTAS.map((q) => {
          const pct = Math.min(100, Math.round((q.used / q.limit) * 100));
          const remaining = Math.max(0, q.limit - q.used);
          const near = pct >= 80;
          return (
            <Card key={q.label}>
              <CardContent className="p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{q.label}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-lg font-bold text-foreground">{q.used}</span> / {q.limit}
                  </p>
                </div>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={q.used}
                  aria-valuemin={0}
                  aria-valuemax={q.limit}
                  aria-label={`${q.label}: ${q.used} of ${q.limit} used`}
                >
                  <div
                    className={cn(
                      "h-full rounded-full",
                      near ? "bg-iv-warning-muted" : "bg-iv-brand-600",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {remaining} remaining{q.resets ? ` · resets ${PERIOD_RESET}` : ""}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Boolean / enum entitlements. */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            Plan features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-foreground">{f.label}</span>
                {f.included ? (
                  <Badge variant="success">Included</Badge>
                ) : (
                  <Badge variant="neutral">Not included</Badge>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>
          Quotas are entitlement limits for platform features. They never affect RFQ matching,
          routing, or awards.
        </p>
      </div>
    </div>
  );
}

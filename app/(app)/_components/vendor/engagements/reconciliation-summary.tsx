// Reconciliation summary (companion §13.3 M-1). A DERIVED display composition of the vendor's OWN
// off-platform records — Invoiced · Recorded · Confirmed · Outstanding — explicitly labelled "derived,
// off-platform records". It is NOT a count contract and NOT a stat-tile (Invariant 11): plain numeric
// text composed from already-read documents, never a wired aggregate. Renders nothing until values are
// provided. Presentation-only; RSC-friendly.
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import type { ReconciliationView } from "./types";

export interface ReconciliationSummaryProps {
  reconciliation?: ReconciliationView;
}

function Amount({ value, currency }: { value?: number; currency: string }) {
  return typeof value === "number" ? (
    <CurrencyDisplay amount={value} currency={currency} />
  ) : (
    <span className="text-muted-foreground">—</span>
  );
}

export function ReconciliationSummary({ reconciliation }: ReconciliationSummaryProps) {
  const currency = reconciliation?.currency ?? "BDT";

  return (
    <div className="rounded-md border border-border p-3 text-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Reconciliation
      </p>
      {/* Semantic label/value pairs — derived text, deliberately NOT a stat-tile (M-1 / Inv 11). */}
      <dl className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums">
        <div className="flex items-center gap-1">
          <dt className="text-muted-foreground">Invoiced</dt>
          <dd>
            <Amount value={reconciliation?.invoiced} currency={currency} />
          </dd>
        </div>
        <div className="flex items-center gap-1">
          <dt className="text-muted-foreground">Recorded</dt>
          <dd>
            <Amount value={reconciliation?.recorded} currency={currency} />
          </dd>
        </div>
        <div className="flex items-center gap-1">
          <dt className="text-muted-foreground">Confirmed</dt>
          <dd>
            <Amount value={reconciliation?.confirmed} currency={currency} />
          </dd>
        </div>
        <div className="flex items-center gap-1">
          <dt className="text-muted-foreground">Outstanding</dt>
          <dd>
            <Amount value={reconciliation?.outstanding} currency={currency} />
          </dd>
        </div>
      </dl>
      <p className="mt-1 text-xs text-muted-foreground">
        Derived from your own records — off-platform payments, not settlement.
      </p>
    </div>
  );
}

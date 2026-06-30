// PresentationFormNote — shared vendor atom (Milestone 8 — Shared Extraction Pass; promoted from
// vendor/company). Honest "presentation-only" note shown in the action row of vendor edit forms across
// the workspace (Company, Microsite, Catalog, RFQ, Leads, Engagements). No mock business logic exists
// in this build: controls render the current values, but saving and validation are wired in the
// integration phase. Render is unchanged from the pre-extraction component. RSC-friendly.
export function PresentationFormNote({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-xs text-muted-foreground"}>
      This form is presentation-only in the current build — saving and validation connect in the
      integration phase.
    </p>
  );
}

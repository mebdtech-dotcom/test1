import Link from "next/link";
import { Check, Minus, Info, X } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { VendorVerifiedBadge } from "../_components/microsite/vendor-verified-badge";
import { VENDORS } from "../_components/discovery/seed";
import { vendorHref } from "../_components/vendor-url";
import { cn } from "@/frontend/lib/cn";

// Public Compare route (`/compare`) — P-PUB-20 (Doc-7D Public surface · T-DETAILS; screen_specifications
// §P-PUB-20, journey J-GST-05). A SERVER COMPONENT in the `(public)` shell. ROUTING + COMPOSITION ONLY.
//
// FIELD DISCIPLINE + governance:
//  • UNGOVERNED discovery aid: a NEUTRAL side-by-side of PUBLIC vendors the visitor chose. It implies NO
//    matching, NO ranking, NO recommended "winner", and NO relevance/score (R6/R7). It is DISTINCT from
//    the governed RFQ comparison (P-BUY-15, /rfqs/[rfqId]/compare) and never touches the M3 engine. There
//    is no ordering-by-quality — columns appear in the order the visitor selected them.
//  • Reuses the shipped public discovery seed `VENDORS` (VendorCardVM shape) — coins NO vendor field. The
//    real per-visitor selection/compare read is deferred ([ESC-7-API]); selection is presentation-only via
//    the `?vendors=` param (server-recomputed add/remove/clear — no fabricated persistence).
//  • Verification is the BINARY public signal only (VendorVerifiedBadge) — absence renders as "no badge",
//    never a fabricated "unverified"/"pending" state, and NO trust/performance score, band, or tier appears
//    (firewall · non-disclosure). Capability is the four-flag matrix (Invariant #1), on/off by icon + text
//    (never colour-only). This page owns the single `<h1>`.
export const metadata = {
  title: "Compare vendors — iVendorz",
  description:
    "Put public suppliers side by side. A neutral discovery aid — no ranking, no recommendation.",
};

const MAX_COLUMNS = 4;

const CAPABILITY_ROWS = [
  { key: "can_supply", label: "Supply" },
  { key: "can_service", label: "Service" },
  { key: "can_fabricate", label: "Fabricate" },
  { key: "can_consult", label: "Consult" },
] as const;

function OnOff({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        on ? "text-iv-success-muted dark:text-iv-success-text" : "text-muted-foreground",
      )}
    >
      {on ? (
        <Check aria-hidden="true" className="size-4" />
      ) : (
        <Minus aria-hidden="true" className="size-4" />
      )}
      {on ? "Yes" : "No"}
    </span>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ vendors?: string }>;
}) {
  const { vendors } = await searchParams;
  const requested = (vendors ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Resolve against the public seed, de-duped, in selection order, capped.
  const selectedSlugs: string[] = [];
  for (const slug of requested) {
    if (!selectedSlugs.includes(slug) && VENDORS.some((v) => v.slug === slug)) {
      selectedSlugs.push(slug);
    }
    if (selectedSlugs.length >= MAX_COLUMNS) break;
  }
  const selected = selectedSlugs.map((slug) => VENDORS.find((v) => v.slug === slug)!);

  const hrefWithout = (slug: string) => {
    const rest = selectedSlugs.filter((s) => s !== slug);
    return rest.length ? `/compare?vendors=${rest.join(",")}` : "/compare";
  };

  return (
    <>
      {/* Intro. */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-12 sm:px-6 sm:py-14">
          <h1 className="text-3xl font-extrabold tracking-tight text-iv-ink-heading sm:text-4xl">
            Compare vendors
          </h1>
          <p className="mt-3 max-w-2xl text-iv-ink-secondary">
            Put suppliers side by side to weigh them yourself. This is a neutral discovery aid —
            iVendorz doesn’t rank vendors, recommend a winner, or score them here.
          </p>
        </div>
      </section>

      <section className="bg-muted/30">
        <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-10 sm:px-6">
          {selected.length === 0 ? (
            <EmptyState
              title="Add items to compare"
              description="Pick suppliers from the directory to see them side by side."
              action={
                <Button asChild>
                  <Link href="/vendors">Browse the directory</Link>
                </Button>
              }
            />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Comparing {selected.length} of up to {MAX_COLUMNS} suppliers.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/vendors">Add more</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/compare">Clear</Link>
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-md border border-border bg-card">
                <table className="w-full min-w-[40rem] border-collapse text-sm">
                  <caption className="sr-only">
                    Side-by-side comparison of selected suppliers
                  </caption>
                  <thead>
                    <tr className="border-b border-border">
                      <th
                        scope="col"
                        className="w-40 px-4 py-3 text-left font-medium text-muted-foreground"
                      >
                        <span className="sr-only">Attribute</span>
                      </th>
                      {selected.map((v) => (
                        <th key={v.slug} scope="col" className="px-4 py-3 text-left align-top">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={vendorHref(v.slug)}
                              className="font-semibold text-foreground underline-offset-2 hover:underline"
                            >
                              {v.name}
                            </Link>
                            <Link
                              href={hrefWithout(v.slug)}
                              aria-label={`Remove ${v.name} from comparison`}
                              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <X aria-hidden="true" className="size-4" />
                            </Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <th
                        scope="row"
                        className="px-4 py-3 text-left font-medium text-muted-foreground"
                      >
                        Category
                      </th>
                      {selected.map((v) => (
                        <td key={v.slug} className="px-4 py-3 text-foreground">
                          {v.category}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border">
                      <th
                        scope="row"
                        className="px-4 py-3 text-left font-medium text-muted-foreground"
                      >
                        Location
                      </th>
                      {selected.map((v) => (
                        <td key={v.slug} className="px-4 py-3 text-muted-foreground">
                          {v.location ?? "—"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border">
                      <th
                        scope="row"
                        className="px-4 py-3 text-left font-medium text-muted-foreground"
                      >
                        Verification
                      </th>
                      {selected.map((v) => (
                        <td key={v.slug} className="px-4 py-3">
                          {v.verified ? (
                            <VendorVerifiedBadge verified />
                          ) : (
                            <span
                              className="text-muted-foreground"
                              aria-label="No verification badge"
                            >
                              —
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                    {CAPABILITY_ROWS.map((row) => (
                      <tr key={row.key} className="border-b border-border last:border-0">
                        <th
                          scope="row"
                          className="px-4 py-3 text-left font-medium text-muted-foreground"
                        >
                          {row.label}
                        </th>
                        {selected.map((v) => (
                          <td key={v.slug} className="px-4 py-3">
                            <OnOff on={Boolean(v.capability?.[row.key])} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="mt-6 flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              This is a discovery aid, not the RFQ comparison. It never ranks suppliers or picks a
              winner — awarding happens inside a governed RFQ, on your explicit decision.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

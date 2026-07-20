// Vendor Workspace — Buyer Relationships (design plan v0.2 gate-4 PRESENTATION BUILD,
// owner-authorized 2026-07-19 — "no change required, implement it"). VX-03: this governed page
// renders the honest pre-wiring state; the populated target is the approved mockup, mounted only
// when reads land.
//
// AUTHORITY (all folded 2026-07-19): domain = Doc-2 v1.0.9 (PATCH-D2-08, Vendor Buyer Relationship
// aggregate); contracts = Doc-4F BC-OPS-6 (PATCH-4F-BCOPS6-01, 9 contracts); event payload =
// PATCH-4E-VIP-01. Design = governanceReviews/Buyer_Relationships_Design_Plan_v0.2.md (FROZEN by
// owner sign-off at gate 3). Route = Amendment A1: canonical `/sell/buyer-relationships` (+ detail
// `[relationshipId]`); `/sell/buyer-crm` is a 308 redirect source only.
//
// TERMINOLOGY (D4 two-register split): user-facing "Buyer Relationships"; internal domain term stays
// "Buyer CRM" (this component `BuyerCrmView` + its directory) — no `BuyerRelationship` type minted.
//
// PRE-WIRING RULES (binding, from the frozen design plan §6–§8):
//  • KPI band = the four ruled own-facts (Buyers · Awarded customers · RFQs received · Engagements),
//    adapter-supplied at wiring (`ops.get_buyer_relationship_summary.v1`) — "—" until then; never
//    client-computed (R7).
//  • Stage renders NOTHING pre-wiring (no fake disabled select); provenance has NO edit path ever.
//  • Buyer-name search is honestly disabled until the ESC-IDN-ORG-DISPLAY-LABEL seam folds — never
//    simulated client-side (Board ruling; gates name resolution/search ONLY).
//  • Import stays plain-disabled ("Import controls are not yet available") until the import contract
//    + its POLICY keys exist; Add buyer disabled until `ops.create_buyer_relationship.v1` is wired.
//  • The canonical empty copy below is byte-stable — one owner, never duplicated.
// Server Component; no hooks, no fetch (Content ≠ Presentation).
import { Users, Search, Upload, UserPlus, Info } from "lucide-react";
import { PageHeader } from "../../shell";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { EmptyState } from "@/frontend/components/empty-state";
import { VendorKpiStatCard } from "../dashboard/vendor-kpi-stat-card";

// The four ruled summary own-facts (Doc-4F BC-OPS-6 §F16.5 pinned semantics) — labels/captions per
// the frozen design plan; values arrive only from the wired summary read.
const KPI_TILES = [
  { label: "Buyers", caption: "In your private relationship list" },
  { label: "Awarded customers", caption: "Evidenced by awarded engagement history" },
  { label: "RFQs received", caption: "Distinct RFQs from these buyers" },
  { label: "Engagements", caption: "Awarded work, lifetime" },
];

export function BuyerCrmView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer Relationships"
        description="Your private relationship record for the buyers you work with — evidence builds automatically from verified interactions; the stage is yours to manage."
        actions={
          <div className="flex gap-2">
            {/* Plain-disabled until the governed import contract exists (no alarm glyphs — D4). */}
            <Button variant="outline" disabled title="Import controls are not yet available.">
              <Upload aria-hidden className="size-4" />
              Import
            </Button>
            {/* Disabled until ops.create_buyer_relationship.v1 is wired (manual channel, D2). */}
            <Button disabled>
              <UserPlus aria-hidden className="size-4" />
              Add buyer
            </Button>
          </div>
        }
      />

      {/* Wiring disclosure — the model and contracts are ruled and folded; the reads are not yet
          implemented. Honest placeholder posture per VX-03. */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-iv-info-subtle p-4 text-sm text-iv-info-muted">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        <p>
          Buyer Relationships is your private, per-vendor record — the sell-side companion to the
          buyer&apos;s Vendor CRM. Its contracts are approved and it will populate automatically
          once live reads are connected; until then the tiles show placeholders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_TILES.map((k) => (
          <VendorKpiStatCard key={k.label} label={k.label} caption={k.caption} />
        ))}
      </div>

      <Card className="overflow-hidden">
        {/* Toolbar — structure per the frozen design; every control honestly disabled pre-wiring.
            Search additionally gates on the Identity display-label seam (never client-simulated). */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <div className="relative w-full sm:w-64">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder="Search buyer name"
              aria-label="Search buyer name"
              className="pl-8"
              disabled
            />
          </div>
          <Button type="button" variant="outline" size="sm" disabled>
            Evidence: All
          </Button>
          <Button type="button" variant="outline" size="sm" disabled>
            Stage: All
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">Sorted by last interaction</span>
        </div>
        {/* Canonical empty state — byte-stable, component-owned. */}
        <EmptyState
          icon={<Users aria-hidden />}
          title="No buyers yet"
          description="Buyers you engage with through RFQs and orders will appear here as private relationship records."
          className="py-12"
        />
      </Card>
    </div>
  );
}

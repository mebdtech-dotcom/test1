// Vendor Workspace — Buyer Relationships (VX-03, owner directive 2026-07-17). PRESENTATION-ONLY SHELL.
//
// TERMINOLOGY (Team-1 build order C4/C5 · closure record D4 — two-register split): the USER-FACING
// label is "Buyer Relationships" (page title, nav, copy, empty states); the INTERNAL domain term stays
// "Buyer CRM" (this component `BuyerCrmView`, its directory, and the `/sell/buyer-crm` route). This is a
// PRESENTATION rename only — NO `BuyerRelationship` domain concept, type, or entity is minted.
//
// GOVERNANCE — RULED at documentation level (closure record §3 D2/D4, 2026-07-19); wiring still gated:
//  • OWNERSHIP settled: this surface is M4-Operations-owned (an unfrozen concept now reserved under
//    M4). It is the sell-side companion to the buyer's frozen M4 "Vendor CRM" and holds PRIVATE per-
//    vendor relationship data. CRM data NEVER mutates platform-wide scores (§4 firewall; §3 M4 note).
//  • SEEDING CHANNELS (D2, five, indicative until the Doc-4F patch): manual vendor entry · RFQ
//    participation · awarded engagement · conversation participation (contact tier only) · imported
//    private contacts (strict controls). PROVENANCE LADDER (max-over-history, monotone):
//    MANUAL_OR_IMPORTED < CONVERSATION < RFQ_PARTICIPATION < ENGAGEMENT < AWARDED_CUSTOMER — tokens
//    INDICATIVE until minted in the Doc-4F patch. PROVENANCE ≠ STAGE: provenance evidences the
//    relationship (strongest verified source ever observed); the vendor-controlled STAGE manages it.
//  • PRIVACY FLOOR (non-negotiable): a record renders only vendor-authored data + facts the vendor
//    holds through its OWN participation; buyer-side private decisions (blacklist — Inv #11) stay
//    undetectable, symmetrically. Stage labels speak in private-CRM voice, never platform award status.
//  • RENDERS NOTHING NEW (Team-1 C6, this phase = documentation level only): no tier UI, no provenance
//    vocabulary in visible copy beyond the ruled labels; KPI tiles stay the neutral "—" (VX-03). The
//    status-filter tabs + row-detail drawer + Log-activity modal mount only once the Doc-4F contract
//    is patched and a read is wired. This surface stays UNWIRED and non-implementable beyond this rename.
// Server Component; no hooks, no fetch (Content ≠ Presentation).
import { Users, Pencil, Info } from "lucide-react";
import { PageHeader } from "../../shell";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { VendorKpiStatCard } from "../dashboard/vendor-kpi-stat-card";

// Neutral, non-count-coining tile labels — each renders "—" until the CRM read is wired and the
// governance ruling (above) confirms what may be shown.
const KPI_TILES = [
  { label: "Buyers", caption: "In your private relationship list" },
  { label: "Active", caption: "Relationships you're currently working" },
  { label: "RFQs received", caption: "Invitations from these buyers" },
  { label: "Engagements", caption: "Awarded work in progress" },
];

export function BuyerCrmView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer Relationships"
        description="Your private relationship record for the buyers you work with — separate from public marketplace data."
        actions={
          // Disabled until the CRM write command is wired (the Log-activity modal mounts then).
          <Button disabled>
            <Pencil aria-hidden className="size-4" />
            Log activity
          </Button>
        }
      />

      {/* Unwired disclosure — the concept is now ruled/reserved under M4 (closure record D2/D4) but
          no read is wired yet; keeps VX-03's honest placeholders. No new tier vocabulary (C6). */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-iv-info-subtle p-4 text-sm text-iv-info-muted">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        <p>
          Buyer Relationships is your private, per-vendor record — the sell-side companion to the
          buyer&apos;s Vendor CRM. It&apos;s not wired to live data yet, so the tiles below show
          placeholders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_TILES.map((k) => (
          <VendorKpiStatCard key={k.label} label={k.label} caption={k.caption} />
        ))}
      </div>

      <Card className="p-2">
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

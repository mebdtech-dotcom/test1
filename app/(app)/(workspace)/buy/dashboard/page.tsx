// P-BUY-01 Buyer Dashboard route (Doc-7F §9.1 · `T-DASHBOARD`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
//
// PRESENTATION-ONLY: the buyer dashboard binds M3/M4 reads that are NOT wired today (the GI-02 server data
// layer is PARKED until the M3/M4 backends land — Wave 4/5). The SEED below is a presentation fixture so
// the enterprise procurement dashboard renders for review; it is replaced by the mapped wired reads at
// integration. Passing `data={null}` still renders the spec's first-run "Create RFQ" state (§9.1).
//
// WIRING SEAM (later milestone): resolve the view-model SERVER-SIDE via the wired reads — dashboard KPI
// reads · `list_rfqs` (+ state facets for the sourcing pipeline) · `list_engagements` (+ state facets for
// the engagement pipeline, FE-BUY-08 — a separate aggregate from the "needing action" queue below, never
// derived by counting it) · `list_quotations_for_rfq` · audit-activity read — streaming each widget behind
// its own Suspense boundary with a scoped error-state (§9.1 / GI-05). The browser never calls a Doc-5
// contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3). Every figure is a wired read,
// never client-computed (R7).

import { BuyerDashboardView } from "./dashboard-view";
import { BUYER_IDENTITY_SEED } from "../_components/identity-seed";
import type { BuyerDashboardViewModel } from "../_components/view-models";

export const metadata = {
  title: "Dashboard",
};

// Presentation fixture — a representative industrial-procurement workspace. Every figure here stands in for
// a wired read (KPI reads, list_rfqs state facets, list_quotations_for_rfq, list_engagements, audit reads);
// none is client-computed. Counts carry no excluded/blacklist figure (Inv #11).
const SEED: BuyerDashboardViewModel = {
  kpis: {
    spend: { amount: 18450000, currency: "BDT" },
    activeRfqCount: 12,
    awaitingMyApprovalCount: 3,
    winRate: 0.42,
  },
  rfqPipeline: [
    { state: "draft", count: 4 },
    { state: "submitted", count: 3 },
    { state: "matching", count: 2 },
    { state: "quotations_received", count: 5 },
    { state: "buyer_reviewing", count: 2 },
    { state: "closed_won", count: 8 },
  ],
  engagementPipeline: [
    { state: "open", count: 2 },
    { state: "in_delivery", count: 3 },
    { state: "completed", count: 5 },
    { state: "closed", count: 1 },
  ],
  rfqQueue: [
    {
      id: "rfq-1",
      humanRef: "RFQ-2026-000123",
      title: "Boiler feed-water pumps — supply & install",
      state: "quotations_received",
      value: { amount: 2750000, currency: "BDT" },
      updatedAt: "2026-06-30T14:40:00+06:00",
    },
    {
      id: "rfq-2",
      humanRef: "RFQ-2026-000119",
      title: "MS plate 12mm — 40 MT",
      state: "buyer_reviewing",
      value: { amount: 4200000, currency: "BDT" },
      updatedAt: "2026-06-29T10:05:00+06:00",
    },
    {
      id: "rfq-3",
      humanRef: "RFQ-2026-000117",
      title: "VFD drives 75kW — commissioning",
      state: "matching",
      value: { amount: 1650000, currency: "BDT" },
      updatedAt: "2026-06-28T16:20:00+06:00",
    },
  ],
  quotationQueue: [
    {
      id: "q-1",
      rfqId: "rfq-1",
      vendorName: "Meghna Industrial Supplies Ltd.",
      state: "submitted",
      amount: { amount: 2695000, currency: "BDT" },
      validUntil: "2026-07-15T00:00:00+06:00",
    },
    {
      id: "q-2",
      rfqId: "rfq-1",
      vendorName: "Padma Engineering Works",
      state: "submitted",
      amount: { amount: 2810000, currency: "BDT" },
      validUntil: "2026-07-10T00:00:00+06:00",
    },
  ],
  engagementQueue: [
    {
      id: "eng-1",
      humanRef: "ENG-2026-000044",
      vendorName: "Karnaphuli Steel Traders",
      state: "in_delivery",
      value: { amount: 4200000, currency: "BDT" },
      updatedAt: "2026-06-30T09:00:00+06:00",
    },
    {
      id: "eng-2",
      humanRef: "ENG-2026-000039",
      vendorName: "Meghna Industrial Supplies Ltd.",
      state: "open",
      value: { amount: 980000, currency: "BDT" },
      updatedAt: "2026-06-27T12:30:00+06:00",
    },
  ],
  recentActivity: [
    {
      id: "a-1",
      label: "Quotation received on RFQ-2026-000123",
      at: "2026-06-30T14:40:00+06:00",
      href: "/buy/rfqs/rfq-1",
    },
    {
      id: "a-2",
      label: "RFQ-2026-000119 moved to review",
      at: "2026-06-29T10:05:00+06:00",
      href: "/buy/rfqs/rfq-2",
    },
    {
      id: "a-3",
      label: "Delivery recorded on ENG-2026-000044",
      at: "2026-06-30T09:00:00+06:00",
      href: "/buy/engagements/eng-1",
    },
  ],
};

export default function BuyerDashboardPage() {
  return (
    <BuyerDashboardView
      data={SEED}
      identity={{ userName: BUYER_IDENTITY_SEED.userName, orgName: BUYER_IDENTITY_SEED.orgName }}
    />
  );
}

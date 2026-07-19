// Vendor Workspace — P-DOC-02 Documents hub PRESENTATION (FE-DOC-02). Pure function of its
// view-model (Server Component; no hooks, no fetch — Content ≠ Presentation, Inv #9). Vendor mirror
// of the buyer hub ((buyer)/documents/documents-hub-view.tsx) — same shared-home composition, same
// adjudicated constraints (MAJOR-01/MINOR-01/MINOR-02 from `FE-DOC-01`'s WP card bind identically
// here; no new adjudication round).
//
// REUSE: shell `PageHeader`; the shared DOCUMENTS HOME (`_components/documents` — LifecycleStrip,
// DocumentCollection, DocumentActions, DocumentRelations, DocumentProcessTimeline,
// RecentlyOpenedStrip, PrintButton, icon map); vendor's own `EngagementStatusChip` /
// `TradeInvoiceStatusChip` / `MoneyBoundaryBanner` (`_components/vendor/engagements`) — never the
// buyer's state-display maps; `Ref`/`Money`/`formatDate` from the promoted kit
// `@/frontend/components/format` (NOT the buyer's private re-export shim); kit
// `SearchBar`/`FilterSidebar`/`EmptyState`/`StatusChip`/`PaginationControl`/`Button`.
// NEVER imports `(buyer)/*` (workspace boundary — the buyer hub's own inverse rule).
//
// NO vendor `DataListTable` equivalent exists (the buyer's is buyer-private, pre-FE-SH-01) — §1
// renders as a local row-list composition (à la `EngagementList`'s pattern) honoring
// `document-table-spec.ts`'s column-priority intent via responsive classes, not a table element.
//
// GOVERNANCE (mirrors WP fe-doc-01, applies identically to this vendor leg):
//  • LifecycleStrip = NAVIGATION, NOT STATE (MAJOR-01) — no per-engagement stage/progress cue.
//  • §2 rows are PLAIN NAVIGATION to the ONE real engagement detail page (unlike the buyer leg's
//    six fixed per-kind routes — the vendor `EngagementDocuments` doc-kind tabs are
//    enumeration-build-blocked, `ESC-7G-ENG-03`, and live inside that one page) — no existence
//    claims, no fabricated per-kind routes.
//  • No counts/KPI tiles (client-computed counts violate R7).
//  • DF-6: records only, never funds — rendered via the vendor's own `MoneyBoundaryBanner`.
//  • Vendor has NO "RFQ internal approvals" concept (that is a buyer-internal gate) — the pending
//    view here shows attention-status trade invoices only, with no approvals-callout link (never
//    fabricate a destination that doesn't exist for this workspace).

import Link from "next/link";
import {
  Download,
  FilePlus2,
  Briefcase,
  Upload,
  FileText,
  Truck,
  ReceiptText,
  FilePen,
} from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { SearchBar } from "@/frontend/components/search-bar";
import { FilterSidebar, type FilterFacetGroup } from "@/frontend/components/filter-sidebar";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { Ref, Money, formatDate } from "@/frontend/components/format";
import { PageHeader } from "../../shell";
import {
  LifecycleStrip,
  DocumentCollection,
  DocumentActions,
  DocumentRelations,
  DocumentProcessTimeline,
  RecentlyOpenedStrip,
  PrintButton,
  documentIcon,
} from "../../documents";
import { EngagementStatusChip } from "../engagements/engagement-status-chip";
import { TradeInvoiceStatusChip } from "../engagements/document-status-chip";
import { MoneyBoundaryBanner } from "../engagements/money-boundary-banner";
import {
  generatedDocKindLabel,
  type DocumentsHubData,
  type DocumentsHubView as HubView,
} from "./documents-hub-view-models";

const BASE = "/sell";

// UNLIKE the buyer leg (which has six fixed per-kind document routes — P-BUY-21..25 + the LOI
// face of P-BUY-21, WP-1), the vendor
// engagement track has NO per-kind sub-routes — `EngagementDocuments`'s doc-kind tabs are
// enumeration-build-blocked (`ESC-7G-ENG-03`) and live entirely inside the one engagement detail
// page (`/sell/engagements/[id]`). Linking to fabricated per-kind routes here would be a real
// dead-link defect (Inv #11) — every per-engagement reference in this hub points at that one real
// page instead. This is a genuine route-topology difference from the buyer hub, not an omission.

const GeneratedDocIcon = documentIcon("generated");

// VX-03 quick-create grid (owner directive 2026-07-17, matching the design's Business Docs
// "Quick create" block). Each tile is REAL NAVIGATION to the relevant document surface — never a
// fabricated create command (no write is wired; the vendor's offer IS its quotation, so "New
// offer" routes to the RFQ workspace's draft view). No counts, no fabricated rows.
const QUICK_CREATE: {
  key: string;
  label: string;
  description: string;
  href: string;
  Icon: typeof FileText;
}[] = [
  {
    key: "offer",
    label: "New offer",
    description: "Quote against an invitation",
    href: `${BASE}/rfqs?state=draft`,
    Icon: FileText,
  },
  {
    key: "challan",
    label: "Delivery challan",
    description: "Record a dispatch",
    href: `${BASE}/documents?stage=challan`,
    Icon: Truck,
  },
  {
    key: "bill",
    label: "Bill / invoice",
    description: "Generate a trade bill",
    href: `${BASE}/documents?stage=trade_invoice`,
    Icon: ReceiptText,
  },
  {
    key: "template",
    label: "New template",
    description: "Branded document layout",
    href: `${BASE}/documents/templates`,
    Icon: FilePen,
  },
];

function QuickCreateGrid() {
  return (
    <section aria-labelledby="quick-create-heading" className="flex flex-col gap-3">
      <h2 id="quick-create-heading" className="text-sm font-semibold text-foreground">
        Quick create
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_CREATE.map(({ key, label, description, href, Icon }) => (
          <Link
            key={key}
            href={href}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-iv-brand-400 hover:bg-muted/50"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-iv-brand-50 text-iv-brand-600">
              <Icon aria-hidden className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">{label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const VIEW_CHIPS: { key: HubView | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "received", label: "Received" },
  { key: "sent", label: "Sent" },
  { key: "pending", label: "Pending approval" },
  { key: "completed", label: "Completed" },
];

// Facet groups for the kit FilterSidebar — INERT presentation checkboxes over frozen vocab + seed
// values (no wiring; live faceting binds later). NO "Project" facet (`ESC-OPS-DOC-FEATURES`).
const FACETS: FilterFacetGroup[] = [
  {
    heading: "Document type",
    options: [
      { label: "LOI" },
      { label: "Purchase Order" },
      { label: "Challan" },
      { label: "Work Completion Certificate" },
      { label: "Trade Invoice" },
      { label: "Payment Record" },
      { label: "Quotation" },
      { label: "Generated document" },
    ],
  },
  {
    heading: "Status",
    options: [
      { label: "Open" },
      { label: "In delivery" },
      { label: "Completed" },
      { label: "Closed" },
      { label: "Issued" },
      { label: "Partially paid" },
      { label: "Paid" },
      { label: "Disputed" },
      { label: "Recorded" },
      { label: "Confirmed" },
    ],
  },
  {
    heading: "Counterparty",
    options: [{ label: "bp_4a71c9" }, { label: "bp_9e02f5" }],
  },
  {
    heading: "Issued",
    options: [{ label: "Last 30 days" }, { label: "This quarter" }, { label: "This year" }],
  },
  {
    heading: "Amount",
    options: [
      { label: "Under 1,000,000" },
      { label: "1,000,000 – 5,000,000" },
      { label: "Over 5,000,000" },
    ],
  },
];

function ViewChips({ active }: { active?: HubView }) {
  return (
    <nav aria-label="Filter documents by view" className="flex flex-wrap items-center gap-2">
      {VIEW_CHIPS.map((chip) => {
        const isAll = chip.key === "all";
        const isActive = isAll ? !active : active === chip.key;
        return (
          <Button
            key={chip.key}
            asChild
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
            aria-current={isActive ? "page" : undefined}
          >
            <Link href={isAll ? `${BASE}/documents` : `${BASE}/documents?view=${chip.key}`}>
              {chip.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

export function DocumentsHubView({ data }: { data: DocumentsHubData }) {
  const { active_view, active_stage, query } = data;
  const isRefined = Boolean(active_view || active_stage || query);
  const clearFilters = (
    <Button asChild variant="secondary" size="sm">
      <Link href={`${BASE}/documents`}>Clear filters</Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Every procurement document in one place — from RFQ to payment. Rows link to the owning record; nothing is duplicated."
        actions={
          // FE-DOC-03 cross-links (disclosed touch of P-DOC-02) — navigation only. "Import PO"
          // (design's Business Docs header action) is presentation-only until the M8 VendorImport
          // command is wired — disabled, never faked.
          <>
            <Button variant="outline" size="sm" disabled>
              <Upload aria-hidden className="size-4" />
              Import PO
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/sell/documents/templates">Templates</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/sell/documents/generated">Generated documents</Link>
            </Button>
          </>
        }
      />

      <QuickCreateGrid />

      <div className="flex flex-col gap-4">
        {/* MAJOR-01 — the six-stage flow as a permanent FILTER strip (navigation, not state). */}
        <LifecycleStrip basePath={`${BASE}/documents`} activeStage={active_stage} />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchBar
            action={`${BASE}/documents`}
            defaultQuery={query ?? ""}
            label="Filter documents by reference"
            placeholder="Filter by ref — e.g. INV-2026-000045…"
            className="lg:max-w-md"
          />
          <div className="flex items-center gap-2">
            <PrintButton />
          </div>
        </div>

        <ViewChips active={active_view} />
        <RecentlyOpenedStrip items={data.recently_opened} />

        <div className="flex flex-col gap-4 lg:flex-row">
          <details className="group shrink-0 lg:w-56">
            <summary className="cursor-pointer select-none rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground">
              Filters
            </summary>
            <div className="mt-2 rounded-md border border-border bg-card p-3">
              <FilterSidebar facets={FACETS} label="Filter documents" />
            </div>
          </details>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {/* §1 — BC-OPS-4 generated documents (local row-list — no vendor DataListTable exists). */}
            <DocumentCollection
              id="generated-documents"
              title="Generated documents"
              description="Documents rendered by the platform's template engine (storage-backed, versioned)."
              toolbar={
                <>
                  <Button variant="outline" size="sm" disabled>
                    <FilePlus2 aria-hidden className="size-4" />
                    Generate document
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Download aria-hidden className="size-4" />
                    Bulk download
                  </Button>
                </>
              }
            >
              {data.generated.length === 0 ? (
                isRefined ? (
                  <EmptyState
                    title="No documents match the current filters"
                    description="Nothing in the generated-documents set matches this stage, view, or refine text."
                    action={clearFilters}
                    className="py-10"
                  />
                ) : (
                  <EmptyState
                    icon={<GeneratedDocIcon aria-hidden />}
                    title="No generated documents yet"
                    description="Documents generated from templates will appear here."
                    className="py-10"
                  />
                )
              ) : (
                <>
                  <Card>
                    <CardContent className="p-0">
                      <ul className="divide-y divide-border">
                        {data.generated.map((g) => {
                          const Icon = documentIcon(g.doc_kind);
                          return (
                            <li key={g.id} className="flex items-start gap-3 p-3">
                              <Icon
                                aria-hidden
                                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Ref>{g.human_ref}</Ref>
                                  <span className="text-sm text-foreground">
                                    {generatedDocKindLabel(g.doc_kind)}
                                  </span>
                                  <StatusChip
                                    label={g.direction === "received" ? "Received" : "Sent"}
                                    tone="neutral"
                                  />
                                  {g.sharing_revoked ? (
                                    <span className="text-2xs text-muted-foreground">
                                      Sharing revoked
                                    </span>
                                  ) : null}
                                </div>
                                <div className="mt-1 hidden flex-wrap gap-x-3 text-xs text-muted-foreground sm:flex">
                                  <span>v{g.version_no}</span>
                                  {g.counterparty_ref ? <Ref>{g.counterparty_ref}</Ref> : null}
                                  <span>{formatDate(g.issued_at)}</span>
                                  {g.source_engagement_id ? (
                                    <Link
                                      href={`${BASE}/engagements/${g.source_engagement_id}`}
                                      className="underline-offset-2 hover:underline"
                                    >
                                      <Ref>{g.source_ref}</Ref>
                                    </Link>
                                  ) : null}
                                </div>
                              </div>
                              <DocumentActions documentName={g.human_ref} artifact={g.artifact} />
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                  <PaginationControl hasMore={false} className="mt-3" />
                </>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Actions are presentation-only until backend wiring lands — generation runs as an
                async job and sharing uses counterparty grants.
              </p>
            </DocumentCollection>

            {/* §2 — engagement document records (link to the one real engagement detail page;
                timeline restates facts). UNLIKE the buyer leg, the vendor track has no per-kind
                document sub-routes — see this file's own header for the full disclosure. */}
            <DocumentCollection
              id="engagement-documents"
              title={active_view === "pending" ? "Needs attention" : "Engagement document records"}
              description={
                active_view === "pending"
                  ? "Trade invoices in an attention status."
                  : "Per-engagement records — LOI, purchase order, challan, trade invoice, payments, and WCC live on each engagement's Documents tab."
              }
            >
              {active_view === "pending" ? (
                data.pending_invoices.length === 0 ? (
                  <EmptyState
                    title="No documents match the current filters"
                    description="No trade invoices are in an attention status right now."
                    action={clearFilters}
                    className="py-10"
                  />
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <ul className="divide-y divide-border">
                        {data.pending_invoices.map((p) => (
                          <li key={p.human_ref}>
                            <Link
                              href={`${BASE}/engagements/${p.engagement_id}`}
                              className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-accent"
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Ref>{p.human_ref}</Ref>
                                  <TradeInvoiceStatusChip status={p.status} />
                                </div>
                                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                                  <Ref>{p.engagement_ref}</Ref>
                                  {p.due_date ? <span>Due {formatDate(p.due_date)}</span> : null}
                                </div>
                              </div>
                              <Money value={p.amount} />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              ) : data.engagements.length === 0 ? (
                isRefined ? (
                  <EmptyState
                    title="No documents match the current filters"
                    description="No engagements match this view or refine text."
                    action={clearFilters}
                    className="py-10"
                  />
                ) : (
                  <EmptyState
                    icon={<Briefcase aria-hidden />}
                    title="No engagement documents yet"
                    description="They appear after a buyer awards one of your quotations."
                    className="py-10"
                  />
                )
              ) : (
                <ul className="flex flex-col gap-3">
                  {data.engagements.map((e) => (
                    <li key={e.id} className="rounded-md border border-border p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`${BASE}/engagements/${e.id}`}
                          className="font-medium underline-offset-2 hover:underline"
                        >
                          <Ref>{e.human_ref}</Ref>
                        </Link>
                        <EngagementStatusChip status={e.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        LOI/PO/challan/WCC/trade invoice/payment records live on{" "}
                        <Link
                          href={`${BASE}/engagements/${e.id}`}
                          className="underline underline-offset-2"
                        >
                          this engagement&apos;s Documents tab
                        </Link>{" "}
                        — vendor per-kind document routes are not split out (unlike the buyer leg).
                      </p>
                      {e.timeline.length > 0 ? (
                        <details className="mt-2">
                          <summary className="cursor-pointer select-none text-xs font-medium text-muted-foreground">
                            Process timeline
                          </summary>
                          <DocumentProcessTimeline
                            label={`Document timeline for ${e.human_ref}`}
                            entries={e.timeline}
                            className="mt-2"
                          />
                        </details>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              {active_view === "completed" ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Showing completed and closed engagements only.{" "}
                  <Link
                    href={`${BASE}/engagements?status=completed`}
                    className="underline underline-offset-2"
                  >
                    Open the engagements list
                  </Link>
                </p>
              ) : null}
            </DocumentCollection>

            {/* DF-6 money boundary — the vendor's own banner, not a new Callout copy. */}
            <MoneyBoundaryBanner />

            {/* §3 — sourcing documents (vendor framing: RFQs + Leads & Pipeline, no "approvals"
                concept — vendors don't run an internal RFQ-approval gate). */}
            <DocumentCollection
              id="sourcing-documents"
              title="Sourcing documents"
              description="RFQs and quotations are managed in your RFQ workspace — these links open the owning pages."
            >
              <DocumentRelations
                label="Sourcing document links"
                links={[
                  // Real navigation only — no fixture deep-link (owner directive 2026-07-17: no
                  // demo data; the former "Quotation QTN-…" chip pointed at a deleted fixture id).
                  // Note for a future quotation deep-link: the vendor route is
                  // `/rfqs/[rfqId]/quotation` (singular — one own quotation per RFQ), never the
                  // buyer's `/rfqs/[rfqId]/quotations/[quotationId]` shape (Review-B catch).
                  { id: "rfqs", label: "RFQs & Quotations", href: `${BASE}/rfqs`, kindKey: "rfq" },
                  {
                    // Cluster #1 merge (Team-1 F1/F4): the Leadboard folded into the RFQ workspace;
                    // this link now opens the Pipeline lens (retired label + repointed href).
                    id: "leads",
                    label: "Pipeline",
                    href: `${BASE}/rfqs?view=board`,
                    kindKey: "rfq",
                  },
                ]}
              />
            </DocumentCollection>

            {/* §4 — platform invoices (M7): visually separated, link-out only (DF-6). */}
            <Card>
              <CardContent className="flex flex-col gap-2 p-4">
                <h2 className="text-sm font-semibold">Platform invoices</h2>
                <p className="text-xs text-muted-foreground">
                  iVendorz subscription and service fees — separate from your trade documents
                  (platform billing, not buyer↔vendor commerce).
                </p>
                <div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/account/invoices">Open platform invoices</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

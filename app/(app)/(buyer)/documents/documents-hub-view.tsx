// P-DOC-01 Buyer Documents hub — PRESENTATION (`T-LISTING`, FE-DOC-01). Pure function of its
// view-model (Server Component; no hooks, no fetch — Content ≠ Presentation, Inv #9). The server
// page composes the frozen module-owned mocks and passes them here.
//
// REUSE: shell `PageHeader`; the shared DOCUMENTS HOME (`_components/documents` — LifecycleStrip,
// DocumentCollection, DocumentActions, DocumentRelations, DocumentProcessTimeline,
// RecentlyOpenedStrip, PrintButton, icon map, column-model spec); buyer `DataListTable` (the
// packet-documented FE-SH-01 fallback — same-surface reuse, never a new table copy), `Ref`,
// `Money`, `formatDate`, `Callout`, `engagementStateDisplay`/`tradeInvoiceStatusDisplay`; kit
// `SearchBar`/`FilterSidebar`/`EmptyState`/`StatusChip`/`PaginationControl`/`Button`.
// NEVER imports `_components/vendor/*` (workspace boundary).
//
// GOVERNANCE (WP fe-doc-01):
//  • LifecycleStrip = NAVIGATION, NOT STATE (MAJOR-01) — no per-engagement stage/progress cue.
//  • §2 rows are PLAIN NAVIGATION to the five fixed document routes (P-BUY-21..25) — no
//    existence claims (ESC-7G-ENG-03; the FE-BUY-07 caption MAJOR); the destination owns absence.
//  • Frozen labels only: state chips via the buyer state-display maps; doc-kind labels via the
//    as-projected-string map; direction is the documented presentation derivation.
//  • No counts/KPI tiles (client-computed counts violate R7). Cursor pagination per the shared
//    column-model spec (GI-03; wires later). Facets are the kit's INERT presentation checkboxes.
//  • DF-6: records only, never funds; platform invoices (M7) visually separated, link-out only.
//  • "Pending approval" = the frozen RFQ internal approval gate + invoice attention pointers —
//    post-award documents have NO approval workflow and none is implied.

import Link from "next/link";
import { Download, Banknote, FilePlus2, Briefcase } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { SearchBar } from "@/frontend/components/search-bar";
import { FilterSidebar, type FilterFacetGroup } from "@/frontend/components/filter-sidebar";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { PageHeader } from "../../_components/shell";
import {
  LifecycleStrip,
  DocumentCollection,
  DocumentActions,
  DocumentRelations,
  DocumentProcessTimeline,
  RecentlyOpenedStrip,
  PrintButton,
  documentIcon,
  type DocumentStageKey,
  type RelatedDocumentLink,
} from "../../_components/documents";
import { DataListTable, type DataColumn } from "../_components/data-list-table";
import { Ref, Money, formatDate } from "../_components/format";
import { Callout } from "../_components/callout";
import { engagementStateDisplay, tradeInvoiceStatusDisplay } from "../_components/state-display";
import {
  generatedDocKindLabel,
  type DocumentsHubData,
  type DocumentsHubView as HubView,
  type GeneratedDocumentRow,
  type HubEngagementRow,
  type TradeInvoicePointer,
} from "../_components/documents-hub-view-models";

// ——— §1 Generated documents — columns per the shared column-model spec (`document-table-spec.ts`:
// sort issued_at DESC seeded, cursor/25 wires later; ≤sm folds version/issued/source/counterparty,
// keeps ref/kind/direction/file). Rows have no detail route until FE-DOC-03 (P-DOC-06) — no links.
const GENERATED_COLUMNS: DataColumn<GeneratedDocumentRow>[] = [
  { key: "ref", header: "Ref", render: (g) => <Ref>{g.humanRef}</Ref> },
  {
    key: "kind",
    header: "Kind",
    render: (g) => {
      const Icon = documentIcon(g.docKind);
      return (
        <span className="inline-flex items-center gap-1.5">
          <Icon aria-hidden className="size-4 text-muted-foreground" />
          {generatedDocKindLabel(g.docKind)}
        </span>
      );
    },
  },
  {
    key: "direction",
    header: "Direction",
    render: (g) => (
      <span className="inline-flex flex-col gap-0.5">
        <StatusChip label={g.direction === "received" ? "Received" : "Sent"} tone="neutral" />
        {g.sharingRevoked ? (
          <span className="text-2xs text-muted-foreground">Sharing revoked</span>
        ) : null}
      </span>
    ),
  },
  { key: "version", header: "Version", hideOnMobile: true, render: (g) => <>v{g.versionNo}</> },
  {
    key: "counterparty",
    header: "Counterparty",
    hideOnMobile: true,
    // Opaque ref only — M4 reads project no counterparty name (P-BUY-20 precedent); coining one is forbidden.
    render: (g) => (g.counterpartyRef ? <Ref>{g.counterpartyRef}</Ref> : <>—</>),
  },
  {
    key: "issued",
    header: "Issued",
    hideOnMobile: true,
    render: (g) => <>{formatDate(g.issuedAt)}</>,
  },
  {
    key: "source",
    header: "Source",
    hideOnMobile: true,
    render: (g) =>
      g.sourceEngagementId ? (
        <Link
          href={`/engagements/${g.sourceEngagementId}`}
          className="underline-offset-2 hover:underline"
        >
          <Ref>{g.sourceRef}</Ref>
        </Link>
      ) : (
        <>—</>
      ),
  },
  {
    key: "file",
    header: "File",
    numeric: true,
    render: (g) => <DocumentActions documentName={g.humanRef} artifact={g.artifact} />,
  },
];

const PENDING_INVOICE_COLUMNS: DataColumn<TradeInvoicePointer>[] = [
  { key: "ref", header: "Trade invoice", render: (p) => <Ref>{p.humanRef}</Ref> },
  {
    key: "status",
    header: "Status",
    render: (p) => {
      const s = tradeInvoiceStatusDisplay(p.status);
      return <StatusChip label={s.label} tone={s.tone} />;
    },
  },
  {
    key: "engagement",
    header: "Engagement",
    hideOnMobile: true,
    render: (p) => <Ref>{p.engagementRef}</Ref>,
  },
  {
    key: "due",
    header: "Due",
    hideOnMobile: true,
    render: (p) => (p.dueDate ? <>{formatDate(p.dueDate)}</> : <>—</>),
  },
  { key: "amount", header: "Amount", numeric: true, render: (p) => <Money value={p.amount} /> },
];

// The five fixed per-engagement document routes (P-BUY-21..25) — plain navigation, the FE-BUY-07
// pattern. `stage` narrows the cluster to the selected kind (a filter, never an existence claim).
function engagementDocLinks(e: HubEngagementRow, stage?: DocumentStageKey): RelatedDocumentLink[] {
  const all: (RelatedDocumentLink & { stageKey?: DocumentStageKey })[] = [
    {
      id: "po",
      label: "Purchase order",
      href: `/engagements/${e.id}/po`,
      kindKey: "po",
      stageKey: "po",
    },
    {
      id: "challan",
      label: "Challan",
      href: `/engagements/${e.id}/challan`,
      kindKey: "challan",
      stageKey: "challan",
    },
    {
      id: "invoice",
      label: "Trade invoice",
      href: `/engagements/${e.id}/trade-invoice`,
      kindKey: "trade_invoice",
      stageKey: "trade_invoice",
    },
    {
      id: "payments",
      label: "Payments",
      href: `/engagements/${e.id}/payments`,
      kindKey: "payment_record",
      stageKey: "payment",
    },
    { id: "wcc", label: "WCC", href: `/engagements/${e.id}/wcc`, kindKey: "wcc" },
  ];
  const narrowed = stage ? all.filter((l) => l.stageKey === stage) : all;
  return (narrowed.length > 0 ? narrowed : all).map((l) => ({
    id: l.id,
    label: l.label,
    href: l.href,
    kindKey: l.kindKey,
  }));
}

// Doc-kind iconography resolves ONLY via the shared map (NIT-03) — incl. this empty-state icon.
const GeneratedDocIcon = documentIcon("generated");

const VIEW_CHIPS: { key: HubView | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "received", label: "Received" },
  { key: "sent", label: "Sent" },
  // The frozen RFQ internal-approval gate + invoice attention — post-award docs have NO approvals.
  { key: "pending", label: "Pending approval" },
  { key: "completed", label: "Completed" },
];

// Facet groups for the kit FilterSidebar — INERT presentation checkboxes over frozen vocab + seed
// values (no wiring; live faceting binds later). NO "Project" facet: no frozen document↔project
// linkage exists (`ESC-OPS-DOC-FEATURES`).
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
    options: [{ label: "vp_8f2a1c" }, { label: "vp_3b90d7" }, { label: "vp_c14e55" }],
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
            <Link href={isAll ? "/documents" : `/documents?view=${chip.key}`}>{chip.label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}

export function DocumentsHubView({ data }: { data: DocumentsHubData }) {
  const { activeView, activeStage, query } = data;
  const isRefined = Boolean(activeView || activeStage || query);
  const clearFilters = (
    <Button asChild variant="secondary" size="sm">
      <Link href="/documents">Clear filters</Link>
    </Button>
  );

  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <PageHeader
        title="Documents"
        description="Every procurement document in one place — from RFQ to payment. Rows link to the owning record; nothing is duplicated."
      />

      <div className="mt-4 flex flex-col gap-4">
        {/* MAJOR-01 — the six-stage flow as a permanent FILTER strip (navigation, not state). */}
        <LifecycleStrip basePath="/documents" activeStage={activeStage} />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* `?q=` refines the loaded rows (see the route header) — scoped label, no global-search claim. */}
          <SearchBar
            action="/documents"
            defaultQuery={query ?? ""}
            label="Filter documents by reference"
            placeholder="Filter by ref — e.g. INV-2026-000045…"
            className="lg:max-w-md"
          />
          <div className="flex items-center gap-2">
            <PrintButton />
          </div>
        </div>

        <ViewChips active={activeView} />
        <RecentlyOpenedStrip items={data.recentlyOpened} />

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* MINOR-02 (R1) — the facet sidebar, COLLAPSED initially (native disclosure; inert kit facets). */}
          <details className="group shrink-0 lg:w-56">
            <summary className="cursor-pointer select-none rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground">
              Filters
            </summary>
            <div className="mt-2 rounded-md border border-border bg-card p-3">
              <FilterSidebar facets={FACETS} label="Filter documents" />
            </div>
          </details>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {/* §1 — BC-OPS-4 generated documents. */}
            <DocumentCollection
              id="generated-documents"
              title="Generated documents"
              description="Documents rendered by the platform's template engine (storage-backed, versioned)."
              toolbar={
                <>
                  {/* Visibility matrix: Generate + bulk download are DISABLED (presentation-only). */}
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
                  <DataListTable
                    caption="Generated documents"
                    columns={GENERATED_COLUMNS}
                    rows={data.generated}
                    getRowKey={(g) => g.id}
                    emptyState={<EmptyState title="No documents match" className="py-8" />}
                  />
                  {/* Cursor pagination per the shared spec (25/page); the cursor wires later (GI-03). */}
                  <PaginationControl hasMore={false} className="mt-3" />
                </>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Actions are presentation-only until backend wiring lands — generation runs as an
                async job and sharing uses counterparty grants.
              </p>
            </DocumentCollection>

            {/* §2 — engagement document records (links to the five fixed routes; timeline restates facts). */}
            <DocumentCollection
              id="engagement-documents"
              title={activeView === "pending" ? "Needs attention" : "Engagement document records"}
              description={
                activeView === "pending"
                  ? "Trade invoices in an attention status, plus the RFQ internal approval queue."
                  : "Per-engagement records — LOI, purchase order, challan, trade invoice, payments, and WCC live on their own pages."
              }
            >
              {activeView === "pending" ? (
                <div className="flex flex-col gap-3">
                  {data.pendingInvoices.length === 0 ? (
                    <EmptyState
                      title="No documents match the current filters"
                      description="No trade invoices are in an attention status right now."
                      action={clearFilters}
                      className="py-10"
                    />
                  ) : (
                    <DataListTable
                      caption="Trade invoices awaiting action"
                      columns={PENDING_INVOICE_COLUMNS}
                      rows={data.pendingInvoices}
                      getRowKey={(p) => p.humanRef}
                      getRowHref={(p) => `/engagements/${p.engagementId}/trade-invoice`}
                      emptyState={<EmptyState title="No invoices match" className="py-8" />}
                    />
                  )}
                  {/* The ONLY frozen approval workflow is the RFQ internal gate — never "document approvals". */}
                  <Callout icon={<Briefcase aria-hidden />}>
                    Looking for approvals? RFQ internal approvals live in their own queue.{" "}
                    <Link href="/approvals" className="font-medium underline underline-offset-2">
                      Go to RFQ internal approvals
                    </Link>
                  </Callout>
                </div>
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
                    description="They appear after an RFQ award creates an engagement."
                    className="py-10"
                  />
                )
              ) : (
                <ul className="flex flex-col gap-3">
                  {data.engagements.map((e) => {
                    const s = engagementStateDisplay(e.state);
                    return (
                      <li key={e.id} className="rounded-md border border-border p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/engagements/${e.id}`}
                            className="font-medium underline-offset-2 hover:underline"
                          >
                            <Ref>{e.humanRef}</Ref>
                          </Link>
                          <StatusChip label={s.label} tone={s.tone} />
                        </div>
                        <DocumentRelations
                          label={`Documents for ${e.humanRef}`}
                          links={engagementDocLinks(e, activeStage)}
                          className="mt-2"
                        />
                        {/* MINOR-03 — expandable per-engagement process timeline (restated seeded facts). */}
                        {e.timeline.length > 0 ? (
                          <details className="mt-2">
                            <summary className="cursor-pointer select-none text-xs font-medium text-muted-foreground">
                              Process timeline
                            </summary>
                            <DocumentProcessTimeline
                              label={`Document timeline for ${e.humanRef}`}
                              entries={e.timeline}
                              className="mt-2"
                            />
                          </details>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
              {activeView === "completed" ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Showing completed and closed engagements only.{" "}
                  <Link
                    href="/engagements?status=completed"
                    className="underline underline-offset-2"
                  >
                    Open the engagements list
                  </Link>
                </p>
              ) : null}
            </DocumentCollection>

            {/* DF-6 money boundary — adjacent to the financial rows. */}
            <Callout icon={<Banknote aria-hidden />}>
              Records only — the platform never holds or moves funds between buyer and vendor.
              Invoices and payment records document amounts settled off-platform.
            </Callout>

            {/* §3 — sourcing documents (M3): deep links only. */}
            <DocumentCollection
              id="sourcing-documents"
              title="Sourcing documents"
              description="RFQs and quotations are managed in the RFQ workspace — these links open the owning pages."
            >
              <DocumentRelations
                label="Sourcing document links"
                links={[
                  { id: "rfqs", label: "RFQs", href: "/rfqs", kindKey: "rfq" },
                  {
                    id: "approvals",
                    label: "RFQ internal approvals",
                    href: "/approvals",
                    kindKey: "rfq",
                  },
                  {
                    id: "quotation",
                    label: "Quotation QTN-2026-000456",
                    href: "/rfqs/rfq_01/quotations/q_1",
                    kindKey: "quotation",
                  },
                  {
                    id: "comparison",
                    label: "Comparison statement (RFQ-2026-000123)",
                    href: "/rfqs/rfq_01/compare",
                    kindKey: "quotation",
                  },
                ]}
              />
              {/* R6 — the comparison is System-generated and never recommends a vendor. */}
              <p className="mt-2 text-xs text-muted-foreground">
                Comparison statements are System-generated and never recommend a vendor.
              </p>
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

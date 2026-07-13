// P-BUY-14 Buyer Quotation detail (`T-DETAILS`, Doc-7F §3.1/§4.2 · planning → PI §13). One DISCLOSED
// quotation, in full, read-only. PRESENTATION-ONLY: a pure function of its view-model (Server Component;
// no hooks/fetch/mutation — Content ≠ Presentation, Inv #9). The route page resolves the quotation via
// the wired `rfq.get_quotation.v1` (Doc-4E §E7.5, GI-02) — PARKED until the M3 backend lands (Wave 4).
//
// REUSE: the canonical platform-shell `PageHeader` + `Breadcrumbs`; the shared buyer `DescriptionList`,
// `DataListTable` (price lines), `ActivityTimeline` (version history), `KpiStatCard` (headline commercial
// facts, BX-03/FE-BUY-04 — the P-BUY-01 dashboard pattern), and `Money`/`Ref`/`formatDate`/`formatInstant`;
// the kit `Card`/`StatusChip`/`EmptyState`/`FileLink`. NO new shared component is coined.
//
// GOVERNANCE (load-bearing):
//  • READ-ONLY — there is NO Compare / Select-winner / Award / Reject / Shortlist / Clarify COMPOSER
//    here (no message/mutation affordance is added or invented). Those are later, audit-gated milestones
//    (R6 / Inv #12); this surface decides and mutates nothing. The header's "Ask a clarification" action
//    (BX-03/FE-BUY-04) is pure NAVIGATION to the existing read-only P-BUY-16 Clarifications host — it
//    sends nothing and mounts no composer; the thread itself stays the Board-ruled M6 placeholder.
//  • VISIBILITY-GATED — `get_quotation` collapses an out-of-`quotation_visibility` id to NOT_FOUND
//    server-side (§7.5). `data === null` renders a byte-identical not-found (no copy/layout/timing tell;
//    Inv #11 / GI-12). The not-found breadcrumb shows only the `RFQs` ancestor — never a leaf ref.
//  • SEALED-UNTIL-CLOSE — when `sealedUntilClose` (Doc-3 §10.1 / §12.2 `abuse.sealed_until_close`, server
//    POLICY), the buyer projection omits price + protected commercial terms; the UI EXPLAINS the redaction
//    ("sealed until window close") so an absent price never reads as the vendor under-quoting.
//  • NON-PENALIZING — `not_selected`/`withdrawn` render uniformly via `quotationStateDisplay` (Doc-3
//    §8.3/§9.5); a vendor never learns it "lost". Versions are immutable (Inv #8) — the timeline is history.

import Link from "next/link";
import { FileText, Lock, MessageSquare, Paperclip } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { FileLink } from "@/frontend/components/file-link";
import { PageHeader, Breadcrumbs } from "../../../../../../_components/shell";
import { ActivityTimeline } from "../../../../_components/activity-timeline";
import { DataListTable, type DataColumn } from "../../../../_components/data-list-table";
import { DescriptionList, type DescriptionItem } from "../../../../_components/description-list";
import { KpiStatCard } from "../../../../_components/kpi-stat-card";
import { Money, Ref, formatDate, formatInstant } from "../../../../_components/format";
import { quotationStateDisplay } from "../../../../_components/state-display";
import { SealedMarker } from "../../../../_components/sealed-marker";
import { Callout } from "../../../../_components/callout";
import type {
  QuotationDetailData,
  QuotationPriceLine,
  QuotationPricing,
  QuotationTermRow,
  QuotationAttachment,
} from "../../../../_components/quotation-view-models";

/** A neutral, EXPLAINED notice for content the server sealed until the quotation window closes (anti-farming,
 *  Doc-3 §10.1 / §12.2). It frames the absence as a deliberate, time-bound redaction — never a vendor
 *  deficiency. Card-neutral copy: the SERVER decides which fields (price + protected commercial terms) it
 *  omits while the window is open; the presentation explains any such seal-driven absence wherever it lands. */
function SealedNotice() {
  return (
    <Callout icon={<Lock aria-hidden />}>
      Sealed until the quotation window closes — this becomes visible once the window has closed.
    </Callout>
  );
}

const PRICE_COLUMNS: DataColumn<QuotationPriceLine>[] = [
  {
    key: "item",
    header: "Item",
    render: (l) => (
      <span className="flex flex-col">
        <span className="truncate text-foreground">{l.label}</span>
        {l.note ? <span className="text-xs text-muted-foreground">{l.note}</span> : null}
      </span>
    ),
  },
  { key: "amount", header: "Amount", numeric: true, render: (l) => <Money value={l.amount} /> },
];

/** Price breakdown (`price_breakdown` projection). Sealed-aware; the total is the CONTRACT figure, never
 *  client-summed (R7 firewall / GI-12). */
function PricingCard({ pricing, sealed }: { pricing?: QuotationPricing | null; sealed?: boolean }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">Price breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {sealed ? (
          <div className="p-4">
            <SealedNotice />
          </div>
        ) : !pricing || pricing.lines.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No pricing provided" className="py-8" />
          </div>
        ) : (
          <>
            {/* The outer guard above already handles the empty/sealed cases, so DataListTable here always
                has rows; `emptyState` is required by the component but unreachable on this path. */}
            <DataListTable
              caption="Price breakdown"
              columns={PRICE_COLUMNS}
              rows={pricing.lines}
              getRowKey={(l) => l.id ?? l.label}
              emptyState={null}
              stickyFirstColumn
            />
            {pricing.total ? (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  <Money value={pricing.total} />
                </span>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Shared "terms" card — a titled `DescriptionList` of generic label/value rows. SEALED-AWARE: when the
 *  RFQ cell is sealed and the window is open, the server OMITS price + protected commercial terms from the
 *  buyer projection, so an empty card AT A SEAL must read as a deliberate redaction (SealedNotice), never as
 *  a vendor deficiency ("No X provided"). The UI does not guess WHICH fields the server seals — it explains
 *  any seal-driven absence wherever it lands; once the window closes (`sealed=false`) a genuinely-empty card
 *  resolves to its honest non-penalizing empty state. Backs Delivery / Warranty / Compliance (one renderer). */
function TermsCard({
  title,
  rows,
  emptyTitle,
  sealed,
}: {
  title: string;
  rows?: QuotationTermRow[];
  emptyTitle: string;
  sealed?: boolean;
}) {
  const items: DescriptionItem[] = (rows ?? []).map((r) => ({
    id: r.id,
    label: r.label,
    value: r.value,
  }));
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {items.length === 0 ? (
          sealed ? (
            <SealedNotice />
          ) : (
            <EmptyState title={emptyTitle} className="py-8" />
          )
        ) : (
          <DescriptionList items={items} />
        )}
      </CardContent>
    </Card>
  );
}

/** Delivery terms (`delivery_terms` projection). */
function DeliveryCard({ rows, sealed }: { rows?: QuotationTermRow[]; sealed?: boolean }) {
  return (
    <TermsCard
      title="Delivery terms"
      rows={rows}
      emptyTitle="No delivery terms provided"
      sealed={sealed}
    />
  );
}

/** Warranty (`warranty_terms` projection — nullable in the contract, 0..1). */
function WarrantyCard({ rows, sealed }: { rows?: QuotationTermRow[]; sealed?: boolean }) {
  return (
    <TermsCard
      title="Warranty"
      rows={rows}
      emptyTitle="No warranty terms provided"
      sealed={sealed}
    />
  );
}

/** Specification compliance (`spec_compliance_declaration` projection — the technical/compliance content,
 *  Doc-3 §8.1). There is no separate frozen `commercial_terms`/`technical_notes` field; this is it. */
function ComplianceCard({ rows, sealed }: { rows?: QuotationTermRow[]; sealed?: boolean }) {
  return (
    <TermsCard
      title="Specification compliance"
      rows={rows}
      emptyTitle="No compliance declaration provided"
      sealed={sealed}
    />
  );
}

/** Attachments (`attachments_refs` resolved to signed URLs by the surface — the kit embeds no blob). A
 *  descriptor without an `href` renders as a non-interactive row (never a fabricated link). */
function AttachmentList({ attachments }: { attachments?: QuotationAttachment[] }) {
  const files = attachments ?? [];
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">Attachments</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {files.length === 0 ? (
          <EmptyState title="No attachments" className="py-8" />
        ) : (
          <ul className="flex flex-col gap-2">
            {files.map((f) => (
              <li key={f.id}>
                {f.href ? (
                  <FileLink
                    href={f.href}
                    name={f.name}
                    sizeLabel={f.sizeLabel}
                    className="w-full"
                  />
                ) : (
                  // No resolved href ⇒ NOT a fabricated link. A deliberately PLAIN, un-chromed row (it does
                  // not mirror the kit FileLink's bordered shell, so there is no markup to keep in lockstep)
                  // with an explicit "unavailable" cue so the state is announced, not just visually implied.
                  <span className="inline-flex w-full items-center gap-2 px-1 py-2 text-sm text-muted-foreground">
                    <Paperclip aria-hidden className="size-4 shrink-0" />
                    <span className="truncate">{f.name}</span>
                    {f.sizeLabel ? <span className="shrink-0 text-xs">{f.sizeLabel}</span> : null}
                    <span className="ml-auto shrink-0 text-xs italic">unavailable</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Headline commercial facts as a scannable KPI band (reuses the dashboard `KpiStatCard`, Doc-7F §9.1
 * pattern) — the enterprise-procurement figures a buyer scans for first: quoted amount (sealed-aware,
 * §10.1), validity window, and receipt time. Vendor/status/version already sit in the `PageHeader`
 * (no duplication). Every figure is the contract read the caller supplies — never client-computed
 * (R7 firewall / GI-12); an absent figure renders the card's own neutral "—", never a fabricated value.
 */
function QuotationStatBand({ data }: { data: QuotationDetailData }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <KpiStatCard
        label="Quoted amount"
        value={
          data.sealedUntilClose && !data.amount ? (
            <SealedMarker />
          ) : data.amount ? (
            <Money value={data.amount} />
          ) : undefined
        }
      />
      <KpiStatCard
        label="Valid until"
        value={data.validUntil ? formatDate(data.validUntil) : undefined}
      />
      <KpiStatCard
        label="Received"
        value={data.submittedAt ? formatInstant(data.submittedAt) : undefined}
      />
    </div>
  );
}

/** Not-found ≡ genuine absence (byte-identical; Inv #11 / GI-12). The breadcrumb shows only the `RFQs`
 *  ancestor — never a leaf ref (or the parent RFQ) that would imply the quotation/RFQ exists. */
function NotFoundState() {
  return (
    <>
      <Breadcrumbs items={[{ label: "RFQs", href: "/buy/rfqs" }]} className="mb-4" />
      {/* FZ-02: the in-view genuine-absence branch still needs a page heading; kept sr-only so the
          visual stays the minimal EmptyState card (its title renders as a <p>, not a heading). */}
      <h1 className="sr-only">Quotation not found</h1>
      <EmptyState
        icon={<FileText aria-hidden />}
        title="Quotation not found"
        description="This quotation doesn't exist or isn't available."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/buy/rfqs">Back to RFQs</Link>
          </Button>
        }
        className="py-16"
      />
    </>
  );
}

export function QuotationDetailView({ data }: { data: QuotationDetailData | null }) {
  if (data === null) {
    return <NotFoundState />;
  }

  const status = quotationStateDisplay(data.state);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "RFQs", href: "/buy/rfqs" },
          { label: "RFQ", href: `/buy/rfqs/${data.rfqId}` },
          { label: data.humanRef },
        ]}
        className="mb-4"
      />
      <PageHeader
        title={data.vendorName}
        meta={
          <>
            <Ref>{data.humanRef}</Ref>
            <StatusChip label={status.label} tone={status.tone} />
            {typeof data.versionNo === "number" ? (
              <span className="text-xs text-muted-foreground">Version {data.versionNo}</span>
            ) : null}
          </>
        }
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href={`/buy/rfqs/${data.rfqId}/clarifications`} className="gap-1.5">
              <MessageSquare aria-hidden className="size-4" />
              Ask a clarification
            </Link>
          </Button>
        }
      />
      <QuotationStatBand data={data} />
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <PricingCard pricing={data.pricing} sealed={data.sealedUntilClose} />
          <DeliveryCard rows={data.delivery} sealed={data.sealedUntilClose} />
          <WarrantyCard rows={data.warranty} sealed={data.sealedUntilClose} />
          <ComplianceCard rows={data.compliance} sealed={data.sealedUntilClose} />
          <AttachmentList attachments={data.attachments} />
        </div>
        <div className="flex flex-col gap-4">
          <ActivityTimeline
            entries={data.history ?? []}
            title="Version history"
            emptyLabel="No version history yet"
          />
        </div>
      </div>
    </>
  );
}

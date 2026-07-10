// P-BUY-11 Buyer "RFQ version history" (Doc-7F · `T-DETAILS`; IA sub-route of the RFQ detail, host
// P-BUY-08). PRESENTATION (Content ≠ Presentation, Inv #9): a pure function of its view-model — a Server
// Component with no hooks, no fetch, no mutation. The server page resolves the data via the wired
// `rfq.get_rfq_version` read (§E4.8, GI-02) and passes it; version selection is native GET nav (`?v=`), so
// nothing here hydrates.
//
// GOVERNANCE (load-bearing):
//  • Inv #8 — `rfq_versions` is immutable + append-only (Doc-2 §5.4); this surface is READ-ONLY, there is
//    NO version edit/rollback affordance (a prior version is evidence, never overwritten).
//  • The version chain renders in its intrinsic `version_no` sequence; the UI computes/re-ranks nothing
//    (GI-04). The field-level diff is pure presentation over the two DISCLOSED version contents.
//  • Change markers are text badges + labels, never color-only (GI-06).
//  • State plan (§II.6): `null` → not-found ≡ genuine absence (byte-identical to a real 404; Inv #11 /
//    GI-12). The breadcrumb never names a leaf that would imply the RFQ exists.

import Link from "next/link";
import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { cn } from "@/frontend/lib/cn";
import { PageHeader, Breadcrumbs } from "../../../../_components/shell";
import { DescriptionList, type DescriptionItem } from "../../../_components/description-list";
import { formatDate, Money, Ref } from "../../../_components/format";
import { rfqStateDisplay } from "../../../_components/state-display";
import type {
  RfqVersionHistoryData,
  RfqVersion,
  RfqVersionContent,
} from "../../../_components/rfq-version-view-models";

/** Ordered content fields shown per version and diffed (map by intent to the `get_rfq_version` content). */
const VERSION_FIELDS: { key: keyof RfqVersionContent; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "summary", label: "Summary" },
  { key: "category", label: "Category" },
  { key: "value", label: "Budget" },
  { key: "deliveryLocation", label: "Delivery location" },
  { key: "neededBy", label: "Needed by" },
];

/** Resolved presentation value for one content field (em dash when the version omits it). */
function renderFieldValue(key: keyof RfqVersionContent, content: RfqVersionContent): ReactNode {
  if (key === "value") return <Money value={content.value} />;
  if (key === "neededBy") {
    return content.neededBy ? (
      formatDate(content.neededBy)
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }
  const v = content[key];
  return typeof v === "string" && v.length > 0 ? (
    v
  ) : (
    <span className="text-muted-foreground">—</span>
  );
}

/** Normalized comparison key for a field (pure presentation over disclosed content — never a decision). */
function fieldCompareKey(key: keyof RfqVersionContent, content: RfqVersionContent): string {
  if (key === "value") {
    return content.value ? `${content.value.amount}|${content.value.currency ?? ""}` : "";
  }
  const v = content[key];
  return typeof v === "string" ? v : "";
}

/** A version's content as definition-list rows (reuses the shared `DescriptionList`). */
function contentItems(content: RfqVersionContent): DescriptionItem[] {
  return VERSION_FIELDS.map((f) => ({
    id: f.key,
    label: f.label,
    value: renderFieldValue(f.key, content),
  }));
}

/** Left rail — the version timeline. Each version is a GET link that selects it for the compare view. */
function VersionTimeline({
  ordered,
  currentVersionNo,
  selectedVersionNo,
  rfqId,
}: {
  ordered: RfqVersion[];
  currentVersionNo: number;
  selectedVersionNo: number;
  rfqId: string;
}) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">Versions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ol className="flex flex-col gap-1">
          {ordered.map((v) => {
            const isCurrent = v.versionNo === currentVersionNo;
            const isSelected = v.versionNo === selectedVersionNo;
            return (
              <li key={v.versionNo}>
                <Link
                  href={`/rfqs/${rfqId}/versions?v=${v.versionNo}`}
                  aria-current={isSelected ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <span>Version {v.versionNo}</span>
                  {isCurrent ? <StatusChip label="Current" tone="brand" /> : null}
                </Link>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

/** One diff row — the field in the earlier vs the selected version, with a non-color-only change marker. */
function DiffRow({
  fieldKey,
  label,
  base,
  target,
}: {
  fieldKey: keyof RfqVersionContent;
  label: string;
  base: RfqVersion;
  target: RfqVersion;
}) {
  const changed =
    fieldCompareKey(fieldKey, base.content) !== fieldCompareKey(fieldKey, target.content);
  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {changed ? (
          <StatusChip label="Changed" tone="warning" />
        ) : (
          <span className="text-xs text-muted-foreground">Unchanged</span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <div className="text-xs text-muted-foreground">Version {base.versionNo}</div>
          <div className="text-sm text-foreground">{renderFieldValue(fieldKey, base.content)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Version {target.versionNo}</div>
          <div className={cn("text-sm text-foreground", changed && "font-medium")}>
            {renderFieldValue(fieldKey, target.content)}
          </div>
        </div>
      </div>
    </li>
  );
}

/** Right pane — the selected version's content, plus a field-level diff against the previous version. */
function CompareCard({
  selected,
  previous,
  className,
}: {
  selected: RfqVersion;
  previous?: RfqVersion;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">
          {previous ? `Changes in version ${selected.versionNo}` : `Version ${selected.versionNo}`}
        </CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          {previous
            ? `Compared with version ${previous.versionNo}. Each field is marked changed or unchanged.`
            : "This is the first version — there is no earlier revision to compare against."}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {previous ? (
          <ul className="divide-y divide-border">
            {VERSION_FIELDS.map((f) => (
              <DiffRow
                key={f.key}
                fieldKey={f.key}
                label={f.label}
                base={previous}
                target={selected}
              />
            ))}
          </ul>
        ) : (
          <DescriptionList items={contentItems(selected.content)} />
        )}
      </CardContent>
    </Card>
  );
}

/** Single-version RFQ — no revisions yet (§II.6 empty = single-version note). */
function SingleVersionPanel({ version }: { version: RfqVersion }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">Version {version.versionNo}</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          This RFQ has a single version — no revisions have been made yet.
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <DescriptionList items={contentItems(version.content)} />
      </CardContent>
    </Card>
  );
}

function NotFoundState() {
  // Not-found ≡ genuine absence (byte-identical; Inv #11 / GI-12). The breadcrumb shows only the parent
  // list (never a leaf ref that would imply the RFQ exists).
  return (
    <>
      <Breadcrumbs items={[{ label: "RFQs", href: "/rfqs" }]} className="mb-4" />
      {/* FZ-02: the in-view genuine-absence branch still needs a page heading; kept sr-only so the
          visual stays the minimal EmptyState card (its title renders as a <p>, not a heading). */}
      <h1 className="sr-only">RFQ not found</h1>
      <EmptyState
        icon={<FileText aria-hidden />}
        title="RFQ not found"
        description="This RFQ doesn't exist or isn't available."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/rfqs">Back to RFQs</Link>
          </Button>
        }
        className="py-16"
      />
    </>
  );
}

export function RfqVersionsView({
  data,
  selectedVersionNo,
}: {
  data: RfqVersionHistoryData | null;
  selectedVersionNo?: number;
}) {
  if (data === null) {
    return <NotFoundState />;
  }

  const status = rfqStateDisplay(data.state);
  // Display ordering of the INTRINSIC version_no sequence (newest first) — not a re-rank of a governed
  // result set (GI-04); version_no is a monotonic identifier, not a computed rank.
  const ordered = [...data.versions].sort((a, b) => b.versionNo - a.versionNo);
  const isSingle = ordered.length <= 1;

  // Selected version to inspect (default: the current/head revision). Guarded here too in case the query
  // pointed outside the disclosed set.
  const selected =
    ordered.find((v) => v.versionNo === selectedVersionNo) ??
    ordered.find((v) => v.versionNo === data.currentVersionNo) ??
    ordered[0];
  const previous = ordered.find((v) => v.versionNo === selected.versionNo - 1);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "RFQs", href: "/rfqs" },
          { label: data.humanRef, href: `/rfqs/${data.id}` },
          { label: "Version history" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Version history"
        description="Every revision to this RFQ is kept immutably — nothing is overwritten."
        meta={
          <>
            <Ref>{data.humanRef}</Ref>
            <StatusChip label={status.label} tone={status.tone} />
          </>
        }
      />
      {isSingle ? (
        <SingleVersionPanel version={ordered[0]} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <VersionTimeline
            ordered={ordered}
            currentVersionNo={data.currentVersionNo}
            selectedVersionNo={selected.versionNo}
            rfqId={data.id}
          />
          <CompareCard selected={selected} previous={previous} className="lg:col-span-2" />
        </div>
      )}
    </>
  );
}

// P-BUY-27 Buyer Vendor CRM detail — host view (`T-DETAILS`, Doc-7F). Pure function of its view-model (a
// Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page
// composes `ops.get_private_vendor.v1` + `ops.get_buyer_supplier_relationship.v1` (Doc-4F §F4.9) and passes
// it here; an unknown/absent/non-owned record collapses to `notFound()` BY THE PAGE (byte-identical;
// Inv #11 / H.9), so this view always receives non-null data.
//
// REUSE: shell `Breadcrumbs` + `PageHeader`; shared `DescriptionList` + `Ref`; kit `Card`/`Button`/
// `StatusChip`/`EmptyState`; buyer `buyerVendorStatusDisplay` / `privateVendorLinkStatusDisplay`.
//
// GOVERNANCE (load-bearing — buyer-private / Inv #11 / §7.5 / firewall M4):
//  • `currentStatus` (approved | conditional | blacklisted) is BUYER-PRIVATE — shown ONLY here to the OWNING
//    buyer; it is NEVER vendor-facing, never another buyer's, never a platform-score input. A `blacklisted`
//    status stays UNDETECTABLE to the vendor (§7.5). It exists only when the record is LINKED.
//  • Renders only projected fields (§F4.9); `details_jsonb` and `caveat_note` are NOT projected → not shown.
//  • Writes are PARKED (disabled): status set/clear gates on `can_manage_vendor_status`; notes / ratings /
//    favorite gate on `can_manage_private_vendors` — DISTINCT slugs, never collapsed (Doc-2 §7).
//  • Opaque IDs (Inv #5); `name` is buyer-entered display text.

import { Info, Star, StickyNote } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader, Breadcrumbs } from "../../../../_components/shell";
import { DescriptionList, type DescriptionItem } from "../../_components/description-list";
import {
  buyerVendorStatusDisplay,
  privateVendorLinkStatusDisplay,
} from "../../_components/state-display";
import type { PrivateVendorSource } from "../../_components/view-models";
import type { VendorCrmDetailData } from "../../_components/crm-detail-view-models";

const SOURCE_LABEL: Record<PrivateVendorSource, string> = {
  manual: "Added manually",
  email_list: "Email list",
  excel: "Excel import",
};

export function CrmDetailView({ data }: { data: VendorCrmDetailData }) {
  const link = privateVendorLinkStatusDisplay(data.linkStatus);
  // Derived at the top of the body (matches the sibling idiom); non-null iff a CRM status is present.
  const status = data.currentStatus ? buyerVendorStatusDisplay(data.currentStatus) : null;
  const contact: DescriptionItem[] = [
    { label: "Email", value: data.email ?? "—" },
    { label: "Phone", value: data.phone ?? "—" },
    { label: "Source", value: SOURCE_LABEL[data.source] },
    { label: "Link status", value: <StatusChip label={link.label} tone={link.tone} /> },
  ];

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Vendor CRM", href: "/buy/crm" }, { label: data.name }]}
        className="mb-4"
      />
      <PageHeader
        title={data.name}
        meta={
          <>
            <StatusChip label={link.label} tone={link.tone} />
            {data.isFavorite ? (
              <span className="inline-flex items-center gap-1 text-xs text-iv-amber-700">
                <Star aria-hidden className="size-3.5 fill-current" />
                Favorite
              </span>
            ) : null}
            {data.state === "archived" ? (
              <span className="text-xs text-muted-foreground">Archived</span>
            ) : null}
          </>
        }
      />

      <div className="mt-2 flex flex-col gap-4">
        {/* CRM status — BUYER-PRIVATE. Shown only to the owning buyer; never vendor-facing. Present only when
            the record is linked to a marketplace profile (an unlinked record has no relationship/status). */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-semibold">CRM status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4 pt-0">
            {status ? (
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip label={status.label} tone={status.tone} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No CRM status set. Link this vendor to a marketplace profile to set a private
                status.
              </p>
            )}
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              This status is private to your organization. It is never shown to the vendor and never
              affects any platform-wide score.
            </p>
            {data.canManageVendorStatus ? (
              <div className="flex flex-wrap items-center gap-2">
                {/* Parked writes: ops.set_buyer_vendor_status.v1 / clear (slug can_manage_vendor_status). */}
                <Button type="button" variant="secondary" size="sm" disabled>
                  Set status
                </Button>
                {data.currentStatus && data.currentStatus !== "none" ? (
                  <Button type="button" variant="ghost" size="sm" disabled>
                    Clear status
                  </Button>
                ) : null}
                <span className="text-xs text-muted-foreground">
                  Managing status connects in the integration phase.
                </span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-semibold">Contact</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <DescriptionList items={contact} />
          </CardContent>
        </Card>

        {/* Notes — buyer-private free-text. Parked: ops.add_private_vendor_note.v1 (can_manage_private_vendors). */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 p-4">
            <CardTitle className="text-sm font-semibold">Notes</CardTitle>
            {data.canManagePrivateVendors ? (
              <Button type="button" variant="secondary" size="sm" disabled>
                Add note
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {data.notes.length > 0 ? (
              <ul className="flex flex-col divide-y divide-border">
                {data.notes.map((n) => (
                  <li key={n.id} className="flex items-start gap-2 py-2 text-sm text-foreground">
                    <StickyNote
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    />
                    <span>{n.note}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No notes yet" className="py-8" />
            )}
          </CardContent>
        </Card>

        {/* Ratings — buyer-private. Parked: ops.set_private_vendor_rating.v1 (can_manage_private_vendors). */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 p-4">
            <CardTitle className="text-sm font-semibold">Ratings</CardTitle>
            {data.canManagePrivateVendors ? (
              <Button type="button" variant="secondary" size="sm" disabled>
                Add rating
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {data.ratings.length > 0 ? (
              <ul className="flex flex-col divide-y divide-border">
                {data.ratings.map((r) => (
                  <li key={r.id} className="flex flex-col gap-0.5 py-2 text-sm">
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Star aria-hidden className="size-3.5 fill-current text-iv-amber-700" />
                      {r.score}
                    </span>
                    {r.comment ? <span className="text-muted-foreground">{r.comment}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No ratings yet" className="py-8" />
            )}
          </CardContent>
        </Card>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="size-3.5 shrink-0" />
          Your vendor CRM — status, notes and ratings — is private to your organization and is never
          shown to vendors.
        </p>
      </div>
    </>
  );
}

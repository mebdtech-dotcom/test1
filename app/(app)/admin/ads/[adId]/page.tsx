// P-ADM-11 Ad review detail (Doc-7H · Details/Transactional · `marketplace.review_advertisement.v1` · J-ADM-03).
// PRESENTATION ONLY: the contextual review of one advertisement. The Approve / Reject decision is RENDERED BUT
// DISABLED — `review_advertisement` is owned by Marketplace admin (R5: Admin decides; the owning module owns the
// effect). Frozen request shape (Doc-4D §B): `decision : enum(approve|reject)`, `reason` REQUIRED on reject;
// state `pending_review → scheduled | rejected` (Doc-2 §5.8) — the decision is offered ONLY while pending.
// Unknown/absent ad → byte-equivalent `notFound()` (Invariant #11). FIREWALL (Doc-4D §B.11): ads are
// visibility/placement only — never gate trust / eligibility / routing / matching, so no governance signal
// appears here. Fields bind to frozen `advertisements` attributes; no coined ad ref. Composes the shell
// PageHeader + generic DashboardSection / DescriptionList / PresentationFormNote + kit; no new primitive.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../../_components/shell";
import { DashboardSection } from "../../../_components/vendor/dashboard/dashboard-section";
import { DescriptionList } from "../../../_components/vendor/shared/description-list";
import { PresentationFormNote } from "../../../_components/vendor/shared/presentation-form-note";
import { ADMIN_REASON_CLASS } from "../../../_components/admin/form-control-classes";
import {
  getAd,
  getAdDetail,
  AD_STATUS_META,
  AD_PLACEMENT_LABEL,
} from "../../../_components/admin/ad-review/ad-review-seed";

const LIST = "/admin/ads";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ adId: string }>;
}): Promise<Metadata> {
  const { adId } = await params;
  const ad = getAd(adId);
  return { title: ad ? `${ad.advertiser} · Ad review · Admin` : "Ad review · Admin" };
}

export default async function AdReviewDetailPage({
  params,
}: {
  params: Promise<{ adId: string }>;
}) {
  const { adId } = await params;
  const detail = getAdDetail(adId);
  if (!detail) notFound();

  const meta = AD_STATUS_META[detail.status];
  const isPending = detail.status === "pending_review";

  return (
    <div className="space-y-6">
      <Link
        href={LIST}
        className="-mx-1.5 inline-flex items-center gap-1 self-start rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to ad review
      </Link>

      <PageHeader
        title={detail.advertiser}
        description="Review the creative and placement, then approve to schedule or reject with a reason."
        meta={
          <>
            <span className="font-mono text-xs text-muted-foreground">{detail.creativeRef}</span>
            <Badge variant="neutral">{AD_PLACEMENT_LABEL[detail.placement]}</Badge>
            <StatusChip label={meta.label} tone={meta.tone} />
          </>
        }
        actions={
          isPending ? (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled>
                Approve
              </Button>
              <Button size="sm" variant="outline" disabled>
                Reject
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardSection title="Advertisement" className="lg:col-span-2">
          <DescriptionList
            items={[
              { label: "Creative reference", value: detail.creativeRef },
              { label: "Advertiser", value: detail.advertiser },
              { label: "Placement", value: AD_PLACEMENT_LABEL[detail.placement] },
              { label: "Schedule", value: `${detail.startsOn} – ${detail.endsOn}` },
              { label: "Submitted", value: detail.submitted },
              { label: "Purchaser", value: detail.purchaser },
              {
                label: "Billing purchase ref",
                value: <span className="font-mono text-xs">{detail.platformInvoiceId}</span>,
              },
            ]}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Ads govern visibility and placement only — they never affect trust, eligibility,
            routing, or matching.
          </p>
        </DashboardSection>

        <DashboardSection title="Review decision">
          {isPending ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Approve schedules the placement; reject returns it with a reason. Admin decides; the
                owning module applies the effect.
              </p>
              <div className="space-y-1.5">
                <label
                  htmlFor="ad-reject-reason"
                  className="block text-sm font-medium text-foreground"
                >
                  Reason
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (required to reject)
                  </span>
                </label>
                <textarea
                  id="ad-reject-reason"
                  name="reason"
                  className={ADMIN_REASON_CLASS}
                  placeholder="Explain why this ad cannot be scheduled…"
                  disabled
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled>
                  Approve
                </Button>
                <Button size="sm" variant="outline" disabled>
                  Reject
                </Button>
              </div>
              <PresentationFormNote />
            </div>
          ) : (
            <DescriptionList
              items={[
                {
                  label: "Decision",
                  value: detail.status === "scheduled" ? "Approved — scheduled" : "Rejected",
                },
                { label: "Reason", value: detail.reviewReason },
              ]}
            />
          )}
        </DashboardSection>
      </div>
    </div>
  );
}

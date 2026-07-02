// Ad review — presentation SEED (P-ADM-10 · Doc-7H · J-ADM-03). A curated mock of the advertisement review
// worklist standing in for the unwired read — NOT data, coins nothing. The queue is a READ surface (Doc-7H:
// "ad reads"); the Approve/Reject decision is `marketplace.review_advertisement.v1`, which is actioned on the
// DETAIL page (P-ADM-11), owned by Marketplace admin (R5). Status is the frozen advertisement machine
// (Doc-2 §5.8 / A-07): `pending_review → scheduled` (approve) | `pending_review → rejected` (reject). FIREWALL
// note (Doc-4D §B.11): ads are visibility/placement ONLY — they never gate trust / eligibility / routing /
// matching, so no governance signal appears here. Fields bind only to frozen `advertisements` attributes:
// `creative_ref` (the identifier — ads carry NO human_ref), `placement` enum, `schedule{start,end}`,
// `vendor_profile_id` (optional advertised profile). No fabricated total (GI-03).
import type { StatusTone } from "@/frontend/components/status-chip";

// Review-relevant subset of the §5.8 machine: the actionable `pending_review` plus the two review outcomes.
export type AdReviewStatus = "pending_review" | "scheduled" | "rejected";

export type AdPlacement = "landing" | "bottom" | "search" | "vendor_profile";

export interface AdReviewVM {
  id: string;
  /** Frozen `advertisements.creative_ref` — the creative asset reference (ads have no human_ref). */
  creativeRef: string;
  /** Advertised vendor profile name (`vendor_profile_id` is optional on an ad) — display only. */
  advertiser: string;
  placement: AdPlacement;
  /** `schedule{start,end}` rendered as a compact range — display only. */
  schedule: string;
  /** When the ad was submitted for review (relative) — display only. */
  submitted: string;
  status: AdReviewStatus;
}

export const AD_STATUS_META: Record<AdReviewStatus, { label: string; tone: StatusTone }> = {
  pending_review: { label: "Pending review", tone: "warning" },
  scheduled: { label: "Scheduled", tone: "success" },
  rejected: { label: "Rejected", tone: "neutral" },
};

export const AD_PLACEMENT_LABEL: Record<AdPlacement, string> = {
  landing: "Landing",
  bottom: "Bottom bar",
  search: "Search results",
  vendor_profile: "Vendor profile",
};

export const AD_REVIEWS: AdReviewVM[] = [
  {
    id: "ad-00051",
    creativeRef: "cr_landing_rupsha_q3",
    advertiser: "Rupsha Engineering Works",
    placement: "landing",
    schedule: "1 Jul – 31 Jul",
    submitted: "1h ago",
    status: "pending_review",
  },
  {
    id: "ad-00050",
    creativeRef: "cr_search_bayvalves_pumps",
    advertiser: "Bay Valves & Controls",
    placement: "search",
    schedule: "5 Jul – 4 Aug",
    submitted: "3h ago",
    status: "pending_review",
  },
  {
    id: "ad-00049",
    creativeRef: "cr_vprofile_meghna_bearings",
    advertiser: "Meghna Bearings",
    placement: "vendor_profile",
    schedule: "10 Jul – 9 Aug",
    submitted: "6h ago",
    status: "pending_review",
  },
  {
    id: "ad-00048",
    creativeRef: "cr_bottom_greenpower_drives",
    advertiser: "Green Power Solutions",
    placement: "bottom",
    schedule: "28 Jun – 27 Jul",
    submitted: "1d ago",
    status: "scheduled",
  },
  {
    id: "ad-00047",
    creativeRef: "cr_landing_titas_instru",
    advertiser: "Titas Instrumentation",
    placement: "landing",
    schedule: "25 Jun – 24 Jul",
    submitted: "2d ago",
    status: "scheduled",
  },
  {
    id: "ad-00046",
    creativeRef: "cr_search_padma_lubricants",
    advertiser: "Padma Lubricants",
    placement: "search",
    schedule: "20 Jun – 19 Jul",
    submitted: "3d ago",
    status: "rejected",
  },
];

// RFQ WORKFLOW — Mock fixture universe (presentation stand-in for the wired reads).
//
// ONE coherent dataset covering the ENTIRE frozen RFQ journey: a buyer org with an RFQ in every
// frozen Doc-4M state, and a vendor org with received invitations / own quotations across their
// frozen states. It extends the two fixture worlds the surfaces already reviewed against —
// "RFQ-2026-000123" (buyer deep universe: detail → versions → routing → comparison → award) and
// "rfq-000318" (vendor deep universe: snapshot seed) — so existing review anchors stay valid.
//
// GOVERNANCE:
//  • Every state token is the verbatim frozen set; every `permittedActions` entry is a frozen
//    Doc-5E command reachable from the fixture's state per ./../../transitions.ts — a stand-in for
//    the SERVER-derived GI-10 set, never a client decision.
//  • Vendor rows carry OWN/received facts only (ND-1..ND-8): no competitor count, rank, or outcome
//    tell. The not-selected row deliberately omits `rfq_state` (the vendor-facing chip set labels
//    `closed_won` as an own-win — the server projection resolves this at wiring).
//  • Amounts are BDT with currency stored per value (multi-currency-ready); ids are opaque; human
//    refs are display-only (Inv #5).

import type {
  RfqDetailData,
  RfqListItem,
} from "../../../../(workspace)/buy/_components/rfq-view-models";
import type { RfqVersionHistoryData } from "../../../../(workspace)/buy/_components/rfq-version-view-models";
import type { RoutingInvitationsData } from "../../../../(workspace)/buy/_components/routing-view-models";
import type { AwardData } from "../../../../(workspace)/buy/_components/award";
import type { QuotationDetailData } from "../../../../(workspace)/buy/_components/quotation-view-models";
import type { ComparisonData } from "@/frontend/components/comparison";
import type {
  InboxItemView,
  RfqSnapshotView,
  InvitationView,
  QuotationView,
  QuotaView,
  EngagementHandoffView,
  PriceBreakdownLine,
  FileRefView,
  WindowState,
  WindowUrgency,
} from "../../../vendor/rfq/types";
import { RFQ_SNAPSHOT_SEED } from "../../../vendor/rfq/rfq-snapshot-seed";

/** One buyer-leg fixture record — the per-RFQ bundle the buyer reads project from. */
export interface BuyerRfqRecord {
  detail: RfqDetailData;
  /** Multi-revision history where the fixture has one; absent ⇒ the adapter projects a v1-only history. */
  versions?: RfqVersionHistoryData;
  /** Routing/invitation log where routing has run; absent ⇒ the adapter projects an honest empty log. */
  routing?: RoutingInvitationsData;
  /** Comparison statement — exists only from the first quotation onward (absent ⇒ genuine absence). */
  comparison?: ComparisonData;
  /** Award shortlist — candidates only when quotations are shortlisted (absent ⇒ "shortlist first"). */
  award?: AwardData;
  quotationDetails?: QuotationDetailData[];
}

/** Builder working-draft content (S4) — own data only; mirrors QuotationBuilderProps minus quota. */
export interface VendorBuilderSeed {
  rfqHumanRef?: string;
  versionLockedLabel?: string;
  windowState?: WindowState;
  windowDeadlineLabel?: string;
  windowUrgency?: WindowUrgency;
  lines?: PriceBreakdownLine[];
  currency?: string;
  subtotal?: number;
  deliveryTerms?: string;
  warrantyTerms?: string;
  specComplianceDeclaration?: string;
  attachments?: FileRefView[];
}

/** One vendor-leg fixture record — the per-RFQ bundle the vendor reads project from. */
export interface VendorRfqRecord {
  inbox: InboxItemView;
  snapshot: RfqSnapshotView;
  invitation?: InvitationView;
  quotation?: QuotationView;
  builder?: VendorBuilderSeed;
  engagement?: EngagementHandoffView;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Buyer universe — one RFQ per frozen state (deep records on 000123 / 000119 / 000117 / 000318 / 000095).
// ────────────────────────────────────────────────────────────────────────────────────────────────

export const BUYER_RFQ_UNIVERSE: readonly BuyerRfqRecord[] = [
  {
    detail: {
      id: "rfq-000201",
      humanRef: "RFQ-2026-000201",
      title: "Industrial exhaust fans — supply",
      state: "draft",
      value: { amount: 640000, currency: "BDT" },
      summary:
        "Six heavy-duty axial exhaust fans for the finishing shed, including mounting frames.",
      category: "HVAC & Ventilation",
      workNature: ["supply"],
      currentVersionNo: 1,
      deliveryLocation: "Tongi plant",
      neededBy: "2026-09-15",
      createdAt: "2026-07-02T11:20:00+06:00",
      updatedAt: "2026-07-04T09:05:00+06:00",
      permittedActions: [
        { key: "submit_rfq", label: "Submit RFQ", emphasis: "primary" },
        { key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" },
      ],
      lifecycle: [{ id: "l-1", label: "RFQ created", at: "2026-07-02T11:20:00+06:00" }],
    },
  },
  {
    detail: {
      id: "rfq-000205",
      humanRef: "RFQ-2026-000205",
      title: "11kV HT cable 3×185 mm² — supply",
      state: "pending_internal_approval",
      value: { amount: 1980000, currency: "BDT" },
      summary: "1.2 km of 11kV XLPE HT cable for the substation feeder replacement.",
      category: "Cables & Wiring",
      workNature: ["supply"],
      currentVersionNo: 1,
      deliveryLocation: "Bhaluka factory",
      neededBy: "2026-08-25",
      createdAt: "2026-07-01T10:00:00+06:00",
      updatedAt: "2026-07-03T15:45:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-07-01T10:00:00+06:00" },
        { id: "l-2", label: "Sent for internal approval", at: "2026-07-03T15:45:00+06:00" },
      ],
    },
  },
  {
    detail: {
      id: "rfq-000208",
      humanRef: "RFQ-2026-000208",
      title: "Fire hydrant system — annual maintenance",
      state: "submitted",
      value: { amount: 350000, currency: "BDT" },
      summary: "Annual maintenance contract for the plant fire hydrant network and jockey pumps.",
      category: "Fire & Safety",
      workNature: ["service"],
      currentVersionNo: 1,
      deliveryLocation: "Savar plant",
      neededBy: "2026-08-10",
      createdAt: "2026-06-30T09:30:00+06:00",
      updatedAt: "2026-07-04T10:15:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-06-30T09:30:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-07-04T10:15:00+06:00" },
      ],
    },
  },
  {
    detail: {
      id: "rfq-000210",
      humanRef: "RFQ-2026-000210",
      title: "Compressed-air piping revamp — fabricate & install",
      state: "under_review",
      value: { amount: 2250000, currency: "BDT" },
      summary: "Replace 300 m of compressed-air header piping with SS304, including supports.",
      category: "Piping & Fittings",
      workNature: ["fabricate", "service"],
      currentVersionNo: 1,
      deliveryLocation: "Chattogram unit",
      neededBy: "2026-09-30",
      createdAt: "2026-07-01T14:10:00+06:00",
      updatedAt: "2026-07-05T08:40:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-07-01T14:10:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-07-04T16:00:00+06:00" },
        { id: "l-3", label: "Entered platform review", at: "2026-07-05T08:40:00+06:00" },
      ],
    },
  },
  {
    detail: {
      id: "rfq-000212",
      humanRef: "RFQ-2026-000212",
      title: "Forklift 3-ton diesel — supply",
      state: "matching",
      value: { amount: 3400000, currency: "BDT" },
      summary: "One 3-ton diesel forklift with side-shift, including commissioning and training.",
      category: "Material Handling",
      workNature: ["supply"],
      currentVersionNo: 1,
      deliveryLocation: "Narayanganj warehouse",
      neededBy: "2026-08-20",
      createdAt: "2026-07-02T09:00:00+06:00",
      updatedAt: "2026-07-05T11:30:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-07-02T09:00:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-07-04T13:20:00+06:00" },
        { id: "l-3", label: "Review passed — matching", at: "2026-07-05T11:30:00+06:00" },
      ],
    },
  },
  {
    // The vendor-leg deep RFQ (rfq-000318) as its BUYER sees it.
    detail: {
      id: "rfq-000318",
      humanRef: "RFQ-2026-000318",
      title: "MS plate 10 mm — 20 ton, delivered to Savar EPZ",
      state: "vendors_notified",
      value: { amount: 1850000, currency: "BDT" },
      summary: "MS plate 10 mm × 20 ton to BDS 1031 grade, delivered to the Savar EPZ workshop.",
      category: "Steel & Metals",
      workNature: ["supply"],
      routingMode: "approved_conditional",
      currentVersionNo: 1,
      deliveryLocation: "Savar, Dhaka",
      neededBy: "2026-07-28",
      createdAt: "2026-06-29T10:30:00+06:00",
      updatedAt: "2026-07-03T09:20:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-06-29T10:30:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-07-01T09:00:00+06:00" },
        { id: "l-3", label: "Vendors notified", at: "2026-07-03T09:20:00+06:00" },
      ],
      quotations: { items: [], nextCursor: null },
    },
    routing: {
      id: "rfq-000318",
      humanRef: "RFQ-2026-000318",
      state: "vendors_notified",
      routingLog: [
        { routingMode: "approved_conditional", executedAt: "2026-07-03T09:20:00+06:00" },
      ],
      routingNextCursor: null,
      invitations: [
        {
          state: "accepted",
          deliveredAt: "2026-07-03T09:25:00+06:00",
          respondedAt: "2026-07-04T10:10:00+06:00",
        },
        { state: "delivered", deliveredAt: "2026-07-03T09:25:00+06:00" },
        {
          state: "declined",
          deliveredAt: "2026-07-03T09:25:00+06:00",
          respondedAt: "2026-07-03T17:40:00+06:00",
        },
      ],
      invitationsNextCursor: null,
    },
  },
  {
    detail: {
      id: "rfq-000117",
      humanRef: "RFQ-2026-000117",
      title: "Effluent pump spares — supply",
      state: "quotations_received",
      value: { amount: 520000, currency: "BDT" },
      summary: "Impellers, wear plates and mechanical seals for the ETP effluent pumps.",
      category: "Pumps & Compressors",
      workNature: ["supply"],
      currentVersionNo: 1,
      deliveryLocation: "Gazipur plant",
      neededBy: "2026-08-05",
      createdAt: "2026-06-22T10:00:00+06:00",
      updatedAt: "2026-07-02T16:20:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-06-22T10:00:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-06-24T09:00:00+06:00" },
        { id: "l-3", label: "Vendors notified", at: "2026-06-26T11:00:00+06:00" },
        { id: "l-4", label: "Quotation received", at: "2026-07-02T16:20:00+06:00" },
      ],
      quotations: {
        items: [
          {
            id: "q-117-1",
            vendorName: "Chattogram Marine Hardware",
            state: "submitted",
            amount: { amount: 486000, currency: "BDT" },
            validUntil: "2026-07-25T00:00:00+06:00",
            submittedAt: "2026-07-02T16:20:00+06:00",
          },
        ],
        nextCursor: null,
      },
    },
    comparison: {
      rfqId: "rfq-000117",
      humanRef: "RFQ-2026-000117",
      versionNo: 1,
      generatedAt: "2026-07-02T16:25:00+06:00",
      suppliers: [
        {
          quotationId: "q-117-1",
          vendorName: "Chattogram Marine Hardware",
          state: "submitted",
          amount: { amount: 486000, currency: "BDT" },
          delivery: "2 weeks from PO",
          warranty: "6 months on seals",
          validUntil: "2026-07-25T00:00:00+06:00",
          compliance: "OEM-equivalent parts declared",
          attachmentsCount: 1,
        },
      ],
    },
    quotationDetails: [
      {
        id: "q-117-1",
        rfqId: "rfq-000117",
        humanRef: "QTN-2026-000602",
        vendorName: "Chattogram Marine Hardware",
        state: "submitted",
        versionNo: 1,
        amount: { amount: 486000, currency: "BDT" },
        validUntil: "2026-07-25T00:00:00+06:00",
        submittedAt: "2026-07-02T16:20:00+06:00",
        pricing: {
          lines: [
            {
              id: "pl-1",
              label: "Impeller set (CI, machined)",
              amount: { amount: 264000, currency: "BDT" },
              note: "2 sets",
            },
            {
              id: "pl-2",
              label: "Mechanical seals + wear plates",
              amount: { amount: 222000, currency: "BDT" },
              note: "2 sets",
            },
          ],
          total: { amount: 486000, currency: "BDT" },
        },
        delivery: [{ id: "d-1", label: "Lead time", value: "2 weeks from PO" }],
        warranty: [{ id: "w-1", label: "Coverage", value: "6 months on seals" }],
        compliance: [{ id: "c-1", label: "Declaration", value: "OEM-equivalent parts declared" }],
      },
    ],
  },
  {
    detail: {
      id: "rfq-000119",
      humanRef: "RFQ-2026-000119",
      title: "Substation transformer servicing — service",
      state: "buyer_reviewing",
      value: { amount: 780000, currency: "BDT" },
      summary:
        "Oil filtration, BDV testing and gasket replacement for two 1600 kVA distribution transformers.",
      category: "Electrical Services",
      workNature: ["service"],
      currentVersionNo: 1,
      deliveryLocation: "Bhaluka factory",
      neededBy: "2026-08-15",
      createdAt: "2026-06-18T09:00:00+06:00",
      updatedAt: "2026-07-03T10:05:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-06-18T09:00:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-06-20T10:30:00+06:00" },
        { id: "l-3", label: "Vendors notified", at: "2026-06-23T09:15:00+06:00" },
        { id: "l-4", label: "Quotations received", at: "2026-06-29T14:00:00+06:00" },
        { id: "l-5", label: "Review opened", at: "2026-07-03T10:05:00+06:00" },
      ],
      quotations: {
        items: [
          {
            id: "q-119-1",
            vendorName: "Dhaka Power Services Ltd.",
            state: "submitted",
            amount: { amount: 745000, currency: "BDT" },
            validUntil: "2026-07-20T00:00:00+06:00",
            submittedAt: "2026-06-29T14:00:00+06:00",
          },
          {
            id: "q-119-2",
            vendorName: "Eastern Grid Engineering",
            state: "submitted",
            amount: { amount: 799000, currency: "BDT" },
            validUntil: "2026-07-22T00:00:00+06:00",
            submittedAt: "2026-06-30T09:40:00+06:00",
          },
          {
            id: "q-119-3",
            vendorName: "Rupsha Electromech",
            state: "submitted",
            amount: { amount: 712000, currency: "BDT" },
            validUntil: "2026-07-18T00:00:00+06:00",
            submittedAt: "2026-07-01T11:25:00+06:00",
          },
        ],
        nextCursor: null,
      },
    },
    comparison: {
      rfqId: "rfq-000119",
      humanRef: "RFQ-2026-000119",
      versionNo: 1,
      generatedAt: "2026-07-03T10:05:00+06:00",
      suppliers: [
        {
          quotationId: "q-119-1",
          vendorName: "Dhaka Power Services Ltd.",
          state: "submitted",
          amount: { amount: 745000, currency: "BDT" },
          delivery: "Shutdown window of 3 days",
          warranty: "12 months on gaskets",
          validUntil: "2026-07-20T00:00:00+06:00",
          compliance: "IEC 60422 test protocol",
          attachmentsCount: 2,
        },
        {
          quotationId: "q-119-2",
          vendorName: "Eastern Grid Engineering",
          state: "submitted",
          amount: { amount: 799000, currency: "BDT" },
          delivery: "Shutdown window of 2 days",
          warranty: "12 months on workmanship",
          validUntil: "2026-07-22T00:00:00+06:00",
          compliance: "IEC 60422 test protocol",
          attachmentsCount: 3,
        },
        {
          quotationId: "q-119-3",
          vendorName: "Rupsha Electromech",
          state: "submitted",
          amount: { amount: 712000, currency: "BDT" },
          delivery: "Shutdown window of 4 days",
          warranty: "6 months on workmanship",
          validUntil: "2026-07-18T00:00:00+06:00",
          compliance: "In-house test protocol",
          attachmentsCount: 1,
        },
      ],
    },
  },
  {
    // THE buyer deep universe — detail → versions → routing → comparison → award all populated.
    detail: {
      id: "rfq-000123",
      humanRef: "RFQ-2026-000123",
      title: "Boiler feed-water pumps — supply & install",
      state: "shortlisted",
      value: { amount: 2750000, currency: "BDT" },
      summary:
        "Two centrifugal feed-water pumps for the Unit-2 boiler house, including delivery, installation, and commissioning against the attached specification.",
      category: "Pumps & Compressors",
      workNature: ["supply", "service"],
      routingMode: "approved_conditional",
      currentVersionNo: 3,
      deliveryLocation: "Gazipur plant",
      neededBy: "2026-08-31",
      createdAt: "2026-06-20T10:00:00+06:00",
      updatedAt: "2026-07-04T15:10:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-06-20T10:00:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-06-22T09:30:00+06:00" },
        { id: "l-3", label: "Vendors notified", at: "2026-06-24T11:15:00+06:00" },
        { id: "l-4", label: "Quotation received", at: "2026-06-30T14:40:00+06:00" },
        { id: "l-5", label: "Review opened", at: "2026-07-02T09:10:00+06:00" },
        { id: "l-6", label: "Shortlist recorded", at: "2026-07-04T15:10:00+06:00" },
      ],
      quotations: {
        items: [
          {
            id: "q-1",
            vendorName: "Meghna Industrial Supplies Ltd.",
            state: "shortlisted",
            amount: { amount: 2695000, currency: "BDT" },
            validUntil: "2026-07-15T00:00:00+06:00",
            submittedAt: "2026-06-30T14:40:00+06:00",
          },
          {
            id: "q-2",
            vendorName: "Padma Engineering Works",
            state: "shortlisted",
            amount: { amount: 2810000, currency: "BDT" },
            validUntil: "2026-07-10T00:00:00+06:00",
            submittedAt: "2026-06-29T16:05:00+06:00",
          },
        ],
        nextCursor: null,
      },
    },
    versions: {
      id: "rfq-000123",
      humanRef: "RFQ-2026-000123",
      state: "shortlisted",
      currentVersionNo: 3,
      versions: [
        {
          versionNo: 1,
          content: {
            title: "Boiler feed-water pumps — supply & install",
            summary: "Two centrifugal feed-water pumps for the Unit-2 boiler house.",
            category: "Pumps & Compressors",
            value: { amount: 2400000, currency: "BDT" },
            deliveryLocation: "Narayanganj plant",
            neededBy: "2026-09-30",
          },
        },
        {
          versionNo: 2,
          content: {
            title: "Boiler feed-water pumps — supply & install",
            summary: "Two centrifugal feed-water pumps for the Unit-2 boiler house.",
            category: "Pumps & Compressors",
            value: { amount: 2750000, currency: "BDT" },
            deliveryLocation: "Narayanganj plant",
            neededBy: "2026-08-31",
          },
        },
        {
          versionNo: 3,
          content: {
            title: "Boiler feed-water pumps — supply & install",
            summary: "Two centrifugal feed-water pumps for the Unit-2 boiler house.",
            category: "Pumps & Compressors",
            value: { amount: 2750000, currency: "BDT" },
            deliveryLocation: "Gazipur plant",
            neededBy: "2026-08-31",
          },
        },
      ],
    },
    routing: {
      id: "rfq-000123",
      humanRef: "RFQ-2026-000123",
      state: "shortlisted",
      routingLog: [
        { routingMode: "approved_only", executedAt: "2026-06-24T11:15:00+06:00" },
        { routingMode: "approved_conditional", executedAt: "2026-06-26T10:00:00+06:00" },
      ],
      routingNextCursor: null,
      invitations: [
        {
          state: "accepted",
          deliveredAt: "2026-06-24T11:20:00+06:00",
          respondedAt: "2026-06-25T09:05:00+06:00",
        },
        {
          state: "accepted",
          deliveredAt: "2026-06-24T11:20:00+06:00",
          respondedAt: "2026-06-25T14:30:00+06:00",
        },
        {
          state: "declined",
          deliveredAt: "2026-06-24T11:20:00+06:00",
          respondedAt: "2026-06-24T16:30:00+06:00",
        },
        { state: "expired", deliveredAt: "2026-06-26T10:05:00+06:00" },
      ],
      invitationsNextCursor: null,
    },
    comparison: {
      rfqId: "rfq-000123",
      humanRef: "RFQ-2026-000123",
      versionNo: 2,
      generatedAt: "2026-07-02T09:10:00+06:00",
      suppliers: [
        {
          quotationId: "q-1",
          vendorName: "Meghna Industrial Supplies Ltd.",
          state: "shortlisted",
          amount: { amount: 2695000, currency: "BDT" },
          delivery: "6 weeks from PO",
          warranty: "18 months from commissioning",
          validUntil: "2026-07-15T00:00:00+06:00",
          compliance: "ISO 5199 compliant",
          attachmentsCount: 3,
        },
        {
          quotationId: "q-2",
          vendorName: "Padma Engineering Works",
          state: "shortlisted",
          amount: { amount: 2810000, currency: "BDT" },
          delivery: "4 weeks from PO",
          warranty: "12 months from commissioning",
          validUntil: "2026-07-10T00:00:00+06:00",
          compliance: "ISO 5199 compliant",
          attachmentsCount: 2,
        },
      ],
    },
    award: {
      rfqId: "rfq-000123",
      humanRef: "RFQ-2026-000123",
      candidates: [
        {
          quotationId: "q-1",
          vendorName: "Meghna Industrial Supplies Ltd.",
          state: "shortlisted",
          amount: { amount: 2695000, currency: "BDT" },
          delivery: "6 weeks from PO",
          validUntil: "2026-07-15",
        },
        {
          quotationId: "q-2",
          vendorName: "Padma Engineering Works",
          state: "shortlisted",
          amount: { amount: 2810000, currency: "BDT" },
          delivery: "4 weeks from PO",
          validUntil: "2026-07-10",
        },
      ],
      aboveThreshold: true,
    },
    quotationDetails: [
      {
        id: "q-1",
        rfqId: "rfq-000123",
        humanRef: "QTN-2026-000587",
        vendorName: "Meghna Industrial Supplies Ltd.",
        state: "shortlisted",
        versionNo: 1,
        amount: { amount: 2695000, currency: "BDT" },
        validUntil: "2026-07-15T00:00:00+06:00",
        submittedAt: "2026-06-30T14:40:00+06:00",
        pricing: {
          lines: [
            {
              id: "pl-1",
              label: "Centrifugal feed-water pump, 45 kW",
              amount: { amount: 2300000, currency: "BDT" },
              note: "2 units",
            },
            {
              id: "pl-2",
              label: "Installation & commissioning",
              amount: { amount: 395000, currency: "BDT" },
            },
          ],
          total: { amount: 2695000, currency: "BDT" },
        },
        delivery: [
          { id: "d-1", label: "Lead time", value: "6 weeks from PO" },
          { id: "d-2", label: "Delivery basis", value: "Delivered to Gazipur plant" },
        ],
        warranty: [{ id: "w-1", label: "Coverage", value: "18 months from commissioning" }],
        compliance: [{ id: "c-1", label: "Standard", value: "ISO 5199 compliant" }],
      },
      {
        id: "q-2",
        rfqId: "rfq-000123",
        humanRef: "QTN-2026-000592",
        vendorName: "Padma Engineering Works",
        state: "shortlisted",
        versionNo: 1,
        amount: { amount: 2810000, currency: "BDT" },
        validUntil: "2026-07-10T00:00:00+06:00",
        submittedAt: "2026-06-29T16:05:00+06:00",
        pricing: {
          lines: [
            {
              id: "pl-1",
              label: "Centrifugal feed-water pump, 45 kW",
              amount: { amount: 2460000, currency: "BDT" },
              note: "2 units",
            },
            {
              id: "pl-2",
              label: "Installation & commissioning",
              amount: { amount: 350000, currency: "BDT" },
            },
          ],
          total: { amount: 2810000, currency: "BDT" },
        },
        delivery: [{ id: "d-1", label: "Lead time", value: "4 weeks from PO" }],
        warranty: [{ id: "w-1", label: "Coverage", value: "12 months from commissioning" }],
        compliance: [{ id: "c-1", label: "Standard", value: "ISO 5199 compliant" }],
      },
    ],
  },
  {
    detail: {
      id: "rfq-000095",
      humanRef: "RFQ-2026-000095",
      title: "Cooling tower fill media replacement",
      state: "closed_won",
      value: { amount: 1150000, currency: "BDT" },
      summary: "Replace PVC fill media and drift eliminators on cooling towers CT-1 and CT-2.",
      category: "HVAC & Ventilation",
      workNature: ["supply", "service"],
      currentVersionNo: 1,
      deliveryLocation: "Savar plant",
      neededBy: "2026-07-31",
      createdAt: "2026-05-28T09:00:00+06:00",
      updatedAt: "2026-06-25T10:00:00+06:00",
      permittedActions: [],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-05-28T09:00:00+06:00" },
        { id: "l-2", label: "Vendors notified", at: "2026-06-02T10:00:00+06:00" },
        { id: "l-3", label: "Quotations received", at: "2026-06-10T15:30:00+06:00" },
        { id: "l-4", label: "Shortlist recorded", at: "2026-06-18T11:00:00+06:00" },
        { id: "l-5", label: "Awarded", at: "2026-06-25T10:00:00+06:00" },
      ],
      quotations: {
        items: [
          {
            id: "q-95-1",
            vendorName: "Karnaphuli HVAC Engineering",
            state: "selected",
            amount: { amount: 1120000, currency: "BDT" },
            validUntil: "2026-07-05T00:00:00+06:00",
            submittedAt: "2026-06-10T15:30:00+06:00",
          },
          {
            id: "q-95-2",
            vendorName: "Delta Cooling Solutions",
            state: "not_selected",
            amount: { amount: 1190000, currency: "BDT" },
            validUntil: "2026-07-08T00:00:00+06:00",
            submittedAt: "2026-06-11T10:10:00+06:00",
          },
        ],
        nextCursor: null,
      },
    },
    comparison: {
      rfqId: "rfq-000095",
      humanRef: "RFQ-2026-000095",
      versionNo: 1,
      generatedAt: "2026-06-12T09:00:00+06:00",
      suppliers: [
        {
          quotationId: "q-95-1",
          vendorName: "Karnaphuli HVAC Engineering",
          state: "selected",
          amount: { amount: 1120000, currency: "BDT" },
          delivery: "3 weeks from PO",
          warranty: "24 months on fill media",
          validUntil: "2026-07-05T00:00:00+06:00",
          compliance: "CTI STD-136 media",
          attachmentsCount: 2,
        },
        {
          quotationId: "q-95-2",
          vendorName: "Delta Cooling Solutions",
          state: "not_selected",
          amount: { amount: 1190000, currency: "BDT" },
          delivery: "2 weeks from PO",
          warranty: "18 months on fill media",
          validUntil: "2026-07-08T00:00:00+06:00",
          compliance: "CTI STD-136 media",
          attachmentsCount: 1,
        },
      ],
    },
  },
  {
    detail: {
      id: "rfq-000090",
      humanRef: "RFQ-2026-000090",
      title: "Diesel generator 500 kVA — supply",
      state: "closed_lost",
      value: { amount: 7800000, currency: "BDT" },
      summary: "500 kVA standby diesel generator with AMF panel; budget not approved this quarter.",
      category: "Power Generation",
      workNature: ["supply"],
      currentVersionNo: 1,
      deliveryLocation: "Tongi plant",
      neededBy: "2026-08-01",
      createdAt: "2026-05-20T09:00:00+06:00",
      updatedAt: "2026-06-20T14:00:00+06:00",
      permittedActions: [{ key: "reissue_rfq", label: "Reissue RFQ", emphasis: "primary" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-05-20T09:00:00+06:00" },
        { id: "l-2", label: "Vendors notified", at: "2026-05-26T10:00:00+06:00" },
        { id: "l-3", label: "Quotations received", at: "2026-06-04T12:00:00+06:00" },
        { id: "l-4", label: "Closed without award", at: "2026-06-20T14:00:00+06:00" },
      ],
      quotations: {
        items: [
          {
            id: "q-90-1",
            vendorName: "Bengal Power Systems",
            state: "submitted",
            amount: { amount: 7650000, currency: "BDT" },
            validUntil: "2026-07-01T00:00:00+06:00",
            submittedAt: "2026-06-04T12:00:00+06:00",
          },
        ],
        nextCursor: null,
      },
    },
  },
  {
    detail: {
      id: "rfq-000082",
      humanRef: "RFQ-2026-000082",
      title: "Conveyor belt vulcanizing — service",
      state: "expired",
      value: { amount: 240000, currency: "BDT" },
      summary:
        "Hot vulcanizing of two belt joints on the clinker conveyor; window lapsed unanswered.",
      category: "Conveyors & Transmission",
      workNature: ["service"],
      currentVersionNo: 1,
      deliveryLocation: "Chhatak works",
      neededBy: "2026-06-30",
      createdAt: "2026-05-15T09:00:00+06:00",
      updatedAt: "2026-06-15T00:00:00+06:00",
      permittedActions: [{ key: "reissue_rfq", label: "Reissue RFQ", emphasis: "primary" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-05-15T09:00:00+06:00" },
        { id: "l-2", label: "Vendors notified", at: "2026-05-20T10:00:00+06:00" },
        { id: "l-3", label: "Validity window lapsed", at: "2026-06-15T00:00:00+06:00" },
      ],
      quotations: { items: [], nextCursor: null },
    },
  },
  {
    detail: {
      id: "rfq-000075",
      humanRef: "RFQ-2026-000075",
      title: "Warehouse racking — fabricate",
      state: "cancelled",
      value: { amount: 1650000, currency: "BDT" },
      summary: "Heavy-duty pallet racking for the new finished-goods warehouse; project deferred.",
      category: "Storage & Racking",
      workNature: ["fabricate"],
      currentVersionNo: 1,
      deliveryLocation: "Narayanganj warehouse",
      neededBy: "2026-09-01",
      createdAt: "2026-05-10T09:00:00+06:00",
      updatedAt: "2026-06-01T11:00:00+06:00",
      permittedActions: [{ key: "reissue_rfq", label: "Reissue RFQ" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-05-10T09:00:00+06:00" },
        { id: "l-2", label: "Cancelled (reason audited)", at: "2026-06-01T11:00:00+06:00" },
      ],
      quotations: { items: [], nextCursor: null },
    },
  },
] as const;

/** The list projection (`list_rfqs`) — derived once from the universe, in last-updated order (the
 *  adapter's stand-in for the contract's governed order; the presentation never re-ranks — GI-04). */
export const BUYER_RFQ_LIST_ITEMS: readonly RfqListItem[] = BUYER_RFQ_UNIVERSE.map((r) => ({
  id: r.detail.id,
  humanRef: r.detail.humanRef,
  title: r.detail.title,
  state: r.detail.state,
  value: r.detail.value,
  category: r.detail.category,
  updatedAt: r.detail.updatedAt,
})).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Vendor universe — received invitations / own quotations across their frozen states.
// ────────────────────────────────────────────────────────────────────────────────────────────────

export const VENDOR_QUOTA: QuotaView = {
  used: 7,
  limit: 10,
  resets_label: "Resets Aug 1, 2026",
};

export const VENDOR_RFQ_UNIVERSE: readonly VendorRfqRecord[] = [
  {
    // The vendor deep universe — the existing reviewed snapshot seed (rfq-000318).
    inbox: {
      rfq_id: "rfq-000318",
      rfq_human_ref: "RFQ-2026-000318",
      rfq_summary: RFQ_SNAPSHOT_SEED.summary,
      rfq_state: "vendors_notified",
      window_state: "open",
      window_deadline_label: RFQ_SNAPSHOT_SEED.window_deadline_label,
      window_urgency: "normal",
      invitation_state: "delivered",
    },
    snapshot: RFQ_SNAPSHOT_SEED,
    invitation: {
      id: "inv-000318",
      rfq_id: "rfq-000318",
      state: "delivered",
      delivered_at: "2026-07-03T09:25:00+06:00",
    },
    builder: {
      rfqHumanRef: "RFQ-2026-000318",
      versionLockedLabel: RFQ_SNAPSHOT_SEED.version_locked_label,
      windowState: RFQ_SNAPSHOT_SEED.window_state,
      windowDeadlineLabel: RFQ_SNAPSHOT_SEED.window_deadline_label,
      windowUrgency: RFQ_SNAPSHOT_SEED.window_urgency,
      currency: "BDT",
    },
  },
  {
    inbox: {
      rfq_id: "rfq-000322",
      rfq_human_ref: "RFQ-2026-000322",
      rfq_summary: "Generator spares — AVR modules and filter sets for two 800 kVA sets",
      rfq_state: "vendors_notified",
      window_state: "open",
      window_deadline_label: "Jul 12, 2026 · 5:00 PM",
      window_urgency: "soon",
      invitation_state: "accepted",
      quotation_state: "draft",
    },
    snapshot: {
      rfq_id: "rfq-000322",
      human_ref: "RFQ-2026-000322",
      summary: "Generator spares — AVR modules and filter sets for two 800 kVA sets",
      state: "vendors_notified",
      scope_text:
        "Supply of two AVR modules (OEM or equivalent) and twelve complete filter sets for two 800 kVA diesel generator sets, delivered to the plant store.",
      work_nature: ["supply"],
      category_label: "Power Generation",
      estimated_value: 420000,
      currency: "BDT",
      delivery_geography: "Mymensingh",
      no_formal_spec: true,
      version_locked_label: "Quoting against v1",
      window_state: "open",
      window_deadline_label: "Jul 12, 2026 · 5:00 PM",
      window_urgency: "soon",
      item_name: "AVR modules + filter sets",
      quantity: "2 + 12",
      unit: "set",
      product_condition: "New",
      delivery_location: "Plant store, Mymensingh",
      preferred_contact_channels: ["platform"],
    },
    invitation: {
      id: "inv-000322",
      rfq_id: "rfq-000322",
      state: "accepted",
      delivered_at: "2026-07-01T10:00:00+06:00",
      responded_at: "2026-07-01T15:20:00+06:00",
    },
    quotation: {
      id: "qtn-000322",
      rfq_id: "rfq-000322",
      state: "draft",
      current_version_no: 1,
      versions: [{ version_no: 1, is_current: true, created_at: "2026-07-02T09:00:00+06:00" }],
    },
    builder: {
      rfqHumanRef: "RFQ-2026-000322",
      versionLockedLabel: "Quoting against v1",
      windowState: "open",
      windowDeadlineLabel: "Jul 12, 2026 · 5:00 PM",
      windowUrgency: "soon",
      currency: "BDT",
      lines: [
        { description: "AVR module (OEM-equivalent)", qty: 2, unit_amount: 95000, amount: 190000 },
        {
          description: "Filter set (oil + fuel + air)",
          qty: 12,
          unit_amount: 14500,
          amount: 174000,
        },
      ],
      subtotal: 364000,
      deliveryTerms: "Delivered to plant store within 10 days of PO.",
      warrantyTerms: "6 months on AVR modules.",
    },
  },
  {
    inbox: {
      rfq_id: "rfq-000305",
      rfq_human_ref: "RFQ-2026-000305",
      rfq_summary: "Air compressor annual service — two 75 kW screw compressors",
      rfq_state: "quotations_received",
      window_state: "open",
      window_deadline_label: "Jul 18, 2026 · 5:00 PM",
      window_urgency: "normal",
      invitation_state: "accepted",
      quotation_state: "submitted",
      unread_clarification: true,
    },
    snapshot: {
      rfq_id: "rfq-000305",
      human_ref: "RFQ-2026-000305",
      summary: "Air compressor annual service — two 75 kW screw compressors",
      state: "quotations_received",
      scope_text:
        "Annual service of two 75 kW screw compressors including consumables, airend inspection and vibration report.",
      work_nature: ["service"],
      category_label: "Pumps & Compressors",
      estimated_value: 380000,
      currency: "BDT",
      delivery_geography: "Gazipur",
      no_formal_spec: false,
      version_locked_label: "Quoting against v1",
      window_state: "open",
      window_deadline_label: "Jul 18, 2026 · 5:00 PM",
      window_urgency: "normal",
      preferred_contact_channels: ["platform", "email"],
    },
    invitation: {
      id: "inv-000305",
      rfq_id: "rfq-000305",
      state: "accepted",
      delivered_at: "2026-06-26T09:00:00+06:00",
      responded_at: "2026-06-26T11:45:00+06:00",
    },
    quotation: {
      id: "qtn-000305",
      human_ref: "QTN-2026-000512",
      rfq_id: "rfq-000305",
      state: "submitted",
      current_version_no: 2,
      versions: [
        {
          version_no: 2,
          is_current: true,
          supersedes_version_no: 1,
          created_at: "2026-07-03T14:20:00+06:00",
        },
        { version_no: 1, created_at: "2026-06-28T10:30:00+06:00" },
      ],
    },
    builder: {
      rfqHumanRef: "RFQ-2026-000305",
      versionLockedLabel: "Quoting against v1",
      windowState: "open",
      windowDeadlineLabel: "Jul 18, 2026 · 5:00 PM",
      windowUrgency: "normal",
      currency: "BDT",
      lines: [
        {
          description: "Annual service — 75 kW screw compressor",
          qty: 2,
          unit_amount: 145000,
          amount: 290000,
        },
        { description: "Consumables kit", qty: 2, unit_amount: 32000, amount: 64000 },
      ],
      subtotal: 354000,
      deliveryTerms: "Service within agreed shutdown window; 2 days per machine.",
      warrantyTerms: "6 months on serviced airend.",
      specComplianceDeclaration: "OEM service checklist followed; vibration report included.",
    },
  },
  {
    inbox: {
      rfq_id: "rfq-000298",
      rfq_human_ref: "RFQ-2026-000298",
      rfq_summary: "SS304 pipe fittings — flanges, elbows and tees for the CIP line",
      rfq_state: "buyer_reviewing",
      window_state: "closed",
      window_deadline_label: "Closed Jun 30, 2026",
      invitation_state: "accepted",
      quotation_state: "shortlisted",
    },
    snapshot: {
      rfq_id: "rfq-000298",
      human_ref: "RFQ-2026-000298",
      summary: "SS304 pipe fittings — flanges, elbows and tees for the CIP line",
      state: "buyer_reviewing",
      scope_text: "Supply of SS304 sanitary fittings per the attached BOM for the CIP line revamp.",
      work_nature: ["supply"],
      category_label: "Piping & Fittings",
      estimated_value: 560000,
      currency: "BDT",
      delivery_geography: "Bhaluka",
      no_formal_spec: false,
      version_locked_label: "Quoted against v2",
      window_state: "closed",
      window_deadline_label: "Closed Jun 30, 2026",
    },
    invitation: {
      id: "inv-000298",
      rfq_id: "rfq-000298",
      state: "accepted",
      delivered_at: "2026-06-18T09:00:00+06:00",
      responded_at: "2026-06-18T14:00:00+06:00",
    },
    quotation: {
      id: "qtn-000298",
      human_ref: "QTN-2026-000498",
      rfq_id: "rfq-000298",
      state: "shortlisted",
      current_version_no: 1,
      versions: [{ version_no: 1, is_current: true, created_at: "2026-06-24T10:00:00+06:00" }],
    },
  },
  {
    inbox: {
      rfq_id: "rfq-000287",
      rfq_human_ref: "RFQ-2026-000287",
      rfq_summary: "Dyeing machine heat exchanger — fabricate & install",
      rfq_state: "closed_won",
      window_state: "closed",
      window_deadline_label: "Closed Jun 20, 2026",
      invitation_state: "accepted",
      quotation_state: "selected",
    },
    snapshot: {
      rfq_id: "rfq-000287",
      human_ref: "RFQ-2026-000287",
      summary: "Dyeing machine heat exchanger — fabricate & install",
      state: "closed_won",
      scope_text:
        "Fabricate and install one SS316 shell-and-tube heat exchanger for dyeing machine DM-4.",
      work_nature: ["fabricate", "service"],
      category_label: "Process Equipment",
      estimated_value: 1350000,
      currency: "BDT",
      delivery_geography: "Narayanganj",
      no_formal_spec: false,
      version_locked_label: "Quoted against v1",
      window_state: "closed",
      window_deadline_label: "Closed Jun 20, 2026",
    },
    invitation: {
      id: "inv-000287",
      rfq_id: "rfq-000287",
      state: "accepted",
      delivered_at: "2026-06-05T09:00:00+06:00",
      responded_at: "2026-06-05T13:30:00+06:00",
    },
    quotation: {
      id: "qtn-000287",
      human_ref: "QTN-2026-000455",
      rfq_id: "rfq-000287",
      state: "selected",
      current_version_no: 1,
      versions: [{ version_no: 1, is_current: true, created_at: "2026-06-12T11:00:00+06:00" }],
    },
    engagement: {
      href: "/sell/engagements",
      acceptance_deadline_label: "Accept by Jul 20, 2026",
    },
  },
  {
    // Not-selected outcome: `rfq_state` deliberately omitted (own-outcome chip labelling — see header).
    inbox: {
      rfq_id: "rfq-000281",
      rfq_human_ref: "RFQ-2026-000281",
      rfq_summary: "Boiler water treatment chemicals — annual supply",
      window_state: "closed",
      window_deadline_label: "Closed Jun 15, 2026",
      invitation_state: "accepted",
      quotation_state: "not_selected",
    },
    snapshot: {
      rfq_id: "rfq-000281",
      human_ref: "RFQ-2026-000281",
      summary: "Boiler water treatment chemicals — annual supply",
      scope_text:
        "Annual rate contract for oxygen scavenger, alkalinity builder and sludge conditioner.",
      work_nature: ["supply"],
      category_label: "Industrial Chemicals",
      estimated_value: 900000,
      currency: "BDT",
      delivery_geography: "Savar",
      no_formal_spec: true,
      version_locked_label: "Quoted against v1",
      window_state: "closed",
      window_deadline_label: "Closed Jun 15, 2026",
    },
    invitation: {
      id: "inv-000281",
      rfq_id: "rfq-000281",
      state: "accepted",
      delivered_at: "2026-06-01T09:00:00+06:00",
      responded_at: "2026-06-01T10:15:00+06:00",
    },
    quotation: {
      id: "qtn-000281",
      human_ref: "QTN-2026-000431",
      rfq_id: "rfq-000281",
      state: "not_selected",
      current_version_no: 1,
      versions: [{ version_no: 1, is_current: true, created_at: "2026-06-08T09:30:00+06:00" }],
    },
  },
  {
    inbox: {
      rfq_id: "rfq-000275",
      rfq_human_ref: "RFQ-2026-000275",
      rfq_summary: "Crane rental 50-ton — turbine hall lift, 3 days",
      window_state: "closed",
      window_deadline_label: "Closed Jun 10, 2026",
      invitation_state: "declined",
    },
    snapshot: {
      rfq_id: "rfq-000275",
      human_ref: "RFQ-2026-000275",
      summary: "Crane rental 50-ton — turbine hall lift, 3 days",
      scope_text: "50-ton mobile crane with certified operator for a 3-day turbine hall lift.",
      work_nature: ["service"],
      category_label: "Heavy Equipment Rental",
      estimated_value: 450000,
      currency: "BDT",
      delivery_geography: "Ashuganj",
      no_formal_spec: true,
      version_locked_label: "Invitation declined",
      window_state: "closed",
      window_deadline_label: "Closed Jun 10, 2026",
    },
    invitation: {
      id: "inv-000275",
      rfq_id: "rfq-000275",
      state: "declined",
      delivered_at: "2026-06-02T09:00:00+06:00",
      responded_at: "2026-06-02T16:40:00+06:00",
    },
  },
  {
    inbox: {
      rfq_id: "rfq-000269",
      rfq_human_ref: "RFQ-2026-000269",
      rfq_summary: "PLC panel retrofit — consultancy for line 2 modernization",
      window_state: "closed",
      window_deadline_label: "Closed Jun 5, 2026",
      invitation_state: "expired",
    },
    snapshot: {
      rfq_id: "rfq-000269",
      human_ref: "RFQ-2026-000269",
      summary: "PLC panel retrofit — consultancy for line 2 modernization",
      scope_text: "Consultancy scope for retrofitting the line-2 PLC panels to a modern platform.",
      work_nature: ["consult"],
      category_label: "Automation & Control",
      estimated_value: 300000,
      currency: "BDT",
      delivery_geography: "Gazipur",
      no_formal_spec: true,
      version_locked_label: "Invitation expired",
      window_state: "closed",
      window_deadline_label: "Closed Jun 5, 2026",
    },
    invitation: {
      id: "inv-000269",
      rfq_id: "rfq-000269",
      state: "expired",
      delivered_at: "2026-05-28T09:00:00+06:00",
    },
  },
] as const;

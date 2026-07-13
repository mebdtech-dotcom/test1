// RFQ WORKFLOW — Mock adapter (the stand-in SERVER data layer).
//
// Implements `RfqWorkflowData` over the fixture universe. Everything a wired server layer would
// derive is derived HERE — counts, facets, fallback projections, ordering — never in a component
// (R7 / GI-04 / GI-10: the presentation renders what this layer supplies and computes nothing).
// Lookups by unknown id resolve to `null` ≡ genuine absence, so every page keeps its byte-identical
// not-found behaviour (GI-12 / Inv #11).

import type { MoneyValue } from "@/frontend/components/format";
import type { RfqState } from "@/frontend/components/rfq";
import type {
  ComparativeStatementData,
  CsLineItem,
} from "../../../../(workspace)/buy/_components/comparative-statement";
import type { RfqPipelineStage } from "../../../../(workspace)/buy/_components/view-models";
import type { JourneyBucketCount } from "../../journey";
import { BUYER_PIPELINE_BUCKETS } from "../../journey";
import type { RfqWorkflowData } from "../types";
import { CS_UNIVERSE } from "./cs-universe";
import {
  BUYER_RFQ_LIST_ITEMS,
  BUYER_RFQ_UNIVERSE,
  VENDOR_QUOTA,
  VENDOR_RFQ_UNIVERSE,
} from "./rfq-universe";

/** Frozen lifecycle order for the per-state facet read (display order of the sourcing funnel). */
const RFQ_STATE_ORDER: readonly RfqState[] = [
  "draft",
  "pending_internal_approval",
  "submitted",
  "under_review",
  "matching",
  "vendors_notified",
  "quotations_received",
  "buyer_reviewing",
  "shortlisted",
  "closed_won",
  "closed_lost",
  "expired",
  "cancelled",
];

function findBuyerRecord(rfqId: string) {
  return BUYER_RFQ_UNIVERSE.find((r) => r.detail.id === rfqId) ?? null;
}

function findVendorRecord(rfqId: string) {
  return VENDOR_RFQ_UNIVERSE.find((r) => r.inbox.rfq_id === rfqId) ?? null;
}

/** The vendor journey buckets — own invitation/quotation facts only (ND-safe by construction). */
function vendorPipelineSummary(): JourneyBucketCount[] {
  const rows = VENDOR_RFQ_UNIVERSE.map((r) => r.inbox);
  const count = (predicate: (row: (typeof rows)[number]) => boolean) =>
    rows.filter(predicate).length;
  return [
    {
      key: "new",
      label: "New invitations",
      count: count((r) => r.invitation_state === "delivered"),
    },
    {
      key: "preparing",
      label: "Preparing quote",
      count: count(
        (r) =>
          r.invitation_state === "accepted" &&
          (r.quotation_state === undefined || r.quotation_state === "draft"),
      ),
    },
    {
      key: "submitted",
      label: "Submitted",
      count: count((r) => r.quotation_state === "submitted"),
    },
    {
      key: "shortlisted",
      label: "Shortlisted",
      count: count((r) => r.quotation_state === "shortlisted"),
    },
    { key: "won", label: "Awarded", count: count((r) => r.quotation_state === "selected") },
    {
      key: "not_selected",
      label: "Not selected",
      count: count((r) => r.quotation_state === "not_selected"),
    },
    {
      key: "closed",
      label: "Declined / expired",
      count: count(
        (r) =>
          r.invitation_state === "declined" ||
          r.invitation_state === "expired" ||
          r.quotation_state === "withdrawn" ||
          r.quotation_state === "expired",
      ),
    },
  ];
}

export const mockRfqWorkflowData: RfqWorkflowData = {
  buyer: {
    async listRfqs() {
      return {
        items: [...BUYER_RFQ_LIST_ITEMS],
        nextCursor: null,
        total: BUYER_RFQ_LIST_ITEMS.length,
      };
    },

    async getRfqPipeline(): Promise<RfqPipelineStage[]> {
      return RFQ_STATE_ORDER.map((state) => ({
        state,
        count: BUYER_RFQ_UNIVERSE.filter((r) => r.detail.state === state).length,
      })).filter((stage) => stage.count > 0);
    },

    async getPipelineSummary(): Promise<JourneyBucketCount[]> {
      return BUYER_PIPELINE_BUCKETS.map((bucket) => ({
        key: bucket.key,
        label: bucket.label,
        count: BUYER_RFQ_UNIVERSE.filter((r) => bucket.states.includes(r.detail.state)).length,
      }));
    },

    async getRfq(rfqId) {
      return findBuyerRecord(rfqId)?.detail ?? null;
    },

    async getRfqVersions(rfqId) {
      const record = findBuyerRecord(rfqId);
      if (!record) return null;
      if (record.versions) return record.versions;
      // Single-revision projection for fixtures without an amendment history (v1 = current content).
      const d = record.detail;
      return {
        id: d.id,
        humanRef: d.humanRef,
        state: d.state,
        currentVersionNo: d.currentVersionNo ?? 1,
        versions: [
          {
            versionNo: d.currentVersionNo ?? 1,
            content: {
              title: d.title,
              summary: d.summary,
              category: d.category,
              value: d.value,
              deliveryLocation: d.deliveryLocation,
              neededBy: d.neededBy,
            },
          },
        ],
      };
    },

    async getRoutingInvitations(rfqId) {
      const record = findBuyerRecord(rfqId);
      if (!record) return null;
      if (record.routing) return record.routing;
      // Honest empty log for RFQs routing has not reached (draft/approval/validation stages).
      const d = record.detail;
      return {
        id: d.id,
        humanRef: d.humanRef,
        state: d.state,
        routingLog: [],
        routingNextCursor: null,
        invitations: [],
        invitationsNextCursor: null,
      };
    },

    async getComparison(rfqId) {
      // Genuine absence before the first quotation (the statement auto-generates from it).
      return findBuyerRecord(rfqId)?.comparison ?? null;
    },

    async getComparativeStatement(rfqId, selectedQuotationIds) {
      // The CS is a print-view projection over the comparison statement (freeze v1.0 §3) —
      // unknown id, pre-first-quotation, and no-CS-fixture all collapse to the same genuine
      // absence (Inv #11 / GI-12). ALL arithmetic below is computed in this adapter — the
      // stand-in server — never in components (R7).
      const record = findBuyerRecord(rfqId);
      const fixture = CS_UNIVERSE[rfqId];
      if (!record?.comparison || !fixture) return null;

      // W-1: the Workspace selection (2–5) is the CS vendor set, kept in STATEMENT order;
      // an absent/invalid selection renders the full disclosed set (D1 conformance note).
      const suppliers = record.comparison.suppliers;
      let chosen = suppliers;
      if (selectedQuotationIds && selectedQuotationIds.length > 0) {
        const filtered = suppliers.filter((s) => selectedQuotationIds.includes(s.quotationId));
        if (filtered.length >= 2 && filtered.length <= 5) chosen = filtered;
      }

      const money = (amount: number): MoneyValue => ({ amount, currency: fixture.currency });
      const vendors = chosen.map((s) => ({
        quotationId: s.quotationId,
        vendorName: s.vendorName,
        quotationRef: record.quotationDetails?.find((q) => q.id === s.quotationId)?.humanRef,
        receivedAt: record.detail.quotations?.items.find((q) => q.id === s.quotationId)
          ?.submittedAt,
        deliveryOffer: s.delivery,
      }));

      const items: CsLineItem[] = fixture.items.map((item, i) => {
        const cells = chosen.map((s) => {
          if (s.sealed) return { sealed: true as const };
          const unit = item.unitPrices[s.quotationId];
          if (unit === undefined) return {};
          return { unitPrice: money(unit), totalPrice: money(unit * item.quantity) };
        });
        const disclosed = cells
          .map((cell, vi) => ({ vi, unit: cell.unitPrice?.amount }))
          .filter((c): c is { vi: number; unit: number } => c.unit !== undefined);
        const lowest = disclosed.length ? Math.min(...disclosed.map((c) => c.unit)) : undefined;
        return {
          sl: i + 1,
          description: item.description,
          specification: item.specification,
          unit: item.unit,
          quantity: item.quantity,
          cells,
          lowestUnitPrice: lowest === undefined ? undefined : money(lowest),
          lowestVendorIdx:
            lowest === undefined
              ? undefined
              : disclosed.filter((c) => c.unit === lowest).map((c) => c.vi),
        };
      });

      const subTotals = chosen.map((s) =>
        fixture.items.reduce((sum, item) => {
          const unit = item.unitPrices[s.quotationId];
          return unit === undefined ? sum : sum + unit * item.quantity;
        }, 0),
      );
      const vatAmounts = subTotals.map((sub) => Math.round(sub * (fixture.vatRatePct / 100)));
      const grandTotals = subTotals.map((sub, vi) => sub + vatAmounts[vi]);
      const order = grandTotals.map((_, vi) => vi).sort((a, b) => grandTotals[a] - grandTotals[b]);
      const lowestVendorIdx = order[0];
      const secondLowestVendorIdx = order.length > 1 ? order[1] : undefined;
      const difference =
        secondLowestVendorIdx === undefined
          ? undefined
          : grandTotals[secondLowestVendorIdx] - grandTotals[lowestVendorIdx];

      // Evaluative content = the BUYER's record (R6): fixture rows are keyed by quotation id and
      // resolve against the chosen set — an excluded vendor simply drops out of the buyer view.
      const idx = (quotationId: string) => chosen.findIndex((s) => s.quotationId === quotationId);
      const evaluation = fixture.evaluation;
      const evaluationOrder = (evaluation?.orderedQuotationIds ?? [])
        .map((row) => ({ vendorIdx: idx(row.quotationId), technical: row.technical }))
        .filter((row) => row.vendorIdx >= 0);
      const recommendedVendorIdx =
        evaluation?.recommendedQuotationId === undefined
          ? undefined
          : (() => {
              const vi = idx(evaluation.recommendedQuotationId);
              return vi >= 0 ? vi : undefined;
            })();

      const statement: ComparativeStatementData = {
        rfqId: record.detail.id,
        humanRef: record.detail.humanRef,
        // MAJOR-2 / MINOR-1: mock-era Draft Reference derived from the RFQ ref — no CS- series
        // exists until ESC-CS-REF; this single field swaps to the official reference on approval.
        draftReference: `Draft — official series pending approval (ref. ${record.detail.humanRef})`,
        rfqTitle: record.detail.title,
        project: fixture.project,
        deliveryLocation: record.detail.deliveryLocation,
        issueDate: fixture.issueDate,
        currency: fixture.currency,
        preparedByLabel: fixture.preparedByLabel,
        letterhead: fixture.letterhead,
        vendors,
        items,
        computed: {
          subTotals: subTotals.map(money),
          vatRatePct: fixture.vatRatePct,
          vatAmounts: vatAmounts.map(money),
          grandTotals: grandTotals.map(money),
          lowestVendorIdx,
          secondLowestVendorIdx,
          differenceAmount: difference === undefined ? undefined : money(difference),
          differencePct:
            difference === undefined || secondLowestVendorIdx === undefined
              ? undefined
              : `${((difference / grandTotals[secondLowestVendorIdx]) * 100).toFixed(2)}%`,
          totalItems: items.length,
          // Rows resolve against the CHOSEN set — an excluded vendor's row drops out entirely
          // (never name a vendor the buyer excluded from this rendering).
          deliveryComparison: fixture.deliveryComparison
            .filter((row) => idx(row.quotationId) >= 0)
            .map((row) => ({
              label: row.label,
              value: `${row.value} — ${chosen[idx(row.quotationId)].vendorName}`,
            })),
        },
        buyerEvaluation:
          evaluation === undefined
            ? undefined
            : {
                buyerAuthored: true,
                executiveSummary: evaluation.executiveSummary,
                evaluationOrder,
                technicalSummary: evaluation.technicalSummary,
                recommendedVendorIdx,
                reasons: evaluation.reasons,
                risk: evaluation.risk,
                commercialAdvantage: evaluation.commercialAdvantage,
                remarks: evaluation.remarks,
              },
        approvals: fixture.approvals,
      };
      return statement;
    },

    async getAwardShortlist(rfqId) {
      const record = findBuyerRecord(rfqId);
      if (!record) return null;
      if (record.award) return record.award;
      // No shortlist yet ⇒ the award wizard's honest "shortlist first" empty (never a default winner).
      return { rfqId: record.detail.id, humanRef: record.detail.humanRef, candidates: [] };
    },

    async getQuotationDetail(rfqId, quotationId) {
      return findBuyerRecord(rfqId)?.quotationDetails?.find((q) => q.id === quotationId) ?? null;
    },
  },

  vendor: {
    async listInbox() {
      return VENDOR_RFQ_UNIVERSE.map((r) => r.inbox);
    },

    async getQuota() {
      return VENDOR_QUOTA;
    },

    async getPipelineSummary() {
      return vendorPipelineSummary();
    },

    async getRfqSnapshot(rfqId) {
      return findVendorRecord(rfqId)?.snapshot ?? null;
    },

    async getInvitation(rfqId) {
      return findVendorRecord(rfqId)?.invitation ?? null;
    },

    async getOwnQuotation(rfqId) {
      return findVendorRecord(rfqId)?.quotation ?? null;
    },

    async getEngagementHandoff(rfqId) {
      return findVendorRecord(rfqId)?.engagement ?? null;
    },

    async getQuotationDraft(rfqId) {
      return findVendorRecord(rfqId)?.builder ?? null;
    },
  },
};

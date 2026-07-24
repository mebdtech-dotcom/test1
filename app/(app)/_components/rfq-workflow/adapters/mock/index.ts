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
import type {
  RfqPipelineStage,
  QuotationState,
} from "../../../../(workspace)/buy/_components/view-models";
import type {
  BuyerOrgQuotationItem,
  ComparableRfqOption,
} from "../../../../(workspace)/buy/_components/quotations/org-quotation-view-models";
import { MIN_COMPARE } from "../../../../(workspace)/buy/_components/comparison-workspace/selection";
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

// ── Received Quotes / Compare Quotes derivation (ESC-BUY-QUOTES-LIST — GATED) ───────────────────
//
// Everything below is derived HERE because this file stands in for the SERVER. Counts, the expiry flag,
// comparison eligibility and row order are all server facts (R7 / GI-04 / GI-10): the presentation renders
// them and recomputes nothing. When the Board rules ESC-BUY-QUOTES-LIST, the wired resolver replaces these
// functions and no page changes.

/**
 * The fixture universe's authored "today". A wired server would use the request instant; the mock pins an
 * explicit constant so the expiry-window arithmetic (and its tests) are DETERMINISTIC — a `Date.now()` here
 * would make the tiles drift and the suite flake. Matches the universe's own latest-activity window.
 */
const MOCK_CLOCK = new Date("2026-07-05T09:00:00+06:00");

/** Expiry-notice window. At wiring this is a server POLICY value, not a client constant. */
const EXPIRY_NOTICE_DAYS = 7;

const MS_PER_DAY = 86_400_000;

/** Quotation states still awaiting the buyer — the only ones for which "expiring" is meaningful. */
const OPEN_QUOTATION_STATES: readonly QuotationState[] = ["submitted", "shortlisted"];

/** Quotation states no longer awaiting the buyer. `withdrawn` is included NON-PENALIZINGLY (Doc-3 §8.3). */
const CONCLUDED_QUOTATION_STATES: readonly QuotationState[] = [
  "selected",
  "not_selected",
  "withdrawn",
  "expired",
];

/**
 * Validity-window arithmetic only — an open quotation whose validity ends within the notice window. This is
 * never a judgement about the vendor, and it is never derived from price, rank or any governance signal.
 */
function isExpiringSoon(state: QuotationState, validUntil: string | undefined): boolean {
  if (validUntil === undefined) return false;
  if (!OPEN_QUOTATION_STATES.includes(state)) return false;
  const endsAt = Date.parse(validUntil);
  if (Number.isNaN(endsAt)) return false;
  const daysRemaining = (endsAt - MOCK_CLOCK.getTime()) / MS_PER_DAY;
  return daysRemaining >= 0 && daysRemaining <= EXPIRY_NOTICE_DAYS;
}

/** Disclosed-quotation count for an RFQ — the comparison set. Never a count of anything withheld. */
function disclosedComparisonCount(rfqId: string): number {
  return BUYER_RFQ_UNIVERSE.find((r) => r.detail.id === rfqId)?.comparison?.suppliers.length ?? 0;
}

/**
 * Flatten the per-RFQ disclosed quotation lists into the buyer-org aggregate, then apply the stand-in
 * server's GOVERNED ORDER: most recently received first, opaque id as a stable tiebreak. The UI renders
 * this order verbatim and never re-ranks it (R6 / GI-04).
 */
function buildOrgQuotationRows(): BuyerOrgQuotationItem[] {
  const rows: BuyerOrgQuotationItem[] = [];
  for (const record of BUYER_RFQ_UNIVERSE) {
    const quotations = record.detail.quotations?.items ?? [];
    const comparable = (record.comparison?.suppliers.length ?? 0) >= MIN_COMPARE;
    for (const quotation of quotations) {
      rows.push({
        id: quotation.id,
        // The QTN human ref lives on the detail projection; absent ⇒ the row simply shows no ref.
        humanRef: record.quotationDetails?.find((d) => d.id === quotation.id)?.humanRef,
        rfqId: record.detail.id,
        rfqHumanRef: record.detail.humanRef,
        rfqTitle: record.detail.title,
        vendorName: quotation.vendorName,
        state: quotation.state,
        amount: quotation.amount,
        validUntil: quotation.validUntil,
        submittedAt: quotation.submittedAt,
        expiringSoon: isExpiringSoon(quotation.state, quotation.validUntil),
        comparable,
      });
    }
  }
  return rows.sort((a, b) => {
    const aAt = a.submittedAt ? Date.parse(a.submittedAt) : 0;
    const bAt = b.submittedAt ? Date.parse(b.submittedAt) : 0;
    if (bAt !== aAt) return bAt - aAt;
    return a.id.localeCompare(b.id);
  });
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

    async listOrgQuotations() {
      const items = buildOrgQuotationRows();

      // Counts span the WHOLE org scope, never the rendered/filtered subset (R7 / GI-12).
      const countWhere = (predicate: (row: BuyerOrgQuotationItem) => boolean) =>
        items.filter(predicate).length;

      const perStateCounts: Partial<Record<QuotationState, number>> = {};
      for (const row of items) {
        perStateCounts[row.state] = (perStateCounts[row.state] ?? 0) + 1;
      }

      // Facets follow first appearance in the governed order — the client invents no facet set.
      const seenRfqIds = new Set<string>();
      const rfqFacets = [];
      for (const row of items) {
        if (seenRfqIds.has(row.rfqId)) continue;
        seenRfqIds.add(row.rfqId);
        rfqFacets.push({ rfqId: row.rfqId, humanRef: row.rfqHumanRef, title: row.rfqTitle });
      }

      return {
        items,
        stateCounts: {
          awaitingReview: countWhere((r) => r.state === "submitted"),
          shortlisted: countWhere((r) => r.state === "shortlisted"),
          expiringSoon: countWhere((r) => r.expiringSoon === true),
          concluded: countWhere((r) => CONCLUDED_QUOTATION_STATES.includes(r.state)),
        },
        perStateCounts,
        rfqFacets,
        // Single fixture page; the wired read is cursor-paginated (GI-03).
        nextCursor: null,
        total: items.length,
      };
    },

    async listComparableRfqs(): Promise<ComparableRfqOption[]> {
      // Only RFQs that actually have disclosed quotations appear. An RFQ with too few to compare is shown
      // INELIGIBLE with a plain reason rather than hidden — hiding it would read as "something happened to
      // this RFQ"; stating "one quotation received" is the honest, non-disclosing explanation (Inv #11).
      return BUYER_RFQ_UNIVERSE.filter((r) => (r.comparison?.suppliers.length ?? 0) > 0).map(
        (r) => {
          const quotationCount = disclosedComparisonCount(r.detail.id);
          const eligible = quotationCount >= MIN_COMPARE;
          return {
            rfqId: r.detail.id,
            humanRef: r.detail.humanRef,
            title: r.detail.title,
            quotationCount,
            eligible,
            ineligibleReason: eligible
              ? undefined
              : `Only ${quotationCount} quotation received — at least ${MIN_COMPARE} are needed to compare.`,
          };
        },
      );
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

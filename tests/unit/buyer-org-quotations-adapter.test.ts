import { describe, expect, it } from "vitest";
import { rfqWorkflowData } from "../../app/(app)/_components/rfq-workflow/adapters";
import {
  filterReceivedQuotes,
  parseReceivedQuotesQuery,
} from "../../app/(app)/(workspace)/buy/_components/quotations/query-state";
import { MIN_COMPARE } from "../../app/(app)/(workspace)/buy/_components/comparison-workspace/selection";

// The Received Quotes / Compare Quotes read seam.
//
// This adapter stands in for the SERVER, so the properties asserted here are the ones the wired resolver
// must also satisfy. They are written as INVARIANTS rather than hard-coded totals: a fixture edit should
// not break the suite, but a regression in how figures are derived must.
//
// The load-bearing one is the count invariant. The tiles are org-scope figures delivered with the read
// (R7); if anyone ever recomputes them from the rendered rows, the page starts under-reporting the moment
// a filter is applied — and a client-side count would additionally leak the size of the withheld set.

const buyer = rfqWorkflowData.buyer;

describe("listOrgQuotations — shape and scope", () => {
  it("resolves a snapshot rather than a bare array", async () => {
    const data = await buyer.listOrgQuotations();
    expect(data).not.toBeNull();
    expect(Array.isArray(data!.items)).toBe(true);
    expect(data!.items.length).toBeGreaterThan(0);
  });

  it("flattens every RFQ's disclosed quotations with its owning RFQ context", async () => {
    const data = (await buyer.listOrgQuotations())!;
    for (const row of data.items) {
      expect(row.rfqId).toBeTruthy();
      expect(row.rfqHumanRef).toMatch(/^RFQ-/);
      expect(row.rfqTitle).toBeTruthy();
      expect(row.vendorName).toBeTruthy();
    }
  });

  it("never surfaces a vendor-private draft quotation", async () => {
    const data = (await buyer.listOrgQuotations())!;
    expect(data.items.some((row) => row.state === "draft")).toBe(false);
  });

  it("carries the multi-quotation RFQs the fixtures define", async () => {
    const data = (await buyer.listOrgQuotations())!;
    const countFor = (rfqId: string) => data.items.filter((r) => r.rfqId === rfqId).length;
    expect(countFor("rfq-000119")).toBe(3);
    expect(countFor("rfq-000123")).toBe(2);
    expect(countFor("rfq-000117")).toBe(1);
  });
});

describe("listOrgQuotations — governed order", () => {
  it("returns rows most-recently-received first, with a stable tiebreak", async () => {
    const data = (await buyer.listOrgQuotations())!;
    const times = data.items.map((r) => (r.submittedAt ? Date.parse(r.submittedAt) : 0));
    for (let i = 1; i < times.length; i += 1) {
      expect(times[i - 1]).toBeGreaterThanOrEqual(times[i]);
    }
  });

  it("is deterministic across calls — the UI must be able to render it verbatim", async () => {
    const a = (await buyer.listOrgQuotations())!;
    const b = (await buyer.listOrgQuotations())!;
    expect(a.items.map((r) => r.id)).toEqual(b.items.map((r) => r.id));
  });
});

describe("listOrgQuotations — server-computed figures (R7)", () => {
  it("derives every tile from the full org scope", async () => {
    const data = (await buyer.listOrgQuotations())!;
    const { items, stateCounts } = data;
    expect(stateCounts.awaitingReview).toBe(items.filter((r) => r.state === "submitted").length);
    expect(stateCounts.shortlisted).toBe(items.filter((r) => r.state === "shortlisted").length);
    expect(stateCounts.expiringSoon).toBe(items.filter((r) => r.expiringSoon === true).length);
    expect(stateCounts.concluded).toBe(
      items.filter((r) => ["selected", "not_selected", "withdrawn", "expired"].includes(r.state))
        .length,
    );
  });

  it("counts each state exactly once in perStateCounts", async () => {
    const data = (await buyer.listOrgQuotations())!;
    const summed = Object.values(data.perStateCounts).reduce<number>((a, b) => a + (b ?? 0), 0);
    expect(summed).toBe(data.items.length);
  });

  it("keeps the tiles unchanged when the view is filtered", async () => {
    // The regression this pins: tiles recomputed from the rendered rows. Filtering to a single state
    // must not move the org-scope figures.
    const data = (await buyer.listOrgQuotations())!;
    const query = parseReceivedQuotesQuery(
      { state: "shortlisted" },
      data.rfqFacets.map((f) => f.rfqId),
    );
    const rows = filterReceivedQuotes(data.items, query);

    expect(rows.length).toBeLessThan(data.items.length);
    expect(data.stateCounts.awaitingReview).toBe(
      data.items.filter((r) => r.state === "submitted").length,
    );
    // …and the filtered view does not equal the org-scope figure it would be confused with.
    expect(rows.length).not.toBe(data.stateCounts.awaitingReview + data.stateCounts.concluded);
  });

  it("only flags an OPEN quotation as expiring — a concluded one never expires 'soon'", async () => {
    const data = (await buyer.listOrgQuotations())!;
    for (const row of data.items.filter((r) => r.expiringSoon)) {
      expect(["submitted", "shortlisted"]).toContain(row.state);
      expect(row.validUntil).toBeTruthy();
    }
  });

  it("is deterministic — the expiry window is pinned to a fixture clock, not wall time", async () => {
    const a = (await buyer.listOrgQuotations())!;
    const b = (await buyer.listOrgQuotations())!;
    expect(a.stateCounts).toEqual(b.stateCounts);
  });
});

describe("listOrgQuotations — facets", () => {
  it("lists each RFQ once, and only RFQs that actually contributed a row", async () => {
    const data = (await buyer.listOrgQuotations())!;
    const facetIds = data.rfqFacets.map((f) => f.rfqId);
    expect(new Set(facetIds).size).toBe(facetIds.length);
    expect(new Set(facetIds)).toEqual(new Set(data.items.map((r) => r.rfqId)));
  });
});

describe("listComparableRfqs — eligibility is a server fact", () => {
  it("marks an RFQ with enough disclosed quotations eligible, with no reason attached", async () => {
    const options = (await buyer.listComparableRfqs())!;
    for (const option of options.filter((o) => o.eligible)) {
      expect(option.quotationCount).toBeGreaterThanOrEqual(MIN_COMPARE);
      expect(option.ineligibleReason).toBeUndefined();
    }
  });

  it("marks a single-quotation RFQ ineligible and explains why", async () => {
    const options = (await buyer.listComparableRfqs())!;
    const ineligible = options.filter((o) => !o.eligible);
    expect(ineligible.length).toBeGreaterThan(0);
    for (const option of ineligible) {
      expect(option.quotationCount).toBeLessThan(MIN_COMPARE);
      // The reason is rendered verbatim, so it must exist rather than being invented client-side.
      expect(option.ineligibleReason).toBeTruthy();
    }
  });

  it("offers no RFQ that has received nothing — an empty RFQ is not a comparison candidate", async () => {
    const options = (await buyer.listComparableRfqs())!;
    for (const option of options) {
      expect(option.quotationCount).toBeGreaterThan(0);
    }
  });

  it("agrees with the list read's per-row `comparable` flag", async () => {
    // Both surfaces must reach the same eligibility answer, or the Compare link on a row would lead to a
    // page that refuses to compare it.
    const [data, options] = await Promise.all([
      buyer.listOrgQuotations(),
      buyer.listComparableRfqs(),
    ]);
    const eligibleIds = new Set(options!.filter((o) => o.eligible).map((o) => o.rfqId));
    for (const row of data!.items) {
      expect(row.comparable ?? false).toBe(eligibleIds.has(row.rfqId));
    }
  });
});

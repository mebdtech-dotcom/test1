import { describe, expect, it } from "vitest";
// Relative import: the `@/*` alias resolves to `src/*` only, so app-layer surfaces are not aliasable.
import {
  BUYER_VISIBLE_QUOTATION_STATES,
  buildReceivedQuotesQueryString,
  filterReceivedQuotes,
  hasActiveFilters,
  parseReceivedQuotesQuery,
} from "../../app/(app)/(workspace)/buy/_components/quotations/query-state";
import type { BuyerOrgQuotationItem } from "../../app/(app)/(workspace)/buy/_components/quotations/org-quotation-view-models";

// Received Quotes URL query state.
//
// This module decides what a URL MEANS, on the server, before any row is rendered. Two failure modes
// matter more than the happy path:
//
//   1. A stale or hand-edited URL must never produce a misleading view. An unknown `?state=` or an
//      `?rfq=` outside the buyer's own facet set has to degrade to "no filter" — if it instead filtered
//      to nothing, the page would tell a buyer they have no quotations when they have many, and an
//      arbitrary `?rfq=` would become a probe for which RFQ ids exist.
//   2. Filtering must never re-order. The contract order is authoritative (R6 / GI-04), so a narrowing
//      that quietly re-sorts would smuggle a ranking into the most ranking-sensitive screen in the app.

const ROW = (over: Partial<BuyerOrgQuotationItem> & { id: string }): BuyerOrgQuotationItem => ({
  rfqId: "rfq-1",
  rfqHumanRef: "RFQ-2026-000001",
  rfqTitle: "Boiler feed-water pumps",
  vendorName: "Meghna Industrial Supplies Ltd.",
  state: "submitted",
  ...over,
});

const ROWS: BuyerOrgQuotationItem[] = [
  ROW({ id: "q-1", humanRef: "QTN-2026-000001", vendorName: "Meghna Industrial Supplies Ltd." }),
  ROW({
    id: "q-2",
    humanRef: "QTN-2026-000002",
    vendorName: "Padma Engineering Works",
    state: "shortlisted",
  }),
  ROW({
    id: "q-3",
    humanRef: "QTN-2026-000003",
    vendorName: "Rupsha Electromech",
    rfqId: "rfq-2",
    rfqHumanRef: "RFQ-2026-000002",
    rfqTitle: "Transformer servicing",
    state: "withdrawn",
  }),
];

const KNOWN_RFQ_IDS = ["rfq-1", "rfq-2"];

describe("parseReceivedQuotesQuery — validation", () => {
  it("defaults to no filter when nothing is supplied", () => {
    expect(parseReceivedQuotesQuery({}, KNOWN_RFQ_IDS)).toEqual({
      search: "",
      state: "all",
      rfqId: null,
    });
  });

  it("accepts every frozen buyer-visible state", () => {
    for (const state of BUYER_VISIBLE_QUOTATION_STATES) {
      expect(parseReceivedQuotesQuery({ state }, KNOWN_RFQ_IDS).state).toBe(state);
    }
  });

  it("falls back to 'all' for an unknown state rather than filtering to nothing", () => {
    expect(parseReceivedQuotesQuery({ state: "totally-made-up" }, KNOWN_RFQ_IDS).state).toBe("all");
  });

  it("rejects `draft` — a vendor's draft is never disclosed to the buyer", () => {
    // `draft` is a real frozen quotation state, which is exactly why this needs pinning: it must not be
    // addressable as a buyer filter even though the union contains it.
    expect(parseReceivedQuotesQuery({ state: "draft" }, KNOWN_RFQ_IDS).state).toBe("all");
    expect(BUYER_VISIBLE_QUOTATION_STATES).not.toContain("draft");
  });

  it("keeps an RFQ id that is in the server-supplied facet set", () => {
    expect(parseReceivedQuotesQuery({ rfq: "rfq-2" }, KNOWN_RFQ_IDS).rfqId).toBe("rfq-2");
  });

  it("discards an RFQ id outside the buyer's own facet set", () => {
    // A foreign/guessed id must not reach a read or narrow the view — otherwise the URL becomes a probe.
    expect(parseReceivedQuotesQuery({ rfq: "rfq-someone-elses" }, KNOWN_RFQ_IDS).rfqId).toBeNull();
  });

  it("takes the first value when a key is repeated", () => {
    const query = parseReceivedQuotesQuery(
      { state: ["shortlisted", "expired"], rfq: ["rfq-1", "rfq-2"] },
      KNOWN_RFQ_IDS,
    );
    expect(query.state).toBe("shortlisted");
    expect(query.rfqId).toBe("rfq-1");
  });

  it("trims the search term and caps a pathological length", () => {
    expect(parseReceivedQuotesQuery({ search: "  padma  " }, KNOWN_RFQ_IDS).search).toBe("padma");
    expect(
      parseReceivedQuotesQuery({ search: "x".repeat(5000) }, KNOWN_RFQ_IDS).search.length,
    ).toBe(120);
  });
});

describe("hasActiveFilters", () => {
  it("is false only for the untouched query", () => {
    const base = parseReceivedQuotesQuery({}, KNOWN_RFQ_IDS);
    expect(hasActiveFilters(base)).toBe(false);
    expect(hasActiveFilters({ ...base, search: "pump" })).toBe(true);
    expect(hasActiveFilters({ ...base, state: "shortlisted" })).toBe(true);
    expect(hasActiveFilters({ ...base, rfqId: "rfq-1" })).toBe(true);
  });

  it("stays false for a query built only from invalid params", () => {
    // This is what separates "no quotations received" from "your filters matched nothing": a junk URL
    // must land on the FIRST-RUN copy, not on "no quotations match these filters".
    const query = parseReceivedQuotesQuery(
      { state: "nonsense", rfq: "rfq-not-mine" },
      KNOWN_RFQ_IDS,
    );
    expect(hasActiveFilters(query)).toBe(false);
  });
});

describe("filterReceivedQuotes", () => {
  it("returns every row when unfiltered", () => {
    const query = parseReceivedQuotesQuery({}, KNOWN_RFQ_IDS);
    expect(filterReceivedQuotes(ROWS, query)).toHaveLength(3);
  });

  it("narrows by frozen state", () => {
    const query = parseReceivedQuotesQuery({ state: "shortlisted" }, KNOWN_RFQ_IDS);
    expect(filterReceivedQuotes(ROWS, query).map((r) => r.id)).toEqual(["q-2"]);
  });

  it("narrows by RFQ", () => {
    const query = parseReceivedQuotesQuery({ rfq: "rfq-2" }, KNOWN_RFQ_IDS);
    expect(filterReceivedQuotes(ROWS, query).map((r) => r.id)).toEqual(["q-3"]);
  });

  it("searches vendor, quotation ref, RFQ ref and RFQ title, case-insensitively", () => {
    const run = (search: string) =>
      filterReceivedQuotes(ROWS, parseReceivedQuotesQuery({ search }, KNOWN_RFQ_IDS)).map(
        (r) => r.id,
      );
    expect(run("rupsha")).toEqual(["q-3"]);
    expect(run("QTN-2026-000002")).toEqual(["q-2"]);
    expect(run("RFQ-2026-000002")).toEqual(["q-3"]);
    expect(run("transformer")).toEqual(["q-3"]);
  });

  it("combines filters conjunctively", () => {
    const query = parseReceivedQuotesQuery({ rfq: "rfq-1", state: "submitted" }, KNOWN_RFQ_IDS);
    expect(filterReceivedQuotes(ROWS, query).map((r) => r.id)).toEqual(["q-1"]);
  });

  it("preserves the contract-governed order — filtering never re-ranks", () => {
    // The input order here is deliberately NOT alphabetical/by-price; a filter that sorted would show up.
    const scrambled = [ROWS[2], ROWS[0], ROWS[1]];
    const query = parseReceivedQuotesQuery({ search: "e" }, KNOWN_RFQ_IDS);
    const filtered = filterReceivedQuotes(scrambled, query);
    const expected = scrambled.filter((r) => filtered.includes(r)).map((r) => r.id);
    expect(filtered.map((r) => r.id)).toEqual(expected);
  });

  it("matches nothing when the search hits no disclosed field", () => {
    const query = parseReceivedQuotesQuery({ search: "zzzz-no-such-vendor" }, KNOWN_RFQ_IDS);
    expect(filterReceivedQuotes(ROWS, query)).toHaveLength(0);
    expect(hasActiveFilters(query)).toBe(true); // ⇒ the "no match" state, not the first-run state
  });
});

describe("buildReceivedQuotesQueryString", () => {
  it("omits defaults so an unfiltered view has a clean URL", () => {
    expect(buildReceivedQuotesQueryString({ search: "", state: "all", rfqId: null })).toBe("");
  });

  it("round-trips through the parser", () => {
    const original = { search: "padma", state: "shortlisted" as const, rfqId: "rfq-2" };
    const qs = buildReceivedQuotesQueryString(original);
    const params = Object.fromEntries(new URLSearchParams(qs));
    expect(parseReceivedQuotesQuery(params, KNOWN_RFQ_IDS)).toEqual(original);
  });

  it("never emits a key outside the three-key allow-list", () => {
    const qs = buildReceivedQuotesQueryString({
      search: "pump",
      state: "expired",
      rfqId: "rfq-1",
    });
    expect([...new URLSearchParams(qs).keys()].sort()).toEqual(["rfq", "search", "state"]);
  });
});

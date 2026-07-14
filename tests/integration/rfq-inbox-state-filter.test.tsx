import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { InboxItemView } from "../../app/(app)/_components/vendor/rfq";

// /sell/rfqs `?state=` filter render check — the URL-driven own-quotation-state filter (frozen
// Doc-4M QuotationState subset: draft | submitted; anything else ⇒ All, the documents-hub URL-param
// convention). The mock adapter's reviewed vendor universe has ≥1 row for BOTH allowed filters, so
// the FILTERED-EMPTY branch is unreachable through the served route — this test injects a
// controlled inbox (vi.mock on the adapter seam, the swap point the page is built around) to pin
// all branches deterministically via `react-dom/server` (same pattern as account-view.test.tsx).
//
// GOVERNANCE: the filtered-empty copy must derive from the FILTER alone — the inbox's canonical
// unfiltered empty state ("No invitations yet", [ESC-7B-EMPTY-LOCK]) must NOT render under a filter
// (and vice versa), so the byte-equivalence lock on the canonical copy stays intact.
//
// BOUNDARY: a test may import the `app` presentation layer it exercises (eslint `tests → app`,
// WP-1.6 test-infra refinement); the adapter seam is mocked at its public barrel only.

const CONTROLLED_INBOX: InboxItemView[] = [
  {
    rfq_id: "rfq-test-draft",
    rfq_human_ref: "RFQ-2026-000901",
    rfq_summary: "Gate valves for the intake line",
    invitation_state: "accepted",
    quotation_state: "draft",
  },
  {
    rfq_id: "rfq-test-none",
    rfq_human_ref: "RFQ-2026-000902",
    rfq_summary: "Pump overhaul service",
    invitation_state: "delivered",
  },
];

vi.mock("../../app/(app)/_components/rfq-workflow", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../../app/(app)/_components/rfq-workflow")>();
  return {
    ...mod,
    rfqWorkflowData: {
      ...mod.rfqWorkflowData,
      vendor: {
        ...mod.rfqWorkflowData.vendor,
        listInbox: async () => CONTROLLED_INBOX,
      },
    },
  };
});

// Imported AFTER the mock so the page binds the controlled adapter.
const { default: RfqsPage } = await import("../../app/(app)/(workspace)/sell/rfqs/page");

async function renderPage(state?: string): Promise<string> {
  const element = await RfqsPage({ searchParams: Promise.resolve(state ? { state } : {}) });
  return renderToStaticMarkup(element);
}

describe("/sell/rfqs ?state= — URL-driven own-quotation-state filter", () => {
  it("no filter: renders every row and marks the All chip current", async () => {
    const html = await renderPage();
    expect(html).toContain("RFQ-2026-000901");
    expect(html).toContain("RFQ-2026-000902");
    // URL is the source of truth: the chips are plain links carrying the allowlisted param.
    expect(html).toContain('href="/sell/rfqs?state=draft"');
    expect(html).toContain('href="/sell/rfqs?state=submitted"');
    expect(html).toMatch(/aria-current="page"[^>]*>All invitations|All invitations<\/a>/);
  });

  it("?state=draft: renders ONLY rows whose own quotation is draft", async () => {
    const html = await renderPage("draft");
    expect(html).toContain("RFQ-2026-000901");
    expect(html).not.toContain("RFQ-2026-000902");
  });

  it("?state=submitted with zero matches: renders the FILTER-derived empty state, never the canonical inbox copy", async () => {
    const html = await renderPage("submitted");
    expect(html).not.toContain("RFQ-2026-000901");
    expect(html).not.toContain("RFQ-2026-000902");
    expect(html).toContain("No submitted offers");
    // The canonical unfiltered empty copy stays locked to the UNFILTERED list ([ESC-7B-EMPTY-LOCK]).
    expect(html).not.toContain("No invitations yet");
  });

  it("unknown ?state= value: allowlist coerces to All (never a crash, never a leak)", async () => {
    const html = await renderPage("bogus");
    expect(html).toContain("RFQ-2026-000901");
    expect(html).toContain("RFQ-2026-000902");
    expect(html).not.toContain("No submitted offers");
  });
});

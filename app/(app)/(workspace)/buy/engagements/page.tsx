// P-BUY-19 Buyer Engagements list route (Doc-7F · `T-LISTING`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
//
// PRESENTATION-ONLY (this milestone): binds the M4 read `ops.list_engagements.v1` (Doc-4F §F5.8), which is
// NOT wired today (the GI-02 server data layer is PARKED until the M4 backend lands — Wave 4). A realistic
// mock set stands in for the wired projection; the browser never calls a Doc-5 contract and never sets
// `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).
//
// WIRING SEAM (later milestone): resolve `list_engagements` SERVER-SIDE (own-party only — H.9; cursor-
// paginated, GI-03; `filter.status` allowlisted), stream behind `SK-LIST`, branch errors on `error_class`.

import { EngagementsListView } from "./engagements-list-view";
import type {
  EngagementListItem,
  EngagementListData,
} from "../_components/engagement-list-view-models";
import type { EngagementState } from "../_components/view-models";

export const metadata = {
  title: "Engagements",
};

// Realistic industrial-procurement MOCK (page-standards: "mock data realistic") — exactly the three fields
// the wired `list_engagements` projects (id / human_ref / status). In System-persisted order, NEVER
// re-ranked (GI-04). Year-scoped human refs (Inv #5). No value/vendor/rfq here — those are detail-only.
const MOCK_ENGAGEMENTS: EngagementListItem[] = [
  { id: "eng_01", humanRef: "ENG-2026-000124", state: "open" },
  { id: "eng_02", humanRef: "ENG-2026-000121", state: "in_delivery" },
  { id: "eng_03", humanRef: "ENG-2026-000118", state: "in_delivery" },
  { id: "eng_04", humanRef: "ENG-2026-000112", state: "completed" },
  { id: "eng_05", humanRef: "ENG-2026-000109", state: "closed" },
];

const VALID_STATUSES: EngagementState[] = ["open", "in_delivery", "completed", "closed"];

export default async function BuyerEngagementsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  // Accept only a frozen contract-authority status (Doc-4F §F5.8 allowlist); anything else ⇒ "All".
  const activeStatus = VALID_STATUSES.includes(sp.status as EngagementState)
    ? (sp.status as EngagementState)
    : undefined;
  // Presentation filter over the mock; the real filtered, cursor-paginated query binds server-side (PARKED).
  const items = activeStatus
    ? MOCK_ENGAGEMENTS.filter((e) => e.state === activeStatus)
    : MOCK_ENGAGEMENTS;

  const data: EngagementListData = { items, activeStatus };
  return <EngagementsListView data={data} />;
}

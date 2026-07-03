// P-DOC-02 Vendor Documents hub route (FE-DOC-02 · Team-3 · page_inventory §8A). A Next.js SERVER
// COMPONENT (App Router composition only): no business logic. Vendor mirror of the buyer hub
// (`(buyer)/documents/page.tsx`) — composes the SAME shared documents home
// (`_components/documents`), never forks it, per that home's own header rule ("buyer↔vendor
// surfaces import THIS, never each other").
//
// PRESENTATION-ONLY COMPOSITION (this milestone): the hub COMPOSES frozen module-owned reads —
// M4 BC-OPS-4 `ops.list_generated_documents.v1` (§1) + links over the M4 BC-OPS-2 document routes
// (§2, vendor-mounted at `/workspace/engagements/[id]/*`) + M3 sourcing links (§3) + an M7
// platform-invoices link-out (§4, DF-6). NOTHING is wired today. The vendor engagement routes ship
// NO seeded mock data of their own (unlike the buyer leg, which already had a matching fixture
// universe) — this hub introduces its own, field-aligned with the buyer hub's fixture universe
// (`ENG-2026-000124` family, `DOC-2026-000091`, `INV-2026-…`, BDT) for cross-hub consistency, with
// `direction` flipped to the vendor's own-org perspective (a document one party "sent" is the
// other's "received" — the same underlying artifact, disclosed and honest, not fabricated).
//
// URL PARAMS (all allowlisted, same pattern as the buyer leg — anything else ⇒ All):
//  • `?stage=` — the LifecycleStrip filter (six frozen stage keys; navigation, not state).
//  • `?view=`  — received | sent | pending | completed (derived presentation groupings).
//  • `?q=`     — a REFINE over the loaded rows (human_ref / kind label / source ref) — not a
//    server-search claim.
import { DocumentsHubView } from "../../_components/vendor/documents";
import { DOCUMENT_STAGE_KEYS, type DocumentStageKey } from "../../_components/documents";
import {
  DOCUMENTS_HUB_VIEWS,
  generatedDocKindLabel,
  type DocumentsHubData,
  type DocumentsHubViewPreset as HubView,
  type GeneratedDocumentRow,
  type HubEngagementRow,
  type TradeInvoicePointer,
} from "../../_components/vendor/documents";
import { formatInstant } from "@/frontend/components/format";

const BASE = "/workspace";

export const metadata = {
  title: "Documents",
};

// ——— §1 Generated documents — same fixture universe as the buyer hub, direction flipped to the
// vendor's own-org perspective (the same records, the other party's view).
const MOCK_GENERATED: GeneratedDocumentRow[] = [
  {
    id: "gdoc_01",
    human_ref: "DOC-2026-000141",
    doc_kind: "po",
    version_no: 2,
    direction: "received",
    source_engagement_id: "eng_01",
    source_ref: "ENG-2026-000124",
    counterparty_ref: "bp_4a71c9",
    issued_at: "2026-07-02T11:20:00+06:00",
    artifact: { href: "#", name: "DOC-2026-000141.pdf" },
  },
  {
    id: "gdoc_02",
    human_ref: "DOC-2026-000138",
    doc_kind: "quotation",
    version_no: 1,
    direction: "sent",
    counterparty_ref: "bp_9e02f5",
    issued_at: "2026-07-01T16:05:00+06:00",
    artifact: { href: "#", name: "DOC-2026-000138.pdf" },
  },
  {
    id: "gdoc_03",
    human_ref: "DOC-2026-000127",
    doc_kind: "challan",
    version_no: 1,
    direction: "sent",
    source_engagement_id: "eng_02",
    source_ref: "ENG-2026-000121",
    counterparty_ref: "bp_9e02f5",
    issued_at: "2026-06-29T09:40:00+06:00",
    artifact: { href: "#", name: "DOC-2026-000127.pdf" },
    sharing_revoked: true,
  },
  {
    id: "gdoc_04",
    human_ref: "DOC-2026-000119",
    doc_kind: "letterhead",
    version_no: 1,
    direction: "received",
    counterparty_ref: "bp_71a0e2",
    issued_at: "2026-06-27T14:10:00+06:00",
    // Async generation in flight — the artifact is pending, never a fabricated link (ASYNC honesty).
    artifact: { is_pending: true },
  },
  {
    id: "gdoc_05",
    human_ref: "DOC-2026-000095",
    doc_kind: "wcc",
    version_no: 1,
    direction: "received",
    source_engagement_id: "eng_04",
    source_ref: "ENG-2026-000112",
    counterparty_ref: "bp_71a0e2",
    issued_at: "2026-06-21T10:30:00+06:00",
    artifact: { href: "#", name: "DOC-2026-000095.pdf" },
  },
];

// ——— §2 Engagement document clusters — the same fixture engagements as the buyer hub (same
// underlying records, vendor-mounted routes). Timeline entries RESTATE the facts seeded on those
// routes — labels are frozen facts, never a computed stage (MAJOR-01).
const MOCK_ENGAGEMENTS: HubEngagementRow[] = [
  {
    id: "eng_01",
    human_ref: "ENG-2026-000124",
    status: "open",
    timeline: [
      t("eng01-t1", "Engagement opened (RFQ awarded)", "2026-06-24T09:00:00+06:00"),
      t(
        "eng01-t2",
        "Purchase order issued · DOC-2026-000091",
        "2026-06-25T11:30:00+06:00",
        `${BASE}/engagements/eng_01`,
      ),
      t(
        "eng01-t3",
        "Challan issued · DOC-2026-000104",
        "2026-06-28T15:20:00+06:00",
        `${BASE}/engagements/eng_01`,
      ),
      t(
        "eng01-t4",
        "Trade invoice issued · INV-2026-000039",
        "2026-06-30T10:05:00+06:00",
        `${BASE}/engagements/eng_01`,
      ),
      t("eng01-t5", "Payment recorded", "2026-07-01T12:45:00+06:00", `${BASE}/engagements/eng_01`),
    ],
  },
  {
    id: "eng_02",
    human_ref: "ENG-2026-000121",
    status: "in_delivery",
    timeline: [
      t("eng02-t1", "Engagement opened (RFQ awarded)", "2026-06-18T10:00:00+06:00"),
      t(
        "eng02-t2",
        "Purchase order issued · DOC-2026-000078",
        "2026-06-19T09:15:00+06:00",
        `${BASE}/engagements/eng_02`,
      ),
      t(
        "eng02-t3",
        "Challan issued · DOC-2026-000112",
        "2026-06-26T13:40:00+06:00",
        `${BASE}/engagements/eng_02`,
      ),
      t(
        "eng02-t4",
        "Trade invoice issued · INV-2026-000045",
        "2026-06-29T09:30:00+06:00",
        `${BASE}/engagements/eng_02`,
      ),
    ],
  },
  {
    id: "eng_04",
    human_ref: "ENG-2026-000112",
    status: "completed",
    timeline: [
      t("eng04-t1", "Engagement opened (RFQ awarded)", "2026-05-30T09:00:00+06:00"),
      t(
        "eng04-t2",
        "Trade invoice issued · INV-2026-000028",
        "2026-06-10T11:00:00+06:00",
        `${BASE}/engagements/eng_04`,
      ),
      t("eng04-t3", "Payment confirmed", "2026-06-16T14:30:00+06:00", `${BASE}/engagements/eng_04`),
      t(
        "eng04-t4",
        "Work completion certificate issued · DOC-2026-000133",
        "2026-06-20T10:20:00+06:00",
        `${BASE}/engagements/eng_04`,
      ),
    ],
  },
];

// ——— Pending-attention trade-invoice pointers — same fixture invoices as the buyer hub, frozen
// `TradeInvoiceStatus` values only.
const MOCK_PENDING_INVOICES: TradeInvoicePointer[] = [
  {
    engagement_id: "eng_02",
    engagement_ref: "ENG-2026-000121",
    human_ref: "INV-2026-000045",
    status: "issued",
    amount: { amount: 1725000, currency: "BDT" },
    due_date: "2026-07-20",
  },
  {
    engagement_id: "eng_01",
    engagement_ref: "ENG-2026-000124",
    human_ref: "INV-2026-000039",
    status: "issued",
    amount: { amount: 896000, currency: "BDT" },
    due_date: "2026-07-15",
  },
];

// Timeline entry helper — display formatting stays surface-owned.
function t(id: string, label: string, at: string, href?: string) {
  return { id, label, at, atLabel: formatInstant(at), href };
}

const q = (value: string) => value.toLowerCase();

export default async function VendorDocumentsHubPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; stage?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const activeView = DOCUMENTS_HUB_VIEWS.includes(sp.view as HubView)
    ? (sp.view as HubView)
    : undefined;
  const activeStage = DOCUMENT_STAGE_KEYS.includes(sp.stage as DocumentStageKey)
    ? (sp.stage as DocumentStageKey)
    : undefined;
  const query = sp.q?.trim() ? sp.q.trim().slice(0, 80) : undefined;

  let generated = MOCK_GENERATED;
  if (activeStage) {
    generated = generated.filter((g) => g.doc_kind === activeStage);
  }
  if (activeView === "received" || activeView === "sent") {
    generated = generated.filter((g) => g.direction === activeView);
  }
  if (query) {
    const needle = q(query);
    generated = generated.filter(
      (g) =>
        q(g.human_ref).includes(needle) ||
        q(generatedDocKindLabel(g.doc_kind)).includes(needle) ||
        (g.source_ref ? q(g.source_ref).includes(needle) : false) ||
        (g.counterparty_ref ? q(g.counterparty_ref).includes(needle) : false),
    );
  }

  let engagements = MOCK_ENGAGEMENTS;
  if (activeView === "completed") {
    engagements = engagements.filter((e) => e.status === "completed" || e.status === "closed");
  }
  if (query) {
    const needle = q(query);
    engagements = engagements.filter((e) => q(e.human_ref).includes(needle));
  }

  let pendingInvoices = MOCK_PENDING_INVOICES;
  if (query) {
    const needle = q(query);
    pendingInvoices = pendingInvoices.filter(
      (p) => q(p.human_ref).includes(needle) || q(p.engagement_ref).includes(needle),
    );
  }

  const data: DocumentsHubData = {
    active_view: activeView,
    active_stage: activeStage,
    query,
    generated,
    engagements,
    pending_invoices: pendingInvoices,
    recently_opened: [
      {
        id: "r1",
        label: "INV-2026-000045",
        href: `${BASE}/engagements/eng_02`,
        kindKey: "trade_invoice",
      },
      {
        id: "r2",
        label: "DOC-2026-000091",
        href: `${BASE}/engagements/eng_01`,
        kindKey: "po",
      },
      {
        id: "r3",
        label: "QTN-2026-000456",
        href: `${BASE}/rfqs/rfq_01/quotations/q_1`,
        kindKey: "quotation",
      },
    ],
  };
  return <DocumentsHubView data={data} />;
}

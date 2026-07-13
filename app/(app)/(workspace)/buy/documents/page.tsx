// P-DOC-01 Buyer Documents hub route (FE-DOC-01 · `T-LISTING` · page_inventory §8A). A Next.js
// SERVER COMPONENT in the `(app)/(buyer)` group (App Router composition only): no business logic.
//
// PRESENTATION-ONLY COMPOSITION (this milestone): the hub COMPOSES frozen module-owned reads —
// M4 BC-OPS-4 `ops.list_generated_documents.v1` (§1) + links over the M4 BC-OPS-2 document routes
// (§2, P-BUY-21..25) + M3 sourcing links (§3) + an M7 platform-invoices link-out (§4, DF-6).
// NOTHING is wired today (GI-02 PARKED); realistic mocks stand in, field-aligned to the
// established buyer fixture universe (ENG-2026-000124 family) so every deep link renders.
//
// URL PARAMS (all allowlisted, P-BUY-19 pattern — anything else ⇒ All):
//  • `?stage=` — the LifecycleStrip filter (six frozen stage keys; navigation, not state).
//  • `?view=`  — received | sent | pending | completed (derived presentation groupings).
//  • `?q=`     — a REFINE over the loaded rows (human_ref / kind label / source ref). This is NOT
//    a server search claim: no frozen cross-module free-text document search exists — a wired
//    global search would need an additive read (ESC-class; WP fe-doc-01 carries the note). The
//    P-BUY-19 no-search-box ruling is honored by scoping this control to refine-what-is-listed.
//
// WIRING SEAM (later milestone): resolve the reads server-side (own-org, H.9; cursor GI-03,
// page size per `DOCUMENTS_PAGE_SIZE`; sort `DOCUMENTS_DEFAULT_SORT`), stream behind SK-LIST.

import { DocumentsHubView } from "./documents-hub-view";
import { DOCUMENT_STAGE_KEYS, type DocumentStageKey } from "../../../_components/documents";
import {
  DOCUMENTS_HUB_VIEWS,
  generatedDocKindLabel,
  type DocumentsHubData,
  type DocumentsHubView as HubView,
  type GeneratedDocumentRow,
  type HubEngagementRow,
  type TradeInvoicePointer,
} from "../_components/documents-hub-view-models";
import { formatInstant } from "../_components/format";

export const metadata = {
  title: "Documents",
};

// ——— §1 Generated documents (BC-OPS-4) — fields per §F7 by intent. Direction is the documented
// presentation derivation (owning org vs active org — see the view-models header). Counterparty is
// an OPAQUE ref (no name projected — P-BUY-20 precedent). One ASYNC-pending row (`generation_job_id`
// in flight) and one sharing-revoked row (grant aggregate, §F7.4) keep the states honest.
const MOCK_GENERATED: GeneratedDocumentRow[] = [
  {
    id: "gdoc_01",
    humanRef: "DOC-2026-000141",
    docKind: "po",
    versionNo: 2,
    direction: "sent",
    sourceEngagementId: "eng_01",
    sourceRef: "ENG-2026-000124",
    counterpartyRef: "vp_8f2a1c",
    issuedAt: "2026-07-02T11:20:00+06:00",
    artifact: { href: "#", name: "DOC-2026-000141.pdf", sizeLabel: "182 KB" },
  },
  {
    id: "gdoc_02",
    humanRef: "DOC-2026-000138",
    docKind: "quotation",
    versionNo: 1,
    direction: "received",
    counterpartyRef: "vp_3b90d7",
    issuedAt: "2026-07-01T16:05:00+06:00",
    artifact: { href: "#", name: "DOC-2026-000138.pdf", sizeLabel: "240 KB" },
  },
  {
    id: "gdoc_03",
    humanRef: "DOC-2026-000127",
    docKind: "challan",
    versionNo: 1,
    direction: "received",
    sourceEngagementId: "eng_02",
    sourceRef: "ENG-2026-000121",
    counterpartyRef: "vp_3b90d7",
    issuedAt: "2026-06-29T09:40:00+06:00",
    artifact: { href: "#", name: "DOC-2026-000127.pdf", sizeLabel: "96 KB" },
    sharingRevoked: true,
  },
  {
    id: "gdoc_04",
    humanRef: "DOC-2026-000119",
    docKind: "letterhead",
    versionNo: 1,
    direction: "sent",
    counterpartyRef: "vp_c14e55",
    issuedAt: "2026-06-27T14:10:00+06:00",
    // Async generation in flight — the artifact is pending, never a fabricated link (ASYNC honesty).
    artifact: { isPending: true },
  },
  {
    id: "gdoc_05",
    humanRef: "DOC-2026-000095",
    docKind: "wcc",
    versionNo: 1,
    direction: "sent",
    sourceEngagementId: "eng_04",
    sourceRef: "ENG-2026-000112",
    counterpartyRef: "vp_c14e55",
    issuedAt: "2026-06-21T10:30:00+06:00",
    artifact: { href: "#", name: "DOC-2026-000095.pdf", sizeLabel: "128 KB" },
  },
];

// ——— §2 Engagement document clusters — the P-BUY-19/20 fixture engagements (detail-resolving ids
// only). Timeline entries RESTATE the facts seeded on those routes (PO/challan/invoice/payment
// mocks) — labels are frozen facts, never a computed stage (MAJOR-01).
const MOCK_ENGAGEMENTS: HubEngagementRow[] = [
  {
    id: "eng_01",
    humanRef: "ENG-2026-000124",
    state: "open",
    timeline: [
      t("eng01-t1", "Engagement opened (RFQ awarded)", "2026-06-24T09:00:00+06:00"),
      t(
        "eng01-t2",
        "Purchase order issued · DOC-2026-000091",
        "2026-06-25T11:30:00+06:00",
        "/buy/engagements/eng_01/po",
      ),
      t(
        "eng01-t3",
        "Challan issued · DOC-2026-000104",
        "2026-06-28T15:20:00+06:00",
        "/buy/engagements/eng_01/challan",
      ),
      t(
        "eng01-t4",
        "Trade invoice issued · INV-2026-000039",
        "2026-06-30T10:05:00+06:00",
        "/buy/engagements/eng_01/trade-invoice",
      ),
      t(
        "eng01-t5",
        "Payment recorded",
        "2026-07-01T12:45:00+06:00",
        "/buy/engagements/eng_01/payments",
      ),
    ],
  },
  {
    id: "eng_02",
    humanRef: "ENG-2026-000121",
    state: "in_delivery",
    timeline: [
      t("eng02-t1", "Engagement opened (RFQ awarded)", "2026-06-18T10:00:00+06:00"),
      t(
        "eng02-t2",
        "Purchase order issued · DOC-2026-000078",
        "2026-06-19T09:15:00+06:00",
        "/buy/engagements/eng_02/po",
      ),
      t(
        "eng02-t3",
        "Challan issued · DOC-2026-000112",
        "2026-06-26T13:40:00+06:00",
        "/buy/engagements/eng_02/challan",
      ),
      t(
        "eng02-t4",
        "Trade invoice issued · INV-2026-000045",
        "2026-06-29T09:30:00+06:00",
        "/buy/engagements/eng_02/trade-invoice",
      ),
    ],
  },
  {
    id: "eng_04",
    humanRef: "ENG-2026-000112",
    state: "completed",
    timeline: [
      t("eng04-t1", "Engagement opened (RFQ awarded)", "2026-05-30T09:00:00+06:00"),
      t(
        "eng04-t2",
        "Trade invoice issued · INV-2026-000028",
        "2026-06-10T11:00:00+06:00",
        "/buy/engagements/eng_04/trade-invoice",
      ),
      t(
        "eng04-t3",
        "Payment confirmed",
        "2026-06-16T14:30:00+06:00",
        "/buy/engagements/eng_04/payments",
      ),
      t(
        "eng04-t4",
        "Work completion certificate issued · DOC-2026-000133",
        "2026-06-20T10:20:00+06:00",
        "/buy/engagements/eng_04/wcc",
      ),
    ],
  },
];

// ——— Pending-attention trade-invoice pointers — frozen `TradeInvoiceStatus` values only, mirroring
// the P-BUY-23 fixture (INV refs + amounts). Deep-link the invoice route; nothing re-rendered here.
const MOCK_PENDING_INVOICES: TradeInvoicePointer[] = [
  {
    engagementId: "eng_02",
    engagementRef: "ENG-2026-000121",
    humanRef: "INV-2026-000045",
    status: "issued",
    amount: { amount: 1725000, currency: "BDT" },
    dueDate: "2026-07-20",
  },
  {
    engagementId: "eng_01",
    engagementRef: "ENG-2026-000124",
    humanRef: "INV-2026-000039",
    status: "issued",
    amount: { amount: 896000, currency: "BDT" },
    dueDate: "2026-07-15",
  },
];

// Timeline entry helper — display formatting stays surface-owned (buyer `formatInstant`).
function t(id: string, label: string, at: string, href?: string) {
  return { id, label, at, atLabel: formatInstant(at), href };
}

const q = (value: string) => value.toLowerCase();

export default async function BuyerDocumentsHubPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; stage?: string; q?: string }>;
}) {
  const sp = await searchParams;
  // Allowlists (P-BUY-19 pattern) — anything unrecognized collapses to "All", never an error.
  const activeView = DOCUMENTS_HUB_VIEWS.includes(sp.view as HubView)
    ? (sp.view as HubView)
    : undefined;
  const activeStage = DOCUMENT_STAGE_KEYS.includes(sp.stage as DocumentStageKey)
    ? (sp.stage as DocumentStageKey)
    : undefined;
  const query = sp.q?.trim() ? sp.q.trim().slice(0, 80) : undefined;

  // Presentation refine over the loaded rows (see header — not a server-search claim).
  let generated = MOCK_GENERATED;
  if (activeStage) {
    // Stage → §1 kind filter (`quotation`/`po`/`challan` match as-projected kinds; `rfq`,
    // `trade_invoice`, `payment` have no generated-artifact kind in the seed ⇒ empty is honest).
    generated = generated.filter((g) => g.docKind === activeStage);
  }
  if (activeView === "received" || activeView === "sent") {
    generated = generated.filter((g) => g.direction === activeView);
  }
  if (query) {
    const needle = q(query);
    generated = generated.filter(
      (g) =>
        q(g.humanRef).includes(needle) ||
        q(generatedDocKindLabel(g.docKind)).includes(needle) ||
        (g.sourceRef ? q(g.sourceRef).includes(needle) : false) ||
        (g.counterpartyRef ? q(g.counterpartyRef).includes(needle) : false),
    );
  }

  let engagements = MOCK_ENGAGEMENTS;
  if (activeView === "completed") {
    engagements = engagements.filter((e) => e.state === "completed" || e.state === "closed");
  }
  if (query) {
    const needle = q(query);
    engagements = engagements.filter((e) => q(e.humanRef).includes(needle));
  }

  let pendingInvoices = MOCK_PENDING_INVOICES;
  if (query) {
    const needle = q(query);
    pendingInvoices = pendingInvoices.filter(
      (p) => q(p.humanRef).includes(needle) || q(p.engagementRef).includes(needle),
    );
  }

  const data: DocumentsHubData = {
    activeView,
    activeStage,
    query,
    generated,
    engagements,
    pendingInvoices,
    recentlyOpened: [
      {
        id: "r1",
        label: "INV-2026-000045",
        href: "/buy/engagements/eng_02/trade-invoice",
        kindKey: "trade_invoice",
      },
      { id: "r2", label: "DOC-2026-000091", href: "/buy/engagements/eng_01/po", kindKey: "po" },
      {
        id: "r3",
        label: "QTN-2026-000456",
        href: "/buy/rfqs/rfq_01/quotations/q_1",
        kindKey: "quotation",
      },
    ],
  };
  return <DocumentsHubView data={data} />;
}

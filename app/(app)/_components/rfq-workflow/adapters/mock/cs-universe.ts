// RFQ WORKFLOW — Comparative Statement (CS) fixtures (WP-2; freeze COMPARE_SHEET_UX_FREEZE
// header v1.0 §3). MOCK-ERA content joined onto the existing fixture universe by quotation id —
// vendor names/order/amounts stay consistent with `rfq-universe.ts` BY CONSTRUCTION (the adapter
// derives the vendor set from the comparison statement; this file adds only what the CS needs).
//
// CONSISTENCY INVARIANT (load-bearing): each vendor's line totals SUM EXACTLY to that vendor's
// quoted amount in `rfq-universe.ts` (the CS Sub Total = the quoted price, ex-VAT; the Grand
// Total adds the 15% VAT line). A mismatch would make the universe contradict itself.
//
// GOVERNANCE: line items are mock until the ESC-CS-LINEITEMS dev-doc schema is ratified (the
// frozen jsonb internals are dev-doc scope); the letterhead is mock until ESC-CS-LETTERHEAD;
// everything under `evaluation` is the BUYER's own record (R6 — rendered with provenance marks).

import type {
  CsApprovalBlock,
  CsLetterhead,
} from "../../../../(workspace)/buy/_components/comparative-statement";

export interface CsFixtureItem {
  description: string;
  specification?: string;
  unit: string;
  quantity: number;
  /** Unit price per vendor, keyed by quotation id (BDT). */
  unitPrices: Record<string, number>;
}

export interface CsFixtureEvaluation {
  executiveSummary?: string;
  /** The buyer's confirmed evaluation order (Buyer Evaluation Summary — never "Vendor Ranking"). */
  orderedQuotationIds: { quotationId: string; technical?: string }[];
  technicalSummary?: { fullyCompliant: number; partiallyCompliant: number; nonCompliant: number };
  recommendedQuotationId?: string;
  reasons?: string[];
  risk?: string;
  commercialAdvantage?: string;
  remarks?: string;
}

export interface CsFixture {
  letterhead: CsLetterhead;
  project?: string;
  issueDate: string;
  currency: string;
  vatRatePct: number;
  preparedByLabel: string;
  items: CsFixtureItem[];
  evaluation?: CsFixtureEvaluation;
  approvals: CsApprovalBlock[];
  /**
   * Delivery-comparison rows keyed by quotation id — the adapter appends the vendor name and
   * DROPS any row whose vendor is not in the chosen set (a subset selection must never render
   * an excluded vendor's name; the wired server recomputes these rows over the real set).
   */
  deliveryComparison: { label: string; quotationId: string; value: string }[];
}

/** Mock buyer letterhead — real buyer branding is gated on ESC-CS-LETTERHEAD. */
const MOCK_LETTERHEAD: CsLetterhead = {
  name: "Jamuna Fabrication & Engineering Ltd.",
  tagline: "Engineering · Procurement · Construction",
  addressLine: "Plot #12, BSCIC Industrial Area, Gazipur-1700, Bangladesh",
  contactLine: "+880 1712 345 678 · procurement@jamunafabrication.com.bd",
  registrationLine: "BIN: 004512367-0101 · VAT Reg.: 19011045897",
};

/** Printed signature roster (wet ink on paper — freeze §3.4; nothing captured digitally). */
const MOCK_APPROVALS: CsApprovalBlock[] = [
  { role: "Prepared By", name: "Md. Asif Hossain", title: "Sr. Procurement Executive" },
  { role: "Checked By", name: "Nusrat Jahan", title: "Procurement Manager" },
  { role: "Recommended By", name: "Engr. Mahmudul Hasan", title: "Head of Procurement" },
  { role: "Approved By", name: "A. B. M. Khaled", title: "Director (Operations)" },
];

export const CS_UNIVERSE: Record<string, CsFixture> = {
  // Boiler feed-water pumps — 2 vendors (q-1 Meghna Σ 2,695,000 · q-2 Padma Σ 2,810,000).
  "rfq-000123": {
    letterhead: MOCK_LETTERHEAD,
    project: "Unit-2 boiler house — feed-water system",
    issueDate: "2026-07-06",
    currency: "BDT",
    vatRatePct: 15,
    preparedByLabel: "Procurement Department",
    items: [
      {
        description: "Centrifugal feed-water pump, 45 m³/h @ 62 m",
        specification: "ISO 5199",
        unit: "SET",
        quantity: 2,
        unitPrices: { "q-1": 590000, "q-2": 620000 },
      },
      {
        description: "Electric motor 75 kW, 2-pole, IE3",
        specification: "IEC 60034",
        unit: "PCS",
        quantity: 2,
        unitPrices: { "q-1": 260000, "q-2": 254000 },
      },
      {
        description: "Baseplate & coupling assembly",
        specification: "Fabricated MS",
        unit: "SET",
        quantity: 2,
        unitPrices: { "q-1": 65000, "q-2": 71000 },
      },
      {
        description: "Suction strainer DN150",
        specification: "SS304",
        unit: "PCS",
        quantity: 2,
        unitPrices: { "q-1": 22000, "q-2": 20000 },
      },
      {
        description: "Discharge check valve DN125",
        specification: "PN16",
        unit: "PCS",
        quantity: 2,
        unitPrices: { "q-1": 19000, "q-2": 21000 },
      },
      {
        description: "Gate valve DN150",
        specification: "PN16",
        unit: "PCS",
        quantity: 4,
        unitPrices: { "q-1": 13000, "q-2": 14000 },
      },
      {
        description: "Pressure gauge & instrument set",
        specification: "0–16 bar",
        unit: "SET",
        quantity: 2,
        unitPrices: { "q-1": 18000, "q-2": 16500 },
      },
      {
        description: "Suction/discharge piping spools",
        specification: "Sch 40, A106 Gr.B",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-1": 145000, "q-2": 158000 },
      },
      {
        description: "Pipe supports & anchors",
        specification: "Fabricated",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-1": 48000, "q-2": 52000 },
      },
      {
        description: "Foundation bolts & grouting",
        specification: "M24, epoxy grout",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-1": 55000, "q-2": 49000 },
      },
      {
        description: "Mechanical seal spares",
        specification: "Per pump",
        unit: "SET",
        quantity: 2,
        unitPrices: { "q-1": 48000, "q-2": 52000 },
      },
      {
        description: "Wear ring & gasket kit",
        specification: "Per pump",
        unit: "SET",
        quantity: 2,
        unitPrices: { "q-1": 29000, "q-2": 27000 },
      },
      {
        description: "Delivery to Gazipur site",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-1": 40000, "q-2": 35000 },
      },
      {
        description: "Installation & alignment",
        specification: "Laser alignment",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-1": 95000, "q-2": 110000 },
      },
      {
        description: "Commissioning & performance test",
        specification: "72-hour run",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-1": 60000, "q-2": 68000 },
      },
      {
        description: "Operator training",
        specification: "2 days on site",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-1": 25000, "q-2": 22000 },
      },
      {
        description: "O&M manuals & QA dossier",
        specification: "3 sets",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-1": 18000, "q-2": 15000 },
      },
      {
        description: "Incidental & handling charges",
        specification: "Lump sum",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-1": 55000, "q-2": 82000 },
      },
    ],
    evaluation: {
      executiveSummary:
        "Two (2) quotations were received against this RFQ for the supply, installation, and " +
        "commissioning of the Unit-2 boiler feed-water pumps. Both offers were evaluated on a " +
        "delivered-to-site basis at uniform quantities across 18 line items. Meghna Industrial " +
        "Supplies Ltd. offers the lowest evaluated grand total, is fully ISO 5199 compliant, and " +
        "carries the longer 18-month warranty from commissioning. The Procurement Department " +
        "recommends award to Meghna Industrial Supplies Ltd., subject to management approval.",
      orderedQuotationIds: [
        { quotationId: "q-1", technical: "Fully compliant — ISO 5199" },
        { quotationId: "q-2", technical: "Fully compliant — ISO 5199" },
      ],
      technicalSummary: { fullyCompliant: 2, partiallyCompliant: 0, nonCompliant: 0 },
      recommendedQuotationId: "q-1",
      reasons: [
        "Lowest evaluated grand total",
        "Full ISO 5199 compliance",
        "18-month warranty from commissioning",
        "6-week delivery acceptable against the needed-by date",
      ],
      risk: "Low",
      commercialAdvantage: "BDT 132,250.00 (4.09%) below the next-lowest offer",
      remarks: "All commercial terms are acceptable. Recommended for award subject to approval.",
    },
    approvals: MOCK_APPROVALS,
    deliveryComparison: [
      { label: "Fastest Delivery", quotationId: "q-2", value: "4 weeks from PO" },
      { label: "Longest Delivery", quotationId: "q-1", value: "6 weeks from PO" },
    ],
  },

  // Substation transformer servicing — 3 vendors (q-119-1 Σ 745,000 · q-119-2 Σ 799,000 ·
  // q-119-3 Σ 712,000). Demonstrates a buyer-authored recommendation that is NOT the arithmetic
  // lowest — the provenance model, exercised.
  "rfq-000119": {
    letterhead: MOCK_LETTERHEAD,
    project: "33/11 kV substation — transformer maintenance window",
    issueDate: "2026-07-06",
    currency: "BDT",
    vatRatePct: 15,
    preparedByLabel: "Procurement Department",
    items: [
      {
        description: "Transformer oil filtration & degassing",
        specification: "3-pass, on-line",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-119-1": 185000, "q-119-2": 205000, "q-119-3": 172000 },
      },
      {
        description: "Gasket & seal replacement kit",
        specification: "OEM-equivalent",
        unit: "SET",
        quantity: 1,
        unitPrices: { "q-119-1": 68000, "q-119-2": 74000, "q-119-3": 60000 },
      },
      {
        description: "Bushing inspection & re-torque",
        specification: "HV + LV",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-119-1": 55000, "q-119-2": 60000, "q-119-3": 52000 },
      },
      {
        description: "OLTC servicing",
        specification: "Contacts & diverter oil",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-119-1": 120000, "q-119-2": 128000, "q-119-3": 118000 },
      },
      {
        description: "Oil test suite (BDV / moisture / DGA)",
        specification: "IEC 60422",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-119-1": 85000, "q-119-2": 92000, "q-119-3": 70000 },
      },
      {
        description: "Protection relay secondary injection",
        specification: "All feeders",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-119-1": 72000, "q-119-2": 78000, "q-119-3": 65000 },
      },
      {
        description: "Site labour & shutdown management",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-119-1": 130000, "q-119-2": 125000, "q-119-3": 145000 },
      },
      {
        description: "Consumables & incidentals",
        specification: "Lump sum",
        unit: "LOT",
        quantity: 1,
        unitPrices: { "q-119-1": 30000, "q-119-2": 37000, "q-119-3": 30000 },
      },
    ],
    evaluation: {
      executiveSummary:
        "Three (3) quotations were received for the substation transformer servicing scope. All " +
        "offers were evaluated across 8 service line items on a completed-work basis. Rupsha " +
        "Electromech offers the lowest evaluated grand total against an in-house test protocol; " +
        "Dhaka Power Services Ltd. quotes 4.43% above the lowest offer with the full IEC 60422 " +
        "test protocol and a 12-month gasket warranty. The Procurement Department accepts the " +
        "compliance premium and recommends award to Dhaka Power Services Ltd., subject to " +
        "management approval.",
      orderedQuotationIds: [
        { quotationId: "q-119-1", technical: "Fully compliant — IEC 60422" },
        { quotationId: "q-119-3", technical: "Partially compliant — in-house protocol" },
        { quotationId: "q-119-2", technical: "Fully compliant — IEC 60422" },
      ],
      technicalSummary: { fullyCompliant: 2, partiallyCompliant: 1, nonCompliant: 0 },
      recommendedQuotationId: "q-119-1",
      reasons: [
        "Full IEC 60422 test-protocol compliance",
        "12-month warranty on gaskets",
        "3-day shutdown window within the outage plan",
        "Compliance premium of 4.43% over the lowest offer accepted",
      ],
      risk: "Low",
      commercialAdvantage:
        "BDT 37,950.00 (4.43%) above the lowest offer — premium accepted for IEC 60422 compliance",
      remarks: "Recommendation reflects the technical assessment, not price order.",
    },
    approvals: MOCK_APPROVALS,
    deliveryComparison: [
      { label: "Shortest Shutdown", quotationId: "q-119-2", value: "2 days" },
      { label: "Longest Shutdown", quotationId: "q-119-3", value: "4 days" },
    ],
  },
};

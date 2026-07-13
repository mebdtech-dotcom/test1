// Comparative Statement (CS) — document sections (WP-2; freeze §3.2, Visual-Approval-bound).
// Server Components, pure functions of their view-model slices (Inv #9). NO computation happens
// here: every figure (totals, VAT, lowest marks, differences) arrives pre-computed on
// `data.computed` from the adapter (R7) — components format and place, nothing else. Every
// evaluative section renders its buyer-authored provenance mark (R6; freeze §4.1).

import { Fragment } from "react";
import type { MoneyValue } from "@/frontend/components/format";
import { formatDate } from "../format";
import { CsProvenance, CsSectionHeading } from "./cs-sheet";
import type {
  ComparativeStatementData,
  CsApprovalBlock,
  CsLineItem,
  CsVendor,
} from "./cs-view-models";

/** 2-dp tabular figure without a currency symbol — the currency is declared once in the meta. */
function amt(value: MoneyValue | undefined): string {
  if (!value) return "—";
  return value.amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const DAGGER = "†";

/* ------------------------------- page 1 sections ------------------------------- */

export function CsTitleAndMeta({ data }: { data: ComparativeStatementData }) {
  return (
    <div style={{ width: "104mm" }}>
      <div style={{ textAlign: "right", marginBottom: "2mm" }}>
        <span className="cs-doc-title">COMPARATIVE STATEMENT (CS)</span>{" "}
        <span className="cs-draft-chip">DRAFT — FOR APPROVAL</span>
      </div>
      <table className="cs-kv">
        <tbody>
          <tr>
            <th scope="row">Draft Reference</th>
            <td>{data.draftReference}</td>
          </tr>
          <tr>
            <th scope="row">RFQ No.</th>
            <td>{data.humanRef ?? "—"}</td>
          </tr>
          <tr>
            <th scope="row">RFQ Title</th>
            <td>{data.rfqTitle}</td>
          </tr>
          {data.project ? (
            <tr>
              <th scope="row">Project</th>
              <td>{data.project}</td>
            </tr>
          ) : null}
          {data.deliveryLocation ? (
            <tr>
              <th scope="row">Delivery Location</th>
              <td>{data.deliveryLocation}</td>
            </tr>
          ) : null}
          <tr>
            <th scope="row">Issue Date</th>
            <td>{formatDate(data.issueDate)}</td>
          </tr>
          <tr>
            <th scope="row">Currency</th>
            <td>{data.currency}</td>
          </tr>
          <tr>
            <th scope="row">Prepared By</th>
            <td>{data.preparedByLabel}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function CsVendorRoster({ vendors }: { vendors: CsVendor[] }) {
  return (
    <div>
      <CsSectionHeading>Participating Vendors</CsSectionHeading>
      <table className="cs-data">
        <thead>
          <tr>
            <th style={{ width: "6mm" }}>#</th>
            <th>Vendor</th>
            <th style={{ width: "30mm" }}>Quotation Ref.</th>
            <th style={{ width: "22mm" }}>Received</th>
            <th style={{ width: "26mm" }}>Delivery Offer</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v, i) => (
            <tr key={v.quotationId}>
              <td className="cs-num">{i + 1}</td>
              <td>
                <b>{v.vendorName}</b>
              </td>
              <td>{v.quotationRef ?? "—"}</td>
              <td>{v.receivedAt ? formatDate(v.receivedAt) : "—"}</td>
              <td>{v.deliveryOffer ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CsCommercialSummary({ data }: { data: ComparativeStatementData }) {
  const { computed, vendors, buyerEvaluation } = data;
  const low = vendors[computed.lowestVendorIdx];
  const second =
    computed.secondLowestVendorIdx !== undefined
      ? vendors[computed.secondLowestVendorIdx]
      : undefined;
  const recommended =
    buyerEvaluation?.recommendedVendorIdx !== undefined
      ? vendors[buyerEvaluation.recommendedVendorIdx]
      : undefined;
  return (
    <div>
      <CsSectionHeading>Commercial Summary</CsSectionHeading>
      <table className="cs-kv">
        <tbody>
          <tr>
            <th scope="row">Total Line Items</th>
            <td>{computed.totalItems}</td>
          </tr>
          <tr>
            <th scope="row">Vendors Compared</th>
            <td>{vendors.length}</td>
          </tr>
          <tr>
            <th scope="row">
              Lowest Grand Total <span className="cs-caption">(computed)</span>
            </th>
            <td>
              <b>
                {low?.vendorName} — {data.currency}{" "}
                {amt(computed.grandTotals[computed.lowestVendorIdx])}
              </b>
            </td>
          </tr>
          {second && computed.secondLowestVendorIdx !== undefined ? (
            <tr>
              <th scope="row">
                Second Lowest <span className="cs-caption">(computed)</span>
              </th>
              <td>
                {second.vendorName} — {data.currency}{" "}
                {amt(computed.grandTotals[computed.secondLowestVendorIdx])}
              </td>
            </tr>
          ) : null}
          {recommended ? (
            <tr>
              <th scope="row">
                Recommended Vendor <span className="cs-caption">{DAGGER}</span>
              </th>
              <td>
                <b style={{ color: "var(--cs-low-ink)" }}>{recommended.vendorName}</b>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export function CsExecutiveSummary({ text }: { text: string }) {
  return (
    <div>
      <CsSectionHeading caption={`${DAGGER} buyer-authored`}>Executive Summary</CsSectionHeading>
      <p style={{ margin: 0, fontSize: "8.4pt", textAlign: "justify" }}>{text}</p>
      <CsProvenance>
        <b>{DAGGER}</b> Recorded by the buyer&apos;s procurement team. The platform computes
        arithmetic (totals, VAT, lowest-price identification) only and generates no recommendation.
      </CsProvenance>
    </div>
  );
}

/** Printed signature blocks — wet ink on paper; nothing is captured digitally (freeze §3.4). */
export function CsSignatures({
  approvals,
  heading,
}: {
  approvals: CsApprovalBlock[];
  heading: string;
}) {
  return (
    <div>
      <CsSectionHeading>{heading}</CsSectionHeading>
      <div className="cs-sig-grid">
        {approvals.map((a) => (
          <div className="cs-sig-cell" key={a.role}>
            <div className="cs-sig-role">{a.role}</div>
            <div className="cs-sig-space" />
            <div className="cs-sig-line">
              <div className="cs-sig-name">{a.name ?? " "}</div>
              <div className="cs-sig-title">{a.title ?? " "}</div>
              <div className="cs-sig-title">Date: ____________</div>
            </div>
          </div>
        ))}
      </div>
      <CsProvenance>
        Signatures are executed on the printed document. The platform does not capture digital
        signatures.
      </CsProvenance>
    </div>
  );
}

/* ------------------------------- item comparison table ------------------------------- */

export function CsItemsTable({
  data,
  items,
  withTotals,
}: {
  data: ComparativeStatementData;
  items: CsLineItem[];
  withTotals: boolean;
}) {
  const { vendors, computed } = data;
  // Fixed columns ≈ 41.6% + lowest 6.4%; the rest splits evenly across the vendor pairs.
  const vendorPairPct = 52 / vendors.length;
  const unitPct = `${(vendorPairPct * 0.45).toFixed(2)}%`;
  const totalPct = `${(vendorPairPct * 0.55).toFixed(2)}%`;

  const totalRow = (label: string, values: MoneyValue[], className: string) => (
    <tr className={className}>
      <td colSpan={5} style={{ textAlign: "right", fontWeight: 700 }}>
        {label}
      </td>
      {vendors.map((v, vi) => (
        <td key={v.quotationId} className="cs-num" colSpan={2}>
          {amt(values[vi])}
        </td>
      ))}
      <td />
    </tr>
  );

  return (
    <table className="cs-items">
      <thead>
        <tr>
          <th rowSpan={2} style={{ width: "3.2%" }}>
            Sl
          </th>
          <th rowSpan={2} style={{ textAlign: "left", width: "17%" }}>
            Item Description
          </th>
          <th rowSpan={2} style={{ textAlign: "left", width: "12%" }}>
            Specification
          </th>
          <th rowSpan={2} style={{ width: "4.2%" }}>
            Unit
          </th>
          <th rowSpan={2} style={{ width: "5.2%" }}>
            Qty
          </th>
          {vendors.map((v) => (
            <th key={v.quotationId} colSpan={2}>
              {v.vendorName}
            </th>
          ))}
          <th rowSpan={2} style={{ width: "6.4%" }}>
            Lowest Unit ({data.currency})
          </th>
        </tr>
        <tr className="cs-items-sub">
          {vendors.map((v) => (
            <Fragment key={v.quotationId}>
              <th style={{ width: unitPct }}>Unit Price</th>
              <th style={{ width: totalPct }}>Total Price</th>
            </Fragment>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.sl}>
            <td className="cs-num">{item.sl}</td>
            <td>{item.description}</td>
            <td>{item.specification ?? "—"}</td>
            <td style={{ textAlign: "center" }}>{item.unit}</td>
            <td className="cs-num">{item.quantity.toLocaleString("en-US")}</td>
            {item.cells.map((cell, vi) => {
              const low = item.lowestVendorIdx?.includes(vi) ? " cs-low" : "";
              if (cell.sealed) {
                // Sealed-until-close (Doc-3 §10.1 POLICY): explain the seal, never a blank.
                return (
                  <td key={vendors[vi].quotationId} colSpan={2} className="cs-caption">
                    Sealed until window close
                  </td>
                );
              }
              return (
                <Fragment key={vendors[vi].quotationId}>
                  <td className={`cs-num${low}`}>{amt(cell.unitPrice)}</td>
                  <td className={`cs-num${low}`}>{amt(cell.totalPrice)}</td>
                </Fragment>
              );
            })}
            <td className="cs-num cs-low">{amt(item.lowestUnitPrice)}</td>
          </tr>
        ))}
        {withTotals ? (
          <>
            {totalRow(`Sub Total (${data.currency})`, computed.subTotals, "cs-totals")}
            {totalRow(`VAT (${computed.vatRatePct}%)`, computed.vatAmounts, "cs-totals")}
            {totalRow(`Grand Total (${data.currency})`, computed.grandTotals, "cs-grand")}
          </>
        ) : null}
      </tbody>
    </table>
  );
}

export function CsLowestLegend() {
  return (
    <CsProvenance>
      <span className="cs-legend-swatch" /> Lowest quoted unit price per item (arithmetic
      identification — not a recommendation).
    </CsProvenance>
  );
}

/* ------------------------------- final page sections ------------------------------- */

export function CsCommercialComparison({ data }: { data: ComparativeStatementData }) {
  const { computed } = data;
  return (
    <div>
      <CsSectionHeading>Commercial Comparison Summary</CsSectionHeading>
      <table className="cs-kv">
        <tbody>
          <tr>
            <th scope="row">Lowest Grand Total ({data.currency})</th>
            <td className="cs-num" style={{ textAlign: "right" }}>
              {amt(computed.grandTotals[computed.lowestVendorIdx])}
            </td>
          </tr>
          {computed.secondLowestVendorIdx !== undefined ? (
            <tr>
              <th scope="row">Second Lowest ({data.currency})</th>
              <td className="cs-num" style={{ textAlign: "right" }}>
                {amt(computed.grandTotals[computed.secondLowestVendorIdx])}
              </td>
            </tr>
          ) : null}
          {computed.differenceAmount ? (
            <tr>
              <th scope="row">Difference ({data.currency})</th>
              <td className="cs-num" style={{ textAlign: "right" }}>
                {amt(computed.differenceAmount)}
              </td>
            </tr>
          ) : null}
          {computed.differencePct ? (
            <tr>
              <th scope="row">Difference (%)</th>
              <td className="cs-num" style={{ textAlign: "right" }}>
                {computed.differencePct}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export function CsTechnicalSummary({ data }: { data: ComparativeStatementData }) {
  const summary = data.buyerEvaluation?.technicalSummary;
  if (!summary) return null;
  return (
    <div>
      <CsSectionHeading caption={`${DAGGER} buyer-authored`}>
        Technical Evaluation Summary
      </CsSectionHeading>
      <table className="cs-kv">
        <tbody>
          <tr>
            <th scope="row">Fully Compliant Vendors</th>
            <td>{summary.fullyCompliant}</td>
          </tr>
          <tr>
            <th scope="row">Partially Compliant Vendors</th>
            <td>{summary.partiallyCompliant}</td>
          </tr>
          <tr>
            <th scope="row">Non-Compliant Vendors</th>
            <td>{summary.nonCompliant}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function CsDeliveryComparison({ data }: { data: ComparativeStatementData }) {
  if (data.computed.deliveryComparison.length === 0) return null;
  return (
    <div>
      <CsSectionHeading>Delivery Comparison</CsSectionHeading>
      <table className="cs-kv">
        <tbody>
          {data.computed.deliveryComparison.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The Buyer Evaluation Summary (owner-adjudicated MAJOR-3 — this section is NEVER titled
 * "Vendor Ranking"): the buyer&apos;s confirmed evaluation order, with grand totals placed as
 * computed facts alongside it.
 */
export function CsBuyerEvaluationSummary({ data }: { data: ComparativeStatementData }) {
  const evaluation = data.buyerEvaluation;
  if (!evaluation) return null;
  return (
    <div>
      <CsSectionHeading caption={`${DAGGER} buyer-authored`}>
        Buyer Evaluation Summary
      </CsSectionHeading>
      <table className="cs-data">
        <thead>
          <tr>
            <th style={{ width: "10mm" }}>Order</th>
            <th>Vendor</th>
            <th style={{ width: "27mm", textAlign: "right" }}>Grand Total ({data.currency})</th>
            <th style={{ width: "30mm" }}>Technical</th>
            <th style={{ width: "18mm" }}>Delivery</th>
          </tr>
        </thead>
        <tbody>
          {evaluation.evaluationOrder.map((row, i) => {
            const vendor = data.vendors[row.vendorIdx];
            const recommended = evaluation.recommendedVendorIdx === row.vendorIdx;
            return (
              <tr
                key={vendor.quotationId}
                style={recommended ? { background: "var(--cs-low-bg)" } : undefined}
              >
                <td className="cs-num">{i + 1}</td>
                <td>{recommended ? <b>{vendor.vendorName}</b> : vendor.vendorName}</td>
                <td className="cs-num">{amt(data.computed.grandTotals[row.vendorIdx])}</td>
                <td>{row.technical ?? "—"}</td>
                <td>{vendor.deliveryOffer ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <CsProvenance>
        <b>{DAGGER}</b> Evaluation order confirmed by the buyer&apos;s procurement team from the
        computed totals and its own technical assessment. This is the buyer&apos;s record — the
        platform does not rank vendors or recommend a winner.
      </CsProvenance>
    </div>
  );
}

export function CsRecommendationPanel({ data }: { data: ComparativeStatementData }) {
  const evaluation = data.buyerEvaluation;
  if (!evaluation || evaluation.recommendedVendorIdx === undefined) return null;
  const recommended = data.vendors[evaluation.recommendedVendorIdx];
  return (
    <div>
      <CsSectionHeading caption={`${DAGGER} buyer-authored`}>Recommendation</CsSectionHeading>
      <table className="cs-kv">
        <tbody>
          <tr>
            <th scope="row">Recommended Vendor</th>
            <td>
              <b style={{ color: "var(--cs-low-ink)" }}>{recommended.vendorName}</b>
            </td>
          </tr>
          {evaluation.reasons?.length ? (
            <tr>
              <th scope="row">Reason for Recommendation</th>
              <td>
                {evaluation.reasons.map((reason) => (
                  <div key={reason}>
                    <span className="cs-tick">✓</span> {reason}
                  </div>
                ))}
              </td>
            </tr>
          ) : null}
          {evaluation.risk ? (
            <tr>
              <th scope="row">Risk Assessment</th>
              <td>{evaluation.risk}</td>
            </tr>
          ) : null}
          {evaluation.commercialAdvantage ? (
            <tr>
              <th scope="row">Commercial Position</th>
              <td>{evaluation.commercialAdvantage}</td>
            </tr>
          ) : null}
          {evaluation.remarks ? (
            <tr>
              <th scope="row">Remarks</th>
              <td>{evaluation.remarks}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

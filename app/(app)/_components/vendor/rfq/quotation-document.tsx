// QUOTATION DOCUMENT — the CANONICAL quotation template (owner directive 2026-07-07: "Preview must
// match the final quotation document"). SINGLE SOURCE OF TRUTH: the in-browser preview renders THIS
// component, and the generated document/PDF (ESC-QTN-PDF-SHARE — browser print interim, platform
// doc-gen on ratification) renders THIS component too. There is no simplified preview layout.
//
// Paper-fixed styling (deliberate, same class as the Comparative Statement print view): the document
// is a theme-INVARIANT paper artifact — fixed white/slate/amber utilities are used INSIDE the paper
// instead of kit theme tokens so the preview is byte-identical to the exported document in light AND
// dark themes. Kit tokens stay authoritative everywhere outside document surfaces.
//
// Read-only by construction: this component renders data, carries no inputs and no handlers. Edits
// happen only on the Author Quotation page. Own-data-only (ND-1..ND-8); the vendor letterhead block
// is a genuine-empty placeholder until the organization profile read is wired (no fabricated
// identity). Buyer details bind EXISTING granted RfqSnapshotView fields only.
import { CurrencyDisplay } from "@/frontend/components/currency-display";

/** Plain grouped number — currency shows ONLY on the Grand total and in the "Unit rate" column
 *  header (owner directive 2026-07-07). */
const formatNumber = (n: number) =>
  new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 }).format(n);

/** Defense-in-depth scrub before the rich description HTML is injected (authored device-local
 *  by the same user via the workbench editor; scrubbed again here at the injection point). */
const scrubHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");

export interface QuotationDocumentLine {
  itemName: string;
  sizeSpec: string;
  qty?: number;
  unit?: string;
  unitPrice?: number;
  rowTotal?: number;
  amended?: boolean;
  /** Buyer's original spec — present when amended (feeds the amendment summary). */
  originalSpec?: string;
  amendmentNote?: string;
  notOffered?: boolean;
  notOfferedNote?: string;
  /** Optional vendor short description for the line — rendered wrapped under the item. */
  shortDescription?: string;
}

export interface QuotationDocumentModel {
  rfqHumanRef?: string;
  /** SYSTEM-MANAGED revision (read-only; Rev 0 before first submit). */
  revisionNo: number;
  currency: string;
  subject?: string;
  client: {
    /** Resolved buyer org display name (frozen `buyer_org_id` → name by integration). */
    companyName?: string;
    siteLocation?: string;
    district?: string;
    deliveryDateLabel?: string;
    deliveryInstructions?: string;
  };
  lines: QuotationDocumentLine[];
  totals: {
    totalAmount: number;
    /** Discount (% + flat, capped at the total) applies before VAT/AIT. */
    discountAmount: number;
    discountedTotal: number;
    aitIncluded: boolean;
    aitPct: number;
    aitAmount: number;
    vatIncluded: boolean;
    vatPct: number;
    vatAmount: number;
    grandTotal: number;
  };
  /** Vendor commercial-term groups (only groups with content). */
  terms: { label: string; rows: string[] }[];
  complianceDeclaration?: string;
  buyerConditions: { label: string; value: string }[];
  /** Covering message + optional remarks (ESC-QTN-SUBMIT-INFO). */
  message?: string;
  remarks?: string;
  contactPerson?: string;
  contactNumber?: string;
  attachments: string[];
}

const chipClass =
  "ml-2 inline-flex rounded-sm border px-1.5 py-0.5 align-middle text-2xs font-semibold uppercase leading-none tracking-wide";

function AmendedChip() {
  return (
    <span className={`${chipClass} border-amber-200 bg-amber-50 text-amber-700`}>Amended</span>
  );
}

function NotOfferedChip() {
  return (
    <span className={`${chipClass} border-slate-300 bg-slate-100 text-slate-600`}>Not offered</span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide text-slate-700">
      {children}
    </h3>
  );
}

export function QuotationDocument({ model }: { model: QuotationDocumentModel }) {
  const amendedLines = model.lines.filter((line) => line.amended);
  const offeredCount = model.lines.filter((line) => !line.notOffered).length;
  const notOfferedCount = model.lines.length - offeredCount;

  return (
    <article className="mx-auto w-full max-w-[840px] space-y-6 bg-white p-8 text-sm text-slate-900 shadow-iv-md sm:p-10">
      {/* ── Company header ── */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
        <div className="min-w-48 rounded-md border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-500">
          Company letterhead
          <span className="block">Loads from your organization profile at submission.</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-widest text-slate-900">QUOTATION</p>
          <p className="mt-1 font-mono text-sm">{model.rfqHumanRef ?? "—"}</p>
          <p className="text-xs text-slate-500">Rev {model.revisionNo}</p>
        </div>
      </header>

      {/* "Quotation details" section REMOVED (owner 2026-07-07) — the ref + Rev already live in the
          company header and the currency lives in the pricing header; `subject` stays in the model
          for future surfaces. */}

      {/* ── Client & delivery details ── */}
      {/* OWNER RULE (2026-07-07): the BUYER's contact person / contact number are authoring-surface
          facts only — they are deliberately NOT part of this offer document and must not be added
          here. The document's "Contact person" section below is the VENDOR's own submission contact. */}
      <section className="space-y-2">
        <SectionTitle>Client &amp; delivery details</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <dl className="space-y-1.5">
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
                Company name
              </dt>
              <dd className="mt-0.5 font-medium">{model.client.companyName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
                RFQ reference
              </dt>
              <dd className="mt-0.5 font-mono">{model.rfqHumanRef ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
                Site location
              </dt>
              <dd className="mt-0.5">{model.client.siteLocation ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
                District
              </dt>
              <dd className="mt-0.5">{model.client.district ?? "—"}</dd>
            </div>
          </dl>
          <dl className="space-y-1.5">
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
                Delivery required by
              </dt>
              <dd className="mt-0.5">{model.client.deliveryDateLabel ?? "—"}</dd>
            </div>
            {model.client.deliveryInstructions ? (
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
                  Delivery instructions
                </dt>
                <dd className="mt-0.5">{model.client.deliveryInstructions}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        <p className="text-xs text-slate-500">Client identity as stated on the RFQ.</p>
      </section>

      {/* ── Item-wise quotation & pricing ── */}
      <section className="space-y-2">
        <SectionTitle>Item-wise quotation &amp; pricing</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Item-wise quotation and pricing</caption>
            <thead>
              <tr className="border-b border-slate-900 text-left text-2xs font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="py-2 pr-2 font-semibold">
                  Sl.
                </th>
                <th scope="col" className="py-2 pr-2 font-semibold">
                  Item &amp; specification
                </th>
                <th scope="col" className="py-2 pr-2 text-right font-semibold">
                  Qty / unit
                </th>
                <th scope="col" className="py-2 pr-2 text-right font-semibold">
                  Unit rate ({model.currency})
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Row total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {model.lines.map((line, index) => (
                <tr key={index} className={line.notOffered ? "text-slate-500" : undefined}>
                  <td className="py-2 pr-2 align-top text-slate-500">{index + 1}</td>
                  <td className="py-2 pr-2 align-top">
                    <span className="font-medium">{line.itemName || "—"}</span>
                    {line.sizeSpec ? (
                      <span className="block text-xs text-slate-500">{line.sizeSpec}</span>
                    ) : null}
                    {line.notOffered ? <NotOfferedChip /> : null}
                    {line.amended ? <AmendedChip /> : null}
                    {line.notOffered && line.notOfferedNote ? (
                      <span className="block text-xs italic text-slate-500">
                        {line.notOfferedNote}
                      </span>
                    ) : null}
                    {line.shortDescription?.trim() ? (
                      <span
                        className="block whitespace-pre-line break-words text-xs text-slate-600"
                        dangerouslySetInnerHTML={{ __html: scrubHtml(line.shortDescription) }}
                      />
                    ) : null}
                  </td>
                  <td className="py-2 pr-2 text-right align-top tabular-nums">
                    {line.qty ?? "—"}
                    {line.unit ? ` ${line.unit}` : ""}
                  </td>
                  <td className="py-2 pr-2 text-right align-top tabular-nums">
                    {!line.notOffered && line.unitPrice != null
                      ? formatNumber(line.unitPrice)
                      : "—"}
                  </td>
                  <td className="py-2 text-right align-top font-semibold tabular-nums">
                    {line.notOffered ? (
                      <span className="font-normal">Not offered</span>
                    ) : line.rowTotal != null ? (
                      formatNumber(line.rowTotal)
                    ) : (
                      <span className="font-normal">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          {offeredCount} {offeredCount === 1 ? "item" : "items"} offered
          {notOfferedCount > 0 ? ` · ${notOfferedCount} not offered` : ""}.
        </p>
      </section>

      {/* ── Material price estimate summary ── */}
      <section className="space-y-2">
        <SectionTitle>Material price estimate summary</SectionTitle>
        <dl className="ml-auto w-full max-w-sm space-y-1">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Total amount (sum of all rows)</dt>
            <dd className="tabular-nums">{formatNumber(model.totals.totalAmount)}</dd>
          </div>
          {model.totals.discountAmount > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Discount</dt>
                <dd className="tabular-nums">− {formatNumber(model.totals.discountAmount)}</dd>
              </div>
              <div className="flex items-center justify-between font-medium">
                <dt>Total after discount</dt>
                <dd className="tabular-nums">{formatNumber(model.totals.discountedTotal)}</dd>
              </div>
            </>
          ) : null}
          {model.totals.aitIncluded ? (
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">AIT ({model.totals.aitPct}%)</dt>
              <dd className="tabular-nums">{formatNumber(model.totals.aitAmount)}</dd>
            </div>
          ) : null}
          {model.totals.vatIncluded ? (
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">VAT ({model.totals.vatPct}%)</dt>
              <dd className="tabular-nums">{formatNumber(model.totals.vatAmount)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-slate-900 pt-1 text-base font-bold">
            <dt>Grand total</dt>
            <dd className="tabular-nums">
              <CurrencyDisplay amount={model.totals.grandTotal} currency={model.currency} />
            </dd>
          </div>
        </dl>
      </section>

      {/* ── Commercial terms ── */}
      <section className="space-y-2">
        <SectionTitle>Commercial terms</SectionTitle>
        {model.terms.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {model.terms.map((group) => (
              <div key={group.label}>
                <p className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
                  {group.label}
                </p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                  {group.rows.map((row, index) => (
                    <li key={index}>{row}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No commercial terms stated.</p>
        )}
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
            Specification compliance declaration
          </p>
          <p className="mt-1 whitespace-pre-line break-words">
            {model.complianceDeclaration?.trim() ? (
              model.complianceDeclaration
            ) : (
              <span className="text-slate-500">Not provided.</span>
            )}
          </p>
        </div>
      </section>

      {/* ── Buyer conditions (read only) ── */}
      <section className="space-y-2">
        <SectionTitle>Buyer conditions (read only)</SectionTitle>
        {model.buyerConditions.length > 0 ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            {model.buyerConditions.map((item) => (
              <div key={item.label}>
                <dt className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
                  {item.label}
                </dt>
                <dd className="mt-0.5">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-slate-500">The buyer did not state additional conditions.</p>
        )}
      </section>

      {/* ── Buyer specification amendments ── */}
      <section className="space-y-2">
        <SectionTitle>Buyer specification amendments</SectionTitle>
        {amendedLines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Buyer specification amendments</caption>
              <thead>
                <tr className="border-b border-slate-900 text-left text-2xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="py-2 pr-2 font-semibold">
                    Sl.
                  </th>
                  <th scope="col" className="py-2 pr-2 font-semibold">
                    Buyer specification
                  </th>
                  <th scope="col" className="py-2 pr-2 font-semibold">
                    Vendor amendment
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {amendedLines.map((line) => (
                  <tr key={model.lines.indexOf(line)}>
                    <td className="py-2 pr-2 text-slate-500">{model.lines.indexOf(line) + 1}</td>
                    <td className="py-2 pr-2">{line.originalSpec ?? "—"}</td>
                    <td className="py-2 pr-2 font-medium">
                      {[line.itemName, line.sizeSpec].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="py-2">
                      {line.amendmentNote?.trim() ? (
                        line.amendmentNote
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500">No specification amendments proposed.</p>
        )}
      </section>

      {/* ── Notes ── */}
      {model.message?.trim() || model.remarks?.trim() ? (
        <section className="space-y-2">
          <SectionTitle>Notes</SectionTitle>
          {model.message?.trim() ? (
            <p className="whitespace-pre-line break-words">{model.message}</p>
          ) : null}
          {model.remarks?.trim() ? (
            <p className="whitespace-pre-line break-words text-slate-700">{model.remarks}</p>
          ) : null}
        </section>
      ) : null}

      {/* ── Attachments ── */}
      <section className="space-y-2">
        <SectionTitle>Attachments</SectionTitle>
        {model.attachments.length > 0 ? (
          <ul className="list-disc space-y-0.5 pl-5">
            {model.attachments.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">No attachments.</p>
        )}
      </section>

      {/* ── Contact person ── */}
      <section className="space-y-2">
        <SectionTitle>Contact person</SectionTitle>
        <p>
          {model.contactPerson?.trim() ? (
            <span className="font-medium">{model.contactPerson}</span>
          ) : (
            <span className="text-slate-500">—</span>
          )}
          {model.contactNumber?.trim() ? (
            <span className="text-slate-700"> · {model.contactNumber}</span>
          ) : null}
        </p>
      </section>

      {/* ── Authorized signature block (wet-ink) ── */}
      <section className="grid gap-10 pt-6 sm:grid-cols-2">
        <div>
          <div className="h-16 border-b border-slate-400" />
          <p className="mt-1 text-xs text-slate-500">Authorized signature &amp; seal</p>
        </div>
        <div>
          <div className="h-16 border-b border-slate-400" />
          <p className="mt-1 text-xs text-slate-500">Name, designation &amp; date</p>
        </div>
      </section>
    </article>
  );
}

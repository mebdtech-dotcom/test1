"use client";

// P-BUY-RFQ — RFQ PREVIEW DOCUMENT (owner directive 2026-07-07): the "Submit RFQ" preview renders the
// RFQ as a paper document, the same document convention as the vendor's quotation preview — but with
// BUYER content ONLY. No vendor features here: no pricing, no financial summary, no offer terms, no
// signature block. Buyer-INTERNAL guidance (routing preferences, budget, urgency, special
// instructions) is deliberately EXCLUDED from the document body — vendors never receive it
// (non-disclosure, types grounding in rfq-form-models.ts) — and a footnote says so honestly.
//
// Paper-fixed styling (theme-invariant document artifact — same class as the vendor QuotationDocument
// and the CS print view): fixed white/slate utilities inside the paper only. No fabricated RFQ number:
// the human_ref is assigned by the system at submission, so the header says exactly that.
// Presentation-only: renders the draft form object; no fetch, no mutation.
import { sanitizeRichNoteHtml } from "@/frontend/components/rich-note-editor";
import type { RfqDraftForm, WorkNature } from "./rfq-form-models";

const WORK_NATURE_LABEL: Record<WorkNature, string> = {
  supply: "Supply",
  service: "Service",
  fabricate: "Fabricate",
  consult: "Consult",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide text-slate-700">
      {children}
    </h3>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-2xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}

export function RfqPreviewDocument({ form }: { form: RfqDraftForm }) {
  const rows =
    form.itemRows && form.itemRows.length > 0
      ? form.itemRows
      : form.itemName || form.quantity
        ? [
            {
              id: "single",
              itemName: form.itemName ?? "",
              size: "",
              quantity: form.quantity ?? "",
              unit: form.unit ?? "",
              description: "",
            },
          ]
        : [];

  const readyAttachments = (form.attachments ?? []).filter((a) => a.status !== "too-large");

  return (
    <article className="mx-auto w-full max-w-[840px] space-y-6 bg-white p-8 text-sm text-slate-900 shadow-iv-md sm:p-10">
      {/* ── Header ── */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
        <div>
          <p className="text-2xl font-bold tracking-widest text-slate-900">REQUEST FOR QUOTATION</p>
          {/* RFQ reference slot (owner directive 2026-07-07). The year-scoped human_ref is
              SYSTEM-ASSIGNED at submission (M0 ID gen) — the masked format renders here, never a
              coined number (ESC-CS-REF class: zero fabricated refs anywhere). */}
          <p className="mt-1 text-2xs font-semibold uppercase tracking-wide text-slate-500">
            RFQ reference
          </p>
          <p className="font-mono text-lg font-semibold text-slate-900">RFQ-YYYY-######</p>
          <p className="text-xs text-slate-500">Assigned by the platform at submission.</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p>{form.categoryLabel?.trim() ? form.categoryLabel : "Category —"}</p>
          <p className="mt-0.5">
            {form.workNature && form.workNature.length > 0
              ? form.workNature.map((w) => WORK_NATURE_LABEL[w]).join(" · ")
              : "Request type —"}
          </p>
        </div>
      </header>

      {/* ── Privacy statement (owner-specified copy 2026-07-10 — trust_adoption_ladder §5.3) — makes
          the document's non-disclosure posture visible: always-private (Doc-3 §5.1), routing-scoped
          visibility, internal-only guidance (the closing footnote states the exclusion). ── */}
      <section aria-label="Privacy" className="rounded border border-slate-300 bg-slate-50 p-3">
        <dl className="space-y-1 text-xs text-slate-700">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-2xs font-semibold uppercase tracking-wide text-slate-500">
              Privacy
            </dt>
            <dd>Private RFQ</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-2xs font-semibold uppercase tracking-wide text-slate-500">
              Visibility
            </dt>
            <dd>Only vendors matched by your routing preferences or explicitly selected by you</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-2xs font-semibold uppercase tracking-wide text-slate-500">
              Internal
            </dt>
            <dd>Budget and routing preferences remain confidential</dd>
          </div>
        </dl>
      </section>

      {/* ── Subject & scope ── */}
      <section className="space-y-1">
        <SectionTitle>Subject &amp; scope</SectionTitle>
        <p className="font-medium">{form.itemName?.trim() ? form.itemName : "—"}</p>
        {form.scopeText?.trim() ? (
          <p className="whitespace-pre-line break-words text-slate-700">{form.scopeText}</p>
        ) : null}
        {form.noFormalSpec ? (
          <p className="text-xs text-slate-500">No formal specification is attached.</p>
        ) : null}
      </section>

      {/* ── Delivery & contact ── */}
      <section className="space-y-2">
        <SectionTitle>Delivery &amp; contact</SectionTitle>
        <dl className="grid grid-cols-2 gap-3">
          <DetailItem label="Delivery location" value={form.deliveryLocation} />
          <DetailItem label="District" value={form.district} />
          <DetailItem label="Site" value={form.deliverySite} />
          <DetailItem label="Delivery required by" value={form.deliveryDate} />
          <DetailItem label="Contact person" value={form.contactPersonName} />
          <DetailItem label="Contact number" value={form.contactPersonNumber} />
        </dl>
        {form.deliveryInstructions?.trim() ? (
          <p className="text-slate-700">{form.deliveryInstructions}</p>
        ) : null}
      </section>

      {/* ── Item requirements ── */}
      <section className="space-y-2">
        <SectionTitle>Item requirements</SectionTitle>
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Item requirements</caption>
              <thead>
                <tr className="border-b border-slate-900 text-left text-2xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="py-2 pr-2 font-semibold">
                    Sl.
                  </th>
                  <th scope="col" className="py-2 pr-2 font-semibold">
                    Item name
                  </th>
                  <th scope="col" className="py-2 pr-2 font-semibold">
                    Size
                  </th>
                  <th scope="col" className="py-2 pr-2 text-right font-semibold">
                    Qty / unit
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td className="py-2 pr-2 align-top text-slate-500">{index + 1}</td>
                    <td className="py-2 pr-2 align-top font-medium">{row.itemName || "—"}</td>
                    <td className="py-2 pr-2 align-top">{row.size || "—"}</td>
                    <td className="py-2 pr-2 text-right align-top tabular-nums">
                      {[row.quantity, row.unit].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="py-2 align-top">
                      {row.description?.trim() ? (
                        <span
                          className="block whitespace-pre-line break-words text-xs text-slate-600"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeRichNoteHtml(row.description),
                          }}
                        />
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
          <p className="text-slate-500">No item lines added yet.</p>
        )}
      </section>

      {/* ── Technical requirements ── */}
      <section className="space-y-2">
        <SectionTitle>Technical requirements</SectionTitle>
        <dl className="grid grid-cols-2 gap-3">
          <DetailItem label="Brand preference" value={form.brandPreference} />
          <DetailItem label="Alternative brand" value={form.alternativeBrand} />
          <DetailItem label="Condition" value={form.productCondition} />
          <DetailItem label="Standards" value={form.standards} />
          <DetailItem label="Certifications" value={form.certifications} />
        </dl>
      </section>

      {/* ── Terms & conditions ── */}
      <section className="space-y-2">
        <SectionTitle>Terms &amp; conditions</SectionTitle>
        {form.termsAndConditions && form.termsAndConditions.length > 0 ? (
          <ol className="list-decimal space-y-0.5 pl-5">
            {form.termsAndConditions.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ol>
        ) : (
          <p className="text-slate-500">No additional conditions stated.</p>
        )}
      </section>

      {/* ── Attachments ── */}
      <section className="space-y-2">
        <SectionTitle>Attachments</SectionTitle>
        {readyAttachments.length > 0 ? (
          <ul className="list-disc space-y-0.5 pl-5">
            {readyAttachments.map((file) => (
              <li key={file.id}>
                {file.name}
                {file.sizeLabel ? (
                  <span className="text-xs text-slate-500"> · {file.sizeLabel}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">No attachments.</p>
        )}
      </section>

      <p className="border-t border-slate-200 pt-3 text-xs text-slate-500">
        Routing preferences, budget and priority guidance stay internal — vendors do not receive
        them with this RFQ.
      </p>
    </article>
  );
}

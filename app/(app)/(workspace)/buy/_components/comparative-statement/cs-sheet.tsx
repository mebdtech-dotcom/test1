// Comparative Statement (CS) — A4 sheet primitives (WP-2; freeze §3.1/§3.2, Visual-Approval-bound).
// Server Components, pure functions of their props (Content ≠ Presentation, Inv #9). Each CsSheet is
// one explicit A4 landscape page: screen preview + print page are the SAME composition (the print
// CSS only resizes to the printable area — layout is fixed and deterministic, never font-shrunk).
// Page numbering is content-driven: the composer passes computed `pageNo`/`totalPages`.

import type { ReactNode } from "react";
import type { CsLetterhead } from "./cs-view-models";

/** One A4 landscape sheet. Wide-content rule: scrolls inside its own container on narrow screens. */
export function CsSheet({
  pageNo,
  totalPages,
  children,
}: {
  pageNo: number;
  totalPages: number;
  children: ReactNode;
}) {
  return (
    <div className="cs-sheet-scroll">
      <div className="cs-sheet">
        <div className="cs-sheet-body">{children}</div>
        <div className="cs-foot">
          <div className="cs-foot-conf">
            <b>CONFIDENTIAL:</b> Generated via the iVendorz Procurement Platform for the
            buyer&apos;s internal evaluation. Unauthorized use or distribution is prohibited.
          </div>
          <div className="cs-foot-pg">
            Page {pageNo} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Full letterhead (page 1). MOCK content until ESC-CS-LETTERHEAD — buyer branding is unmodeled. */
export function CsLetterheadBlock({ letterhead }: { letterhead: CsLetterhead }) {
  return (
    <div className="cs-lh-left" style={{ display: "flex", gap: "4mm", alignItems: "flex-start" }}>
      {/* Decorative mock mark — a real buyer logo asset is gated on ESC-CS-LETTERHEAD. */}
      <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
        <rect x="1" y="1" width="44" height="44" rx="3" fill="#16304f" />
        <rect x="9" y="22" width="7" height="15" fill="#ffffff" />
        <rect x="19" y="15" width="7" height="22" fill="#ffffff" />
        <rect x="29" y="9" width="7" height="28" fill="#c9a227" />
      </svg>
      <div>
        <div className="cs-lh-name">{letterhead.name.toUpperCase()}</div>
        {letterhead.tagline ? <div className="cs-lh-tag">{letterhead.tagline}</div> : null}
        <div className="cs-lh-contact">
          {letterhead.addressLine}
          {letterhead.contactLine ? <> &nbsp;·&nbsp; {letterhead.contactLine}</> : null}
          {letterhead.registrationLine ? (
            <>
              <br />
              <span>{letterhead.registrationLine}</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * The repeating document header (page 2 onward — freeze §3.1: slim letterhead variant + title +
 * reference line on every page). "Draft Reference" is the mock-era label (MAJOR-2/MINOR-1) — no
 * CS series exists until ESC-CS-REF.
 */
export function CsCompactHead({
  letterheadName,
  humanRef,
}: {
  letterheadName: string;
  humanRef?: string;
}) {
  return (
    <>
      <div className="cs-page-head">
        <div className="cs-page-head-l">
          <span className="cs-page-head-co">{letterheadName.toUpperCase()}</span>
          <span className="cs-page-head-t">COMPARATIVE STATEMENT (CS)</span>
          <span className="cs-draft-chip">DRAFT</span>
        </div>
        <div className="cs-page-head-r">
          Ref: <b>Draft (series pending approval)</b>
          {humanRef ? (
            <>
              {" "}
              &nbsp;|&nbsp; RFQ No.: <b>{humanRef}</b>
            </>
          ) : null}
        </div>
      </div>
      <hr className="cs-rule-strong" />
      <hr className="cs-rule-thin" />
    </>
  );
}

/** Uppercase section heading with the double-rule document style. */
export function CsSectionHeading({
  children,
  caption,
  bare,
}: {
  children: ReactNode;
  caption?: string;
  bare?: boolean;
}) {
  return (
    <div className="cs-sec-h" style={bare ? { borderBottom: 0, marginBottom: "2pt" } : undefined}>
      {children}
      {caption ? <span className="cs-caption"> {caption}</span> : null}
    </div>
  );
}

/** Buyer-authored provenance caption (R6 — rendered under every evaluative section). */
export function CsProvenance({ children }: { children: ReactNode }) {
  return <div className="cs-prov">{children}</div>;
}

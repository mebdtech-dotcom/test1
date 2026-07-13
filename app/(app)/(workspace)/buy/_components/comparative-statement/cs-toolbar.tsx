"use client";

// Comparative Statement (CS) — screen-only toolbar (WP-2; freeze §3.3). The ONLY client component
// on this surface, and only because Print needs `window.print()` — a user-agent capability, not a
// platform export. GOVERNANCE (load-bearing):
//  • Excel export is an HONEST GATED STUB — platform PDF/Excel generation is not a frozen
//    capability (`rfq-workflow.md` §7) and is Board-gated on ESC-CS-EXPORT; the button is disabled
//    and says so. Nothing is fabricated.
//  • "Print / Save as PDF" = the browser's own print-to-PDF over the fixed A4 sheets (freeze
//    Visual-Approval print rules: A4 landscape, small margins).

import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/frontend/primitives/button";

export function CsToolbar({ rfqId }: { rfqId: string }) {
  return (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/buy/rfqs/${rfqId}/compare`}>
          <ArrowLeft aria-hidden /> Back to comparison
        </Link>
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled
        title="Excel export is pending governance approval (ESC-CS-EXPORT)"
      >
        <FileSpreadsheet aria-hidden /> Excel export
        <span className="sr-only"> (pending governance approval)</span>
      </Button>
      <Button size="sm" onClick={() => window.print()}>
        <Printer aria-hidden /> Print / Save as PDF
      </Button>
    </>
  );
}

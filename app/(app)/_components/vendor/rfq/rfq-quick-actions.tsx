"use client";

// RFQ Details quick actions (owner directive 2026-07-07). HONEST AFFORDANCES ONLY:
// · Download RFQ / Download BOQ — GATED: no generated RFQ/BOQ artifact is modeled anywhere (frozen
//   doc-gen = M4 engagement docs over the fixed five-format enum; the granted spec documents remain
//   the only real downloadable set). Registered: ESC-QTN-RFQ-ACTIONS.
// · Ask question — REAL navigation to the RFQ detail page's clarifications thread (M6, delivery-only).
// · Watch RFQ — GATED: no RFQ watch/follow concept exists on any frozen M3 surface (ESC-QTN-RFQ-ACTIONS).
// · Print — live user-agent print of the BUYER RFQ ONLY (owner 2026-07-07): the scoped-print
//   trigger + the portaled RFQ sheet live with the workbench (quotation-print.css).
import Link from "next/link";
import { Bell, Download, FileText, MessageSquare, Printer } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { printQuotationSheet } from "./quotation-workbench";

export interface RfqQuickActionsProps {
  rfqId: string;
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function RfqQuickActions({ rfqId, basePath = "/workspace" }: RfqQuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        title="Connects with document export"
      >
        <Download aria-hidden="true" /> Download RFQ
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        title="Connects with document export"
      >
        <FileText aria-hidden="true" /> Download BOQ
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href={`${basePath}/rfqs/${rfqId}`}>
          <MessageSquare aria-hidden="true" /> Ask question
        </Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        title="Watching connects in a later update"
      >
        <Bell aria-hidden="true" /> Watch RFQ
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => printQuotationSheet("rfq")}
        title="Print the buyer RFQ"
      >
        <Printer aria-hidden="true" /> Print
      </Button>
    </div>
  );
}

// Vendor Workspace — Mushok Challan (VX-01 nav destination, under Business Docs). Instruments the
// still-OPEN `ESC-OPS-DOC-MUSHOK` gap (esc_registry.md): Bangladesh-statutory VAT documents (Mushok
// forms, e.g. 6.3) are UNMODELED in the frozen corpus — zero document kind, format, or finance-
// record subtype exists for them anywhere in Doc-2/Doc-4F. Per an explicit owner ruling (2026-07-03)
// to include this nav entry despite that gap, this page discloses the gap plainly via
// `ImplementationPendingView` rather than inventing a document kind, category, or coined slug — the
// nav entry EXISTS (as directed), but nothing behind it is fabricated. Resolution channel per the
// ESC row: an additive Doc-2 §2/§10.5 + Doc-4F §F5/§F7 patch, human Architecture Board.
import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import { ImplementationPendingView } from "../../../../_components/vendor/implementation-pending-view";

export const metadata: Metadata = { title: "Mushok Challan" };

export default function MushokChallanPage() {
  return (
    <ImplementationPendingView
      breadcrumb={[
        { label: "Business Docs", href: "/sell/documents" },
        { label: "Mushok Challan" },
      ]}
      title="Mushok Challan"
      description="Bangladesh-statutory VAT documents are not yet modeled in the frozen corpus (ESC-OPS-DOC-MUSHOK) — no document kind, format, or record exists for them today."
      icon={<Receipt aria-hidden />}
    />
  );
}

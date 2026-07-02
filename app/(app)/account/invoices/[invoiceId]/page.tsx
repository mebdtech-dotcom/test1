// Platform invoice detail route (`/account/invoices/[invoiceId]`) — P-ACC-21 (Doc-7E · T-DETAILS;
// page_inventory §13). A SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY.
// Nested under `/account/invoices`, so it inherits that segment's Platform Shell (one shell).
//
// PRESENTATION ONLY: reads a single platform invoice via the frozen `get_platform_invoice` (BC-BILL-5,
// Doc-4I §HB-5.4). An unknown invoice id resolves to a genuine not-found (byte-identical to absence,
// Doc-7E). The shell owns the `<main>` container + the page `<h1>` (PageHeader).
import { notFound } from "next/navigation";
import { PageHeader } from "../../../_components/shell/page-header";
import { InvoiceDetail } from "./invoice-detail";
import { getInvoice } from "./invoice-detail-data";

export const metadata = {
  title: "Invoice — iVendorz",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const invoice = getInvoice(invoiceId);
  if (!invoice) notFound();

  return (
    <>
      <PageHeader title="Platform invoice" description="A fee owed to iVendorz." />
      <InvoiceDetail invoice={invoice} />
    </>
  );
}

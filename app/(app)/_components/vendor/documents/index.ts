// Vendor Documents hub composition (Team 3, FE-DOC-02, P-DOC-02). Holds the vendor-private
// view-models + presentation view; the actual reusable infra is the shared documents home
// (`app/(app)/_components/documents`), imported directly, never forked (its own header comment:
// "buyer↔vendor surfaces import THIS, never each other").
export { DocumentsHubView } from "./documents-hub-view";
export {
  DOCUMENTS_HUB_VIEWS,
  generatedDocKindLabel,
  GENERATED_DOC_KIND_LABEL,
  type DocumentDirection,
  type DocumentsHubView as DocumentsHubViewPreset,
  type GeneratedDocumentRow,
  type HubEngagementRow,
  type TradeInvoicePointer,
  type DocumentsHubData,
} from "./documents-hub-view-models";

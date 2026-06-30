// Typed presentation props for Vendor Catalog & Products (Milestone 4, S6–S7). ZERO CONTRACT
// INVENTION: every field/enum/state is a REAL frozen value (Doc-2 §10.3, Doc-6D §3.3, Doc-4M).
// Products are matching-relevant CONTENT (DP5). All optional → genuine-empty in the presentation phase.
//
// NOTE (flagged, not invented): the companion's S2 wireframe lists a "SKU" field; the frozen
// marketplace.products table has NO sku column (name, description, images_jsonb, status, audit/
// soft-delete only). SKU is OMITTED — companion↔corpus reconciliation item, never fabricated.

/** Product lifecycle (marketplace.product_status; Doc-4M). */
export type ProductStatus = "draft" | "published" | "unpublished";

/** Spec document type (marketplace.spec_doc_type). */
export type SpecDocType = "urs" | "datasheet" | "checklist" | "drawing" | "standard";

/** A product image: file_ref from images_jsonb, resolved to a signed URL by integration for display. */
export interface ProductImageRef {
  href?: string;
  name?: string;
}

export interface ProductView {
  id: string;
  name?: string;
  description?: string;
  status?: ProductStatus;
  images?: ProductImageRef[];
  /** Concurrency token + display (get_product.v1 updated_at). */
  updated_at?: string;
}

/** marketplace.spec_documents — IMMUTABLE versioned (Invariant 8): new row per version, only
 *  is_active_revision toggles; never overwritten/deleted. */
export interface SpecDocumentView {
  id: string;
  doc_type?: SpecDocType;
  version_no: number;
  revision_label?: string;
  revision_reason?: string;
  /** false → superseded by a newer version (kept for reference). */
  is_active_revision?: boolean;
  /** storage_ref resolved to a signed URL + display name by integration. */
  href?: string;
  name?: string;
  created_at?: string;
}

/** Catalog publishing allowance — numeric entitlement values ONLY (never a plan name; Invariant 10). */
export interface PublishAllowanceView {
  used?: number;
  limit?: number;
}

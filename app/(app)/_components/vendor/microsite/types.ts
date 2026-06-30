// Typed presentation props for the Vendor Microsite & Branding surface (Milestone 3, S10–S14).
//
// ZERO CONTRACT INVENTION: every field/enum/state is a REAL frozen value (Doc-2 §10.3/§3.4,
// Doc-6D marketplace schema, Doc-4M state machines, Doc-5D BC-MKT-4, Doc-5I entitlements). Display
// props, not contract DTOs — integration maps the wired reads on. All optional: the presentation
// phase has no data, so screens render genuine-empty states.
//
// NOTE (flagged, not invented) — two companion↔corpus discrepancies, bound to the frozen schema:
//  • Branding is ASSET-based (asset_type ∈ logo|banner|colors|video|brochure|gallery + file_ref;
//    "colors" is an unstructured object). The companion's granular primary/secondary/accent color
//    pickers + font_family/favicon are NOT frozen columns → not rendered as such.
//  • SEO has og_image but NO frozen og_title / og_description columns → omitted.

/** Microsite lifecycle (Doc-4M; marketplace.microsites.status). */
export type MicrositeStatus = "draft" | "published" | "unpublished";

/** Presentation template choice (marketplace.microsites.layout_template). */
export type LayoutTemplate = "A" | "B" | "C" | "D" | "E";

/** Branding asset category (marketplace.branding_assets.asset_type). */
export type BrandingAssetType = "logo" | "banner" | "colors" | "video" | "brochure" | "gallery";

/** Draft (controlling-org only) vs public (after publish) visibility. */
export type AssetVisibility = "draft" | "public";

/** Custom domain lifecycle (Doc-4M; marketplace.custom_domains.status). */
export type CustomDomainStatus = "pending" | "verified" | "active" | "released";

export interface MicrositeView {
  microsite_id?: string;
  status?: MicrositeStatus;
  layout_template?: LayoutTemplate;
  /** Public live URL, resolved by integration (subdomain or active custom domain). */
  live_url?: string;
}

export interface MicrositeSectionView {
  section_id: string;
  section_name?: string;
  /** Display label from the contract — NOT a hardcoded enum (section_type set is contract-owned). */
  section_type?: string;
  visibility?: AssetVisibility;
  order?: number;
}

export interface BrandingAssetView {
  asset_type: BrandingAssetType;
  /** Frozen storage reference. */
  file_ref?: string;
  /** Integration-resolved signed URL + display name for the kit FileLink (absent in presentation). */
  href?: string;
  name?: string;
  visibility?: AssetVisibility;
}

export interface SeoSettingsView {
  title?: string;
  meta_description?: string;
  keywords?: string;
  /** og_image file_ref (resolved href/name supplied by integration for display). */
  og_image?: string;
  og_image_href?: string;
  og_image_name?: string;
  /** Server-derived; read-only. */
  canonical_url?: string;
  /** Structured data (Schema.org) JSON; advanced, read-only display. */
  schema_jsonb?: string;
  visibility?: AssetVisibility;
}

export interface CustomDomainView {
  domain?: string;
  status?: CustomDomainStatus;
  /** DNS/file verification record (frozen field; shown read-only). */
  verification_token?: string;
  verified_at?: string;
  /** Whether the org holds the custom_domain entitlement (boolean; resolve_entitlements — never a plan name). */
  entitlement?: boolean;
}

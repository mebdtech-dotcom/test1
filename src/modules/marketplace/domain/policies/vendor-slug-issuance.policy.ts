// M2 domain policy (PRIVATE) — Vendor Slug issuance per the Doc-2 v1.0.5 Vendor Slug law (PATCH-D2-04).
//
// The FORMAT LAW is FIXED (D2-04.2 — defined once in Doc-2 v1.0.5; DDL realization = the
// `vendor_profiles_slug_format_ck` CHECK, Doc-6D_VendorSlugSubdomain_Patch_v1.0.1 6D-VSS-01.1):
//   • grammar `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$` (lowercase, DNS-label-safe, no edge hyphen)
//   • length 3–40
//   • ASCII-only; punycode (`xn--`) rejected explicitly
// The RESERVED-LABEL list is POLICY (`marketplace.reserved_subdomain_labels`, Doc-3 v1.10 — checked at
// ISSUANCE/migration time only, never retroactive). The list VALUE is read at runtime via the M0
// `core.config_value_query.v1` facade by the caller and passed in — this policy holds NO label literal
// (Doc-4A §18.2: values live in `core.system_configuration`, never in code).
//
// DERIVATION [realization convention — disclosed in W3-MKT-GAP-ANALYSIS §5]: Doc-2 v1.0.5 fixes that
// the slug is PLATFORM-ISSUED (D2-04.1 — never a caller input; Doc-4D §D4's `create_vendor_profile`
// request contract carries no slug field) but is silent on the name→label algorithm. This module
// realizes a deterministic ASCII kebab-case derivation; the uniqueness collision path is handled by the
// CALLER (repository retry with a numeric suffix against `vendor_profiles_slug_live_uq`). Contradicts
// nothing upstream.

/** The FIXED Doc-2 v1.0.5 D2-04.2 grammar (verbatim; also enforced by the DDL CHECK). */
export const VENDOR_SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/** FIXED length bounds (Doc-2 v1.0.5 D2-04.2). */
export const VENDOR_SLUG_MIN_LENGTH = 3;
export const VENDOR_SLUG_MAX_LENGTH = 40;

/**
 * Full-reference POLICY key for the reserved-label list (Doc-4A §18.2 reference form; registered by
 * Doc-3 v1.10). Read via `core.config_value_query.v1` — the VALUE never appears in code.
 */
export const RESERVED_SUBDOMAIN_LABELS_KEY =
  "core.system_configuration.marketplace.reserved_subdomain_labels";

/** True iff `slug` satisfies the FIXED Doc-2 v1.0.5 D2-04.2 format law (incl. punycode rejection). */
export function isValidVendorSlug(slug: string): boolean {
  return (
    slug.length >= VENDOR_SLUG_MIN_LENGTH &&
    slug.length <= VENDOR_SLUG_MAX_LENGTH &&
    VENDOR_SLUG_PATTERN.test(slug) &&
    !slug.startsWith("xn--")
  );
}

/**
 * Derive the base platform-issued slug candidate from the vendor display name [realization
 * convention]: lowercase → non-`[a-z0-9]` runs collapse to single hyphens → edge hyphens trimmed →
 * truncated to the FIXED max length (re-trimming a trailing hyphen the cut may expose). Returns `null`
 * when nothing DNS-label-safe survives (e.g. a fully non-ASCII name) — the caller then falls back to a
 * neutral generated label (`vendor-<suffix>`), keeping issuance server-side and law-conformant.
 */
export function deriveVendorSlugBase(name: string): string | null {
  const collapsed = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, VENDOR_SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
  if (collapsed.length < VENDOR_SLUG_MIN_LENGTH) return null;
  if (collapsed.startsWith("xn--")) return null;
  return collapsed;
}

/**
 * True iff `slug` collides with a reserved platform label (Doc-2 v1.0.5 D2-04.2 issuance-time gate).
 * `reservedLabels` is the POLICY value (`marketplace.reserved_subdomain_labels`) resolved by the
 * caller via `core.config_value_query.v1`; matching is exact (labels are whole DNS labels).
 */
export function isReservedVendorSlug(slug: string, reservedLabels: readonly string[]): boolean {
  return reservedLabels.includes(slug);
}

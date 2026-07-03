// Vendor URL Builder (FE-PUB-10, ADR-024 Decision 6 / Doc-7D §11.8 — Vendor URL Builder rule,
// SHALL). The ONE place any emitter (page, component, and — per the frozen rule — future backend/
// email/notification/sitemap/SEO-metadata/JSON-LD emitters too) obtains a vendor profile URL;
// direct `{slug}.ivendorz.com` or `/vendors/${slug}` concatenation anywhere else is the exact
// defect this rule exists to prevent.
//
// PRESENTATION-ONLY INTERIM [ESC-MKT-CANONICAL-URL]: real Canonical Host Resolution (CHR, Doc-2
// v1.0.5 D2-04.3 — non-routable → ∅; active bound custom domain → canonical; else the
// Platform-issued Vendor Subdomain, fail-closed) needs a backend read (vendor subdomain binding +
// active-custom-domain status) this presentation-only codebase doesn't have. This builder emits
// today's `/vendors/[slug]` path shape verbatim — byte-identical to the pre-FE-PUB-10 output, zero
// visual change — and is the single swap point a later wave flips to emit the real CHR-resolved
// host (`https://{slug}.ivendorz.com/...`) without touching any of the ~14 call sites that use it.
// Real subdomain migration/resolution stays [ESC-MKT-SUBDOMAIN-MIGRATE] (open).
//
// The 6 subpage keys match the frozen 7-route microsite IA (ADR-022; home = no subpage argument).
// The 2 legacy redirect stubs (`capabilities`→`about`, `certifications`→`resources`) are not
// destinations here — they call this builder for their redirect TARGET, same as any other emitter.
export type VendorSubpage =
  | "about"
  | "products"
  | "projects"
  | "industries"
  | "contact"
  | "resources";

/** The canonical vendor profile URL builder — every emitter must call this, never concatenate. */
export function vendorHref(slug: string, subpage?: VendorSubpage): string {
  return subpage ? `/vendors/${slug}/${subpage}` : `/vendors/${slug}`;
}

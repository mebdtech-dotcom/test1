-- Doc-6D — M2 Marketplace & Discovery (`marketplace`) — `marketplace_directory_indexes`
-- (forward-only, ADDITIVE expand pattern; Doc-6A §11). W3-MKT-2 [Wave-3 M2 second slice] — index
-- support for the `marketplace.list_vendor_directory.v1` read (Doc-4D PassB Discovery; field-level
-- realization Doc-5D_VendorDirectoryProjection_Patch_v1.0.3 / PATCH-5D-VLD-01), which introduces the
-- (name, id) keyset sort order and the geography equality filters over `marketplace.vendor_profiles`.
--
-- Does NOT touch 20260711100000_marketplace_vendor_slug_pilot (the first slice's migration): new
-- objects only, no ALTER/DROP of any prior DDL (additive expand — Doc-6A §11). No new enums / FKs /
-- RLS — indexes only.
--
-- INDEX CHOICES & REASONING
-- ─────────────────────────────────────────────────────────────────────────────
-- (1) vendor_profiles_directory_keyset_idx — PARTIAL b-tree on (name, id)
--     WHERE visibility = 'public' AND deleted_at IS NULL.
--     The directory read orders EVERY page by the total-order keyset (ORDER BY name ASC, id ASC —
--     Doc-5D §3). Without this index the DEFAULT surface (the no-filter directory page) does a full
--     sort of vendor_profiles on every anonymous request (Team-6 MINOR-1: an unindexed full-sort on
--     an anonymous public surface). Indexing exactly (name, id) makes the ORDER BY an index-ordered
--     scan (no sort node); making it PARTIAL over the publicly-visible working set mirrors the
--     existing vendor_profiles_public_idx predicate (visibility='public' AND deleted_at IS NULL) and
--     keeps the index to the hot rows. The residual status='active' filter is applied cheaply on top
--     (banned/suspended public rows are a minority) — the predicate is kept identical to the existing
--     partial convention rather than adding status, so the index stays useful even if the status
--     projection ever changes.
--     Partial → Prisma cannot express the WHERE, so it lives in this raw SQL ONLY (the same split the
--     first slice used for its partial/unique/CHECK objects). It is NOT declared as an @@index in
--     schema.prisma; a partial index is invisible to Prisma's schema diff, so this introduces no
--     drift (the first slice's slug_live_uq / org_live_uq / public_idx prove the pattern).
--
-- (2) vendor_profiles_directory_geo_idx — composite b-tree on
--     (country, division, district, industrial_zone).
--     Supports the geography equality filters. In the Bangladesh geographic hierarchy these are
--     applied as a left-to-right drill-down (country → division → district → industrial_zone), so a
--     single left-prefix composite index covers every realistic filter subset — this is the minimal
--     set that removes the sequential-scan risk WITHOUT the four single-column indexes an over-indexed
--     alternative would add. Kept NON-partial so it is Prisma-expressible and declared as an @@index
--     on the VendorProfile model in schema.prisma (the visibility predicate is already served by the
--     keyset index + the residual visibility filter; geography values on non-visible rows are
--     negligible). The category_id filter is already served by the first slice's
--     category_assignments_live_uq (vendor_profile_id, category_id), so no additional index is needed
--     for the category-assignment join.

CREATE INDEX "vendor_profiles_directory_keyset_idx"
  ON "marketplace"."vendor_profiles" ("name", "id")
  WHERE "visibility" = 'public' AND "deleted_at" IS NULL;

CREATE INDEX "vendor_profiles_directory_geo_idx"
  ON "marketplace"."vendor_profiles" ("country", "division", "district", "industrial_zone");

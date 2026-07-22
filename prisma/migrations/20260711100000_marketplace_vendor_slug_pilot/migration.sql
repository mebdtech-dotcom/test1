-- Doc-6D — M2 Marketplace & Discovery (`marketplace`) Schema Realization — `marketplace_vendor_slug_pilot`
-- (forward-only; Doc-6A §11). W3-MKT-1 [Wave-3 M2 pilot slice] — the two anonymous Public Discovery
-- reads `marketplace.get_public_vendor_profile.v1` (Doc-4D PassB Discovery / Doc-5D Pass-1 row 64)
-- and `marketplace.resolve_vendor_slug.v1` (Doc-4D_VendorSlugResolve_Patch_v1.0.4 /
-- Doc-5D_VendorSlugResolve_Patch_v1.0.2).
--
-- Realizes: vendor_profiles (Doc-6D Pass-1 §3.1.1, AR; incl. the VSS 6D-VSS-01.1 slug format CHECK
-- inline — Doc-6D_VendorSlugSubdomain_Patch_v1.0.1) + categories (Pass-2 §3.2 — pulled forward: the
-- frozen public projection needs real category names, unlike the deferred trust_indicators/
-- profile_experience) + category_assignments (Pass-1 §3.1.4) + vendor_slug_history
-- (6D-VSS-01.2/01.3, append-only, public-read/system-write). Because categories is created in THIS
-- SAME migration, `category_assignments_category_fk` is INLINE (not the Pass-1 DDL-1 deferred ALTER
-- — that deferral existed only because Pass-1/Pass-2 were originally separate migrations; the
-- `memberships_role_fk` precedent in `identity_init` folds the same way).
--
-- OUT OF SCOPE (land with their own build waves): vendor_capacity_profiles, declared_financial_tiers,
-- financial_tier_history, vendor_ownership_history, vendor_matching_attributes, vendor_claim_records,
-- products, spec library, presentation (microsites/profile_sections/branding/seo/custom_domains),
-- advertisements, showcase_projects, catalog_favorites.
--
-- Tables/columns are realized by Prisma (schema.prisma); enums / FKs / partial-unique / CHECK / RLS
-- are raw SQL here (Doc-6D §2 tri-actor tenancy model). `CREATE SCHEMA marketplace` already ran in
-- the Wave-0 baseline migration (00000000000000_init_schemas).
--
-- NOTE: `[Doc-2 binding]` = column/type/constraint verbatim from Doc-2 §10.3 / Doc-6D;
--       `[§2.5 choice]` = physical realization (names, index predicates) per Doc-6D §2.5.

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enums (Doc-6D §3.1.1 / §3.1.4) — declared before the tables that use them
-- ─────────────────────────────────────────────────────────────────────────────

-- [Doc-2 §5.3 binding] vendor CLAIM dimension (independent of STATUS — §5.3 two-dimension state)
CREATE TYPE "marketplace"."vendor_claim_state" AS ENUM ('seeded', 'invited', 'claimed', 'verified');
-- [Doc-2 §5.3 binding] vendor STATUS dimension
CREATE TYPE "marketplace"."vendor_status" AS ENUM ('active', 'suspended', 'banned');
-- [Doc-2 §10.3 `visibility(public)` binding] the only value; NO buyer_private (Doc-6D MK-CR3)
CREATE TYPE "marketplace"."vendor_visibility" AS ENUM ('public');
-- [Doc-2 §10.3 `level(primary/secondary)` binding]
CREATE TYPE "marketplace"."category_assignment_level" AS ENUM ('primary', 'secondary');
-- [Doc-2 §10.3 binding]
CREATE TYPE "marketplace"."category_assignment_status" AS ENUM ('proposed', 'active', 'removed');

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Tables (Doc-2 §10.3 columns verbatim; physical specifics [§2.5]) — FK-valid order:
--     vendor_profiles (no deps) → categories (self-FK) → category_assignments (needs both) →
--     vendor_slug_history (needs vendor_profiles).
-- ─────────────────────────────────────────────────────────────────────────────

-- §3.1.1 — marketplace.vendor_profiles — AR; capability matrix (Invariant #1); §5.3 two-dimension
-- state; public-readable, write = controlling org (bare-UUID → M1, no cross-schema FK). Stores NO
-- trust/performance score (Invariant #6 firewall — Doc-6D §1).
CREATE TABLE "marketplace"."vendor_profiles" (
  "id"                          uuid                                NOT NULL,                    -- [Doc-6A §3.1] PK UUIDv7
  "human_ref"                   text                                NOT NULL,                    -- [Doc-2 §0.1/§10.3] VENDOR-YYYY-NNNNNN via core.allocate_human_ref('VENDOR', year) — prefix [§2.5]
  "controlling_organization_id" uuid                                NOT NULL,                    -- [Doc-2 §10.3] bare UUID → M1 (no cross-schema FK; RLS write anchor)
  "name"                        text                                NOT NULL,                    -- [Doc-2 §10.3]
  "slug"                        text                                NOT NULL,                    -- [Doc-2 §10.3] partial-unique-live below
  "can_supply"                  boolean                             NOT NULL DEFAULT false,       -- [Doc-2 §10.3 / Invariant #1] capability matrix — 4 booleans, not a label
  "can_service"                 boolean                             NOT NULL DEFAULT false,       -- [Doc-2 §10.3]
  "can_fabricate"                boolean                            NOT NULL DEFAULT false,       -- [Doc-2 §10.3]
  "can_consult"                 boolean                             NOT NULL DEFAULT false,       -- [Doc-2 §10.3]
  "vendor_type_preset"          text,                                                              -- [Doc-2 §10.3]
  "country"                     text,                                                              -- [Doc-2 §10.3] geography
  "division"                    text,                                                              -- [Doc-2 §10.3]
  "district"                    text,                                                              -- [Doc-2 §10.3]
  "industrial_zone"             text,                                                              -- [Doc-2 §10.3]
  "claim_state"                 "marketplace"."vendor_claim_state" NOT NULL DEFAULT 'seeded',      -- [Doc-2 §5.3]
  "status"                      "marketplace"."vendor_status"      NOT NULL DEFAULT 'active',      -- [Doc-2 §5.3]
  "visibility"                  "marketplace"."vendor_visibility"  NOT NULL DEFAULT 'public',      -- [Doc-2 §10.3]
  "created_at"                  timestamptz                         NOT NULL DEFAULT now(),         -- [Doc-6A R5]
  "updated_at"                  timestamptz                         NOT NULL DEFAULT now(),
  "created_by"                  uuid,                                                              -- [Doc-2 §0.2] actor
  "updated_by"                  uuid,
  "deleted_at"                  timestamptz,                                                       -- [Doc-2 §0.2] soft-delete
  "deleted_by"                  uuid,
  "delete_reason"               text,
  CONSTRAINT "vendor_profiles_pkey" PRIMARY KEY ("id"),                                            -- [§2.5] name
  CONSTRAINT "vendor_profiles_human_ref_uq" UNIQUE ("human_ref"),                                  -- [Doc-2 §0.1] human_ref never reused → plain unique
  -- [Doc-6D_VendorSlugSubdomain_Patch_v1.0.1 6D-VSS-01.1] Vendor Slug format law (FIXED, Doc-2
  -- v1.0.5 D2-04.2) — realized inline (this table is created fresh in this migration; VSS's own
  -- additive-ALTER form applied to an ALREADY-existing table, not applicable here).
  CONSTRAINT "vendor_profiles_slug_format_ck" CHECK (
    "slug" ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
    AND char_length("slug") BETWEEN 3 AND 40
    AND "slug" NOT LIKE 'xn--%'
  )
);
CREATE UNIQUE INDEX "vendor_profiles_slug_live_uq" ON "marketplace"."vendor_profiles" ("slug") WHERE "deleted_at" IS NULL;                          -- [Doc-2 §10.3 binding] slug UNIQUE (partial)
CREATE UNIQUE INDEX "vendor_profiles_org_live_uq"  ON "marketplace"."vendor_profiles" ("controlling_organization_id") WHERE "deleted_at" IS NULL;  -- [Doc-2 §10.3 binding] one profile per org (partial)
CREATE INDEX "vendor_profiles_public_idx" ON "marketplace"."vendor_profiles" ("status") WHERE "visibility" = 'public' AND "deleted_at" IS NULL;    -- [§2.5] Band H public directory

-- §3.2 — marketplace.categories — 4-level self-FK tree; platform-owned; admin-governed (DD-4).
-- No status enum (Doc-2 §10.3 lists none — "retired" = soft-deleted; anti-coining, Doc-6D Pass-2 §3.2).
CREATE TABLE "marketplace"."categories" (
  "id"            uuid        NOT NULL,                             -- [Doc-6A §3.1] PK UUIDv7
  "parent_id"     uuid,                                              -- [Doc-2 §10.3] self-FK (NULL = level-1 root)
  "name"          text        NOT NULL,                              -- [Doc-2 §10.3]
  "slug"          text        NOT NULL,                              -- [Doc-2 §10.3]
  "level"         smallint    NOT NULL,                              -- [Doc-2 §10.3] 1–4
  "path"          text        NOT NULL,                              -- [Doc-2 §10.3] materialized path ([§2.5] text, not ltree)
  "created_at"    timestamptz NOT NULL DEFAULT now(),                -- [Doc-6A R5]
  "updated_at"    timestamptz NOT NULL DEFAULT now(),
  "created_by"    uuid,                                              -- [Doc-2 §0.2] actor
  "updated_by"    uuid,
  "deleted_at"    timestamptz,                                       -- [Doc-2 §10.3] SD = retire
  "deleted_by"    uuid,
  "delete_reason" text,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),                   -- [§2.5] name
  CONSTRAINT "categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "marketplace"."categories"("id"),  -- [Doc-6A §5.2] intra-schema self-FK
  CONSTRAINT "categories_level_chk" CHECK ("level" BETWEEN 1 AND 4)  -- [Doc-2 §10.3] 4-level max (column part; parent-consistency is service — Doc-6D Pass-2 §3.2 note)
);
CREATE UNIQUE INDEX "categories_slug_live_uq" ON "marketplace"."categories" ("slug")      WHERE "deleted_at" IS NULL;  -- [§2.5] global slug routing uniqueness
CREATE INDEX        "categories_parent_idx"   ON "marketplace"."categories" ("parent_id") WHERE "deleted_at" IS NULL;  -- [§2.5] tree walk
CREATE INDEX        "categories_path_idx"     ON "marketplace"."categories" ("path")      WHERE "deleted_at" IS NULL;  -- [§2.5] subtree prefix

-- §3.1.4 — marketplace.category_assignments — vendor↔category; service-bounded ≤10 total/≤5 primary
-- (Doc-2 §10.3; the count invariant is a service concern, not a DB constraint — Doc-6D Pass-1 §3.1.4).
CREATE TABLE "marketplace"."category_assignments" (
  "id"               uuid                                       NOT NULL,                         -- [Doc-6A §3.1] PK UUIDv7
  "vendor_profile_id" uuid                                      NOT NULL,                         -- [Doc-6A §5.2] intra-schema FK
  "category_id"      uuid                                       NOT NULL,                         -- [Doc-6A §5.2] intra-schema FK (INLINE — categories exists in this same migration)
  "level"            "marketplace"."category_assignment_level"  NOT NULL,                         -- [Doc-2 §10.3]
  "is_specialized"   boolean                                    NOT NULL DEFAULT false,            -- [Doc-2 §10.3]
  "status"           "marketplace"."category_assignment_status" NOT NULL DEFAULT 'proposed',       -- [Doc-2 §10.3]
  "created_at"       timestamptz                                NOT NULL DEFAULT now(),            -- [Doc-6A R5]
  "updated_at"       timestamptz                                NOT NULL DEFAULT now(),
  "created_by"       uuid,                                                                          -- [Doc-2 §0.2] actor
  "updated_by"       uuid,
  "deleted_at"       timestamptz,                                                                   -- [Doc-2 §10.3] SD (removed)
  "deleted_by"       uuid,
  "delete_reason"    text,
  CONSTRAINT "category_assignments_pkey" PRIMARY KEY ("id"),                                        -- [§2.5] name
  CONSTRAINT "category_assignments_profile_fk"  FOREIGN KEY ("vendor_profile_id") REFERENCES "marketplace"."vendor_profiles"("id"),
  CONSTRAINT "category_assignments_category_fk" FOREIGN KEY ("category_id")       REFERENCES "marketplace"."categories"("id")
);
CREATE UNIQUE INDEX "category_assignments_live_uq" ON "marketplace"."category_assignments" ("vendor_profile_id", "category_id") WHERE "deleted_at" IS NULL;  -- [§2.5] one live assignment per (vendor, category)

-- Doc-6D_VendorSlugSubdomain_Patch_v1.0.1 6D-VSS-01.2 — marketplace.vendor_slug_history. Append-only;
-- permanent (no soft-delete — mirrors vendor_ownership_history, Invariant #8); global-unique old_slug
-- (never reused — Doc-2 v1.0.5 D2-04.5).
CREATE TABLE "marketplace"."vendor_slug_history" (
  "id"                uuid        NOT NULL,                        -- [Doc-6A §3.1] PK UUIDv7
  "vendor_profile_id" uuid        NOT NULL,                        -- [Doc-6A §5.2] intra-schema FK
  "old_slug"          text        NOT NULL,                        -- [Doc-2 v1.0.5 D2-04.5] never reused (Invariant 8)
  "new_slug"          text        NOT NULL,
  "reason"            text        NOT NULL,
  "approved_by"       uuid        NOT NULL,                        -- M8 admin actor (attribution)
  "migrated_at"       timestamptz NOT NULL DEFAULT now(),
  "created_at"        timestamptz NOT NULL DEFAULT now(),          -- [Doc-6A R5]
  "updated_at"        timestamptz NOT NULL DEFAULT now(),
  "created_by"        uuid,
  "updated_by"        uuid,
  CONSTRAINT "vendor_slug_history_pkey" PRIMARY KEY ("id"),                                                    -- [§2.5] name
  CONSTRAINT "vendor_slug_history_profile_fk" FOREIGN KEY ("vendor_profile_id") REFERENCES "marketplace"."vendor_profiles"("id"),
  CONSTRAINT "vendor_slug_history_old_slug_uq" UNIQUE ("old_slug")                                              -- GLOBAL (non-partial): a retired slug is never reused by anyone
);

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) RLS — tri-actor per-class policies (Doc-6D §2 / §3.1.9; Pass-2 §3.x consolidated RLS). App-layer
--     authz is primary (the query-level shared visibility predicate); RLS is the row-visibility
--     backstop (Doc-6A §4.5). GUCs are server-set (§2.1): app.active_org, app.is_platform_staff.
--     current_setting(.,true) → NULL when unset → predicate false → fail-closed (anonymous = public-
--     read only, no tenant rows).
-- ─────────────────────────────────────────────────────────────────────────────

-- vendor_profiles: tri-actor (public read | own-org read+write | admin all) — Doc-6D §3.1.9 verbatim.
ALTER TABLE "marketplace"."vendor_profiles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendor_profiles_public_read" ON "marketplace"."vendor_profiles" FOR SELECT
  USING ("visibility" = 'public' AND "deleted_at" IS NULL);                                         -- [§2.3] banned readable (banner); routing/search exclusion = read-model, not base RLS
CREATE POLICY "vendor_profiles_org_read" ON "marketplace"."vendor_profiles" FOR SELECT
  USING ("controlling_organization_id" = current_setting('app.active_org', true)::uuid);            -- own profile incl. pre-publish
CREATE POLICY "vendor_profiles_admin" ON "marketplace"."vendor_profiles" FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "vendor_profiles_org_write" ON "marketplace"."vendor_profiles" FOR INSERT
  WITH CHECK ("controlling_organization_id" = current_setting('app.active_org', true)::uuid);
CREATE POLICY "vendor_profiles_org_modify" ON "marketplace"."vendor_profiles" FOR UPDATE
  USING      ("controlling_organization_id" = current_setting('app.active_org', true)::uuid)
  WITH CHECK ("controlling_organization_id" = current_setting('app.active_org', true)::uuid);
CREATE POLICY "vendor_profiles_org_delete" ON "marketplace"."vendor_profiles" FOR DELETE
  USING ("controlling_organization_id" = current_setting('app.active_org', true)::uuid);

-- categories: public read (non-retired) + admin write (DD-4) — Doc-6D Pass-2 consolidated RLS verbatim.
ALTER TABLE "marketplace"."categories" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON "marketplace"."categories" FOR SELECT
  USING ("deleted_at" IS NULL);
CREATE POLICY "categories_staff_manage" ON "marketplace"."categories" FOR ALL                        -- staff_can_manage_categories
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- category_assignments: public-read/org-write child — Doc-6D §3.1.9 pattern (shown for
-- vendor_capacity_profiles; "declared_financial_tiers + category_assignments identical", s/vendor_capacity_profiles/category_assignments/).
ALTER TABLE "marketplace"."category_assignments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "category_assignments_public_read" ON "marketplace"."category_assignments" FOR SELECT
  USING (EXISTS (SELECT 1 FROM "marketplace"."vendor_profiles" p
                  WHERE p."id" = "category_assignments"."vendor_profile_id"
                    AND p."visibility" = 'public' AND p."deleted_at" IS NULL));
CREATE POLICY "category_assignments_org_read" ON "marketplace"."category_assignments" FOR SELECT
  USING (EXISTS (SELECT 1 FROM "marketplace"."vendor_profiles" p
                  WHERE p."id" = "category_assignments"."vendor_profile_id"
                    AND p."controlling_organization_id" = current_setting('app.active_org', true)::uuid));
CREATE POLICY "category_assignments_admin" ON "marketplace"."category_assignments" FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "category_assignments_org_write" ON "marketplace"."category_assignments" FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM "marketplace"."vendor_profiles" p
                       WHERE p."id" = "category_assignments"."vendor_profile_id"
                         AND p."controlling_organization_id" = current_setting('app.active_org', true)::uuid));
CREATE POLICY "category_assignments_org_modify" ON "marketplace"."category_assignments" FOR UPDATE
  USING (EXISTS (SELECT 1 FROM "marketplace"."vendor_profiles" p
                  WHERE p."id" = "category_assignments"."vendor_profile_id"
                    AND p."controlling_organization_id" = current_setting('app.active_org', true)::uuid));
CREATE POLICY "category_assignments_org_delete" ON "marketplace"."category_assignments" FOR DELETE
  USING (EXISTS (SELECT 1 FROM "marketplace"."vendor_profiles" p
                  WHERE p."id" = "category_assignments"."vendor_profile_id"
                    AND p."controlling_organization_id" = current_setting('app.active_org', true)::uuid));

-- vendor_slug_history — Doc-6D_VendorSlugSubdomain_Patch_v1.0.1 6D-VSS-01.3 verbatim: public SELECT
-- (old→new slug mappings are public facts — they serve public 301 resolution, Invariant 11 intact);
-- NO INSERT/UPDATE/DELETE policy for tenant roles (writes are System/service-role only — the
-- M8-mediated migration path, [ESC-MKT-SUBDOMAIN-MIGRATE], out of this pilot's scope).
ALTER TABLE "marketplace"."vendor_slug_history" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendor_slug_history_public_read" ON "marketplace"."vendor_slug_history" FOR SELECT
  USING (true);

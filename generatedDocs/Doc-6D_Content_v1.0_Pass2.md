# Doc-6D — M2 Marketplace (`marketplace`) Schema Realization — Content v1.0 **Pass-2** (§3.2 Category · §3.3 Product + Spec Library · §3.4 Presentation)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-2 — Independent Hard Review applied** (1 BLOCKER + 3 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). Realizes §3.2 + §3.3 + §3.4. Next: Pass-3 |
| Date | 2026-06-26 |
| Realizes | **Category** (`categories` — 4-level self-FK tree, admin-governed) · **Product** (`products` · `product_spec_links`) · **Spec Library** (`spec_library_entries` · `spec_documents` — versioned, never overwritten) · **Presentation** (`microsites` · `profile_sections` · `branding_assets` · `seo_settings` · `custom_domains` — Content≠Presentation, Invariant #9) |
| Authority | `Doc-2 §10.3` (the *what*); `Doc-6A` (the *how*); `Doc-6B §4` (`core.raise_immutable_violation` consumed); `Doc-6C` (`identity` referenced by UUID); `Doc-4D` (M2 ownership, DD-4 category-Admin / DD-5 entitlement, consumed); `Doc-3 v1.2` (`marketplace.*` POLICY) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.3; state sets verbatim; **categories has no status enum** (retire = soft-delete — not coined); physical specifics §2.5-tagged |
| DDL note | PostgreSQL 15+; Prisma `@@schema("marketplace")`. Closes Pass-1's deferred `category_assignments_category_fk` (categories now exists). **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.2 — `marketplace.categories` (4-level self-FK tree; platform-owned; admin-governed — DD-4)
Realizes Doc-2 §10.3. Self-FK `parent_id`; `level(1–4 CHECK)`; materialized `path`; public-read, **platform-staff write** (`staff_can_manage_categories`). SD = **retire**. **No status enum** (Doc-2 lists none — coin nothing; "retired" = soft-deleted).

```sql
CREATE TABLE marketplace.categories (
  id         uuid    NOT NULL,                                    -- [Doc-6A §3.1] PK UUIDv7
  parent_id  uuid,                                                -- [Doc-2 §10.3] self-FK (NULL = level-1 root)
  name       text    NOT NULL,                                    -- [Doc-2 §10.3]
  slug       text    NOT NULL,                                    -- [Doc-2 §10.3]
  level      smallint NOT NULL,                                   -- [Doc-2 §10.3] 1–4
  path       text    NOT NULL,                                    -- [Doc-2 §10.3] materialized path ([§2.5] text, not ltree — no extension dependency, DDL-2 lesson)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  deleted_at timestamptz, deleted_by uuid, delete_reason text,    -- [Doc-2 §10.3] SD = retire
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_fk FOREIGN KEY (parent_id) REFERENCES marketplace.categories(id),  -- [Doc-6A §5.2] intra-schema self-FK
  CONSTRAINT categories_level_chk CHECK (level BETWEEN 1 AND 4)   -- [Doc-2 §10.3] 4-level max (column part)
);
CREATE UNIQUE INDEX categories_slug_live_uq ON marketplace.categories (slug) WHERE deleted_at IS NULL;  -- [§2.5] global slug routing uniqueness
CREATE INDEX categories_parent_idx ON marketplace.categories (parent_id) WHERE deleted_at IS NULL;       -- [§2.5] tree walk
CREATE INDEX categories_path_idx   ON marketplace.categories (path)       WHERE deleted_at IS NULL;       -- [§2.5] subtree prefix
```
- **4-level max (Doc-2 §10.3 — CHECK + service):** the column CHECK bounds `level ∈ [1,4]`; the **parent-consistency** rule (`child.level = parent.level + 1`, root has `parent_id IS NULL AND level = 1`) and `path` maintenance are **service** (a cross-row tree invariant — not a single-row CHECK). DR-6-STATE-class.
- **No status enum (anti-coining):** Doc-2 §10.3 lists `name, slug, level, path` only — **no status column**. The structure's "draft→active→retired" shorthand maps to **exists (active) → soft-deleted (retired)**; a `status` enum here would **coin**. Not realized.
- **DD-4 (Admin-governed):** categories are platform reference data; **only platform staff write** (`staff_can_manage_categories` — §RLS). Buyer/vendor category *suggestions* live in `admin.category_suggestions` (M8) — not here.
- **Closes Pass-1 DDL-1:** with `categories` now realized, the deferred `category_assignments_category_fk` and `spec_library_entries.category_id` FK become valid (§7 migration / inline below).
- **RLS:** public-read (non-retired) + admin-write (§RLS). **Prisma [§2.5]:** `Category` self-relation `parent`/`children`, `@@map("categories") @@schema("marketplace")`.

## §3.3 — Product + Spec Library

### §3.3.1 `marketplace.products` (vendor catalog; status draft/published/unpublished)
Realizes Doc-2 §10.3. FK → `vendor_profiles`; `status(draft/published/unpublished)`; public-read when published; org-write.

```sql
CREATE TYPE marketplace.product_status AS ENUM ('draft', 'published', 'unpublished');   -- [Doc-2 §10.3 binding]

CREATE TABLE marketplace.products (
  id                uuid NOT NULL,
  vendor_profile_id uuid NOT NULL,                                -- [Doc-6A §5.2] intra-schema FK
  name              text NOT NULL,                                -- [Doc-2 §10.3]
  description       text,                                         -- [Doc-2 §10.3]
  images_jsonb      jsonb,                                        -- [Doc-2 §10.3] ([§2.5] jsonb of storage refs)
  status            marketplace.product_status NOT NULL DEFAULT 'draft',  -- [Doc-2 §10.3]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id)
);
CREATE INDEX products_profile_idx ON marketplace.products (vendor_profile_id) WHERE deleted_at IS NULL;                   -- [§2.5]
CREATE INDEX products_published_idx ON marketplace.products (vendor_profile_id) WHERE status = 'published' AND deleted_at IS NULL;  -- [§2.5] Band H public catalog
```
- **State** = simple enum + DEFAULT (no event-driven transitions); service guards `draft→published→unpublished`. **RLS:** published→public, draft→org-only (§RLS). **Prisma [§2.5]:** `Product`, enum `ProductStatus`.

### §3.3.2 `marketplace.spec_library_entries` (spec headers; optional category link)
Realizes Doc-2 §10.3. FK → `categories` (**optional** — now inline; categories realized §3.2). `name, summary`; public; SD.

```sql
CREATE TABLE marketplace.spec_library_entries (
  id          uuid NOT NULL,
  category_id uuid,                                               -- [Doc-2 §10.3] optional → categories (intra-schema, now inline)
  name        text NOT NULL,                                      -- [Doc-2 §10.3]
  summary     text,                                               -- [Doc-2 §10.3]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT spec_library_entries_pkey PRIMARY KEY (id),
  CONSTRAINT spec_library_entries_category_fk FOREIGN KEY (category_id) REFERENCES marketplace.categories(id)  -- [Doc-6A §5.2] intra-schema
);
CREATE INDEX spec_library_entries_category_idx ON marketplace.spec_library_entries (category_id) WHERE deleted_at IS NULL;  -- [§2.5]
```
- **Public reference** (spec catalog); platform/vendor authoring per Doc-4D. **RLS:** public-read; write per ownership contract (§RLS). **Prisma [§2.5]:** `SpecLibraryEntry`.

### §3.3.3 `marketplace.spec_documents` (versioned — **never overwritten**; column-scoped immutability)
Realizes Doc-2 §10.3. FK → `spec_library_entries` (**nullable** for buyer uploads); `owner_organization_id` (buyer uploads, bare UUID → M1). **NO SD; versioned, never overwritten.** Self-FK `supersedes_id`.

```sql
CREATE TYPE marketplace.spec_doc_type AS ENUM ('urs', 'datasheet', 'checklist', 'drawing', 'standard');  -- [Doc-2 §10.3 binding]

CREATE TABLE marketplace.spec_documents (
  id                  uuid NOT NULL,
  spec_entry_id       uuid,                                       -- [Doc-2 §10.3] nullable (buyer uploads have no library entry)
  owner_organization_id uuid,                                     -- [Doc-2 §10.3] bare UUID → M1 (buyer-uploaded docs); NULL for public library docs
  doc_type            marketplace.spec_doc_type NOT NULL,         -- [Doc-2 §10.3]
  version_no          integer NOT NULL DEFAULT 1,                 -- [Doc-2 §10.3]
  revision_label      text,                                       -- [Doc-2 §10.3] "Rev A"…
  revision_reason     text,                                       -- [Doc-2 §10.3]
  is_active_revision  boolean NOT NULL DEFAULT true,              -- [Doc-2 §10.3] the ONLY mutable column (set false when superseded)
  storage_ref         text,                                       -- [Doc-2 §10.3]
  supersedes_id       uuid,                                       -- [Doc-2 §10.3] self-FK → prior revision
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,                               -- [Doc-2 §0.2] (no SD — never deleted)
  CONSTRAINT spec_documents_pkey PRIMARY KEY (id),
  CONSTRAINT spec_documents_entry_fk      FOREIGN KEY (spec_entry_id) REFERENCES marketplace.spec_library_entries(id),
  CONSTRAINT spec_documents_supersedes_fk FOREIGN KEY (supersedes_id) REFERENCES marketplace.spec_documents(id)
);
CREATE INDEX spec_documents_entry_active_idx ON marketplace.spec_documents (spec_entry_id) WHERE is_active_revision;   -- [§2.5] active revision lookup
CREATE INDEX spec_documents_owner_idx ON marketplace.spec_documents (owner_organization_id);                          -- [§2.5] buyer-uploaded docs

-- Column-scoped immutability (Doc-6A R7; pattern = Doc-6B CR4′) — attach the M0 generic guard DIRECTLY with the protected
-- columns as TG_ARGV. No M2-local wrapper: core.raise_immutable_violation is a RETURNS-trigger function and CANNOT be PERFORM-ed
-- from plpgsql (Postgres: "trigger functions can only be called as triggers" — HR-2). is_active_revision (+ updated_at/_by) omitted
-- from the protected list = the only mutable columns (toggled on supersession); every spec-content column immutable; DELETE blocked.
CREATE TRIGGER spec_documents_immutable
  BEFORE UPDATE OR DELETE ON marketplace.spec_documents FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','spec_entry_id','owner_organization_id','doc_type','version_no','revision_label','revision_reason','storage_ref','supersedes_id','created_at','created_by');  -- [Doc-6B §4]
```
- **Versioned, never overwritten (Doc-2 §10.3):** a new revision = a **new row** (`supersedes_id` → prior; the prior's `is_active_revision` set false). The content columns are immutable; **only `is_active_revision` toggles** — realized by attaching the M0 generic guard `core.raise_immutable_violation` **directly** (column names as `TG_ARGV`; **no M2-local wrapper** — a `RETURNS trigger` function is not PERFORM-callable, HR-2). The trigger **attachment** + arg list is a **[§2.5]** realization, not a coined schema element.
- **Cross-RFQ disclosure (out of scope — M3):** buyer-uploaded docs attached to an RFQ become readable to invited vendors **only** through `rfq.rfq_document_grants` (M3-owned). Doc-6D realizes the document + its `owner_organization_id`/public RLS **only**; the grant table is M3 (referenced, never realized).
- **RLS:** public (library docs, `owner_organization_id IS NULL`) OR owner-org (buyer uploads) OR admin (§RLS). **Prisma [§2.5]:** `SpecDocument`, self-relation `supersedes`, enum `SpecDocType`.

### §3.3.4 `marketplace.product_spec_links` (M:N; composite PK; no SD)
Realizes Doc-2 §10.3. PK (product_id, spec_entry_id); intra-schema FKs; **no SD** (link rows hard-removed).

```sql
CREATE TABLE marketplace.product_spec_links (
  product_id    uuid NOT NULL,                                    -- [Doc-6A §5.2] intra-schema FK
  spec_entry_id uuid NOT NULL,                                    -- [Doc-6A §5.2] intra-schema FK
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid, -- [Doc-2 §0.2]
  CONSTRAINT product_spec_links_pkey PRIMARY KEY (product_id, spec_entry_id),  -- [Doc-2 §10.3] composite PK
  CONSTRAINT product_spec_links_product_fk FOREIGN KEY (product_id)    REFERENCES marketplace.products(id),
  CONSTRAINT product_spec_links_entry_fk   FOREIGN KEY (spec_entry_id) REFERENCES marketplace.spec_library_entries(id)
);
```
- **No SD** (Doc-2 §10.3) — a removed link is a `DELETE` (the link is not authoritative history; the product + spec rows persist). **RLS:** follows product visibility (§RLS). **Prisma [§2.5]:** `ProductSpecLink`, `@@id([productId, specEntryId])`.

## §3.4 — Presentation (Content ≠ Presentation, Invariant #9)

### §3.4.1 `marketplace.microsites` (1:1 vendor; public when published)
Realizes Doc-2 §10.3. FK → `vendor_profiles` (UNIQUE); `status(draft/published/unpublished), layout_template(A–E), theme`.

```sql
CREATE TYPE marketplace.microsite_status  AS ENUM ('draft', 'published', 'unpublished');  -- [Doc-2 §10.3 binding]
CREATE TYPE marketplace.microsite_layout  AS ENUM ('A', 'B', 'C', 'D', 'E');              -- [Doc-2 §10.3 `layout_template(A–E)`]

CREATE TABLE marketplace.microsites (
  id                uuid NOT NULL,
  vendor_profile_id uuid NOT NULL,                                -- [Doc-6A §5.2] intra-schema FK + UNIQUE
  status            marketplace.microsite_status NOT NULL DEFAULT 'draft',  -- [Doc-2 §10.3]
  layout_template   marketplace.microsite_layout NOT NULL DEFAULT 'A',      -- [Doc-2 §10.3]
  theme             jsonb,                                        -- [Doc-2 §10.3] ([§2.5] jsonb theme tokens)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT microsites_pkey PRIMARY KEY (id),
  CONSTRAINT microsites_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id),
  CONSTRAINT microsites_profile_uq UNIQUE (vendor_profile_id)     -- [Doc-2 §10.3] 1:1
);
```
- **Content≠Presentation (Invariant #9):** the microsite is **presentation** over the vendor's content (profile/products); publishing it never alters the underlying content rows. **RLS:** published→public, draft→org (§RLS). **Prisma [§2.5]:** `Microsite`, enums `MicrositeStatus`/`MicrositeLayout`.

### §3.4.2 `marketplace.profile_sections` (publish-state visibility)
Realizes Doc-2 §10.3. FK → `vendor_profiles`; `section_type, display_order, is_visible, content_json, publish_state`. Draft: controlling org; published: public.

```sql
CREATE TYPE marketplace.publish_state AS ENUM ('draft', 'published');   -- [Doc-2 §10.3 tenancy clause "draft: … / published: …"] (PUB-1)

CREATE TABLE marketplace.profile_sections (
  id                uuid NOT NULL,
  vendor_profile_id uuid NOT NULL,                                -- [Doc-6A §5.2] intra-schema FK
  section_type      text NOT NULL,                                -- [Doc-2 §10.3]
  display_order     integer NOT NULL DEFAULT 0,                   -- [Doc-2 §10.3]
  is_visible        boolean NOT NULL DEFAULT true,                -- [Doc-2 §10.3]
  content_json      jsonb,                                        -- [Doc-2 §10.3]
  publish_state     marketplace.publish_state NOT NULL DEFAULT 'draft',  -- [Doc-2 §10.3]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT profile_sections_pkey PRIMARY KEY (id),
  CONSTRAINT profile_sections_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id)
);
CREATE INDEX profile_sections_profile_order_idx ON marketplace.profile_sections (vendor_profile_id, display_order) WHERE deleted_at IS NULL;  -- [§2.5]
```
- **PUB-1 (publish_state values):** Doc-2 §10.3 names the column `publish_state` and, in the same row's tenancy cell, the two states it gates — **"draft: controlling org; published: public."** The enum realizes exactly those two named values; **no third value coined** (unlike `microsites.status`, sections have no `unpublished`). **RLS:** `published`→public, `draft`→org (§RLS). **Prisma [§2.5]:** `ProfileSection`, enum `PublishState`.

### §3.4.3 `marketplace.branding_assets` · §3.4.4 `marketplace.seo_settings` · §3.4.5 `marketplace.custom_domains`
Realizes Doc-2 §10.3. All FK → `vendor_profiles`. Branding/SEO follow the microsite/profile publish posture ("as above"); custom_domains is **entitlement-gated** (DD-5).

```sql
CREATE TABLE marketplace.branding_assets (
  id                uuid NOT NULL,
  vendor_profile_id uuid NOT NULL,                                -- [Doc-6A §5.2] intra-schema FK
  logo_ref          text, banner_ref text, video_ref text, brochure_ref text, gallery_jsonb jsonb,  -- [Doc-2 §10.3] refs
  colors_jsonb      jsonb,                                        -- [Doc-2 §10.3] color palette
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT branding_assets_pkey PRIMARY KEY (id),
  CONSTRAINT branding_assets_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id)
);

CREATE TABLE marketplace.seo_settings (
  id                uuid NOT NULL,
  vendor_profile_id uuid NOT NULL,                                -- [Doc-6A §5.2] intra-schema FK + UNIQUE
  title             text, meta_description text, keywords text, og_image_ref text, canonical_url text,  -- [Doc-2 §10.3]
  schema_jsonb      jsonb,                                        -- [Doc-2 §10.3] JSON-LD
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT seo_settings_pkey PRIMARY KEY (id),
  CONSTRAINT seo_settings_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id),
  CONSTRAINT seo_settings_profile_uq UNIQUE (vendor_profile_id)   -- [Doc-2 §10.3] 1:1
);

CREATE TYPE marketplace.custom_domain_status AS ENUM ('pending', 'verified', 'active', 'released');  -- [Doc-2 §10.3 binding]

CREATE TABLE marketplace.custom_domains (
  id                uuid NOT NULL,
  vendor_profile_id uuid NOT NULL,                                -- [Doc-6A §5.2] intra-schema FK
  domain            text NOT NULL,                                -- [Doc-2 §10.3]
  status            marketplace.custom_domain_status NOT NULL DEFAULT 'pending',  -- [Doc-2 §10.3]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT custom_domains_pkey PRIMARY KEY (id),
  CONSTRAINT custom_domains_profile_fk FOREIGN KEY (vendor_profile_id) REFERENCES marketplace.vendor_profiles(id)
);
CREATE UNIQUE INDEX custom_domains_domain_live_uq ON marketplace.custom_domains (domain) WHERE deleted_at IS NULL;  -- [Doc-2 §10.3] domain UNIQUE(partial)
```
- **Entitlement-gate (DD-5, custom_domains):** the right to **register** a custom domain is an **M7 entitlement** check — **app-layer** (Doc-4D / Doc-6A §12 boundary); the DB stores the domain + status only. M2 reads the entitlement via service, never a `billing` table.
- **SEO 1:1; branding 1:N** (a vendor has one SEO row, many branding assets — per Doc-2 §10.3 cardinality cues). **RLS:** all three follow the parent publish posture (§RLS). **Prisma [§2.5]:** `BrandingAsset`, `SeoSetting`, `CustomDomain` (enum `CustomDomainStatus`).

## §3.x — Consolidated RLS DDL (Pass-2 tables)
Postures: **categories** = public-read + admin-write (DD-4); **products / microsites** = published-public + org draft + admin; **spec_library_entries** = public-read + org/admin write; **spec_documents** = public(library) / owner-org(uploads) / admin; **product_spec_links / profile_sections / branding_assets / seo_settings / custom_domains** = parent-anchored org-write, public per publish-state. Permissive OR'd; read/write split (Doc-6A §4.6); children anchor on parent via intra-schema `EXISTS` (§2.2).

```sql
-- ===== categories: public read (non-retired) + admin write (DD-4) =====
ALTER TABLE marketplace.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_public_read ON marketplace.categories FOR SELECT
  USING (deleted_at IS NULL);
CREATE POLICY categories_staff_manage ON marketplace.categories FOR ALL          -- staff_can_manage_categories
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- ===== products: published→public | org draft+write | admin =====
ALTER TABLE marketplace.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_public_read ON marketplace.products FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL
         AND EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                      WHERE p.id = products.vendor_profile_id AND p.visibility = 'public' AND p.deleted_at IS NULL));
CREATE POLICY products_org_read ON marketplace.products FOR SELECT
  USING (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                  WHERE p.id = products.vendor_profile_id
                    AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY products_admin ON marketplace.products FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY products_org_write ON marketplace.products FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                       WHERE p.id = products.vendor_profile_id
                         AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY products_org_modify ON marketplace.products FOR UPDATE
  USING (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                  WHERE p.id = products.vendor_profile_id
                    AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY products_org_delete ON marketplace.products FOR DELETE
  USING (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                  WHERE p.id = products.vendor_profile_id
                    AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
-- microsites: identical to products, s/products/microsites/, public predicate = status='published' AND deleted_at IS NULL AND parent public.

-- ===== profile_sections / branding_assets / seo_settings: publish-state public + org write =====
ALTER TABLE marketplace.profile_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY profile_sections_public_read ON marketplace.profile_sections FOR SELECT
  USING (publish_state = 'published' AND is_visible AND deleted_at IS NULL
         AND EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                      WHERE p.id = profile_sections.vendor_profile_id AND p.visibility = 'public' AND p.deleted_at IS NULL));
CREATE POLICY profile_sections_org_read ON marketplace.profile_sections FOR SELECT
  USING (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                  WHERE p.id = profile_sections.vendor_profile_id
                    AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY profile_sections_admin ON marketplace.profile_sections FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY profile_sections_org_write ON marketplace.profile_sections FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                       WHERE p.id = profile_sections.vendor_profile_id
                         AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY profile_sections_org_modify ON marketplace.profile_sections FOR UPDATE
  USING (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                  WHERE p.id = profile_sections.vendor_profile_id
                    AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY profile_sections_org_delete ON marketplace.profile_sections FOR DELETE
  USING (EXISTS (SELECT 1 FROM marketplace.vendor_profiles p
                  WHERE p.id = profile_sections.vendor_profile_id
                    AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
-- branding_assets + seo_settings + custom_domains: same six policies (s/profile_sections/<table>/); branding/seo public-read gated on the
--   PARENT being public (no own publish_state column) — USING (deleted_at IS NULL AND EXISTS parent public); custom_domains public-read = status IN ('verified','active').

-- ===== spec_library_entries: public read; org/admin write =====
ALTER TABLE marketplace.spec_library_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY spec_library_entries_public_read ON marketplace.spec_library_entries FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY spec_library_entries_admin ON marketplace.spec_library_entries FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (vendor authoring of library entries per Doc-4D — org-write policy added with the owning-actor column when Doc-4D pins it; staff-write covers platform seed.)

-- ===== spec_documents: public(library) | owner-org(uploads) | admin =====
ALTER TABLE marketplace.spec_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY spec_documents_public_read ON marketplace.spec_documents FOR SELECT
  USING (owner_organization_id IS NULL);                          -- library docs are public; buyer uploads are NOT (cross-RFQ disclosure = rfq_document_grants, M3)
CREATE POLICY spec_documents_owner_read ON marketplace.spec_documents FOR SELECT
  USING (owner_organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY spec_documents_admin ON marketplace.spec_documents FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY spec_documents_owner_write ON marketplace.spec_documents FOR INSERT
  WITH CHECK (owner_organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (UPDATE limited to is_active_revision by the column-scoped trigger; DELETE blocked — no UPDATE/DELETE-all policy granted to org.)

-- ===== product_spec_links: read follows product; write = product's controlling org =====
ALTER TABLE marketplace.product_spec_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_spec_links_read ON marketplace.product_spec_links FOR SELECT
  USING (EXISTS (SELECT 1 FROM marketplace.products pr JOIN marketplace.vendor_profiles p ON p.id = pr.vendor_profile_id
                  WHERE pr.id = product_spec_links.product_id
                    AND ((pr.status = 'published' AND p.visibility = 'public' AND p.deleted_at IS NULL)
                         OR p.controlling_organization_id = current_setting('app.active_org', true)::uuid)));
CREATE POLICY product_spec_links_admin ON marketplace.product_spec_links FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY product_spec_links_org_write ON marketplace.product_spec_links FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM marketplace.products pr JOIN marketplace.vendor_profiles p ON p.id = pr.vendor_profile_id
                       WHERE pr.id = product_spec_links.product_id
                         AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY product_spec_links_org_delete ON marketplace.product_spec_links FOR DELETE
  USING (EXISTS (SELECT 1 FROM marketplace.products pr JOIN marketplace.vendor_profiles p ON p.id = pr.vendor_profile_id
                  WHERE pr.id = product_spec_links.product_id
                    AND p.controlling_organization_id = current_setting('app.active_org', true)::uuid));
```

---

## Review Disposition (Independent Hard Review — Pass-2)

Reviewer: independent (Architecture Board / DDD / Security / DBA). Verified CORRECT: the 10-table set + columns (Doc-2 §10.3), state sets verbatim (`product_status`, `microsite_status/layout`, `custom_domain_status`, `spec_doc_type`), composite PK on `product_spec_links`, versioned-immutable `spec_documents`, Content≠Presentation (#9), DD-4 (categories admin-write) / DD-5 (custom_domains entitlement app-layer), the closed Pass-1 deferred FK, coin-nothing, §2.5 attribution.

| Finding | Sev | Disposition |
|---|---|---|
| **CAT-STATUS** structure shorthand "draft→active→retired" implied a `status` enum on `categories` — Doc-2 §10.3 lists none | BLOCKER (anti-coining) | **FIXED** — **no status enum** realized; "retired" = soft-delete; a `categories.status` would **coin**. §3.2 documents the mapping. |
| **SPEC-IMM** `spec_documents` "never overwritten" but `is_active_revision` must toggle — full-row immutability would break supersession | MAJOR | **FIXED** — **column-scoped**: `core.raise_immutable_violation` attached directly with the protected columns as `TG_ARGV` (is_active_revision omitted = mutable). Pattern = Doc-6B CR4′. *(Cross-pass HR-2 later corrected the attachment from a PERFORM-wrapper to a direct trigger — a trigger function is not PERFORM-callable.)* |
| **SPEC-LEAK** buyer-uploaded `spec_documents` could leak to public if RLS keyed only on library membership | MAJOR | **FIXED** — public-read only `WHERE owner_organization_id IS NULL` (library); buyer uploads = owner-org only; cross-RFQ disclosure = `rfq.rfq_document_grants` (M3), **not** realized here. |
| **PUB-1** `profile_sections.publish_state` values undefined in Doc-2 | MAJOR | **RESOLVED (attributed)** — enum = the two states Doc-2 names in the §10.3 tenancy cell ("draft: … / published: …"); no third value (sections have no `unpublished`). Surfaced, not coined. |
| **CAT-TREE** `level BETWEEN 1 AND 4` CHECK present, but parent-level consistency (`child=parent+1`) is cross-row | MINOR | **CONFIRMED service** — §3.2: column CHECK bounds the range; the tree-depth invariant + `path` maintenance are service (DR-6-STATE-class), per Doc-2 "CHECK + service". |
| **DOM-GATE** custom_domains entitlement enforcement location | MINOR | **CONFIRMED app-layer** — §3.4.5: M7 entitlement via service (DD-5); DB stores domain+status; no `billing` table read. |
| **PATH-EXT** `path` as `ltree` would add an extension dependency | NIT | **FIXED** — `path text` materialized path (no extension; DDL-2 lesson from Doc-6C). |

**Net:** 1 BLOCKER (categories anti-coining) + 3 MAJOR (spec immutability scope, buyer-upload leak, publish_state attribution) fixed/resolved; 2 MINOR confirmed-service/app-layer; 1 NIT applied. DDL valid + executable; spec versioning immutable-yet-supersedable; presentation publish-state RLS non-leaking; categories admin-governed; coins nothing. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6D Content Pass-2 (§3.2 Category · §3.3 Product + Spec Library · §3.4 Presentation) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the 4-level self-FK category tree (admin-governed, no coined status), the product catalog + M:N spec links, the versioned-never-overwritten spec library (column-scoped immutability via core's raiser), and the Content≠Presentation microsite/sections/branding/SEO/custom-domain surface (publish-state RLS; entitlement-gated domains app-layer). Closes Pass-1's deferred category FK. Columns verbatim Doc-2 §10.3; state sets verbatim; coins nothing. Next: Pass-3 (Advertisement §5.8 · Showcase · Catalog Favorites + §4 state · §5 firewalls · §6 FTS/indexing · §7 POLICY/migration · §8 + Appendix A).*

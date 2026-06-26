# Doc-6D — M2 Marketplace & Discovery (`marketplace`) Schema Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-6D Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | **M2 — Marketplace & Discovery** (`marketplace` schema) — the **first public/anonymous tri-actor surface** + the capability-matrix + visibility-scope + first-real-FTS module |
| Realizes | **Doc-2 §10.3** — **21 tables / 8 aggregates** as PostgreSQL DDL + Prisma + RLS + FTS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A 37/37); **Doc-2 v1.0.3 = binding *what*-authority**; consistent-with the frozen Doc-5D surface; consumes Doc-6B (`core`) + Doc-6C (`identity`, by UUID) |
| Freeze evidence | `Doc-6D_Content_Freeze_Audit_v1.0.md` — PASS; 0 open BLOCKER/MAJOR/MINOR; 7 audit phases PASS. Cross-pass `Doc-6D_Content_Hard_Review_v1.0.md` — 2 BLOCKER found + FIXED |

---

## Effective set (the authoritative Doc-6D)

| Artifact | Role |
|---|---|
| `Doc-6D_Structure_v1.0_FROZEN.md` | Frozen structure — MK-CR1–CR12, 21-table partition, tri-actor RLS + visibility model, 2 state machines, FTS plan, Appendix-A map |
| `Doc-6D_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-6D_Content_v1.0_Pass1.md` | §0–§2 tri-actor RLS model · Vendor Profile AR + 7 children (capability matrix · §5.3 two-dimension state · score firewall · exclusive-writer history · derived matching read-model · `[DD-7]`) |
| `Doc-6D_Content_v1.0_Pass2.md` | Category (4-level self-FK tree) · Product + Spec Library (versioned `spec_documents`) · Presentation (microsites/sections/branding/SEO/custom-domains) |
| `Doc-6D_Content_v1.0_Pass3.md` | Advertisement (§5.8) · Showcase · Catalog Favorites · §4 state · §5 firewalls · §6 first-real-FTS · §7 migration · §8 + Appendix A (37/37, 0 FAIL) |
| `Doc-6D_Content_Hard_Review_v1.0.md` | Cross-pass review — **2 BLOCKER** (history UPDATE-open; spec PERFORM-of-trigger-fn) found + FIXED against the realized Doc-6B §4 contract |
| `Doc-6D_Content_Freeze_Audit_v1.0.md` | Content freeze certification (PASS) |

---

## What Doc-6D realizes (the `marketplace` schema)

- **21 tables / 8 aggregates** (Doc-2 §10.3), columns verbatim: Vendor Profile (AR) + 7 children, Category, Product (+spec links), Spec Library (+versioned docs), Microsite (+4 presentation children), Advertisement, Showcase, Catalog Favorite.
- **First public/anonymous tri-actor RLS** (Doc-2 §6) — three actor classes against server-set GUCs (fail-closed): **Public** (anon published read), **User** (controlling-org write, anchored on `controlling_organization_id` = `app.active_org` — intra-schema, never a §6-forbidden traversal), **Admin** (all states). Children anchor on the parent via intra-schema `EXISTS`. Explicit `CREATE POLICY` DDL for all 21 tables; RLS = backstop (Doc-6A §4.5).
- **Visibility-scope (Invariant #3) = publish-state RLS; no `buyer_private` column coined** — `visibility('public')` enum only; ban reflected as a **public banner** (readable), routing/search exclusion in the matching read-model + FTS, not base RLS.
- **Capability matrix (Invariant #1)** — `can_supply`/`can_service`/`can_fabricate`/`can_consult` four booleans, not a label.
- **§5.3 two orthogonal dimensions** — `claim_state` (seeded→invited→claimed→verified) + `status` (active⇄suspended/banned) as separate enums; `claimed→verified` + ban = **idempotent consumer effects** of Trust/Admin events (DD-1/DD-3, **reflect-never-decide**); ownership transfer → Trust Protection Workflow.
- **Score firewall (Invariant #6)** — no trust/performance score column on any of the 21 tables; bands **reflected** into `vendor_matching_attributes` from M5 events, never calculated. **`financial_tier_history` exclusive-writer-as-consumer** — M2 writes declared directly + verified as idempotent consumer of `VendorTierChanged`; **Trust never writes it**; append-only (immutable, DELETE-blocked, interval-closable).
- **`vendor_matching_attributes`** — derived read-model (UPSERT-rebuilt, no SD); the **only** RFQ matching surface, via service (DD-2); **admin-only RLS** (not a tenant read).
- **Versioned `spec_documents`** — never overwritten; **column-scoped immutability** via `core.raise_immutable_violation` attached directly with protected columns as `TG_ARGV` (only `is_active_revision` mutable). Categories = 4-level self-FK tree, admin-governed (DD-4), **no status enum coined**. Presentation = Content≠Presentation (Invariant #9); custom-domains entitlement-gated app-layer (DD-5).
- **First real FTS** (Doc-6A §10.4) — generated `tsvector` (`'simple'`, deterministic) + GIN; directory ranking via reflected bands; cursor indexes; page-size/idempotency from `marketplace.*` POLICY (Doc-3 v1.2), never literals.
- **Advertisement** — §5.8 machine; ad money = `billing.platform_invoice` (M7) by bare-UUID reference; **platform never handles buyer↔vendor money**. **Catalog Favorite** — polymorphic `target_id`, **no FK** (the binding), tenant-owned `organization_id`; CRM vendor-favorites stay M4's.
- **Cross-module = bare UUID, no cross-schema FK** (`controlling_/purchaser_/owner_/claimed_by_organization_id`, `platform_invoice_id`, `target_id`); intra-schema FKs only; coins nothing.

## Carried items

`DR-6-CORE` (consumed) · `DR-6-STATE` (2 machines) · `DR-6-API` (Doc-5D Band H + FTS) · **`[ESC-6-DD7]`** (vendor_claim_records tenancy — Doc-2 §6 vs §3.3; interim per Doc-4D §D2; additive Doc-2 reconciliation, human-approved; never local) · **`[ESC-MKT-AUDIT]`** (ad/product audit actions absent Doc-2 §9 — bind nearest by pointer; CHK-6-043 PASS-with-carry) · **`[ESC-6-SCHEMA-SHOWCASE]`** (showcase columns underspecified — interim `content_jsonb`; bind via Doc-4D/Doc-5D DTO or additive Doc-2) · **`'VENDOR'` `human_ref` prefix** (§2.5 — confirm; 1 call site) · **ADV-PURCH** (structure annotated `purchaser_organization_id` as M4; organizations are M1 — annotation erratum, additive structure fix; no schema impact) · `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.2). Carry-forward to **Doc-8**: RLS positive/negative/cross-tenant + **public byte-equivalence** + migration tests (Doc-6A §11.5) — schema satisfiable.

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (**0 findings** — field-traced to Doc-2 §10.3) → v0.2 → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1/2/3 each per-pass-reviewed (ban-banner read, FK-ordering, consumer idempotency, currency pairing, matching-attrs leak, spec immutability scope, buyer-upload leak, publish_state attribution, anti-coining of `categories`/`showcase` status, polymorphic-no-FK) · **cross-pass Content Hard Review** (**HR-1** history triggers blocked DELETE-only-not-UPDATE + **HR-2** spec wrapper PERFORM-ed a trigger function — both caught against the *realized* Doc-6B §4 body, invisible to per-pass) · Content Freeze Audit (PASS).

---

*Doc-6D (M2 `marketplace` schema) is FROZEN. Realizes Doc-2 §10.3's 21 tables on PostgreSQL/Supabase + Prisma `multiSchema` against frozen Doc-6A; first public/anonymous tri-actor RLS + capability matrix + visibility-scope (no `buyer_private`) + first-real-FTS; reads Trust scores never calculates; reflects ban/verification never decides; exclusive-writer-as-consumer financial-tier history; coins nothing. Carried: `[ESC-6-DD7]` · `[ESC-MKT-AUDIT]` · `[ESC-6-SCHEMA-SHOWCASE]`. On any conflict with Doc-2/Doc-6A or the frozen corpus, the frozen corpus wins; flag-and-halt. Next: Doc-6E (M3 `rfq`) — the matching/quotation engine.*

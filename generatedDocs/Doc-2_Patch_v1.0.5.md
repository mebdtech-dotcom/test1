# Doc-2_Patch_v1.0.5_VendorSubdomainSlug.md

> **✅ STATUS: APPROVED (human — owner/Board ruling 2026-07-03; artifact text gate-confirmed same day) + FOLDED into the corpus.**
> This is the corpus copy `generatedDocs/Doc-2_Patch_v1.0.5.md` (producing **Doc-2
> v1.0.5**), registered in `00_AUTHORITY_MAP.md`, carried **alongside** the unedited frozen `Doc-2_…_v1.0.2`
> (+ v1.0.3 + v1.0.4) — **no frozen file edited in place.**
> Origin/provenance: `governanceReviews/Doc-2_VendorSubdomainSlug_Additive_Patch_PROPOSAL.md`. **Linked set** with the Doc-4D realization patch
> (`Doc-4D_CanonicalHost_Patch_v1.0.2`), the Doc-6D DDL patch (`Doc-6D_VendorSlugSubdomain_Patch_v1.0.1`),
> and the Doc-3 POLICY-key registration (`Doc-3_Policy_Key_Registration_Patch_v1.10_VendorSubdomain`) —
> folded together. Decision record: `governanceReviews/BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md`;
> decision: **ADR-024**.

## Status

Approved Patch — FOLDED 2026-07-03 (human-approved: owner/Board ruling + same-day gate confirmation)

| Field | Value |
|---|---|
| Applies to | `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` (+ `Doc-2_Patch_v1.0.3` + `Doc-2_Patch_v1.0.4`) |
| Produces | Doc-2 **v1.0.5** (v1.0.4 + this patch) |
| Scope | **The Vendor Slug law + Canonical Host Resolution (business semantics)**: (a) §3.2/§10.3 one additive Vendor-Profile child entity `vendor_slug_history`; (b) §10.3 additive Vendor Slug semantics (Platform-issued Vendor Subdomain, format law, immutability, never-reuse, migration); (c) the normative **Canonical Host Resolution (CHR) algorithm**; (d) §9 Audit Mapping one additive Vendor-profile business action — **nothing else.** No ownership change, no event-catalog change, no state-machine change, no permission-slug change, no entitlement change, **and no wire-level contract/serialization** (that is the Doc-4D realization patch's remit, per the PATCH-D2-03 layer-boundary precedent). |
| Purpose | Ratify the **Canonical Vendor Subdomain URL** platform rule (ADR-024) at the domain-model layer: every APPROVED vendor receives one permanent **Platform-issued Vendor Subdomain** `https://{vendor-slug}.ivendorz.com/`. The frozen corpus already holds the slug (`slug UNIQUE(partial)`, §10.3) but is **silent** on format, immutability, reserved labels, canonical-host rules (CHR), and slug migration — this patch pins those semantics. Resolves `[ESC-MKT-CANONICAL-URL]`. |
| Raised by | Owner directive (2026-07-03, chat = the human-Board channel per the ESC-7G-SCORE-DISPLAY precedent); CTO-review findings adjudicated across 4 rounds and folded; **Final Architecture Board Resolution 2026-07-03: APPROVED**. |
| Authority | CLAUDE.md §7 (authority order; Doc-2 = rank 0), §8 (architecture-affecting → **human approval**), §11 (additive only; never edit a frozen doc in place), §13; Master §8.4 items 6–7 (SEO / Custom Domain Support — interpreted by ADR-024, not patched); Master §4 Invariants 8, 9, 11 (conformed to, unchanged). |

All frozen architecture decisions, aggregate boundaries, ownership rules, tenancy rules, the §9 field set, the
claim/status state machines (§5.3), and the `custom_domains` lifecycle (`pending → verified → active →
released`) are **preserved**. The freeze on Doc-2 remains in force; this patch is the minimal additive
exception, routed through change management (human approval), mirroring the PATCH-D2-03 lifecycle.

---

# PATCH-D2-04 — Vendor Slug Law · Platform-issued Vendor Subdomain · Canonical Host Resolution (resolves `[ESC-MKT-CANONICAL-URL]`, business layer)

**Terminology (used here and in every referencing artifact):** **Vendor Slug** = the
`marketplace.vendor_profiles.slug` field. **Platform-issued Vendor Subdomain** = the host
`{vendor-slug}.ivendorz.com` derived from it. **Canonical Host Resolution (CHR)** = the normative algorithm
in D2-04.3. **URL identity ≠ Vendor identity**: vendor identity = `id` (UUIDv7) + `human_ref` (permanent,
never reused — Invariant 8); URL identity = derived from the Vendor Slug, migratable under D2-04.4.

## D2-04.1 — The Platform-issued Vendor Subdomain (additive §10.3 semantics)

The Vendor Slug is the vendor's **permanent platform subdomain label**. Every **APPROVED** vendor is issued
one permanent Platform-issued Vendor Subdomain `https://{vendor-slug}.ivendorz.com/` — **universal and
free, never entitlement-gated.** This is **distinct from** the entitled custom-domain feature: the
platform-issued subdomain is **not** a "custom domain"; `marketplace.custom_domains` (§10.3, DD-5
entitlement-gated, lifecycle `pending → verified → active → released`) remains the machinery for
**external** domains only, unchanged. (Interpretation of Master §8.4 item 7 recorded in ADR-024 — the
frozen example list is not an entitlement-exclusivity clause; no Master patch required.)

## D2-04.2 — Vendor Slug format law (FIXED — defined once here; referenced, never restated)

- **Grammar:** `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$` — lowercase `a-z 0-9 -`, no leading/trailing hyphen
  (DNS-label-safe).
- **Length:** 3–40 characters.
- **ASCII-only:** IDN, Unicode, and emoji labels are rejected; labels beginning **`xn--`** (punycode) are
  rejected explicitly (a bare-regex check alone would admit them). No Bengali-script (or any non-ASCII)
  subdomains — DNS labels are ASCII; localized *display* is a presentation concern, never a slug concern.
- **Reserved labels:** blocked **at issuance/migration time** per POLICY key
  `marketplace.reserved_subdomain_labels` (registered by the linked Doc-3 v1.10 patch). Reserved labels are
  **platform-owned namespaces, never issuable to vendors**. The list is POLICY-tunable; changes apply at
  issuance/migration only and are **never retroactive** — an active Vendor Slug is never stripped by a list
  change (Invariant 8 grandfathering).
- This format law is **FIXED** (not tunable); only the reserved-label *list* is POLICY.

Uniqueness is already frozen (`slug UNIQUE(partial)`, §10.3; live-unique realization Doc-6D) — unchanged.

## D2-04.3 — Canonical Host Resolution (CHR) — normative algorithm

Defined **once, here**; every subsystem references it. **No subsystem may independently determine canonical
URLs.**

```
CanonicalHost(vendor):
  IF vendor is NOT publicly routable
     → no canonical host exists (∅)          -- no canonical URL is generated for
                                             -- unpublished/suspended/soft-deleted/unclaimed vendors
  ELSE IF vendor has a bound custom domain with status = active
     → return that custom domain's hostname  -- entitled custom domain is canonical while active
  ELSE
     → return {vendor-slug}.ivendorz.com     -- the permanent default
```

- **"Publicly routable"** binds the **existing** frozen states — it is the §10.3/§5.3 published/public
  posture already governing public reads (claim/status/visibility + publish state + soft-delete exclusion);
  this patch coins **no** new lifecycle state.
- **Default:** the Platform-issued Vendor Subdomain is the permanent default canonical host. While a bound
  custom domain is `active` it is canonical and the subdomain redirects (301) to it; on `released`, the
  canonical host reverts to the subdomain. (Wire/redirect realization: Doc-4D v1.0.2 + Doc-7D §11.)
- **Fail-closed:** if `CanonicalHost` cannot be computed because required data is unavailable, the request
  MUST fail closed (404 or configuration error) — a hostname is **never synthesized** during partial
  failures.
- **Presentation-layer only (Invariant 9):** CHR output is presentation/identity routing. It is **never** a
  matching, routing-fairness, eligibility, trust, or scoring input, and no governance signal reads or writes
  it (Invariant 6 untouched).
- **Non-disclosure (Invariant 11):** a host for an unknown, reserved, or non-routable Vendor Slug renders
  **byte-identical 404** to genuine absence (CHK-7-040 extended to hosts — realization Doc-7D §11).

## D2-04.4 — Immutability · admin-mediated migration · never-reuse

- The Vendor Slug is **vendor-immutable after activation** (once the profile is publicly routable). No
  vendor-facing write may change it.
- Only an **M8 admin-mediated slug migration** may change a Vendor Slug — with an automatic **permanent
  301** from the prior Platform-issued Vendor Subdomain to the current canonical host, forever.
- **Never-reuse (Invariant 8):** a migrated-away slug is permanently reserved and never issuable to any
  other vendor ("human-friendly references are never reused").
- **Migration changes URL identity only.** Analytics, bookmarks, backlinks, and search rankings MAY change;
  **Vendor identity (`id`/`human_ref`) NEVER changes.** Analytics/attribution key to vendor identity, never
  to host.
- The **wire contract** for slug migration is **NOT coined here or in the linked Doc-4D patch** — recorded
  as `[ESC-MKT-SUBDOMAIN-MIGRATE]` (open; additive Doc-4D/Doc-5D patch when scheduled).

## D2-04.5 — New child entity: `marketplace.vendor_slug_history` (additive)

**§3.2 (Module 2 aggregate map) — Vendor Profile child-entity list, exact additive change** (insert after
`vendor_ownership_history`, whose permanence posture it mirrors):

Before:

```
`vendor_capacity_profiles`, `declared_financial_tiers`, `financial_tier_history`, `category_assignments`, `vendor_matching_attributes`, `vendor_ownership_history`, `vendor_claim_records`, `profile_sections`, `branding_assets`, `seo_settings`, `custom_domains`
```

After:

```
`vendor_capacity_profiles`, `declared_financial_tiers`, `financial_tier_history`, `category_assignments`, `vendor_matching_attributes`, `vendor_ownership_history`, `vendor_slug_history`, `vendor_claim_records`, `profile_sections`, `branding_assets`, `seo_settings`, `custom_domains`
```

**§10.3 — one additive table row** (style-matched to the `vendor_ownership_history` row):

```
| marketplace.vendor_slug_history | → vendor_profiles | approved_by | — | NO (permanent) | `old_slug UNIQUE (global, never reused — Invariant 8), new_slug, reason, approved_by, migrated_at`; append-only; written exclusively by the M8-mediated slug migration; old slugs serve permanent 301 resolution (public fact) |
```

Append-only, permanent, **no soft-delete** (mirrors `vendor_ownership_history` — "NO (permanent)"). DDL
realization: the linked Doc-6D v1.0.1 patch.

## D2-04.6 — §9 Audit Mapping: one additive business action

**Location:** §9 — the **Vendor profile** domain row of the "Actions that MUST create audit records" table.

Before:

```
| Vendor profile | create, seed, claim, verify, suspend, ban/lift, tier change (declared + verified), category change, capability/override change, ownership transfer (full workflow), delegation grant issue/suspend/revoke |
```

After:

```
| Vendor profile | create, seed, claim, verify, suspend, ban/lift, tier change (declared + verified), category change, capability/override change, ownership transfer (full workflow), slug migration (admin-mediated), delegation grant issue/suspend/revoke |
```

(Every other §9 domain row is unchanged. The §9 preamble, field set, and redaction rule are unchanged.)

**Layer boundary (PATCH-D2-03 precedent):** Doc-2 enumerates only the **business action** ("slug migration
(admin-mediated)"). The wire-level serialization (`action` token, `entity_type`, `old_value`/`new_value`
mapping) is **NOT** specified here — it lands with the future migration-contract realization patch
(`[ESC-MKT-SUBDOMAIN-MIGRATE]`), so serialization changes never reopen rank-0 Doc-2.

## D2-04.7 — Distinguishing note: untouched identifier spaces

`identity.organizations.slug` — including its §5.1 restore-conflict rule ("restore: regenerate reused
slugs") — is a **different identifier space** and is **untouched** by this patch. Likewise
`marketplace.categories.slug` and permission slugs (Doc-2 §7). This patch binds the **Vendor Slug** only.

---

# Downstream resolution (recorded, not edited here)

- **Doc-4D realization patch (linked):** `Doc-4D_CanonicalHost_Patch_v1.0.2` pins the wire-side semantics —
  `create_custom_domain` rejects `*.ivendorz.com`; `seo.canonical` advisory; domain bind/release switches
  the CHR output; coins no new field/contract/projection.
- **Doc-6D DDL patch (linked):** `Doc-6D_VendorSlugSubdomain_Patch_v1.0.1` realizes the format CHECK and the
  `vendor_slug_history` table.
- **Doc-3 POLICY registration (linked):** `Doc-3_Policy_Key_Registration_Patch_v1.10_VendorSubdomain`
  registers `marketplace.reserved_subdomain_labels` (§12.2).
- **Doc-7D §11 (FE realization):** `Doc-7D_HostCanonicalization_Additive_Patch_PROPOSAL` — host≡path
  equivalence over the ADR-022 seven-route IA, Host Resolution Matrix, discovery files, cookie posture.
- **ADR-024:** the decision record; interprets Master §8.4 item 7 (no Master patch).
- **FE-PUB-10:** presentation-side realization milestone (URL builder, host routing, canonical metadata,
  301s) — registered, kickoff-gated.

---

*End of Doc-2_Patch_v1.0.5 — minimal additive Vendor Slug law + CHR algorithm + one child entity + one §9
business action; resolves `[ESC-MKT-CANONICAL-URL]` at the business-semantic layer. Coins no wire token,
no event, no permission slug, no entitlement, no state machine. Wire realization = Doc-4D v1.0.2; DDL =
Doc-6D v1.0.1; reserved list = Doc-3 v1.10; decision = ADR-024. **APPROVED & FOLDED into the corpus
(human, owner/Board ruling 2026-07-03); linked set folded together.***

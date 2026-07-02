<!--
Doc-type:  Architecture Board Decision Packet (decision-prep + completed decision record; NON-authoritative input to the human Architecture Board).
Subject:   Canonical Vendor Subdomain URLs - universal Platform-issued Vendor Subdomains, the Vendor Slug law, and Canonical Host Resolution (CHR).
Produced:  2026-07-03 (corpus-verified). Raise != Accept: the Board rules; companions and patches are then authored to match.
Note:      AI/skill does not resolve rank-0 interpretation questions (CLAUDE.md 7/8/11). The recommendations below were inputs; the completed Decision record below is the owner's ruling.
-->

# iVendorz — Canonical Vendor Subdomain URLs — Architecture Board Decision Packet

**Decision:** **ADR-024** (`governanceReviews/ADR-024_Canonical_Vendor_Subdomain_URLs_PROPOSAL.md`).
**Packet date:** 2026-07-03 · **Prepared for:** the HUMAN Architecture Board · **Prepared by:** governance
authoring pass (rank ~7–8, non-authoritative).
**Status:** **RULED — owner (human Architecture Board), 2026-07-03, delivered directly in chat.** The rule
was proposed by the owner, refined through a **4-round CTO review** (all findings adjudicated per §13 —
annex below), and closed by the owner's **Final Architecture Board Resolution: APPROVED** (review cycle
CLOSED; further architecture review NOT REQUIRED). Decision record completed below. Per the Board's own
recommendation, the drafted artifact TEXT passes one final owner-confirmation gate before fold.

## Purpose

The owner directed a new non-negotiable platform rule: every approved vendor receives one permanent
canonical subdomain `https://{vendor-slug}.ivendorz.com/`. The frozen corpus holds the Vendor Slug
(live-unique) but is **silent** on slug format, reserved labels, immutability, canonical-host rules,
redirects, and host routing — and its only subdomain mention sits ambiguously under the entitled
Custom Domain Support feature. This packet records the corpus verification, the sub-decisions, the
adjudicated findings, and the completed ruling; the realization is the five-artifact linked patch set +
Doc-7D §11 + FE milestone **FE-PUB-10**.

## How to use this packet (Raise ≠ Accept)

Per CLAUDE.md §13, the reviewer raises; the presiding authority rules. Here the **owner is both the
proposer and the human Architecture Board**: the owner proposed the rule, an adjudication pass raised
verified corrections and sub-decisions (recommendations, not rulings), the owner reviewed across four
rounds, and the owner ruled. Every finding passed the four Validate-Findings questions (Valid? Applicable?
Best for the product? Consistent with the frozen corpus?) before being folded.

## Authority-order primer (§7) — why this is human-gated

The rule has consequences at rank 0 (Doc-2 domain model · Doc-4D contracts · Doc-6D DDL · Doc-3 POLICY
inventory · Doc-7D public surface) and requires an interpretation of Master §8.4 item 7 (rank 0). Ranks 0–1
are immutable to skills/AI; changes ride **human-approved additive patches + version bumps** (§7/§8),
carried alongside — never in-place edits (§11). The owner's chat directive is the established human-Board
ruling channel (ESC-7G-SCORE-DISPLAY precedent, 2026-07-03).

---

## Frozen anchors (re-verified on disk, 2026-07-03)

- `generatedDocs/Master_System_Architecture_v1.0_FINAL.md:574` — §8.4 item 7: "**Custom Domain Support** —
  `vendor.ivendorz.com`, `company.com`, `suppliers.company.com` for entitled subscriptions" — the corpus's
  **only** subdomain mention; an example list under an entitled feature, **not** an entitlement-exclusivity
  clause and **not** a universal-subdomain grant. (`:573` — §8.4 item 6: SEO Management includes a
  "canonical URL" field; `:576` — entitlement slugs incl. `can_use_custom_domain`; frozen event
  `MicrositeDomainChanged`.)
- `Master_System_Architecture_v1.0_FINAL.md:282-284` — **Invariant 8**: "Identifiers never change;
  human-friendly references are never reused." (`:274-276` Invariant 6 — untouched; `:286-288` Invariant 9 —
  presentation never affects matching.)
- `generatedDocs/Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md:731` — `marketplace.vendor_profiles`:
  `slug UNIQUE(partial)`, `claim_state(seeded/invited/claimed/verified)`, `status(active/suspended/banned)`,
  `visibility(public)`. **No format/immutability/reserved-word rule exists.**
- `Doc-2 …:748` — `marketplace.custom_domains`: `domain UNIQUE(partial), status(pending/verified/active/
  released)`; **entitlement-gated**. `:135` — Vendor Profile AR children incl. `vendor_ownership_history`
  (the permanent-history precedent `vendor_slug_history` mirrors) and `custom_domains`. `:473` —
  organization slug restore-conflict rule ("regenerate reused slugs") — a **different identifier space**,
  untouched. `:735` — "profile not routable until a tier is declared" — **"routable" is an existing corpus
  concept** the CHR precondition binds to. `:685` — §9 "Vendor profile" audit row (the row PATCH-D2-04
  extends).
- `generatedDocs/Doc-6D_Content_v1.0_Pass1.md:84` — `vendor_profiles_slug_live_uq` partial unique index
  (live-unique slug realization).
- `generatedDocs/Doc-6D_Content_v1.0_Pass2.md:213-225` — `custom_domains` DDL + enum; `:227` — **DD-5:
  entitlement gate is app-layer; "the DB stores the domain + status only"** (the posture the reserved-label
  app-layer enforcement mirrors); `:291-292` — custom_domains public-read RLS = `status IN
  ('verified','active')`.
- `generatedDocs/Doc-4D_Content_v1.0_PassB_ProfileExperience.md:36-45` — `set_microsite_domain.v1` (DD-5;
  binds an `active` domain; emits frozen `MicrositeDomainChanged`); `:50` — SEO object `{title, meta,
  keywords, og_image, canonical, schema_jsonb}`; `:56` — SEO change has **no §8 event** (do not coin one);
  `:68-78` — custom-domain lifecycle (create validates SYNTAX "domain format"; DNS verification = infra;
  entitlement = Billing); `:89-94` — profile-experience public reads (published only).
- `generatedDocs/Doc-7A_Content_v1.0_Pass3.md:93` — **CHK-7-040**: vendor experience byte-equivalent;
  no exclusion signal in any view/count/notification/error (Invariant #11) — extended to hosts by Doc-7D
  §11.3.
- `governanceReviews/ADR-022_Vendor_Public_Microsite_IA_Revision_PROPOSAL.md` +
  `governanceReviews/Doc-7D_MultiPage_IA_Additive_Patch_PROPOSAL.md` (both APPROVED 2026-07-01; folds
  pending as records actions) — the seven-route `/vendors/[slug]` IA the new host maps onto 1:1.
- Implementation state: `app/(public)/vendors/[slug]/` = the 7 ADR-022 pages + 2 legacy redirect stubs; no
  `middleware.ts`; minimal `next.config.ts`; slugs only in FE seed
  (`app/(public)/_components/discovery/seed.ts`, kebab-case, format-conformant); **~15 files emit
  `/vendors/…` links directly** (the URL-builder consolidation target).

**Corpus verdict:** the rule **EXTENDS** the corpus (silent areas) and **ALIGNS** with what exists (slug
uniqueness, custom-domain machinery, SEO field). **No hard conflict.** One rank-0 interpretation was
required (Master §8.4 item 7 — sub-decision i).

---

## Sub-decisions (raised with recommendations; all RULED with the package, 2026-07-03)

| # | Question | Recommendation | Ruling |
|---|---|---|---|
| (i) | Master §8.4 item 7 lists subdomains under the **entitled** feature — does universal-subdomain need a Master patch? | **No Master patch** — ADR-024 records the interpretation: the Platform-issued Vendor Subdomain is **not** a "custom domain"; the example list asserts no entitlement-exclusivity; `custom_domains` stays external-only and `create_custom_domain` rejects `*.ivendorz.com`. (Trust-Score-ruling precedent: interpret, don't patch, where nothing is contradicted — while the layers with real consequences DO get additive patches.) | **As recommended.** |
| (ii) | The vendor-configurable `seo.canonical` (Doc-4D :50) vs the computed canonical | **Advisory** — CHR output is always authoritative; cross-host values never emitted as the canonical link; no request-shape change. | **As recommended.** |
| (iii) | Where does the reserved-label list live? | **Doc-3 §12.2 POLICY key** (`marketplace.reserved_subdomain_labels`, ops-tunable, grandfathered never-retroactive); the **format law stays FIXED in Doc-2**. | **As recommended.** |
| (iv) | How is never-reuse realized? | New permanent AR child **`vendor_slug_history`** (append-only, no soft-delete, `old_slug` globally unique) mirroring `vendor_ownership_history`'s "NO (permanent)" posture. | **As recommended.** |
| (v) | Version sequencing vs the two pending Doc-2 proposals | See the version-sequencing note below. | **As recommended.** |
| (vi) | CHR-invariant rank: ADR-scoped vs constitutional promotion to **Core Invariant 13** (Invariant 12 is taken — "AI suggests; modules decide"); promotion = additive Master §4 patch + CLAUDE.md v1.0→v1.0.1 | **ADR-scoped now** (ADR-024 Decision 5, SHALL-language); promotion only on explicit owner election at the gate. | **ADR-scoped elected at the gate (owner, 2026-07-03)** — no Master/CLAUDE.md patch; promotion stays available later if load-bearing platform-wide. |

**Version-sequencing note (binding for records):** Doc-2's folded lineage is v1.0.3 (PATCH-D2-01/02) and
v1.0.4 (PATCH-D2-03). The two **pending, unapproved** proposals
(`Doc-2_BuyerTypeClassification_Additive_Patch_PROPOSAL.md` self-forecasting "v1.0.5/PATCH-D2-05" and
`Doc-2_IndustryTaxonomy_Additive_Patch_PROPOSAL.md` self-forecasting "v1.0.6/PATCH-D2-06") are
**forecasts** — Doc-2 version numbers are assigned **at fold**, and this package folds first. This package
takes **v1.0.5 / PATCH-D2-04** (the unclaimed patch ID; no collision). The two pending proposals are NOT
edited now; they renumber at their own fold (a records action then). Only their two stale
`esc_registry.md` citation cells are updated to "next Doc-2 version at fold".

---

## Non-normative CHR example table (readability aid; the algorithm in Doc-2 v1.0.5 D2-04.3 is the law)

| Vendor state | URL behavior |
|---|---|
| Published, no custom domain | `https://abc.ivendorz.com` (200) |
| Published, custom domain `active` | `https://vendor.com` (200); `https://abc.ivendorz.com` → 301 |
| Custom domain `released` | canonical reverts → `https://abc.ivendorz.com` (200) |
| Suspended / unpublished / soft-deleted / pending claim / rejected | 404 (byte-identical to absence) |
| Old migrated slug | 301 (permanent) → current canonical host |
| Unknown slug | 404 (byte-identical to absence) |
| Reserved label (e.g. `www`, `api`) | platform-owned host — never a vendor microsite |

**Precedence note:** whenever this package conflicts with implementation assumptions, **the CHR algorithm
defined in the Doc-2 patch (v1.0.5 D2-04.3) is authoritative.**

---

## Findings Adjudication annex (§13 Validate-Findings gate — 4 rounds, owner-raised, 2026-07-03)

**Round 1 — 4 MAJOR · 8 MINOR · NITs · 1 recommendation:**

| # | Finding | Disposition (Valid/Applicable/Best/Consistent) | Landed in |
|---|---|---|---|
| MAJOR-01 | Canonical algorithm not formally defined | **ACCEPT** (Y/Y/Y/Y) — normative CHR, defined once | Doc-2 v1.0.5 D2-04.3; referenced by Doc-4D/Doc-7D/ADR-024 |
| MAJOR-02 | Lifecycle resolution states incomplete | **ACCEPT with scope guard** (Y/Y/Y/Y-additive) — Host Resolution Matrix over **existing** frozen states only; coins none; "merged vendor" is not a corpus concept (if ever introduced → treated as migration) | Doc-7D §11.3 |
| MAJOR-03 | IDN policy missing | **ACCEPT — load-bearing** (Y/Y/Y/Y): the bare regex would admit punycode (`xn--…`); explicit ASCII-only + `xn--` rejection added | Doc-2 v1.0.5 D2-04.2; Doc-6D CHECK |
| MAJOR-04 | Cross-subdomain cookie/session governance missing | **ACCEPT** (Y/Y/Y/Y) — vendor hosts are anonymous, session-free; auth cookies host-scoped, never `Domain=.ivendorz.com`; authenticated flows → apex. **Security-Architect lane (rank 6) flagged**: implementation review of the cookie posture rides FE-PUB-10's review. | ADR-024 Decision 8; Doc-7D §11.6 |
| MINOR-01 | Reserved-label ownership wording | **ACCEPT** — "platform-owned namespaces; never issuable to vendors" | Doc-3 v1.10; ruling #2 |
| MINOR-02 | DNS independence | **ACCEPT** — governance defines URL identity only; DNS/CDN/provider = implementation | ADR-024 Consequences |
| MINOR-03 | Sitemap ownership | **ACCEPT** — apex sitemap-index → canonical hosts; per-host sitemaps; non-canonical hosts serve none | Doc-7D §11.5 |
| MINOR-04 | robots.txt ownership | **ACCEPT** — platform-generated per host; vendors do not control it | Doc-7D §11.5 |
| MINOR-05 | Cache invalidation on canonical change | **ACCEPT (rule-level)** — CHR transitions invalidate cached derivations; purge mechanics realization-deferred | Doc-4D v1.0.2 4D-CH-01.3; Doc-7D §11.8 |
| MINOR-06 | Search-Console/verification ownership | **ACCEPT (ops-note)** — platform owns `*.ivendorz.com` engine verification; custom-domain verification rides the existing `custom_domains` lifecycle | ADR-024 Consequences |
| MINOR-07 | TLS responsibility | **ACCEPT** — platform-managed for platform hosts; custom-domain certs provisioned on entitlement activation; mechanics out of corpus | ADR-024 Consequences |
| MINOR-08 | Analytics continuity across migration | **ACCEPT** — vendor identity (id/human_ref) continuous; URL identity migratable; analytics key to identity | Doc-2 v1.0.5 D2-04.4 |
| NITs | Terminology discipline | **ACCEPT as drafting conventions** — Platform-issued Vendor Subdomain · Vendor Slug · CHR (replaces "canonical primacy") · regex/CHR defined once · URL identity ≠ Vendor identity | All artifacts |
| REC | "Invariant 12 — Canonical Host Resolution" | **ACCEPT substance / gate the rank** — Invariant 12 is taken ("AI suggests; modules decide"); bound as the ADR-024 CHR Invariant (Decision 5); constitutional promotion = **Invariant 13** (additive Master §4 + CLAUDE.md v1.0.1 patches), gate sub-decision (vi) | ADR-024 Decision 5 |

**Round 2 — 7 refinements, all ACCEPT:** +12 reserved labels (root, system, www2, files, media, img,
images, upload, uploads, search, jobs, careers) → Doc-3 start list · CHR precondition (non-routable → ∅)
formalized in the algorithm · **Vendor URL Builder rule** (builder-only; concatenation prohibited) →
ADR-024 Decision 6 / Doc-7D §11.8 · locale-safety reservation (path segments, never nested subdomains) →
ADR-024 Decision 10 / Doc-7D §11.7 · analytics rule strengthened (analytics/bookmarks/backlinks/rankings
MAY change; Vendor identity NEVER) · cache scope enumerated (canonical-URL, sitemap, metadata, redirect,
URL-builder) · FE-PUB-10 = zero visual UI change.

**Round 3 — 2 MINOR + 4 NITs, all ACCEPT:** +9 future-platform reserved labels (ai, api-docs, developer,
developers, console, gateway, edge, monitor, metrics) · **CHR fail-closed** (unavailable data → 404/config
error; never synthesize a hostname) · terminology never shortened until established · JSON-LD explicitly
under the URL Builder rule · hreflang placed in Discovery Files (locale-reserved) · FE-PUB-10 acceptance
criterion made objective (pixel output of all existing pages identical).

**Round 4 — 2 NITs + Final Resolution:** non-normative CHR example table (above) · explicit precedence
note (above) · **Final Architecture Board Resolution (2026-07-03): APPROVED** — governance package
APPROVED · ADR-024 APPROVED · FE-PUB-10 registration APPROVED · review cycle CLOSED · further architecture
review NOT REQUIRED · recommendation: freeze the package and proceed with the planned owner-confirmation
gate, then the additive patch set and FE-PUB-10 registration.

---

## Decision record (completed)

- **Ruling (owner, human Architecture Board):**
  1. Every APPROVED vendor receives one permanent **Platform-issued Vendor Subdomain**
     `https://{vendor-slug}.ivendorz.com/` — universal, free, **never entitlement-gated**; explicitly
     distinct from the entitled custom-domain feature (Master §8.4 item 7 interpretation — the
     platform-issued subdomain is not a "custom domain"; `marketplace.custom_domains` stays
     external-domain machinery, unchanged; `create_custom_domain` rejects `*.ivendorz.com`).
  2. **Vendor Slug law (FIXED):** globally unique; `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`; 3–40 chars;
     ASCII-only — IDN/Unicode/emoji rejected, `xn--` punycode prefix rejected; reserved labels blocked at
     issuance/migration per POLICY key `marketplace.reserved_subdomain_labels` (platform-owned namespaces,
     never issuable; POLICY-tunable; never retroactive).
  3. **Immutability:** vendor-immutable after activation; only M8 admin-mediated migration, with automatic
     permanent 301 and the old slug never reused (Invariant 8; append-only `vendor_slug_history`).
     Migration changes URL identity only — analytics, bookmarks, backlinks, rankings MAY change; Vendor
     identity (`id`/`human_ref`) NEVER changes. Migration wire contract not coined →
     `[ESC-MKT-SUBDOMAIN-MIGRATE]`.
  4. **Canonical Host Resolution (CHR)** — the normative algorithm (Doc-2 v1.0.5 D2-04.3): non-routable →
     ∅; `active` bound custom domain → canonical (subdomain 301s; reverts on release); else the
     Platform-issued Vendor Subdomain. **Fail-closed**; CHR transitions invalidate every cached derivation
     (canonical-URL, sitemap, metadata, redirect, URL-builder); no stale canonical ever served.
  5. Legacy/alternate URLs — including `/vendors/[slug]/*` — 301 to the CHR output. **Composes with
     ADR-022** (seven-page IA unchanged; host maps 1:1).
  6. `seo.canonical` is **advisory**; emitted canonical link + `og:url` = CHR output.
  7. **Host Resolution Matrix** (existing frozen states only): routable → 200; migrated slug → permanent
     301; unknown/pending/rejected/suspended/soft-deleted/unpublished → **404 byte-identical to absence**
     (Invariant #11/CHK-7-040 extended to hosts); reserved labels never resolve as vendor microsites.
  8. **Sessions & cookies:** vendor hosts are anonymous, session-free; platform auth cookies host-scoped —
     never `Domain=.ivendorz.com`; authenticated flows redirect to the apex.
  9. **Discovery files:** apex sitemap-index → canonical hosts; per-host platform-generated sitemap +
     robots.txt (vendors never control robots); non-canonical hosts serve neither; hreflang placed here
     when locales exist.
  10. **CHR Invariant (SHALL):** every public vendor resource resolves to exactly one canonical host,
      computed only via CHR; no subsystem independently determines canonical URLs. **Vendor URL Builder
      rule:** every emitter (FE, backend, email, notifications, sitemaps, SEO metadata, JSON-LD, API
      projections, future services) obtains vendor URLs only via the canonical URL builder; direct
      concatenation of `{slug}.ivendorz.com` prohibited.
  11. **Locale-safety reservation:** locale URLs = path segments under the canonical host; nested locale
      subdomains prohibited. Reservation only.
  12. **Discipline:** closed milestones NOT reopened (realization = fresh FE-PUB-10, Board-minted);
      wildcard DNS/TLS + cert provisioning + provider choice = deployment constraints outside the corpus;
      org/category/permission slug spaces untouched.
- **Rationale:** (1) The corpus is silent on universal subdomains — the only mention (Master §8.4 item 7)
  is an example under the entitled feature; extending additively closes a real identity/SEO gap (every
  approved vendor gets a permanent branded home under the platform domain) without contradicting any
  frozen clause. (2) The slug already exists live-unique — the rule pins the missing law (format, reserved
  namespaces, immutability, never-reuse) exactly where the corpus left holes. (3) Invariant 8 alignment:
  never-reuse + permanent history mirror the frozen human_ref discipline. (4) Invariant 9/6: the canonical
  host is presentation identity — never a matching/eligibility/signal input; the free universal subdomain
  cannot couple to payment/plan (R7 preserved by construction). (5) The custom-domain entitlement keeps its
  value: an active custom domain **is** canonical (standard SaaS pattern), rather than being neutered by a
  subdomain-always rule. (6) One deterministic algorithm (CHR) + one builder prevents the classic
  divergence between FE, metadata, sitemaps, redirects, and future backend. (7) Minimal-patch layering per
  the PATCH-D2-03/-4C-v1.0.2 precedent: business semantics in Doc-2, wire in Doc-4D, DDL in Doc-6D, POLICY
  in Doc-3, FE realization in Doc-7D §11 — no frozen file edited in place.
- **Decided by / date:** Owner (human Architecture Board) ruling, 2026-07-03, delivered directly in chat;
  CTO-review findings adjudicated and folded the same day across 4 rounds; **Final Architecture Board
  Resolution 2026-07-03: APPROVED — governance package, ADR-024, FE-PUB-10 registration; review cycle
  CLOSED; further architecture review NOT REQUIRED.** Artifact text confirmed at the owner-confirmation
  gate before fold (gate retained per the Board's own recommendation).
- **Resulting additive patches:** the five-artifact linked set — **Doc-2_Patch_v1.0.5** (PATCH-D2-04) ·
  **Doc-4D_CanonicalHost_Patch_v1.0.2** · **Doc-6D_VendorSlugSubdomain_Patch_v1.0.1** ·
  **Doc-3_Policy_Key_Registration_Patch_v1.10_VendorSubdomain** · **Doc-7D §11**
  (`Doc-7D_HostCanonicalization_Additive_Patch_PROPOSAL`, v1.1→v1.2, fold = records action) — plus
  **ADR-024** (individual-ADR corpus copy carried alongside; Compendium-v2 consolidation deferred). **No
  Master patch** (sub-decision i). Constitutional promotion to Core Invariant 13 = gate sub-decision (vi).
- **Companion / registry / PM edits to apply:** `esc_registry.md` (new section: `ESC-MKT-CANONICAL-URL`
  ✅ RESOLVED + `ESC-MKT-SUBDOMAIN-MIGRATE` open; 2 stale Doc-2-version citation cells → "next Doc-2
  version at fold") · `generatedDocs/00_AUTHORITY_MAP.md` (Doc-2 → v1.0.5; Doc-4D/Doc-6D patch notes; new
  Doc-3 v1.10 row; ADR row + ADR-024; Doc-7D row noting §10+§11 approved patches, folds pending) ·
  `vendor_planning_and_design.md` (4 pointer-only edits: S13 external-domains-only note; §4.4 canonical-host
  pointer; §4.6 S13 row note; §12 log line) · PM registration of **FE-PUB-10** (WBS v1.1 additive
  amendment; execution-board queue + agenda line; current-focus pointer; changelog appends; coverage block
  untouched — FE-PUB-10 owns no pages).

---

*Non-authoritative decision packet; the frozen corpus + the folded patches are the authority. Raise ≠
Accept honoured: every finding adjudicated before folding; the owner ruled; the artifacts conform. On any
conflict, the CHR algorithm in the Doc-2 patch is authoritative (precedence note above).*

# MasterArchitecture_Inv1_VendorTypePreset_Amendment_PROPOSAL_v1.1.md

> **STATUS: DRAFT — PROPOSED AMENDMENT; AWAITS HUMAN ARCHITECTURE BOARD APPROVAL.**
> `Master_System_Architecture_v1.0_FINAL.md` is **rank-0 frozen architecture** (`CLAUDE.md §7` —
> immutable to skills, including the Virtual CTO). This proposal contains **two renames of frozen
> table rows**, which are **NOT additive**; per `CLAUDE.md §11` a frozen doc is never reopened by a
> skill decision. This file is a PROPOSAL in `governanceReviews/` and is **NOT** folded by any AI
> action.
>
> **Owner ruling authorizes drafting only. Review findings remain OPEN until verified and folded.**
> (`CLAUDE.md §8` · §13 Raise ≠ Accept.) See §5 — no finding in this document is closed.
>
> **🛑 PARKED — BLOCKED ON INSTRUMENT 1. Board ruling 2026-07-21: structural split APPROVED.**
> The rank-0 amendment mechanism (this document's §7) is **removed from this instrument** and ruled
> separately and first, via
> `governanceReviews/Governance_RankZero_Amendment_Mechanism_v1.0_PROPOSAL.md`. Rationale —
> circularity: the register amendment depends on a valid amendment mechanism, which was being
> invented inside the register amendment. **This document is Instrument 2. It is not reviewable in
> final form and must not be folded until Instrument 1 is approved and folded.**
>
> **The content below is v1.1 as reviewed (Review-A round 2: 🟠 REVISION REQUIRED — 0 BLOCKER /
> 4 MAJOR / 6 MINOR / 1 NIT / 3 OBS). It has NOT been revised against round 2.** Board rulings on
> round-2 findings are recorded in §11 and are **carried, not applied** — per the Board's direction
> that the next reviewable artifact is Instrument 1, not another revision of the register content.
> Review record: `governanceReviews/ReviewA_Record_MasterArchitecture_Inv1_VendorTypePreset_v1.0.md`.
>
> **Supersedes** `Doc-4D_VendorTypePreset_Values_Additive_Patch_PROPOSAL.md` (§6). Resolves the
> **values half only** of `ESC-MKT-VENDORTYPE` (§8).

## Status

| Field | Value |
|---|---|
| Applies to | `Master_System_Architecture_v1.0_FINAL.md` §4 Invariant 1 (L212 sentence + L214–220 table) · `iVendorz_Master_Overview_v1.0.md` §4.2 (L194–197) · `Doc-4D_Content_v1.0_PassB_VendorProfile.md` (L19, L48) · `Doc-4D_Content_v1.0_PassB_Discovery.md` (L20, L27) |
| Produces | Master System Architecture — **label per §7 route**, Board-selected · **Doc-4D v1.0.4** |
| Change class | **AMENDMENT** (2 frozen-row renames) + **RE-KEYING** (slugs minted for all 6 rows, incl. the 3 otherwise-unchanged) + **ADDITIVE** (1 new preset row, enum value set) |
| Scope | Preset **names**, one **new preset row**, **stable slugs**, and the `vendor_type_preset` value set. **No capability-matrix change. No new field. No new contract. No ownership change. No state/event change. No DDL change.** |
| Authority | `CLAUDE.md §7/§8/§11/§13` · Invariant #1 · `Doc-6D_Content_v1.0_Pass1.md:88` MK-CR4 · `Doc-7G_Content_v1.0_Pass1.md:46` |
| Origin | Owner working session 2026-07-21; revised under Board ruling on Review-A MAJ-2/MIN-2 (§9) |

`Master…FINAL.md:222` (overrides) and **`:224`** (the covering rule) are **NOT amended** and remain in
force verbatim. The four capability flags, Invariant #1, aggregate boundaries and module ownership
are **preserved unchanged**.

---

## 1. Problem

`vendor_type_preset` is frozen as a field (`Doc-6D Pass1:70`, `text`), declared `enum : optional` on
the Doc-4D create/update contracts (L19, L48), and exposed as an **allowlisted hard filter** in
`search_catalog` (`Doc-4D …Discovery:20`; `:27` — *"Filters = allowlisted **hard** attributes"*). It
therefore excludes vendors from public discovery results. It **enumerates no values** —
`ESC-MKT-VENDORTYPE`.

| ID | Defect | Severity |
|---|---|---|
| **P-1** | Frozen row 1 is named *"Service Provider / Consultant"* but seeds `can_consult` only, `can_service` at `–`. A maintenance/installation firm selecting the row whose name matches its business is seeded the **opposite** capability. | MAJOR |
| **P-2** | No preset seeds `can_service` alone. Service-led vendors have no correct entry point; per `:224` matching filters on flags, so a mis-seeded vendor is routed the wrong `work_nature`. | MAJOR |
| **P-3** | The table has **no stable identifier** — the display string is the key. Drift is already live: `Master…FINAL.md:217` reads *"MRO / Retail Supplier"*, `iVendorz_Master_Overview_v1.0.md:195` reads *"MRO Supplier"*. | MAJOR |

### 1.1 Governing principle — label/seed correspondence

The single rule this patch enforces, derived from P-1: **a preset's display name must not promise a
capability its seed does not grant.**

This replaces the "under-seeding is the safe failure direction" argument advanced in v1.0, which is
**withdrawn** (Review-A MIN-2, Board-confirmed). That argument was unsupported: `:224` establishes
only that matching filters to vendors whose flags **cover** an RFQ's `work_nature`, and says nothing
about seeding direction. It was also factually wrong — an **under**-seeded vendor is filtered out of
RFQs it never learns existed, so under-seeding is **not** self-correcting either. Neither direction
is detectable by the vendor. Correspondence between name and seed is therefore the only defensible
constraint, and no normative seeding-direction rule is coined here.

---

## 2. Frozen text being amended (verbatim, for diff)

`Master_System_Architecture_v1.0_FINAL.md:212–220`:

> Five named vendor types exist purely as **presets** over these flags, with vendor-elected
> **overrides** ("Additional Capabilities") on top:
>
> | Vendor Type (preset) | supply | service | fabricate | consult |
> |---|:---:|:---:|:---:|:---:|
> | Service Provider / Consultant | – | – | – | ✓ |
> | MRO / Retail Supplier | ✓ | – | – | – |
> | Importer / Equipment Seller | ✓ | – | – | – |
> | Manufacturer | ✓ | – | ✓ | – |
> | Engineering Firm | ✓ | ✓ | ✓ | ✓ |

---

# PATCH-MSA-INV1-01 — Preset register (6 rows, slugged)

Amends the L212 sentence and the L214–220 table to:

> Six named vendor types exist purely as **presets** over these flags, with vendor-elected
> **overrides** ("Additional Capabilities") on top. Each preset has a **stable slug**, which is the
> persisted value; the display name is a label over the slug and may be re-worded without changing
> stored data. The register is a set of **presets, not an exhaustive classification of business
> forms** — no preset claims to represent every company of a given trade name.

| # | Slug (persisted) | Display name | supply | service | fabricate | consult |
|:-:|---|---|:-:|:-:|:-:|:-:|
| 1 | `consultant` | Consultant | – | – | – | ✓ |
| 2 | `mro_retail_supplier` | MRO / Retail Supplier | ✓ | – | – | – |
| 3 | `importer_equipment_seller` | Importer / Equipment Seller | ✓ | – | – | – |
| 4 | `manufacturer_workshop` | Manufacturer / Workshop | ✓ | – | ✓ | – |
| 5 | `engineering_firm` | Engineering Firm | ✓ | ✓ | ✓ | ✓ |
| 6 | `service_provider` | Service Provider | – | ✓ | – | – |

Every seed is **identical to its frozen seed**, except row 6 which is new. No seed value changes.

### Change ledger

| Row | Display name | Seed | Key | Class |
|---|---|---|---|---|
| 1 | **renamed** *Service Provider / Consultant* → **Consultant** | unchanged | re-keyed → `consultant` | **Amendment** |
| 2 | unchanged | unchanged | **re-keyed** → `mro_retail_supplier` | Re-keying |
| 3 | unchanged | unchanged | **re-keyed** → `importer_equipment_seller` | Re-keying |
| 4 | **renamed** *Manufacturer* → **Manufacturer / Workshop** | unchanged | re-keyed → `manufacturer_workshop` | **Amendment** |
| 5 | unchanged | unchanged | **re-keyed** → `engineering_firm` | Re-keying |
| 6 | **new** — Service Provider | new (`service` only) | `service_provider` | Additive |

**Re-keying is a real change to all six rows, not "unchanged" (Review-A MIN-1).** Under P-3 the
display string *is* today's key; minting slugs relocates identity onto the slug for every row,
including rows 2/3/5 whose name and seed do not move. Cost is zero **only** because nothing persists
the field yet (§4); this is not a no-op and is not presented as one.

### Rows 1 and 6 ship as one unit

If row 1 retains its frozen name, the picker presents *"Service Provider / Consultant"* alongside
*"Service Provider"* — near-identical strings seeding opposite flags. Partial approval of row 6
without row 1 is **worse than the status quo** and must be rejected.

---

# PATCH-MSA-INV1-02 — `iVendorz_Master_Overview_v1.0.md` §4.2 alignment

L194–197 paraphrases the table with a **drifted** name set (*"Service Provider, MRO Supplier,
Importer, Manufacturer, Engineering Firm"*). Replace the parenthetical with a **pointer**:

> Preset types (see `Master_System_Architecture_v1.0_FINAL.md` §4 Invariant 1 for the authoritative
> slug/label register) seed the flags; vendors may override.

Reference-never-restate (`CLAUDE.md §11`) — structurally prevents P-3 from recurring.

---

# PATCH-4D-VTP-02 — `vendor_type_preset` value set (**Doc-4D v1.0.4**)

**Allowed values** (`Doc-4D` create L19, update L48, discovery filter L20/L27):

```
consultant, mro_retail_supplier, importer_equipment_seller,
manufacturer_workshop, engineering_firm, service_provider
```

**Version label — v1.0.4, not v1.0.1** (Review-A MAJ-1, inherited from the superseded proposal).
Verified 2026-07-21: `Doc-4D_PassA_Patch_v1.0.1.md` and `Doc-4D_PassB_Patch_v1.0.1.md` exist;
`Doc-4D_CanonicalHost_Patch_v1.0.2.md`; `Doc-4D_PublicProductDetail_Patch_v1.0.3.md`;
`00_AUTHORITY_MAP.md:61` records *"v1.0 (+ realization patches v1.0.2, v1.0.3)"*. Next free label is
**v1.0.4**. Fold target: `generatedDocs/Doc-4D_VendorTypePreset_Values_Patch_v1.0.4.md`.

**Binding rules:**

- **Metadata, never authoritative for capability.** Capability is and stays the four booleans
  (Invariant #1). The preset is **not** derived from the flags and **must not** override them.
- **Seed-once, not a live relationship.** The preset pre-checks flags at authoring time only. No
  runtime derivation, no reverse mapping. A vendor whose flags diverge from its preset is **valid**.
- **Never collapsed in the UI.** `Doc-7G_Content_v1.0_Pass1.md:46` binds: the profile editor
  presents the four flags independently and *"the UI never collapses them to a single 'vendor
  type.'"* The preset is presented **alongside** the matrix, never instead of it.
- **Matching boundary.** Not a Phase-A eligibility gate. No M3 change is authorized
  (`BOARD-DECISION-RFQ-MATCH-EVOLVE_v1.0.md` ③).
- **Optional.** Stays `optional`/nullable; "none of these" is NULL. **No `other` value is minted.**
- **Firewall.** No governance-signal read or write; no plan/entitlement coupling (Inv #6/#10).

**Realization layer:** contract/validation + the discovery filter allowlist. **No Doc-6D DDL change**
— the column is already `text` (`Doc-6D Pass1:70`); an optional DB `CHECK` is **deferred** (recorded,
not coined).

---

## 3. Contractors — no universal preset claimed

The register does **not** claim a preset representing every contractor (Board ruling, §9). Guidance
only, binding nothing:

- A full-capability EPC / engineering contractor selects **Engineering Firm**.
- A maintenance, installation, repair or field-service contractor selects **Service Provider**.
- A fabrication-led contractor selects **Manufacturer / Workshop** where supply + fabrication
  accurately describe its operating model.

The earlier *"Service Provider / Contractor"* name is **withdrawn**: it promised contracting while
seeding `service` alone, reproducing P-1 (Review-A MAJ-2). A contractor needing
`service + fabricate` or `service + fabricate + consult` reaches it via overrides (`:222`).

---

## 4. Impact

| Surface | Impact |
|---|---|
| `prisma/schema.prisma` · `prisma/migrations/` | **None.** No `VendorProfile` model, no `marketplace` migration — verified 2026-07-21 (only `Organization.hasVendorProfile`). |
| Stored data | **None.** Nothing persists `vendor_type_preset`, so both renames and the re-keying carry **zero migration cost**. This window closes when the M2 tables land. |
| `app/(app)/_components/vendor/company/profile-overview.tsx:57` | ⚠️ **Renders `profile?.vendor_type_preset` raw** as the "Vendor type" value. Persisting slugs would print `manufacturer_workshop`. **The slug/label split creates this defect** — a label lookup is required at the same change. |
| `app/(app)/_components/vendor/company/capabilities-capacity-form.tsx:39–41` | 3 unslugged options matching **no** governance list. Map `manufacturer`→`manufacturer_workshop`, `trader`→`mro_retail_supplier`, `service_provider`→`service_provider` (slug unchanged, seed now defined). |
| `app/(app)/_components/vendor/company/types.ts:42` | `vendor_type_preset?: string` — narrows to the slug union. |
| `app/(public)/_components/discovery/seed.ts:55–118` | 8 public-discovery `businessType` labels; **`Supplier / Distributor`, `Importer / Distributor`, `Fabricator`, `Engineering Consultant` match no row** in the new register (nor the frozen 5). Requires reconciliation. |
| `src/frontend/components/vendor-card.tsx:37–41, 99–101` | Renders `businessType` as a public badge; its doc-comment cites *"the frozen value SET is a pending additive patch (Doc-4D VendorTypePreset PROPOSAL)"* — that citation must be re-pointed at this proposal. |
| `src/modules/marketplace/contracts/types.ts` | `VendorCapabilityFlags` unchanged; preset enum type is contract follow-up. |
| M3 matching | **None.** Flags remain the sole eligibility input. |

FE realization is **not authorized by this patch**; it is listed so the Board sees the full blast
radius (Review-A MAJ-6).

---

## 5. Open findings — NOT accepted (`CLAUDE.md §13`, Raise ≠ Accept)

Owner ruling authorizes drafting only. These remain **OPEN** for the Board to rule on with the
review record in front of it (Review-A MAJ-4 — v1.0 wrongly marked C-1/C-2 ACCEPTED before any
review existed).

| ID | Finding | Severity | Status |
|---|---|---|---|
| **C-1** | A pure fabrication job-shop selecting `manufacturer_workshop` inherits `can_supply = ✓` and must uncheck it — the register's only label/seed mismatch (§1.1). | MINOR | **OPEN** |
| **C-2** | No preset seeds `fabricate` alone, nor the `service+fabricate(+consult)` contractor shape. Flag-space coverage is 4 of 16 combinations; reachable only via overrides. | MINOR | **OPEN** |
| **C-3** | `vendor_type_preset` is a **hard** discovery filter (`Doc-4D …Discovery:27`), so re-partitioning the value set materially changes public results. v1.0 downgraded this to OBS on the premise that preset filtering is "descriptive" — a premise §1 already refutes. | MINOR | **OPEN** (upgraded from OBS) |
| **C-4** | *Supplier / Distributor* has no direct row. Row 2 (*MRO / Retail Supplier*) is narrower than the distributor concept carried at `MASTER-CLASSIFICATION-DICTIONARY.md:49` and in the public seed. Unlike rows 4 and 6 this absorption was never declared. | MINOR | **OPEN** |
| **C-5** | Re-keying relocates identity for all six rows (§ ledger). Zero cost today, but the AMENDMENT/ADDITIVE/RE-KEYING split rests on it. | MINOR | **OPEN** |

---

## 6. Supersession and dangling restatements

`Doc-4D_VendorTypePreset_Values_Additive_Patch_PROPOSAL.md` (values `manufacturer,
supplier_distributor, importer, fabricator, epc_contractor, engineering_consultant, other`) is
**SUPERSEDED** and must not be folded:

1. It enumerates a **7-value set conflicting with the frozen 5-preset table** at
   `Master…FINAL.md:214–220` while presenting itself as additive; the conflict is unaddressed.
2. No `service_provider` value → **P-1/P-2 survive it**.
3. Its Appendix-A crosswalk **contradicts the frozen seeds** (`fabricator` → `can_fabricate,
   can_supply`; `epc_contractor` → `can_supply, can_service`).
4. It mints no slugs → **P-3 open**.
5. It carries the **v1.0.1 version collision** (§PATCH-4D-VTP-02).

**Dangling restatements requiring revision in step** (Review-A MIN-5) — each is gated in §10:

| Artifact | Location | Action |
|---|---|---|
| `ADR-023_Vendor_Buyer_Classification_Model_PROPOSAL.md` | §2 | Revise to the 6-row register. Its buyer-side scope (`ESC-IDN-BUYERTYPE`) is untouched. |
| `docs/product/requirements/MASTER-CLASSIFICATION-DICTIONARY.md` | L49–50 | Replace the 7-value list. |
| `docs/product/requirements/VENDOR-PROFILE-MODEL.md` | L23, L41–50 | Replace list + crosswalk (its `epc_contractor → supply, service` row contradicts §3). |

Folding while these three contradict rank-0 is a defect in its own right.

---

## 7. 🛑 Amendment mechanism — UNRESOLVED, Board-only (Review-A MAJ-5)

`00_AUTHORITY_MAP.md:53` records `Master_System_Architecture_v1.0_FINAL.md | CANONICAL | v1.0 FINAL`.
**Every fold precedent in the map is additive, carried alongside an unedited frozen base.** There is
**no precedent for amending a rank-0 CANONICAL document.**

A *replacing* overlay carried alongside an unedited base would leave `…FINAL.md:216` still reading
*"Service Provider / Consultant | – | – | – | ✓"* — a self-contradictory canonical document with no
precedence rule. **This proposal does not select a route.** Two exist:

| Route | Mechanism | Consequence |
|---|---|---|
| **A — canonical base re-freeze** *(Board-preferred, §9)* | Re-freeze the base as `Master_System_Architecture_v1.1_FINAL.md` with §4 Invariant 1 amended in place; supersede v1.0 in the Authority Map. | No contradiction. Heaviest gate: re-freezing rank 0. |
| **B — overlay + normative precedence clause** | Fold `Master_System_Architecture_Inv1_Patch_v1.0.1.md` alongside, **with an explicit clause stating the patch overrides L212–220 of the base**. | Preserves the additive-alongside pattern but coins a precedence mechanism the corpus does not have. |

`CLAUDE.md §7`: ranks 0–1 are immutable to all skills including the Virtual CTO. **Selecting a route
is a human Board act.** Nothing folds until §7 is ruled.

---

## 8. `ESC-MKT-VENDORTYPE` — values half only (Review-A MAJ-3)

`esc_registry.md:92` scopes the handle as **two** gaps:

1. *"`vendor_type_preset` enumerates no values"* → **RESOLVED by this proposal.**
2. *"net-new vendor 'commercial capability' facets (brand/OEM-authorization) unmodeled"*, channel
   *"net-new facets → future M2 patch"* → **NOT addressed; carve-out expressly preserved.**

The registry row must be **amended, not flipped**: the values half closed, the facets half left open,
and the channel corrected from *"Additive `Doc-4D_VendorTypePreset_Values` patch"* to a **rank-0
amendment** per §7.

**Downstream un-gating the Board must see before closing anything:**

- `docs/product/requirements/digital_showcase_planning_and_design.md:393` — item **B1** is a live
  Flag-and-Halt: the four business-shape arrangement presets are **WITHHELD from production**
  expressly because `ESC-MKT-VENDORTYPE` is **OPEN** and FE-PUB-09 (2026-07-03) rejected a coined
  vendor-type label family on Invariant #1 grounds. Same doc L106, L385 and the `ESC-MKT-VENDORTYPE`
  entry at L353 carry the same gate. **Resolving the values half changes B1's gating premise.** This
  proposal takes no position on B1; it must not be closed as a side effect.
- `BOARD-DECISION-RFQ-MATCH-EVOLVE_v1.0.md` ③ defers business-type ranking *pending Track-1
  (`ESC-CLASS-INDUSTRY` / `ESC-MKT-VENDORTYPE`)*. This resolves one of the two preconditions. No M3
  change is authorized here; recorded so the deferral's basis stays accurate.

---

## 9. Provenance and revision history

**v1.0 → v1.1.** v1.0 was routed to an independent Review-A (author did not self-review, per Team-4
Raise ≠ Accept). Verdict **🟠 REVISION REQUIRED — 0 BLOCKER / 6 MAJOR / 7 MINOR / 1 NIT / 5 OBS**;
all v1.0 citations were independently verified accurate.

**Board ruling on MAJ-2 / MIN-2 (2026-07-21):** proceed with 6 rows; rename row 6 to **"Service
Provider"**; *"Contractor"* removed from the display name; **the EPC coverage claim is removed**;
rows 7–8 **NOT restored**; the under-seeding justification **removed as normative** (§1.1); C-1/C-2
**reopened**. Fold status: **not yet approved**.

Design history: an 8-row draft (distinct `fabricator` + `epc_contractor` rows) was reduced to 6 by
owner decision. An intermediate variant seeding `can_service` on row 1, `can_consult` on row 3 and
`can_supply` on row 6 was withdrawn after the label/seed-correspondence objection. Per `CLAUDE.md
§8`, conversational approval authorizes **drafting only**.

Review-A disposition (§13 four-question gate): MAJ-1 corrected (§PATCH-4D-VTP-02) · MAJ-2 corrected
by Board ruling (§3) · MAJ-3 corrected (§8) · MAJ-4 corrected (§5) · MAJ-5 **escalated to Board,
unresolved** (§7) · MAJ-6 corrected (§4) · MIN-1 corrected (ledger) · MIN-2 corrected (§1.1) ·
MIN-3 upgraded to open C-3 · MIN-4 recorded as open C-4 · MIN-5 gated (§6, §10) · MIN-6 corrected
(scope line) · MIN-7 corrected (§PATCH-4D-VTP-02, §7) · NIT-1 corrected (L194–197) · OBS-1 §8 ·
OBS-2 §PATCH-4D-VTP-02 · OBS-3 below · OBS-4 §8 · OBS-5 sweep confirmed complete.

**OBS-3 named explicitly, not cited as support:** `Doc-6D Pass1:88` (MK-CR4) describes
`vendor_type_preset` as *"a UI preset label"*. This patch makes the **persisted value a slug** and the
label a display layer. That is a **re-characterization of a frozen annotation** — architecturally
stronger (it reinforces Invariant #9, Content ≠ Presentation) but it is a change in kind, and it is
declared here rather than presented as conformance.

---

## 10. Approval block

| Gate | Status |
|---|---|
| Review-A (independent) — v1.0 | ✅ run 2026-07-21 → 🟠 REVISION REQUIRED |
| Review-A (independent) — **v1.1** | ☐ not run |
| Review-B (independent) | ☐ not run |
| **§7 amendment-mechanism ruling (Route A or B)** — human Board, rank-0 | ☐ **not granted — blocks everything below** |
| Human Architecture Board — the amendment itself | ☐ not granted |
| Board rulings on open findings C-1…C-5 | ☐ not granted |
| `ADR-023` §2 revised in step | ☐ not done |
| `MASTER-CLASSIFICATION-DICTIONARY.md` L49–50 revised | ☐ not done |
| `VENDOR-PROFILE-MODEL.md` L23/L41–50 revised | ☐ not done |
| Fold + `00_AUTHORITY_MAP.md` registration | ☐ blocked |
| `esc_registry.md:92` **amended** (values closed, facets carve-out preserved, channel corrected) | ☐ blocked |
| B1 (`digital_showcase_planning_and_design.md:393`) disposition acknowledged before ESC closure | ☐ not done |

Freeze/merge gate (`CLAUDE.md §13`): **BLOCKER = 0 · MAJOR = 0 · MINOR = 0** before fold. With C-1…C-5
open and §7 unruled, the gate is **not met**.

---

## 11. Board rulings CARRIED into the next revision (recorded 2026-07-21, **not yet applied**)

Recorded here so no ruling is lost while this instrument is parked. **None of these is applied to
the content above.** They are inputs to the revision that follows Instrument 1's fold.

**On N-2(b) — row 5 breadth.** Open a new carry **C-6**:

> **C-6 — Engineering Firm broad-seed risk.** Status: **OPEN, PRE-EXISTING.** Introduced by this
> patch: **NO.** Resolved by this patch: **NO.** Current patch effect: **NONE.**
> `engineering_firm` seeds all four flags (frozen, `Master…FINAL.md:220`), which can over-seed a
> consulting-only engineering firm. Row 5 is **inherited frozen content, explicitly outside this
> amendment's scope** and is not modified here.

C-1's *"the register's only label/seed mismatch"* is **false and must be replaced** with:

> Row 4 is the label/seed mismatch addressed by this amendment. Other pre-existing preset breadth
> risks, including Engineering Firm, are not resolved by this instrument.

Declaring C-6 is preferred over silently dropping the "only" claim: the risk is now known, and a
risk identified in a governed review that is then left undeclared weakens the record.
**C-6 is not an instruction to redesign row 5** — resolving it requires a separate owner ruling
among at least three materially different options (keep Engineering Firm broad · narrow its seed ·
split multidisciplinary from consulting-only engineering organizations). That decision is outside
the six-row correction.

**On N-3(a) — "may be re-worded without changing stored data".** **REMOVE from the rank-0 amended
text.** It is not descriptive; it creates a standing governance permission to relabel canonical
identities without a further amendment, directly weakening the rule that *the display name is the
identity*. It belongs only in patch commentary describing this one authorized act, and must not
imply that stored data is independent of the name — under the frozen model, changing the name **is**
an identity change and potentially a re-keying operation. Commentary form:

> This amendment changes selected display identities while retaining the declared capability-cell
> values. It does not create a general permission for future relabeling.

**On N-3(b) — "presets, not an exhaustive classification of business forms".** Keep the concept,
**move it out of the invariant** into an explicitly non-normative note:

> **Non-normative interpretation note.** The register provides onboarding presets for capability
> initialization. It is not intended to enumerate every legal, commercial, or industrial business
> designation.

The normative register row remains minimal — **display name + four capability cells.** No
explanatory business taxonomy belongs inside the canonical row definition.

**On §7.** Removed from this instrument; see Instrument 1. Board prefers **canonical base
re-freeze**, not a permanent overlay, and directs that no generic "latest overlay wins" mechanism be
introduced unless the wider corpus needs layered canonical documents.

**Also carried into the next revision** (author-accepted round-2 findings, not yet applied): N-1
(label §1.1 non-normative rationale — it has no frozen anchor) · N-4 (declare the Fabricator
absorption; drop the false comparative) · N-5 · N-6 (add a discovery-results row to §4) · N-8a
(ADR-023 has no §2 — the list is **Decision item 2, L36–40**) · N-8b (drop the `:353` gate claim) ·
N-8c (8 seed entries but **6 distinct labels**; `"Manufacturer"`/`"Importer"` also fail exact match)
· N-9 (`esc_registry.md:92` Interim-presentation column) · N-10 (filename form) · N-11.

---

*End of MasterArchitecture_Inv1_VendorTypePreset_Amendment_PROPOSAL_v1.1 — 2 frozen-row renames,
1 additive preset row, re-keying, and the `vendor_type_preset` value set. No capability-matrix,
field, contract, DDL, ownership, state or event change. DRAFT — awaits HUMAN approval; not folded
by AI.*

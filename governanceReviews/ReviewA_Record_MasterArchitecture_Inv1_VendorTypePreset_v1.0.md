# ReviewA_Record_MasterArchitecture_Inv1_VendorTypePreset_v1.0.md

> **Review record — Team-4 Review-A.** Two independent rounds against
> `MasterArchitecture_Inv1_VendorTypePreset_Amendment_PROPOSAL_v1.x`. Raise ≠ Accept
> (`CLAUDE.md §13`): findings below are **raised**, not ruled. Non-authoritative; records actions.
>
> **Provenance defect, recorded:** the v1.0 proposal artifact was **deleted from the working tree by
> the author after drafting v1.1** and was never committed. The v1.0→v1.1 diff is therefore **not
> auditable**. This file exists to restore citability of the review findings themselves; it does not
> restore the v1.0 artifact. Raised as round-2 **N-7**.

| Field | Value |
|---|---|
| Subject | `governanceReviews/MasterArchitecture_Inv1_VendorTypePreset_Amendment_PROPOSAL_v1.1.md` |
| Reviewer | Team-4 Review-A — independent agents; the proposal author did **not** self-review |
| Round 1 | 2026-07-21 · against **v1.0** (artifact since deleted) · **🟠 REVISION REQUIRED** · 0 BLOCKER · 6 MAJOR · 7 MINOR · 1 NIT · 5 OBS |
| Round 2 | 2026-07-21 · against **v1.1** · **🟠 REVISION REQUIRED** · 0 BLOCKER · 4 MAJOR · 6 MINOR · 1 NIT · 3 OBS |
| Gate (`§13`) | BLOCKER = 0 · MAJOR = 0 · MINOR = 0 — **NOT MET** in either round |
| Review-B | not run |

---

## Round 1 — findings against v1.0

All v1.0 citations were independently verified **accurate**; the failures were classification,
coverage, scope-closure and versioning — not fabrication.

| ID | Sev | Finding |
|---|---|---|
| MAJ-1 | MAJOR | Doc-4D **v1.0.1 already issued twice** (`Doc-4D_PassA_Patch_v1.0.1`, `..._PassB_Patch_v1.0.1`); doc effectively at v1.0.3 (`00_AUTHORITY_MAP.md:61`). Next free = **v1.0.4**. Defect inherited from the superseded proposal; §6 did not catch it. |
| MAJ-2 | MAJOR | Row 6 *"Service Provider / **Contractor**"* seeded `can_service` only — **reproduces defect P-1** (label promises capability the seed does not grant) on the very patch meant to eliminate it, and was self-classified MINOR. Under `Master…FINAL.md:224` such a vendor is filtered out of every supply and fabrication RFQ. |
| MAJ-3 | MAJOR | `ESC-MKT-VENDORTYPE` marked RESOLVED, but `esc_registry.md:92` scopes **two** gaps — values **and** commercial-capability facets (brand/OEM-authorization). Only the first is addressed; the carve-out the superseded proposal carried was dropped. Registry also names a different channel. |
| MAJ-4 | MAJOR | §5 closed findings as *"ACCEPTED by owner ruling"* **before any review ran**, contradicting the same document's §7 (*"conversational approval authorizes drafting only"*) and `§13` Raise ≠ Accept. |
| MAJ-5 | MAJOR | **No corpus precedent for amending a rank-0 CANONICAL document.** `00_AUTHORITY_MAP.md:53` = `CANONICAL / v1.0 FINAL`; every fold precedent is additive-alongside-an-unedited-base. A replacing overlay leaves `…FINAL.md:216` still reading the superseded row, with no precedence rule. |
| MAJ-6 | MAJOR | Impact table missed four live consumers: `profile-overview.tsx:57` (renders the value **raw** — broken by the proposal's own slug/label split), `discovery/seed.ts:55–118`, `vendor-card.tsx:37–41/99–101`, `company/types.ts:42`. |
| MIN-1 | MINOR | Rows 2/3/5 declared *"Unchanged"* though minting slugs **re-keys** them; the ledger is the sole basis for the AMENDMENT/ADDITIVE split. |
| MIN-2 | MINOR | *"Under-seeding is the safe failure direction"* **coined at rank 0 with no frozen anchor**, and factually overstated: an under-seeded vendor never learns of the RFQs it was filtered out of, so it is equally undetectable. `:224` supports the mechanism, not the conclusion. |
| MIN-3 | MINOR | C-3 downgraded to OBS on the premise that preset filtering is "descriptive" — refuted by the proposal's own §1 and by `Doc-4D …Discovery:27` (*"Filters = allowlisted **hard** attributes"*). |
| MIN-4 | MINOR | *"Supplier / Distributor"* coverage loss undeclared (row 2 is narrower). |
| MIN-5 | MINOR | Two requirement docs still restate the superseded 7-value set (`MASTER-CLASSIFICATION-DICTIONARY.md:49–50`, `VENDOR-PROFILE-MODEL.md:23/41–50`); no approval gate covered them. |
| MIN-6 | MINOR | Scope line said Invariant 1 *"L212–L222"* while §2 said `:222` is not amended. |
| MIN-7 | MINOR | Version label and fold-filename form non-conformant with `00_AUTHORITY_MAP.md` convention. |
| NIT-1 | NIT | `Master_Overview` line range off by a line. |
| OBS-1…5 | OBS | ESC closure **un-gates** withheld surface B1; cite `Doc-7G:46`; name the MK-CR4 re-characterization; `BOARD-DECISION-RFQ-MATCH-EVOLVE` ③ Track-1 downstream; restatement sweep confirmed complete (only `Master…FINAL:212–220` + `Master_Overview:194–196` restate the names). |

### Board ruling on MAJ-2 / MIN-2 — 2026-07-21

Proceed with **6 rows**; rename row 6 to **"Service Provider"**; *"Contractor"* removed from the
display name; **EPC coverage claim removed**; rows 7–8 **NOT restored**; the under-seeding argument
**removed as normative**; C-1/C-2 **reopened**; fold status **not yet approved**. Contractors are
handled by guidance, not by a preset claiming to represent every contractor.

---

## Round 2 — findings against v1.1

**Round-1 closure:** 11 fully closed · 3 partial (MAJ-5 correctly escalated, MIN-5 pointer defect,
MIN-7 half) · citations re-verified accurate except N-8.

| ID | Sev | Finding |
|---|---|---|
| **N-1** | MAJOR | §1.1 replaces one uncited rank-0 rule with another: *"a preset's display name must not promise a capability its seed does not grant"* … *"the only defensible constraint"*. **No frozen anchor**; `:222`/`:224` speak only to overrides and covering. Same defect class as the withdrawn MIN-2. Mitigating: rationale, not fold text — should be labelled non-normative or anchored. |
| **N-2** | MAJOR | **The register violates its own §1.1 rule, and C-1's exhaustiveness claim is false.** (a) §1.1 forbids *label promises > seed grants*; C-1 describes the **opposite** direction (seed grants > business), so the headline principle does not reach the proposal's own known defect. (b) C-1 calls row 4 *"the register's only label/seed mismatch"* — but row 5 `engineering_firm` seeds **all four flags** (frozen, `Master…FINAL.md:220`); a consulting-only engineering firm is over-seeded **more** than row 4's job-shop, and it is nowhere declared. |
| **N-3** | MAJOR | **Scope creep into rank-0.** Declared scope is names + one row + slugs + values. The replacement for `…FINAL.md:212` adds two new normative sentences: *"may be re-worded without changing stored data"* (a standing permission to relabel rank-0 rows without an amendment — a governance mechanism) and *"presets, not an exhaustive classification of business forms"* (an interpretive rule about the invariant's reach). Neither is disclosed in the Change class. |
| **N-4** | MAJOR | **C-4's comparative is false.** C-4 says the Supplier/Distributor absorption is undeclared *"unlike rows 4 and 6"* — but the `fabricator` absorption into row 4 is **equally undeclared** (§3 addresses a fabrication-led *contractor*, not the `fabricator` value; §9 is provenance, not declaration). The same defect exists unraised, and the sentence distinguishing them is untrue. |
| **N-5** | MINOR | §7 claims route-neutrality, but the patch body (*"Amends the L212 sentence and the L214–220 table to:"*) is **Route-A-shaped**; under Route B the deliverable is an overlay file **plus** a precedence clause, neither drafted. |
| **N-6** | MINOR | C-3 calls the hard-filter re-partitioning *"materially changes public results"*, yet §4 records **no discovery-results row** — the one behavioural change the proposal itself calls material is missing from the blast radius. |
| **N-7** | MINOR | **The v1.0 artifact and its review record are absent from disk** (untracked, deleted), so the v1.0→v1.1 diff is unauditable and §9's disposition table rests on an unciteable record — while §10 marks that gate ✅. *(This file is the partial remedy; the v1.0 artifact is not recoverable.)* |
| **N-8** | MINOR | Three cross-references do not resolve: (a) ADR-023 has **no §2** — the 7-value list is Decision item 2, L36–40, so the §10 gate points at a section that does not exist; (b) `digital_showcase_planning_and_design.md:353` is a flat "Open:" ESC list, **not a gate** (`:106`/`:385` are, and are cited correctly); (c) `seed.ts` has 8 **entries** but **6 distinct labels**, and `"Manufacturer"`/`"Importer"` also fail exact match against the new display names, so "4 match no row" understates the reconciliation surface. |
| **N-9** | MINOR | §8's registry amendment misses the row's **Interim presentation** column (`esc_registry.md:92`, *"Define the value set as metadata (Manufacturer/Supplier/…)"*) — a paraphrase that will go stale against the 6-row register: the exact P-3 restatement-drift class this patch exists to eliminate. |
| **N-10** | MINOR | Filename form still non-conformant — every sibling is `<target>_Patch_v<target-version>_PROPOSAL.md`; this is `…_PROPOSAL_v1.1.md` (version **after** `_PROPOSAL`, and v1.1 is the proposal's own revision). §9 records MIN-7 "corrected"; only the doc-version half was. |
| **N-11** | NIT | Discovery filter cited as "L20/L27" for allowed values; `:20` is the value site, `:27` classifies the filter but enumerates nothing. Accurate but conflated. |
| **OBS-A** | OBS | No violation of Invariant #1, the five-signal firewall, One Module One Owner, Content ≠ Presentation, or non-disclosure. `Doc-7G:46` and `Doc-6D:88` honored; the MK-CR4 re-characterization is **declared, not smuggled**. |
| **OBS-B** | OBS | Red Flag Checklist item *"Modify a FROZEN document"* **is** triggered — handled correctly (Flag-and-Halt, human Board only, no AI fold). Recorded so the Board sees it was raised, not missed. |
| **OBS-C** | OBS | Zero-migration claim independently verified: no `VendorProfile`/`marketplace` model in `prisma/schema.prisma` (only `Organization.hasVendorProfile:204`); no marketplace migration. |

### Reviewer's structural note to the Board

With C-1…C-5 open and each capable of changing the register, and §7 unruled, the proposal cannot be
approved under any disposition other than "C-1…C-5 dismissed". **The Board may wish to split the §7
amendment-mechanism ruling into a separate instrument and rule it first** — the register content is
not reviewable in final form until the fold mechanism exists.

---

## Status

**Not folded. Not approved. No file was modified by either review.**

**Round-2 adjudication — Board, 2026-07-21.** N-2(b) → new open carry **C-6** (pre-existing, row 5
unmodified, "only mismatch" claim struck). N-3(a) → **removed** from rank-0 text; no standing
relabel permission. N-3(b) → retained as a **non-normative interpretation note**, outside the
invariant. N-1, N-4, N-5…N-11 → accepted, carried to the next revision. **Structural split
APPROVED:** the rank-0 amendment mechanism is removed from the register proposal and ruled first as
a standalone instrument —
`governanceReviews/Governance_RankZero_Amendment_Mechanism_v1.0_PROPOSAL.md` (Instrument 1); Board
prefers **canonical base re-freeze** over a permanent overlay, and directs that no generic "latest
overlay wins" precedence mechanism be introduced.

Full ruling text is carried in the register proposal's **§11**. The register proposal
(Instrument 2) is **PARKED** and is not reviewable in final form until Instrument 1 is folded; it
has **not** been revised against round 2.

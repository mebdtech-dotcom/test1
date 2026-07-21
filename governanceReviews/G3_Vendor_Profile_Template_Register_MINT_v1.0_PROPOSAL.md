# G3 — Vendor Profile Template Register (name ↔ `layout_template` binding) — MINT PROPOSAL v1.0

> # 🛑 REJECTED FOR FOLD
>
> **Owner/Board disposition, 2026-07-21, on Review-B. This document is AUDIT EVIDENCE ONLY.**
> It must **never** be folded, cited as authority, or treated as a live proposal. **G3 = BLOCKED.**
>
> **Reason.** Its central premise is false. The frozen corpus already binds a name **and behaviour**
> to every letter, unamended:
>
> - `Master_System_Architecture_v1.0_FINAL.md:569` — **rank 0, CANONICAL**
> - `ADR_Compendium_v1.md:1008` — **rank 1**, ADR-020
>
> > "**Layout Templates** — predefined structures: **A Directory Style · B Engineering Company ·
> > C Manufacturer · D Service Company · E Corporate Microsite.** Each defines hero, section, and
> > contact ordering."
>
> Consequently this instrument is a **REMAP of rank-0/rank-1 text**, not the additive first mint it
> claims ("Supersedes: Nothing" · "the corpus attaches no name to any letter" · "First mint, not a
> re-mint" — all **FALSE**). By its own §4 a remap needs a new Board instrument, compatibility
> analysis, migration disposition and **v2.0** governance; and amending ADR-020 is a Red-Flag STOP
> that no AI-authored artifact may perform. §2.4 ("no plan, tier, entitlement… gates any of them")
> is separately refuted by the frozen `template_access_level` (`fixed_1 | standard_5 | all | custom`,
> `ADR_Compendium_v1.md:1021`).
>
> **Replacement path.** ONE ATOMIC Board packet — additive **Master §8.4** patch **+** **ADR-020**
> amendment/superseding ADR — drafted at
> `governanceReviews/G3_TemplateSemantics_Amendment_Packet_v1.0_PROPOSAL.md`.
>
> **Audit evidence — the exact reviewed bytes.** Everything below this banner is unmodified from the
> frozen post-Review-A snapshot that Review-B examined:
>
> | Snapshot | SHA-256 | Git blob |
> |---|---|---|
> | Review-A target (pre-fix) | `e745bb716d123844f0e04675afe7d2c4d5e779c41b33a02b44a79eeac453648a` | `4ca8dc438454b79d966e81e6b5e50f5aa29fc055` |
> | **Review-B target (post-fix, rejected)** | `f7ebdaf76c4c60a787d0a7b6ae2f0ad0fb8e00c810ab1c594caf92f257dd395d` | `563e593c5e9c3c37b9dc4c59c90a2e52bec24087` |
>
> Review-B verdict: **BLOCKER 5 · MAJOR 11 · MINOR 10 · NITPICK 1 · OBS 4** (gate 0·0·0 not met),
> reached independently by three blind adversarial reviewers. Re-adding this banner changes the file
> hash by design; the hashes above identify the byte-exact reviewed content.

---

| Field | Value |
|---|---|
| **Status** | **PROPOSED — DRAFT MINT ARTIFACT.** Review-A complete; owner/Board adjudication recorded 2026-07-21; accepted fixes applied (§9). Awaiting **freeze snapshot → Review-B**. Until the fold completes, the governed status remains **G3 READY — formal mint pending**, and no production code may treat the letter semantics as authoritative. |
| **Date** | 2026-07-20 · corrected 2026-07-21 (Review-A dispositions) |
| **Kind** | **Additive naming register.** Binds a canonical display name to each value of the **already-frozen** `marketplace.microsites.layout_template` enum. Coins **no** contract-ID, entity, state, transition, event, slug, audit action, POLICY key, page ID, column, or enum value. Adds **no** behaviour. |
| **Owner** | **M2 — Marketplace** (owner/Board ruling 2026-07-21). M2 owns `marketplace.microsites` and therefore owns the register that names its `layout_template` values. |
| **Opened by** | Owner ruling 2026-07-20 ("G3 — open the formal mint now"), which also fixed the required review sequence and the `DEFAULT 'A'` declaration below. |
| **Fold target** | **RULED 2026-07-21** — standalone `generatedDocs/` record + own Authority Map row, parented to **Doc-7G §3**. See §6. |
| **Supersedes** | Nothing. |
| **Blocks / unblocks** | Unblocks: treating the canonical names as authoritative production semantics. Does **not** unblock **G3A** (Business Landing has no design artifact) or **G4** (single-page behaviour and canonical-route treatment) — both stay OPEN and are carried below unchanged. |

---

## §0 — Authority altitude

Three distinct tiers. They are listed separately because conflating them would let a prototype's
visual approval enter the frozen corpus as architecture.

| Tier | Source | What it establishes here |
|---|---|---|
| **Authoritative — frozen corpus (rank 0)** | `Doc-2 §10.3` (`Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md:744`) — `layout_template(A–E)` in the `marketplace.microsites` row · `Doc-4D_Content_v1.0_PassB_ProfileExperience.md:18` — `layout_template : enum(A\|B\|C\|D\|E) : required` on create · `Doc-6D_Content_v1.0_Pass2.md:146` — `CREATE TYPE marketplace.microsite_layout AS ENUM ('A','B','C','D','E')` · `Doc-6D_Content_v1.0_Pass2.md:152` — `layout_template marketplace.microsite_layout NOT NULL DEFAULT 'A'` | **That the five values exist, are required on create, and carry a storage default.** Nothing more: the corpus attaches no name, page model, route, ordering, or behaviour to any letter. |
| **Owner ruling (§7 rank 2)** | Hybrid-model ruling 2026-07-20 (`digital_showcase_planning_and_design.md` §3A.0): the canonical template axis is **visual layout style**, never vendor business type · Review-A adjudication 2026-07-21 (this artifact's dispositions, §9) | **The axis and the scope of this instrument.** |
| **NON-AUTHORITATIVE — visual evidence only** | `prototypes/vendor-profile-templates/` — owner Visual Approval 2026-07-08, "Vendor Profile Template System v1.0", five layout files | **Nothing normative.** It is the visual evidence that five distinct layouts were designed and approved. It is a prototype, carries no corpus authority, and confers none on this register. Its file names are not a source of truth for the canonical names. |

**This instrument — and only this instrument — establishes the canonical display names.** They are not
inherited from the prototype, the planning companion, or existing code; those are made to conform to
this register at fold, never the reverse.

## §1 — What is minted (NORMATIVE — the complete normative content)

One canonical display name per frozen enum value. **This table is the entire normative payload of the
register.** Nothing else in this document is minted.

| Frozen value | Canonical name |
|---|---|
| `A` | **Corporate Classic** |
| `B` | **Modern Industrial** |
| `C` | **Product Catalogue** |
| `D` | **Portfolio & Projects** |
| `E` | **Business Landing** |

Deliberately **absent** from the normative table, each for a stated reason in §2: page model,
route or routing treatment, visual emphasis, use-case descriptions, picker copy, ordering, and any
vendor-type association.

## §2 — What this register does NOT do

1. **Attaches no semantics to the letters.** They remain opaque slots. No routing, matching,
   entitlement, ordering, pricing, or eligibility behaviour may be derived from a letter or a name.
2. **Changes no frozen document, enum, column, or default.** The enum, its five values and
   `DEFAULT 'A'` are quoted as they already stand.
3. **Coins no vendor-type concept, and the register does not encode vendor type.** The axis is
   visual layout style. Business type may inform **section emphasis** and never template identity,
   and never locks a vendor to a template (`ESC-MKT-VENDORTYPE` stays OPEN; FE-PUB-09's rejection of
   vendor-type labels stands untouched).
4. **Grants no template restriction.** All five values remain selectable by every vendor at all
   times. No plan, tier, entitlement, or capability flag gates any of them.
5. **Declares no page model, route, or canonical-route treatment. `G4` still owns single-page
   behaviour and canonical-route treatment**, and this register is silent on both. A name is not a
   layout contract: minting "Business Landing" says nothing about how `E` renders inside the route
   IA, how many routes it exposes, or whether sub-routes redirect. G4 remains OPEN and is not
   narrowed, prejudged, or partially resolved by this artifact.
6. **Governs no descriptions or picker copy.** Use-case descriptions, emphasis wording, marketing
   copy, preview imagery and card layout in any template picker are **presentation copy outside this
   register**. They may be written, changed or removed without touching this instrument, and no
   version of them is minted here.
7. **Governs no section emphasis.** What a vendor's page leads with is governed separately through
   `profile_sections` (`display_order` / `is_visible`) — a different field on a different aggregate,
   independent of template identity by construction.
8. **Does not resolve G3A.** Business Landing still has no design artifact.

## §3 — Default handling (`DEFAULT 'A'`)

The frozen DDL carries `layout_template marketplace.microsite_layout NOT NULL DEFAULT 'A'`
(`Doc-6D_Content_v1.0_Pass2.md:152`). Its status is precisely:

1. **A storage safeguard only.** It states which value the column holds when a row is written
   without one. It is not, and must never be rendered as, a vendor's selection.
2. **The create contract requires an explicit value** — `layout_template : enum(A|B|C|D|E) :
   required` (`Doc-4D_Content_v1.0_PassB_ProfileExperience.md:18`).
3. **Therefore the default is not expected to execute through the normal application path.** Every
   microsite created through the contract carries a value the vendor supplied. The default is a
   backstop against a write that bypasses the contract, not a product behaviour.
4. **An absent or unread value is an ABSENCE, never a selection.** Presentation MUST NOT display
   "Corporate Classic" — or any other template name — for an unread, absent, or unknown
   `layout_template`. It must render an explicit absence.

*(Realized today: `templateEntry()` returns `undefined` for an absent value rather than substituting
the default, and the workspace renders "Not chosen yet". This is a conformance note, not a
normative clause — the rule binds regardless of the current implementation.)*

## §4 — Ownership and amendment

| Rule | Statement |
|---|---|
| **Owner** | **M2 — Marketplace.** M2 owns `marketplace.microsites` and its `layout_template` column, and therefore owns this register. One module, one owner (§3/Golden Rule 2). |
| **What v1.0 freezes** | Exactly **five** mappings: `A`→Corporate Classic, `B`→Modern Industrial, `C`→Product Catalogue, `D`→Portfolio & Projects, `E`→Business Landing. |
| **Immutability within v1.x** | The five mappings are **immutable within v1.x**. No patch, editorial pass, or dependent-pointer update may alter a letter↔name pair at v1.x. |
| **Adding a sixth template** | **Out of this register's reach entirely.** A sixth template requires upstream enum/schema/contract governance first — an additive `Doc-2` domain-model change, the `Doc-6D` `CREATE TYPE` realization, and the `Doc-4D` contract enum — each on its own Board instrument. Only after those land may this register be extended to name the new value. The register can never itself create a template. |
| **Remapping an existing letter** | Requires a **new Board instrument** carrying: a compatibility analysis (every persisted `layout_template` row already means something to a vendor), a migration disposition, and **major-version governance** (v2.0, not a v1.x patch). A remap is a semantic change to stored data, not a rename. |

## §5 — Conformance verification

Performed 2026-07-20 by the author; **independently re-run by Review-A 2026-07-21** against the
corrected anchors. All anchors below are the verified locations, not the originally cited ones.

| Check | Method | Result |
|---|---|---|
| The five names appear nowhere in the frozen corpus | case-insensitive recursive search of all 764 files in `generatedDocs/` for each of the five names | **0 hits, all five** — no conflict, nothing overwritten |
| The corpus attaches no semantics to A–E | exhaustive `layout_template` sweep of `generatedDocs/`; every occurrence read in context | **6 occurrences, all column-list / DDL / request-contract.** Validation is syntax-level only; no frozen text branches on which letter. Letters are opaque slots |
| No G3 record already exists | `00_AUTHORITY_MAP.md` sweep + `generatedDocs/` search | **None** — no row for a G3, a template register, or vendor profile templates. First mint, not a re-mint |
| The enum and its default are unchanged by this artifact | quoted DDL vs `Doc-6D_Content_v1.0_Pass2.md:146,152` | **Verbatim** |
| The create contract requires the value | `Doc-4D_Content_v1.0_PassB_ProfileExperience.md:18` | `layout_template : enum(A\|B\|C\|D\|E) : required` — confirmed (§3.2) |
| Cardinality matches the approved layouts | 5 enum values ↔ 5 approved layouts in the **non-authoritative** prototype (§0 tier 3) | **1:1** — recorded as evidence of design intent, not as authority |

**Citation-integrity note.** Two anchors in the pre-Review-A draft were wrong and are corrected
here: `Doc-4D PassB:18` pointed at a horizontal rule in a 160-line part-file **manifest** that
contains no `layout_template` at all (correct file: `Doc-4D_Content_v1.0_PassB_ProfileExperience.md`),
and `Doc-2 §10.744` was a malformed hybrid of a section number and a line number (correct: **§10.3**,
at line 744). The same two defects were swept from `template-catalog.ts`.

## §6 — Fold target (RULED 2026-07-21)

**Ruled:** a **standalone `generatedDocs/` record** with its **own Authority Map row**, **owned by M2
— Marketplace**, and **parented to Doc-7G §3 — Microsite & Presentation Management**
(`Doc-7G_Content_v1.0_Pass1.md:56`; §3.2 "Content ≠ Presentation; vendor-branded theming" at `:62` is
the presentation-selection clause). Doc-7G §3 is the frozen section that governs the vendor's
management of the microsite draft projection and its presentation — the surface on which
`layout_template` is selected.

Rationale, against the ruling criteria:

- **Precedence** — the corpus registers standalone records with their own Authority Map row
  (`Doc-4B_OutboxAuditToken_Patch_v1.0`, `Doc-4E_VendorInvited_Payload_Additive_Patch_v1.0`, the
  twelve `Doc-3_Policy_Key_Registration_Patch_*` register-shaped instruments), and **every one of
  them is parented to a named § of exactly one Doc.** A parent-less cross-surface register has no
  precedent; parenting to Doc-7G §3 supplies it.
- **Ownership** — M2 owns the aggregate and the column, so M2 owns the register. Doc-4D was rejected:
  a contract document must not carry display naming.
- **Dependency direction** — the name is *written* at the vendor workspace picker and *read* by
  public rendering. The register is parented at the write side.
- **Pointer stability** — Doc-7G is `FROZEN v1.0` with **no pending patches and no carried ESC**. It
  is the only stable anchor in the Doc-7 family.
- **Discoverability** — an implementer building the picker reads Doc-7G §3; the register is one
  pointer away.

**The Doc-7D consumer pointer is DEFERRED to the pending G1-B fold** (Doc-7D §10 Multi-Page Route IA
→ v1.1). It is not written now and its absence is not a defect. Reason: **Doc-7D §10 does not exist
in the frozen corpus** — the section text lives only in `governanceReviews/`, fold pending
(`00_AUTHORITY_MAP.md:163`), and ADR-022 has no file in `generatedDocs/` at all. A pointer written
today would target a section that is not there and would couple this mint to an unrelated pending
fold. When G1-B lands, the Doc-7D §10 fold adds the consumer pointer back to this register as part of
its own dependent-pointer sweep.

## §7 — Fold verification (executed at fold; G1-D style)

1. **Authority Map row added** — Document · Authority Level · Version · Frozen? · Notes, per the §3
   table convention, recording owner = M2 and the Doc-7G §3 parent.
2. **Doc-7G parent linkage verified** — the pointer from Doc-7G §3 resolves to this record, and the
   record's parent citation resolves back.
3. **Dependent-pointer sweep** across plan, code, prototypes, WBS and page inventory — the full list
   is §7.1.
4. **Doc-7D pointer explicitly DEFERRED** to G1-B and recorded as deferred, not missing.
5. **Plan citation ordering** — `digital_showcase_planning_and_design.md` may cite this artifact **by
   path only after the artifact is committed**. Until then the plan describes its status in words. A
   committed document must never cite the repository path of an uncommitted artifact.
6. **G3A and G4 re-checked as still OPEN** — the mint must not be read as closing either.

### §7.1 — Dependent-pointer list

| Surface | Action at fold |
|---|---|
| `generatedDocs/00_AUTHORITY_MAP.md` | **New row** for this record (owner M2, parent Doc-7G §3) |
| `generatedDocs/` Doc-7G §3 | **Parent pointer** to this record |
| `docs/product/requirements/digital_showcase_planning_and_design.md` | §5 gate row **G3 READY → MINTED**; §3A register wording; the `Doc-4D PassB:18` anchor at :110 corrected; path cited only post-commit |
| `app/(app)/_components/vendor/microsite/template-catalog.ts` | Header status "PROPOSED — Board mint pending" → minted citation *(anchors already corrected)* |
| `app/(app)/_components/vendor/microsite/microsite-builder.tsx` | Header status line |
| `governanceReviews/DS-W2A-template-audit/DS-W2A_Template_Manifest_and_Audit_v0.2.md` | "unminted" / "proposed mapping" wording |
| `prototypes/digital-showcase-workspace/README.md` + `index.html` | Annotations "mapping PROPOSED, Board mint pending"; version linkage |
| `prototypes/vendor-profile-templates/README.md` | The approved-prototype source — record that the register, not the prototype, is canonical |
| `project-management/fe-program-wbs.md` | FE-VEN-03 Microsite row |
| `project-management/changelog.md` | Fold entry |
| `docs/product/ux/page_inventory.md` | P-VND-05/06 (picker) and P-PUB-13..17 (render) — verify no page ID is implied or required |
| `esc_registry.md` | Confirm no template/layout handle is required (none exists today) |
| `generatedDocs/Doc-5A_Structure_Proposal_v0.1.md` | Incidental keyword match — verify unrelated, no action expected |

## §8 — Review sequence and freeze protocol

```
draft mint artifact          ← this document
→ Review-A                   (architecture & governance conformance)   ✅ complete 2026-07-21
→ accepted fixes                                                       ✅ applied (§9)
→ FREEZE (pre-Review-B)      SHA-256 + Git blob hash of this file
→ Review-B                   (adversarial, on the frozen snapshot only)
→ accepted fixes
→ fix verification
→ fold                       (HUMAN records action — never an AI act, §7/§8)
→ POST-FOLD VERIFICATION     by COMMIT hash + Authority Map + §7 pointer sweep
```

**Freeze protocol.** This artifact is **untracked** while in review, so there is no tree or commit
hash to freeze against. The pre-Review-B freeze is therefore taken as the **SHA-256 content hash and
the Git blob hash** (`git hash-object`) of this file, recorded in the review record, and re-verified
unchanged at the start of Review-B. **Only after the fold**, when the artifact is committed, does
verification move to a **commit hash**.

Gate: the fold does not proceed at anything other than **BLOCKER 0 · MAJOR 0 · MINOR 0** (§13).

## §9 — Review-A disposition record (owner/Board, 2026-07-21)

| ID | Sev | Disposition | Where applied |
|---|---|---|---|
| A1 | MAJOR | **ACCEPTED** — false `Doc-4D PassB:18` anchor corrected to `Doc-4D_Content_v1.0_PassB_ProfileExperience.md:18`; swept from `template-catalog.ts` | §0, §5 |
| A2 | MAJOR | **ACCEPTED** — malformed `Doc-2 §10.744` corrected to `Doc-2 §10.3` (line 744), house convention; swept from `template-catalog.ts` | §0, §5 |
| A3 | MAJOR | **ACCEPTED** — authority altitude separated into three tiers; the prototype is labelled non-authoritative visual evidence; this instrument establishes the names | §0 |
| A4 | MAJOR | **ACCEPTED** — page model removed from the normative register; G4's ownership of single-page behaviour and canonical-route treatment stated explicitly | §1, §2.5 |
| A5 | MAJOR | **ACCEPTED** — fold target ruled; pointer creation added to the fold verification; Doc-7D pointer explicitly deferred to G1-B | §6, §7 |
| A6 | MINOR | **ACCEPTED** — plan may cite the artifact path only after the artifact is committed | §7.5 |
| A7 | MINOR | **ACCEPTED** — freeze step replaced with SHA-256 + Git blob hash pre-Review-B, commit hash post-fold | §8 |
| A8 | MINOR | **ACCEPTED** — descriptions and picker copy declared outside the register | §2.6 |
| A9 | MINOR | **ACCEPTED** — ownership and amendment rules added (five mappings, v1.x immutability, sixth-template path, remap governance) | §4 |
| A10 | MINOR | **ACCEPTED** — owner = M2 Marketplace, stated in the header and §4 | header, §4 |
| A11 | MINOR | **ACCEPTED** — the create contract requires an explicit value, so the default is not expected to execute on the normal path | §3 |
| A12 | NIT | **ACCEPTED** — the default no longer names a template; it stores `'A'`, and presentation must not name it | §3 |
| A13 | NIT | **ACCEPTED AS A UI-DISAMBIGUATION NOTE ONLY. No template is renamed.** | Appendix N1 |
| A14 | NIT | **NO CHANGE REQUIRED** — user-facing "Catalogue" may coexist with internal `catalog` identifiers | — |
| A15 | NIT | **ACCEPTED** — resolved by removal: the emphasis column carrying "services" is gone from the normative register | §1 |

O1–O4 are not addressed in this artifact. O4 (the seven-route IA is not in the frozen corpus) is used
solely to justify deferring the Doc-7D pointer (§6). O1–O3 are recorded as separate follow-up
observations outside this instrument.

---

## Appendix N1 — UI disambiguation (NON-NORMATIVE)

Not part of the register; no template is renamed. Two canonical names sit close to existing vendor
workspace surface names, and picker copy should keep them distinct:

- template **C "Product Catalogue"** vs the workspace surface **Product Portfolio** (the catalog of
  products a vendor sells);
- template **D "Portfolio & Projects"** vs the workspace surface **Project Portfolio** (the
  case-study content source).

A template is a presentation style; a portfolio surface is where content is authored. Picker copy
should make that distinction visible. This is guidance for presentation copy — which §2.6 places
outside the register — and binds nothing.

---

*Drafted by an AI author under CLAUDE.md §8 (AI may generate documentation and migration plans; may
not modify architecture or fold records). Review-A dispositions applied per owner/Board ruling
2026-07-21; the fold target was ruled by the owner, not chosen by the author. This artifact coins
nothing, changes no frozen document, and carries no authority until folded and registered.*

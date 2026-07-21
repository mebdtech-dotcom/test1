# G3 — Vendor Profile Template Semantics — **ATOMIC AMENDMENT PACKET v1.0 (PROPOSAL)**

> # 🛑 PARKED INDEFINITELY — WORKSTREAM STOPPED
>
> **Owner ruling 2026-07-21: G3 is parked INDEFINITELY and the workstream is STOPPED.** No further
> review or drafting effort is to be spent on template names. The name-collision ruling (M1) and G3
> revision authorization are **DEFERRED until the Board explicitly reopens this work.** Do not
> reopen on the strength of Instrument 1 landing alone — Instrument 1 continues separately on its
> own governance merits, and its approval does **not** by itself resume G3.
>
> **Board decision 2026-07-21: Review-A ACCEPTED · packet PARKED · revision authorization NOT YET
> GRANTED.** This document is **not reviewable in final form and must not be folded.** No revision
> may be drafted until the unblocking condition is met and authorization is granted.
>
> **Why this costs nothing to leave parked.** Production renders neutral `Template A`…`Template E`,
> is conformant, and is not waiting on this. The only thing deferred is what five templates are
> *called* — presentation copy for a picker whose Save is unwired, over a table that does not exist.
>
> | | |
> |---|---|
> | **Review-A verdict** | 🔴 REVISION REQUIRED — **BLOCKER 5 · MAJOR 11 · MINOR 7 · NIT 2 · OBS 5**; gate 0·0·0 NOT MET |
> | **Record** | `governanceReviews/ReviewA_Record_G3_TemplateSemantics_Amendment_Packet_v1.0.md` |
> | **Reviewed snapshot** | SHA-256 `e5627ee6321578125fd9fb4b4e7eff574c75d4088c4b9f4ebc072e9d823a7c8b` · blob `988de018cc1344a66a772a65ab903a291a16fea6`. This banner is a **status marking added afterwards** — no reviewed text was altered. |
> | **Unblocking condition** | `Governance_RankZero_Amendment_Mechanism` (**Instrument 1**) **approved AND folded** |
> | **Also required first** | **NAME RULING** on the theme-name collision (M1) — `Corporate` / `Modern` / `Industrial` are frozen THEME names at `Master…FINAL.md:568` and `ADR_Compendium_v1.md:1007` |
> | **Mandatory in any authorized revision** | **B3** (§B.2 does not mirror §A.2) · **B4** (§A.2 self-contradiction) · **B5** (additive vs replacing mislabel) |
> | **Coordination** | `governanceReviews/RankZero_Instruments_Coordination_Register_v1.0.md` |
>
> **Why parked.** This packet is a **rank-0 amendment drafted without knowledge that no rank-0
> amendment mechanism exists.** The Board ruled a structural split on 2026-07-21: the mechanism is
> **Instrument 1**, ruled and folded first. This packet invented its own fold route instead — the
> exact circularity that ruling exists to prevent. The §9A conclusion that either packet may fold
> first is **false**: neither may fold at all.
>
> **Everything below this banner is the reviewed v1.0 text, unmodified.** Do not read §6, §7 or §9A
> as live guidance — §B.3's "amendment in place" recommendation and §9A's independence conclusion
> are both superseded by this ruling.

---

**Two coordinated instruments · one Board decision · neither folds independently.**

| Field | Value |
|---|---|
| **Status** | **PROPOSED — DRAFT. Awaiting Review-A.** Not reviewed, not frozen, not folded. Carries no authority. |
| **Date** | 2026-07-21 |
| **Kind** | **Architecture amendment** — an additive **Master §8.4** patch (Instrument A) **+** an **ADR-020** amendment (Instrument B). This is *not* an additive naming register; the prior attempt to treat it as one was rejected (§0). |
| **Atomicity** | **ONE packet.** Instrument A and Instrument B must be approved, reviewed, frozen and folded **together**. Folding either alone leaves rank 0 and rank 1 contradicting each other. |
| **Requires** | **HUMAN Board approval** (`CLAUDE.md` §7 ranks 0–1 are immutable to all skills; §8 forbids AI modification of architecture or ADRs). An AI may draft this packet; only a human may approve or fold it. |
| **Supersedes** | The rejected `G3_Vendor_Profile_Template_Register_MINT_v1.0_PROPOSAL.md` (audit evidence only — never fold or cite it). |
| **Owner (post-fold subject matter)** | **M2 — Marketplace** (`marketplace.microsites`). The *instruments* amend rank-0/rank-1 documents and are therefore Board-owned. |
| **Gate** | Fold does not proceed at anything other than **BLOCKER 0 · MAJOR 0 · MINOR 0** (`CLAUDE.md` §13). |

---

## §0 — Why this packet exists

The owner-proposed template naming was previously drafted as an *additive naming register* on the
premise that the frozen corpus treated `layout_template` A–E as opaque slots. **That premise was
false.** Three independent adversarial Review-B reviewers found, and the finding was verified
directly:

`generatedDocs/Master_System_Architecture_v1.0_FINAL.md:569` (**rank 0, CANONICAL**), under
`### 8.4 Profile Experience Engine` (heading at `:560`):

> 2. **Layout Templates** — predefined structures: A Directory Style · B Engineering Company ·
>    C Manufacturer · D Service Company · E Corporate Microsite. Each defines hero, section, and
>    contact ordering.

`generatedDocs/ADR_Compendium_v1.md:1008` (**rank 1**, `# ADR-020: Vendor Experience & Profile
Presentation Layer`, Status: Approved) carries the same list:

> 2. **Layout Templates** — predefined structures: A Directory Style · B Engineering Company ·
>    C Manufacturer · D Service Company · E Corporate Microsite (each defines hero/sections/contact
>    order).

Both are **unamended** — swept 2026-07-21, no patch retires either. The proposed names are therefore
a **REMAP of rank-0 and rank-1 text**, which no lower-ranked instrument may perform. Hence this
packet.

**The substantive prize.** The frozen names are themselves **vendor business types** — "Engineering
Company", "Manufacturer", "Service Company". That is the precise collision Invariant #1 (capability
is a 4-flag matrix, not a label), FE-PUB-09 (vendor-type labels rejected) and the still-open
`ESC-MKT-VENDORTYPE` exist to prevent. Retiring them is a genuine architectural improvement — but it
must be **declared and reviewed as such**, not smuggled through as a naming register.

---

## §1 — INSTRUMENT A: Master System Architecture §8.4 Template Semantics Amendment

### A.1 — Exact text being replaced

**File:** `generatedDocs/Master_System_Architecture_v1.0_FINAL.md` · **§8.4 Profile Experience
Engine** (heading `:560`) · **component item 2**, at **line 569**, verbatim:

> `2. **Layout Templates** — predefined structures: A Directory Style · B Engineering Company · C Manufacturer · D Service Company · E Corporate Microsite. Each defines hero, section, and contact ordering.`

**Nothing else in §8.4 is touched.** Items 1, 3, 4, 5, 6, 7 and the entitlement paragraph at `:576`
stand unchanged.

### A.2 — Proposed replacement text

> 2. **Layout Templates** — five predefined presentation structures, identified by the frozen
>    `marketplace.microsites.layout_template` values and named by **visual layout style**:
>    **A Corporate Classic · B Modern Industrial · C Product Catalogue · D Portfolio & Projects ·
>    E Business Landing.** Each defines hero, section, and contact ordering. **A template names a
>    visual style, never a vendor business type**, and never restricts, infers, or records what kind
>    of business a vendor is. Which content a vendor leads with is governed separately by
>    `profile_sections` (`display_order` / `is_visible`), not by template identity. Availability of
>    templates to a subscription remains governed by the `template_access_level` entitlement (§8.4
>    gating paragraph) — an entitlement is not a vendor-type lock.

### A.3 — What Instrument A retires

| Retired | Replaced by |
|---|---|
| `A Directory Style` | `A Corporate Classic` |
| `B Engineering Company` | `B Modern Industrial` |
| `C Manufacturer` | `C Product Catalogue` |
| `D Service Company` | `D Portfolio & Projects` |
| `E Corporate Microsite` | `E Business Landing` |
| The **vendor-business-type naming axis** for layout templates | The **visual-layout-style** axis |

**NOT retired:** "Each defines hero, section, and contact ordering" is **carried forward verbatim**.
It is existing frozen behaviour; this packet neither strengthens nor weakens it, and does not
resolve how it interacts with `profile_sections` ordering (recorded as a carried question, §10).

---

## §2 — INSTRUMENT B: ADR-020 Amendment

### B.1 — Exact clauses being amended

**File:** `generatedDocs/ADR_Compendium_v1.md` · **`# ADR-020: Vendor Experience & Profile
Presentation Layer`** (Status: Approved) · **Components item 2**, at **line 1008**, verbatim:

> `2. **Layout Templates** — predefined structures: A Directory Style · B Engineering Company · C Manufacturer · D Service Company · E Corporate Microsite (each defines hero/sections/contact order).`

**No other ADR-020 clause is amended.** Specifically preserved unchanged: the Decision paragraph, the
**Content ≠ Presentation** core principle (`:998`), Components 1 and 3–7, the Ownership statement
(`:1003`, Profile Experience Engine → M2), the Subscription Integration entitlement table
(`:1019`–`:1026`), and the ADR-020 event catalog (`ADR_Compendium_v1.md:653`).

### B.2 — Proposed amended text

Mirrors A.2 exactly (the two documents must not diverge):

> 2. **Layout Templates** — five predefined presentation structures, identified by the frozen
>    `marketplace.microsites.layout_template` values and named by **visual layout style**:
>    **A Corporate Classic · B Modern Industrial · C Product Catalogue · D Portfolio & Projects ·
>    E Business Landing** (each defines hero/sections/contact order). A template names a visual
>    style, never a vendor business type. Section emphasis is governed by `profile_sections`;
>    template availability remains governed by `template_access_level`.

### B.3 — Amendment vs. superseding ADR

**Recommended: amendment in place** (a redline entry in the ADR Compendium's amendment apparatus,
the same mechanism as the existing redline §5 at `ADR_Compendium_v1.md:54`, which already modified
ADR-020's gating language from plan names to entitlement slugs). A superseding ADR would orphan six
unchanged components and the event catalog for a one-line change.

**The choice is the Board's, not this draft's** — recorded as the packet's single open question.

---

## §3 — What this packet proposes normatively

1. `A → Corporate Classic` · `B → Modern Industrial` · `C → Product Catalogue` ·
   `D → Portfolio & Projects` · `E → Business Landing`.
2. The canonical template axis is **visual layout style**.
3. **Vendor business type does not determine template identity.**
4. **Section emphasis remains governed through `profile_sections`** (`display_order` / `is_visible`).
5. **No vendor-type template lock** — no template is restricted, recommended-by-default, or inferred
   from what kind of business a vendor is.
6. **G4 retains single-page and canonical-route semantics.** This packet says nothing about how any
   template renders inside the route IA.
7. **The `A`–`E` enum itself is unchanged** — same five values, same order, same `DEFAULT 'A'`.
8. **No new aggregate, event, permission, or ownership boundary.** No schema, column, contract,
   POLICY key, page ID, state machine or route changes.

---

## §4 — Entitlement treatment (`template_access_level`)

**`template_access_level` is PRESERVED and remains fully effective.** Frozen at
`ADR_Compendium_v1.md:1021` and `Master_System_Architecture_v1.0_FINAL.md:576`:

> `| template_access_level | Enum | fixed_1 | standard_5 | all | custom |`

This packet **does not** state — and must never be read to state — that plans, tiers, or entitlements
cannot restrict template access. The rejected register said exactly that ("All five values remain
selectable by every vendor at all times. No plan, tier, entitlement, or capability flag gates any of
them"), and that was one of its BLOCKERs.

**The distinction this packet draws:**

| | Status |
|---|---|
| **Vendor-type template locking** — restricting or assigning a template because of what kind of business the vendor is (manufacturer, trader, service provider) | 🚫 **PROHIBITED.** Invariant #1, FE-PUB-09, `ESC-MKT-VENDORTYPE` |
| **Entitlement-based template availability** — a subscription making 1, 5, all, or custom templates available via `template_access_level` | ✅ **PERMITTED AND FROZEN.** Unchanged by this packet |

A Basic vendor seeing one template is **correct** frozen behaviour. A manufacturer being steered to
"Template C" *because it is a manufacturer* is prohibited. Any future change to the entitlement
mechanism requires a **separate ruling** and is out of scope here.

---

## §5 — Compatibility analysis

### §5.1 — Is any `layout_template` value persisted today?

**No. Verified 2026-07-21:**

| Check | Command / location | Result |
|---|---|---|
| `microsites` table exists? | `grep -rin "microsite" prisma/` | **0 hits** — no model, no migration, no table |
| Prisma models in `marketplace` schema | `grep -rc '@@schema("marketplace")' prisma/schema.prisma` | **0** |
| Migrations creating marketplace tables | `grep -rln "microsites" prisma/migrations/` | **none** |
| What the init migration does create | `prisma/migrations/00000000000000_init_schemas/migration.sql` | `CREATE SCHEMA IF NOT EXISTS "marketplace";` — **an empty schema shell only** |

### §5.2 — Does any implemented write path exist?

**No.**

| Check | Result |
|---|---|
| `create_microsite` / `update_microsite` implementation | **none** in `src/` or `app/` |
| `INSERT INTO marketplace.…` anywhere | **none** |
| `src/modules/marketplace/` contents | **5 files, contracts only** (`contracts/{events,index,services,types}.ts` + `marketplace.module.ts`) — no application, domain, or infrastructure implementation |
| Frontend | presentation-only; every write control disabled; **0 reads wired** |

### §5.3 — Disposition (scope-limited to what the evidence actually proves)

> ### ✅ **NO REPOSITORY-DEFINED MIGRATION IS CURRENTLY REQUIRED.**
> The repository defines no `microsites` table, no Prisma model, no migration and no write path, so
> **no migration can be authored from repository state** and no vendor choice recorded *through the
> application* can be lost. The rename is, as far as the repository is concerned, a pure
> documentation and presentation change.

**⚠️ This is NOT a claim that no data exists anywhere.** Repository evidence cannot prove the
negative for a deployed environment. Supabase permits tables and rows created **out of band** —
by SQL console, dashboard, seed script, restored dump, or manual QA — with no repository artifact.

**Binding pre-fold verification (MUST be executed by a human against every deployed environment
before fold or implementation, and its result recorded in this packet):**

1. Does `marketplace.microsites` **exist** in each deployed/staging/preview database?
   `select to_regclass('marketplace.microsites');`
2. If it exists, does it hold rows, and what `layout_template` values?
   `select layout_template, count(*) from marketplace.microsites group by 1;`
3. Any out-of-band writer — SQL console history, seed scripts, restored dumps, manual QA fixtures?

**Outcomes.** *No table or zero rows* → record "no data migration required" with the query output
and the environment list as evidence. *Rows exist* → a migration disposition is **mandatory** before
fold, and must state: every stored letter maps to **itself** (the enum is unchanged — only display
names change, so no stored value is rewritten), no vendor-visible selection changes meaning, and
each affected vendor's choice is preserved exactly.

**Timing.** This is the cheapest moment in the program's life to make this change, and the window
closes the day the M2 write path ships — but "cheap" is an argument for *scheduling*, never a
substitute for the environment check above.

### §5.4 — The database default is not a vendor selection

`Doc-6D_Content_v1.0_Pass2.md:152` freezes `layout_template … NOT NULL DEFAULT 'A'`, and
`Doc-4D_Content_v1.0_PassB_ProfileExperience.md:18` makes `layout_template` **`required`** on create,
so the default is not expected to fire on the contract path.

**Binding, unchanged by the rename:** when a read is absent or unread, presentation **MUST NOT**
display `Template A`, `Corporate Classic`, or any other template name as the vendor's selection. It
must render an explicit absence. `DEFAULT 'A'` is a **storage safeguard**, never a choice.

---

## §6 — Supersession record

| Question | Answer |
|---|---|
| Exact Master text replaced | `Master_System_Architecture_v1.0_FINAL.md:569`, §8.4 component item 2 (quoted verbatim, §A.1) |
| Exact ADR-020 clause amended | `ADR_Compendium_v1.md:1008`, Components item 2 (quoted verbatim, §B.1) |
| Prior **names** retired | Directory Style · Engineering Company · Manufacturer · Service Company · Corporate Microsite (§A.3) |
| Prior **ordering semantics** retired | **None.** "Each defines hero, section, and contact ordering" is carried forward verbatim |
| Prior **axis** retired | Vendor-business-type naming → replaced by visual layout style |
| `template_access_level` | **Remains effective and unchanged** unless altered by a separate ruling (§4) |
| Enum values / `DEFAULT 'A'` | **Unchanged** |
| Other ADR-020 clauses | **Unchanged** (Decision, Content ≠ Presentation, Components 1 · 3–7, Ownership, Subscription Integration, event catalog) |
| Rejected G3 register | Superseded; audit evidence only; never folded, never cited as authority |

---

## §7 — Atomicity and review sequence

```
this packet (draft)
→ Review-A                  (architecture & governance conformance)
→ accepted fixes
→ FREEZE                    SHA-256 + Git blob hash (untracked artifact)
→ Review-B                  (adversarial, on the frozen snapshot only)
→ accepted fixes → fix verification
→ HUMAN BOARD APPROVAL      (ranks 0–1 — never an AI act)
→ ATOMIC FOLD               Instruments A and B together, one records action
→ post-fold verification    by COMMIT hash + Authority Map + dependent pointers
```

**Do not fold either instrument independently.** **Do not run Review-B until Review-A findings are
fixed and the exact tree is frozen.** Gate: **BLOCKER 0 · MAJOR 0 · MINOR 0**.

---

## §8 — Review-method correction (binding on this packet's own reviews)

The rejected register passed a conformance sweep that could not have detected the conflict: it
searched the identifier `layout_template` (**5** corpus hits, all DDL/column-list/contract) and the
five *proposed* names (**0** hits — precisely *because* the conflicting mapping uses different
words). Ranks 0 and 1 write in **prose**; `A Directory Style` contains no such token.

**Semantic review of an enum MUST search all of:**

1. **identifier names** (`layout_template`, `microsite_layout`);
2. **literal enum values** (`'A'`…`'E'`) in context;
3. **human-readable prose names** (`Layout Templates`, `layout template`, and any candidate display
   names, including ones nobody proposed);
4. **rank-0 and rank-1 sources explicitly** — `Master_System_Architecture_v1.0_FINAL.md` and
   `ADR_Compendium_v1.md` — which identifier-scoped sweeps systematically skip;
5. **amendment and supersession records** — patches, redlines, ADR amendment tables.

Every sweep must state its exact commands and hit counts so the result is reproducible. An
unreproducible count is evidence the sweep was not re-run.

---

## §9 — Dependent pointers (verified at fold)

**Corpus (Board records action):** `Master_System_Architecture_v1.0_FINAL.md:569` ·
`ADR_Compendium_v1.md:1008` · `00_AUTHORITY_MAP.md` (rows for both instruments) · `CORPUS_INDEX.md`.

**Non-corpus, updated after the fold lands:** `app/(app)/_components/vendor/microsite/template-catalog.ts`
(neutral labels → approved names) · `microsite-builder.tsx` · `docs/product/requirements/digital_showcase_planning_and_design.md`
(G3 row `:263`, retracted verification block, disposition log) · `governanceReviews/DS-W2A-template-audit/…v0.2.md` ·
`prototypes/{digital-showcase-decisions,digital-showcase-workspace,vendor-profile-templates}/` (READMEs +
index pages — remove the `OWNER-PROPOSED — architecture amendment required` banners) ·
`project-management/fe-program-wbs.md` · `project-management/changelog.md`.

**Verification-only:** `docs/product/ux/page_inventory.md` · `esc_registry.md` (confirm whether
`ESC-MKT-VENDORTYPE` is materially advanced by retiring vendor-type template names — likely a
separate ruling).

---

## §9A — Relationship to the concurrent Master §4 vendor-type-preset amendment

A second rank-0 Master amendment is in flight in a parallel session:
`governanceReviews/MasterArchitecture_Inv1_VendorTypePreset_Amendment_PROPOSAL_v1.0.md`, which
amends **Master §4 Invariant 1** (`vendor_type_preset` value domain). **No textual collision** — that
packet touches §4; this one touches §8.4 item 2; verified: it contains **0** references to §8.4,
`layout_template`, or any layout-template name.

They remain **separate instruments**, but they are thematically adjacent (both concern vendor-type
semantics) and **Review-A must confirm all four of the following jointly**:

| # | Must hold | Where this packet stands |
|---|---|---|
| 1 | **Template identity never derives from vendor type** | §3.3, §3.5, §A.2, §B.2 — stated normatively in both instruments |
| 2 | **The vendor-type patch does not restore business-type templates** | Cross-check required: the §4 packet must not reintroduce Manufacturer/Engineering/Service as template identities. This packet retires exactly that axis (§A.3) |
| 3 | **This template patch does not resolve `ESC-MKT-VENDORTYPE`** | §10.5 — explicitly does not close it. Retiring vendor-type template *names* ≠ ruling the `vendor_type_preset` value domain |
| 4 | **Terminology and dependency ordering are consistent** | Neither packet depends on the other; either may fold first. Shared vocabulary: "vendor business type" (what a vendor is) vs "template identity" (how a profile is presented) must not drift between the two |

If the §4 packet were to assert a vendor-type → template relationship in any direction, that is a
**Flag-and-Halt** for both packets, not a local reconciliation.

## §10 — What this packet does NOT do

1. **Does not resolve G4** — single-page behaviour and canonical-route treatment stay open.
2. **Does not resolve G3A** — Business Landing still has no design artifact.
3. **Does not change `template_access_level`** or any entitlement semantics (§4).
4. **Does not change the enum, its values, `DEFAULT 'A'`, any schema, contract, event, permission,
   route, page ID, state machine, or ownership boundary.**
5. **Does not close `ESC-MKT-VENDORTYPE`** — retiring vendor-type template *names* is not the same as
   ruling the `vendor_type_preset` value domain.
6. **Does not resolve the carried question** of how "each defines hero, section, and contact
   ordering" (frozen, rank 0) interacts with `profile_sections` `display_order`/`is_visible`. Both
   exist in the frozen corpus today; this packet changes neither and raises the tension for a
   separate ruling.
7. **Does not itself amend anything.** It is a draft proposal requiring human Board approval.

---

*Drafted by an AI author under `CLAUDE.md` §8 — an AI may generate documentation and migration plans
and may NOT modify architecture or ADRs. This packet is a request for a human Board decision. It
carries no authority until approved, reviewed, and folded by a human records action.*

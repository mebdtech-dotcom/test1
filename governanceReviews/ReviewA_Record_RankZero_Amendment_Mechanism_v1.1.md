# ReviewA_Record_RankZero_Amendment_Mechanism_v1.1.md

> **Review record — Team-4 Review-A, round 2 (fresh reviewer, no prior involvement).**
> Subject: `governanceReviews/Governance_RankZero_Amendment_Mechanism_v1.1_PROPOSAL.md` (→ ADR-027).
> Raise ≠ Accept (`CLAUDE.md §13`): §1–§2 are the reviewer's findings **as raised**, preserved
> unedited. §3 records author verification only. **No adjudication — B-1 and M-9 concern conflicts
> with rank-0/rank-1 frozen documents and escalate to the human Architecture Board under
> `CLAUDE.md:198` (Flag-and-Halt); they must not be resolved locally.**
> Round 1 (against v1.0): `ReviewA_Record_RankZero_Amendment_Mechanism_v1.0.md`.

| Field | Value |
|---|---|
| Round | 2 · 2026-07-21 · **fresh reviewer**, not a continuation of the round-1 chain |
| Verdict | **🟠 REVISION REQUIRED** |
| Counts | **1 BLOCKER · 9 MAJOR · 7 MINOR · 2 NIT · 3 OBS** |
| Gate (`CLAUDE.md:225`) | **NOT MET** |
| Round-1 closure | **M-1, M-2, M-3, M-5, M-6, M-7, M-8, M-9, m-5, m-6, m-7, m-9, m-10, OBS-1 all genuinely applied.** *"The revision is substantive, not cosmetic."* |
| Reviewer's assessment | *"The problem is not the mechanism; it is the foundation. The document's own thesis is that first-instance status must be **proved**, not asserted — and the proof (§1.1) is incomplete in ways that would have changed both its premise and its precedent set."* |

---

## 1. BLOCKER

### B-1 · The load-bearing sweep is materially incomplete; "ranks 0 and 1 are SILENT" is not supportable — and one omitted rank-1 clause contradicts the instrument's core premise

*Instrument:* `v1.1:40–53` (§1.1 sweep table, 4 rows), `:33`, `:9–10`.

The sweep found four rows. Ranks 0 and 1 contain **at least six on-point statements it never
surfaced** — all independently re-verified by the author (§3):

| Omitted rank-0/1 text | Bearing |
|---|---|
| `ADR_Compendium_v1.md:20` — *"Nothing in this compendium introduces a new decision. **Where two approved texts conflicted, the later amendment wins and the reconciliation is recorded.**"* | **A rank-1 tiebreak between a base text and a later amendment.** §1.3:73–79 asserts base+overlay leaves *"no tiebreak"*; §4/G-1 declares precedence unresolved. Rank 1 states one. |
| `ADR_Compendium_v1.md:50–59` §B "Architecture Review Board Log (Consolidation Pass)" — eleven **Modify / Modify (reconcile) / Keep / Flag / Reject** verdicts applied to *approved* texts | A rank-1 record of a Board performing **non-additive modification of authoritative decisions during a consolidated re-issue** — a far closer precedent for RZ-1/RZ-3 than §2.1's PROVENANCE-level, never-executed citation. |
| `ADR_Compendium_v1.md:57` (§B item 9) — *"ADR-019 absent from corpus … **Number reserved. Do not backfill.**"* | Rank-1 precedent for **document-label reservation and non-reuse** — RZ-8, which §3:169 declares *"New binding rule … extension by analogy."* |
| `ADR_Compendium_v1.md:15, :17, :209, :265` — Status Approved/**Superseded**; amendments labeled *"so amendment provenance survives"*; in-band *"Superseded marker: ADR-005 v1 … Do not implement against v1"* | Rank-1 supersession vocabulary and **in-band marking practice** (see M-6). |
| `Master…FINAL.md:9` (`Supersedes` header) · `:1437` (*"All prior drafts, compendia, and closure packages are superseded for reading purposes by this document"*) · `:1431` (*"Consolidation rulings carried into this document"*) | **Rank 0 is itself a consolidated re-issue that superseded predecessors and carried reconciliation rulings** — the exact shape RZ-3 proposes, at rank 0, uncited. |
| `ADR-025…:57–59` — *"…**unless explicitly superseded by a later Board decision**"* | Rank-1 contemplation of explicit supersession by Board act. |

A narrower finding is defensible — *ranks 0 and 1 prescribe no **procedure** for amending an
already-frozen rank-0 canonical document.* That is not what `:53` says, nor what `:384` (*"there is
none to relax"*) and §1.4 depend on.

**Two independently gating consequences:**

1. **`ADR_Compendium_v1.md:20` must be reconciled or expressly distinguished** before §1.3 and
   §4/G-1 can stand. If *"the later amendment wins"* generalizes even weakly, the premise that
   additive overlays produce irresolvable contradiction — the entire justification for a
   non-additive route — is undercut. **Flag-and-Halt (`CLAUDE.md:198`), not local resolution.**
2. **The instrument fails the standard it invokes against v1.0.** `CLAUDE.md:197` requires anchors
   be programmatically confirmed; §1.1:42–44 faults v1.0 for exactly this. An asserted-and-stamped
   "SILENT" finding is *more* hazardous than v1.0's admitted absence, because every future amendment
   will cite §1.1 rather than re-derive.

---

## 2. MAJOR / MINOR / NIT / OBS (as raised)

| ID | Sev | Finding |
|---|---|---|
| **M-1** | MAJOR | RZ-3:281–282 *"the Authority Map is the only place that says which version is active"* is contradicted by `00_AUTHORITY_MAP.md:7–9` — *"If a status here disagrees with the actual document, **the document wins and this map is patched**."* Compounding: §1.2/§7.3 argue a NON-AUTHORITATIVE file can carry no authority, then RZ-3 vests *sole* determination of rank-0 canon in that same file. |
| **M-2** | MAJOR | RZ-1 condition 3 is a **universal negative** (*"no additive formulation exists"*) discharged by condition 4 with a **single** counter-example. Adversarial case run: renaming a permission slug in `Doc-2 §7` in place passes all four conditions and evades every exclusion — yet the corpus already did that class additively (`Doc-2_Patch_v1.0.5`, `00_AUTHORITY_MAP.md:55`). The test admits what the corpus proves is additively expressible. |
| **M-3** | MAJOR | §5's exclusion table declares four legacy folds *"reconciled, not contradicted … each was correctly additive"* (`:230–241`) — which **is** a reading conferred on existing base+patch sets, breaching §7.2:392–393 (*"no reading, tiebreak or precedence on any existing base+patch set"*). Legacy scope leaks in the section most likely to be cited. |
| **M-4** | MAJOR | §2:112 labels `Doc-4C_PassA_Patch_v1.0.1.md:38` as **FROZEN (patch)**. It is **unregistered in `00_AUTHORITY_MAP.md`** (zero rows); it appears only at `CORPUS_INDEX.md:65` as Doc-4C authoring history. Load-bearing: `:38` is the sole source of the Existing-Text/Amendment-Text grammar that RZ-3:269 and §6 step 1 make **normative**. The mislabel is the exact failure the authority-level column was added to prevent. |
| **M-5** | MAJOR | RZ-8:349–351's *"`Doc-4D` v1.0.1 **double-issue**"* is mischaracterized. Verified headers: PassA patch `Applies To: Doc-4D_Content_v1.0_PassA.md`; PassB patch `Applies To: Doc-4D_Content_v1.0_PassB.md`. **Two different base documents, each correctly at its own v1.0.1. No label was issued twice.** *(The rule may still be right; the actual support is that neither patch is Authority-Map-registered — a different fact, to be cited as such.)* |
| **M-6** | MAJOR | RZ-4 leaves rank-0 supersession recorded **solely** in a NON-AUTHORITATIVE, self-subordinating file, at a legend value that **does not exist** (§8 RZ-O2 OPEN), and forbids any in-band marker. A reader holding the superseded file has **no signal** it is no longer canon. Rank-1 practice shows an alternative: `ADR_Compendium_v1.md:209` carries an explicit in-band *"Superseded marker … Do not implement against v1"*. Separately: §9 lists RZ-O2 as an unmet RZ-4 dependency while asserting a 0·0·0 gate — a normative clause whose enabling registry value does not exist cannot fold. |
| **M-7** | MAJOR | §7.3:395–400 calls the `CLAUDE.md` update *"not a gate"* without naming `CLAUDE.md`'s own change control: `CLAUDE.md:3–5` self-stamps **FROZEN v1.3** — *"changes require an additive patch + version bump"* — and `Governance_Freeze_v1.0.md:8` covers *"the repository governance/orientation layer only"*, i.e. exactly the layer §7.3 changes. §2:133–135 withdrew that file from evidence for being out of corpus scope and thereby never noticed it governs the act. **"Non-authoritative" ≠ "uncontrolled."** Operationally: folding while `CLAUDE.md:192` still reads *"Never edit a FROZEN document"* would **manufacture a standing Flag-and-Halt** for every contributor and agent. |
| **M-8** | MAJOR | §3's coining enumeration is incomplete. Unlisted: *"Conversational approval authorizes drafting only"* (`:258–259`) — which **narrows** `ADR-024:18` (*"chat = the human-Board channel"*) cited as its authorizing precedent two lines earlier; the five "Normative posture" bullets (`:278–284`); *"No 'latest file wins'"* / *"No concurrent rank-0 canon"* — **precedence rules**, while §3:172 states *"Not coined … a base/patch precedence rule"* (direct self-contradiction); *"Every rank-0 amendment is a discrete Board act"* (`:386`). |
| **M-9** | MAJOR | §1.2's location survey is presented as exhaustive and is not. Unsurveyed: `ADR-024:44–46` (**rank 1, FROZEN**) — *"Because **the corpus is silent**, this is an **additive authoring** decision — not an override of any frozen clause."* — **the identical rhetorical move, resolved additively**, and both the instrument's best structural precedent and its strongest counter-argument, cited only for owner-as-Board. Also unsurveyed: `ADR-025:57–59`; `Doc-4D_Structure_Freeze_Gate_v1.0.md:191` (*"Amendment rule"* — a real if lower-rank procedure); `Doc-5A_Content_v1.0_Pass10.md:61` (domain/entity versions *"evolve only via corpus patch"*). The additive model is stated **above** the mirror layer, so §1.2's framing is wrong even if the rank-0 conclusion survives. |
| **m-1** | MINOR | §4:189 — `00_AUTHORITY_MAP.md:121` supports only the **46→47** leg, not the claimed "43→45→46→47" chain. |
| **m-2** | MINOR | RZ-1 has **no de-minimis / editorial exclusion**: a typo in a normative Master clause satisfies all four conditions ⇒ full Board re-freeze and complete re-issue of the Master. |
| **m-3** | MINOR | §1.1:51 calls `ADR_Compendium_v1.md:511` *"RFQ-scoped"* and never names **ADR-010** (`:495–523`), the rank-1 document-versioning ADR, whose scope is controlled *business* documents generally (`:506–508`). Conclusion survives; characterization of the most on-point rank-1 ADR must be exact. |
| **m-4** | MINOR | §1.2:59 / §2:101 cite `00_AUTHORITY_MAP.md:42` (**FROZEN** legend) as where the additive-only rule lives, without noting the rank-0 target is **CANONICAL** (`:41`) — which **carries no amendment rule at all**. The omission is *favourable* to the instrument; its absence weakens the audit trail. |
| **m-5** | MINOR | §2:115 / §6:374 cite `00_AUTHORITY_MAP.md:65` — a **single patch row** — as *"the corpus's existing chain"* for a normative six-step procedure. |
| **m-6** | MINOR | The instrument's own supersession of v1.0 was executed **by editing the superseded file in place** (banner + `Superseded by:` pointer) — the practice RZ-4 forbids and strikes. Not a rule breach (RZ-4 is rank-0-scoped), but undisclosed evidence that the program relies on in-band markers in practice, and a live demonstration of M-6's hole. |
| **m-7** | MINOR | Under-citation of **favourable** rank-0/1 evidence: `Master…FINAL.md:9` is stronger precedent for RZ-4 than the cited `Doc-2_…v1.0.2.md:9`; `00_AUTHORITY_MAP.md:54`'s *"human re-freeze"* is stronger for RZ-3 than §2.1's never-executed record. **That the instrument missed evidence in its own favour is corroborating proof of B-1.** |
| **n-1** | NIT | `:367` / `:105` cite `CLAUDE.md:233–238` / `:229–238`; **line 238 is blank**. Gate = 233–237; Raise ≠ Accept header at 228. |
| **n-2** | NIT | Instrument writes *"Existing Text"*; source term at `Doc-4C_PassA_Patch_v1.0.1.md:38` is *"**Existing Text Reference**."* |
| **O-1** | OBS | `Master…FINAL.md:12` — *"All architecture decisions recorded here are final and frozen … the agent must stop and flag the conflict rather than work around it."* Belongs in the §1.1 table; prescribes no procedure, so does not defeat the narrow finding. |
| **O-2** | OBS | **The instrument under-argues its strongest point.** RZ-3's route satisfies Invariant 8 on its **broadest** reading (*"versioned, never edited in place"*), so the narrow business-document scoping is *unnecessary*. The scoping **is correct** (`Master…:1184–1190`, `ADR-010:502–508` both enumerate Product/Procurement/Company), but Invariant 8's own sentence says *"Controlled documents"* unqualified — so the reading is more confident than the text alone supports, **and staking the argument on it invites the "too convenient" objection for no gain.** |
| **O-3** | OBS | **Red Flag Checklist, invariants, authority order, firewall, Content ≠ Presentation: no violation found.** RZ-4's prohibition on editing the superseded file keeps the instrument clear of *"Modify a FROZEN document."* RZ-3's re-issue is **adjacent**; the checklist routes adjacency to human escalation, which RZ-2 requires. `CLAUDE.md:149` correctly self-applied. |
| **O-4** | OBS | RZ-3 vs RZ-8 tension is reconcilable — label *allocation* by disk sweep is not authority *inference*. But `effective =` expressions and `*_SERIES_FROZEN_*` manifests live **outside** the Authority Map, a second reason RZ-3's exclusivity bullet cannot stand. |

---

## 3. Author verification of B-1 (no adjudication)

Every omitted anchor re-read from source 2026-07-21. **All six confirmed verbatim:**

- `ADR_Compendium_v1.md:20` — confirmed, verbatim as quoted.
- `ADR_Compendium_v1.md:48–59` — confirmed: eleven-row Board log, verdict column reads Modify ×5,
  Modify (reconcile) ×2, Modify (editorial) ×2, Flag, Keep, Reject.
- `ADR_Compendium_v1.md:57` — confirmed: *"Number reserved. Do not backfill."*
- `Master_System_Architecture_v1.0_FINAL.md:9` — confirmed: `Supersedes | Master System Architecture
  Draft v0.1; ADR Compendium v1 (for reading purposes); Architecture Closure Package v0.3.2 (for
  reading purposes)`.
- `Master…FINAL.md:1431`, `:1437` — confirmed verbatim.
- `ADR-024_Canonical_Vendor_Subdomain_URLs.md:44–46` — confirmed verbatim.

**Author's note of record, not a ruling:** the omitted evidence cuts **both** ways. `Master…:9`,
`:1431`, `:1437` and `ADR_Compendium §B` show **rank 0 and rank 1 were themselves produced by
consolidated re-issue with Modify verdicts** — materially *stronger* precedent for RZ-3 than
anything v1.1 cites, and grounds for reframing the instrument from *first-instance* to *codifying an
existing but unwritten practice*. `ADR_Compendium:20` and `ADR-024:44–46` cut the other way.
**Both directions are for the Board, not the author (`CLAUDE.md:198`).**

**Pattern flagged for the Board:** this is the third consecutive artifact in this program in which
the author asserted a corpus-absence conclusion without an exhaustive rank-0/1 sweep
(Instrument 2 round 1; Instrument 1 v1.0 **B-1**; Instrument 1 v1.1 **B-1**). The defect is
recurrent and method-level, not incidental.

---

## 4. Board adjudication — 2026-07-21

Recorded **alongside** the preserved findings; §1–§2 unaltered. All nine MAJOR findings **ACCEPTED**.

### B-1 — ACCEPTED

The *"ranks 0 and 1 are silent"* thesis is **disproven**; the omitted evidence materially changes the
instrument's foundation.

**`ADR_Compendium_v1.md:20` generalizes only to the approved Architecture/ADR consolidation
context.** It establishes:

> When approved texts conflict during an authorized consolidation, the later approved amendment
> controls and the reconciliation is recorded.

It does **not** establish *"any later patch automatically overrides any earlier frozen base."* The
broader reading would leave undefined: what *"later"* means · whether the amendment must be
Board-approved · whether rank must match · whether an unregistered patch qualifies · how overlapping
amendments are ordered · whether the rule extends beyond the consolidation set.

```
ADR_Compendium_v1.md:20
  = authoritative consolidation precedent
  ≠ generic latest-overlay-wins mechanism
```

**Generic latest-overlay-wins: REJECTED.**

### G-1 — reclassified

> **G-1 — Legacy base/patch precedence. Status: OPEN, PARTIALLY INFORMED.**
> **Known:** the Architecture/ADR consolidation resolved conflicting approved texts by applying the
> later amendment and recording the reconciliation.
> **Unknown:** whether and how that rule governs later `effective =` base-plus-patch sets such as
> Doc-6C.
> **ADR-027:** does not resolve those legacy sets retroactively.

### Reframing — first-instance framing WITHDRAWN

ADR-027 is **not** first-instance, and **not** merely an exception to an additive-only rule. Correct
posture: **ADR-027 codifies and standardizes an existing corpus practice.** Rank 0 and rank 1 already
demonstrate Board reconciliation of approved texts · Modify and Modify-reconcile verdicts ·
consolidated re-issuance · carrying rulings into a complete canonical document · supersession of
earlier artifacts · non-backfill of reserved labels. What is missing is a **complete prospective
procedure** for applying that practice to a future amendment of an already-frozen rank-0 document.
Thesis of record:

> The Master Architecture and ADR Compendium demonstrate an approved consolidation-and-reissue
> practice in which reconciliation rulings were carried into a complete canonical artifact and prior
> approved artifacts were superseded. The corpus does not, however, state a complete prospective
> procedure for initiating, reviewing, executing, registering, and activating future amendments to an
> already-frozen rank-0 canonical document. ADR-027 codifies that demonstrated practice without
> creating a generic latest-overlay-wins rule or retroactively resolving legacy effective-patch sets.

### M-2 — admissibility test REMOVED

The four-condition test is **deleted**. *"No additive formulation exists"* is practically impossible
to prove; nearly any correction can be expressed as an overriding overlay. The correct trigger is
**semantic, not syntactic**. ADR-027 applies when an approved Board act changes **active rank-0
meaning** through: replacement · removal · renaming · re-keying · correction · reconciliation ·
consolidation. It does **not** apply to: editorial corrections that do not change canonical meaning ·
non-authoritative guidance · derived indexes corrected toward unchanged higher authority · lower-rank
implementation documents · legacy overlay reconciliation unless separately authorized.

> Decisive question: **does the act change the active meaning of rank-0 canon?**
> Not: *could somebody technically express it as an additive patch?*

### M-7 — `CLAUDE.md` synchronization is a MANDATORY EFFECTIVENESS GATE

The reviewer is correct: *"non-authoritative" does not mean uncontrolled.* `CLAUDE.md` is a frozen
operational control surface; leaving its prohibition unchanged would create a recurring Flag-and-Halt
for every contributor and AI agent. ADR-027 may be reviewed and approved first, but **must not become
effective** until the synchronization bundle is complete: ADR-027 folded · `CLAUDE.md` additive patch
· `CLAUDE.md` version bump · governance/orientation freeze procedure · Authority Map synchronization ·
required index synchronization. Synchronized wording of record:

> Never edit a FROZEN document in place. A rank-0 canonical document may be superseded only through
> the Board-approved ADR-027 amendment-and-reissue procedure. The superseded artifact remains
> unchanged.

### Remaining dispositions

| ID | Ruling |
|---|---|
| **M-1** | Remove the claim that the Authority Map alone determines the active version. **The document is primary; the map is a synchronized pointer.** |
| **M-3** | Remove all statements interpreting legacy folds as *"correctly additive"* or already reconciled. |
| **M-4** | Do not use the unregistered Doc-4C authoring patch as **normative authority** for amendment grammar. |
| **M-5** | Remove the false Doc-4D double-issue argument; the next-unused-label rule must be supported **independently**. |
| **M-6** | Supersession must not depend solely on an undefined Authority Map status. Use: new canonical artifact carries `Supersedes: <prior artifact>` · an **authoritative adoption/reissue record** (old = historical, new = active, effective date, verification result) · Authority Map = synchronized pointer. **Do not mutate the old frozen artifact.** |
| **M-8** | Rebuild the coining section, separating **existing precedent** (consolidated re-issue · reconciliation of approved texts · supersession · reserved-label non-backfill · Board modification decisions) from **new procedural standardization** (trigger · review chain · execution gates · activation conditions · registry rules · immutable historical artifact rule · legacy-scope exclusion · effectiveness synchronization). |
| **M-9** | Expand the evidence survey to include ADR-024, ADR-025, ADR-010, the Master supersession clauses, and all directly relevant amendment language. |
| **m-1 … m-7, n-1, n-2** | Accepted; mechanical. |
| **O-2** | Adopt — make the scope-independent Invariant 8 argument; do not stake the case on the narrow business-document scoping. |

### Method-level ruling — binding on ALL future governance artifacts

No governance artifact may state **SILENT · ABSENT · NO PRECEDENT · FIRST-INSTANCE** unless it
carries all six: (1) full rank-0 conceptual sweep · (2) full rank-1 conceptual sweep · (3) synonym
and mechanism searches · (4) evidence both **supporting and contradicting** the claim · (5) an
explicit sweep boundary · (6) **independent verification of the negative claim**. Otherwise use
bounded language:

> Within the sources enumerated below, no complete prospective procedure was identified.

---

## 5. Status

**Not folded. Not approved. No file modified by the review.** Adjudication pending; **B-1 and M-9
escalate to the human Architecture Board** and must not be resolved locally. The parked vendor-type
amendment is untouched.

⚠️ **Carried to Instrument 2 when it unparks:** round-2 **M-5** shows the *"`Doc-4D` v1.0.1 issued
twice"* premise — which also underpins round-1 **MAJ-1** on the register proposal — is
mischaracterized (the two v1.0.1 patches apply to **different base documents**). The v1.0.4
conclusion may still hold via the series-level v1.0.2/v1.0.3 patches, but the reasoning must be
re-derived, not inherited.

---

## 5. Board adjudication (human Architecture Board, 2026-07-21)

> Recorded per Raise ≠ Accept (`CLAUDE.md:228`): §1–§4 above are the reviewer's findings **as
> raised** and are preserved unedited. This section is the Board's ruling on them. B-1 and M-9
> concerned rank-0/rank-1 conflicts and were escalated under Flag-and-Halt (`CLAUDE.md:198`); the
> Board — not the author or the reviewer — has now resolved them.

### 5.1 B-1 — **ACCEPTED**

The *"ranks 0 and 1 are SILENT"* thesis is **disproven**. The omitted evidence materially changes
the instrument's foundation. The reviewer correctly halted at the Board boundary.

**Ruling on `ADR_Compendium_v1.md:20`** — it generalizes **only to the approved Architecture/ADR
consolidation context**. It establishes this precedent:

> When approved texts conflict during an authorized consolidation, the later approved amendment
> controls and the reconciliation is recorded.

It does **not** establish: *"any later patch automatically overrides any earlier frozen base."*
The broader reading would leave undefined what *"later"* means · whether the amendment must be
Board-approved · whether rank must match · whether an unregistered patch qualifies · how
overlapping amendments are ordered · whether the rule extends beyond the consolidation set.

```
ADR Compendium :20
  = authoritative consolidation precedent
  ≠ generic latest-overlay-wins mechanism
```

**Generic latest-overlay-wins: REJECTED.**

### 5.2 Reframing — first-instance framing **WITHDRAWN**

ADR-027 is **not** first-instance, and is also not merely an exception to an additive-only rule.
The accurate posture: **ADR-027 codifies and standardizes an existing corpus practice.** The Master
Architecture and ADR Compendium already demonstrate Board reconciliation of approved texts, Modify
and Modify-reconcile verdicts, consolidated re-issuance, carrying rulings into a complete canonical
document, supersession of earlier artifacts, and non-backfill of reserved labels. What is missing is
a complete **prospective procedure** for amending an already-frozen rank-0 canonical document.

### 5.3 G-1 — reclassified **OPEN, PARTIALLY INFORMED**

```
Known:    The Architecture/ADR consolidation resolved conflicting approved texts
          by applying the later amendment and recording the reconciliation.
Unknown:  Whether and how that rule governs later "effective =" base-plus-patch
          sets such as Doc-6C.
ADR-027:  Does not resolve those legacy sets retroactively.
```

### 5.4 Rulings on the nine MAJOR findings — **all ACCEPTED**

| ID | Board disposition |
|---|---|
| **M-1** | Remove the claim that the Authority Map alone determines the active version. **The document is primary; the map is a synchronized pointer.** |
| **M-2** | **Delete the admissibility test.** *"No additive formulation exists"* is practically impossible to prove — nearly any correction can be expressed as an overriding overlay. The trigger must be **semantic, not syntactic** (§5.5). |
| **M-3** | Remove all statements interpreting legacy folds as *"correctly additive"* or already reconciled. |
| **M-4** | Do not use the unregistered `Doc-4C` authoring patch as **normative authority** for amendment grammar. |
| **M-5** | Remove the false `Doc-4D` double-issue argument. The next-unused-label rule must be supported **independently**. |
| **M-6** | Supersession must not depend solely on an undefined Authority Map status. Use: new canonical artifact carries `Supersedes: <prior artifact>` · an **authoritative adoption/re-issue record** (old = historical, new = active, effective date, verification result) · Authority Map as a **synchronized pointer**. **Do not mutate the old frozen artifact.** |
| **M-7** | **ACCEPTED — and elevated to a gate.** *"Non-authoritative" does not mean uncontrolled.* `CLAUDE.md` is a frozen operational control surface; leaving its prohibition unchanged would manufacture a recurring Flag-and-Halt for every contributor and agent (§5.6). |
| **M-8** | Rebuild the *"What this instrument coins"* section, separating **existing precedent** from **new procedural standardization**. |
| **M-9** | Expand the evidence survey to include **ADR-024, ADR-025, ADR-010**, the Master supersession clauses, and all directly relevant amendment language. |

### 5.5 M-2 replacement — the semantic trigger

ADR-027 **applies** when an approved Board act changes active rank-0 meaning through:
`replacement · removal · renaming · re-keying · correction · reconciliation · consolidation`.

It **does not apply** to: editorial corrections that do not change canonical meaning ·
non-authoritative guidance · derived indexes corrected toward an unchanged higher authority ·
lower-rank implementation documents · legacy overlay reconciliation unless separately authorized.

```
Decisive question:  Does the act change the active meaning of rank-0 canon?
NOT:                Could somebody technically express it as an additive patch?
```

### 5.6 M-7 — `CLAUDE.md` synchronization is a **MANDATORY EFFECTIVENESS GATE**

ADR-027 may be reviewed and approved first, but **must not become effective** until the
synchronization bundle is complete: ADR-027 folded · `CLAUDE.md` additive patch · `CLAUDE.md`
version bump · governance/orientation freeze procedure · Authority Map synchronization · required
index synchronization.

Board-directed synchronized wording for `CLAUDE.md`:

> Never edit a FROZEN document in place.
>
> A rank-0 canonical document may be superseded only through the Board-approved ADR-027
> amendment-and-reissue procedure. The superseded artifact remains unchanged.

### 5.7 Method-level ruling — absence-claim drafting control

The recurrent absence-claim failure (three consecutive artifacts, §3) requires a formal drafting
control. **No future governance artifact may state `SILENT` / `ABSENT` / `NO PRECEDENT` /
`FIRST-INSTANCE`** unless it includes: (1) a full rank-0 conceptual sweep · (2) a full rank-1
conceptual sweep · (3) synonym and mechanism searches · (4) evidence **supporting and
contradicting** the claim · (5) an explicit sweep boundary · (6) independent verification of the
negative claim. Absent all six, bounded language is mandatory:

> Within the sources enumerated below, no complete prospective procedure was identified.

### 5.8 MINOR / NIT / OBS

The Board's ruling addressed B-1 and M-1…M-9. **m-1…m-7 and n-1…n-2 are not Board-ruled**; they are
factual-accuracy corrections applied by the author under the four-question gate (`CLAUDE.md:233–237`)
and are re-presented for confirmation at the next independent review — they are **not** recorded here
as Board dispositions. O-1…O-4 require no action; **O-3 records no Red-Flag, invariant, authority-order,
firewall or Content ≠ Presentation violation.**

### 5.9 Final disposition

```
B-1                          ACCEPTED
ADR Compendium :20           Consolidation-scoped precedent only
Generic latest-overlay-wins  REJECTED
ADR-027                      Reframe as codification of demonstrated practice
First-instance framing       WITHDRAWN
G-1                          OPEN, PARTIALLY INFORMED
M-2 admissibility test       REMOVE
CLAUDE.md synchronization    MANDATORY EFFECTIVENESS GATE
Vendor-type amendment        REMAINS PARKED
```

**Next:** v1.2 drafted against this adjudication, then a fresh independent Review-A. The carried
`Doc-4D` version premise must be **re-derived**, not inherited, when Instrument 2 unparks.

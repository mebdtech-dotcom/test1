# iVendorz — Governance Layer Freeze v1.0

| Field | Value |
|---|---|
| **Marker** | `governance-frozen-v1` |
| **Date** | 2026-06-27 |
| **Authority** | NON-AUTHORITATIVE under the frozen corpus. On any conflict, `generatedDocs/00_AUTHORITY_MAP.md` and the frozen documents win. |
| **Scope** | The repository **governance/orientation layer** only — *not* the frozen architecture corpus (`generatedDocs/`), which is independently frozen. |

> This record freezes the **governance architecture** (which document owns which responsibility),
> v1.0. It does not freeze content: the governance files remain non-authoritative under the frozen
> corpus and are patched to match it. Changes to the ownership model require an additive patch + a
> version bump (v1.1, …), never a silent edit.

---

## Ownership model (frozen v1.0)

Every governance responsibility has exactly one owner.

| Responsibility | Owner |
|---|---|
| Authority order · AI behavior · review philosophy · **severity taxonomy** (BLOCKER/MAJOR/MINOR/NITPICK/OBS) · **Validate Findings gate** · **Raise ≠ Accept** · red-flag checklist | `CLAUDE.md` — **Governance Constitution** |
| Repository layout, module shape, boundaries, forbidden patterns | `repository_structure.md` — **Structural Constitution** |
| Implementation execution · merge lifecycle · technical-audit gates (Wave Integration/Exit, DoR/DoD) | `generatedDocs/Build_Roadmap_v1.0.md` |
| Work decomposition (WP structure, dependency graph, sequencing) | `generatedDocs/Development_Decomposition_v1.0.md` |
| Per-document authority & status | `generatedDocs/00_AUTHORITY_MAP.md` |
| Live program ledger / work queue | `generatedDocs/Program_Status_And_Roadmap.md` |
| Corpus navigation | `generatedDocs/CORPUS_INDEX.md` |
| What the system is | `README.md` · `project_details.md` |
| Reading order / entry point | `IMPLEMENTATION_START_HERE.md` |
| Architecture / domain / API / schema / state / events | Frozen corpus (Doc-2…Doc-8) — immutable |

---

## What changed at freeze (the v1.0 refactor)

- `CLAUDE.md` reframed as the **Governance Constitution**; added **§13 Review & Findings
  Governance** (severity ladder + Validate Findings gate + Raise ≠ Accept + review philosophy,
  codifying existing Hard-Review/Freeze-Audit practice; coins nothing); §9 stripped of volatile
  status narrative and pointed at the status single-source-of-truth.
- `repository_structure.md` relabeled the **Structural Constitution**.
- Status drift eliminated: `README.md` status → pointer; `00_PROJECT_STATUS.md`, `ROADMAP.md`,
  root `iVendorz_New_Chat_Primer.md` → redirect stubs (the repo's established supersede pattern).
- No frozen corpus document was modified.

---

## Amendment rule

Reopening the ownership model = additive patch (`Governance_Freeze_v1.1.md`, …) + bump the
`FROZEN vX.Y` stamp in `CLAUDE.md` and `repository_structure.md`. The Authority Order and frozen
corpus (ranks 0–1) remain immutable to all skills; architecture-affecting changes require human
approval.

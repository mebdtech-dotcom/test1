# REPOSITORY_STRUCTURE v1.0 → v1.1 — Additive Patch PROPOSAL

**Date:** 2026-07-06 · **Status:** PROPOSAL — awaiting owner Board approval (Gate G1)
**Target:** `REPOSITORY_STRUCTURE.md` (Structural Constitution, FROZEN v1.0 under `governance-frozen-v1`)
**Mechanism:** the sanctioned one — *"changes require an additive patch + version bump"* (CLAUDE.md header). On approval, the §Patch Text below is **appended** as a terminal section; only two header fields change (`Version: v1.1`; Status line gains `additively patched v1.1`). **No v1.0 prose is rewritten.** This proposal doc remains in `governanceReviews/` as the record (precedent: `Doc-2_*_Additive_Patch_PROPOSAL.md`).
**Authority pointers (reference-never-restate):** Doc-2 (schema map — supreme for F-01) · frozen Doc-7 series (frontend kit shape) · `Build_Roadmap_v1.0.md` §2 (route-group scaffold incl. `(auth)`) · CLAUDE.md §3 (module/schema names).
**Basis:** `Repo_Structure_Conformance_Audit_v1.0.md` findings F-01…F-15.

---

## Patch Text (to be appended verbatim on approval)

> ## Additive Patch v1.1 — Documentation Consolidation (Board-approved YYYY-MM-DD)
>
> ### Version history
>
> | Version | Date | Change |
> |---|---|---|
> | v1.0 | 2026-06-23 (frozen 2026-06-27) | Original Constitution |
> | v1.1 | YYYY-MM-DD | Documentation Consolidation (this patch) |
>
> This table is maintained additively by every future patch.
>
> ### P-1 · Erratum — M6 module folder name
> §4's label `comms/` is **superseded**. The canonical M6 folder and schema name is `communication`, bound by pointer to the frozen Doc-2 schema map and CLAUDE.md §3 (this patch coins nothing). Resolution direction follows this document's own conflict clause ("the frozen document wins; content is patched to match"). The on-disk module `src/modules/communication/` was always conformant; it is never renamed. Companion: the `comms` cell in `project_details.md` §3 is patched to match (that document's charter is patched-to-match).
>
> ### P-2 · §8 addendum — App Router route groups
> The route-group set is `(public)/ · (auth)/ · (app)/ · api/`. `(auth)` is authorized by pointer to `Build_Roadmap_v1.0.md` §2 (Wave-0 scaffold list). **`(admin)/` is retired** per the owner-frozen `governanceReviews/URL-NAMING-SEO-REVIEW-ADJUDICATION_v1.0.md` OBS-03 (ACTIONED, commit `a9de258`): the admin surface lives at `(app)/admin/` (route groups are non-URL; no URL is affected). This patch **sanctions the matching closed-list update** in `scripts/check-structure.mjs` (`ROUTE_GROUPS` minus `(admin)`), restoring the ratified gate to GREEN — the script's "coins nothing; closed list" charter requires exactly this Board sanction. *(Alternative recorded per audit F-02(b): reinstating the placeholder instead would reverse the frozen OBS-03 disposition and require reopening that adjudication — the owner rules at G1 ask ③.)* Nested route groups (e.g. `(app)/(buyer)`) and area folders (`account/`, `admin/`, `workspace/`) are **composition detail** outside constitutional scope — the binding rule remains §8's "routing and composition only."
>
> ### P-3 · `src/frontend/`
> Registered as an existing top-level `src/` area (the platform frontend kit). Its internal shape is owned by the **frozen Doc-7 series** by pointer; this constitution remains silent on its internals — v1.0's "reserved for Doc-7" is hereby fulfilled, not restated.
>
> ### P-4 · Directory registry
> The following top-level areas are registered (all documentation areas are non-authoritative under the frozen corpus):
>
> | Area | Purpose | Owner (pointed, not coined) | Mutability |
> |---|---|---|---|
> | `generatedDocs/` | Frozen architecture corpus | Architecture authority per §7 | ❌ frozen (additive patches only) |
> | `governanceReviews/` | Audit history, Board records, proposal provenance | Governance (§13 process) | **Append-only archive.** PINNED: existing records never relocate — frozen documents reference them by path (audit F-15). New-artifact taxonomy per the G1 ruling. |
> | `docs/` | Living engineering & product documentation (`README.md` = philosophy + this Ownership Matrix; `INDEX.md` = navigation map; `architecture/ product/ frontend/ backend/ testing/ governance/ adr/ reference/`) | Engineering | ✅ |
> | `project-management/` | Execution tracking (FE-PM ledger) | Delivery | ✅ |
> | `prompts/` | AI prompt library | Engineering | ✅ |
> | `design/` | **Design source files only** (figma/exports/assets). Rule: `design/` = sources; `docs/frontend/` = engineering documentation. | UX | ✅ |
> | `templates/` | Recurring document templates (first artifact: `execution-checklist.md`) | Engineering | ✅ |
> | `examples/` | Onboarding/AI reference examples | Engineering | ✅ |
> | `prototypes/` | Quarantined standalone experiments; excluded from root build gates | Engineering | ✅ |
> | `tools/` | Reserved name (no content yet) | Engineering | reserved |
>
> **Reserved-Directory rule:** *Reserved directories are part of the approved taxonomy but are created only when they receive their first committed artifact.* Directories materialize with a README charter or first content — never as empty scaffolding.
>
> **`docs/adr/` note:** reserved ONLY for engineering implementation notes and future RFCs. The authoritative ADR corpus remains under `generatedDocs/`; nothing is duplicated.
>
> ### P-5 · Root-file policy
> Root contains only: `README.md` · `CLAUDE.md` · `REPOSITORY_STRUCTURE.md` · `IMPLEMENTATION_START_HERE.md` · `project_details.md` · `CONTRIBUTING.md` (if sanctioned) · `LICENSE` (owner-provided only) · `repo.manifest.json` (if sanctioned — **generated metadata**, derived from this registry and regenerated on every structure change via `scripts/build-repo-manifest.mjs`; never an independently maintained source of truth) · standard tool/config files and the canonical lockfile · **pinned exceptions** whose paths are cited by frozen documents and therefore cannot move: `esc_registry.md`, `ROADMAP.md`, `00_PROJECT_STATUS.md`, `iVendorz_New_Chat_Primer.md`, `Wave_Template_v1.0.md`, `Governance_Freeze_v1.0.md`.
> `project_details.md`: relocation to `docs/reference/` is **registered as deferred** (frozen-mentioned; constitutional §2 entry) — a future additive patch executes it.
> **Rule:** any NEW root file requires Board approval. Loose documents live in registered documentation areas, never at root.

---

## Out of scope (explicitly)

- No change to §1 governing constraints, §3 module shape, §5–§7, §9 Forbidden Patterns, §10 CI enforcement.
- No module rename, no ownership change, no new module (Red-Flag Checklist honored).
- `generatedDocs/README.md` warning file and `CONTRIBUTING.md` are **separate G1 asks** (packet ⑥/⑦), not part of this patch's text.

## Application procedure (C6, post-approval)

1. `git mv repository_structure.md REPOSITORY_STRUCTURE.md` (case fix, audit F-05).
2. Append the Patch Text above with the approval date; update the two header fields.
3. Patch the `comms` cell in `project_details.md` §3 → `communication`.
4. Companion (C7): update the CLAUDE.md §10 layout mirror (its charter is patched-to-match; it is not frozen corpus).

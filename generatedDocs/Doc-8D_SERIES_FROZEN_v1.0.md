# Doc-8D — Persistence, Migration & RLS Conformance Suite — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-8D Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8D = the **defining suite** (Doc-8A allocation) for the RLS positive/negative/cross-tenant byte-equivalence gate (`CHK-8-024`, invariant #11) + immutability (`CHK-8-022`, invariant #8); consumes the frozen **Doc-8B harness** by pointer |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0 §6` + Appendix A bands **A** + **C** (`CHK-8-020…025`). **Oracle:** the realized Doc-6 schema (`Doc-6B core` · `Doc-6C identity` · `Doc-6D marketplace` FROZEN; `6E…6K` as they freeze) + `Doc-6A R5/§5/R8/§4/§6/R9/§11`; `Doc-2 §6/§0.3/§0.4`; Invariant #8/#11. Consumes `Doc-8B` (incl. DB-role/schema-reset path) by pointer |
| Authority | `Doc-8A` governs; the frozen Doc-6 schema + Doc-2 + CLAUDE.md §2 are the oracle. Doc-8D **coins nothing** — a red test = code/schema defect, or `[ESC-8-CORPUS]` (never weaken) |
| Freeze evidence | `Doc-8D_Structure_Freeze_Audit_v1.0.md` (PASS) + `Doc-8D_Content_Freeze_Audit_v1.0.md` (APPROVE; 8 dimensions PASS; 0 open BLOCKER/MAJOR/MINOR) |

---

## Effective set (the authoritative Doc-8D)

| Artifact | Role |
|---|---|
| `Doc-8D_Structure_v1.0_FROZEN.md` | Frozen structure — D1 (schema-inventory-driven) + D2 (mandatory RLS byte-equivalence band) + D3 (execution-readiness), §0–§7 |
| `Doc-8D_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-8D_Content_v1.0_Pass1.md` (+ `Pass1_Patch_v1.0.1`) | §0–§3 — control · schema/RLS inventory · schema-constraint · immutability (#8 defining) |
| `Doc-8D_Content_v1.0_Pass2.md` (+ `Pass2_Patch_v1.0.1`) | §4–§7 — migration · RLS positive/negative/cross-tenant byte-equivalence gate (#11 defining) · cross-module integrity · conformance |
| `Doc-8D_Content_Freeze_Audit_v1.0.md` | Content freeze certification (APPROVE) |

**`CLAR-8D-1` (clarification, folded-in):** the structure's D3/§5 "marketplace-visibility facet of byte-equivalence" is more precisely **general visibility RLS (ready now — `Doc-6D` tri-actor publish-state)**, **distinct from** the **Invariant-#11 byte-equivalence proper (blacklist undetectable), which is the buyer-private case** (`buyer_vendor_statuses`, M4/`Doc-6F`) — **entirely execution-deferred** until `Doc-6F` freezes. `Doc-6D` froze with no `buyer_private` coined. Additive clarification; no frozen document edited.

*(No `Doc-2`/`Doc-6` patch was required to freeze Doc-8D — it coins nothing. A genuine schema/corpus defect surfaces at execution as `[ESC-8-CORPUS]`.)*

---

## What Doc-8D fixes (the persistence/RLS conformance suite)

- **D1 schema-inventory-driven** — inventory **derived from the frozen Doc-6 DDL** (`core` 5 + `identity` 9 + `marketplace` 21 = 35 tables as of freeze, dynamic as `6E…6K` freeze); **completeness ≡ frozen DDL** (catches migration/schema drift the migration cannot self-detect).
- **Band C checks:** schema-constraint (`CHK-8-020`: standard columns, partial-unique `WHERE deleted_at IS NULL`, CHECK) · multi-currency (`CHK-8-021`: `NUMERIC`+currency, default BDT) · **immutability (`CHK-8-022`, #8 defining**: soft-delete DB facts, versioned/append-only/column-scoped CR4′, ai.* TTL the sole exception; "IDs never reused" asserted indirectly) · migration (`CHK-8-023`: forward-only / expand-contract-non-destructive / seed / codegen — execution-deferred) · **RLS gate (`CHK-8-024`, #11 defining, MANDATORY)** · cross-module integrity (`CHK-8-025`: no cross-schema FK, bare-UUID, orphan-scan).
- **The RLS gate (`CHK-8-024`):** **positive** (per frozen `Doc-6D` tri-actor RLS) · **negative = the RLS backstop** (DB denies with the app bypassed — 8C owns the app-surface per the §8 seam) · **cross-tenant** (org A's DB role never sees org B; no cross-schema RLS traversal) · **#11 byte-equivalence** (observer's-view: blacklisted ≡ never-matched — buyer-private, `Doc-6F`, **execution-deferred**; single-sourced criterion, composed by 8C/8F/8G).
- **8D is the defining suite for #8 and #11** (Doc-8E references; 8C/8F/8G compose). `DR-8-RLS` satisfied.
- **Authored-not-run + D3 readiness:** ready now (`core`/`identity`/`marketplace` constraints, immutability, org/public RLS); deferred (grantee RLS → `Doc-6E`; **#11 buyer-private byte-equivalence → `Doc-6F`**; migration/codegen code); none silently dropped.

## Carried items

`DR-8-HARNESS` **consumed** (Doc-8B, DB-role path) · `DR-8-RLS` **satisfied** (8D defines the byte-equivalence gate) · `CLAR-8D-1` (#11 = buyer-private/Doc-6F, distinct from marketplace visibility) · `[ESC-8-CORPUS]` (genuine schema/corpus defect — flag-and-halt, never weaken) · `[ESC-8-API]`/`[ESC-8-POLICY]` (by pointer, named channel).

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (1 MAJOR + 2 MINOR; 1 REJECTED) → Patch v0.1.1 + short re-review → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1 (§0–§3), Pass-2 (§4–§7) — each authored → Board Hard Review → Patch v1.0.1 → short closure check (each 0 open BLOCKER/MAJOR/MINOR; the Pass-2 crown-jewel MAJOR closed; 2 findings REJECTED-as-false upheld) → Content Freeze Audit (APPROVE; 8 dimensions PASS).

---

*Doc-8D (Persistence/Migration/RLS Conformance Suite) is FROZEN. The defining suite for the RLS byte-equivalence gate (#11) + immutability (#8); schema-inventory-driven (coverage ≡ frozen Doc-6 DDL); consumes the Doc-8B harness; coins nothing. Invariant #11 (blacklist undetectable) = the buyer-private case (`Doc-6F`, execution-deferred). On any conflict with the frozen corpus, the corpus wins; flag-and-halt — never weaken an assertion. Next: Doc-8F (Integration/Event) and/or Doc-8G (Frontend/E2E).*

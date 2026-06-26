# Doc-8D — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8D_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · **Security Architect**) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET FREEZE-READY** — 1 MAJOR + 2 MINOR open; 1 finding REJECTED as false. 0 BLOCKER. Resolve via Structure Patch → short re-review → Structure Freeze Audit |

---

## Anchors verified CORRECT

- `Doc-6A §3/§5/§6/R5/R8/§4/R9/§11` · `Doc-2 §6/§0.3/§0.4/§7` · Invariant #8/#11 · `Doc-6B CR4′`/18 `core.*` · `Doc-6C` identity (45-slug/4-bundle) · `Doc-6D` marketplace (**visibility = publish-state; no `buyer_private` coined** — verified roadmap §4b) · `Doc-5K R7` (ai TTL) · `Doc-8B §3` (DB-role/schema-reset path) · CLAUDE.md §2/§10 · the Doc-8A allocation (8D defines #8/#11) — all correctly invoked.
- D3's split (marketplace visibility ready via `Doc-6D` vs buyer-private CRM deferred to `Doc-6F`) is **correct** — `buyer_vendor_statuses` is M4/operations, not frozen.

0 BLOCKER. D1 (schema-inventory-driven) + D2 (mandatory RLS band) + D3 (execution-readiness) are sound, and the security focus is right. One load-bearing layer-scope defect on the crown-jewel band, two seam/readiness refinements.

### MAJOR-1 — §5 byte-equivalence conflates the **data layer** (8D's defining concern) with **cross-layer observables** (8C/8F/8G)
§5 asserts excluded ≡ non-matched across "responses / counts / analytics / notifications / logs / errors." But **8D is the data layer** — RLS controls **row/query visibility**. "responses" (contract), "notifications" (comms/M6), "analytics" (M5/events), "UI" are **higher-layer observables** asserted in **8C/8F/8G**, not at the DB. As written, 8D (persistence) claims to assert contract/comms/UI artifacts — beyond its layer and overlapping the composers.
**Required fix:** §5 — scope **8D's defining assertion to row/query-result byte-equivalence** (an excluded vendor's RLS-governed queries — SELECT/COUNT — return **byte-identical result sets** to a non-matched vendor's at the DB). The **canonical criterion** (excluded ≡ non-matched) is **single-sourced in 8D (`CHK-8-024`)**; the cross-layer observables are **composed**: **8C** (contract responses + list counts byte-equivalent), **8F** (no distinguishing notification/event), **8G** (UI byte-equivalent). One criterion, asserted per layer by its owner — the Doc-8C §9.6 assert-once precedent. 8D defines + asserts at the DB; it does not assert UI/comms artifacts.

### MINOR-1 — §5 negative case overlaps Doc-8C's app-layer actor-scope (the seam)
§5 negative asserts "blocked at the **app layer AND RLS backstop**." But per the frozen **Doc-8C §8 seam**, the **app-layer** authz block is **8C's** (contract actor-scope); **8D's** defining concern is the **RLS backstop** (the DB denies even when the app layer is bypassed). 8D asserting the app-layer half re-implements 8C.
**Required fix:** §5 — 8D asserts the **RLS backstop denial** (query as the tenant DB role, app layer bypassed — its defining concern); the **app-layer denial is 8C's** actor-scope (cross-ref the seam). "Both layers deny" is the **system requirement**; each layer's assertion is owned by its suite (8C app-surface, 8D RLS-backstop) — assert-once, two layers.

### MINOR-2 — §5 positive case lists materialized grantee-row anchors that are M3/Doc-6E (NOT frozen) → flag execution-deferred
§5 positive lists "materialized grantee-row anchors `rfq_invitation_grantees`/`quotation_visibility`" as testable now. These are **M3 / `Doc-6E rfq`** (not yet frozen). Like buyer-private, the **vendor-side grantee RLS** is **execution-deferred** (D3), not ready with `core`/`identity`/`marketplace`.
**Required fix:** §5/D3 — flag the **grantee-row RLS anchors** (`rfq_invitation_grantees`/`quotation_visibility`, M3/`Doc-6E`) and the **quotation `controlling_organization_id`** party anchors as **execution-deferred** (await `Doc-6E`); the org-anchored (`identity`/`marketplace`) and public/anonymous (`marketplace`) RLS are ready now. The structure already defers buyer-private; extend the same flag to the grantee anchors.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"Doc-8D's RLS backstop test is redundant with Doc-8C's actor-scope test — both verify a user can't see another's data."* | **REJECTED (false).** The **Doc-8C §8 seam** already settled this: 8C asserts the contract-declared actor scope at the **API surface** (app-layer authz); 8D asserts the **RLS backstop** — the DB denies **even when the app layer is bypassed** (defense-in-depth — CLAUDE.md §2 "RLS is the backstop, not the model"). Different layers of the same defense; RLS-as-backstop is **meaningless if untested at the DB**. Dropping 8D's RLS test removes the only proof the backstop works. Not redundant. (MINOR-1 sharpens the split — 8D owns the RLS half, 8C the app half.) No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MAJOR-1 §5 byte-equivalence layer scope (data vs cross-layer) | MAJOR | Structure Patch — 8D = row/query visibility; composers assert per layer |
| MINOR-1 §5 negative overlaps 8C app-layer (seam) | MINOR | Structure Patch — 8D = RLS backstop; 8C = app; assert-once two layers |
| MINOR-2 §5 grantee anchors are Doc-6E (deferred) | MINOR | Structure Patch — flag grantee-row RLS execution-deferred (await 6E) |

**Gate (governance §8 rule 1):** freeze only with 0 open BLOCKER/MAJOR/MINOR. 1 MAJOR + 2 MINOR open → **Structure Patch required**, then short re-review, then Structure Freeze Audit.

*End of Independent Hard Review. Nothing coined; no frozen document edited. Anchors verified against the frozen Doc-6 schema (6B/6C/6D), Doc-6A R8/§4 RLS, Doc-2 §6, Invariant #11, the Doc-8C §8 seam, and D3 readiness (6E/6F deferred).*

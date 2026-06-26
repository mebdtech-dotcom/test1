# Doc-8D — Structure **Patch v0.1.1** (Hard Review disposition) + Short Re-Review

| Field | Value |
|---|---|
| Patches | `Doc-8D_Structure_Proposal_v0.1.md` |
| Against | `Doc-8D_Structure_Independent_Hard_Review_v0.1.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 1 MAJOR + 2 MINOR dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → structure freeze-ready |
| Method | Additive structure patch — no frozen document edited; nothing coined |

---

## Disposition of findings

### MAJOR-1 — §5 byte-equivalence layer scope → **FIXED**
§5 + D2 are scoped to the data layer with explicit composition:
> **8D's defining assertion (`CHK-8-024`) is row/query-result byte-equivalence** at the DB: an excluded vendor's RLS-governed queries (SELECT / COUNT) return **byte-identical result sets** to a non-matched vendor's. The **canonical criterion (excluded ≡ non-matched) is single-sourced here**; the **cross-layer observables are composed**, each applying the same criterion at its layer:
> - **Doc-8C** — contract responses + list counts byte-equivalent (API surface);
> - **Doc-8F** — no distinguishing notification / event emitted (comms/event flow);
> - **Doc-8G** — UI byte-equivalent (presentation).
>
> 8D **defines + asserts at the DB** (row visibility); it does **not** assert contract/comms/UI artifacts. One criterion, asserted per layer by its owner (the Doc-8C §9.6 assert-once precedent generalized to non-disclosure).

### MINOR-1 — §5 negative overlaps 8C app-layer (seam) → **FIXED**
§5 negative is split per the Doc-8C §8 seam:
> **8D asserts the RLS backstop denial** — query as the **tenant DB role with the app layer bypassed**; RLS must deny (CLAUDE.md §2 RLS-as-backstop, its defining concern). The **app-layer denial is Doc-8C's** actor-scope (cross-ref the seam). "**Both layers deny**" is the **system requirement**; each layer's assertion is owned by its suite — **8C app-surface, 8D RLS-backstop** — assert-once, two layers.

### MINOR-2 — §5 grantee anchors are Doc-6E (deferred) → **FIXED**
§5/D3 flag the grantee-row RLS as deferred:
> **Execution-readiness (D3):** org-anchored RLS (`identity` `organization_id`) + public/anonymous tri-actor RLS (`marketplace`) are **ready now** (`Doc-6C`/`Doc-6D` frozen). **Materialized grantee-row anchors** (`rfq_invitation_grantees` / `quotation_visibility`) + the quotation **`controlling_organization_id`** party anchors are **M3 / `Doc-6E rfq` — execution-deferred** (await `Doc-6E`). **Buyer-private CRM byte-equivalence** (`buyer_vendor_statuses`, M4 / `Doc-6F`) — execution-deferred. All authored now (oracle = the invariant/convention, frozen); flagged, none dropped.

### REJECTED finding — upheld
"8D RLS redundant with 8C actor-scope" stays **REJECTED as false** — the Doc-8C §8 seam: 8C asserts API-surface authz, 8D asserts the RLS backstop (DB denies when the app is bypassed); different layers; RLS-as-backstop is meaningless if untested at the DB. MINOR-1 sharpens the split. No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER | 0 | 0 |
| MAJOR | 1 | **0** |
| MINOR | 2 | **0** |

---

## Short Re-Review (closure confirmation)

| Finding | Sev | Closed? |
|---|---|---|
| MAJOR-1 byte-equivalence layer scope | MAJOR | **CLOSED** — 8D = row/query visibility (single-sourced criterion); 8C/8F/8G compose per layer |
| MINOR-1 negative seam | MINOR | **CLOSED** — 8D = RLS backstop; 8C = app; both-deny is the requirement, each owned |
| MINOR-2 grantee anchors deferred | MINOR | **CLOSED** — grantee/controlling-org RLS → Doc-6E deferred; org/public ready now |
| REJECTED (8D vs 8C) | — | **Upheld false** |

No new defect. Re-verified the data-layer scope of RLS (row visibility, not cross-layer observables), the Doc-8C §8 seam (8C app / 8D RLS), and D3 readiness (6E grantee / 6F buyer-private deferred; 6C/6D ready). **0 open BLOCKER/MAJOR/MINOR → structure freeze-ready.**

*End of Structure Patch v0.1.1 + Short Re-Review. Nothing coined; no frozen document edited. Next: Structure Freeze Audit → `Doc-8D_Structure_v1.0_FROZEN` → Doc-8D content passes.*

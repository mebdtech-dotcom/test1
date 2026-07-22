# Doc-5I — Retired-Plan Read-Visibility Patch v1.0 (Billing / M7)

| Field | Value |
|---|---|
| Patch | Doc-5I Retired-Plan Read-Visibility Patch v1.0 — Billing |
| Type | **Additive correction** to `Doc-5I §4` `billing.get_plan.v1` / `billing.list_plans.v1` disclosure prose. Frozen Doc-5I not edited in place (additive-patch discipline, CLAUDE.md §11) |
| Status | **APPROVED — human-ruled (owner, 2026-07-11)**, resolving `[ESC-BILL-RETIRE-VIS]` (raised W3-BILL-1) |
| Authority | Owner ruling 2026-07-11; `Doc-6I §3.x` RLS (authoritative, unchanged); `Doc-4I §HB-1.4` (rank-0 contract, silent on retired-read visibility — no rank-0 conflict); `Doc-2 §10.8` (`plans` has no `status` column; `SD = retire`) |
| Purpose | Correct the `Doc-5I §4` prose that said retired plans are "visible to all authenticated users" so it MATCHES the already-frozen `Doc-6I` RLS: **retired plans are visible to staff/admin only; active + draft plans are visible to authenticated users.** |
| Scope guard | **No RLS change. No schema change. No new contract, slug, event, audit action, POLICY key, or state edge.** Prose-only reconciliation of a disclosure note; the security posture (a normal user never reads a retired plan) is the RLS's existing behavior. Billing firewall / procurement moat / money-boundary untouched. |

---

## Background — the reconciled tension

`[ESC-BILL-RETIRE-VIS]` was raised at W3-BILL-1: `Doc-5I §4` (the `get_plan` / `list_plans` content) stated *"User reads any plan regardless of status … draft and retired plans are visible to all authenticated users"* and *"Admin reads any state … User reads active plans by default."* This **diverged** from `Doc-6I §3.x`, which realizes `plans_public_read` as `USING (deleted_at IS NULL)` — and, because `Doc-2 §10.8` realizes **retired as soft-delete** (`SD = retire`; `plans` carries no `status` column, so status is derived from `is_active` + `deleted_at`), that RLS **hides retired rows from every non-staff reader**; staff read retired rows via `plans_admin FOR ALL USING (app.is_platform_staff)`. `Doc-4I §HB-1.4` (rank-0) is silent on retired-read visibility, so the divergence was between two realization docs only.

## Ruling (owner, 2026-07-11)

> Retired plans are **not** visible to normal users. Active/Draft → authenticated users; Retired → staff/admin only. Doc-5I is updated to match Doc-6I. No RLS change required. This is the cleaner and more secure model.

## Correction to `Doc-5I §4`

The retired-plan clause in the `billing.get_plan.v1` and `billing.list_plans.v1` disclosure notes is **superseded** by this patch and now reads:

- **Disclosure scope (retire-aware).** `get_plan` / `list_plans` are **Platform-Public** (authentication only — no billing slug, no org scope). Plan-status visibility is:
  - **`active` and `draft`** → any authenticated user (both are `deleted_at IS NULL`; `plans_public_read`).
  - **`retired`** → **staff/admin only** (retired ⟺ soft-deleted; visible solely via `plans_admin` under `app.is_platform_staff`). A normal user's `get_plan` of a retired plan returns `404`; a normal user's `list_plans` excludes retired rows, and a `status=retired` filter returns an empty page.
- The earlier prose "draft and retired plans are visible to all authenticated users … use status/is_active to filter client-side" is **corrected**: only `draft`/`active` are client-filterable within the authenticated (non-staff) surface; `retired` is not on that surface at all. `is_active`/`status` remain declared filters within the visible set.

This makes `Doc-5I §4` consistent with `Doc-6I §3.x` (authoritative, unchanged) and `Doc-2 §10.8`. No RLS/schema/contract change accompanies this correction.

> **Staff-facing retired reads — realization note.** The RLS already grants staff the retired view; a normal user is fully fenced today (W3-BILL-1 reads scope to `deleted_at IS NULL`, test-proven at both the app layer and the DB-role-switch backstop). The **wire path by which a staff/admin caller actually receives retired plans** through `get_plan`/`list_plans` depends on server-side platform-staff resolution, which is fail-closed in Wave 2 (`resolveStaffContext` = DC-3 interim, always `null` — no staff roster). It therefore lands with the DC-3 staff channel (and pairs naturally with the BC-BILL-1 Admin catalog-write slice). The **security invariant — no non-staff caller ever reads a retired plan — is satisfied now**; only the staff convenience is deferred, with no non-disclosure risk.

## Gate closure

- **`[ESC-BILL-RETIRE-VIS]` → RESOLVED (owner-ruled).** `Doc-5I §4` reconciled to `Doc-6I §3.x`. Recorded in `esc_registry.md`.

---

*Additive `Doc-5I` prose correction, human-ruled. Conforms upward (rank-0 `Doc-4I §HB-1.4` unaffected; `Doc-6I §3.x` authoritative and unchanged); coins nothing. Fold into the Doc-5I effective patch set under architecture governance.*

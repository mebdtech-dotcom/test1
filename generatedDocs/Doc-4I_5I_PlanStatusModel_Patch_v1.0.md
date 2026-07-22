# Doc-4I / Doc-5I — Plan-Status-Model Correction Patch v1.0 (Billing / M7)

| Field | Value |
|---|---|
| Patch | Doc-4I / Doc-5I Plan-Status-Model Correction v1.0 — Billing |
| Type | **Additive prose correction** to `Doc-4I §HB-1.1` / `§HB-1.1a` and `Doc-5I §4` (`create_plan` / `activate_plan` / `update_plan` / `retire_plan`). Frozen docs **not edited in place** (additive-patch discipline, CLAUDE.md §11) |
| Status | **APPROVED — human-ruled (owner, 2026-07-11)**, resolving `[ESC-BILL-STATUS-MODEL]` (raised W3-BILL-2) |
| Authority | Owner ruling 2026-07-11; `Doc-6I §3.1.1` (authoritative schema — unchanged); `Doc-2 §10.8` (`plans` column set — unchanged); `Doc-2 §3.8` (plans machine `draft → active → retired` — unchanged) |
| Purpose | Reconcile the `Doc-4I`/`Doc-5I` prose that treats `is_active` as a marketing-visibility bool **distinct** from `status` with the frozen `Doc-6I`/`Doc-2 §10.8` schema, which realizes **no `status` column** — so `status` is DERIVED and `is_active` **is** the draft/active discriminator (**MODEL B**). |
| Scope guard | **No schema change. No new column, contract, slug, event, audit action, POLICY key, or state edge.** Prose-only reconciliation of the storage model of a status the machine (`Doc-2 §3.8`) already mandates. Billing firewall / procurement moat / money-boundary untouched. |

---

## Background — the reconciled tension

`[ESC-BILL-STATUS-MODEL]` was raised at W3-BILL-2 (building the plan-catalog writes): `Doc-4I §HB-1.1` / `§HB-1.1a` and `Doc-5I §4` state that `is_active` is a **marketing-visibility bool, distinct from `status`**, that `activate_plan` drives `draft → active` *"with no `is_active` coupling,"* and that `update_plan` is *"marketing-config only, no status edge"* — all of which imply a dedicated `status` field. But the frozen schema realizes **no such field**: `Doc-2 §10.8` lists `plans` columns as `{ name, billing_cycle, price, currency, is_active }` + soft-delete, and `Doc-6I §3.1.1` explicitly realizes *"`draft → active` = **set `is_active`**"* and *"`SD = retire`."* So `is_active` **is** the realized draft/active discriminator; there is no separate column for the contract prose's "distinct" `status`. `Doc-4I §HB-1.4` (rank-0) is silent on storage. The divergence was between the two realization docs' prose and the schema.

## Ruling (owner, 2026-07-11) — Model B (keep the schema)

> Model B — derived status (keep schema). No schema change; matches the frozen `Doc-6I` schema, the shipped W3-BILL-1 reads, and the retired = soft-deleted ruling. `create → is_active=false` (draft); `activate_plan → sets is_active=true`; `retire → soft-delete`; `update_plan` changes marketing fields only, NOT `is_active`.

## Corrections

The following `Doc-4I`/`Doc-5I` clauses are **superseded** by this patch (prose only — no contract/field/edge changed):

- **`status` is DERIVED, never stored** (`Doc-6I §3.1.1` / `Doc-2 §10.8` govern): `retired` ⟺ soft-deleted (`deleted_at` set); `active` ⟺ `is_active=true` ∧ live; `draft` ⟺ `is_active=false` ∧ live. The `Doc-2 §3.8` machine (`draft → active → retired`) is realized over this derivation.
- **`is_active` IS the realized draft/active discriminator** — the `Doc-4I §HB-1.1` / `Doc-5I §4` "`is_active` is marketing-visibility, distinct from `status`" prose is corrected: under the frozen schema there is no separate `status` column, so `is_active` carries the draft↔active distinction.
- **`activate_plan` (§HB-1.1a) realizes `draft → active` by SETTING `is_active=true`** (`Doc-6I §3.1.1`) — the "no `is_active` coupling" prose is corrected (there is no alternative field to set).
- **`update_plan` (§HB-1.1) is status-neutral** — it mutates marketing config (`name`/`billing_cycle`/`price`/`currency`) and, to honor "no status edge," does **NOT** change `is_active` (the status discriminator, owned by `activate_plan`). `is_active` is therefore not an accepted `update_plan` input under Model B.
- **`create_plan` mints a `draft`** (`is_active=false`); `is_active` is not a create input.

No RLS / schema / contract-count change accompanies this correction (`Doc-6I §3.x` and the `Doc-4I` contract set are unchanged; `activate_plan` remains the §HB-1.1a additive contract).

> **Consistency.** This is the same `is_active`-vs-`status` tension the retired-visibility ruling (`Doc-5I_RetiredVisibility_Patch_v1.0`) touched from the read side; both are now resolved consistently with the frozen schema (Model B: `retired` = soft-deleted; `active` = `is_active`).

## Gate closure

- **`[ESC-BILL-STATUS-MODEL]` → RESOLVED (owner-ruled).** `Doc-4I §HB-1.1`/`§HB-1.1a` + `Doc-5I §4` reconciled to `Doc-6I §3.1.1` / `Doc-2 §10.8`. Recorded in `esc_registry.md`.

---

*Additive `Doc-4I`/`Doc-5I` prose correction, human-ruled. Conforms upward (rank-0 `Doc-2 §3.8`/`§10.8` unaffected; `Doc-6I §3.x` authoritative and unchanged); coins nothing. Fold into the effective patch set under architecture governance.*

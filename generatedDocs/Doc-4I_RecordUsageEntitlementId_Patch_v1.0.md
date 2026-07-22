# Doc-4I — `record_usage` `entitlement_id` Input Patch v1.0 (Billing / M7)

| Field | Value |
|---|---|
| Patch | Doc-4I `record_usage` `entitlement_id` input v1.0 — Billing |
| Type | **Additive input reconciliation** to `Doc-4I §HB-3.1` (`billing.record_usage.v1`). Frozen doc **not edited in place** (additive-patch discipline, CLAUDE.md §11) |
| Status | **APPROVED — human-ruled (owner, 2026-07-11)**, resolving `[ESC-BILL-USAGE-ENTID]` (raised W3-BILL-6) — **Option B** |
| Authority | Owner ruling 2026-07-11; `Doc-2 §10.8` (`usage_ledger → entitlements` FK — unchanged); `Doc-4I H.10` (field-source `usage_ledger: →entitlements` — unchanged); `Doc-6I §3.3` (`entitlement_id uuid NOT NULL … REFERENCES entitlements(id)` — unchanged) |
| Purpose | Reconcile `Doc-4I §HB-3.1`'s input list — which omitted `entitlement_id` — with the schema's **NOT-NULL `usage_ledger.entitlement_id` FK** (mandated by `Doc-2 §10.8` + `H.10` + `Doc-6I §3.3`). The metering caller supplies `entitlement_id`; `record_usage` performs **no record-time entitlement lookup** (Stage-7 retained). |
| Scope guard | **No schema change. No new column, contract, slug, event, audit action, POLICY key, or state edge.** Adds ONE required INPUT that maps to the ALREADY-FROZEN `usage_ledger.entitlement_id` column. `record_usage` stays out-of-wire (System; `Doc-5I §10`/R1). Billing firewall / procurement moat / money-boundary untouched. |

---

## Background — the reconciled tension

`[ESC-BILL-USAGE-ENTID]` was raised at W3-BILL-6 (building BC-BILL-3): the schema mandates a **NOT-NULL** `usage_ledger.entitlement_id` FK — **`Doc-2 §10.8`** (`billing.usage_ledger → entitlements`), **`Doc-4I H.10`** (field-source `usage_ledger: →entitlements, …`), and **`Doc-6I §3.3`** (`entitlement_id uuid NOT NULL … REFERENCES billing.entitlements(id)`) all agree. But **`Doc-4I §HB-3.1`** (`record_usage`, the *sole* writer) listed **no `entitlement_id` input** (inputs = `organization_id`, `acting_user_id`, `consuming_entity_id`, `quota_key`, `amount`, `period`, `source`, `source_event_id`), and — after Hard-Review disposition **F4I-PB1-M1** — its Stage-7 states *"`quota_key` is free-form … not a foreign key and **no record-time entitlement lookup is specified**."* A NOT-NULL FK that the sole writer neither receives nor resolves is unpopulatable. (F4I-PB1-M1 reconciled `quota_key`; it never addressed the `entitlement_id` FK.)

## Ruling (owner, 2026-07-11) — Option B (add the input)

> Add `entitlement_id` as a `record_usage` input, supplied by the metering caller — the signal's owner knows which entitlement the metered action consumes. Keeps Stage-7 "no record-time entitlement lookup" intact and honors the NOT-NULL FK.

## Correction

`Doc-4I §HB-3.1` §5 (Inputs) is **augmented** (additive — the frozen input list gains one field; nothing removed or re-typed):

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `entitlement_id` | `uuid` | **yes** | `Doc-2 §10.8` / `Doc-6I §3.3` | resolves to a `billing.entitlements` row (the metered entitlement); supplied by the metering caller — **not** looked up at record time |

- **Provenance:** the **metering caller** (the RFQ / Operations / Marketplace signal handler — DF-BILL-2/3/4) supplies `entitlement_id` alongside `quota_key`; the entitlement whose consumption the action meters is known to that owner.
- **Stage-7 UNCHANGED:** `record_usage` performs **no record-time entitlement lookup** — it does not derive `entitlement_id` from `quota_key` (which remains a free-form metering string, F4I-PB1-M1). It persists the caller-supplied `entitlement_id` into the FK column verbatim.
- **Stage-1 SYNTAX** gains `entitlement_id` uuid presence/type (absence → `VALIDATION`, `Doc-4A §9`). **Stage-7 REFERENCE** may surface a definitive negative if the supplied `entitlement_id` does not resolve (FK) — `REFERENCE` (definitive) / `DEPENDENCY` (transient), consistent with the existing §HB-3.1 error register.
- **No output change** (`record_usage` is `Response: none`, 21.5 System). **No wire** (out-of-wire, `Doc-5I §10` — the input is an in-process/System-call parameter).

## Gate closure

- **`[ESC-BILL-USAGE-ENTID]` → RESOLVED (owner-ruled, Option B).** `Doc-4I §HB-3.1` inputs reconciled to the `Doc-2 §10.8` / `H.10` / `Doc-6I §3.3` NOT-NULL FK. Recorded in `esc_registry.md`.
- **`source_event_id`** (also absent from the schema as a column) is **not** part of this ruling: it is a `Doc-4A §16` idempotency key (H.8 — "idempotent on the metered-action unit: event id / `source` + period"), realized via the idempotency framework, **not** a persisted `usage_ledger` column. No ruling required.
- **Build:** `record_usage` is unblocked; it lands in a dedicated M7 slice (the W3-BILL-6 table + reads/enforcement already shipped).

---

*Additive `Doc-4I §HB-3.1` input reconciliation, human-ruled. Conforms upward (rank-0 `Doc-2 §10.8` FK + `Doc-6I §3.3` NOT-NULL schema unaffected — the input now MATCHES them); coins nothing (the column already exists). Fold into the effective patch set under architecture governance.*

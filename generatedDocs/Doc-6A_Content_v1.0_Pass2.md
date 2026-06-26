# Doc-6A — Database Realization Metastandard — Content v1.0 **Pass-2** (§5–§9)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-2** (realizes §5–§9 of `Doc-6A_Structure_v1.0_FROZEN`) — awaiting Hard Review → Pass-3 |
| Date | 2026-06-26 |
| Realizes (structure) | §5 Integrity & Constraint Realization · §6 Immutability/Soft-Delete/Versioning · §7 Outbox & Event-Persistence · §8 Audit Persistence · §9 POLICY Configuration & Seed |
| Authority | `Doc-2 v1.0.3` (the *what*-authority); `Doc-4B` (M0 outbox/audit/id/config owner); `Doc-4L` (event-flow map); `Doc-3 §12` + POLICY patches v1.0–v1.8 |
| Builds on | Pass-1 §0–§4 (esp. **§2.5 realization-choice attribution** — physical specifics here are Doc-6 choices unless Doc-2 states them) |
| Coins | **Nothing.** Tables named here (`core.outbox_events`, `core.audit_records`, `core.id_sequences`, `core.system_configuration`) are **Doc-2-declared M0 tables** (§10.1), bound by pointer and realized in **Doc-6B**, not authored here |

> **Scope reminder.** Doc-6A is the metastandard — §5–§9 declare the **conventions** for integrity, immutability, outbox, audit, and config. The `core.*` tables are M0's (Doc-2 §10.1 / Doc-4B); Doc-6A references their realization rules; **Doc-6B authors the actual `core` tables.** SQL/Prisma snippets are generic convention patterns. Per §2.5, any physical specific not stated by Doc-2 is a Doc-6 realization choice.

---

## §5 — Integrity & Constraint Realization *(authors no table)*

Realizes Doc-2 §0.3 / §4 / §10.11.

### §5.1 Primary key

Every table's PK is `id` (UUIDv7, §3.1). No composite PK on an aggregate root; child/junction tables may use a composite PK over their parent + member UUIDs where Doc-2 §4 models a pure association (realization choice — §2.5).

### §5.2 Intra-schema foreign keys (permitted within a module)

References **within one module's schema**, between an aggregate root and its child entities/value-objects (Doc-2 §2 aggregate design), MAY carry a real foreign key. The FK target MUST live in the **same schema** (same module). Convention:

```sql
-- generic convention — NOT a module FK
ALTER TABLE <schema>.<child>
  ADD CONSTRAINT <child>_<parent>_fk
  FOREIGN KEY (<parent>_id) REFERENCES <schema>.<parent>(id);
```

ON DELETE behavior follows the aggregate rule: children of a soft-deletable root are **not** cascade-hard-deleted (soft-delete propagates by service/trigger, §6.2); a true `ON DELETE CASCADE` is permitted only for non-authoritative child rows that may legitimately hard-delete (rare — justified per table in Doc-6x).

### §5.3 Cross-module references — bare UUID, never an FK (Doc-2 §0.3 — binding)

A reference to an entity owned by **another module** is a **bare UUID column named for the target entity** (e.g. `vendor_profile_id`, not `vendor_profile_ref`) — **no foreign key crosses a schema boundary**. The reference is:

1. **Validated** by the owning module's service before save (the writing module calls the owner's `contracts/` service — never a cross-schema read/JOIN).
2. **Reconciled** by the periodic **orphan-scan integrity job** (§5.5).
3. **Synchronized** by events where the owner's state changes (outbox → consumer, §7).

A cross-schema FK, a cross-schema JOIN in a query, or a cross-schema RLS traversal (§4.5/§4.3) is **non-conformant** — flag-and-halt.

### §5.4 CHECK constraints

- **Enumerated state/status** columns carry a CHECK against the Doc-2-declared value set (or are realized as a Postgres `enum` type — realization choice §2.5; CHECK preferred for additive-evolution friendliness). Values lowercase_underscored (§3.4).
- **Currency** columns CHECK membership in the supported ISO-4217 set (multi-currency — §3.6).
- **Monetary/quantity** non-negativity and similar domain rules realized as CHECK where Doc-2 §10.x states them; never invented beyond Doc-2.

### §5.5 Cross-module integrity — orphan-scan reconciliation (Doc-2 §0.3/§10.11)

Because cross-module references carry no FK (§5.3), referential integrity across schemas is maintained by a **periodic orphan-scan integrity job** (Doc-2 §0.3): it detects bare-UUID columns pointing at soft-deleted/absent owner rows and raises them for reconciliation (per the owning module's policy). The job is **read-only across schemas via each owner's service/read-model** — it does not cross-schema JOIN. Doc-6x declares which of its columns are cross-module (the scan targets); the job itself is code/Inngest (consumes M0 — Doc-4B).

### §5.6 Concurrency safety (Doc-2 §10.11)

- **Optimistic concurrency** on mutable aggregates: a `version`/`updated_at` guard column where Doc-2 §10.11 requires concurrency safety; the app layer does compare-and-set (realization choice on the exact column — §2.5).
- **Row-locked sequences** for `human_ref` generation (`core.id_sequences`, §3.2) — `SELECT … FOR UPDATE` / advisory lock so year-scoped counters are gap-tolerant and never collide (Doc-2 §0.1).
- **Unique-index races** are caught by the partial-unique indexes (§3.5), not by read-then-write.

---

## §6 — Immutability, Soft-Delete & Versioning Realization *(authors no table)*

Realizes Invariant #8 (nothing authoritative overwritten or hard-deleted; IDs never reused) + Doc-2 §0.2 / §5.

### §6.1 The immutability ladder (binding)

| Class | Doc-2 source | Realization |
|---|---|---|
| **Mutable** | default | normal UPDATE; `updated_at` stamped; optimistic-concurrency guard (§5.6) |
| **Soft-deletable** | §0.2 | never hard-DELETE; set `deleted_at/by/delete_reason` (§6.2) |
| **Versioned** | §5 | new row per revision; prior rows immutable once binding (§6.3) |
| **Append-only / history** | §0.2/§5 | INSERT-only; UPDATE/DELETE blocked by trigger (§6.4) |
| **Regenerable cache** *(sole exception)* | Doc-5K R7 | TTL hard-delete legitimate (§6.5) |

### §6.2 Soft-delete realization

- Set the soft-delete tuple (`deleted_at`, `deleted_by`, `delete_reason` — §3.3); the row is excluded from routing, matching, search, and **default queries** (the app layer / read-models filter `deleted_at IS NULL`; partial indexes §3.5 keep live-uniqueness).
- Soft-delete of an aggregate root propagates to its children by **service or trigger** (intra-schema), never by cross-schema action.
- A hard `DELETE` on a soft-deletable table is non-conformant (Invariant #8).

### §6.3 Versioned tables (immutable once binding — Doc-2 §5)

Tables Doc-2 declares versioned — e.g. `rfq_versions`, `quotation_versions`, `template_versions`, `spec_documents` (Doc-2 §10.4/§10.5) — realize: each revision is a **new row** (new `id`); a prior version becomes **immutable** once a binding state is reached (e.g. a quotation exists against an RFQ version; a generated document records the `template_version` used). Immutability is enforced at the DB by an **UPDATE/DELETE-blocking trigger** on bound rows (realization mechanism — §2.5). Convention:

```sql
-- generic convention — NOT a module trigger
CREATE TRIGGER <table>_block_mutation_when_bound
  BEFORE UPDATE OR DELETE ON <schema>.<table>
  FOR EACH ROW WHEN (OLD.<bound_flag> IS TRUE)
  EXECUTE FUNCTION core.raise_immutable_violation();
```

### §6.4 Append-only / history tables (Doc-2 §0.2/§5)

History/snapshot tables — e.g. `financial_tier_history`, `trust_score_history`, `performance_score_history` (Doc-2 §10.6), `lead_activities`, audit (§8) — are **INSERT-only**: an UPDATE or DELETE is blocked by trigger. Score/tier snapshots are written under the **System** actor (governance firewall — auto-calculated, never hand-edited; Doc-2 §9 actor_type / CLAUDE.md §4).

### §6.5 The regenerable `ai.*` cache exception (enumerated — Doc-5K R7)

The **sole** legitimate hard-delete is the M9 `ai` schema's regenerable derived-artifact cache: a TTL-expired cache row MAY be hard-deleted (`Doc-3_Policy_Key_Registration_Patch_v1.8_AI` `ai.<bc>.ttl_seconds`). These are **disposable projections, not authoritative records** (advisory-only; no score, no §8 event — Doc-5K R5/R6). The exception is **enumerated to `ai.*`** — no other schema may hard-delete an authoritative row. Doc-6K realizes the TTL hard-delete; all other Doc-6x inherit the no-hard-delete rule.

---

## §7 — Outbox & Event-Persistence Realization *(M0-owned table; convention)*

Realizes Doc-2 §8 / §10.1 + Doc-4B (M0 outbox owner) + Doc-4L (event-flow map). The `core.outbox_events` table is **realized in Doc-6B**; §7 declares the transactional contract every emitter honors.

### §7.1 The transactional write+emit rule (binding — Doc-2 §8)

A business state write and its event insert occur in **one database transaction** (atomic outbox). The emitting module writes its own aggregate **and** inserts the `core.outbox_events` row in the same transaction; a separate dispatcher (Inngest, consuming M0) delivers asynchronously. Convention:

```sql
-- generic convention — one transaction, NOT a module statement
BEGIN;
  UPDATE <schema>.<aggregate> SET <state>=... WHERE id=...;   -- business write
  INSERT INTO core.outbox_events (id, event_name, event_version, payload_jsonb,
                                  status, created_at)
       VALUES (<uuidv7>, '<EventName>', <v>, '<ids+meta>', 'pending', now());
COMMIT;
```

The insert into `core.outbox_events` is the **only** legitimate cross-schema write from a business module, and it is to the **M0-owned outbox by its contract**, not a foreign business table (no cross-module table write — CLAUDE.md §3).

### §7.2 Outbox table shape (realized in Doc-6B — by pointer)

`core.outbox_events` columns (Doc-2 §10.1): `id` (UUIDv7), `event_name`, `event_version`, `payload_jsonb` (IDs + metadata, **no blobs**), `status` (`pending → dispatched → archived`), `dispatched_at`, `attempts`. Dispatch lifecycle + retry/backoff is code (Inngest); Doc-6B realizes the table + a status/created_at index for the dispatcher poll (§10 indexing, Pass-3).

### §7.3 Event set bound by pointer (no event coined)

The event names/versions are the Doc-2 §8 ownership map + the Doc-4J authoritative event catalog; the flow (producer → consumers) is Doc-4L. Doc-6A coins **no** event. A consumer's effect persists in the **consuming module's own schema** (its read-model/projection or its own aggregate) — never a cross-schema write back. Idempotent consumption (dedup window) uses the `*.idempotency_dedup_window` POLICY key (§9; persisted dedup realized §10, Pass-3).

---

## §8 — Audit Persistence Realization *(M0-owned table; convention)*

Realizes Doc-2 §9 + Doc-4B (M0 audit owner). `core.audit_records` is **realized in Doc-6B**; §8 declares the convention.

### §8.1 Immutable audit table (Doc-2 §9 — binding)

`core.audit_records` is **append-only** (§6.4): INSERT-only, UPDATE/DELETE trigger-blocked. Columns (Doc-2 §9): `audit_id`, `actor_id`, `actor_type` (`User | Admin | System | AI Agent`), `organization_id`, `entity_type`, `entity_id`, `action`, `old_value`, `new_value`, `timestamp`, `ip_address`, `user_agent`.

### §8.2 Redaction-as-new-event (Doc-2 §9 — binding)

Redacting a sensitive field never edits an existing audit row (it is immutable §8.1); it writes a **new audit event** recording the redaction. No in-place mutation, ever.

### §8.3 No blobs (Doc-2 §9 — binding; §12 out-of-DB)

Audit references document versions **by ID**, never the binary. `old_value`/`new_value` hold field-level values/diffs (text/jsonb), not files. File content lives in Supabase Storage; the DB stores `file_ref`/path only (§12, Pass-3).

### §8.4 Audited-action set bound by pointer (no action coined)

The per-domain "MUST audit" action list is **Doc-2 §9** (RLS-policy changes, state transitions, cross-org changes, score/tier changes, ban issue/lift, verification decisions, etc.). Doc-6A coins **no** audit action; each Doc-6x ensures its mutations have a `core.audit_records` write where Doc-2 §9 requires one (the write itself is app-layer, by the module's service). A gap → `[ESC-6-*]` to the Doc-2 §9 channel, never invented.

---

## §9 — POLICY Configuration & Seed Realization *(M0-owned table; convention)*

Realizes Doc-3 §12 + POLICY patches v1.0–v1.8 + Doc-2 §7 / A-08. `core.system_configuration` is **realized in Doc-6B**; §9 declares the convention + seed obligation.

### §9.1 The config table (Doc-3 §12 — by pointer)

`core.system_configuration` holds every registered POLICY key as a typed config row (key, value, type, scope, version/effective metadata per Doc-3 §12). Owned by M0; **read by all modules** via the M0 config service (no module hard-codes a POLICY value — CLAUDE.md: bounds via POLICY key, never a literal).

### §9.2 Registered namespaces — seed scope (binding)

Seed the **nine** registered POLICY namespaces (Doc-3 §12.2 additive patches):

| Namespace | Patch | Module |
|---|---|---|
| `core` | v1.0 | M0 |
| `rfq` | v1.1 | M3 |
| `marketplace` | v1.2 | M2 |
| `trust` | v1.3 | M5 |
| `operations` | v1.4 | M4 |
| `communication` | v1.5 | M6 |
| `billing` | v1.6 | M7 |
| `admin` | v1.7 | M8 |
| `ai` | v1.8 | M9 |

**M1 `identity` registered none.** Whether `identity` needs a wire-referenced POLICY key (e.g. `identity.list_page_size_max` / `identity.idempotency_dedup_window`) is a **Doc-6C content cross-check** carried as **`[ESC-6-POLICY]`** — resolved only via an additive `Doc-3 §12.2` patch, **never coined here**.

### §9.3 Key shape bound by pointer (no key coined)

The two recurring API-realization keys per registered namespace are `<ns>.idempotency_dedup_window` + `<ns>.list_page_size_max` (the `ai` namespace instead registers `ai.list_page_size_max` + four `ai.<bc>.ttl_seconds` cache-lifecycle keys — Doc-3 v1.8). Doc-6A seeds exactly the registered keys/values from the patches; it coins **no** key and invents **no** default value.

### §9.4 Role / permission seed (Doc-2 §7 / A-08)

Seed the role bundles (Owner/Director/Manager/Officer + the platform-staff slug space) and permission slugs from Doc-2 §7 / assumption A-08. These are realized in `identity` (Doc-6C) + referenced by the app-layer authz root (Doc-4C); the **seed data** is bound by pointer to Doc-2 §7, never invented. The seed migration is forward-only (§11, Pass-3).

### §9.5 Seed = data migration, not schema

Seeds (POLICY keys §9.2/§9.3, roles §9.4) are realized as **idempotent forward-only seed migrations** (§11, Pass-3), separate from structural migrations. Re-running a seed must not duplicate rows (upsert on the natural key). No seed value is invented beyond its frozen source (Doc-3 patch / Doc-2 §7).

---

*End of Doc-6A Content Pass-2 (§5–§9). Realizes the frozen structure; coins nothing — `core.*` tables bound by pointer (realized in Doc-6B), every event/audit-action/POLICY-key bound to Doc-2 §8/§9 / Doc-3 §12; physical specifics attributed per §2.5. Generic templates only — no module table authored. Next: Pass-3 (§10–§13 + Appendix A `CHK-6-xxx`).*

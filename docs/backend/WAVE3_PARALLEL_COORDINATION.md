# Wave 3 — Parallel Module Coordination (M5 · M6 · M7)

| Field | Value |
|---|---|
| **Document type** | Living coordination note · non-authoritative under the frozen corpus |
| **Date** | 2026-07-11 |
| **Owner** | Engineering (backend) — the **M2/coordinator chat** maintains this file |
| **Status** | ACTIVE — M5/M6/M7 are being built in **three separate chats, in parallel**, one per module |

> **Why this file exists.** M2 `marketplace` shipped two committed read-slices (`W3-MKT-1`,
> `W3-MKT-2`) on `wave/3-marketplace`. The remaining Wave-3 modules — **M5 `trust`, M6
> `communication`, M7 `billing`** — are now each worked in their own chat, in parallel. They are
> genuinely independent (each depends only on M0+M1, both delivered), but they share a few files
> that are NOT module-scoped. This note is the single coordination point so the three sessions
> don't clobber each other. **Read this before touching anything outside your own
> `src/modules/<m>/`.**

---

## 1. Owner decisions governing this parallel run (2026-07-11)

1. **Branch per module, cut from `main`.** `wave/3-trust`, `wave/3-communication`, `wave/3-billing`
   — each cut fresh from `main` (NOT from `wave/3-marketplace`; the modules don't need M2's code).
   `wave/3-marketplace` stays M2's. Each module branch merges to the Wave-3 integration point
   independently at the wave exit gate — **no per-module merge to `main`** (mirrors Wave 2: only
   the fully integration-audited wave merged).
2. **The coordinator chat (this one) owns the shared governance/status docs** — see §3. Module
   chats do NOT edit them directly; they hand their patch/ESC text to the coordinator to fold.
3. **Exploration is done — see §4** for each module's scouting report (first slice, field-shape
   status, governance gaps, awaiting FE). Don't re-scout; start from these.

---

## 2. Branch & working-tree reality (read carefully)

Branch-per-module + true parallelism on **one working copy** is impossible (git checks out one
branch per worktree). Pick the setup that matches how the chats actually run:

- **Separate clones / machines:** each chat on its own clone, on its module branch. Shared-file
  reconciliation happens at integration via git merge — since each module adds a **disjoint DB
  schema** (`trust` / `communication` / `billing`) and disjoint `src/modules/<m>/` trees, content
  never logically conflicts; only the prose registries (§3) do, which is why the coordinator owns
  them.
- **One working copy, sequential branch-switching:** only one module branch checked out at a time;
  "parallel" means the chats interleave, not literally simultaneous file writes.
- **Git worktrees** (`git worktree add ../iVendorz-trust wave/3-trust`): the clean way to get true
  parallelism on one machine with its own checkout each. Owner picked "branch per module" not
  "worktrees," but if you hit the one-checkout limit, worktrees are the sanctioned escape hatch
  (precedent: prior waves' isolated-worktree reviews).

**Commit discipline (binding, all sessions):** commit by **explicit path**, never `git add -A`
(interleaved history is fine; blind staging sweeps another session's files). Prove your review gate
stands with a **module-scoped diff** (`git diff <base> <head> -- src/modules/<m> src/server/<m>
prisma inngest`), not the full diff.

---

## 3. Shared-file ownership — DO NOT edit these in a module chat

These are the conflict magnets. **The coordinator chat folds them; module chats hand over the
text.**

| File | Why coordinator-owned | What a module chat does instead |
|---|---|---|
| `generatedDocs/00_AUTHORITY_MAP.md` | one row per doc; parallel edits conflict | hand the coordinator your patch's authority-map row text |
| `generatedDocs/CORPUS_INDEX.md` | same | same |
| `esc_registry.md` | one table; every module wants to add ESC rows | hand the coordinator your `[ESC-*]` entries |
| `generatedDocs/Program_Status_And_Roadmap.md` | single status narrative | coordinator updates per-module status |
| `docs/backend/backend_build_plan.md` | shared WP-card doc | hand the coordinator your `W3-<M>-*` WP card |
| **new `generatedDocs/Doc-*_Patch_*.md`** files | must be registered consistently | draft the PROPOSAL in `governanceReviews/`; coordinator folds the approved corpus copy + registers it |

**`prisma/schema.prisma` — the one nuance.** Each module MUST add its own models locally to run
Prisma generate / migrate / tests, so it can't be purely coordinator-owned. Rule: **append your
models as one contiguous block under a clear `// ── M<n> <schema> ──` banner; touch no other
module's block and no existing model.** Disjoint schemas → clean 3-way merge. The coordinator does
a final consistency pass at integration. Same for `prisma/migrations/` — your migration directory
is yours alone; never edit another module's migration (forward-only, Doc-6A §11).

**Test DB:** if two sessions run integration suites against one Postgres concurrently, they
contaminate each other (prior-wave lesson). Use a **separate test database per module** (distinct
`DATABASE_URL`), or run suites when you hold the tree quiet. Never run a full suite during another
session's active review window on a shared DB.

---

## 4. Per-module scouting (start here — don't re-derive)

### M6 `communication` — GREEN LIGHT (no ruling blocks the read)

- **First slice:** `communication.notifications` table + recipient/participant RLS migration +
  `list_notifications.v1` + `get_notification.v1` (read-only). Follow the M2 `list_vendor_directory`
  slice as the template (keyset cursor, camelCase result per Doc-5A Option B).
- **Field shape:** fully pinned — `Doc-4H_PassB_Part2_BC-COMM-2_Notifications_v1.0.md:92-101`
  (`items[]` + `next_cursor`; row = id, source_event_id, recipient_*, channel, title, body,
  payload_jsonb, status, created_at). **No field-shape patch needed** (unlike M2's directory).
- **POLICY:** RESOLVED — `communication.idempotency_dedup_window` + `list_page_size_max` registered
  in `Doc-3_Policy_Key_Registration_Patch_v1.5_Communication.md`. (Doc-5H Pass-2 text still says
  "unregistered" — **stale**, superseded; use the registered keys, don't re-flag.)
- **Realization notes:** the `unread→read→archived` tri-state is **DERIVED**, not a stored column —
  `read_at` (NULL = unread) + `deleted_at` (archive = soft-delete). No notification "type"/"category"
  field exists — do not coin one. `href`/deep-link has no frozen source — keep out of slice 1.
- **Deferred to the write slice (needs owner rulings FIRST):** `[ESC-COMM-SLUG]` (recipient-scope
  authz without a `check_permission` slug — a genuine tension with Doc-4A; must NOT invent a slug)
  and `[ESC-COMM-AUDIT]` (the module's first audited write, for `mark_notification_read`/`archive`).
  The read slice needs neither.
- **Firewall landmines:** emit NO §8 event (M6 emits none, R11); the notification RECORD is
  M6-owned but the triggering business event stays the producer's (`source_event_id` → M0 outbox,
  read for text only); notification **preferences/rules are Identity-owned (DH-1)**, already at
  `app/(app)/account/notifications/` — NOT M6.
- **Awaiting FE:** `app/(app)/(buyer)/notifications/page.tsx` + `notifications-seed.ts` (full inbox,
  "wired build resolves these from the M6 notification read"); `_components/shell/notification-center.tsx`
  (topbar bell + unread badge); `app/(app)/workspace/notifications/page.tsx` (vendor inbox). VM
  shape `NotificationItem { id, title, body?, href?, read?, timeLabel? }` (`shell/types.ts:66-73`).

### M5 `trust` — schema green; **READ needs an owner ruling first**

- **First slice:** schema for `trust_scores` + `trust_score_history` + `verified_financial_tiers`
  (System-write / admin-read RLS — no INSERT/UPDATE/DELETE policy; the System service writes via
  owner-role/`SECURITY DEFINER`) + a System-actor seed writer + `get_trust_score.v1` /
  `get_verified_tier.v1` reads projecting the seeded rows. No compute engine (out-of-wire, §8).
- **Field shape:** PINNED — `Doc-4G_PassB_Part2_...:162,178` (`get_trust_score` → `{score (null/
  suppressed while frozen), band, trust_score_updated_at, freeze_state, reference_id}`). **No
  "pillars" field** in the frozen contract — don't coin one.
- **POLICY:** not blocking — `[ESC-TRUST-POLICY]` (formula weights/thresholds) is **compute-engine
  only**; the two wire keys are already registered (Doc-3 Patch v1.3).
- **⚠ OPEN GOVERNANCE GAP (raise + get owner ruling BEFORE coding the read):** Doc-6G says *"no
  public read policy on any raw `trust` score table; the raw 0–100 score never leaves M5; the
  public band is M2's reflection"* (`Doc-6G_Content_v1.0_Pass1.md:33`), but Doc-5G/Doc-4G declare
  `get_trust_score.v1` a **Public HTTP read returning the numeric** (`Doc-5G...Pass1.md:116`).
  Reconcilable (RLS = backstop; the app-service reads via owner-role and projects the display-safe
  subset — CLAUDE.md §2), but strong enough wording that a reviewer could read it as forbidding the
  M5 public numeric read. **Owner must rule:** (a) does M5's public `get_trust_score` serve the
  numeric directly, or is public display band-only via M2's reflection; (b) which path fills M2's
  deferred `TrustIndicators`. Draft this as a proposal (like M2's slug/projection patches) and route
  through the coordinator to fold.
- **Consumer correction:** M2's public badge is NOT fed by a live M5 call — it's fed by M2's own
  event-reflected read-model (`vendor_matching_attributes.trust_band`, band-only). So un-deferring
  M2's `TrustIndicators` needs the **cross-module event path** (M5 emits `TrustScoreUpdated` → M2
  consumes), which is a LATER slice. The true first-slice consumer is the **vendor workspace
  P-VND-28** trust cards.
- **Firewall landmines:** never expose formula/thresholds/weights/raw inputs; no score is ever a
  wire INPUT; no INSERT/UPDATE/DELETE RLS on score tables; suppress band for a `frozen` score
  (Not-Rated ≠ 0); Financial Tier / Performance / Fraud / commercial state must NEVER feed Trust
  Score (Invariant #6); no cross-score columns or cross-schema FKs; fraud/admin-rating/verification
  detail never on a public read.
- **Awaiting FE:** `src/frontend/embedded/trust-badge.tsx` ("wired when M5 lands");
  `app/(app)/_components/vendor/trust/{trust-score-card,...}.tsx` (P-VND-28, `types.ts` matches the
  three frozen reads field-for-field — the true first consumer); `app/(public)/trust/page.tsx` +
  `vendor-verified-badge.tsx` (anonymous, binary "Verified" only, numeric deferred behind
  `[ESC-7G-SCORE-DISPLAY]` — note a possible live inconsistency vs the Trust-display ruling that
  permits public numeric; confirm with owner alongside the gap above).

### M7 `billing` — **Flag-and-Halt before schema/read**

- **First slice:** BILL-1 catalog — `plans` + `entitlements` + `plan_entitlements` schema + RLS
  (public-read / admin-write) + Prisma models + migration + `get_plan.v1` / `list_plans.v1` reads +
  an owner-approved catalog seed.
- **Field shape:** pinned — `Doc-4I_PassB_Part1_v1.0_FROZEN.md:273` (`get_plan` → `{plan_id, name,
  billing_cycle, price, currency, status, is_active, entitlements:[{entitlement_id, slug, type,
  value}]}`). Any added field = `[ESC-BILL-FIELD]` Flag-and-Halt.
- **ESCs already RESOLVED:** `[ESC-BILL-ADMINSCOPE]` (Option A), `[ESC-BILL-ACTIVATE]` (→ additive
  `activate_plan.v1`), `[ESC-BILL-POLICY]` (page-size/dedup keys registered, Doc-3 Patch v1.6).
- **🔴 OPEN GOVERNANCE GAP #1 (Flag-and-Halt — verify then raise BEFORE coding):** the contract
  layer (Doc-4I §HB-1.1/1.1a + Doc-5I §4) models plans with a **`status` enum{draft|active|retired}
  state machine PLUS a distinct `is_active` marketing bool**, but the frozen schema
  (`Doc-6I_Content_v1.0_Pass1.md:39-47`) has **no `status` column — only `is_active`**. `get_plan`/
  `list_plans` output REQUIRES `status`. Cross-frozen-doc conflict (Doc-6I ↔ Doc-4I/Doc-5I) →
  **Flag-and-Halt (CLAUDE.md §11)**; needs an owner-ruled additive Doc-6I patch (add a `status`
  column, or a documented derivation e.g. `draft = !is_active / active = is_active / retired =
  deleted_at`). Verify the cites yourself, then draft the patch proposal and route through the
  coordinator.
- **🟡 OPEN GOVERNANCE GAP #2 (data/governance decision):** the **entitlement slug set is NOT
  pinned** — the corpus gives only *illustrative* slugs (ADR Compendium says "illustrative /
  marketing configuration"). The first slice's seed (entitlement slugs + plan→entitlement mapping)
  needs **owner approval** — there's nothing frozen to bind to. Not a code blocker, but the seed
  can't be authored without this ruling.
- **FE tension:** `app/(public)/pricing/pricing-plans.tsx` is **anonymous**, but Doc-5I §3.1 says
  the catalog is readable by "any *authenticated* user" — resolve whether `/pricing` needs an
  anon-readable catalog variant (owner question) before wiring that page.
- **Firewall landmines:** entitlements-only, never plan-name as the gate (Invariant #10 — resolve
  by `value_jsonb`/`default_value`); no Financial-Tier (M5) coupling; no billing state feeds
  trust/matching/routing/eligibility; money-boundary (`platform_invoices` ≠ any trade invoice, never
  model buyer↔vendor money); BILL-1 emits no §8 event; `org_id` never caller-supplied
  (server-derived active-org).
- **Awaiting FE:** `app/(public)/pricing/pricing-plans.tsx` (P-PUB-04) + `app/(app)/account/billing/
  plans-catalog.tsx` (P-ACC-16) — both name the exact `list_plans` projection and derive "current
  plan" from entitlements, not plan-name.

---

## 5. The fold protocol (how a module chat gets a patch/ESC into the corpus)

1. Module chat drafts the realization patch as a **PROPOSAL** in `governanceReviews/`
   (`Doc-<n>_<Thing>_Additive_Patch_PROPOSAL.md`), following the precedent structure
   (status/scope/purpose table → patch body → "this patch does NOT" → conformance self-check). Get
   the **owner ruling** in-chat (architecture-affecting → human approval, CLAUDE.md §8).
2. Once ruled, hand the coordinator: the approved patch text + the authority-map row + the corpus-
   index line + the ESC-registry row + your `W3-<M>-*` WP card.
3. Coordinator writes the FOLDED `generatedDocs/` copy, registers it across the 6 shared files
   consistently, and confirms back. Then the module chat builds against it.
4. Module chat runs its own Review-A / Review-B / Team-6 gate on its slice (fresh contexts), applies
   accepted fixes, and commits to its own branch by explicit path.

---

*Non-authoritative coordination note. On any conflict the frozen corpus wins. Maintained by the
coordinator (M2) chat; each module chat reads it before touching shared files.*

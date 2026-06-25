# Doc-5I Content v1.0 Pass-1 — Independent Hard Review

| Field | Value |
|---|---|
| Document | Doc-5I Content v1.0 Pass-1 — Independent Hard Review |
| Reviews | `Doc-5I_Content_v1.0_Pass1.md` |
| Verdict | **CONDITIONAL PASS — patch before Pass-2 begins** |
| Findings | **0 BLOCKER · 0 MAJOR · 4 MINOR · 3 NITPICK** |
| Blocks Pass-2? | No — patch is patch-in-place; all findings are correction-not-blocker |
| Authority | `Doc-5A_SERIES_FROZEN_v1.0`; `Doc-4I_FROZEN_v1.0`; `Doc-5I_Structure_v1.0_FROZEN.md` |
| Board | Architecture Board · API Governance Board |

---

## Review Scope

Checks Pass-1 against: frozen corpus (Doc-4I, Doc-5A, Doc-2, Doc-5I Structure FROZEN); §2 inventory path/method/status/actor correctness; §3 binding registers for completeness and consistency; anti-invention; cross-cutting rule application; state-machine diagram accuracy; non-disclosure model correctness.

---

## MINOR Findings

### m-01 — §3.6 inconsistently applies Admin cross-cutting read rule

**Severity:** MINOR  
**Location:** §3.6 Per-Read Disclosure-Scope Register (rows 3–4, 6–7, 8, 10–11)

**Problem.** The frozen structure §3 establishes a binding cross-cutting rule: "Own-Org (User reads only their own org's billing data; **Admin reads any org**; plan catalog is platform-public)". This is a platform-wide read grant to Admin on all Own-Org scoped billing reads. However, §3.6 applies "Admin reads any org" selectively:

- `billing.get_usage.v1` — "Admin reads any org" ✓ (Admin mentioned)
- `billing.list_platform_invoices.v1` — "Admin reads any org" ✓ (Admin mentioned)
- `billing.get_subscription.v1`, `billing.list_subscription_events.v1`, `billing.get_lead_balance.v1`, `billing.list_lead_transactions.v1`, `billing.get_platform_invoice.v1`, `billing.get_reward_balance.v1`, `billing.list_referrals.v1` — no Admin mention ✗

A content author writing §5 reads §3.6 and sees no Admin clause for `get_subscription` — they implement Admin-cannot-read-subscription. But the binding §3 cross-cutting rule from the frozen structure grants Admin platform-wide read. The inconsistency produces a content blocker downstream.

**Note on §2:** The frozen structure partition table declares all billing reads as "21.3 User query" (not "User / Admin"). The §2 inventory correctly follows this. The Admin access is a cross-cutting grant from §3 (not a partition-level actor change), so §2 is correct as written. The issue is solely within §3.6's inconsistent register.

**Fix.** Apply "Admin reads any org" consistently to all 9 Own-Org scoped reads in §3.6. Scope note format: "Own-Org — User reads own active org's data; cross-org → `NOT_FOUND`; Admin reads any org (cross-cutting §3 grant; `Doc-5I §3 / Doc-5I_Structure_v1.0_FROZEN §3`)."

---

### m-02 — §3.4 Controlling Organization write-rejection missing HTTP status

**Severity:** MINOR  
**Location:** §3.4 Controlling Organization section

**Problem.** §3.4 states: "Any write to a billing aggregate that does not match the Controlling Organization resolved from the server-validated session is rejected." No HTTP status is specified. A content author for §5 (`purchase_subscription`) or §8 (`issue_platform_invoice`) needs to know what to return when a write's implied `org_id` does not match the server-resolved Controlling Organization.

The correct status is `403 FORBIDDEN` (authorization violation — the caller is authenticated but acting outside their org boundary). This is **not** `404 NOT_FOUND` (which is reserved for the non-disclosure pattern on reads, §3.5) and **not** `422 VALIDATION` (which is for input shape errors).

**Fix.** Add to §3.4 Controlling Organization section: "A write request whose implied Controlling Organization does not match the server-validated active org → `403 FORBIDDEN`. This is an authorization rejection, not a non-disclosure concern (reads → `NOT_FOUND`; writes → `FORBIDDEN`)."

---

### m-03 — §3.6 `list_plans` adds behavioral claim ("Admin may filter including retired") not anchored to frozen corpus

**Severity:** MINOR  
**Location:** §3.6, row `billing.list_plans.v1`

**Problem.** §3.6 row for `billing.list_plans.v1` adds: "Admin may filter including retired". This is a **behavioral claim** (query parameter / filter capability) not declared in the frozen structure §4, not derivable from Doc-5A §5, and not confirmed against Doc-4I §HB-1.2. The §3.6 register governs **disclosure scope only** (Platform-Public / Own-Org / Not-Found behavior) — it is not the place for filtering behavior.

Specifically: whether Admin can filter `GET /billing/plans?status=retired` is a §4 content decision that must be grounded in `Doc-4I §HB-1.2` (`list_plans` purpose + query parameters). Stating it here: (a) places BC-specific behavior in the cross-cutting section, violating the mechanism-only rule for §3; (b) may be anti-invention if `Doc-4I §HB-1.2` doesn't declare this filter.

**Fix.** Remove "Admin may filter including retired" from §3.6. Replace the scope note with: "Platform-Public — any authenticated User reads active plans; Admin reads platform-wide (including filtered states per `Doc-4I §HB-1.2` — declared in §4 content)." The filtering behavior is delegated to §4.

---

### m-04 — §3.4 subscription diagram misleads: `cancel_subscription` arrow appears to directly trigger expire

**Severity:** MINOR  
**Location:** §3.4, Subscription State Machine ASCII diagram

**Problem.** The diagram's arrow from `cancel_subscription` visually points downward to `expire_subscription`:

```
   cancel_subscription│  auto_renew=false;
   (User, §5)         │  runs to period end
                      ▼
     expire_subscription (System job, §10)
```

This notation reads as: `cancel_subscription` → leads to → `expire_subscription`. In reality, `cancel_subscription` only sets `auto_renew=false` on the **active** subscription; the subscription state remains `active`. The `expire_subscription` System job fires **independently at period end**, not as a consequence of cancel. A developer reading the diagram as-is may implement `cancel_subscription` as synchronously transitioning the subscription toward expired, bypassing the period-end window.

The per-edge attribution table below the diagram is correct: "Sets `auto_renew=false`; subscription runs to period end" and "active → expired | `expire_subscription` | System period-end job". But the diagram contradicts the table.

**Fix.** Redraw the cancel edge as a self-loop on `active` (not an arrow to expire):
```
  active ──── cancel_subscription ────► active  (auto_renew=false; runs to period end)
  active ──── expire_subscription  ────► expired (System job fires at period end, auto_renew must be false OR period ends)
```
Alternatively annotate the arrow: "cancel sets flag only — does NOT directly trigger expire; expire fires independently at period end per System job."

---

## NITPICK Findings

### NP-01 — §3.7 Admin "platform-staff predicate" lacks Doc-4A anchor citation

**Severity:** NITPICK  
**Location:** §3.7, all 6 Admin command rows

All 6 Admin rows say "interim: platform-admin gate resolved via `check_permission` against the platform-staff predicate". The "platform-staff predicate" concept needs a Doc-4A or Doc-4C citation. The predicate is defined in the actor model (`Doc-4A §5.3/§5.4` or `Doc-4C §C3` — where platform-staff role/predicate is formally defined). Without the anchor, a content author cannot locate the authoritative definition. Add `Doc-4A §5.3` or `Doc-4C §C8` (whichever defines the platform-staff actor) to the note.

---

### NP-02 — §3.2 check_permission pseudocode: `resource` field should be `'billing'` but `action` can vary per §3.7 register

**Severity:** NITPICK  
**Location:** §3.2, check_permission pattern

The pseudocode shows `resource: 'billing'` (fixed) and `action: <slug>` (variable). This is correct. However, the comment "see §3.7 per-command actor-side register" tells content authors to look up the slug — but the register covers **commands only**. Reads also go through `check_permission` (with `can_view_billing` or authentication-only for catalog reads). The pseudocode's forward reference should include both §3.6 (reads) and §3.7 (commands): "see §3.6/§3.7 disclosure-scope and actor-side registers for per-endpoint action value."

---

### NP-03 — §0.4 Flag-and-Halt list omits the R11 System-leg HTTP-exposure risk

**Severity:** NITPICK  
**Location:** §0.4 Flag-and-Halt triggers

§0.4 covers R1 (out-of-wire contracts), R8 (record_payment), and R10 (resolve_entitlements/enforce_quota). It does not explicitly call out a related risk for R11 actor-branched contracts: the System leg of an actor-branched contract must remain in-process and **never be routed through the User-leg HTTP endpoint as a server-to-server caller** (that would constitute a hidden internal HTTP wire). This is a subtle misuse vector distinct from R1's out-of-wire boundary. Suggested addition: "Route the System leg of any R11 actor-branched contract through the User-leg HTTP endpoint as a caller (System legs are always in-process, not HTTP callers — `R11`)."

---

## Passed Checks (no finding)

| Check | Status |
|---|---|
| 26 inventory rows — count 8+4+1+4+4+5=26 | **PASS** |
| All 26 contract tokens verbatim from Doc-4I (`billing.<operation>.v1`) | **PASS** |
| Creates → `201`; domain commands → `200`; reads → `200` | **PASS** |
| Paths use hyphen-case URL convention; tokens use underscore | **PASS** |
| Version not in path (`Iv-Api-Version` header declared) | **PASS** |
| No public/anonymous actor on any endpoint | **PASS** |
| Actor-branched contracts counted once; `†` footnote correct | **PASS** |
| §3.1 actor model — User/Admin/System/Public-FORBIDDEN | **PASS** |
| §3.2 `check_permission` = sole authority; no shadow path | **PASS** |
| §3.3 BF-1…5 billing firewall wire constraints | **PASS** |
| §3.4 subscription machine per-edge attribution (R7 M-02 fix carried forward) | **PASS** |
| §3.4 plans machine per-edge attribution | **PASS** |
| §3.4 Controlling Organization anchor (DF-BILL-1; `Doc-4C §C8`; `Doc-4I §H.3`) | **PASS** |
| §3.5 non-disclosure `NOT_FOUND` collapse — cross-tenant read, missing resource, vs `403` | **PASS** |
| §3.6 — 11 reads registered = §2 read count ✓ | **PASS** |
| §3.7 — 15 commands registered = §2 command count ✓; 6 Admin + 2 User + 7 actor-branched | **PASS** |
| Anti-invention: no slug/event/POLICY key/path not derivable from frozen corpus | **PASS** |
| §1.4 carried items = 12 items; `[ESC-BILL-POLICY]` = Tracked | **PASS** |
| §0 precedence chain correct and complete | **PASS** |
| §1.3 dependency boundary table covers all 6 cross-module seams | **PASS** |
| No cross-module surface realized | **PASS** |
| Singleton resource pattern for lead-account/reward-account/usage correct | **PASS** |
| `record_payment` NOT in inventory (correctly out-of-wire §10) | **PASS** |
| `resolve_entitlements`/`enforce_quota` NOT in inventory (correctly out-of-wire §10) | **PASS** |

---

## Required Patch Actions

| Finding | Action | Where |
|---|---|---|
| **m-01** | Apply "Admin reads any org (§3 cross-cutting)" to all 9 Own-Org reads in §3.6 | §3.6, rows 3–4, 6–11 |
| **m-02** | Add: cross-org write → `403 FORBIDDEN` (not `404`, not `422`) | §3.4, Controlling Org section |
| **m-03** | Remove "Admin may filter including retired" from §3.6 `list_plans` row; delegate to §4 | §3.6, row 2 |
| **m-04** | Redraw or annotate cancel_subscription diagram edge: state stays `active` (flag only); expire fires independently | §3.4, subscription diagram |
| NP-01 | Add Doc-4A/Doc-4C anchor to "platform-staff predicate" in §3.7 Admin rows | §3.7 |
| NP-02 | Extend §3.2 forward reference to cover both §3.6 (reads) and §3.7 (commands) | §3.2 |
| NP-03 | Add R11 System-leg wire-exposure to §0.4 flag-and-halt triggers | §0.4 |

---

*End of Doc-5I Content Pass-1 Hard Review. Verdict: CONDITIONAL PASS. 0 BLOCKER · 0 MAJOR — patch m-01…m-04 before Pass-2; NP-01…03 recommended same pass. Pass-2 (§4 BC-BILL-1, §5 BC-BILL-2, §6 BC-BILL-3) may begin after patch.*

# Doc-7H — Content Pass-1 (§0–§7) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7H_Content_v1.0_Pass1.md` (§0–§7) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Doc-5J conformance + firewall + cross-surface distinctness |
| Verdict | **NOT YET PASS** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

- §2–§7 ↔ Doc-5J BC-ADM-1…6 (verified lines 41–46). CORRECT.
- §3.2 `issue_ban` → **`VendorBanned`** (single event, R9); §3.3 ban ≠ blacklist — CORRECT.
- §6.2 Trust firewall (verification_tasks ≠ trust records; console writes no score) — CORRECT.
- §7.2 moat (outreach informational, R7); §5.1 create-then-poll System job — CORRECT.

0 BLOCKER, 0 MAJOR — the core Doc-5J surface + firewalls are sound. Three distinctness/precision refinements + one nit.

### MINOR-1 — §2/§3 clarify moderation-decision ≠ ban (separate commands)
A moderation case (`decide_moderation_case`, BC-ADM-1) and a ban (`issue_ban`, BC-ADM-2) are **separate Admin commands**. Deciding a moderation case does **not** auto-issue a ban — a ban is a distinct, explicit action (and emits `VendorBanned`).
**Required fix:** §2/§3 note — `decide_moderation_case` records the moderation outcome; a **ban is a separate, explicit `issue_ban`** (not automatic from a moderation decision). The two BCs are distinct surfaces.

### MINOR-2 — §4.2 conflates the M8 admin link suggestion with the buyer-private CRM link
§4.2 says confirming/dismissing a link "never reveals a **buyer's** private association." But the M8 `confirm_/dismiss_link_suggestion` (BC-ADM-3) is the **Admin's staff-internal link triage** (`Doc-5J R6`) — **distinct** from the **buyer-private CRM vendor-link** (`confirm_/dismiss_vendor_link`, Doc-5F BC-OPS-1, realized in Doc-7F §8.5). Both are non-disclosure-sensitive, but they are **different surfaces**.
**Required fix:** §4.2 distinguish — the M8 link suggestion is the **Admin's staff-internal** link triage (R6; never exposed to a tenant); the **buyer-private CRM vendor-link** is Doc-5F/Doc-7F (private to the buyer). Don't conflate; both non-disclosure-bound, distinct owners.

### MINOR-3 — §5.1 pin the async accepted-then-poll path
§5.1 references "ASYNC_PENDING." Pin it: `submit_import_job` create-then-poll uses the **async accepted-then-poll** surface (`Doc-5A §10` — 202 Accepted + poll the status resource), **not** the §6 error envelope (`ASYNC_PENDING` is not an error class — `Doc-7A §5.3`).
**Required fix:** §5.1 state the import uses the **async status-resource poll** (`Doc-5A §10`; 202 + poll), the loading/progress rendered via the Doc-7B status primitives — not an error.

### NITPICK-1 — §2.2 "Org-scoped-by-target" phrasing
**Required fix:** rephrase to "the case **references a target by ID**; the Admin has **no active-org**" (consistent with §1).

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 moderation-decision ≠ ban | MINOR | Content Patch — note separate commands |
| MINOR-2 M8 link ≠ buyer-private link | MINOR | Content Patch — distinguish surfaces |
| MINOR-3 async accepted-then-poll | MINOR | Content Patch — pin Doc-5A §10 |
| NITPICK-1 §2.2 phrasing | NIT | Content Patch — rephrase |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR. 3 MINOR open → **Content Patch required**, then short closure check, then Content Pass-2 (§8–§11 + Appendix).

*End of Content Pass-1 Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — core Doc-5J surface + firewalls sound; three refinements sharpen cross-surface distinctness (moderation≠ban, M8-link≠buyer-link) and the async import path.*

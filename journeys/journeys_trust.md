# Journeys — Trust & Verification (M5)

**Breadcrumb:** [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) ▸ File B — Trust & Verification
**Status:** **DRAFT v1.0** — non-authoritative companion (atlas §0 stance applies in full)
**Date:** 2026-07-06
**Owner module:** M5 Trust & Verification (`trust` · Doc-4G)
**Journeys:** J-VER · J-TIER · J-TSC · J-PSC · J-REV · J-FRD
**Legend/notation:** atlas §2 · **Actor journeys composed:** `J-VND` §5, `J-ADM` §7
(marketplace_ux.md)

> **Authority stance.** Non-authoritative companion. States resolve to **Doc-2 §5.6 + §3**;
> contracts to **Doc-4G** (BC-TRUST-1…5); the admin queue leg to **Doc-4J** (seam M6-5 —
> *Admin decides, Trust owns*). The **§4 firewall (CLAUDE.md) is binding on every journey here**:
> Financial Tier never raises Trust Score; Financial Tier does not affect Performance Score;
> buyer-private status never mutates platform scores; scores are **auto-calculated under the
> System actor, never hand-edited**. Display limits follow the **Board Trust-Score display ruling
> (2026-07-03)**: Trust Score may render band + numeric + badges + "last updated" + 4 categorical
> pillars; **never** formula, matching weight, fraud signals, ranking, confidence, hidden
> penalties, or percentiles; Performance Score renders **band-only**. On any conflict the frozen
> corpus wins and this file is patched.

---

## B1. Vendor Verification Lifecycle — `J-VER`

**Breadcrumb:** Atlas ▸ Trust ▸ Vendor Verification Lifecycle

| Ownership | |
|---|---|
| Owner Module | M5 Trust (BC-TRUST-1; storage + record) |
| Participating Modules | M8 Admin (queue + decision via `verification_tasks`, seam M6-5); M2 Marketplace (claim reflection, seam M6-8); M6 (notifications) |
| Authoritative Documents | Doc-2 §5.6, §3 (`verification_records`, `verification_decisions`); Doc-4G BC-TRUST-1; Doc-4J (admin queue) |
| Read-only References | Doc-7G (vendor view) · Doc-7H (admin console) |

**Actors:** Primary — vendor User (submits). Supporting — Admin (decides via M8 task). ⚙ System —
`trust.expire_verification.v1` (periodic lapse).

**Intent arc:** Claim → Evidence → Scrutiny → Standing.
**Goal:** convert a vendor's claims (identity, business, factory, capacity, declared tier) into
platform-owned verification records — the "Verified Vendor Network" differentiator.

**Entry:** vendor profile claim `[claimed]` (Doc-2 §5.3) with a controlling organization.
**Exit:** record `[approved]` (→ seam M6-8: claim `[claimed] → [verified]`) — or `[rejected]`,
or later `[expired]`/`[revoked]`.

```
[requested] → assign → [in_review] → approve → [approved] → lapse → [expired]
     ▲                      │                        └─ revoke [fraud/compliance] → [revoked]
     └── request more info ─┘        [in_review] → reject → [rejected]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §5.6) | Outcome / governance |
|---|---|---|---|---|
| J-VER-01 | Request | `trust.request_verification.v1` (subject: `vendor_profile`/`organization`/`capacity_claim`/`declared_tier` — **fixed enum, never extended**) | `[requested]` | Submission scope = the org that owns the subject |
| J-VER-02 | Queue & assign | `trust.assign_verification.v1` — Admin task via M8 `verification_tasks` (→ `J-VQ`) | `[requested] → [in_review]` | **M8 queues; M5 owns the record** (M6-5) |
| J-VER-03 | Correction loop | request more info | `[in_review] → [requested]` | Evidence resubmission — not a rejection |
| J-VER-04 | Decide | `trust.decide_verification.v1` (decision stored in `verification_decisions`) | `→ [approved]` / `[rejected]` | *Admin decides, Trust owns*; emits `(VendorVerified)` on approval |
| J-VER-05 | Reflect | seam M6-8 → M2 claim `[claimed] → [verified]` | — | Verified badge = **binary** on public surfaces |
| J-VER-06 | Lapse | ⚙ `trust.expire_verification.v1` (periodic review / document expiry) | `[approved] → [expired]` | Standing is maintained, never permanent |
| J-VER-07 | Revoke | `trust.revoke_verification.v1` (fraud/compliance) | `[approved] → [revoked]` | Feeds J-FRD context; audited |

**Governance rails:** verification and verified-tier are **platform-owned** (Doc-4G H.9a) — the
vendor can request and read, never decide; verification inputs may feed Trust Score computation
(J-TSC) only inside M5; no journey step discloses reviewer identity or internal scrutiny notes.
**Success:** ✔ record decided with stored decision; ✔ approval reflected to the claim dimension
via seam (never by M8 writing M2 tables); ✔ expiry/revocation paths live, audited.

**Related:** upstream J-CLM (claim standing) · admin leg J-VQ · downstream J-TSC (input),
J-TIER (tier-type verification) · composed by `J-VND-07`, `J-ADM-02`.

---

## B2. Verified Financial Tier Lifecycle — `J-TIER`

**Breadcrumb:** Atlas ▸ Trust ▸ Verified Financial Tier Lifecycle

| Ownership | |
|---|---|
| Owner Module | M5 Trust (verified-tier record) |
| Participating Modules | M2 Marketplace (declared tier; consumer-as-writer of `financial_tier_history`, seam M6-3) |
| Authoritative Documents | Doc-2 §5.6 (verified-tier statuses; *Declared = absence of record*); Doc-4G |
| Read-only References | Doc-7G · Doc-7D (display) |

**Actors:** Primary — Admin/Trust reviewer (tier decisions). Supporting — vendor (declares in M2).
⚙ System — `trust.expire_verified_tier.v1` (24-month review lapse).

**Intent arc:** Declaration → Proof → Standing → Review.
**Goal:** turn a vendor's **declared** financial tier (A–E, an M2 self-claim) into a
**platform-verified** tier with periodic review.

**Entry:** declared tier exists in M2 (`set_declared_financial_tier`) — represented by the
**absence** of a verified-tier record (one business state, one authoritative source).
**Exit:** verified-tier record `[verified]` (24-month review cycle) — or `[suspended]`/`[expired]`
(falls back to declared).

```
(declared = no record) → [pending_verification] → [verified] ⇄ [suspended] → …
                                   [verified] → 24-month lapse → [expired]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §5.6) | Outcome / governance |
|---|---|---|---|---|
| J-TIER-01 | Declare (M2) | `set_declared_financial_tier` (marketplace) | — (absence of record) | **Declared ≠ verified** (`J-VND-02`) |
| J-TIER-02 | Open verification | `trust.set_verified_tier.v1` | `[pending_verification]` | Evidence rides J-VER (subject `declared_tier`) |
| J-TIER-03 | Confirm | `trust.confirm_verified_tier.v1` | `→ [verified]` | Emits `(VendorTierChanged tier_type='verified')` → seam M6-3: **M2 writes `financial_tier_history`** |
| J-TIER-04 | Downgrade | `trust.downgrade_verified_tier.v1` | `[verified]` (new value) | History appended, never rewritten |
| J-TIER-05 | Suspend / restore | `trust.suspend_verified_tier.v1` | `[verified] ⇄ [suspended]` | Compliance hold |
| J-TIER-06 | Lapse | ⚙ `trust.expire_verified_tier.v1` (24-month review) | `→ [expired]` | Falls back to declared |

**Governance rails (firewall — binding):** Financial Tier **never raises Trust Score**; Financial
Tier **does not affect Performance Score**; tier is a **capability signal**, never a subscription
artifact (Invariant #10); tier changes reach M2 **only** via the M6-3 event — M5 never writes
marketplace tables.
**Success:** ✔ verified standing time-boxed (24-month review); ✔ every change in
`financial_tier_history` (append-only); ✔ zero firewall crossings.

**Related:** upstream J-VER (evidence), J-CLM (declared leg) · downstream matching eligibility
gates in M3 (by pointer — Doc-3) · composed by `J-VND-02/07`.

---

## B3. Trust Score Update Journey — `J-TSC` (⚙ System)

**Breadcrumb:** Atlas ▸ Trust ▸ Trust Score Update Journey

| Ownership | |
|---|---|
| Owner Module | M5 Trust (BC-TRUST-2) |
| Participating Modules | display surfaces only (M2 public, Doc-7D/7F/7G) — read via service |
| Authoritative Documents | Doc-2 §8 (score events); Doc-4G BC-TRUST-2; CLAUDE.md §4 |
| Read-only References | Board Trust-Score display ruling (2026-07-03) |

**Actors:** ⚙ System (computation). Supporting — Admin (freeze/reactivate legs, protection
workflow). **No user actor** — scores are never hand-edited.

**Intent arc:** Signals → Computation → Standing → Display.
**Goal:** maintain the platform-wide Trust Score (0–100) as a **derived aggregate** — explicitly
**not a state machine** (Doc-4M §M3 note): the journey is a flow of score-update events, drawn
with **no state graph**.

**Entry:** any qualifying signal lands (verification outcomes, performance inputs, fraud
dispositions — inside M5 only).
**Exit:** recomputed score + appended history row; display surfaces read the fresh value.

```
signals (M5-internal) ─▶ ⚙ compute ─▶ score + history append ─▶ display (band + numeric + pillars)
        protection workflow (M6-7): freeze ─▶ compliance review ─▶ reactivate
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| J-TSC-01 | Ingest | qualifying M5-internal signals | **No secondary signal dominates trust** (§4) |
| J-TSC-02 | Compute | ⚙ `trust.compute_trust_score.v1` | System actor only — never hand-edited |
| J-TSC-03 | Record | score history append (`trust.list_trust_score_history.v1` reads) | Append-only (Invariant #8) |
| J-TSC-04 | Freeze / reactivate | `trust.freeze_trust_score.v1` / `trust.reactivate_trust_score.v1` | Trust Protection Workflow on ownership transfer (seam M6-7 → J-VOT) |
| J-TSC-05 | Display | `trust.get_trust_score.v1` (read-only, any surface) | Band + numeric + badges + "last updated" + 4 categorical pillars allowed; **never** formula/weights/fraud/ranking/confidence/percentile (Board ruling 2026-07-03) |

**Governance rails (firewall — binding):** Financial Tier never raises Trust Score; buyer
Approved/Blacklisted **never** mutates it (Invariant #11 stays display-silent); no single signal
dominates a matching decision; M2 **reads** trust scores, never calculates (module boundary note).
**Success:** ✔ every recompute attributed to ⚙ System; ✔ history append-only; ✔ display within
the ruling's envelope; ✔ freeze/reactivate only via the protection workflow.

**Related:** inputs J-VER, J-PSC, J-FRD (M5-internal) · freeze trigger J-VOT · displayed in
`J-GST-04`, `J-VND-07`.

---

## B4. Performance Score Update Journey — `J-PSC` (⚙ System)

**Breadcrumb:** Atlas ▸ Trust ▸ Performance Score Update Journey

| Ownership | |
|---|---|
| Owner Module | M5 Trust (BC-TRUST-3) |
| Participating Modules | M3/M4 outcomes arrive as inputs by pointer (RFQ closure, engagement completion, WCC); display surfaces read band-only |
| Authoritative Documents | Doc-2 §8; Doc-4G BC-TRUST-3; CLAUDE.md §4 |
| Read-only References | Board display ruling (Performance = band-only) |

**Actors:** ⚙ System (ingest + compute). Supporting — Admin (freeze/reactivate, review trigger).

**Intent arc:** Delivery → Evidence → Measurement → Standing.
**Goal:** maintain the Performance Score (0–100) from **completed procurement outcomes** — a
derived aggregate, not a state machine; no state graph drawn.

**Entry:** a qualifying outcome exists — e.g. engagement `[completed]` (J-ENG), WCC issued
(J-WCC), published Buyer Feedback review (J-REV).
**Exit:** recomputed score + history append; band-only display refreshed.

```
outcomes (RFQ / engagement / WCC / published reviews) ─▶ ⚙ ingest ─▶ ⚙ compute ─▶ history append ─▶ band-only display
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| J-PSC-01 | Ingest | ⚙ `trust.ingest_performance_input.v1` (`trust.list_performance_inputs.v1` reads) | Inputs by pointer from owning modules — M5 never reads foreign tables |
| J-PSC-02 | Compute | ⚙ `trust.compute_performance_score.v1` | System actor only |
| J-PSC-03 | Review trigger | `trust.trigger_performance_review.v1` | Governed re-evaluation, audited |
| J-PSC-04 | Freeze / reactivate | `trust.freeze_performance_score.v1` / `trust.reactivate_performance_score.v1` | Protection workflow legs |
| J-PSC-05 | Display | `trust.get_performance_score.v1` (`trust.list_performance_score_history.v1`) | **Band-only** on all surfaces (Board ruling) |

**Governance rails (firewall — binding):** Financial Tier does **not** affect Performance Score;
win-rate style metrics use *received invitations* as denominator, never all-matchable RFQs
(marketplace_ux.md §6 rail); formal invitation decline has **zero negative performance effect**
(Doc-3 §8.4); quotation withdrawal counts as a response with no performance-score penalty, though
habitual late-withdrawal patterns feed Quote Quality / matching confidence (Doc-3 §8.3) —
outside this score.
**Success:** ✔ inputs traceable to frozen outcomes; ✔ System-only computation; ✔ band-only
display everywhere.

**Related:** inputs from J-ENG/J-WCC/J-REV · feeds J-TSC (M5-internal) · displayed in `J-VND-07`.

---

## B5. Public Review Lifecycle — `J-REV`

**Breadcrumb:** Atlas ▸ Trust ▸ Public Review Lifecycle

| Ownership | |
|---|---|
| Owner Module | M5 Trust (BC-TRUST-5, `public_reviews` AR) |
| Participating Modules | M4 (engagement referenced by UUID, service-validated); M2 (displays via service — never table access); M8 (moderation actor) |
| Authoritative Documents | Doc-2 §3 (`public_reviews`), §10.6; Doc-4G BC-TRUST-5 |
| Read-only References | Doc-7D (public display) · Doc-7F (author) |

**Actors:** Primary — buyer User (author). Supporting — Admin (moderate/publish/remove).

**Intent arc:** Experience → Voice → Scrutiny → Public record.
**Goal:** a post-award, engagement-anchored review — never drive-by ratings.

**Entry:** an engagement exists between author org and vendor (**post-award only** — engagement
reference required, service-validated).
**Exit:** review `[published]` (public, feeds Buyer Feedback inputs) — or `[rejected]`/`[removed]`.

```
[submitted] → moderate → [approved] → publish → [published] → remove → [removed] (hidden, soft-delete)
                  └────→ [rejected]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-REV-01 | Submit | `trust.submit_review.v1` (rating 1–5 + body; engagement ref) | `[submitted]` | Post-award only; author org recorded |
| J-REV-02 | Moderate | `trust.moderate_review.v1` (Admin) | `→ [approved]` / `[rejected]` | `moderated_by/at` recorded |
| J-REV-03 | Publish | `trust.publish_review.v1` (Admin) | `[approved] → [published]` | Public read; **feeds `performance_inputs` (Buyer Feedback) within Trust** (→ J-PSC) |
| J-REV-04 | Remove | `trust.remove_review.v1` (Admin) | `[published] → [removed]` | Hidden = soft delete (Invariant #8) |
| J-REV-05 | Display | Marketplace reads **via service** | `[published]` only | Never cross-module table access |

**Governance rails:** admin ratings are a separate instrument (`trust.set_admin_rating.v1`), never
merged into public reviews; review content is Content, its placement is Presentation (Invariant
#9); no review step mutates a score directly — publication only *feeds inputs*.
**Success:** ✔ every published review anchored to a real engagement; ✔ moderation trail recorded;
✔ removal hides, never erases.

**Related:** upstream J-ENG/J-WCC (the engagement) · feeds J-PSC · displayed in `J-GST-04`;
moderation leg composed by `J-ADM-01`.

---

## B6. Fraud & Risk Signal Lifecycle — `J-FRD` (⚙ System / staff)

**Breadcrumb:** Atlas ▸ Trust ▸ Fraud & Risk Signal Lifecycle

| Ownership | |
|---|---|
| Owner Module | M5 Trust (BC-TRUST-4) |
| Participating Modules | M8 (investigation ops leg → J-CMPL); enforcement effect via J-BAN (M8 → M2) |
| Authoritative Documents | Doc-4G BC-TRUST-4; Doc-2 §3 (`fraud signals`) |
| Read-only References | Doc-7H (staff console) |

**Actors:** ⚙ System (signal creation may be automated) + staff User. **Never** vendor/buyer
visible.

**Intent arc:** Anomaly → Signal → Scrutiny → Disposition.
**Goal:** capture and adjudicate fraud/risk signals **without ever disclosing them** — fraud
signals are firewalled out of every display (Board ruling; §4).

**Entry:** an anomaly or complaint produces a signal.
**Exit:** signal `[actioned]` (consequences ride owning-module instruments: revocation J-VER-07,
ban J-BAN, score effect inside M5) — or `[dismissed]`.

```
[open] → review → [reviewed] → [actioned] (→ revoke / ban / score effect via owning instruments) / [dismissed]
(staff-internal walk — never displayed on any surface)
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-FRD-01 | Create | `trust.create_fraud_signal.v1` (⚙/staff) | `[open]` | Signal recorded, staff-internal |
| J-FRD-02 | Review | `trust.review_fraud_signal.v1` | `[open] → [reviewed]` | Investigation leg — ops intake via J-CMPL |
| J-FRD-03 | Action | `trust.action_fraud_signal.v1` | `→ [actioned]` | Consequences execute via owning instruments only (J-VER-07 revoke, J-BAN ban) — never a direct score write |
| J-FRD-04 | Dismiss | `trust.dismiss_fraud_signal.v1` | `→ [dismissed]` | Recorded disposition; no residue on display |
| J-FRD-05 | Read | `trust.get_fraud_signal.v1`, `trust.list_fraud_signals.v1` | any | Staff-only reads |

**Governance rails:** fraud signals are **never displayed** on any surface (Board ruling —
"never fraud"); signal → consequence always passes through an owning module's governed
instrument; non-disclosure absolute (byte-equivalence, Invariant #11).
**Success:** ✔ every signal dispositioned; ✔ zero disclosure; ✔ consequences attributable to
governed instruments, not the signal itself.

**Related:** intake J-CMPL (M8 ops leg) · consequences J-VER-07, J-BAN · feeds J-TSC
(M5-internal).

---

## Not Covered (File B ledger)

| Item | Why | Pointer |
|---|---|---|
| Buyer verification / "Trusted Buyer" | Vendor-only: `verification_records` bind to the vendor's owning org (Doc-4G H.3/H.9a); sole event `(VendorVerified)`; zero corpus hits for buyer verification | **ESC-JRN-BUYER-VERIF** (atlas §8) |
| Score formulas / weights | Deliberately undocumented in journeys — display-silent per Board ruling | Doc-4G BC-TRUST-2/3 |
| Capacity Profile verification detail | Rides J-VER with subject `capacity_claim` — no separate journey needed | Doc-2 §5.6 subjects |

*Cross-links:* actor journeys [`../marketplace_ux.md`](../marketplace_ux.md) §5 (`J-VND`), §7
(`J-ADM`) · registry [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) §5-B.

*Non-authoritative; coins nothing; on conflict the frozen corpus wins (CLAUDE.md §7/§11).*

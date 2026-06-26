# Doc-7H — Admin Console — **SERIES FROZEN v1.0**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26) — structure + content + Appendix. Independent Hard Reviews + Structure Freeze Audit + Content Freeze Audit all PASS (0 open BLOCKER/MAJOR/MINOR) |
| Document | **Doc-7H** — the Admin Console (the **last** Doc-7 surface) |
| Program | **Doc-7 — Frontend Realization** |
| Realizes | the frozen **Doc-5J** Admin surface (BC-ADM-1…6) + **cross-module Admin legs** (Doc-5D/5E/5G/5I/5C/5H Admin), on Doc-7C `(admin)`, using the Doc-7B kit |
| Consumes (frozen, by reference) | `Doc-7A` · `Doc-7B` · `Doc-7C` (`DR-7-SHELL` satisfied) |
| Gated by | `Doc-7A` Appendix A — full set (HR11) |
| Coins | **Nothing** — binds frozen Admin contracts by pointer; emits nothing (owning modules emit) |

---

## Effective set (read these)

| Layer | Artifact(s) |
|---|---|
| Structure | `Doc-7H_Structure_v1.0_FROZEN` (= Proposal v0.1 + Patch v0.1.1) |
| Content §0–§7 | `Doc-7H_Content_v1.0_Pass1` + `Doc-7H_Content_Pass1_Patch_v1.0.1` |
| Content §8–§11 + Appendix | `Doc-7H_Content_v1.0_Pass2` + `Doc-7H_Content_Pass2_Patch_v1.0.1` |
| Freeze gates | `Doc-7H_Structure_Freeze_Audit_v1.0` · `Doc-7H_Content_Freeze_Audit_v1.0` |
| Provenance | `Doc-7H_Structure_Independent_Hard_Review_v0.1` · `Doc-7H_Content_Pass{1,2}_Independent_Hard_Review_v1.0` |

---

## What Doc-7H fixes (summary — authoritative text is the effective set)

**Admin-decides / owning-module-owns (R5):** the console invokes wired Admin commands; the **owning module owns the data/decision/effect** — never bypasses a domain (Red Flag #8). **Platform-scoped (no active-org)** — acts **ON** a target by ID, never **AS** an org.

**Doc-5J core (BC-ADM-1…6):** moderation (separate from ban) · bans (**`issue_ban`→`VendorBanned`**, the single M8 event; ban ≠ blacklist) · suggestions triage (staff-internal link non-disclosure, distinct from the buyer-private CRM link) · import (202 + poll; `process_import_job` System) · verification **workflow** (M8 task) · outreach (informational, moat).

**Cross-module Admin legs (owning-module commands):** ad review (Doc-5D) · category governance · **full Doc-5G Trust governance** (BC-TRUST-1…5 — `decide_verification`→**`VendorVerified`**, verified-tier governance, score freeze/reactivate **publication-only**, fraud signals staff-only, review moderation `publish_review`→ingestion) · plan catalog (Doc-5I incl. **`activate_plan`**) · routing control (Doc-5E `assist_routing`=rules, never award) · identity governance (Doc-5C suspend/reinstate) · support (Doc-5H).

**Firewalls:** **R8 Trust** — Admin decides verification + sets verified tier; **computed trust/performance scores are System-only** (no hand-edit; the console writes no score). **R7 moat** — no matching/award. **Event framing** — **M8 emits `VendorBanned` only**; the console drives owning-module events (`VendorVerified`, review-ingestion) via cross-module Admin commands — **the owning module emits, the console invokes**. Staff-internal non-disclosure (verification/fraud/admin-ratings/link); never surfaces buyer-private CRM. Conformance: `CHK-7-010` N/A; `CHK-7-012` APPLIES (Admin-no-org assertion); `CHK-7-011` staff-slug.

---

## Doc-7 surface program — COMPLETE

With Doc-7H frozen, **all Doc-7 surfaces are FROZEN: 7A (metastandard) · 7B (Design System) · 7C (App Shell) · 7D (Public) · 7E (Account/Identity) · 7F (Buyer/moat) · 7G (Vendor) · 7H (Admin).** The frontend realization program (Doc-7) is content-complete across every surface, each gated by Doc-7A Appendix A, each through the Board loop (Pass → Hard Review → Fix → closure check → freeze).

## Carried (program-level)

`[ESC-7-API]` — the **file-upload grant** (no client-facing signed-URL in the frozen Doc-5 surface; M0/Doc-4B Storage by pointer; `file_ref` only) is carried across surfaces, resolved via an additive Doc-5x/Doc-4B patch (Board). `[ESC-IDN-DELEG-EXPIRY]` (Doc-7E reinstate UI deferred) · `[ESC-7-API-PRODDETAIL/CATNAV/ADS]` (Doc-7D anonymous reads). All resolved only via named channels.

*End of Doc-7H SERIES FROZEN v1.0. Effective set above is authoritative; this manifest only points. Doc-7H realizes the Admin Console over the frozen Doc-5J + cross-module Admin surfaces; Admin-decides/owning-module-owns; no active-org; no matching/award/score-write; coins nothing. **The last Doc-7 surface — Doc-7 (7A–7H) is COMPLETE.**_*

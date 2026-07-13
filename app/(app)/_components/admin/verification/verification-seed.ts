// Verification — presentation SEED (P-ADM-12 · Doc-7H · J-ADM-02 · `queue/assign_verification_task`). A curated
// mock of the verification workflow queue standing in for the unwired read — NOT data, coins nothing. The queue
// is a WORKFLOW surface: `verification_tasks` reference `trust.verification_records` by id (Doc-2:224/390) —
// **Admin decides; Trust stores** (Doc-2:108/227). The decision (`decide_verification_task`) lives on the
// DETAIL (P-ADM-13), owned by M5 Trust (R5). FIREWALL (Invariant #6, Architecture §1.5): NO Trust Score, NO
// Performance Score, NO Financial-Tier BAND appears here — verification is a separate signal; a score is
// auto-calculated by Trust under the System actor and is NEVER shown or hand-edited on an admin queue. Fields
// bind to frozen attributes only: task `state` (Doc-2:390 `queued → in_review → decided`), record
// `verification_type` (Doc-2:795), and the subject ref/type (Doc-2:180). No fabricated total (GI-03).
import type { StatusTone } from "@/frontend/components/status-chip";

// Frozen `verification_tasks` workflow states (Doc-2:390).
export type VerificationTaskStatus = "queued" | "in_review" | "decided";

// Frozen `verification_records.verification_type` (Doc-2:795).
export type VerificationType =
  "contact" | "business" | "factory" | "organization" | "tier" | "capacity";

// Frozen verification subject refs (Doc-2:180) — what the record is about.
export type VerificationSubjectType =
  "Vendor profile" | "Organization" | "Capacity claim" | "Declared tier";

export interface VerificationTaskVM {
  id: string;
  /** Subject display name (the vendor / organization under verification). */
  subject: string;
  subjectType: VerificationSubjectType;
  verificationType: VerificationType;
  /** When the verification was requested (relative) — display only. */
  requested: string;
  /** Assigned verification admin, or unassigned. */
  assignee: string | null;
  status: VerificationTaskStatus;
}

export const VERIFICATION_STATUS_META: Record<
  VerificationTaskStatus,
  { label: string; tone: StatusTone }
> = {
  queued: { label: "Queued", tone: "warning" },
  in_review: { label: "In review", tone: "info" },
  decided: { label: "Decided", tone: "neutral" },
};

export const VERIFICATION_TYPE_LABEL: Record<VerificationType, string> = {
  contact: "Contact",
  business: "Business",
  factory: "Factory",
  organization: "Organization",
  tier: "Financial tier",
  capacity: "Capacity",
};

export const VERIFICATION_TASKS: VerificationTaskVM[] = [
  {
    id: "vt-00071",
    subject: "Rupsha Engineering Works",
    subjectType: "Vendor profile",
    verificationType: "business",
    requested: "2h ago",
    assignee: null,
    status: "queued",
  },
  {
    id: "vt-00070",
    subject: "Bay Valves & Controls",
    subjectType: "Vendor profile",
    verificationType: "factory",
    requested: "5h ago",
    assignee: "A. Rahman",
    status: "in_review",
  },
  {
    id: "vt-00069",
    subject: "Meghna Bearings Ltd.",
    subjectType: "Organization",
    verificationType: "organization",
    requested: "1d ago",
    assignee: null,
    status: "queued",
  },
  {
    id: "vt-00068",
    subject: "Green Power Solutions",
    subjectType: "Declared tier",
    verificationType: "tier",
    requested: "1d ago",
    assignee: "S. Akter",
    status: "in_review",
  },
  {
    id: "vt-00067",
    subject: "Titas Instrumentation",
    subjectType: "Capacity claim",
    verificationType: "capacity",
    requested: "2d ago",
    assignee: null,
    status: "queued",
  },
  {
    id: "vt-00066",
    subject: "Sundarban Safety",
    subjectType: "Vendor profile",
    verificationType: "contact",
    requested: "3d ago",
    assignee: "A. Rahman",
    status: "decided",
  },
  {
    id: "vt-00065",
    subject: "Padma Lubricants",
    subjectType: "Declared tier",
    verificationType: "tier",
    requested: "4d ago",
    assignee: "S. Akter",
    status: "decided",
  },
];

// Frozen `verification_decisions.decision` verbs (Doc-2:796) — the P-ADM-13 decision set.
export type VerificationDecision = "approve" | "reject" | "confirm" | "downgrade" | "request_info";

export const VERIFICATION_DECISION_LABEL: Record<VerificationDecision, string> = {
  approve: "Approve",
  reject: "Reject",
  confirm: "Confirm",
  downgrade: "Downgrade",
  request_info: "Request info",
};

/** Extended detail for one verification task (P-ADM-13) — frozen `verification_records` context. */
export interface VerificationDetailVM extends VerificationTaskVM {
  /** `verification_records.requested_by` — who requested the verification (display name). */
  requestedBy: string;
  /** `verification_records.expires_at` — display only. */
  expiresAt: string;
  /** `verification_records.evidence_document_refs[]` — document IDs (opaque refs), display only. */
  evidence: string[];
  /** Recorded decision (present only for a `decided` task) — from `verification_decisions`. */
  decision?: VerificationDecision;
  decisionReason?: string;
  decidedBy?: string;
}

// Detail context keyed by task id (P-ADM-13). NO score/tier band here (firewall, Inv #6) — only the
// verification record's own refs; a decision block is present only where the task is `decided`.
const VERIFICATION_DETAILS: Record<string, Omit<VerificationDetailVM, keyof VerificationTaskVM>> = {
  "vt-00071": {
    requestedBy: "System (profile submission)",
    expiresAt: "31 Jul 2026",
    evidence: ["doc_trade_license_8841", "doc_bin_certificate_2207"],
  },
  "vt-00070": {
    requestedBy: "A. Rahman",
    expiresAt: "2 Aug 2026",
    evidence: ["doc_factory_photos_5573", "doc_fire_license_1190", "doc_machinery_list_3320"],
  },
  "vt-00069": {
    requestedBy: "System (org onboarding)",
    expiresAt: "5 Aug 2026",
    evidence: ["doc_incorporation_6612"],
  },
  "vt-00068": {
    requestedBy: "S. Akter",
    expiresAt: "6 Aug 2026",
    evidence: ["doc_audited_accounts_4408", "doc_bank_solvency_7751"],
  },
  "vt-00067": {
    requestedBy: "System (capacity claim)",
    expiresAt: "8 Aug 2026",
    evidence: ["doc_capacity_statement_9903"],
  },
  "vt-00066": {
    requestedBy: "A. Rahman",
    expiresAt: "1 Jul 2026",
    evidence: ["doc_contact_letter_2261"],
    decision: "approve",
    decisionReason: "Registered contact confirmed against the trade license.",
    decidedBy: "A. Rahman",
  },
  "vt-00065": {
    requestedBy: "S. Akter",
    expiresAt: "30 Jun 2026",
    evidence: ["doc_audited_accounts_1180"],
    decision: "downgrade",
    decisionReason: "Submitted accounts support a lower band than declared.",
    decidedBy: "S. Akter",
  },
};

/** Lookup one task's summary row (P-ADM-13 header). */
export function getVerificationTask(id: string): VerificationTaskVM | undefined {
  return VERIFICATION_TASKS.find((t) => t.id === id);
}

/** Lookup one task's full detail. Returns undefined for an unknown id (Invariant #11). */
export function getVerificationDetail(id: string): VerificationDetailVM | undefined {
  const summary = getVerificationTask(id);
  const extra = VERIFICATION_DETAILS[id];
  if (!summary || !extra) return undefined;
  return { ...summary, ...extra };
}

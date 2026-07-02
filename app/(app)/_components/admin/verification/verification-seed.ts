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

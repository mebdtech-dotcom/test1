// Moderation queue — presentation SEED (P-ADM-02 · Doc-7H · J-ADM-01 moderation case reads). Curated,
// realistic industrial-procurement mock cases standing in for the wired `moderation case reads` (not yet
// wired) — NOT data, coins nothing (mirrors the discovery/company seeds). Admin is platform-scope (Doc-7H, no
// active-org), so these are platform-visible cases; they carry NO governance signal (Trust/Performance/Tier)
// and the list fabricates no totals. `status` is the moderation-case state (not a firewalled signal). Every
// decision happens in the case detail (P-ADM-03) under a wired command — the owning module owns the effect (R5).
import type { StatusTone } from "@/frontend/components/status-chip";

export type ModerationStatus = "open" | "in_review" | "escalated" | "resolved" | "dismissed";

export interface ModerationCaseVM {
  /** Opaque case id (route param). */
  id: string;
  /** Human-ref (year-scoped, presentation). */
  ref: string;
  /** Reported subject kind. */
  subjectType: "RFQ" | "Vendor profile" | "Product" | "Advertisement" | "Review";
  /** Short subject label. */
  subject: string;
  /** Reported reason (moderation triage). */
  reason: string;
  priority: "High" | "Medium" | "Low";
  status: ModerationStatus;
  /** Assigned reviewer, or "Unassigned". */
  assignee: string;
  /** Relative age label (editorial — never a fabricated exact timestamp). */
  age: string;
}

/** Presentation tone per case status (the surface derives the label + tone; the kit invents neither). */
export const MODERATION_STATUS_META: Record<ModerationStatus, { label: string; tone: StatusTone }> =
  {
    open: { label: "Open", tone: "warning" },
    in_review: { label: "In review", tone: "info" },
    escalated: { label: "Escalated", tone: "danger" },
    resolved: { label: "Resolved", tone: "success" },
    dismissed: { label: "Dismissed", tone: "neutral" },
  };

export const MODERATION_CASES: ModerationCaseVM[] = [
  {
    id: "mod-00042",
    ref: "MOD-2026-00042",
    subjectType: "RFQ",
    subject: "RFQ-2026-000318 · Boiler feed pumps",
    reason: "Suspected duplicate posting",
    priority: "High",
    status: "open",
    assignee: "Unassigned",
    age: "2h ago",
  },
  {
    id: "mod-00041",
    ref: "MOD-2026-00041",
    subjectType: "Product",
    subject: "Cast steel gate valve DN300",
    reason: "Misleading specification claim",
    priority: "Medium",
    status: "in_review",
    assignee: "A. Rahman",
    age: "5h ago",
  },
  {
    id: "mod-00040",
    ref: "MOD-2026-00040",
    subjectType: "Vendor profile",
    subject: "Meghna Pumps & Motors",
    reason: "Unverified certification claim",
    priority: "High",
    status: "escalated",
    assignee: "S. Akter",
    age: "1d ago",
  },
  {
    id: "mod-00039",
    ref: "MOD-2026-00039",
    subjectType: "Advertisement",
    subject: "Featured banner — Karnaphuli Chemicals",
    reason: "Prohibited content",
    priority: "Medium",
    status: "open",
    assignee: "Unassigned",
    age: "1d ago",
  },
  {
    id: "mod-00038",
    ref: "MOD-2026-00038",
    subjectType: "Review",
    subject: "Buyer review on Titas Fabrication Works",
    reason: "Abusive language",
    priority: "Low",
    status: "in_review",
    assignee: "A. Rahman",
    age: "2d ago",
  },
  {
    id: "mod-00037",
    ref: "MOD-2026-00037",
    subjectType: "RFQ",
    subject: "RFQ-2026-000301 · MS plate lot",
    reason: "Spam / bulk repost",
    priority: "Low",
    status: "dismissed",
    assignee: "S. Akter",
    age: "3d ago",
  },
  {
    id: "mod-00036",
    ref: "MOD-2026-00036",
    subjectType: "Product",
    subject: "Industrial gear oil ISO VG 220",
    reason: "Restricted category",
    priority: "Medium",
    status: "resolved",
    assignee: "A. Rahman",
    age: "4d ago",
  },
  {
    id: "mod-00035",
    ref: "MOD-2026-00035",
    subjectType: "Vendor profile",
    subject: "Surma Safety Solutions",
    reason: "Impersonation report",
    priority: "High",
    status: "escalated",
    assignee: "Unassigned",
    age: "4d ago",
  },
  {
    id: "mod-00034",
    ref: "MOD-2026-00034",
    subjectType: "Advertisement",
    subject: "Sidebar ad — Bengal Steel Industries",
    reason: "Policy review",
    priority: "Low",
    status: "resolved",
    assignee: "S. Akter",
    age: "5d ago",
  },
];

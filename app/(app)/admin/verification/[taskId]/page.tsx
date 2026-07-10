// P-ADM-13 Verification task detail (Doc-7H · Details/Workflow · `decide_verification_task` · J-ADM-02).
// PRESENTATION ONLY: the contextual review of one verification task. The decision controls are RENDERED BUT
// DISABLED — `decide_verification_task` is owned by M5 Trust (R5: Admin decides; Trust stores the record and
// owns the score). Frozen decision set `approve | reject | confirm | downgrade | request_info` (Doc-2:796),
// offered ONLY while the task is not yet `decided` (Doc-2:390 `queued → in_review → decided`). Unknown/absent
// task → byte-equivalent `notFound()` (Invariant #11). FIREWALL (Invariant #6): NO Trust Score, NO Performance
// Score, NO Financial-Tier band appears here — a score is auto-calculated by Trust under the System actor and
// is never surfaced or hand-edited by an admin. Fields bind to frozen `verification_records` attributes; no
// coined value. Composes the shell PageHeader + generic DashboardSection / DescriptionList / PresentationFormNote.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../../_components/shell";
import { DashboardSection } from "../../../_components/vendor/dashboard/dashboard-section";
import { DescriptionList } from "../../../_components/vendor/shared/description-list";
import { PresentationFormNote } from "../../../_components/vendor/shared/presentation-form-note";
import { ADMIN_REASON_CLASS } from "../../../_components/admin/form-control-classes";
import {
  getVerificationTask,
  getVerificationDetail,
  VERIFICATION_STATUS_META,
  VERIFICATION_TYPE_LABEL,
  VERIFICATION_DECISION_LABEL,
  type VerificationDecision,
} from "../../../_components/admin/verification/verification-seed";

const LIST = "/admin/verification";

// Frozen decision order (Doc-2:796) — rendered as disabled affordances; M5 owns the effect (R5).
const DECISIONS: VerificationDecision[] = [
  "approve",
  "confirm",
  "downgrade",
  "request_info",
  "reject",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ taskId: string }>;
}): Promise<Metadata> {
  const { taskId } = await params;
  const task = getVerificationTask(taskId);
  return { title: task ? `${task.subject} · Verification · Admin` : "Verification · Admin" };
}

export default async function VerificationDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const detail = getVerificationDetail(taskId);
  if (!detail) notFound();

  const meta = VERIFICATION_STATUS_META[detail.status];
  const isDecided = detail.status === "decided";

  return (
    <div className="space-y-6">
      <Link
        href={LIST}
        className="-mx-1.5 inline-flex items-center gap-1 self-start rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to verification
      </Link>

      <PageHeader
        title={detail.subject}
        description="Review the evidence and record a decision. Admin decides; Trust stores the record and owns the score."
        meta={
          <>
            <Badge variant="neutral">{detail.subjectType}</Badge>
            <Badge variant="neutral">{VERIFICATION_TYPE_LABEL[detail.verificationType]}</Badge>
            <StatusChip label={meta.label} tone={meta.tone} />
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardSection title="Verification task" className="lg:col-span-2">
          <DescriptionList
            items={[
              { label: "Subject", value: detail.subject },
              { label: "Subject type", value: detail.subjectType },
              {
                label: "Verification type",
                value: VERIFICATION_TYPE_LABEL[detail.verificationType],
              },
              { label: "Requested", value: detail.requested },
              { label: "Requested by", value: detail.requestedBy },
              { label: "Expires", value: detail.expiresAt },
              { label: "Assignee", value: detail.assignee ?? "Unassigned" },
            ]}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            No trust, performance, or financial-tier score is shown or set here — Trust owns and
            computes the score.
          </p>
        </DashboardSection>

        <DashboardSection title="Evidence">
          {detail.evidence.length > 0 ? (
            <ul className="space-y-2">
              {detail.evidence.map((ref) => (
                <li key={ref} className="font-mono text-xs text-muted-foreground">
                  {ref}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No evidence documents attached.</p>
          )}
        </DashboardSection>

        <DashboardSection title="Decision" className="lg:col-span-2">
          {isDecided ? (
            <DescriptionList
              items={[
                {
                  label: "Decision",
                  value: detail.decision ? VERIFICATION_DECISION_LABEL[detail.decision] : undefined,
                },
                { label: "Reason", value: detail.decisionReason },
                { label: "Decided by", value: detail.decidedBy },
              ]}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Record a decision on this task. Admin decides; the owning module stores the record
                and computes the score.
              </p>
              <div className="space-y-1.5">
                <label
                  htmlFor="verification-reason"
                  className="block text-sm font-medium text-foreground"
                >
                  Reason / notes
                </label>
                <textarea
                  id="verification-reason"
                  name="reason"
                  className={ADMIN_REASON_CLASS}
                  placeholder="Record the basis for this decision…"
                  disabled
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {DECISIONS.map((d) => (
                  // Disabled — `decide_verification_task` is owned by M5 Trust (R5).
                  <Button
                    key={d}
                    size="sm"
                    variant={d === "approve" ? "primary" : "outline"}
                    disabled
                  >
                    {VERIFICATION_DECISION_LABEL[d]}
                  </Button>
                ))}
              </div>
              <PresentationFormNote />
            </div>
          )}
        </DashboardSection>
      </div>
    </div>
  );
}

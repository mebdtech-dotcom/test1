// Moderation queue table (P-ADM-02 · Doc-7H). Presentation-only, RSC. Renders the moderation cases the page
// supplies as a responsive enterprise table (horizontal scroll on narrow viewports — admin is desktop-first,
// page_inventory §13.7). Each row links into the case detail (P-ADM-03) where a wired command acts — the table
// itself decides nothing (R5). Reuses the kit Card + StatusChip; no governance signal, no fabricated total.
import Link from "next/link";
import { Card } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import { MODERATION_STATUS_META, type ModerationCaseVM } from "./moderation-seed";

const BASE = "/admin/moderation";

export interface ModerationQueueTableProps {
  cases: ModerationCaseVM[];
}

export function ModerationQueueTable({ cases }: ModerationQueueTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] border-collapse text-sm">
          <caption className="sr-only">Moderation cases</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium">
                Case
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Subject
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Reason
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Priority
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Assignee
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Age
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => {
              const meta = MODERATION_STATUS_META[c.status];
              return (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                    {c.ref}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{c.subject}</div>
                    <div className="text-xs text-muted-foreground">{c.subjectType}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.reason}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.priority === "High"
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip label={meta.label} tone={meta.tone} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {c.assignee}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{c.age}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`${BASE}/${c.id}`}
                      className="rounded-sm text-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Review
                      <span className="sr-only"> case {c.ref}</span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

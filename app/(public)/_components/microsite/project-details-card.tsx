// ProjectDetailsCard (FE-PUB-11 · P-PUB-25) — the sidebar facts card: Status (as a StatusChip), Duration,
// Client, Location, Completion, Industry, and the optional editorial Project value. Owns the status
// label→tone mapping. GOVERNANCE R2: the NAMED client shows here (detail page only), falling back to the
// sector/role descriptor. Auto-hides when it would have no rows. Presentation-only; reuses the kit;
// RSC-friendly.
import type { ReactNode } from "react";
import { Banknote, Building2, Calendar, ClipboardList, Clock, Layers, MapPin } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import type { ProjectDetailVM } from "./company-content-seed";

/** Project status label -> presentation tone (never colour-only; StatusChip also renders the text). */
function statusDisplay(status: string): { label: string; tone: StatusTone } {
  const key = status.toLowerCase();
  if (key === "completed") return { label: "Completed", tone: "success" };
  if (key === "in_progress" || key === "ongoing") return { label: "In progress", tone: "info" };
  if (key === "on_hold") return { label: "On hold", tone: "warning" };
  return { label: status, tone: "neutral" };
}

export interface ProjectDetailsCardProps {
  project: ProjectDetailVM;
}

export function ProjectDetailsCard({ project }: ProjectDetailsCardProps) {
  const rows: { icon: ReactNode; label: string; value: ReactNode }[] = [];

  if (project.status) {
    const status = statusDisplay(project.status);
    rows.push({
      icon: <ClipboardList aria-hidden="true" className="size-4" />,
      label: "Status",
      value: <StatusChip label={status.label} tone={status.tone} />,
    });
  }
  if (project.durationLabel) {
    rows.push({
      icon: <Clock aria-hidden="true" className="size-4" />,
      label: "Duration",
      value: <span className="font-medium text-foreground">{project.durationLabel}</span>,
    });
  }
  // R2: the NAMED client (detail page only). Falls back to the sector/role descriptor if none supplied.
  const clientLabel = project.namedClient ?? project.client;
  if (clientLabel) {
    rows.push({
      icon: <Building2 aria-hidden="true" className="size-4" />,
      label: "Client",
      value: <span className="font-medium text-foreground">{clientLabel}</span>,
    });
  }
  if (project.location) {
    rows.push({
      icon: <MapPin aria-hidden="true" className="size-4" />,
      label: "Location",
      value: <span className="font-medium text-foreground">{project.location}</span>,
    });
  }
  if (project.year) {
    rows.push({
      icon: <Calendar aria-hidden="true" className="size-4" />,
      label: "Completion",
      value: <span className="font-medium text-foreground">{project.year}</span>,
    });
  }
  if (project.industry) {
    rows.push({
      icon: <Layers aria-hidden="true" className="size-4" />,
      label: "Industry",
      value: <span className="font-medium text-foreground">{project.industry}</span>,
    });
  }
  // Editorial display string only (owner ruling) — never a computed amount.
  if (project.valueLabel) {
    rows.push({
      icon: <Banknote aria-hidden="true" className="size-4" />,
      label: "Project value",
      value: <span className="font-medium text-foreground">{project.valueLabel}</span>,
    });
  }

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
          Project details
        </h2>
        <dl className="mt-3 flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-muted-foreground">{row.icon}</span>
                {row.label}
              </dt>
              <dd className="text-right text-sm">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

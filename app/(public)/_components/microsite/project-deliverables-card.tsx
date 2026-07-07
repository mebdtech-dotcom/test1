// ProjectDeliverablesCard (FE-PUB-11 · P-PUB-25) — the sidebar "Scope of deliverables" checklist
// (vendor-authored editorial). Auto-hides when absent. Presentation-only; reuses the kit; RSC-friendly.
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";

export interface ProjectDeliverablesCardProps {
  items?: string[];
  /** Section title (defaults to "Scope of deliverables"). */
  title?: string;
}

export function ProjectDeliverablesCard({
  items,
  title = "Scope of deliverables",
}: ProjectDeliverablesCardProps) {
  if (!items || items.length === 0) return null;
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <ul className="mt-3 flex flex-col gap-2.5">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-iv-success-base"
              />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

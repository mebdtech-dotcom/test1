// "Presentation only — never affects matching" banner (DP5 / Invariant 9). This is the INVERSE of
// the Company "Editing affects matching" banner, and is styled distinctly (neutral/reassuring, not
// the info-toned warning) so the Content vs Presentation split is legible at a glance. Shown on every
// Microsite screen (S10–S14). Presentation-only. RSC-friendly.
import type { ReactNode } from "react";
import { Eye } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

export interface PresentationContextBannerProps {
  className?: string;
  children?: ReactNode;
}

export function PresentationContextBanner({ className, children }: PresentationContextBannerProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <Eye aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>
        {children ?? "Presentation only — your microsite never affects matching or eligibility."}
      </p>
    </div>
  );
}

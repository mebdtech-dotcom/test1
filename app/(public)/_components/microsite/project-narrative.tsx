// ProjectNarrative (FE-PUB-11 · P-PUB-25) — the "Executive Summary": vendor-authored Challenge / Solution /
// Result narrative blocks. Auto-hides (renders nothing) when all three are absent. Owns the stable
// #summary anchor. Presentation-only; reuses the kit; RSC-friendly.
import { VendorSection } from "./vendor-section";
import { Card, CardContent } from "@/frontend/primitives/card";

export interface ProjectNarrativeProps {
  challenge?: string;
  solution?: string;
  result?: string;
}

export function ProjectNarrative({ challenge, solution, result }: ProjectNarrativeProps) {
  if (!challenge && !solution && !result) return null;
  return (
    <VendorSection id="summary" title="Executive Summary">
      <Card>
        <CardContent className="flex flex-col gap-5 p-5">
          {challenge ? (
            <div className="border-l-2 border-iv-amber-500 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-iv-ink-heading">
                The Challenge
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{challenge}</p>
            </div>
          ) : null}
          {solution ? (
            <div className="border-l-2 border-iv-navy-700 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-iv-ink-heading">
                Our Solution
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{solution}</p>
            </div>
          ) : null}
          {result ? (
            <div className="border-l-2 border-iv-success-base pl-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-iv-ink-heading">
                The Result
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{result}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </VendorSection>
  );
}

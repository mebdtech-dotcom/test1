// P-BUY-RFQ — wizard PROGRESS INDICATOR (a buyer-scoped realization of the Doc-7B-deferred `T-WIZARD`
// stepper chrome; promotion candidate). PRESENTATION-ONLY: `activeStep` is a prop; the stepper navigates
// nothing and mutates nothing (no scroll-spy — that requires client scroll listeners, cosmetic prototype
// flourish only, intentionally left out). A11y: an ordered list under a labelled nav; the active step is
// aria-current. Sticky pill-bar layout ported from the `ivendorz-rfq-creator` reference prototype's
// `FormSteps.tsx`, re-themed onto this repo's design tokens (no raw slate/indigo Tailwind colors).

import { Check } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import type { WizardStep } from "./rfq-options";

export function WizardStepper({ steps, activeStep }: { steps: WizardStep[]; activeStep: number }) {
  return (
    <nav aria-label="RFQ progress" className="overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1 sm:justify-between">
        {steps.map((step, i) => {
          const state = i < activeStep ? "done" : i === activeStep ? "current" : "upcoming";
          return (
            <li key={step.key} className="flex items-center">
              <span
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  state === "current" &&
                    "border-iv-brand-100 bg-iv-brand-50 font-semibold text-iv-brand-700",
                  state !== "current" && "border-transparent text-muted-foreground",
                )}
              >
                {state === "done" ? (
                  <Check
                    aria-hidden
                    className="size-3.5 shrink-0 stroke-[3] text-iv-success-base"
                  />
                ) : null}
                <span className="whitespace-nowrap">{step.label}</span>
              </span>
              {i < steps.length - 1 ? (
                <span aria-hidden className="mx-1 h-px w-6 shrink-0 bg-border" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

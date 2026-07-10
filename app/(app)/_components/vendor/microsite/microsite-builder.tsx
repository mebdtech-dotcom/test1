// S10 Microsite Builder — presentation-only (DP5/Invariant 9: never affects matching). Binds the
// frozen marketplace.microsites.layout_template (A–E) + the sections list. The section_type set is
// contract-owned (not a hardcoded enum); section content editing is integration-phase. Reorder is a
// visual handle only (no drag logic). Uncontrolled controls; Save disabled (no mock business logic).
import { GripVertical, Plus } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { FormField } from "@/frontend/components/form-field";
import { PresentationContextBanner } from "./presentation-context-banner";
import { MicrositeStatusChip, VisibilityChip } from "./status-chips";
import { PresentationFormNote, VENDOR_SELECT_CLASS } from "../shared";
import type { LayoutTemplate, MicrositeSectionView, MicrositeView } from "./types";

const LAYOUTS: LayoutTemplate[] = ["A", "B", "C", "D", "E"];

export interface MicrositeBuilderProps {
  microsite?: MicrositeView;
  sections?: MicrositeSectionView[];
}

export function MicrositeBuilder({ microsite, sections }: MicrositeBuilderProps) {
  return (
    <div className="space-y-6">
      <PresentationContextBanner />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Status</p>
        <MicrositeStatusChip status={microsite?.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            id="layout-template"
            label="Template"
            description="Choose a presentation template for your microsite."
          >
            <select
              id="layout-template"
              name="layout_template"
              defaultValue={microsite?.layout_template ?? ""}
              className={VENDOR_SELECT_CLASS}
            >
              <option value="">Select a template…</option>
              {LAYOUTS.map((layout) => (
                <option key={layout} value={layout}>
                  Template {layout}
                </option>
              ))}
            </select>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Sections</CardTitle>
          <Button type="button" variant="outline" size="sm" disabled>
            <Plus aria-hidden="true" className="size-4" /> Add section
          </Button>
        </CardHeader>
        <CardContent>
          {sections && sections.length > 0 ? (
            <ul className="divide-y divide-border rounded-md border border-border">
              {sections.map((section) => (
                <li key={section.section_id} className="flex items-center gap-3 p-3">
                  <GripVertical
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {section.section_name ?? "Untitled section"}
                    </p>
                    {section.section_type ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {section.section_type}
                      </p>
                    ) : null}
                  </div>
                  <VisibilityChip visibility={section.visibility} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Start by adding a section"
              description="Sections make up your microsite. Add one to begin."
            />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <PresentationFormNote />
        <Button type="button" disabled>
          Save layout
        </Button>
      </div>
    </div>
  );
}

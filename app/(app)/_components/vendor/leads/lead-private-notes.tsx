// PL-2 Lead Detail — PRIVATE NOTES (companion §13.2). The vendor's private notes are realized as
// `note`-typed entries via `ops.add_lead_activity.v1` (activity_jsonb.type = "note") — there is NO
// confirmed vendor-owned private-note slug in the frozen corpus, so this is the documented fallback
// until [ESC-7G-LEAD-NOTE] is ruled. Notes are private to the vendor's own organization (own CRM data).
// Saving is disabled in the presentation phase. Uncontrolled; native textarea interim ([ESC-7B-TEXTAREA],
// pending). RSC-friendly.
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { FormField } from "@/frontend/components/form-field";
import { PresentationFormNote, vendorTextareaClass } from "../shared";

const TEXTAREA_CLASS = vendorTextareaClass("min-h-[100px]", { disabled: true });

export function LeadPrivateNotes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Private notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          id="lead-private-note"
          label="Your notes"
          description="Visible only to your organization. Saved to your activity log."
        >
          <textarea id="lead-private-note" name="note" className={TEXTAREA_CLASS} disabled />
        </FormField>
        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <PresentationFormNote />
          <Button type="button" disabled>
            Save note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

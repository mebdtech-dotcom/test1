// S3 Capabilities & Capacity (edit) — the crown jewel for Invariant 1. The vendor-type preset only
// SEEDS the four independent capability flags (a matrix, never a label); the capacity profile binds
// the FROZEN vendor_capacity_profiles fields. Verified capacity values are Trust-owned (read-only
// marker). Matching-relevant content (DP5 banner). Presentation-only: native select / checkboxes are
// the interim controls (kit [ESC-7B-SELECT]/[ESC-7B-SWITCH] pending); no submission wiring.
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { FormField } from "@/frontend/components/form-field";
import { CapabilityMatrix } from "@/frontend/components/capability-matrix";
import { MatchingContextBanner } from "./matching-context-banner";
import { PresentationFormNote, VENDOR_SELECT_CLASS } from "../shared";
import { VerifiedMarker } from "./verified-marker";
import type { CapacityProfileView, VendorProfileView } from "./types";

export interface CapabilitiesCapacityFormProps {
  profile?: VendorProfileView;
  capacity?: CapacityProfileView;
}

export function CapabilitiesCapacityForm({ profile, capacity }: CapabilitiesCapacityFormProps) {
  const isVerified = (field: string) => capacity?.verified_fields?.includes(field) ?? false;

  return (
    <form className="space-y-6" aria-label="Capabilities and capacity">
      <MatchingContextBanner />

      <FormField
        id="vendor-type-preset"
        label="Vendor type"
        description="A preset only seeds the capability flags below — matching reads the four flags, not the preset."
      >
        <select
          id="vendor-type-preset"
          name="vendor_type_preset"
          defaultValue={profile?.vendor_type_preset ?? ""}
          className={VENDOR_SELECT_CLASS}
        >
          <option value="">Select a type…</option>
          <option value="manufacturer">Manufacturer</option>
          <option value="trader">Trader</option>
          <option value="service_provider">Service provider</option>
        </select>
      </FormField>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Capabilities</p>
        <p className="text-xs text-muted-foreground">
          Four independent capabilities. Set each one on its own — capability is a matrix, not a
          single label.
        </p>
        <CapabilityMatrix flags={profile?.capability} editable />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">Capacity</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="max-project-value"
            label={
              <span className="inline-flex items-center gap-2">
                Max project value <VerifiedMarker verified={isVerified("max_project_value")} />
              </span>
            }
            description="Currency defaults to BDT."
          >
            <Input
              id="max-project-value"
              name="max_project_value"
              type="number"
              inputMode="numeric"
              defaultValue={capacity?.max_project_value ?? ""}
            />
          </FormField>

          <FormField
            id="max-monthly-rfq"
            label={
              <span className="inline-flex items-center gap-2">
                Monthly RFQ capacity{" "}
                <VerifiedMarker verified={isVerified("max_monthly_rfq_capacity")} />
              </span>
            }
          >
            <Input
              id="max-monthly-rfq"
              name="max_monthly_rfq_capacity"
              type="number"
              inputMode="numeric"
              defaultValue={capacity?.max_monthly_rfq_capacity ?? ""}
            />
          </FormField>

          <FormField
            id="employee-count"
            label={
              <span className="inline-flex items-center gap-2">
                Employees <VerifiedMarker verified={isVerified("employee_count_range")} />
              </span>
            }
            inputProps={{
              defaultValue: capacity?.employee_count_range ?? "",
              placeholder: "e.g. 50–200",
            }}
          />

          <FormField
            id="factory-size"
            label="Factory size"
            inputProps={{ defaultValue: capacity?.factory_size_range ?? "" }}
          />

          <FormField
            id="annual-turnover"
            label="Annual turnover"
            inputProps={{ defaultValue: capacity?.annual_turnover_range ?? "" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Verified capacity values are owned by Trust; changing them may require re-verification.
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <PresentationFormNote />
        <Button type="button" disabled>
          Save changes
        </Button>
      </div>
    </form>
  );
}

// P-ADM-15 (create) Import job — new (Doc-7H · Wizard · `submit_import_job` · J-ADM-05). PRESENTATION ONLY: the
// submit-import form. Fields bind EXACTLY to the frozen `submit_import_job` request (Doc-4J:247): `job_type`
// enum<categories|vendor_seed> and `file_ref` (source file reference, DR-ADM-PC). A submitted job enters the
// lifecycle at `queued` (Doc-4J `queued → processing → completed / failed`) and is processed asynchronously by
// System (`process_import_job`) — create-then-poll. The Start action is RENDERED BUT DISABLED — the command is
// owned by BC-ADM-4 Admin (R5). Import LOADS data; the seeded records are Marketplace-owned (no score, no
// procurement — firewall + moat). Admin-self-contained control (no cross-surface import); no new primitive.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { FormField } from "@/frontend/components/form-field";
import { PageHeader } from "../../../_components/shell";
import { DashboardSection } from "../../../_components/vendor/dashboard/dashboard-section";
import { PresentationFormNote } from "../../../_components/vendor/shared/presentation-form-note";
import { ADMIN_SELECT_CLASS } from "../../../_components/admin/form-control-classes";
import { IMPORT_TYPE_LABEL } from "../../../_components/admin/imports/imports-seed";

export const metadata: Metadata = { title: "New import job · Admin" };

const LIST = "/admin/imports";

// Frozen `job_type` enum (Doc-4J:247) — the only two import kinds.
const JOB_TYPES = ["categories", "vendor_seed"] as const;

export default function NewImportJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href={LIST}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to import jobs
        </Link>
      </div>

      <PageHeader
        title="New import job"
        description="Start a bulk import. The job is queued and processed asynchronously; track its progress from the job detail."
      />

      <form className="max-w-2xl">
        <DashboardSection
          title="Import source"
          description="Choose what to import and reference the source file. Seeded records are owned by Marketplace, not by import."
        >
          <div className="space-y-5">
            <FormField
              id="import-type"
              label="Import type"
              required
              description="Categories seed the taxonomy; vendor seed creates unclaimed vendor profiles."
            >
              <select
                id="import-type"
                name="job_type"
                className={ADMIN_SELECT_CLASS}
                defaultValue="categories"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {IMPORT_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="import-file-ref"
              label="Source file"
              required
              description="Reference to the uploaded source file (CSV)."
              inputProps={{
                name: "file_ref",
                placeholder: "uploads/imports/…csv",
                autoComplete: "off",
              }}
            />
          </div>
        </DashboardSection>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <PresentationFormNote className="mr-auto text-xs text-muted-foreground" />
          <Button asChild variant="ghost">
            <Link href={LIST}>Cancel</Link>
          </Button>
          {/* Disabled — `submit_import_job` is owned by BC-ADM-4 (R5). Admin decides; the module runs the job. */}
          <Button type="submit" disabled>
            Start import
          </Button>
        </div>
      </form>
    </div>
  );
}

// P-ADM-09 Category editor (Doc-7H · Settings · `marketplace.create_category.v1` · J-ADM-03). PRESENTATION
// ONLY: the admin create-category form. Fields bind EXACTLY to the frozen `create_category` request contract
// (Doc-4D §D7.1): `name` (required), `slug` (required, unique), `parent_id` (optional, ≤4-level tree), `level`
// (required, integer 1–4). A created category enters the taxonomy lifecycle at `draft` (Doc-2 §3.3) — it is
// APPROVED later from Category management (`set_category_status`), never from this form. The Create action is
// RENDERED BUT DISABLED — `create_category` is owned by the taxonomy module (R5: Admin decides; the owning
// module owns the effect). No governance signal here (firewall); no reparenting semantics invented (Doc-4D
// note). Composes the shell PageHeader + generic DashboardSection / PresentationFormNote + kit FormField;
// Admin-self-contained controls (no cross-surface import), no new primitive, no backend.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { FormField } from "@/frontend/components/form-field";
import { PageHeader } from "../../../_components/shell";
import { DashboardSection } from "../../../_components/vendor/dashboard/dashboard-section";
import { PresentationFormNote } from "../../../_components/vendor/shared/presentation-form-note";
import { ADMIN_SELECT_CLASS } from "../../../_components/admin/form-control-classes";
import { CATEGORIES } from "../../../_components/admin/categories/categories-seed";

export const metadata: Metadata = { title: "New category · Admin" };

const LIST = "/admin/categories";

// A retired node cannot parent a new category — offer only live (draft/active) nodes as parents.
const PARENT_OPTIONS = CATEGORIES.filter((c) => c.status !== "retired");

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href={LIST}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to categories
        </Link>
      </div>

      <PageHeader
        title="New category"
        description="Add a category to the admin-governed taxonomy. New categories are created as Draft and approved from Category management."
      />

      <form className="max-w-2xl">
        <DashboardSection
          title="Category details"
          description="Name and slug identify the category; parent and level place it in the ≤ 4-level tree."
        >
          <div className="space-y-5">
            <FormField
              id="category-name"
              label="Name"
              required
              description="Display name shown across discovery and vendor category assignment."
              inputProps={{
                name: "name",
                placeholder: "e.g. Hydraulic Pumps",
                autoComplete: "off",
              }}
            />

            <FormField
              id="category-slug"
              label="Slug"
              required
              description="Lowercase, hyphenated, and unique across the taxonomy (e.g. hydraulic-pumps)."
              inputProps={{ name: "slug", placeholder: "hydraulic-pumps", autoComplete: "off" }}
            />

            <FormField
              id="category-parent"
              label="Parent category"
              description="Leave as “None” for a root category. A category may nest up to 4 levels deep."
            >
              <select
                id="category-parent"
                name="parent_id"
                className={ADMIN_SELECT_CLASS}
                defaultValue=""
              >
                <option value="">None (root category)</option>
                {PARENT_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="category-level"
              label="Level"
              required
              description="Depth in the taxonomy tree (1 = root … 4 = deepest)."
            >
              <select
                id="category-level"
                name="level"
                className={ADMIN_SELECT_CLASS}
                defaultValue="1"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </DashboardSection>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <PresentationFormNote className="mr-auto text-xs text-muted-foreground" />
          <Button asChild variant="ghost">
            <Link href={LIST}>Cancel</Link>
          </Button>
          {/* Disabled — `create_category` is owned by the taxonomy module (R5). Admin decides; module applies. */}
          <Button type="submit" disabled>
            Create category
          </Button>
        </div>
      </form>
    </div>
  );
}

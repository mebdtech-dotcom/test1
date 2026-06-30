// FilterSidebar — data-driven facet filters (Doc-7D · M2.3 Phase 2). PRESENTATION-ONLY: renders the
// `facets[]` the surface supplies (no hardcoded filters), as uncontrolled native checkboxes with NO
// wiring (the canonical kit controls [ESC-7B-SWITCH]/[ESC-7B-SELECT] are pending; live faceting wires to
// `search_catalog` facets later). A Server Component — labels WRAP their input (no ids), so it renders
// safely more than once across breakpoints. <fieldset>/<legend> expose each group to AT (WCAG 1.3.1).
//
// GOVERNANCE: facets are presentation over the contract facet set — they imply no matching/ranking
// (GI-04) and expose no buyer-private / exclusion signal (Invariant #11; GI-12). "Apply"/"Clear" are
// inert affordances until the facet read is wired. Held Public-local (not yet kit-promoted) until the
// facet model stabilises across surfaces (M2.3A).
import { Button } from "@/frontend/primitives/button";
import { Separator } from "@/frontend/primitives/separator";

/** One selectable facet option (presentation label only — no value/wiring). */
export interface FilterFacet {
  label: string;
}

/** A named group of facet options (e.g. "Category", "Capability"). */
export interface FilterFacetGroup {
  heading: string;
  options: FilterFacet[];
}

function FacetCheckbox({ label }: { label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-foreground">
      <input
        type="checkbox"
        className="size-4 shrink-0 rounded accent-iv-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <span className="truncate">{label}</span>
    </label>
  );
}

export interface FilterSidebarProps {
  /** Facet groups to render — surface-supplied (data-driven). */
  facets: FilterFacetGroup[];
  /** Accessible name for the filter form. */
  label?: string;
  className?: string;
}

export function FilterSidebar({ facets, label = "Filter results", className }: FilterSidebarProps) {
  // Presentation only — native uncontrolled form; no submission wiring (the facet read wires later).
  return (
    <form aria-label={label} className={className}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-iv-ink-heading">Filters</h2>
        <Button type="reset" variant="ghost" size="sm" className="h-auto px-1.5 py-0.5 text-xs">
          Clear
        </Button>
      </div>

      <Separator className="my-3" />

      <div className="flex flex-col gap-4">
        {facets.map((group) => (
          // <fieldset>/<legend> expose the group name to AT so distinct facet sets are distinguishable.
          <fieldset key={group.heading} className="min-w-0 border-0 p-0">
            <legend className="mb-1.5 p-0 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.heading}
            </legend>
            {group.options.map((option) => (
              <FacetCheckbox key={option.label} label={option.label} />
            ))}
          </fieldset>
        ))}
      </div>

      <Separator className="my-3" />

      <Button type="submit" size="sm" className="w-full">
        Apply filters
      </Button>
    </form>
  );
}

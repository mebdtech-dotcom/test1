// CategoryTile (Doc-7B kit, App tier — landing_page_spec §4; promoted from the Public surface after M2.2).
// PRESENTATION-ONLY, route-agnostic. ONE canonical implementation. Interim [ESC-7-API-CATNAV]: curated/
// static selection; the destination is surface-supplied. NO count/total is rendered (GI-03): a category
// count would require a frozen facet-count read + an API-Governance ruling — never a client `.length`.
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card } from "../primitives/card";

/** Category tile data — a presentation VM, NOT a contract DTO. */
export interface CategoryVM {
  slug: string;
  name: string;
  /** Industrial glyph (DP §10 set). Server→server, so the component type is passed directly. */
  icon: LucideIcon;
}

export interface CategoryTileProps {
  category: CategoryVM;
  /** Destination — surface-supplied (route-agnostic). */
  href: string;
  className?: string;
}

export function CategoryTile({ category, href, className }: CategoryTileProps) {
  const Icon = category.icon;
  return (
    <Link
      href={href}
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card
        className={`flex h-full items-center gap-3 p-4 transition-colors group-hover:border-iv-brand-200 group-hover:bg-iv-brand-50/40 ${className ?? ""}`}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-iv-navy-50 text-iv-navy-700">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-sm font-semibold text-iv-ink-heading"
            title={category.name}
          >
            {category.name}
          </span>
        </span>
      </Card>
    </Link>
  );
}

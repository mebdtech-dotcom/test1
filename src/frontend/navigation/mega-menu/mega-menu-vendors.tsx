"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuVendors (Approval Addendum MAJOR-02 · ARCH §9.2).
// "Top Vendors for {category}" — renders ONLY when the app supplies vendor data (interim: the
// curated discovery seed, same source FE-PUB-04 uses; never fabricated). Vendor typing is the
// frozen 4-flag capability matrix ONLY (Invariant #1): Supply/Service/Fabricate/Consult chips.
// Trade-role labels (Manufacturer/Importer/Distributor/Contractor) are REJECTED coins — do not
// add them here; re-raisable only as a corpus amendment.

import * as React from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { cn } from "../../lib/cn";
import { Badge } from "../../primitives/badge";
import { useMenuInstance } from "./menu-context";
import type { MenuVendorVM } from "../model/types";

const CAPABILITY_LABELS = [
  ["can_supply", "Supply"],
  ["can_service", "Service"],
  ["can_fabricate", "Fabricate"],
  ["can_consult", "Consult"],
] as const;

export interface MegaMenuVendorsProps {
  vendors?: MenuVendorVM[];
  viewAllHref: string;
  title?: string;
  max?: number;
  className?: string;
  onVendorNavigate?(vendor: MenuVendorVM): void;
}

export function MegaMenuVendors({
  vendors,
  viewAllHref,
  title = "Top vendors",
  max = 5,
  className,
  onVendorNavigate,
}: MegaMenuVendorsProps) {
  const { emit } = useMenuInstance();
  const rows = (vendors ?? []).slice(0, max);
  if (rows.length === 0) return null;

  return (
    <section aria-label={title} className={cn("space-y-1 p-3", className)}>
      <h3 className="px-1 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="space-y-0.5">
        {rows.map((vendor) => (
          <li key={vendor.slug}>
            <Link
              prefetch={false}
              href={`/vendors/${vendor.slug}`}
              className="flex min-h-[44px] items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onVendorNavigate?.(vendor)}
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-medium">{vendor.name}</span>
                  {/* Verified = binary presence only; absence renders nothing (never "pending"). */}
                  {vendor.verified ? (
                    <BadgeCheck aria-hidden className="size-4 shrink-0 text-iv-success-muted" />
                  ) : null}
                  {vendor.verified ? <span className="sr-only">Verified</span> : null}
                </span>
                {vendor.capability ? (
                  <span className="mt-0.5 flex flex-wrap gap-1">
                    {CAPABILITY_LABELS.filter(([key]) => vendor.capability?.[key]).map(
                      ([key, label]) => (
                        <Badge key={key} variant="neutral">
                          {label}
                        </Badge>
                      ),
                    )}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        prefetch={false}
        href={viewAllHref}
        className="block rounded-md px-2 py-1.5 text-sm font-medium text-iv-ink-heading hover:bg-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => emit({ type: "quick_action_clicked", action: "view_all_suppliers" })}
      >
        View all suppliers →
      </Link>
    </section>
  );
}

// S6 Products List — own-product inventory with status, publish allowance, status filters and search.
// Presentation-only: filters/search/add are disabled (no client filtering, no mock persistence); rows
// link to the editor. Renders a genuine-empty state with no data. Bulk actions ([ESC-7B-BULK-BAR],
// pending) are deferred. Own-data only — no matching-derived counts (byte-equivalence). RSC-friendly.
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { ProductStatusChip } from "./product-status-chip";
import { PublishAllowanceIndicator } from "./publish-allowance";
import type { ProductStatus, ProductView, PublishAllowanceView } from "./types";

const STATUS_FILTERS: { value: "all" | ProductStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
];

export interface ProductsListProps {
  products?: ProductView[];
  allowance?: PublishAllowanceView;
  /** Temporary mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function ProductsList({ products, allowance, basePath = "/sell" }: ProductsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PublishAllowanceIndicator allowance={allowance} />
        <Button type="button" disabled>
          <Plus aria-hidden="true" className="size-4" /> Add product
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((filter, index) => (
            <Button
              key={filter.value}
              type="button"
              size="sm"
              variant={index === 0 ? "secondary" : "ghost"}
              disabled
            >
              {filter.label}
            </Button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search products"
            aria-label="Search products"
            className="pl-8"
            disabled
          />
        </div>
      </div>

      {products && products.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`${basePath}/company/products/${product.id}`}
                    className="flex items-center gap-3 p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {product.name ?? "Untitled product"}
                      </p>
                      {product.updated_at ? (
                        <p className="truncate text-xs text-muted-foreground">
                          Updated {product.updated_at}
                        </p>
                      ) : null}
                    </div>
                    <ProductStatusChip status={product.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No products yet"
          description="Add your first product to start building your catalog. Published products appear to buyers when matched."
        />
      )}
    </div>
  );
}

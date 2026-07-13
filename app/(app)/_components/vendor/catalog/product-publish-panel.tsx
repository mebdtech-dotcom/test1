// S7 Product Editor — Publishing (companion §5 S6/S7 dialogs inlined as a tab). The publish/unpublish
// state machine (Doc-4M) is server-gated by (1) an ACTIVE category (§5.3 — links to Company › Categories,
// built in M2) and (2) the catalog publishing allowance (numeric entitlement, NEVER a plan name —
// Invariant 10; distinct from the RFQ quota). Unpublish is reversible; products are NEVER deleted (DP11
// soft-delete only). Presentation-only: actions disabled; gating shown from typed props.
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { ProductStatusChip } from "./product-status-chip";
import { PublishAllowanceIndicator } from "./publish-allowance";
import { PresentationFormNote } from "../shared";
import type { ProductStatus, PublishAllowanceView } from "./types";

export interface ProductPublishPanelProps {
  status?: ProductStatus;
  allowance?: PublishAllowanceView;
  /** Whether the vendor has ≥1 ACTIVE category (publish prerequisite, §5.3). */
  hasActiveCategory?: boolean;
  categoriesHref?: string;
}

export function ProductPublishPanel({
  status,
  allowance,
  hasActiveCategory,
  categoriesHref = "/sell/company/categories",
}: ProductPublishPanelProps) {
  const isPublished = status === "published";
  const blockedNoCategory = hasActiveCategory === false;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ProductStatusChip status={status} />
        <PublishAllowanceIndicator allowance={allowance} />
      </div>

      {blockedNoCategory ? (
        <div
          role="note"
          className="flex items-start gap-2 rounded-md border border-iv-warning-base bg-iv-warning-subtle px-3 py-2 text-sm text-iv-warning-text"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            You need at least one active category before you can publish.{" "}
            <Link href={categoriesHref} className="font-medium underline underline-offset-2">
              Manage categories
            </Link>
            .
          </p>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {isPublished
              ? "This product is live to matched buyers. Unpublishing hides it — it stays saved and can be re-published."
              : "Publishing makes this product visible to matched buyers. It requires an active category and available allowance."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled>
              Publish
            </Button>
            <Button type="button" variant="outline" disabled>
              Unpublish
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Products are never deleted — unpublishing keeps everything saved.
          </p>
          <PresentationFormNote />
        </CardContent>
      </Card>
    </div>
  );
}

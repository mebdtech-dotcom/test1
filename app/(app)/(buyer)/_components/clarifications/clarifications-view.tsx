// P-BUY-16 Buyer Clarifications — host view (`T-DETAILS`, Doc-7F · planning → PI §13). Pure function of its
// view-model (Server Component; no hooks/fetch/mutation — Content ≠ Presentation, Inv #9). The route page
// resolves the buyer-owned page context; the THREAD itself (messages/attachments) is the M6 `conversation-
// thread` component (Doc-7B §5 · Doc-5H), DEFERRED — rendered as a placeholder this milestone (Board-ruled).
//
// REUSE: the canonical platform-shell `PageHeader` + `Breadcrumbs`; the placeholder `ClarificationsThread`
// (kit `Card`/`EmptyState`). NO new shared component is coined; NO message/attachment shape is modeled.
//
// GOVERNANCE:
//  • READ-ONLY — no composer/send/edit (Board scope).
//  • NON-DISCLOSURE (Inv #11 / GI-12) — `null` ⇒ not-found ≡ genuine absence (byte-identical; a thread is
//    participant-scoped and a non-participant collapses to NOT_FOUND server-side, §7.5). Breadcrumb shows
//    only the `RFQs` ancestor in the not-found state — never a leaf ref.

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PageHeader, Breadcrumbs } from "../../../_components/shell";
import { ClarificationsThread } from "./clarifications-thread";
import type { ClarificationsData } from "./clarification-view-models";

/** Not-found ≡ genuine absence (byte-identical; Inv #11 / GI-12). Breadcrumb shows only the `RFQs` ancestor. */
function NotFoundState() {
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Breadcrumbs items={[{ label: "RFQs", href: "/rfqs" }]} className="mb-4" />
      {/* FZ-02: the in-view genuine-absence branch still needs a page heading; kept sr-only so the
          visual stays the minimal EmptyState card (its title renders as a <p>, not a heading). */}
      <h1 className="sr-only">Clarifications not found</h1>
      <EmptyState
        icon={<FileText aria-hidden />}
        title="Clarifications not found"
        description="This thread doesn't exist or isn't available."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/rfqs">Back to RFQs</Link>
          </Button>
        }
        className="py-16"
      />
    </div>
  );
}

export function ClarificationsView({ data }: { data: ClarificationsData | null }) {
  if (data === null) {
    return <NotFoundState />;
  }
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Breadcrumbs
        items={[
          { label: "RFQs", href: "/rfqs" },
          { label: data.humanRef ?? "RFQ", href: `/rfqs/${data.rfqId}` },
          { label: "Clarifications" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Clarifications"
        meta={<span className="text-xs text-muted-foreground">Read-only</span>}
      />
      <ClarificationsThread />
    </div>
  );
}

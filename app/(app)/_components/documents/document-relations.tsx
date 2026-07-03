// Documents shared home — DocumentRelations (FE-DOC, owner finding MINOR-04 + the Round-2
// strategic abstraction). The related-documents cluster: a labelled set of plain links to the
// documents that belong to the SAME frozen relation — same-engagement children (Doc-2 §10.5
// parent-child) and the engagement↔awarded-RFQ pair (ADR-002, 1:1). PLAIN NAVIGATION: links carry
// NO existence claim about the destination record (ESC-7G-ENG-03; the FE-BUY-07 caption MAJOR) —
// the destination page owns absence via its byte-identical notFound. Icons resolve ONLY via the
// shared `document-icon-map` (NIT-03). Used by the hub's per-engagement rows today; FE-DOC-04
// mounts the same cluster on the document detail pages (disclosed touches).

import Link from "next/link";
import { documentIcon } from "./document-icon-map";
import { cn } from "@/frontend/lib/cn";

export interface RelatedDocumentLink {
  /** Stable key within the cluster. */
  id: string;
  /** Display label (frozen kind label or the target's human ref). */
  label: string;
  href: string;
  /** Icon key for the shared document-icon-map (frozen or as-projected kind). */
  kindKey: string;
}

export interface DocumentRelationsProps {
  /** Accessible name for the cluster (e.g. "Documents for ENG-2026-000124"). */
  label: string;
  links: RelatedDocumentLink[];
  className?: string;
}

export function DocumentRelations({ label, links, className }: DocumentRelationsProps) {
  if (links.length === 0) return null;
  return (
    <nav aria-label={label} className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {links.map((link) => {
        const Icon = documentIcon(link.kindKey);
        return (
          <Link
            key={link.id}
            href={link.href}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground transition-colors hover:bg-accent"
          >
            <Icon aria-hidden className="size-3.5 text-muted-foreground" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

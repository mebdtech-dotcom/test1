// ProjectMediaGallery (FE-PUB-11 · P-PUB-25) — the above-the-fold media block for a project detail page.
// Supersedes the earlier ProjectHero: a large DECORATIVE hero tile (no fabricated <img> source — companion
// §6.9 R4; real vendor-uploaded photos/video render here once the asset pipeline is wired) with an optional
// caption chip, plus a thumbnail strip that selects which item is shown in the hero. Each media item carries
// a presentation `kind` (image/video/document) that only drives the placeholder icon — it is NOT a modeled
// asset type. Interactive (thumbnail selection) → "use client"; renders nothing when there is no media.
"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, Play } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import type { ProjectMediaItemVM, ProjectMediaKind } from "./company-content-seed";

export interface ProjectMediaGalleryProps {
  media?: ProjectMediaItemVM[];
}

function KindIcon({ kind, className }: { kind: ProjectMediaKind; className?: string }) {
  const Icon = kind === "video" ? Play : kind === "document" ? FileText : ImageIcon;
  return <Icon aria-hidden="true" className={className} />;
}

export function ProjectMediaGallery({ media }: ProjectMediaGalleryProps) {
  const [active, setActive] = useState(0);
  if (!media || media.length === 0) return null;

  const current = media[Math.min(active, media.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      {/* Hero tile — decorative placeholder until the vendor-asset pipeline is wired (R4). */}
      <div className="relative flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
        <KindIcon kind={current.kind} className="size-10" />
        {current.caption ? (
          // Solid navy (not a translucent overlay) so white text clears WCAG-AA AND axe can resolve the
          // background reliably (a semi-transparent bg over the light tile mis-reads as low-contrast).
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-iv-navy-900 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            <KindIcon kind={current.kind} className="size-3.5" />
            {current.caption}
          </span>
        ) : null}
      </div>

      {media.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Project media">
          {media.map((item, index) => {
            const isActive = index === Math.min(active, media.length - 1);
            return (
              <li key={`${item.label}-${index}`} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={isActive}
                  aria-label={item.label}
                  onClick={() => setActive(index)}
                  className={cn(
                    "flex aspect-[4/3] w-28 flex-col items-center justify-center gap-1 rounded-md border bg-muted px-1 text-center text-muted-foreground transition-colors hover:border-iv-navy-300",
                    isActive ? "border-iv-navy-700 ring-1 ring-iv-navy-700" : "border-border",
                  )}
                >
                  <KindIcon kind={item.kind} className="size-4" />
                  <span className="line-clamp-2 text-[11px] font-medium text-foreground">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <p className="text-xs text-muted-foreground">Project media is provided by the supplier.</p>
    </div>
  );
}

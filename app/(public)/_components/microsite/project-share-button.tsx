// ProjectShareButton (FE-PUB-11 · P-PUB-25) — shares the canonical project URL. Uses the native Web Share
// sheet when the browser offers one (mobile), and otherwise copies the link to the clipboard with a visible
// "Copied" label swap (a text change, never colour-only) announced via aria-live. Presentation-only, no
// dependency, no fabricated data. This is the ONE interactive leaf on the page header, hence "use client".
"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/frontend/primitives/button";

export interface ProjectShareButtonProps {
  /** Absolute or root-relative canonical URL for this project (built via the vendor URL builder). */
  url: string;
  /** Title passed to the native share sheet when available. */
  title?: string;
}

export function ProjectShareButton({ url, title }: ProjectShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // Resolve a root-relative URL against the current origin for a shareable absolute link.
    const absolute =
      typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(title ? { title, url: absolute } : { url: absolute });
        return;
      } catch {
        // User dismissed the share sheet, or it is unavailable — fall through to copy.
      }
    }

    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked — leave the label unchanged rather than assert a false success.
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleShare}>
      <Share2 aria-hidden="true" />
      <span aria-live="polite">{copied ? "Copied" : "Share"}</span>
    </Button>
  );
}

// MicrositeTabs (companion §4: S10–S14 map to (app)/microsite). Thin feature adapter over the shared
// WorkspaceTabs infrastructure (Milestone 8): it only maps the five named section slots to tabs and
// owns no tab logic. The section contents are server-rendered and passed in as props. Render is
// byte-identical to the pre-extraction wrapper. RSC-friendly.
import type { ReactNode } from "react";
import { WorkspaceTabs } from "../shared";

export interface MicrositeTabsProps {
  builder: ReactNode;
  branding: ReactNode;
  seo: ReactNode;
  domain: ReactNode;
  preview: ReactNode;
}

export function MicrositeTabs({ builder, branding, seo, domain, preview }: MicrositeTabsProps) {
  return (
    <WorkspaceTabs
      tabs={[
        { value: "builder", label: "Builder", content: builder },
        { value: "branding", label: "Branding", content: branding },
        { value: "seo", label: "SEO", content: seo },
        { value: "domain", label: "Custom domain", content: domain },
        { value: "preview", label: "Preview & publish", content: preview },
      ]}
    />
  );
}

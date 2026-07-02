import type { ReactNode } from "react";
import { SiteHeader } from "./_components/site-header";
import { SiteFooter } from "./_components/site-footer";
import { ExplorerSeoNav } from "./_components/explorer/explorer-seo-nav";

/**
 * Doc-7C `(public)` route-group shell (SR2 / Doc-7D PR1, PR7). The anonymous, SSR/SSG-friendly,
 * indexable frame every public view mounts into. ANONYMOUS: no active-org, no `Iv-Active-Organization`,
 * NO org-switcher, NO notification center (authenticated shell slots — Doc-7C §4/§6). Composes the
 * Doc-7B kit chrome around `children`; binds no Doc-5 contract (M2 Public reads are unbuilt — the
 * data-bearing landing is Wave 3). REPOSITORY_STRUCTURE §8: `app/` is composition only.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      {/* FE-PUB-09: crawlable L1/L2 category links in server HTML (ARCH §7 SEO) — sr-only;
          the header's interactive Explorer is the visible, progressively-enhanced surface. */}
      <ExplorerSeoNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

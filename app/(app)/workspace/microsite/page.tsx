// Microsite & Branding surface (companion §4: S10–S14 map to (app)/microsite → tabs). Presentation-
// only and matching-isolated (DP5 / Invariant 9). Sections render genuine-empty / first-run states
// with no data (integration wires the Doc-5D BC-MKT-4 reads). Advertising is a sibling route.
import type { Metadata } from "next";
import {
  BrandingPanel,
  CustomDomainPanel,
  MicrositeBuilder,
  MicrositeTabs,
  PreviewPublishPanel,
  SeoPanel,
} from "../../_components/vendor/microsite";

export const metadata: Metadata = { title: "Microsite & Branding" };

export default function MicrositePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Microsite &amp; Branding
        </h1>
        <p className="text-sm text-muted-foreground">
          Your public microsite — layout, branding, SEO, custom domain and publishing.
        </p>
      </header>

      <MicrositeTabs
        builder={<MicrositeBuilder />}
        branding={<BrandingPanel />}
        seo={<SeoPanel />}
        domain={<CustomDomainPanel />}
        preview={<PreviewPublishPanel />}
      />
    </div>
  );
}

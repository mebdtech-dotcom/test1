import type { Metadata } from "next";

import { ShowcaseClient } from "./showcase-client";

export const metadata: Metadata = {
  title: "Design System — iVendorz",
  description:
    "Foundation reference for the iVendorz design system: tokens, primitives, layout shells and data display components.",
};

export default function DesignSystemPage() {
  return <ShowcaseClient />;
}

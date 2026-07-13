// Vendor Workspace — Project Portfolio (VX-01 nav destination, under Digital Showcase). Reserved
// in the redesigned sidebar but not yet built: no "past projects / case studies" concept exists in
// the frozen corpus today, distinct from the Product Portfolio (catalog) and Company Profile
// (identity/capability) surfaces. `ImplementationPendingView` discloses the gap; no fake project
// rows or invented fields.
import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";
import { ImplementationPendingView } from "../../../../_components/vendor/implementation-pending-view";

export const metadata: Metadata = { title: "Project Portfolio" };

export default function ProjectPortfolioPage() {
  return (
    <ImplementationPendingView
      breadcrumb={[
        { label: "Digital Showcase", href: "/sell/company" },
        { label: "Project Portfolio" },
      ]}
      title="Project Portfolio"
      description="Past projects and case studies, distinct from your Product Portfolio (catalog) and Company Profile."
      icon={<FolderKanban aria-hidden />}
    />
  );
}

// Status chips for the Microsite surface — map the FROZEN Doc-4M state values to a presentation tone
// via the kit StatusChip (label text always present; never colour-alone). The kit invents no label;
// these surface mappers supply the display label from the frozen state. RSC-friendly.
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import type { AssetVisibility, CustomDomainStatus, MicrositeStatus } from "./types";

const MICROSITE_TONE: Record<MicrositeStatus, StatusTone> = {
  draft: "neutral",
  published: "success",
  unpublished: "warning",
};
const MICROSITE_LABEL: Record<MicrositeStatus, string> = {
  draft: "Draft",
  published: "Published",
  unpublished: "Unpublished",
};

export function MicrositeStatusChip({ status }: { status?: MicrositeStatus }) {
  const value: MicrositeStatus = status ?? "draft";
  return <StatusChip label={MICROSITE_LABEL[value]} tone={MICROSITE_TONE[value]} />;
}

const DOMAIN_TONE: Record<CustomDomainStatus, StatusTone> = {
  pending: "warning",
  verified: "info",
  active: "success",
  released: "neutral",
};
const DOMAIN_LABEL: Record<CustomDomainStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  active: "Active",
  released: "Released",
};

export function DomainStatusChip({ status }: { status?: CustomDomainStatus }) {
  if (!status) return <StatusChip label="No domain" tone="neutral" />;
  return <StatusChip label={DOMAIN_LABEL[status]} tone={DOMAIN_TONE[status]} />;
}

const VISIBILITY_TONE: Record<AssetVisibility, StatusTone> = {
  draft: "neutral",
  public: "success",
};
const VISIBILITY_LABEL: Record<AssetVisibility, string> = {
  draft: "Draft",
  public: "Public",
};

export function VisibilityChip({ visibility }: { visibility?: AssetVisibility }) {
  const value: AssetVisibility = visibility ?? "draft";
  return <StatusChip label={VISIBILITY_LABEL[value]} tone={VISIBILITY_TONE[value]} />;
}

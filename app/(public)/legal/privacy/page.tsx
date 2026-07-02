import { LegalDocument, type LegalSection } from "../_components/legal-document";

// Public Privacy route (`/legal/privacy`) — P-PUB-22 (Doc-7D Public surface · T-STATIC · TB-NONE;
// screen_specifications §P-PUB-22). A pure SERVER COMPONENT mounted in the Doc-7C `(public)` shell,
// footer-reached. ROUTING + COMPOSITION ONLY.
//
// SCOPE: PLACEHOLDER LEGAL SCAFFOLD — anonymous, static, SEO-indexable. REUSES the shared `LegalDocument`
// scaffold BYTE-IDENTICAL (this page adds only its own content; the scaffold is untouched — reuse, not
// duplicate). It coins NO binding privacy commitments, retention periods, third-party names, governing
// law, or real dates (`lastUpdated` is the token "Pending"). Section copy may reference TRUE platform
// facts already established elsewhere (the organization is the tenant boundary; the platform is
// default-private; it never handles buyer↔vendor transaction money) but states no legal obligation. Binds
// no Doc-5 contract.
export const metadata = {
  title: "Privacy Policy — iVendorz",
  description: "How iVendorz will handle personal and organization data (pending Legal review).",
};

const SECTIONS: LegalSection[] = [
  {
    id: "information-we-collect",
    heading: "Information we collect",
    paragraphs: [
      "This section will describe the categories of information collected when you create an account, join an organization, and use the platform.",
      "Final wording is pending Legal review.",
    ],
  },
  {
    id: "how-we-use-it",
    heading: "How we use information",
    paragraphs: [
      "This section will describe how information is used to operate the platform — running the marketplace, RFQ, and post-award features — and to keep the service secure.",
      "Final wording is pending Legal review.",
    ],
  },
  {
    id: "organizations-and-your-data",
    heading: "Organizations and your data",
    paragraphs: [
      "This section will describe how data is scoped to organizations. On iVendorz, business records belong to an organization, which is the tenant boundary, and the platform is default-private.",
      "How access is governed within and between organizations will be finalized pending Legal review.",
    ],
  },
  {
    id: "data-sharing",
    heading: "Data sharing",
    paragraphs: [
      "This section will describe when and with whom information may be shared. iVendorz never handles payment between buyers and vendors — there is no escrow, wallet, or settlement — so no payment data flows through the platform.",
      "Any use of service providers will be described here, pending Legal review.",
    ],
  },
  {
    id: "security",
    heading: "Security",
    paragraphs: [
      "This section will describe the measures used to protect information.",
      "Final wording is pending Legal review.",
    ],
  },
  {
    id: "your-choices",
    heading: "Your choices",
    paragraphs: [
      "This section will describe the choices and controls available to you over your information.",
      "Final wording is pending Legal review.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    paragraphs: [
      "This section will describe how and when this policy may change, and how you will be notified.",
      "Final wording is pending Legal review.",
    ],
  },
  {
    id: "contact",
    heading: "Contact",
    paragraphs: [
      "Questions about this policy can be directed through the Contact page. Specific contact details are pending Legal review.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      intro="This policy will describe how iVendorz handles personal and organization data once finalized."
      lastUpdated="Pending"
      sections={SECTIONS}
    />
  );
}

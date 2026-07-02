import { LegalDocument, type LegalSection } from "../_components/legal-document";

// Public Terms route (`/legal/terms`) — P-PUB-21 (Doc-7D Public surface · T-STATIC · TB-NONE;
// screen_specifications §P-PUB-21). A pure SERVER COMPONENT mounted in the Doc-7C `(public)` shell,
// footer-reached. ROUTING + COMPOSITION ONLY.
//
// SCOPE: PLACEHOLDER LEGAL SCAFFOLD — anonymous, static, SEO-indexable. It renders honest section
// placeholders through the shared `LegalDocument` scaffold; it coins NO binding terms, clauses, governing
// law, entity details, or real dates (`lastUpdated` is the token "Pending"). Section copy may reference
// TRUE platform facts already established elsewhere (the organization is the tenant boundary; the platform
// never handles buyer↔vendor transaction money) but states no legal obligation. Binds no Doc-5 contract.
export const metadata = {
  title: "Terms of Service — iVendorz",
  description: "The terms that will govern use of the iVendorz platform (pending Legal review).",
};

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    heading: "Acceptance of terms",
    paragraphs: [
      "This section will describe how using the iVendorz platform constitutes acceptance of these terms, and who is bound by them.",
      "Final wording is pending Legal review.",
    ],
  },
  {
    id: "use-of-platform",
    heading: "Use of the platform",
    paragraphs: [
      "This section will describe permitted use of the platform's marketplace, RFQ, and post-award features.",
      "iVendorz is a software platform for industrial procurement. It never handles payment between buyers and vendors — there is no escrow, wallet, or settlement — and this will be reflected in the final terms.",
    ],
  },
  {
    id: "accounts-organizations",
    heading: "Accounts and organizations",
    paragraphs: [
      "This section will describe account and organization responsibilities. On iVendorz, users act and organizations own: every business record belongs to an organization, which is the tenant boundary.",
      "Details of account eligibility, roles, and organization membership will be finalized pending Legal review.",
    ],
  },
  {
    id: "prohibited-use",
    heading: "Prohibited use",
    paragraphs: [
      "This section will list prohibited activities, including attempts to misuse, disrupt, or gain unauthorized access to the platform or other organizations' private data.",
      "Final wording is pending Legal review.",
    ],
  },
  {
    id: "disclaimers",
    heading: "Disclaimers and limitation of liability",
    paragraphs: [
      "This section will set out disclaimers of warranties and limitations of liability to the extent permitted by applicable law.",
      "Final wording is pending Legal review.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    paragraphs: [
      "This section will describe how and when these terms may change, and how users will be notified.",
      "Final wording is pending Legal review.",
    ],
  },
  {
    id: "contact",
    heading: "Contact",
    paragraphs: [
      "Questions about these terms can be directed through the Contact page. Specific contact details are pending Legal review.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      intro="These terms will govern access to and use of the iVendorz platform once finalized."
      lastUpdated="Pending"
      sections={SECTIONS}
    />
  );
}

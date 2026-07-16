// SEC-FAQ — Questions, answered (landing_page_spec companion). STATIC marketing built on the frozen
// Accordion primitive (Radix). Copy is honest and non-committal on specifics (no invented SLAs/figures).
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/frontend/primitives/accordion";
import { Container } from "@/frontend/components/container";

interface Faq {
  q: string;
  a: string;
}

const FAQS: readonly Faq[] = [
  {
    q: "Is it free to post an RFQ?",
    a: "Yes. Posting an RFQ and receiving quotes is free for buyers — vendors are charged only when a contract is awarded, so your pricing stays clean.",
  },
  {
    q: "How are vendors verified?",
    a: "Vendors submit trade licensing, tax registration, and capability documentation, which our team reviews before approval. Trust signals then update from delivery history and performance.",
  },
  {
    q: "How quickly will I get quotes?",
    a: "Most RFQs receive their first quotes within hours, and a fuller set of competing bids within a couple of days — depending on category and specification complexity.",
  },
  {
    q: "Do you support large or recurring orders?",
    a: "Yes. You can post one-off requests or set up recurring RFQs with standing vendor shortlists and scheduled reorders.",
  },
  {
    q: "Is my request visible to competitors?",
    a: "Your company details stay private until you choose to invite a vendor. Only the request specification is shared for matching.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="border-b border-border py-9 sm:py-12"
    >
      <Container>
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-iv-ink-heading-strong">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="mt-2 text-3xl font-extrabold tracking-tight text-iv-ink-heading"
          >
            Questions, answered
          </h2>
        </div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible defaultValue="faq-0">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base text-iv-ink-heading">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-iv-ink-secondary">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}

import { ContentWrapper } from "@/components/content/content-wrapper";

const faqs = [
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship worldwide via DHL and Aramex. Duties are calculated at checkout for transparency.",
  },
  {
    question: "Can I schedule alterations?",
    answer:
      "We offer complimentary hemming and sleeve adjustments on select pieces. Chat with our concierge after placing your order.",
  },
  {
    question: "What if my package is delayed?",
    answer:
      "Write to care@ceylara.com with your order number. We coordinate directly with the courier and keep you updated.",
  },
];

export default function FAQPage() {
  return (
    <ContentWrapper title="FAQ" description="Answers to common questions.">
      <div className="space-y-4">
        {faqs.map((faq) => (
          <details key={faq.question} className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
            <summary className="cursor-pointer font-semibold">{faq.question}</summary>
            <p className="mt-2 text-sm">{faq.answer}</p>
          </details>
        ))}
      </div>
    </ContentWrapper>
  );
}


import { CheckoutForm } from "@/components/checkout/checkout-form";
import { SectionHeading } from "@/components/ui/section-heading";

export default function CheckoutPage() {
  return (
    <section className="section">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Checkout"
          title="Delivery & Payment"
          description="Complete your order with delivery and payment information"
        />
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 md:p-8">
            <CheckoutForm />
          </div>
        </div>
      </div>
    </section>
  );
}


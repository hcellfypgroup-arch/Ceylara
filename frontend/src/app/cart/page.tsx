import { CartTable } from "@/components/cart/cart-table";
import { CheckoutSummary } from "@/components/cart/checkout-summary";
import { SectionHeading } from "@/components/ui/section-heading";

export default function CartPage() {
  return (
    <section className="section">
      <div className="container space-y-4 sm:space-y-6 md:space-y-8">
        <SectionHeading
          eyebrow="Cart"
          title="Review your selections"
          description="Update quantities, apply coupons, and estimate delivery."
        />
        <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-[1.5fr_1fr]">
          <CartTable />
          <div className="lg:sticky lg:top-8 lg:self-start order-first lg:order-last">
            <CheckoutSummary />
          </div>
        </div>
      </div>
    </section>
  );
}


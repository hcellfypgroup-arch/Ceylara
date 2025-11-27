import Image from "next/image";
import { Button } from "@/components/ui/button";

export const PromoBanner = () => (
  <section className="section">
    <div className="container">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--primary)] px-10 py-12 text-white shadow-[var(--shadow-card)]">
        <div className="max-w-xl space-y-4">
          <p className="text-sm uppercase tracking-[0.5em] text-white/70">
            Limited Drop
          </p>
          <h3 className="text-4xl font-semibold">Get 50% Off winter sets</h3>
          <p className="text-lg text-white/80">
            Enter SELARA50 at checkout for knitwear, co-ords, and lounge sets.
          </p>
          <Button variant="secondary" size="pill">
            Shop Offer
          </Button>
        </div>
        <Image
          src="/placeholder-promo.jpg"
          alt="Promotion"
          width={400}
          height={400}
          className="absolute -right-10 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full object-cover opacity-80 lg:block"
        />
      </div>
    </div>
  </section>
);


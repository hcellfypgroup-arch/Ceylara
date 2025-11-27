import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const HeroBanner = () => (
  <section className="section">
    <div className="container grid gap-6 md:gap-8 lg:gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4 md:space-y-6 lg:space-y-8 order-2 lg:order-1">
        <Badge tone="brand" className="inline-flex text-xs sm:text-sm">
          New Arrivals
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-[var(--foreground)]">
          Timeless silhouettes for the women who collect stories, not trends.
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted)]">
          Discover curated edits in dresses, abayas, sarees, and luxe separates.
          Crafted in breathable fabrics with signature CEYLARA detailing.
        </p>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Button size="pill" className="text-sm sm:text-base">Shop New In</Button>
          <Button variant="ghost" className="text-sm sm:text-base">Explore Collections</Button>
        </div>
        <div className="flex gap-6 sm:gap-8 text-xs sm:text-sm text-[var(--muted)]">
          <div>
            <p className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)]">
            1K+
            </p>
            <p>Pieces loved globally</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)]">
              4.8/5
            </p>
            <p>Average customer rating</p>
          </div>
        </div>
      </div>
      <div className="surface overflow-hidden order-1 lg:order-2">
        <Image
          src="/placeholder-hero.webp"
          alt="Hero lookbook"
          width={900}
          height={1000}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  </section>
);


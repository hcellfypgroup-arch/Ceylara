import { HeroBanner } from "@/components/store/hero-banner";
import { CategoryHighlights } from "@/components/store/category-highlights";
import { FeaturedSection } from "@/components/store/featured-section";
import { PromoBanner } from "@/components/store/promo-banner";
import { ReviewCarousel } from "@/components/store/review-carousel";
import { FeaturedCollections } from "@/components/store/featured-collections";
import { BestSellerRail } from "@/components/store/best-seller-rail";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategoryHighlights />
      <FeaturedSection />
      <PromoBanner />
      <BestSellerRail />
      <FeaturedCollections />
      <ReviewCarousel />
    </>
  );
}

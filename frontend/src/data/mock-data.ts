import { CATEGORY_SLUGS } from "@/lib/constants";

export const featuredCollections = [
  {
    title: "Monochrome Drifts",
    image: "/placeholder-hero.webp",
    description: "Tailored silhouettes with structured details.",
  },
  {
    title: "Winter Edit",
    image: "/placeholder-hero.webp",
    description: "Soft knitwear in latte and sage hues.",
  },
  {
    title: "Resort Capsule",
    image: "/placeholder-hero.webp",
    description: "Flowy layers for laidback escapes.",
  },
];

export const bestSellers = [
  {
    id: "1",
    title: "Sculpt Midi Dress",
    price: 129,
    image: "/placeholder-product-1.jpg",
    badge: "Bestseller",
  },
  {
    id: "2",
    title: "Dune Kimono Set",
    price: 159,
    image: "/placeholder-product-2.jpg",
    badge: "Modest Edit",
  },
  {
    id: "3",
    title: "Saree with Organza Cape",
    price: 199,
    image: "/placeholder-product-3.jpg",
    badge: "Festive Pick",
  },
];

export const testimonials = [
  {
    name: "Lina Dsouza",
    location: "Mumbai",
    comment:
      "The abaya sets are breathable yet structured. Selara has become my go-to for modest workwear.",
    rating: 4.9,
  },
  {
    name: "Farah Khan",
    location: "Dubai",
    comment:
      "Loved how every piece has a matching accessory suggestion. Delivery was faster than expected.",
    rating: 4.8,
  },
];

export const productFilters = {
  categories: CATEGORY_SLUGS.map((category) => category.name),
  sizes: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"],
  colors: ["Black", "Cream", "Olive", "Maroon", "Dusty Rose", "Seafoam"],
  materials: ["Cotton", "Linen", "Satin", "Organza", "Chiffon"],
  sleeves: ["Sleeveless", "Short", "3/4", "Full"],
  styles: ["Casual", "Formal", "Festive", "Workwear", "Modest"],
};


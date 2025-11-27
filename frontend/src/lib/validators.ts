import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const addressSchema = z.object({
  label: z.string().min(2),
  recipientName: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().min(2),
  phone: z.string().min(6),
  isDefault: z.boolean().optional(),
});

export const productFilterSchema = z.object({
  category: z.preprocess(
    (val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.includes(",")) return val.split(",");
      return [val];
    },
    z.array(z.string()).optional()
  ),
  type: z.preprocess(
    (val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.includes(",")) return val.split(",");
      return [val];
    },
    z.array(z.string()).optional()
  ),
  size: z.preprocess(
    (val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.includes(",")) return val.split(",");
      return [val];
    },
    z.array(z.string()).optional()
  ),
  color: z.preprocess(
    (val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.includes(",")) return val.split(",");
      return [val];
    },
    z.array(z.string()).optional()
  ),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  material: z.preprocess(
    (val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.includes(",")) return val.split(",");
      return [val];
    },
    z.array(z.string()).optional()
  ),
  sleeve: z.preprocess(
    (val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.includes(",")) return val.split(",");
      return [val];
    },
    z.array(z.string()).optional()
  ),
  style: z.preprocess(
    (val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.includes(",")) return val.split(",");
      return [val];
    },
    z.array(z.string()).optional()
  ),
  sort: z.enum(["latest", "price-asc", "price-desc", "popularity"]).optional(),
  page: z.coerce.number().optional(),
});

export const productSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(10).optional(),
  description: z.string().min(10).optional(),
  categories: z.array(z.string()),
  types: z.array(z.string()).optional(),
  basePrice: z.number().positive(),
  heroImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  weight: z.number().nonnegative().optional(), // Weight in grams
  isCustomOrderEnabled: z.boolean().optional(),
  customOrderSurcharge: z.number().nonnegative().optional(),
  customFields: z
    .array(
      z.object({
        label: z.string().min(1),
        type: z.enum(["text", "number", "textarea", "dropdown"]),
        required: z.boolean(),
        options: z.array(z.string()).optional(),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        sku: z.string(),
        size: z.string(),
        color: z.string(),
        stock: z.number().int().nonnegative(),
        price: z.number().positive(),
        salePrice: z.number().optional(),
        images: z.array(z.string()).optional(),
      })
    )
    .min(1),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(3),
  comment: z.string().min(10),
});

export const couponSchema = z.object({
  code: z.string().min(2).max(50),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
  minSpend: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().nonnegative().optional()
  ),
  maxDiscount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  usageLimit: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  autoApply: z.boolean().optional(),
  applicableCategories: z.array(z.string()).optional(),
  applicableProducts: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});


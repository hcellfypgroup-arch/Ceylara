import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z
    .string()
    .min(1, "Missing Mongo connection string")
    .default("mongodb://127.0.0.1:27017/selara"),
  JWT_SECRET: z
    .string()
    .min(1)
    .default("dev-selara-secret-key-min-12-chars")
    .transform((val) => {
      // Use default if provided value is too short (less than 12 chars)
      if (val.length < 12) {
        console.warn("JWT_SECRET is too short (minimum 12 characters). Using default for development.");
        return "dev-selara-secret-key-min-12-chars";
      }
      return val;
    }),
  JWT_REFRESH_SECRET: z
    .string()
    .min(1)
    .default("dev-selara-refresh-key-min-12-chars")
    .transform((val) => {
      // Use default if provided value is too short (less than 12 chars)
      if (val.length < 12) {
        console.warn("JWT_REFRESH_SECRET is too short (minimum 12 characters). Using default for development.");
        return "dev-selara-refresh-key-min-12-chars";
      }
      return val;
    }),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
  NEXT_PUBLIC_BRAND_NAME: z.string().default("Selara"),
  UPLOADTHING_TOKEN: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default("selara/uploads"),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_FROM: z.string().email().optional().default("noreply@selara.com"),
  PAYHERE_MERCHANT_ID: z.string().optional().default(""),
  PAYHERE_MERCHANT_SECRET: z.string().optional().default(""),
  PAYHERE_SANDBOX: z.string().optional().default("true"),
});

// Helper to convert empty strings to undefined (so defaults can apply)
const envValue = (val: string | undefined) => (val && val.trim() ? val : undefined);

// Prepare env object with defaults applied (only use defaults if value is undefined or empty)
const envInput = {
  MONGODB_URI: envValue(process.env.MONGODB_URI),
  JWT_SECRET: envValue(process.env.JWT_SECRET),
  JWT_REFRESH_SECRET: envValue(process.env.JWT_REFRESH_SECRET),
  NEXT_PUBLIC_SITE_URL: envValue(process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_BRAND_NAME: envValue(process.env.NEXT_PUBLIC_BRAND_NAME),
  UPLOADTHING_TOKEN: envValue(process.env.UPLOADTHING_TOKEN),
  CLOUDINARY_CLOUD_NAME: envValue(process.env.CLOUDINARY_CLOUD_NAME),
  CLOUDINARY_API_KEY: envValue(process.env.CLOUDINARY_API_KEY),
  CLOUDINARY_API_SECRET: envValue(process.env.CLOUDINARY_API_SECRET),
  CLOUDINARY_UPLOAD_FOLDER: envValue(process.env.CLOUDINARY_UPLOAD_FOLDER),
  SMTP_HOST: envValue(process.env.SMTP_HOST),
  SMTP_PORT: envValue(process.env.SMTP_PORT),
  SMTP_USER: envValue(process.env.SMTP_USER),
  SMTP_PASS: envValue(process.env.SMTP_PASS),
  SMTP_SECURE: envValue(process.env.SMTP_SECURE),
  SMTP_FROM: envValue(process.env.SMTP_FROM),
  PAYHERE_MERCHANT_ID: envValue(process.env.PAYHERE_MERCHANT_ID),
  PAYHERE_MERCHANT_SECRET: envValue(process.env.PAYHERE_MERCHANT_SECRET),
  PAYHERE_SANDBOX: envValue(process.env.PAYHERE_SANDBOX),
};

const parsed = envSchema.safeParse(envInput);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  const errorMessages = Object.entries(errors)
    .map(([key, messages]) => `${key}: ${messages?.join(", ")}`)
    .join("\n");
  console.error("Environment validation failed:\n", errorMessages);
  console.error("Full error details:", parsed.error);
  throw new Error(`Invalid environment configuration:\n${errorMessages}`);
}

export const env = parsed.data;


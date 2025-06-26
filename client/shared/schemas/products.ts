import { z } from 'zod';

export const productVariantSchema = z.object({
  id: z.string(), // Changed from z.number() to z.string()
  size: z.string(),
  price: z.string(),
  image_url: z.string(),
  sku: z.string().optional(),
  stock_quantity: z.number().optional(),
  best_value_badge: z.string().optional(), // Added best_value_badge
});

export const productSchema = z.object({
  id: z.string(), // Changed from z.number() to z.string()
  name: z.string(),
  description: z.string(),
  variants: z.array(productVariantSchema),
});

export type ProductVariant = z.infer<typeof productVariantSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductWithVariants = Product;

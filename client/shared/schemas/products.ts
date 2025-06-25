import { z } from 'zod';

export const productVariantSchema = z.object({
  id: z.number(),
  size: z.string(),
  price: z.number(),
  image_url: z.string(),
});

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  image_url: z.string(),
  variants: z.array(productVariantSchema),
});

export type ProductVariant = z.infer<typeof productVariantSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductWithVariants = Product; 
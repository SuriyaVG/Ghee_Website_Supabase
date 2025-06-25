import { z } from 'zod';

export const reviewSchema = z.object({
  id: z.number().optional(),
  productId: z.number(),
  reviewer: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  createdAt: z.string().optional(),
});

export type Review = z.infer<typeof reviewSchema>;
export type InsertReview = Omit<Review, 'id' | 'createdAt'>; 
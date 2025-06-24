import { pgTable, serial, integer, text, timestamp, index } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { products } from './products';

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // 1-5
  review_text: text('review_text').notNull(),
  author_name: text('author_name').notNull(),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  productIdx: index('reviews_product_id_idx').on(table.product_id),
  ratingIdx: index('reviews_rating_idx').on(table.rating),
}));

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, created_at: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect; 
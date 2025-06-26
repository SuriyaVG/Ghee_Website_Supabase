export * from './contacts.ts';
export * from './orders.ts';
export * from './products.ts';
export * from './reviews.ts';

import { relations } from 'drizzle-orm';
import { products, productVariants } from '../../../migrations/schema.ts';
import { orders, orderItems } from '../../../migrations/schema.ts';

export const productRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}));

export const productVariantRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.product_id],
    references: [products.id],
  }),
}));

export const orderRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  productVariant: one(productVariants, {
    fields: [orderItems.product_id],
    references: [productVariants.id],
  }),
}));

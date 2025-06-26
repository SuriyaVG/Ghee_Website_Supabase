import { z } from 'zod';

export const insertOrderSchema = z.object({
  customerName: z.string().min(1, 'customerName is required'),
  customerEmail: z.string().email('Invalid email'),
  customerPhone: z.string().min(1, 'customerPhone is required'),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/, 'total must be a valid decimal string'),
  status: z.string().min(1, 'status is required'),
  paymentStatus: z.string().min(1, 'paymentStatus is required'),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const orderSchema = z.object({
  id: z.number().optional(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  items: z.array(z.object({
    productId: z.number(),
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
  total: z.string(),
  status: z.string(),
  paymentStatus: z.string(),
});

export type Order = z.infer<typeof orderSchema>;

export const insertOrderItemSchema = z.object({
    order_id: z.number(),
    product_id: z.number(),
    product_name: z.string(),
    quantity: z.number(),
    price_per_item: z.string(),
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = InsertOrderItem & { id: number; };

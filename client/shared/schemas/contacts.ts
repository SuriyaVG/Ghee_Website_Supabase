import { z } from 'zod';

export const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  message: z.string().min(1),
});

export type Contact = z.infer<typeof contactSchema>;

export const insertContactSchema = contactSchema;
export type InsertContact = Contact; 
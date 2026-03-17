import { z } from 'zod';

export const orderSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email().optional().or(z.literal('')),
  products: z.array(z.string()).min(1, 'Select at least one product'),
  quantity: z.string().min(1, 'Select quantity'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  notes: z.string().optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username required'),
  password: z.string().min(4, 'Password required'),
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'verified', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  notes: z.string().optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

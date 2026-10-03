import { z } from 'zod';

export const addressSchema = z.object({
  title: z.string().trim().min(2).max(60),
  recipientName: z.string().trim().min(3).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+98|0098|0)?9\d{9}$/, 'شماره موبایل معتبر نیست'),
  province: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'کد پستی باید ۱۰ رقم باشد'),
  addressLine: z.string().trim().min(8).max(500),
  plaque: z.string().trim().max(20).optional().or(z.literal('')),
  unit: z.string().trim().max(20).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  isDefault: z.boolean().optional(),
});

export const couponSchema = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .regex(/^[A-Za-z0-9_-]+$/);

export const paymentMethodSchema = z.enum(['online', 'cod', 'wallet']);
export const shippingMethodSchema = z.enum(['standard', 'express', 'pickup']);
export const checkoutStepSchema = z.enum(['review', 'address', 'shipping', 'payment', 'confirm']);

export const checkoutDraftSchema = z.object({
  version: z.literal(2),
  step: checkoutStepSchema,
  address: addressSchema.extend({ id: z.string().optional() }).nullable(),
  shippingMethod: shippingMethodSchema,
  paymentMethod: paymentMethodSchema,
  coupon: z
    .object({
      code: z.string(),
      discount: z.number().nonnegative(),
      type: z.enum(['percent', 'fixed']),
      description: z.string().optional(),
      applied: z.boolean(),
      validatedSubtotal: z.number().nonnegative(),
      validatedAt: z.string(),
    })
    .nullable(),
  idempotencyKey: z.string().uuid(),
  savedAt: z.string(),
});

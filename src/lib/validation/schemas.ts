import { z } from 'zod';

export const idSchema = z.string().min(1).max(128);
export const emailSchema = z.string().trim().email().max(254);
export const passwordSchema = z.string().min(8).max(128);
export const loginSchema = z.object({ email: emailSchema, password: passwordSchema });
export const registerSchema = z.object({ email: emailSchema, password: passwordSchema, fullName: z.string().trim().min(2).max(100) });
export const uuidSchema = z.string().uuid();

export function parseWithSchema<T>(schema: z.ZodType<T>, value: unknown): T {
  return schema.parse(value);
}

export function safeParseWithSchema<T>(schema: z.ZodType<T>, value: unknown) {
  return schema.safeParse(value);
}

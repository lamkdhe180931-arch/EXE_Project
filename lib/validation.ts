import { z } from "zod";

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(1),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  customerPhone: z.string().trim().min(8),
  shippingAddress: z.string().trim().min(1),
  note: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
});

export const productFormSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string().trim().min(1),
  story: z.string().trim().min(1),
  price: z.coerce.number().int().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  categoryId: z.string().trim().min(1),
  authorId: z.string().trim().optional(),
  status: z.enum(["draft", "published"]),
  imageSrcs: z.string().trim().optional()
});

export const authorFormSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  subtitle: z.string().trim().min(1),
  bio: z.string().trim().min(1),
  portraitSrc: z.string().trim().min(1),
  style: z.string().trim().min(1),
  status: z.enum(["draft", "published"])
});

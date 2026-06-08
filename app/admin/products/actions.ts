"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { verifyAdminCsrf } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { productFormSchema } from "@/lib/validation";

export async function saveProduct(formData: FormData) {
  const session = await requireAdmin();
  const csrfToken = String(formData.get("csrfToken") ?? "");
  if (!(await verifyAdminCsrf(csrfToken, session))) throw new Error("Invalid admin form token.");
  const id = String(formData.get("id") ?? "");
  const data = productFormSchema.parse(Object.fromEntries(formData));
  const imageSrcs = data.imageSrcs?.split("\n").map((src) => src.trim()).filter(Boolean) ?? [];

  const product = await prisma.product.upsert({
    where: { id: id || "__new_product__" },
    update: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      story: data.story,
      price: data.price,
      stock: data.stock,
      status: data.status,
      categoryId: data.categoryId,
      authorId: data.authorId || null,
      images: {
        deleteMany: {},
        create: imageSrcs.map((src, sortOrder) => ({ src, sortOrder, alt: data.name }))
      }
    },
    create: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      story: data.story,
      price: data.price,
      stock: data.stock,
      status: data.status,
      categoryId: data.categoryId,
      authorId: data.authorId || null,
      images: {
        create: imageSrcs.map((src, sortOrder) => ({ src, sortOrder, alt: data.name }))
      }
    }
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalogue");
  redirect(`/admin/products?updated=${product.id}`);
}

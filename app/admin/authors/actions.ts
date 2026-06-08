"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { verifyAdminCsrf } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { authorFormSchema } from "@/lib/validation";

export async function saveAuthor(formData: FormData) {
  const session = await requireAdmin();
  const csrfToken = String(formData.get("csrfToken") ?? "");
  if (!(await verifyAdminCsrf(csrfToken, session))) throw new Error("Invalid admin form token.");
  const id = String(formData.get("id") ?? "");
  const data = authorFormSchema.parse(Object.fromEntries(formData));
  const author = await prisma.author.upsert({
    where: { id: id || "__new_author__" },
    update: data,
    create: data
  });
  revalidatePath("/admin/authors");
  revalidatePath("/authors");
  redirect(`/admin/authors?updated=${author.id}`);
}

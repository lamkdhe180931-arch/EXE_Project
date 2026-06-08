"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { verifyAdminCsrf } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";

export async function updateOrderStatus(formData: FormData) {
  const session = await requireAdmin();
  const csrfToken = String(formData.get("csrfToken") ?? "");
  if (!(await verifyAdminCsrf(csrfToken, session))) throw new Error("Invalid admin form token.");
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/orders");
}

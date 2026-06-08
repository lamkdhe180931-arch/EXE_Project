import { PublishStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validation";

export function calculateOrderTotal(items: Array<{ unitPrice: number; quantity: number }>) {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

export async function createOrder(input: unknown) {
  const data = createOrderSchema.parse(input);
  const productIds = data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: PublishStatus.published }
  });

  if (products.length !== productIds.length) {
    throw new Error("One or more products are unavailable.");
  }

  const priceItems = data.items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) throw new Error("Product is unavailable.");
    return {
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity
    };
  });

  return prisma.order.create({
    data: {
      customerName: data.customerName,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      note: data.note,
      total: calculateOrderTotal(priceItems),
      items: { create: priceItems }
    },
    include: { items: true }
  });
}

import { Prisma, PublishStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listPublishedProducts(params: { category?: string; q?: string; sort?: string }) {
  const where: Prisma.ProductWhereInput = {
    status: PublishStatus.published,
    category: params.category ? { slug: params.category } : undefined,
    OR: params.q
      ? [
          { name: { contains: params.q, mode: "insensitive" } },
          { description: { contains: params.q, mode: "insensitive" } }
        ]
      : undefined
  };

  return prisma.product.findMany({
    where,
    include: { category: true, author: true, images: { orderBy: { sortOrder: "asc" } } },
    orderBy:
      params.sort === "price-desc"
        ? { price: "desc" }
        : params.sort === "price-asc"
          ? { price: "asc" }
          : { createdAt: "desc" }
  });
}

export async function getPublishedProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: PublishStatus.published },
    include: { category: true, author: true, images: { orderBy: { sortOrder: "asc" } } }
  });
}

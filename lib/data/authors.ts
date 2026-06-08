import { PublishStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listPublishedAuthors() {
  return prisma.author.findMany({
    where: { status: PublishStatus.published },
    orderBy: { name: "asc" }
  });
}

export async function getPublishedAuthorBySlug(slug: string) {
  return prisma.author.findFirst({
    where: { slug, status: PublishStatus.published },
    include: {
      products: {
        where: { status: PublishStatus.published },
        include: { images: { orderBy: { sortOrder: "asc" } }, category: true }
      }
    }
  });
}

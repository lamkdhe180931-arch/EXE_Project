import { NextResponse } from "next/server";
import { getPublishedProductBySlug } from "@/lib/data/products";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) return NextResponse.json({ error: "not_found", message: "Product not found." }, { status: 404 });
  return NextResponse.json({ product });
}

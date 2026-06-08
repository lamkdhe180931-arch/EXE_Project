import { NextRequest, NextResponse } from "next/server";
import { listPublishedProducts } from "@/lib/data/products";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const products = await listPublishedProducts({
    category: searchParams.get("category") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined
  });
  return NextResponse.json({ products });
}

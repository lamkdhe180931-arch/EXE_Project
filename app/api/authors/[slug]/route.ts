import { NextResponse } from "next/server";
import { getPublishedAuthorBySlug } from "@/lib/data/authors";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await getPublishedAuthorBySlug(slug);
  if (!author) return NextResponse.json({ error: "not_found", message: "Author not found." }, { status: 404 });
  return NextResponse.json({ author });
}

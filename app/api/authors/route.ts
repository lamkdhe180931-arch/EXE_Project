import { NextResponse } from "next/server";
import { listPublishedAuthors } from "@/lib/data/authors";

export async function GET() {
  const authors = await listPublishedAuthors();
  return NextResponse.json({ authors });
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  if (!rows[0]) return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ artikel: rows[0] });
}

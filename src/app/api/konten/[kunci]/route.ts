import { NextResponse } from "next/server";
import { db } from "@/db";
import { contentPages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ kunci: string }> }) {
  const { kunci } = await params;
  const rows = await db.select().from(contentPages).where(eq(contentPages.kunci, kunci)).limit(1);
  if (!rows[0]) return NextResponse.json({ error: "Konten tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ konten: rows[0] });
}

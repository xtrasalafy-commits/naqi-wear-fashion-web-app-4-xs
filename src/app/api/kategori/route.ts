import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc, sql } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.urutan), sql`${categories.parent_id} nulls first`);
  const induk = rows
    .filter((r) => r.parent_id === null)
    .map((r) => ({ ...r, anak: rows.filter((a) => a.parent_id === r.id) }));
  return NextResponse.json({ kategori: induk });
}

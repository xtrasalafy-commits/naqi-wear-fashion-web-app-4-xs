import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(articles).orderBy(desc(articles.created_at));
  return NextResponse.json({ artikel: rows });
}

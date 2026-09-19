import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { and, eq, lte, gte } from "drizzle-orm";

export async function GET() {
  const hariIni = new Date().toISOString().slice(0, 10);
  const rows = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.aktif, true), lte(coupons.mulai, hariIni), gte(coupons.berakhir, hariIni)))
    .orderBy(coupons.kode);
  return NextResponse.json({ voucher: rows });
}

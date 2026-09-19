import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const rows = await db.select().from(coupons).orderBy(desc(coupons.id));
  return NextResponse.json({ voucher: rows });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const kode = String(body?.kode ?? "").trim().toUpperCase();
  if (!kode || !body?.mulai || !body?.berakhir) {
    return NextResponse.json({ error: "Kode dan tanggal berlaku wajib diisi." }, { status: 400 });
  }
  await db.insert(coupons).values({
    kode,
    tipe: String(body?.tipe ?? "persen"),
    nilai: Number(body?.nilai ?? 0),
    minimal_order: Number(body?.minimal_order ?? 0),
    maksimal_diskon: Number(body?.maksimal_diskon ?? 0),
    kuota: Number(body?.kuota ?? 100),
    mulai: String(body.mulai),
    berakhir: String(body.berakhir),
    aktif: body?.aktif !== false,
  });
  return NextResponse.json({ sukses: true });
}

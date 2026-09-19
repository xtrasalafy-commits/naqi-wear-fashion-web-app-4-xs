import { NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const rows = await db.select().from(banners).orderBy(asc(banners.urutan));
  return NextResponse.json({ banner: rows });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.judul || !body?.gambar_url) {
    return NextResponse.json({ error: "Judul dan gambar banner wajib diisi." }, { status: 400 });
  }
  await db.insert(banners).values({
    judul: String(body.judul),
    subjudul: String(body?.subjudul ?? ""),
    gambar_url: String(body.gambar_url),
    tautan: String(body?.tautan ?? "/katalog"),
    mulai: String(body?.mulai ?? new Date().toISOString().slice(0, 10)),
    berakhir: String(body?.berakhir ?? new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().slice(0, 10)),
    aktif: body?.aktif !== false,
    urutan: Number(body?.urutan ?? 99),
  });
  return NextResponse.json({ sukses: true });
}

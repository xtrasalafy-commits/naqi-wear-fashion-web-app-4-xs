import { NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const id = Number((await params).id);
  const body = await req.json().catch(() => null);
  const update: Record<string, unknown> = {};
  for (const b of ["judul", "subjudul", "gambar_url", "tautan", "mulai", "berakhir"])
    if (body?.[b] !== undefined) update[b] = String(body[b]);
  if (body?.urutan !== undefined) update.urutan = Number(body.urutan);
  if (body?.aktif !== undefined) update.aktif = Boolean(body.aktif);
  await db.update(banners).set(update).where(eq(banners.id, id));
  return NextResponse.json({ sukses: true });
}

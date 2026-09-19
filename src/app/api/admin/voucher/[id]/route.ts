import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const id = Number((await params).id);
  const body = await req.json().catch(() => null);
  const update: Record<string, unknown> = {};
  for (const b of ["kode", "tipe", "mulai", "berakhir"]) if (body?.[b] !== undefined) update[b] = String(body[b]);
  for (const n of ["nilai", "minimal_order", "maksimal_diskon", "kuota", "terpakai"])
    if (body?.[n] !== undefined) update[n] = Number(body[n]);
  if (body?.aktif !== undefined) update.aktif = Boolean(body.aktif);
  await db.update(coupons).set(update).where(eq(coupons.id, id));
  return NextResponse.json({ sukses: true });
}

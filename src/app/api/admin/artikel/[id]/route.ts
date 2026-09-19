import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const id = Number((await params).id);
  const body = await req.json().catch(() => null);
  const update: Record<string, unknown> = {};
  for (const b of ["judul", "ringkasan", "konten", "gambar_url", "penulis", "kategori"])
    if (body?.[b] !== undefined) update[b] = String(body[b]);
  await db.update(articles).set(update).where(eq(articles.id, id));
  return NextResponse.json({ sukses: true });
}

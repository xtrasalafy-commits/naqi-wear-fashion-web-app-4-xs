import { NextResponse } from "next/server";
import { db } from "@/db";
import { contentPages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const rows = await db.select().from(contentPages);
  return NextResponse.json({ konten: rows });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const kunci = String(body?.kunci ?? "");
  if (!kunci) return NextResponse.json({ error: "Kunci konten wajib diisi." }, { status: 400 });
  const ada = await db.select().from(contentPages).where(eq(contentPages.kunci, kunci)).limit(1);
  if (ada.length === 0) {
    await db.insert(contentPages).values({ kunci, judul: String(body?.judul ?? kunci), konten: String(body?.konten ?? "") });
  } else {
    await db
      .update(contentPages)
      .set({ judul: body?.judul ? String(body.judul) : ada[0].judul, konten: String(body?.konten ?? ada[0].konten) })
      .where(eq(contentPages.kunci, kunci));
  }
  return NextResponse.json({ sukses: true });
}
